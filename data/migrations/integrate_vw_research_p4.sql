-- VW Research Integration Part 4: Beetle, CC, Tiguan, Eos
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, immobilizer_system, prog_method, part_number, notes)
VALUES 
('Volkswagen', 'volkswagen', 'Beetle', 1998, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 2', 'OBD with PIN', '1J0959753AM', 'PQ34. Generic ID48. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Beetle', 2002, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 3', 'OBD with PIN', '1J0959753AM', 'PQ34 Immo 3. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Beetle', 2005, 'Flip Key', 'ID48 CAN (TP23)', 'NBG92596263', '315 MHz', 'HU66', 'Immo 4', 'Pre-coded TP23 required', '1K0959753P', 'TRAP: Mk4 chassis but CAN Immo 4! Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Beetle', 2008, 'Flip Key', 'ID48 CAN (TP23)', 'NBG92596263', '315 MHz', 'HU66', 'Immo 4', 'Pre-coded TP23 required', '1K0959753P', 'CAN Immo 4. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Beetle', 2012, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4/4c', 'Advanced OBD tools', '5K0837202AE', 'Third-gen. Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'CC', 2009, 'Slot Key', 'ID48 CAN', 'NBG009066T', '315 MHz', 'HU66', 'Immo 4 (CCM)', 'CCM-based.', '3C0959752BA', 'B6 slot key. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'CC', 2012, 'Slot Key', 'ID48 CAN', 'NBG009066T', '315 MHz', 'HU66', 'Immo 4 (CCM)', 'CCM-based.', '3C0959752BA', 'B6 slot key. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'CC', 2014, 'Flip Key', 'ID48 CAN', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4', 'Flip key system.', '5K0837202AE', 'Later CC flip key. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Tiguan', 2009, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4', 'OBD with TP23.', '5K0837202AE', 'PQ35. Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'Tiguan', 2012, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4', 'OBD with TP23.', '5K0837202AE', 'PQ35. Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'Tiguan', 2015, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4', 'OBD with TP23.', '5K0837202AE', 'PQ35. Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'Eos', 2007, 'Flip Key', 'ID48 CAN (TP23)', 'NBG92596263', '315 MHz', 'HU66', 'Immo 4', 'OBD with TP23.', '1K0959753P', 'Retractable hardtop. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Eos', 2012, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4', 'OBD with TP23.', '5K0837202AE', 'Mk6 key system. Lishi HU66.');
