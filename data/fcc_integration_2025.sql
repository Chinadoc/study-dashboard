-- 2025-2026 Vehicle FCC Research Integration (FIXED)
-- Generated: 2026-01-30
-- Data Source: Smart_Key_FCC_Data_Expansion.txt

-- =============================================================================
-- PART 1: Update existing 2025-2026 model mappings
-- =============================================================================

-- Toyota Camry 2025+ (XV80 Platform)
-- Research says HYQ14FNA replaces HYQ14FBW
UPDATE vehicles 
SET fcc_id = 'HYQ14FNA',
    chip = 'Denso AES',
    frequency = '433 MHz',
    key_type = 'Smart Key'
WHERE make = 'Toyota' 
  AND model = 'Camry' 
  AND year_start >= 2025
  AND (fcc_id = 'HYQ14FBW' OR fcc_id IS NULL);

-- Kia EV9 2024+
UPDATE vehicles
SET fcc_id = 'TQ8-FOB-4FA1U44',
    chip = 'NCF29A1M (Hitag AES)',
    frequency = '433.92 MHz',
    key_type = 'Smart Key'
WHERE make = 'Kia'
  AND model = 'EV9'
  AND year_start >= 2024;

-- Hyundai Ioniq 9 2025+
UPDATE vehicles
SET fcc_id = 'TQ8-FOB-4FA1U44',
    chip = 'NCF29A1M (Hitag AES)',
    frequency = '433.92 MHz',
    key_type = 'Smart Key'
WHERE make = 'Hyundai'
  AND model = 'Ioniq 9'
  AND year_start >= 2025;

-- VW ID.4 / ID. Buzz 2024+
UPDATE vehicles
SET fcc_id = 'NBGFS197R',
    chip = 'Megamos AES',
    frequency = '433.92 MHz',
    key_type = 'Smart Key'
WHERE make = 'Volkswagen'
  AND model IN ('ID.4', 'ID. Buzz')
  AND year_start >= 2024;


-- =============================================================================
-- PART 2: Insert New Models (if not exists)
-- =============================================================================

-- Toyota Crown Signia 2025
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, fcc_id, chip, frequency, key_type)
VALUES ('Toyota', 'Crown Signia', 2025, 2026, 'HYQ14FNA', 'Denso AES', '433 MHz', 'Smart Key');

-- Lucid Gravity 2025
INSERT OR IGNORE INTO vehicles (make, model, year_start, year_end, fcc_id, chip, key_type, notes)
VALUES ('Lucid', 'Gravity', 2025, 2026, 'IYZUK1', 'NFC+UWB+BLE SoC', 'Smart Key', 'UWB 5-9GHz + BLE + NFC');


-- =============================================================================
-- PART 3: Data Integrity cleanup
-- =============================================================================

-- Remove invalid "A2C94464500" entry from fcc_complete
DELETE FROM fcc_complete WHERE fcc_id = 'A2C94464500';
