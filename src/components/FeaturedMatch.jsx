import SectionHeader from './SectionHeader.jsx';
import Button from './Button.jsx';
import Crest from './Crest.jsx';
import { stageLabels } from '../lib/scoring.js';

function KosovoCrestBig() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
      <rect width="80" height="80" fill="#244AA5" />
      <path d="M20 42 Q18 34 24 28 Q32 22 40 26 Q50 24 56 30 Q62 38 56 46 Q50 54 40 54 Q28 54 20 46 Z" fill="#D0A650" />
      <g fill="#fff">
        <circle cx="14" cy="12" r="2" /><circle cx="24" cy="9" r="2" /><circle cx="34" cy="8" r="2" />
        <circle cx="46" cy="8" r="2" /><circle cx="56" cy="9" r="2" /><circle cx="66" cy="12" r="2" />
      </g>
    </svg>
  );
}

function AlbaniaCrestBig() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
      <rect width="80" height="80" fill="#E41E20" />
      <path d="M40 22 C36 22 34 24 34 27 C30 28 28 32 30 35 L28 38 L31 40 L29 44 L33 46 L33 50 L40 56 L47 50 L47 46 L51 44 L49 40 L52 38 L50 35 C52 32 50 28 46 27 C46 24 44 22 40 22 Z M36 27 C36 25 38 24 40 24 C42 24 44 25 44 27 L42 28 L40 27 L38 28 Z" fill="#000" />
      <circle cx="40" cy="62" r="3" fill="#000" opacity="0.4" />
    </svg>
  );
}

function Quote() {
  return (
    <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.55, maxWidth: 760, margin: '24px auto 0', textAlign: 'center', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
      &ldquo;The morning's argument resumes. Mark your scoreline before the whistle — the table forgets
      nothing, and rewards the bold over the cautious.&rdquo;
      <span style={{ display: 'block', marginTop: 8, fontFamily: 'var(--label)', fontStyle: 'normal', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--burgundy)' }}>
        &mdash; Arben Kelmendi, Sports Editor
      </span>
    </p>
  );
}

const Ctas = () => (
  <div className="featured-cta">
    <Button variant="ink" to="/fixtures" withArrow>File My Forecast</Button>
    <Button variant="out" to="/leaderboard">View the Table</Button>
  </div>
);

const dt = (iso, opts) => new Date(iso).toLocaleString('en-GB', opts);

// Real "Match of the Day" — the next upcoming fixture. Falls back to the
// editorial Kosovo v Albania sample when no live match is supplied.
export default function FeaturedMatch({ match }) {
  if (!match) {
    return (
      <section>
        <SectionHeader title={<><em>Match</em> of the Day</>} meta={<>Group D &middot; The Balkan Derby<br />Brunswick Stadium, 22:00</>} />
        <div className="featured">
          <div className="featured-banner"><div className="label">A Centerpiece Edition · Saturday 14<sup>th</sup> June</div></div>
          <h3 className="featured-title">Kosovo <em>versus</em> Albania</h3>
          <div className="featured-vs">
            <div className="featured-team"><div className="crest-big"><KosovoCrestBig /></div><div className="name">Kosovo</div></div>
            <div className="featured-versus">v.</div>
            <div className="featured-team"><div className="crest-big"><AlbaniaCrestBig /></div><div className="name">Albania</div></div>
          </div>
          <Quote />
          <Ctas />
        </div>
      </section>
    );
  }

  const stage = stageLabels[match.stage] || 'World Cup';
  const groupBit = match.grp ? ` · Group ${match.grp}` : '';
  const meta = [
    { l: 'Kick-off', v: dt(match.kickoff, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) },
    { l: 'Date', v: dt(match.kickoff, { day: 'numeric', month: 'long' }) },
    { l: 'Venue', v: match.venue || 'To be confirmed' },
    { l: 'Stage', v: `${stage}${groupBit}` },
  ];

  return (
    <section>
      <SectionHeader
        title={<><em>Match</em> of the Day</>}
        meta={<>{stage}{groupBit}<br />{match.venue || 'World Cup 2026'}</>}
      />
      <div className="featured">
        <div className="featured-banner">
          <div className="label">The Next Fixture · {dt(match.kickoff, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>

        <h3 className="featured-title">
          {match.home_team} <em>versus</em> {match.away_team}
        </h3>

        <div className="featured-vs">
          <div className="featured-team">
            <div className="crest-big"><Crest team={match.home_team} code={match.home_code} className="crest-big-svg" /></div>
            <div className="name">{match.home_team}</div>
          </div>
          <div className="featured-versus">v.</div>
          <div className="featured-team">
            <div className="crest-big"><Crest team={match.away_team} code={match.away_code} className="crest-big-svg" /></div>
            <div className="name">{match.away_team}</div>
          </div>
        </div>

        <div className="featured-meta">
          {meta.map(({ l, v }) => (
            <div key={l}><div className="l">{l}</div><div className="v">{v}</div></div>
          ))}
        </div>

        <Quote />
        <Ctas />
      </div>
    </section>
  );
}
