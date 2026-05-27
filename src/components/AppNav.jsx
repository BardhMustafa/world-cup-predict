import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/fixtures', label: 'Fixtures' },
  { to: '/groups', label: 'Groups' },
  { to: '/leaderboard', label: 'The Table' },
];

// Slim editorial nameplate shown above the data-backed pages.
export default function AppNav() {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="app-nav">
      <Link to="/" className="brand">
        The <em>Prediction</em> Post
      </Link>

      <div className="links">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {l.label}
          </NavLink>
        ))}

        {user ? (
          <>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Profile
            </NavLink>
            {profile?.is_admin && (
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Desk
              </NavLink>
            )}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                signOut();
              }}
            >
              Sign Out
            </a>
          </>
        ) : (
          <>
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Sign In
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Enrol
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
