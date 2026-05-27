import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { stageLabels } from '../lib/scoring.js';

const fmt = (iso) => new Date(iso).toLocaleString('sq', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const blank = { stage: 'group', grp: '', home_team: '', away_team: '', kickoff: '', venue: '', points_multiplier: 1 };

function ResultEditor({ match, onDone }) {
  const [home, setHome] = useState(match.home_score ?? '');
  const [away, setAway] = useState(match.away_score ?? '');
  const [busy, setBusy] = useState(false);
  const update = async () => {
    setBusy(true);
    await supabase.from('matches').update({ home_score: Number(home), away_score: Number(away), status: 'finished' }).eq('id', match.id);
    setBusy(false); onDone();
  };
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
      <input className="input" style={{ width: 48, textAlign: 'center', padding: 8 }} value={home} onChange={(e) => setHome(e.target.value.replace(/\D/g, ''))} />
      <span className="text-mute">–</span>
      <input className="input" style={{ width: 48, textAlign: 'center', padding: 8 }} value={away} onChange={(e) => setAway(e.target.value.replace(/\D/g, ''))} />
      <button className="btn btn-primary sm" disabled={busy || home === '' || away === ''} onClick={update}>Përfundo</button>
    </div>
  );
}

export default function Admin() {
  const { isConfigured } = useAuth();
  const [matches, setMatches] = useState([]);
  const [draft, setDraft] = useState(blank);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('matches').select('*').order('kickoff', { ascending: true });
    setMatches(data ?? []);
  }, []);
  useEffect(() => { if (isConfigured) load(); }, [isConfigured, load]);

  const addMatch = async (e) => {
    e.preventDefault(); setMsg('');
    const { error } = await supabase.from('matches').insert({
      ...draft, grp: draft.grp || null, kickoff: new Date(draft.kickoff).toISOString(), points_multiplier: Number(draft.points_multiplier) || 1,
    });
    if (error) setMsg(error.message); else { setDraft(blank); setMsg('Ndeshja u publikua.'); load(); }
  };
  const reRank = async () => { await supabase.rpc('refresh_leaderboard'); setMsg('Renditja u rifreskua.'); };
  const toggleFeatured = async (m) => {
    const { error } = await supabase.rpc('set_featured_match', { p_match: m.is_featured ? null : m.id });
    if (error) setMsg(error.message); else load();
  };

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <>
      <div className="page-head">
        <h1>Paneli i <span className="g">Adminit</span></h1>
        <div className="sub">Publiko ndeshje dhe regjistro rezultate. Përfundimi llogarit pikët automatikisht.</div>
      </div>

      {msg && <div className="alert ok">{msg}</div>}

      <h2 className="section-title">Publiko një ndeshje</h2>
      <form className="card pad" onSubmit={addMatch} style={{ marginBottom: 28 }}>
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          <div className="field"><label>Faza</label>
            <select className="input" value={draft.stage} onChange={set('stage')}>
              {Object.entries(stageLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field"><label>Grupi</label><input className="input" value={draft.grp} onChange={set('grp')} placeholder="A" /></div>
          <div className="field"><label>Vendasit</label><input className="input" value={draft.home_team} onChange={set('home_team')} required /></div>
          <div className="field"><label>Mysafirët</label><input className="input" value={draft.away_team} onChange={set('away_team')} required /></div>
          <div className="field"><label>Ora</label><input className="input" type="datetime-local" value={draft.kickoff} onChange={set('kickoff')} required /></div>
          <div className="field"><label>Stadiumi</label><input className="input" value={draft.venue} onChange={set('venue')} /></div>
          <div className="field"><label>Pesha e pikëve</label>
            <select className="input" value={draft.points_multiplier} onChange={set('points_multiplier')}>
              <option value={1}>×1 — Grupet</option><option value={2}>×2 — Eliminimet</option><option value={3}>×3 — Finalja</option>
            </select>
          </div>
        </div>
        <button className="btn btn-blue" type="submit">Publiko ndeshjen</button>
      </form>

      <div className="row-between" style={{ marginBottom: 14 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Ndeshjet &amp; rezultatet</h2>
        <button className="btn btn-outline sm" onClick={reRank}>Rifresko renditjen</button>
      </div>

      <div className="card pad" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th>Ora</th><th>Ndeshja</th><th>Faza</th><th>MotD</th><th>Statusi</th><th style={{ textAlign: 'right' }}>Rezultati</th></tr></thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td style={{ textAlign: 'left' }}>{fmt(m.kickoff)}</td>
                <td><strong>{m.home_team}</strong> v <strong>{m.away_team}</strong></td>
                <td>{stageLabels[m.stage]}{m.grp ? ` · ${m.grp}` : ''}{m.points_multiplier > 1 ? ` ·×${m.points_multiplier}` : ''}</td>
                <td>
                  <button className={`btn sm ${m.is_featured ? 'btn-primary' : 'btn-ghost'}`} onClick={() => toggleFeatured(m)}>
                    {m.is_featured ? '★' : 'Veço'}
                  </button>
                </td>
                <td>
                  {m.status === 'finished' ? <span className="pill pill-gold">{m.home_score}–{m.away_score}</span>
                    : m.status === 'live' ? <span className="pill pill-green">Live</span>
                    : <span className="pill pill-mute">Planifikuar</span>}
                </td>
                <td style={{ textAlign: 'right' }}><ResultEditor match={m} onDone={load} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
