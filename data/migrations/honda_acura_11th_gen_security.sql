-- Honda/Acura 11th Generation Security Integration
-- Source: Deep Research on BCM Bricking, Chassis Codes, and Key Compatibility
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Honda Chassis Code Reference Table
-- Links chassis codes (FE, FL, CY) to consumer model names for programming
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_chassis_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    chassis_code TEXT NOT NULL,
    chassis_suffix TEXT, -- e.g., FE1, FL5
    year_start INTEGER,
    year_end INTEGER,
    generation TEXT, -- 10th, 11th
    powertrain TEXT, -- petrol, hybrid, e:FCEV
    chip_type TEXT,
    security_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_chassis_reference (make, model, variant, chassis_code, chassis_suffix, year_start, year_end, generation, powertrain, chip_type, security_notes) VALUES
-- Honda 11th Generation
('Honda', 'Civic', 'Sedan', 'FE', 'FE1/FE2', 2022, 2025, '11th', 'petrol', 'Hitag AES 4A', 'FE1 = 1.5L turbo, FE2 = 2.0L'),
('Honda', 'Civic', 'Sedan Hybrid', 'FE', 'FE4', 2024, 2025, '11th', 'hybrid', 'Hitag AES 4A', 'Hybrid variant from 2024'),
('Honda', 'Civic', 'Hatchback', 'FL', 'FL1', 2022, 2025, '11th', 'petrol', 'Hitag AES 4A', 'Standard hatchback'),
('Honda', 'Civic', 'Si', 'FL', 'FL1', 2022, 2025, '11th', 'petrol', 'Hitag AES 4A', 'Si uses FL chassis'),
('Honda', 'Civic', 'Type R', 'FL', 'FL5', 2022, 2025, '11th', 'petrol', 'Hitag AES 4A', 'FL5 = Type R specific'),
('Honda', 'Civic', 'Hatchback Hybrid', 'FL', 'FL4', 2024, 2025, '11th', 'hybrid', 'Hitag AES 4A', 'Hybrid hatchback'),
('Honda', 'CR-V', 'All', 'RS', 'RS3/RS4', 2023, 2025, '6th', 'petrol', 'Hitag AES 4A', 'Petrol variants'),
('Honda', 'CR-V', 'Hybrid', 'RS', 'RS5/RS6', 2023, 2025, '6th', 'hybrid', 'Hitag AES 4A', 'Hybrid variants'),
('Honda', 'CR-V', 'e:FCEV', 'ZC', 'ZC8', 2024, 2025, '6th', 'e:FCEV', 'Hitag AES 4A', 'Fuel cell electric'),
('Honda', 'Accord', 'All', 'CY', 'CY1', 2023, 2025, '11th', 'petrol', 'Hitag AES 4A', 'Petrol sedan'),
('Honda', 'Accord', 'Hybrid', 'CY', 'CY2', 2023, 2025, '11th', 'hybrid', 'Hitag AES 4A', 'Hybrid sedan'),
('Honda', 'HR-V', 'All', 'RV', 'RS1', 2022, 2025, '3rd', 'petrol', 'Hitag AES 4A', 'Third generation'),
('Honda', 'Pilot', 'All', 'YG', 'YG1/YG2', 2023, 2025, '4th', 'petrol', 'Hitag AES 4A', 'Fourth generation'),
('Honda', 'Passport', 'All', 'YF', 'YF7/YF8', 2022, 2025, '3rd', 'petrol', 'Hitag AES 4A', 'No major updates 2022-2025'),

-- Acura 11th Generation (shares Honda security core)
('Acura', 'Integra', 'All', 'DE', 'DE4/DE5', 2023, 2025, '11th', 'petrol', 'Hitag AES 4A', 'Based on Civic platform'),
('Acura', 'MDX', 'Standard', 'YD', 'YD8/YD9', 2022, 2025, '4th', 'petrol', 'Hitag AES 4A', 'Fourth generation'),
('Acura', 'MDX', 'Type S', 'YE', 'YE1', 2022, 2025, '4th', 'petrol', 'Hitag AES 4A', 'Performance variant'),
('Acura', 'RDX', 'All', 'TC', 'TC1/TC2', 2022, 2025, '3rd', 'petrol', 'Hitag AES 4A', 'Third generation'),
('Acura', 'TLX', 'Standard', 'UB', 'UB5/UB6', 2022, 2025, '2nd', 'petrol', 'Hitag AES 4A', 'Second generation'),
('Acura', 'TLX', 'Type S', 'UB', 'UB7', 2022, 2025, '2nd', 'petrol', 'Hitag AES 4A', 'Performance variant');

