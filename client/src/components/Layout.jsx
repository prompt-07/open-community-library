import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AccessibilityWidget from './AccessibilityWidget.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const baseNav = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/browse', key: 'nav.browse' },
  { to: '/about', key: 'nav.about' },
];

export default function Layout() {
  const { t } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) => ({
    padding: '0.5rem 0.75rem',
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: 'none',
    color: isActive ? '#fff' : 'var(--color-ink)',
    background: isActive ? 'var(--color-accent)' : 'transparent',
  });

  const items = [...baseNav];
  if (user) {
    items.push({ to: '/cart', key: 'nav.cart' });
    items.push({ to: '/my-reservations', key: 'nav.myReservations' });
    items.push({ to: '/profile', key: 'nav.profile' });
  }
  if (isAdmin) items.push({ to: '/admin', key: 'nav.admin' });

  async function onLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '2px solid var(--color-ink)',
          position: 'sticky',
          top: 0,
          zIndex: 500,
        }}
      >
        <nav
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo-badge.png"
              alt=""
              aria-hidden="true"
              style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '1.4rem',
                color: 'var(--color-accent)',
              }}
            >
              {t('siteName')}
            </span>
          </NavLink>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginLeft: 'auto', alignItems: 'center' }}>
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} style={linkStyle}>
                {t(item.key)}
              </NavLink>
            ))}
            {user ? (
              <button type="button" onClick={onLogout} className="btn btn-secondary" style={{ minHeight: 40 }}>
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <NavLink to="/login" style={linkStyle}>
                  {t('nav.login')}
                </NavLink>
                <NavLink to="/register" style={linkStyle}>
                  {t('nav.register')}
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main style={{ flex: 1, maxWidth: 1120, width: '100%', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <Outlet />
      </main>

      <footer
        style={{
          borderTop: '2px solid var(--color-ink)',
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.9rem',
        }}
      >
        {t('siteName')}
      </footer>

      <AccessibilityWidget />
    </div>
  );
}
