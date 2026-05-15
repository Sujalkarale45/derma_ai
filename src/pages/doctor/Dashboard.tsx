import { useState, useEffect, useRef } from 'react';
import { format, isToday } from 'date-fns';
import { Users, Calendar, Clock, ShieldCheck, ArrowRight, AlertTriangle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { subscribeToDoctorByUserId } from '../../services/doctorProfileService';
import { supabase, isConfigured } from '../../services/supabase';
import type { AppointmentStatus } from '../../types';

interface TodayAppt {
  id: string;
  patient_name: string;
  slot_datetime: string;
  status: AppointmentStatus;
  meet_link?: string;
}

const RISK_COLORS: Record<string, string> = {
  mel: 'var(--danger)', bcc: 'var(--danger)', akiec: 'var(--warning)',
  bkl: 'var(--primary)', df: 'var(--primary)', nv: 'var(--primary)', vasc: 'var(--warning)',
};

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const today = format(new Date(), 'EEEE, dd MMMM yyyy');

  // ── Firestore: doctor approval status ───────────────────────────────────────
  const [verified, setVerified] = useState<boolean | null>(null); // null = loading
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToDoctorByUserId(user.id, profile => {
      setVerified(profile?.verified ?? null);
      setProfileLoaded(true);
    });
    return unsub;
  }, [user?.id]);

  // ── Supabase Realtime: today's appointments for this doctor ────────────────
  const [todayAppts, setTodayAppts] = useState<TodayAppt[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    async function loadInitial() {
      if (isConfigured) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const { data } = await supabase
          .from('appointments')
          .select('id, patient_name, slot_datetime, status, meet_link')
          .eq('doctor_id', user!.id)
          .gte('slot_datetime', startOfDay.toISOString())
          .lte('slot_datetime', endOfDay.toISOString())
          .order('slot_datetime', { ascending: true });

        setTodayAppts((data ?? []) as TodayAppt[]);
      }
      setApptLoading(false);
    }

    loadInitial();

    // Realtime subscription — new bookings from patients appear instantly
    if (isConfigured) {
      channelRef.current = supabase
        .channel(`doctor-appts-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `doctor_id=eq.${user.id}`,
          },
          payload => {
            const appt = payload.new as TodayAppt;
            // Only keep today's
            if (!appt?.slot_datetime) return;
            if (!isToday(new Date(appt.slot_datetime))) return;

            if (payload.eventType === 'INSERT') {
              setTodayAppts(prev => {
                const exists = prev.some(a => a.id === appt.id);
                return exists ? prev : [...prev, appt].sort(
                  (a, b) => new Date(a.slot_datetime).getTime() - new Date(b.slot_datetime).getTime()
                );
              });
              // ✔ Notify the doctor in real-time
              toast.success(
                `New appointment booked — ${appt.patient_name || 'A patient'} at ${format(new Date(appt.slot_datetime), 'hh:mm a')}`,
                { duration: 5000, icon: '📅' }
              );
            } else if (payload.eventType === 'UPDATE') {
              setTodayAppts(prev => prev.map(a => a.id === appt.id ? { ...a, ...appt } : a));
            } else if (payload.eventType === 'DELETE') {
              setTodayAppts(prev => prev.filter(a => a.id !== (payload.old as TodayAppt).id));
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id]);

  return (
    <div>
      {/* ── Pending Approval Banner ─────────────────────────────────────────── */}
      {profileLoaded && verified === false && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '1rem',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          animation: 'fadeInDown 0.3s ease',
        }}>
          <AlertTriangle size={22} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '0.25rem' }}>
              Profile Pending Admin Review
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your registration has been submitted and is awaiting approval by the DERMA AI admin team.
              You will become visible to patients automatically the moment your profile is approved — no refresh needed.
            </p>
          </div>
        </div>
      )}

      {/* ── Profile loading skeleton ─────────────────────────────────────── */}
      {!profileLoaded && user?.role === 'doctor' && (
        <div style={{
          height: 80, borderRadius: 'var(--radius-md)',
          background: 'var(--neutral)', marginBottom: '1.5rem',
          animation: 'shimmer 1.5s ease infinite',
        }} />
      )}

      {/* ── Header Banner ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem',
        marginBottom: '1.75rem', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Avatar name={user?.name || ''} src={user?.avatar_url} size={52} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ color: 'white', margin: 0 }}>{user?.name}</h3>
              {verified && <ShieldCheck size={18} color="#6befc0" />}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--font-size-sm)' }}>
              {verified ? 'Verified Dermatologist' : 'Dermatologist'} · {today}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard
          title="Today's Appointments"
          value={apptLoading ? '…' : todayAppts.length}
          icon={<Calendar size={20} color="var(--primary)" />}
          iconBg="var(--accent)"
          subtitle={apptLoading ? 'Loading…' : 'Live from Supabase'}
        />
        <StatCard
          title="Total Patients"
          value="—"
          icon={<Users size={20} color="var(--primary)" />}
          iconBg="var(--accent)"
          subtitle="Aggregated monthly"
        />
      </div>

      {/* ── Today's Schedule (LIVE) ─────────────────────────────────────────── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h5 style={{ margin: 0 }}>Today's Schedule</h5>
            {/* Realtime LIVE badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              background: 'rgba(29,158,117,0.1)', color: 'var(--primary)',
              border: '0.5px solid rgba(29,158,117,0.3)',
              borderRadius: 'var(--radius-full)', padding: '0.15rem 0.5rem',
              fontSize: '0.68rem', fontWeight: 700,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--primary)', display: 'inline-block',
                animation: 'livePulse 1.5s ease-in-out infinite',
              }} />
              LIVE
            </span>
          </div>
          <Link to="/doctor/appointments" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Full Calendar <ArrowRight size={12} />
          </Link>
        </div>

        {apptLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '2rem', color: 'var(--text-muted)', justifyContent: 'center' }}>
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Connecting to live feed…</span>
          </div>
        ) : todayAppts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Calendar size={36} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
            <p style={{ fontSize: 'var(--font-size-sm)' }}>No appointments scheduled for today.</p>
            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '0.25rem' }}>
              New bookings from patients will appear here instantly.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {todayAppts.map((appt, idx) => (
              <div
                key={appt.id}
                style={{
                  display: 'flex', gap: '0.75rem', padding: '0.75rem',
                  background: 'var(--neutral)', borderRadius: 'var(--radius-sm)',
                  alignItems: 'center',
                  animation: `fadeInRight 0.3s ease ${idx * 0.05}s both`,
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Clock size={16} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    {appt.patient_name || 'Patient'}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {format(new Date(appt.slot_datetime), 'hh:mm a')} IST
                  </p>
                </div>
                <Badge variant={appt.status} dot>{appt.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
