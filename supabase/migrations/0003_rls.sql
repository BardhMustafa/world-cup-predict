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
