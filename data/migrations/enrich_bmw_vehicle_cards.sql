-- BMW Per-Vehicle Enrichment (Phase B)
-- Enriches priority models with FCC ID, OEM Part Number, Battery, and Buttons.
-- Source: BMW Locksmith Guide Development, BMW Research Integration Research.

-- ═══════════════════════════════════════════════════════════════════════════
-- 3-SERIES ENRICHMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- F30 (2012-2018)
UPDATE vehicles SET
    fcc_id = 'NBGIDGNG1',
    oem_part_number = '66126805993',
    battery = 'CR2450',
    buttons = 4,
    key_blank = 'HU100R'
WHERE make = 'BMW' 
  AND model IN ('3 Series', '3-Series') 
  AND year >= 2012 AND year <= 2018;

-- G20 (2019-2025)
UPDATE vehicles SET
    fcc_id = 'N5F-ID21A',
    oem_part_number = '66122471611',
    battery = 'CR2032',
    buttons = 4,
    key_blank = 'HU66'
WHERE make = 'BMW' 
  AND model IN ('3 Series', '3-Series') 
  AND year >= 2019;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5-SERIES ENRICHMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- F10 (2011-2016)
UPDATE vehicles SET
    fcc_id = 'YGOHUF5662',
    oem_part_number = '66129268486',
    battery = 'CR2450',
    buttons = 4,
    key_blank = 'HU100R'
WHERE make = 'BMW' 
  AND model IN ('5 Series', '5-Series') 
  AND year >= 2011 AND year <= 2016;

-- ═══════════════════════════════════════════════════════════════════════════
-- X3 ENRICHMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- F25 (2011-2017)
UPDATE vehicles SET
    fcc_id = 'YGOHUF5662',
    oem_part_number = '66129268486',
    battery = 'CR2450',
    buttons = 4,
    key_blank = 'HU100R'
WHERE make = 'BMW' 
  AND model = 'X3' 
  AND year >= 2011 AND year <= 2017;

-- G01 (2018-2025)
UPDATE vehicles SET
    fcc_id = 'N5F-ID21A',
    oem_part_number = '66122471611',
    battery = 'CR2032',
    buttons = 4,
    key_blank = 'HU66'
WHERE make = 'BMW' 
  AND model = 'X3' 
  AND year >= 2018;
