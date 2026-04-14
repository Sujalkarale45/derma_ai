import { format, isAfter, subHours } from 'date-fns';
import { Video, Share2, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import type { AppointmentStatus } from '../../types';

const MOCK = [
  { id:'a1', doctor_name:'Dr. Rajesh Kulkarni', specialisation:'Dermatology', slot_datetime:'2026-04-16T10:00:00', status:'confirmed' as AppointmentStatus, meet_link:'https://meet.google.com/abc-defg-hij' },
  { id:'a2', doctor_name:'Dr. Sunita Joshi', specialisation:'Dermato-Oncology', slot_datetime:'2026-04-22T14:30:00', status:'pending' as AppointmentStatus, meet_link:'' },
  { id:'a3', doctor_name:'Dr. Priyanka Desai', specialisation:'Cosmetic Dermatology', slot_datetime:'2026-04-05T11:00:00', status:'completed' as AppointmentStatus, meet_link:'https://meet.google.com/xyz' },
];

export default function PatientAppointments() {
  function canCancel(dt: string) { return isAfter(new Date(dt), subHours(new Date(), 2)); }

  function shareWhatsApp(a: typeof MOCK[0]) {
    const msg = encodeURIComponent(`My appointment with ${a.doctor_name} is on ${format(new Date(a.slot_datetime),'dd MMM yyyy, hh:mm a')}.\nJoin: ${a.meet_link || 'Link pending'}\n— DERMA AI`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>My Appointments</h2>
        <p style={{ color: 'var(--text-muted)' }}>Track and manage all your scheduled consultations</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {MOCK.map(appt => {
          const isPast = !isAfter(new Date(appt.slot_datetime), new Date());
          const joinActive = appt.meet_link && !isPast;
          return (
            <Card key={appt.id} style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-sm)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {appt.status === 'completed' ? <CheckCircle size={22} color="var(--primary)" /> :
                   appt.status === 'cancelled' ? <X size={22} color="var(--danger)" /> :
                   <Clock size={22} color="var(--primary)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <h5 style={{ fontSize: 'var(--font-size-base)' }}>{appt.doctor_name}</h5>
                    <Badge variant={appt.status} dot>{appt.status.replace('-', ' ')}</Badge>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary)', marginBottom: '0.375rem' }}>{appt.specialisation}</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    📅 {format(new Date(appt.slot_datetime), 'EEEE, dd MMMM yyyy')} at {format(new Date(appt.slot_datetime), 'hh:mm a')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {joinActive && (
                    <a href={appt.meet_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" icon={<Video size={14} />}>Join</Button>
                    </a>
                  )}
                  <Button size="sm" variant="ghost" icon={<Share2 size={14} />} onClick={() => shareWhatsApp(appt)}>
                    Share
                  </Button>
                  {appt.status === 'pending' && canCancel(appt.slot_datetime) && (
                    <Button size="sm" variant="danger" icon={<X size={14} />} onClick={() => toast.success('Appointment cancelled')}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
