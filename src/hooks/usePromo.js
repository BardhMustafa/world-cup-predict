import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export default function usePromo(slot) {
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const now = new Date().toISOString();
    supabase
      .from('promotions')
      .select('*')
      .eq('slot', slot)
      .eq('active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPromo(data ?? null));
  }, [slot]);

  return promo;
}
