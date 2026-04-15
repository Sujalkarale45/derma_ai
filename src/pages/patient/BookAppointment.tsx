import { useState } from 'react';
import { MOCK_DOCTORS } from '../../services/doctorService';
import { format, addDays } from 'date-fns';
import { ChevronRight, ChevronLeft, Check, Calendar, User, Clock, Video, Share2, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { generateMeetLink, shareToPatientWhatsApp, shareToDocterWhatsApp } from '../../utils/meetLink';
import { useAuthStore } from '../../store/authStore';
import { supabase, isConfigured } from '../../services/supabase';

const TIME_SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];

function generateSlots(doctorId: string, date: Date) {
  // Seed random with date+doctorId so slots stay consistent on re-render
  const seed = parseInt(doctorId.slice(-3), 36) + date.getDate();
  return TIME_SLOTS.map((t, i) => ({
    id: `${doctorId}-${date.toDateString()}-${i}`,
    time: t,
    is_booked: ((seed + i * 7) % 10) < 3, // deterministic ~30% booked
  }));
}

interface BookedResult {
  doctor_name: string;
  doctor_phone: string;
  specialisation: string;
  slot_datetime: string;
  meet_link: string;
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(MOCK_DOCTORS[0]);
  const [selectedDate, setSelectedDate] = useState(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState<BookedResult | null>(null);

  const slots = generateSlots(selectedDoctor.id, selectedDate);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  async function confirm() {
    if (!selectedSlot) return;
    setLoading(true);

    const [h, m] = selectedSlot.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(h, m, 0, 0);
    const slotISO = slotDate.toISOString();

    try {
      // ── Step 1: Create Google Calendar event → get real Meet link ──────────
      let meetLink = generateMeetLink(`${selectedDoctor.id}-${slotISO}`); // fallback

      try {
        const apptRes = await fetch('/api/create-appointment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor_name:   selectedDoctor.name,
            doctor_email:  selectedDoctor.email ?? '',
            patient_name:  user?.name ?? 'Patient',
            patient_email: user?.email ?? '',
            slot_datetime: slotISO,
          }),
        });
        if (apptRes.ok) {
          const apptData = await apptRes.json();
          if (apptData.meet_link) meetLink = apptData.meet_link;
        }
      } catch {
        // Google Calendar API not configured — use fallback deterministic link
      }