-- ============================================================================
-- SECTION 2: BCM Bricking Risk Matrix
-- Critical reference for aftermarket tool usage
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_bcm_bricking_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    chassis_code TEXT,
    risk_level TEXT NOT NULL, -- High, Medium, Low
    autel_prompts_causing_bricking TEXT,
    prevention_notes TEXT,
    recovery_possible BOOLEAN,
    recovery_method TEXT,
    dealer_cost_estimate TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_bcm_bricking_matrix (model, chassis_code, risk_level, autel_prompts_causing_bricking, prevention_notes, recovery_possible, recovery_method, dealer_cost_estimate) VALUES
('Honda Civic', 'FE/FL', 'High', 'Selecting "Old System" instead of "New Style" in IMMO menu; "Add Key" with incompatible TP-2', 'Verify year/system; use "Smart Key System > New Protocol" for 2022+. NEVER select 10th gen prompts.', 1, 'Xhorse universal key (XKHO01EN) via OBD bypasses lockout in 80-90% cases', '$700+ if dealer needed'),
('Honda CR-V', 'RS', 'Medium', '"All Keys Lost" with wrong chip type; mismatched protocol in IM608', 'Confirm hybrid vs petrol in menu selection; test with Xhorse first before Autel', 1, 'Xhorse universal key; if fails, partial dealer recovery', '$500-700'),
('Honda Accord', 'CY', 'High', 'Programming old protocol on new BCM; ignoring "Safety Check Failed" warning', 'Select "USA > Accord > 2023+ > New System"; stop immediately if "Locked BCM" error appears', 1, 'Xhorse recovery; may require dealer for OEM key restoration', '$700+'),
('Honda HR-V', 'RV', 'Medium', 'Incorrect OBD sequence in Autel KM100/IM508', 'Use latest software update; cross-check with Smart Pro before committing', 1, 'Standard Xhorse recovery', '$400-600'),
('Honda Pilot', 'YG', 'Low-Medium', 'Rare, but "Replace BCM" prompt if mismatched key generation', 'Dealer-preferred for hybrids; standard petrol OK with Autel', 1, 'Usually Xhorse; hybrids may need dealer', '$500-800'),
('Honda Passport', 'YF', 'Low', 'Minimal reports; older code base from 3rd gen', 'Standard Autel workflow safe for most scenarios', 1, 'Standard recovery methods', '$400'),
('Acura Integra', 'DE', 'High', 'Similar to Civic; "Driver 1/2" key slot mismatch in key assignment can corrupt memory', 'Use Acura-specific menu path in tool; verify KR5TP-2 not KR5TP-4', 1, 'Xhorse recovery; Acura dealer for full OEM', '$700+'),
('Acura MDX', 'YD/YE', 'Medium', 'Hatch-hold key programming errors; wrong button count selection', 'Ensure 4-button fob match; YE1 Type S needs extra verification', 1, 'Xhorse; dealer if Type S', '$600-900'),
('Acura RDX', 'TC', 'Medium', 'Proximity system select wrong in Autel; A-Spec adds complexity', 'Update tool firmware before attempting; verify trim level', 1, 'Xhorse recovery', '$500-700'),
('Acura TLX', 'UB', 'Medium', 'Type S variants have performance BCM with stricter validation', 'Verify trim in menu (UB7 = Type S); standard UB5/6 safer', 1, 'Xhorse; Type S may need dealer', '$600-1000');

