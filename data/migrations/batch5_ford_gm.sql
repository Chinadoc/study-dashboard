-- Batch 5: Ford and GM Security Architecture Integration
-- Source: Ford_BCM_Security_Bypass_Research.txt, GM_Global_B_Key_Programming_Research.txt

-- ============================================================================
-- SECTION 1: Ford Active Alarm Architecture
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_active_alarm_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT,
    active_alarm_severity TEXT, -- None, Standard, Hardened
    gateway_module_required BOOLEAN,
    bypass_cable_required BOOLEAN,
    bypass_location TEXT,
    frequency_mhz INTEGER,
    fcc_id TEXT,
    chip_type TEXT,
    motion_sensors BOOLEAN,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO ford_active_alarm_reference (model, year_start, year_end, platform, active_alarm_severity, gateway_module_required, bypass_cable_required, bypass_location, frequency_mhz, fcc_id, chip_type, motion_sensors, special_notes) VALUES
-- Gen 14 F-150 Platform (2021+)
('F-150', 2021, 2024, 'Gen 14', 'Hardened', 1, 1, 'Behind glovebox - GWM', 902, 'M3N-A2C931426', 'Hitag Pro (ID49)', 0, 'Double Honk symptom. 10-minute timer blocked when alarm active.'),
('F-150 Raptor', 2021, 2024, 'Gen 14', 'Hardened', 1, 1, 'Behind glovebox - GWM', 902, 'M3N-A2C931426', 'Hitag Pro (ID49)', 0, '902 MHz Ultra-Long Range key'),
('F-150 Lightning', 2022, 2024, 'Gen 14 EV', 'Hardened', 1, 1, 'Behind glovebox - GWM', 902, 'M3N-A2C931426', 'Hitag Pro (ID49)', 0, 'EV platform - 12V battery still powers security'),

-- Bronco Platform
('Bronco', 2021, 2024, 'Bronco Platform', 'Hardened', 1, 1, 'Behind glovebox - Star Connector', 902, 'M3N-A2C931426', 'Hitag Pro (ID49)', 0, 'Removable doors complicate Door Ajar logic'),
('Bronco Sport', 2021, 2024, 'C2 (Escape)', 'Standard', 0, 0, 'Standard OBD', 315, 'M3N-A2C931423', 'Hitag Pro (ID49)', 0, 'DIFFERENT from full-size Bronco - 315 MHz not 902'),

-- Mustang Mach-E (Aggressive Motion Sensors)
('Mustang Mach-E', 2021, 2024, 'GE1 EV Platform', 'Hardened', 1, 1, 'Passenger footwell kick panel', 902, 'M3N-A2C931426', 'Hitag Pro (ID49)', 1, 'MOTION SENSORS - Ultrasonic triggers during programming. Bypass cable silences alarm.'),

-- Expedition (2022 Refresh aligned with F-150)
('Expedition', 2018, 2021, 'U553', 'Standard', 0, 0, 'Standard OBD', 315, 'M3N-A2C93142600', 'Hitag Pro (ID49)', 0, 'Legacy architecture'),
('Expedition', 2022, 2024, 'U553 Refresh', 'Hardened', 1, 1, 'Behind glovebox', 902, 'M3N-A2C931426', 'Hitag Pro (ID49)', 0, '2022 refresh aligned with Gen 14 F-150'),

-- Legacy Ford (Pre-2021)
('F-150', 2015, 2020, 'Gen 13', 'Standard', 0, 0, 'Standard OBD', 315, 'M3N-A2C931423', 'ID49/ID63', 0, 'Standard OBD programming with 10-minute wait'),
('Explorer', 2016, 2019, 'U502', 'Standard', 0, 0, 'Standard OBD', 315, 'M3N-A2C31243300', 'ID63', 0, 'Legacy platform'),
('Explorer', 2020, 2024, 'U611', 'Standard', 0, 0, 'Standard OBD', 315, 'M3N-A2C93142100', 'Hitag Pro', 0, 'New platform but less hardened than F-150');

