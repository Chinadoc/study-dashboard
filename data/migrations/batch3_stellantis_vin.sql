-- Batch 3: Stellantis VIN Pre-coding and VIN-Coded Key Requirements
-- Source: Stellantis_FCC_ID_VIN_Pre-coding_Research.txt, VIN-Coded_Key_Requirements_Research.txt

-- ============================================================================
-- SECTION 1: Stellantis Platform Identification by VIN
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_vin_architecture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wmi_code TEXT NOT NULL, -- First 3 VIN digits
    country TEXT,
    manufacturer TEXT,
    key_architecture TEXT, -- Continental (M3N), Giobert (2ADPX), Alfa (KR5)
    representative_model TEXT,
    pre_coding_required BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO stellantis_vin_architecture (wmi_code, country, manufacturer, key_architecture, representative_model, pre_coding_required) VALUES
-- Italian Production (European Architecture)
('ZAC', 'Italy', 'FCA Italy (Dodge)', 'Giobert (2ADPX) / Alfa (KR5)', 'Dodge Hornet', 1),
('ZFB', 'Italy', 'FCA Italy (Fiat/Jeep)', 'Giobert (2ADPX)', 'Jeep Renegade (Melfi)', 1),

-- North American Production (Legacy Architecture)
('3C4', 'Mexico', 'FCA US (Dodge/Jeep)', 'Continental (M3N)', 'Jeep Compass (Toluca), Journey', 0),
('1C3', 'USA', 'FCA US (Dodge)', 'Continental (M3N)', 'Dodge Durango', 0),
('1C4', 'USA', 'FCA US (Jeep)', 'Continental (M3N)', 'Jeep Grand Cherokee', 0);

-- ============================================================================
-- SECTION 2: Stellantis FCC ID by Platform
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_fcc_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    production_plant TEXT,
    fcc_id_primary TEXT,
    fcc_id_secondary TEXT,
    oem_part_numbers TEXT,
    chip_type TEXT,
    pre_coding_required BOOLEAN,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO stellantis_fcc_mapping (vehicle_model, year_start, year_end, production_plant, fcc_id_primary, fcc_id_secondary, oem_part_numbers, chip_type, pre_coding_required, special_notes) VALUES
-- Italian-Built (Pre-coding REQUIRED)
('Dodge Hornet', 2023, 2025, 'Pomigliano, Italy', '2ADPXFI7PE', 'KR5ALFA434', '7QV80LXHPA, 7QV81LXHPA', 'HITAG-AES (4A/6A)', 1, 'Alfa Romeo Tonale twin. NOT compatible with Durango/Charger keys'),
('Jeep Renegade', 2022, 2024, 'Melfi, Italy', '2ADPXFI7PE', NULL, '7TB23DX9AA', 'HITAG-AES (4A/6A)', 1, 'Shifted from M3N to 2ADPX in mid-2022. Verify VIN.'),
('Alfa Romeo Tonale', 2023, 2025, 'Pomigliano, Italy', 'KR5ALFA434', '2ADPX-FGEN4', '6EP44LXHAA', 'HITAG-AES (4A)', 1, 'Donor platform for Hornet'),

-- North American-Built (Standard Programming)
('Jeep Compass', 2017, 2024, 'Toluca, Mexico', 'M3N-40821302', NULL, '68250343AB, 68417823AA', 'Philips ID46 / AES 128', 0, 'Often reusable if unlocked. Standard Smart Proximity key.'),
('Dodge Durango', 2014, 2024, 'Detroit, USA', 'M3N-40821302', NULL, '68066350AB', 'Philips ID46', 0, 'Legacy architecture. High reuse potential.'),
('Dodge Charger', 2015, 2023, 'Brampton, Canada', 'M3N-40821302', NULL, '68394202AA', 'Philips ID46', 0, 'Standard Dodge key'),
('Dodge Challenger', 2015, 2023, 'Brampton, Canada', 'M3N-40821302', NULL, '68394202AA', 'Philips ID46', 0, 'Same as Charger'),
('RAM 1500 (DT)', 2019, 2024, 'Sterling Heights, USA', 'M3N-40821302', 'OHT-4882056', '68417823AA', 'AES 128', 0, 'SGW bypass required. RF Hub lock risk on newer builds.'),
('Jeep Grand Cherokee', 2014, 2021, 'Detroit, USA', 'M3N-40821302', 'GQ4-54T', '68066351AB', 'Philips ID46', 0, 'Standard SGW on 2018+');

