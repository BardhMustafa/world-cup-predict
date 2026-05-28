import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { IconArrow } from '../components/ui/icons.jsx';

export default function JoinLeague() {
  const { code } = useParams();
  const { user, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);   // { id, name, owner_name, member_count }
  const [notFound, setNotFound] = useState(false);
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConfigured) return;
    supabase.rpc('league_info', { p_invite_code: code }).then(({ data }) => {
      if (!data || data.length === 0) { setNotFound(true); return; }
      const row = data[0];
      setInfo(row);

      if (user) {
        supabase
          .from('private_league_members')
          .select('user_id')
          .eq('league_id', row.id)
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data: m }) => { if (m) setAlreadyIn(true); });
      }
    });
  }, [isConfigured, code, user]);

  async function join() {
    if (!user) {
      navigate(`/login?next=/bashkohu/${code}`);
      return;
    }
    setJoining(true);
    setError('');
    const { error: e } = await supabase
      .from('private_league_members')
      .insert({ league_id: info.id, user_id: user.id });
    if (e) { setError(e.message); setJoining(false); return; }
    navigate('/liga');
  }

  const full = info && Number(info.member_count) >= 10;

  if (!isConfigured || (!info && !notFound)) {
    return <div className="card pad muted center" style={{ padding: 40 }}>Duke ngarkuar…</div>;
  }

  if (notFound) {
    return (
      <div className="card pad center" style={{ maxWidth: 480, margin: '60px auto' }}>
        <h2 style={{ marginBottom: 10 }}>Link i pavlefshëm</h2>
        <p className="text-dim">Ky link ftese nuk ekziston ose ka skaduar.</p>
        <Link to="/ballina" className="btn btn-outline" style={{ marginTop: 20 }}>Kthehu në Ballina</Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Bashkohu në <span className="g">{info.name}</span></h1>
        <div className="sub">
          Krijuar nga {info.owner_name} · {info.member_count}/10 anëtarë
        </div>
      </div>

      <div className="card pad" style={{ maxWidth: 480 }}>
        {alreadyIn && (
          <>
            <div className="alert ok" style={{ marginBottom: 16 }}>Tashmë jeni anëtar i kësaj ligë!</div>
            <Link to="/liga" className="btn btn-primary block">
              Shko te Liga ime <IconArrow size={16} />
            </Link>
          </>
        )}

        {!alreadyIn && (
          <>
            {full && <div className="alert bad" style={{ marginBottom: 16 }}>Kjo ligë është e plotë (10/10 anëtarë).</div>}
            {!user && (
              <p className="text-dim" style={{ marginBottom: 18, fontSize: 14 }}>
                Duhet të identifikoheni ose regjistroheni para se të bashkoheni.
              </p>
            )}
            {error && <div className="alert bad" style={{ marginBottom: 14 }}>{error}</div>}
            <button
              className="btn btn-primary block"
              onClick={join}
              disabled={joining || full}
            >
              {!user
                ? 'Identifikohu & Bashkohu'
                : joining
                  ? 'Duke u bashkuar…'
                  : `Bashkohu në "${info.name}"`}
              {!joining && <IconArrow size={16} />}
            </button>
            {!user && (
              <p className="text-dim" style={{ marginTop: 14, fontSize: 13 }}>
                Nuk keni llogari?{' '}
                <Link to={`/register?next=/bashkohu/${code}`} style={{ color: 'var(--secondary)' }}>
                  Regjistrohu
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
