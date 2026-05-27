import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';
import SetupNotice from '../components/SetupNotice.jsx';

const columns = [
  ['P', 'played'], ['W', 'won'], ['D', 'drawn'], ['L', 'lost'],
  ['F', 'gf'], ['A', 'ga'], ['GD', 'gd'], ['Pts', 'points'],
];

// Final ranking order within a group: points, then goal difference,
// then goals for, then name.
const rank = (a, b) =>
  b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team);

function GroupCard({ letter, rows }) {
  return (
    <div className="group-card">
      <div className="group-card-head">Group {letter}</div>
      <table className="group-table">
        <thead>
          <tr>
            <th className="pos">#</th>
            <th className="team">Nation</th>
            {columns.map(([label]) => <th key={label}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.sort(rank).map((r, i) => (
            <tr key={r.team} className={i < 2 ? 'qualify' : undefined}>
              <td className="pos">{i + 1}</td>
              <td className="team">
                <Crest team={r.team} code={r.code} />
                <span>{r.team}</span>
              </td>
              {columns.map(([label, key]) => (
                <td key={label} className={label === 'Pts' ? 'pts' : undefined}>
                  {key === 'gd' && r.gd > 0 ? `+${r.gd}` : r[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Groups() {
  const { isConfigured } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('group_standings').select('*');
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    load();
    const channel = supabase
      .channel('standings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [isConfigured, load]);

  const groups = useMemo(() => {
    const by = {};
    rows.forEach((r) => (by[r.grp] ||= []).push(r));
    return Object.entries(by).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  if (!isConfigured) {
    return (<><div className="page-head"><h1>The <em>Groups</em></h1></div><SetupNotice /></>);
  }

  return (
    <>
      <div className="page-head">
        <h1>The <em>Group</em> Tables</h1>
        <div className="sub">Three points a win, one a draw · top two advance · updated as results are filed.</div>
      </div>

      {loading ? (
        <p className="muted center" style={{ padding: '40px 0' }}>Ruling the columns…</p>
      ) : groups.length === 0 ? (
        <div className="notice"><h3>No groups drawn yet</h3><p>Import the fixtures and the group tables will appear here.</p></div>
      ) : (
        <div className="groups-grid">
          {groups.map(([letter, teams]) => (
            <GroupCard key={letter} letter={letter} rows={teams} />
          ))}
        </div>
      )}
    </>
  );
}
