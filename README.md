# The Prediction Post

A World Cup prediction platform for Kosovo, dressed as a vintage football newspaper —
*"a historic football newspaper brought to life as a modern web platform."*

Users enrol, forecast scores for every World Cup match, earn points on accuracy, and climb
a live national league table. Built with **React + Vite + Supabase (Postgres)**.

## Quick start

```bash
npm install
cp .env.example .env.local      # fill in your Supabase URL + anon key
npm run dev                     # http://localhost:5173
```

The site **runs without Supabase** — the editorial front page is always viewable, and the
data-backed pages show a "connect Supabase" notice until you add credentials.

### Connect Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema, functions, RLS and seed — see [`supabase/README.md`](supabase/README.md).
3. Put the project URL + **anon** key into `.env.local`.
4. Register an account, then promote yourself to admin (SQL snippet in `supabase/README.md`).

## What's built

**Auth** — email/password via Supabase Auth. Registration ("Enrolment") collects name, handle,
town, and a **Kosovo ID** (10-digit format check; unique → one account per patriot; kept in a
private table, never exposed).

**Predictions** (`/fixtures`) — every match with crests, kickoff times, and a score box.
Forecasts auto-save on blur and **lock at kickoff** (enforced in Postgres, not the client).
Finished matches show the result and the points earned.

**Scoring** — automatic, server-side: exact `10`, outcome + goal difference `5`, correct
outcome `3`, wrong `0`; ×2 for knockouts, ×3 for the Final. A DB trigger scores every forecast
the instant a result is filed.

**Leaderboard** (`/leaderboard`) — the Patriots' Table, ranked live with rank-movement arrows,
top three and your own row highlighted. Subscribes to realtime changes.

**Profile** (`/profile`) — your points, accuracy, rank, editable handle/town, and full ledger
of past forecasts.

**Admin desk** (`/admin`) — publish fixtures and file results (which triggers scoring);
admin-only.

## Architecture

```
React (Vite SPA) ──► Supabase JS client ──► Postgres
  pages/, components/                         RLS = the security model
                                              triggers = scoring + ranking
                                                ▲
Football API ──► Edge Function (sync-results) ─┘   (server-trusted score ingestion)
```

Because there's no server layer, **all trust lives in the database**: RLS policies enforce who
reads/writes what and that predictions can't change after kickoff; Postgres functions compute
points and ranks from the authoritative result. See `supabase/README.md`.

## Project layout

```
src/
  App.jsx                 # router
  context/AuthContext.jsx # session + profile
  lib/supabase.js         # client (graceful if unconfigured)
  lib/scoring.js          # display mirror of the DB scoring rules
  pages/                  # Landing, Register, Login, Predict, Leaderboard, Profile, Admin
  components/             # Masthead, Hero, Crest, AppNav, ProtectedRoute, … + landing sections
  styles/                 # newspaper.css (design system) + app.css (forms/nav/pages)
supabase/
  migrations/             # schema, functions, RLS
  seed.sql                # example fixtures
  functions/sync-results/ # football-API → Postgres edge function
vercel.json               # SPA rewrites for Vercel
```

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build → `dist/`
- `npm run preview` — preview the build

## Deploy (Vercel)
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as project env vars. `vercel.json` already
rewrites all routes to `index.html` for the SPA router.

## Notes & next steps
- **Live scores**: the result-sync Edge Function targets football-data.org (free tier includes
  the World Cup); populate `matches.external_id` and schedule it during matchdays.
- The landing page's fixtures/table are still the static editorial sample (`src/data/`); the
  *live* equivalents are `/fixtures` and `/leaderboard`. Wiring the front page to live data is a
  small follow-up if you want it.
- Email confirmation depends on your Supabase Auth settings; the flow handles both
  auto-confirm and "check your email".
