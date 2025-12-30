-- Toyota/Lexus Security Architecture Integration
-- Source: Toyota_Lexus_Security_Evolution_Data.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Toyota Security Architecture Eras
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_security_eras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    era_name TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    chip_type TEXT,
    encryption_bits INTEGER,
    tss_version TEXT,
    bypass_required BOOLEAN,
    akl_method TEXT,
    tool_hardware TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO toyota_security_eras (era_name, year_start, year_end, chip_type, encryption_bits, tss_version, bypass_required, akl_method, tool_hardware, description) VALUES
('Legacy Smart Key Era', 2010, 2017, '4D-67/68, G-Chip (DST80)', 80, 'N/A', 0, 'Standard OBD emulator', 'APB112/ADC2015', '40-bit and 80-bit encryption. G-Chip identifiable by "G" stamp on blade. Low difficulty (2/10).'),
('TNGA Transitional Era (8A-AA)', 2018, 2021, 'H-Chip (8A-AA)', 128, 'TSS 2.0/2.5+', 0, 'OBD with emulator', 'APB112/ADC2015', '128-bit AES "AA" page logic. Add Key via OBD. AKL requires emulator to sniff data. Medium difficulty (4/10).'),
('BA Security Paradigm', 2022, 2025, '8A-BA', 128, 'TSS 3.0', 1, '30-Pin Smart ECU bypass MANDATORY', 'G-Box3/ADC2021/FP-30', 'TMLF19D Smart ECU. Gateway blocks OBD programming. Technician must access Smart Key ECU physically. High difficulty (8-10/10).');

