import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconHome, IconBall, IconTable, IconGrid, IconUser, IconBell, IconLogout, IconHelp, IconArrow,
} from './ui/icons.jsx';

// Primary navigation (Albanian). `auth` items only show when signed in.
const navItems = [
  { to: '/ballina', label: 'Ballina', Icon: IconHome, end: true },
  { to: '/fixtures', label: 'Parashikimet', Icon: IconBall },
  { to: '/grupet', label: 'Grupet', Icon: IconGrid },
  { to: '/renditja', label: 'Renditja', Icon: IconTable },
  { to: '/profili', label: 'Profili', Icon: IconUser, auth: true },
];

function activeClass({ isActive }) {
  return isActive ? 'active' : undefined;
}

export default function AppShell() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const items = navItems.filter((i) => !i.auth || user);
  if (profile?.is_admin) items.push({ to: '/admin', label: 'Admin', Icon: IconGrid });

  const initials =
    profile?.initials || profile?.full_name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'KS';

  const doSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="logo">
          <div className="t">KOSOVA KUP</div>
          <div className="s">World Cup Edition</div>
        </Link>

        <nav className="nav">
          {items.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={activeClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="spacer" />

        {user ? (
          <Link to="/fixtures" className="btn btn-primary block">Parashiko Tash</Link>
        ) : (
          <Link to="/register" className="btn btn-primary block">Regjistrohu <IconArrow size={16} /></Link>
        )}

        <div className="foot">
          <a href="#"><IconHelp size={16} /> Ndihma</a>
          {user
            ? <a href="#" onClick={(e) => { e.preventDefault(); doSignOut(); }}><IconLogout size={16} /> Dil</a>
            : <Link to="/login"><IconUser size={16} /> Identifikohu</Link>}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="welcome">
            {user ? `Mirësevini, ${profile?.full_name?.split(' ')[0] || ''}` : 'Kosova Kup · World Cup 2026'}
          </div>
          <div className="right">
            <button className="icon-btn" aria-label="Njoftimet"><IconBell size={18} /></button>
            {user
              ? <div className="avatar" title={profile?.full_name}>{initials}</div>
              : <Link to="/login" className="btn btn-outline sm">Identifikohu</Link>}
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>

      {/* mobile bottom nav */}
      <nav className="mnav">
        {items.slice(0, 5).map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={activeClass}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
