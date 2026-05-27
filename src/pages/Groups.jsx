import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';

const cols = [['L', 'played'], ['F', 'won'], ['B', 'drawn'], ['H', 'lost'], ['+', 'gf'], ['−', 'ga'], ['Df', 'gd'], ['Pikë', 'points']];
const rank = (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team);

function GroupCard({ letter, rows }) {
  return (
    <div className="card group-card">
      <div className="gh">Grupi {letter}</div>
      <table className="tbl">
        <thead>
          <tr><th>#</th><th>Skuadra</th>{cols.map(([l]) => <th key={l}>{l}</th>)}</tr>
        </thead>
        <tbody>
          {rows.sort(rank).map((r, i) => (
            <tr key={r.team} className={i < 2 ? 'q' : ''}>
              <td>{i + 1}</td>
              <td><div className="gteam"><Crest team={r.team} code={r.code} size={22} /><span>{r.team}</span></div></td>
              {cols.map(([l, k]) => (
                <td key={l} className={l === 'Pikë' ? 'pts' : undefined}>
                  {k === 'gd' && r.gd > 0 ? `+${r.gd}` : r[k]}
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
    const ch = supabase.channel('gs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, load).subscribe();
    return () => supabase.removeChannel(ch);
  }, [isConfigured, load]);

  const groups = useMemo(() => {
    const by = {};
    rows.forEach((r) => (by[r.grp] ||= []).push(r));
    return Object.entries(by).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <>
      <div className="page-head">
        <h1>Tabelat e <span className="g">Grupeve</span></h1>
        <div className="sub">Tri pikë fitorja, një barazimi · dy të parët kalojnë.</div>
      </div>

      {loading ? (
        <div className="card pad muted center">Duke ngarkuar grupet…</div>
      ) : groups.length === 0 ? (
        <div className="card pad muted center">Ende pa grupe.</div>
      ) : (
        <div className="groups-grid">
          {groups.map(([letter, teams]) => <GroupCard key={letter} letter={letter} rows={teams} />)}
        </div>
      )}
    </>
  );
}
