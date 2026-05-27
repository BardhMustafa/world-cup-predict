import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import SetupNotice from '../components/SetupNotice.jsx';

export default function Login() {
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/fixtures';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isConfigured) {
    return (
      <>
        <div className="page-head"><h1>Sign In</h1></div>
        <SetupNotice />
      </>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await signIn(form);
    setBusy(false);
    if (error) setError('Those credentials were not recognised.');
    else navigate(from, { replace: true });
  };

  return (
    <form className="slip" onSubmit={onSubmit} noValidate>
      <div className="slip-banner">
        <div className="ko">Members' Entrance</div>
        <h2>Sign In</h2>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={form.password} onChange={set('password')} autoComplete="current-password" />
      </div>

      <Button type="submit" variant="ink" className="block" disabled={busy} withArrow>
        {busy ? 'Signing in…' : 'Enter the League'}
      </Button>

      <div className="form-note">
        Not yet enrolled? <Link to="/register">Join the League</Link>.
      </div>
    </form>
  );
}
