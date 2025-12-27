-- Batch 2: Cross-Reference Data and Tool Coverage Integration
-- Source: Automotive_Key_Cross-Reference_Database.txt, Automotive_Transponder_Chip_Database.txt, Locksmith_Tool_Vehicle_Coverage.txt

-- ============================================================================
-- SECTION 1: Transponder Chip Reference Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS transponder_chip_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chip_family TEXT NOT NULL, -- TI, NXP, Megamos
    chip_id TEXT NOT NULL,
    chip_name TEXT,
    encryption_type TEXT, -- Fixed, Crypto 40-bit, Crypto 80-bit, AES-128
    bit_length INTEGER,
    clonable BOOLEAN,
    clone_chips TEXT, -- Compatible aftermarket chips
    common_makes TEXT,
    programming_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Texas Instruments Ecosystem
INSERT OR REPLACE INTO transponder_chip_reference (chip_family, chip_id, chip_name, encryption_type, bit_length, clonable, clone_chips, common_makes, programming_notes) VALUES
('Texas Instruments', '4C', 'TI 4C', 'Fixed Code', 0, 1, 'CN1, TPX1, XT27', 'Ford (late 90s-mid 2000s), Toyota', 'High clonability - legacy system'),
('Texas Instruments', '4D', 'TI 4D (Crypto)', 'Crypto 40-bit', 40, 1, 'CN2, TPX2, LKP-02, XT27', 'Ford, Mazda, Subaru, Mitsubishi, Toyota', 'Clonable via sniffing'),
('Texas Instruments', 'ID72', 'DST-80 (G-Chip)', 'Crypto 80-bit', 80, 1, 'CN5, LKP-02, XT27', 'Toyota G-Chip, Ford 80-bit', 'Toyota G chip - blade stamp identification'),
('Texas Instruments', 'ID63', '4D-63', 'Crypto 40/80-bit', 40, 1, 'CN2, LKP-02', 'Ford, Mazda', '40-bit vs 80-bit - check blade stamp'),
('Texas Instruments', 'ID8A', 'DST-AES (H-Chip)', 'AES 128-bit', 128, 1, 'LKP-04, XT27', 'Toyota H-Chip', 'Toyota H-Chip - clonable with specific tools'),

-- NXP/Philips Hitag Ecosystem
('NXP Hitag', 'ID46', 'Hitag 2', 'Crypto', 48, 1, 'TPX3/4, CN3, XT27', 'GM Circle Plus, Honda, Nissan, Chrysler', 'Widely sniffable'),
('NXP Hitag', 'ID47', 'Hitag 3', 'AES', 128, 0, NULL, 'Honda, Hyundai/Kia Smart Keys', 'OBD programming only'),
('NXP Hitag', 'ID49', 'Hitag Pro', 'AES 128-bit', 128, 0, NULL, 'Ford/Mazda 2015+', 'NOT clonable - OBD programming only'),
('NXP Hitag', 'ID4A', 'Hitag AES', 'AES', 128, 0, NULL, 'Nissan 2020+, Hyundai/Kia 2020+', 'Limited cloning support'),

-- Megamos Ecosystem
('Megamos', 'ID48', 'Megamos Crypto', 'Crypto 96-bit', 96, 1, 'Server Calculation', 'VW/Audi Immo 3/4, Honda, Volvo', '96-bit cloning via server calculation'),
('Megamos', 'ID88', 'Megamos AES (MQB)', 'AES 128-bit', 128, 0, NULL, 'VW Golf Mk7+ (MQB)', 'Unclonable - requires dealer authentication');

