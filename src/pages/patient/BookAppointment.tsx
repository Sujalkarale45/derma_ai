import { useState } from 'react';
import { MOCK_DOCTORS } from '../../services/doctorService';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { ChevronRight, ChevronLeft, Check, Calendar, User, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TIME_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];

function generateSlots(doctorId: string, date: Date) {
  return TIME_SLOTS.map((t, i) => ({
    id: `${doctorId}-${date.toDateString()}-${i}`,
    time: t,
    is_booked: Math.random() < 0.4,
  }));
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(MOCK_DOCTORS[0]);
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slots = generateSlots(selectedDoctor.id, selectedDate);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  async function confirm() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    toast.success('Appointment booked! Google Meet link sent to your email.');
    navigate('/patient/appointments');
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>Book an Appointment</h2>
        <p style={{ color: 'var(--text-muted)' }}>Choose a doctor, pick a slot, and confirm</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2rem' }}>
        {[{n:1,label:'Select Doctor'},{n:2,label:'Choose Slot'},{n:3,label:'Confirm'}].map(({n,label},i,arr) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: n < arr.length ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= n ? 'var(--primary)' : 'var(--neutral)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {step > n ? <Check size={14} color="white" /> :
                  <span style={{ color: step === n ? 'white' : 'var(--text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{n}</span>}
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: step === n ? 700 : 500, color: step >= n ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < arr.length - 1 && <div style={{ flex: 1, height: 1, background: step > n ? 'var(--primary)' : 'var(--border)', margin: '0 0.75rem', minWidth: '1rem' }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Doctor */}
      {step === 1 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {MOCK_DOCTORS.filter(d => d.verified).map(doc => (
              <Card key={doc.id} hover style={{ cursor: 'pointer', border: selectedDoctor?.id === doc.id ? '2px solid var(--primary)' : '0.5px solid var(--border)' }}
                onClick={() => setSelectedDoctor(doc)}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <img src={doc.avatar_url} alt={doc.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{doc.name}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)' }}>{doc.specialisation}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{doc.city} · {doc.experience_years} yrs</p>
                  </div>
                  {selectedDoctor?.id === doc.id && <Check size={18} color="var(--primary)" style={{ marginLeft: 'auto' }} />}
                </div>
              </Card>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Button iconRight={<ChevronRight size={16} />} onClick={() => setStep(2)} disabled={!selectedDoctor}>
              Next: Choose Slot
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Slot */}
      {step === 2 && (
        <Card style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <img src={selectedDoctor.avatar_url} alt={selectedDoctor.name} style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <div>
              <p style={{ fontWeight: 700 }}>{selectedDoctor.name}</p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{selectedDoctor.specialisation}</p>
            </div>
          </div>

          <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: 'var(--font-size-sm)' }}>Select Date</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {dates.map(d => (
              <button key={d.toISOString()} onClick={() => { setSelectedDate(d); setSelectedSlot(null); }} style={{
                padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border)',
                background: selectedDate.toDateString() === d.toDateString() ? 'var(--primary)' : 'var(--bg-card)',
                color: selectedDate.toDateString() === d.toDateString() ? 'white' : 'var(--text-primary)',
                cursor: 'pointer', flexShrink: 0, textAlign: 'center', fontWeight: 600, fontSize: 'var(--font-size-xs)',
              }}>
                <div>{format(d, 'EEE')}</div>
                <div style={{ fontSize: '1rem' }}>{format(d, 'd')}</div>
              </button>
            ))}
          </div>

          <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: 'var(--font-size-sm)' }}>Select Time</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {slots.map(slot => (
              <button key={slot.id} disabled={slot.is_booked} onClick={() => setSelectedSlot(slot.time)} style={{
                padding: '0.625rem', borderRadius: 'var(--radius-sm)',
                border: selectedSlot === slot.time ? '2px solid var(--primary)' : '0.5px solid var(--border)',
                background: slot.is_booked ? 'var(--neutral)' : selectedSlot === slot.time ? 'var(--accent)' : 'var(--bg-card)',
                color: slot.is_booked ? 'var(--text-muted)' : selectedSlot === slot.time ? 'var(--primary)' : 'var(--text-primary)',
                cursor: slot.is_booked ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: 'var(--font-size-sm)',
                textDecoration: slot.is_booked ? 'line-through' : 'none',
              }}>
                {slot.time}
                {slot.is_booked && <div style={{ fontSize: '0.65rem', fontWeight: 400 }}>Booked</div>}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={() => setStep(1)}>Back</Button>
            <Button iconRight={<ChevronRight size={16} />} onClick={() => setStep(3)} disabled={!selectedSlot}>
              Next: Confirm
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <Card style={{ maxWidth: '480px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Calendar size={24} color="var(--primary)" />
            </div>
            <h4>Confirm Appointment</h4>
          </div>

          <div style={{ background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { icon: <User size={14} />, label: 'Doctor', value: selectedDoctor.name },
              { icon: <Calendar size={14} />, label: 'Date', value: format(selectedDate, 'EEEE, dd MMMM yyyy') },
              { icon: <Clock size={14} />, label: 'Time', value: selectedSlot + ' IST' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--primary)' }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{label}</p>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            📧 A Google Meet link will be sent to your registered email after confirmation.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={() => setStep(2)}>Back</Button>
            <Button loading={loading} onClick={confirm} icon={<Check size={16} />}>Confirm Booking</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
