-- ============================================================
-- DERMA AI — Supabase Migration 002
-- Appointments constraints, calendar_event_id, realtime
-- ============================================================

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Prevent double-booking the same doctor slot (excluding cancelled)
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_doctor_slot_active
  ON appointments (doctor_id, slot_datetime)
  WHERE status IS DISTINCT FROM 'cancelled';

ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show'));

-- Patients insert without meet_link; server (edge function) sets meet_link via service role
DROP POLICY IF EXISTS "Patient can insert own appointments" ON appointments;

CREATE POLICY "Patient can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    AND (meet_link IS NULL OR meet_link = '')
  );

-- Enable Realtime (safe if already added — ignore duplicate errors in dashboard if needed)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
