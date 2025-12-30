-- Stellantis RF Hub & Fobik Security Architecture Integration
-- Source: Stellantis_RF_Hub_&_Fobik_Programming.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Stellantis Security Architecture Eras
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_security_eras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    era_name TEXT NOT NULL,
    year_range TEXT,
    architecture TEXT,
    security_module TEXT,
    obd_access TEXT,
    key_programming TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stellantis_security_eras (era_name, year_range, architecture, security_module, obd_access, key_programming, description) VALUES
('Open Architecture Era', 'Pre-2018', 'Standard CAN bus', 'WIN (Wireless Ignition Node)', 'Full read/write access via OBD-II', 'Standard PIN code + OBD programming', 'Accessible architecture. Technician could program keys with 4-digit PIN. Relatively simple.'),
('Secure Vehicle Architecture (SVA)', '2018-2020', 'CAN bus + Security Gateway (SGW)', 'WIN / RF Hub', 'Read-only unless authorized', 'SGW bypass required for write access', 'SGW firewalls private networks. AutoAuth or physical 12+8 bypass needed.'),
('RF Hub Lockdown Era', '2021-2025', 'CAN bus + SGW + RF Hub firmware lock', 'RF Hub (RFHM)', 'Read-only + write-protected RF Hub', 'RF Hub replacement required for AKL on locked models', 'RF Hub firmware disables key programming routines. "Write-Once" component. High-value targets locked.');

-- ============================================================================
-- SECTION 2: RF Hub Status Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_rf_hub_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status_type TEXT NOT NULL,
    year_range TEXT,
    mechanism TEXT,
    affected_models TEXT,
    akl_procedure TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stellantis_rf_hub_status (status_type, year_range, mechanism, affected_models, akl_procedure, notes) VALUES
('VIN Lock (Pre-2021)', '2013-2020', 'RF Hub writes VIN to EEPROM on first power-up. Locked to that vehicle.', 'Most FCA vehicles', 'Standard: SGW bypass + PIN code + OBD programming', 'Cannot move to different vehicle. Can still program new keys via OBD.'),
('VIN Lock (Standard 2021+)', '2021-2025', 'Same VIN lock mechanism', 'Non-performance 2021+ models', 'Standard: SGW bypass + PIN code + OBD programming', 'Still OBD programmable unless Lockdown firmware applied.'),
('Lockdown (Write-Protected)', '2021-2025', 'Firmware update disables UDS 0x27 (Security Access) for key programming', 'Hellcat, Scat Pack, TRX (TSB 08-086-22)', 'RF Hub REPLACEMENT required. Cannot program keys via OBD.', 'Anti-theft measure. Dealer firmware flash. Module is effectively read-only for key IDs.');

-- ============================================================================
-- SECTION 3: Security Gateway Location Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_sgw_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_range TEXT,
    sgw_location TEXT,
    connector_type TEXT,
    access_difficulty TEXT,
    bypass_method TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stellantis_sgw_locations (make, model, year_range, sgw_location, connector_type, access_difficulty, bypass_method, notes) VALUES
('Ram', '1500 Classic (DS)', '2018-2024', 'Behind Radio Head Unit', '12+8 pin', 'High', 'Remove center stack bezel and radio unit', 'Dash disassembly required. Time-consuming.'),
('Ram', '1500 New Body (DT)', '2019-2025', 'Driver Footwell', '12+8 pin', 'Medium', 'Access above accelerator pedal or left of steering column', 'Tight fit but no major disassembly. Contortion required.'),
('Ram', '2500/3500 HD', '2019-2025', 'Behind Instrument Cluster', '12+8 pin', 'High', 'Remove cluster bezel and cluster', 'Often requires cluster removal. Time-consuming.'),
('Jeep', 'Grand Cherokee (WK2)', '2018-2021', 'Behind Glovebox / Kick Panel', '12+8 pin', 'Low', 'Drop glovebox or remove felt cover', 'Relatively accessible. Near BCM location.'),
('Jeep', 'Grand Cherokee (WL)', '2021-2025', 'Driver Knee Bolster', '12+8 pin', 'Medium', 'Remove knee bolster panel', 'Often stacked near BCM. Panel removal required.'),
('Jeep', 'Wrangler (JL) / Gladiator (JT)', '2018-2025', 'Under Driver Dash', '12+8 pin', 'Medium', 'Access adjacent to OBD port (tucked higher)', 'Cable length is often the challenge. Tight connectors.'),
('Dodge', 'Charger / Challenger', '2018-2023', 'Above Kick Panel / Star Connector', '12+8 pin', 'Low', 'Use Star Connector bypass (preferred)', 'Star Connector is CAN junction block. Back-probe or adapter avoids SGW unplug.'),
('Dodge', 'Durango', '2018-2024', 'Passenger Kick Panel Area', '12+8 pin', 'Low', 'Remove lower hush panel or kick panel', 'Generally accessible.');

