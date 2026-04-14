import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MOCK_DOCTORS } from '../../services/doctorService';
import { MapPin, Phone, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function Locator() {
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>Nearby Dermatologists</h2>
        <p style={{ color: 'var(--text-muted)' }}>Verified skin specialists near you across Maharashtra</p>
      </div>

      <div style={{ height: '500px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '0.5px solid var(--border)', marginBottom: '1.5rem' }}>
        <MapContainer center={[18.9, 76.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
          {MOCK_DOCTORS.filter(d => d.verified).map(doc => (
            <Marker key={doc.id} position={[doc.lat, doc.lng]} icon={greenIcon}>
              <Popup>
                <div style={{ minWidth: '180px', fontFamily: 'var(--font-sans)' }}>
                  <strong style={{ fontSize: '0.85rem' }}>{doc.name}</strong>
                  <p style={{ fontSize: '0.75rem', color: '#666', margin: '2px 0' }}>{doc.specialisation}</p>
                  <p style={{ fontSize: '0.75rem', color: '#666', margin: '2px 0' }}>⭐ {doc.rating} · {doc.city}</p>
                  <a href="/patient/book" style={{ display: 'block', marginTop: '0.5rem', padding: '0.3rem', background: '#1D9E75', color: 'white', borderRadius: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                    Book Appointment
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {MOCK_DOCTORS.filter(d => d.verified).map(doc => (
          <div key={doc.id} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <img src={doc.avatar_url} alt={doc.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{doc.name}</p>
                  {doc.verified && <CheckCircle size={12} color="var(--primary)" />}
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)' }}>{doc.specialisation}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={10} /> {doc.city} · {doc.experience_years} yrs
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginBottom: '0.875rem' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={i < Math.round(doc.rating) ? '#f59e0b' : 'none'} color={i < Math.round(doc.rating) ? '#f59e0b' : '#ccc'} />)}
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{doc.rating} ({doc.total_ratings})</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/patient/book" style={{ flex: 1 }}><Button fullWidth size="sm">Book</Button></Link>
              <a href={`tel:${doc.phone}`}><Button variant="ghost" size="sm" icon={<Phone size={13} />}>Call</Button></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