-- ============================================================================
-- SECTION 2: Key Blade Cross-Reference Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS key_blade_crossref (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyway_profile TEXT NOT NULL,
    vehicle_makes TEXT,
    keydiy_blade TEXT,
    jma_blade TEXT,
    ilco_blade TEXT,
    strattec_blade TEXT,
    blade_type TEXT, -- Edge Cut, Laser Cut, High Security
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO key_blade_crossref (keyway_profile, vehicle_makes, keydiy_blade, jma_blade, ilco_blade, strattec_blade, blade_type, notes) VALUES
-- GM
('HU100', 'GM 2010+', '#71', 'GM-30E', 'HU100', NULL, 'High Security', 'Z-Keyway'),
('B106/B111', 'GM Pre-2010', '#69', 'GM-37', 'B106', NULL, 'Edge Cut', 'Standard Edge Cut'),

-- Ford
('HU101', 'Ford 2011+', '#38', 'FO-20DE', 'HU101', NULL, 'High Security', 'Laser Cut'),
('H75', 'Ford Pre-2011', '#19', 'FO-15DE', 'H75', NULL, 'Edge Cut', 'Standard Edge Cut'),

-- Chrysler/Stellantis
('Y159', 'Chrysler/Dodge', '#04', 'CHR-15', 'Y159', NULL, 'Edge Cut', '8-Cut Edge'),
('SIP22', 'Ram/Jeep New', '#111', 'FI-16', 'SIP22', NULL, 'High Security', 'Fiat Style'),

-- Toyota
('TOY43', 'Toyota Old', '#02', 'TOYO-15', 'TOY43', NULL, 'Edge Cut', 'Standard Edge Cut'),
('TR47/TOY48', 'Toyota New', '#15', 'TOYO-36', 'TOY48', NULL, 'High Security', 'Short Blade'),

-- Honda
('HO01', 'Honda', '#25', 'HOND-31', 'HO01', NULL, 'High Security', 'Laser Cut'),
('HO03', 'Honda High Sec', '#25', 'HOND-24', 'HO03-PT', NULL, 'High Security', 'High Security Laser'),

-- Nissan
('NSN14', 'Nissan', '#22', 'DAT-15', 'NI04', NULL, 'Edge Cut', '10-Cut Standard'),

-- Hyundai/Kia
('HY18', 'Hyundai/Kia', '#129', 'HY-18', 'HY18', NULL, 'High Security', 'Center Mill'),
('KK10', 'Kia', '#10', 'KIA-7', 'KK10', NULL, 'High Security', 'Offset Mill'),

-- VW/Audi
('HU66', 'VW/Audi', '#42', 'VO-2', 'HU66', NULL, 'Laser Cut', 'Standard VAG Laser'),
('HU162T', 'VW/Audi MQB-Evo', '#162', 'VO-10', 'HU162', NULL, 'High Security', 'Side Cut - New MQB'),

-- BMW
('HU92', 'BMW E-Series', '#67', 'BM-6', 'HU92', NULL, 'High Security', '4-Track'),
('HU58', 'BMW Old', '#67', 'BM-5', 'HU58', NULL, 'Edge Cut', 'Old 4-Track'),

-- Mercedes
('HU64', 'Mercedes', '#64', 'ME-HM', 'HU64', NULL, 'High Security', 'Standard Mercedes');

-- ============================================================================
-- SECTION 3: Tool Capability Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS tool_capability_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    add_key_support TEXT, -- Yes, Limited, No
    akl_support TEXT, -- Yes, Limited, No, Bench Only
    protocol TEXT, -- CAN, CAN FD, Legacy
    required_adapter TEXT,
    risk_level TEXT, -- Low, Medium, High, Very High
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Autel IM608 Capabilities
INSERT OR REPLACE INTO tool_capability_matrix (tool_name, make, model, year_start, year_end, add_key_support, akl_support, protocol, required_adapter, risk_level, special_notes) VALUES
-- GM
('Autel IM608', 'Chevrolet', 'Silverado', 2014, 2018, 'Yes', 'Yes', 'CAN', 'None', 'Low', 'Standard OBD'),
('Autel IM608', 'Chevrolet', 'Silverado', 2019, 2021, 'Yes', 'Yes', 'CAN', 'None', 'Low', 'Legacy CAN'),
('Autel IM608', 'Chevrolet', 'Silverado', 2022, 2025, 'Limited', 'Limited', 'CAN FD/VIP', 'CAN FD Adapter', 'High', 'VIP Architecture - Limited'),
('Autel IM608', 'Chevrolet', 'Tahoe', 2015, 2020, 'Yes', 'Yes', 'CAN', 'None', 'Low', 'Standard OBD'),
('Autel IM608', 'Chevrolet', 'Tahoe', 2021, 2024, 'Yes', 'Yes', 'CAN FD', 'CAN FD Adapter', 'Medium', 'CAN FD required'),
('Autel IM608', 'Chevrolet', 'Corvette C8', 2020, 2024, 'Yes', 'Add Key Only', 'CAN FD', 'CAN FD Adapter', 'High', 'AKL may require dealer'),

-- Ford
('Autel IM608', 'Ford', 'F-150', 2015, 2020, 'Yes', 'Yes', 'CAN', 'None', 'Low', '2 Keys required for AKL closure'),
('Autel IM608', 'Ford', 'F-150', 2021, 2024, 'Yes', 'Limited', 'Active Alarm', 'Bypass Cable', 'Medium', 'Active Alarm blocks OBD'),
('Autel IM608', 'Ford', 'Bronco', 2021, 2024, 'Yes', 'Limited', 'Active Alarm', 'Bypass Cable', 'Medium', 'Same as F-150'),
('Autel IM608', 'Ford', 'Mustang Mach-E', 2021, 2024, 'Limited', 'Limited', 'Active Alarm', 'Bypass Cable', 'High', 'EV architecture tricky'),

-- Stellantis
('Autel IM608', 'RAM', '1500', 2013, 2017, 'Yes', 'Yes', 'CAN', 'None', 'Low', 'Standard OBD'),
('Autel IM608', 'RAM', '1500', 2018, 2024, 'Yes', 'Yes', 'CAN', 'AutoAuth', 'Low', 'SGW bypass required'),
('Autel IM608', 'Jeep', 'Grand Cherokee', 2014, 2021, 'Yes', 'Yes', 'CAN', 'AutoAuth (18+)', 'Low', 'SGW on 2018+'),
('Autel IM608', 'Jeep', 'Grand Cherokee L', 2021, 2024, 'No', 'No', 'RF Hub Lock', 'N/A', 'Very High', 'Replace RF Hub for AKL'),
('Autel IM608', 'Jeep', 'Wagoneer', 2022, 2024, 'No', 'No', 'RF Hub Lock', 'N/A', 'Very High', 'Replace RF Hub for AKL'),

-- Toyota
('Autel IM608', 'Toyota', 'Camry', 2012, 2017, 'Yes', 'Yes', 'H-Chip', 'APB112 Emulator', 'Medium', 'Emulator required for AKL'),
('Autel IM608', 'Toyota', 'Camry', 2018, 2023, 'Yes', 'Yes', '8A Smart', 'G-Box3 + APB112', 'Medium', 'G-Box connection to Smart Box'),
('Autel IM608', 'Toyota', 'Tundra', 2022, 2024, 'Yes', 'Yes', '8A-BA', 'G-Box3 + 30-Pin Cable', 'High', 'Requires back-powering ECU'),
('Autel IM608', 'Toyota', 'Corolla Cross', 2022, 2024, 'Yes', 'Yes', '4A', 'G-Box3 + 30-Pin Cable', 'High', '30-Pin cable essential'),

-- Honda
('Autel IM608', 'Honda', 'Accord', 2013, 2021, 'Yes', 'Yes', 'CAN', 'None', 'Low', 'Standard OBD'),
('Autel IM608', 'Honda', 'Civic', 2022, 2024, 'Yes', 'Limited', 'CAN', 'None', 'Very High', 'BCM bricking risk - voltage critical'),

-- European
('Autel IM608', 'BMW', 'F-Series', 2012, 2019, 'Yes', 'Bench', 'CAN', 'XP400 Pro', 'High', 'FEM/BDC bench work required'),
('Autel IM608', 'BMW', 'G-Series', 2019, 2025, 'Limited', 'No', 'CAN', 'XP400 Pro', 'Very High', 'BDC2 locked - high risk'),
('Autel IM608', 'Volkswagen', 'MQB', 2015, 2020, 'Yes', 'Yes', 'MQB', 'XP400 Pro', 'Medium', 'Pin lifting may be required'),
('Autel IM608', 'Volkswagen', 'MQB-Evo', 2020, 2025, 'Limited', 'No', 'MQB-Evo', 'N/A', 'Very High', 'Sync Data required - dealer only');

-- Smart Pro Capabilities
INSERT OR REPLACE INTO tool_capability_matrix (tool_name, make, model, year_start, year_end, add_key_support, akl_support, protocol, required_adapter, risk_level, special_notes) VALUES
('Smart Pro', 'Ford', 'F-150', 2015, 2020, 'Yes', 'Yes', 'CAN', 'None', 'Low', 'Excellent Ford support'),
('Smart Pro', 'Ford', 'F-150', 2021, 2024, 'Yes', 'Yes', 'Active Alarm', 'None', 'Low', 'Software bypass - no cable needed'),
('Smart Pro', 'Ford', 'Bronco', 2021, 2024, 'Yes', 'Yes', 'Active Alarm', 'None', 'Low', 'Software bypass'),
('Smart Pro', 'Honda', 'Civic', 2022, 2024, 'Yes', 'Yes', 'CAN', 'None', 'Medium', 'ADS2336 update - safest method'),
('Smart Pro', 'Chevrolet', 'Silverado', 2014, 2021, 'Yes', 'Yes', 'CAN', 'None', 'Low', 'Standard OBD'),
('Smart Pro', 'Chevrolet', 'Silverado', 2022, 2025, 'Limited', 'Limited', 'CAN FD/VIP', 'ADC2015', 'Medium', 'VIP limitations'),
('Smart Pro', 'RAM', '1500', 2018, 2024, 'Yes', 'Yes', 'CAN', 'AutoAuth', 'Low', 'SGW via AutoAuth'),
('Smart Pro', 'Jeep', 'Grand Cherokee L', 2021, 2024, 'No', 'No', 'RF Hub Lock', 'N/A', 'Very High', 'Virgin RF Hub required');

-- Lonsdor K518 Capabilities
INSERT OR REPLACE INTO tool_capability_matrix (tool_name, make, model, year_start, year_end, add_key_support, akl_support, protocol, required_adapter, risk_level, special_notes) VALUES
('Lonsdor K518', 'Volvo', 'XC90', 2016, 2022, 'Yes', 'Yes', 'CAN', 'CEM Adapter', 'Medium', 'Excellent Volvo - OBD via CEM pins'),
('Lonsdor K518', 'Volvo', 'XC60', 2018, 2022, 'Yes', 'Yes', 'CAN', 'CEM Adapter', 'Medium', 'Non-invasive CEM read'),
('Lonsdor K518', 'Toyota', 'Camry', 2018, 2023, 'Yes', 'Yes', '8A Smart', 'LKE Emulator', 'Low', 'Often OBD possible without PIN'),
('Lonsdor K518', 'Toyota', 'Tundra', 2022, 2024, 'Yes', 'Yes', '8A-BA', '30-Pin Cable', 'Medium', 'Excellent 8A-BA support'),
('Lonsdor K518', 'Subaru', 'Outback', 2020, 2024, 'Yes', 'Yes', 'Smart', 'None', 'Medium', 'Better than Autel for Subaru AKL');

-- ============================================================================
-- SECTION 4: Nissan/Infiniti Key Reference
-- ============================================================================
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency_mhz, key_type, chip_type, button_count, notes) VALUES
('KR55WK48903', 'Nissan', 'Altima', 2007, 2012, 315, 'Smart Key', 'ID46', 4, 'Intelligent Key Push Start'),
('CWTWB1U751', 'Nissan', 'Rogue', 2008, 2013, 315, 'Smart Key', 'ID46', 3, 'Twist Knob Ignition'),
('CWTWB1U751', 'Nissan', 'Versa', 2007, 2012, 315, 'Remote Head', 'ID46', 3, 'Remote integrated'),
('CWTWB1U331', 'Nissan', 'Titan', 2004, 2015, 315, 'Remote Head', 'ID46', 3, 'Separate remote/key older'),
('KR55WK49622', 'Infiniti', 'G37', 2009, 2013, 315, 'Smart Key', 'ID46', 4, 'Oval Fob Push Start'),
('KR55WK49622', 'Nissan', 'Maxima', 2009, 2014, 315, 'Smart Key', 'ID46', 4, '4-Button Smart Key'),
('CWTWB1U343', 'Nissan', 'Frontier', 2005, 2018, 315, 'Remote Head', 'ID46', 3, 'NSN14 keyway'),
('S180144020', 'Infiniti', 'QX60', 2013, 2016, 315, 'Smart Key', 'ID46', 4, 'New style square fob'),
('CWTWB1U825', 'Nissan', 'Juke', 2011, 2017, 315, 'Smart Key', 'ID46', 3, 'Unique styling Push Start');

