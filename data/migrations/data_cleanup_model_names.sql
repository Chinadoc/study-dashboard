-- Phase 1: Model Name Cleanup Migration
-- Add clean_model column and extract base model names from product descriptions
-- Created: 2024-12-17

-- Step 1: Add clean_model column if not exists
ALTER TABLE locksmith_data ADD COLUMN IF NOT EXISTS clean_model TEXT;

-- Step 2: Extract clean model names
-- Remove common suffixes like "Smart Remote Key Fob", "Remote Head Key", etc.
-- Pattern: Model name is typically the first 1-2 words before key-related terms

-- Update clean_model by removing common suffix patterns
UPDATE locksmith_data 
SET clean_model = TRIM(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                REPLACE(model, ' Smart Remote Key Fob 3B', ''),
                                ' Smart Remote Key Fob 4B w', ''),
                              ' Smart Remote Key Fob 5B w', ''),
                            ' Smart Remote Key Fob BT4T 5B w', ''),
                          ' Smart Remote Key Fob CJ5T 5B w', ''),
                        ' Smart Remote Key Fob BT4T HIGH-SECURITY Insert 5B w', ''),
                      ' Remote Head Key Fob 3B', ''),
                    ' Remote Head Key Fob 4B w', ''),
                  ' Remote Head Key Fob 40 Bit 4B w', ''),
                ' Keyless Entry Remote Key Fob 3B', ''),
              ' Keyless Entry Remote Key Fob 4B w', ''),
            ' High Security Remote Head Key Fob 3B', ''),
          ' High Security Remote Head Key Fob 4B', ''),
        ' High Security Remote Flip Key Fob 3B', ''),
      ' Transponder Key Blank', ''),
    ' 80 Bit Remote Head Key Fob 3B', ''),
  ' 80 Bit Remote Head Key Fob  3B', '')
);

-- Step 3: Handle "1-Way" variants - extract base name and set key_variant
ALTER TABLE locksmith_data ADD COLUMN IF NOT EXISTS key_variant TEXT;

UPDATE locksmith_data 
SET key_variant = '1-Way',
    clean_model = REPLACE(clean_model, ' 1-Way', '')
WHERE clean_model LIKE '%1-Way%';

-- Step 4: Additional cleanup for remaining patterns
UPDATE locksmith_data 
SET clean_model = TRIM(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(clean_model, ' 2-Way PEPS', ''),
            ' PEPS', ''),
          ' ST', ''),
        ' Raptor', ''),
      ' STX', ''),
    ' Custom', '')
)
WHERE clean_model LIKE '%PEPS%' 
   OR clean_model LIKE '%ST%' 
   OR clean_model LIKE '%Raptor%'
   OR clean_model LIKE '%STX%';

-- Also set variants for these
UPDATE locksmith_data SET key_variant = '2-Way PEPS' WHERE model LIKE '%2-Way PEPS%';
UPDATE locksmith_data SET key_variant = 'PEPS' WHERE model LIKE '%PEPS%' AND key_variant IS NULL;
UPDATE locksmith_data SET key_variant = 'ST' WHERE model LIKE '% ST %' OR model LIKE '% ST';
UPDATE locksmith_data SET key_variant = 'Raptor' WHERE model LIKE '%Raptor%';
UPDATE locksmith_data SET key_variant = 'STX' WHERE model LIKE '%STX%';

-- Step 5: Create index for fast lookups on clean_model
CREATE INDEX IF NOT EXISTS idx_clean_model ON locksmith_data(clean_model);

-- Step 6: Update completeness score to include clean_model
-- (Already covered by existing data_completeness logic if we track it)

-- Verify results
-- SELECT make, model, clean_model, key_variant FROM locksmith_data WHERE make = 'Ford' GROUP BY make, model LIMIT 20;
