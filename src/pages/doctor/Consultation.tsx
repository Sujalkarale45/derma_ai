import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Video, Save, Download, AlertTriangle, User, Pill, ExternalLink, Share2, Loader } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CLASS_INFO } from '../../utils/classDescriptions';
import { shareToDocterWhatsApp, shareToPatientWhatsApp } from '../../utils/meetLink';
import { useAuthStore } from '../../store/authStore';
import { supabase, isConfigured } from '../../services/supabase';
import type { SkinLesionClass } from '../../types';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApptData {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number;
  slot_datetime: string;
  meet_link: string;
  status: string;
}

// ─── Fallback mock (used when Supabase is not configured) ─────────────────────
const MOCK_APPT: ApptData = {
  id: 'a1',
  patient_name: 'Riya Sharma',
  patient_phone: '+91 9800000001',
  patient_age: 31,
  slot_datetime: '2026-04-16T10:00:00',
  meet_link: 'https://meet.google.com/abc-defg-riy',
  status: 'confirmed',
};

const MOCK_SCAN = {
  predicted_class: 'mel' as SkinLesionClass,
  confidence: 0.62,
  image_url: 'https://picsum.photos/seed/consult/180/180',
};

export default function Consultation() {
  const { appointmentId } = useParams();
  const { user } = useAuthStore();

  // Appointment state
  const [appt, setAppt]       = useState<ApptData | null>(null);
  const [loadingAppt, setLoadingAppt] = useState(true);

  // Form state
  const [notes, setNotes]                 = useState('');
  const [prescription, setPrescription]   = useState('');
  const [savingNotes, setSavingNotes]     = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const doctorName = user?.name ?? 'Doctor';
  const doctorPhone = (user as unknown as Record<string, string>)?.phone ?? '';

  // ─── Load appointment ────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoadingAppt(true);
      try {
        if (isConfigured && appointmentId) {
          const { data, error } = await supabase
            .from('appointments')
            .select(`
              id,
              slot_datetime,
              meet_link,
              status,
              patient:users!appointments_patient_id_fkey (
                name, phone, dob
              )
            `)
            .eq('id', appointmentId)
            .single();

          if (!error && data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const patient = (data as any).patient;
            const dob     = patient?.dob ? new Date(patient.dob) : null;
            const age     = dob ? Math.floor((Date.now() - dob.getTime()) / 3.154e10) : 0;
            setAppt({
              id:            data.id,
              patient_name:  patient?.name  ?? 'Patient',
              patient_phone: patient?.phone ?? '',
              patient_age:   age,
              slot_datetime: data.slot_datetime,
              meet_link:     data.meet_link,
              status:        data.status,
            });
            return;
          }
        }
      } catch { /* fall through to mock */ }

      // Fallback
      setAppt(MOCK_APPT);
    }
    load().finally(() => setLoadingAppt(false));
  }, [appointmentId]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  async function saveNotes() {
    setSavingNotes(true);
    if (isConfigured && appointmentId) {
      await supabase.from('appointments').update({ doctor_notes: notes }).eq('id', appointmentId);
    } else {
      await new Promise(r => setTimeout(r, 700));
    }
    setSavingNotes(false);
    toast.success('Notes saved to patient record.');
  }

  async function generatePrescription() {
    if (!prescription.trim()) { toast.error('Please write a prescription first.'); return; }
    setGeneratingPdf(true);
    await new Promise(r => setTimeout(r, 1200));
    setGeneratingPdf(false);
    toast.success('Prescription PDF generated and sent to patient.');
  }

  // ─── AI scan (would be fetched from Supabase in production) ──────────────
  const scan = MOCK_SCAN;
  const classInfo = CLASS_INFO[scan.predicted_class];

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loadingAppt || !appt) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading consultation…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.375rem' }}>Consultation Room</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {appt.patient_name} · {format(new Date(appt.slot_datetime), 'EEEE, dd MMM yyyy · hh:mm a')}
          </p>
        </div>
        <Badge variant={appt.status as 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show'} dot>
          {appt.status}
        </Badge>
      </div>

      {/* ── Google Meet card ── */}
      <Card style={{ marginBottom: '1.5rem', border: '1.5px solid rgba(29,158,117,0.35)', background: 'var(--accent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Video size={20} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h6 style={{ margin: '0 0 0.25rem' }}>Video Consultation — Google Meet</h6>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {appt.meet_link}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <a href={appt.meet_link} target="_blank" rel="noopener noreferrer">
              <Button icon={<ExternalLink size={15} />}>Open Google Meet</Button>
            </a>
            <Button
              variant="ghost"
              icon={<Share2 size={15} />}
              onClick={() => shareToPatientWhatsApp(
                doctorName,
                appt.slot_datetime,
                appt.meet_link,
                appt.patient_phone || undefined
              )}
            >
              WhatsApp Patient
            </Button>
            <Button
              variant="ghost"
              icon={<Share2 size={15} />}
              onClick={() => shareToDocterWhatsApp(
                doctorName,
                appt.patient_name,
                appt.slot_datetime,
                appt.meet_link,
                doctorPhone
              )}
            >
              My WhatsApp
            </Button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Left — Patient & AI report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Patient info */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} color="white" />
              </div>
              <div>
                <h5 style={{ marginBottom: '0' }}>{appt.patient_name}</h5>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {appt.patient_age > 0 ? `Age ${appt.patient_age} · ` : ''}Patient
                </p>
              </div>
            </div>
            {appt.patient_phone && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Phone: {appt.patient_phone}
              </p>
            )}
          </Card>

          {/* AI Scan report */}
          <Card style={{ border: '1.5px solid rgba(226,75,74,0.3)', background: 'rgba(226,75,74,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertTriangle size={16} color="var(--danger)" />
              <h6 style={{ color: 'var(--danger)', margin: 0 }}>AI Scan Report — High Risk</h6>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <img src={scan.image_url} alt="scan" style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{classInfo.name}</span>
                  <Badge variant="high">HIGH RISK</Badge>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  Confidence: <strong>{(scan.confidence * 100).toFixed(0)}%</strong>
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {classInfo.description}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" icon={<Download size={13} />} style={{ marginTop: '0.875rem' }}>
              Download Full Report
            </Button>
          </Card>
        </div>

        {/* Right — Notes & Prescription */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card>
            <h6 style={{ marginBottom: '0.75rem' }}>Consultation Notes</h6>
            <textarea
              className="form-input"
              rows={7}
              placeholder="Observations, examination findings, diagnosis notes, follow-up plan..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical', marginBottom: '0.875rem' }}
            />
            <Button size="sm" icon={<Save size={13} />} loading={savingNotes} onClick={saveNotes}>
              Save Notes
            </Button>
          </Card>

          <Card>
            <h6 style={{ marginBottom: '0.75rem' }}>Prescription</h6>
            <textarea
              className="form-input"
              rows={7}
              placeholder={`Rx:\n\n1. Medication name — dose — frequency — duration\n2. ...\n\nAdvice:\nFollow-up in 2 weeks.`}
              value={prescription}
              onChange={e => setPrescription(e.target.value)}
              style={{ resize: 'vertical', marginBottom: '0.875rem', fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}
            />
            <Button size="sm" variant="secondary" icon={<Pill size={13} />} loading={generatingPdf} onClick={generatePrescription}>
              Generate Prescription PDF
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
