-- JLR (Jaguar Land Rover) Security Architecture Integration
-- Source: JLR_Security_Architecture_Deep_Dive.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: JLR Platform Architecture Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS jlr_platform_architecture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_code TEXT NOT NULL,
    platform_name TEXT,
    vehicle_types TEXT,
    year_range TEXT,
    network_type TEXT,
    security_gateway TEXT,
    immo_generation TEXT,
    rfa_module_types TEXT,
    bcm_location TEXT,
    server_dependency TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jlr_platform_architecture (platform_code, platform_name, vehicle_types, year_range, network_type, security_gateway, immo_generation, rfa_module_types, bcm_location, server_dependency, special_notes) VALUES
('D7u', 'D7 Utility (PLA)', 'Range Rover L405, Range Rover Sport L494, Discovery 5 L462', '2012-2021', 'CAN Bus', 'Basic Gateway', 'Gen 3 (pre-2018) / Gen 4 (2018+)', 'FK72/HPLA (pre-2018), JPLA (2018+)', 'Behind glovebox or passenger footwell (CJB)', 'Offline (pre-2018), Server "Verify" (2018+)', 'Testbed for JPLA introduction. Write-Once RFA logic on 2018+.'),
('D7a', 'D7 Advanced (iQ[Al])', 'Jaguar XE X760, XF X260, F-Pace X761, Range Rover Velar L560', '2015-2025', 'CAN Bus / DoIP hybrid', 'Silent Alarm (2019+)', 'Gen 3/4', 'JPLA', 'Similar to D7u', 'Server "Verify" (2018+)', 'Silent Alarm blocks OBD if vehicle locked and armed. Star Connector access needed.'),
('D7x', 'D7 Extreme (EVA 2.0)', 'Land Rover Defender L663', '2020-2025', 'DoIP Ethernet + CAN FD', 'Secure Gateway (SGW) - encrypted', 'Gen 4 (K8D2)', 'K8D2', 'Complex location', 'TOPIx Cloud mandatory', 'Most difficult D7 variant. SGW requires server auth for all security operations. Encrypted challenge-response.'),
('D7e', 'D7 Electric', 'Jaguar I-PACE', '2018-2025', 'CAN Bus + HV interface', 'Basic Gateway + HV integration', 'Gen 4 (JPLA)', 'JPLA', 'Passenger footwell', 'Server "Verify"', 'HIGH VOLTAGE SAFETY CRITICAL. 12V instability = HV contactor desync. Maintain 13.5V+.'),
('MLA', 'Modular Longitudinal Architecture (MLA-Flex)', 'Range Rover L460, Range Rover Sport L461', '2022-2025', 'DoIP Ethernet (fully encrypted)', 'Domain Controller Architecture', 'Gen 5 (L8B2)', 'L8B2', 'Body Domain Controller', 'TOPIx Cloud MANDATORY - no offline possible', 'Clean sheet design. Traditional CAN injection attacks ineffective. Rolling cryptographic challenge requires JLR server signature.'),
('PTA', 'Premium Transverse Architecture', 'Range Rover Evoque L551, Discovery Sport L550', '2019-2025', 'CAN Bus hybrid', 'Mixed legacy/modern', 'Gen 3/4 hybrid', 'JPLA/K8D2', 'Similar to D8 legacy', 'Server "Verify"', 'HYBRID RISK: New RFA modules but legacy BCM vulnerabilities. High BCM corruption risk.');

-- ============================================================================
-- SECTION 2: JLR Immobilizer Generations
-- ============================================================================
CREATE TABLE IF NOT EXISTS jlr_immo_generations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generation TEXT NOT NULL,
    year_range TEXT,
    rfa_modules TEXT,
    chip_type TEXT,
    kvm_status TEXT,
    key_limit TEXT,
    programming_method TEXT,
    aftermarket_support TEXT,
    brick_risk TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jlr_immo_generations (generation, year_range, rfa_modules, chip_type, kvm_status, key_limit, programming_method, aftermarket_support, brick_risk, description) VALUES