-- ============================================================================
-- SECTION 5: Hyundai/Kia Key Reference
-- ============================================================================
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency_mhz, key_type, chip_type, button_count, notes) VALUES
('OSLOKA-870T', 'Hyundai', 'Sonata', 2011, 2014, 315, 'Flip Key', 'ID46', 4, 'High Security HY18'),
('OSLOKA-950T', 'Hyundai', 'Elantra', 2011, 2016, 315, 'Flip Key', 'ID46', 4, 'Trunk release'),
('NYOSEKS-TF10ATX', 'Kia', 'Optima', 2011, 2013, 315, 'Flip Key', 'ID46', 4, 'Laser cut KK10'),
('NYOSEKS-AM08TX', 'Kia', 'Soul', 2010, 2013, 315, 'Flip Key', 'ID46', 4, 'KK8 blade specific'),
('SY5DMFNA433', 'Hyundai', 'Santa Fe', 2013, 2018, 433, 'Smart Key', 'ID46', 4, 'Proximity Push-to-Start'),
('SY5HMFNA04', 'Kia', 'Sorento', 2014, 2015, 315, 'Smart Key', 'ID46', 4, 'Proximity system'),
('TQ8-RKE-3F04', 'Hyundai', 'Tucson', 2010, 2015, 315, 'Flip Key', 'ID46', 4, '4-Button Flip'),
('OSLOKA-875T', 'Kia', 'Forte', 2014, 2018, 315, 'Flip Key', 'ID46', 4, 'KK12 center mill'),
('OKA-N028', 'Hyundai', 'Accent', 2012, 2017, 315, 'Flip Key', 'ID46', 4, 'Standard High Security'),
('SY5HMFNA04', 'Kia', 'Sportage', 2011, 2013, 315, 'Smart Key', 'ID46', 4, 'Proximity Fob');

