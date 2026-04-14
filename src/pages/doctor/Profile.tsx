import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Save, ShieldCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name||'', phone: user?.phone||'',
    bio: 'Specialist in dermoscopy, skin cancer screening, and cosmetic dermatology.',
    hospital: 'Sahyadri Specialty Hospital', city: 'Pune', specialisation: 'Dermatology & Venereology', experience_years: '12',
  });
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r,800));
    setLoading(false);
    toast.success('Profile updated!');
  }

  return (
    <div>
      <div style={{marginBottom:'1.75rem'}}>
        <h2>Doctor Profile</h2>
        <p style={{color:'var(--text-muted)'}}>Your credentials, specialisation, and public profile</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:'1.5rem',alignItems:'start'}}>
        <Card style={{textAlign:'center',padding:'2rem 1.5rem'}}>
          <Avatar name={user?.name||''} src={user?.avatar_url} size={80} style={{margin:'0 auto 1rem'}}/>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',marginBottom:'0.25rem'}}>
            <h5>{user?.name}</h5>
            <ShieldCheck size={16} color="var(--primary)"/>
          </div>
          <Badge variant="verified" dot style={{marginBottom:'0.75rem'}}>Verified Doctor</Badge>
          <p style={{fontSize:'var(--font-size-xs)',color:'var(--text-muted)'}}>{user?.email}</p>
        </Card>

        <Card>
          <h5 style={{marginBottom:'1.25rem'}}>Professional Information</h5>
          <form onSubmit={save}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Specialisation</label>
                <input className="form-input" value={form.specialisation} onChange={e => setForm(f=>({...f,specialisation:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input type="number" className="form-input" value={form.experience_years} onChange={e => setForm(f=>({...f,experience_years:e.target.value}))}/>
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Hospital / Clinic</label>
                <input className="form-input" value={form.hospital} onChange={e => setForm(f=>({...f,hospital:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => setForm(f=>({...f,city:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))}/>
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Professional Bio</label>
                <textarea className="form-input" rows={4} value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} style={{resize:'vertical'}}/>
              </div>
            </div>
            <Button type="submit" loading={loading} icon={<Save size={16}/>}>Save Profile</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
