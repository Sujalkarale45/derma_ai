import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import { LayoutDashboard, Users, UserCheck, Calendar, BarChart3, Settings, Menu, X, Activity, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/admin/users', icon: Users, labelKey: 'nav.users' },
  { path: '/admin/doctors', icon: UserCheck, labelKey: 'nav.doctors' },
  { path: '/admin/appointments', icon: Calendar, labelKey: 'nav.appointments' },
  { path: '/admin/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
  { path: '/admin/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: 'var(--secondary)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: 'white' }}>DERMA AI</span>
        </div>

        {user && (
          <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'white' }}>{user.name}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.55)' }}>Administrator</p>
              </div>
            </div>
          </div>
        )}

        <nav style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
            <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)',
                textDecoration: 'none', fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={16} />{t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1 }}>
        <div style={{ position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0, height: 'var(--navbar-height)', background: 'var(--bg-card)', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', zIndex: 100, gap: '1rem' }}>
          <button className="mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ width: 34, height: 34, display: 'none', alignItems: 'center', justifyContent: 'center', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Console</span>
          <div style={{ flex: 1 }} />
        </div>
        <main className="main-content"><Outlet /></main>
      </div>

      <style>{`@media (max-width: 1024px) { .mobile-sidebar-toggle { display: flex !important; } }`}</style>
    </div>
  );
}
