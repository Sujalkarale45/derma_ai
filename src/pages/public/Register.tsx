import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types';
import { Activity, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const STATES = ['Maharashtra', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh', 'Rajasthan', 'Delhi', 'Punjab', 'Other'];
const SPECIALISATIONS = ['Dermatology & Venereology', 'Cosmetic Dermatology', 'Pediatric Dermatology', 'Dermato-Oncology', 'General Dermatology'];

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const [role, setRole] = useState<UserRole>('patient');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', dob: '', gender: 'male', village: '', district: '', state: 'Maharashtra',
    aadhaar: '', language_pref: 'en',
    // Doctor fields
    regNumber: '', specialisation: 'General Dermatology', hospital: '', city: '',
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    clearError();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    const extra = role === 'patient'
      ? { phone: form.phone, dob: form.dob, gender: form.gender, village: form.village, district: form.district, state: form.state, language_pref: form.language_pref }
      : { phone: form.phone, reg_number: form.regNumber, specialisation: form.specialisation, hospital: form.hospital, city: form.city, state: form.state };

    const ok = await registerUser(form.name, form.email, form.password, role, extra);
    if (ok) {
      if (role === 'doctor') {
        toast.success('Registration submitted! Awaiting admin approval (1–2 days).');
        navigate('/login');
      } else {
        toast.success('Welcome to DERMA AI!');
        navigate(`/${role}/dashboard`);
      }
    }
  }

  const inputProps = (field: string) => ({
    value: form[field as keyof typeof form],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => update(field, e.target.value),
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', paddingTop: '5rem' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>DERMA AI</span>
          </Link>
        </div>

        <h2 style={{ marginBottom: '0.375rem' }}>{t('auth.registerTitle')}</h2>
        <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)' }}>{t('auth.registerSubtitle')}</p>

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.375rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)' }}>
          {(['patient', 'doctor'] as UserRole[]).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius-sm) - 2px)',
              border: 'none', cursor: 'pointer',
              background: role === r ? 'var(--bg-card)' : 'transparent',
              color: role === r ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: role === r ? 600 : 500,
              fontSize: 'var(--font-size-sm)',
              boxShadow: role === r ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
            }}>
              {r === 'patient' ? 'Patient' : 'Doctor'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'var(--danger-light)', border: '0.5px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: 'var(--font-size-sm)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('auth.name')} <span className="required">*</span></label>
                <input type="text" required className="form-input" placeholder="Riya Sharma" {...inputProps('name')} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('auth.email')} <span className="required">*</span></label>
                <input type="email" required className="form-input" placeholder="you@example.com" {...inputProps('email')} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.password')} <span className="required">*</span></label>
                <input type="password" required className="form-input" placeholder="Min 8 chars" {...inputProps('password')} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="required">*</span></label>
                <input type="password" required className="form-input" placeholder="Repeat" {...inputProps('confirmPassword')} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">{t('auth.phone')}</label>
                <input type="tel" className="form-input" placeholder="+91 9876543210" {...inputProps('phone')} />
              </div>

              {role === 'patient' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('auth.dob')}</label>
                    <input type="date" className="form-input" {...inputProps('dob')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.gender')}</label>
                    <select className="form-input" {...inputProps('gender')}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.village')}</label>
                    <input type="text" className="form-input" placeholder="Satara" {...inputProps('village')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.district')}</label>
                    <input type="text" className="form-input" placeholder="Satara" {...inputProps('district')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">{t('auth.state')}</label>
                    <select className="form-input" {...inputProps('state')}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">{t('auth.language')}</label>
                    <select className="form-input" {...inputProps('language_pref')}>
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="mr">मराठी (Marathi)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">{t('auth.aadhaar')}</label>
                    <input type="text" className="form-input" placeholder="XXXX XXXX XXXX" maxLength={14} {...inputProps('aadhaar')} />
                    <span className="form-error" style={{ color: 'var(--text-muted)' }}>{t('auth.aadhaarHint')}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">{t('auth.regNumber')} <span className="required">*</span></label>
                    <input type="text" required className="form-input" placeholder="MH-DRM-XXXXX" {...inputProps('regNumber')} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">{t('auth.specialisation')}</label>
                    <select className="form-input" {...inputProps('specialisation')}>
                      {SPECIALISATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">{t('auth.hospital')} <span className="required">*</span></label>
                    <input type="text" required className="form-input" placeholder="Apollo Hospital" {...inputProps('hospital')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.city')}</label>
                    <input type="text" className="form-input" placeholder="Pune" {...inputProps('city')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.state')}</label>
                    <select className="form-input" {...inputProps('state')}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1', background: 'var(--warning-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--warning)' }}>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: '#7a5200' }}>⚠ {t('auth.approvalNote')}</p>
                  </div>
                </>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" loading={isLoading} iconRight={<ChevronRight size={16} />}>
              {t('auth.registerBtn')}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          {t('auth.hasAccount')}{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  );
}
