import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};
const weekday = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' });
const month = (iso) => new Date(iso).toLocaleDateString('en-GB', { month: 'long' });
const time = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// Shapes a DB match into the structure the landing FixtureRow expects.
function toFixture(m) {
  return {
    id: m.id,
    time: time(m.kickoff),
    home: m.home_team,
    away: m.away_team,
    home_code: m.home_code,
    away_code: m.away_code,
    state: 'open',
    prediction: { home: '', away: '' },
  };
}

// One trip for everything the front page renders: next fixtures (grouped by
// day), the next match, the top of the table, and headline counts. Returns
// `configured: false` when Supabase isn't set up so the page can fall back to
// its editorial sample.
export default function useHomeData() {
  const [data, setData] = useState({ configured: isSupabaseConfigured, loading: isSupabaseConfigured });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      const [matchesRes, lbRes, profilesRes, nationsRes] = await Promise.all([
        supabase.from('matches').select('*').order('kickoff', { ascending: true }),
        supabase.from('leaderboard').select('*').order('points', { ascending: false }).order('full_name').limit(10),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('group_standings').select('team', { count: 'exact', head: true }),
      ]);
      if (cancelled) return;

      const matches = matchesRes.data ?? [];
      const now = Date.now();
      const upcoming = matches.filter((m) => m.status === 'scheduled' && new Date(m.kickoff).getTime() > now);

      // Group the next few fixtures by calendar day.
      const days = [];
      const di = {};
      upcoming.slice(0, 6).forEach((m) => {
        const key = m.kickoff.slice(0, 10);
        if (!(key in di)) {
          di[key] = days.length;
          const d = new Date(m.kickoff).getDate();
          days.push({ key, day: weekday(m.kickoff), date: d, dateSuffix: ordinal(d), month: month(m.kickoff), matches: [] });
        }
        days[di[key]].matches.push(toFixture(m));
      });

      // Match of the Day: an admin-featured fixture if set, else the next one.
      const featured = matches.find((m) => m.is_featured) ?? upcoming[0] ?? null;

      setData({
        configured: true,
        loading: false,
        days,
        nextKickoff: upcoming[0]?.kickoff ?? null,
        featured,
        leaders: lbRes.data ?? [],
        counts: {
          matches: matches.length,
          nations: nationsRes.count ?? null,
          patriots: profilesRes.count ?? null,
        },
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
