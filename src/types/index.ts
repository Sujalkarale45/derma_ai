export type UserRole = 'patient' | 'doctor' | 'admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type SkinLesionClass = 'mel' | 'nv' | 'bcc' | 'akiec' | 'bkl' | 'df' | 'vasc';
export type RiskLevel = 'low' | 'moderate' | 'high';

// ── Base User ──────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  location?: string;       // "Village, District, State" for patients
  language_pref?: string;  // 'en' | 'hi' | 'mr'
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// ── Doctor extended profile ────────────────────────────────────────────────
export interface DoctorProfile extends User {
  specialisation: string;
  reg_number: string;
  experience_years: number;
  hospital: string;
  city: string;
  state: string;
  bio?: string;
  lat: number;
  lng: number;
  verified: boolean;
  rating: number;
  total_ratings: number;
  available_days: number[];  // 0=Sun, 1=Mon, …, 6=Sat
  languages: string[];
}

// ── Patient record ─────────────────────────────────────────────────────────
export interface PatientRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  type: 'scan' | 'prescription' | 'lab_report' | 'note';
  title: string;
  content?: string;
  file_url?: string;
  created_at: string;
}

// ── Appointment ────────────────────────────────────────────────────────────
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_datetime: string;      // ISO 8601
  status: AppointmentStatus;
  meet_link?: string;
  notes?: string;
  prescription?: string;
  scan_id?: string;
  created_at: string;
  updated_at: string;
}

// ── AI Scan ────────────────────────────────────────────────────────────────
export interface AIScan {
  id: string;
  patient_id: string;
  image_url: string;
  predicted_class: SkinLesionClass;
  confidence: number;          // 0.0 – 1.0
  top3: Array<{
    class: SkinLesionClass;
    prob: number;
  }>;
  risk_level: RiskLevel;
  doctor_reviewed?: boolean;
  doctor_notes?: string;
  created_at: string;
}

// ── Availability slot ──────────────────────────────────────────────────────
export interface TimeSlot {
  id: string;
  doctor_id: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM
  is_booked: boolean;
  appointment_id?: string;
}

// ── Notification ───────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'appointment' | 'scan_result' | 'reminder' | 'system';
  read: boolean;
  created_at: string;
}