-- ============================================================================
-- SECTION 4: Fobik/Smart Key Evolution Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_fobik_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    platform TEXT,
    year_range TEXT,
    fcc_id TEXT NOT NULL,
    chip_type TEXT,
    frequency_mhz INTEGER,
    key_style TEXT,
    keyway TEXT,
    compatible_with TEXT,
    incompatible_with TEXT,
    critical_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stellantis_fobik_matrix (make, model, platform, year_range, fcc_id, chip_type, frequency_mhz, key_style, keyway, compatible_with, incompatible_with, critical_notes) VALUES
-- Ram Trucks
('Ram', '1500 Classic / 2500/3500 Legacy', 'DS', '2013-2024', 'GQ4-53T', 'ID46 (Philips PCF7961/7945)', 433, 'Teardrop Fobik (Tip Start)', 'Y159', 'All DS platform trucks', 'DT platform (OHT-4882056)', 'Older encryption standard. Works on 2019-2024 Classic but NOT new body 1500.'),
('Ram', '1500 New Body', 'DT', '2019-2025', 'OHT-4882056', 'Hitag AES (4A) PCF7939M', 433, 'Shield/Coffin Smart Key', 'Y159', 'DT platform 1500 only', 'DS platform, HD trucks', '128-bit AES encryption. Premium finish. Metal sides on higher trims.'),
('Ram', '2500/3500 HD', 'HD', '2019-2025', 'GQ4-76T', 'Hitag AES (4A)', 433, 'Shield/Coffin Smart Key', 'Y159', 'HD trucks 2019+', 'DS Classic, DT 1500', 'THE HD TRAP: Looks identical to OHT-4882056 but transmits different remote codes. Programming 1500 key to 2500 = dead buttons.'),

-- Jeep
('Jeep', 'Wrangler (JL) / Gladiator (JT)', 'JL/JT', '2018-2025', 'OHT1130261', 'Hitag AES (4A)', 433, 'Flip Smart Key', 'SIP22 (Laser cut)', 'JL Wrangler, JT Gladiator', 'WK2 Grand Cherokee', 'Hinge mechanism is notorious for cracking. SIP22 is high-security milled track.'),
('Jeep', 'Grand Cherokee (WK2)', 'WK2', '2014-2021', 'M3N-40821302', 'ID46 (Philips)', 433, 'Smart Key', 'Y159 (Edge cut)', 'All WK2 platforms', 'WL Grand Cherokee', 'Legacy architecture. High reliability. Standard OBD with SGW bypass.'),
('Jeep', 'Grand Cherokee (WL)', 'WL', '2021-2025', 'M3NWXF0B1', 'Hitag AES (4A) NCF29A1', 433, 'Smart Key', 'Y159-R (High Security)', 'WL platform only', 'WK2 Grand Cherokee', 'CRITICAL: CAN-FD protocol. Early models had Stop Sale recall for RF Hub defects. HIGH BRICKING RISK.'),

-- Dodge
('Dodge', 'Charger / Challenger (Non-Performance)', 'LD/LC', '2018-2023', 'M3N-40821302', 'ID46 (Philips)', 433, 'Smart Key', 'Y159', 'All non-performance variants', 'N/A', 'Standard ID46 system. SGW bypass + OBD programming.'),
('Dodge', 'Charger / Challenger (Scat Pack / Hellcat)', 'LD/LC', '2021-2023', 'M3N-40821302', 'ID46 (Philips)', 433, 'Smart Key', 'Y159', 'N/A', 'N/A', 'RF HUB LOCKDOWN. TSB 08-086-22 firmware. Cannot program keys via OBD. RF Hub replacement required for AKL.');