-- ============================================================================
-- SECTION 3: Honda Key Compatibility Table (Enhanced)
-- Links OEM parts to FCC IDs, models, and generation
-- ============================================================================
DROP TABLE IF EXISTS honda_key_compatibility;
CREATE TABLE honda_key_compatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    oem_part_number TEXT NOT NULL,
    fcc_id TEXT NOT NULL,
    compatible_models TEXT,
    key_type TEXT, -- TP-2, TP-4
    generation TEXT, -- 10th, 11th
    chip_type TEXT,
    frequency_mhz INTEGER,
    button_count INTEGER,
    features TEXT, -- lock, unlock, trunk, panic, remote start, hatch
    incompatibility_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11th Generation Keys (2022+)
INSERT INTO honda_key_compatibility (oem_part_number, fcc_id, compatible_models, key_type, generation, chip_type, frequency_mhz, button_count, features, incompatibility_notes) VALUES
('72147-T20-A11', 'KR5TP-4', 'Honda Civic 2022-2025, Honda Accord 2023-2025', 'TP-4', '11th', 'Hitag AES 4A', 433, 5, 'lock/unlock/trunk/panic/remote start', 'INCOMPATIBLE with 10th gen BCMs - will brick'),
('72147-T6N-A41', 'KR5TP-4', 'Honda CR-V 2023-2025, Honda HR-V 2022-2025', 'TP-4', '11th', 'Hitag AES 4A', 433, 4, 'lock/unlock/trunk/panic', 'INCOMPATIBLE with RW chassis CR-V (5th gen)'),
('72147-TYA-A21', 'KR5TP-2', 'Acura Integra 2023-2025, Acura TLX 2022-2025', 'TP-4', '11th', 'Hitag AES 4A', 433, 4, 'lock/unlock/trunk/panic', 'Acura-specific; premium calibration'),
('72147-TJB-A31', 'KR5TP-2', 'Acura RDX 2022-2025, Acura MDX 2022-2025', 'TP-4', '11th', 'Hitag AES 4A', 433, 4, 'lock/unlock/hatch/panic', 'Driver 1/2 memory support'),
('72147-TY2-A81', 'KR5TP-2', 'Acura MDX Type S 2022-2025', 'TP-4', '11th', 'Hitag AES 4A', 433, 4, 'lock/unlock/hatch/panic', 'Type S performance BCM calibration'),

-- 10th Generation Keys (Pre-2022) - For Incompatibility Reference
('72147-TVA-A01', 'KR5V2X', 'Honda Accord 2018-2022 (10th gen)', 'TP-2', '10th', 'Basic Hitag', 433, 4, 'lock/unlock/trunk/panic', 'DO NOT USE on 11th gen - BRICKING RISK'),
('72147-TBA-A01', 'KR5V2X', 'Honda Civic 2016-2021 (10th gen)', 'TP-2', '10th', 'Basic Hitag', 433, 4, 'lock/unlock/trunk/panic', 'DO NOT USE on 11th gen - BRICKING RISK'),
('72147-TLA-A11', 'KR5V1X', 'Honda CR-V 2017-2022 (5th gen), Honda HR-V 2019-2022', 'TP-2', '10th', 'Basic Hitag', 433, 4, 'lock/unlock/trunk/panic', 'DO NOT USE on 6th gen CR-V (RS chassis)');

-- ============================================================================
-- SECTION 4: Tool Workflow Reference
-- Exact menu paths to prevent bricking
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_tool_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    operation TEXT, -- Add Key, AKL
    model_range TEXT,
    menu_path TEXT,
    critical_selection TEXT, -- The key selection to make
    avoid_selection TEXT, -- What NOT to select
    software_version TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_tool_workflows (tool_name, operation, model_range, menu_path, critical_selection, avoid_selection, software_version, notes) VALUES
