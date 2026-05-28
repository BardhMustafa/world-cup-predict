import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useHomeData from '../hooks/useHomeData.js';
import { useCountdownTo } from '../hooks/useCountdown.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import MatchStepperCard from '../components/MatchStepperCard.jsx';
import Crest from '../components/Crest.jsx';
import PromoCard from '../components/PromoCard.jsx';
import { IconArrow } from '../components/ui/icons.jsx';

const t = (iso) => new Date(iso).toLocaleTimeString('sq', { hour: '2-digit', minute: '2-digit', hour12: false });
const dm = (iso) => new Date(iso).toLocaleDateString('sq', { day: 'numeric', month: 'short' });

function MatchdayStrip({ home, user, myRank }) {
  const c = useCountdownTo(home.nextKickoff);
  const m = home.featured;
  return (
    <div className="md-strip">
      <span className="md-label">Ndeshja e Radhës</span>
      {m && (
        <div className="md-match">
          <Crest team={m.home_team} code={m.home_code} /> {m.home_team}
          <span className="md-time">{t(m.kickoff)}</span>
          {m.away_team} <Crest team={m.away_team} code={m.away_code} />
        </div>
      )}
      <span className="sep" />
      {home.nextKickoff && (
        <span className="md-count">
          {c.d !== '00' ? `${c.d}d ` : ''}{c.h}:{c.m}:{c.s}
        </span>
      )}
      <span className="spacer" />
      {user ? (
        <div className="md-rank"><span className="lbl">Renditja</span><span className="r">#{myRank ?? '—'}</span></div>
      ) : (
        <Link className="btn btn-primary sm" to="/register">Regjistrohu <IconArrow size={14} /></Link>
      )}
    </div>
  );
}

function FixtureTeaser({ m }) {
  return (
    <Link to="/fixtures" className="fx">
      <span className="t">{t(m.kickoff)}</span>
      <span className="tm h"><span className="nm">{m.home_team}</span><Crest team={m.home_team} code={m.home_code} /></span>
      <span className="vs">vs</span>
      <span className="tm"><Crest team={m.away_team} code={m.away_code} /><span className="nm">{m.away_team}</span></span>
      <span className="chev"><IconArrow size={14} /></span>
    </Link>
  );
}

function MiniLeaders({ rows, userId }) {
  if (!rows?.length) return <p className="muted center" style={{ padding: 20 }}>Ende pa parashikues.</p>;
  return (
    <table className="tbl">
      <tbody>
        {rows.slice(0, 6).map((r, i) => {
          const you = userId && r.user_id === userId;
          return (
            <tr key={r.user_id} className={you ? 'you' : i < 3 ? 'top' : ''}>
              <td>{String(r.current_rank ?? i + 1).padStart(2, '0')}</td>
              <td><div className="player"><div className="ini">{r.initials || r.full_name?.slice(0, 2).toUpperCase()}</div><span className="nm">{you ? 'Ti' : r.full_name}</span></div></td>
              <td className="pts">{Number(r.points).toLocaleString('en-US')}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function Dashboard() {
  const home = useHomeData();
  const { user } = useAuth();
  const live = home.configured && !home.loading;
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    if (!live || !user) return;
    supabase.from('leaderboard').select('current_rank').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setMyRank(data?.current_rank ?? null));
  }, [live, user]);

  const featured = live ? home.featured : null;
  const upcoming = live ? (home.upcoming || []).filter((m) => m.id !== featured?.id) : [];

  if (!live) {
    return <div className="card pad muted center">Duke u lidhur me serverin…</div>;
  }

  return (
    <>
      <MatchdayStrip home={home} user={user} myRank={myRank} />

      <div className="grid-2">
        <div className="stack">
          {featured ? <MatchStepperCard match={featured} /> : <div className="card pad muted center">Nuk ka ndeshje të planifikuara.</div>}

          {upcoming.length > 0 && (
            <div className="card">
              <div className="card-head">
                <h3>Ndeshjet e Radhës</h3>
                <Link to="/fixtures" className="link-green">Të gjitha →</Link>
              </div>
              {upcoming.map((m) => <FixtureTeaser key={m.id} m={m} />)}
            </div>
          )}
        </div>

        <div className="stack">
          <div className="card">
            <div className="card-head">
              <h3>Top Parashikuesit</h3>
              <Link to="/renditja" className="link-green">Renditja →</Link>
            </div>
            <div style={{ padding: '4px 8px 12px' }}>
              <MiniLeaders rows={home.leaders} userId={user?.id} />
            </div>
          </div>

          <PromoCard slot="dashboard" />
        </div>
      </div>
    </>
  );
}
