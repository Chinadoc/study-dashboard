-- Unify Database: Merge locksmith_data enrichments into vehicles table
-- Strategy: Add missing columns to vehicles, then merge/update with locksmith_data

-- Step 1: Add missing columns from locksmith_data to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS prog_method TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS prog_difficulty TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS prog_tools TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS akl_supported TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS add_key_supported TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS requires_bench_unlock TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS wait_time TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS explainer_text TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS blade_type TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS remote_start TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transponder_family TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS key_category TEXT;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS completeness_score REAL;

-- Step 2: Update existing vehicles with matching locksmith_data
UPDATE vehicles SET
    prog_method = COALESCE(vehicles.programming_method, (
        SELECT ld.prog_method FROM locksmith_data ld 
        WHERE LOWER(ld.make) = LOWER(vehicles.make) 
        AND LOWER(ld.model) = LOWER(vehicles.model)
        AND ld.year BETWEEN vehicles.year_start AND vehicles.year_end
        AND ld.prog_method IS NOT NULL
        LIMIT 1
    )),
    prog_difficulty = (
        SELECT ld.prog_difficulty FROM locksmith_data ld 
        WHERE LOWER(ld.make) = LOWER(vehicles.make) 
        AND LOWER(ld.model) = LOWER(vehicles.model)
        AND ld.year BETWEEN vehicles.year_start AND vehicles.year_end
        AND ld.prog_difficulty IS NOT NULL
        LIMIT 1
    ),
    prog_tools = (
        SELECT ld.prog_tools FROM locksmith_data ld 
        WHERE LOWER(ld.make) = LOWER(vehicles.make) 
        AND LOWER(ld.model) = LOWER(vehicles.model)
        AND ld.year BETWEEN vehicles.year_start AND vehicles.year_end
        AND ld.prog_tools IS NOT NULL
        LIMIT 1
    ),
    akl_supported = (
        SELECT ld.akl_supported FROM locksmith_data ld 
        WHERE LOWER(ld.make) = LOWER(vehicles.make) 
        AND LOWER(ld.model) = LOWER(vehicles.model)
        AND ld.year BETWEEN vehicles.year_start AND vehicles.year_end
        AND ld.akl_supported IS NOT NULL
        LIMIT 1
    ),
    explainer_text = (
        SELECT ld.explainer_text FROM locksmith_data ld 
        WHERE LOWER(ld.make) = LOWER(vehicles.make) 
        AND LOWER(ld.model) = LOWER(vehicles.model)
        AND ld.year BETWEEN vehicles.year_start AND vehicles.year_end
        AND ld.explainer_text IS NOT NULL
        LIMIT 1
    )
WHERE EXISTS (
    SELECT 1 FROM locksmith_data ld 
    WHERE LOWER(ld.make) = LOWER(vehicles.make) 
    AND LOWER(ld.model) = LOWER(vehicles.model)
);

-- Step 3: Insert new records from locksmith_data not in vehicles
INSERT INTO vehicles (
    make, model, year_start, year_end, key_type, immobilizer_system,
    chip, keyway, fcc_id, frequency, buttons, battery,
    oem_part_number, programming_method, prog_method, prog_difficulty, prog_tools,
    akl_supported, explainer_text, blade_type, transponder_family,
    confidence_score, source_name, notes
)
SELECT DISTINCT
    ld.make,
    ld.model,
    ld.year as year_start,
    ld.year as year_end,
    ld.key_type,
    ld.immobilizer_system,
    ld.chip,
    ld.keyway,
    ld.fcc_id,
    ld.frequency_mhz,
    ld.buttons,
    ld.battery,
    ld.part_number,
    ld.prog_method,
    ld.prog_method,
    ld.prog_difficulty,
    ld.prog_tools,
    ld.akl_supported,
    ld.explainer_text,
    ld.blade_type,
    ld.transponder_family,
    0.7,  -- confidence score for enriched data
    'locksmith_data_import',
    'Imported from enriched locksmith_data table'
FROM locksmith_data ld
WHERE NOT EXISTS (
    SELECT 1 FROM vehicles v 
    WHERE LOWER(v.make) = LOWER(ld.make) 
    AND LOWER(v.model) = LOWER(ld.model)
    AND ld.year BETWEEN v.year_start AND v.year_end
)
-- Only insert distinct make/model/year combinations to avoid duplicates
GROUP BY ld.make, ld.model, ld.year;

-- Step 4: Update API to use only 'vehicles' table (already done)
-- The locksmith_data table will be kept as backup

-- Step 5: Rename locksmith_data to backup 
-- (run separately after verifying merge success)
-- ALTER TABLE locksmith_data RENAME TO locksmith_data_backup;
