-- Batch 6: Nissan and Subaru Security Architecture Integration
-- Source: Nissan_Gateway_Bypass_Research_Goals.txt, Subaru_Security_Gateway_&_Key_Programming.txt

-- ============================================================================
-- SECTION 1: Nissan SGW Architecture Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS nissan_sgw_architecture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    platform TEXT,
    year_start INTEGER,
    year_end INTEGER,
    sgw_present BOOLEAN,
    sgw_location TEXT,
    bypass_cable_16_32 BOOLEAN, -- 16+32 cable sufficient
    bypass_cable_40_pin BOOLEAN, -- 40-pin BCM cable required
    bcm_part_prefix TEXT, -- 284B1 or 284B2
    pin_digit_count INTEGER, -- 20, 22, or 28 digit PIN
    frequency_mhz INTEGER,
    fcc_id TEXT,
    chip_type TEXT,
    add_key_difficulty TEXT,
    akl_difficulty TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nissan CMF-C/D Platform (High Security)
INSERT OR REPLACE INTO nissan_sgw_architecture (model, platform, year_start, year_end, sgw_present, sgw_location, bypass_cable_16_32, bypass_cable_40_pin, bcm_part_prefix, pin_digit_count, frequency_mhz, fcc_id, chip_type, add_key_difficulty, akl_difficulty, special_notes) VALUES
-- Rogue T33 (Flagship of new architecture)
('Rogue', 'T33 CMF-C/D', 2021, 2025, 1, 'Under driver dash above kick panel', 1, 1, '284B2-6RA', 22, 433, 'KR5TXN3', 'Hitachi AES (4A)', 'Medium', 'Very Hard', 'Double-lock: SGW + Read-Protected BCM. 40-Pin mandatory for AKL. KR5TXN1 for base trims, KR5TXN3/4 for SL/Platinum.'),
('Pathfinder', 'R53', 2022, 2025, 1, 'Behind glovebox or center stack (difficult)', 1, 1, '284B2', 22, 433, 'KR5TXN7', 'Hitachi AES (4A)', 'Hard', 'Very Hard', 'SGW deeply buried. 40-Pin preferred even for Add Key due to SGW access difficulty.'),
('Sentra', 'B18', 2020, 2025, 1, 'Under driver dash above pedals', 1, 1, '284B1-6LJ', 28, 433, 'KR5TXN3', 'Hitachi AES (4A)', 'Hard', 'Very Hard', 'Pioneer of new architecture. Read-Protected BCM. 40-Pin mandatory for AKL. 16+32 fails for AKL.'),

-- Frontier D41 (Truck Architecture - Less Restrictive)
('Frontier', 'D41 F-Alpha', 2022, 2025, 1, 'Near OBD port or fuse box', 1, 0, '284B2-9BU', 20, 433, 'KR5TXN7', 'Hitachi AES (4A)', 'Medium', 'Medium', 'Truck architecture less restrictive than CMF-C/D. 16+32 often sufficient for AKL.'),

-- Legacy 315 MHz Platforms
('Rogue', 'T32', 2014, 2020, 0, 'N/A', 0, 0, '284B1-4BA', 20, 315, 'KR5S180144014', 'ID46', 'Easy', 'Medium', 'Standard OBD programming. No gateway.'),
('Altima', '6th Gen', 2019, 2024, 1, 'Under driver dash', 1, 0, '284B1', 20, 433, 'KR5TXN4', 'Hitachi AES (4A)', 'Medium', 'Medium', '16+32 usually sufficient.'),
('Maxima', 'A36', 2019, 2023, 1, 'Under driver dash', 1, 0, '284B1', 20, 433, 'KR5S180144014', 'ID46', 'Medium', 'Medium', 'Transitional platform.');

-- ============================================================================
-- SECTION 2: Nissan Bypass Cable Requirements
-- ============================================================================
CREATE TABLE IF NOT EXISTS nissan_bypass_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_range TEXT,
    operation TEXT, -- Add Key, AKL
    cable_16_32_viable BOOLEAN,
    cable_40_pin_required BOOLEAN,
    bcm_type TEXT, -- Type A (Legacy 20-digit) or Type B (Read-Protected 22/28-digit)
    sgw_bypass_location TEXT,
    success_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO nissan_bypass_requirements (model, year_range, operation, cable_16_32_viable, cable_40_pin_required, bcm_type, sgw_bypass_location, success_notes) VALUES
