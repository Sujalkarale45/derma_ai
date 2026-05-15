import { useState, useEffect, useRef } from 'react';
import { format, isAfter } from 'date-fns';
import { Video, User, CheckCircle, X, Clock, Loader } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import type { AppointmentStatus } from '../../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { supabase, isConfigured } from '../../services/supabase';

interface DoctorAppt {
  id: string;
  patient_name: string;
  patient_id: string;
  slot_datetime: string;
  status: AppointmentStatus;
  meet_link: string;
}

// Fallback demo data when Supabase is not configured
const DEMO_APPTS: DoctorAppt[] = [
  { id: 'a1', patient_name: 'Riya Sharma',   patient_id: 'p-001', slot_datetime: new Date(Date.now() + 2 * 3600000).toISOString(), status: 'confirmed', meet_link: 'https://meet.google.com/abc-defg-hij' },
  { id: 'a2', patient_name: 'Ramesh Jadhav', patient_id: 'p-002', slot_datetime: new Date(Date.now() + 5 * 3600000).toISOString(), status: 'pending',   meet_link: '' },
];

export default function DoctorAppointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<DoctorAppt[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Initial load + realtime subscription ─────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    async function loadAll() {
      if (isConfigured) {
        const { data, error } = await supabase
          .from('appointments')
          .select('id, patient_name, patient_id, slot_datetime, status, meet_link')
          .eq('doctor_id', user!.id)
          .order('slot_datetime', { ascending: true });

        if (error) {
          console.error('Load error:', error);
          setAppointments(DEMO_APPTS);
        } else {
          setAppointments((data ?? []) as DoctorAppt[]);
        }
      } else {
        await new Promise(r => setTimeout(r, 400));
        setAppointments(DEMO_APPTS);
      }
      setLoading(false);
    }

    loadAll();

    // Real-time: patient bookings appear instantly
    if (isConfigured) {
      channelRef.current = supabase
        .channel(`doctor-all-appts-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${user.id}` },
          payload => {
            if (payload.eventType === 'INSERT') {
              const appt = payload.new as DoctorAppt;
              setAppointments(prev =>
                prev.some(a => a.id === appt.id)
                  ? prev
                  : [...prev, appt].sort((a, b) =>
                      new Date(a.slot_datetime).getTime() - new Date(b.slot_datetime).getTime()
                    )
              );
              toast.success(`New appointment: ${(payload.new as DoctorAppt).patient_name || 'Patient'} just booked!`);
            } else if (payload.eventType === 'UPDATE') {
              const appt = payload.new as DoctorAppt;
              setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, ...appt } : a));
            } else if (payload.eventType === 'DELETE') {
              setAppointments(prev => prev.filter(a => a.id !== (payload.old as DoctorAppt).id));
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user?.id]);

  async function markStatus(id: string, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      if (isConfigured) {
        await supabase.from('appointments').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
        // onSnapshot handles UI update
      } else {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        toast.success(`Marked as ${status}`);
      }
    } catch {
      toast.error('Update failed. Try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  const upcoming = appointments.filter(a => a.status !== 'cancelled' && isAfter(new Date(a.slot_datetime), new Date()));
  const past = appointments.filter(a => a.status === 'cancelled' || !isAfter(new Date(a.slot_datetime), new Date()));

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <h2 style={{ margin: 0 }}>Appointments</h2>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              background: 'rgba(29,158,117,0.12)', color: 'var(--primary)',
              border: '0.5px solid rgba(29,158,117,0.3)',
              borderRadius: 'var(--radius-full)', padding: '0.2rem 0.625rem',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--primary)', display: 'inline-block',
                animation: 'livePulse 1.5s ease-in-out infinite',
              }} />
              LIVE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            Patient bookings appear instantly. No refresh needed.
          </p>
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          {appointments.length} total · {upcoming.length} upcoming
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)' }}>
          <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading appointments…</p>
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>No appointments yet</p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              Patient bookings will appear here in real-time.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Upcoming ({upcoming.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcoming.map((appt, idx) => (
                  <ApptCard
                    key={appt.id}
                    appt={appt}
                    idx={idx}
                    updatingId={updatingId}
                    onMark={markStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Past & Cancelled ({past.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {past.map((appt, idx) => (
                  <ApptCard
                    key={appt.id}
                    appt={appt}
                    idx={idx}
                    updatingId={updatingId}
                    onMark={markStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes apptEnter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function ApptCard({
  appt, idx, updatingId, onMark,
}: {
  appt: DoctorAppt;
  idx: number;
  updatingId: string | null;
  onMark: (id: string, status: AppointmentStatus) => void;
}) {
  return (
    <Card style={{
      padding: '1.25rem',
      opacity: appt.status === 'cancelled' ? 0.6 : 1,
      animation: `apptEnter 0.3s ease ${idx * 0.04}s both`,
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: 50, height: 50, borderRadius: '50%',
          background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={22} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h5 style={{ fontSize: 'var(--font-size-base)', margin: 0 }}>
              {appt.patient_name || 'Patient'}
            </h5>
            <Badge variant={appt.status} dot>{appt.status.replace('-', ' ')}</Badge>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            {format(new Date(appt.slot_datetime), 'EEEE, dd MMM yyyy')} at {format(new Date(appt.slot_datetime), 'hh:mm a')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {appt.patient_id && (
            <Link to={`/doctor/patient/${appt.patient_id}`}>
              <Button size="sm" variant="secondary" icon={<User size={13} />}>View Patient</Button>
            </Link>
          )}
          {appt.meet_link && appt.status !== 'completed' && appt.status !== 'cancelled' && (
            <a href={`/doctor/consultation/${appt.id}`}>
              <Button size="sm" icon={<Video size={13} />}>Start Consultation</Button>
            </a>
          )}
          {appt.status === 'confirmed' || appt.status === 'pending' ? (
            <>
              <Button
                size="sm" variant="ghost"
                icon={<CheckCircle size={13} />}
                loading={updatingId === appt.id}
                onClick={() => onMark(appt.id, 'completed')}
              >
                Complete
              </Button>
              <Button
                size="sm" variant="ghost"
                style={{ color: 'var(--danger)' }}
                icon={<X size={13} />}
                loading={updatingId === appt.id}
                onClick={() => onMark(appt.id, 'no-show')}
              >
                No-Show
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
