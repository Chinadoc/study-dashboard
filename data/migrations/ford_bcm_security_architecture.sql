-- Ford BCM Security Bypass Architecture Integration
-- Source: Ford_BCM_Security_Bypass_Analysis.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Ford PATS Generations Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_pats_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pats_version TEXT NOT NULL,
    year_range TEXT,
    encryption_type TEXT,
    encryption_bits INTEGER,
    security_locus TEXT,
    key_types TEXT,
    bypass_method TEXT,
    key_limit INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ford_pats_generations (pats_version, year_range, encryption_type, encryption_bits, security_locus, key_types, bypass_method, key_limit, description) VALUES
('PATS Gen 1-3', '1996-2010', 'Texas 4C/4D-60', 40, 'Instrument Cluster (IPC)', 'Fixed Blade', 'Simple Incode/Outcode', 8, 'Legacy fixed-code. Vulnerable to brute-force. Obsolete.'),
('PATS Gen 4', '2011-2018', 'Texas 4D-63 (80-bit)', 80, 'IPC + PCM handshake', 'Blade H92/H94', 'Standard Incode/Outcode', 8, 'Bladed key. Mitigated cloning. Still offline calculation.'),
('PATS Gen 5 (Bladed)', '2018-2024', 'AES-128', 128, 'Body Control Module (BCM)', 'Blade H92/H94 (ID49)', '16-digit challenge-response', 8, 'BCM-centric. Online calculation required. 10-min wait enforced.'),
('PATS Gen 5+ (Smart)', '2018-2025', 'AES-128', 128, 'BCM + ESCL', 'Smart Proximity (ID49)', 'Online server calculation', 4, 'Push-to-Start. LF antenna triangulation. PEPS architecture.'),
('PATS Gen 6 / CAN FD', '2024+', 'AES-128', 128, 'BCM + Gateway (CAN FD)', 'Smart Proximity (ID49)', 'CAN FD Adapter MANDATORY', 4, 'S650 Mustang pioneer. 5 Mbps bus speed. Legacy tools cannot communicate.');

-- ============================================================================
-- SECTION 2: Ford Active Alarm Lockout Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_alarm_lockout_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lockout_level TEXT NOT NULL,
    severity INTEGER,
    models TEXT,
    year_range TEXT,
    behavior TEXT,
    bypass_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ford_alarm_lockout_matrix (lockout_level, severity, models, year_range, behavior, bypass_method, notes) VALUES
('Level 1: Passive Lockout', 3, 'Escape, Fusion (Base Trims)', '2018-2020', 'BCM refuses handshake but does not jam bus. 30-60 sec timeout.', 'Wait for alarm cycle or use tool "Silence" command', 'Software-based only. Relatively accessible.'),
('Level 2: Active Rejection', 6, 'Explorer, Expedition', '2018-2024', 'Persistent "Deny" flag in BCM volatile memory. Cool-down period resets on communication attempt.', 'Battery reset method (discharge capacitors) or SecuriCode keypad', 'Requires hard reset to clear flag from RAM.'),
('Level 3: Fortress', 9, 'F-150 Gen 14, S650 Mustang, Mach-E', '2021-2025', 'Ultrasonic sensors detect interior volumetric changes. Presence in cabin re-triggers alarm loop permanently.', 'SecuriCode keypad (primary) OR Gateway bypass hardware (secondary)', 'Most aggressive. May require FDRS dealer tool for Alarm Silence command.');

-- ============================================================================
-- SECTION 3: Ford Model Security Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_model_security_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    pats_version TEXT,
    key_chip_type TEXT,
    fcc_id TEXT,
    frequency_mhz INTEGER,
    alarm_sensitivity TEXT,
    bypass_required TEXT,
    akl_difficulty INTEGER,
    gwm_location TEXT,
    programming_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ford_model_security_matrix (model, year_start, year_end, pats_version, key_chip_type, fcc_id, frequency_mhz, alarm_sensitivity, bypass_required, akl_difficulty, gwm_location, programming_notes) VALUES
