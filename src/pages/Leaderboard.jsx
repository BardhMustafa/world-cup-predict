import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';

const columns = ['#', 'Përdoruesi', 'L', 'S', 'D', 'G', 'Sak.', '±', 'Pikët'];

function Move({ m }) {
  if (m > 0) return <span className="mv-up">▲{m}</span>;
  if (m < 0) return <span className="mv-down">▼{Math.abs(m)}</span>;
  return <span className="mv-flat">—</span>;
}

export default function Leaderboard() {
  const { user, isConfigured } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('leaderboard').select('*')
      .order('points', { ascending: false }).order('full_name');
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    load();
    const ch = supabase.channel('lb')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [isConfigured, load]);

  return (
    <>
      <div className="page-head">
        <h1>Renditja <span className="g">Kombëtare</span></h1>
        <div className="sub">Renditur sipas pikëve · përditësohet sapo regjistrohet një rezultat.</div>
      </div>

      <div className="card pad">
        {loading ? (
          <p className="muted center" style={{ padding: 30 }}>Duke numëruar…</p>
        ) : (
          <table className="tbl">
            <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => {
                const pos = r.current_rank ?? i + 1;
                const acc = r.played ? Math.round((100 * (r.exact_count + r.correct_count)) / r.played) : 0;
                const you = user && r.user_id === user.id;
                return (
                  <tr key={r.user_id} className={you ? 'you' : pos <= 3 ? 'top' : ''}>
                    <td>{String(pos).padStart(2, '0')}</td>
                    <td>
                      <div className="player">
                        <div className="ini">{r.initials || r.full_name?.slice(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="nm">{you ? 'Ti' : r.full_name}</div>
                          <div className="sub">{[r.city, r.handle && `@${r.handle.replace(/^@/, '')}`].filter(Boolean).join(' · ')}</div>
                        </div>
                      </div>
                    </td>
                    <td>{r.played}</td>
                    <td>{r.exact_count}</td>
                    <td>{r.correct_count}</td>
                    <td>{r.missed_count}</td>
                    <td>{acc}%</td>
                    <td><Move m={r.movement} /></td>
                    <td className="pts">{Number(r.points).toLocaleString('en-US')}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={columns.length} className="muted center" style={{ padding: 24 }}>Ende pa parashikues të renditur — bëhu i pari.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-mute" style={{ fontSize: 12, marginTop: 12 }}>
        L · luajtura &nbsp; S · sakte &nbsp; D · drejt &nbsp; G · gabim &nbsp; Sak. · saktësia
      </p>
    </>
  );
}