-- ============================================================================
-- SECTION 2: Ford 12-Pin Bypass Procedure Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS ford_bypass_procedures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    procedure_name TEXT NOT NULL,
    applicable_models TEXT,
    year_range TEXT,
    phase_1 TEXT,
    phase_2 TEXT,
    phase_3 TEXT,
    required_hardware TEXT,
    risk_level TEXT,
    success_rate TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO ford_bypass_procedures (procedure_name, applicable_models, year_range, phase_1, phase_2, phase_3, required_hardware, risk_level, success_rate, notes) VALUES
('12-Pin Active Alarm Bypass', 'F-150, Bronco, Expedition 2022+, Mach-E', '2021-2024',
 'PHASE 1 - Entry and Isolation: Gain entry to vehicle (alarm sounds). Immediately disconnect negative battery terminal. This stops alarm and resets BCM Panic counter.',
 'PHASE 2 - Stealth Boot: Connect 12-Pin bypass cable (clamps to battery terminals, 12-pin to GWM). Plug diagnostic tool into bypass cable OBD port. Reconnect vehicle battery. Do NOT open doors or press fob buttons. Select Force Ignition ON via tool software.',
 'PHASE 3 - Programming: Select All Keys Lost. Tool communicates with BCM via bypass (GWM firewall bypassed). Place M3N-A2C931426 key in programming slot. BCM writes new 128-bit key ID.',
 'Ford Active Alarm Bypass Cable (12-Pin), CAN FD capable tool (Autel IM608+, Smart Pro with ADC2020)',
 'Medium',
 '85-95%',
 'Power Isolation is the key principle. Tool powered externally via clamps, not through BCM-monitored circuits.'),

('Smart Pro ADC2020 Emulator Method', 'F-150, Bronco, Mach-E', '2021-2024',
 'Connect ADC2020 cable to vehicle via 12-pin intercept.',
 'ADC2020 actively spoofs valid key signal to send Silence Alarm command to BCM instantly.',
 'Proceed with standard AKL procedure - no waiting for alarm timeout.',
 'Smart Pro with ADC2020 emulator',
 'Low',
 '95%+',
 'ADC2020 is the most effective method - silences alarm proactively rather than bypassing.');

-- ============================================================================
-- SECTION 3: GM Global Architecture Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS gm_global_architecture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    architecture TEXT, -- Global A, Global B (VIP)
    can_fd_required BOOLEAN,
    security_token_required BOOLEAN, -- 24-digit token
    vin_12th_digit_rule TEXT, -- For split-year identification
    rpo_code_marker TEXT,
    akl_difficulty TEXT,
    programming_method TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GM Global B (VIP) Vehicles - Server Required
