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

## Featured match (Match of the Day)
`migrations/0005_featured.sql` adds an `is_featured` flag (max one match) and the
admin-only `set_featured_match()` RPC. Toggle it from the **Desk** (`/admin`); the
front page shows the featured fixture, falling back to the next kickoff if none.

## Live scores — auto-results
`functions/sync-results` polls football-data.org and writes scores into `matches`,
which fires the scoring trigger. `matches.external_id` is already populated by the
fixture import, so results map straight back.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into Edge Functions
automatically — the **only** secret you set is the football token.

**Deploy (CLI):**
```bash
supabase secrets set FOOTBALL_API_KEY=516b034dcc464fd089a010d25a90e1e0
supabase functions deploy sync-results
```
…or in the **Dashboard → Edge Functions**: create `sync-results`, paste the file,
add the `FOOTBALL_API_KEY` secret, Deploy.

**Test it once** (returns `{ checked, updated, requestsAvailable }`):
```bash
curl -X POST https://<ref>.supabase.co/functions/v1/sync-results \
  -H "Authorization: Bearer <service_role_key>"
```

**Schedule during matchdays** — Dashboard → Cron, or SQL:
```sql
select cron.schedule('sync-results', '* * * * *', $$
  select net.http_post(
    url     := 'https://<ref>.supabase.co/functions/v1/sync-results',
    headers := '{"Authorization":"Bearer <service_role_key>"}'::jsonb
  );
$$);
```
Every minute is well within the free tier (one provider request per run, and the
function only writes matches whose score/status actually changed).
