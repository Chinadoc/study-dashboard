-- Seed data for the unified schema
-- Priority makes: Hyundai, Honda, BMW, Ford

-- ============================================
-- VEHICLES MASTER (Make/Model combinations)
-- ============================================

INSERT OR IGNORE INTO vehicles_master (make, model, make_normalized, model_normalized) VALUES
-- Hyundai
('Hyundai', 'Elantra', 'hyundai', 'elantra'),
('Hyundai', 'Sonata', 'hyundai', 'sonata'),
('Hyundai', 'Tucson', 'hyundai', 'tucson'),
('Hyundai', 'Santa Fe', 'hyundai', 'santa_fe'),
('Hyundai', 'Accent', 'hyundai', 'accent'),
('Hyundai', 'Kona', 'hyundai', 'kona'),
('Hyundai', 'Palisade', 'hyundai', 'palisade'),
-- Honda
('Honda', 'Civic', 'honda', 'civic'),
('Honda', 'Accord', 'honda', 'accord'),
('Honda', 'CR-V', 'honda', 'cr_v'),
('Honda', 'Odyssey', 'honda', 'odyssey'),
('Honda', 'Pilot', 'honda', 'pilot'),
('Honda', 'HR-V', 'honda', 'hr_v'),
-- BMW
('BMW', '3-Series', 'bmw', '3_series'),
('BMW', '5-Series', 'bmw', '5_series'),
('BMW', 'X3', 'bmw', 'x3'),
('BMW', 'X5', 'bmw', 'x5'),
-- Ford
('Ford', 'F-150', 'ford', 'f_150'),
('Ford', 'Escape', 'ford', 'escape'),
('Ford', 'Explorer', 'ford', 'explorer'),
('Ford', 'Mustang', 'ford', 'mustang'),
('Ford', 'Focus', 'ford', 'focus'),
('Ford', 'Fusion', 'ford', 'fusion');

-- ============================================
-- VEHICLE VARIANTS (Comprehensive data)
-- ============================================

-- Get vehicle IDs first (will use subqueries)
-- Hyundai Elantra variants
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2007, 2010, 'Standard', 'ID46', 'PCF7936', 'HYN14R', 'OSLOKA-310T', '315 MHz', 3, 'CR2032', '95430-2L350', 'Autel IM608', 'OBD', 0, 'Gen 4 - Transponder key only', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Elantra';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2016, 'Smart Key', 'ID46', 'PCF7952', 'HY22', 'SY5HMFNA04', '315 MHz', 4, 'CR2032', '95440-3M220', 'Autel IM608', 'OBD', 0, 'Gen 5 - Push button start', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Elantra';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2016, 'Flip Key', 'ID46', 'PCF7936', 'HY22', 'OSLOKA-320T', '315 MHz', 4, 'CR2032', '95430-3X500', 'Autel IM608', 'OBD', 0, 'Gen 5 - Non push start', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Elantra';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2017, 2020, 'Smart Key', 'ID46', 'PCF7952A', 'HY18', 'CQOFD00120', '433 MHz', 4, 'CR2032', '95440-F2002', 'Autel IM608', 'OBD', 0, 'Gen 6 - Some have HY22', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Elantra';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2021, 2024, 'Smart Key', 'HITAG-AES', 'ID4A', 'KK12', 'NYOMBEC5FOB2004', '434 MHz', 4, 'CR2032', '95440-AA000', 'Autel IM608 Pro', 'OBD + SGW', 0, 'Gen 7 - Requires SGW bypass', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Elantra';

-- Honda Civic variants
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2012, 2015, 'Standard', 'ID46', 'PCF7952A', 'HON66', 'N5F-A04TAA', '313.8 MHz', 4, 'CR2025', '35118-TR0-A00', 'Autel IM608', 'OBD', 0, '9th Gen - Transponder', 1
FROM vehicles_master WHERE make='Honda' AND model='Civic';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2016, 2021, 'Smart Key', 'ID47', 'HITAG3', 'HON66', 'KR5V2X', '433 MHz', 4, 'CR2032', '72147-TBA-A01', 'Autel IM608', 'OBD', 0, '10th Gen - Push start', 1
FROM vehicles_master WHERE make='Honda' AND model='Civic';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2022, 2024, 'Smart Key', 'ID47', 'HITAG3-AES', 'HON66', 'KR5V2X-V44', '433 MHz', 4, 'CR2032', '72147-T47-A01', 'Autel IM608 Pro', 'OBD', 0, '11th Gen - Latest security', 1
FROM vehicles_master WHERE make='Honda' AND model='Civic';