('Autel IM608/IM608 Pro', 'Add Key', 'Honda 2022+', 'Honda > USA > [Model] > [Year] > IMMO > Smart Key System', 'Select "New Style" or "New Protocol"', 'DO NOT select "Old System" or any 10th gen prompt', 'Latest firmware required', 'If "Safety Check Failed" appears, STOP immediately'),
('Autel IM608/IM608 Pro', 'AKL', 'Honda 2022+', 'Honda > USA > [Model] > [Year] > IMMO > Smart Key System > All Keys Lost', 'Verify "11th Gen" or "2022+" in model selection', 'DO NOT proceed if it defaults to older year range', 'Latest firmware required', 'Internet required for AKL calculation'),
('Autel IM508', 'Add Key', 'Honda 2022+', 'Honda > USA > [Model] > IMMO > Key Learn', 'Select "New System"', 'Avoid "KM100" prompts for 2022+ vehicles', 'V2.0+', 'Less reliable than IM608 for 11th gen'),
('Smart Pro (ADS2336)', 'Add Key', 'Honda 2022+', 'Make > Honda > [Model] > [Year] > Key Programming', 'Follow OBD steps; confirm "Prox Key" system', 'N/A - Smart Pro generally safer', 'ADS2336 software', 'Touch interface; slower but lower bricking risk'),
('Smart Pro (ADS2336)', 'AKL', 'Honda 2022+', 'Make > Honda > [Model] > [Year] > Key Programming > All Keys Lost', 'Confirm proximity system type before proceeding', 'N/A', 'ADS2336 software', 'Requires active subscription and internet'),
('Xhorse VVDI Key Tool', 'Recovery', 'Honda 2022+ (Bricked)', 'Generate Key > Honda > XKHO01EN universal', 'Generate and program universal key to bypass lockout', 'N/A - recovery tool', 'Latest firmware', 'Use when Autel bricking occurs; 80-90% success rate');

-- ============================================================================
-- SECTION 5: Update Existing Vehicle Cards in vehicles_master
-- Links research to actual inventory
-- ============================================================================

-- Add columns if they don't exist (safe to run multiple times)
-- Already added in previous migrations, but ensuring they exist

-- Update Honda vehicles with security data
UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (11th Gen)',
    akl_difficulty = 'Hard',
    bypass_cable_required = 0,
    special_notes = 'BCM BRICKING RISK with wrong Autel prompts. Use "New Style/New Protocol" only. Xhorse recovery available. TP-4 keys only.'
WHERE make = 'Honda' AND model IN ('Civic', 'Accord') AND year_start >= 2022;

UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (6th Gen)',
    akl_difficulty = 'Hard',
    special_notes = 'BCM BRICKING RISK with wrong chip selection. Verify hybrid vs petrol in tool menu. RS chassis codes.'
WHERE make = 'Honda' AND model = 'CR-V' AND year_start >= 2023;

UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (3rd Gen)',
    akl_difficulty = 'Medium',
    special_notes = 'Medium bricking risk. RV/RS1 chassis. Update tool firmware before attempting.'
WHERE make = 'Honda' AND model = 'HR-V' AND year_start >= 2022;

UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (4th Gen)',
    akl_difficulty = 'Medium',
    special_notes = 'Lower bricking risk on petrol. YG chassis. Dealer preferred for hybrids.'
WHERE make = 'Honda' AND model = 'Pilot' AND year_start >= 2023;

-- Update Acura vehicles
UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (Acura Premium)',
    akl_difficulty = 'Hard',
    special_notes = 'HIGH BRICKING RISK. Based on Civic platform (DE chassis). Use Acura menu path. KR5TP-2 keys.'
WHERE make = 'Acura' AND model = 'Integra' AND year_start >= 2023;

UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (Acura Premium)',
    akl_difficulty = 'Hard',
    special_notes = 'YD/YE chassis. Type S (YE1) has stricter BCM. 4-button hatch fob with Driver 1/2 memory.'
WHERE make = 'Acura' AND model = 'MDX' AND year_start >= 2022;

UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (Acura Premium)',
    akl_difficulty = 'Medium',
    special_notes = 'TC chassis. A-Spec adds proximity calibration complexity. Update tool firmware first.'
WHERE make = 'Acura' AND model = 'RDX' AND year_start >= 2022;

UPDATE vehicles_master SET
    security_system = 'Hitag AES 4A (Acura Premium)',
    akl_difficulty = 'Medium',
    special_notes = 'UB chassis. UB7 = Type S with performance BCM. Standard (UB5/6) safer to program.'
WHERE make = 'Acura' AND model = 'TLX' AND year_start >= 2021;