      // ── Step 2: Save appointment to Supabase ────────────────────────────────
      if (isConfigured && user) {
        await supabase.from('appointments').insert({
          patient_id: user.id,
          doctor_id: selectedDoctor.id,
          slot_datetime: slotISO,
          status: 'pending',
          meet_link: meetLink,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        await new Promise(r => setTimeout(r, 800));
      }

      // ── Step 3: Send WhatsApp via Twilio serverless function ────────────────
      try {
        await fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_phone:  user?.phone ?? '',
            doctor_phone:   selectedDoctor.phone ?? '',
            patient_name:   user?.name ?? 'Patient',
            doctor_name:    selectedDoctor.name,
            slot_datetime:  slotISO,
            meet_link:      meetLink,
          }),
        });
        toast.success('Appointment booked! WhatsApp confirmation sent.');
      } catch {
        toast.success('Appointment booked!');
      }

      const result: BookedResult = {
        doctor_name:    selectedDoctor.name,
        doctor_phone:   selectedDoctor.phone ?? '',
        specialisation: selectedDoctor.specialisation,
        slot_datetime:  slotISO,
        meet_link:      meetLink,
      };
      setBooked(result);
      setStep(4);

    } catch {
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }


  // ── Step 4: Success ──────────────────────────────────────────────────────
  if (step === 4 && booked) {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ marginBottom: '0.375rem' }}>Appointment Confirmed</h2>
          <p style={{ color: 'var(--text-muted)' }}>Your consultation has been scheduled.</p>
        </div>

        <Card style={{ maxWidth: 520 }}>
          {/* Success icon */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--accent)', margin: '0 auto 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={28} color="var(--primary)" />
            </div>
            <h4 style={{ marginBottom: '0.25rem' }}>Booking Confirmed!</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Your consultation has been scheduled successfully.
            </p>
          </div>

          {/* Details */}
          <div style={{ background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1.25rem' }}>
            {[
              { icon: <User size={14} />,     label: 'Doctor',         value: booked.doctor_name },
              { icon: <Calendar size={14} />, label: 'Date',           value: format(new Date(booked.slot_datetime), 'EEEE, dd MMMM yyyy') },
              { icon: <Clock size={14} />,    label: 'Time',           value: format(new Date(booked.slot_datetime), 'hh:mm a') + ' IST' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{label}</p>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Meet link */}
          <div style={{
            background: 'var(--accent)', border: '1px solid rgba(29,158,117,0.25)',
            borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Video size={16} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--primary)' }}>
                Your Google Meet Room
              </span>
            </div>
            <p style={{
              fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--text-primary)', wordBreak: 'break-all', marginBottom: '0.75rem',
            }}>
              {booked.meet_link}
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <a href={booked.meet_link} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                <Button size="sm" icon={<ExternalLink size={13} />}>
                  Open Meet
                </Button>
              </a>
              <Button
                size="sm" variant="ghost"
                icon={<Share2 size={13} />}
                onClick={() => shareToPatientWhatsApp(booked.doctor_name, booked.slot_datetime, booked.meet_link, user?.phone)}
              >
                Share via WhatsApp
              </Button>
            </div>
          </div>

          {/* Bottom actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              fullWidth
              onClick={() => shareToPatientWhatsApp(booked.doctor_name, booked.slot_datetime, booked.meet_link, user?.phone)}
              icon={<Share2 size={16} />}
              style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,0.3)', color: 'white' }}
            >
              Resend to My WhatsApp
            </Button>
            <Button
              fullWidth variant="ghost"
              onClick={() => shareToDocterWhatsApp(booked.doctor_name, user?.name ?? 'Patient', booked.slot_datetime, booked.meet_link, booked.doctor_phone)}
              icon={<Share2 size={16} />}
            >
              Resend to Doctor WhatsApp
            </Button>
            <Button
              fullWidth variant="ghost"
              onClick={() => navigate('/patient/appointments')}
            >
              View My Appointments
            </Button>
          </div>
        </Card>
      </div>
    );
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
                background: step > n ? 'var(--primary)' : step === n ? 'var(--primary)' : 'var(--neutral)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {step > n
                  ? <Check size={14} color="white" />
                  : <span style={{ color: step === n ? 'white' : 'var(--text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>{n}</span>
                }
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: step === n ? 700 : 500, color: step >= n ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
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
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{doc.name}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)' }}>{doc.specialisation}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{doc.city} · {doc.experience_years} yrs exp.</p>
                  </div>
                  {selectedDoctor?.id === doc.id && <Check size={18} color="var(--primary)" />}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, background: 'var(--accent)', color: 'var(--primary)', padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
                    Rating: {doc.rating}/5
                  </span>
                  {doc.verified && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#e6f4ea', color: '#1a5c35', padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
                      ✓ Verified
                    </span>
                  )}
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

          <div style={{ background: 'var(--neutral)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { icon: <User size={14} />,     label: 'Doctor',    value: selectedDoctor.name },
              { icon: <Calendar size={14} />, label: 'Date',      value: format(selectedDate, 'EEEE, dd MMMM yyyy') },
              { icon: <Clock size={14} />,    label: 'Time',      value: selectedSlot + ' IST' },
              { icon: <Video size={14} />,    label: 'Format',    value: 'Video consultation via Google Meet' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{label}</p>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--accent)', border: '0.5px solid rgba(29,158,117,0.3)',
            borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            fontSize: 'var(--font-size-xs)', color: 'var(--secondary)',
          }}>
            A unique Google Meet link will be generated instantly on confirmation and shared to your WhatsApp.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="ghost" icon={<ChevronLeft size={16} />} onClick={() => setStep(2)}>Back</Button>
            <Button loading={loading} onClick={confirm} icon={<Check size={16} />}>Confirm & Get Meet Link</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
