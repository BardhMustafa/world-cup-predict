import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [exchanged, setExchanged] = useState(false);
  const [error, setError] = useState('');

  // Step 1: exchange the code once
  useEffect(() => {
    async function handle() {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error_description') || params.get('error');
      if (errorParam) { setError(errorParam); return; }

      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { setError(error.message); return; }
      }
      setExchanged(true);
    }
    handle();
  }, []);

  // Step 2: navigate only after AuthContext has picked up the session
  useEffect(() => {
    if (!exchanged || loading) return;
    navigate(user ? '/ballina' : '/login', { replace: true });
  }, [exchanged, loading, user, navigate]);

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
