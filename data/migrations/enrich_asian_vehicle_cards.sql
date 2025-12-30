-- Migration: Phase B - Asian Makes Per-Vehicle Enrichment
-- Targets: Honda, Nissan, Hyundai/Kia, Mazda, Subaru
-- Enhancements: FCC ID, Lishi Tool, Keyway, Frequency, Battery, and Technical Notes

BEGIN TRANSACTION;

-- =============================================
-- 1. HONDA / ACURA ENRICHMENT
-- =============================================

-- Civic 10th Gen (2016-2021)
-- Addressing the KR5V1X vs KR5V2X Trap
UPDATE vehicles 
SET 
    fcc_id = 'KR5V2X (433MHz) / KR5V1X (314MHz)*',
    lishi_tool = 'HON66',
    notes = COALESCE(notes, '') || ' [Phase B] Frequency Trap: Civic PTS traditionally uses KR5V2X (433MHz). Verification of FCC label mandatory. Uses CR2032 battery.'
WHERE make = 'Honda' AND model = 'Civic' AND year_start >= 2016 AND year_end <= 2021;

-- Civic 11th Gen (2022-2025)
UPDATE vehicles 
SET 
    fcc_id = 'KR5TP-4',
    lishi_tool = 'HON66',
    notes = COALESCE(notes, '') || ' [Phase B] 11th Gen AES system. NCF29A1M (4A) chip. Battery: CR2032.'
WHERE make = 'Honda' AND model = 'Civic' AND year_start >= 2022;

-- Accord 10th Gen (2018-2022)
UPDATE vehicles 
SET 
    fcc_id = 'CWTWB1G0090',
    lishi_tool = 'HON66',
    notes = COALESCE(notes, '') || ' [Phase B] 10th Gen PTS. Frequency: 433MHz. Battery: CR2032.'
WHERE make = 'Honda' AND model = 'Accord' AND year_start >= 2018 AND year_end <= 2022;

-- =============================================
-- 2. NISSAN / INFINITI ENRICHMENT
-- =============================================

-- Rogue 2021+ (T33)
UPDATE vehicles 
SET 
    fcc_id = 'KR5TXN1 (Base) / KR5TXN3 (SL/Plat)',
    lishi_tool = 'NSN14',
    notes = COALESCE(notes, '') || ' [Phase B] 2021+ T33 Platform. 433MHz. Hitachi AES (4A). Keyway: NSN14.'
WHERE make = 'Nissan' AND model = 'Rogue' AND year_start >= 2021;

-- Pathfinder 2022+ (R53)
UPDATE vehicles 
SET 
    fcc_id = 'KR5TXN7',
    lishi_tool = 'NSN14',
    notes = COALESCE(notes, '') || ' [Phase B] R53 Platform. 433MHz. Hitachi AES (4A). Keyway: NSN14.'
WHERE make = 'Nissan' AND model = 'Pathfinder' AND year_start >= 2022;

-- =============================================
-- 3. HYUNDAI / KIA ENRICHMENT
-- =============================================

-- Telluride Pre-2023
UPDATE vehicles 
SET 
    fcc_id = 'TQ8-FOB-4F24',
    lishi_tool = 'KK12',
    notes = COALESCE(notes, '') || ' [Phase B] Legacy Modern system. ID47 chip. Battery: CR2032.'
WHERE make = 'Kia' AND model = 'Telluride' AND year_start >= 2020 AND year_end <= 2022;

-- Telluride 2023+ (CAN FD)
UPDATE vehicles 
SET 
    fcc_id = 'TQ8-FOB-4F27',
    lishi_tool = 'HYN14',
    notes = COALESCE(notes, '') || ' [Phase B] 2023+ CAN FD Requirement. ID47 chip. Keyway: HYN14. Battery: CR2032.'
WHERE make = 'Kia' AND model = 'Telluride' AND year_start >= 2023;

-- =============================================
-- 4. SUBARU ENRICHMENT
-- =============================================

-- Outback 2020+
UPDATE vehicles 
SET 
    fcc_id = 'HYQ14AKB',
    lishi_tool = 'DAT17',
    notes = COALESCE(notes, '') || ' [Phase B] 7th Gen SGP High Security. NOT HYQ14AHK. Battery: CR2032. Keyway: DAT17.'
WHERE make = 'Subaru' AND model = 'Outback' AND year_start >= 2020;

-- =============================================
-- 5. MAZDA ENRICHMENT
-- =============================================

-- Standardize Mazda common fields for recent models (2019+)
UPDATE vehicles 
SET 
    fcc_id = 'MZ31',
    lishi_tool = 'MAZ24/MZ31',
    notes = COALESCE(notes, '') || ' [Phase B] Gen 7 Secure Gateway. 128-bit AES. 433MHz.'
WHERE make = 'Mazda' AND year_start >= 2019 AND fcc_id IS NULL;

COMMIT;
