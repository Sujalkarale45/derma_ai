import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { predictSkinLesion } from '../../services/aiService';
import { generateScanReport } from '../../utils/pdfReport';
import { CLASS_INFO, RISK_COLORS, TOP3_LABELS } from '../../utils/classDescriptions';
import type { AIScan } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { Upload, AlertTriangle, Download, Share2, Calendar, ImageIcon, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function UploadScan() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIScan | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length === 0) return;
    const f = accepted[0];
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function analyze() {
    if (!preview || !user) return;
    setIsAnalyzing(true);
    try {
      const base64 = preview.split(',')[1];
      const prediction = await predictSkinLesion(base64);

      const riskLevel = CLASS_INFO[prediction.class].risk;
      const scan: AIScan = {
        id: `scan-${Date.now()}`,
        patient_id: user.id,
        image_url: preview,
        predicted_class: prediction.class,
        confidence: prediction.confidence,
        top3: prediction.top3,
        created_at: new Date().toISOString(),
        risk_level: riskLevel,
      };
      setResult(scan);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function downloadReport() {
    if (!result || !user) return;
    try {
      const blob = await generateScanReport(result, user);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DERMAAI-Report-${result.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate report.');
    }
  }

  function shareWhatsApp() {
    if (!result) return;
    const text = encodeURIComponent(
      `My DERMA AI skin scan result:\n• Diagnosis: ${CLASS_INFO[result.predicted_class].name}\n• Confidence: ${(result.confidence * 100).toFixed(1)}%\n• Risk Level: ${result.risk_level.toUpperCase()}\n\nScanned on ${format(new Date(result.created_at), 'dd MMM yyyy')}.\nDERMA AI — Skin Care, Anywhere.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  const classInfo = result ? CLASS_INFO[result.predicted_class] : null;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ marginBottom: '0.375rem' }}>{t('scan.title')}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t('scan.subtitle')}</p>
      </div>

      {/* Demo notice */}
      {!import.meta.env.VITE_HF_API_URL && (
        <div style={{ background: 'var(--warning-light)', border: '0.5px solid var(--warning)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Info size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: 'var(--font-size-xs)', color: '#7a5200' }}>{t('scan.noModel')}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>

        {/* Upload area */}
        <Card>
          <h5 style={{ marginBottom: '1rem' }}>1. Upload Image</h5>

          <div {...getRootProps()} style={{
            border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'var(--accent)' : preview ? 'var(--neutral)' : 'transparent',
            transition: 'all var(--transition-base)',
            marginBottom: '1.25rem',
          }}>
            <input {...getInputProps()} />

            {preview ? (
              <div>
                <img src={preview} alt="Preview" style={{ maxHeight: '260px', borderRadius: 'var(--radius-sm)', objectFit: 'contain', margin: '0 auto', marginBottom: '0.75rem' }} />
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                  {file?.name} · {file ? (file.size / 1024).toFixed(0) : 0} KB
                </p>
              </div>
            ) : (
              <div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <ImageIcon size={24} color="var(--primary)" />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                  {isDragActive ? 'Drop your image here' : t('scan.uploadPrompt')}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{t('scan.uploadHint')}</p>
              </div>
            )}
          </div>

          <Button
            fullWidth size="lg"
            loading={isAnalyzing}
            disabled={!preview || isAnalyzing}
            onClick={analyze}
            icon={<Upload size={18} />}
          >
            {isAnalyzing ? t('scan.analyzing') : t('scan.analyzeBtn')}
          </Button>

          {preview && !isAnalyzing && (
            <Button variant="ghost" fullWidth size="sm" style={{ marginTop: '0.5rem' }} onClick={() => { setPreview(null); setFile(null); setResult(null); }}>
              Clear
            </Button>
          )}

          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--neutral)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={13} color="var(--warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {t('scan.disclaimer')}
              </p>
            </div>
          </div>
        </Card>

        {/* Result */}
        {result && classInfo && (
          <Card style={{ animation: 'fadeInUp 0.4s ease' }}>
            <h5 style={{ marginBottom: '1.25rem' }}>2. {t('scan.resultTitle')}</h5>

            {/* Primary result */}
            <div style={{
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              background: `${RISK_COLORS[result.risk_level]}18`,
              border: `1.5px solid ${RISK_COLORS[result.risk_level]}40`,
              marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    Primary Diagnosis
                  </p>
                  <h4 style={{ color: RISK_COLORS[result.risk_level], marginBottom: '0.25rem' }}>
                    {classInfo.name}
                  </h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                    {result.predicted_class.toUpperCase()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={result.risk_level} dot style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}>
                    {result.risk_level === 'high' ? '⚠ HIGH RISK' :
                     result.risk_level === 'moderate' ? '⚡ MODERATE' : '✓ LOW RISK'}
                  </Badge>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {t('scan.confidence')}: <strong>{(result.confidence * 100).toFixed(1)}%</strong>
                  </p>
                </div>
              </div>

              {/* Confidence bar */}
              <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${result.confidence * 100}%`,
                  background: RISK_COLORS[result.risk_level],
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>

            {/* Description & Action */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                {t('scan.whatThisMeans')}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '1rem' }}>
                {classInfo.description}
              </p>

              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: RISK_COLORS[result.risk_level], marginBottom: '0.375rem' }}>
                Recommended Action
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: RISK_COLORS[result.risk_level], lineHeight: 1.7 }}>
                {classInfo.action}
              </p>
            </div>

            {/* Top 3 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {t('scan.top3Title')}
              </p>
              {result.top3.map((item, idx) => (
                <div key={item.class} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', flexShrink: 0 }}>{idx+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{TOP3_LABELS[item.class]}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{(item.prob * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--neutral)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.prob * 100}%`, background: idx === 0 ? RISK_COLORS[result.risk_level] : 'var(--text-muted)', borderRadius: 'var(--radius-full)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Button fullWidth onClick={downloadReport} icon={<Download size={16} />}>
                {t('scan.downloadReport')}
              </Button>
              <Link to="/patient/book" style={{ display: 'block' }}>
                <Button fullWidth variant="secondary" icon={<Calendar size={16} />}>
                  {t('scan.bookDoctor')}
                </Button>
              </Link>
              <Button fullWidth variant="ghost" onClick={shareWhatsApp} icon={<Share2 size={16} />}>
                {t('scan.shareWhatsApp')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
