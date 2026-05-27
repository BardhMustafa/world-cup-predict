import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import { stageLabels, OUTCOME_LABELS, scorePrediction } from '../lib/scoring.js';

const fmtWeekday = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

// Whether a match still accepts forecasts (mirrors the RLS rule).
const isOpen = (m) => m.status === 'scheduled' && new Date(m.kickoff) > new Date();

function PredictRow({ match, prediction, onSaved }) {
  const open = isOpen(match);
  const finished = match.status === 'finished' && match.home_score != null;

  const [home, setHome] = useState(prediction?.home_pred ?? '');
  const [away, setAway] = useState(prediction?.away_pred ?? '');
  const [status, setStatus] = useState(prediction ? 'saved' : 'open');
  const [error, setError] = useState('');

  useEffect(() => {
    setHome(prediction?.home_pred ?? '');
    setAway(prediction?.away_pred ?? '');
    setStatus(prediction ? 'saved' : 'open');
  }, [prediction]);

  const sanitize = (v) => v.replace(/[^0-9]/g, '').slice(0, 2);

  const save = async () => {
    if (home === '' || away === '') return;
    setStatus('saving');
    setError('');
    const { error } = await supabase.from('predictions').upsert(
      {
        user_id: (await supabase.auth.getUser()).data.user.id,
        match_id: match.id,
        home_pred: Number(home),
        away_pred: Number(away),
      },
      { onConflict: 'user_id,match_id' }
    );
    if (error) {
      setStatus('open');
      setError('Could not save — the match may have locked.');
    } else {
      setStatus('saved');
      onSaved();
    }
  };

  // Status chip
  let chip;
  if (finished) chip = <span className="chip scored">Full-time</span>;
  else if (!open) chip = <span className="chip locked">Locked</span>;
  else if (status === 'saved') chip = <span className="chip saved">Filed</span>;
  else chip = <span className="chip open">Open</span>;

  const result =
    finished && prediction
      ? scorePrediction(prediction.home_pred, prediction.away_pred, match.home_score, match.away_score, match.points_multiplier)
      : null;

  return (
    <div className="fix-row" style={{ gridTemplateColumns: '64px 1fr 1fr 160px' }}>
      <div className="fix-time">{fmtTime(match.kickoff)}</div>

      <div className="fix-team home">
        <Crest team={match.home_team} code={match.home_code} />
        {match.home_team}
      </div>

      <div className="fix-team away">
        {match.away_team}
        <Crest team={match.away_team} code={match.away_code} />
      </div>

      <div>
        {finished ? (
          <div className="center">
            <div className="final-score">
              {match.home_score}&ndash;{match.away_score}
            </div>
            {result && (
              <div className="fix-pred-help">
                {OUTCOME_LABELS[result.outcome]} · <span className="pts-pill">{result.points} pts</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={`fix-pred${open ? '' : ' locked'}`}>
              <input
                type="text" inputMode="numeric" maxLength={2}
                value={home} placeholder="–" readOnly={!open}
                aria-label={`${match.home_team} score`}
                onChange={(e) => setHome(sanitize(e.target.value))}
                onBlur={open ? save : undefined}
              />
              <span className="dash">&ndash;</span>
              <input
                type="text" inputMode="numeric" maxLength={2}
                value={away} placeholder="–" readOnly={!open}
                aria-label={`${match.away_team} score`}
                onChange={(e) => setAway(sanitize(e.target.value))}
                onBlur={open ? save : undefined}
              />
            </div>
            <div className="fix-pred-help">
              {status === 'saving' ? 'Filing…' : error ? <span style={{ color: 'var(--burgundy)' }}>{error}</span> : chip}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Predict() {
  const { isConfigured } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predByMatch, setPredByMatch] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from('matches').select('*').order('kickoff', { ascending: true }),
      supabase.from('predictions').select('*'),
    ]);
    setMatches(m ?? []);
    setPredByMatch(Object.fromEntries((p ?? []).map((x) => [x.match_id, x])));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isConfigured) load();
  }, [isConfigured, load]);

  // Group matches by stage, then by calendar day — preserving kickoff order.
  const grouped = useMemo(() => {
    const stages = [];
    const si = {};
    matches.forEach((m) => {
      if (!(m.stage in si)) {
        si[m.stage] = stages.length;
        stages.push({ stage: m.stage, days: [], di: {} });
      }
      const s = stages[si[m.stage]];
      const key = m.kickoff.slice(0, 10);
      if (!(key in s.di)) {
        s.di[key] = s.days.length;
        s.days.push({ key, weekday: fmtWeekday(m.kickoff), dateLabel: fmtDate(m.kickoff), matches: [] });
      }
      s.days[s.di[key]].matches.push(m);
    });
    return stages;
  }, [matches]);

  if (!isConfigured) {
    return (
      <>
        <div className="page-head"><h1>To-day's <em>Fixtures</em></h1></div>
        <SetupNotice />
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Your <em>Forecasts</em></h1>
        <div className="sub">Mark a score for every match. Entries seal the moment the whistle blows.</div>
      </div>

      {loading ? (
        <p className="muted center" style={{ padding: '40px 0' }}>Gathering the fixtures…</p>
      ) : matches.length === 0 ? (
        <div className="notice"><h3>No fixtures posted yet</h3><p>The editorial desk hasn't published any matches. Check back on World Cup morning.</p></div>
      ) : (
        grouped.map((s) => (
          <section key={s.stage} className="predict-stage">
            <div className="section-header">
              <h2>{stageLabels[s.stage] || s.stage}</h2>
            </div>
            <div className="fixtures-list predict-list">
              {s.days.map((day) => (
                <div className="fix-day" key={day.key}>
                  <div className="fix-day-label">
                    <div className="day">{day.weekday}.</div>
                    <div className="date">{day.dateLabel}</div>
                  </div>
                  <div className="fix-matches">
                    {day.matches.map((m) => (
                      <PredictRow key={m.id} match={m} prediction={predByMatch[m.id]} onSaved={load} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
