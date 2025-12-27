-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA/LEXUS VEHICLE CARD ENRICHMENT (PHASE B)
-- Source: Phase A Results, Tier 1/2 Guides, Amazon Affiliate Data
-- Focus: Per-row hardware specs (FCC ID, Chip, Battery, Key Blank)
-- Generated: 2025-12-26
-- ═══════════════════════════════════════════════════════════════════════════

-- ==============================================================================
-- 1. TOYOTA CAMRY
-- ==============================================================================

-- 2012-2017: Smart Key (Transition Era)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBA',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'Camry' AND year >= 2012 AND year <= 2017;

-- 2018-2024: Smart Key (TNGA Era)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBC',
    chip_type = '8A-AES (Page 1 AA)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Camry' AND year >= 2018 AND year <= 2024;

-- ==============================================================================
-- 2. TOYOTA RAV4
-- ==============================================================================

-- 2013-2018: Smart Key
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBA',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'RAV4' AND year >= 2013 AND year <= 2018;

-- 2019-2024: Smart Key (TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBC',
    chip_type = '8A-AES (Page 1 AA)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'RAV4' AND year >= 2019 AND year <= 2024;

-- ==============================================================================
-- 3. TOYOTA HIGHLANDER
-- ==============================================================================

-- 2014-2019: Smart Key
UPDATE vehicles_master SET
    fcc_id = 'HYQ14AAB',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'Highlander' AND year >= 2014 AND year <= 2019;

-- 2020-2024: Smart Key (TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FLA',
    chip_type = '8A-AES (Page 1 AA)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Highlander' AND year >= 2020 AND year <= 2024;

-- ==============================================================================
-- 4. TOYOTA SIENNA
-- ==============================================================================

-- 2011-2020: Smart Key
UPDATE vehicles_master SET
    fcc_id = 'HYQ14ADR',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'Sienna' AND year >= 2011 AND year <= 2020;

-- 2021-2024: Smart Key (TNGA-K / Hybrid Only)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBX',
    chip_type = '8A-BA',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Sienna' AND year >= 2021 AND year <= 2024;

-- ==============================================================================
-- 5. TOYOTA COROLLA CROSS
-- ==============================================================================

-- 2022-2024: Smart Key (First 4A System)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBW',
    chip_type = '4A (Hitag-AES)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Corolla Cross' AND year >= 2022 AND year <= 2024;

-- ==============================================================================
-- 6. LEXUS MODELS (SAMPLE ENRICHMENT)
-- ==============================================================================

-- RX 350 (2023+ TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FLB',
    chip_type = '8A-BA',
    battery = 'CR2450',
    key_blank = 'LXP90'
WHERE make = 'Lexus' AND model = 'RX 350' AND year >= 2023;

-- ES 350 (2019+ TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBF',
    chip_type = '8A-AES',
    battery = 'CR2032',
    key_blank = 'LXP90'
WHERE make = 'Lexus' AND model = 'ES 350' AND year >= 2019;
