import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';
import { Activity, Eye, EyeOff, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  function fillDemo(r: UserRole) {
    setRole(r);
    setEmail(`${r}@demo.com`);
    setPassword('demo1234');
    clearError();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    const ok = await login(email, password, role);
    if (ok) {
      toast.success(`Welcome back!`);
      navigate(`/${role}/dashboard`);
    }
  }

  const ROLES: { value: UserRole; label: string; desc: string }[] = [
    { value: 'patient', label: t('auth.rolePatient'), desc: 'Upload scans, book appointments' },
    { value: 'doctor', label: t('auth.roleDoctor'), desc: 'Manage appointments, review scans' },
    { value: 'admin', label: t('auth.roleAdmin'), desc: 'Platform management' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'none',
        background: 'linear-gradient(135deg, #042d22 0%, var(--primary) 100%)',
        alignItems: 'center', justifyContent: 'center', padding: '3rem',
      }} className="auth-left">
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '20px',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Activity size={40} color="white" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>
            DERMA AI
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
            AI-powered telemedicine connecting rural patients with expert dermatologists across India.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Logo (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={20} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>
                DERMA AI
              </span>
            </Link>
          </div>

          <h2 style={{ marginBottom: '0.375rem' }}>{t('auth.loginTitle')}</h2>
          <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)' }}>{t('auth.loginSubtitle')}</p>

          {/* Role selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.375rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)' }}>
            {ROLES.map(r => (
              <button key={r.value} onClick={() => setRole(r.value)} style={{
                flex: 1, padding: '0.5rem 0.25rem',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                border: 'none', cursor: 'pointer',
                background: role === r.value ? 'var(--bg-card)' : 'transparent',
                color: role === r.value ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: role === r.value ? 600 : 500,
                fontSize: 'var(--font-size-xs)',
                boxShadow: role === r.value ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
              }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Demo banner */}
          <div style={{
            background: 'var(--warning-light)',
            border: '0.5px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          }}>
            <Info size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: '#7a5200', marginBottom: '0.375rem' }}>
                {t('auth.demoHint')}
              </p>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {(['patient', 'doctor', 'admin'] as UserRole[]).map(r => (
                  <button key={r} onClick={() => fillDemo(r)} style={{
                    padding: '0.2rem 0.625rem',
                    border: '0.5px solid var(--warning)',
                    borderRadius: 'var(--radius-full)',
                    background: 'white', cursor: 'pointer',
                    fontSize: '0.7rem', fontWeight: 600,
                    color: '#7a5200',
                    transition: 'all var(--transition-fast)',
                  }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'var(--danger-light)', border: '0.5px solid var(--danger)',
              borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
              marginBottom: '1.25rem', fontSize: 'var(--font-size-sm)', color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">{t('auth.email')} <span className="required">*</span></label>
              <input
                type="email" required
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">{t('auth.password')} <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex',
                }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <Link to="#" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)' }}>
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              {t('auth.loginBtn')}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              {t('nav.register')}
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left { display: flex !important; } }
      `}</style>
    </div>
  );
}
