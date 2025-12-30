-- Batch 7: Stellantis Deep Dive + Kia/Hyundai Security Evolution
-- Source: Jeep_Renegade_Hornet_Key_Programming_Issue.txt, Kia_Hyundai_Security_Update_Research.txt

-- ============================================================================
-- SECTION 1: Stellantis RF Hub Locked Status Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_rfhub_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT,
    rfhub_status TEXT, -- Unlocked, Locked, Write-Once
    fcc_id TEXT,
    chip_type TEXT,
    frequency_mhz INTEGER,
    mopar_part_number TEXT,
    program_method TEXT, -- Program Keys, Enable Fobik
    vin_specific_required BOOLEAN,
    akl_procedure TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jeep Renegade Evolution (Demonstrates RF Hub Locking Transition)
INSERT OR REPLACE INTO stellantis_rfhub_status (model, year_start, year_end, platform, rfhub_status, fcc_id, chip_type, frequency_mhz, mopar_part_number, program_method, vin_specific_required, akl_procedure, special_notes) VALUES
-- Legacy (Unlocked RF Hub - Standard Program Keys)
('Jeep Renegade', 2015, 2018, 'Fiat Small Wide', 'Unlocked', '2ADFTFI5AM433TX', 'Megamos AES', 433, '68264811AA', 'Program Keys', 0, 'Standard OBD with PIN. BCM can generate new Secret Keys.', 'SIP22 keyway. Legacy system.'),
('Jeep Renegade', 2019, 2021, 'Fiat Small Wide Updated', 'Transitional', '2ADFTFI5AM433TX', 'Megamos AES', 433, '68264811AA', 'Program Keys', 0, 'Standard OBD. RF Hub may be unlocked or locked depending on build date.', 'Transition period. Check RF Hub status via WiTech.'),

-- Modern (Locked RF Hub - Enable Fobik Only)
('Jeep Renegade', 2022, 2023, 'Fiat Small Wide + Hitag AES', 'Locked', '2ADPXFI7PE', 'HITAG AES (6A)', 434, '7TB23DX9AA', 'Enable Fobik ONLY', 1, 'VIN-specific keys required. Enable Fobik validates pre-coded key. Program Keys disabled.', 'INCOMPATIBLE with 2015-2021 keys. RF Hub 68638489AA enforces Write-Once logic.'),

-- Dodge Hornet (Alfa Romeo Tonale Platform - Completely Different)
('Dodge Hornet', 2023, 2025, 'Alfa Romeo Tonale/Giorgio', 'Locked', 'KR5ALFA434', 'HITAG AES (4A) NCF29A1M', 433, '7QV80LXHPA', 'Enable Fobik ONLY', 1, 'VIN-specific keys from Alfa system. NOT compatible with other Dodge/Jeep keys.', 'ALFA ROMEO PLATFORM - Uses Continental security stack. Do NOT use Charger/Challenger keys.'),

-- Fiat 500X (Sister to Renegade)
('Fiat 500X', 2015, 2018, 'Fiat Small Wide', 'Unlocked', '2ADFTFI5AM433TX', 'Megamos AES', 433, '68264811AA', 'Program Keys', 0, 'Standard OBD programming.', 'Compatible with same-year Renegade keys.'),
('Fiat 500X', 2019, 2023, 'Fiat Small Wide Updated', 'Transitional/Locked', '2ADFTFI5AM433TX', 'Megamos AES', 433, '68264811AA', 'Program Keys or Enable', 0, 'Check RF Hub status.', 'Later models may require Enable Fobik.');

-- ============================================================================
-- SECTION 2: Stellantis Enable Fobik vs Program Keys Procedures
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_programming_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method_name TEXT NOT NULL, -- Program Keys, Enable Fobik
    era TEXT, -- Legacy, Modern
    rfhub_state TEXT, -- Unlocked, Locked
    description TEXT,
    trust_model TEXT, -- Vehicle Authority, Factory Database Authority
    step_1 TEXT,
    step_2 TEXT,
    step_3 TEXT,
    step_4 TEXT,
    key_requirement TEXT, -- Blank, VIN-Specific
    failure_causes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO stellantis_programming_methods (method_name, era, rfhub_state, description, trust_model, step_1, step_2, step_3, step_4, key_requirement, failure_causes) VALUES
