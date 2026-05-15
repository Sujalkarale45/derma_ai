-- ============================================================
-- DERMA AI — Supabase Migration 001
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Ensure appointments table has all required columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS doctor_name    TEXT,
  ADD COLUMN IF NOT EXISTS patient_name   TEXT,
  ADD COLUMN IF NOT EXISTS specialisation TEXT,
  ADD COLUMN IF NOT EXISTS meet_link      TEXT,
  ADD COLUMN IF NOT EXISTS notes          TEXT,
  ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ DEFAULT now();

-- ─────────────────────────────────────────────────────────────
-- 2. Auto-update `updated_at` on every row change
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists, then recreate (idempotent)
DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────
-- 3. Enable Row Level Security on appointments
-- ─────────────────────────────────────────────────────────────
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop old policies (safe to run again)
DROP POLICY IF EXISTS "Patient can insert own appointments"    ON appointments;
DROP POLICY IF EXISTS "Patient can read own appointments"      ON appointments;
DROP POLICY IF EXISTS "Doctor can read own appointments"       ON appointments;
DROP POLICY IF EXISTS "Doctor can update own appointments"     ON appointments;
DROP POLICY IF EXISTS "Admin has full access to appointments"  ON appointments;

-- 3a. Patient: can INSERT and SELECT their own appointments
CREATE POLICY "Patient can insert own appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patient can read own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

-- 3b. Doctor: can SELECT and UPDATE appointments assigned to them
CREATE POLICY "Doctor can read own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctor can update own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- 3c. Admin: full access (matches role stored in users table)
CREATE POLICY "Admin has full access to appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 4. Enable RLS on users table (if not already)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile"   ON users;
DROP POLICY IF EXISTS "Users can update own profile"  ON users;
DROP POLICY IF EXISTS "Users can insert own profile"  ON users;
DROP POLICY IF EXISTS "Admin can read all users"      ON users;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. Enable Supabase Realtime for appointments table
--    (Required for postgres_changes subscription to work)
-- ─────────────────────────────────────────────────────────────
-- Run this in Supabase Dashboard → Database → Replication
-- OR via SQL (Supabase manages this through their UI):
-- ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- NOTE: If you see "publication does not exist" run this first:
-- CREATE PUBLICATION supabase_realtime;
-- Then: ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- ─────────────────────────────────────────────────────────────
-- 6. Verify the setup
-- ─────────────────────────────────────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'appointments'
-- ORDER BY ordinal_position;
