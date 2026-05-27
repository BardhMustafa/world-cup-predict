-- ═══════════════════════════════════════════════════════════════
-- Scoring engine, new-user handling, leaderboard
-- ═══════════════════════════════════════════════════════════════

-- ── admin check (security definer to avoid recursive RLS) ──────
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ── new auth user → profile + verification row ─────────────────
-- Reads the metadata passed at sign-up (full_name, handle, city,
-- kosovo_id). Runs as definer so it bypasses RLS for the insert.
-- A duplicate kosovo_id / handle raises here and aborts sign-up,
-- which is exactly how "one entry per patriot" is enforced.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', 'New Patriot');
  v_initials text;
begin
  v_initials := upper(
    coalesce(
      substring(split_part(v_name, ' ', 1) from 1 for 1) ||
      nullif(substring(split_part(v_name, ' ', 2) from 1 for 1), ''),
      substring(v_name from 1 for 2)
    )
  );

  insert into public.profiles (id, full_name, handle, city, initials)
  values (
    new.id,
    v_name,
    nullif(new.raw_user_meta_data ->> 'handle', ''),
    nullif(new.raw_user_meta_data ->> 'city', ''),
    v_initials
  );

  if coalesce(new.raw_user_meta_data ->> 'kosovo_id', '') <> '' then
    insert into public.user_verification (user_id, kosovo_id)
    values (new.id, new.raw_user_meta_data ->> 'kosovo_id');
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── prevent non-admins from granting themselves admin ──────────
create or replace function public.guard_admin_flag()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_admin on public.profiles;
create trigger profiles_guard_admin before update on public.profiles
  for each row execute function public.guard_admin_flag();

-- ── scoring ────────────────────────────────────────────────────
-- Base points: exact 10, same outcome + goal difference 5,
-- correct outcome only 3, wrong 0. Multiplied by the match weight.
create or replace function public.recompute_match_predictions(p_match uuid)
returns void language plpgsql security definer
set search_path = public as $$
begin
  update public.predictions pr
  set
    outcome = case
      when pr.home_pred = m.home_score and pr.away_pred = m.away_score then 'exact'::prediction_outcome
      when sign((pr.home_pred - pr.away_pred)::numeric) = sign((m.home_score - m.away_score)::numeric)
           and (pr.home_pred - pr.away_pred) = (m.home_score - m.away_score) then 'goal_diff'::prediction_outcome
      when sign((pr.home_pred - pr.away_pred)::numeric) = sign((m.home_score - m.away_score)::numeric) then 'outcome'::prediction_outcome
      else 'missed'::prediction_outcome
    end,
    points = case
      when pr.home_pred = m.home_score and pr.away_pred = m.away_score then 10
      when sign((pr.home_pred - pr.away_pred)::numeric) = sign((m.home_score - m.away_score)::numeric)
           and (pr.home_pred - pr.away_pred) = (m.home_score - m.away_score) then 5
      when sign((pr.home_pred - pr.away_pred)::numeric) = sign((m.home_score - m.away_score)::numeric) then 3
      else 0
    end * m.points_multiplier,
    updated_at = now()
  from public.matches m
  where pr.match_id = p_match
    and m.id = p_match
    and m.home_score is not null
    and m.away_score is not null;
end $$;

-- ── recompute ranks (movement = previous_rank - current_rank) ──
create or replace function public.refresh_leaderboard()
returns void language plpgsql security definer
set search_path = public as $$
begin
  with totals as (
    select user_id, coalesce(sum(points), 0) as pts
    from public.predictions
    where points is not null
    group by user_id
  ),
  ranked as (
    select pf.id,
           rank() over (order by coalesce(t.pts, 0) desc) as r
    from public.profiles pf
    left join totals t on t.user_id = pf.id
  )
  update public.profiles pf
  set previous_rank = pf.current_rank,
      current_rank  = ranked.r
  from ranked
  where ranked.id = pf.id;
end $$;

-- ── trigger: when a match goes final, score it then re-rank ────
create or replace function public.on_match_scored()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if new.status = 'finished' and new.home_score is not null and new.away_score is not null then
    perform public.recompute_match_predictions(new.id);
    perform public.refresh_leaderboard();
  end if;
  return new;
end $$;

drop trigger if exists matches_on_scored on public.matches;
create trigger matches_on_scored after update of status, home_score, away_score
  on public.matches
  for each row execute function public.on_match_scored();

-- ── leaderboard view ───────────────────────────────────────────
-- Public read. Aggregates sealed, scored predictions per patriot.
create or replace view public.leaderboard as
select
  pf.id            as user_id,
  pf.full_name,
  pf.handle,
  pf.city,
  pf.initials,
  pf.current_rank,
  pf.previous_rank,
  coalesce(pf.previous_rank - pf.current_rank, 0) as movement,
  count(pr.points)                                          as played,
  count(*) filter (where pr.outcome = 'exact')              as exact_count,
  count(*) filter (where pr.outcome in ('goal_diff','outcome')) as correct_count,
  count(*) filter (where pr.outcome = 'missed')             as missed_count,
  coalesce(sum(pr.points), 0)                               as points
from public.profiles pf
left join public.predictions pr
  on pr.user_id = pf.id and pr.points is not null
group by pf.id;
