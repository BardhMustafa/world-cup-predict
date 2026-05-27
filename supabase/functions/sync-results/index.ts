// ─────────────────────────────────────────────────────────────────
// sync-results — Supabase Edge Function (Deno)
//
// Pulls official scores from football-data.org and writes them into the
// `matches` table. Updating a match's status/score fires the Postgres
// `on_match_scored` trigger, which scores every forecast and re-ranks
// the leaderboard — so this is the only moving part needed for results
// to flow automatically once the tournament starts.
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
// into Edge Functions. The only secret you must set yourself:
//   supabase secrets set FOOTBALL_API_KEY=<token>
// (or add it in Dashboard → Edge Functions → Secrets)
//
// Schedule it every minute or two during matchdays (see supabase/README.md).
// ─────────────────────────────────────────────────────────────────
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const COMPETITION = 'WC';

const mapStatus = (s: string) =>
  s === 'FINISHED' ? 'finished' : s === 'IN_PLAY' || s === 'PAUSED' ? 'live' : 'scheduled';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const res = await fetch(
    `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`,
    { headers: { 'X-Auth-Token': Deno.env.get('FOOTBALL_API_KEY')! } }
  );

  // Respect the provider's throttle hints (per football-data.org guidance).
  const remaining = res.headers.get('X-Requests-Available-Minute');
  if (res.status === 429) {
    return new Response(
      JSON.stringify({ error: 'rate_limited', resetSeconds: res.headers.get('X-RequestCounter-Reset') }),
      { status: 429, headers: { 'content-type': 'application/json' } }
    );
  }
  if (!res.ok) return new Response(`provider error ${res.status}`, { status: 502 });

  const { matches = [] } = await res.json();

  // Only write rows that actually changed, so we don't re-fire the scoring
  // trigger (and re-rank the whole table) on every poll for no reason.
  const { data: current = [] } = await supabase
    .from('matches')
    .select('external_id, status, home_score, away_score');
  const byExt = new Map((current ?? []).map((m) => [m.external_id, m]));

  let updated = 0;
  for (const m of matches) {
    const cur = byExt.get(String(m.id));
    if (!cur) continue; // a fixture we don't track

    const next = {
      status: mapStatus(m.status),
      home_score: m.score?.fullTime?.home ?? null,
      away_score: m.score?.fullTime?.away ?? null,
    };
    const changed =
      cur.status !== next.status ||
      cur.home_score !== next.home_score ||
      cur.away_score !== next.away_score;
    if (!changed) continue;

    const { error } = await supabase.from('matches').update(next).eq('external_id', String(m.id));
    if (!error) updated++;
  }

  return new Response(
    JSON.stringify({ checked: matches.length, updated, requestsAvailable: remaining }),
    { headers: { 'content-type': 'application/json' } }
  );
});
