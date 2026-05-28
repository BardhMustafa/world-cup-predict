import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { stageLabels } from '../lib/scoring.js';

const fmt = (iso) => new Date(iso).toLocaleString('sq', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString('sq', { day: '2-digit', month: 'short', year: 'numeric' });

const SLOTS = [
  { value: 'dashboard',   label: 'Ballina (e loguar)' },
  { value: 'leaderboard', label: 'Renditja' },
  { value: 'predict',     label: 'Parashikimet' },
  { value: 'sidebar',     label: 'Shiriti anësor' },
  { value: 'home',        label: 'Faqja kryesore' },
];

const promoBlank = { slot: 'dashboard', title: '', body: '', cta_label: '', cta_url: '', image_url: '', starts_at: '', ends_at: '' };

function promoStatus(p) {
  const now = new Date();
  if (!p.active) return { label: 'Çaktivizuar', cls: 'pill-mute' };
  if (new Date(p.ends_at) < now) return { label: 'Skaduar', cls: 'pill-mute' };
  if (new Date(p.starts_at) > now) return { label: 'Planifikuar', cls: 'pill-blue' };
  return { label: 'Aktiv', cls: 'pill-green' };
}

function PromosSection() {
  const [promos, setPromos] = useState([]);
  const [draft, setDraft] = useState(promoBlank);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    setPromos(data ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const addPromo = async (e) => {
    e.preventDefault(); setMsg('');
    const { error } = await supabase.from('promotions').insert({
      ...draft,
      starts_at: new Date(draft.starts_at).toISOString(),
      ends_at:   new Date(draft.ends_at).toISOString(),
      body:      draft.body      || null,
      cta_label: draft.cta_label || null,
      cta_url:   draft.cta_url   || null,
      image_url: draft.image_url || null,
    });
    if (error) setMsg(error.message);
    else { setDraft(promoBlank); setMsg('Promovimi u publikua.'); load(); }
  };

  const toggleActive = async (p) => {
    await supabase.from('promotions').update({ active: !p.active }).eq('id', p.id);
    load();
  };

  const deletePromo = async (id) => {
    await supabase.from('promotions').delete().eq('id', id);
    load();
  };

  return (
    <>
      <h2 className="section-title" style={{ marginTop: 40 }}>Promovimet / Spotet reklamuese</h2>

      {msg && <div className="alert ok" style={{ marginBottom: 16 }}>{msg}</div>}

      <form className="card pad" onSubmit={addPromo} style={{ marginBottom: 28 }}>
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          <div className="field">
            <label>Spoti</label>
            <select className="input" value={draft.slot} onChange={set('slot')}>
              {SLOTS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Titulli</label>
            <input className="input" value={draft.title} onChange={set('title')} required placeholder="p.sh. Telekomi Sponsor Zyrtar" />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Përshkrimi (opsional)</label>
            <input className="input" value={draft.body} onChange={set('body')} placeholder="Fjali e shkurtër rreth promovimit" />
          </div>
          <div className="field">
            <label>Etiketa e butonit (opsional)</label>
            <input className="input" value={draft.cta_label} onChange={set('cta_label')} placeholder="Mëso më shumë" />
          </div>
          <div className="field">
            <label>URL e butonit (opsional)</label>
            <input className="input" type="url" value={draft.cta_url} onChange={set('cta_url')} placeholder="https://…" />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>URL e logos (opsional)</label>
            <input className="input" type="url" value={draft.image_url} onChange={set('image_url')} placeholder="https://…/logo.png" />
          </div>
          <div className="field">
            <label>Fillon më</label>
            <input className="input" type="datetime-local" value={draft.starts_at} onChange={set('starts_at')} required />
          </div>
          <div className="field">
            <label>Mbaron më</label>
            <input className="input" type="datetime-local" value={draft.ends_at} onChange={set('ends_at')} required />
          </div>
        </div>
        <button className="btn btn-blue" type="submit">Publiko promovimin</button>
      </form>

      <div className="card pad" style={{ overflowX: 'auto' }}>
        {promos.length === 0 ? (
          <p className="muted center" style={{ padding: 24 }}>Ende pa promovime.</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Titulli</th>
                <th>Spoti</th>
                <th>Periudha</th>
                <th>Statusi</th>
                <th style={{ textAlign: 'right' }}>Imp.</th>
                <th style={{ textAlign: 'right' }}>Klikime</th>
                <th style={{ textAlign: 'right' }}>CTR</th>
                <th style={{ textAlign: 'right' }}>Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const status = promoStatus(p);
                const slotLabel = SLOTS.find((s) => s.value === p.slot)?.label ?? p.slot;
                const ctr = p.impression_count > 0
                  ? ((p.click_count / p.impression_count) * 100).toFixed(1) + '%'
                  : '—';
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                      {p.body && <div className="text-mute" style={{ fontSize: 12, marginTop: 2 }}>{p.body}</div>}
                    </td>
                    <td><span className="pill pill-mute">{slotLabel}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                      {fmtDate(p.starts_at)} → {fmtDate(p.ends_at)}
                    </td>
                    <td><span className={`pill ${status.cls}`}>{status.label}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{(p.impression_count ?? 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{(p.click_count ?? 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: 'var(--secondary)' }}>{ctr}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          className={`btn sm ${p.active ? 'btn-outline' : 'btn-ghost'}`}
                          onClick={() => toggleActive(p)}
                        >
                          {p.active ? 'Çaktivizo' : 'Aktivizo'}
                        </button>
                        <button
                          className="btn sm btn-ghost"
                          style={{ color: 'var(--bad)' }}
                          onClick={() => deletePromo(p.id)}
                        >
                          Fshi
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
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

      <PromosSection />
    </>
  );
}
