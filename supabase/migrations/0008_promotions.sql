-- ═══════════════════════════════════════════════════════════════
-- Promotions / Sponsored slots
-- Admins create time-boxed promos; the client picks the live one
-- for each slot (dashboard | leaderboard | predict | sidebar | home).
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.promotions (
  id          uuid        primary key default gen_random_uuid(),
  slot        text        not null,
  title       text        not null,
  body        text,
  cta_label   text,
  cta_url     text,
  image_url   text,
  active      boolean     not null default true,
  starts_at   timestamptz not null default now(),
  ends_at     timestamptz not null,
  created_at  timestamptz not null default now(),
  constraint promotions_slot_check check (
    slot in ('dashboard', 'leaderboard', 'predict', 'sidebar', 'home')
  ),
  constraint promotions_dates_check check (ends_at > starts_at)
);

create index if not exists promotions_slot_active_idx
  on public.promotions (slot, active, starts_at, ends_at);

alter table public.promotions enable row level security;

-- Everyone can read (needed for anon homepage + authenticated app pages)
drop policy if exists promotions_select on public.promotions;
create policy promotions_select on public.promotions
  for select using (true);

-- Only admins write
drop policy if exists promotions_admin_write on public.promotions;
create policy promotions_admin_write on public.promotions
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.promotions to anon, authenticated;