INSERT OR REPLACE INTO gm_global_architecture (make, model, year_start, year_end, architecture, can_fd_required, security_token_required, vin_12th_digit_rule, rpo_code_marker, akl_difficulty, programming_method, special_notes) VALUES
-- Early Adopters (2020)
('Chevrolet', 'Corvette C8', 2020, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Dealer Only', 'SPS2/Techline only', 'E99 ECM heavily encrypted. Physical ECM unlock service often required for tuning. AKL extremely risky.'),
('Cadillac', 'CT5', 2020, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Early VIP adopter'),
('Cadillac', 'CT4', 2020, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Parallel to CT5'),

-- 2021 Full-Size SUVs
('Chevrolet', 'Tahoe', 2021, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'New body style = VIP platform'),
('Chevrolet', 'Suburban', 2021, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Identical to Tahoe'),
('GMC', 'Yukon', 2021, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Identical to Tahoe'),
('GMC', 'Yukon XL', 2021, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Identical to Suburban'),
('Cadillac', 'Escalade', 2021, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Added encryption layers'),
('Buick', 'Envision', 2021, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Redesign moved to VIP'),

-- 2022 Silverado/Sierra SPLIT
('Chevrolet', 'Silverado 1500 Limited', 2022, 2022, 'Global A', 0, 0, '12th digit 0-4', NULL, 'Easy', 'Standard OBD', 'PRE-REFRESH: Old body, column shifter, analog gauges. Standard programming.'),
('Chevrolet', 'Silverado 1500', 2022, 2025, 'Global B (VIP)', 1, 1, '12th digit 5-9', 'J22', 'Very Hard', 'CAN FD + Server Token', 'REFRESH (2022.5+): New dash, digital cluster, center console shifter. VIP architecture.'),
('GMC', 'Sierra 1500 Limited', 2022, 2022, 'Global A', 0, 0, '12th digit 0-4', NULL, 'Easy', 'Standard OBD', 'PRE-REFRESH: Same as Silverado Limited'),
('GMC', 'Sierra 1500', 2022, 2025, 'Global B (VIP)', 1, 1, '12th digit 5-9', 'J22', 'Very Hard', 'CAN FD + Server Token', 'REFRESH (2022.5+)'),

-- 2023+ Mid-Size and New Models
('Chevrolet', 'Colorado', 2023, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'New generation - native Global B'),
('GMC', 'Canyon', 2023, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Parallel to Colorado'),
('GMC', 'Hummer EV', 2022, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Dealer Only', 'SPS2/Techline only', 'Native VIP EV platform'),
('Cadillac', 'Lyriq', 2023, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Dealer Only', 'SPS2/Techline only', 'Native VIP EV platform'),

-- 2024 HD Trucks (THE SURPRISE)
('Chevrolet', 'Silverado 2500HD', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'CRITICAL: 2023 was Global A. 2024 refresh = VIP. New LED DRLs = indicator.'),
('Chevrolet', 'Silverado 3500HD', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', '2023->2024 architecture change'),
('GMC', 'Sierra 2500HD', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Follows Silverado HD'),
('GMC', 'Sierra 3500HD', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Follows Silverado HD'),
('Chevrolet', 'Trax', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Complete redesign = VIP'),
('GMC', 'Acadia', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'Redesign = VIP'),
('Chevrolet', 'Traverse', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Very Hard', 'CAN FD + Server Token', 'All-new Z71/RS = VIP'),
('Chevrolet', 'Blazer EV', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Dealer Only', 'SPS2/Techline only', 'Native VIP EV'),
('Chevrolet', 'Equinox EV', 2024, 2025, 'Global B (VIP)', 1, 1, NULL, NULL, 'Dealer Only', 'SPS2/Techline only', 'Native VIP EV');

-- GM Global A (Legacy - Locksmith Friendly)
INSERT OR REPLACE INTO gm_global_architecture (make, model, year_start, year_end, architecture, can_fd_required, security_token_required, vin_12th_digit_rule, rpo_code_marker, akl_difficulty, programming_method, special_notes) VALUES
('Chevrolet', 'Silverado 2500HD', 2020, 2023, 'Global A', 0, 0, NULL, NULL, 'Easy', 'Standard OBD', 'Legacy HD remained Global A until 2024 refresh'),
('Chevrolet', 'Silverado 3500HD', 2020, 2023, 'Global A', 0, 0, NULL, NULL, 'Easy', 'Standard OBD', 'Legacy HD'),
('Chevrolet', 'Equinox', 2018, 2024, 'Global A', 0, 0, NULL, NULL, 'Easy', 'Standard OBD', '2025 redesign expected to move to VIP'),
('Chevrolet', 'Traverse', 2018, 2023, 'Global A', 0, 0, NULL, NULL, 'Easy', 'Standard OBD', '2024 All-New is VIP'),
('Chevrolet', 'Express Van', 2018, 2025, 'Global A', 0, 0, NULL, NULL, 'Easy', 'Standard OBD', 'Commercial platform - still fully accessible'),
('GMC', 'Savana Van', 2018, 2025, 'Global A', 0, 0, NULL, NULL, 'Easy', 'Standard OBD', 'Twin to Express'),
('Chevrolet', 'Camaro', 2016, 2024, 'Global A+', 0, 0, NULL, NULL, 'Medium', 'Standard OBD', 'Alpha platform avoided full VIP lockdown through discontinuation');

-- ============================================================================
-- SECTION 4: GM 12th Digit VIN Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS gm_vin_12th_digit_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    model_year INTEGER,
    digit_value TEXT,
    architecture TEXT,
    visual_indicators TEXT,
    programming_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO gm_vin_12th_digit_reference (model, model_year, digit_value, architecture, visual_indicators, programming_method) VALUES
('Silverado 1500', 2022, '0-4', 'Global A (Limited)', 'Column shifter, analog gauges, LM2 Duramax diesel', 'Standard OBD - No CAN FD needed'),
('Silverado 1500', 2022, '5-9', 'Global B (Refresh)', 'Center console shifter, digital dash, LZ0 Duramax diesel, J22 RPO code', 'CAN FD adapter + 24-digit server token'),
('Sierra 1500', 2022, '0-4', 'Global A (Limited)', 'Column shifter, analog gauges', 'Standard OBD'),
('Sierra 1500', 2022, '5-9', 'Global B (Refresh)', 'Center console shifter, digital dash, J22 RPO', 'CAN FD + Server Token');

-- ============================================================================
-- SECTION 5: Ford and GM Locksmith Alerts
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- Ford Alerts
('Critical', 'Ford', 'F-150/Bronco/Mach-E', 2021, 2025, 'Active Theft Blocks OBD Access', 'Gateway Module blocks BCM write commands when alarm is active. Standard OBD tools report Communication Failure.', 'All Keys Lost', 'Use 12-Pin Active Alarm Bypass Cable. Connect to GWM behind glovebox. Power tool externally via battery clamps.', 'Ford_BCM_Security_Bypass_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Ford', 'F-150/Bronco/Expedition', 2021, 2025, 'Double Honk = Access Denied', 'Two short horn blasts indicate BCM received programming request but rejected due to Alarm Mode.', 'Key Programming', 'BCM is communicating but locked. Apply bypass cable and retry with Force Ignition procedure.', 'Ford_BCM_Security_Bypass_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Ford', 'Mustang Mach-E', 2021, 2025, 'Motion Sensors Trigger During Programming', 'Ultrasonic interior sensors detect technician movement and re-arm alarm mid-procedure.', 'All Keys Lost', 'Cannot disable via menu in AKL. Must use 12-pin bypass cable which silences alarm proactively.', 'Ford_BCM_Security_Bypass_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Ford', 'F-150/Bronco', 2021, 2025, '902 MHz vs 315 MHz Key Incompatibility', 'Full-size Bronco uses 902 MHz (M3N-A2C931426). Bronco Sport uses 315 MHz (M3N-A2C931423). Keys look identical but incompatible.', 'Key Ordering', 'Verify model before ordering. Full-size Bronco = 902 MHz. Bronco Sport = 315 MHz.', 'Ford_BCM_Security_Bypass_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Ford', 'All 2021+', 2021, 2025, 'AES-128 Kills Cloning', 'Hitag Pro (ID49) uses 128-bit AES encryption. Keys cannot be cloned. Must program new key into BCM.', 'Key Cloning', 'Cloning impossible. Only solution is OBD/bench programming with bypass.', 'Ford_BCM_Security_Bypass_Research.txt', CURRENT_TIMESTAMP),

-- GM Alerts
('Critical', 'Chevrolet', 'Silverado 1500', 2022, 2022, '12th Digit Rule - Split Year Architecture', 'VIN 12th digit determines architecture. 0-4 = Global A (easy). 5-9 = Global B (locked). Visual inspection unreliable.', 'Diagnostics', 'ALWAYS check VIN 12th digit before attempting. Also check for J22 RPO code. Digital dash = VIP.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Chevrolet', 'Silverado 2500/3500 HD', 2024, 2025, '2024 HD Trucks Now Global B', '2023 HD was Global A. 2024 refresh moved to VIP architecture. Many technicians caught off guard.', 'All Keys Lost', 'Check model year carefully. 2024 HD with new LED DRLs = VIP = CAN FD + server token required.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Chevrolet', 'Corvette C8', 2020, 2025, 'E99 ECM Fortress - Dealer Recommended', 'Most hardened Global B target. E99 ECM requires physical unlock service for tuning. AKL extremely risky.', 'All Keys Lost', 'Strongly recommend dealer SPS2. Aftermarket success rate lower than trucks. Bricking risk high.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Chevrolet', 'All Global B', 2020, 2025, 'CAN FD Adapter Mandatory', 'Global B uses CAN FD protocol (5 Mbps vs legacy 500 kbps). Legacy tools hear static noise.', 'OBD Connection', 'Purchase CAN FD adapter for Autel/OBDSTAR/XTool. IM608 Pro II has native support.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Chevrolet', 'All Global B', 2020, 2025, '24-Digit Security Token Required', 'BCM generates session-specific seed requiring server-side calculation. Cannot be bypassed offline.', 'All Keys Lost', 'Internet connection mandatory. Use Autel/OBDSTAR server or SPS2/Techline with NASTF VSP credentials.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Chevrolet', 'All Global B', 2020, 2025, 'Active Alarm Blocks Communication', 'Alarm sounds in AKL scenario. Gateway may block OBDII handshake until alarm times out.', 'All Keys Lost', 'Wait for alarm cycle to complete OR use mechanical key in door if available to silence.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 6: Update vehicles_master with Ford/GM Data
-- ============================================================================
UPDATE vehicles_master SET
    security_system = 'Active Theft + Gateway',
    bypass_cable_required = 1,
    akl_difficulty = 'Hard',
    special_notes = COALESCE(special_notes || ' | ', '') || 'Active Alarm blocks OBD. 12-Pin bypass cable required. 902 MHz Hitag Pro key.'
WHERE make = 'Ford' AND model IN ('F-150', 'Bronco') AND year_start >= 2021;

UPDATE vehicles_master SET
    security_system = 'Active Theft + Gateway + Motion Sensors',
    bypass_cable_required = 1,
    akl_difficulty = 'Very Hard',
    special_notes = COALESCE(special_notes || ' | ', '') || 'Motion sensors re-arm alarm during programming. 12-Pin bypass cable mandatory.'
WHERE make = 'Ford' AND model = 'Mustang Mach-E';

UPDATE vehicles_master SET
    security_system = 'Global B (VIP)',
    can_fd_required = 1,
    akl_difficulty = 'Very Hard',
    special_notes = COALESCE(special_notes || ' | ', '') || 'VIP Architecture. CAN FD adapter + 24-digit server token required.'
WHERE make IN ('Chevrolet', 'GMC', 'Cadillac', 'Buick') 
AND model IN ('Tahoe', 'Suburban', 'Yukon', 'Yukon XL', 'Escalade', 'CT4', 'CT5', 'Colorado', 'Canyon', 'Envision')
AND year_start >= 2021;

UPDATE vehicles_master SET
    security_system = 'Global B (VIP)',
    can_fd_required = 1,
    akl_difficulty = 'Dealer Only',
    special_notes = COALESCE(special_notes || ' | ', '') || 'E99 ECM Fortress. Dealer SPS2 strongly recommended. High bricking risk with aftermarket.'
WHERE make = 'Chevrolet' AND model = 'Corvette' AND year_start >= 2020;

-- Mark completion
SELECT 'Batch 5 Ford and GM Complete' AS status,
       (SELECT COUNT(*) FROM ford_active_alarm_reference) AS ford_entries,
       (SELECT COUNT(*) FROM gm_global_architecture) AS gm_entries;
