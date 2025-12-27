-- Batch 8: Nissan Programming Guide Reference + Final Consolidation
-- Source: Nissan_Locksmith_Programming_Guide.txt, integration of all batch data

-- ============================================================================
-- SECTION 1: Nissan Transponder Reference (Comprehensive)
-- ============================================================================
CREATE TABLE IF NOT EXISTS nissan_transponder_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    era TEXT NOT NULL,
    system_type TEXT,
    chip_id TEXT,
    chip_family TEXT,
    encryption TEXT,
    frequency TEXT,
    keyway TEXT,
    reusable BOOLEAN,
    lock_bit BOOLEAN,
    models TEXT,
    year_range TEXT,
    compatibility_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO nissan_transponder_reference (era, system_type, chip_id, chip_family, encryption, frequency, keyway, reusable, lock_bit, models, year_range, compatibility_notes) VALUES
('2000-2006', 'NATS 5 (Legacy)', 'TI 4D-60', 'Texas Instruments 4D', '40-bit Fixed', 'N/A (Chip Only)', 'DA34/NSN14', 1, 0, 'Maxima, Altima, Frontier, Xterra', '2000-2006', 'Ceramic/glass encapsulated. Can be reformatted if unlocked. Ford 4D-60 incompatible without reformatting.'),
('2007-2012', 'Intelligent Key (Twist)', 'ID46 (PCF7936)', 'Philips/NXP', 'HITAG 2 (48-bit)', '315 MHz', 'NSN14', 0, 1, 'Rogue, Versa, Sentra, Qashqai', '2007-2012', 'Lock bit set after programming. NOT reusable. Password mode operation.'),
('2007-2014', 'Intelligent Key (Push)', 'ID46 (PCF7952)', 'Philips/NXP', 'HITAG 2 (48-bit)', '315 MHz', 'NSN14', 0, 1, 'Altima, Maxima, G37, 370Z', '2007-2014', 'Push-Button Start variant. Same chip, different key shell.'),
('2013-2018', 'NATS 6 / Prox', 'ID47 (HITAG 3)', 'NXP NCF2951', '128-bit AES', '433 MHz', 'NSN14', 0, 1, 'Altima, Rogue, Pathfinder, Murano', '2013-2018', 'One-Time Programmable. Used keys are LOCKED to original vehicle. Requires unlocking hardware to reuse.'),
('2019-2025', 'Modern Prox', 'ID4A (HITAG-AES)', 'NXP Latest', '128-bit AES Enhanced', '433 MHz', 'NSN14', 0, 1, 'Sentra B18, Rogue T33, Versa, Kicks', '2019-2025', 'Newest system. 22-digit PIN. Server-side calculation only. Virgin keys only.'),
('2016-2024', 'Commercial / Truck', 'ID46 Extended', 'Philips/NXP', 'HITAG 2 (48-bit)', '315 MHz', 'NSN14', 0, 1, 'Titan, Frontier (Steel Key)', '2016-2024', 'Commercial vehicles retained older ID46 architecture longer.');

-- ============================================================================
-- SECTION 2: Nissan ESCL (Electronic Steering Column Lock) Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS nissan_escl_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_type TEXT NOT NULL,
    affected_systems TEXT,
    symptoms TEXT,
    diagnostic_codes TEXT,
    tap_test TEXT,
    permanent_fix TEXT,
    risk_level TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO nissan_escl_reference (issue_type, affected_systems, symptoms, diagnostic_codes, tap_test, permanent_fix, risk_level, notes) VALUES
('ESCL Motor Failure', 'Twist Knob Systems (Rogue 2008-2013, Versa, Sentra)', 'Key cannot turn plastic knob. Feels physically locked. No unlock sound.', 'B2609 (Steering Column Lock Status), B2610 (Ignition Relay)', 'While pressing Start/turning knob, vigorously strike steering column housing with rubber mallet. Often frees stuck motor brushes temporarily.', 'Install ESCL Emulator - plugs into ESCL connector and digitally mimics "Unlocked" signal permanently.', 'High', 'Common Nissan failure. Mimics immobilizer problem. Unique to Nissan/Infiniti.'),
('ESCL Communication Failure', 'Push-Button Start Systems (Altima, Maxima)', 'No Crank, No Start. Yellow Key light on dash. No "zzzt-clunk" sound.', 'B2609, B2610', 'Strike lower steering column while pressing Start button.', 'ESCL Emulator installation.', 'High', 'Silence when pressing Start indicates ESCL not unlocking.'),
('ESCL BCM Handshake Failure', 'All Intelligent Key Systems', 'BCM forbids ignition. Engine cranks but does not start.', 'B2609', 'N/A - Electronic issue', 'Diagnose CAN communication between ESCL and BCM. May require BCM reset or ESCL replacement.', 'Medium', 'BCM waits for ESCL "Unlocked" signal before authorizing start.');