-- ============================================================================
-- SECTION 5: Stellantis Model Security Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS stellantis_model_security_matrix (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    platform TEXT,
    year_start INTEGER,
    year_end INTEGER,
    fcc_id TEXT,
    chip_type TEXT,
    sgw_location TEXT,
    rf_hub_status TEXT,
    rf_hub_location TEXT,
    keyway TEXT,
    akl_difficulty INTEGER,
    brick_risk TEXT,
    critical_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stellantis_model_security_matrix (make, model, platform, year_start, year_end, fcc_id, chip_type, sgw_location, rf_hub_status, rf_hub_location, keyway, akl_difficulty, brick_risk, critical_notes) VALUES
('Ram', '1500 Classic', 'DS', 2018, 2024, 'GQ4-53T', 'ID46', 'Behind Radio', 'VIN Lock', 'Behind rear seats', 'Y159', 7, 'Medium', 'Dash disassembly for SGW. Water intrusion risk on RF Hub.'),
('Ram', '1500 New Body', 'DT', 2019, 2025, 'OHT-4882056', '4A (Hitag AES)', 'Driver Footwell', 'VIN Lock', 'Rear cab wall', 'Y159', 6, 'Medium-High', 'Water intrusion from CHMSL/rear window seal onto RF Hub is common failure.'),
('Ram', '2500/3500 HD', 'HD', 2019, 2025, 'GQ4-76T', '4A (Hitag AES)', 'Behind Cluster', 'VIN Lock', 'Rear cab wall', 'Y159', 7, 'Medium', 'Cluster removal often required. Identical key appearance to DT but different codes.'),
('Jeep', 'Wrangler', 'JL', 2018, 2025, 'OHT1130261', '4A (Hitag AES)', 'Under Driver Dash', 'VIN Lock', 'Rear quarter panel', 'SIP22', 6, 'Low', 'Ruggedized SVA. SIP22 laser key requires laser cutter.'),
('Jeep', 'Gladiator', 'JT', 2020, 2025, 'OHT1130261', '4A (Hitag AES)', 'Under Driver Dash', 'VIN Lock', 'Rear quarter panel', 'SIP22', 6, 'Low', 'Same architecture as JL Wrangler.'),
('Jeep', 'Grand Cherokee', 'WK2', 2018, 2021, 'M3N-40821302', 'ID46', 'Glovebox/Kick Panel', 'VIN Lock', 'Standard', 'Y159', 4, 'Low', 'Legacy architecture. Most accessible SGW. High reliability.'),
('Jeep', 'Grand Cherokee', 'WL', 2021, 2025, 'M3NWXF0B1', '4A (Hitag AES)', 'Driver Knee Bolster', 'VIN Lock', 'Standard', 'Y159-R', 9, 'CRITICAL', 'BRICKING RISK EPICENTER. CAN-FD protocol. 2021-2022 had Stop Sale recall for RF Hub defects.'),
('Dodge', 'Charger', 'LD', 2018, 2023, 'M3N-40821302', 'ID46', 'Star Connector', 'VIN Lock/Lockdown', 'Standard', 'Y159', 5, 'Low', 'Star Connector bypass preferred. Check for Lockdown firmware on performance variants.'),
('Dodge', 'Challenger', 'LC', 2018, 2023, 'M3N-40821302', 'ID46', 'Star Connector', 'VIN Lock/Lockdown', 'Standard', 'Y159', 5, 'Low', 'Same as Charger. Hellcat/Scat Pack = RF Hub Lockdown.'),
('Dodge', 'Durango', '-', 2018, 2024, 'M3N-40821302', 'ID46', 'Passenger Kick Panel', 'VIN Lock', 'Standard', 'Y159', 5, 'Low', 'Generally accessible SGW.');

-- ============================================================================
-- SECTION 6: Update vehicles and locksmith_alerts
-- ============================================================================
UPDATE vehicles SET
    security_system = 'Stellantis SVA (SGW + RF Hub)',
    akl_difficulty = 'Medium',
    special_notes = 'SGW bypass required (12+8 cable or AutoAuth). Check RF Hub Lockdown status on high-performance variants.'
WHERE make IN ('Chrysler', 'Dodge', 'Jeep', 'Ram') AND year_start >= 2018;

UPDATE vehicles SET
    security_system = 'Stellantis RF Hub Lockdown',
    akl_difficulty = 'Severe',
    special_notes = 'RF Hub REPLACEMENT required for AKL. Firmware blocks key programming via OBD. Dealer-sourced virgin RF Hub needed.'
WHERE make = 'Dodge' AND model IN ('Charger', 'Challenger') AND year_start >= 2021 AND special_notes LIKE '%Hellcat%' OR special_notes LIKE '%Scat Pack%';

INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Jeep', 'Grand Cherokee WL', 2021, 2025, 'HIGH BRICKING RISK = Epicenter of RF Hub Failures', 'The WL platform uses CAN-FD and new high-speed protocol. RF Hub is extremely voltage sensitive. Programming with battery <12.5V corrupts bootloader permanently.', 'All Keys Lost', 'MANDATORY: External battery maintainer (13.5V+ stable). Check RF Hub revision (AA/AB = defective). If Stop Sale recall hardware, replace RF Hub first.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Critical', 'Dodge', 'Charger/Challenger (Hellcat/Scat Pack)', 2021, 2023, 'RF Hub LOCKDOWN = Cannot Program Keys via OBD', 'TSB 08-086-22 firmware update disables key programming routines. UDS 0x27 (Security Access) is rejected. Module is write-protected.', 'All Keys Lost', 'RF Hub REPLACEMENT required. Purchase virgin unit from dealer. Program keys during initial installation. New hub also locks after session closes.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Critical', 'Ram', '1500/2500/3500', 2019, 2025, 'Water Intrusion = RF Hub Failure (Common Issue)', 'RF Hub is mounted on rear cab wall behind seats. Third brake light (CHMSL) and rear window seal leak water directly onto RF Hub connector/PCB.', 'No-Start Diagnosis', 'BEFORE programming: Inspect rear cabin wall for water stains. Programming to water-damaged RF Hub will fail and waste key credits. Check for corrosion.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Critical', 'Ram', '1500 Classic vs New Body', 2019, 2025, 'Platform Confusion: Same Year, Different Architecture', '2019-2024 Ram 1500 exists in TWO versions: Classic (DS) and New Body (DT). They use completely different keys (GQ4-53T vs OHT-4882056) and encryption (ID46 vs 4A AES).', 'Key Ordering', 'ALWAYS verify platform by VIN. DS = Classic (teardrop Fobik). DT = New Body (shield smart key). They are NOT compatible.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Ram', '2500/3500 HD', 2019, 2025, 'THE HD TRAP: Identical Key Appearance, Different Codes', 'GQ4-76T (HD) and OHT-4882056 (DT 1500) keys look identical but transmit different remote codes. Programming 1500 key to 2500 = "success" message but dead/erratic buttons.', 'Key Ordering', 'Verify VIN and chassis rating (1500 vs 2500+) BEFORE ordering keys. Do not assume visual match = compatibility.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Jeep', 'Grand Cherokee WL', 2021, 2022, 'Stop Sale Recall = Defective RF Hub Hardware', '2021-2022 WL had Stop Sale for RF Hub communication failure. Vehicle immobilizes itself thinking it is being stolen.', 'Intermittent No-Start', 'Check RF Hub part number. If revision AA or AB, likely defective hardware (not programming issue). Replace with revision AC or later.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'All Stellantis', 'All 2018+', 2018, 2025, '"Service Passive Entry" After Key Programming', 'Common error after programming. RF Hub added key ID but Rolling Code counter is out of sync with BCM.', 'Post-Programming Error', 'Hard Reset: Disconnect battery negative for 10 minutes. If still failing, perform "Restore PROXI Configuration" to force module handshake.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'All Stellantis', 'All 4A Keys', 2018, 2025, '4A Chip Locks to VIN After Programming', 'Once a Hitag AES (4A) key is programmed, it is permanently locked to that VIN. Used keys cannot be reprogrammed to another vehicle.', 'Key Reuse', 'Unlocking requires specialized tool (Xhorse Key Tool Max) to reset crypto-sectors of NCF29A1 chip. Otherwise, use new virgin keys only.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Info', 'Dodge', 'Charger/Challenger', 2018, 2023, 'Star Connector Bypass = Preferred Method', 'Rather than unplugging SGW, use Star Connector (CAN junction block) in passenger kick panel. Back-probe places tool directly on private CAN bus.', 'SGW Bypass', 'Star Connector bypass is less invasive than 12+8 cable in SGW. Does not disrupt vehicle network topology.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP),
('Info', 'Jeep', 'Wrangler JL', 2018, 2025, 'SIP22 Keyway = Laser Cutter Required', 'JL Wrangler and Gladiator use SIP22 milled track key (high security). Different from Y159 edge-cut on other Stellantis.', 'Key Cutting', 'Stock SIP22 blanks. Requires laser cutter to duplicate. Y159 code series does not apply.', 'Stellantis_RF_Hub_&_Fobik_Programming.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Stellantis RF Hub Security Architecture Complete' AS status,
       (SELECT COUNT(*) FROM stellantis_security_eras) AS era_entries,
       (SELECT COUNT(*) FROM stellantis_sgw_locations) AS sgw_entries,
       (SELECT COUNT(*) FROM stellantis_fobik_matrix) AS fobik_entries,
       (SELECT COUNT(*) FROM stellantis_model_security_matrix) AS model_entries;
