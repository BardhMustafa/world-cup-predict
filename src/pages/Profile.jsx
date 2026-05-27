import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Crest from '../components/Crest.jsx';
import Button from '../components/Button.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import { OUTCOME_LABELS } from '../lib/scoring.js';

const fmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

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

  useEffect(() => {
    if (isConfigured) load();
  }, [isConfigured, load]);

  useEffect(() => {
    if (profile) setEdit({ handle: profile.handle ?? '', city: profile.city ?? '' });
  }, [profile]);

  if (!isConfigured) {
    return (<><div className="page-head"><h1>Your <em>Desk</em></h1></div><SetupNotice /></>);
  }

  const saveDetails = async (e) => {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    await supabase.from('profiles').update({ handle: edit.handle || null, city: edit.city || null }).eq('id', user.id);
    await refreshProfile();
    setBusy(false);
    setSaved(true);
  };

  const acc = stats?.played ? Math.round((100 * (stats.exact_count + stats.correct_count)) / stats.played) : 0;

  return (
    <>
      <div className="page-head">
        <h1>{profile?.full_name ? <>{profile.full_name}<em>.</em></> : <>Your <em>Desk</em></>}</h1>
        <div className="sub">
          {[profile?.city, profile?.handle && `@${profile.handle}`].filter(Boolean).join(' · ') || 'A patriot of the league'}
          {stats?.current_rank ? ` · Ranked #${stats.current_rank}` : ''}
        </div>
      </div>

      <div className="stat-tiles">
        <div><div className="v">{Number(stats?.points ?? 0).toLocaleString('en-GB')}</div><div className="l">Points</div></div>
        <div><div className="v">{stats?.exact_count ?? 0}</div><div className="l">Exact scores</div></div>
        <div><div className="v">{acc}%</div><div className="l">Accuracy</div></div>
        <div><div className="v">{stats?.current_rank ?? '—'}</div><div className="l">League position</div></div>
      </div>

      <div className="section-header"><h2>Edit your <em>details</em></h2></div>
      <form className="form-row" style={{ maxWidth: 520 }} onSubmit={saveDetails}>
        <div className="field">
          <label htmlFor="p-handle">Handle</label>
          <input id="p-handle" value={edit.handle} onChange={(e) => setEdit((s) => ({ ...s, handle: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="p-city">Town</label>
          <input id="p-city" value={edit.city} onChange={(e) => setEdit((s) => ({ ...s, city: e.target.value }))} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          {saved && <div className="alert ok">Details updated.</div>}
          <Button type="submit" variant="out" disabled={busy}>{busy ? 'Saving…' : 'Save details'}</Button>
        </div>
      </form>

      <div className="section-header"><h2>Your <em>ledger</em></h2></div>
      {history.length === 0 ? (
        <p className="muted">No forecasts filed yet. <a href="/fixtures" style={{ color: 'var(--burgundy)' }}>Mark your card →</a></p>
      ) : (
        <div className="league" style={{ marginBottom: 30 }}>
          <table>
            <thead>
              <tr><th>Match</th><th>Date</th><th>Your call</th><th>Result</th><th>Verdict</th><th>Pts</th></tr>
            </thead>
            <tbody>
              {history.map((h) => {
                const m = h.matches;
                const finished = m?.status === 'finished' && m.home_score != null;
                return (
                  <tr key={h.id}>
                    <td style={{ textAlign: 'left' }}>
                      <div className="player">
                        <Crest team={m?.home_team} code={m?.home_code} />
                        <span className="name" style={{ fontSize: 15 }}>{m?.home_team} v {m?.away_team}</span>
                      </div>
                    </td>
                    <td>{m ? fmt(m.kickoff) : '—'}</td>
                    <td>{h.home_pred}&ndash;{h.away_pred}</td>
                    <td>{finished ? `${m.home_score}–${m.away_score}` : '—'}</td>
                    <td>{h.outcome ? OUTCOME_LABELS[h.outcome] : <span className="muted">pending</span>}</td>
                    <td className="pts">{h.points ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
