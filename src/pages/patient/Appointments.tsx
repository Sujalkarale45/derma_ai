import { useState } from 'react';
import { format, isAfter, subHours } from 'date-fns';
import { Video, Share2, X, Clock, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import type { AppointmentStatus } from '../../types';
import { generateMeetLink, shareViaWhatsApp } from '../../utils/meetLink';
import { supabase, isConfigured } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

interface Appt {
  id: string;
  doctor_name: string;
  specialisation: string;
  slot_datetime: string;
  status: AppointmentStatus;
  meet_link: string;
}

const SEED_DATA: Appt[] = [
  {
    id: 'a1',
    doctor_name: 'Dr. Rajesh Kulkarni',
    specialisation: 'Dermatology & Dermato-Oncology',
    slot_datetime: '2026-04-16T10:00:00',
    status: 'confirmed',
    meet_link: generateMeetLink(),
  },
  {
    id: 'a2',
    doctor_name: 'Dr. Sunita Joshi',
    specialisation: 'Dermato-Oncology',
    slot_datetime: '2026-04-22T14:30:00',
    status: 'pending',
    meet_link: generateMeetLink(),
  },
  {
    id: 'a3',
    doctor_name: 'Dr. Priyanka Desai',
    specialisation: 'Cosmetic Dermatology',
    slot_datetime: '2026-03-05T11:00:00',
    status: 'completed',
    meet_link: generateMeetLink(),
  },
];

const STATUS_META: Record<AppointmentStatus, { label: string; color: string }> = {
  pending:   { label: 'Pending Confirmation', color: 'var(--warning)' },
  confirmed: { label: 'Confirmed',            color: 'var(--primary)' },
  completed: { label: 'Completed',            color: 'var(--primary)' },
  cancelled: { label: 'Cancelled',            color: 'var(--danger)' },
  'no-show': { label: 'No Show',              color: '#7c3aed' },
};

export default function PatientAppointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appt[]>(SEED_DATA);
  const [cancelling, setCancelling] = useState<string | null>(null);

  function canCancel(dt: string, status: AppointmentStatus) {
    return (status === 'pending' || status === 'confirmed')
      && isAfter(new Date(dt), subHours(new Date(), 2));
  }

  async function handleCancel(id: string) {
    setCancelling(id);

    // Optimistic removal — instant UI update
    setAppointments(prev => prev.filter(a => a.id !== id));

    try {
      if (isConfigured) {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } else {
        // Mock: slight delay to feel realistic
        await new Promise(r => setTimeout(r, 400));
      }
      toast.success('Appointment cancelled successfully.');
    } catch {
      // Roll back on failure
      setAppointments(prev => {
        const original = SEED_DATA.find(a => a.id === id);
        return original ? [...prev, original].sort((a, b) =>
          new Date(a.slot_datetime).getTime() - new Date(b.slot_datetime).getTime()
        ) : prev;
      });
      toast.error('Could not cancel. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  function copyMeetLink(link: string) {
    navigator.clipboard.writeText(link).then(() => toast.success('Meet link copied!'));
  }

  const upcoming = appointments.filter(a =>
    a.status !== 'cancelled' && isAfter(new Date(a.slot_datetime), new Date())
  );
  const past = appointments.filter(a =>
    a.status === 'cancelled' || !isAfter(new Date(a.slot_datetime), new Date())
  );

  const ApptCard = ({ appt }: { appt: Appt }) => {
    const isFuture = isAfter(new Date(appt.slot_datetime), new Date());
    const joinActive = appt.meet_link && isFuture && appt.status === 'confirmed';
    const meta = STATUS_META[appt.status];

    return (
      <Card style={{ padding: '1.25rem', opacity: appt.status === 'cancelled' ? 0.6 : 1 }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Status icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-sm)',
            background: `${meta.color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {appt.status === 'completed' && <CheckCircle size={22} color={meta.color} />}
            {appt.status === 'cancelled' && <X size={22} color={meta.color} />}
            {appt.status === 'no-show'   && <AlertCircle size={22} color={meta.color} />}
            {(appt.status === 'confirmed' || appt.status === 'pending') && <Clock size={22} color={meta.color} />}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <h5 style={{ fontSize: 'var(--font-size-base)', margin: 0 }}>{appt.doctor_name}</h5>
              <Badge variant={appt.status} dot>{meta.label}</Badge>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary)', marginBottom: '0.25rem', fontWeight: 500 }}>
              {appt.specialisation}
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              {format(new Date(appt.slot_datetime), 'EEEE, dd MMMM yyyy')} &nbsp;·&nbsp;
              {format(new Date(appt.slot_datetime), 'hh:mm a')} IST
            </p>

            {/* Meet link pill */}
            {appt.meet_link && appt.status !== 'cancelled' && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                marginTop: '0.5rem', padding: '0.25rem 0.625rem',
                background: 'var(--accent)', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
              }}>
                <Video size={11} color="var(--primary)" />
                <span style={{ color: 'var(--primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                  {appt.meet_link.replace('https://meet.google.com/', '')}
                </span>
                <button
                  onClick={() => copyMeetLink(appt.meet_link)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--primary)' }}
                  title="Copy link"
                >
                  <Copy size={10} />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {joinActive && (
              <a href={appt.meet_link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" icon={<Video size={14} />}>Join Call</Button>
              </a>
            )}

            <Button
              size="sm" variant="ghost"
              icon={<Share2 size={14} />}
              onClick={() => shareViaWhatsApp(appt.doctor_name, appt.slot_datetime, appt.meet_link, user?.phone)}
            >
              WhatsApp
            </Button>

            {canCancel(appt.slot_datetime, appt.status) && (
              <Button
                size="sm" variant="danger"
                icon={<X size={14} />}
                loading={cancelling === appt.id}
                onClick={() => handleCancel(appt.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>My Appointments</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Track and manage your consultations. Cancelled appointments are removed immediately.
        </p>
      </div>

      {appointments.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No appointments found.</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Book a consultation with a dermatologist to get started.
          </p>
        </Card>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Upcoming ({upcoming.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {upcoming.map(a => <ApptCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}

      {/* Past / cancelled */}
      {past.length > 0 && (
        <div>
          <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Past & Cancelled ({past.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {past.map(a => <ApptCard key={a.id} appt={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}
