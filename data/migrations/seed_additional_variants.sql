-- Additional vehicle variants - Comprehensive data expansion
-- Adding more variants for Hyundai, Honda, BMW, Ford and other makes

-- ============================================
-- HYUNDAI SONATA
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2014, 'Smart Key', 'ID46', 'PCF7952', 'HY22', 'SY5HMFNA04', '315 MHz', 4, 'CR2032', '95440-3S100', 'Autel IM608', 'OBD', 0, 'YF Gen - Push start', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Sonata';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2015, 2019, 'Smart Key', 'ID46', 'PCF7952A', 'HY22', 'CQOFD00120', '433 MHz', 4, 'CR2032', '95440-C1001', 'Autel IM608', 'OBD', 0, 'LF Gen - Updated frequency', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Sonata';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2020, 2024, 'Smart Key', 'HITAG-AES', 'ID4A', 'KK12', 'TQ8-FOB-4F33', '434 MHz', 4, 'CR2032', '95440-L1010', 'Autel IM608 Pro', 'OBD + SGW', 0, 'DN8 Gen - SGW required', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Sonata';

-- ============================================
-- HYUNDAI TUCSON
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2010, 2015, 'Flip Key', 'ID46', 'PCF7936', 'HY22', 'OSLOKA-850T', '315 MHz', 4, 'CR2032', '95430-2S700', 'Autel IM608', 'OBD', 0, 'LM Gen - Non push start', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Tucson';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2016, 2021, 'Smart Key', 'ID46', 'PCF7952A', 'HY22', 'TQ8-FOB-4F03', '433 MHz', 4, 'CR2032', '95440-D3500', 'Autel IM608', 'OBD', 0, 'TL Gen - Push start available', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Tucson';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2022, 2024, 'Smart Key', 'HITAG-AES', 'ID4A', 'KK12', 'TQ8-FOB-4F35', '434 MHz', 4, 'CR2032', '95440-N9010', 'Autel IM608 Pro', 'OBD + SGW', 0, 'NX4 Gen - New platform, SGW', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Tucson';

-- ============================================
-- HYUNDAI SANTA FE
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2013, 2018, 'Smart Key', 'ID46', 'PCF7952', 'HY22', 'SY5DMFNA433', '433 MHz', 4, 'CR2032', '95440-4Z200', 'Autel IM608', 'OBD', 0, 'DM Gen - Standard smart key', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Santa Fe';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2019, 2024, 'Smart Key', 'HITAG-AES', 'ID4A', 'KK12', 'TQ8-FOB-4F11', '434 MHz', 4, 'CR2032', '95440-S1100', 'Autel IM608 Pro', 'OBD + SGW', 0, 'TM Gen - Newer security', 1
FROM vehicles_master WHERE make='Hyundai' AND model='Santa Fe';

-- ============================================
-- HONDA ACCORD
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2013, 2017, 'Standard', 'ID46', 'PCF7952A', 'HON66', 'MLBHLIK6-1T', '313.8 MHz', 4, 'CR2025', '35118-T2A-A20', 'Autel IM608', 'OBD', 0, '9th Gen - Traditional key', 1
FROM vehicles_master WHERE make='Honda' AND model='Accord';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2013, 2017, 'Smart Key', 'ID46', 'PCF7952A', 'HON66', 'ACJ932HK1210A', '433 MHz', 4, 'CR2032', '72147-T2G-A51', 'Autel IM608', 'OBD', 0, '9th Gen - Driver Select', 1
FROM vehicles_master WHERE make='Honda' AND model='Accord';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2018, 2022, 'Smart Key', 'ID47', 'HITAG3', 'HON66', 'CWTWB1G0090', '433 MHz', 4, 'CR2032', '72147-TVA-A01', 'Autel IM608', 'OBD', 0, '10th Gen - Current security', 1
FROM vehicles_master WHERE make='Honda' AND model='Accord';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2023, 2024, 'Smart Key', 'ID47', 'HITAG3-AES', 'HON66', 'KR5TP-4', '433 MHz', 4, 'CR2032', '72147-T3V-A01', 'Autel IM608 Pro', 'OBD', 0, '11th Gen - Enhanced', 1
FROM vehicles_master WHERE make='Honda' AND model='Accord';

