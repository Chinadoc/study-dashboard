-- Fix BMW X3 Data - Correcting F-series data to G01 data
-- The current data shows HUF5661 (F-series) and HU92 (pre-2010) which is WRONG
-- 2022 BMW X3 G01 correct specs:
--   FCC: NBGIDGNG1, N5FID21A, or IYZBK1
--   Lishi: HU100 (not HU92)
--   Key Blank: HU100R
--   Chip: ID49

-- Get BMW X3 vehicle_id
-- First delete wrong entries with HUF5661
DELETE FROM vehicle_variants 
WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE make = 'BMW' AND model = 'X3'
) AND fcc_id = 'HUF5661';

-- Also delete entries with wrong HU92 lishi tool for modern X3
DELETE FROM vehicle_variants 
WHERE vehicle_id IN (
    SELECT id FROM vehicles WHERE make = 'BMW' AND model = 'X3'
) AND lishi_tool = 'HU92' AND year_start >= 2011;

-- Insert correct 2018-2025 BMW X3 (G01) data
INSERT INTO vehicle_variants (
    vehicle_id, year_start, year_end, key_type, immobilizer_system, chip,
    keyway, fcc_id, frequency, buttons, battery, oem_part_number, lishi_tool,
    programming_method, notes, verified
)
SELECT 
    id, 2018, 2025, 'Smart Key', 'BDC', 'ID49',
    'HU100R', 'NBGIDGNG1', '315 MHz', 4, 'CR2450', '66125A55D19', 'HU100',
    'OBD + Online Auth', 'G01 chassis. Requires FEM/BDC online authorization. AKL typically requires bench work.', 1
FROM vehicles WHERE make = 'BMW' AND model = 'X3';

-- Add alternative FCC ID variant 
INSERT INTO vehicle_variants (
    vehicle_id, year_start, year_end, key_type, immobilizer_system, chip,
    keyway, fcc_id, frequency, buttons, battery, oem_part_number, lishi_tool,
    programming_method, notes, verified
)
SELECT 
    id, 2018, 2025, 'Smart Key', 'BDC', 'ID49',
    'HU100R', 'N5FID21A', '315 MHz', 4, 'CR2450', '66125A40687', 'HU100',
    'OBD + Online Auth', 'G01 alternate FCC ID. Same programming as NBGIDGNG1.', 1
FROM vehicles WHERE make = 'BMW' AND model = 'X3';

-- 2022+ newer style key (IYZBK1)  
INSERT INTO vehicle_variants (
    vehicle_id, year_start, year_end, key_type, immobilizer_system, chip,
    keyway, fcc_id, frequency, buttons, battery, oem_part_number, lishi_tool,
    programming_method, notes, verified
)
SELECT 
    id, 2022, 2025, 'Smart Key', 'BDC', 'ID49',
    'HU100R', 'IYZBK1', '315 MHz', 4, 'CR2450', '66125A55D19', 'HU100',
    'OBD + Online Auth', '2022+ black style key. G01 facelift. Requires online BMW authorization.', 1
FROM vehicles WHERE make = 'BMW' AND model = 'X3';

-- Update BMW X3 guide to use correct FCC IDs
UPDATE vehicle_guides 
SET content = REPLACE(
    REPLACE(
        REPLACE(content, '**HUF5661**', '**NBGIDGNG1**'),
        '| **HUF5661** | Standard smart key |', '| **NBGIDGNG1** | Standard smart key 2018+ |'
    ),
    '| **HUF5767** | Updated smart key 2020+ |', '| **N5FID21A** | Alternate FCC ID |\n| **IYZBK1** | 2022+ facelift black design |'
)
WHERE make = 'BMW' AND model = 'X3';
