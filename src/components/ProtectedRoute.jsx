import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Gate for pages that require a signed-in patriot. `adminOnly` further
// restricts to the editorial desk.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="muted center" style={{ padding: '60px 0' }}>Setting the type…</p>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (adminOnly && !profile?.is_admin) {
    return <Navigate to="/" replace />;
  }
  return children;
}
