import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';
import FixtureRow from './FixtureRow.jsx';
import { fixtures as sampleFixtures } from '../data/fixtures.js';
import useCountdown, { useCountdownTo } from '../hooks/useCountdown.js';

function CountdownCard({ cells, caption }) {
  return (
    <div className="countdown-card">
      <div className="smallcaps" style={{ color: 'var(--burgundy)', fontStyle: 'normal' }}>
        First Whistle
      </div>
      <div className="cd-grid">
        {cells.map(({ num, label }) => (
          <div key={label}>
            <div className="cd-num">{num}</div>
            <div className="cd-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="label" style={{ marginTop: 12, fontStyle: 'italic', fontSize: 12, color: 'var(--ink-soft)' }}>
        {caption}
      </div>
    </div>
  );
}

// Live countdown to the next real kick-off.
function LiveCountdown({ target, caption }) {
  const { d, h, m, s } = useCountdownTo(target);
  const cells = [
    { num: d, label: 'Days' }, { num: h, label: 'Hours' },
    { num: m, label: 'Mins' }, { num: s, label: 'Secs' },
  ];
  return <CountdownCard cells={cells} caption={caption} />;
}

// Sample countdown for the editorial fallback.
function SampleCountdown() {
  const { d, h, m, s } = useCountdown();
  const cells = [
    { num: d, label: 'Days' }, { num: h, label: 'Hours' },
    { num: m, label: 'Mins' }, { num: s, label: 'Secs' },
  ];
  return <CountdownCard cells={cells} caption="Kosovo v. Albania · Group D" />;
}

// The front-page fixtures spread. Renders live upcoming matches when `days` is
// supplied (read-only teasers linking to the prediction page); otherwise falls
// back to the editorial sample so the page is never empty.
export default function Fixtures({ days, nextKickoff, featured }) {
  const live = Array.isArray(days) && days.length > 0;
  const [predictions, setPredictions] = useState(() => {
    const seed = {};
    sampleFixtures.forEach((day) => day.matches.forEach((m) => (seed[m.id] = { ...m.prediction })));
    return seed;
  });
  const handleChange = (id, side, value) =>
    setPredictions((prev) => ({ ...prev, [id]: { ...prev[id], [side]: value } }));

  const dayGroups = live ? days : sampleFixtures;
  const emptyPred = { home: '', away: '' };
  const caption = featured ? `${featured.home_team} v. ${featured.away_team}` : 'Next on the card';

  return (
    <section>
      <SectionHeader
        title={<>The <em>Fixtures</em></>}
        meta={
          <>
            {live ? 'Next up · Group Stage' : 'Matchday I · Group Stage'}
            <br />
            Lock-in by kick-off whistle
          </>
        }
      />

      <div className="fixtures">
        <div className="fixtures-list">
          {dayGroups.map((day) => (
            <div className="fix-day" key={day.key || day.day}>
              <div className="fix-day-label">
                <div className="day">{day.day}{live ? '.' : ''}</div>
                <div className="date">
                  {day.date}
                  <sup>{day.dateSuffix}</sup> {day.month}
                </div>
              </div>
              <div className="fix-matches">
                {day.matches.map((match) => (
                  <FixtureRow
                    key={match.id}
                    match={match}
                    prediction={live ? emptyPred : predictions[match.id]}
                    onChange={live ? undefined : handleChange}
                    readOnly={live}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="fix-side">
          <h3>Until the first whistle</h3>
          {live ? <LiveCountdown target={nextKickoff} caption={caption} /> : <SampleCountdown />}

          {live && (
            <Link className="btn btn-ink" to="/fixtures" style={{ width: '100%', justifyContent: 'center', marginBottom: 22 }}>
              File Your Forecasts
            </Link>
          )}

          <h3 style={{ marginTop: 18 }}>Notice to readers</h3>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 14px', color: 'var(--ink-soft)', fontStyle: 'italic' }}>
            Forecasts may be amended at any time up to the first whistle, after which all entries are
            sealed. Submissions received past kick-off shall not be entered into the ledger, nor any
            appeal entertained.
          </p>

          <div className="rule-orn">&dagger;</div>

          <h3 style={{ marginTop: 18 }}>How points are won</h3>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
            An <strong style={{ fontFamily: 'var(--display)', fontStyle: 'normal' }}>exact</strong> scoreline
            earns ten points; the right outcome and goal difference, five; the right outcome alone, three.
            Knock-out ties carry double weight, the Final triple.
          </p>
        </aside>
      </div>
    </section>
  );
}
