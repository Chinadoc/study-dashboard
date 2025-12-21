-- Migration: add_stellantis_rf_data.sql
-- Purpose: Add Continental vs Giobert FCC ID mapping for Stellantis Small Wide platform
-- Source: Comprehensive RF architecture research (Dec 2025)

-- ============================================================================
-- ADD NEW COLUMNS FOR RF SYSTEM TRACKING
-- ============================================================================

-- Add rf_system column to track manufacturer (Continental/Giobert)
ALTER TABLE vehicles ADD COLUMN rf_system TEXT;
-- Values: 'Continental', 'Giobert', 'Split-Year' (for 2022 Renegade)

-- Add part_number_prefix column for quick filtering
ALTER TABLE vehicles ADD COLUMN part_number_prefix TEXT;
-- Values: '6' (Continental), '7' (Giobert)

-- ============================================================================
-- JEEP RENEGADE - CONTINENTAL ERA (2015-2021)
-- ============================================================================

UPDATE vehicles
SET 
    rf_system = 'Continental',
    part_number_prefix = '6',
    fcc_id = 'M3N-40821302',
    frequency = '433.92 MHz',
    chip = 'Hitag AES (4A)',
    oem_part_number = CASE 
        WHEN year_start >= 2019 THEN '6BY88DX9AA'
        ELSE '68266733AA'
    END,
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Continental RF System. Part numbers start with 6.'
WHERE make = 'Jeep' 
  AND model LIKE '%Renegade%' 
  AND year_start >= 2015 
  AND year_end <= 2021;

-- ============================================================================
-- JEEP RENEGADE - SPLIT YEAR (2022)
-- ============================================================================

UPDATE vehicles
SET 
    rf_system = 'Split-Year',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || '⚠️ SPLIT YEAR: 2022 Renegade may have Continental (M3N-40821302, part# 6xx) OR Giobert (2ADPXFI7PE, part# 7xx). MUST verify OEM part number via VIN lookup before ordering. Keys are NOT interchangeable!',
    programming_method = COALESCE(programming_method || ' | ', '') || 'Verify RF system before programming'
WHERE make = 'Jeep' 
  AND model LIKE '%Renegade%' 
  AND year_start = 2022;

-- ============================================================================
-- JEEP RENEGADE - GIOBERT ERA (2023+)
-- ============================================================================

UPDATE vehicles
SET 
    rf_system = 'Giobert',
    part_number_prefix = '7',
    fcc_id = '2ADPXFI7PE',
    frequency = '433.92 MHz',
    chip = 'Hitag AES (4A)',
    oem_part_number = '7TB23DX9AA',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Giobert RF System (Italian). Part numbers start with 7. Precoded from factory.'
WHERE make = 'Jeep' 
  AND model LIKE '%Renegade%' 
  AND year_start >= 2023;

-- ============================================================================
-- JEEP COMPASS - ALL CONTINENTAL (Toluca, Mexico)
-- ============================================================================

UPDATE vehicles
SET 
    rf_system = 'Continental',
    part_number_prefix = '6',
    fcc_id = 'M3N-40821302',
    frequency = '433.92 MHz',
    chip = 'Hitag AES (4A)',
    oem_part_number = CASE 
        WHEN buttons >= 5 OR key_type LIKE '%Remote Start%' THEN '68250343AB'
        ELSE '68250335AB'
    END,
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Continental RF System. Mexican-built (VIN 11th digit T). Stable supply chain.'
WHERE make = 'Jeep' 
  AND model LIKE '%Compass%' 
  AND year_start >= 2017;

