import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Star, Filter, CheckCircle, Phone } from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/doctorService';
import type { DoctorProfile } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// Custom map marker
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function FindDoctor() {
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selected, setSelected] = useState<DoctorProfile | null>(null);
  const [filtered, setFiltered] = useState(MOCK_DOCTORS);

  useEffect(() => {
    let result = MOCK_DOCTORS;
    if (verifiedOnly) result = result.filter(d => d.verified);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.specialisation.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, verifiedOnly]);

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary))', padding: '3rem 0 2rem' }}>
        <div className="container">
          <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Find a Dermatologist</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
            Search verified skin specialists across Maharashtra and beyond
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by name, city, or specialisation..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem', background: 'white' }}
              />
            </div>
            <button onClick={() => setVerifiedOnly(!verifiedOnly)} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1rem',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-sm)',
              background: verifiedOnly ? 'white' : 'transparent',
              color: verifiedOnly ? 'var(--primary)' : 'white',
              cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}>
              <CheckCircle size={14} />
              Verified Only
            </button>
          </div>
        </div>
      </div>

      {/* Content: Map + List */}
      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - var(--navbar-height) - 180px)', minHeight: '500px' }}>
        
        {/* Doctor List */}
        <div style={{ width: '360px', overflowY: 'auto', flexShrink: 0, borderRight: '0.5px solid var(--border)' }}>
          <div style={{ padding: '1rem', borderBottom: '0.5px solid var(--border)', background: 'var(--neutral)' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filtered.map(doc => (
            <div key={doc.id} onClick={() => setSelected(doc)} style={{
              padding: '1rem 1.25rem',
              cursor: 'pointer',
              background: selected?.id === doc.id ? 'var(--accent)' : 'var(--bg-card)',
              borderBottom: '0.5px solid var(--border)',
              transition: 'background var(--transition-fast)',
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <img src={doc.avatar_url} alt={doc.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.125rem' }}>
                    <h6 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }} >{doc.name}</h6>
                    {doc.verified && <CheckCircle size={12} color="var(--primary)" />}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', marginBottom: '0.25rem' }}>{doc.specialisation}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{doc.city}, {doc.state}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.125rem', marginTop: '0.375rem', alignItems: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} fill={i < Math.round(doc.rating) ? '#f59e0b' : 'none'} color={i < Math.round(doc.rating) ? '#f59e0b' : '#ccc'} />
                    ))}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{doc.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MapPin size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p>No doctors found matching your search.</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={[18.9, 76.5]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filtered.map(doc => (
              <Marker
                key={doc.id}
                position={[doc.lat, doc.lng]}
                icon={doc.verified ? greenIcon : orangeIcon}
                eventHandlers={{ click: () => setSelected(doc) }}
              >
                <Popup>
                  <div style={{ minWidth: '200px', fontFamily: 'var(--font-sans)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <img src={doc.avatar_url} alt={doc.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{doc.name}</strong>
                        <p style={{ fontSize: '0.75rem', color: '#666' }}>{doc.specialisation}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>⭐ {doc.rating} · {doc.city}</p>
                    <a href="/patient/book" style={{
                      display: 'block', textAlign: 'center', padding: '0.375rem',
                      background: '#1D9E75', color: 'white', borderRadius: '6px',
                      fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                    }}>
                      Book Appointment
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Selected doctor panel */}
          {selected && (
            <div style={{
              position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem',
              background: 'var(--bg-card)',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '1.25rem',
              zIndex: 1000,
              animation: 'fadeInUp 0.2s ease',
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <img src={selected.avatar_url} alt={selected.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h5 style={{ fontSize: 'var(--font-size-base)' }}>{selected.name}</h5>
                    {selected.verified && <Badge variant="verified" dot>Verified</Badge>}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary)' }}>{selected.specialisation} · {selected.experience_years} yrs exp.</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selected.hospital}, {selected.city}</p>
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.375rem', alignItems: 'center' }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={i < Math.round(selected.rating) ? '#f59e0b' : 'none'} color={i < Math.round(selected.rating) ? '#f59e0b' : '#ccc'} />)}
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{selected.rating} ({selected.total_ratings} reviews)</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem' }}>
                <Link to="/patient/book" style={{ flex: 1 }}>
                  <Button fullWidth size="sm">Book Appointment</Button>
                </Link>
                <a href={`tel:${selected.phone}`}>
                  <Button variant="ghost" size="sm" icon={<Phone size={14} />}>Call</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
