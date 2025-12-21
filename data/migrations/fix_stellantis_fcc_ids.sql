-- Migration: fix_stellantis_fcc_ids.sql
-- Purpose: Correct Hornet FCC ID to KR5ALFA434 and add comprehensive Stellantis data
-- Source: Comprehensive Stellantis security architecture research (Dec 2025)

-- ============================================================================
-- CRITICAL FIX: HORNET USES ALFA ROMEO SYSTEM, NOT GIOBERT
-- The Hornet is a rebadged Alfa Romeo Tonale - uses KR5ALFA434, not 2ADPXFI7PE
-- ============================================================================

UPDATE vehicles
SET 
    fcc_id = 'KR5ALFA434',
    rf_system = 'Alfa Romeo',
    part_number_prefix = '7',
    oem_part_number = '7QV80LXHPA',
    chip = 'HITAG-AES (NCF29A1M / 4A)',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'ALFA ROMEO PLATFORM: Uses KR5ALFA434 (NOT Giobert 2ADPX). Shared with Alfa Tonale. Pre-coding REQUIRED. Do NOT use Durango/Charger fobs!',
    programming_method = 'WiTech Only - Enable Fobik (Pre-coded keys)'
WHERE make = 'Dodge' 
  AND model LIKE '%Hornet%';

-- ============================================================================
-- RENEGADE DATA REFINEMENT (2015-2024)
-- ============================================================================

-- Renegade 2015-2018: Legacy Megamos AES system
UPDATE vehicles
SET 
    fcc_id = '2ADFTFI5AM433TX',
    chip = 'Megamos AES',
    rf_system = 'Continental (Legacy)',
    oem_part_number = '68264811AA',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Legacy Megamos AES system. SIP22 keyway.'
WHERE make = 'Jeep' 
  AND model LIKE '%Renegade%' 
  AND year_start >= 2015 
  AND year_end <= 2018
  AND (fcc_id IS NULL OR fcc_id != '2ADFTFI5AM433TX');

-- Renegade 2019-2021: Transition years (still Megamos)
UPDATE vehicles
SET 
    fcc_id = '2ADFTFI5AM433TX',
    chip = 'Megamos AES',
    rf_system = 'Continental (Transition)',
    oem_part_number = '68264811AA'
WHERE make = 'Jeep' 
  AND model LIKE '%Renegade%' 
  AND year_start >= 2019 
  AND year_end <= 2021
  AND (fcc_id IS NULL OR fcc_id NOT LIKE '%2ADP%');

-- ============================================================================
-- COMPASS DATA (Sales Code Button Variants)
-- ============================================================================

-- 3-Button Base (Sport trim, no remote start)
UPDATE vehicles
SET 
    oem_part_number = '68250335AB',
    buttons = 3,
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Sales Code Logic: No XBM (Remote Start), No JRC (Power Liftgate). Alt P/N: 68417820AB'
WHERE make = 'Jeep' 
  AND model LIKE '%Compass%' 
  AND model LIKE '%3B%'
  AND year_start >= 2017;

-- 4-Button (Remote Start, no Power Liftgate)
UPDATE vehicles
SET 
    oem_part_number = '68250337AB',
    buttons = 4,
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Sales Code Logic: Has XBM (Remote Start), No JRC (Power Liftgate). Alt P/N: 68417821AB'
WHERE make = 'Jeep' 
  AND model LIKE '%Compass%' 
  AND model LIKE '%4B%'
  AND year_start >= 2017;

-- 5-Button Full Feature (Limited/Trailhawk with Remote Start + Power Liftgate)
UPDATE vehicles
SET 
    oem_part_number = '68250343AB',
    buttons = 5,
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Sales Code Logic: Has XBM (Remote Start) + JRC (Power Liftgate). Alt P/N: 68417823AB'
WHERE make = 'Jeep' 
  AND model LIKE '%Compass%' 
  AND model LIKE '%5B%'
  AND year_start >= 2017;

-- ============================================================================
-- ADD WITECH PROGRAMMING GUIDE
-- ============================================================================

