import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { Save, User, Phone, MapPin, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

export default function PatientProfile() {
  const { user, updateUser } = useAuthStore();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '', language_pref: user?.language_pref || 'en' });
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    updateUser(form);
    if (form.language_pref !== user?.language_pref) {
      i18n.changeLanguage(form.language_pref);
    }
    setLoading(false);
    toast.success('Profile updated successfully!');
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2>My Profile</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        <Card style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <Avatar name={user?.name || ''} src={user?.avatar_url} size={80} style={{ margin: '0 auto 1rem' }} />
          <h4 style={{ marginBottom: '0.25rem' }}>{user?.name}</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary)', marginBottom: '0.5rem' }}>Patient</p>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{user?.email}</p>
        </Card>

        <Card>
          <h5 style={{ marginBottom: '1.25rem' }}>Personal Information</h5>
          <form onSubmit={save}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXXXXXXX" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Village, District" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Preferred Language</label>
                <select className="form-input" value={form.language_pref} onChange={e => setForm(f => ({ ...f, language_pref: e.target.value }))}>
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
                </select>
              </div>
            </div>
            <Button type="submit" loading={loading} icon={<Save size={16} />}>Save Changes</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