-- ============================================================================
-- SECTION 6: Add New Locksmith Alerts Based on Research
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- High Priority Bricking Alerts
('Critical', 'Honda', 'Civic', 2022, 2025, 'Autel "Old System" = BCM Bricking', 'Selecting "Old System" or 10th gen prompts in Autel tools will brick BCM. No Start condition results.', 'Add Key, AKL', 'Use ONLY "New Style" or "New Protocol" in IMMO menu. If "Safety Check Failed" appears, STOP immediately. Xhorse XKHO01EN recovers 80-90% of bricks.', 'Honda_Acura_11th_Gen_Research', CURRENT_TIMESTAMP),
('Critical', 'Honda', 'Accord', 2023, 2025, 'TP-2 Key on TP-4 BCM = Bricking', 'Attempting to program 10th gen TP-2 key (KR5V2X) on 11th gen BCM causes immediate bricking.', 'Add Key', 'VERIFY key FCC ID before programming. 11th gen requires KR5TP-4 ONLY. TP-2 keys from 10th gen are physically similar but electronically incompatible.', 'Honda_Acura_11th_Gen_Research', CURRENT_TIMESTAMP),
('Critical', 'Acura', 'Integra', 2023, 2025, 'Driver 1/2 Memory Slot Mismatch Bricks BCM', 'DE chassis has Driver 1/2 memory integration. Wrong slot assignment during programming corrupts BCM firmware.', 'Add Key', 'Use Acura-specific menu path. Carefully follow Driver 1/2 prompts. KR5TP-2 keys required (NOT KR5TP-4).', 'Honda_Acura_11th_Gen_Research', CURRENT_TIMESTAMP),

-- Recovery Alerts
('Warning', 'Honda', 'All 11th Gen', 2022, 2025, 'Xhorse Universal Key = Bricking Recovery', 'When BCM is bricked from Autel misuse, Xhorse XKHO01EN universal key bypasses lockout via OBD in 80-90% of cases.', 'Recovery', 'Use VVDI Key Tool to generate XKHO01EN. Program via OBD. If fails, dealer BCM replacement ($700+) required.', 'Honda_Acura_11th_Gen_Research', CURRENT_TIMESTAMP),

-- Chassis Code Alerts
('Info', 'Honda', 'Civic', 2022, 2025, 'FE = Sedan, FL = Hatchback/Si/Type R', 'Chassis code determines BCM variant. FE1/FE2 for sedans, FL1/FL5 for hatchbacks. Use correct code in diagnostics.', 'Diagnostics', 'Verify chassis code on door jamb sticker. FE = sedan security config. FL = hatch security config. Misidentification causes programming errors.', 'Honda_Acura_11th_Gen_Research', CURRENT_TIMESTAMP),
('Info', 'Honda', 'CR-V', 2023, 2025, 'RS Chassis = 6th Gen (Not RW)', 'RS3/RS4 (petrol) and RS5/RS6 (hybrid) codes for 2023+. Previous 5th gen used RW codes. Keys NOT cross-compatible.', 'Key Identification', 'DO NOT use 5th gen RW keys on 6th gen RS chassis. Different BCM firmware. Verify VIN for generation.', 'Honda_Acura_11th_Gen_Research', CURRENT_TIMESTAMP),

-- Tool Guidance
('Warning', 'Honda', 'All 2022+', 2022, 2025, 'Smart Pro Safer Than Autel for 11th Gen', 'Smart Pro (ADS2336) has lower bricking risk than Autel IM series for Honda 11th gen due to stricter protocol validation.', 'Tool Selection', 'Prefer Smart Pro for 2022+ Honda/Acura if available. If using Autel, triple-check year and system selection.', 'Honda_Acura_11th_Gen_Research', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 7: Summary and Verification
-- ============================================================================
SELECT 'Honda/Acura 11th Gen Integration Complete' AS status,
       (SELECT COUNT(*) FROM honda_chassis_reference) AS chassis_entries,
       (SELECT COUNT(*) FROM honda_bcm_bricking_matrix) AS bricking_matrix_entries,
       (SELECT COUNT(*) FROM honda_key_compatibility) AS key_compatibility_entries,
       (SELECT COUNT(*) FROM honda_tool_workflows) AS tool_workflow_entries;