('Program Keys', 'Legacy (2008-2018)', 'Unlocked', 'BCM actively writes data to blank key. Vehicle creates key identity.', 'Vehicle is the Authority', 
 'Insert blank transponder key',
 'Tool retrieves 4-digit PIN from immobilizer',
 'BCM generates unique Secret Key (SK)',
 'BCM writes SK + VIN to transponder EEPROM',
 'Blank/Virgin Key',
 'PIN lockout after 3 attempts. BCM communication failure.'),

('Enable Fobik', 'Modern (2022+)', 'Locked', 'Validates pre-coded key. Vehicle verifies but does not write. Factory database pre-coded key.', 'Factory Database is the Authority',
 'Order VIN-specific key - SK written at factory',
 'WiTech prompts: Place key against Start/Stop button',
 'RF Hub sends challenge, key responds with pre-coded SK',
 'RF Hub validates and whitelists Transponder ID',
 'VIN-Specific/Pre-Coded Key ONLY',
 'Wrong VIN on key. RF Hub in Alarm state. Aftermarket tool bricked RF Hub.');

-- ============================================================================
-- SECTION 3: Kia/Hyundai Security Architecture Evolution
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_security_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_range TEXT NOT NULL,
    architecture TEXT,
    security_level TEXT,
    key_fcc_id TEXT,
    sgw_present BOOLEAN,
    can_fd_required BOOLEAN,
    obd_pin_reading BOOLEAN, -- Can read PIN via OBD
    campaign_993_applied BOOLEAN, -- Anti-theft software update
    affected_models TEXT,
    programming_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO kiahyundai_security_timeline (year_range, architecture, security_level, key_fcc_id, sgw_present, can_fd_required, obd_pin_reading, campaign_993_applied, affected_models, programming_notes) VALUES
('2011-2021', 'Standard CAN Bus', 'Vulnerable', 'TQ8-FOB-4F24', 0, 0, 1, 0, 'Telluride 2020-2022, Sportage pre-2023', 'Pre-SGW era. OBD PIN reading often possible. "Kia Boys" vulnerable on turn-key models.'),
('2022 (Transitional)', 'Standard CAN + SGW Emerging', 'Hardening', 'TQ8-FOB-4F24', 1, 0, 0, 1, 'Telluride, Sportage early 2022', 'Campaign 993/CS920 blocks OBD PIN reading. Software update hardens BCM.'),
('2023 Early (Pre-June)', 'SGW Standard', 'High', 'TQ8-FOB-4F27', 1, 0, 0, 1, 'Sportage 2023, Palisade 2023', 'AutoAuth or physical 12+8 bypass required. Standard CAN still works.'),
('2023 Late (Post-June) / 2024+', 'SGW + CAN FD', 'Fortress', 'TQ8-FOB-4F27', 1, 1, 0, 1, 'Santa Fe 2024, Telluride 2024, Sportage late 2023', 'CAN FD Adapter MANDATORY. Standard tools fail completely. Dealer PIN purchase required.');

-- ============================================================================
-- SECTION 4: Kia/Hyundai Campaign 993 Virtual Immobilizer Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_campaign_993 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_code TEXT NOT NULL, -- 993 (Hyundai) or CS920 (Kia)
    manufacturer TEXT,
    description TEXT,
    logic_change TEXT,
    arm_condition TEXT,
    disarm_condition TEXT,
    operational_side_effects TEXT,
    dead_fob_behavior TEXT,
    obd_impact TEXT,
    affected_years TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO kiahyundai_campaign_993 (campaign_code, manufacturer, description, logic_change, arm_condition, disarm_condition, operational_side_effects, dead_fob_behavior, obd_impact, affected_years) VALUES