-- BMW 3-Series variants
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2012, 2018, 'Smart Key', 'CAS4', 'ID49', 'HU92', 'YGOHUF5662', '315 MHz', 4, 'CR2450', '66128718217', 'Autohex II', 'OBD + ICOM', 1, 'F30 - FEM module', 1
FROM vehicles_master WHERE make='BMW' AND model='3-Series';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2019, 2024, 'Smart Key', 'BDC', 'ID49-AES', 'HU100R', 'HUF5661', '434 MHz', 4, 'CR2450', '66128739952', 'Autohex II', 'OBD + ICOM', 1, 'G20 - BDC module, newer security', 1
FROM vehicles_master WHERE make='BMW' AND model='3-Series';

-- Ford F-150 variants
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2014, 'Standard', '4D63-80bit', '4D63', 'H75', 'CWTWB1U793', '315 MHz', 4, 'CR2025', 'AL3Z-15K601-A', 'Autel IM608', 'OBD', 0, '12th Gen - 80-bit chip', 1
FROM vehicles_master WHERE make='Ford' AND model='F-150';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2015, 2017, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C31243300', '902 MHz', 5, 'CR2450', 'FL3T-15K601-FC', 'Autel IM608', 'OBD', 0, '13th Gen - New key style', 1
FROM vehicles_master WHERE make='Ford' AND model='F-150';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2018, 2024, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C93142600', '902 MHz', 5, 'CR2450', 'JL3T-15K601-AC', 'Autel IM608', 'OBD', 0, '14th Gen - Current model', 1
FROM vehicles_master WHERE make='Ford' AND model='F-150';

-- ============================================
-- FCC REGISTRY (Common FCC IDs)
-- ============================================

INSERT OR IGNORE INTO fcc_registry (fcc_id, frequency, frequency_mhz, buttons, battery, remote_start) VALUES
('SY5HMFNA04', '315 MHz', 315.0, 4, 'CR2032', 0),
('OSLOKA-310T', '315 MHz', 315.0, 3, 'CR2032', 0),
('OSLOKA-320T', '315 MHz', 315.0, 4, 'CR2032', 0),
('CQOFD00120', '433 MHz', 433.0, 4, 'CR2032', 0),
('NYOMBEC5FOB2004', '434 MHz', 434.0, 4, 'CR2032', 0),
('N5F-A04TAA', '313.8 MHz', 313.8, 4, 'CR2025', 0),
('KR5V2X', '433 MHz', 433.0, 4, 'CR2032', 0),
('KR5V2X-V44', '433 MHz', 433.0, 4, 'CR2032', 0),
('YGOHUF5662', '315 MHz', 315.0, 4, 'CR2450', 0),
('HUF5661', '434 MHz', 434.0, 4, 'CR2450', 0),
('CWTWB1U793', '315 MHz', 315.0, 4, 'CR2025', 0),
('M3N-A2C31243300', '902 MHz', 902.0, 5, 'CR2450', 1),
('M3N-A2C93142600', '902 MHz', 902.0, 5, 'CR2450', 1);

-- ============================================
-- KEYWAY REGISTRY (Common keyways)
-- ============================================

INSERT OR IGNORE INTO keyway_registry (keyway, blade_type, lishi_tool) VALUES
('HYN14R', 'Standard', 'HYN14R'),
('HY22', 'Standard', 'HY22'),
('HY18', 'Standard', 'HY18'),
('KK12', 'Standard', 'KK12'),
('HON66', 'High Security', 'HON66'),
('HU92', 'High Security', 'HU92'),
('HU100R', 'High Security', 'HU100R'),
('H75', 'Standard', 'H75'),
('H92', 'High Security', 'H92'),
('MIT17', 'High Security', 'MIT17'),
('NSN14', 'Standard', 'NSN14'),
('TOY48', 'High Security', 'TOY48');

-- ============================================
-- CHIP REGISTRY (Common chips)
-- ============================================

INSERT OR IGNORE INTO chip_registry (chip_name, chip_family, cloneable, requires_tool) VALUES
('ID46', 'Philips', 1, 'Tango'),
('PCF7936', 'Philips', 1, 'Tango'),
('PCF7952', 'Philips', 1, 'Tango'),
('PCF7952A', 'Philips', 1, 'Tango'),
('ID4A', 'Hitag', 0, 'VVDI2'),
('HITAG-AES', 'Hitag', 0, 'VVDI2'),
('HITAG3', 'Hitag', 0, 'VVDI2'),
('HITAG3-AES', 'Hitag', 0, 'VVDI2'),
('ID47', 'Hitag', 0, 'VVDI2'),
('ID49', 'Texas', 0, 'Autel'),
('HITAG Pro', 'Texas', 0, 'Autel'),
('4D63', 'Texas', 1, 'Tango'),
('CAS4', 'BMW', 0, 'AUTOHEX'),
('BDC', 'BMW', 0, 'AUTOHEX');
