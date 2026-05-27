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
