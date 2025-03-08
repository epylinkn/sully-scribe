ALTER TABLE visits
  ADD COLUMN clinician_language text,
  ADD COLUMN patient_language text,
  ADD COLUMN ended_at timestamp with time zone,
  ADD COLUMN analyzed_at timestamp with time zone;
