-- Audi MQB-Evo Security Architecture Integration
-- Source: Audi_MQB-Evo_Security_Deep_Dive.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: VAG Platform Identification Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS vag_platform_identification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    platform_name TEXT,
    typ_code TEXT,
    internal_code TEXT,
    year_range TEXT,
    security_protocol TEXT,
    bcm_prefix TEXT,
    immo_generation TEXT,
    sfd_protected BOOLEAN,
    characteristics TEXT,
    visual_identification TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vag_platform_identification (platform, platform_name, typ_code, internal_code, year_range, security_protocol, bcm_prefix, immo_generation, sfd_protected, characteristics, visual_identification) VALUES
('MQB', 'Modular Transverse Matrix', '8V', 'AU', '2013-2020', 'Component Security (CS)', '5Q0', 'Immo V (MQB48/49)', 0, 'Localized CS protocols. Standard High-Speed CAN. Relatively open architecture.', 'Traditional mechanical gear lever. Retractable or "tablet-on-dash" screen. Optional Virtual Cockpit.'),
('MQB-Evo', 'Modular Transverse Matrix Evolution', '8Y', 'CD', '2020-2025', 'SFD + Sync Data', '5WA', 'Immo VI', 1, 'Server-dependent security. FD-CAN (Flexible Data-rate). Born Locked BCM.', 'Small toggle "nub" shift-by-wire selector. Integrated MIB3 screen angled toward driver. Standard Virtual Cockpit.'),
('MLB-Evo', 'Modular Longitudinal Architecture Evo', '4M (facelift)', '-', '2021-2025', 'SFD + BCM2', '4M0 / 80A', 'Immo V/VI hybrid', 1, 'Longitudinal engines (Q5/Q7/Q8). BCM2 in trunk (encrypted).', 'Similar to MQB-Evo interior cues. Larger SUV form factor.'),
('MEB', 'Modular Electric Drive Matrix', 'Q4 e-tron', '-', '2022-2025', 'SFD (E3 1.1)', 'ICAS1', 'Immo VI', 1, 'Electric vehicle architecture. Highly integrated ICAS module. Very high security.', 'EV platform. Digital cockpit. Q4 e-tron specific.');

-- ============================================================================
-- SECTION 2: SFD (Schutz Fahrzeug Diagnose) Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS vag_sfd_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sfd_version TEXT NOT NULL,
    year_introduced INTEGER,
    mechanism TEXT,
    unlock_duration_min INTEGER,
    affected_modules TEXT,
    bypass_methods TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vag_sfd_reference (sfd_version, year_introduced, mechanism, unlock_duration_min, affected_modules, bypass_methods, notes) VALUES
('SFD (Original)', 2020, 'Dynamic server-validated challenge-response. GeKo account required for ODIS.', 90, 'Module 09 (Central Electrics), Module 19 (Gateway), Module 5F (Multimedia)', 'ODIS + GeKo (official), OBDeleven tokens (coding only), VCTool tokens (coding only)', 'Unlocks coding/adaptation. Does NOT unlock Sync Data for key programming.'),
('SFD2', 2024, 'Live real-time server validation for every interaction. Audit trail logged.', 0, 'Calibration data, ECU tuning parameters, security functions', 'ODIS + GeKo only (currently)', 'Blocks offline/cached token generators. Logs user ID making changes. MY2024+ and some late 2023.');

-- ============================================================================
-- SECTION 3: Audi Model Security Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS audi_model_security_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    typ_code TEXT,
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT,
    bcm_prefix TEXT,
    sfd_locked BOOLEAN,
    immo_generation TEXT,
    key_part_number TEXT,
    fcc_id TEXT,
    chip_type TEXT,
    sync_data_required BOOLEAN,
    dealer_only BOOLEAN,
    akl_difficulty INTEGER,
    programming_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO audi_model_security_matrix (model, typ_code, year_start, year_end, platform, bcm_prefix, sfd_locked, immo_generation, key_part_number, fcc_id, chip_type, sync_data_required, dealer_only, akl_difficulty, programming_notes) VALUES
-- MQB Legacy (8V)
('A3 / S3', '8V', 2013, 2020, 'MQB', '5Q0', 0, 'Immo V', '8V0 959 754', 'NBGFS12P71', 'Megamos AES (ID88)', 0, 0, 5, 'Standard MQB48 procedure. OBD accessible. Relatively straightforward.'),

-- MQB-Evo (8Y)
('A3 / S3 / RS3', '8Y', 2021, 2025, 'MQB-Evo', '5WA', 1, 'Immo VI', '8Y0 959 754', 'NBGFS12A71', 'Megamos AES (ID88 Evo precoding)', 1, 0, 8, 'SFD LOCKED. Sync Data calculation required. OBD calc or bench read NEC35xx cluster (HIGH RISK). RS3 may have additional ECU locks.'),

