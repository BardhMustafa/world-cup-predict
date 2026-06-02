-- Daily reminder emails at 08:00 UTC
-- Requires: pg_cron + pg_net extensions enabled in Supabase Dashboard
--
-- Replace <PROJECT_REF> and <ANON_KEY> with your actual values before running.
-- Find them in: Dashboard → Project Settings → API

select cron.schedule(
  'daily-prediction-reminders',
  '0 8 * * *',
  $$
  select net.http_post(
    url     := 'https://zckaffozjuktotof.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);
