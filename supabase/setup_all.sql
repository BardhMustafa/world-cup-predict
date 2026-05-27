-- ════════════════════════════════════════════════════════════
-- The Prediction Post — full setup. Paste into the Supabase
-- SQL editor (Dashboard → SQL Editor → New query) and Run.
-- Safe to re-run. Order: schema → functions → RLS → seed.
-- ════════════════════════════════════════════════════════════

-- ░░░░░░░░░░ migrations/0001_schema.sql ░░░░░░░░░░
-- ═══════════════════════════════════════════════════════════════
-- The Prediction Post — core schema
-- Tables: profiles (public), user_verification (private PII),
--         matches, predictions
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────
do $$ begin
  create type match_status as enum ('scheduled', 'live', 'finished');
exception when duplicate_object then null; end $$;

do $$ begin
  create type match_stage as enum (
    'group', 'round_of_32', 'round_of_16',
    'quarter_final', 'semi_final', 'third_place', 'final'
  );
exception when duplicate_object then null; end $$;

-- Outcome category awarded to a prediction once its match is final.
do $$ begin
  create type prediction_outcome as enum ('exact', 'goal_diff', 'outcome', 'missed');
exception when duplicate_object then null; end $$;

-- ── profiles ──────────────────────────────────────────────────
-- Public-facing identity. Deliberately holds NO Kosovo ID (see
-- user_verification) so the leaderboard can expose profiles freely.
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text not null,
  handle        text unique,
  city          text,
  initials      text,
  is_admin      boolean not null default false,
  current_rank  integer,
  previous_rank integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── user_verification ─────────────────────────────────────────
-- Private. One Kosovo ID per patriot. Never selected by the client
-- except for the owner's own row (enforced by RLS).
create table if not exists public.user_verification (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  kosovo_id  text unique not null,
  created_at timestamptz not null default now()
);

-- ── matches ───────────────────────────────────────────────────
create table if not exists public.matches (
  id                uuid primary key default gen_random_uuid(),
  stage             match_stage not null default 'group',
  grp               text,                       -- group letter, e.g. 'D'
  home_team         text not null,
  away_team         text not null,
  home_code         text,                       -- short code, e.g. 'KOS'
  away_code         text,
  kickoff           timestamptz not null,
  venue             text,
  status            match_status not null default 'scheduled',
  home_score        integer check (home_score >= 0),
  away_score        integer check (away_score >= 0),
  points_multiplier integer not null default 1,  -- group 1, knockout 2, final 3
  external_id       text unique,                 -- maps to football API id
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists matches_kickoff_idx on public.matches (kickoff);
create index if not exists matches_status_idx  on public.matches (status);

-- ── predictions ───────────────────────────────────────────────
create table if not exists public.predictions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  match_id   uuid not null references public.matches (id) on delete cascade,
  home_pred  integer not null check (home_pred between 0 and 99),
  away_pred  integer not null check (away_pred between 0 and 99),
  points     integer,                 -- null until the match is scored
  outcome    prediction_outcome,      -- null until the match is scored
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists predictions_user_idx  on public.predictions (user_id);
create index if not exists predictions_match_idx on public.predictions (match_id);

-- ── updated_at helper ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists matches_updated_at on public.matches;
create trigger matches_updated_at before update on public.matches
  for each row execute function public.set_updated_at();

drop trigger if exists predictions_updated_at on public.predictions;
create trigger predictions_updated_at before update on public.predictions
  for each row execute function public.set_updated_at();


-- ░░░░░░░░░░ migrations/0002_functions.sql ░░░░░░░░░░
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


-- ░░░░░░░░░░ migrations/0003_rls.sql ░░░░░░░░░░
-- ═══════════════════════════════════════════════════════════════
-- Row-Level Security. With no server layer, these policies ARE the
-- security model: who can read what, and — critically — that a
-- prediction can only be written before its match kicks off.
-- ═══════════════════════════════════════════════════════════════

alter table public.profiles          enable row level security;
alter table public.user_verification enable row level security;
alter table public.matches           enable row level security;
alter table public.predictions       enable row level security;

-- ── profiles: world-readable (leaderboard), self-editable ──────
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- (the guard_admin_flag trigger stops self-promotion to admin)

-- ── user_verification: owner-only; never world-readable ────────
drop policy if exists verification_select_self on public.user_verification;
create policy verification_select_self on public.user_verification
  for select using (auth.uid() = user_id or public.is_admin());

-- ── matches: world-readable; only admins write ─────────────────
drop policy if exists matches_select on public.matches;
create policy matches_select on public.matches
  for select using (true);

drop policy if exists matches_admin_write on public.matches;
create policy matches_admin_write on public.matches
  for all using (public.is_admin()) with check (public.is_admin());

-- ── predictions: own rows only, and only before kick-off ───────
drop policy if exists predictions_select_own on public.predictions;
create policy predictions_select_own on public.predictions
  for select using (auth.uid() = user_id);

drop policy if exists predictions_insert_open on public.predictions;
create policy predictions_insert_open on public.predictions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and m.kickoff > now()
    )
  );

drop policy if exists predictions_update_open on public.predictions;
create policy predictions_update_open on public.predictions
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and m.kickoff > now()
    )
  );

-- No delete policy: forecasts, once filed, are part of the ledger.

-- ── grants for the leaderboard view ────────────────────────────
grant select on public.leaderboard to anon, authenticated;