('IMMO 3 (Legacy)', '2010-2017', 'DPLA, FK72, HPLA', 'Hitag Pro (ID49)', 'Open (until locked by dealer update)', '8 keys', 'OBD-II standard', 'Full support (Autel, Lonsdor, etc.)', 'Low', 'Legacy standard. OBD programming without module removal IF not locked by post-2018 dealer updates.'),
('IMMO 3 (Locked)', '2010-2017 (post-update)', 'FK72, HPLA (MCU locked)', 'Hitag Pro (ID49)', 'MCU Secure Status = LOCKED', '8 keys', 'Bench programming ONLY', 'Requires EEPROM read (desolder MCU)', 'Medium', 'Dealer software retroactively locked MCU. Rejects all OBD read/write. Must desolder NXP chip and read EEPROM directly.'),
('IMMO 4 (JPLA)', '2018-2020', 'JPLA', 'Hitag Pro (ID49)', 'Write-Once (Two-Key Limit)', '2 keys MAX', 'OBD if alarm off, else bench', 'Possible via renewal/flash (Lonsdor, Autel XP400)', 'High', 'STRICT TWO-KEY LIMIT. Once 2 keys written, module is locked. AKL requires RFA replacement or "renewal" flash (risky).'),
('IMMO 4 (K8D2)', '2020-2025', 'K8D2', 'NXP / Hitag Pro', 'Write-Once (enhanced encryption)', '2 keys MAX', 'Bench or specialized CAN bypass', 'Limited (Lock50, ACDP)', 'EXTREME', 'Voltage sensitivity CRITICAL. Below 13.0V during programming = permanent MCU corruption. Desoldering required for bench read.'),
('IMMO 5 (L8B2)', '2022-2025', 'L8B2', 'NXP (advanced)', 'Server-signed only', 'Unknown', 'TOPIx Cloud ONLY', 'NONE (dealer only)', 'EXTREME', 'Bleeding edge. Aftermarket support non-existent. Server-side authorization mandatory. 2025 cyberattack caused global programming blackout.');

-- ============================================================================
-- SECTION 3: JLR Model Security Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS jlr_model_security_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    chassis_code TEXT,
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT,
    immo_generation TEXT,
    fcc_id TEXT,
    part_number TEXT,
    chip_type TEXT,
    dealer_only BOOLEAN,
    akl_difficulty INTEGER,
    rfa_location TEXT,
    bcm_brick_risk TEXT,
    uwb_equipped BOOLEAN,
    critical_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jlr_model_security_matrix (make, model, chassis_code, year_start, year_end, platform, immo_generation, fcc_id, part_number, chip_type, dealer_only, akl_difficulty, rfa_location, bcm_brick_risk, uwb_equipped, critical_notes) VALUES
-- Land Rover
('Land Rover', 'Range Rover', 'L405', 2018, 2021, 'D7u', 'Gen 4 (JPLA)', 'KOBJTF10A', 'HK83-15K601-AB', 'Hitag Pro (ID49)', 0, 8, 'Passenger footwell', 'Medium', 1, 'RFA is Write-Once. Verify UWB status. Silent Alarm may block OBD.'),
('Land Rover', 'Range Rover', 'L460', 2022, 2025, 'MLA', 'Gen 5 (L8B2)', 'TBD (New Style)', 'TBD', 'NXP', 1, 10, 'Body Domain Controller', 'Low', 1, 'SERVER-SIDE AUTH MANDATORY. NO OBD aftermarket bypass. TOPIx Cloud required.'),
('Land Rover', 'Range Rover Sport', 'L494', 2016, 2017, 'D7u', 'Gen 3 (FK72)', 'KOBJTF10A', 'CH22-15K601-AB', 'Hitag Pro (ID49)', 0, 5, 'Behind glovebox', 'HIGH', 0, 'HIGH BCM BRICK RISK during programming. Use stable 13.8V power.'),
('Land Rover', 'Range Rover Sport', 'L494', 2018, 2022, 'D7u', 'Gen 4 (JPLA)', 'KOBJTF10A', 'HK83-15K601-AB', 'Hitag Pro (ID49)', 0, 8, 'Behind glovebox', 'Medium', 1, 'Write-Once RFA. Check UWB.'),
('Land Rover', 'Range Rover Sport', 'L461', 2023, 2025, 'MLA', 'Gen 5 (L8B2)', 'TBD', 'TBD', 'NXP', 1, 10, 'Body Domain Controller', 'Low', 1, 'Server-side auth mandatory.'),
('Land Rover', 'Defender', 'L663', 2020, 2025, 'D7x', 'Gen 4 (K8D2)', 'KOBJTF10A', 'K8D2-xxx', 'NXP / Hitag Pro', 1, 10, 'Complex - cargo area', 'EXTREME', 1, 'MOST DIFFICULT. Alarm active = complete OBD block. K8D2 voltage sensitivity. Official AKL = RFA + BCM replacement ($3000+).'),
('Land Rover', 'Discovery 5', 'L462', 2017, 2020, 'D7u', 'Gen 4 (JPLA)', 'KOBJTF10A', 'HK83-15K601-AB', 'Hitag Pro (ID49)', 0, 7, 'Cargo area near RFA', 'Medium', 0, 'Star Connector access for SGW bypass.'),
('Land Rover', 'Discovery Sport', 'L550', 2015, 2019, 'PTA/D8', 'Gen 3/4 hybrid', 'KOBJTF10A', 'CH22/HK83', 'Hitag Pro (ID49)', 0, 6, 'Passenger footwell', 'HIGH', 0, 'HIGH BCM BRICK RISK. Legacy BCM with new RFA = dangerous combination.'),
('Land Rover', 'Range Rover Evoque', 'L538', 2015, 2019, 'D8', 'Gen 3', 'KOBJTF10A', 'CH22-xxx', 'Hitag Pro (ID49)', 0, 5, 'Passenger footwell', 'HIGH', 0, 'HIGH BCM BRICK RISK. Known hardware defect during key sync.'),
('Land Rover', 'Range Rover Evoque', 'L551', 2020, 2025, 'PTA', 'Gen 4 (JPLA)', 'KOBJTF10A', 'HK83-xxx', 'Hitag Pro (ID49)', 0, 7, 'Passenger footwell', 'Medium', 0, 'Hybrid architecture. Write-Once RFA.'),
('Land Rover', 'Range Rover Velar', 'L560', 2017, 2025, 'D7a', 'Gen 4 (JPLA)', 'KOBJTF10A', 'HK83-15K601-AB', 'Hitag Pro (ID49)', 0, 7, 'Behind glovebox', 'Medium', 0, 'Silent Alarm (2019+). Star Connector bypass.'),

