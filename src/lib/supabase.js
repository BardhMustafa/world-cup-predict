import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The app builds and runs without credentials so the editorial front
// page is always viewable; data-backed pages show a "connect Supabase"
// notice until these env vars are set in .env.local.
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, flowType: 'implicit' },
    })
  : null;
