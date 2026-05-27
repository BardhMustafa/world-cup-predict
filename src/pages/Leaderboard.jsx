import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import SetupNotice from '../components/SetupNotice.jsx';

const columns = ['Pos.', 'Patriot', 'P', 'X', 'C', 'M', 'Acc.', '±', 'Pts'];

function Move({ movement }) {
  if (movement > 0) return <span className="mv up">▲{movement}</span>;
  if (movement < 0) return <span className="mv down">▼{Math.abs(movement)}</span>;
  return <span className="mv flat">&mdash;</span>;
}

export default function Leaderboard() {
  const { user, isConfigured } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('points', { ascending: false })
      .order('full_name', { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    load();
    // Real-time: any change to predictions or scored matches re-pulls the table.
    const channel = supabase
      .channel('leaderboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [isConfigured, load]);

  if (!isConfigured) {
    return (
      <>
        <div className="page-head"><h1>The <em>Patriots'</em> Table</h1></div>
        <SetupNotice />
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>The <em>Patriots'</em> Table</h1>
        <div className="sub">Ranked by points · updated the instant a result is filed.</div>
      </div>

      {loading ? (
        <p className="muted center" style={{ padding: '40px 0' }}>Tallying the ledger…</p>
      ) : (
        <div className="league">
          <table>
            <thead>
              <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const pos = r.current_rank ?? i + 1;
                const acc = r.played ? Math.round((100 * (r.exact_count + r.correct_count)) / r.played) : 0;
                const isYou = user && r.user_id === user.id;
                const tier = isYou ? 'you' : pos <= 3 ? 'top' : '';
                return (
                  <tr key={r.user_id} className={tier}>
                    <td>{pos}</td>
                    <td>
                      <div className="player">
                        <div className="ini" style={isYou ? { background: 'var(--burgundy)', borderColor: 'var(--burgundy)' } : undefined}>
                          {r.initials || r.full_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="name">{isYou ? 'You' : r.full_name}</div>
                          <div className="city">
                            {[r.city, r.handle && `@${r.handle.replace(/^@/, '')}`].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{r.played}</td>
                    <td>{r.exact_count}</td>
                    <td>{r.correct_count}</td>
                    <td>{r.missed_count}</td>
                    <td>{acc}%</td>
                    <td><Move movement={r.movement} /></td>
                    <td className="pts">{Number(r.points).toLocaleString('en-GB')}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={columns.length} className="muted center" style={{ padding: 24 }}>No patriots ranked yet — be the first to file a forecast.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ padding: '10px 0', fontFamily: 'var(--label)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-soft)' }}>
        P · played &nbsp; X · exact scores &nbsp; C · correct outcomes &nbsp; M · missed &nbsp; Acc. · accuracy &nbsp; Pts · points
      </div>
    </>
  );
}
