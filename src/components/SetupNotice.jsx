// Shown on data-backed pages when Supabase env vars aren't set yet, so the
// app never crashes pre-configuration.
export default function SetupNotice() {
  return (
    <div className="notice">
      <h3>The presses aren't connected yet</h3>
      <p>
        This page reads live data from Supabase. To switch it on, copy <code>.env.example</code> to{' '}
        <code>.env.local</code>, fill in <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code>, then run the migrations in <code>supabase/</code>.
      </p>
      <p className="muted">See the project README for the full setup walk-through.</p>
    </div>
  );
}
