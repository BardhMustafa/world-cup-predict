import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import SetupNotice from '../components/SetupNotice.jsx';

// Kosovo personal identification numbers are 10 digits.
const KOSOVO_ID_RE = /^\d{10}$/;
const HANDLE_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function Register() {
  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '', city: '', handle: '', kosovo_id: '', email: '', password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!isConfigured) {
    return (
      <>
        <div className="page-head"><h1>Enrolment</h1></div>
        <SetupNotice />
      </>
    );
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.full_name.trim().length < 2) e.full_name = 'Please give your name.';
    if (!HANDLE_RE.test(form.handle)) e.handle = '3–20 letters, numbers or underscores.';
    if (!KOSOVO_ID_RE.test(form.kosovo_id)) e.kosovo_id = 'A Kosovo ID is 10 digits.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'A valid e-mail is required.';
    if (form.password.length < 8) e.password = 'At least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);

    const { data, error } = await signUp({
      email: form.email,
      password: form.password,
      metadata: {
        full_name: form.full_name.trim(),
        handle: form.handle.trim(),
        city: form.city.trim(),
        kosovo_id: form.kosovo_id.trim(),
      },
    });
    setBusy(false);

    if (error) {
      // Unique violations on kosovo_id / handle surface here from the trigger.
      setServerError(
        /duplicate|unique|already/i.test(error.message)
          ? 'That e-mail, handle, or Kosovo ID is already enrolled.'
          : error.message
      );
      return;
    }

    // If the project requires e-mail confirmation there is no session yet.
    if (data.session) navigate('/fixtures');
    else setDone(true);
  };

  if (done) {
    return (
      <>
        <div className="page-head"><h1>Check your <em>post</em></h1></div>
        <div className="notice">
          <h3>Almost enrolled</h3>
          <p>We've sent a confirmation link to <strong>{form.email}</strong>. Confirm it, then sign in to file your first forecast.</p>
          <p><Link to="/login" style={{ color: 'var(--burgundy)', textDecoration: 'underline' }}>Proceed to sign in →</Link></p>
        </div>
      </>
    );
  }

  return (
    <form className="slip" onSubmit={onSubmit} noValidate>
      <div className="slip-banner">
        <div className="ko">Form of Enrolment · No. XII</div>
        <h2>Join the League</h2>
      </div>

      {serverError && <div className="alert">{serverError}</div>}

      <div className="field">
        <label htmlFor="full_name">Full name</label>
        <input id="full_name" value={form.full_name} onChange={set('full_name')} autoComplete="name" />
        {errors.full_name && <div className="err">{errors.full_name}</div>}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="handle">Handle</label>
          <input id="handle" value={form.handle} onChange={set('handle')} placeholder="arbenk" />
          {errors.handle && <div className="err">{errors.handle}</div>}
        </div>
        <div className="field">
          <label htmlFor="city">Town</label>
          <input id="city" value={form.city} onChange={set('city')} placeholder="Prishtinë" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="kosovo_id">Kosovo ID number</label>
        <input id="kosovo_id" inputMode="numeric" maxLength={10} value={form.kosovo_id} onChange={set('kosovo_id')} placeholder="10 digits" />
        {errors.kosovo_id
          ? <div className="err">{errors.kosovo_id}</div>
          : <div className="hint">Used once, to guarantee a single entry per patriot. Never shown publicly.</div>}
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        {errors.email && <div className="err">{errors.email}</div>}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
        {errors.password && <div className="err">{errors.password}</div>}
      </div>

      <Button type="submit" variant="ink" className="block" disabled={busy} withArrow>
        {busy ? 'Enrolling…' : 'Enrol — It is Free'}
      </Button>

      <div className="form-note">
        Already a member? <Link to="/login">Sign in here</Link>.
      </div>
    </form>
  );
}