-- ============================================================================
-- DODGE HORNET - ALL GIOBERT (Pomigliano d'Arco, Italy)
-- ============================================================================

UPDATE vehicles
SET 
    rf_system = 'Giobert',
    part_number_prefix = '7',
    fcc_id = '2ADPXFI7PE',
    frequency = '433.92 MHz',
    chip = 'Hitag AES (4A)',
    oem_part_number = '7QV80LXHPA',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Giobert RF System ONLY. Italian-built (Alfa Romeo Tonale platform). Do NOT use Charger/Durango fobs - 100% incompatible!'
WHERE make = 'Dodge' 
  AND model LIKE '%Hornet%';

-- ============================================================================
-- CREATE FCC REGISTRY ENTRIES (if table exists)
-- ============================================================================

-- Note: fcc_registry may not exist in all environments
-- INSERT OR IGNORE INTO fcc_registry (fcc_id, frequency, buttons, battery, asin)
-- VALUES 
--     ('M3N-40821302', '433.92 MHz', 4, 'CR2032', NULL),
--     ('2ADPXFI7PE', '433.92 MHz', 4, 'CR2032', NULL);

-- ============================================================================
-- CREATE CURATED OVERRIDES FOR PART NUMBER LOGIC
-- ============================================================================

INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, notes, source)
VALUES 
    ('M3N-40821302', 'Jeep', 'Renegade', 2015, 2021, '433.92 MHz', 'Hitag AES (4A)', 'Continental system. Part numbers: 68266733AA (pre-facelift), 6BY88DX9AA (facelift). IC: 7812A-40021302', 'Stellantis RF Architecture Research Dec 2025'),
    ('M3N-40821302', 'Jeep', 'Compass', 2017, 2024, '433.92 MHz', 'Hitag AES (4A)', 'Continental system. Part numbers: 68250343AB (5B), 68250335AB (3B). Toluca, Mexico plant.', 'Stellantis RF Architecture Research Dec 2025'),
    ('2ADPXFI7PE', 'Jeep', 'Renegade', 2023, 2025, '433.92 MHz', 'Hitag AES (4A)', 'Giobert system. Part number: 7TB23DX9AA. Melfi, Italy plant. IC: 12548A-FI7PE', 'Stellantis RF Architecture Research Dec 2025'),
    ('2ADPXFI7PE', 'Dodge', 'Hornet', 2023, 2025, '433.92 MHz', 'Hitag AES (4A)', 'Giobert system ONLY. Part number: 7QV80LXHPA. Pomigliano d''Arco, Italy. Alfa Romeo Tonale platform.', 'Stellantis RF Architecture Research Dec 2025');

-- ============================================================================
-- CREATE PROGRAMMING GUIDE FOR SPLIT-YEAR DETECTION
-- ============================================================================

INSERT OR REPLACE INTO programming_guides (id, title, make, model, year_start, year_end, content, category)
VALUES (
    'stellantis-small-wide-rf-identification',
    'Stellantis Small Wide Platform: RF System Identification',
    'Stellantis',
    'Renegade,Compass,Hornet',
    2015,
    2025,
    '# RF System Identification Guide

## The Golden Rule
**Part Number Prefix determines FCC ID:**
- `6...` → Continental (M3N-40821302)
- `7...` → Giobert (2ADPXFI7PE)

## Quick Filter Logic

### Dodge Hornet (Any Year)
→ **Giobert (2ADPXFI7PE)** - No exceptions

### Jeep Compass (Any Year)
→ **Continental (M3N-40821302)** - Mexican-built, stable

### Jeep Renegade
| Year | System | Action |
|------|--------|--------|
| 2015-2021 | Continental | Order M3N-40821302 |
| **2022** | **MIXED** | **VERIFY PART NUMBER** |
| 2023+ | Giobert | Order 2ADPXFI7PE |

## 2022 Renegade Verification
This is a "Split Year" - both systems shipped from the same assembly line.

**To verify:**
1. Query Mopar Parts API with full 17-digit VIN
2. Check OEM part number prefix:
   - Starts with `6` (e.g., 6BY88DX9AA) → Continental
   - Starts with `7` (e.g., 7TB23DX9AA) → Giobert

**Visual Inspection (if existing key available):**
- Continental: Smooth matte rear shell, familiar "throw" on blade release
- Giobert: Slightly different molding texture, may show "Unknown Configuration" on some reader tools

## Why Are They Incompatible?
Both use NXP Hitag AES (4A) chip hardware, BUT:
- Continental chips have Continental-specific **Page 0 pre-coding**
- Giobert chips have Giobert-specific **Page 0 pre-coding**
- The RF Hub rejects mismatched signatures during the initial handshake
- Error occurs BEFORE PIN is even requested

## Programming Notes
- All 2018+ require AutoAuth SGW bypass
- Giobert systems have lower OBD PIN read success rate
- Hornet BCM is aggressive about sleep mode - keep hazards on',
    'RF_IDENTIFICATION'
);

-- ============================================================================
-- CREATE INDEX FOR RF SYSTEM LOOKUPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vehicles_rf_system ON vehicles(rf_system) WHERE rf_system IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_part_prefix ON vehicles(part_number_prefix) WHERE part_number_prefix IS NOT NULL;
