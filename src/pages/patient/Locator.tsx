import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { subscribeToVerifiedDoctors } from '../../services/doctorProfileService';
import type { DoctorProfile } from '../../types';
import { MapPin, Phone, Star, CheckCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function DoctorAvatar({ doc, size = 52 }: { doc: DoctorProfile; size?: number }) {
  if (doc.avatar_url) {
    return (
      <img
        src={doc.avatar_url}
        alt={doc.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        color: 'var(--primary)',
        flexShrink: 0,
        fontSize: size * 0.4,
      }}
    >
      {doc.name.charAt(0)}
    </div>
  );
}

export default function Locator() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToVerifiedDoctors(docs => {
      setDoctors(docs);
      setLoading(false);
    });
    return unsub;
  }, []);

  const mappable = doctors.filter(d => d.lat && d.lng);

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>Nearby Dermatologists</h2>
        <p style={{ color: 'var(--text-muted)' }}>Verified skin specialists registered on DERMA AI</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)' }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading doctors…</p>
        </div>
      ) : doctors.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
          No verified doctors on the map yet. Check back after admin approval.
        </p>
      ) : (
        <>
          <div style={{ height: '500px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '0.5px solid var(--border)', marginBottom: '1.5rem' }}>
            <MapContainer center={[18.9, 76.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {mappable.map(doc => (
                <Marker key={doc.id} position={[doc.lat, doc.lng]} icon={greenIcon}>
                  <Popup>
                    <div style={{ minWidth: '180px', fontFamily: 'var(--font-sans)' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{doc.name}</strong>
                      <p style={{ fontSize: '0.75rem', color: '#666', margin: '2px 0' }}>{doc.specialisation}</p>
                      <p style={{ fontSize: '0.75rem', color: '#666', margin: '2px 0' }}>
                        {doc.rating > 0 ? `Rating: ${doc.rating} · ` : ''}{doc.city}
                      </p>
                      <Link
                        to="/patient/book"
                        style={{
                          display: 'block', marginTop: '0.5rem', padding: '0.3rem',
                          background: '#1D9E75', color: 'white', borderRadius: '4px',
                          textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none',
                        }}
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {doctors.map(doc => (
              <div key={doc.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <DoctorAvatar doc={doc} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{doc.name}</p>
                      <CheckCircle size={12} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)' }}>{doc.specialisation}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={10} /> {doc.city}
                      {doc.experience_years > 0 ? ` · ${doc.experience_years} yrs` : ''}
                    </p>
                  </div>
                </div>
                {doc.rating > 0 && (
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', marginBottom: '0.875rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        fill={i < Math.round(doc.rating) ? '#f59e0b' : 'none'}
                        color={i < Math.round(doc.rating) ? '#f59e0b' : '#ccc'}
                      />
                    ))}
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                      {doc.rating} ({doc.total_ratings})
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/patient/book" style={{ flex: 1 }}>
                    <Button fullWidth size="sm">Book</Button>
                  </Link>
                  {doc.phone && (
                    <a href={`tel:${doc.phone}`}>
                      <Button variant="ghost" size="sm" icon={<Phone size={13} />}>Call</Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
