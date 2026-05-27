# Supabase backend — The Prediction Post

The database **is** the security model here: there's no server layer, so
Row-Level Security and Postgres functions enforce every rule.

## Files (apply in order)

| File | What it does |
|---|---|
| `migrations/0001_schema.sql` | Tables (`profiles`, `user_verification`, `matches`, `predictions`), enums, indexes, `updated_at` triggers |
| `migrations/0002_functions.sql` | `is_admin()`, `handle_new_user()`, scoring (`recompute_match_predictions`), `refresh_leaderboard()`, the match-scored trigger, and the `leaderboard` view |
| `migrations/0003_rls.sql` | RLS policies — incl. the **lock-at-kickoff** rule on `predictions` |
| `seed.sql` | Example World Cup fixtures |
| `functions/sync-results/` | Edge Function that pulls official scores from the football API |

## Apply it

**Option A — SQL editor (quickest):** paste each file in order into the
Supabase SQL editor and run.

**Option B — Supabase CLI:**
```bash
supabase link --project-ref <your-ref>
supabase db push                  # applies migrations/
psql "$DATABASE_URL" -f supabase/seed.sql
```

## Make yourself an admin
After registering through the app:
```sql
update public.profiles set is_admin = true where handle = '<your-handle>';
```

## How the rules are enforced
- **One entry per patriot** — `user_verification.kosovo_id` is `unique`; the
  `handle_new_user` trigger inserts it during sign-up, so a duplicate aborts
  registration.
- **Predictions lock at kickoff** — the insert/update policies on `predictions`
  require a matching `matches` row that is still `scheduled` and whose
  `kickoff > now()`. The client can't bypass this.
- **Scoring is automatic + server-side** — when an admin (or the sync function)
  sets a match `finished` with scores, `on_match_scored` recomputes points for
  every forecast and re-ranks the leaderboard.
- **PII stays private** — the Kosovo ID lives in `user_verification`, readable
  only by its owner; `profiles` (world-readable for the leaderboard) never holds it.

## Live scores (optional)
Deploy the Edge Function and schedule it during matchdays:
```bash
supabase secrets set FOOTBALL_API_KEY=<key>
supabase functions deploy sync-results
# then add a cron schedule in the dashboard (e.g. every 5 min)
```
Populate `matches.external_id` with the provider's match ids so results map back.
