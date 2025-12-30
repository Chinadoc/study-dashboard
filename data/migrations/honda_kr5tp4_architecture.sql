-- Honda KR5TP-4 Architecture Integration
-- Source: Honda_11th_Gen_Key_Chip_Research.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Honda Key Architecture Generations
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_key_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generation TEXT NOT NULL,
    fcc_id_family TEXT,
    chip_type TEXT,
    chip_id TEXT,
    encryption_standard TEXT,
    encryption_bits INTEGER,
    year_start INTEGER,
    year_end INTEGER,
    frequency_mhz REAL,
    key_blade TEXT,
    programming_method TEXT,
    bcm_brick_risk TEXT,
    vehicle_compatibility TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_key_generations (generation, fcc_id_family, chip_type, chip_id, encryption_standard, encryption_bits, year_start, year_end, frequency_mhz, key_blade, programming_method, bcm_brick_risk, vehicle_compatibility, notes) VALUES
('10th Gen (Legacy)', 'KR5V2X/KR5V1X', 'NCF2952', 'ID47 (Hitag 3)', 'Proprietary Hitag 3', 96, 2013, 2021, 433.92, 'HON66', 'Standard OBD emulator (APB112)', 'Low', 'Civic 2016-2021, Accord 2013-2017, Odyssey 2014-2017, Pilot 2016-2021', 'Forgiving programming. Aftermarket tools easily emulate. KR5V2X = 433MHz, KR5V1X = 313.8MHz'),
('11th Gen (Honda Architecture)', 'KR5TP-4', 'NCF29A1M', 'ID4A (Hitag AES)', 'AES-128', 128, 2022, 2025, 433.92, 'INS-HON-01 (HON66 compatible)', '30-Pin bypass or Universal Key (XM38)', 'HIGH - BCM Tamper Protection', 'Civic 2022-2025, Accord 2023-2025, CR-V 2023-2026, HR-V 2023-2026, Pilot 2023-2025', 'Military-grade encryption. ID47 keys INCOMPATIBLE. "Safety Check Failed" = protocol mismatch.'),
('Legacy Odyssey', 'KR5T4X', 'NCF2952', 'ID47 (Hitag 3)', 'Proprietary Hitag 3', 96, 2021, 2024, 433.92, 'HON66', 'Standard OBD emulator', 'Low', 'Odyssey 2021-2024', 'EXCEPTION: Odyssey NOT on Honda Architecture. Uses legacy ID47 despite 2024 model year. Do NOT use KR5TP-4.');

