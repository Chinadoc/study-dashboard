-- Kia/Hyundai Security Architecture Evolution Integration
-- Source: Kia_Hyundai_Security_Architecture_Update.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Kia/Hyundai Security Epochs
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_security_epochs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    epoch_name TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    key_characteristic TEXT,
    sgw_status TEXT,
    can_fd_required BOOLEAN,
    chip_type TEXT,
    primary_issue TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kiahyundai_security_epochs (epoch_name, year_start, year_end, key_characteristic, sgw_status, can_fd_required, chip_type, primary_issue, description) VALUES
('Legacy Vulnerability Era', 2011, 2021, 'Turn-Key without immobilizer (U.S.)', 'None', 0, 'None (mechanical switch only)', 'USB theft vulnerability ("Kia Boys")', 'Lower-trim vehicles sold in U.S. lacked hardware immobilizers. Ignition could be started with USB-A connector after removing lock cylinder casing.'),
('Campaign 993 Remediation Era', 2021, 2023, 'Virtual Immobilizer via BCM firmware', 'Emerging', 0, 'Hitag 3 (ID47)', 'Dead Fob lockouts', 'Software patch creates "Virtual Immobilizer" - BCM Armed state blocks starter. But relies on RKE signal, not transponder. Dead fob = owner lockout.'),
('SGW Transitional Era', 2018, 2022, 'Secure Gateway firewall', 'Standard', 0, 'Hitag 3 (ID47)', '12+8 physical bypass required', 'Gateway partitions OBD-II from critical networks. Blocks write commands. Physical or digital (AutoAuth) bypass required.'),
('ccNC / CAN FD Modernization', 2023, 2025, 'Connected Car Navigation Cockpit', 'Integrated', 1, 'Hitag AES (ID4A)', 'CAN FD adapter mandatory', 'June 2023 production split. Complete electrical architecture redesign. CAN FD protocol. Legacy tools cannot communicate.');

-- ============================================================================
-- SECTION 2: Campaign 993 / CS920 Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_campaign_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_code TEXT NOT NULL,
    manufacturer TEXT,
    official_name TEXT,
    mechanism TEXT,
    arming_logic TEXT,
    disarming_logic TEXT,
    failure_mode TEXT,
    eligible_models TEXT,
    year_range TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kiahyundai_campaign_reference (campaign_code, manufacturer, official_name, mechanism, arming_logic, disarming_logic, failure_mode, eligible_models, year_range, notes) VALUES
('Campaign 993', 'Hyundai', 'Anti-Theft Software Update', 'BCM firmware update creates "Virtual Immobilizer"', 'BCM enters "Theft Deterrent Armed" state when doors locked via RKE fob', 'ONLY valid "Unlock" signal from RKE fob disarms. Door lock cylinder microswitch is backup.', 'Dead Fob: If fob battery depleted, user cannot disarm. Alarm sounds. Starter blocked. Door microswitch often fails from disuse.', 'Accent 2018-2022, Elantra 2011-2022, Kona 2018-2022, Santa Fe 2013-2022, Sonata 2011-2019, Tucson 2011-2022, Venue 2020-2021, Veloster 2012-2021', '2011-2022 Turn-Key only', 'Push Button Start vehicles are EXEMPT (have transponder). Conflicts with aftermarket remote start systems.'),
('CS920', 'Kia', 'Compustar CS920-S Kit', 'Traditional aftermarket alarm system overlay', 'Shock/glass-break sensors detect intrusion', 'System-specific remote or sensor deactivation', 'Third-party hardware. May require separate maintenance.', 'Base models lacking BCM hardware for Campaign 993', '2011-2022', 'Physically interrupts starter wire. Does NOT integrate with CAN bus like OEM. Flag separately in database.');