-- ============================================================================
-- SECTION 3: VIN Plant Code Lookup
-- ============================================================================
CREATE TABLE IF NOT EXISTS vin_plant_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position_11_code TEXT NOT NULL,
    plant_name TEXT,
    location TEXT,
    expected_architecture TEXT,
    makes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO vin_plant_codes (position_11_code, plant_name, location, expected_architecture, makes) VALUES
-- Stellantis Plants
('P', 'Toluca Assembly', 'Toluca, Mexico', 'Continental (M3N)', 'Jeep Compass, Dodge Journey'),
('V', 'Melfi Plant', 'Melfi, Italy', 'Giobert (2ADPX)', 'Jeep Renegade, Fiat 500X'),
('3', 'Pomigliano dArco', 'Pomigliano, Italy', 'Giobert (2ADPX) / Alfa (KR5)', 'Dodge Hornet, Alfa Tonale'),
('D', 'Belvidere Assembly', 'Belvidere, IL', 'Continental (M3N)', 'Jeep Cherokee'),
('G', 'Detroit Assembly Complex', 'Detroit, MI', 'Continental (M3N)', 'Dodge Durango, Jeep Grand Cherokee'),
('W', 'Windsor Assembly', 'Windsor, Ontario', 'Continental (M3N)', 'Chrysler Pacifica, Chrysler Voyager'),
('B', 'Brampton Assembly', 'Brampton, Ontario', 'Continental (M3N)', 'Dodge Charger, Dodge Challenger, Chrysler 300'),
('T', 'Sterling Heights Assembly', 'Sterling Heights, MI', 'Continental (M3N)', 'RAM 1500');

-- ============================================================================
-- SECTION 4: VIN-Coded Key Requirements by Manufacturer
-- ============================================================================
CREATE TABLE IF NOT EXISTS vin_coded_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manufacturer TEXT NOT NULL,
    system_generation TEXT,
    vin_ordered_precoded BOOLEAN,
    dealer_tool_only BOOLEAN,
    aftermarket_viability TEXT, -- None, High-Risk, Limited, High
    oem_lead_time TEXT,
    primary_barrier TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO vin_coded_requirements (manufacturer, system_generation, vin_ordered_precoded, dealer_tool_only, aftermarket_viability, oem_lead_time, primary_barrier, notes) VALUES
-- European High-Security
('Mercedes-Benz', 'FBS4 (2016+)', 1, 1, 'None', '1-4 Weeks', 'Server-side Encryption & Hardware Logistics', 'TRP Policy - Strict chain of custody. Key arrives pre-authorized.'),
('BMW', 'BDC2 / G-Series', 1, 1, 'High Risk (Bench)', '1-2 Weeks', 'ISN/BDC Lockout & Data Corruption Risk', 'Factory burn. June 2020+ Bosch DME lock.'),
('Audi', 'MQB-Evo', 1, 1, 'Limited (Unstable)', '3-10 Days', 'FAZIT Database & Component Security', 'ODIS Online with GeKo credentials required.'),
('Porsche', '992 / Taycan', 1, 1, 'Low (Complex Bench)', '2-5 Weeks', 'PPN Online Auth & High-Bit Encryption', 'PIWIS 4 with PPN authorization. AES-128 + UWB.'),
('Land Rover', '2024+ KVM', 1, 1, 'Limited (JLR Doctor)', '1-3 Months', 'Module Write-Once Logic & Shortages', 'KVM/BCM replacement often required for AKL.'),

-- Gateway Model (Blank compatible but gated)
('Stellantis', 'WiTech / RF Hub', 0, 0, 'High (w/ AutoAuth)', '3-7 Days', 'RF Hub Lock / SGW / PIN Codes', 'VRS subscription per VIN. AutoAuth for SGW bypass.'),
('Lexus', 'Smart Key', 0, 0, 'High (Universal)', '6-12 Months (Backlog)', 'Hardware Supply Chain & Allocation Rules', 'VIN-based rationing due to chip shortage. Techstream for all keys.'),

-- Italian-Built Stellantis Exception
('Stellantis (Italian)', 'HITAG-AES (2ADPX)', 1, 0, 'Limited', '1-2 Weeks', 'Pre-coding + RF Hub Lock', 'VIN starts with Z. Giobert hardware requires CS pre-coding.');

