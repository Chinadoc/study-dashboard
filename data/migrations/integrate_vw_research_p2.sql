-- VW Research Integration Part 2: Golf and GTI
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, immobilizer_system, prog_method, part_number, notes)
VALUES 
('Volkswagen', 'volkswagen', 'Golf', 1999, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 2', 'OBD with PIN (4-digit SKC)', '1J0959753AM', 'Immo 2: Cluster-based. Generic ID48. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Golf', 2002, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 3', 'OBD with PIN (4-digit SKC)', '1J0959753AM', 'Immo 3: VIN married. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Golf', 2005, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 3', 'OBD with PIN (4-digit SKC)', '1J0959753AM', 'Immo 3: VIN married. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Golf', 2007, 'Flip Key', 'ID48 CAN (TP23)', 'NBG92596263', '315 MHz', 'HU66', 'Immo 4', 'Pre-coded TP23 chip required.', '1K0959753P', 'Immo 4: TP23 mandatory. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Golf', 2010, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4/4c', 'NEC+24C64 cluster.', '5K0837202AE', 'Late Mk6. NEC clusters. Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'Golf', 2014, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4/4c', 'NEC+24C64 cluster.', '5K0837202AE', 'Late Mk6. NEC clusters. Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'GTI', 2006, 'Flip Key', 'ID48 CAN (TP23)', 'NBG92596263', '315 MHz', 'HU66', 'Immo 4', 'Pre-coded TP23 chip required.', '1K0959753P', 'Same as Golf Mk5. TP23 mandatory. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'GTI', 2010, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4/4c', 'NEC+24C64 cluster.', '5K0837202AE', 'Same as Golf Mk6. Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'GTI', 2014, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4/4c', 'NEC+24C64 cluster.', '5K0837202AE', 'Same as Golf Mk6. Lishi HU66 V.3.');
