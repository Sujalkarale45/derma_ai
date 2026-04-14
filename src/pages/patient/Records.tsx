import { useState } from 'react';
import { format } from 'date-fns';
import { Download, FileText, Image, Pill } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CLASS_INFO } from '../../utils/classDescriptions';
import type { SkinLesionClass } from '../../types';

const TABS = ['AI Scans', 'Documents', 'Prescriptions'];

const MOCK_SCANS = [
  { id:'s1', predicted_class:'nv' as SkinLesionClass, confidence:0.87, risk_level:'low' as const, created_at:'2026-04-10T08:30:00', image_url:'https://picsum.photos/seed/scan1/120/120' },
  { id:'s2', predicted_class:'mel' as SkinLesionClass, confidence:0.62, risk_level:'high' as const, created_at:'2026-03-22T14:00:00', image_url:'https://picsum.photos/seed/scan2/120/120' },
  { id:'s3', predicted_class:'bkl' as SkinLesionClass, confidence:0.78, risk_level:'low' as const, created_at:'2026-02-15T10:00:00', image_url:'https://picsum.photos/seed/scan3/120/120' },
];

export default function Records() {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>My Health Records</h2>
        <p style={{ color: 'var(--text-muted)' }}>All your AI scans, documents, and prescriptions in one place</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '0.5rem 1.25rem', border: 'none', cursor: 'pointer',
            background: tab === i ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === i ? 'white' : 'var(--text-secondary)',
            fontWeight: tab === i ? 600 : 500,
            fontSize: 'var(--font-size-sm)',
            transition: 'all var(--transition-fast)',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* AI Scans */}
      {tab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {MOCK_SCANS.map(scan => (
            <Card key={scan.id} hover style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <img src={scan.image_url} alt="scan" style={{ width: 72, height: 72, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{CLASS_INFO[scan.predicted_class].name}</p>
                    <Badge variant={scan.risk_level}>{scan.risk_level}</Badge>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                    {(scan.confidence * 100).toFixed(0)}% confidence
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {format(new Date(scan.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                <Button fullWidth size="sm" icon={<Download size={13} />} variant="secondary">Download PDF</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Documents */}
      {tab === 1 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No medical documents uploaded yet.</p>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.375rem' }}>Upload lab reports, prescriptions, or other documents.</p>
          </div>
        </Card>
      )}

      {/* Prescriptions */}
      {tab === 2 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Pill size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p>No prescriptions yet.</p>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.375rem' }}>Prescriptions from your consultations will appear here.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