('993', 'Hyundai', 'Anti-Theft Software Update - Virtual Immobilizer', 'Introduces logical AND gate: Ignition ON requires Disarmed state', 'Arms 30 seconds after doors locked via remote fob', 'Only valid UNLOCK signal from factory fob disarms', 'Physical key entry does NOT disarm. Owner lockout if fob battery dies.', 'Physical key opens door but triggers alarm. Ignition will not start while Armed. May require 30-60 minute soak.', 'Blocks OBD PIN code reading. BCM rejects memory dump requests.', '2011-2022 Turn-Key Models'),
('CS920', 'Kia', 'Anti-Theft Software Update - Virtual Immobilizer', 'Same as Hyundai Campaign 993', 'Arms 30 seconds after doors locked via remote fob', 'Only valid UNLOCK signal from factory fob disarms', 'Same as Hyundai. Forces RKE dependency.', 'Same as Hyundai.', 'Blocks OBD PIN reading on updated vehicles.', '2011-2022 Turn-Key Models');

-- ============================================================================
-- SECTION 5: Kia/Hyundai FCC ID Evolution Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_key_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generation TEXT NOT NULL, -- Gen 1, Gen 2
    fcc_id TEXT,
    chip_type TEXT,
    frequency_mhz INTEGER,
    architecture_association TEXT,
    part_numbers TEXT,
    models TEXT,
    year_range TEXT,
    programming_difficulty TEXT,
    can_fd_required BOOLEAN,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO kiahyundai_key_generations (generation, fcc_id, chip_type, frequency_mhz, architecture_association, part_numbers, models, year_range, programming_difficulty, can_fd_required, notes) VALUES
('Legacy Modern (Gen 1)', 'TQ8-FOB-4F24', 'NCF29A1X (HITAG3/ID47)', 433, 'Standard High-Speed CAN', '95440-S9000 (Telluride)', 'Telluride 2020-2022, Niro 2019-2020', '2019-2022', 'Medium', 0, 'PIN reading via OBD often possible. Standard diagnostic protocols.'),
('Next-Gen (Gen 2)', 'TQ8-FOB-4F27', 'NCF29A1X (HITAG3/ID47)', 433, 'High-Speed CAN FD + SGW', '95440-S8550 (Palisade), 95440-S1670 (Santa Fe), 95440-K5012 (Santa Cruz)', 'Palisade 2023-2025, Santa Fe 2021-2024, Sportage 2023+', '2023-2025', 'Very Hard', 1, 'CAN FD Adapter mandatory for 2024+ models. Digital Key 2.0 / UWB support. Keys NOT interchangeable with 4F24.');

-- ============================================================================
-- SECTION 6: Nissan NATS Generation Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS nissan_nats_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nats_version TEXT NOT NULL, -- NATS 5, NATS 6, Modern
    era TEXT,
    year_range TEXT,
    chip_type TEXT,
    encryption TEXT,
    pin_digits INTEGER, -- 4, 20, 22
    pin_type TEXT, -- Static, Rolling
    keyway TEXT,
    key_frequency TEXT,
    bcm_calculation TEXT,
    server_required BOOLEAN,
    affected_models TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO nissan_nats_reference (nats_version, era, year_range, chip_type, encryption, pin_digits, pin_type, keyway, key_frequency, bcm_calculation, server_required, affected_models, notes) VALUES
