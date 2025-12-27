-- Migration: Ford & GM Deep Dive Integration
-- Data sourced from: Ford_BCM_Security_Bypass_Research.txt, GM_Global_B_Key_Programming_Research.txt, Early_GM_Chrysler_AKL_Coverage.txt

BEGIN TRANSACTION;

-- =============================================
-- 1. FORD 2021-2025 (Locked BCM / Active Theft)
-- =============================================

-- Update vehicles_master for Ford Next-Gen Architecture
UPDATE vehicles_master 
SET 
    chip_type = 'Hitag Pro (ID49) 128-bit',
    platform = 'Gen 14 / FNV2 Hybrid',
    security_notes = 'Locked BCM: Active Theft system blocks OBD programming. Requires 12-pin hardware bypass and external power isolation behind glovebox.',
    bypass_method = '12-Pin BCM Bypass (External Power)',
    sgw_required = 1
WHERE make = 'Ford' 
  AND model IN ('F-150', 'Bronco', 'Expedition', 'Mustang Mach-E')
  AND year_start >= 2021;

-- Insert FCC References for Ford
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('M3N-A2C931426', 'Ford', 'F-150', 2021, 2025, '902MHz', 'Hitag Pro (ID49)', 'High-trim/Raptor/Lightning'),
('M3N-A2C931426', 'Ford', 'Bronco', 2021, 2025, '902MHz', 'Hitag Pro (ID49)', 'Full-size Bronco'),
('M3N-A2C931423', 'Ford', 'Bronco Sport', 2021, 2025, '315MHz', 'Hitag Pro (ID49)', 'Escape Platform C2'),
('M3N-A2C931423', 'Ford', 'Escape', 2020, 2025, '315MHz', 'Hitag Pro (ID49)', 'Proximity models');

-- =============================================
-- 2. GM GLOBAL B (VIP Architecture)
-- =============================================

-- Update vehicles_master for GM Global B
UPDATE vehicles_master 
SET 
    chip_type = 'Hitag AES (ID4A) 128-bit',
    platform = 'Global B (VIP)',
    security_notes = 'Global B Architecture: CAN FD protocol and 24-digit server token mandatory. No offline AKL path. 12th VIN digit rule applies for 2022 Trucks.',
    bypass_method = 'CAN FD + Online Server Token',
    sgw_required = 1
WHERE (make = 'Chevrolet' AND model IN ('Corvette', 'Tahoe', 'Suburban', 'Colorado', 'Trax') AND year_start >= 2020)
   OR (make = 'GMC' AND model IN ('Yukon', 'Sierra 1500', 'Canyon', 'Acadia', 'Hummer EV') AND year_start >= 2021)
   OR (make = 'Cadillac' AND model IN ('CT4', 'CT5', 'Escalade', 'Lyriq') AND year_start >= 2020);

-- Specialized Update for 2022 Silverado/Sierra (The 12th Digit Rule)
UPDATE vehicles_master 
SET 
    security_notes = '2022 Refresh Split: Verify 12th VIN digit. If >= 5, it is Global B (VIP) requiring CAN FD and token. If <= 4, it is Global A (Legacy).'
WHERE make IN ('Chevrolet', 'GMC') AND model IN ('Silverado 1500', 'Sierra 1500') AND year_start = 2022;

-- =============================================
-- 3. LEGACY SYSTEMS (2000-2010)
-- =============================================

-- GM Passlock
UPDATE vehicles_master 
SET 
    chip_type = 'None (Resistor Voltage)',
    security_notes = 'Passlock I/II: No transponder chip. AKL requires 30-minute manual relearn (3x 10min cycles). Maintain battery voltage!',
    bypass_method = '30-Minute Relearn'
WHERE make = 'Chevrolet' AND model IN ('Impala', 'Malibu') AND year_end <= 2005;

-- Chrysler PCI SKIM
UPDATE vehicles_master 
SET 
    security_notes = 'PCI Bus: PIN not accessible via OBD. AKL requires EEPROM reading (95040/24C02) from SKIM module on column.',
    bypass_method = 'EEPROM PIN Extraction'
WHERE make IN ('Chrysler', 'Dodge', 'Jeep') AND model IN ('Grand Cherokee', 'Ram', 'Liberty') AND year_start <= 2004;

COMMIT;
