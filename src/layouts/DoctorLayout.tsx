import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import { LayoutDashboard, Calendar, Users, Clock, Video, User, Menu, X, Activity, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/doctor/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/doctor/appointments', icon: Calendar, labelKey: 'nav.appointments' },
  { path: '/doctor/availability', icon: Clock, labelKey: 'nav.availability' },
  { path: '/doctor/profile', icon: User, labelKey: 'nav.profile' },
];

export default function DoctorLayout() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.25rem', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>DERMA AI</span>
        </div>

        {user && (
          <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Avatar name={user.name} src={user.avatar_url} size={36} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{user.name}</p>
                  <ShieldCheck size={12} color="var(--primary)" />
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Dermatologist</p>
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
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)' : 'transparent',
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
          <div style={{ flex: 1 }} />
          {user && <Avatar name={user.name} src={user.avatar_url} size={30} />}
        </div>
        <main className="main-content"><Outlet /></main>
      </div>

      <style>{`@media (max-width: 1024px) { .mobile-sidebar-toggle { display: flex !important; } }`}</style>
    </div>
  );
}
