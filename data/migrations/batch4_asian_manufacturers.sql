-- Batch 4: Asian Manufacturers Security Integration
-- Source: Toyota_Key_Chip_and_Immobilizer_Research.txt, Honda_BSI_Key_Programming_Challenges.txt

-- ============================================================================
-- SECTION 1: Toyota Transponder Evolution Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_transponder_evolution (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT,
    transponder_type TEXT, -- G-Chip, H-Chip, 8A-AA, 8A-BA
    chip_id TEXT,
    key_type TEXT, -- Bladed, Smart Key
    board_number TEXT,
    fcc_id TEXT,
    programming_method TEXT,
    akl_difficulty TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Toyota G-Chip to H-Chip Transition Data
INSERT OR REPLACE INTO toyota_transponder_evolution (model, year_start, year_end, platform, transponder_type, chip_id, key_type, board_number, fcc_id, programming_method, akl_difficulty, special_notes) VALUES
-- Camry Evolution
('Camry', 2012, 2014, 'XV50', 'G-Chip', 'ID72', 'Bladed', NULL, NULL, 'OBD + Seed Code', 'Medium', 'Transition era - verify blade stamp'),
('Camry', 2015, 2017, 'XV50', 'H-Chip', 'ID8A', 'Bladed', NULL, 'TOY44H-PT', 'OBD + 16min wait', 'Medium', 'H-Chip standard'),
('Camry', 2018, 2024, 'XV70 TNGA-K', 'H-Chip', 'ID8A', 'Smart Key', '231451-0351', 'HYQ14FBC', 'APB112 Emulator', 'Medium', 'TSS 2.0 - Standard 0351 board'),
('Camry', 2025, 2025, 'XV80 TNGA-K', '8A-BA', 'ID8A', 'Smart Key', 'BA-type', 'HYQ14FBW', 'G-Box3 + 30-Pin', 'High', 'NEW BA encryption - requires latest tools'),

-- RAV4 Evolution
('RAV4', 2013, 2015, 'XA40', 'G-Chip', 'ID72', 'Bladed', NULL, 'TOY44G-PT', 'OBD + Seed Code', 'Low', 'G-Chip standard'),
('RAV4', 2016, 2018, 'XA40', 'H-Chip', 'ID8A', 'Bladed/Smart', NULL, 'TOY44H-PT', 'OBD + 16min wait', 'Medium', 'Mid-cycle H-Chip intro'),
('RAV4', 2019, 2024, 'XA50 TNGA-K', 'H-Chip', 'ID8A', 'Smart Key', '231451-0351', 'HYQ14FBC', 'APB112 Emulator', 'Medium', 'Check WMI: J=Japan 314.3MHz, 2/4=NA 315MHz'),

-- Highlander Evolution
('Highlander', 2014, 2016, 'XU50', 'G-Chip', 'ID67/72', 'Bladed', NULL, NULL, 'OBD + Seed Code', 'Low', 'Legacy G-Chip'),
('Highlander', 2017, 2019, 'XU50', 'H-Chip', 'ID8A', 'Smart Key', '231451-0010', 'HYQ14FBA', 'OBD + Emulator', 'Medium', 'H-Chip introduction'),
('Highlander', 2020, 2023, 'XU70 TNGA-K', 'H-Chip', 'ID8A', 'Smart Key', '231451-0351', 'HYQ14FBC', 'APB112 Emulator', 'Medium', 'Standard TNGA'),
('Grand Highlander', 2024, 2025, 'TNGA-K', '8A-BA', 'ID8A', 'Smart Key', '0040/0E330', 'HYQ14FBX', 'G-Box3 + 30-Pin', 'High', 'BA encryption - NEW architecture'),

-- Tundra/Sequoia New Gen
('Tundra', 2014, 2021, 'XK50', 'H-Chip', 'ID8A', 'Smart Key', '231451-0010', 'HYQ14FBA', 'APB112 Emulator', 'Medium', 'Standard process'),
('Tundra', 2022, 2024, 'XK70 TNGA-F', '8A-BA', 'ID8A', 'Smart Key', 'BA-type', 'HYQ14FBX', 'G-Box3 + 30-Pin', 'Very High', 'NEW - 30-Pin cable mandatory'),
('Sequoia', 2023, 2024, 'XK80 TNGA-F', '8A-BA', 'ID8A', 'Smart Key', 'BA-type', 'HYQ14FBX', 'G-Box3 + 30-Pin', 'Very High', '30-Pin cable mandatory'),

-- Corolla Cross/Prius
('Corolla Cross', 2022, 2024, 'TNGA-C', '4A/8A-BA', 'ID4A', 'Smart Key', 'BA-type', 'HYQ14FLA', 'G-Box3 + 30-Pin', 'High', '4A chip - TSS 3.0'),
('Prius', 2023, 2024, 'TNGA-C', '8A-BA', 'ID8A', 'Smart Key', 'BA-type', 'HYQ14FBX', 'G-Box3 + 30-Pin', 'High', 'BA encryption');

-- ============================================================================
-- SECTION 2: Toyota Board ID Cross-Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_board_crossref (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_number TEXT NOT NULL,
    manufacturer TEXT, -- Denso, Tokai Rika
    fcc_ids TEXT,
    applicable_models TEXT,
    year_range TEXT,
    frequency_mhz INTEGER,
    encryption_page TEXT, -- AA, BA
    interchangeable_with TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO toyota_board_crossref (board_number, manufacturer, fcc_ids, applicable_models, year_range, frequency_mhz, encryption_page, interchangeable_with, notes) VALUES
-- Denso Boards (Dominant)
('231451-0351', 'Denso', 'HYQ14FBC, HYQ14FBA, HYQ14FBB', 'Camry XV70, RAV4 XA50, Highlander XU70', '2018-2024', 315, 'AA', '231451-0010', 'Golden Standard for TNGA - covers 80% volume'),
('231451-0010', 'Denso', 'HYQ14FBA', 'Prius Prime, Highlander XU50', '2017-2019', 315, 'AA', '231451-0351', 'Earlier TNGA implementations'),
('281451-2110', 'Denso', 'HYQ14FBA', 'Land Cruiser, Highlander Platinum/Limited', '2016-2022', 315, 'AA', NULL, 'CRITICAL: NOT compatible with 231451 despite matching FCC ID'),
('0040/0E330', 'Denso', 'HYQ14FBX', 'Grand Highlander, Sequoia, Tundra 2022+', '2024-2025', 315, 'BA', NULL, 'NEW BA encryption board'),

-- Tokai Rika Boards (Japan VINs)
('B74EA', 'Tokai Rika', 'HYQ14FBN', 'RAV4 (Japan VIN J-)', '2019-2024', 314, '88', NULL, 'Japan-build RAV4 - 314.3 MHz NOT 315'),
('B51TH', 'Tokai Rika', 'HYQ14FBX', 'Venza, older RAV4', '2015-2020', 314, '88', NULL, 'Older Tokai Rika standard');

-- ============================================================================
-- SECTION 3: Toyota TSS Gateway Versions
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_tss_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tss_version TEXT NOT NULL,
    year_range TEXT,
    applicable_models TEXT,
    encryption_page TEXT,
    obd_programmable BOOLEAN,
    bypass_required TEXT,
    required_hardware TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO toyota_tss_versions (tss_version, year_range, applicable_models, encryption_page, obd_programmable, bypass_required, required_hardware, special_notes) VALUES
('TSS 2.0', '2018-2021', 'Camry XV70, RAV4 XA50, Highlander XU70 (early)', 'AA', 1, 'Gateway Adapter', 'APB112 Emulator', 'Standard TNGA bypass - well supported'),
('TSS 3.0', '2022-2023', 'Sienna, Tundra 2022+, Corolla Cross', 'AA/BA', 0, '30-Pin Direct Connect', 'G-Box3 + 30-Pin Cable', 'OBD blocked - must bypass TGG directly'),
('TSS 4.0', '2023-2025', 'Grand Highlander, Prius 2023+, 2025 Camry', 'BA', 0, '30-Pin Direct Connect', 'G-Box3 + 30-Pin Cable + Updated Firmware', 'BA keys only - legacy AA emulators fail');

-- ============================================================================
-- SECTION 4: Honda 11th Gen BSI/BCM Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_bsi_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    chassis_code TEXT,
    year_start INTEGER,
    year_end INTEGER,
    generation TEXT,
    transponder_type TEXT,
    chip_id TEXT,
    fcc_id TEXT,
    bcm_part_number TEXT,
    frequency_mhz INTEGER,
    akl_risk_level TEXT, -- Low, Medium, High, Critical
    bricking_risk BOOLEAN,
    correct_tool_path TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Honda 11th Gen (Hitag AES Era)
INSERT OR REPLACE INTO honda_bsi_reference (model, chassis_code, year_start, year_end, generation, transponder_type, chip_id, fcc_id, bcm_part_number, frequency_mhz, akl_risk_level, bricking_risk, correct_tool_path, special_notes) VALUES
-- 11th Gen (HIGH RISK)
('Civic', 'FE', 2022, 2025, '11th Gen', 'Hitag AES', 'NCF29A1M (4A)', 'KR5TP-4', '38320-T20-A01', 434, 'Critical', 1, 'Manual Select > Civic > Smart Key > Push to Start', 'BRICKING RISK - Do NOT select 2020+ auto-detect. Use manual chassis selection.'),
('Civic Hatchback', 'FE', 2022, 2025, '11th Gen', 'Hitag AES', 'NCF29A1M (4A)', 'KR5TP-4', '38320-T43-A01', 434, 'Critical', 1, 'Manual Select > Civic > Smart Key > Push to Start', 'Same bricking risk as sedan'),
('Accord', 'CY', 2023, 2025, '11th Gen', 'Hitag AES', 'NCF29A1M (4A)', 'KR5TP-4', NULL, 434, 'Critical', 1, 'Manual Select > Accord > Smart Key', 'Uses same KR5TP-4 as Civic - platform unification'),
('Integra', 'DE', 2023, 2025, '11th Gen', 'Hitag AES', 'NCF29A1M (4A)', 'KR5TP-2', '72147-3S5-A01', 434, 'Critical', 1, 'Manual Select > Integra > Smart Key', 'TP-2 suffix - NOT interchangeable with Honda TP-4'),

-- 10th Gen (Legacy - Lower Risk)
('Civic', 'FC/FK', 2016, 2021, '10th Gen', 'Hitag 3', 'ID47', 'KR5V2X', NULL, 433, 'Medium', 0, 'Standard OBD programming', 'Rolling-PWN vulnerability existed but lower bricking risk'),
('Accord', 'CV', 2018, 2022, '10th Gen', 'Hitag 3', 'ID47', 'KR5V1X', NULL, 433, 'Medium', 0, 'Standard OBD programming', 'Standard Hitag 3 process');

-- ============================================================================
-- SECTION 5: Honda Key Compatibility Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_key_compatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL,
    generation TEXT,
    compatible_models TEXT,
    year_range TEXT,
    frequency_mhz INTEGER,
    chip_type TEXT,
    compatible_with_11th_gen BOOLEAN,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO honda_key_compatibility (fcc_id, generation, compatible_models, year_range, frequency_mhz, chip_type, compatible_with_11th_gen, notes) VALUES
('KR5TP-4', '11th Gen', 'Civic FE, Accord CY, CR-V, Pilot', '2022-2025', 434, 'Hitag AES (4A)', 1, 'Current standard for 11th Gen Honda'),
('KR5TP-2', '11th Gen', 'Acura Integra DE', '2023-2025', 434, 'Hitag AES (4A)', 1, 'Acura variant - NOT cross-compatible with Honda TP-4'),
('KR5V2X', '10th Gen', 'Civic FC/FK', '2016-2021', 433, 'Hitag 3', 0, 'WILL NOT WORK on 11th Gen - BCM rejects chip'),
('KR5V1X', '10th Gen', 'Accord CV', '2018-2022', 433, 'Hitag 3', 0, 'Legacy Accord - incompatible with 11th Gen'),
('MLBHLIK6-1TA', 'Legacy', 'Accord, CR-V', '2018-2022', 433, 'ID47', 0, 'Older Hitag 3 smart key');

-- ============================================================================
-- SECTION 6: Honda BCM Recovery Procedures
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_bcm_recovery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario TEXT NOT NULL,
    symptom TEXT,
    recovery_step_1 TEXT,
    recovery_step_2 TEXT,
    recovery_step_3 TEXT,
    success_rate TEXT,
    estimated_cost TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO honda_bcm_recovery (scenario, symptom, recovery_step_1, recovery_step_2, recovery_step_3, success_rate, estimated_cost, notes) VALUES
('BCM Bricked - Wrong Protocol', 'No Start after failed AKL attempt. Original keys also rejected.', 
 'Perform hard reset: Disconnect battery, touch cables together 10-15 min.', 
 'Use Xhorse Universal Smart Key (specifically for Civic 2022+ profile). Generate with pre-locked data.',
 'Attempt AKL with Xhorse tool - may bypass corrupted handshake requirement.',
 '40-60%', 'Key cost only (~$50)', 'Xhorse Universal Keys can sometimes satisfy corrupted rolling code window'),

('BCM Bricked - Recovery Failed', 'Xhorse method unsuccessful. Vehicle completely immobile.',
 'Source NEW BCM from dealer (Part ~$170-200).',
 'Install new BCM (comes in Virgin/Manufacturing mode).',
 'Program keys using HDS or aftermarket tool with CORRECT manual selection.',
 '100%', '$170-800 (part + labor)', 'May require PCM and ABS/VSA resync. Used BCMs are locked to donor.'),

('Safety Check Failed', 'Tool cannot initiate programming session.',
 'Verify internet connection (online calculation required).',
 'Use Manual Selection path - do NOT use auto-detect or 2020+ prompt.',
 'Ensure correct key hardware (KR5TP-4/TP-2, not KR5V2X).',
 '90%', '$0', 'Protocol mismatch from incorrect menu selection');

-- ============================================================================
-- SECTION 7: Asian Manufacturer Locksmith Alerts
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- Toyota Alerts
('Warning', 'Toyota', 'Grand Highlander/Tundra/Sequoia', 2022, 2025, '8A-BA Encryption - Standard Emulators Fail', 'Page 1 BA keys use modified encryption. AA emulators (APB112 pre-2023) will not work.', 'All Keys Lost', 'Require G-Box3 + 30-Pin cable. Update tool firmware to support BA protocol.', 'Toyota_Key_Chip_and_Immobilizer_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Toyota', 'RAV4 XA50', 2019, 2024, 'J-VIN vs NA-VIN Frequency Mismatch', 'Japan-built RAV4 (VIN starts J) uses 314.3 MHz Tokai Rika. NA-built uses 315 MHz Denso.', 'Key Ordering', 'Check VIN WMI before ordering. J=314.3MHz, 2/4=315MHz. Keys are NOT interchangeable.', 'Toyota_Key_Chip_and_Immobilizer_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Toyota', 'Camry/RAV4/Highlander', 2018, 2024, 'Board 281451-2110 Incompatibility', 'Land Cruiser board (281451-2110) will NOT program to standard TNGA despite matching FCC ID.', 'Key Programming', 'Verify board number matches: Use 231451-0351 for Camry/RAV4/Highlander. 281451 is Land Cruiser only.', 'Toyota_Key_Chip_and_Immobilizer_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Toyota', 'TNGA Models', 2018, 2025, 'Smart ECU Location for 30-Pin Bypass', 'Smart Key ECU buried behind glovebox or kick panel. Requires partial dash disassembly for cable access.', 'All Keys Lost', 'Allow extra time for disassembly. Camry: behind glovebox. RAV4: driver kick panel.', 'Toyota_Key_Chip_and_Immobilizer_Research.txt', CURRENT_TIMESTAMP),

-- Honda Alerts
('Critical', 'Honda', 'Civic FE', 2022, 2025, 'BCM BRICKING RISK - Wrong Protocol Selection', 'Selecting YES to 2020+ prompt in Autel causes protocol mismatch. BCM enters defensive lockdown.', 'All Keys Lost', 'ALWAYS use Manual Selection: Civic > Smart Key > Push to Start. Select NO for 2020+ prompt.', 'Honda_BSI_Key_Programming_Challenges.txt', CURRENT_TIMESTAMP),
('Critical', 'Honda', 'Accord CY', 2023, 2025, 'Same BCM Bricking Risk as Civic', '11th Gen Accord uses identical BCM architecture. Same bricking failure mode.', 'All Keys Lost', 'Manual selection only. Internet required for Hitag AES calculation.', 'Honda_BSI_Key_Programming_Challenges.txt', CURRENT_TIMESTAMP),
('Critical', 'Acura', 'Integra DE', 2023, 2025, 'TP-2 vs TP-4 Key Incompatibility', 'Integra uses KR5TP-2, Honda uses KR5TP-4. BCM whitelist prevents cross-brand usage.', 'Key Ordering', 'Order KR5TP-2 for Integra specifically. Honda TP-4 keys will be rejected.', 'Honda_BSI_Key_Programming_Challenges.txt', CURRENT_TIMESTAMP),
('Warning', 'Honda', 'All 11th Gen', 2022, 2025, '10th Gen Keys Incompatible', 'KR5V2X (10th Gen Civic) and KR5V1X (10th Gen Accord) use Hitag 3. BCM cannot communicate with these chips.', 'Key Programming', 'Verify key FCC ID before attempting. Must be KR5TP-4 or KR5TP-2 for 11th Gen.', 'Honda_BSI_Key_Programming_Challenges.txt', CURRENT_TIMESTAMP),
('Warning', 'Honda', 'All 11th Gen', 2022, 2025, 'Internet Required for AKL', 'Hitag AES calculation performed server-side. No offline seed-key method exists.', 'All Keys Lost', 'Ensure stable WiFi connection. Safety Check Failed often indicates connectivity issue.', 'Honda_BSI_Key_Programming_Challenges.txt', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 8: Update vehicles_master with Asian Data
-- ============================================================================
UPDATE vehicles_master SET
    transponder_type = 'H-Chip (ID8A)',
    programming_method = 'APB112 Emulator',
    akl_difficulty = 'Medium',
    special_notes = COALESCE(special_notes || ' | ', '') || 'TSS 2.0 - Standard 0351 board. Check WMI for J-VIN frequency.'
WHERE make = 'Toyota' AND model IN ('Camry', 'RAV4', 'Highlander') AND year_start >= 2018 AND year_end <= 2023;

UPDATE vehicles_master SET
    transponder_type = '8A-BA',
    programming_method = 'G-Box3 + 30-Pin Cable',
    akl_difficulty = 'High',
    special_notes = COALESCE(special_notes || ' | ', '') || 'BA encryption - Standard AA emulators fail. Requires latest firmware.'
WHERE make = 'Toyota' AND model IN ('Tundra', 'Sequoia', 'Grand Highlander') AND year_start >= 2022;

UPDATE vehicles_master SET
    transponder_type = 'Hitag AES (4A)',
    programming_method = 'Manual Selection - Avoid Auto-Detect',
    akl_difficulty = 'Critical',
    bricking_risk = 1,
    special_notes = COALESCE(special_notes || ' | ', '') || 'BRICKING RISK - Use manual chassis selection. NO 2020+ prompt.'
WHERE make IN ('Honda', 'Acura') AND model IN ('Civic', 'Accord', 'Integra') AND year_start >= 2022;

-- Mark completion
SELECT 'Batch 4 Asian Manufacturers Complete' AS status,
       (SELECT COUNT(*) FROM toyota_transponder_evolution) AS toyota_transponder_entries,
       (SELECT COUNT(*) FROM toyota_board_crossref) AS board_crossrefs,
       (SELECT COUNT(*) FROM honda_bsi_reference) AS honda_bsi_entries;
