-- Import Transponder Chip Data from Research
-- Source: Claude/GPT Research - Automotive Transponder Chip Database

-- Update chip_registry with detailed chip information
-- Recreate table to match imported data structure
DROP TABLE IF EXISTS chip_registry;
CREATE TABLE chip_registry (
    chip_type TEXT PRIMARY KEY,
    technology TEXT,
    bits INTEGER,
    description TEXT
);

INSERT OR REPLACE INTO chip_registry (chip_type, technology, bits, description) VALUES
-- Texas Instruments Chips
('4C', 'Texas Fixed Code', 40, 'Fixed code glass ampoule; easily clonable; CN1/TPX1/XT27'),
('4D-60', 'Texas Crypto 40', 40, 'Ford/Mazda specific; clonable with sniff; CN2/TPX2/XT27'),
('4D-61', 'Texas Crypto 40', 40, 'Mitsubishi specific logic'),
('4D-62', 'Texas Crypto 40', 40, 'Subaru specific logic'),
('4D-63-40', 'Texas Crypto 40', 40, 'Ford 40-bit PATS 2; H84/H92 keyway; clonable'),
('4D-63-80', 'Texas DST-80', 80, 'Ford 80-bit PATS 3; Not clonable; OBD required'),
('4D-67', 'Texas Crypto 40', 40, 'Toyota Dot/Dimple 2002-2010; clonable'),
('4D-68', 'Texas Crypto 40', 40, 'Toyota/Lexus variant'),
('4D-72', 'Texas DST-80', 80, 'Toyota G-Chip 2010-2014; clonable CN5/LKP-02'),
('8A-H', 'Texas DST-AES', 128, 'Toyota H-Chip 2013-2019; clonable LKP-04/XT27'),
('8A-BA', 'Texas DST-AES', 128, 'Toyota Smart Key 2019+; difficult; requires emulator'),
('ID49', 'NXP Hitag Pro', 128, 'Ford/Mazda 2015+; NOT clonable; OBD only'),

-- NXP/Philips Chips
('ID40', 'Philips Crypto 1', 32, 'Early fixed code; easily clonable'),
('ID44', 'Philips PCF7935', 32, 'BMW EWS system; clonable'),
('ID46', 'Philips Hitag2', 48, 'Most common 2004-2015; GM/Honda/Nissan; fully clonable'),
('ID46E', 'Philips Crypto 2 Extended', 48, 'Extended ID46; partially clonable with Tango SLK'),
('ID47', 'NXP Hitag3', 128, 'Honda 2013+; Hyundai/Kia; NOT clonable'),
('ID4A', 'NXP Hitag AES', 128, 'Latest Nissan/Hyundai/Kia 2020+; NOT clonable'),
('ID48', 'Megamos Crypto', 96, 'VW/Audi/Honda 2003-2014; 96-bit server clone'),
('ID48-CAN', 'Megamos CAN', 96, 'VW/Audi CAN Bus; 96-bit server clone required'),
('ID88', 'Megamos AES MQB', 128, 'VW/Audi MQB 2015+; NOT clonable; OBD CS codes'),

-- Other Chips
('PCF7935', 'Philips', 32, 'BMW ID44 equivalent'),
('PCF7936', 'Philips', 48, 'ID46 equivalent'),
('PCF7952', 'NXP', 128, 'Modern encrypted chip'),
('PCF7938', 'NXP Hitag3', 128, 'Honda H-chip equivalent'),
('PCF7939', 'NXP Hitag Pro', 128, 'ID49 Ford equivalent');

-- Update vehicle_variants with transponder chip data and clonability
-- Toyota
UPDATE vehicle_variants SET chip = '4C', cloning_possible = 1 WHERE year_start BETWEEN 1998 AND 2001 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Toyota', 'Lexus'));
UPDATE vehicle_variants SET chip = '4D-67', cloning_possible = 1 WHERE year_start BETWEEN 2002 AND 2009 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Toyota', 'Lexus', 'Scion'));
UPDATE vehicle_variants SET chip = '4D-72', cloning_possible = 1 WHERE year_start BETWEEN 2010 AND 2013 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Toyota', 'Lexus', 'Scion'));
UPDATE vehicle_variants SET chip = '8A-H', cloning_possible = 1 WHERE year_start BETWEEN 2014 AND 2019 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Toyota', 'Lexus'));
UPDATE vehicle_variants SET chip = '8A-BA', cloning_possible = 0, obd_program = 'Requires bypass cable/emulator' WHERE year_start >= 2020 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Toyota', 'Lexus'));

-- Ford (PATS generations)
UPDATE vehicle_variants SET chip = '4C', cloning_possible = 1 WHERE year_start BETWEEN 1996 AND 2003 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Ford', 'Lincoln', 'Mercury'));
UPDATE vehicle_variants SET chip = '4D-63-40', cloning_possible = 1 WHERE year_start BETWEEN 2004 AND 2010 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Ford', 'Lincoln', 'Mercury', 'Mazda'));
UPDATE vehicle_variants SET chip = '4D-63-80', cloning_possible = 0, obd_program = 'OBD 80-bit programming' WHERE year_start BETWEEN 2011 AND 2014 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Ford', 'Lincoln'));
UPDATE vehicle_variants SET chip = 'ID49', cloning_possible = 0, obd_program = 'OBD HU101; 10-min security delay' WHERE year_start >= 2015 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Ford', 'Lincoln'));