-- Q4 e-tron (MEB)
('Q4 e-tron', 'MEB', 2022, 2025, 'MEB', 'ICAS1', 1, 'Immo VI', '8Y0/4N0 959 754', '-', 'Megamos AES', 1, 1, 10, 'DEALER ONLY for AKL. ICAS1 module highly integrated. Bench read is complex and risky. No reliable aftermarket OBD solution.'),

-- Q5 Facelift (MLB-Evo with MQB-Evo electronics)
('Q5 (Facelift)', 'FY', 2021, 2025, 'MLB-Evo', '80A', 1, 'Immo V/VI', '-', 'IYZ-AK2', 'Megamos AES', 1, 0, 8, 'MLB chassis but MQB-Evo electronics. BCM2 encrypted on 2021+. SFD locked.'),

-- Q7/Q8 Facelift
('Q7 / Q8 (Facelift)', '4M', 2021, 2025, 'MLB-Evo', '4M0', 1, 'Immo V/VI', '-', 'IYZ-AK2', 'Megamos AES', 1, 0, 9, 'BCM2 in trunk is encrypted. Locked BCM2 requires server calculation. Inconsistent success on aftermarket tools.'),

-- e-tron GT
('e-tron GT', '-', 2021, 2025, 'J1 (Porsche shared)', '-', 1, 'Immo VI', '-', '-', 'Megamos AES', 1, 1, 10, 'Fully SFD compliant. Dealer only for AKL. Shared platform with Porsche Taycan.');

-- ============================================================================
-- SECTION 4: Audi FCC ID Compatibility Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS audi_fcc_id_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL,
    model_code TEXT,
    platform TEXT,
    year_range TEXT,
    frequency_mhz INTEGER,
    chip_type TEXT,
    button_count INTEGER,
    compatible_models TEXT,
    incompatible_with TEXT,
    critical_warning TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO audi_fcc_id_reference (fcc_id, model_code, platform, year_range, frequency_mhz, chip_type, button_count, compatible_models, incompatible_with, critical_warning) VALUES
('NBGFS12P71', 'FS12P', 'MQB (8V)', '2013-2020', 315, 'Megamos AES (ID88)', 4, 'A3 8V, Q3 8U', 'FS12A', '#1 CAUSE OF FAILURE: FS12P and FS12A are NOT interchangeable. Key may start car but remote buttons fail.'),
('NBGFS12A71', 'FS12A', 'MQB-Evo (8Y)', '2020-2025', 433, 'Megamos AES (ID88 Evo)', 4, 'A3 8Y, Q3 8U (late)', 'FS12P', 'Requires Evo precoding. Not compatible with 8V vehicles.'),
('IYZ-AK2', '-', 'MLB-Evo', '2017-2025', 433, 'Megamos AES', 4, 'Q5, Q7, Q8, A6, A7, A8', '-', 'MLB platform. Check BCM2 lock status on 2021+ models.');

-- ============================================================================
-- SECTION 5: Sync Data Calculation Methods
-- ============================================================================
CREATE TABLE IF NOT EXISTS audi_sync_data_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    applicability TEXT,
    tool_requirements TEXT,
    process TEXT,
    risk_level TEXT,
    success_rate TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO audi_sync_data_methods (method, applicability, tool_requirements, process, risk_level, success_rate, notes) VALUES
('OBD Calculation (Server)', 'Early 2020/2021 models', 'Autel IM608, Xhorse Key Tool Plus + internet', 'Tool reads Gateway/BCM/Cluster via OBD. Uploads blob to server. Server calculates 32-byte Sync Data.', 'Low', '70-80%', 'Paid token/credit per calculation. Fails on 2023+ models frequently.'),
('Bench Reading (NEC35xx)', 'A3 8Y with locked clusters', 'VVDI Prog, Autel XP400 Pro with APB131 adapter', 'Remove Instrument Cluster. Open casing. Clip/solder to NEC35xx processor/EEPROM. Read dump. Tool calculates Sync Data.', 'HIGH', '90%+', 'HIGH RISK of damaging expensive Virtual Cockpit. Requires advanced skill.'),
('ODIS + GeKo (Dealer)', 'All models', 'ODIS Engineering + GeKo 2FA account', 'Dealer logs into GeKo. Orders pre-coded key by VIN. ODIS handles Sync Data automatically in background.', 'None', '100%', 'Only guaranteed method. Requires dealer access level.');

-- ============================================================================
-- SECTION 6: Update vehicles and locksmith_alerts
-- ============================================================================
UPDATE vehicles SET
    security_system = 'Audi MQB-Evo (SFD + Sync Data)',
    akl_difficulty = 'High',
    special_notes = '5WA BCM is BORN LOCKED. SFD token unlocks coding ONLY. Key programming requires Sync Data calculation (server or bench read).'