-- F-150
('F-150', 2018, 2020, 'Gen 5 Smart', 'ID49 (Hitag Pro)', 'M3N-A2C931426', 902, 'High', 'Door Code / Battery Reset', 7, 'N/A (No SGW)', 'Alarm active lockout common. Use door code or battery reset.'),
('F-150', 2021, 2025, 'Gen 5+ Smart', 'ID49 (Hitag Pro)', 'M3N-A2C931426', 902, 'Extreme', 'Gateway Bypass (Radio)', 9, 'Behind center console radio stack', 'Ultrasonic sensors very sensitive. GWM bypass behind radio required if alarm active. 26-pin connector.'),

-- Mustang
('Mustang', 2018, 2023, 'Gen 5 Smart', 'ID49 (Hitag Pro)', 'M3N-A2C931426', 902, 'High', 'Door Code / Battery Reset', 7, 'N/A (No SGW)', 'S550 platform. Alarm lockout frequent.'),
('Mustang', 2024, 2025, 'CAN FD', 'ID49 (Hitag Pro)', 'M3N-A2C931426', 902, 'Extreme', 'CAN FD Adapter MANDATORY', 10, 'Integrated Gateway', 'S650 platform. MUST have CAN FD hardware. Legacy tools fail to communicate. Dealer codes often required.'),

-- Explorer
('Explorer', 2020, 2025, 'Gen 5+ Smart', 'ID49 (Hitag Pro)', 'M3N-A2C931426', 902, 'Extreme', 'Gateway Bypass (Dash)', 8, 'High in dashboard above brake pedal', 'GWM bypass cable needed. 24-pin connector. 10-min wait often enforced.'),

-- Escape
('Escape', 2020, 2024, 'Gen 5 Smart', 'ID49 (Hitag Pro)', 'M3N-A2C931423', 315, 'Medium', 'Standard OBD', 5, 'N/A', 'Uses 315 MHz key. SGW present but digital bypass usually works.'),

-- Transit
('Transit', 2020, 2024, 'Gen 5 Flip', 'ID49 (Hitag Pro)', 'N5F-A08TAA', 315, 'Medium', 'Standard OBD', 6, 'N/A', 'Full-size van. Blue/Silver flip remote keys. Standard procedure.'),
('Transit Connect', 2019, 2022, 'Gen 4/5 Blade', 'H94 (4D-63 80-bit)', 'N5F-A08TAA', 315, 'Low', 'Standard OBD', 4, 'N/A', 'Uses H94 High Security Blade. Do NOT use H92. Global C platform.'),

-- Mach-E
('Mustang Mach-E', 2021, 2025, 'Gen 5+ Smart (EV)', 'ID49 (Hitag Pro)', 'M3N-A2C931426', 902, 'Extreme', 'Gateway Bypass (BCM)', 9, 'Passenger footwell near BCM', 'EV architecture. 12V battery reset CRITICAL for alarm silence. Follow HV disable procedure.'),

-- Bronco
('Bronco Sport', 2021, 2025, 'Gen 5+ Smart', 'ID49 (Hitag Pro)', 'M3N-A2C931426', 902, 'High', 'Gateway Bypass', 8, 'Similar to Escape/Explorer', 'Shares architecture with Escape/Explorer.');

-- ============================================================================
-- SECTION 4: Ford RF Frequency Mapping
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_rf_frequency_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL,
    frequency_mhz INTEGER,
    feature_level TEXT,
    button_count INTEGER,
    appearance TEXT,
    compatible_models TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ford_rf_frequency_mapping (fcc_id, frequency_mhz, feature_level, button_count, appearance, compatible_models, notes) VALUES
('M3N-A2C93142600', 902, 'High Feature (Remote Start, Power Liftgate)', 5, 'Standard proximity fob with LED feedback', 'F-150, Explorer, Expedition (Titanium/Platinum/ST)', 'Long range (up to 3000 ft). Bi-directional. LED flash on remote start.'),
('M3N-A2C931423', 315, 'Standard Feature (Base/XLT Trims)', 4, 'Standard proximity fob', 'Escape, Edge, Fusion, Base F-150', 'Standard range. No remote start feedback.'),
('N5F-A08TAA', 315, 'Commercial/Fleet', 5, 'Flip key with remote', 'Transit, Transit Connect', 'Blue or silver flip remote.');