-- ============================================
-- HONDA CR-V
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2012, 2016, 'Standard', 'ID46', 'PCF7952A', 'HON66', 'MLBHLIK6-1TA', '315 MHz', 4, 'CR2025', '35118-T0A-A10', 'Autel IM608', 'OBD', 0, '4th Gen - Most common', 1
FROM vehicles_master WHERE make='Honda' AND model='CR-V';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2017, 2022, 'Smart Key', 'ID47', 'HITAG3', 'HON66', 'KR5V2X', '433 MHz', 4, 'CR2032', '72147-TLA-A01', 'Autel IM608', 'OBD', 0, '5th Gen - New platform', 1
FROM vehicles_master WHERE make='Honda' AND model='CR-V';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2023, 2024, 'Smart Key', 'ID47', 'HITAG3-AES', 'HON66', 'KR5TP-4', '433 MHz', 4, 'CR2032', '72147-3A0-A01', 'Autel IM608 Pro', 'OBD', 0, '6th Gen - Latest', 1
FROM vehicles_master WHERE make='Honda' AND model='CR-V';

-- ============================================
-- HONDA ODYSSEY
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2017, 'Standard', 'ID46', 'PCF7952A', 'HON66', 'N5F-A04TAA', '313.8 MHz', 6, 'CR2025', '35118-TK8-A20', 'Autel IM608', 'OBD', 0, '4th Gen - 6 button remote', 1
FROM vehicles_master WHERE make='Honda' AND model='Odyssey';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2018, 2024, 'Smart Key', 'ID47', 'HITAG3', 'HON66', 'KR5V2X', '433 MHz', 6, 'CR2032', '72147-THR-A01', 'Autel IM608', 'OBD', 0, '5th Gen - Power doors', 1
FROM vehicles_master WHERE make='Honda' AND model='Odyssey';

-- ============================================
-- BMW 5-SERIES
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2016, 'Smart Key', 'CAS4', 'ID49', 'HU92', 'YGOHUF5662', '315 MHz', 4, 'CR2450', '66128718217', 'Autohex II', 'OBD + ICOM', 1, 'F10 - FEM module', 1
FROM vehicles_master WHERE make='BMW' AND model='5-Series';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2017, 2024, 'Smart Key', 'BDC', 'ID49-AES', 'HU100R', 'HUF5661', '434 MHz', 4, 'CR2450', '66128739952', 'Autohex II', 'OBD + ICOM', 1, 'G30 - BDC, display key available', 1
FROM vehicles_master WHERE make='BMW' AND model='5-Series';

-- ============================================
-- BMW X3
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2017, 'Smart Key', 'CAS4+', 'ID49', 'HU92', 'YGOHUF5662', '315 MHz', 4, 'CR2450', '66128718217', 'Autohex II', 'OBD + ICOM', 1, 'F25 - CAS4+ module', 1
FROM vehicles_master WHERE make='BMW' AND model='X3';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2018, 2024, 'Smart Key', 'BDC', 'ID49-AES', 'HU100R', 'HUF5661', '434 MHz', 4, 'CR2450', '66128739952', 'Autohex II', 'OBD + ICOM', 1, 'G01 - BDC module', 1
FROM vehicles_master WHERE make='BMW' AND model='X3';

-- ============================================
-- BMW X5
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2014, 2018, 'Smart Key', 'CAS4+', 'ID49', 'HU92', 'YGOHUF5767', '315 MHz', 4, 'CR2450', '66129316195', 'Autohex II', 'OBD + ICOM', 1, 'F15 - Display key option', 1
FROM vehicles_master WHERE make='BMW' AND model='X5';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2019, 2024, 'Smart Key', 'BDC', 'ID49-AES', 'HU100R', 'HUF5661', '434 MHz', 4, 'CR2450', '66128739952', 'Autohex II', 'OBD + ICOM', 1, 'G05 - Digital key support', 1
FROM vehicles_master WHERE make='BMW' AND model='X5';

-- ============================================
-- FORD ESCAPE
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2013, 2016, 'Standard', '4D63-80bit', '4D63', 'H75', 'OUCD6000022', '315 MHz', 4, 'CR2032', 'BB5Z-15K601-A', 'Autel IM608', 'OBD', 0, '3rd Gen - 80-bit chip', 1
FROM vehicles_master WHERE make='Ford' AND model='Escape';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2017, 2019, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C31243300', '902 MHz', 5, 'CR2450', 'HC3Z-15K601-B', 'Autel IM608', 'OBD', 0, '3rd Gen Updated - PATS', 1
FROM vehicles_master WHERE make='Ford' AND model='Escape';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2020, 2024, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C93142600', '902 MHz', 5, 'CR2450', 'KJ8T-15K601-AA', 'Autel IM608', 'OBD', 0, '4th Gen - New design', 1
FROM vehicles_master WHERE make='Ford' AND model='Escape';

