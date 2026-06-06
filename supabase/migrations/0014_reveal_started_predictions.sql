-- Reveal predictions only after the match has kicked off.
--
-- Before a match starts, a forecast must stay private — otherwise a player
-- could copy a rival's pick. Once the ball is rolling the pick is locked and
-- no longer secret, so any signed-in patriot may inspect another player's
-- predictions for matches that have already started. Your own predictions
-- remain readable at all times (predictions_select_own).

drop policy if exists predictions_select_started on public.predictions;
create policy predictions_select_started on public.predictions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.kickoff <= now()
    )
  );
