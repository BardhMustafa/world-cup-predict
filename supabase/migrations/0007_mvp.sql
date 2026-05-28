-- ═══════════════════════════════════════════════════════════════
-- MVP player prediction game
-- One pick per user; deadline enforced in the client (1 h before
-- the tournament's opening kick-off: 2026-06-12T00:00:00Z).
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.mvp_picks (
  user_id     uuid primary key references public.profiles(id) on delete cascade,
  player_name text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.mvp_picks enable row level security;

-- Public read so picks can be revealed after the deadline
create policy "mvp_select" on public.mvp_picks
  for select using (true);

create policy "mvp_insert" on public.mvp_picks
  for insert with check (user_id = auth.uid());

create policy "mvp_update" on public.mvp_picks
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "mvp_delete" on public.mvp_picks
  for delete using (user_id = auth.uid());

drop trigger if exists mvp_picks_updated_at on public.mvp_picks;
create trigger mvp_picks_updated_at
  before update on public.mvp_picks
  for each row execute function public.set_updated_at();
