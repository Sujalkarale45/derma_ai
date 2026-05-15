import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } from '../../services/authService';
import type { UserRole } from '../../types';
import { Activity, Eye, EyeOff, Microscope, Video, MessageCircle } from 'lucide-react';
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    const ok = await login(email, password, role);
    if (ok) {
      toast.success('Welcome back!');
      navigate(`/${role}/dashboard`);
    }
  }


  const ROLES: { value: UserRole; label: string }[] = [
    { value: 'patient', label: 'Patient' },
    { value: 'doctor',  label: 'Doctor' },
    { value: 'admin',   label: 'Admin' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Left branding panel ── */}
      <div style={{
        flex: 1, display: 'none',
        background: 'linear-gradient(160deg, #042d22 0%, #0f5c40 60%, var(--primary) 100%)',
        alignItems: 'center', justifyContent: 'center', padding: '3rem',
        position: 'relative', overflow: 'hidden',
      }} className="auth-left">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ maxWidth: '380px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '22px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.75rem',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <Activity size={40} color="white" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', marginBottom: '0.875rem', fontSize: '2rem' }}>
            DERMA AI
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.75, fontSize: '0.95rem' }}>
            AI-powered telemedicine connecting rural patients with expert dermatologists across India.
          </p>

          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { icon: <Microscope size={18} color="rgba(255,255,255,0.9)" />, text: 'AI diagnosis with 93%+ accuracy' },
              { icon: <Video       size={18} color="rgba(255,255,255,0.9)" />, text: 'Live video consultations' },
              { icon: <MessageCircle size={18} color="rgba(255,255,255,0.9)" />, text: 'WhatsApp-integrated alerts' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textAlign: 'left' }}>
                <span style={{ flexShrink: 0 }}>{f.icon}</span>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo */}
          <div style={{ marginBottom: '2.5rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
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

          {role === 'admin' && (
            <div style={{
              background: 'rgba(29,158,117,0.08)', border: '0.5px solid rgba(29,158,117,0.35)',
              borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem',
              fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--primary)' }}>Admin access</strong>
              <br />
              Email: <code>{BOOTSTRAP_ADMIN_EMAIL}</code>
              <br />
              Password: <code>{BOOTSTRAP_ADMIN_PASSWORD}</code>
              <br />
              <span style={{ color: 'var(--text-muted)' }}>
                First login creates the account in Supabase. Disable email confirmation under Authentication → Email if login fails.
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'var(--danger-light)', border: '0.5px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 'var(--font-size-sm)', color: 'var(--danger)' }}>
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
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
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

          {/* Demo creds — small & subtle, not a banner */}
          <details style={{ marginTop: '1.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
            <summary style={{ cursor: 'pointer', userSelect: 'none' }}>Demo credentials</summary>
            <div style={{ marginTop: '0.625rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {(['patient','doctor','admin'] as const).map(r => (
                <button key={r} onClick={() => { setRole(r); setEmail(`${r}@demo.com`); setPassword('demo1234'); }} style={{
                  background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.75rem', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)',
                }}>
                  {r}@demo.com / demo1234
                </button>
              ))}
            </div>
          </details>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left { display: flex !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
