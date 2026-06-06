-- Public count of patriots who have filed at least one prediction.
-- Drives the "prizes activate at 50 players" rule on the client.
--
-- The view runs as its owner, so it reports the exact distinct count
-- regardless of the predictions RLS policies (which otherwise hide other
-- players' rows). It exposes only an aggregate number — never any row.

create or replace view public.active_player_count as
  select count(distinct user_id)::int as players
  from public.predictions;

grant select on public.active_player_count to anon, authenticated;