-- ============================================================================
-- SECTION 3: SGW Location Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_sgw_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_start INTEGER,
    year_end INTEGER,
    model_hyundai TEXT,
    model_kia TEXT,
    sgw_status TEXT,
    bypass_location TEXT,
    bypass_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kiahyundai_sgw_locations (year_start, year_end, model_hyundai, model_kia, sgw_status, bypass_location, bypass_method, notes) VALUES
(2018, 2019, 'Genesis G90', 'Stinger', 'Early Adopters', 'Behind Audio / Kick Panel', '12+8 Physical Bypass', 'First implementation. May require dash trim removal.'),
(2020, 2021, 'Palisade', 'Telluride', 'Standard', 'Behind Glovebox / Smart Junction Box', '12+8 Physical Bypass or AutoAuth', 'High-volume models. Relatively accessible bypass location.'),
(2021, 2022, 'Elantra (CN7)', 'Sorento (MQ4)', 'Standard', 'Integrated Central Control Unit (ICU)', '12+8 or AutoAuth', 'SGW integrated into ICU. Physical bypass more complex.'),
(2022, 2023, 'Ioniq 5', 'EV6', 'Standard', 'Lower Driver Dash / ICU', 'AutoAuth preferred', 'EV platforms with integrated gateway.'),
(2024, 2025, 'Kona (ccNC)', 'EV9 / Sorento (ccNC)', 'Integrated (ccNC)', 'Increasingly inaccessible', 'Digital ONLY (AutoAuth)', 'Physical bypass no longer feasible on ccNC platforms. Digital authentication mandatory.');

-- ============================================================================
-- SECTION 4: Kia/Hyundai FCC ID and Key Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_key_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_family TEXT NOT NULL,
    year_range TEXT,
    fcc_id TEXT NOT NULL,
    part_number TEXT,
    chip_type TEXT,
    frequency_mhz INTEGER,
    architecture TEXT,
    compatibility_group TEXT, -- Group 1: 4F24 (Kia), Group 2: 4F27 (Hyundai), Group 3: AES NextGen
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kiahyundai_key_matrix (model_family, year_range, fcc_id, part_number, chip_type, frequency_mhz, architecture, compatibility_group, notes) VALUES
-- Legacy Hitag 3 Keys
('Kia Telluride', '2020-2022', 'TQ8-FOB-4F24', '95440-S9000', 'Hitag 3 (ID47)', 433, 'SGW_Hitag3', 'Group 1 (Kia ID47)', 'Legacy architecture. INCOMPATIBLE with Palisade despite similar appearance.'),
('Kia Telluride', '2023+', 'TQ8-FOB-4F71', '95440-S9510', 'Hitag 3 (ID47)', 433, 'SGW_Hitag3', 'Group 1 (Kia ID47)', 'Facelift model. New FCC ID from 4F24.'),
('Hyundai Palisade', '2022-2024', 'TQ8-FOB-4F27', '95440-S8550', 'Hitag 3 (ID47)', 433, 'SGW_Hitag3', 'Group 2 (Hyundai ID47)', 'Transitional SGW. CANNOT use 4F24 keys despite same chip family.'),

-- CAN FD / AES NextGen Keys
('Kia Carnival', '2022-2024', 'SY5KA4FGE07', '95440-R0420', 'Hitag AES (ID4A)', 434, 'SGW_AES', 'Group 3 (AES NextGen)', '7-button layout for sliding doors. Unique to minivan platform.'),
('Kia Sorento', '2024+ (ccNC)', 'TQ8-FOB-4F81M44', '95440-P2AA0', 'Hitag AES (ID4A)', 433, 'SGW_AES_FD', 'Group 3 (AES NextGen)', 'CAN FD EXCLUSIVE. Requires new programmer hardware.'),
('Hyundai Kona', '2024+ (ccNC)', 'TQ8-FOB-4F61M43', '95440-BE200', 'Hitag AES (ID4A)', 434, 'SGW_AES_FD', 'Group 3 (AES NextGen)', 'CAN FD EXCLUSIVE. New standard for Hyundai compacts.'),
('Hyundai Elantra', '2024 (Flip Key)', 'NYOMBEC4TX2004', '95430-AA600', 'Texas 8A (H)', 434, 'SGW_8A', 'Group 4 (8A Non-Prox)', 'Flip Key (Non-Prox). Uses 8A chip, NOT 4A.');