-- ░░░░░░░░░░ seed.sql ░░░░░░░░░░
-- ═══════════════════════════════════════════════════════════════
-- Seed fixtures — World Cup 2026. Group matches carry weight 1,
-- knockout 2, the Final 3. Times in UTC. Expand from the football
-- API later (matches.external_id maps to the provider's id).
-- ═══════════════════════════════════════════════════════════════

insert into public.matches
  (stage, grp, home_team, home_code, away_team, away_code, kickoff, venue, status, points_multiplier)
values
  -- Saturday 14 June
  ('group', 'D', 'Kosovo',  'KOS', 'Albania',       'ALB', '2026-06-14 20:00:00+00', 'Brunswick · NJ',   'scheduled', 1),
  ('group', 'C', 'France',  'FRA', 'Australia',     'AUS', '2026-06-14 17:00:00+00', 'Seattle',          'scheduled', 1),
  ('group', 'B', 'England', 'ENG', 'United States', 'USA', '2026-06-14 14:00:00+00', 'Philadelphia',     'scheduled', 1),
  ('group', 'A', 'Germany', 'GER', 'Poland',        'POL', '2026-06-14 11:00:00+00', 'Toronto',          'scheduled', 1),
  -- Sunday 15 June
  ('group', 'E', 'Argentina', 'ARG', 'Mexico',  'MEX', '2026-06-15 18:00:00+00', 'Mexico City',     'scheduled', 1),
  ('group', 'F', 'Brazil',    'BRA', 'Serbia',  'SRB', '2026-06-15 21:00:00+00', 'Los Angeles',     'scheduled', 1),
  ('group', 'G', 'Spain',     'ESP', 'Morocco', 'MAR', '2026-06-15 15:00:00+00', 'Miami',           'scheduled', 1),
  -- Knockout placeholders (teams resolved later)
  ('round_of_16',   null, 'Winner Group D', null, 'Runner-up Group C', null, '2026-07-04 19:00:00+00', 'New York',  'scheduled', 2),
  ('quarter_final', null, 'TBD',            null, 'TBD',               null, '2026-07-11 19:00:00+00', 'Dallas',    'scheduled', 2),
  ('final',         null, 'TBD',            null, 'TBD',               null, '2026-07-19 19:00:00+00', 'MetLife · NJ', 'scheduled', 3)
on conflict do nothing;

-- After you create your own account, make yourself an admin with:
--   update public.profiles set is_admin = true where handle = '<your-handle>';



-- ░░░░░░░░░░ migrations/0004_group_standings.sql ░░░░░░░░░░
-- ═══════════════════════════════════════════════════════════════
-- Group standings — classic football league tables computed from
-- finished group-stage matches (3 pts win / 1 draw), ranked by
-- points, goal difference, then goals for. Every team in a group
-- appears even before kick-off (zeros), so the tables read like a
-- matchday programme from day one.
-- ═══════════════════════════════════════════════════════════════
create or replace view public.group_standings as
with rosters as (
  -- the full set of teams in each group, from all group fixtures
  select grp, team, max(code) as code
  from (
    select grp, home_team as team, home_code as code
      from public.matches where stage = 'group' and grp is not null
    union all
    select grp, away_team as team, away_code as code
      from public.matches where stage = 'group' and grp is not null
  ) t
  group by grp, team
),
unpivoted as (
  -- one row per team per finished match (home + away perspectives)
  select grp, home_team as team, home_score as gf, away_score as ga,
         case when home_score > away_score then 3 when home_score = away_score then 1 else 0 end as pts,
         (home_score > away_score) as won, (home_score = away_score) as drew, (home_score < away_score) as lost
    from public.matches
   where stage = 'group' and status = 'finished' and home_score is not null and away_score is not null
  union all
  select grp, away_team, away_score, home_score,
         case when away_score > home_score then 3 when away_score = home_score then 1 else 0 end,
         (away_score > home_score), (away_score = home_score), (away_score < home_score)
    from public.matches
   where stage = 'group' and status = 'finished' and home_score is not null and away_score is not null
),
played as (
  select grp, team,
         count(*)                        as played,
         count(*) filter (where won)     as won,
         count(*) filter (where drew)    as drawn,
         count(*) filter (where lost)    as lost,
         coalesce(sum(gf), 0)            as gf,
         coalesce(sum(ga), 0)            as ga,
         coalesce(sum(pts), 0)           as points
  from unpivoted
  group by grp, team
)
select
  r.grp,
  r.team,
  r.code,
  coalesce(p.played, 0) as played,
  coalesce(p.won, 0)    as won,
  coalesce(p.drawn, 0)  as drawn,
  coalesce(p.lost, 0)   as lost,
  coalesce(p.gf, 0)     as gf,
  coalesce(p.ga, 0)     as ga,
  coalesce(p.gf, 0) - coalesce(p.ga, 0) as gd,
  coalesce(p.points, 0) as points
from rosters r
left join played p on p.grp = r.grp and p.team = r.team;

grant select on public.group_standings to anon, authenticated;

-- ░░░░░░░░░░ migrations/0005_featured.sql ░░░░░░░░░░
-- ═══════════════════════════════════════════════════════════════
-- "Match of the Day" — let an admin feature one fixture on the front
-- page. A partial unique index guarantees at most one featured match.
-- ═══════════════════════════════════════════════════════════════
alter table public.matches add column if not exists is_featured boolean not null default false;

create unique index if not exists matches_one_featured
  on public.matches (is_featured) where is_featured;

-- Atomically move the "featured" flag to one match (or clear it with null).
-- Admin-only, security definer so it can flip the flag under RLS.
create or replace function public.set_featured_match(p_match uuid)
returns void language plpgsql security definer
set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'only the editorial desk may feature a match';
  end if;
  update public.matches set is_featured = false where is_featured;
  if p_match is not null then
    update public.matches set is_featured = true where id = p_match;
  end if;
end $$;

grant execute on function public.set_featured_match(uuid) to authenticated;
