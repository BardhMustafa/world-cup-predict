import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { MIN_PLAYERS } from '../lib/league.js';

// How many patriots have filed a prediction, and whether that clears the
// threshold that activates the competition's prizes. `players` is null until
// loaded (or if the count view isn't available) so callers can stay neutral.
export default function useActivePlayers() {
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('active_player_count').select('players').single();
      if (!cancelled && data) setPlayers(data.players ?? 0);
    })();
    return () => { cancelled = true; };
  }, []);

  return {
    players,
    min: MIN_PLAYERS,
    active: players != null && players >= MIN_PLAYERS,
    remaining: players == null ? null : Math.max(0, MIN_PLAYERS - players),
  };
}
