import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';
import { OUTCOME_LABELS } from '../lib/scoring.js';

const fmt = (iso) => new Date(iso).toLocaleDateString('sq', { day: 'numeric', month: 'short' });

export default function Profile() {
  const { user, profile, isConfigured, refreshProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [edit, setEdit] = useState({ handle: '', city: '' });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [{ data: lb }, { data: preds }] = await Promise.all([
      supabase.from('leaderboard').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('predictions').select('*, matches(*)').order('created_at', { ascending: false }),
    ]);
    setStats(lb);
    setHistory(preds ?? []);
  }, [user]);

  useEffect(() => { if (isConfigured) load(); }, [isConfigured, load]);
  useEffect(() => { if (profile) setEdit({ handle: profile.handle ?? '', city: profile.city ?? '' }); }, [profile]);

  const acc = stats?.played ? Math.round((100 * (stats.exact_count + stats.correct_count)) / stats.played) : 0;

  const saveDetails = async (e) => {
    e.preventDefault();
    setBusy(true); setSaved(false);
    await supabase.from('profiles').update({ handle: edit.handle || null, city: edit.city || null }).eq('id', user.id);
    await refreshProfile();
    setBusy(false); setSaved(true);
  };

  return (
    <>
      <div className="page-head">
        <h1>{profile?.full_name || 'Profili'}</h1>
        <div className="sub">
          {[profile?.city, profile?.handle && `@${profile.handle}`].filter(Boolean).join(' · ') || 'Patriot i ligës'}
          {stats?.current_rank ? ` · Renditja #${stats.current_rank}` : ''}
        </div>
      </div>

      <div className="stat-tiles" style={{ marginBottom: 26 }}>
        <div className="card stat-tile"><div className="v text-gold">{Number(stats?.points ?? 0).toLocaleString('en-US')}</div><div className="l">Pikët</div></div>
        <div className="card stat-tile"><div className="v text-green">{stats?.exact_count ?? 0}</div><div className="l">Rezultate sakte</div></div>
        <div className="card stat-tile"><div className="v">{acc}%</div><div className="l">Saktësia</div></div>
        <div className="card stat-tile"><div className="v">{stats?.current_rank ?? '—'}</div><div className="l">Renditja</div></div>
      </div>

      <div className="grid-2">
        <div>
          <h2 className="section-title">Historia e Parashikimeve</h2>
          <div className="card pad">
            {history.length === 0 ? (
              <p className="muted">Ende pa parashikime. <Link to="/fixtures" className="text-green">Shëno kartelën tënde →</Link></p>
            ) : (
              <table className="tbl">
                <thead><tr><th>Ndeshja</th><th>Data</th><th>Ti</th><th>Rez.</th><th>Pikë</th></tr></thead>
                <tbody>
                  {history.map((h) => {
                    const m = h.matches;
                    const fin = m?.status === 'finished' && m.home_score != null;
                    return (
                      <tr key={h.id}>
                        <td><div className="player"><Crest team={m?.home_team} code={m?.home_code} /><span className="nm" style={{ fontSize: 13 }}>{m?.home_team} v {m?.away_team}</span></div></td>
                        <td>{m ? fmt(m.kickoff) : '—'}</td>
                        <td>{h.home_pred}–{h.away_pred}</td>
                        <td>{fin ? `${m.home_score}–${m.away_score}` : '—'}</td>
                        <td className="pts">{h.points ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="section-title">Detajet</h2>
          <form className="card pad" onSubmit={saveDetails}>
            {saved && <div className="alert ok">Detajet u ruajtën.</div>}
            <div className="field">
              <label>Pseudonimi</label>
              <input className="input" value={edit.handle} onChange={(e) => setEdit((s) => ({ ...s, handle: e.target.value }))} />
            </div>
            <div className="field">
              <label>Qyteti</label>
              <input className="input" value={edit.city} onChange={(e) => setEdit((s) => ({ ...s, city: e.target.value }))} />
            </div>
            <button className="btn btn-primary block" type="submit" disabled={busy}>{busy ? 'Duke ruajtur…' : 'Ruaj detajet'}</button>
          </form>
        </div>
      </div>
    </>
  );
}
