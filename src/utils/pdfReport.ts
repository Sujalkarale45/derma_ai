import jsPDF from 'jspdf';
import type { AIScan } from '../types';
import { CLASS_INFO, RISK_COLORS } from './classDescriptions';
import { format } from 'date-fns';

export async function generateScanReport(scan: AIScan, user: { name: string; email: string }): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── Header gradient bar ──
  doc.setFillColor(8, 80, 65); // secondary --#085041
  doc.rect(0, 0, W, 32, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('DERMA AI', 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Skin Care, Anywhere.', 14, 21);

  // Report type
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const reportTitle = 'AI Skin Lesion Analysis Report';
  doc.text(reportTitle, W - 14 - doc.getTextWidth(reportTitle), 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const dateStr = format(new Date(scan.created_at), 'dd MMMM yyyy, hh:mm a');
  doc.text(dateStr, W - 14 - doc.getTextWidth(dateStr), 21);

  // ── Patient info ──
  doc.setTextColor(20, 30, 20);
  doc.setFillColor(241, 239, 232); // neutral
  doc.rect(0, 36, W, 20, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(user.name, 50, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 14, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(user.email, 50, 53);

  doc.setFont('helvetica', 'bold');
  doc.text('Report ID:', W / 2, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(scan.id, W / 2 + 24, 46);

  // ── Primary result ──
  const info = CLASS_INFO[scan.predicted_class];
  const riskColor = RISK_COLORS[scan.risk_level];

  const [r, g, b] = riskColor === '#E24B4A' ? [226, 75, 74] : riskColor === '#EF9F27' ? [239, 159, 39] : [29, 158, 117];

  let y = 65;
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.rect(14, y, W - 28, 36);

  doc.setFillColor(r, g, b);
  doc.rect(14, y, W - 28, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Primary Diagnosis: ${info.name} (${scan.predicted_class.toUpperCase()})`, 18, y + 5.5);

  doc.setTextColor(20, 30, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Confidence: ${(scan.confidence * 100).toFixed(1)}%`, 18, y + 16);
  doc.text(`Risk Level: ${scan.risk_level.toUpperCase()}`, 80, y + 16);

  // Confidence bar
  doc.setFillColor(220, 220, 220);
  doc.roundedRect(18, y + 20, W - 52, 5, 1.5, 1.5, 'F');
  doc.setFillColor(r, g, b);
  doc.roundedRect(18, y + 20, (W - 52) * scan.confidence, 5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${(scan.confidence * 100).toFixed(0)}%`, W - 30, y + 24);

  y += 44;

  // ── Description ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('What This Means:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const descLines = doc.splitTextToSize(info.description, W - 28);
  doc.text(descLines, 14, y);
  y += descLines.length * 5 + 4;

  // ── Recommended Action ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(r, g, b);
  doc.text('Recommended Action:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(20, 30, 20);
  const actionLines = doc.splitTextToSize(info.action, W - 28);
  doc.text(actionLines, 14, y);
  y += actionLines.length * 5 + 6;

  // ── Top 3 Differential ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Top 3 Differential Diagnoses:', 14, y);
  y += 7;
  scan.top3.forEach((item, i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${i + 1}. ${item.class.toUpperCase()} — ${(item.prob * 100).toFixed(1)}%`, 14, y);
    // Mini bar
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(70, y - 3.5, 60, 4, 1, 1, 'F');
    doc.setFillColor(29, 158, 117);
    doc.roundedRect(70, y - 3.5, 60 * item.prob, 4, 1, 1, 'F');
    y += 7;
  });

  // ── Disclaimer ──
  y = Math.max(y + 8, 230);
  doc.setFillColor(255, 248, 225);
  doc.rect(0, y, W, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 70, 0);
  doc.text('⚠ Medical Disclaimer', 14, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const disclaimer = 'This AI report is a SCREENING TOOL only and does not constitute a medical diagnosis. Results should be reviewed by a qualified dermatologist. DERMA AI is not a certified medical device. Always consult your doctor.';
  const dLines = doc.splitTextToSize(disclaimer, W - 28);
  doc.text(dLines, 14, y + 14);

  // ── Footer ──
  doc.setFillColor(8, 80, 65);
  doc.rect(0, 277, W, 20, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DERMA AI · Skin Care, Anywhere. · dermaai.app · support@dermaai.app', 14, 287);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, W - 14 - doc.getTextWidth(`Generated: ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`), 287);

  return doc.output('blob');
}
