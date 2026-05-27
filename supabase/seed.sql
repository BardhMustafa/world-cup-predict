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