-- ============================================================================
-- SECTION 6: Honda/Acura Key Reference  
-- ============================================================================
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency_mhz, key_type, chip_type, button_count, notes) VALUES
('MLBHLIK6-1TA', 'Honda', 'Accord', 2018, 2022, 433, 'Smart Key', 'ID47', 4, 'Proximity Fob'),
('KR5V2X', 'Honda', 'Civic', 2014, 2020, 433, 'Smart Key', 'ID47', 4, 'Proximity Fob'),
('M3N5W8406', 'Acura', 'TL', 2009, 2014, 315, 'Smart Key', 'ID46', 5, 'Slot for emergency blade'),
('OUCG8D-380H-A', 'Honda', 'Fit', 2009, 2013, 315, 'Remote Head', 'ID46', 3, 'HO01 keyway some older');

-- ============================================================================
-- SECTION 7: Tool Coverage Alerts
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- GM CAN FD
('Warning', 'Chevrolet', 'Silverado/Tahoe/Yukon', 2021, 2025, 'CAN FD Protocol Required', 'Standard OBD communication fails without CAN FD adapter.', 'Key Programming', 'Purchase CAN FD adapter ($60-100) for Autel/OBDSTAR. IM608 Pro II has native support.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP),
('Critical', 'Chevrolet', 'Silverado 2022+', 2022, 2025, 'VIP Architecture Limitations', 'VIP platform requires server authentication. AKL largely dealer-only.', 'All Keys Lost', 'May require NASTF VSP credential and AC Delco subscription for full access.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP),

-- Ford Active Alarm
('Warning', 'Ford', 'F-150/Bronco/Mach-E', 2021, 2025, 'Active Alarm Blocks OBD', 'BCM cuts OBD communication when alarm is active in AKL scenario.', 'All Keys Lost', 'Smart Pro has software bypass. Autel/OBDSTAR/Xhorse need physical bypass cable.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP),

-- Stellantis RF Hub
('Critical', 'Jeep', 'Grand Cherokee L/Wagoneer', 2021, 2025, 'RF Hub Write-Once Lock', 'RF Hub locks permanently to initial key set. Cannot be reprogrammed via OBD.', 'All Keys Lost', 'Replace RF Hub with virgin unit (~$200-400). Bench unlock possible with XP400 Pro.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP),

-- Nissan Gateway
('Warning', 'Nissan', 'Sentra/Rogue/Versa', 2020, 2025, '16+32 Gateway Bypass Required', 'Secure Gateway blocks OBD immobilizer functions entirely.', 'Key Programming', 'Physical 16+32 bypass cable required. Connect between BCM and vehicle harness.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP),

-- Honda BCM Bricking
('Critical', 'Honda', 'Civic/Integra', 2022, 2025, 'BCM Bricking Risk', 'BCM extremely sensitive to voltage fluctuations during AKL. Can result in dead vehicle.', 'All Keys Lost', 'Use battery maintainer, not jumper cables. Smart Pro ADS2336 is safest. Avoid AKL if Add Key possible.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP),

-- Subaru BIU Risk
('Warning', 'Subaru', 'Outback/Legacy/Forester', 2020, 2024, 'BIU Bricking Risk', 'Wrong software selection can brick Body Integrated Unit.', 'All Keys Lost', 'Verify exact model year and trim before selecting software. Lonsdor K518 recommended.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP),

-- Toyota BA Chip
('Warning', 'Toyota', 'Tundra/Prius/Sequoia', 2022, 2025, '30-Pin Cable Required', '8A-BA and 4A chips require direct Smart ECU connection. Standard OBD fails.', 'All Keys Lost', 'Autel: G-Box3 + 30-Pin Cable. OBDSTAR: Toyota-30 cable. Xhorse: XD8ABAGL adapter.', 'Locksmith_Tool_Vehicle_Coverage.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Batch 2 Cross-Reference and Tool Coverage Complete' AS status, 
       (SELECT COUNT(*) FROM transponder_chip_reference) AS chip_refs,
       (SELECT COUNT(*) FROM key_blade_crossref) AS blade_refs,
       (SELECT COUNT(*) FROM tool_capability_matrix) AS tool_entries;
