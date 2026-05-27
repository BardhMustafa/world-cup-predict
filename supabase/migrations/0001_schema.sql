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
