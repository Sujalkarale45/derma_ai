import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import Avatar from '../components/ui/Avatar';
import {
  LayoutDashboard, Upload, Calendar, BookOpen,
  FileText, MapPin, User, Menu, X, Activity
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/patient/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/patient/upload-scan', icon: Upload, labelKey: 'nav.uploadScan' },
  { path: '/patient/appointments', icon: Calendar, labelKey: 'nav.appointments' },
  { path: '/patient/book', icon: BookOpen, labelKey: 'nav.bookAppointment' },
  { path: '/patient/records', icon: FileText, labelKey: 'nav.records' },
  { path: '/patient/locator', icon: MapPin, labelKey: 'nav.locator' },
  { path: '/patient/profile', icon: User, labelKey: 'nav.profile' },
];

export default function PatientLayout() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{
          padding: '1.25rem 1.25rem 1rem',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
            DERMA AI
          </span>
        </div>

        {/* User info */}
        {user && (
          <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Avatar name={user.name} src={user.avatar_url} size={36} />
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Patient</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={16} />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1 }}>
        {/* Top bar with mobile toggle */}
        <div style={{
          position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0,
          height: 'var(--navbar-height)',
          background: 'var(--bg-card)',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0 1.5rem',
          zIndex: 100,
        }}>
          <button
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: 34, height: 34, display: 'none', alignItems: 'center', justifyContent: 'center',
              border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)',
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ flex: 1 }} />
          {user && <Avatar name={user.name} src={user.avatar_url} size={30} />}
        </div>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-sidebar-toggle { display: flex !important; }
          div[style*="left: var(--sidebar-width)"] { left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