('NATS 5 / 5.6', 'The 40-Bit Era', '2000-2006', 'TI 4D-60', '40-bit Fixed Challenge-Response', 4, 'Static', 'DA34/NSN14', 'N/A (Chip Only)', 'BCM label 5-digit to 4-digit conversion', 0, 'Maxima, Altima, Frontier, Xterra', 'Legacy system. Persisted in commercial vehicles until 2018.'),
('NATS 6 / Intelligent Key', 'The ID46 Era', '2007-2012', 'ID46 (PCF7936)', 'HITAG 2 (48-bit)', 4, 'Static', 'NSN14', '315 MHz', 'BCM ID calculation', 0, 'Altima, Rogue, Sentra, Versa, Maxima', 'Introduced Twist Knob ignition and Push-Button Start.'),
('NATS 6 / Prox', 'ID47 Transition', '2013-2018', 'ID47 (HITAG 3)', '128-bit AES', 20, 'Rolling', 'NSN14', '433 MHz', '20-digit rolling code challenge-response', 1, 'Altima, Rogue, Pathfinder, Murano', 'Time-sensitive calculation. Connection must stay stable.'),
('Modern Prox', '22-Digit Pre-Safe', '2019-2025', 'ID4A (HITAG-AES)', '128-bit AES Enhanced', 22, 'Rolling', 'NSN14', '433 MHz', '22-digit server-side calculation only', 1, 'Sentra B18, Rogue T33, Versa, Kicks', 'Requires internet. 16+32 gateway bypass. NASTF VSP credentials recommended.');

-- ============================================================================
-- SECTION 7: Locksmith Alerts for Stellantis and Kia/Hyundai
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- Stellantis RF Hub Alerts
('Critical', 'Jeep', 'Renegade', 2022, 2023, 'RF Hub Locked - Enable Fobik Only', 'RF Hub uses Write-Once logic. Program Keys function disabled. Only pre-coded VIN-specific keys work.', 'All Keys Lost', 'Order VIN-specific key (7TB23DX9AA / FCC 2ADPXFI7PE). Use Enable Fobik in WiTech. Program Keys will NOT work.', 'Jeep_Renegade_Hornet_Key_Programming_Issue.txt', CURRENT_TIMESTAMP),
('Critical', 'Dodge', 'Hornet', 2023, 2025, 'Alfa Romeo Platform - Incompatible Keys', 'Uses Alfa Romeo Tonale platform and Continental security stack. NOT a traditional Dodge.', 'Key Ordering', 'Use ONLY FCC KR5ALFA434 (Mopar 7QV80LXHPA). Do NOT use Charger/Challenger keys. Different chip language (NCF29A1M).', 'Jeep_Renegade_Hornet_Key_Programming_Issue.txt', CURRENT_TIMESTAMP),
('Warning', 'Stellantis', 'All 2022+', 2022, 2025, 'Aftermarket Tool Bricking Risk', 'Attempting to Read PIN via aftermarket tools (Autel/Lonsdor) before WiTech can brick RF Hub bootloader permanently.', 'All Keys Lost', 'Use WiTech first for Enable Fobik. Do NOT attempt OBD PIN read on locked RF Hubs.', 'Jeep_Renegade_Hornet_Key_Programming_Issue.txt', CURRENT_TIMESTAMP),
('Warning', 'Jeep', 'Renegade', 2015, 2021, 'Key Incompatibility with 2022+', '2015-2021 keys (FCC 2ADFTFI5AM433TX) are Megamos AES. 2022+ keys (FCC 2ADPXFI7PE) are HITAG AES. Complete break in compatibility.', 'Key Ordering', 'Verify model year before ordering. Different FCC IDs, different chip types, different modulation.', 'Jeep_Renegade_Hornet_Key_Programming_Issue.txt', CURRENT_TIMESTAMP),