-- Jaguar
('Jaguar', 'F-Pace', 'X761', 2017, 2020, 'D7a', 'Gen 4 (JPLA)', 'KOBJTF10A', 'HK83-15K601-AB', 'Hitag Pro (ID49)', 0, 7, 'Behind glovebox', 'Medium', 1, 'Watch for UWB variants. DoIP required.'),
('Jaguar', 'F-Pace', 'X761', 2021, 2025, 'D7a', 'Gen 4 (JPLA/K8D2)', 'KOBJTF10A', 'HK83-xxx', 'Hitag Pro (ID49)', 0, 8, 'Behind glovebox', 'Medium', 1, 'Updated electronics. UWB common.'),
('Jaguar', 'I-PACE', '-', 2018, 2025, 'D7e', 'Gen 4 (JPLA)', 'KOBJTF10A', 'HK83-15K601-AB', 'Hitag Pro (ID49)', 0, 8, 'Passenger footwell', 'HIGH (HV desync)', 1, 'EV HIGH VOLTAGE DANGER. 12V instability = HV contactor desync. Maintain 13.5V+ mandatory.'),
('Jaguar', 'XE', 'X760', 2015, 2020, 'D7a', 'Gen 3/4', 'KOBJTF10A', 'HK83-xxx', 'Hitag Pro (ID49)', 0, 6, 'Behind glovebox', 'Medium', 0, 'Silent Alarm on 2019+.'),
('Jaguar', 'XF', 'X260', 2016, 2025, 'D7a', 'Gen 3/4', 'KOBJTF10A', 'HK83-xxx', 'Hitag Pro (ID49)', 0, 6, 'Behind glovebox', 'Medium', 0, 'Standard D7a architecture.');

-- ============================================================================
-- SECTION 4: JLR Key Hardware Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS jlr_key_hardware_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL,
    part_number TEXT,
    description TEXT,
    platform_compatibility TEXT,
    frequency_na_mhz INTEGER,
    frequency_eu_mhz INTEGER,
    uwb_equipped BOOLEAN,
    button_count INTEGER,
    emergency_blade TEXT,
    compatibility_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jlr_key_hardware_reference (fcc_id, part_number, description, platform_compatibility, frequency_na_mhz, frequency_eu_mhz, uwb_equipped, button_count, emergency_blade, compatibility_notes) VALUES
