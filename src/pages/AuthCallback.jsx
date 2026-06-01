import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import AuthLayout from '../components/AuthLayout.jsx';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    if (!code) {
      navigate('/', { replace: true });
      return;
    }

    supabase.auth.exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) setError(error.message);
        else navigate('/ballina', { replace: true });
      });
  }, [navigate]);

  if (error) {
    return (
      <AuthLayout>
        <h2>Diçka shkoi keq</h2>
        <p className="lede">{error}</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <p className="lede">Duke u identifikuar…</p>
    </AuthLayout>
  );
}