-- Kia/Hyundai Alerts
('Critical', 'Kia', 'All 2024+', 2024, 2025, 'CAN FD Adapter Mandatory', 'Post-June 2023 production uses CAN FD protocol. Standard OBD tools cannot communicate.', 'Key Programming', 'Must have CAN FD Adapter (Xtool M811, Autel CAN FD). Standard cable = Communication Error.', 'Kia_Hyundai_Security_Update_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Hyundai', 'Santa Fe', 2024, 2025, 'CAN FD + SGW + Dealer PIN Required', 'Triple security: CAN FD protocol, Security Gateway, and encrypted PIN. OBD PIN reading impossible.', 'All Keys Lost', 'CAN FD Adapter + 12+8 SGW Bypass + Purchase dealer PIN ($20-60). No OBD extraction possible.', 'Kia_Hyundai_Security_Update_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Kia', 'Sportage', 2023, 2025, 'Mid-Year Production Split', 'Early 2023 = Standard CAN. Late 2023 (June+) = CAN FD. Test communication first.', 'Diagnostics', 'If standard CAN fails, vehicle is post-split. Use CAN FD adapter.', 'Kia_Hyundai_Security_Update_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Hyundai', 'All Turn-Key', 2011, 2022, 'Campaign 993 Virtual Immobilizer Quirk', 'After software update, physical key entry does NOT disarm system. Dead fob = owner lockout.', 'Emergency Start', 'Wait for alarm timeout (5-10 min). Press dead fob directly on Start/Stop button to energize passive transponder.', 'Kia_Hyundai_Security_Update_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Kia', 'All Turn-Key', 2011, 2022, 'Campaign CS920 Blocks OBD PIN Reading', 'BCM firmware update blocks standard PIN extraction. Tool returns Access Denied.', 'Key Programming', 'Must purchase PIN from dealer/tech info portal. NASTF VSP credentials required for official access.', 'Kia_Hyundai_Security_Update_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Kia', 'Telluride', 2024, 2025, '5-Second Key Learn Window', 'After PIN entry, key learn window is extremely short (5 seconds). Must act immediately.', 'Key Programming', 'Have key ready. Immediately touch top of smart key to Start/Stop button after PIN accepted.', 'Kia_Hyundai_Security_Update_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Kia/Hyundai', 'All', 2019, 2025, 'TQ8-FOB-4F24 vs 4F27 Incompatibility', 'Keys look identical but serve different architectures. 4F24 = Standard CAN. 4F27 = CAN FD. NOT interchangeable.', 'Key Ordering', 'Check FCC ID carefully. 4F24 for 2020-2022 Telluride. 4F27 for 2023+ models.', 'Kia_Hyundai_Security_Update_Research.txt', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 8: Update vehicles with New Data
-- ============================================================================
UPDATE vehicles SET
    rfhub_status = 'Locked',
    program_method = 'Enable Fobik',
    special_notes = COALESCE(special_notes || ' | ', '') || 'VIN-specific keys required. Program Keys disabled. FCC 2ADPXFI7PE only.'
WHERE make = 'Jeep' AND model = 'Renegade' AND year_start >= 2022;

UPDATE vehicles SET
    platform = 'Alfa Romeo Tonale/Giorgio',
    special_notes = COALESCE(special_notes || ' | ', '') || 'ALFA ROMEO PLATFORM - Uses Continental security. FCC KR5ALFA434 (7QV80LXHPA). NOT compatible with other Dodge keys.'
WHERE make = 'Dodge' AND model = 'Hornet';

UPDATE vehicles SET
    can_fd_required = 1,
    special_notes = COALESCE(special_notes || ' | ', '') || 'CAN FD Adapter mandatory. Dealer PIN purchase required. Campaign 993/CS920 blocks OBD PIN reading.'
WHERE make IN ('Kia', 'Hyundai') AND year_start >= 2024;

UPDATE vehicles SET
    sgw_present = 1,
    special_notes = COALESCE(special_notes || ' | ', '') || 'SGW bypass required. AutoAuth or 12+8 physical bypass.'
WHERE make IN ('Kia', 'Hyundai') AND year_start >= 2023;

-- Mark completion
SELECT 'Batch 7 Stellantis + Kia/Hyundai Complete' AS status,
       (SELECT COUNT(*) FROM stellantis_rfhub_status) AS stellantis_entries,
       (SELECT COUNT(*) FROM kiahyundai_security_timeline) AS kiahyundai_timeline_entries;
