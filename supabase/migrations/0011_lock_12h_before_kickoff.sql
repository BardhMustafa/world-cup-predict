-- Lock predictions 12 hours before kickoff (previously locked at kickoff)
drop policy if exists predictions_insert_open on public.predictions;
create policy predictions_insert_open on public.predictions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and m.kickoff > now() + interval '12 hours'
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
        and m.kickoff > now() + interval '12 hours'
    )
  );
