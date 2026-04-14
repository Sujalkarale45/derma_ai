import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Video, Save, Download, AlertTriangle, User, Pill } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CLASS_INFO } from '../../utils/classDescriptions';
import type { SkinLesionClass } from '../../types';
import toast from 'react-hot-toast';

const APPT = { id:'a1', patient_name:'Priya Sharma', patient_age:31, slot_datetime:'2026-04-16T10:00:00', meet_link:'https://meet.google.com/abc-defg-hij' };
const SCAN = { predicted_class:'mel' as SkinLesionClass, confidence:0.62, risk_level:'high' as const, image_url:'https://picsum.photos/seed/consult/180/180' };

export default function Consultation() {
  const { appointmentId } = useParams();
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const classInfo = CLASS_INFO[SCAN.predicted_class];

  async function saveNotes() {
    setSavingNotes(true);
    await new Promise(r => setTimeout(r,800));
    setSavingNotes(false);
    toast.success('Notes saved to patient record.');
  }

  async function generatePrescription() {
    if (!prescription.trim()) { toast.error('Please write a prescription first.'); return; }
    setGeneratingPdf(true);
    await new Promise(r => setTimeout(r,1200));
    setGeneratingPdf(false);
    toast.success('Prescription PDF generated and sent to patient.');
  }

  return (
    <div>
      <div style={{marginBottom:'1.75rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
        <div>
          <h2 style={{marginBottom:'0.375rem'}}>Consultation Room</h2>
          <p style={{color:'var(--text-muted)'}}>
            {APPT.patient_name} · {format(new Date(APPT.slot_datetime),'EEEE, dd MMM yyyy · hh:mm a')}
          </p>
        </div>
        <a href={APPT.meet_link} target="_blank" rel="noopener noreferrer">
          <Button icon={<Video size={18}/>} style={{fontSize:'1rem',padding:'0.75rem 1.5rem'}}>
            Join Google Meet
          </Button>
        </a>
      </div>

      {/* Meet notice */}
      <div style={{background:'var(--accent)',border:'0.5px solid var(--primary)',borderRadius:'var(--radius-sm)',padding:'0.75rem 1rem',marginBottom:'1.5rem',fontSize:'var(--font-size-sm)',color:'var(--secondary)'}}>
        🎥 Google Meet link: <a href={APPT.meet_link} target="_blank" rel="noopener noreferrer" style={{fontWeight:700,color:'var(--primary)'}}>{APPT.meet_link}</a>
        &ensp;—&ensp;Opens 10 minutes before scheduled time.
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>

        {/* Left — Patient & AI report */}
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          {/* Patient info */}
          <Card>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,var(--primary),var(--secondary))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <User size={20} color="white"/>
              </div>
              <div>
                <h5 style={{marginBottom:'0'}}>{APPT.patient_name}</h5>
                <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>Age {APPT.patient_age} · Patient</p>
              </div>
            </div>
          </Card>

          {/* AI Scan report */}
          <Card style={{border:'1.5px solid rgba(226,75,74,0.3)',background:'rgba(226,75,74,0.03)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
              <AlertTriangle size={16} color="var(--danger)"/>
              <h6 style={{color:'var(--danger)',margin:0}}>AI Scan Report — High Risk</h6>
            </div>
            <div style={{display:'flex',gap:'1rem',alignItems:'flex-start'}}>
              <img src={SCAN.image_url} alt="scan" style={{width:80,height:80,borderRadius:'var(--radius-sm)',objectFit:'cover',flexShrink:0}}/>
              <div>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.375rem'}}>
                  <span style={{fontWeight:700,color:'var(--danger)'}}>{classInfo.name}</span>
                  <Badge variant="high">HIGH RISK</Badge>
                </div>
                <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)',marginBottom:'0.375rem'}}>
                  Confidence: <strong>{(SCAN.confidence*100).toFixed(0)}%</strong>
                </p>
                <p style={{fontSize:'var(--font-size-xs)',lineHeight:1.6,color:'var(--text-primary)'}}>{classInfo.description}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" icon={<Download size={13}/>} style={{marginTop:'0.875rem'}}>Download Full Report</Button>
          </Card>
        </div>

        {/* Right — Notes & Prescription */}
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          <Card>
            <h6 style={{marginBottom:'0.75rem'}}>Consultation Notes</h6>
            <textarea
              className="form-input"
              rows={7}
              placeholder="Observations, examination findings, diagnosis notes, follow-up plan..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{resize:'vertical',marginBottom:'0.875rem'}}
            />
            <Button size="sm" icon={<Save size={13}/>} loading={savingNotes} onClick={saveNotes}>Save Notes</Button>
          </Card>

          <Card>
            <h6 style={{marginBottom:'0.75rem'}}>Prescription</h6>
            <textarea
              className="form-input"
              rows={7}
              placeholder={`Rx:\n\n1. Medication name — dose — frequency — duration\n2. ...\n\nAdvice:\nFollow-up in 2 weeks.`}
              value={prescription}
              onChange={e => setPrescription(e.target.value)}
              style={{resize:'vertical',marginBottom:'0.875rem',fontFamily:'monospace',fontSize:'var(--font-size-sm)'}}
            />
            <Button size="sm" variant="secondary" icon={<Pill size={13}/>} loading={generatingPdf} onClick={generatePrescription}>
              Generate Prescription PDF
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
