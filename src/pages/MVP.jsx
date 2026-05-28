import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MVP_PLAYERS } from '../data/mvp_players.js';
import { IconStar, IconArrow } from '../components/ui/icons.jsx';

// 1 hour before the tournament's opening kick-off at Estadio Azteca.
// Update if the schedule changes.
const MVP_DEADLINE = new Date('2026-06-12T00:00:00Z');

function useDeadlineCountdown() {
  const calc = () => {
    const diff = MVP_DEADLINE - Date.now();
    if (diff <= 0) return null;
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return { d, h, m, s: sec };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const pad = (n) => String(n).padStart(2, '0');

export default function MVP() {
  const { user, isConfigured } = useAuth();
  const countdown = useDeadlineCountdown();
  const locked = !countdown; // deadline passed
  const [pick, setPick] = useState(null);   // saved pick from DB
  const [selected, setSelected] = useState(''); // current UI selection
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const loadPick = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('mvp_picks')
      .select('player_name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setPick(data.player_name);
      setSelected(data.player_name);
    }
  }, [user]);

  useEffect(() => {
    if (!isConfigured) return;
    loadPick();
  }, [isConfigured, loadPick]);

  async function savePick() {
    if (!selected || !user) return;
    setSaving(true);
    setError('');
    setSaved(false);

    const { error: e } = pick
      ? await supabase.from('mvp_picks').update({ player_name: selected }).eq('user_id', user.id)
      : await supabase.from('mvp_picks').insert({ user_id: user.id, player_name: selected });

    if (e) { setError(e.message); setSaving(false); return; }
    setPick(selected);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  const changed = selected && selected !== pick;

  return (
    <>
      <div className="page-head">
        <h1>Zgjidh <span className="g">MVP-në</span></h1>
        <div className="sub">Kush do të fitojë Topin e Artë? Parashikuesi i saktë fiton 100€.</div>
      </div>

      {/* Prize + deadline */}
      <div className="mvp-meta card pad" style={{ marginBottom: 22 }}>
        <div className="mvp-meta-inner">
          <div className="mvp-prize">
            <div className="mvp-prize-amount">100€</div>
            <div className="mvp-prize-label">Shpërblimi</div>
          </div>
          <div className="mvp-sep" />
          {locked ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--bad)', fontSize: 15 }}>Afati ka skaduar</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>Zgjedhjet janë bllokuar</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="mvp-countdown">
                {countdown.d > 0 && <span>{countdown.d}<em>d</em></span>}
                <span>{pad(countdown.h)}<em>h</em></span>
                <span>{pad(countdown.m)}<em>m</em></span>
                <span>{pad(countdown.s)}<em>s</em></span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                deri në mbyllje
              </div>
            </div>
          )}
          {pick && (
            <>
              <div className="mvp-sep" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 13 }}>Zgjedhja Jote</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginTop: 4 }}>{pick}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Auth gate */}
      {!user && (
        <div className="card pad center" style={{ marginBottom: 22 }}>
          <p className="text-dim" style={{ marginBottom: 16 }}>Identifikohu për të bërë zgjedhjen tënde.</p>
          <Link to="/login" className="btn btn-primary">Identifikohu <IconArrow size={16} /></Link>
        </div>
      )}

      {/* Alerts */}
      {error && <div className="alert bad" style={{ marginBottom: 14 }}>{error}</div>}
      {saved && <div className="alert ok" style={{ marginBottom: 14 }}>Zgjedhja u ruajt!</div>}

      {/* Player grid */}
      <div className="mvp-grid">
        {MVP_PLAYERS.map((p) => {
          const isSelected = selected === p.name;
          return (
            <button
              key={p.name}
              className={`mvp-card${isSelected ? ' mvp-card--selected' : ''}`}
              onClick={() => { if (!locked || !user) setSelected(isSelected ? '' : p.name); }}
              disabled={locked && !!user}
            >
              <div className="mvp-card-name">{p.name}</div>
              <div className="mvp-card-meta">
                <span>{p.country}</span>
                <span className="mvp-dot">·</span>
                <span>{p.club}</span>
              </div>
              {isSelected && <IconStar size={14} className="mvp-star" />}
            </button>
          );
        })}
      </div>

      {/* Save button */}
      {user && !locked && (changed || !pick) && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            style={{ minWidth: 220 }}
            onClick={savePick}
            disabled={!selected || saving}
          >
            {saving ? 'Duke ruajtur…' : pick ? 'Ndrysho Zgjedhjen' : 'Konfirmo Zgjedhjen'}
            {!saving && <IconArrow size={16} />}
          </button>
        </div>
      )}

      <p className="text-mute" style={{ fontSize: 12, marginTop: 24, textAlign: 'center' }}>
        Parashikuesi i saktë fiton 100€ · zgjedhjet mbyllen 1 orë para lojës hapëse.
      </p>
    </>
  );
}
