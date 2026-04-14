import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import VideoCall from '../../components/video/VideoCall';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import type { AIScan } from '../../types';
import { CLASS_INFO, RISK_COLORS } from '../../utils/classDescriptions';
import { Video, AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ── Generate a 6-char alphanumeric room code ── */
function genRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Consult() {
  const { user } = useAuthStore();

  /* Grab the last scan result from sessionStorage if available */
  const [scanResult, setScanResult] = useState<AIScan | null>(null);
  const [roomId, setRoomId]         = useState<string>(genRoomId);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('dermaai_last_scan');
      if (raw) setScanResult(JSON.parse(raw));
    } catch {/* ignore */}
  }, []);

  const regenerateCode = () => {
    if (callStarted) {
      toast.error('End the current call before generating a new code.');
      return;
    }
    setRoomId(genRoomId());
    toast.success('New room code generated.');
  };

  const classInfo = scanResult ? CLASS_INFO[scanResult.predicted_class] : null;
  const riskColor = scanResult ? RISK_COLORS[scanResult.risk_level] : 'var(--primary)';

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>Consult a Doctor</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Start a live video consultation with a dermatologist.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem' }}>

        {/* ── Left: pre-call info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* How it works */}
          <Card>
            <h6 style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={16} color="var(--primary)" /> How it works
            </h6>
            {[
              { n: '1', t: 'Start the call below', d: 'Your camera will turn on and a Room Code will appear.' },
              { n: '2', t: 'Share the Room Code', d: 'Read or copy the code and give it to your doctor.' },
              { n: '3', t: 'Doctor joins', d: 'The doctor enters your code and the video session begins.' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '0.7rem', fontWeight: 800,
                }}>
                  {step.n}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {step.t}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {step.d}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          {/* Scan summary if present */}
          {scanResult && classInfo && (
            <Card style={{ border: `1.5px solid ${riskColor}38`, background: `${riskColor}08` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={14} color={riskColor} />
                <h6 style={{ margin: 0, color: riskColor, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Your AI Scan — Will be shared
                </h6>
              </div>
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                {scanResult.image_url && (
                  <img
                    src={scanResult.image_url}
                    alt="scan"
                    style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: riskColor, fontSize: 'var(--font-size-sm)' }}>
                      {classInfo.name}
                    </span>
                    <Badge variant={scanResult.risk_level}>
                      {scanResult.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Confidence: <strong>{(scanResult.confidence * 100).toFixed(1)}%</strong>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!scanResult && (
            <Card style={{ background: 'var(--neutral)', border: '1px dashed var(--border-strong)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                No scan result found. Run an AI scan first to share results with your doctor.
              </p>
              <Link to="/patient/upload-scan">
                <Button size="sm" variant="secondary" icon={<ChevronRight size={13} />} iconRight>
                  Go to AI Scan
                </Button>
              </Link>
            </Card>
          )}

          {/* Room code controls (pre-call) */}
          {!callStarted && (
            <Card>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                    Your Room Code
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.3em', color: 'var(--primary)' }}>
                    {roomId}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <Button
                  fullWidth
                  icon={<Video size={16} />}
                  onClick={() => setCallStarted(true)}
                  id="patient-start-call-btn"
                >
                  Start Call
                </Button>
                <Button
                  variant="ghost"
                  icon={<RefreshCw size={14} />}
                  onClick={regenerateCode}
                  title="Generate new code"
                  style={{ flexShrink: 0 }}
                >
                  New Code
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* ── Right: Video call panel ── */}
        <Card style={{ padding: '1.25rem' }}>
          {callStarted ? (
            <VideoCall
              roomId={roomId}
              role="patient"
              patientName={user?.name ?? 'Patient'}
              doctorName="Doctor"
              scanResult={scanResult}
              onEnd={() => setCallStarted(false)}
            />
          ) : (
            <div style={{
              minHeight: 340, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '1rem',
              background: 'var(--neutral)', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--primary),var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Video size={28} color="white" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h5 style={{ marginBottom: '0.375rem' }}>Ready to Connect?</h5>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', maxWidth: 280 }}>
                  Click <strong>Start Call</strong> on the left to open your camera and generate a Room Code for your doctor.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
