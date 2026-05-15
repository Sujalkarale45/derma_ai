import {
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { AIScan } from '../types';

// ── Save a completed scan to Firestore ────────────────────────────────────────
export async function saveScanToFirestore(scan: AIScan): Promise<void> {
  if (!isFirebaseConfigured || !db) return; // silently skip in demo mode

  // Strip the base64 data URL from image_url — store only a short placeholder
  // (Firestore documents have a 1 MB limit; we can't store large base64 images)
  const imageNote = scan.image_url.startsWith('data:')
    ? '[local-preview]'
    : scan.image_url;

  await addDoc(collection(db, 'scans'), {
    id:              scan.id,
    patient_id:      scan.patient_id,
    image_url:       imageNote,
    predicted_class: scan.predicted_class,
    confidence:      scan.confidence,
    top3:            scan.top3,
    risk_level:      scan.risk_level,
    created_at:      serverTimestamp(),
  });
}

// ── Fetch all scans for a given patient ───────────────────────────────────────
export async function fetchScansForPatient(patientId: string): Promise<AIScan[]> {
  if (!isFirebaseConfigured || !db) return [];

  const q = query(
    collection(db, 'scans'),
    where('patient_id', '==', patientId),
    orderBy('created_at', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => {
    const d = doc.data();
    // Convert Firestore Timestamp → ISO string
    const created_at = d.created_at instanceof Timestamp
      ? d.created_at.toDate().toISOString()
      : (d.created_at ?? new Date().toISOString());

    return {
      id:              d.id ?? doc.id,
      patient_id:      d.patient_id,
      image_url:       d.image_url,
      predicted_class: d.predicted_class,
      confidence:      d.confidence,
      top3:            d.top3 ?? [],
      risk_level:      d.risk_level,
      created_at,
    } as AIScan;
  });
}

// ── Count all scans (for admin dashboard) ─────────────────────────────────────
export async function countAllScans(): Promise<number> {
  if (!isFirebaseConfigured || !db) return 0;
  const snap = await getDocs(collection(db, 'scans'));
  return snap.size;
}