-- ============================================================================
-- SECTION 3: PIN Code System Evolution Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS pin_code_systems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manufacturer TEXT NOT NULL,
    system_era TEXT,
    pin_length INTEGER,
    pin_type TEXT, -- Static, Rolling, Server
    calculation_method TEXT,
    server_required BOOLEAN,
    lockout_threshold INTEGER,
    lockout_recovery TEXT,
    cost_implications TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nissan PIN Systems
INSERT OR REPLACE INTO pin_code_systems (manufacturer, system_era, pin_length, pin_type, calculation_method, server_required, lockout_threshold, lockout_recovery, cost_implications) VALUES
('Nissan', '2000-2006 NATS 5', 4, 'Static', 'BCM label 5-digit to 4-digit conversion algorithm', 0, 5, 'Disconnect battery 15-20 minutes', 'Free with any tool'),
('Nissan', '2007-2012 NATS 6', 4, 'Static', 'BCM electronic ID read + calculation', 0, 3, 'Leave ignition ON for 60 minutes', 'Free with any tool'),
('Nissan', '2013-2018 Rolling Code', 20, 'Rolling', '20-digit Challenge-Response. Changes every ignition cycle.', 1, 3, 'Battery disconnect + time wait', 'Included in Autel subscription; token cost for SmartPro'),
('Nissan', '2019+ Pre-Safe', 22, 'Rolling/Server', '22-digit server-side calculation only', 1, 3, 'Battery disconnect + may require NASTF credentials', 'Server calculation fee or active subscription required'),

-- Kia/Hyundai PIN Systems
('Kia/Hyundai', '2011-2021 Pre-Campaign', 6, 'Static', 'OBD extraction from BCM EEPROM', 0, 5, 'Battery disconnect 10 minutes', 'Free with OBD read'),
('Kia/Hyundai', '2022+ Post-Campaign 993', 6, 'Static (Blocked)', 'Must purchase from dealer/tech info portal', 0, 5, 'Battery disconnect', 'Purchase required ($20-60 per code). NASTF VSP for official access.'),

-- Ford PIN Systems (Comparison)
('Ford', 'PATS II (1998-2005)', 4, 'Static', 'Time-based security access (10 minute wait)', 0, NULL, 'N/A', 'Free'),
('Ford', '2015+ HITAG Pro', 6, 'Static/Dealer', 'Dealer database lookup', 0, NULL, 'N/A', 'Dealer lookup required'),

-- Stellantis PIN Systems
('Stellantis', '2022+ Locked RF Hub', NULL, 'Pre-Coded', 'N/A - Key pre-coded at factory with VIN-specific SK', 0, NULL, 'N/A', 'VIN-specific key purchase required. No PIN extraction.');

-- ============================================================================
-- SECTION 4: Tool Compatibility Matrix Updates
-- ============================================================================
INSERT OR IGNORE INTO tool_capability_matrix (tool_name, capability, manufacturer, model_years, status, adapter_required, notes) VALUES
-- Nissan Updates
('Autel IM608', 'AKL', 'Nissan', '2019-2025', 'Supported', '16+32 Gateway Bypass', '22-digit server calculation. Internet required.'),
('SmartPro', 'AKL', 'Nissan', '2020+', 'Supported', '16+32 Gateway Bypass', 'Reliable 22-digit handling. Token costs apply.'),
('Lonsdor K518', 'AKL', 'Nissan', '2019+', 'Supported', '40-Pin BCM Cable', 'Includes LKE emulator for AKL bypass. Fast calculation.'),

-- Kia/Hyundai Updates
('Autel IM608', 'AKL', 'Kia/Hyundai', '2024+', 'Supported', 'CAN FD Adapter + 12+8 SGW Bypass', 'PIN reading fails. Must purchase PIN externally.'),
('Xtool AutoProPad', 'AKL', 'Kia/Hyundai', '2024+', 'Supported', 'M811 CAN FD Adapter', 'Struggles with SGW without physical bypass.'),
('SmartPro', 'AKL', 'Kia/Hyundai', '2024+', 'Limited', 'CAN FD Adapter', 'Requires separate PIN purchase. Internet mandatory.'),

-- Stellantis Updates
('WiTech 2.0', 'Enable Fobik', 'Stellantis', '2022+', 'Required', 'None (OEM Tool)', 'Only method for locked RF Hubs. VIN-specific keys required.'),
('Autel IM608', 'AKL', 'Stellantis', '2022+', 'Limited', 'Star Connector', 'May brick RF Hub on new locked systems. Use WiTech first.'),
('Lonsdor K518', 'AKL', 'Stellantis', '2022+', 'Limited', 'SGW Bypass', 'Check RF Hub status first. Enable Fobik often required.');

