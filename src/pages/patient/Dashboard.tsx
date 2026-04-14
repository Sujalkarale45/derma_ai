import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Calendar, Upload, FileText, MapPin, Scan, Clock, Lightbulb, ArrowRight, Star } from 'lucide-react';
import { getDailyTip, HEALTH_TIPS } from '../../utils/healthTips';
import { format } from 'date-fns';

const MOCK_APPOINTMENTS = [
  { id: 'a1', doctor_name: 'Dr. Rajesh Kulkarni', specialisation: 'Dermatology', slot_datetime: '2026-04-16T10:00:00', status: 'confirmed' as const, meet_link: 'https://meet.google.com/abc-defg-hij' },
  { id: 'a2', doctor_name: 'Dr. Sunita Joshi', specialisation: 'Dermato-Oncology', slot_datetime: '2026-04-22T14:30:00', status: 'pending' as const, meet_link: '' },
];

const MOCK_SCANS = [
  { id: 's1', predicted_class: 'nv' as const, confidence: 0.87, risk_level: 'low' as const, created_at: '2026-04-10T08:30:00', image_url: 'https://picsum.photos/seed/scan1/80/80' },
];

const QUICK_ACTIONS = [
  { to: '/patient/upload-scan', icon: <Upload size={20} color="var(--primary)" />, label: 'Upload Scan', desc: 'Get AI analysis' },
  { to: '/patient/book', icon: <Calendar size={20} color="var(--primary)" />, label: 'Book Appointment', desc: 'See a dermatologist' },
  { to: '/find-doctor', icon: <MapPin size={20} color="var(--primary)" />, label: 'Find Doctor', desc: 'Locate nearby clinics' },
  { to: '/patient/records', icon: <FileText size={20} color="var(--primary)" />, label: 'My Records', desc: 'View health history' },
];

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const dailyTip = getDailyTip();
  const nextAppt = MOCK_APPOINTMENTS.find(a => (a.status as string) !== 'cancelled');
  const lastScan = MOCK_SCANS[0];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        marginBottom: '1.75rem',
        color: 'white',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: '60px', top: '40px', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--font-size-sm)', marginBottom: '0.25rem' }}>
          {t('dashboard.welcomeBack')}
        </p>
        <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', marginBottom: '0.375rem' }}>
          {user?.name?.split(' ')[0] ?? 'Patient'} 👋
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--font-size-sm)' }}>
          📍 {user?.location ?? 'India'} · {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard
          title={t('dashboard.nextAppointment')}
          value={nextAppt ? format(new Date(nextAppt.slot_datetime), 'dd MMM') : '—'}
          icon={<Calendar size={20} color="var(--primary)" />}
          iconBg="var(--accent)"
          subtitle={nextAppt ? nextAppt.doctor_name : t('dashboard.noAppointment')}
        />
        <StatCard
          title={t('dashboard.lastScan')}
          value={lastScan ? lastScan.predicted_class.toUpperCase() : '—'}
          icon={<Scan size={20} color="var(--primary)" />}
          iconBg="var(--accent)"
          subtitle={lastScan ? `${(lastScan.confidence * 100).toFixed(0)}% confidence` : t('dashboard.noScan')}
        />
        <StatCard
          title={t('dashboard.totalRecords')}
          value="3"
          icon={<FileText size={20} color="var(--primary)" />}
          iconBg="var(--accent)"
          trend={50}
          trendLabel="this month"
        />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>

        {/* Upcoming appointments */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h5>{t('dashboard.upcomingAppts')}</h5>
            <Link to="/patient/appointments" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {t('common.viewAll')} <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {MOCK_APPOINTMENTS.map(appt => (
              <div key={appt.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{appt.doctor_name}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {format(new Date(appt.slot_datetime), 'dd MMM · hh:mm a')}
                  </p>
                </div>
                <Badge variant={appt.status} dot>{appt.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent AI scans */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h5>{t('dashboard.recentScans')}</h5>
            <Link to="/patient/records" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {t('common.viewAll')} <ArrowRight size={12} />
            </Link>
          </div>
          {MOCK_SCANS.map(scan => (
            <div key={scan.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
              <img src={scan.image_url} alt="scan" style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                  {scan.predicted_class.toUpperCase()} — {(scan.confidence * 100).toFixed(0)}%
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {format(new Date(scan.created_at), 'dd MMM yyyy')}
                </p>
              </div>
              <Badge variant={scan.risk_level} dot>{scan.risk_level} risk</Badge>
            </div>
          ))}
          <div style={{ marginTop: '1rem' }}>
            <Link to="/patient/upload-scan">
              <div style={{ border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', textAlign: 'center', cursor: 'pointer', transition: 'background var(--transition-fast)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary)', fontWeight: 600 }}>+ Upload New Scan</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Health Tip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem' }}>
        <Card>
          <h5 style={{ marginBottom: '1rem' }}>{t('dashboard.quickActions')}</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {QUICK_ACTIONS.map(({ to, icon, label, desc }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                <div className="card card-hover" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.625rem' }}>
                    {icon}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{label}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Health tip */}
        <Card style={{ minWidth: '240px', background: 'linear-gradient(135deg, var(--accent), white)', borderColor: 'var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lightbulb size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>
              {t('dashboard.healthTipOfDay')}
            </span>
          </div>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{dailyTip.icon}</div>
          <h6 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t(dailyTip.titleKey)}</h6>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t(dailyTip.bodyKey)}
          </p>
        </Card>
      </div>
    </div>
  );
}
