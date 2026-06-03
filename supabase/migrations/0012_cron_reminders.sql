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
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpja2FmZm96anVrdG90b2Z2ZHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODc2MjYsImV4cCI6MjA5NTQ2MzYyNn0.nLOHMhBhzGN8Zc8gS6JJE8IyMCqtUv2uaVVXJjTCylU'
    ),
    body    := '{}'::jsonb
  );
  $$
);