-- ============================================================================
-- SECTION 5: Diagnostic Protocol Decision Tree
-- ============================================================================
CREATE TABLE IF NOT EXISTS kiahyundai_diagnostic_protocol (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario TEXT NOT NULL,
    year_range TEXT,
    architecture TEXT,
    vci_required TEXT,
    sgw_handling TEXT,
    can_fd_adapter BOOLEAN,
    special_checks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO kiahyundai_diagnostic_protocol (scenario, year_range, architecture, vci_required, sgw_handling, can_fd_adapter, special_checks) VALUES
('2024+ ccNC Model (Kona, Santa Fe, EV9)', '2024+', 'SGW_AES_FD', 'CAN FD VCI MANDATORY (VCI-III)', 'Digital ONLY (AutoAuth)', 1, 'No physical bypass available. Must have AutoAuth subscription.'),
('2018-2023 SGW Model', '2018-2023', 'SGW_Hitag3', 'Standard VCI sufficient', '12+8 Physical Bypass or AutoAuth', 0, 'Locate SGW module. Bypass if AutoAuth unavailable.'),
('Pre-2022 Turn-Key (Campaign 993)', 'Pre-2022', 'Legacy', 'Standard VCI', 'N/A', 0, 'Check Campaign 993 status. If applied, BCM may be in Virtual Immobilizer mode. Prioritize alarm state in No Start diagnosis.');

-- ============================================================================
-- SECTION 6: Update vehicles_master
-- ============================================================================
UPDATE vehicles_master SET
    security_system = 'Kia/Hyundai Campaign 993 (Virtual Immobilizer)',
    special_notes = 'CHECK CAMPAIGN 993 STATUS. BCM "Armed" = Starter blocked. Dead Fob = Owner lockout. Prioritize alarm state in No Start diagnosis.'
WHERE make IN ('Kia', 'Hyundai') AND year_start >= 2011 AND year_start <= 2022
AND model IN ('Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Accent', 'Venue', 'Veloster');

UPDATE vehicles_master SET
    security_system = 'Kia/Hyundai SGW (Hitag 3)',
    sgw_present = 1,
    special_notes = 'SGW blocks write commands. 12+8 physical bypass or AutoAuth required. TQ8-FOB-4F24 (Kia) vs 4F27 (Hyundai) NOT interchangeable.'
WHERE make IN ('Kia', 'Hyundai') AND year_start >= 2020 AND year_start <= 2023
AND model IN ('Telluride', 'Palisade', 'Sorento', 'Sportage', 'Tucson', 'Santa Fe', 'Elantra');

UPDATE vehicles_master SET
    security_system = 'Kia/Hyundai ccNC + CAN FD (Hitag AES)',
    sgw_present = 1,
    can_fd_required = 1,
    akl_difficulty = 'High',
    special_notes = 'ccNC ARCHITECTURE - CAN FD Adapter MANDATORY. June 2023 production split. Legacy tools CANNOT communicate. Hitag AES (ID4A) encryption.'
WHERE make IN ('Kia', 'Hyundai') AND year_start >= 2024
AND model IN ('Kona', 'Santa Fe', 'Sorento', 'Sonata', 'EV9', 'EV6', 'Ioniq 6');

-- ============================================================================
-- SECTION 7: Locksmith Alerts for Kia/Hyundai
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Kia/Hyundai', 'All ccNC 2024+', 2024, 2025, 'June 2023 Production Split = CAN FD Mandatory', 'Post-June 2023 ccNC architecture uses CAN FD protocol. Legacy VCIs with Classic CAN CANNOT communicate. Tool shows connectivity but fails to decode.', 'All Diagnostics', 'CAN FD Adapter (VCI-III or equivalent) MANDATORY. No software workaround - hardware transceiver limitation.', 'Kia_Hyundai_Security_Architecture_Update.txt', CURRENT_TIMESTAMP),
('Critical', 'Kia/Hyundai', 'Turn-Key 2011-2022', 2011, 2022, 'Dead Fob = Owner Lockout (Campaign 993)', 'After Campaign 993 update, Virtual Immobilizer arms when doors locked via RKE. Dead fob = BCM still armed = Starter blocked. Physical key unlocks door but triggers alarm.', 'Emergency Start', 'Wait for alarm timeout. Check door lock cylinder microswitch (often fails from disuse). May require tow if microswitch dead.', 'Kia_Hyundai_Security_Architecture_Update.txt', CURRENT_TIMESTAMP),
('Warning', 'Kia', 'Telluride', 2020, 2022, 'TQ8-FOB-4F24 INCOMPATIBLE with Palisade 4F27', '4F24 (Kia) and 4F27 (Hyundai) look identical but have different manufacturer codes in IC. BCM rejects during key learning.', 'Key Ordering', 'Verify FCC ID before ordering. Kia = 4F24. Hyundai = 4F27. Cannot cross-program.', 'Kia_Hyundai_Security_Architecture_Update.txt', CURRENT_TIMESTAMP),
('Warning', 'Kia', 'Carnival', 2022, 2024, '7-Button Fob (SY5KA4FGE07) is Platform-Specific', 'Carnival uses unique 7-button layout for sliding doors and hatch. Button topology hardcoded in firmware.', 'Key Ordering', 'Do NOT substitute standard 4-button fobs. Must use platform-specific SY5KA4FGE07.', 'Kia_Hyundai_Security_Architecture_Update.txt', CURRENT_TIMESTAMP),
('Warning', 'Kia/Hyundai', 'All SGW Models', 2018, 2023, '12+8 Bypass Still Critical Fallback', 'While AutoAuth has reduced need for physical bypass, it remains critical when: vehicle has no power, SGW faulty, or internet unavailable.', 'Key Programming', 'Keep 12+8 bypass cables in inventory. Do not rely solely on AutoAuth for SGW-era vehicles.', 'Kia_Hyundai_Security_Architecture_Update.txt', CURRENT_TIMESTAMP),
('Info', 'Kia/Hyundai', 'Turn-Key 2011-2022', 2011, 2022, 'Campaign 993 Conflicts with Aftermarket Remote Start', 'Virtual Immobilizer (armed when locked) directly conflicts with remote starters (which start while locked). Often must disable remote start to apply security patch.', 'Pre-Service Advisory', 'Advise owners: applying security update may require removal of aftermarket remote start system.', 'Kia_Hyundai_Security_Architecture_Update.txt', CURRENT_TIMESTAMP),
('Info', 'Kia/Hyundai', 'All Models', 2019, 2025, 'Era of "Universal" Key is Ending', 'Proliferation of specific FCC IDs (4F24 vs 4F27, 4F61 vs 4F81) with distinct manufacturer codes defeats universal remotes.', 'Parts Inventory', 'Move from visual identification to VIN-based part number verification. Keys with same appearance may be logically incompatible.', 'Kia_Hyundai_Security_Architecture_Update.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Kia/Hyundai Security Migration Complete' AS status,
       (SELECT COUNT(*) FROM kiahyundai_security_epochs) AS epoch_entries,
       (SELECT COUNT(*) FROM kiahyundai_campaign_reference) AS campaign_entries,
       (SELECT COUNT(*) FROM kiahyundai_sgw_locations) AS sgw_entries,
       (SELECT COUNT(*) FROM kiahyundai_key_matrix) AS key_matrix_entries;