-- ============================================================================
-- SECTION 5: RF Hub Lock Status Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS rf_hub_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    rf_hub_lockable BOOLEAN,
    lock_trigger TEXT,
    akl_possible_via_obd BOOLEAN,
    recovery_method TEXT,
    tsb_reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO rf_hub_status (make, model, year_start, year_end, rf_hub_lockable, lock_trigger, akl_possible_via_obd, recovery_method, tsb_reference) VALUES
-- High-Risk RF Hub Lock Vehicles
('Jeep', 'Grand Cherokee L', 2021, 2024, 1, 'Initial dealer setup', 0, 'Replace RF Hub with virgin unit', 'CSN Z23'),
('Jeep', 'Wagoneer', 2022, 2024, 1, 'Initial dealer setup', 0, 'Replace RF Hub with virgin unit', 'CSN Z23'),
('Jeep', 'Grand Wagoneer', 2022, 2024, 1, 'Initial dealer setup', 0, 'Replace RF Hub with virgin unit', 'CSN Z23'),
('RAM', '1500 (DT)', 2019, 2024, 1, 'Z23 update/newer builds', 0, 'Replace RF Hub or bench unlock', 'CSN Z23'),
('Jeep', 'Renegade', 2022, 2024, 1, 'Italian build security', 0, 'Pre-coded key + fresh hub', 'S2208000188'),

-- Standard RF Hub Vehicles (Not locked)
('Jeep', 'Compass', 2017, 2024, 0, NULL, 1, 'Standard OBD with SGW bypass', NULL),
('Dodge', 'Durango', 2014, 2024, 0, NULL, 1, 'Standard OBD with SGW bypass', NULL),
('Dodge', 'Charger', 2015, 2023, 0, NULL, 1, 'Standard OBD', NULL);

-- ============================================================================
-- SECTION 6: HITAG-AES Pre-coding Procedure Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS precoding_procedures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system TEXT NOT NULL,
    applicable_makes TEXT,
    procedure_type TEXT, -- Dealer, Aftermarket-Bench, Aftermarket-OBD
    step_1 TEXT,
    step_2 TEXT,
    step_3 TEXT,
    required_tools TEXT,
    risk_level TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO precoding_procedures (system, applicable_makes, procedure_type, step_1, step_2, step_3, required_tools, risk_level, notes) VALUES
('HITAG-AES (2ADPX)', 'Dodge Hornet, Jeep Renegade 2022+', 'Aftermarket-Bench', 
 'Read Immo Data (CS Bytes, MAC, PIN) from RF Hub or BCM via special adapter or EEPROM',
 'Write CS data to virgin 2ADPX key (Pre-coding) - Creates Dealer Key',
 'Execute Key Learning via OBD after pre-coding complete',
 'Autel IM608 + XP400 Pro + APB112 OR Smart Pro with specific cables',
 'High',
 'Virgin non-precoded key will fail with Security Access Denied. Frequency matches (434 MHz) but data structure must match.'),

('FBS4', 'Mercedes-Benz 2016+', 'Dealer',
 'Order VIN-coded key from factory via TRP process',
 'Key arrives with hash pre-written for specific key track',
 'Insert key - EIS validates against stored track. Xentry for track management.',
 'Xentry, DAS, Star Diagnostic',
 'N/A',
 'No field generation possible. Key already knows car.'),

('MQB-Evo Sync Data', 'VW Golf 8, Audi A3 8Y, Tiguan 2022+', 'Dealer',
 'Read CS code from Cluster (may require pin lifting)',
 'Sync Data (32-byte) required from locked 5WA BCM - NOT readable without ODIS',
 'ODIS Online with FAZIT database calculates authorization',
 'ODIS with GeKo credentials',
 'Very High',
 'Aftermarket can read CS but cannot get Sync Data. Safe Mode if mismatch.'),

('BCM2 AES', 'Porsche 992, Taycan', 'Dealer',
 'Order pre-authorized key from Germany based on VIN',
 'PIWIS connects to PPN for handover validation',
 'PPN confirms key ID is authorized for this VIN',
 'PIWIS III/4 with PPN login',
 'N/A',
 'NCF29A1 transponder. UWB for relay attack prevention.');

