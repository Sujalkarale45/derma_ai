import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { 
  Activity, Menu, X, Globe, Sun, Moon, Contrast,
  User, LogOut, LayoutDashboard, ChevronDown, Bell
} from 'lucide-react';
import Avatar from './ui/Avatar';

const LANGUAGES = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हिं', full: 'हिन्दी' },
  { code: 'mr', label: 'मर', full: 'मराठी' },
];

type Theme = 'light' | 'dark' | 'high-contrast';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('dermaai_theme') as Theme) || 'light';
  });

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function cycleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'high-contrast' : 'light';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('dermaai_theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dermaai_theme', next);
    }
  }

  function changeLanguage(code: string) {
    i18n.changeLanguage(code);
    setLangOpen(false);
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function getDashboardLink() {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 'var(--navbar-height)',
        background: 'var(--bg-card)',
        borderBottom: '0.5px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}>
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Activity size={20} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: 'var(--primary)',
              letterSpacing: '-0.02em',
            }}>
              DERMA<span style={{ color: 'var(--text-primary)' }}> AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { path: '/', label: t('nav.home') },
              { path: '/find-doctor', label: t('nav.findDoctor') },
              { path: '/about', label: t('nav.about') },
            ].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                padding: '0.5rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive(path) ? 600 : 500,
                color: isActive(path) ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive(path) ? 'var(--accent)' : 'transparent',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!isActive(path)) (e.target as HTMLElement).style.background = 'var(--neutral)'; }}
              onMouseLeave={e => { if (!isActive(path)) (e.target as HTMLElement).style.background = 'transparent'; }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

            {/* Language Switcher */}
            <div ref={langRef} style={{ position: 'relative' }}>
              <button onClick={() => setLangOpen(!langOpen)} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.625rem',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}>
                <Globe size={14} />
                {LANGUAGES.find(l => l.code === i18n.language)?.label || 'EN'}
                <ChevronDown size={12} style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: 'var(--bg-card)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-md)',
                  minWidth: '140px',
                  zIndex: 300,
                  overflow: 'hidden',
                }}>
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => changeLanguage(lang.code)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      width: '100%', padding: '0.625rem 0.875rem',
                      background: i18n.language === lang.code ? 'var(--accent)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      color: i18n.language === lang.code ? 'var(--primary)' : 'var(--text-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: i18n.language === lang.code ? 600 : 500,
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}>
                      <span style={{ fontWeight: 700, minWidth: '1.8rem' }}>{lang.label}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lang.full}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button onClick={cycleTheme} title="Toggle theme" style={{
              width: 34, height: 34, borderRadius: 'var(--radius-sm)',
              border: '0.5px solid var(--border)',
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}>
              {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Contrast size={16} />}
            </button>

            {/* Auth / User Menu */}
            {isAuthenticated && user ? (
              <div ref={userRef} style={{ position: 'relative' }}>
                <button onClick={() => setUserOpen(!userOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.25rem 0.5rem 0.25rem 0.25rem',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}>
                  <Avatar name={user.name} src={user.avatar_url} size={28} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} color="var(--text-muted)" style={{ transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                </button>

                {userOpen && (
                  <div style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: 'var(--bg-card)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-md)',
                    minWidth: '200px',
                    zIndex: 300,
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '0.5px solid var(--border)' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</div>
                      <div style={{
                        display: 'inline-block', marginTop: '0.375rem',
                        fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        background: 'var(--accent)', color: 'var(--primary)',
                      }}>
                        {user.role}
                      </div>
                    </div>

                    {[
                      { icon: <LayoutDashboard size={14} />, label: 'Dashboard', path: getDashboardLink() },
                      { icon: <User size={14} />, label: 'Profile', path: `/${user.role}/profile` },
                      { icon: <Bell size={14} />, label: 'Notifications', path: '#' },
                    ].map(item => (
                      <Link key={item.label} to={item.path} onClick={() => setUserOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.625rem 1rem',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        textDecoration: 'none',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--neutral)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <div style={{ borderTop: '0.5px solid var(--border)' }}>
                      <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        width: '100%', padding: '0.625rem 1rem',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--danger)',
                        fontSize: 'var(--font-size-sm)',
                        textAlign: 'left',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-light)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut size={14} />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" style={{
                  padding: '0.4rem 0.875rem',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                }}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" style={{
                  padding: '0.4rem 0.875rem',
                  background: 'var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  boxShadow: 'var(--shadow-primary)',
                }}>
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              className="mobile-only"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: 34, height: 34, display: 'none',
                alignItems: 'center', justifyContent: 'center',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 190,
          background: 'rgba(0,0,0,0.5)',
        }} onClick={() => setMobileOpen(false)}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '80%', maxWidth: '320px', height: '100%',
            background: 'var(--bg-card)',
            padding: '1.5rem',
            animation: 'slideInLeft 0.25s ease',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '4rem' }}>
              {[
                { path: '/', label: t('nav.home') },
                { path: '/find-doctor', label: t('nav.findDoctor') },
                { path: '/about', label: t('nav.about') },
              ].map(({ path, label }) => (
                <Link key={path} to={path} onClick={() => setMobileOpen(false)} style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  textDecoration: 'none',
                  background: isActive(path) ? 'var(--accent)' : 'transparent',
                }}>
                  {label}
                </Link>
              ))}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{
                  flex: 1, padding: '0.625rem', textAlign: 'center',
                  border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none',
                }}>{t('nav.login')}</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} style={{
                  flex: 1, padding: '0.625rem', textAlign: 'center',
                  background: 'var(--primary)', borderRadius: 'var(--radius-sm)',
                  color: 'white', fontWeight: 600, textDecoration: 'none',
                }}>{t('nav.register')}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}