-- ============================================================================
-- SECTION 2: Toyota Model Security Matrix
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_model_security (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    platform_code TEXT,
    tss_version TEXT,
    security_chip_type TEXT,
    fcc_id_compatible TEXT,
    board_number_prefix TEXT,
    bypass_required BOOLEAN,
    bypass_connector_type TEXT,
    ecu_location TEXT,
    akl_difficulty_score INTEGER,
    tool_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO toyota_model_security (model_name, year_start, year_end, platform_code, tss_version, security_chip_type, fcc_id_compatible, board_number_prefix, bypass_required, bypass_connector_type, ecu_location, akl_difficulty_score, tool_notes) VALUES
-- Toyota Models
('Camry', 2018, 2022, 'XV70', 'TSS 2.5+', '8A-AA', 'HYQ14FBC', '231451-0351', 0, 'OBDII', 'N/A - OBD accessible', 4, 'Standard OBD. Use APB112/ADC2015 emulator for AKL.'),
('Camry', 2023, 2025, 'XV70 Refresh', 'TSS 3.0', '8A-BA', 'HYQ14FBX', '231451-3450', 1, '30-Pin Smart ECU', 'Behind glovebox', 7, 'BA Logic confirmed. Requires G-Box3 or ADC2021 cable at Smart ECU behind glovebox.'),
('RAV4', 2019, 2021, 'XA50', 'TSS 2.0', '8A-AA', 'HYQ14FBC', '231451-0351', 0, 'OBDII', 'N/A - OBD accessible', 4, 'Standard OBD procedure.'),
('RAV4', 2022, 2025, 'XA50 Facelift', 'TSS 2.5/3.0', '8A-BA', 'HYQ14FLA', '231451-3450', 1, '30-Pin Smart ECU', 'High behind glovebox', 8, 'Smart Box located high behind glovebox. Extensive dash trim removal required for AKL bypass.'),
('Tundra', 2022, 2025, 'F1', 'TSS 3.0', '8A-BA', 'HYQ14FBX', '231451-0031', 1, '30-Pin Smart ECU', 'Passenger kick panel area', 9, 'TMLF19D ECU. Difficult access behind passenger kick panel. Requires Lonsdor FP-30 or Autel G-Box3.'),
('Sequoia', 2023, 2025, 'F1', 'TSS 3.0', '8A-BA', 'HYQ14FBX', '231451-0031', 1, '30-Pin Smart ECU', 'Passenger kick panel', 9, 'Inherits Tundra architecture. Significant labor time.'),
('Highlander', 2020, 2022, 'XU70', 'TSS 2.5+', '8A-AA/BA', 'HYQ14FLA', '231451-3450', 0, 'OBDII (check build date)', 'N/A', 5, 'Bridge model. Late-model may carry BA logic depending on build date and firmware.'),
('Sienna', 2021, 2021, 'XL40', 'TSS 2.5', '8A-AA', 'HYQ14FLA', '231451-3450', 0, 'OBDII', 'N/A', 4, 'Primarily 8A-AA.'),
('Sienna', 2022, 2025, 'XL40', 'TSS 3.0', '8A-BA', 'HYQ14FLA', '231451-3450', 1, '30-Pin Smart ECU', 'Deep in minivan dashboard', 9, 'Sienna HV explicitly requires 30-pin cable. Notoriously difficult ECU access due to minivan layout.'),
('4Runner', 2020, 2021, 'N310', 'TSS-P/2.0', '8A-AA', 'HYQ14FBA/FLA', '281451-2110', 0, 'OBDII', 'N/A', 4, 'Updated to Smart Key but retained 8A-AA logic.'),
('4Runner', 2022, 2025, 'N310', 'TSS 2.5/3.0', '8A-AA/BA', 'HYQ14FLA', '231451-3450', 0, 'OBDII (check VIN)', 'N/A', 5, 'Higher trims with Panoramic View Monitor may require bypass. Check VIN.'),
('Corolla', 2014, 2019, 'E170/E180', 'TSS 1.0', '8A-AA (H)', 'HYQ14FBA', '281451-0020', 0, 'OBDII', 'N/A', 3, 'Standard H-Chip era. Low difficulty.'),
('Corolla', 2023, 2025, 'E210 Facelift', 'TSS 3.0', '8A-BA', 'HYQ14FBX', '231451-xxxx', 1, '30-Pin Smart ECU', 'Behind glovebox', 7, 'Facelift models with TSS 3.0 moved to BA system.'),

-- Lexus Models
('NX 350', 2022, 2025, 'GA-K', 'LSS+ 3.0', '8A-BA', 'HYQ14FLC', '231451-xxxx', 1, '30-Pin Certification ECU', 'Deep in driver-side dashboard', 10, 'Certification ECU buried deep in driver dash. Severe labor time for AKL. Server calculation needed.'),
('RX 350', 2023, 2025, 'GA-K', 'LSS+ 3.0', '8A-BA', 'HYQ14FLC', '231451-xxxx', 1, '30-Pin Certification ECU', 'Driver-side dashboard behind reinforcement bar', 9, 'New Gen Architecture. Bypass mandatory for AKL. OBD blocked.'),
('LX 600', 2022, 2025, 'F1', 'LSS+ 3.0', '8A-BA', 'HYQ14FLC', '231451-xxxx', 1, '30-Pin Certification ECU', 'Similar to Tundra', 9, 'Mirrors Tundra F1 platform. Aggressive alarm. Maintain 13.5V+ during bypass.');

-- ============================================================================
-- SECTION 3: Toyota Board Number Cross-Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_board_crossref (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fcc_id TEXT NOT NULL,
    board_id_prefix TEXT NOT NULL,
    chip_logic TEXT,
    frequency_mhz INTEGER,
    primary_models TEXT,
    year_range TEXT,
    compatibility_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO toyota_board_crossref (fcc_id, board_id_prefix, chip_logic, frequency_mhz, primary_models, year_range, compatibility_notes) VALUES
('HYQ14FBA', '281451-0020', '8A-AA (H)', 315, 'Avalon 2013-2018, Camry 2012-2017, Corolla 2014-2019', '2012-2019', 'Most ubiquitous "G-Board". Legacy H-Chip architecture.'),
('HYQ14FBA', '281451-2110', '8A-AA (H)', 315, 'Tacoma 2016-2019, Highlander 2016-2019', '2016-2019', 'Older TNGA transition. Different frequency modulation/antenna config.'),
('HYQ14FBC', '231451-0351', '8A-AA (H)', 315, 'Camry 2018-2022, RAV4 2019-2021, Prius 2016-2021', '2016-2022', 'Standard TNGA board. Different rolling code algorithm than 0020.'),
('HYQ14FLA', '231451-3450', '8A-AA/BA', 315, 'Highlander 2020+, RAV4 Prime, Venza 2021+, 4Runner 2021+', '2020-2025', 'BRIDGE BOARD - Late-model may carry BA logic. Check build date.'),
('HYQ14FBX', '231451-0031', '8A-BA', 315, 'Tundra 2022+, Sequoia 2023+', '2022-2025', 'Definitive BA system. TMLF19D ECU. 30-Pin bypass MANDATORY.'),
('HYQ14FBX', '231451-3041', '8A-BA', 315, 'Tundra 2022+, Sequoia 2023+', '2022-2025', 'Alternate BA board for same models.'),
('HYQ14FLC', '231451-xxxx', '8A-BA', 315, 'Lexus NX 2022+, Lexus RX 2023+, Lexus LX600', '2022-2025', 'Lexus-specific BA logic. Universally indicates 30-pin bypass requirement.');

-- ============================================================================
-- SECTION 4: Update vehicles
-- ============================================================================
UPDATE vehicles SET
    security_system = 'Toyota 8A-AA (H-Chip TSS 2.0/2.5)',
    bypass_cable_required = 0,
    akl_difficulty = 'Medium',
    special_notes = 'Standard OBD programming with emulator (APB112/ADC2015). Add Key via OBD accessible.'
WHERE make = 'Toyota' AND year_start >= 2018 AND year_start <= 2021
AND model IN ('Camry', 'RAV4', 'Highlander', 'Sienna', 'Prius', 'Avalon', 'Corolla');

UPDATE vehicles SET
    security_system = 'Toyota 8A-BA (TSS 3.0)',
    bypass_cable_required = 1,
    akl_difficulty = 'High',
    special_notes = '30-PIN BYPASS MANDATORY. TMLF19D Smart ECU. OBD programming blocked. Requires G-Box3/ADC2021/FP-30 cable at Smart ECU.'
WHERE make = 'Toyota' AND year_start >= 2022
AND model IN ('Tundra', 'Sequoia', 'Sienna', 'RAV4');

UPDATE vehicles SET
    security_system = 'Lexus LSS+ 3.0 (8A-BA)',
    bypass_cable_required = 1,
    akl_difficulty = 'Severe',
    special_notes = 'Certification ECU deeply buried in driver dash. 30-PIN BYPASS MANDATORY. Extreme labor time for AKL (10/10 difficulty).'
WHERE make = 'Lexus' AND year_start >= 2022
AND model IN ('NX', 'RX', 'LX');

-- ============================================================================
-- SECTION 5: Locksmith Alerts for Toyota/Lexus
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Toyota', 'Tundra', 2022, 2025, '8A-BA System - OBD Programming Blocked', 'TMLF19D Smart ECU with TSS 3.0. Gateway blocks all OBD key programming. This is NOT a tool limitation - it is architectural.', 'All Keys Lost', '30-Pin bypass cable (Lonsdor FP-30, Autel G-Box3, ADC2021) MANDATORY. Access Smart ECU behind passenger kick panel.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP),
('Critical', 'Toyota', 'RAV4', 2022, 2025, '2022 Facelift = BA Architecture (Hard Cut-Off)', 'The 2022 facelift introduced 8A-BA system. Any 2022+ RAV4 requires 30-pin bypass for AKL. This is a HARD cut-off from 2019-2021 models.', 'All Keys Lost', '30-Pin bypass required. Smart Key ECU located high behind glovebox. Extensive trim removal. Difficulty 8/10.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP),
('Critical', 'Lexus', 'NX', 2022, 2025, 'Deep Dash ECU Location - 10/10 Difficulty', 'The Certification ECU is buried deep in the driver-side dashboard behind reinforcement bar. Most difficult ECU access in fleet.', 'All Keys Lost', 'Plan significant labor time. Dashboard disassembly required. Server calculation needed. Consider declining job if unfamiliar.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP),
('Warning', 'Toyota', 'Highlander', 2020, 2022, 'Bridge Model - Check Build Date for BA Logic', '231451-3450 board can carry EITHER AA or BA logic depending on specific build date and firmware version.', 'Pre-Job Assessment', 'Verify TSS version before quoting. Late 2021/early 2022 builds may require bypass despite appearing standard.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP),
('Warning', 'Toyota', 'Sienna', 2022, 2025, 'Minivan Dashboard = Extreme ECU Access Difficulty', 'Smart ECU access in Sienna is notoriously difficult due to minivan dashboard layout. Difficulty 9/10.', 'All Keys Lost', 'Allocate extra labor time. Consider specialized minivan trim tools. Document dashboard removal steps.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP),
('Info', 'Toyota', 'All Models', 2018, 2025, 'Board Number > FCC ID for Compatibility', 'Unlike other manufacturers, Toyota Board Number (printed on PCB) is the definitive compatibility designator. Keys with same FCC ID but different Board IDs are frequently INCOMPATIBLE.', 'Key Ordering', 'Always verify Board ID prefix (281451 vs 231451) before ordering. Do NOT rely solely on FCC ID.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP),
('Info', 'Toyota', 'All Models', 2018, 2025, 'TSS Version = Security Architecture Proxy', 'Toyota Safety Sense version is the most reliable non-invasive indicator of security level. TSS 2.0/2.5 = OBD accessible. TSS 3.0 = Bypass required.', 'Pre-Job Assessment', 'Check for TSS 3.0 badge or features before tool selection. If TSS 3.0, plan for 30-Pin bypass.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP),
('Warning', 'Lexus', 'LX600', 2022, 2025, 'Aggressive Alarm + Voltage Sensitivity', 'Flagship model has more aggressive alarm. Gateway can shut down connection if battery voltage drops during bypass.', 'All Keys Lost', 'Maintain perfectly stable 13.5V+ during entire bypass procedure. Use battery maintainer.', 'Toyota_Lexus_Security_Evolution_Data.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Toyota/Lexus Security Migration Complete' AS status,
       (SELECT COUNT(*) FROM toyota_security_eras) AS era_entries,
       (SELECT COUNT(*) FROM toyota_model_security) AS model_entries,
       (SELECT COUNT(*) FROM toyota_board_crossref) AS board_entries;