-- ============================================
-- FORD EXPLORER
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2011, 2015, 'Standard', '4D63-80bit', '4D63', 'H75', 'CWTWB1U793', '315 MHz', 4, 'CR2025', 'BB5Z-15K601-A', 'Autel IM608', 'OBD', 0, '5th Gen - Standard 80-bit', 1
FROM vehicles_master WHERE make='Ford' AND model='Explorer';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2016, 2019, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C31243300', '902 MHz', 5, 'CR2450', 'GB5Z-15K601-E', 'Autel IM608', 'OBD', 0, '5th Gen - PATS update', 1
FROM vehicles_master WHERE make='Ford' AND model='Explorer';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2020, 2024, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C93142600', '902 MHz', 5, 'CR2450', 'LB5T-15K601-AE', 'Autel IM608', 'OBD', 0, '6th Gen - RWD platform', 1
FROM vehicles_master WHERE make='Ford' AND model='Explorer';

-- ============================================
-- FORD MUSTANG
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2010, 2014, 'Standard', '4D63-80bit', '4D63', 'H75', 'CWTWB1U793', '315 MHz', 4, 'CR2025', 'AR3Z-15K601-A', 'Autel IM608', 'OBD', 0, 'S197 - Classic design', 1
FROM vehicles_master WHERE make='Ford' AND model='Mustang';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2015, 2023, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C931426', '902 MHz', 5, 'CR2450', 'JR3Z-15K601-B', 'Autel IM608', 'OBD', 0, 'S550 - Modern design', 1
FROM vehicles_master WHERE make='Ford' AND model='Mustang';

-- ============================================
-- FORD FUSION
-- ============================================
INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2013, 2016, 'Standard', '4D63-80bit', '4D63', 'H75', 'N5F-A08TDA', '315 MHz', 4, 'CR2032', 'DS7Z-15K601-A', 'Autel IM608', 'OBD', 0, '2nd Gen - PATS', 1
FROM vehicles_master WHERE make='Ford' AND model='Fusion';

INSERT OR IGNORE INTO vehicle_variants (vehicle_id, year_start, year_end, key_type, immobilizer_system, chip, keyway, fcc_id, frequency, buttons, battery, oem_part_number, programmer, programming_method, pin_required, notes, verified)
SELECT id, 2013, 2020, 'Smart Key', 'ID49', 'HITAG Pro', 'H92', 'M3N-A2C31243800', '902 MHz', 5, 'CR2450', 'DS7Z-15K601-F', 'Autel IM608', 'OBD', 0, '2nd Gen - Intelligent Access', 1
FROM vehicles_master WHERE make='Ford' AND model='Fusion';

-- ============================================
-- Add extra FCC IDs to registry
-- ============================================
INSERT OR IGNORE INTO fcc_registry (fcc_id, frequency, frequency_mhz, buttons, battery, remote_start) VALUES
('TQ8-FOB-4F33', '434 MHz', 434.0, 4, 'CR2032', 0),
('TQ8-FOB-4F03', '433 MHz', 433.0, 4, 'CR2032', 0),
('TQ8-FOB-4F35', '434 MHz', 434.0, 4, 'CR2032', 0),
('SY5DMFNA433', '433 MHz', 433.0, 4, 'CR2032', 0),
('TQ8-FOB-4F11', '434 MHz', 434.0, 4, 'CR2032', 0),
('MLBHLIK6-1T', '313.8 MHz', 313.8, 4, 'CR2025', 0),
('ACJ932HK1210A', '433 MHz', 433.0, 4, 'CR2032', 0),
('CWTWB1G0090', '433 MHz', 433.0, 4, 'CR2032', 0),
('KR5TP-4', '433 MHz', 433.0, 4, 'CR2032', 0),
('MLBHLIK6-1TA', '315 MHz', 315.0, 4, 'CR2025', 0),
('OUCD6000022', '315 MHz', 315.0, 4, 'CR2032', 0),
('N5F-A08TDA', '315 MHz', 315.0, 4, 'CR2032', 0),
('M3N-A2C31243800', '902 MHz', 902.0, 5, 'CR2450', 1),
('M3N-A2C931426', '902 MHz', 902.0, 5, 'CR2450', 1),
('YGOHUF5767', '315 MHz', 315.0, 4, 'CR2450', 0),
('OSLOKA-850T', '315 MHz', 315.0, 4, 'CR2032', 0);
