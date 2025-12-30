-- Mazda Security Architecture & Key Programming Integration
-- Source: Mazda_Key_Programming_Research_Data.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Mazda Security Generations
-- ============================================================================
CREATE TABLE IF NOT EXISTS mazda_security_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generation TEXT NOT NULL,
    year_range TEXT,
    security_locus TEXT,
    chip_type TEXT,
    chip_id TEXT,
    encryption_standard TEXT,
    features TEXT,
    bcm_risk TEXT,
    akl_method TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mazda_security_generations (generation, year_range, security_locus, chip_type, chip_id, encryption_standard, features, bcm_risk, akl_method, description) VALUES
('Pre-Skyactiv (Ford Era)', '2006-2013', 'Instrument Cluster / Minimal IMMO Box', 'Texas 4D-63', 'ID60 (80-bit)', 'Proprietary DST80', 'Switchblade key', 'Low', 'Standard Incode/Outcode', 'Ford partnership era. Shared architecture with Mazda 3 BL, Mazda 6 GH.'),
('Gen 1 Skyactiv', '2014-2018', 'Start Stop Unit (SSU) + BCM + PCM', 'NXP PCF7953P', 'ID49 (Hitag Pro)', 'NXP Hitag 3 extension', 'PEPS/Push-to-Start', 'Medium', 'Incode/Outcode via OBD', 'SSU is primary immobilizer. BCM is gateway only. Two-key rule often required.'),
('Gen 1.5 Skyactiv (Transition)', '2019-2023', 'SSU + Updated BCM', 'NXP PCF7953P', 'ID49 (Hitag Pro)', 'NXP Hitag Pro', 'Updated firmware', 'Medium', 'Server-assisted Incode/Outcode', 'CX-5 and CX-9 retained SSU architecture despite being 2021+ model years.'),
('Gen 2 Skyactiv (7th Gen)', '2019-2025', 'Integrated Super-BCM (SSU absorbed)', 'NXP PCF7939MA', 'ID4A (Hitag AES)', 'AES-128', 'BCM-centric, CAN FD capable, SGW on premium models', 'HIGH - BCM is cryptographic heart', '7-minute server calculation (stable power CRITICAL)', 'Mazda 3 BP, CX-30, CX-50, CX-90. BCM failure = vehicle identity loss.');

