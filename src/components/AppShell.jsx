import { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconHome, IconBall, IconTable, IconGrid, IconUser, IconLogout, IconHelp, IconArrow,
  IconUsers, IconStar, IconMenu, IconClose,
} from './ui/icons.jsx';
import PromoCard from './PromoCard.jsx';

// Primary navigation (Albanian). `auth` items only show when signed in.
const navItems = [
  { to: '/ballina',  label: 'Ballina',        Icon: IconHome,  end: true },
  { to: '/fixtures', label: 'Parashikimet',   Icon: IconBall },
  { to: '/grupet',   label: 'Grupet',         Icon: IconGrid },
  { to: '/renditja', label: 'Liga Kryesore',  Icon: IconTable },
  { to: '/liga',     label: 'Liga Private',   Icon: IconUsers, auth: true },
  { to: '/mvp',      label: 'Zgjidhni MVP',   Icon: IconStar,  auth: true },
  { to: '/profili',  label: 'Profili',        Icon: IconUser,  auth: true },
];

function activeClass({ isActive }) {
  return isActive ? 'active' : undefined;
}

export default function AppShell() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = navItems.filter((i) => !i.auth || user);
  if (profile?.is_admin) items.push({ to: '/admin', label: 'Admin', Icon: IconGrid });

  const initials =
    profile?.initials || profile?.full_name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'KS';

  // Mobile nav drawer + avatar dropdown.
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  // Close everything whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  // Dismiss the avatar dropdown on an outside click.
  useEffect(() => {
    if (!userOpen) return;
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userOpen]);

  const doSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="logo">
          <div className="t">KUPA E BOTËS</div>
          <div className="s">2026</div>
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

        <PromoCard slot="sidebar" compact />

        <div className="foot">
          <a href="#"><IconHelp size={16} /> Ndihma</a>
          {user
            ? <a href="#" onClick={(e) => { e.preventDefault(); doSignOut(); }}><IconLogout size={16} /> Dil</a>
            : <Link to="/login"><IconUser size={16} /> Identifikohu</Link>}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="menu-btn"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>

          <div className="welcome">
            {user ? `Mirësevini, ${profile?.full_name?.split(' ')[0] || ''}` : 'Kupa e Botës 2026'}
          </div>

          <div className="right">
            {user ? (
              <div className="user-menu" ref={userRef}>
                <button
                  className="avatar"
                  title={profile?.full_name}
                  aria-label="Llogaria"
                  aria-expanded={userOpen}
                  onClick={() => setUserOpen((v) => !v)}
                >
                  {initials}
                </button>
                {userOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="ud-head">
                      <div className="ud-name">{profile?.full_name || 'Përdorues'}</div>
                      {user.email && <div className="ud-email">{user.email}</div>}
                    </div>
                    <Link to="/profili" className="ud-item" role="menuitem">
                      <IconUser size={16} /> Profili
                    </Link>
                    {profile?.is_admin && (
                      <Link to="/admin" className="ud-item" role="menuitem">
                        <IconGrid size={16} /> Admin
                      </Link>
                    )}
                    <button className="ud-item" role="menuitem" onClick={doSignOut}>
                      <IconLogout size={16} /> Dil
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline sm">Identifikohu</Link>
            )}
          </div>
        </header>

        {/* mobile dropdown navigation (website style, not a tab bar) */}
        {menuOpen && (
          <nav className="mobile-menu">
            {items.map(({ to, label, Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={activeClass} onClick={() => setMenuOpen(false)}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <div className="mm-sep" />
            {user
              ? <button className="mm-action" onClick={doSignOut}><IconLogout size={18} /> Dil</button>
              : <Link to="/login" className="mm-action" onClick={() => setMenuOpen(false)}><IconUser size={18} /> Identifikohu</Link>}
          </nav>
        )}

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
