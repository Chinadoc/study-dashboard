-- Batch 1: European Manufacturer Security Architecture Integration
-- Source: BMW CAS/FEM/BDC, Mercedes FBS3/FBS4, VW Immobilizer, Porsche PAS/KESSY/BCM2, VAG MQB/MQB-Evo

-- ============================================================================
-- SECTION 1: BMW Architecture Reference Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS bmw_architecture_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chassis_code TEXT NOT NULL,
    model_family TEXT,
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT, -- L6, L7, CLAR
    security_module TEXT, -- CAS3, CAS4, CAS4+, FEM, BDC, BDC2, BDC3
    module_location TEXT,
    mcu_type TEXT,
    fcc_id_primary TEXT,
    fcc_id_secondary TEXT,
    frequency_mhz INTEGER,
    akl_difficulty TEXT, -- Easy, Medium, Hard, Dealer-Only
    isn_source TEXT, -- CAS, FEM, BDC, DME
    preprocessing_required BOOLEAN DEFAULT 0,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- BMW Architecture Data
INSERT OR REPLACE INTO bmw_architecture_reference (chassis_code, model_family, year_start, year_end, platform, security_module, module_location, mcu_type, fcc_id_primary, frequency_mhz, akl_difficulty, isn_source, preprocessing_required, special_notes) VALUES
-- CAS4 Platform (L6)
('F10', '5-Series Sedan', 2011, 2016, 'L6', 'CAS4', 'Under Dash Driver Side', 'MC9S12XEP100', 'YGOHUF5662', 315, 'Medium', 'CAS', 0, 'ISN readable from CAS module'),
('F11', '5-Series Touring', 2011, 2016, 'L6', 'CAS4', 'Under Dash Driver Side', 'MC9S12XEP100', 'YGOHUF5662', 315, 'Medium', 'CAS', 0, NULL),
('F25', 'X3', 2011, 2017, 'L6', 'CAS4', 'Under Dash Driver Side', 'MC9S12XEP100', 'YGOHUF5662', 315, 'Medium', 'CAS', 0, 'Uses CAS4 while X5 uses BDC'),
('F07', '5-Series GT', 2010, 2017, 'L6', 'CAS4', 'Under Dash Driver Side', 'MC9S12XEP100', 'YGOHUF5662', 315, 'Medium', 'CAS', 0, NULL),
('F01', '7-Series SWB', 2009, 2015, 'L6', 'CAS4', 'Under Dash Driver Side', 'MC9S12XEP100', 'YGOHUF5662', 315, 'Medium', 'CAS', 0, NULL),
('F02', '7-Series LWB', 2009, 2015, 'L6', 'CAS4', 'Under Dash Driver Side', 'MC9S12XEP100', 'YGOHUF5662', 315, 'Medium', 'CAS', 0, NULL),

