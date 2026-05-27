import { Link } from 'react-router-dom';
import SectionHeader from './SectionHeader.jsx';
import { leaderboard as sample } from '../data/leaderboard.js';

const columns = ['Pos.', 'Patriot', 'P', 'X', 'C', 'M', 'Acc.', '±', 'Pts'];

function Move({ dir, by }) {
  if (dir === 'up') return <span className="mv up">▲{by}</span>;
  if (dir === 'down') return <span className="mv down">▼{by}</span>;
  return <span className="mv flat">&mdash;</span>;
}

// Normalises a live `leaderboard` view row or a sample row into one shape.
function normalise(row, i, live) {
  if (!live) {
    return {
      key: row.pos, pos: row.pos, tier: row.tier, initials: row.initials,
      name: row.name, city: row.city, handle: row.handle,
      played: row.played, exact: row.exact, correct: row.correct, missed: row.missed,
      accuracy: row.accuracy, move: row.move, points: row.points,
    };
  }
  const pos = row.current_rank ?? i + 1;
  const acc = row.played ? Math.round((100 * (row.exact_count + row.correct_count)) / row.played) : 0;
  const m = row.movement;
  return {
    key: row.user_id, pos, tier: pos <= 3 ? 'top' : '',
    initials: row.initials || row.full_name?.slice(0, 2).toUpperCase(),
    name: row.full_name, city: row.city, handle: row.handle ? `@${row.handle.replace(/^@/, '')}` : '',
    played: row.played, exact: row.exact_count, correct: row.correct_count, missed: row.missed_count,
    accuracy: `${acc}%`,
    move: { dir: m > 0 ? 'up' : m < 0 ? 'down' : 'flat', by: Math.abs(m) },
    points: Number(row.points).toLocaleString('en-GB'),
  };
}

// `rows` = live leaderboard view rows (when Supabase is configured). When
// omitted, the editorial sample table is shown.
export default function LeagueTable({ rows, patriots }) {
  const live = Array.isArray(rows);
  const data = (live ? rows : sample).map((r, i) => normalise(r, i, live));

  return (
    <section>
      <SectionHeader
        title={<>The <em>Patriots'</em> Table</>}
        meta={
          <>
            Top of the League
            <br />
            <strong style={{ fontFamily: 'var(--display)' }}>
              {live ? (patriots ?? data.length).toLocaleString('en-GB') : '12,447'}
            </strong>{' '}
            entrants &middot; updated live
          </>
        }
      />

      <div className="league">
        <table>
          <thead>
            <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.key} className={row.tier}>
                <td>{row.pos}</td>
                <td>
                  <div className="player">
                    <div className="ini" style={row.tier === 'you' ? { background: 'var(--burgundy)', borderColor: 'var(--burgundy)' } : undefined}>
                      {row.initials}
                    </div>
                    <div>
                      <div className="name">{row.name}</div>
                      <div className="city">{[row.city, row.handle].filter(Boolean).join(' · ')}</div>
                    </div>
                  </div>
                </td>
                <td>{row.played}</td>
                <td>{row.exact}</td>
                <td>{row.correct}</td>
                <td>{row.missed}</td>
                <td>{row.accuracy}</td>
                <td><Move {...row.move} /></td>
                <td className="pts">{row.points}</td>
              </tr>
            ))}
            {live && data.length === 0 && (
              <tr><td colSpan={columns.length} className="muted center" style={{ padding: 24 }}>
                The league is open — no patriots ranked yet. Be the first.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontFamily: 'var(--label)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-soft)' }}>
        <span>P · played &nbsp; X · exact scores &nbsp; C · correct outcomes &nbsp; M · missed &nbsp; Acc. · accuracy &nbsp; Pts · points</span>
        <Link to="/leaderboard" style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>See the full table &rarr;</Link>
      </div>
    </section>
  );
}