-- ============================================================================
-- SECTION 7: Stellantis Locksmith Alerts
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- Italian-Built Stellantis
('Critical', 'Dodge', 'Hornet', 2023, 2025, 'Italian Build - Pre-coding Required', 'Uses Giobert 2ADPXFI7PE or Alfa KR5. HITAG-AES requires CS pre-coding before programming.', 'All Keys Lost', 'Check VIN starts with Z. Read Immo data via bench. Pre-code virgin key before OBD learning.', 'Stellantis_FCC_ID_VIN_Pre-coding_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Jeep', 'Renegade', 2022, 2024, 'Platform Shift - Now Giobert Hardware', 'Shifted from M3N to 2ADPX in mid-2022. Standard Dodge key WILL NOT WORK.', 'Key Programming', 'Verify FCC ID before ordering parts. M3N for pre-2022, 2ADPXFI7PE for 2022+.', 'Stellantis_FCC_ID_VIN_Pre-coding_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Stellantis', 'All 2018+', 2018, 2025, 'Secure Gateway Blocks OBD Access', 'SGW prevents write commands to BCM/RFH without authorization.', 'Key Programming', 'Use AutoAuth subscription ($50/year) or physical 12+8 bypass cable.', 'Stellantis_FCC_ID_VIN_Pre-coding_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Stellantis', 'Italian Build', 2022, 2025, 'VIN Starts With Z = European Architecture', 'VIN beginning with Z (Italy) uses different security than NAFTA builds.', 'Diagnostics', 'Check VIN digit 1. Z=Italy (pre-coding), 1/2/3=NAFTA (standard).', 'Stellantis_FCC_ID_VIN_Pre-coding_Research.txt', CURRENT_TIMESTAMP),

-- VIN-Coded Requirements
('Critical', 'Mercedes-Benz', 'All FBS4', 2016, 2025, 'VIN-Ordered Key Mandatory', 'FBS4 keys cannot be generated - must be ordered pre-coded from factory.', 'All Keys Lost', 'Order through dealer TRP process. 1-4 week lead time typical. EIS is unbreakable anchor.', 'VIN-Coded_Key_Requirements_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'BMW', 'G-Series', 2019, 2025, 'Factory Pre-Burn Required', 'G-Series keys pre-burned with ISN and Key ID at factory.', 'All Keys Lost', 'Order from BMW PDC. Activation via key coil and Start/Stop button.', 'VIN-Coded_Key_Requirements_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Land Rover', '2024+ Models', 2024, 2025, 'KVM Write-Once Architecture', 'KVM permanently locked after initial setup. Cannot reprogram.', 'All Keys Lost', 'Replace KVM ($4000-6000) and often BCM. UWB hardware proprietary.', 'VIN-Coded_Key_Requirements_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Lexus', 'All Smart Key', 2023, 2025, 'VIN-Based Key Allocation', 'Chip shortage caused VIN-based rationing. Dealers cannot order for stock.', 'Key Ordering', 'Check Second Key Delivery Program status for VIN. 6-12 month backlog possible.', 'VIN-Coded_Key_Requirements_Research.txt', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 8: Update vehicles with Stellantis Data
-- ============================================================================
UPDATE vehicles SET
    security_system = 'HITAG-AES',
    pre_coding_required = 1,
    special_notes = COALESCE(special_notes || ' | ', '') || 'Italian build (VIN starts Z). Giobert 2ADPXFI7PE. Pre-coding required.'
WHERE make = 'Dodge' AND model = 'Hornet';

UPDATE vehicles SET
    security_system = 'HITAG-AES', 
    pre_coding_required = 1,
    special_notes = COALESCE(special_notes || ' | ', '') || 'Shifted to Giobert hardware mid-2022. Verify FCC ID by VIN.'
WHERE make = 'Jeep' AND model = 'Renegade' AND year_start >= 2022;

UPDATE vehicles SET
    rf_hub_lockable = 1,
    akl_difficulty = 'Very Hard',
    special_notes = COALESCE(special_notes || ' | ', '') || 'RF Hub Write-Once. Replace RF Hub for AKL.'
WHERE make = 'Jeep' AND model IN ('Grand Cherokee L', 'Wagoneer', 'Grand Wagoneer');

UPDATE vehicles SET
    sgw_required = 1,
    special_notes = COALESCE(special_notes || ' | ', '') || 'SGW bypass required (AutoAuth or 12+8 cable)'
WHERE make IN ('Chrysler', 'Dodge', 'Jeep', 'RAM') AND year_start >= 2018;

-- Mark completion
SELECT 'Batch 3 Stellantis VIN Pre-coding Complete' AS status,
       (SELECT COUNT(*) FROM stellantis_vin_architecture) AS vin_architectures,
       (SELECT COUNT(*) FROM stellantis_fcc_mapping) AS fcc_mappings,
       (SELECT COUNT(*) FROM rf_hub_status) AS rf_hub_entries;
