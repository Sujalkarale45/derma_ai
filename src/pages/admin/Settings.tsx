import { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    maintenance: false, allowNewPatients: true, allowNewDoctors: true,
    aiEnabled: true, emailNotifications: true, smsNotifications: false,
    maxSlotsPerDay: '8', appointmentDuration: '60', aiConfidenceThreshold: '55',
    supportEmail: 'support@dermaai.app', supportPhone: '+91 1800-DERMA-AI',
  });
  const [saving, setSaving] = useState(false);

  function toggle(field: string) {
    setSettings(s => ({...s, [field]: !s[field as keyof typeof s]}));
  }
  function update(field: string, value: string) {
    setSettings(s => ({...s, [field]: value}));
  }

  async function save() {
    setSaving(true);
    await new Promise(r => setTimeout(r,900));
    setSaving(false);
    toast.success('Settings saved successfully!');
  }

  const ToggleRow = ({ label, desc, field }: { label: string; desc: string; field: string }) => (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.875rem 0',borderBottom:'0.5px solid var(--border)'}}>
      <div>
        <p style={{fontWeight:500,fontSize:'var(--font-size-sm)',color:'var(--text-primary)',marginBottom:'2px'}}>{label}</p>
        <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>{desc}</p>
      </div>
      <button onClick={() => toggle(field)} style={{
        width:44,height:24,borderRadius:'var(--radius-full)',border:'none',cursor:'pointer',padding:2,flexShrink:0,
        background: settings[field as keyof typeof settings] ? 'var(--primary)' : 'var(--border-strong)',
        transition:'all var(--transition-fast)',position:'relative',
      }}>
        <div style={{
          width:20,height:20,borderRadius:'50%',background:'white',
          transform: settings[field as keyof typeof settings] ? 'translateX(20px)' : 'translateX(0)',
          transition:'transform var(--transition-fast)',
        }}/>
      </button>
    </div>
  );

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2 style={{marginBottom:'0.375rem'}}>Platform Settings</h2>
        <p style={{color:'var(--text-muted)'}}>Control platform-wide configuration and system toggles</p>
      </div>

      {settings.maintenance && (
        <div style={{background:'var(--danger-light)',border:'0.5px solid var(--danger)',borderRadius:'var(--radius-sm)',padding:'0.75rem 1rem',marginBottom:'1.5rem',display:'flex',gap:'0.5rem'}}>
          <AlertTriangle size={16} color="var(--danger)"/>
          <p style={{fontSize:'var(--font-size-sm)',color:'var(--danger)',fontWeight:600}}>Maintenance mode is ON — all users will see a maintenance page.</p>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
        <Card>
          <h5 style={{marginBottom:'0.875rem'}}>Platform Controls</h5>
          <ToggleRow label="Maintenance Mode" desc="Show maintenance page to all users" field="maintenance"/>
          <ToggleRow label="Allow New Patients" desc="Accept new patient registrations" field="allowNewPatients"/>
          <ToggleRow label="Allow New Doctors" desc="Accept new doctor applications" field="allowNewDoctors"/>
          <ToggleRow label="AI Analysis Enabled" desc="Enable the skin lesion AI model" field="aiEnabled"/>
        </Card>

        <Card>
          <h5 style={{marginBottom:'0.875rem'}}>Notifications</h5>
          <ToggleRow label="Email Notifications" desc="Send automated email alerts" field="emailNotifications"/>
          <ToggleRow label="SMS Notifications" desc="Send SMS reminders to patients" field="smsNotifications"/>
        </Card>

        <Card>
          <h5 style={{marginBottom:'0.875rem'}}>Appointment Defaults</h5>
          <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
            {[
              {label:'Max Slots Per Day (per Doctor)',field:'maxSlotsPerDay',type:'number'},
              {label:'Appointment Duration (minutes)',field:'appointmentDuration',type:'number'},
              {label:'AI Confidence Threshold (%)',field:'aiConfidenceThreshold',type:'number'},
            ].map(({label,field,type}) => (
              <div className="form-group" key={field}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" value={settings[field as keyof typeof settings] as string} onChange={e => update(field,e.target.value)}/>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h5 style={{marginBottom:'0.875rem'}}>Support Contact</h5>
          <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
            <div className="form-group">
              <label className="form-label">Support Email</label>
              <input type="email" className="form-input" value={settings.supportEmail} onChange={e => update('supportEmail',e.target.value)}/>
            </div>
            <div className="form-group">
              <label className="form-label">Support Phone</label>
              <input type="text" className="form-input" value={settings.supportPhone} onChange={e => update('supportPhone',e.target.value)}/>
            </div>
          </div>
        </Card>
      </div>

      <div style={{marginTop:'1.5rem'}}>
        <Button size="lg" onClick={save} loading={saving} icon={<Save size={16}/>}>Save All Settings</Button>
      </div>
    </div>
  );
}