-- Add Key Scenarios
('Rogue T33', '2021-2025', 'Add Key', 1, 0, 'Type B (Read-Protected)', 'Under driver dash', 'With working key present, 16+32 + AutoAuth or server-connected tool works'),
('Pathfinder R53', '2022-2025', 'Add Key', 0, 1, 'Type B', 'Deep behind glovebox', 'SGW location difficult. 40-Pin to BCM preferred'),
('Sentra B18', '2020-2025', 'Add Key', 1, 0, 'Type B (28-digit)', 'Above pedals', '16+32 works for Add Key'),
('Frontier D41', '2022-2025', 'Add Key', 1, 0, 'Type A (20-digit)', 'Near OBD', 'Standard gateway bypass'),

-- AKL Scenarios (Critical)
('Rogue T33', '2021-2025', 'AKL', 0, 1, 'Type B (22-digit)', 'BCM Direct', '40-Pin cable MANDATORY. BCM read-protected. Cannot calculate PIN via 16+32.'),
('Pathfinder R53', '2022-2025', 'AKL', 0, 1, 'Type B (22-digit)', 'BCM Direct', '40-Pin cable MANDATORY'),
('Sentra B18', '2020-2025', 'AKL', 0, 1, 'Type B (28-digit)', 'BCM Direct', '40-Pin cable MANDATORY. Was "Add Key Only" until 2023 tool updates.'),
('Frontier D41', '2022-2025', 'AKL', 1, 0, 'Type A (20-digit)', 'Under dash', '16+32 generally sufficient for Frontier AKL');

