-- Add ASIN (Amazon Standard Identification Number) column to FCC registry
-- This allows storing Amazon product IDs for each FCC ID to display product images

ALTER TABLE fcc_registry ADD COLUMN asin TEXT;

-- Create index for ASIN lookups
CREATE INDEX IF NOT EXISTS idx_fcc_asin ON fcc_registry(asin);

-- Also add ASIN to the main vehicle_variants table for variant-specific products
ALTER TABLE vehicle_variants ADD COLUMN amazon_asin TEXT;

-- Some example ASIN updates (these would be populated with real data)
-- UPDATE fcc_registry SET asin = 'B07XXXXX' WHERE fcc_id = 'SY5HIFGE04';
