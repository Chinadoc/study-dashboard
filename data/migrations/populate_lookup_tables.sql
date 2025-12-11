-- Populate lookup tables from existing locksmith_data
-- Run AFTER add_fk_columns.sql

-- ============================================
-- STEP 6: Populate vehicles lookup table
-- ============================================

INSERT OR IGNORE INTO vehicles (make, make_norm, model, model_norm)
SELECT DISTINCT 
    make, 
    make_norm, 
    model, 
    LOWER(REPLACE(REPLACE(model, ' ', '_'), '-', '_'))
FROM locksmith_data
WHERE make IS NOT NULL 
  AND make != '' 
  AND model IS NOT NULL 
  AND model != '';

-- ============================================
-- STEP 7: Populate fcc_ids lookup table
-- ============================================

INSERT OR IGNORE INTO fcc_ids (fcc_id, frequency, frequency_mhz, buttons, battery, remote_start)
SELECT DISTINCT 
    fcc_id, 
    frequency, 
    frequency_mhz, 
    buttons, 
    battery, 
    remote_start
FROM locksmith_data
WHERE fcc_id IS NOT NULL 
  AND fcc_id != '' 
  AND fcc_id != 'N/A';

-- ============================================
-- STEP 8: Populate keyways lookup table
-- ============================================

INSERT OR IGNORE INTO keyways (keyway, keyway_norm, blade_type)
SELECT DISTINCT 
    keyway, 
    keyway_norm, 
    blade_type
FROM locksmith_data
WHERE keyway IS NOT NULL 
  AND keyway != '' 
  AND keyway != 'N/A';

-- Also add keyways from lishi_tools
INSERT OR IGNORE INTO keyways (keyway, keyway_norm)
SELECT DISTINCT 
    keyway,
    LOWER(REPLACE(keyway, ' ', '_'))
FROM lishi_tools
WHERE keyway IS NOT NULL 
  AND keyway != '';
