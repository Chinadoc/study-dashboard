-- Toyota HYQ14FBx Board Classification Integration
-- Source: Toyota_Key_Chip_Specification_Research.txt (Deep Research)
-- Date: 2025-12-27

-- ============================================================================
-- SECTION 1: Toyota Chip Architecture Classification
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_chip_architecture (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    architecture TEXT NOT NULL,
    chip_manufacturer TEXT,
    chip_type TEXT,
    page1_config TEXT,
    encryption_bits INTEGER,
    smart_ecu TEXT,
    platform TEXT,
    bypass_required TEXT,
    programming_difficulty TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO toyota_chip_architecture (architecture, chip_manufacturer, chip_type, page1_config, encryption_bits, smart_ecu, platform, bypass_required, programming_difficulty, description) VALUES
('Legacy 8A', 'Texas Instruments', 'DST-AES', '88, A8, A9', 128, 'TMLF12/15', 'Pre-TNGA / Early TNGA', 'No - OBD accessible', 'Low-Medium', 'Standard H-Chip smart system. Can be simulated via OBD emulators. The "easy" Toyota.'),
('8A-BA', 'Texas Instruments', 'DST-AES', 'BA', 128, 'TMLF19D (Denso)', 'TNGA-F (Trucks/SUVs)', 'YES - 30-Pin Cable MANDATORY', 'High', 'Modified memory structure. Rolling code prevents OBD bypass. Requires ADP adapter or Toyota-30 cable.'),
('4A', 'NXP Semiconductors', 'HITAG AES', 'N/A (NXP protocol)', 128, 'TMLF19T (Tokai Rika)', 'TNGA-C/K (Sedans/Compacts)', 'YES - G-Box or CAN Direct', 'High', 'Complete departure from TI. Different encryption protocol. Cannot physically communicate with 8A.');

-- ============================================================================
-- SECTION 2: Toyota Board ID Master Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_board_id_master (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id TEXT NOT NULL,
    board_marking TEXT,
    architecture TEXT NOT NULL,
    chip_type TEXT,
    fcc_id TEXT,
    frequency_mhz INTEGER,
    keyway TEXT,
    primary_vehicles TEXT,
    year_range TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO toyota_board_id_master (board_id, board_marking, architecture, chip_type, fcc_id, frequency_mhz, keyway, primary_vehicles, year_range, notes) VALUES
-- 4A Architecture (NXP HITAG AES)
('2561', '231451-2561 "G"', '4A', 'NXP HITAG AES (NCF29A1M)', 'HYQ14FBW', 315, 'TOY51 (LXP90)', 'Camry 2025, Corolla 2023+, Corolla Cross 2022+, Prius 2023+, GR Corolla 2023+', '2022-2025', 'THE NEW STANDARD for Toyota sedans. High volume. Stock this for future.'),
('2000', '231451-2000', '4A', 'NXP HITAG AES', 'HYQ14FBN', 315, 'TOY51', 'Corolla 2019-2022, Corolla Hatchback 2019-2022', '2019-2022', 'Predecessor to FBW. Mislabeled as "Chip H" in some catalogs. Strictly requires 4A software.'),

-- 8A-BA Architecture (TI DST-AES with BA config)
('3041', '231451-3041 "G"', '8A-BA', 'TI DST-AES (Page 1 = BA)', 'HYQ14FBX', 315, 'TOY51', 'Tundra 2022+, Tacoma 2024, Sequoia 2023+, Land Cruiser 2024, Grand Highlander 2024, Crown 2023+, Sienna 2021+, Venza 2021+', '2021-2025', 'THE 8A-BA HEAVYWEIGHT. TNGA-F trucks and flagship SUVs. 30-Pin bypass MANDATORY.'),
('3450', '231451-3450', '8A-BA', 'TI DST-AES (Page 1 = BA)', 'HYQ14FLA', 315, 'TOY51', 'RAV4 2022+, 4Runner 2022-2024, Highlander 2021-2023', '2021-2025', 'Crossover variant of 8A-BA. Same architecture as FBX but different shell.'),

-- Legacy 8A Architecture (TI DST-AES with 88 config)
('0010', '231451-0010 "G"', 'Legacy 8A', 'TI DST-AES (Page 1 = 88/A9)', 'HYQ14FBB', 315, 'TOY51', 'Tacoma 2016-2023, 4Runner 2020-2021, Tundra 2018-2021, Land Cruiser 2020-2021, Lexus LX570 2016-2021', '2016-2023', 'LAST OF THE "EASY" TOYOTAS. Does NOT require 30-Pin bypass. Standard OBD.'),
('0351', '231451-0351', 'Legacy 8A', 'TI DST-AES (Page 1 = 88)', 'HYQ14FBC', 315, 'TOY51', 'Camry 2018-2022, RAV4 2019-2021', '2018-2022', 'Transitional TNGA. Still accessible via OBD.');

-- ============================================================================
-- SECTION 3: Toyota Vehicle Key Mapping (Exhaustive)
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_vehicle_key_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    fcc_id TEXT,
    board_id TEXT,
    architecture TEXT,
    chip_type TEXT,
    oem_part_number TEXT,
    bypass_cable TEXT,
    akl_difficulty INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO toyota_vehicle_key_mapping (model, year_start, year_end, fcc_id, board_id, architecture, chip_type, oem_part_number, bypass_cable, akl_difficulty, notes) VALUES
-- 4A Architecture (Sedans/Compacts)
('Camry', 2025, 2025, 'HYQ14FBW', '2561', '4A', 'NXP HITAG AES', '8990H-AQ010', 'G-Box3 or CAN Direct', 8, 'NEW GENERATION. End of 8A era for best-selling sedan. Now aligned with Corolla 4A.'),
('Camry', 2018, 2024, 'HYQ14FBC', '0351', 'Legacy 8A', 'TI DST-AES', '8990H-06010', 'OBDII accessible', 4, 'XV70 generation. Standard OBD with emulator.'),
('Corolla', 2023, 2025, 'HYQ14FBW', '2561', '4A', 'NXP HITAG AES', '8990H-12350', 'G-Box3 or CAN Direct', 7, 'Password-free matching available on some tools.'),
('Corolla', 2019, 2022, 'HYQ14FBN', '2000', '4A', 'NXP HITAG AES', '8990H-12180', 'CAN Direct', 7, 'Early 4A adopter.'),
('Corolla Cross', 2022, 2025, 'HYQ14FBW', '2561', '4A', 'NXP HITAG AES', '8990H-0A010', 'G-Box3', 7, 'Shares key with Corolla.'),
('Prius', 2023, 2024, 'HYQ14FBW', '2561', '4A', 'NXP HITAG AES', '8990H-47240', 'G-Box3', 7, 'New generation hybrid.'),
('GR Corolla', 2023, 2025, 'HYQ14FBW', '2561', '4A', 'NXP HITAG AES', '8990H-12460', 'G-Box3', 7, 'Performance variant. Same electronics.'),

-- 8A-BA Architecture (Trucks/Large SUVs)
('Tundra', 2022, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-0C011', 'Toyota-30 Pin MANDATORY', 9, 'TMLF19D Smart Box. Notoriously difficult. Bypass behind passenger kick panel.'),
('Tacoma', 2024, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-0C030', 'Toyota-30 Pin MANDATORY', 9, 'New generation. Inherited from Tundra.'),
('Tacoma', 2016, 2023, 'HYQ14FBB', '0010', 'Legacy 8A', 'TI DST-AES', '89904-0C050', 'OBDII accessible', 4, '3rd Gen. Last of the easy Tacomas.'),
('Sequoia', 2023, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-0C020', 'Toyota-30 Pin MANDATORY', 9, 'Shares F1 platform with Tundra.'),
('Land Cruiser', 2024, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-60XXX', 'Toyota-30 Pin MANDATORY', 9, '250 Series.'),
('Land Cruiser', 2020, 2021, 'HYQ14FBB', '0010', 'Legacy 8A', 'TI DST-AES', '89904-60X20', 'OBDII accessible', 4, 'Last of 200 series.'),
('Grand Highlander', 2024, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-0E330', 'Toyota-30 Pin MANDATORY', 8, 'New large crossover.'),
('Crown', 2023, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-30190', 'Toyota-30 Pin MANDATORY', 8, 'Sedan but uses truck electronics.'),
('Sienna', 2021, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-08020', 'Toyota-30 Pin MANDATORY', 9, 'Uses TNGA-K but shares TMLF19D with trucks. Power sliding doors.'),
('Venza', 2021, 2024, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-48120', 'Toyota-30 Pin MANDATORY', 8, 'Hybrid crossover.'),

-- 8A-BA Architecture (Crossovers - FLA variant)
('RAV4', 2022, 2025, 'HYQ14FLA', '3450', '8A-BA', 'TI DST-AES', '8990H-0R200', 'Toyota-30 Pin MANDATORY', 8, 'Facelift model. 30-Pin required.'),
('RAV4', 2019, 2021, 'HYQ14FBC', '0351', 'Legacy 8A', 'TI DST-AES', '8990H-42XXX', 'OBDII accessible', 4, 'Pre-facelift. Standard OBD.'),
('4Runner', 2022, 2024, 'HYQ14FLA', '3450', '8A-BA', 'TI DST-AES', '8990H-35010', 'Toyota-30 Pin MANDATORY', 8, 'MID-CYCLE SWITCH: 2022+ uses 8A-BA despite same exterior.'),
('4Runner', 2020, 2021, 'HYQ14FBB', '0010', 'Legacy 8A', 'TI DST-AES', '89904-35060', 'OBDII accessible', 4, 'Same exterior as 2022 but different electronics!'),
('Highlander', 2021, 2023, 'HYQ14FLA', '3450', '8A-BA', 'TI DST-AES', '8990H-0E370', 'Toyota-30 Pin MANDATORY', 8, '4th Gen facelift.'),

-- Lexus (8A-BA)
('LX 600', 2022, 2025, 'HYQ14FBX', '3041', '8A-BA', 'TI DST-AES', '8990H-60XXX', 'Toyota-30 Pin MANDATORY', 9, 'Shares F1 platform with Land Cruiser.'),
('NX 350', 2022, 2025, 'HYQ14FLC', 'xxxx', '8A-BA', 'TI DST-AES', '8990H-78XXX', 'Certification ECU bypass', 10, 'GA-K platform. Deep dash access.'),
('RX 350', 2023, 2025, 'HYQ14FLC', 'xxxx', '8A-BA', 'TI DST-AES', '8990H-0E1XX', 'Certification ECU bypass', 9, 'New generation.');

-- ============================================================================
-- SECTION 4: Toyota Vehicle Cluster Strategy
-- ============================================================================
CREATE TABLE IF NOT EXISTS toyota_key_clusters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cluster_name TEXT NOT NULL,
    board_id TEXT,
    fcc_id TEXT,
    architecture TEXT,
    vehicles_in_cluster TEXT,
    inventory_priority TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO toyota_key_clusters (cluster_name, board_id, fcc_id, architecture, vehicles_in_cluster, inventory_priority, notes) VALUES
('TNGA-F 8A-BA Truck Cluster', '3041', 'HYQ14FBX', '8A-BA', 'Tundra 2022+, Tacoma 2024, Sequoia 2023+, Land Cruiser 2024, Sienna 2021+, Venza 2021+, Crown 2023+', 'HIGH', 'Covers all Toyota trucks and large hybrids. Single key for multiple vehicles.'),
('Compact 4A Cluster', '2561', 'HYQ14FBW', '4A', 'Camry 2025, Corolla 2023+, Corolla Cross 2022+, Prius 2023+', 'HIGHEST', 'Most versatile key for modern sedans. 2025 Camry adoption cements this as 3-5 year standard.'),
('Transition 8A-BA Cluster', '3450', 'HYQ14FLA', '8A-BA', 'RAV4 2022+, 4Runner 2022+, Highlander 2021+', 'HIGH', 'Highest-volume SUV segment. CRITICAL to differentiate from FBC (Legacy 8A).');

-- ============================================================================
-- SECTION 5: Update vehicles_master and locksmith_alerts
-- ============================================================================
UPDATE vehicles_master SET
    security_system = 'Toyota 4A (NXP HITAG AES)',
    akl_difficulty = 'High',
    special_notes = 'NXP NCF29A1M chip (ID4A). G-Box3 or CAN Direct required for AKL. Password-free matching available on some tools. FBW Board 2561.'
WHERE make = 'Toyota' AND model IN ('Corolla', 'Prius') AND year_start >= 2019;

UPDATE vehicles_master SET
    security_system = 'Toyota 4A (NXP HITAG AES)',
    akl_difficulty = 'High',
    special_notes = '2025 NEW GENERATION. Camry now uses 4A (FBW Board 2561) instead of 8A. Aligns with Corolla. G-Box3 required.'
WHERE make = 'Toyota' AND model = 'Camry' AND year_start >= 2025;

INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
('Critical', 'Toyota', '4Runner', 2022, 2024, 'Mid-Cycle Architecture Switch (Invisible!)', 'The 2022+ 4Runner uses 8A-BA (FLA Board 3450) while 2020-2021 uses Legacy 8A (FBB Board 0010). SAME EXTERIOR, DIFFERENT ELECTRONICS.', 'Pre-Job VIN Check', 'Verify year before tool selection. 2022+ requires Toyota-30 Pin bypass. 2020-2021 = standard OBD.', 'Toyota_Key_Chip_Specification_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'Toyota', 'Camry', 2025, 2025, '2025 Camry = 4A Architecture (Not 8A)', 'The 2025 Camry marks the END of the 8A era for Toyota sedans. It now uses NXP HITAG AES (4A), not the TI DST-AES used since 2018.', 'Key Ordering', 'Order HYQ14FBW (Board 2561). Do NOT use HYQ14FBC from 2018-2024 Camry. Incompatible chip families.', 'Toyota_Key_Chip_Specification_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Toyota', 'All Models', 2020, 2025, 'Board ID = Only Trusted Identifier', 'FCC ID alone is unreliable due to shell swapping and shared FCC across different revisions. The Board ID on the green PCB is the ONLY immutable identifier.', 'Parts Verification', 'Always check Board ID: 2561 = 4A, 3041/3450 = 8A-BA, 0010/0351 = Legacy 8A.', 'Toyota_Key_Chip_Specification_Research.txt', CURRENT_TIMESTAMP),
('Info', 'Toyota', 'All Models', 2016, 2025, 'TOY51 (LXP90) = Universal Keyway 2016+', 'Emergency keyway has been standardized. TOY51 works for all HYQ14FBx/FLx series. Obsoletes TOY48 and TOY43.', 'Key Cutting', 'Stock TOY51 blanks. Emergency key blade OEM 69515-K0020 or 69515-33100.', 'Toyota_Key_Chip_Specification_Research.txt', CURRENT_TIMESTAMP);

-- Mark completion
SELECT 'Toyota HYQ14FBx Board Classification Complete' AS status,
       (SELECT COUNT(*) FROM toyota_chip_architecture) AS architecture_entries,
       (SELECT COUNT(*) FROM toyota_board_id_master) AS board_entries,
       (SELECT COUNT(*) FROM toyota_vehicle_key_mapping) AS vehicle_entries,
       (SELECT COUNT(*) FROM toyota_key_clusters) AS cluster_entries;
