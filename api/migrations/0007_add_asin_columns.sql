-- Add ASIN columns to locksmith_data table
ALTER TABLE locksmith_data ADD COLUMN primary_asin TEXT;
ALTER TABLE locksmith_data ADD COLUMN secondary_asin TEXT;
ALTER TABLE locksmith_data ADD COLUMN affiliate_url TEXT;

-- Create index for ASIN lookups
CREATE INDEX IF NOT EXISTS idx_primary_asin ON locksmith_data(primary_asin);
CREATE INDEX IF NOT EXISTS idx_secondary_asin ON locksmith_data(secondary_asin);

