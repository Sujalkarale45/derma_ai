import {
  collection, getDocs, query, where, orderBy, doc, updateDoc, setDoc,
  serverTimestamp, Timestamp, onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { DoctorProfile } from '../types';

// ── Save doctor profile (doc id = Supabase user id) ──────────────────────────
export async function saveDoctorProfile(profile: Partial<DoctorProfile>): Promise<void> {
  if (!isFirebaseConfigured || !db || !profile.id) return;

  await setDoc(
    doc(db, 'doctor_profiles', profile.id),
    {
      ...profile,
      id: profile.id,
      verified: false,
      rating: profile.rating ?? 0,
      total_ratings: profile.total_ratings ?? 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    { merge: true },
  );
}

// ── Fetch all verified doctors ───────────────────────────────────────────────
export async function fetchVerifiedDoctors(): Promise<DoctorProfile[]> {
  if (!isFirebaseConfigured || !db) return [];

  const q = query(
    collection(db, 'doctor_profiles'),
    where('verified', '==', true),
    orderBy('rating', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => firestoreDocToDoctor(d.id, d.data()));
}

// ── Realtime: verified doctors (patient Find Doctor / Book Appointment) ──────
export function subscribeToVerifiedDoctors(
  callback: (doctors: DoctorProfile[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'doctor_profiles'),
    where('verified', '==', true),
    orderBy('rating', 'desc'),
  );

  return onSnapshot(
    q,
    snap => {
      callback(snap.docs.map(d => firestoreDocToDoctor(d.id, d.data())));
    },
    err => {
      console.error('subscribeToVerifiedDoctors:', err);
      callback([]);
    },
  );
}

// ── Fetch ALL doctors (for admin) ────────────────────────────────────────────
export async function fetchAllDoctors(): Promise<(DoctorProfile & { docRef: string })[]> {
  if (!isFirebaseConfigured || !db) return [];
  const snap = await getDocs(collection(db, 'doctor_profiles'));
  return snap.docs.map(d => ({ ...firestoreDocToDoctor(d.id, d.data()), docRef: d.id }));
}

// ── Approve a doctor ─────────────────────────────────────────────────────────
export async function approveDoctor(docRef: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await updateDoc(doc(db, 'doctor_profiles', docRef), {
    verified: true,
    updated_at: serverTimestamp(),
  });
}

// ── Reject / delete a doctor profile ────────────────────────────────────────
export async function rejectDoctor(docRef: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, 'doctor_profiles', docRef));
}

// ── Count pending (unverified) doctor registrations ──────────────────────────
export async function countPendingDoctors(): Promise<number> {
  if (!isFirebaseConfigured || !db) return 0;
  const q = query(collection(db, 'doctor_profiles'), where('verified', '==', false));
  const snap = await getDocs(q);
  return snap.size;
}

// ── Helper ───────────────────────────────────────────────────────────────────
function firestoreDocToDoctor(id: string, d: Record<string, unknown>): DoctorProfile {
  const tsToStr = (v: unknown) =>
    v instanceof Timestamp ? v.toDate().toISOString() : (v as string ?? new Date().toISOString());

  return {
    id: (d.id as string) ?? id,
    name: (d.name as string) ?? '',
    email: (d.email as string) ?? '',
    role: 'doctor',
    phone: (d.phone as string) ?? '',
    location: `${d.city ?? ''}, ${d.state ?? ''}`,
    language_pref: (d.language_pref as string) ?? 'en',
    avatar_url: d.avatar_url as string | undefined,
    specialisation: (d.specialisation as string) ?? '',
    reg_number: (d.reg_number as string) ?? '',
    experience_years: (d.experience_years as number) ?? 0,
    hospital: (d.hospital as string) ?? '',
    city: (d.city as string) ?? '',
    state: (d.state as string) ?? '',
    bio: d.bio as string | undefined,
    lat: (d.lat as number) ?? 0,
    lng: (d.lng as number) ?? 0,
    verified: (d.verified as boolean) ?? false,
    rating: (d.rating as number) ?? 0,
    total_ratings: (d.total_ratings as number) ?? 0,
    available_days: (d.available_days as number[]) ?? [1, 2, 3, 4, 5],
    languages: (d.languages as string[]) ?? ['en'],
    created_at: tsToStr(d.created_at),
    updated_at: tsToStr(d.updated_at),
  };
}

// ── Live subscription: all doctors (for admin) ────────────────────────────────
export function subscribeToAllDoctors(
  callback: (doctors: (DoctorProfile & { docRef: string })[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }
  const q = collection(db, 'doctor_profiles');
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...firestoreDocToDoctor(d.id, d.data()), docRef: d.id })));
  });
}

// ── Live subscription: doctor profile by Supabase user id ────────────────────
export function subscribeToDoctorByUserId(
  userId: string,
  callback: (profile: (DoctorProfile & { docRef: string }) | null) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    callback(null);
    return () => {};
  }

  const q = query(collection(db, 'doctor_profiles'), where('id', '==', userId));
  return onSnapshot(q, snap => {
    if (snap.empty) {
      callback(null);
    } else {
      const d = snap.docs[0];
      callback({ ...firestoreDocToDoctor(d.id, d.data()), docRef: d.id });
    }
  });
}
