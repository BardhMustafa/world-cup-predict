import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from './Crest.jsx';
import { IconLockSmall, IconCheck } from './ui/icons.jsx';
import { scorePrediction, OUTCOME_LABELS } from '../lib/scoring.js';

const clamp = (n) => Math.max(0, Math.min(20, n));
const LOCK_MS = 12 * 60 * 60 * 1000;
const isOpen = (m) => {
  const now = Date.now();
  const kickoff = new Date(m.kickoff).getTime();
  return m.status === 'scheduled' && now >= kickoff - LOCK_MS && now < kickoff;
};
const fmt = (iso) => new Date(iso).toLocaleString('sq', { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });

function Stepper({ value, setValue, disabled }) {
  return (
    <div className="stepper">
      <button type="button" className="step-btn" disabled={disabled} onClick={() => setValue((v) => clamp(v + 1))} aria-label="+">+</button>
      <div className="val">{value}</div>
      <button type="button" className="step-btn" disabled={disabled} onClick={() => setValue((v) => clamp(v - 1))} aria-label="−">−</button>
    </div>
  );
}

// Interactive prediction card with score steppers. Handles open / locked /
// finished states and persists to Supabase for signed-in users.
export default function MatchStepperCard({ match }) {
  const { user } = useAuth();
  const open = isOpen(match);
  const finished = match.status === 'finished' && match.home_score != null;
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | saving | saved

  useEffect(() => {
    if (!user) return;
    supabase.from('predictions').select('home_pred, away_pred').eq('match_id', match.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setHome(data.home_pred); setAway(data.away_pred); setStatus('saved'); }
      });
  }, [user, match.id]);

  const save = async () => {
    if (!user || !open) return;
    setStatus('saving');
    const { error } = await supabase.from('predictions').upsert(
      { user_id: user.id, match_id: match.id, home_pred: home, away_pred: away },
      { onConflict: 'user_id,match_id' }
    );
    setStatus(error ? 'idle' : 'saved');
  };

  if (finished) {
    const r = scorePrediction(home, away, match.home_score, match.away_score, match.points_multiplier);
    const win = r.points > 0;
    return (
      <div className={`result-strip ${win ? 'win' : 'loss'}`}>
        <div className="side"><Crest team={match.home_team} code={match.home_code} /> {match.home_team}</div>
        <div className="center">
          <div className="score">{match.home_score} – {match.away_score}</div>
          {status === 'saved' && <div className="text-dim" style={{ fontSize: 12 }}>{OUTCOME_LABELS[r.outcome]} · <span className="text-gold">{r.points} pikë</span></div>}
        </div>
        <div className="side">{match.away_team} <Crest team={match.away_team} code={match.away_code} /></div>
      </div>
    );
  }

  return (
    <div className="card match-card">
      <div className="row-between" style={{ marginBottom: 18 }}>
        <span className="pill pill-blue">{match.grp ? `Grupi ${match.grp}` : 'World Cup 2026'}</span>
        {open
          ? <span className="text-mute" style={{ fontSize: 13 }}>{fmt(match.kickoff)}</span>
          : <span className="pill pill-mute"><IconLockSmall size={13} /> I mbyllur</span>}
      </div>

      <div className="match-vs">
        <div className="match-team">
          <Crest team={match.home_team} code={match.home_code} size={72} round />
          <div className="nm">{match.home_team}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Stepper value={home} setValue={setHome} disabled={!open || !user} />
          <span className="vs">VS</span>
          <Stepper value={away} setValue={setAway} disabled={!open || !user} />
        </div>

        <div className="match-team">
          <Crest team={match.away_team} code={match.away_code} size={72} round />
          <div className="nm">{match.away_team}</div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {!user ? (
          <Link to="/register" className="btn btn-primary block">Regjistrohu për të parashikuar</Link>
        ) : !open ? (
          <button className="btn btn-ghost block" disabled>Parashikimet janë mbyllur</button>
        ) : (
          <button className="btn btn-primary block" onClick={save} disabled={status === 'saving'}>
            {status === 'saving' ? 'Duke ruajtur…' : status === 'saved' ? <><IconCheck size={16} /> E ruajtur</> : 'Ruaj Parashikimin'}
          </button>
        )}
      </div>
    </div>
  );
}
