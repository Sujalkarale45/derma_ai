import { useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TIME_OPTIONS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

interface DaySlot { enabled: boolean; start: string; end: string; }

const DEFAULT_SLOTS: DaySlot[] = [
  { enabled: false, start: '09:00', end: '17:00' },
  { enabled: true,  start: '09:00', end: '17:00' },
  { enabled: true,  start: '09:00', end: '17:00' },
  { enabled: true,  start: '09:00', end: '17:00' },
  { enabled: true,  start: '09:00', end: '17:00' },
  { enabled: true,  start: '09:00', end: '17:00' },
  { enabled: false, start: '09:00', end: '13:00' },
];

export default function Availability() {
  const [slots, setSlots] = useState<DaySlot[]>(DEFAULT_SLOTS);
  const [saving, setSaving] = useState(false);

  function toggle(i: number) {
    setSlots(s => s.map((d,idx) => idx===i ? {...d, enabled:!d.enabled} : d));
  }
  function updateTime(i: number, field: 'start'|'end', val: string) {
    setSlots(s => s.map((d,idx) => idx===i ? {...d,[field]:val} : d));
  }

  async function save() {
    setSaving(true);
    await new Promise(r => setTimeout(r,900));
    setSaving(false);
    toast.success('Availability saved successfully!');
  }

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>My Availability</h2>
        <p style={{color:'var(--text-muted)'}}>Set your weekly working hours and consultation slots</p>
      </div>

      <Card style={{maxWidth:600}}>
        <h5 style={{marginBottom:'1.25rem'}}>Weekly Schedule</h5>
        <div style={{display:'flex',flexDirection:'column',gap:'0.875rem',marginBottom:'1.5rem'}}>
          {DAYS.map((day,i) => (
            <div key={day} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'0.875rem',background:'var(--neutral)',borderRadius:'var(--radius-sm)',flexWrap:'wrap'}}>
              {/* Toggle */}
              <div style={{display:'flex',alignItems:'center',gap:'0.625rem',minWidth:'140px'}}>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width:40,height:22,borderRadius:'var(--radius-full)',
                    border:'none',cursor:'pointer',padding:2,
                    background: slots[i].enabled ? 'var(--primary)' : 'var(--border-strong)',
                    transition:'all var(--transition-fast)',position:'relative',
                  }}
                >
                  <div style={{
                    width:18,height:18,borderRadius:'50%',background:'white',
                    transform: slots[i].enabled ? 'translateX(18px)' : 'translateX(0)',
                    transition:'transform var(--transition-fast)',
                  }}/>
                </button>
                <span style={{fontSize:'var(--font-size-sm)',fontWeight:slots[i].enabled?600:400,color:slots[i].enabled?'var(--text-primary)':'var(--text-muted)'}}>
                  {day}
                </span>
              </div>

              {slots[i].enabled ? (
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flex:1}}>
                  <select className="form-input" value={slots[i].start} onChange={e => updateTime(i,'start',e.target.value)} style={{padding:'0.375rem 0.625rem',minWidth:90}}>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span style={{color:'var(--text-muted)',fontSize:'var(--font-size-sm)'}}>to</span>
                  <select className="form-input" value={slots[i].end} onChange={e => updateTime(i,'end',e.target.value)} style={{padding:'0.375rem 0.625rem',minWidth:90}}>
                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              ) : (
                <p style={{fontSize:'var(--font-size-sm)',color:'var(--text-muted)',fontStyle:'italic'}}>Unavailable</p>
              )}
            </div>
          ))}
        </div>

        <div style={{padding:'0.875rem',background:'var(--accent)',borderRadius:'var(--radius-sm)',marginBottom:'1.25rem',display:'flex',gap:'0.5rem',alignItems:'center'}}>
          <CheckCircle size={14} color="var(--primary)"/>
          <p style={{fontSize:'var(--font-size-xs)',color:'var(--secondary)'}}>
            Patients can only book within your available hours. Each hour generates one 1-hour consultation slot.
          </p>
        </div>

        <Button onClick={save} loading={saving} icon={<Save size={16}/>}>Save Availability</Button>
      </Card>
    </div>
  );
}
