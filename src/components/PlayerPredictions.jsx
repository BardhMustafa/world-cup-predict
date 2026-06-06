import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from './Crest.jsx';
import { IconClose } from './ui/icons.jsx';

// Albanian labels + colour bucket for each scored outcome.
const OUTCOME = {
  exact:     { label: 'Rezultat i saktë', cls: 'exact' },
  goal_diff: { label: 'Fitues + diferenca', cls: 'good' },
  outcome:   { label: 'Fituesi i saktë', cls: 'good' },
  missed:    { label: 'Gabim', cls: 'miss' },
};

// A player's predictions, but only for matches that have already kicked off.
// RLS (predictions_select_started) enforces the same rule server-side, so a
// not-yet-started pick can never be read here — this just renders what's
// already revealed.
export default function PlayerPredictions({ player, onClose }) {
  const { user } = useAuth();
  const [rows, setRows] = useState(null); // null = loading
  const isYou = user && player.user_id === user.id;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!user) { setRows([]); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('predictions')
        .select('id, home_pred, away_pred, points, outcome, matches(home_team, away_team, home_code, away_code, kickoff, home_score, away_score, status)')
        .eq('user_id', player.user_id);
      if (cancelled) return;
      const now = Date.now();
      const list = (data ?? [])
        .filter((p) => p.matches && new Date(p.matches.kickoff).getTime() <= now)
        .sort((a, b) => new Date(b.matches.kickoff) - new Date(a.matches.kickoff));
      setRows(list);
    })();
    return () => { cancelled = true; };
  }, [player.user_id, user]);

  return (
    <div className="pp-overlay" onMouseDown={onClose}>
      <div className="pp-modal card" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="pp-head">
          <div className="player">
            <div className="ini">{player.initials || player.full_name?.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="nm">{isYou ? 'Parashikimet e tua' : player.full_name}</div>
              <div className="sub">{Number(player.points).toLocaleString('en-US')} pikë · {player.played || 0} ndeshje</div>
            </div>
          </div>
          <button className="pp-close" aria-label="Mbyll" onClick={onClose}><IconClose size={20} /></button>
        </header>

        <div className="pp-body">
          {!user ? (
            <p className="muted center pp-empty">Identifikohu për të parë parashikimet e lojtarëve.</p>
          ) : rows === null ? (
            <p className="muted center pp-empty">Duke hapur…</p>
          ) : rows.length === 0 ? (
            <p className="muted center pp-empty">Asnjë parashikim i zbuluar ende. Parashikimet shfaqen pasi nis ndeshja.</p>
          ) : (
            rows.map((p) => {
              const m = p.matches;
              const done = m.home_score != null && m.away_score != null;
              const oc = OUTCOME[p.outcome];
              return (
                <div className="pp-row" key={p.id}>
                  <div className="pp-tie">
                    <span className="pp-team r"><b>{m.home_team}</b><Crest team={m.home_team} code={m.home_code} size={22} round /></span>
                    <span className="pp-pred">{p.home_pred}<i>–</i>{p.away_pred}</span>
                    <span className="pp-team"><Crest team={m.away_team} code={m.away_code} size={22} round /><b>{m.away_team}</b></span>
                  </div>
                  <div className="pp-meta">
                    <span className="pp-actual">{done ? `Përfundoi ${m.home_score}–${m.away_score}` : 'Në vazhdim'}</span>
                    {done && oc && <span className={`pp-oc pp-oc-${oc.cls}`}>{oc.label}</span>}
                    {done && p.points != null && <span className="pp-pts">{p.points > 0 ? `+${p.points}` : '0'}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
