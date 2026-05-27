import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import { stageLabels } from '../lib/scoring.js';

const fmt = (iso) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const blankMatch = {
  stage: 'group', grp: '', home_team: '', away_team: '', kickoff: '', venue: '', points_multiplier: 1,
};

function ResultEditor({ match, onDone }) {
  const [home, setHome] = useState(match.home_score ?? '');
  const [away, setAway] = useState(match.away_score ?? '');
  const [busy, setBusy] = useState(false);

  const update = async (patch) => {
    setBusy(true);
    await supabase.from('matches').update(patch).eq('id', match.id);
    setBusy(false);
    onDone();
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end' }}>
      <input className="score" inputMode="numeric" value={home} onChange={(e) => setHome(e.target.value.replace(/\D/g, ''))} aria-label="home score" />
      <span className="dash">–</span>
      <input className="score" inputMode="numeric" value={away} onChange={(e) => setAway(e.target.value.replace(/\D/g, ''))} aria-label="away score" />
      <Button
        variant="ink"
        disabled={busy || home === '' || away === ''}
        onClick={() => update({ home_score: Number(home), away_score: Number(away), status: 'finished' })}
        style={{ fontSize: 11, padding: '7px 12px 6px' }}
      >
        Mark final
      </Button>
    </div>
  );
}

export default function Admin() {
  const { isConfigured } = useAuth();
  const [matches, setMatches] = useState([]);
  const [draft, setDraft] = useState(blankMatch);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('matches').select('*').order('kickoff', { ascending: true });
    setMatches(data ?? []);
  }, []);

  useEffect(() => {
    if (isConfigured) load();
  }, [isConfigured, load]);

  if (!isConfigured) {
    return (<><div className="page-head"><h1>The <em>Desk</em></h1></div><SetupNotice /></>);
  }

  const addMatch = async (e) => {
    e.preventDefault();
    setMsg('');
    const { error } = await supabase.from('matches').insert({
      ...draft,
      grp: draft.grp || null,
      kickoff: new Date(draft.kickoff).toISOString(),
      points_multiplier: Number(draft.points_multiplier) || 1,
    });
    if (error) setMsg(error.message);
    else {
      setDraft(blankMatch);
      setMsg('Fixture published.');
      load();
    }
  };

  const reRank = async () => {
    await supabase.rpc('refresh_leaderboard');
    setMsg('Leaderboard re-ranked.');
  };

  // Feature a match as front-page "Match of the Day" (or clear it).
  const toggleFeatured = async (m) => {
    const { error } = await supabase.rpc('set_featured_match', { p_match: m.is_featured ? null : m.id });
    if (error) setMsg(error.message);
    else load();
  };

  return (
    <>
      <div className="page-head">
        <h1>The <em>Editorial</em> Desk</h1>
        <div className="sub">Publish fixtures and file results. Marking a match final scores every forecast automatically.</div>
      </div>

      {msg && <div className="alert ok">{msg}</div>}

      <div className="section-header">
        <h2>Publish a <em>fixture</em></h2>
      </div>
      <form onSubmit={addMatch} style={{ marginBottom: 28 }}>
        <div className="form-row">
          <div className="field">
            <label>Stage</label>
            <select value={draft.stage} onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value }))}>
              {Object.entries(stageLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Group (optional)</label>
            <input value={draft.grp} onChange={(e) => setDraft((d) => ({ ...d, grp: e.target.value }))} placeholder="D" />
          </div>
        </div>
        <div className="form-row">
          <div className="field"><label>Home team</label><input value={draft.home_team} onChange={(e) => setDraft((d) => ({ ...d, home_team: e.target.value }))} required /></div>
          <div className="field"><label>Away team</label><input value={draft.away_team} onChange={(e) => setDraft((d) => ({ ...d, away_team: e.target.value }))} required /></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Kick-off</label><input type="datetime-local" value={draft.kickoff} onChange={(e) => setDraft((d) => ({ ...d, kickoff: e.target.value }))} required /></div>
          <div className="field"><label>Venue</label><input value={draft.venue} onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Points weight</label>
            <select value={draft.points_multiplier} onChange={(e) => setDraft((d) => ({ ...d, points_multiplier: e.target.value }))}>
              <option value={1}>×1 — Group</option>
              <option value={2}>×2 — Knockout</option>
              <option value={3}>×3 — Final</option>
            </select>
          </div>
          <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button type="submit" variant="out">Publish fixture</Button>
          </div>
        </div>
      </form>

      <div className="section-header">
        <h2>Fixtures &amp; <em>results</em></h2>
        <div className="meta"><Button variant="out" onClick={reRank} style={{ fontSize: 11, padding: '7px 12px 6px' }}>Re-rank table</Button></div>
      </div>

      <div className="league">
        <table className="admin-grid">
          <thead>
            <tr><th>Kick-off</th><th>Match</th><th>Stage</th><th>MotD</th><th>Status</th><th style={{ textAlign: 'right' }}>Result / score entry</th></tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id}>
                <td>{fmt(m.kickoff)}</td>
                <td><strong style={{ fontFamily: 'var(--display)' }}>{m.home_team}</strong> v <strong style={{ fontFamily: 'var(--display)' }}>{m.away_team}</strong></td>
                <td>{stageLabels[m.stage]}{m.grp ? ` · ${m.grp}` : ''}{m.points_multiplier > 1 ? ` ·×${m.points_multiplier}` : ''}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => toggleFeatured(m)}
                    title={m.is_featured ? 'Featured — click to clear' : 'Feature as Match of the Day'}
                    style={{
                      border: '1px solid var(--ink)', cursor: 'pointer', padding: '3px 8px',
                      fontFamily: 'var(--label)', fontStyle: 'italic', fontSize: 11,
                      background: m.is_featured ? 'var(--gold)' : 'transparent',
                      color: 'var(--ink)',
                    }}
                  >
                    {m.is_featured ? '★ Featured' : 'Feature'}
                  </button>
                </td>
                <td>
                  {m.status === 'finished'
                    ? <span className="chip scored">Final {m.home_score}–{m.away_score}</span>
                    : m.status === 'live'
                      ? <span className="chip live">Live</span>
                      : <span className="chip open">Scheduled</span>}
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