('KOBJTF10A', 'CH22-15K601-AB', 'Pebble 5-button (Legacy)', 'D7u 2012-2017 (L405, L494)', 315, 433, 0, 5, 'HU101', 'Legacy part number. NOT compatible with HK83 vehicles despite same FCC ID.'),
('KOBJTF10A', 'HK83-15K601-AB', 'Pebble 5-button (Modern)', 'D7u/D7a 2017+ (Discovery 5, Velar, F-Pace)', 315, 433, 0, 5, 'HU101', 'Modern variant. NOT compatible with CH22 vehicles. Check part number, not just FCC ID.'),
('KOBJTF10A', 'J9C3-xxx', 'Pebble 5-button (UWB)', 'D7u/D7x 2019+ (High-spec)', 315, 433, 1, 5, 'HU101', 'Ultra-Wideband (Secure Tracker Pro). Remote works but Push-to-Start fails if UWB mismatch.'),
('KOBJTF10A', 'K8D2-xxx', 'Pebble 5-button (K8D2)', 'D7x (Defender L663)', 315, 433, 1, 5, 'HU101', 'Defender-specific. Fastest NXP MCU. Extreme voltage sensitivity.');

-- ============================================================================
-- SECTION 5: JLR Server Authorization Phases
-- ============================================================================
CREATE TABLE IF NOT EXISTS jlr_server_auth_phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase INTEGER NOT NULL,
    year_introduced INTEGER,
    description TEXT,
    affected_platforms TEXT,
    offline_capability TEXT,
    consequence_if_offline TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jlr_server_auth_phases (phase, year_introduced, description, affected_platforms, offline_capability, consequence_if_offline) VALUES
(1, 2018, 'Server "Verify" step introduced (Pathfinder)', 'D7u, D7a 2018+', 'Some offline caching allowed', 'May work with cached data for limited time'),
(2, 2020, 'TOPIx Cloud integration mandatory', 'D7x (Defender L663)', 'No offline caching', 'Programming fails completely without internet'),
(3, 2022, 'Full server dependency (rolling cryptographic challenge)', 'MLA (L460, L461)', 'NONE - server signature required', 'NO key programming possible. 2025 cyberattack = global 5-week blackout.');

-- ============================================================================
-- SECTION 6: JLR VIN Decoding Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS jlr_vin_decoder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wmi_prefix TEXT NOT NULL,
    brand TEXT,
    vehicle_type TEXT,
    manufacturing_location TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jlr_vin_decoder (wmi_prefix, brand, vehicle_type, manufacturing_location, notes) VALUES
('SAL', 'Land Rover', 'All models', 'United Kingdom (Solihull/Slovakia)', 'Standard WMI for most Land Rovers worldwide.'),
('SAD', 'Jaguar', 'SUVs (F-Pace, E-Pace, I-Pace)', 'United Kingdom', 'Jaguar SUV identifier. BCM/RFA in different locations vs Land Rover.'),
('SAJ', 'Jaguar', 'Sedans/Coupes (XE, XF, F-Type)', 'United Kingdom', 'Jaguar sedan identifier.'),
('L2C', 'Land Rover', 'China-spec models', 'China (Changshu JV)', 'Different BCM firmware versions. Tool compatibility may vary.');

-- ============================================================================
-- SECTION 7: Update vehicles_master and locksmith_alerts
-- ============================================================================
UPDATE vehicles_master SET
    security_system = 'JLR IMMO 4 (JPLA)',
    akl_difficulty = 'High',
    special_notes = 'Write-Once RFA (2 key limit). Check UWB status. Silent Alarm may block OBD on 2019+. Star Connector bypass for SGW.'
WHERE make IN ('Land Rover', 'Jaguar') AND year_start >= 2018 AND year_start <= 2021;

UPDATE vehicles_master SET
    security_system = 'JLR IMMO 5 (L8B2)',
    akl_difficulty = 'Severe',
    special_notes = 'SERVER-SIDE AUTH MANDATORY. TOPIx Cloud required. NO aftermarket OBD bypass. Dealer only.'
WHERE make IN ('Land Rover', 'Jaguar') AND model IN ('Range Rover', 'Range Rover Sport') AND year_start >= 2022;

UPDATE vehicles_master SET
    security_system = 'JLR IMMO 4 (K8D2)',
    akl_difficulty = 'Severe',
    special_notes = 'Defender L663. Alarm active = complete OBD block. K8D2 voltage sensitivity CRITICAL. Official AKL = RFA + BCM replacement.'
WHERE make = 'Land Rover' AND model = 'Defender' AND year_start >= 2020;

INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Land Rover', 'Defender', 2020, 2025, 'K8D2 RFA = Extreme Voltage Sensitivity', 'Programming with battery below 13.0V can permanently corrupt K8D2 MCU flash memory, bricking the RFA module.', 'All Keys Lost', 'MANDATORY: Use high-quality battery support unit maintaining 13.5V+ during ALL K8D2 operations. No exceptions.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Critical', 'Land Rover', 'Range Rover L460', 2022, 2025, 'MLA Platform = Server-Side Auth MANDATORY', 'The L460 requires cryptographic token from JLR servers before any key learning. Offline programming is impossible.', 'All Keys Lost', 'Use official TOPIx Cloud system with valid security professional login. NO aftermarket OBD bypass exists. 2025 cyberattack caused global 5-week blackout.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Critical', 'Land Rover', 'Discovery Sport', 2015, 2019, 'HIGH BCM BRICK RISK During Programming', 'Known hardware defect causes BCM to fail during key synchronization. BCM may not exit Bootloader mode = complete vehicle unresponsive.', 'All Keys Lost', 'CRITICAL: Use stable 13.8V power. Read BCM EEPROM on bench BEFORE OBD programming. Avoid OBD if alarm state unknown.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Critical', 'Land Rover', 'Range Rover Evoque L538', 2015, 2019, 'HIGH BCM BRICK RISK During Programming', 'Same BCM defect as Discovery Sport. Corruption during key sync = no ignition, no cluster, no central locking.', 'All Keys Lost', 'Back up BCM D-Flash on bench before OBD attempt. Maintain pristine power supply (13.8V stable).', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Critical', 'Jaguar', 'I-PACE', 2018, 2025, 'EV High Voltage Contactor Desync Risk', 'Low 12V auxiliary battery causes HV contactors to desynchronize from BCM. Vehicle recognizes key, turns on infotainment, but "Ready" mode (drive) fails.', 'All Operations', 'MANDATORY: High-amperage battery support unit (13.5V+ stable) during ALL I-PACE diagnostic sessions. This is HV safety critical.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Land Rover', 'All 2018+', 2018, 2025, 'Silent Alarm Blocks OBD Communication', 'On D7a vehicles (2019+), if vehicle is locked and armed, Gateway blocks all security-related OBD diagnostic requests.', 'All Keys Lost', 'Disarm alarm first. Options: Pull RFA/KVM fuses, use Lock50 emulator tool, or access Star Connector directly to bypass OBD firewall.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Land Rover', 'All JPLA Models', 2018, 2021, 'Write-Once RFA = Two Key Limit', 'JPLA module accepts only 2 active key IDs. Once slots are full, no additional keys can be programmed without RFA replacement or risky "renewal" flash.', 'Add Key / AKL', 'AKL requires virgin RFA replacement ($$$) OR aftermarket "renewal" flash (Lonsdor K518, Autel XP400). Renewal carries corruption risk.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Jaguar', 'All Models', 2018, 2025, 'CH22 vs HK83 Key Part Numbers NOT Interchangeable', 'Despite sharing FCC ID KOBJTF10A, CH22 and HK83 keys are electronically incompatible. Wrong part = tool reports success but key fails.', 'Key Ordering', 'Always verify part number: CH22 = 2012-2017, HK83 = 2017+. Also check UWB status (J9C3/K8D2 prefixes).', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Warning', 'Land Rover', 'All UWB Models', 2019, 2025, 'Non-UWB Key on UWB Vehicle = Push-to-Start Fails', 'Standard PEPS key on UWB-equipped vehicle: Remote lock/unlock works (RF), but Push-to-Start fails because no Time-of-Flight confirmation.', 'Key Ordering', 'Check for "Secure Tracker Pro" package. UWB keys identified by J9C3/K8D2 part prefixes. Match UWB to UWB.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Info', 'Land Rover', 'All Models', 2010, 2025, 'Emergency Blade = HU101 Universal', 'HU101 laser-cut blade is standard for ALL modern JLR vehicles including Defender L663 and Range Rover L460. HU109 is obsolete (P38 era).', 'Key Cutting', 'Stock HU101 blanks only. Ignore HU109 listings in aftermarket catalogs for 2010+ vehicles.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP),
('Info', 'Land Rover', 'All Models', 2018, 2025, 'InControl "Claimed Vehicle" = Theft Alert Risk', 'If vehicle is claimed in owner InControl Cloud and Service Mode not activated, Gateway broadcasts theft alert on unauthorized "Add Key" attempt.', 'Customer Communication', 'Request customer to enter "Service Mode" via InControl app before programming. Or physically isolate Telematics unit.', 'JLR_Security_Architecture_Deep_Dive.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'JLR Security Architecture Complete' AS status,
       (SELECT COUNT(*) FROM jlr_platform_architecture) AS platform_entries,
       (SELECT COUNT(*) FROM jlr_immo_generations) AS immo_entries,
       (SELECT COUNT(*) FROM jlr_model_security_matrix) AS model_entries,
       (SELECT COUNT(*) FROM jlr_key_hardware_reference) AS key_entries;
