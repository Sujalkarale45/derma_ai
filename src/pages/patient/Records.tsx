import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, FileText, Pill, Loader, ScanLine } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { CLASS_INFO } from '../../utils/classDescriptions';
import { fetchScansForPatient } from '../../services/scanService';
import { generateScanReport } from '../../utils/pdfReport';
import { useAuthStore } from '../../store/authStore';
import type { AIScan, SkinLesionClass } from '../../types';
import toast from 'react-hot-toast';

const TABS = ['AI Scans', 'Documents', 'Prescriptions'];

export default function Records() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [scans, setScans] = useState<AIScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchScansForPatient(user.id)
      .then(setScans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  async function downloadReport(scan: AIScan) {
    if (!user) return;
    try {
      const blob = await generateScanReport(scan, user);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DERMAAI-Report-${scan.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate report.');
    }
  }

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
            {t}{i === 0 && !loading && scans.length > 0 ? ` (${scans.length})` : ''}
          </button>
        ))}
      </div>

      {/* AI Scans Tab */}
      {tab === 0 && (
        <>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)' }}>
              <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
              <p>Loading your scan reports…</p>
            </div>
          ) : scans.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <ScanLine size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>No scan reports yet</p>
                <p style={{ fontSize: 'var(--font-size-sm)' }}>
                  Upload your first skin image to get an AI analysis.<br />
                  Your reports will be saved here automatically.
                </p>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {scans.map(scan => (
                <Card key={scan.id} hover style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    {/* Show placeholder if image was stripped */}
                    {scan.image_url && scan.image_url !== '[local-preview]' && scan.image_url.startsWith('data:') ? (
                      <img src={scan.image_url} alt="scan" style={{ width: 72, height: 72, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-sm)', background: 'var(--neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ScanLine size={28} color="var(--text-muted)" />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                        <p style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                          {CLASS_INFO[scan.predicted_class as SkinLesionClass]?.name ?? scan.predicted_class.toUpperCase()}
                        </p>
                        <Badge variant={scan.risk_level}>{scan.risk_level}</Badge>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        {(scan.confidence * 100).toFixed(0)}% confidence
                      </p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {format(new Date(scan.created_at), 'dd MMM yyyy · hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                    <Button
                      fullWidth size="sm"
                      icon={<Download size={13} />}
                      variant="secondary"
                      onClick={() => downloadReport(scan)}
                      disabled={scan.confidence < 0.60}
                      title={scan.confidence < 0.60 ? 'Confidence too low to generate report' : 'Download PDF report'}
                    >
                      Download PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
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
