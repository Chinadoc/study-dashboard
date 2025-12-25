-- VW Research Integration Part 3: Passat
INSERT OR REPLACE INTO locksmith_data (make, make_norm, model, year, key_type, chip, fcc_id, frequency, keyway, immobilizer_system, prog_method, part_number, notes)
VALUES 
('Volkswagen', 'volkswagen', 'Passat', 1998, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 2', 'OBD with PIN.', '1J0959753AM', 'B5 Immo 2. Generic ID48. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Passat', 2002, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 3', 'OBD with PIN.', '1J0959753AM', 'B5.5 Immo 3. VIN married. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Passat', 2005, 'Flip Key', 'ID48', 'HLO1J0959753AM', '315 MHz', 'HU66', 'Immo 3', 'OBD with PIN.', '1J0959753AM', 'B5.5 Immo 3. VIN married. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Passat', 2006, 'Slot Key (Fobik)', 'ID48 CAN', 'NBG009066T', '315 MHz', 'HU66', 'Immo 4 (CCM)', 'CCM-based. 95320 EEPROM read required.', '3C0959752BA', 'B6 KESSY: 3C0959752BG for push-start. CCM behind glovebox. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Passat', 2008, 'Slot Key (Fobik)', 'ID48 CAN', 'NBG009066T', '315 MHz', 'HU66', 'Immo 4 (CCM)', 'CCM-based. 95320 EEPROM read required.', '3C0959752BA', 'B6 CCM-based security. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Passat', 2010, 'Slot Key (Fobik)', 'ID48 CAN', 'NBG009066T', '315 MHz', 'HU66', 'Immo 4 (CCM)', 'CCM-based. 95320 EEPROM read required.', '3C0959752BA', 'B6 CCM-based security. Lishi HU66.'),
('Volkswagen', 'volkswagen', 'Passat', 2012, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4', 'OBD programming. Pre-coded TP23.', '5K0837202AE', 'NMS platform (US-built). Lishi HU66 V.3.'),
('Volkswagen', 'volkswagen', 'Passat', 2014, 'Flip Key', 'ID48 CAN (TP23)', 'NBG010180T', '315 MHz', 'HU66', 'Immo 4', 'OBD programming. Pre-coded TP23.', '5K0837202AE', 'NMS platform. Lishi HU66 V.3.');