-- ============================================================================
-- SECTION 5: Ford Gateway Bypass Locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_gateway_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_range TEXT,
    sgw_status TEXT,
    module_location TEXT,
    connector_type TEXT,
    access_difficulty TEXT,
    bypass_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ford_gateway_locations (model, year_range, sgw_status, module_location, connector_type, access_difficulty, bypass_method, notes) VALUES
('Explorer', '2020+', 'Yes', 'High in dashboard above brake pedal', '24-pin connector facing front', 'Medium - reachable from footwell', 'Autel 12+8 style bypass cable or Ford-specific', 'No tool disassembly required. Tight fit from footwell.'),
('F-150 Gen 14', '2021+', 'Yes', 'Behind center console/radio stack', '26-pin connector on underside', 'High - requires trim panel removal', 'Ford Gateway Bypass harness', 'Significantly more difficult than Explorer. Trim removal needed.'),
('Mustang Mach-E', '2021+', 'Yes', 'Near BCM in passenger footwell', 'Primary gateway connector', 'Medium', 'Gateway disconnect + bypass insertion', 'HIGH VOLTAGE CAUTION. Disconnect 12V battery. Follow HV disable if needed.'),
('Expedition/Navigator', '2022+', 'Yes', 'Similar to Explorer architecture', '24-pin', 'Medium', 'Same as Explorer', 'Standardized across full-size SUVs.');

-- ============================================================================
-- SECTION 6: Ford Key Blade Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_key_blade_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blade_type TEXT NOT NULL,
    cut_type TEXT,
    chip_type TEXT,
    platform TEXT,
    primary_models TEXT,
    year_range TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ford_key_blade_reference (blade_type, cut_type, chip_type, platform, primary_models, year_range, notes) VALUES
('H75/H84', 'Edge Cut', '4D-60 (40-bit)', 'Legacy', 'F-Series pre-2011, Crown Vic', '1996-2010', 'Obsolete. Basic PATS.'),
('H92', 'Edge Cut', '4D-63 (80-bit)', 'North American Truck', 'F-150 2011-2020, Ranger', '2011-2020', 'Upgraded chip. Physically resembles H75/H84.'),
('H94', 'Laser Cut (Side-Milled)', '4D-63 (80-bit)', 'Global C Platform', 'Fiesta, Focus, Transit Connect', '2011-2022', 'High Security blade. Electrically identical to H92 but different physical profile.'),
('Smart Fob', 'Embedded Emergency Blade', 'ID49 (Hitag Pro)', 'FNV2 / Modern', 'All Push-to-Start 2018+', '2018-2025', 'Proximity key. Emergency blade is H92 style insert.');

-- ============================================================================
-- SECTION 7: Update vehicles and locksmith_alerts
-- ============================================================================
UPDATE vehicles SET
    security_system = 'Ford PATS Gen 5+ (ID49 Smart)',
    akl_difficulty = 'High',
    special_notes = 'Active Alarm Lockout. Use SecuriCode keypad (5-digit on BCM) or battery reset. Gateway bypass may be required for 2021+ models.'
WHERE make = 'Ford' AND model IN ('F-150', 'Explorer', 'Expedition', 'Mustang') AND year_start >= 2018;

UPDATE vehicles SET
    security_system = 'Ford CAN FD (S650)',
    can_fd_required = 1,
    akl_difficulty = 'Severe',
    special_notes = 'CAN FD Adapter MANDATORY. Legacy tools cannot communicate. 5 Mbps bus speed. Dealer-level codes often required.'
WHERE make = 'Ford' AND model = 'Mustang' AND year_start >= 2024;

INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Ford', 'F-150', 2021, 2025, 'Ultrasonic Sensors = Permanent Alarm Loop', 'Gen 14 F-150 has ultrasonic interior sensors. Technician presence in cabin continuously re-triggers alarm, permanently blocking OBD communication.', 'All Keys Lost', 'Primary: Use SecuriCode keypad (5-digit on BCM label). Secondary: Gateway bypass behind radio (26-pin). Disconnect battery and short cables to discharge capacitors before reconnecting.', 'Ford_BCM_Security_Bypass_Analysis.txt', CURRENT_TIMESTAMP),
('Critical', 'Ford', 'Mustang', 2024, 2025, 'S650 CAN FD = Legacy Tools Cannot Communicate', 'The 2024+ Mustang uses CAN FD protocol (5 Mbps, 64-byte payload). Standard CAN tools hardware cannot synchronize with bus speed. Tool shows static/no communication.', 'All Diagnostics', 'CAN FD Adapter MANDATORY (Autel V200/V300 VCI or external CAN FD adapter). No software workaround - hardware transceiver limitation.', 'Ford_BCM_Security_Bypass_Analysis.txt', CURRENT_TIMESTAMP),
('Critical', 'Ford', 'Explorer', 2020, 2025, 'Gateway Module Requires Physical Bypass for AKL', 'SGW blocks write commands to BCM from OBDII port. Alarm active = complete diagnostic blackout. Digital bypass fails if alarm active.', 'All Keys Lost', 'Physical bypass: Access GWM above brake pedal. Disconnect 24-pin connector. Insert bypass cable to bridge CAN bus. Then proceed with OBD programming.', 'Ford_BCM_Security_Bypass_Analysis.txt', CURRENT_TIMESTAMP),
('Warning', 'Ford', 'All Models', 2018, 2025, 'SecuriCode Keypad = Primary Bypass Vector', 'BCM treats valid keypad entry as Class A authentication. Factory 5-digit code is printed on BCM label. Entry disarms alarm and restores OBD communication.', 'Active Alarm Bypass', 'Locate BCM (driver footwell or passenger kick panel). Use borescope to read 5-digit code on label. Enter on door keypad.', 'Ford_BCM_Security_Bypass_Analysis.txt', CURRENT_TIMESTAMP),
('Warning', 'Ford', 'All Smart Key', 2018, 2025, '902 MHz vs 315 MHz = Not Cross-Compatible', 'M3N-A2C93142600 (902 MHz) and M3N-A2C931423 (315 MHz) fobs are physically identical but RF incompatible. Wrong frequency = buttons fail.', 'Key Ordering', 'Verify trim level before ordering. High trims (Titanium/Platinum/ST) = 902 MHz. Base/XLT = 315 MHz. RFA module is hardware-tuned.', 'Ford_BCM_Security_Bypass_Analysis.txt', CURRENT_TIMESTAMP),
('Warning', 'Ford', 'Transit Connect', 2019, 2022, 'H94 vs H92 Blade Confusion', 'H94 (laser cut) and H92 (edge cut) use same 80-bit chip but different physical profiles. Shells are not interchangeable.', 'Key Cutting', 'Transit Connect = H94 (Global C platform). F-150/Ranger = H92 (Truck platform). Chip is swappable but blade is not.', 'Ford_BCM_Security_Bypass_Analysis.txt', CURRENT_TIMESTAMP),
('Info', 'Ford', 'Mustang Mach-E', 2021, 2025, 'EV High Voltage Safety', 'Disconnect 12V battery before unplugging gateway modules. High voltage system can create persistent DTCs if modules lose power improperly.', 'EV Safety', 'Follow HV disable procedure if accessing high-voltage areas. Always stabilize 12V system before programming.', 'Ford_BCM_Security_Bypass_Analysis.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Ford BCM Security Architecture Complete' AS status,
       (SELECT COUNT(*) FROM ford_pats_generations) AS pats_entries,
       (SELECT COUNT(*) FROM ford_model_security_matrix) AS model_entries,
       (SELECT COUNT(*) FROM ford_gateway_locations) AS gateway_entries;
