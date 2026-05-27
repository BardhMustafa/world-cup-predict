-- ════════════════════════════════════════════════════════════
-- Run next: real WC 2026 fixtures + group-standings view.
-- Paste into Supabase SQL editor and Run. Safe to re-run.
-- ════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════
-- Real FIFA World Cup 2026 fixtures from football-data.org (104 matches)
-- Paste into Supabase SQL editor and Run. Idempotent (upsert on external_id),
-- so safe to re-run to refresh scores/statuses.
-- ════════════════════════════════════════════════════════════

-- Remove the hand-seeded demo fixtures (they have no external_id).
delete from public.matches where external_id is null;

insert into public.matches
  (stage, grp, home_team, home_code, away_team, away_code, kickoff, venue, status, home_score, away_score, points_multiplier, external_id)
values
  ('group', 'A', 'Mexico', 'MEX', 'South Africa', 'RSA', '2026-06-11T19:00:00Z', null, 'scheduled', null, null, 1, '537327'),
  ('group', 'A', 'South Korea', 'KOR', 'Czechia', 'CZE', '2026-06-12T02:00:00Z', null, 'scheduled', null, null, 1, '537328'),
  ('group', 'B', 'Canada', 'CAN', 'Bosnia-Herzegovina', 'BIH', '2026-06-12T19:00:00Z', null, 'scheduled', null, null, 1, '537333'),
  ('group', 'D', 'United States', 'USA', 'Paraguay', 'PAR', '2026-06-13T01:00:00Z', null, 'scheduled', null, null, 1, '537345'),
  ('group', 'B', 'Qatar', 'QAT', 'Switzerland', 'SUI', '2026-06-13T19:00:00Z', null, 'scheduled', null, null, 1, '537334'),
  ('group', 'C', 'Brazil', 'BRA', 'Morocco', 'MAR', '2026-06-13T22:00:00Z', null, 'scheduled', null, null, 1, '537339'),
  ('group', 'C', 'Haiti', 'HAI', 'Scotland', 'SCO', '2026-06-14T01:00:00Z', null, 'scheduled', null, null, 1, '537340'),
  ('group', 'D', 'Australia', 'AUS', 'Turkey', 'TUR', '2026-06-14T04:00:00Z', null, 'scheduled', null, null, 1, '537346'),
  ('group', 'E', 'Germany', 'GER', 'Curaçao', 'CUW', '2026-06-14T17:00:00Z', null, 'scheduled', null, null, 1, '537351'),
  ('group', 'F', 'Netherlands', 'NED', 'Japan', 'JPN', '2026-06-14T20:00:00Z', null, 'scheduled', null, null, 1, '537357'),
  ('group', 'E', 'Ivory Coast', 'CIV', 'Ecuador', 'ECU', '2026-06-14T23:00:00Z', null, 'scheduled', null, null, 1, '537352'),
  ('group', 'F', 'Sweden', 'SWE', 'Tunisia', 'TUN', '2026-06-15T02:00:00Z', null, 'scheduled', null, null, 1, '537358'),
  ('group', 'H', 'Spain', 'ESP', 'Cape Verde Islands', 'CPV', '2026-06-15T16:00:00Z', null, 'scheduled', null, null, 1, '537369'),
  ('group', 'G', 'Belgium', 'BEL', 'Egypt', 'EGY', '2026-06-15T19:00:00Z', null, 'scheduled', null, null, 1, '537363'),
  ('group', 'H', 'Saudi Arabia', 'KSA', 'Uruguay', 'URY', '2026-06-15T22:00:00Z', null, 'scheduled', null, null, 1, '537370'),
  ('group', 'G', 'Iran', 'IRN', 'New Zealand', 'NZL', '2026-06-16T01:00:00Z', null, 'scheduled', null, null, 1, '537364'),
  ('group', 'I', 'France', 'FRA', 'Senegal', 'SEN', '2026-06-16T19:00:00Z', null, 'scheduled', null, null, 1, '537391'),
  ('group', 'I', 'Iraq', 'IRQ', 'Norway', 'NOR', '2026-06-16T22:00:00Z', null, 'scheduled', null, null, 1, '537392'),
  ('group', 'J', 'Argentina', 'ARG', 'Algeria', 'ALG', '2026-06-17T01:00:00Z', null, 'scheduled', null, null, 1, '537397'),
  ('group', 'J', 'Austria', 'AUT', 'Jordan', 'JOR', '2026-06-17T04:00:00Z', null, 'scheduled', null, null, 1, '537398'),
  ('group', 'K', 'Portugal', 'POR', 'Congo DR', 'COD', '2026-06-17T17:00:00Z', null, 'scheduled', null, null, 1, '537403'),
  ('group', 'L', 'England', 'ENG', 'Croatia', 'CRO', '2026-06-17T20:00:00Z', null, 'scheduled', null, null, 1, '537409'),
  ('group', 'L', 'Ghana', 'GHA', 'Panama', 'PAN', '2026-06-17T23:00:00Z', null, 'scheduled', null, null, 1, '537410'),
  ('group', 'K', 'Uzbekistan', 'UZB', 'Colombia', 'COL', '2026-06-18T02:00:00Z', null, 'scheduled', null, null, 1, '537404'),
  ('group', 'A', 'Czechia', 'CZE', 'South Africa', 'RSA', '2026-06-18T16:00:00Z', null, 'scheduled', null, null, 1, '537329'),
  ('group', 'B', 'Switzerland', 'SUI', 'Bosnia-Herzegovina', 'BIH', '2026-06-18T19:00:00Z', null, 'scheduled', null, null, 1, '537335'),
  ('group', 'B', 'Canada', 'CAN', 'Qatar', 'QAT', '2026-06-18T22:00:00Z', null, 'scheduled', null, null, 1, '537336'),
  ('group', 'A', 'Mexico', 'MEX', 'South Korea', 'KOR', '2026-06-19T01:00:00Z', null, 'scheduled', null, null, 1, '537330'),
  ('group', 'D', 'United States', 'USA', 'Australia', 'AUS', '2026-06-19T19:00:00Z', null, 'scheduled', null, null, 1, '537348'),
  ('group', 'C', 'Scotland', 'SCO', 'Morocco', 'MAR', '2026-06-19T22:00:00Z', null, 'scheduled', null, null, 1, '537342'),
  ('group', 'C', 'Brazil', 'BRA', 'Haiti', 'HAI', '2026-06-20T00:30:00Z', null, 'scheduled', null, null, 1, '537341'),
  ('group', 'D', 'Turkey', 'TUR', 'Paraguay', 'PAR', '2026-06-20T03:00:00Z', null, 'scheduled', null, null, 1, '537347'),
  ('group', 'F', 'Netherlands', 'NED', 'Sweden', 'SWE', '2026-06-20T17:00:00Z', null, 'scheduled', null, null, 1, '537359'),
  ('group', 'E', 'Germany', 'GER', 'Ivory Coast', 'CIV', '2026-06-20T20:00:00Z', null, 'scheduled', null, null, 1, '537353'),
  ('group', 'E', 'Ecuador', 'ECU', 'Curaçao', 'CUW', '2026-06-21T00:00:00Z', null, 'scheduled', null, null, 1, '537354'),
  ('group', 'F', 'Tunisia', 'TUN', 'Japan', 'JPN', '2026-06-21T04:00:00Z', null, 'scheduled', null, null, 1, '537360'),
  ('group', 'H', 'Spain', 'ESP', 'Saudi Arabia', 'KSA', '2026-06-21T16:00:00Z', null, 'scheduled', null, null, 1, '537371'),
  ('group', 'G', 'Belgium', 'BEL', 'Iran', 'IRN', '2026-06-21T19:00:00Z', null, 'scheduled', null, null, 1, '537365'),
  ('group', 'H', 'Uruguay', 'URY', 'Cape Verde Islands', 'CPV', '2026-06-21T22:00:00Z', null, 'scheduled', null, null, 1, '537372'),
  ('group', 'G', 'New Zealand', 'NZL', 'Egypt', 'EGY', '2026-06-22T01:00:00Z', null, 'scheduled', null, null, 1, '537366'),
  ('group', 'J', 'Argentina', 'ARG', 'Austria', 'AUT', '2026-06-22T17:00:00Z', null, 'scheduled', null, null, 1, '537399'),
  ('group', 'I', 'France', 'FRA', 'Iraq', 'IRQ', '2026-06-22T21:00:00Z', null, 'scheduled', null, null, 1, '537393'),
  ('group', 'I', 'Norway', 'NOR', 'Senegal', 'SEN', '2026-06-23T00:00:00Z', null, 'scheduled', null, null, 1, '537394'),
  ('group', 'J', 'Jordan', 'JOR', 'Algeria', 'ALG', '2026-06-23T03:00:00Z', null, 'scheduled', null, null, 1, '537400'),
  ('group', 'K', 'Portugal', 'POR', 'Uzbekistan', 'UZB', '2026-06-23T17:00:00Z', null, 'scheduled', null, null, 1, '537405'),
  ('group', 'L', 'England', 'ENG', 'Ghana', 'GHA', '2026-06-23T20:00:00Z', null, 'scheduled', null, null, 1, '537411'),
  ('group', 'L', 'Panama', 'PAN', 'Croatia', 'CRO', '2026-06-23T23:00:00Z', null, 'scheduled', null, null, 1, '537412'),
  ('group', 'K', 'Colombia', 'COL', 'Congo DR', 'COD', '2026-06-24T02:00:00Z', null, 'scheduled', null, null, 1, '537406'),
  ('group', 'B', 'Switzerland', 'SUI', 'Canada', 'CAN', '2026-06-24T19:00:00Z', null, 'scheduled', null, null, 1, '537337'),
  ('group', 'B', 'Bosnia-Herzegovina', 'BIH', 'Qatar', 'QAT', '2026-06-24T19:00:00Z', null, 'scheduled', null, null, 1, '537338'),
  ('group', 'C', 'Morocco', 'MAR', 'Haiti', 'HAI', '2026-06-24T22:00:00Z', null, 'scheduled', null, null, 1, '537344'),
  ('group', 'C', 'Scotland', 'SCO', 'Brazil', 'BRA', '2026-06-24T22:00:00Z', null, 'scheduled', null, null, 1, '537343'),
  ('group', 'A', 'Czechia', 'CZE', 'Mexico', 'MEX', '2026-06-25T01:00:00Z', null, 'scheduled', null, null, 1, '537331'),
  ('group', 'A', 'South Africa', 'RSA', 'South Korea', 'KOR', '2026-06-25T01:00:00Z', null, 'scheduled', null, null, 1, '537332'),
  ('group', 'E', 'Ecuador', 'ECU', 'Germany', 'GER', '2026-06-25T20:00:00Z', null, 'scheduled', null, null, 1, '537355'),
  ('group', 'E', 'Curaçao', 'CUW', 'Ivory Coast', 'CIV', '2026-06-25T20:00:00Z', null, 'scheduled', null, null, 1, '537356'),
  ('group', 'F', 'Tunisia', 'TUN', 'Netherlands', 'NED', '2026-06-25T23:00:00Z', null, 'scheduled', null, null, 1, '537361'),
  ('group', 'F', 'Japan', 'JPN', 'Sweden', 'SWE', '2026-06-25T23:00:00Z', null, 'scheduled', null, null, 1, '537362'),
  ('group', 'D', 'Turkey', 'TUR', 'United States', 'USA', '2026-06-26T02:00:00Z', null, 'scheduled', null, null, 1, '537349'),
  ('group', 'D', 'Paraguay', 'PAR', 'Australia', 'AUS', '2026-06-26T02:00:00Z', null, 'scheduled', null, null, 1, '537350'),
  ('group', 'I', 'Norway', 'NOR', 'France', 'FRA', '2026-06-26T19:00:00Z', null, 'scheduled', null, null, 1, '537395'),
  ('group', 'I', 'Senegal', 'SEN', 'Iraq', 'IRQ', '2026-06-26T19:00:00Z', null, 'scheduled', null, null, 1, '537396'),
  ('group', 'H', 'Uruguay', 'URY', 'Spain', 'ESP', '2026-06-27T00:00:00Z', null, 'scheduled', null, null, 1, '537373'),
  ('group', 'H', 'Cape Verde Islands', 'CPV', 'Saudi Arabia', 'KSA', '2026-06-27T00:00:00Z', null, 'scheduled', null, null, 1, '537374'),
  ('group', 'G', 'New Zealand', 'NZL', 'Belgium', 'BEL', '2026-06-27T03:00:00Z', null, 'scheduled', null, null, 1, '537367'),
  ('group', 'G', 'Egypt', 'EGY', 'Iran', 'IRN', '2026-06-27T03:00:00Z', null, 'scheduled', null, null, 1, '537368'),
  ('group', 'L', 'Panama', 'PAN', 'England', 'ENG', '2026-06-27T21:00:00Z', null, 'scheduled', null, null, 1, '537413'),
  ('group', 'L', 'Croatia', 'CRO', 'Ghana', 'GHA', '2026-06-27T21:00:00Z', null, 'scheduled', null, null, 1, '537414'),
  ('group', 'K', 'Colombia', 'COL', 'Portugal', 'POR', '2026-06-27T23:30:00Z', null, 'scheduled', null, null, 1, '537407'),
  ('group', 'K', 'Congo DR', 'COD', 'Uzbekistan', 'UZB', '2026-06-27T23:30:00Z', null, 'scheduled', null, null, 1, '537408'),
  ('group', 'J', 'Jordan', 'JOR', 'Argentina', 'ARG', '2026-06-28T02:00:00Z', null, 'scheduled', null, null, 1, '537401'),
  ('group', 'J', 'Algeria', 'ALG', 'Austria', 'AUT', '2026-06-28T02:00:00Z', null, 'scheduled', null, null, 1, '537402'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-06-28T19:00:00Z', null, 'scheduled', null, null, 2, '537417'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-06-29T17:00:00Z', null, 'scheduled', null, null, 2, '537423'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-06-29T20:30:00Z', null, 'scheduled', null, null, 2, '537415'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-06-30T01:00:00Z', null, 'scheduled', null, null, 2, '537418'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-06-30T17:00:00Z', null, 'scheduled', null, null, 2, '537424'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-06-30T21:00:00Z', null, 'scheduled', null, null, 2, '537416'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-01T01:00:00Z', null, 'scheduled', null, null, 2, '537425'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-01T16:00:00Z', null, 'scheduled', null, null, 2, '537426'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-01T20:00:00Z', null, 'scheduled', null, null, 2, '537422'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-02T00:00:00Z', null, 'scheduled', null, null, 2, '537421'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-02T19:00:00Z', null, 'scheduled', null, null, 2, '537420'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-02T23:00:00Z', null, 'scheduled', null, null, 2, '537419'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-03T03:00:00Z', null, 'scheduled', null, null, 2, '537429'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-03T18:00:00Z', null, 'scheduled', null, null, 2, '537428'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-03T22:00:00Z', null, 'scheduled', null, null, 2, '537427'),
  ('round_of_32', null, 'TBD', null, 'TBD', null, '2026-07-04T01:30:00Z', null, 'scheduled', null, null, 2, '537430'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-04T17:00:00Z', null, 'scheduled', null, null, 2, '537376'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-04T21:00:00Z', null, 'scheduled', null, null, 2, '537375'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-05T20:00:00Z', null, 'scheduled', null, null, 2, '537377'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-06T00:00:00Z', null, 'scheduled', null, null, 2, '537378'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-06T19:00:00Z', null, 'scheduled', null, null, 2, '537379'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-07T00:00:00Z', null, 'scheduled', null, null, 2, '537380'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-07T16:00:00Z', null, 'scheduled', null, null, 2, '537381'),
  ('round_of_16', null, 'TBD', null, 'TBD', null, '2026-07-07T20:00:00Z', null, 'scheduled', null, null, 2, '537382'),
  ('quarter_final', null, 'TBD', null, 'TBD', null, '2026-07-09T20:00:00Z', null, 'scheduled', null, null, 2, '537383'),
  ('quarter_final', null, 'TBD', null, 'TBD', null, '2026-07-10T19:00:00Z', null, 'scheduled', null, null, 2, '537384'),
  ('quarter_final', null, 'TBD', null, 'TBD', null, '2026-07-11T21:00:00Z', null, 'scheduled', null, null, 2, '537385'),
  ('quarter_final', null, 'TBD', null, 'TBD', null, '2026-07-12T01:00:00Z', null, 'scheduled', null, null, 2, '537386'),
  ('semi_final', null, 'TBD', null, 'TBD', null, '2026-07-14T19:00:00Z', null, 'scheduled', null, null, 2, '537387'),
  ('semi_final', null, 'TBD', null, 'TBD', null, '2026-07-15T19:00:00Z', null, 'scheduled', null, null, 2, '537388'),
  ('third_place', null, 'TBD', null, 'TBD', null, '2026-07-18T21:00:00Z', null, 'scheduled', null, null, 2, '537389'),
  ('final', null, 'TBD', null, 'TBD', null, '2026-07-19T19:00:00Z', null, 'scheduled', null, null, 3, '537390')
on conflict (external_id) do update set
  stage = excluded.stage,
  grp = excluded.grp,
  home_team = excluded.home_team,
  home_code = excluded.home_code,
  away_team = excluded.away_team,
  away_code = excluded.away_code,
  kickoff = excluded.kickoff,
  venue = excluded.venue,
  status = excluded.status,
  home_score = excluded.home_score,
  away_score = excluded.away_score,
  points_multiplier = excluded.points_multiplier;


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