-- FEM Platform (L7)
('F30', '3-Series Sedan', 2012, 2018, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, 'Preprocessing required - circular dependency'),
('F31', '3-Series Touring', 2012, 2018, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F34', '3-Series GT', 2013, 2019, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F80', 'M3', 2014, 2018, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F32', '4-Series Coupe', 2014, 2020, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F33', '4-Series Convertible', 2014, 2020, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F36', '4-Series GC', 2014, 2020, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F20', '1-Series Hatch', 2012, 2019, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F21', '1-Series 3-Door', 2012, 2019, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F22', '2-Series Coupe', 2014, 2021, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F23', '2-Series Convertible', 2015, 2021, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),
('F87', 'M2', 2016, 2021, 'L7', 'FEM', 'Kick Panel Passenger Side', 'MPC5xxx/SPC56xx', 'YGOHUF5767', 434, 'Hard', 'DME', 1, NULL),

-- BDC Platform (CLAR)
('F15', 'X5', 2014, 2018, 'CLAR', 'BDC', 'Kick Panel Passenger Side', 'BDC2', 'YGOHUF5767', 434, 'Very Hard', 'DME', 1, 'BDC instead of CAS'),
('F85', 'X5M', 2015, 2018, 'CLAR', 'BDC', 'Kick Panel Passenger Side', 'BDC2', 'YGOHUF5767', 434, 'Very Hard', 'DME', 1, NULL),
('F16', 'X6', 2015, 2019, 'CLAR', 'BDC', 'Kick Panel Passenger Side', 'BDC2', 'YGOHUF5767', 434, 'Very Hard', 'DME', 1, NULL),
('F86', 'X6M', 2015, 2019, 'CLAR', 'BDC', 'Kick Panel Passenger Side', 'BDC2', 'YGOHUF5767', 434, 'Very Hard', 'DME', 1, NULL),
('F48', 'X1', 2016, 2022, 'CLAR', 'BDC', 'Kick Panel Passenger Side', 'BDC2', 'YGOHUF5767', 434, 'Very Hard', 'DME', 1, NULL),

-- G-Series (Current Gen)
('G20', '3-Series', 2019, 2025, 'CLAR', 'BDC2', 'Kick Panel Passenger Side', 'BDC3', 'YGOHUF5767', 434, 'Dealer-Only', 'DME', 1, 'June 2020+ Bosch MG1/MD1 lock prevents bench ISN'),
('G30', '5-Series', 2017, 2023, 'CLAR', 'BDC2', 'Kick Panel Passenger Side', 'BDC3', 'YGOHUF5767', 434, 'Very Hard', 'DME', 1, 'Secure Coding 2.0 post-July 2021'),
('G01', 'X3', 2018, 2025, 'CLAR', 'BDC2', 'Kick Panel Passenger Side', 'BDC3', 'YGOHUF5767', 434, 'Very Hard', 'DME', 1, NULL),
('G05', 'X5', 2019, 2025, 'CLAR', 'BDC2', 'Kick Panel Passenger Side', 'BDC3', 'YGOHUF5767', 434, 'Dealer-Only', 'DME', 1, NULL);

-- ============================================================================
-- SECTION 2: Mercedes FBS Reference Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS mercedes_fbs_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chassis_code TEXT NOT NULL,
    model_name TEXT,
    year_start INTEGER,
    year_end INTEGER,
    fbs_generation TEXT, -- FBS3, FBS4
    sa_code TEXT, -- Sales code indicator
    fcc_id TEXT,
    aftermarket_support TEXT, -- Full, Limited, None
    key_type TEXT, -- Chrome, Black Plastic, Slim Chrome
    module_virginization TEXT,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Mercedes FBS Timeline Data
INSERT OR REPLACE INTO mercedes_fbs_reference (chassis_code, model_name, year_start, year_end, fbs_generation, sa_code, fcc_id, aftermarket_support, key_type, module_virginization, special_notes) VALUES
-- FBS3 Models (Aftermarket Supported)
('W204', 'C-Class', 2008, 2014, 'FBS3', '803', 'IYZ3312', 'Full', 'Chrome Key', 'TCU, ISM, some ECUs', 'BE keys for aftermarket'),
('W211', 'E-Class', 2003, 2009, 'FBS3', '803', 'IYZ3312', 'Full', 'Black Plastic', 'TCU, ISM, some ECUs', NULL),
('W164', 'ML-Class', 2006, 2011, 'FBS3', '803', 'IYZ3312', 'Full', 'Chrome Key', 'TCU, ISM', NULL),
('W221', 'S-Class', 2007, 2013, 'FBS3', '803', 'IYZ3312', 'Full', 'Chrome Key', 'TCU, ISM', NULL),
('R171', 'SLK', 2005, 2011, 'FBS3', '803', 'IYZ3312', 'Full', 'Chrome Key', 'TCU, ISM', NULL),
('W219', 'CLS', 2006, 2011, 'FBS3', '803', 'IYZ3312', 'Full', 'Chrome Key', 'TCU, ISM', NULL),
('X204', 'GLK', 2010, 2015, 'FBS3', '803', 'IYZ3312', 'Full', 'Chrome Key', 'TCU, ISM', 'Split year - verify by VIN'),
('W463', 'G-Class', 2013, 2015, 'FBS3', '803', 'IYZ3312', 'Full', 'Chrome Key', 'TCU, ISM', 'FBS3 until September 2015'),

-- Transition Models (March 2013 - 2015) - HIGH RISK
('W212', 'E-Class Facelift', 2013, 2016, 'FBS3/FBS4', '804', 'IYZDC12K', 'Limited', 'Slim Chrome', 'Limited', 'TRAP MODEL - March/April 2013+ may be FBS4'),
('W207', 'E-Class Coupe', 2013, 2017, 'FBS3/FBS4', '804', 'IYZDC12K', 'Limited', 'Slim Chrome', 'Limited', 'Late 2013+ may be FBS4'),
('C218', 'CLS', 2014, 2018, 'FBS4', '805', 'IYZDC12K', 'None', 'Slim Chrome', 'EIS Only', 'FBS4 from September 2014'),
('W166', 'ML/GLE', 2013, 2019, 'FBS3/FBS4', '804', 'IYZDC12K', 'Limited', 'Mixed', 'Limited', 'July 2013 official FBS4 availability'),

-- FBS4 Models (Dealer Only)
('W222', 'S-Class', 2014, 2020, 'FBS4', '805', 'IYZDC12K', 'None', 'Slim Chrome', 'EIS Only', 'FBS4 from launch'),
('W205', 'C-Class', 2015, 2021, 'FBS4', '805', 'IYZDC12K', 'None', 'Slim Chrome', 'EIS Only', 'Clean break - FBS4'),
('W447', 'V-Class/Metris', 2015, 2020, 'FBS4', '805', 'NBGDM3', 'None', 'Slim Chrome', 'EIS Only', 'FBS4 from launch'),
('X156', 'GLA', 2014, 2019, 'FBS4', '805', 'IYZDC12K', 'None', 'Slim Chrome', 'EIS Only', 'Dealer only'),
('C117', 'CLA', 2014, 2019, 'FBS4', '805', 'IYZDC12K', 'None', 'Slim Chrome', 'EIS Only', 'Dealer only');

-- ============================================================================
-- SECTION 3: VW Immobilizer Generation Reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS vw_immobilizer_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    immo_generation TEXT, -- Immo 1, Immo 2, Immo 3, Immo 4, Immo 5, Immo 6
    chip_type TEXT,
    chip_id TEXT,
    skc_method TEXT, -- PIN, Component Security, Dealer-Only
    cluster_type TEXT,
    lock_generation TEXT, -- HU66 Gen 1/2/3
    lishi_tool TEXT,
    frequency_mhz INTEGER,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- VW Immobilizer Data (1998-2011 Focus)
INSERT OR REPLACE INTO vw_immobilizer_reference (platform, model, year_start, year_end, immo_generation, chip_type, chip_id, skc_method, cluster_type, lock_generation, lishi_tool, frequency_mhz, special_notes) VALUES
-- Beetle (PQ34 Platform)
('PQ34', 'Beetle', 1998, 2000, 'Immo 2', 'Megamos ID48', 'ID48', 'SKC 14-digit', 'Standard', 'HU66 Gen 1', 'HU66 V.1', 315, 'W-line to ECU'),
('PQ34', 'Beetle', 2001, 2004, 'Immo 3', 'Megamos ID48', 'ID48', 'VIN-bound', 'VIN+Immo-ID', 'HU66 Gen 1', 'HU66 V.1', 315, 'Cluster-ECU marriage'),
('PQ34', 'Beetle', 2005, 2010, 'Immo 4', 'Megamos ID48', 'ID48', 'Component Security', 'CAN-Bus', 'HU66 Gen 2', 'HU66 V.2', 315, 'Requires TP23 pre-coded keys'),

-- Golf Generations
('PQ35', 'Golf Mk5', 2006, 2009, 'Immo 4', 'Megamos ID48', 'ID48', 'Component Security', 'CAN-Bus', 'HU66 Gen 2', 'HU66 V.2', 315, 'TP23 transponder profile'),
('PQ35', 'Golf Mk6', 2010, 2014, 'Immo 4', 'Megamos ID48', 'ID48', 'Component Security', 'CAN-Bus', 'HU66 Gen 2', 'HU66 V.2', 315, '2011+ shifts to NEC/UDS'),
('MQB', 'Golf Mk7', 2015, 2020, 'Immo 5', 'Megamos AES', 'ID88', 'Component Security', 'NEC', 'HU66 Gen 3', 'HU66 V.3', 315, 'MQB Platform - Sunken lock'),
('MQB-Evo', 'Golf Mk8', 2020, 2025, 'Immo 6', 'Megamos AES', 'ID88', 'Sync Data Required', 'Locked NEC', 'HU162T', 'HU162', 433, 'LOCKED - Requires ODIS/Dealer'),

-- Jetta Generations  
('PQ35', 'Jetta Mk5', 2006, 2010, 'Immo 4', 'Megamos ID48', 'ID48', 'Component Security', 'CAN-Bus', 'HU66 Gen 2', 'HU66 V.2', 315, NULL),
('PQ46', 'Jetta Mk6', 2011, 2018, 'Immo 4', 'Megamos ID48', 'ID48', 'Component Security', 'NEC+24C64', 'HU66 Gen 2', 'HU66 V.2', 315, 'Advanced Immo 4/5'),
('MQB', 'Jetta Mk7', 2019, 2021, 'Immo 5', 'Megamos AES', 'ID88', 'Component Security', 'NEC35xx', 'HU66 Gen 3', 'HU66 V.3', 315, NULL),
('MQB-Evo', 'Jetta Facelift', 2022, 2025, 'Immo 5b', 'Megamos AES', 'ID88', 'Sync Data', '5WA BCM', 'HU66 Gen 3', 'HU66 V.3', 315, 'Yellow Caution - Check BCM PN'),

-- Passat B6 Anomaly
('PQ46', 'Passat B6', 2006, 2010, 'Immo 4', 'ID48/ID46', 'ID48', 'CCM-based', 'Comfort Control Module', 'HU66 Gen 2', 'HU66 V.2', 315, 'SLOT KEY - Immo in CCM not cluster'),

-- Tiguan
('PQ35', 'Tiguan Mk1', 2009, 2017, 'Immo 4', 'Megamos ID48', 'ID48', 'Component Security', 'CAN-Bus', 'HU66 Gen 2', 'HU66 V.2', 315, NULL),
('MQB', 'Tiguan Mk2', 2018, 2021, 'Immo 5', 'Megamos AES', 'ID88', 'Component Security', '5Q0 BCM', 'HU66 Gen 3', 'HU66 V.3', 315, 'Readable via OBD/bench'),
('MQB-Evo', 'Tiguan Facelift', 2022, 2024, 'Immo 5b', 'Megamos AES', 'ID88', 'Sync Data', '5WA BCM', 'HU66 Gen 3', 'HU66 V.3', 315, 'HYBRID TRAP - Check BCM: 5Q0=OK, 5WA=LOCKED');

-- ============================================================================
-- SECTION 4: VAG MQB-Evo Platform Identification
-- ============================================================================
CREATE TABLE IF NOT EXISTS vag_evo_identification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model TEXT NOT NULL,
    vin_position_7_8 TEXT, -- Chassis code from VIN digits 7-8
    year_start INTEGER,
    year_end INTEGER,
    platform TEXT, -- MQB, MQB-Evo
    bcm_part_prefix TEXT, -- 5Q0 (readable) or 5WA (locked)
    aftermarket_status TEXT, -- Supported, Mixed, Locked
    fcc_id TEXT,
    key_type TEXT, -- FS12P, FS12A, FS14T, FS197
    sync_data_required BOOLEAN,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO vag_evo_identification (model, vin_position_7_8, year_start, year_end, platform, bcm_part_prefix, aftermarket_status, fcc_id, key_type, sync_data_required, special_notes) VALUES
-- Clean Breaks
('Audi A3 Mk3', '8V', 2013, 2020, 'MQB', '5Q0', 'Supported', 'NBGFS12P01', 'FS12P', 0, 'Standard MQB - Autel/Xhorse supported'),
('Audi A3 Mk4', '8Y', 2021, 2025, 'MQB-Evo', '5WA', 'Locked', 'NBGFS197', 'FS197', 1, 'RED - Requires ODIS/Dealer for AKL'),
('VW Golf Mk7', 'AU/5G', 2013, 2020, 'MQB', '5Q0', 'Supported', 'NBGFS12P01', 'FS12P', 0, 'Standard MQB'),
('VW Golf Mk8', 'CD', 2020, 2025, 'MQB-Evo', '5WA', 'Locked', 'KR5FS14T', 'FS14T', 1, 'RED - SFD + Sync Data required'),
('Audi Q3 Mk2', 'F3', 2019, 2025, 'MQB', '5Q0/5WA', 'Mixed', 'NBGFS12P01', 'FS12P', 0, '2019-2020 OK, 2021+ check BCM'),

-- Hybrid Traps (VIN unchanged but electronics updated)
('VW Tiguan Mk2', '5N', 2018, 2021, 'MQB', '5Q0', 'Supported', 'NBG010180T', 'FS12A', 0, 'Check BCM - 5Q0 is programmable'),
('VW Tiguan Facelift', '5N/AX', 2022, 2024, 'MQB/Hybrid', '5WA', 'Mixed', 'KR5FS14T', 'FS14T', 1, 'YELLOW - VIN says 5N but uses 5WA BCM'),
('VW Jetta Mk7', 'BU', 2019, 2021, 'MQB', '5Q0', 'Supported', 'NBGFS12A01', 'FS12A', 0, NULL),
('VW Jetta Facelift', 'BU', 2022, 2025, 'MQB/Hybrid', '5WA', 'Mixed', 'NBGFS93N', 'FS93N', 1, 'YELLOW - Same VIN code but 5WA BCM');

-- ============================================================================
-- SECTION 5: Porsche Security Architecture
-- ============================================================================
CREATE TABLE IF NOT EXISTS porsche_security_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chassis_code TEXT NOT NULL,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    security_system TEXT, -- PAS, KESSY, BCM2, MLB-Evo
    transponder_type TEXT,
    chip_id TEXT,
    fcc_id TEXT,
    akl_method TEXT, -- Bench, OBD, Dealer-Only
    piwis_required TEXT, -- PIWIS II, PIWIS III, PIWIS 4
    ppn_required BOOLEAN,
    special_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO porsche_security_reference (chassis_code, model, year_start, year_end, security_system, transponder_type, chip_id, fcc_id, akl_method, piwis_required, ppn_required, special_notes) VALUES
-- Legacy PAS (Sports Cars)
('997', '911 (997)', 2005, 2012, 'PAS', 'Megamos Crypto', 'ID48', 'LX8FZV', 'Bench/OBD', 'PIWIS II', 0, 'ID48 sniffable - aftermarket viable'),
('987', 'Boxster/Cayman', 2005, 2012, 'PAS', 'Megamos Crypto', 'ID48', 'LX8FZV', 'Bench/OBD', 'PIWIS II', 0, 'Water damage common - PAS under seat'),

-- Legacy KESSY (SUV)
('9PA', 'Cayenne Gen1', 2003, 2010, 'KESSY', 'Philips Crypto 2', 'ID46', 'KR55WK45022', 'Bench/OBD', 'PIWIS II', 0, 'ELV failure common - Steering Faulty'),

-- BCM2 Era (2010-2017)
('970', 'Panamera', 2010, 2016, 'BCM2', 'Hitag Pro', 'ID49', 'KR55WK50138', 'Bench', 'PIWIS III', 1, 'Locked NEC35xx MCUs - voltage glitch required'),
('958/92A', 'Cayenne Gen2', 2011, 2018, 'BCM2', 'Hitag Pro', 'ID49', 'KR55WK50138', 'Bench', 'PIWIS III', 1, 'Component Protection active'),
('991', '911 (991)', 2012, 2019, 'BCM2', 'Hitag Pro', 'ID49', 'KR55WK50138', 'Bench', 'PIWIS III', 1, '1N35H/2N35H locked MCUs'),
('95B', 'Macan', 2014, 2024, 'BCM2', 'Hitag Pro', 'ID49', 'KR55WK50138', 'Bench', 'PIWIS III', 1, 'Power Class mismatch with Audi Q5 parts'),
('981', 'Boxster/Cayman', 2012, 2016, 'BCM2', 'Hitag Pro', 'ID49', 'KR55WK50138', 'Bench', 'PIWIS III', 1, NULL),

-- MLB-Evo / AES Era (2018+)
('9YA', 'Cayenne Gen3', 2018, 2025, 'MLB-Evo', 'Hitag AES', 'NCF29A1', 'IYZ-PK3', 'Dealer-Only', 'PIWIS 4', 1, 'AES-128 - No aftermarket solution'),
('992', '911 (992)', 2020, 2025, 'MLB-Evo', 'Hitag AES', 'NCF29A1', 'IYZ-PK3', 'Dealer-Only', 'PIWIS 4', 1, 'UWB digital keys - Dealer fortress'),
('Taycan', 'Taycan', 2020, 2025, 'MLB-Evo', 'Hitag AES', 'NCF29A1', 'IYZ-PK3', 'Dealer-Only', 'PIWIS 4', 1, 'SFD2 locked - Online only');

-- ============================================================================
-- SECTION 6: European Locksmith Alerts
-- ============================================================================
INSERT OR IGNORE INTO locksmith_alerts (alert_level, make, model, year_start, year_end, alert_title, alert_description, affected_operation, mitigation_steps, source_document, created_at) VALUES
-- BMW Alerts
('Critical', 'BMW', 'All G-Series', 2020, 2025, 'Bosch MG1/MD1 DME Lock', 'June 2020+ Bosch DME prevents bench mode ISN reading. AKL impossible for aftermarket.', 'All Keys Lost', 'Use dealer or specialized unlock service (Femto). Do not attempt bench ISN read.', 'BMW_CAS_vs_FEM_BDC_Architecture_Research.txt', CURRENT_TIMESTAMP),
('Critical', 'BMW', 'All G-Series', 2021, 2025, 'Secure Coding 2.0 (NCD 2.0)', 'Post-July 2021 requires online digital signatures for coding. Aftermarket module init blocked.', 'Module Replacement', 'Dealer-only for module coding. Cannot initialize aftermarket ECUs.', 'BMW_CAS_vs_FEM_BDC_Architecture_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'BMW', 'F-Series FEM/BDC', 2012, 2019, 'FEM/BDC Preprocessing Required', 'Circular dependency requires DME ISN to unlock FEM. High risk procedure.', 'All Keys Lost', 'Use voltage stabilizer. Back up EEPROM before any write. Verify blind ISN read.', 'BMW_CAS_vs_FEM_BDC_Architecture_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'BMW', 'F30 (2014)', 2014, 2014, 'Frequency Verification Required', '2014 F30 may be 315MHz or 434MHz depending on build date. Physical verification needed.', 'Key Programming', 'Check existing key frequency before ordering. Board may be Continental vs HUF.', 'BMW_CAS_vs_FEM_BDC_Architecture_Research.txt', CURRENT_TIMESTAMP),

-- Mercedes Alerts
('Critical', 'Mercedes', 'FBS4 (2016+)', 2016, 2025, 'FBS4 Dealer-Only', 'FBS4 keys cannot be generated aftermarket. Server-dependent authentication.', 'All Keys Lost', 'Order VIN-coded key from dealer. EIS is unbreakable anchor.', 'Mercedes_FBS4_Forensic_Identification_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Mercedes', 'W212/W207/C218', 2013, 2015, 'FBS3/FBS4 Trap Models', 'March 2013+ E-Class facelift may be FBS4 despite year. Verify SA code (803=FBS3, 805=FBS4).', 'Key Programming', 'Check SA code on VIN data card before attempting. Look for IYZDC12K FCC ID.', 'Mercedes_FBS4_Forensic_Identification_Research.txt', CURRENT_TIMESTAMP),

-- VW/Audi Alerts
('Critical', 'Volkswagen', 'Golf Mk8', 2020, 2025, 'MQB-Evo SFD Lock', 'Sync Data required from locked 5WA BCM. OBD programming impossible without ODIS.', 'All Keys Lost', 'Refer to dealer or use gray-market Sync Data service.', 'VAG_MQB_vs._MQB-Evo_Key_Programming.txt', CURRENT_TIMESTAMP),
('Critical', 'Audi', 'A3 8Y', 2021, 2025, 'MQB-Evo Locked', 'No reliable offline AKL solution. 5WA BCM cannot be read for Sync Data.', 'All Keys Lost', 'Dealer only with ODIS and GeKo credentials.', 'VAG_MQB_vs._MQB-Evo_Key_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Volkswagen', 'Tiguan/Jetta 2022+', 2022, 2024, 'Hybrid Trap - Check BCM Part Number', 'VIN may show 5N/BU but vehicle uses locked 5WA BCM. Standard OBD fails.', 'Key Programming', 'Scan BCM part number first. If 5WA/5H0 prefix = Evo system. If 5Q0 = Standard MQB.', 'VAG_MQB_vs._MQB-Evo_Key_Programming.txt', CURRENT_TIMESTAMP),
('Warning', 'Volkswagen', 'All', 2006, 2025, 'FS12P vs FS12A Incompatibility', 'FS12P and FS12A keys are NOT cross-compatible despite identical appearance.', 'Key Programming', 'Check key marking (A or P designation). Stocking both is required.', 'VAG_MQB_vs._MQB-Evo_Key_Programming.txt', CURRENT_TIMESTAMP),

-- Porsche Alerts
('Critical', 'Porsche', '992/Taycan', 2020, 2025, 'MLB-Evo AES-128 Lock', 'AES-128 encryption and UWB. No public exploits exist. Factory pre-coded keys only.', 'All Keys Lost', 'Order key from dealer with PPN authorization. 2-5 week lead time typical.', 'Porsche_Security_&_Immobilizer_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Porsche', 'BCM2 Era (2010-2018)', 2010, 2018, 'Locked MCU - Voltage Glitch Required', 'BCM2 uses locked NEC35xx/RH850 processors. Standard JTAG/BDM read erases data.', 'All Keys Lost', 'Use solder-free adapters (Yanhua/Xhorse). Voltage glitch attack required for access.', 'Porsche_Security_&_Immobilizer_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Porsche', 'Macan 95B', 2014, 2024, 'ELV Desync Risk', 'BCM2/ELV rolling code mismatch causes Steering Lock Defective. Very difficult recovery.', 'All Keys Lost', 'Never write back old EEPROM dumps. Virgin ELV may be required if desync occurs.', 'Porsche_Security_&_Immobilizer_Research.txt', CURRENT_TIMESTAMP),
('Warning', 'Porsche', 'Cayenne 9PA', 2003, 2010, 'ELV Motor Failure Common', 'Steering Faulty message often from ELV microswitch failure, not key issue.', 'Diagnostics', 'Check ELV before assuming immobilizer problem. Motor/switch replacement may be needed.', 'Porsche_Security_&_Immobilizer_Research.txt', CURRENT_TIMESTAMP);

-- ============================================================================
-- SECTION 7: Update vehicles with European security data
-- ============================================================================
UPDATE vehicles SET 
    security_system = 'FEM',
    akl_difficulty = 'Hard',
    preprocessing_required = 1,
    special_notes = COALESCE(special_notes || ' | ', '') || 'FEM preprocessing required - DME ISN dependency'
WHERE make = 'BMW' AND year_start >= 2012 AND year_end <= 2019 
AND model IN ('3-Series', '4-Series', '1-Series', '2-Series');

UPDATE vehicles SET
    security_system = 'BDC2',
    akl_difficulty = 'Dealer-Only',
    special_notes = COALESCE(special_notes || ' | ', '') || 'June 2020+ Bosch DME lock - Dealer only'
WHERE make = 'BMW' AND year_start >= 2019
AND model IN ('3-Series', '5-Series', 'X3', 'X5');

UPDATE vehicles SET
    security_system = 'FBS4',
    akl_difficulty = 'Dealer-Only',
    special_notes = COALESCE(special_notes || ' | ', '') || 'FBS4 system - Dealer pre-coded key required'
WHERE make = 'Mercedes-Benz' AND year_start >= 2016;

UPDATE vehicles SET
    security_system = 'FBS3/FBS4',
    akl_difficulty = 'Limited',
    special_notes = COALESCE(special_notes || ' | ', '') || 'TRAP MODEL - Verify SA code (803=FBS3, 805=FBS4)'
WHERE make = 'Mercedes-Benz' AND year_start >= 2013 AND year_end <= 2015
AND model IN ('E-Class', 'CLS-Class');

UPDATE vehicles SET
    security_system = 'MQB-Evo',
    akl_difficulty = 'Dealer-Only',
    special_notes = COALESCE(special_notes || ' | ', '') || 'MQB-Evo - Sync Data required - ODIS dealer only'
WHERE make IN ('Volkswagen', 'Audi') AND year_start >= 2020
AND model IN ('Golf', 'A3', 'Q3');

-- Mark completion
SELECT 'Batch 1 European Security Migration Complete' AS status, COUNT(*) AS alerts_added FROM locksmith_alerts WHERE source_document LIKE '%European%' OR source_document LIKE '%BMW%' OR source_document LIKE '%Mercedes%' OR source_document LIKE '%VAG%' OR source_document LIKE '%Porsche%';