-- ============================================================================
-- SECTION 5: Final Locksmith Alerts from Guide Documents
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- Nissan ESCL Alert
('Critical', 'Nissan', 'Rogue/Versa/Sentra', 2008, 2015, 'ESCL Failure Mimics Immobilizer Problem', 'Electronic Steering Column Lock failure prevents ignition turn. Feels like security lockout but is mechanical.', 'Diagnostics', 'Check for B2609/B2610 codes. Perform tap test on steering column. Install ESCL Emulator for permanent fix.', 'Nissan_Locksmith_Programming_Guide.txt', CURRENT_TIMESTAMP),
('Warning', 'Nissan', 'All Models', 2000, 2025, 'BCM Voltage Sensitivity During Programming', 'Rolling code BCMs extremely sensitive to voltage drops. Sub-12V during PIN handshake causes failure and lockout.', 'Key Programming', 'Always connect battery maintainer at 13.5V. Jump pack recommended during all programming.', 'Nissan_Locksmith_Programming_Guide.txt', CURRENT_TIMESTAMP),
('Warning', 'Nissan', 'All Models', 2000, 2025, 'BCM Label vs Electronic ID Mismatch', 'If BCM was replaced with used unit, physical label may show different ID than electronic broadcast.', 'PIN Calculation', 'ALWAYS prioritize Electronic Read via OBD over physical label. If electronic read fails, programming cannot proceed via calculation.', 'Nissan_Locksmith_Programming_Guide.txt', CURRENT_TIMESTAMP),
('Warning', 'Nissan', 'All ID47 Models', 2013, 2018, 'Used ID47 Keys Are Locked', 'ID47 keys are One-Time Programmable. Used key from another vehicle is locked and cannot be reprogrammed.', 'Key Programming', 'Virgin keys only. Unlocking hardware required to reuse. Key registration fails silently with used key.', 'Nissan_Locksmith_Programming_Guide.txt', CURRENT_TIMESTAMP),
('Info', 'Nissan', 'All NSN14', 2002, 2025, 'Door vs Ignition Cut Positions', 'Door lock contains cuts 3-10 only. Ignition requires cuts 1-10. Decode door but must calculate/trial cuts 1-2.', 'Key Cutting', 'Use progression software (InstaCode) to calculate missing cuts 1-2, or trial-and-error cutting.', 'Nissan_Locksmith_Programming_Guide.txt', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 6: Master Update Summary
-- ============================================================================

-- Create summary view of all batch migrations
CREATE VIEW IF NOT EXISTS migration_batch_summary AS
SELECT 'Batch 1: European Security' AS batch, 
       (SELECT COUNT(*) FROM bmw_architecture_reference) AS primary_entries,
       'BMW CAS/FEM/BDC, Mercedes FBS, VW Immobilizer, Porsche' AS coverage
UNION ALL
SELECT 'Batch 2: Cross-Reference Tools', 
       (SELECT COUNT(*) FROM transponder_chip_reference),
       'Transponder chips, key blades, tool capabilities'
UNION ALL
SELECT 'Batch 3: Stellantis VIN', 
       (SELECT COUNT(*) FROM stellantis_vin_architecture),
       'Italian vs NAFTA, RF Hub, VIN pre-coding'
UNION ALL
SELECT 'Batch 4: Asian Manufacturers', 
       (SELECT COUNT(*) FROM toyota_transponder_evolution),
       'Toyota G/H chips, TSS gateway, Honda BSI'
UNION ALL
SELECT 'Batch 5: Ford and GM', 
       (SELECT COUNT(*) FROM ford_active_alarm_reference),
       'Ford BCM bypass, GM Global A/B, 12th digit VIN'
UNION ALL
SELECT 'Batch 6: Nissan and Subaru', 
       (SELECT COUNT(*) FROM nissan_sgw_architecture),
       'Nissan SGW 16+32 vs 40-Pin, Subaru SLOA, Starlink bypass'
UNION ALL
SELECT 'Batch 7: Stellantis + Kia/Hyundai', 
       (SELECT COUNT(*) FROM stellantis_rfhub_status),
       'RF Hub locked status, Enable Fobik, CAN FD migration, Campaign 993'
UNION ALL
SELECT 'Batch 8: Nissan NATS + Final', 
       (SELECT COUNT(*) FROM nissan_nats_reference),
       'NATS generations, ESCL reference, PIN systems, tool matrix updates';

-- Final completion marker
SELECT 'All Batches Complete' AS status,
       (SELECT COUNT(*) FROM locksmith_alerts) AS total_alerts,
       'Migration suite ready for execution' AS next_step;
