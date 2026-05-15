import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Calendar, Upload, FileText, MapPin, Scan, Clock, Lightbulb, ArrowRight, Loader } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getDailyTip } from '../../utils/healthTips';
import { format } from 'date-fns';
import { fetchScansForPatient } from '../../services/scanService';
import { supabase, isConfigured } from '../../services/supabase';
import type { AIScan, Appointment } from '../../types';

const QUICK_ACTIONS = [
  { to: '/patient/upload-scan', icon: <Upload size={20} color="var(--primary)" />, label: 'Upload Scan', desc: 'Get AI analysis' },
  { to: '/patient/book', icon: <Calendar size={20} color="var(--primary)" />, label: 'Book Appointment', desc: 'See a dermatologist' },
  { to: '/find-doctor', icon: <MapPin size={20} color="var(--primary)" />, label: 'Find Doctor', desc: 'Locate nearby clinics' },
  { to: '/patient/records', icon: <FileText size={20} color="var(--primary)" />, label: 'My Records', desc: 'View health history' },
];

const TipIcon = ({ name }: { name: string }) => {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  return Icon ? <Icon size={22} color="var(--primary)" /> : null;
};

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const dailyTip = getDailyTip();

  const [scans, setScans] = useState<AIScan[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load real scans from Firestore
        const realScans = await fetchScansForPatient(user.id);
        setScans(realScans);
      } catch (e) {
        console.error('Failed to load scans', e);
      }

      // Load real appointments from Supabase
      if (isConfigured) {
        try {
          const { data } = await supabase
            .from('appointments')
            .select('*')
            .eq('patient_id', user.id)
            .order('slot_datetime', { ascending: true });
          if (data) setAppointments(data as Appointment[]);
        } catch (e) {
          console.error('Failed to load appointments', e);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const now = new Date();
  const nextAppt = appointments.find(a =>
    a.status !== 'cancelled' && new Date(a.slot_datetime) > now
  );
  const lastScan = scans[0]; // already ordered desc by created_at

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem',
        marginBottom: '1.75rem', color: 'white',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: '60px', top: '40px', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--font-size-sm)', marginBottom: '0.25rem' }}>
          {t('dashboard.welcomeBack')}
        </p>
        <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', marginBottom: '0.375rem' }}>
          {user?.name?.split(' ')[0] ?? 'Patient'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--font-size-sm)' }}>
          {user?.location ?? ''} · {format(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard
          title={t('dashboard.nextAppointment')}
          value={nextAppt ? format(new Date(nextAppt.slot_datetime), 'dd MMM') : '—'}
          icon={<Calendar size={20} color="var(--primary)" />}
          iconBg="var(--accent)"
          subtitle={nextAppt ? (nextAppt as any).doctor_name ?? 'Upcoming' : t('dashboard.noAppointment')}
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
          value={loading ? '…' : String(scans.length)}
          icon={<FileText size={20} color="var(--primary)" />}
          iconBg="var(--accent)"
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
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', color: 'var(--text-muted)' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>Loading appointments…</p>
            </div>
          ) : appointments.filter(a => a.status !== 'cancelled').length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={28} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>No upcoming appointments</p>
              <Link to="/patient/book" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', marginTop: '0.375rem', display: 'block' }}>
                Book one now →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appointments.filter(a => a.status !== 'cancelled').slice(0, 3).map(appt => (
                <div key={appt.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} color="var(--primary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                      {(appt as any).doctor_name ?? `Doctor #${appt.doctor_id.slice(0, 6)}`}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {format(new Date(appt.slot_datetime), 'dd MMM · hh:mm a')}
                    </p>
                  </div>
                  <Badge variant={appt.status} dot>{appt.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent AI scans */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h5>{t('dashboard.recentScans')}</h5>
            <Link to="/patient/records" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {t('common.viewAll')} <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', color: 'var(--text-muted)' }}>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>Loading scans…</p>
            </div>
          ) : scans.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Scan size={28} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: 'var(--font-size-sm)' }}>No scans yet</p>
            </div>
          ) : (
            scans.slice(0, 3).map(scan => (
              <div key={scan.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', background: 'var(--neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid var(--border)', flexShrink: 0 }}>
                  <Scan size={20} color="var(--text-muted)" />
                </div>
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
            ))
          )}
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
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <TipIcon name={dailyTip.icon} />
          </div>
          <h6 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{t(dailyTip.titleKey)}</h6>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t(dailyTip.bodyKey)}
          </p>
        </Card>
      </div>
    </div>
  );
}