WHERE make = 'Audi' AND model LIKE 'A3%' AND year_start >= 2021;

UPDATE vehicles SET
    security_system = 'Audi MEB (SFD + ICAS1)',
    akl_difficulty = 'Severe',
    special_notes = 'DEALER ONLY for AKL. ICAS1 module highly integrated with HV system. No reliable aftermarket solution.'
WHERE make = 'Audi' AND model LIKE 'Q4%' AND year_start >= 2022;

INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Audi', 'A3 8Y', 2021, 2025, '5WA BCM is BORN LOCKED - No Open State', 'Unlike 5Q0 BCMs, the 5WA BCM has no "open" state. Every configuration change requires SFD server handshake. Legacy 5Q0 unlocking protocols will corrupt the BCM.', 'All Diagnostics', 'NEVER brute-force a 5WA BCM with legacy protocols. Verify BCM part number prefix before any write operation. Use SFD-capable tools only.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Critical', 'Audi', 'Q4 e-tron', 2022, 2025, 'MEB Platform = Dealer Only for AKL', 'The ICAS1 module cannot be read via OBD by aftermarket tools. Bench reading is complex and risky. Server dependency is absolute.', 'All Keys Lost', 'Refer to dealer. NO reliable aftermarket OBD bypass exists. Do not attempt.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Critical', 'Audi', 'All MQB-Evo', 2020, 2025, 'Diagnostic SFD ≠ Immobilizer Sync Data', 'Unlocking SFD with OBDeleven/VCTool tokens grants access to CODING only. It does NOT unlock key programming. Sync Data is a separate 32-byte encrypted string.', 'Key Programming', 'For key programming: use OBD server calculation (paid tokens) or bench read NEC35xx cluster. SFD coding tokens are insufficient.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Critical', 'Audi', 'A3/Q3', 2013, 2025, 'FS12P vs FS12A Keys = NOT Interchangeable', 'Despite identical appearance, NBGFS12P71 (8V) and NBGFS12A71 (8Y) have different remote coding logic. Wrong key = immobilizer success, remote buttons fail.', 'Key Ordering', 'Verify FCC ID on original key or BCM label. FS12P = 8V (2013-2020). FS12A = 8Y (2021+). Do NOT rely on visual matching.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Audi', 'Q5/Q7/Q8 Facelift', 2021, 2025, 'BCM2 is Encrypted on 2021+ Models', 'The BCM2 (in trunk) holds immobilizer data. On 2020 and earlier, it could be read. On 2021+, it is encrypted and requires server calculation.', 'All Keys Lost', 'Check model year carefully. Xhorse/Autel "solder-free" BCM2 adapters have inconsistent success on 2021+. Server calculation may be required.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Audi', 'All MQB-Evo', 2020, 2025, 'NEC35xx Bench Read = HIGH RISK', 'Reading the Virtual Cockpit cluster (NEC35xx) requires removing cluster, opening casing, and soldering/clipping to processor. High risk of damaging expensive component.', 'Sync Data Extraction', 'Only attempt if experienced. Have backup plan. Consider OBD server calculation first (even if less reliable) before invasive bench procedure.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Audi', 'All SFD Models', 2024, 2025, 'SFD2 Blocks Offline Token Generators', 'MY2024+ (and some late 2023) use SFD2 protocol. Real-time server validation required. Cached/offline tokens may fail. Audit trail logs all changes.', 'All Diagnostics', 'Ensure tool is fully updated. Have stable internet connection. SFD2 may require ODIS/GeKo for full access.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Audi', 'All Models', 2020, 2025, 'Server Dependency = Blackout Risk', 'Aftermarket Sync Data calculation depends on overseas servers. Documented outages of Lonsdor/Xhorse servers have made AKL impossible for days.', 'Business Continuity', 'Have secondary tool ecosystem (both Autel AND Xhorse). Maintain relationship with locksmith who has ODIS/GeKo access for time-critical jobs.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Info', 'Audi', 'All Models', 2020, 2025, 'Visual Identification: Shift "Nub" = MQB-Evo', 'The small toggle-style shift-by-wire selector (the "nub") indicates MQB-Evo (8Y/CD). Traditional gear lever = MQB (8V/AU). Check interior before VIN scan.', 'Pre-Job Identification', 'If you see the small toggle shift selector, prepare for SFD environment. If traditional lever, proceed with MQB procedures.', 'Audi_MQB-Evo_Security_Deep_Dive.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Audi MQB-Evo Security Architecture Complete' AS status,
       (SELECT COUNT(*) FROM vag_platform_identification) AS platform_entries,
       (SELECT COUNT(*) FROM audi_model_security_matrix) AS model_entries,
       (SELECT COUNT(*) FROM audi_fcc_id_reference) AS fcc_entries,
       (SELECT COUNT(*) FROM audi_sync_data_methods) AS method_entries;