-- ============================================================================
-- SECTION 2: Mazda FCC ID Cross-Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS mazda_fcc_id_crossref (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id_na TEXT NOT NULL,
    fcc_id_eu TEXT,
    chip_id TEXT,
    frequency_na_mhz INTEGER,
    frequency_eu_mhz INTEGER,
    generation TEXT,
    button_count TEXT,
    compatible_models TEXT,
    year_range TEXT,
    compatibility_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mazda_fcc_id_crossref (fcc_id_na, fcc_id_eu, chip_id, frequency_na_mhz, frequency_eu_mhz, generation, button_count, compatible_models, year_range, compatibility_notes) VALUES
-- Gen 1 / Gen 1.5 Hitag Pro Keys
('WAZSKE13D01', 'SKE13E-01', 'ID49 (Hitag Pro)', 315, 433, 'Gen 1', '3B / 4B', 'Mazda 3 2014-2018, Mazda 6 2014-2017, CX-3 2016-2021, CX-5 2013-2016, CX-9 2016-2019, MX-5 2016-2024', '2013-2021', 'D01 = Base models WITHOUT power liftgate.'),
('WAZSKE13D02', 'SKE13E-02', 'ID49 (Hitag Pro)', 315, 433, 'Gen 1', '4B', 'CX-5 2017-2020 (Power Liftgate), CX-9 2018-2019, Mazda 6 2018-2021', '2017-2021', 'D02 = Power Liftgate models. D01 and D02 are NOT interchangeable - RKE logic differs.'),
('WAZSKE13D03', 'SKE13E-03', 'ID49 (Hitag Pro)', 315, 433, 'Gen 1.5', '4B', 'CX-5 2021-2025, CX-9 2020-2023', '2020-2025', 'Late-cycle revision. Backward compatible with some D02 vehicles.'),

-- Gen 2 Hitag AES Keys
('WAZSKE11D01', 'SKE11E-01', 'ID4A (Hitag AES)', 315, 433, 'Gen 2', '3B / 4B', 'Mazda 3 2019-2025, CX-30 2020-2025, CX-50 2023-2025, CX-90 2024-2025', '2019-2025', 'Gen 2 ONLY. Side-button design. Zero compatibility with 13D series. AES encryption.');

-- ============================================================================
-- SECTION 3: Mazda Model Security Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS mazda_model_security_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT,
    generation TEXT,
    fcc_id TEXT,
    chip_id TEXT,
    security_locus TEXT,
    sgw_present BOOLEAN,
    active_alarm_bypass BOOLEAN,
    bcm_brick_risk TEXT,
    akl_difficulty INTEGER,
    programming_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mazda_model_security_matrix (model, year_start, year_end, platform, generation, fcc_id, chip_id, security_locus, sgw_present, active_alarm_bypass, bcm_brick_risk, akl_difficulty, programming_notes) VALUES
-- Gen 1 Models (SSU-based)
('Mazda 3', 2014, 2018, 'BM/BN', 'Gen 1', 'WAZSKE13D01/D02', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'SSU-based. Standard OBD Incode/Outcode. Two-key rule recommended.'),
('Mazda 6', 2014, 2017, 'GJ', 'Gen 1', 'WAZSKE13D01', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'Sedan trunk logic. Standard Incode/Outcode.'),
('Mazda 6', 2018, 2021, 'GL', 'Gen 1', 'WAZSKE13D02', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'Flatter key design. D02 required.'),
('CX-3', 2016, 2021, 'DK', 'Gen 1', 'WAZSKE13D01/D02', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'Check for Power Liftgate to determine D01/D02.'),
('CX-5', 2013, 2016, 'KE', 'Gen 1', 'WAZSKE13D01', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'Early Skyactiv smart key.'),
('CX-5', 2017, 2020, 'KF', 'Gen 1', 'WAZSKE13D02', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'Power Liftgate standard. D02 required.'),
('CX-5', 2021, 2025, 'KF (Refresh)', 'Gen 1.5', 'WAZSKE13D03', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Medium', 5, 'ANOMALY: Retained SSU despite 2021+ year. Looks new but is Gen 1.5 internally.'),
('CX-9', 2016, 2019, 'TC', 'Gen 1', 'WAZSKE13D01/D02', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'Large crossover. Standard Gen 1.'),
('CX-9', 2020, 2023, 'TC', 'Gen 1.5', 'WAZSKE13D03', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Medium', 5, 'Updated firmware. D03 key.'),
('MX-5 Miata', 2016, 2024, 'ND', 'Gen 1', 'WAZSKE13D01/D02', 'ID49 (Hitag Pro)', 'SSU', 0, 0, 'Low', 4, 'Convertible roof logic does not affect programming.'),

-- Gen 2 Models (BCM-integrated)
('Mazda 3', 2019, 2025, 'BP', 'Gen 2', 'WAZSKE11D01', 'ID4A (Hitag AES)', 'Super-BCM', 0, 0, 'HIGH', 8, 'Gen 2 pioneer. BCM is cryptographic heart. 7-minute server calculation. Stable power CRITICAL.'),
('CX-30', 2020, 2025, 'DM', 'Gen 2', 'WAZSKE11D01', 'ID4A (Hitag AES)', 'Super-BCM', 0, 0, 'HIGH', 8, 'Same architecture as Mazda 3 BP. High BCM brick risk.'),
('CX-50', 2023, 2025, '-', 'Gen 2', 'WAZSKE11D01', 'ID4A (Hitag AES)', 'Super-BCM', 0, 1, 'HIGH', 9, 'Active Alarm Bypass required. Native Gen 2.'),
('CX-90', 2024, 2025, '-', 'Gen 2', 'WAZSKE11D01', 'ID4A (Hitag AES)', 'Super-BCM', 1, 1, 'HIGH', 10, 'Active Alarm Bypass + SGW Bypass required. Flagship complexity.');

-- ============================================================================
-- SECTION 4: Mazda Chip Architecture Comparison
-- ============================================================================
CREATE TABLE IF NOT EXISTS mazda_chip_comparison (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    industry_id TEXT NOT NULL,
    chip_family TEXT,
    nxp_part_number TEXT,
    manufacturer TEXT,
    encryption_type TEXT,
    locking_behavior TEXT,
    renewal_possibility TEXT,
    mazda_usage TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mazda_chip_comparison (industry_id, chip_family, nxp_part_number, manufacturer, encryption_type, locking_behavior, renewal_possibility, mazda_usage, notes) VALUES
('ID49', 'Hitag Pro', 'PCF7953P', 'NXP', 'Proprietary Hitag 3 extension', 'Lock Bit written after programming', 'Unlockable via VVDI/XP400', 'Gen 1 and Gen 1.5 (2014-2023)', 'Multi-purpose IC. Programmable memory pages.'),
('ID4A', 'Hitag AES', 'PCF7939MA', 'NXP', 'AES-128 (open standard)', 'AES key burned into chip', 'No renewal - chip is married', 'Gen 2 (2019-2025)', 'Dedicated AES co-processor. Must be pre-coded with Mazda Family ID.'),
('ID47', 'Hitag 3', 'PCF7952/7953', 'NXP', 'Proprietary Hitag 3', 'Variable', 'Unlockable', 'NOT USED BY MAZDA', 'COMMON MISIDENTIFICATION - ID47 is Honda/Kia. Mazda skipped Hitag 3.');

-- ============================================================================
-- SECTION 5: Update vehicles and locksmith_alerts
-- ============================================================================
UPDATE vehicles SET
    security_system = 'Mazda Gen 1 (Hitag Pro/ID49)',
    akl_difficulty = 'Medium',
    special_notes = 'SSU-based architecture. Standard OBD Incode/Outcode. Two-key rule recommended. Check D01 vs D02 for Power Liftgate variants.'
WHERE make = 'Mazda' AND model IN ('CX-5', 'CX-9', 'Mazda 6') AND year_start >= 2014 AND year_start <= 2023;

UPDATE vehicles SET
    security_system = 'Mazda Gen 2 (Hitag AES/ID4A)',
    akl_difficulty = 'High',
    special_notes = 'BCM-integrated architecture. 7-minute server calculation. Stable 12V+ power CRITICAL. Battery voltage drop = BCM corruption.'
WHERE make = 'Mazda' AND model IN ('Mazda 3', 'CX-30') AND year_start >= 2019;

UPDATE vehicles SET
    security_system = 'Mazda Gen 2 + SGW (Hitag AES)',
    akl_difficulty = 'Severe',
    special_notes = 'Active Alarm Bypass + SGW physical bypass required. CX-90 is flagship complexity. Highest brick risk in Mazda fleet.'
WHERE make = 'Mazda' AND model IN ('CX-50', 'CX-90') AND year_start >= 2023;

INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Mazda', 'Mazda 3 / CX-30', 2019, 2025, 'Gen 2 BCM = Cryptographic Heart (HIGH BRICK RISK)', 'The BCM stores master key identifiers and manages encrypted handshake. BCM failure = vehicle identity loss. If BCM dies during programming, car is bricked.', 'All Keys Lost', 'ALWAYS connect battery maintainer (13.5V) before Gen 2 programming. 7-minute data transfer is danger zone. Voltage drop below 12.0V = corruption.', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP),
('Critical', 'Mazda', '2019+ All Models', 2019, 2025, 'ID47 is NOT Mazda - Do Not Use Hitag 3', 'Mazda skipped Hitag 3 (ID47) entirely. They went from ID49 (Hitag Pro) directly to ID4A (AES). ID47 chips will NOT communicate.', 'Key Ordering', 'Gen 1/1.5 = ID49 (Hitag Pro). Gen 2 = ID4A (Hitag AES). Never use ID47 - that is Honda/Kia.', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP),
('Critical', 'Mazda', 'CX-50 / CX-90', 2023, 2025, 'Active Alarm Lockout + SGW = Double Barrier', 'If alarm is armed (default in AKL), Gateway/BCM rejects all diagnostic requests. Tool fails to communicate.', 'All Keys Lost', 'Method A: Wait 2.5 min for alarm exhaustion. Method B: Disconnect horn fuse, let alarm run cycle. Method C: Hard reset (clamp cables together, discharge capacitors, reconnect immediately).', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP),
('Warning', 'Mazda', 'All Models', 2014, 2025, 'D01 / D02 / D03 FCC IDs Are NOT Interchangeable', 'WAZSKE13D01 (base) and WAZSKE13D02 (Power Liftgate) have different RKE logic headers. D01 on D02 car = immobilizer success but remote buttons fail.', 'Key Ordering', 'Check vehicle options before ordering. Power Liftgate = D02. No Power Liftgate = D01. CX-5 2021+ = D03.', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP),
('Warning', 'Mazda', 'CX-5', 2021, 2025, 'CX-5 is Gen 1.5 ANOMALY (Not Gen 2)', 'Despite 2021+ model year and new infotainment screen, CX-5 retained SSU-based architecture (Hitag Pro). Do NOT confuse with Gen 2 AES system.', 'Pre-Job Identification', 'CX-5 2021+ = Gen 1.5 (ID49, D03 key). CX-50/CX-90 = Gen 2 (ID4A, 11D01 key). Check model, not just year.', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP),
('Warning', 'Mazda', 'All Gen 1', 2014, 2023, 'Two-Key Rule for Stable AKL', 'Mazda immobilizer often requires two keys to close learning cycle properly. Single key = security light may continue flashing.', 'All Keys Lost', 'Always have two keys available for AKL jobs. Some tools have "Force Close Session" but two keys is most reliable.', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP),
('Info', 'Mazda', 'All Models', 2014, 2025, 'Check Mazda Connect "Keyless Entry" Setting', 'Infotainment setting can disable LF antennas. Customer complains key does not work. Issue is setting, not key.', 'No-Start Diagnosis', 'Verify "Keyless Entry" is ON in Mazda Connect settings before diagnosing bad key or module.', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP),
('Info', 'Mazda', 'All Models', 2014, 2025, '"In-Vehicle Network Malfunction" Recovery', 'Dashboard error after failed programming or battery change. Usually data corruption in BCM volatile memory.', 'Error Recovery', 'Level 1: Disconnect battery, wait 15-60 min, reconnect (soft reset). Level 2: Remove BCM, read processor via JTAG/UART, repair checksums.', 'Mazda_Key_Programming_Research_Data.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Mazda Security Architecture Complete' AS status,
       (SELECT COUNT(*) FROM mazda_security_generations) AS generation_entries,
       (SELECT COUNT(*) FROM mazda_fcc_id_crossref) AS fcc_entries,
       (SELECT COUNT(*) FROM mazda_model_security_matrix) AS model_entries,
       (SELECT COUNT(*) FROM mazda_chip_comparison) AS chip_entries;