-- ============================================================================
-- SECTION 2: Honda KR5TP-4 Detailed Specifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_kr5tp4_spec (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    specification TEXT NOT NULL,
    value TEXT NOT NULL,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_kr5tp4_spec (specification, value, source) VALUES
('FCC ID', 'KR5TP-4', 'FCC.report'),
('IC (Industry Canada)', '7812D-TP4', 'FCC.report'),
('Manufacturer', 'Continental Automotive GmbH', 'FCC Filing'),
('Transponder IC', 'NXP NCF29A1M', 'ACTIC-4G/Pygmalion family'),
('Chip Logic', 'Hitag AES (ID4A)', 'NXP specification'),
('Encryption', 'AES-128 (military-grade)', 'NXP specification'),
('Frequency (NA)', '433.92 MHz', 'FCC Filing - now unified with global'),
('Modulation', 'FSK (Frequency Shift Keying)', 'FCC Filing'),
('LF Interface', '125 kHz (passive proximity)', 'Dual-interface IC'),
('Keyway', 'HON66 (INS-HON-01 blade head)', 'Compatible with Lishi HON66'),
('Memory Structure', 'AES pages require encrypted session to read', 'Cannot clone without master key');

-- ============================================================================
-- SECTION 3: Honda Model Year Compatibility Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_model_key_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    fcc_id TEXT,
    chip_type TEXT,
    part_number TEXT,
    architecture TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_model_key_matrix (model, year_start, year_end, fcc_id, chip_type, part_number, architecture, notes) VALUES
-- 11th Gen KR5TP-4 (Hitag AES)
('Civic', 2022, 2025, 'KR5TP-4', 'ID4A (Hitag AES)', '72147-T20-A01/A11', '11th Gen Honda Architecture', '4 or 5 button smart key. AES-128 encryption.'),
('Accord', 2023, 2025, 'KR5TP-4', 'ID4A (Hitag AES)', '72147-T20-A11', '11th Gen Honda Architecture', 'New generation. Shares security with Civic 2022+.'),
('CR-V', 2023, 2026, 'KR5TP-4', 'ID4A (Hitag AES)', '72147-T43-A01', '11th Gen Honda Architecture', '6th Generation. 4-button smart key.'),
('HR-V', 2023, 2026, 'KR5TP-4', 'ID4A (Hitag AES)', '72147-T43-A01', '11th Gen Honda Architecture', 'Shares part with CR-V.'),
('Pilot', 2023, 2025, 'KR5TP-4', 'ID4A (Hitag AES)', '72147-T90-A01', '11th Gen Honda Architecture', '4th Generation.'),

-- Odyssey EXCEPTION (still ID47 legacy)
('Odyssey', 2021, 2024, 'KR5T4X', 'ID47 (Hitag 3)', '72147-THR-A41/A61/A72', 'Legacy Platform', 'CRITICAL: NOT on Honda Architecture. 5 or 7 button. Still uses ID47 despite being 2024 model.'),

-- 10th Gen Legacy (KR5V2X)
('Civic', 2016, 2021, 'KR5V2X', 'ID47 (Hitag 3)', '72147-TVA-A11/A21', 'Global Compact Platform', '10th Gen. Standard OBD programming.'),
('Accord', 2013, 2017, 'KR5V2X', 'ID47 (Hitag 3)', '72147-T2A-A01', 'Global Platform', '9th Gen.'),
('Pilot', 2016, 2022, 'KR5V2X', 'ID47 (Hitag 3)', '72147-TG7-A01', 'Global Platform', '3rd Gen.');

-- ============================================================================
-- SECTION 4: Universal Key Bypass Solution
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_universal_key_bypass (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_brand TEXT NOT NULL,
    universal_key_model TEXT,
    required_chip TEXT,
    mechanism TEXT,
    success_rate TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_universal_key_bypass (tool_brand, universal_key_model, required_chip, mechanism, success_rate, notes) VALUES
('Xhorse', 'XM38', 'ID4A (Hitag AES)', 'Emulator generates "Dealer/Service Key" response that BCM accepts even when rejecting OEM keys', '80-90%', 'Counter-intuitive: cheap emulator works when $200 OEM key fails. Bypass BCM rigidity.'),
('Autel', 'IKEY Universal', 'ID4A (Hitag AES)', 'Similar flexible emulation that responds with permissive handshake', '80-90%', 'Generate as "Honda Civic 2022 (ID4A)" profile.'),
('OEM', 'OEM KR5TP-4', 'ID4A (pre-coded)', 'Pre-coded with strict manufacturer configuration', 'Fails if BCM in locked state', 'OEM key rejected if BCM in Tamper Protection mode after failed attempts.');

-- ============================================================================
-- SECTION 5: Rolling-PWN Vulnerability Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS honda_security_vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cve_id TEXT,
    vulnerability_name TEXT,
    affected_years TEXT,
    affected_fcc_ids TEXT,
    mechanism TEXT,
    mitigation TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO honda_security_vulnerabilities (cve_id, vulnerability_name, affected_years, affected_fcc_ids, mechanism, mitigation, notes) VALUES
('CVE-2021-46145', 'Rolling-PWN', '2012-2022 (early production)', 'KR5V2X, KR5TP-4 (early)', 'Rolling code counter can be resynchronized to arbitrary value by sending specific sequence. Attacker can replay captured codes.', 'Firmware update (late 2023/2024). Keep FOB in faraday bag.', 'This is a LOGIC flaw, not crypto flaw. AES-128 encryption does not prevent attack because counter validation logic is flawed.');

-- ============================================================================
-- SECTION 6: Update vehicles and locksmith_alerts
-- ============================================================================
UPDATE vehicles SET
    security_system = 'Honda 11th Gen (Hitag AES/ID4A)',
    akl_difficulty = 'High',
    special_notes = 'KR5TP-4 FCC ID. NCF29A1M chip (ID4A). AES-128 encryption. ID47 keys = INSTANT FAILURE. Universal key (XM38/IKEY) required for bricked BCM recovery.'
WHERE make = 'Honda' AND model IN ('Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot')
AND year_start >= 2022;

UPDATE vehicles SET
    security_system = 'Honda Legacy (Hitag 3/ID47)',
    akl_difficulty = 'Medium',
    special_notes = 'KR5T4X FCC ID. EXCEPTION: Odyssey NOT on Honda Architecture despite 2024 model year. Uses legacy ID47 chip. Standard OBD programming.'
WHERE make = 'Honda' AND model = 'Odyssey' AND year_start >= 2021 AND year_start <= 2024;

INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Honda', 'All 11th Gen', 2022, 2025, 'ID47 Chip = Instant Failure on 11th Gen', 'The BCM uses Hitag AES (ID4A) encryption. ID47 (Hitag 3) chips send invalid response. BCM interprets as security violation. "Safety Check Failed" = protocol mismatch.', 'Key Programming', 'Use ONLY ID4A compatible keys (KR5TP-4 or XM38 universal). Update tool software to support Honda ID4A.', 'Honda_11th_Gen_Key_Chip_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Honda', 'All 11th Gen', 2022, 2025, 'BCM Tamper Protection = OEM Key Rejection', 'After failed programming attempts, BCM enters Tamper Protection mode. Rejects ALL keys including valid OEM fobs. Alarm stays armed. Push-button unresponsive.', 'All Keys Lost', 'Use Xhorse XM38 or Autel IKEY universal key to bypass. These emulators respond with "permissive service key" handshake that BCM accepts.', 'Honda_11th_Gen_Key_Chip_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Honda', 'Odyssey', 2021, 2024, 'Odyssey = Legacy ID47 (NOT Honda Architecture)', 'Despite being 2024 model, Odyssey uses older platform with legacy ID47 (Hitag 3) chip. KR5T4X fob is physically similar but electronically incompatible with KR5TP-4.', 'Key Ordering', 'Order KR5T4X for Odyssey. Do NOT use KR5TP-4. 7-button layout for sliding doors.', 'Honda_11th_Gen_Key_Chip_Research.txt', CURRENT_TIMESTAMP),
('Info', 'Honda', 'All Models', 2022, 2025, 'Frequency Harmonized to 433.92 MHz', 'Honda has unified North American frequency to 433.92 MHz (was split with 313.8 MHz). Simplifies inventory.', 'Parts Inventory', 'KR5TP-4 = 433.92 MHz only. No more split frequency SKUs needed for new models.', 'Honda_11th_Gen_Key_Chip_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Honda', 'All 11th Gen', 2022, 2025, 'Rolling-PWN Vulnerability (CVE-2021-46145)', '2022 early production units may be vulnerable to rolling code replay attack. AES encryption does not prevent this because logic flaw is in counter validation.', 'Security Advisory', 'Check for firmware updates. Advise customer to use faraday pouch for fob storage if concerned.', 'Honda_11th_Gen_Key_Chip_Research.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Honda KR5TP-4 Architecture Integration Complete' AS status,
       (SELECT COUNT(*) FROM honda_key_generations) AS generation_entries,
       (SELECT COUNT(*) FROM honda_model_key_matrix) AS model_entries,
       (SELECT COUNT(*) FROM honda_universal_key_bypass) AS bypass_entries;