INSERT OR REPLACE INTO programming_guides (id, title, make, model, year_start, year_end, content, category)
VALUES (
    'stellantis-enable-fobik-procedure',
    'WiTech Enable Fobik Procedure (Locked RF Hub)',
    'Stellantis',
    'Renegade,Hornet,Grand Cherokee',
    2022,
    2025,
    '# Enable Fobik Procedure for 2022+ Stellantis

## Why "Program Keys" is Missing
On 2022+ Italian-built vehicles, the RF Hub is **LOCKED**. It cannot generate new Secret Keys.
The "Enable Fobik" option is CORRECT - it validates pre-coded keys.

## Prerequisites
- Battery 12.5V+ (maintainer required)
- WiTech 2.0 with active subscription
- **VIN-ordered dealer key** (NOT aftermarket blank)
- All doors closed

## Procedure
1. Connect WiTech, full topology scan
2. Clear DTCs in RFH and BCM
3. Select RF Hub module
4. Choose **Enable Fobik**
5. Place key against Start/Stop button
6. Press Unlock when prompted
7. Wait for "Key Saved" message
8. Test all functions + engine start

## Pre-Coding Aftermarket Keys
If using blank (non-dealer) key:
1. Extract CS bytes from BCM/RFH (bench cable required)
2. Write CS data to virgin transponder (APB112 or similar)
3. THEN run Enable Fobik routine

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Timeout | Antenna placement | Touch key logo to Start button |
| Security Denied | SGW bypass | Remove physical cables, use AutoAuth |
| Key Not Found | Not pre-coded | Key must have vehicle CS bytes |
| Hub Bricked | Tool corruption | Replace RF Hub with virgin unit |',
    'AKL_PROCEDURE'
);

-- ============================================================================
-- CURATED OVERRIDES WITH CORRECT DATA
-- ============================================================================

INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, notes, source)
VALUES 
    -- CORRECTED Hornet data
    ('KR5ALFA434', 'Dodge', 'Hornet', 2023, 2025, '433.92 MHz', 'HITAG-AES (NCF29A1M/4A)', 'Alfa Romeo Tonale platform. Part: 7QV80LXHPA. IC: KR5ALFA434. Pre-coding REQUIRED. NOT compatible with Durango/Charger keys!', 'Stellantis Security Architecture Research Dec 2025'),
    
    -- Renegade legacy
    ('2ADFTFI5AM433TX', 'Jeep', 'Renegade', 2015, 2021, '433 MHz', 'Megamos AES', 'Legacy Continental system. Part: 68264811AA. SIP22 keyway. Standard OBDII programming.', 'Stellantis Security Architecture Research Dec 2025'),
    
    -- Renegade modern
    ('2ADPXFI7PE', 'Jeep', 'Renegade', 2022, 2024, '434 MHz', 'HITAG-AES (6A)', 'Giobert system. Part: 7TB23DX9AA. Melfi Italy plant (VIN V). Pre-coding REQUIRED.', 'Stellantis Security Architecture Research Dec 2025'),
    
    -- Compass (stable)
    ('M3N-40821302', 'Jeep', 'Compass', 2017, 2024, '433.92 MHz', 'Philips ID46/AES 128-bit', 'Continental system. Toluca Mexico plant (VIN P). Standard programming. Button count varies by Sales Codes (XBM/JRC).', 'Stellantis Security Architecture Research Dec 2025');

-- ============================================================================
-- ADD WMI (VIN PREFIX) REFERENCE TABLE IF NOT EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vin_wmi_reference (
    wmi TEXT PRIMARY KEY,
    country TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    plant TEXT,
    key_architecture TEXT NOT NULL,
    notes TEXT
);

INSERT OR REPLACE INTO vin_wmi_reference (wmi, country, manufacturer, plant, key_architecture, notes)
VALUES 
    ('ZAC', 'Italy', 'FCA Italy (Dodge)', 'Pomigliano', 'Alfa (KR5) / Giobert (2ADPX)', 'Hornet built here. Pre-coding required.'),
    ('ZFB', 'Italy', 'FCA Italy (Jeep)', 'Melfi', 'Giobert (2ADPX)', 'Renegade built here. Pre-coding required.'),
    ('3C4', 'Mexico', 'FCA US (Stellantis)', 'Toluca', 'Continental (M3N)', 'Compass built here. Standard OBD programming.'),
    ('1C3', 'USA', 'FCA US (Dodge)', 'Detroit', 'Continental (M3N)', 'Durango/Charger. Standard programming.'),
    ('1C4', 'USA', 'FCA US (Jeep)', 'Various', 'Continental (M3N)', 'Grand Cherokee. Standard programming.');
