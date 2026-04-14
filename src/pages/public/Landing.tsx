import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Upload, Brain, Stethoscope, Video,
  Star, MapPin, CheckCircle, Shield,
  Globe, Users, Scan, Building2,
  ArrowRight, ChevronRight, Heart
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/doctorService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

// ── Animated Counter ──
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1800;
          const step = Math.ceil(target / (duration / 16));
          const timer = setInterval(() => {
            start = Math.min(start + step, target);
            setCount(start);
            if (start >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const CYCLING_HEADLINES = [
  { line1: 'Skin Care,', line2: 'Anywhere.' },
  { line1: 'त्वचा की देखभाल,', line2: 'कहीं भी।' },
  { line1: 'त्वचा काळजी,', line2: 'कुठेही।' },
];

const TESTIMONIALS = [
  {
    name: 'Anita Pawar',
    location: 'Satara, Maharashtra',
    rating: 5,
    text: 'I live in a village 40km from the nearest city. DERMA AI helped me get an AI scan at home and book a video consultation with a Pune doctor. The doctor diagnosed a benign keratosis — I was so relieved!',
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    name: 'Ramesh Jadhav',
    location: 'Solapur, Maharashtra',
    rating: 5,
    text: 'My father had a suspicious mole. The AI flagged it as high risk and we got an appointment the next day. Early detection of BCC. So grateful for this service.',
    avatar: 'https://i.pravatar.cc/80?img=51',
  },
  {
    name: 'Kavitha Nair',
    location: 'Nashik, Maharashtra',
    rating: 4,
    text: 'The multilingual support in Marathi is wonderful for my elderly mother who cannot read English. The doctors are very professional and the AI reports are easy to understand.',
    avatar: 'https://i.pravatar.cc/80?img=44',
  },
];

const FEATURES = [
  { icon: <Brain size={24} color="var(--primary)" />, title: 'AI Diagnosis', desc: 'Advanced hybrid model trained on 10,000+ dermoscopic images with 94.6% AUROC.' },
  { icon: <Video size={24} color="var(--primary)" />, title: 'Online Booking', desc: 'Schedule appointments in minutes and receive Google Meet links automatically.' },
  { icon: <MapPin size={24} color="var(--primary)" />, title: 'Rural Access', desc: 'Works on low-bandwidth connections. Available in Hindi and Marathi.' },
  { icon: <Globe size={24} color="var(--primary)" />, title: 'Multilingual', desc: 'Full English, Hindi and Marathi support — your language, your care.' },
  { icon: <Shield size={24} color="var(--primary)" />, title: 'Secure Records', desc: 'Your health data encrypted and accessible only by you and your doctor.' },
  { icon: <CheckCircle size={24} color="var(--primary)" />, title: 'Verified Doctors', desc: 'Every dermatologist is manually verified by our medical team.' },
];

const STEPS = [
  { icon: <Upload size={28} color="var(--primary)" />, title: 'Upload Photo', desc: 'Take a clear photo of your skin lesion and upload it securely from anywhere.' },
  { icon: <Brain size={28} color="var(--primary)" />, title: 'AI Analysis', desc: 'Our hybrid AI model analyzes the image and provides instant classification.' },
  { icon: <Stethoscope size={28} color="var(--primary)" />, title: 'Doctor Review', desc: 'A verified dermatologist reviews your AI report and provides guidance.' },
  { icon: <Video size={28} color="var(--primary)" />, title: 'Video Consultation', desc: 'Connect face-to-face with your doctor via Google Meet.' },
];

export default function Landing() {
  const { t } = useTranslation();
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeadlineIdx(i => (i + 1) % CYCLING_HEADLINES.length), 3000);
    return () => clearInterval(timer);
  }, []);

  const headline = CYCLING_HEADLINES[headlineIdx];

  return (
    <div>
      {/* ══ HERO ══ */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #042d22 0%, #085041 40%, #1D9E75 100%)',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '3rem 1.5rem' }}>
          <div style={{ maxWidth: '680px' }}>
            {/* Tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: '0.5px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '0.375rem 0.875rem',
              marginBottom: '1.5rem',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6befc0', display: 'inline-block', animation: 'pulse-ring 2s infinite' }} />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                AI-Powered Skin Health · Now in India
              </span>
            </div>

            {/* Headline cycling */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              minHeight: '2.5em',
              transition: 'opacity 0.3s ease',
            }}>
              {headline.line1}
              <br />
              <span style={{ color: '#6befc0' }}>{headline.line2}</span>
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: '520px',
            }}>
              {t('landing.heroSubtitle')}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/patient/upload-scan">
                <Button size="lg" style={{ background: 'white', color: 'var(--secondary)', fontWeight: 700 }} icon={<Upload size={18} />}>
                  {t('landing.heroCta1')}
                </Button>
              </Link>
              <Link to="/find-doctor">
                <Button size="lg" variant="outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }} iconRight={<ArrowRight size={16} />}>
                  {t('landing.heroCta2')}
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
              {[
                { icon: <CheckCircle size={14} />, text: 'Free for patients' },
                { icon: <Shield size={14} />, text: 'HIPAA-aligned storage' },
                { icon: <Globe size={14} />, text: '3 languages supported' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.65)', fontSize: 'var(--font-size-sm)' }}>
                  <span style={{ color: '#6befc0' }}>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative blob */}
        <div style={{
          position: 'absolute', right: '-5%', top: '10%',
          width: '45%', height: '80%',
          background: 'radial-gradient(ellipse at center, rgba(29,158,117,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }} />
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="section-padding" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>{t('landing.howItWorksTitle')}</h2>
            <p style={{ maxWidth: '500px', margin: '0 auto', fontSize: 'var(--font-size-lg)' }}>
              From photo to consultation in four simple steps
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '2px solid var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  position: 'relative',
                }}>
                  {step.icon}
                  <div style={{
                    position: 'absolute', top: -8, right: -8,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--primary)', color: 'white',
                    fontSize: 'var(--font-size-xs)', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{step.title}</h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <section style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {[
              { target: 127, suffix: '+', label: t('landing.statDoctors'), icon: <Stethoscope size={24} color="rgba(255,255,255,0.6)" /> },
              { target: 4850, suffix: '+', label: t('landing.statPatients'), icon: <Users size={24} color="rgba(255,255,255,0.6)" /> },
              { target: 12340, suffix: '+', label: t('landing.statScans'), icon: <Scan size={24} color="rgba(255,255,255,0.6)" /> },
              { target: 48, suffix: '', label: t('landing.statCities'), icon: <Building2 size={24} color="rgba(255,255,255,0.6)" /> },
            ].map(({ target, suffix, label, icon }) => (
              <div key={label}>
                <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                  <Counter target={target} suffix={suffix} />
                </p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--font-size-sm)', marginTop: '0.375rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED DOCTORS ══ */}
      <section className="section-padding" style={{ background: 'var(--neutral)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.5rem' }}>{t('landing.doctorsTitle')}</h2>
              <p>{t('landing.doctorsSubtitle')}</p>
            </div>
            <Link to="/find-doctor">
              <Button variant="outline" iconRight={<ChevronRight size={16} />}>View All Doctors</Button>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {MOCK_DOCTORS.filter(d => d.verified).slice(0, 3).map(doctor => (
              <Card key={doctor.id} hover style={{ position: 'relative', overflow: 'hidden' }}>
                {doctor.verified && (
                  <div style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    background: 'var(--accent)', color: 'var(--primary)',
                    fontSize: '0.7rem', fontWeight: 700,
                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    border: '0.5px solid var(--primary)',
                  }}>
                    ✓ Verified
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <img src={doctor.avatar_url} alt={doctor.name} style={{
                    width: 64, height: 64, borderRadius: '50%', objectFit: 'cover',
                    border: '2px solid var(--accent)',
                  }} />
                  <div>
                    <h5 style={{ marginBottom: '0.25rem' }}>{doctor.name}</h5>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', fontWeight: 500 }}>{doctor.specialisation}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <MapPin size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{doctor.city}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={i < Math.round(doctor.rating) ? '#f59e0b' : 'none'} color={i < Math.round(doctor.rating) ? '#f59e0b' : 'var(--border)'} />
                  ))}
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {doctor.rating} ({doctor.total_ratings} reviews)
                  </span>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  {doctor.bio?.slice(0, 90)}...
                </p>

                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <Link to="/patient/book" style={{ flex: 1 }}>
                    <Button fullWidth size="sm">{t('landing.bookNow')}</Button>
                  </Link>
                  <Button variant="ghost" size="sm">{t('landing.viewProfile')}</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="section-padding" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2>{t('landing.testimonialsTitle')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} style={{ borderLeft: '3px solid var(--primary)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{t.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={10} color="var(--text-muted)" />
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{t.location}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES GRID ══ */}
      <section className="section-padding" style={{ background: 'var(--accent)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>{t('landing.featuresTitle')}</h2>
            <p style={{ maxWidth: '500px', margin: '0 auto' }}>{t('landing.featuresSubtitle')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f) => (
              <Card key={f.title} hover style={{ background: 'var(--bg-card)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  {f.icon}
                </div>
                <h5 style={{ marginBottom: '0.5rem' }}>{f.title}</h5>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA STRIP ══ */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        padding: '4rem 0', textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            Ready to take care of your skin?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Join thousands of patients who trust DERMA AI for early skin lesion detection.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <Button size="lg" style={{ background: 'white', color: 'var(--secondary)', fontWeight: 700 }} icon={<Heart size={18} />}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/find-doctor">
              <Button size="lg" variant="outline" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                Find a Doctor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
