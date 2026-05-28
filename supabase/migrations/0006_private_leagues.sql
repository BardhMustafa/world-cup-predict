-- ═══════════════════════════════════════════════════════════════
-- Private friend leagues
-- Tables: private_leagues, private_league_members
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.private_leagues (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(trim(name)) between 2 and 48),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  invite_code  text unique not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.private_league_members (
  league_id  uuid not null references public.private_leagues(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (league_id, user_id)
);

-- Enforce 10-member cap via trigger
create or replace function public.check_league_capacity()
returns trigger language plpgsql as $$
declare cnt integer;
begin
  select count(*) into cnt
    from public.private_league_members
   where league_id = new.league_id;
  if cnt >= 10 then
    raise exception 'Liga është e plotë (maks. 10 anëtarë)';
  end if;
  return new;
end $$;

drop trigger if exists private_league_capacity on public.private_league_members;
create trigger private_league_capacity
  before insert on public.private_league_members
  for each row execute function public.check_league_capacity();

-- Security-definer helper: returns league IDs the current user belongs to,
-- bypassing RLS so the member_select policy cannot recurse on itself.
create or replace function public.my_league_ids()
returns setof uuid language sql security definer stable
set search_path = public as $$
  select distinct league_id
    from public.private_league_members
   where user_id = auth.uid();
$$;

-- RPC for the join page: returns league info by invite code without
-- exposing the full member list to non-members.
create or replace function public.league_info(p_invite_code text)
returns table(id uuid, name text, owner_name text, member_count bigint)
language sql security definer stable
set search_path = public as $$
  select
    pl.id,
    pl.name,
    pf.full_name  as owner_name,
    count(plm.user_id) as member_count
  from public.private_leagues pl
  join public.profiles pf on pf.id = pl.owner_id
  left join public.private_league_members plm on plm.league_id = pl.id
  where pl.invite_code = p_invite_code
  group by pl.id, pl.name, pf.full_name;
$$;

grant execute on function public.my_league_ids()        to authenticated;
grant execute on function public.league_info(text)      to anon, authenticated;

-- ── RLS ──────────────────────────────────────────────────────
alter table public.private_leagues        enable row level security;
alter table public.private_league_members enable row level security;

-- Leagues: world-readable (invite code acts as the access token),
-- only the owner may write.
create policy "league_select" on public.private_leagues
  for select using (true);
create policy "league_insert" on public.private_leagues
  for insert with check (owner_id = auth.uid());
create policy "league_update" on public.private_leagues
  for update using (owner_id = auth.uid());
create policy "league_delete" on public.private_leagues
  for delete using (owner_id = auth.uid());

-- Members: a user can always see their own rows (needed for join-page
-- membership check) AND can see all members of leagues they belong to.
create policy "member_select" on public.private_league_members
  for select using (
    user_id = auth.uid()
    or league_id in (select public.my_league_ids())
  );
create policy "member_insert" on public.private_league_members
  for insert with check (user_id = auth.uid());
create policy "member_delete" on public.private_league_members
  for delete using (
    user_id = auth.uid()
    or league_id in (select id from public.private_leagues where owner_id = auth.uid())
  );
