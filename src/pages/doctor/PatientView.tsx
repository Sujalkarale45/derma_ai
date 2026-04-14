import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Download, Save, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { CLASS_INFO } from '../../utils/classDescriptions';
import type { SkinLesionClass } from '../../types';
import toast from 'react-hot-toast';

const MOCK_PATIENT = {
  id:'p-001', name:'Priya Sharma', dob:'1995-06-15', gender:'Female',
  village:'Satara', district:'Satara', state:'Maharashtra', phone:'+91 9876543210',
  email:'patient@demo.com', created_at:'2026-01-15T08:00:00',
};

const MOCK_SCANS = [
  { id:'s1', predicted_class:'mel' as SkinLesionClass, confidence:0.62, risk_level:'high' as const, created_at:'2026-04-10T08:30:00', image_url:'https://picsum.photos/seed/scan1/120/120' },
  { id:'s2', predicted_class:'nv' as SkinLesionClass, confidence:0.87, risk_level:'low' as const, created_at:'2026-03-22T14:00:00', image_url:'https://picsum.photos/seed/scan2/120/120' },
];

export default function PatientView() {
  const { id } = useParams();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveNotes() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Notes saved to patient record.');
  }

  const age = new Date().getFullYear() - new Date(MOCK_PATIENT.dob).getFullYear();

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>Patient Profile</h2>
        <p style={{color:'var(--text-muted)'}}>Complete health record and AI scan history</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'1.5rem',alignItems:'start'}}>
        {/* Patient info card */}
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <Card style={{textAlign:'center',padding:'1.5rem'}}>
            <Avatar name={MOCK_PATIENT.name} size={64} style={{margin:'0 auto 0.875rem'}}/>
            <h5 style={{marginBottom:'0.25rem'}}>{MOCK_PATIENT.name}</h5>
            <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)',marginBottom:'0.875rem'}}>{age} yrs · {MOCK_PATIENT.gender}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',textAlign:'left'}}>
              {[
                {label:'Phone',value:MOCK_PATIENT.phone},
                {label:'Location',value:`${MOCK_PATIENT.village}, ${MOCK_PATIENT.district}`},
                {label:'State',value:MOCK_PATIENT.state},
                {label:'Patient since',value:format(new Date(MOCK_PATIENT.created_at),'MMM yyyy')},
              ].map(({label,value}) => (
                <div key={label}>
                  <p style={{fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.06em',color:'var(--text-muted)',marginBottom:'1px'}}>{label}</p>
                  <p style={{fontSize:'var(--font-size-sm)',fontWeight:500,color:'var(--text-primary)'}}>{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <h6 style={{marginBottom:'0.75rem'}}>Doctor's Notes</h6>
            <textarea
              className="form-input"
              rows={6}
              placeholder="Observations, diagnosis notes, follow-up instructions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{resize:'vertical',marginBottom:'0.75rem'}}
            />
            <Button fullWidth size="sm" loading={saving} onClick={saveNotes} icon={<Save size={13}/>}>Save Notes</Button>
          </Card>
        </div>

        {/* AI Scans */}
        <Card>
          <h5 style={{marginBottom:'1.25rem'}}>AI Scan History</h5>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {MOCK_SCANS.map(scan => {
              const info = CLASS_INFO[scan.predicted_class];
              return (
                <div key={scan.id} style={{
                  display:'flex',gap:'1rem',padding:'1rem',
                  background: scan.risk_level==='high' ? 'rgba(226,75,74,0.05)' : 'var(--neutral)',
                  borderRadius:'var(--radius-md)',
                  border:`0.5px solid ${scan.risk_level==='high' ? 'rgba(226,75,74,0.3)' : 'var(--border)'}`,
                }}>
                  <img src={scan.image_url} alt="scan" style={{width:80,height:80,borderRadius:'var(--radius-sm)',objectFit:'cover',flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:'0.625rem',marginBottom:'0.375rem',flexWrap:'wrap'}}>
                      <h6 style={{fontSize:'var(--font-size-base)'}}>{info.name}</h6>
                      <Badge variant={scan.risk_level} dot>{scan.risk_level} risk</Badge>
                      {scan.risk_level === 'high' && <AlertTriangle size={14} color="var(--danger)"/>}
                    </div>
                    <p style={{fontSize:'var(--font-size-sm)',color:'var(--text-muted)',marginBottom:'0.375rem'}}>
                      Confidence: <strong>{(scan.confidence*100).toFixed(0)}%</strong>
                    </p>
                    <p style={{fontSize:'var(--font-size-sm)',lineHeight:1.6,color:'var(--text-primary)',marginBottom:'0.5rem'}}>{info.description}</p>
                    <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>Scanned: {format(new Date(scan.created_at),'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',justifyContent:'center'}}>
                    <Button size="sm" variant="secondary" icon={<Download size={13}/>}>PDF</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
