-- Add professional data columns to vehicles table (Unified Schema)
ALTER TABLE vehicles ADD COLUMN mechanical_spec TEXT;
ALTER TABLE vehicles ADD COLUMN spaces INTEGER;
ALTER TABLE vehicles ADD COLUMN depths TEXT;
ALTER TABLE vehicles ADD COLUMN code_series TEXT;
ALTER TABLE vehicles ADD COLUMN ignition_retainer TEXT;
ALTER TABLE vehicles ADD COLUMN service_notes_pro TEXT;
