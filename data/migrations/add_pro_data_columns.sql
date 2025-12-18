-- Add professional data columns to locksmith_data table
ALTER TABLE locksmith_data ADD COLUMN mechanical_spec TEXT;
ALTER TABLE locksmith_data ADD COLUMN spaces INTEGER;
ALTER TABLE locksmith_data ADD COLUMN depths TEXT;
ALTER TABLE locksmith_data ADD COLUMN code_series TEXT;
ALTER TABLE locksmith_data ADD COLUMN ignition_retainer TEXT;
ALTER TABLE locksmith_data ADD COLUMN service_notes_pro TEXT;
