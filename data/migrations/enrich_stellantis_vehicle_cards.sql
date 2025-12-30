-- Phase B: Stellantis/CDJR Per-Vehicle Card Data Enrichment
-- Source: Phase A Research + Consolidated CDJR Security Data
-- Generated: 2025-12-26

-- ==============================================================================
-- JEEP WRANGLER - IMMOBILIZER EVOLUTION
-- ==============================================================================

-- Wrangler JK (2007-2017): Legacy SKREEM System
UPDATE vehicles SET
    fcc_id = 'GQ4-53T',
    key_blank = 'Y157-PT',
    battery = 'CR2032',
    chip_type = 'ID46 (PCF7936)'
WHERE make = 'Jeep' AND model = 'Wrangler' AND year_start <= 2017;

-- Wrangler JL (2018+): SGW + HITAG-AES System
UPDATE vehicles SET
    fcc_id = 'GQ4-54T',
    key_blank = 'Y164-PT',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1,
    bypass_method = 'AutoAuth / 12+8 Cable'
WHERE make = 'Jeep' AND model = 'Wrangler' AND year_start >= 2018;

-- ==============================================================================
-- JEEP GRAND CHEROKEE - PLATFORM SHIFT
-- ==============================================================================

-- Grand Cherokee WK2 (2014-2021): RFH System
UPDATE vehicles SET
    fcc_id = 'M3N-40821302',
    key_blank = 'Y164-PT',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = CASE WHEN year_start >= 2018 THEN 1 ELSE 0 END
WHERE make = 'Jeep' AND model = 'Grand Cherokee' AND year_end <= 2021;

-- Grand Cherokee WL (2022+): Locked RF Hub Protocol
UPDATE vehicles SET
    fcc_id = 'OHT4882056',
    key_blank = 'Y164-PT',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1,
    security_notes = 'WL Platform. Locked RF Hub. Pre-coding or Enable Fobik routine required for AKL.'
WHERE make = 'Jeep' AND model = 'Grand Cherokee' AND year_start >= 2022;

-- ==============================================================================
-- THE ITALIAN PLATFORMS (HORNET, RENEGADE 22+)
-- ==============================================================================

-- Dodge Hornet (2023+): Alfa Romeo Architecture
UPDATE vehicles SET
    fcc_id = '2ADPXFI7PE',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1,
    platform = 'Alfa Romeo Tonale',
    security_notes = 'Giobert/Alfa Hardware. Italian-built. Requires pre-coding with CS bytes.'
WHERE make = 'Dodge' AND model = 'Hornet';

-- Jeep Renegade 2015-2021 (Legacy Continental)
UPDATE vehicles SET
    fcc_id = '2ADFTFI5AM433TX',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'Megamos AES',
    security_notes = 'Legacy Continental/Fiat architecture. No SGW.'
WHERE make = 'Jeep' AND model = 'Renegade' AND year_end <= 2021;

-- Jeep Renegade 2022+ (Giobert Transition)
UPDATE vehicles SET
    fcc_id = '2ADPXFI7PE',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 6A)',
    sgw_required = 1,
    security_notes = '2022+ Giobert transition. Italian-built. Requires pre-coding.'
WHERE make = 'Jeep' AND model = 'Renegade' AND year_start >= 2022;

-- ==============================================================================
-- JEEP COMPASS & RAM PROMASTER
-- ==============================================================================

-- Jeep Compass (2017+)
UPDATE vehicles SET
    fcc_id = 'M3N-40821302',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1
WHERE make = 'Jeep' AND model = 'Compass' AND year_start >= 2017;

-- RAM ProMaster (2022+)
UPDATE vehicles SET
    key_blank = 'SIP22',
    battery = 'CR2032',
    sgw_required = 1,
    security_notes = 'Fiat Ducato based. Extreme Lishi stiffness on SIP22.'
WHERE make = 'RAM' AND model = 'ProMaster' AND year_start >= 2022;

-- ==============================================================================
-- CLEANUP & STANDARDIZATION
-- ==============================================================================

-- Ensure all battery entries are standardized
UPDATE vehicles SET battery = 'CR2032' WHERE make IN ('Jeep', 'Dodge', 'RAM') AND battery IS NULL;

-- Fix common casing issues in key_blank
UPDATE vehicles SET key_blank = UPPER(key_blank) WHERE make IN ('Jeep', 'Dodge', 'RAM') AND key_blank LIKE 'y%';
