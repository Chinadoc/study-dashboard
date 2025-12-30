-- GM Global A to Global B (VIP) Architecture Integration
-- Source: GM_Global_B_Key_Programming_Research.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: GM Architecture Classification Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS gm_architecture_classification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    architecture TEXT NOT NULL, -- Global A, Global B, Hybrid
    era TEXT,
    year_range TEXT,
    protocol TEXT, -- GMLAN, CAN FD
    security_method TEXT,
    can_fd_required BOOLEAN,
    server_token_required BOOLEAN,
    token_digits INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gm_architecture_classification (architecture, era, year_range, protocol, security_method, can_fd_required, server_token_required, token_digits, description) VALUES
('Global A', 'Legacy', '2008-2020', 'GMLAN/CAN', 'Static seed-key challenge', 0, 0, 0, 'Standard CAN bus. Local PIN calculation. Locksmith accessible with standard tools.'),
('Global A+ (Transitional)', 'Transitional', '2020-2021', 'CAN with enhanced encryption', 'Enhanced seed-key', 0, 0, 0, 'Camaro Alpha platform variant. Enhanced but not fully locked.'),
('Global B (VIP)', 'Modern', '2020-2025', 'CAN FD + Automotive Ethernet', 'Dynamic 24-digit server token', 1, 1, 24, 'Vehicle Intelligence Platform. Centralized cybersecurity gateway. OTA-capable. Server-dependent authentication MANDATORY.');

-- ============================================================================
-- SECTION 2: GM Model Architecture Master List
-- ============================================================================
CREATE TABLE IF NOT EXISTS gm_model_architecture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    architecture TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    special_identifier TEXT, -- e.g., 12th digit rule
    can_fd_required BOOLEAN,
    server_token_required BOOLEAN,
    ecm_type TEXT,
    akl_difficulty TEXT,
    tool_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Global B (Hard Lock) Vehicles
