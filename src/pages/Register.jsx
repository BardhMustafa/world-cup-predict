import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';
import { IconUser, IconMail, IconId, IconLock, IconArrow, IconGoogle } from '../components/ui/icons.jsx';
import { supabase } from '../lib/supabase.js';

const KOSOVO_ID_RE = /^\d{10}$/;

export default function Register() {
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', kosovo_id: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.full_name.trim().length < 2) e.full_name = 'Shkruaj emrin tënd.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email i pavlefshëm.';
    if (!KOSOVO_ID_RE.test(form.kosovo_id)) e.kosovo_id = 'Numri personal ka 10 shifra.';
    if (form.password.length < 8) e.password = 'Të paktën 8 karaktere.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!isConfigured) { setServerError('Lidhja me serverin nuk është konfiguruar.'); return; }
    if (!validate()) return;
    setBusy(true);
    const handle = form.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
    const { data, error } = await signUp({
      email: form.email,
      password: form.password,
      metadata: { full_name: form.full_name.trim(), kosovo_id: form.kosovo_id.trim(), handle },
    });
    setBusy(false);
    if (error) {
      setServerError(/duplicate|unique|already/i.test(error.message)
        ? 'Ky email ose numër personal është regjistruar tashmë.'
        : error.message);
      return;
    }
    if (data.session) navigate('/');
    else setDone(true);
  };

  const oauth = (provider) => supabase?.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback` } });

  if (done) {
    return (
      <AuthLayout>
        <h2>Kontrollo emailin</h2>
        <p className="lede">Të dërguam një link konfirmimi te <strong>{form.email}</strong>. Konfirmoje, pastaj identifikohu.</p>
        <Link className="btn btn-primary block" to="/login">Vazhdo te identifikimi <IconArrow size={16} /></Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2>Regjistrohu</h2>
      <p className="lede">Krijo llogarinë tënde falas për të filluar parashikimet.</p>

      {serverError && <div className="alert bad">{serverError}</div>}

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label>Emri dhe Mbiemri</label>
          <div className="input-wrap">
            <span className="ic"><IconUser size={18} /></span>
            <input className="input" value={form.full_name} onChange={set('full_name')} placeholder="Filan Fisteku" autoComplete="name" />
          </div>
          {errors.full_name && <div className="err">{errors.full_name}</div>}
        </div>

        <div className="field">
          <label>Email Adresa</label>
          <div className="input-wrap">
            <span className="ic"><IconMail size={18} /></span>
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="emri@shembull.com" autoComplete="email" />
          </div>
          {errors.email && <div className="err">{errors.email}</div>}
        </div>

        <div className="field">
          <label>Numri Personal (ID)</label>
          <div className="input-wrap">
            <span className="ic"><IconId size={18} /></span>
            <input className="input" inputMode="numeric" maxLength={10} value={form.kosovo_id} onChange={set('kosovo_id')} placeholder="1234567890" />
          </div>
          {errors.kosovo_id ? <div className="err">{errors.kosovo_id}</div>
            : <div className="hint">Përdoret një herë për verifikim. Nuk shfaqet publikisht.</div>}
        </div>

        <div className="field">
          <label>Fjalëkalimi</label>
          <div className="input-wrap">
            <span className="ic"><IconLock size={18} /></span>
            <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="new-password" />
          </div>
          {errors.password && <div className="err">{errors.password}</div>}
        </div>

        <button className="btn btn-primary block" type="submit" disabled={busy}>
          {busy ? 'Duke krijuar…' : 'Krijo Llogarinë'} <IconArrow size={16} />
        </button>
      </form>

      <div className="divider-or">Ose vazhdo me</div>
      <div className="social-row">
        <button className="social-btn" onClick={() => oauth('google')}><IconGoogle /> Google</button>
      </div>

      <p className="center" style={{ marginTop: 22, color: 'var(--text-dim)' }}>
        Keni llogari? <Link to="/login" className="text-green" style={{ fontWeight: 700 }}>Identifikohu këtu</Link>
      </p>
    </AuthLayout>
  );
}
