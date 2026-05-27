import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import { IconMail, IconLock, IconArrow, IconGoogle, IconFacebook } from '../components/ui/icons.jsx';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isConfigured) { setError('Lidhja me serverin nuk është konfiguruar.'); return; }
    setBusy(true);
    const { error } = await signIn(form);
    setBusy(false);
    if (error) setError('Email ose fjalëkalim i pasaktë.');
    else navigate(from, { replace: true });
  };

  const oauth = (provider) => supabase?.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });

  return (
    <AuthLayout>
      <h2>Identifikohu</h2>
      <p className="lede">Mirë se u ktheve — vazhdo parashikimet e tua.</p>

      {error && <div className="alert bad">{error}</div>}

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label>Email Adresa</label>
          <div className="input-wrap">
            <span className="ic"><IconMail size={18} /></span>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="emri@shembull.com" autoComplete="email" />
          </div>
        </div>

        <div className="field">
          <label>Fjalëkalimi</label>
          <div className="input-wrap">
            <span className="ic"><IconLock size={18} /></span>
            <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="current-password" />
          </div>
        </div>

        <button className="btn btn-primary block" type="submit" disabled={busy}>
          {busy ? 'Duke hyrë…' : 'Hyr në Llogari'} <IconArrow size={16} />
        </button>
      </form>

      <div className="divider-or">Ose vazhdo me</div>
      <div className="social-row">
        <button className="social-btn" onClick={() => oauth('google')}><IconGoogle /> Google</button>
        <button className="social-btn" onClick={() => oauth('facebook')}><IconFacebook /> Facebook</button>
      </div>

      <p className="center" style={{ marginTop: 22, color: 'var(--text-dim)' }}>
        Nuk keni llogari? <Link to="/register" className="text-green" style={{ fontWeight: 700 }}>Regjistrohu këtu</Link>
      </p>
    </AuthLayout>
  );
}