INSERT INTO gm_model_architecture (make, model, architecture, year_start, year_end, special_identifier, can_fd_required, server_token_required, ecm_type, akl_difficulty, tool_notes) VALUES
('Chevrolet', 'Corvette C8', 'Global B', 2020, 2025, 'Native VIP from launch', 1, 1, 'E99 (Heavily encrypted)', 'Severe', 'The pioneer. E99 ECM requires physical unlock for tuning. AKL via SPS2 preferred. HIGH BRICKING RISK with aftermarket tools.'),
('Cadillac', 'CT5', 'Global B', 2020, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Early adopter. CAN FD Adapter + server token mandatory.'),
('Cadillac', 'CT4', 'Global B', 2020, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Parallel architecture to CT5.'),
('Chevrolet', 'Tahoe', 'Global B', 2021, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'New body style = full VIP transition.'),
('Chevrolet', 'Suburban', 'Global B', 2021, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Identical architecture to Tahoe.'),
('GMC', 'Yukon', 'Global B', 2021, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Identical architecture to Tahoe/Suburban.'),
('GMC', 'Yukon XL', 'Global B', 2021, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Identical architecture to Suburban.'),
('Cadillac', 'Escalade', 'Global B', 2021, 2025, NULL, 1, 1, 'VIP + Premium encryption', 'High', 'Added encryption layers for high-end features.'),
('Buick', 'Envision', 'Global B', 2021, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Transitioned with major redesign.'),
('Chevrolet', 'Silverado 1500', 'Global B', 2022, 2025, 'VIN 12th digit ≥ 5 (Refresh only)', 1, 1, 'Standard VIP', 'High', 'CRITICAL: Only "Refresh" models. J22 RPO verification. 12th digit < 5 = Global A.'),
('GMC', 'Sierra 1500', 'Global B', 2022, 2025, 'VIN 12th digit ≥ 5 (Refresh only)', 1, 1, 'Standard VIP', 'High', 'Follow same VIN logic as Silverado.'),
('Chevrolet', 'Colorado', 'Global B', 2023, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'New generation native Global B/CAN FD.'),
('GMC', 'Canyon', 'Global B', 2023, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Parallel rollout to Colorado.'),
('Chevrolet', 'Trax', 'Global B', 2024, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Complete redesign moved to locked platform.'),
('Chevrolet', 'Silverado 2500HD', 'Global B', 2024, 2025, '2024 Refresh with digital dash', 1, 1, 'Standard VIP', 'High', 'CRITICAL: 2020-2023 HD = Global A. 2024+ = Global B.'),
('Chevrolet', 'Silverado 3500HD', 'Global B', 2024, 2025, '2024 Refresh with digital dash', 1, 1, 'Standard VIP', 'High', 'Same transition as 2500HD.'),
('GMC', 'Sierra 2500HD', 'Global B', 2024, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Follows Silverado HD timeline.'),
('GMC', 'Sierra 3500HD', 'Global B', 2024, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Follows Silverado HD timeline.'),
('GMC', 'Acadia', 'Global B', 2024, 2025, NULL, 1, 1, 'Standard VIP', 'High', 'Confirmed transition for 2024 redesign.'),
('Chevrolet', 'Traverse', 'Global B', 2024, 2025, 'All-New Z71/RS', 1, 1, 'Standard VIP', 'High', '2024 "All-New" moves to Global B.'),
('GMC', 'Hummer EV', 'Global B', 2022, 2025, NULL, 1, 1, 'Native EV VIP', 'High', 'Native Global B electric platform.'),
('Cadillac', 'Lyriq', 'Global B', 2023, 2025, NULL, 1, 1, 'Native EV VIP', 'High', 'Native Global B EV platform.'),
('Chevrolet', 'Blazer EV', 'Global B', 2024, 2025, NULL, 1, 1, 'Ultium VIP', 'High', 'Native Global B electric platform. High security integration.'),
('Chevrolet', 'Equinox EV', 'Global B', 2024, 2025, NULL, 1, 1, 'Ultium VIP', 'High', 'Native Global B electric platform.'),

-- Global A (Locksmith Friendly) Vehicles
('Chevrolet', 'Silverado 1500 Limited', 'Global A', 2022, 2022, 'VIN 12th digit ≤ 4 (Pre-Refresh)', 0, 0, 'Legacy', 'Low', 'Pre-Refresh "Limited" model. Standard OBD programming.'),
('GMC', 'Sierra 1500 Limited', 'Global A', 2022, 2022, 'VIN 12th digit ≤ 4', 0, 0, 'Legacy', 'Low', 'Pre-Refresh "Limited" model. Standard OBD programming.'),
('Chevrolet', 'Silverado 2500HD', 'Global A', 2020, 2023, NULL, 0, 0, 'Legacy', 'Low', 'HD trucks remained Global A through 2023. 2024 is cutoff.'),
('Chevrolet', 'Silverado 3500HD', 'Global A', 2020, 2023, NULL, 0, 0, 'Legacy', 'Low', 'Same as 2500HD.'),
('GMC', 'Sierra 2500HD', 'Global A', 2020, 2023, NULL, 0, 0, 'Legacy', 'Low', 'Same as Silverado HD.'),
('GMC', 'Sierra 3500HD', 'Global A', 2020, 2023, NULL, 0, 0, 'Legacy', 'Low', 'Same as Silverado HD.'),
('Chevrolet', 'Equinox', 'Global A', 2018, 2024, NULL, 0, 0, 'Legacy', 'Low', '2024 model remains on older platform. 2025 expected to migrate.'),
('Chevrolet', 'Traverse', 'Global A', 2018, 2023, NULL, 0, 0, 'Legacy', 'Low', 'Pre-2024 models only.'),
('Chevrolet', 'Express Van', 'Global A', 2018, 2025, NULL, 0, 0, 'Legacy', 'Low', 'Legacy architecture continues. One of the most accessible for programming.'),
('GMC', 'Savana Van', 'Global A', 2018, 2025, NULL, 0, 0, 'Legacy', 'Low', 'Twin to Express Van. Legacy remains.'),
('Chevrolet', 'Camaro', 'Global A+', 2016, 2024, 'Alpha platform variant', 0, 0, 'Alpha A+', 'Medium', 'Remained on Alpha platform through discontinuation. Avoided full Global B lockdown.'),

-- Hybrid/Edge Cases
('Chevrolet', 'Bolt EV', 'Hybrid', 2022, 2023, 'CAN FD but hybrid logic', 1, 0, 'EV Hybrid', 'Medium', 'Requires CAN FD adapter. Add Key often less friction than full VIP. AKL still problematic.'),
('Chevrolet', 'Bolt EUV', 'Hybrid', 2022, 2023, 'CAN FD but hybrid logic', 1, 0, 'EV Hybrid', 'Medium', 'Same as Bolt EV. Add Key accessible. AKL has hurdles.');

-- ============================================================================
-- SECTION 3: GM 12th Digit VIN Decoder
-- ============================================================================
CREATE TABLE IF NOT EXISTS gm_vin_12th_digit_decoder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    digit_value TEXT NOT NULL,
    architecture TEXT NOT NULL,
    applies_to TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gm_vin_12th_digit_decoder (digit_value, architecture, applies_to, description) VALUES
('0', 'Global A', '2022 Silverado/Sierra 1500 Limited', 'Pre-Refresh. Standard OBD programming accessible.'),
('1', 'Global A', '2022 Silverado/Sierra 1500 Limited', 'Pre-Refresh. Standard OBD programming accessible.'),
('2', 'Global A', '2022 Silverado/Sierra 1500 Limited', 'Pre-Refresh. Standard OBD programming accessible.'),
('3', 'Global A', '2022 Silverado/Sierra 1500 Limited', 'Pre-Refresh. Standard OBD programming accessible.'),
('4', 'Global A', '2022 Silverado/Sierra 1500 Limited', 'Pre-Refresh. Standard OBD programming accessible.'),
('5', 'Global B', '2022.5 Silverado/Sierra 1500 Refresh', 'Refresh model. 24-digit server token REQUIRED.'),
('6', 'Global B', '2022.5 Silverado/Sierra 1500 Refresh', 'Refresh model. 24-digit server token REQUIRED.'),
('7', 'Global B', '2022.5 Silverado/Sierra 1500 Refresh', 'Refresh model. 24-digit server token REQUIRED.'),
('8', 'Global B', '2022.5 Silverado/Sierra 1500 Refresh', 'Refresh model. 24-digit server token REQUIRED.'),
('9', 'Global B', '2022.5 Silverado/Sierra 1500 Refresh', 'Refresh model. 24-digit server token REQUIRED.');

-- ============================================================================
-- SECTION 4: Update vehicles
-- ============================================================================
UPDATE vehicles SET
    immobilizer_system = 'GM Global B (VIP)',
    bypass_cable_required = 0, -- No physical bypass, but CAN FD adapter required
    can_fd_required = 1,
    akl_difficulty = 'High',
    special_notes = 'CAN FD Adapter MANDATORY. 24-digit server token required. AKL via SPS2 or Autel server calculation (5-10 min). Internet required.'
WHERE make IN ('Chevrolet', 'GMC', 'Cadillac', 'Buick')
AND model IN ('Tahoe', 'Suburban', 'Yukon', 'Escalade', 'CT4', 'CT5', 'Envision', 'Colorado', 'Canyon', 'Trax', 'Acadia', 'Hummer EV', 'Lyriq', 'Blazer EV', 'Equinox EV')
AND year_start >= 2021;

UPDATE vehicles SET
    immobilizer_system = 'GM Global B (VIP)',
    can_fd_required = 1,
    akl_difficulty = 'Severe',
    special_notes = 'E99 ECM = MOST HARDENED TARGET. High bricking risk with aftermarket tools. SPS2 strongly preferred. Tuning requires physical ECM unlock.'
WHERE make = 'Chevrolet' AND model = 'Corvette' AND year_start >= 2020;

UPDATE vehicles SET
    immobilizer_system = 'GM Global A',
    can_fd_required = 0,
    akl_difficulty = 'Low',
    special_notes = 'Legacy architecture. Standard OBD programming. Split year check required for Silverado 1500.'
WHERE make IN ('Chevrolet', 'GMC')
AND model IN ('Express', 'Savana', 'Equinox')
AND year_start <= 2024;

-- ============================================================================
-- SECTION 5: Locksmith Alerts for GM
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_content, affected_operation, mitigation, source_document, created_at) VALUES
('Critical', 'Chevrolet', 'Corvette C8', 2020, 2025, 'E99 ECM = Unbreakable Fortress', 'E99 ECM employs the most rigorous security in GM lineup. Aftermarket tuners cannot flash via OBD. AKL has HIGH BRICKING RISK.', 'All Keys Lost', 'Use dealer SPS2 process. Autel support listed but lower success rate. Failed midway = bricks state requiring dealer tow.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Chevrolet', 'Silverado 1500', 2022, 2022, '12th Digit Rule - Two Different Trucks', 'GM manufactured TWO versions: Limited (Global A) and Refresh (Global B). Using wrong protocol can BRICK module.', 'Pre-Job Identification', 'Check VIN 12th digit. ≤4 = Global A (standard). ≥5 = Global B (24-digit token). Verify J22 RPO code.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Chevrolet', 'Silverado 2500HD', 2024, 2025, '2024 HD Truck Surprise - Now Global B', 'The 2020-2023 HD trucks were Global A. The 2024 refresh moved HD lineup to Global B. Tools that worked on 2023 FAIL on 2024.', 'Tool Selection', 'If 2024 HD has new digital dashboard and C-shaped DRLs, it is Global B. Requires 24-digit token.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'GM', 'All Global B', 2020, 2025, 'Active Alarm Blocks OBD Port', 'Global B vehicles with active alarm can lock down communication ports, preventing initial handshake.', 'AKL Communication', 'Silence alarm before connecting. Wait for timeout period or use mechanical key in door if available.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'GM', 'All Global B', 2020, 2025, '24-Digit Token Has Session Timeout', 'Once seed is generated, limited window (seconds/minutes) to provide response. Slow internet = expired session.', 'Server Calculation', 'Use stable internet. If server lags, process must restart with new seed. Plan for 5-10 minute calculation.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Chevrolet', 'Bolt EV/EUV', 2022, 2023, 'Hybrid Logic - CAN FD Required but Softer Security', 'Requires CAN FD adapter but security logic more permeable than full VIP. Add Key often works. AKL still problematic.', 'Tool Selection', 'CAN FD adapter is REQUIRED. But security barriers slightly lower than CT5/Silverado.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Info', 'GM', 'All Global B', 2020, 2025, 'Autel = Market Leader for Aftermarket Access', 'Autel (IM608 Pro II) with CAN FD Adapter currently has best aftermarket success rate for 24-digit calculation.', 'Tool Recommendation', 'Autel CAN FD Adapter mandatory. Select "CANFD Smart Key" menu. Server calculation 5-10 min. Depends on Autel server uptime.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP),
('Info', 'GM', 'All Models', 2020, 2025, 'Radio/HVAC Lockout After Failed Programming', 'Failed programming can desynchronize BCM from other modules, locking radio/climate.', 'Error Recovery', 'Requires "Module Setup" or "Configuration" via OEM SPS2 to resynchronize VIN across modules.', 'GM_Global_B_Key_Programming_Research.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'GM Global A/B Architecture Migration Complete' AS status,
       (SELECT COUNT(*) FROM gm_architecture_classification) AS classification_entries,
       (SELECT COUNT(*) FROM gm_model_architecture) AS model_entries,
       (SELECT COUNT(*) FROM gm_vin_12th_digit_decoder) AS vin_decoder_entries;
