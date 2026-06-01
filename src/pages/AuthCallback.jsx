import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import AuthLayout from '../components/AuthLayout.jsx';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handle() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error_description') || params.get('error');

      if (errorParam) {
        setError(errorParam);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { setError(error.message); return; }
        navigate('/ballina', { replace: true });
        return;
      }

      // implicit flow — tokens arrive in the hash; Supabase detects them automatically
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/ballina', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }

    handle();
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