-- ============================================================================
-- SECTION 3: Subaru Security Architecture Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS subaru_sgp_architecture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    platform TEXT,
    year_start INTEGER,
    year_end INTEGER,
    sgw_present BOOLEAN,
    dcm_starlink_bypass BOOLEAN, -- Starlink DCM needs bypass
    eyesight_risk BOOLEAN, -- Eyesight can cause bricking
    bypass_cable_12_8 BOOLEAN,
    chip_type TEXT, -- G-Chip or H-Chip
    frequency_mhz INTEGER,
    fcc_id TEXT,
    add_key_difficulty TEXT,
    akl_difficulty TEXT,
    sloa_timer_minutes INTEGER, -- Lockout timer
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subaru Global Platform Vehicles
INSERT OR REPLACE INTO subaru_sgp_architecture (model, platform, year_start, year_end, sgw_present, dcm_starlink_bypass, eyesight_risk, bypass_cable_12_8, chip_type, frequency_mhz, fcc_id, add_key_difficulty, akl_difficulty, sloa_timer_minutes, special_notes) VALUES
-- 2020+ Full SGP Implementation
('Outback', 'SGP', 2020, 2025, 1, 1, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AKB', 'Hard', 'Very Hard', 15, 'SGW + DCM active jamming. Starlink fuse pull or DCM bypass plug required.'),
('Legacy', 'SGP', 2020, 2025, 1, 1, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AKB', 'Hard', 'Very Hard', 15, 'Identical to Outback'),
('Forester', 'SGP', 2019, 2025, 1, 1, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AHK', 'Hard', 'Very Hard', 15, 'SGW behind glove box. DCM often more problematic than SGW.'),
('Ascent', 'SGP', 2019, 2025, 1, 1, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AKB', 'Hard', 'Very Hard', 15, 'Modules deeply buried in dash. Starlink bypass often accessed via head unit cavity.'),
('Crosstrek', 'SGP', 2021, 2025, 1, 1, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AHK', 'Hard', 'Very Hard', 15, '2021+ requires bypass. Earlier models varied by EyeSight trim.'),
('Impreza', 'SGP', 2017, 2023, 1, 0, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AHK', 'Medium', 'Hard', 10, 'Earlier adoption. Less DCM interference.'),
('WRX', 'SGP', 2022, 2025, 1, 1, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AHK', 'Hard', 'Very Hard', 15, 'New WRX on SGP.'),
('BRZ', 'SGP', 2022, 2025, 1, 1, 1, 1, 'H-Chip (128-bit 8A)', 433, 'HYQ14AKB', 'Hard', 'Very Hard', 15, 'New BRZ on SGP'),

-- Toyota Exception
('Solterra', 'Toyota e-TNGA', 2023, 2025, 1, 0, 0, 0, 'Toyota 8A', 315, 'HYQ14FBX', 'Medium', 'Hard', 16, 'TOYOTA PLATFORM - Uses Toyota security, not Subaru. 315 MHz, not 433.'),

-- Legacy Platforms (Pre-SGP)
('Outback', 'Legacy Platform', 2015, 2019, 0, 0, 0, 0, 'G-Chip (80-bit)', 315, 'HYQ14AHC', 'Easy', 'Medium', 10, 'Standard OBD programming'),
('Forester', 'Legacy Platform', 2014, 2018, 0, 0, 0, 0, 'G-Chip (80-bit)', 315, 'HYQ14AHC', 'Easy', 'Medium', 10, 'Standard OBD programming'),
('WRX/STI', 'Legacy Platform', 2016, 2021, 0, 0, 0, 0, 'G-Chip (80-bit)', 315, 'HYQ14AHC', 'Easy', 'Medium', 10, 'Older WRX easier to program'),
('BRZ', 'Legacy Platform', 2014, 2020, 0, 0, 0, 0, 'G-Chip (80-bit)', 315, 'HYQ14AHC', 'Easy', 'Medium', 10, 'Standard OBD programming');

-- ============================================================================
-- SECTION 4: Subaru SLOA Lockout Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS subaru_sloa_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lockout_type TEXT NOT NULL, -- Soft, Hard
    trigger_condition TEXT,
    symptom TEXT,
    recovery_method TEXT,
    wait_time_minutes INTEGER,
    risk_level TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO subaru_sloa_reference (lockout_type, trigger_condition, symptom, recovery_method, wait_time_minutes, risk_level, notes) VALUES
('Soft Lockout', 'Failed Security ID Authentication (3+ attempts)', 'Security indicator light solid or rapid flash. Tool reports timeout.', 'Keep ignition ON (engine off) for full timer duration. Do NOT turn ignition off - this pauses timer.', 15, 'Medium', 'Standard response to PIN errors. Timer-based recovery.'),
('Soft Lockout', 'Abnormal CAN Traffic (Bus Sniffing Detected)', 'BIU enters Safe Mode. K-Line or CAN communication stops.', 'Disconnect battery for 10 minutes. Reconnect and wait for module wake cycle.', 30, 'Medium', 'System detects DoS-like polling patterns from cloning tools.'),
('Soft Lockout', 'Voltage Irregularities During Write', 'Incomplete programming. Partial data corruption suspected.', 'Battery maintainer required. Wait for timer. Retry with stable voltage.', 15, 'High', 'Never attempt write operations below 12.0V.'),
('Hard Lockout', 'Repeated Soft Lockouts / EEPROM Manipulation', 'Does not clear with time. Tool cannot establish communication.', 'Capacitive discharge (disconnect battery, touch terminals together). SSM4 Registration Mode reset. May require bench flash.', NULL, 'Critical', 'May result in bricked BIU requiring replacement.');

-- ============================================================================
-- SECTION 5: Subaru AKL Procedure Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS subaru_akl_procedures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_type TEXT NOT NULL, -- H-Chip Bladed, Smart Key
    procedure_name TEXT,
    step_1 TEXT,
    step_2 TEXT,
    step_3 TEXT,
    step_4 TEXT,
    required_hardware TEXT,
    tool_recommendation TEXT,
    risk_level TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO subaru_akl_procedures (key_type, procedure_name, step_1, step_2, step_3, step_4, required_hardware, tool_recommendation, risk_level, notes) VALUES
('H-Chip Bladed (128-bit)', 'Sniff-Calculate-Emulate Method', 
 'Install 12+8 bypass cable. Connect APB112 emulator via USB.',
 'Insert blank H-blade into ignition. Turn ON. Place APB112 near ignition coil to capture encrypted query.',
 'Tool uploads captured trace to server for Page 94/98 calculation. Data written back to APB112.',
 'APB112 now acts as virtual master key. Hold to ignition when prompted. Insert new H-Chip key when prompted for new key.',
 'SGW Bypass (12+8), APB112 Emulator, LKP-04 chip (optional)',
 'Autel IM608 with APB112, Smart Pro with SLK-06',
 'High',
 'Server calculation required. Internet connection mandatory.'),

('Smart Key (Proximity)', 'Smart Box Reset Method',
 'Install 12+8 bypass cable. Power down Eyesight (fuse pull). Silence Starlink (fuse pull or DCM bypass plug).',
 'Initiate Smart Box Reset via tool. This wipes all existing keys from Smart ECU.',
 'Wait for reset completion. Place first new smart key in slot. Register as master.',
 'Add additional keys as needed. Restore fuses. Clear U-codes from Eyesight/BCM.',
 'SGW Bypass (12+8), Starlink DCM Bypass Plug (AHH-7747)',
 'Autel IM608, Lonsdor K518, Smart Pro',
 'Very High',
 'HIGH RISK: If interrupted by DCM or Eyesight, Smart ECU may be corrupted. Used smart keys must be renewed first.');

-- ============================================================================
-- SECTION 6: Nissan and Subaru Locksmith Alerts
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- Nissan Alerts
('Critical', 'Nissan', 'Rogue T33', 2021, 2025, '40-Pin Cable Mandatory for AKL', 'BCM is read-protected with 22-digit rolling code. 16+32 cable cannot extract PIN for AKL.', 'All Keys Lost', 'Use Nissan-40 Pin BCM Cable. Connect directly to BCM to read EEPROM for PIN calculation.', 'Nissan_Gateway_Bypass_Research_Goals.txt', CURRENT_TIMESTAMP),
('Critical', 'Nissan', 'Sentra B18', 2020, 2025, '28-Digit PIN Read-Protected BCM', 'Was considered Add Key Only until 2023. 40-Pin cable and updated software now required for AKL.', 'All Keys Lost', 'Use 40-Pin BCM cable with Lonsdor or OBDSTAR. Server calculation required.', 'Nissan_Gateway_Bypass_Research_Goals.txt', CURRENT_TIMESTAMP),
('Warning', 'Nissan', 'Pathfinder R53', 2022, 2025, 'SGW Deeply Buried in Dash', 'SGW located behind glovebox or center stack. Significant disassembly required.', 'Diagnostics', 'Prefer 40-Pin BCM cable approach. BCM usually more accessible than SGW.', 'Nissan_Gateway_Bypass_Research_Goals.txt', CURRENT_TIMESTAMP),
('Warning', 'Nissan', 'All 2020+', 2020, 2025, '315 MHz Keys Deprecated', 'CMF-C/D platforms use 433 MHz. Legacy 315 MHz keys incompatible with new platforms.', 'Key Ordering', 'Verify FCC ID: KR5TXN series = 433 MHz. KR5S180 = 315 MHz (legacy only).', 'Nissan_Gateway_Bypass_Research_Goals.txt', CURRENT_TIMESTAMP),
('Warning', 'Nissan', 'Sentra', 2019, 2020, 'B17 vs B18 Platform Confusion', '2019 Sentra Classic may still be old B17 platform (315 MHz). Verify body style.', 'Diagnostics', 'Check physical body style. B17 has older interior. B18 has new design. VIN decode to confirm.', 'Nissan_Gateway_Bypass_Research_Goals.txt', CURRENT_TIMESTAMP),

-- Subaru Alerts
('Critical', 'Subaru', 'All SGP', 2020, 2025, 'Starlink DCM Active Jamming', 'Telematics module actively floods CAN bus with noise during programming. Primary cause of Communication Failure.', 'All Keys Lost', 'Pull DCM/Telematics fuse OR install Starlink Bypass Plug (AHH-7747) before programming.', 'Subaru_Security_Gateway_&_Key_Programming.txt', CURRENT_TIMESTAMP),
('Critical', 'Subaru', 'All SGP with EyeSight', 2019, 2025, 'EyeSight Bus Contention Risk', 'EyeSight broadcasts high-priority messages during programming. Can corrupt EEPROM data (bricking).', 'All Keys Lost', 'ALWAYS pull EyeSight fuse before programming. Locate in interior fuse box labeled ES/Safety/Camera.', 'Subaru_Security_Gateway_&_Key_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Subaru', 'All SGP', 2019, 2025, 'SLOA Lockout Protocol', 'BIU locks after 3 failed PIN attempts. Soft lockout requires 15+ minute wait with ignition ON.', 'Key Programming', 'Do NOT turn ignition OFF during lockout - this pauses timer. Use tool with SLOA timer display (Smart Pro).', 'Subaru_Security_Gateway_&_Key_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Subaru', 'All SGP', 2019, 2025, 'AutoAuth Not Viable for Immobilizer', 'Unlike FCA, Subaru requires physical bypass for key programming. Software bypass insufficient.', 'Key Programming', '12+8 bypass cable is mandatory hardware. AutoAuth only works for general diagnostics.', 'Subaru_Security_Gateway_&_Key_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Subaru', 'All SGP', 2019, 2025, 'Used Smart Keys Must Be Renewed', 'Smart keys are locked to original vehicle upon programming. Cannot reprogram without PCB reset.', 'Key Programming', 'Use Xhorse Key Tool Max or similar to renew/unlock used smart key before programming to new vehicle.', 'Subaru_Security_Gateway_&_Key_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Subaru', 'Solterra', 2023, 2025, 'Toyota Platform - Different Security', 'Built on Toyota e-TNGA platform. Uses Toyota security (315 MHz, Toyota 8A), NOT Subaru.', 'Key Programming', 'Use Toyota programming procedures. FCC ID HYQ14FBX. 315 MHz, not 433 MHz.', 'Subaru_Security_Gateway_&_Key_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Subaru', 'All SGP', 2019, 2025, 'HYQ14AHK vs HYQ14AKB Incompatibility', 'Keys look identical but are internally incompatible. Wrong key triggers SLOA as spoofing attack.', 'Key Ordering', 'Verify exact FCC ID before ordering. AHK = early SGP. AKB = 2020+ high security refresh.', 'Subaru_Security_Gateway_&_Key_Programming.txt', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 7: Update vehicles_master with Nissan/Subaru Data
-- ============================================================================
UPDATE vehicles_master SET
    security_system = 'SGW + Read-Protected BCM',
    bypass_cable_required = 1,
    akl_difficulty = 'Very Hard',
    special_notes = COALESCE(special_notes || ' | ', '') || '40-Pin BCM cable mandatory for AKL. 22-digit rolling code. 433 MHz keys only.'
WHERE make = 'Nissan' AND model = 'Rogue' AND year_start >= 2021;

UPDATE vehicles_master SET
    security_system = 'SGW + Read-Protected BCM',
    bypass_cable_required = 1,
    akl_difficulty = 'Very Hard',
    special_notes = COALESCE(special_notes || ' | ', '') || '28-digit PIN. 40-Pin cable mandatory for AKL.'
WHERE make = 'Nissan' AND model = 'Sentra' AND year_start >= 2020;

UPDATE vehicles_master SET
    security_system = 'SGP + DCM Active Jamming',
    bypass_cable_required = 1,
    eyesight_risk = 1,
    akl_difficulty = 'Very Hard',
    special_notes = COALESCE(special_notes || ' | ', '') || 'Starlink DCM bypass required. EyeSight fuse pull mandatory. SLOA lockout 15 min.'
WHERE make = 'Subaru' AND year_start >= 2019;

-- Mark completion
SELECT 'Batch 6 Nissan and Subaru Complete' AS status,
       (SELECT COUNT(*) FROM nissan_sgw_architecture) AS nissan_entries,
       (SELECT COUNT(*) FROM subaru_sgp_architecture) AS subaru_entries;
