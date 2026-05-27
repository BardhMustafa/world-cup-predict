import Crest from './Crest.jsx';

const helpText = {
  forecast: 'your forecast',
  open: 'open',
  locked: 'live · locked',
};

// A single fixture: kick-off time, the two teams with crests, and the
// score-prediction box. Open/forecast rows are editable; locked rows are
// sealed. On the public front page rows are read-only (`readOnly`).
export default function FixtureRow({ match, prediction, onChange, readOnly = false }) {
  const sealed = match.state === 'locked' || readOnly;
  const sanitize = (v) => v.replace(/[^0-9]/g, '').slice(0, 1);

  return (
    <div className="fix-row" style={match.featured ? { background: 'rgba(168,132,44,0.10)' } : undefined}>
      <div className="fix-time">{match.time}</div>

      <div className="fix-team home">
        <Crest team={match.home} code={match.home_code} />
        {match.home}
      </div>

      <div className="fix-team away">
        {match.away}
        <Crest team={match.away} code={match.away_code} />
      </div>

      <div>
        <div className={`fix-pred${match.state === 'locked' ? ' locked' : ''}`}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={prediction.home}
            placeholder="–"
            readOnly={sealed}
            aria-label={`${match.home} score`}
            onChange={onChange ? (e) => onChange(match.id, 'home', sanitize(e.target.value)) : undefined}
          />
          <span className="dash">&ndash;</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={prediction.away}
            placeholder="–"
            readOnly={sealed}
            aria-label={`${match.away} score`}
            onChange={onChange ? (e) => onChange(match.id, 'away', sanitize(e.target.value)) : undefined}
          />
        </div>
        <div className="fix-pred-help">{helpText[match.state]}</div>
      </div>
    </div>
  );
}
