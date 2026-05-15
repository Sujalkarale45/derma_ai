import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{
      background: 'var(--secondary)',
      color: 'rgba(255,255,255,0.85)',
      paddingTop: '3.5rem',
      paddingBottom: '1.5rem',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Activity size={20} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
                DERMA AI
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', marginBottom: '1rem' }}>
              {t('landing.disclaimer')}
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Made with <Heart size={12} fill="var(--danger)" color="var(--danger)" /> for rural India
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Platform
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { path: '/', label: t('nav.home') },
                { path: '/find-doctor', label: t('nav.findDoctor') },
                { path: '/about', label: t('nav.about') },
                { path: '/register', label: t('nav.register') },
              ].map(({ path, label }) => (
                <Link key={path} to={path} style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: 'var(--font-size-sm)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* For Patients */}
          <div>
            <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              For Patients
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {['AI Skin Scan', 'Book Appointment', 'Find Doctors', 'My Records', 'Video Consultation'].map(label => (
                <Link key={label} to="/login" style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: 'var(--font-size-sm)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h5 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Contact
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: <Mail size={14} />, text: 'support@dermaai.app', href: 'mailto:support@dermaai.app' },
                { icon: <Phone size={14} />, text: '+91 74999 19976 (WhatsApp)', href: 'https://wa.me/917499919976?text=Hi%20DERMA%20AI%2C%20I%20have%20a%20question!' },
                { icon: <MapPin size={14} />, text: 'Nagpur, Maharashtra, India', href: undefined },
              ].map(({ icon, text, href }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                  <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                    >{text}</a>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.65)' }}>{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '0.5px solid rgba(255,255,255,0.1)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'var(--font-size-xs)' }}>
            {t('landing.copyright')}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'var(--font-size-xs)' }}>
            Powered by AI · Built for Bharat
          </p>
        </div>
      </div>
    </footer>
  );
}
