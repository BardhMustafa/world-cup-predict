import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';
import { IconLockSmall, IconCheck } from '../components/ui/icons.jsx';
import {
  stageLabels,
  scorePrediction,
  OUTCOME_LABELS,
} from '../lib/scoring.js';

const stageSq = {
  group: 'Faza e Grupeve',
  round_of_32: 'Raundi i 32',
  round_of_16: 'Tetëshja e Fundit',
  quarter_final: 'Çerekfinale',
  semi_final: 'Gjysmëfinale',
  third_place: 'Vendi i Tretë',
  final: 'Finalja',
};
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('sq', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('sq', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
const isOpen = (m) =>
  m.status === 'scheduled' && new Date(m.kickoff) > new Date();

function PredictRow({ match, prediction, onSaved }) {
  const open = isOpen(match);
  const finished = match.status === 'finished' && match.home_score != null;
  const [home, setHome] = useState(prediction?.home_pred ?? '');
  const [away, setAway] = useState(prediction?.away_pred ?? '');
  const [status, setStatus] = useState(prediction ? 'saved' : 'open');

  useEffect(() => {
    setHome(prediction?.home_pred ?? '');
    setAway(prediction?.away_pred ?? '');
    setStatus(prediction ? 'saved' : 'open');
  }, [prediction]);

  const sanitize = (v) => v.replace(/[^0-9]/g, '').slice(0, 2);
  const save = async () => {
    if (home === '' || away === '') return;
    setStatus('saving');
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from('predictions').upsert(
      {
        user_id: u.user.id,
        match_id: match.id,
        home_pred: Number(home),
        away_pred: Number(away),
      },
      { onConflict: 'user_id,match_id' },
    );
    setStatus(error ? 'open' : 'saved');
    if (!error) onSaved();
  };

  const result =
    finished && prediction
      ? scorePrediction(
          prediction.home_pred,
          prediction.away_pred,
          match.home_score,
          match.away_score,
          match.points_multiplier,
        )
      : null;

  return (
    <div className="pred-row">
      <div className="pred-time">{fmtTime(match.kickoff)}</div>

      <div className="pred-team home">
        <span className="nm">{match.home_team}</span>
        <Crest team={match.home_team} code={match.home_code} />
      </div>

      {finished ? (
        <div className="pred-final">
          {match.home_score} – {match.away_score}
        </div>
      ) : (
        <div className="pred-score">
          <input
            inputMode="numeric"
            value={home}
            placeholder="–"
            disabled={!open}
            onChange={(e) => setHome(sanitize(e.target.value))}
            onBlur={open ? save : undefined}
            aria-label={`${match.home_team}`}
          />
          <span className="dash">–</span>
          <input
            inputMode="numeric"
            value={away}
            placeholder="–"
            disabled={!open}
            onChange={(e) => setAway(sanitize(e.target.value))}
            onBlur={open ? save : undefined}
            aria-label={`${match.away_team}`}
          />
        </div>
      )}

      <div className="pred-team away">
        <Crest team={match.away_team} code={match.away_code} />
        <span className="nm">{match.away_team}</span>
      </div>

      <div className="pred-status">
        {finished && result ? (
          <span className="pill pill-gold">{result.points} pikë</span>
        ) : !open ? (
          <span className="pill pill-mute">
            <IconLockSmall size={12} /> Mbyllur
          </span>
        ) : status === 'saving' ? (
          <span className="text-mute" style={{ fontSize: 12 }}>
            Ruajtje…
          </span>
        ) : status === 'saved' ? (
          <span className="pill pill-green">
            <IconCheck size={12} /> Ruajtur
          </span>
        ) : (
          <span className="pill pill-mute">Hapur</span>
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
      supabase
        .from('matches')
        .select('*')
        .order('kickoff', { ascending: true }),
      supabase.from('predictions').select('*'),
    ]);
    setMatches(m ?? []);
    setPredByMatch(Object.fromEntries((p ?? []).map((x) => [x.match_id, x])));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isConfigured) load();
  }, [isConfigured, load]);

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
        s.days.push({ key, label: fmtDate(m.kickoff), matches: [] });
      }
      s.days[s.di[key]].matches.push(m);
    });
    return stages;
  }, [matches]);

  return (
    <>
      <div className="page-head">
        <h1>
          Parashikimet e <span className="g">Tua</span>
        </h1>
        <div className="sub">
          Shëno një rezultat për çdo ndeshje. Mbyllen me bilbilin e parë.
        </div>
      </div>

      {loading ? (
        <div className="card pad muted center">Duke mbledhur ndeshjet…</div>
      ) : matches.length === 0 ? (
        <div className="card pad muted center">
          Ende pa ndeshje të publikuara.
        </div>
      ) : (
        grouped.map((s) => (
          <section key={s.stage} style={{ marginBottom: 30 }}>
            <h2 className="section-title">
              {stageSq[s.stage] || stageLabels[s.stage]}
            </h2>
            {s.days.map((day) => (
              <div key={day.key}>
                <div className="day-label">{day.label}</div>
                <div className="card">
                  {day.matches.map((m) => (
                    <PredictRow
                      key={m.id}
                      match={m}
                      prediction={predByMatch[m.id]}
                      onSaved={load}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))
      )}
    </>
  );
}
