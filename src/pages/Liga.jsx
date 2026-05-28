import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { IconCopy, IconCheck, IconArrow } from '../components/ui/icons.jsx';

const MAX = 10;
const genCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function Liga() {
  const { user, isConfigured } = useAuth();
  const [league, setLeague] = useState(undefined); // undefined=loading, null=no league
  const [members, setMembers] = useState([]);
  const [lbRows, setLbRows] = useState([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadLeague = useCallback(async () => {
    if (!user) { setLeague(null); return; }
    const { data } = await supabase
      .from('private_league_members')
      .select('league_id, joined_at, private_leagues(id, name, owner_id, invite_code)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (data?.private_leagues) {
      const lg = { ...data.private_leagues, is_owner: data.private_leagues.owner_id === user.id };
      setLeague(lg);

      const { data: mbs } = await supabase
        .from('private_league_members')
        .select('user_id, joined_at')
        .eq('league_id', lg.id);

      const ids = (mbs || []).map((m) => m.user_id);
      setMembers(mbs || []);

      if (ids.length > 0) {
        const { data: lb } = await supabase
          .from('leaderboard')
          .select('*')
          .in('user_id', ids)
          .order('points', { ascending: false });
        setLbRows(lb || []);
      }
    } else {
      setLeague(null);
    }
  }, [user]);

  useEffect(() => {
    if (!isConfigured) return;
    loadLeague();
  }, [isConfigured, loadLeague]);

  async function createLeague(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const invite_code = genCode();
    const { data: lg, error: e1 } = await supabase
      .from('private_leagues')
      .insert({ name: name.trim(), owner_id: user.id, invite_code })
      .select()
      .single();
    if (e1) { setError(e1.message); setSaving(false); return; }

    const { error: e2 } = await supabase
      .from('private_league_members')
      .insert({ league_id: lg.id, user_id: user.id });
    if (e2) { setError(e2.message); setSaving(false); return; }

    await loadLeague();
    setSaving(false);
  }

  async function leaveLeague() {
    if (!window.confirm('A jeni i sigurt që doni të largoheni nga liga?')) return;
    setError('');
    const { error: e } = await supabase
      .from('private_league_members')
      .delete()
      .eq('league_id', league.id)
      .eq('user_id', user.id);
    if (e) { setError(e.message); return; }
    setLeague(null);
    setMembers([]);
    setLbRows([]);
  }

  async function deleteLeague() {
    if (!window.confirm('Fshi ligën? Të gjithë anëtarët do të hiqen.')) return;
    setError('');
    const { error: e } = await supabase
      .from('private_leagues')
      .delete()
      .eq('id', league.id);
    if (e) { setError(e.message); return; }
    setLeague(null);
    setMembers([]);
    setLbRows([]);
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/bashkohu/${league.invite_code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!isConfigured || league === undefined) {
    return <div className="card pad muted center" style={{ padding: 40 }}>Duke ngarkuar…</div>;
  }

  if (!user) {
    return (
      <div className="card pad center" style={{ maxWidth: 480, margin: '60px auto' }}>
        <p className="text-dim" style={{ marginBottom: 20 }}>Identifikohu për të krijuar ose parë ligën tënde private.</p>
        <Link to="/login" className="btn btn-primary">Identifikohu <IconArrow size={16} /></Link>
      </div>
    );
  }

  // ── No league yet ─────────────────────────────────────────────
  if (league === null) {
    return (
      <>
        <div className="page-head">
          <h1>Liga <span className="g">Private</span></h1>
          <div className="sub">Krijo ligën tënde dhe fto miqtë me link — maksimum 10 anëtarë.</div>
        </div>

        <div className="card pad" style={{ maxWidth: 480 }}>
          <form onSubmit={createLeague}>
            <div className="field">
              <label>Emri i Ligës</label>
              <input
                className="input"
                placeholder="p.sh. Prishtina All-Stars"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={48}
                required
              />
              <div className="hint">2–48 karaktere</div>
            </div>
            {error && <div className="alert bad">{error}</div>}
            <button className="btn btn-primary block" disabled={saving || name.trim().length < 2}>
              {saving ? 'Duke krijuar…' : 'Krijo Ligën'} {!saving && <IconArrow size={16} />}
            </button>
          </form>
        </div>
      </>
    );
  }

  // ── League view ───────────────────────────────────────────────
  const inviteUrl = `${window.location.origin}/bashkohu/${league.invite_code}`;
  const myRank = lbRows.findIndex((r) => r.user_id === user.id) + 1;

  return (
    <>
      <div className="page-head">
        <h1><span className="g">{league.name}</span></h1>
        <div className="sub">
          Liga private · {members.length}/{MAX} anëtarë
          {league.is_owner && ' · Pronari'}
        </div>
      </div>

      {error && <div className="alert bad" style={{ marginBottom: 14 }}>{error}</div>}

      {/* Invite card */}
      <div className="card pad" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Link i Ftesës</span>
          <span className="pill pill-green">{members.length}/{MAX}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="input" readOnly value={inviteUrl} style={{ flex: 1, fontSize: 13 }} />
          <button className="btn btn-outline sm" onClick={copyLink} style={{ flexShrink: 0 }}>
            {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
            {copied ? 'Kopjuar' : 'Kopjo'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 8 }}>
          Ndaj me miqtë — kushdo që e hap linkun mund të bashkohet.
        </div>
      </div>

      {/* Mini leaderboard */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <h3>Renditja e Ligës</h3>
          {myRank > 0 && <span className="text-gold" style={{ fontWeight: 700, fontFamily: 'var(--mono)' }}>#{myRank}</span>}
        </div>
        {lbRows.length === 0 ? (
          <p className="muted center" style={{ padding: 28 }}>Ende pa pikë — parashiko ndeshjet!</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Lojtari</th>
                <th style={{ textAlign: 'right' }}>Pikët</th>
              </tr>
            </thead>
            <tbody>
              {lbRows.map((r, i) => {
                const you = r.user_id === user.id;
                return (
                  <tr key={r.user_id} className={you ? 'you' : i < 3 ? 'top' : ''}>
                    <td>{String(i + 1).padStart(2, '0')}</td>
                    <td>
                      <div className="player">
                        <div className="ini">{r.initials || r.full_name?.slice(0, 2).toUpperCase()}</div>
                        <span className="nm">{you ? 'Ti' : r.full_name}</span>
                      </div>
                    </td>
                    <td className="pts">{Number(r.points).toLocaleString('en-US')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Actions */}
      {league.is_owner ? (
        <button
          className="btn btn-ghost"
          onClick={deleteLeague}
          style={{ color: 'var(--bad)', borderColor: 'rgba(255,91,110,0.35)' }}
        >
          Fshi Ligën
        </button>
      ) : (
        <button className="btn btn-ghost" onClick={leaveLeague}>
          Largohu nga Liga
        </button>
      )}
    </>
  );
}