-- GM (Circle Plus / PK3+)
UPDATE vehicle_variants SET chip = 'ID46', cloning_possible = 1 WHERE year_start BETWEEN 2006 AND 2019 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Chevrolet', 'GMC', 'Buick', 'Cadillac'));
UPDATE vehicle_variants SET chip = 'ID46E', cloning_possible = 0, obd_program = 'CAN-FD required 2021+' WHERE year_start >= 2020 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Chevrolet', 'GMC', 'Cadillac'));

-- Honda
UPDATE vehicle_variants SET chip = 'ID48', cloning_possible = 1 WHERE year_start BETWEEN 2002 AND 2006 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Honda', 'Acura'));
UPDATE vehicle_variants SET chip = 'ID46', cloning_possible = 1 WHERE year_start BETWEEN 2007 AND 2012 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Honda', 'Acura'));
UPDATE vehicle_variants SET chip = 'ID47', cloning_possible = 0, obd_program = 'OBD Add Key required' WHERE year_start BETWEEN 2013 AND 2017 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Honda', 'Acura'));
UPDATE vehicle_variants SET chip = 'ID4A', cloning_possible = 0, obd_program = 'Hitag AES; K518/IM608' WHERE year_start >= 2018 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Honda', 'Acura'));

-- Nissan
UPDATE vehicle_variants SET chip = 'ID46', cloning_possible = 1 WHERE year_start BETWEEN 2005 AND 2018 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Nissan', 'Infiniti'));
UPDATE vehicle_variants SET chip = 'ID47', cloning_possible = 0, obd_program = 'OBD; Security Gateway 2020+' WHERE year_start >= 2019 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Nissan', 'Infiniti'));

-- Hyundai/Kia
UPDATE vehicle_variants SET chip = 'ID46', cloning_possible = 1 WHERE year_start BETWEEN 2006 AND 2014 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Hyundai', 'Kia', 'Genesis'));
UPDATE vehicle_variants SET chip = 'ID46E', cloning_possible = 0, obd_program = 'PIN from BCM required' WHERE year_start BETWEEN 2015 AND 2019 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Hyundai', 'Kia', 'Genesis'));
UPDATE vehicle_variants SET chip = 'ID4A', cloning_possible = 0, obd_program = 'Hitag AES; OBD programming' WHERE year_start >= 2020 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Hyundai', 'Kia', 'Genesis'));

-- Chrysler/Dodge/Jeep/Ram
UPDATE vehicle_variants SET chip = 'ID46', cloning_possible = 1 WHERE year_start BETWEEN 2005 AND 2017 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Chrysler', 'Dodge', 'Jeep', 'Ram'));
UPDATE vehicle_variants SET chip = 'ID4A', cloning_possible = 0, obd_program = 'Secure Gateway bypass required' WHERE year_start >= 2018 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Chrysler', 'Dodge', 'Jeep', 'Ram'));

-- BMW
UPDATE vehicle_variants SET chip = 'ID44', cloning_possible = 1 WHERE year_start BETWEEN 1995 AND 2005 AND vehicle_id IN (SELECT id FROM vehicles WHERE make = 'BMW');
UPDATE vehicle_variants SET chip = 'ID46', cloning_possible = 1 WHERE year_start BETWEEN 2006 AND 2014 AND vehicle_id IN (SELECT id FROM vehicles WHERE make = 'BMW');
UPDATE vehicle_variants SET chip = 'ID49', cloning_possible = 0, obd_program = 'CAS4/FEM bench read required' WHERE year_start >= 2015 AND vehicle_id IN (SELECT id FROM vehicles WHERE make = 'BMW');

-- VW/Audi
UPDATE vehicle_variants SET chip = 'ID48', cloning_possible = 1 WHERE year_start BETWEEN 2000 AND 2014 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Volkswagen', 'Audi'));
UPDATE vehicle_variants SET chip = 'ID88', cloning_possible = 0, obd_program = 'MQB CS codes; OBD only' WHERE year_start >= 2015 AND vehicle_id IN (SELECT id FROM vehicles WHERE make IN ('Volkswagen', 'Audi'));

-- Mercedes
UPDATE vehicle_variants SET chip = 'ID46', cloning_possible = 1 WHERE year_start BETWEEN 2000 AND 2014 AND vehicle_id IN (SELECT id FROM vehicles WHERE make = 'Mercedes-Benz');
UPDATE vehicle_variants SET chip = 'ID4A', cloning_possible = 0, obd_program = 'FBS4 - DEALER ONLY' WHERE year_start >= 2015 AND vehicle_id IN (SELECT id FROM vehicles WHERE make = 'Mercedes-Benz');
