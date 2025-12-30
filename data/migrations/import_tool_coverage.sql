-- Create tool_coverage table and import research data
-- Source: Claude/GPT Research - Locksmith Tool Vehicle Coverage

CREATE TABLE IF NOT EXISTS tool_coverage (
    id INTEGER PRIMARY KEY,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    autel_status TEXT,
    smart_pro_status TEXT,
    vvdi_status TEXT,
    lonsdor_status TEXT,
    obdstar_status TEXT,
    add_key_method TEXT,
    akl_method TEXT,
    pin_required BOOLEAN,
    special_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tool_coverage_make_model ON tool_coverage(make, model);

-- Import Data
INSERT INTO tool_coverage (make, model, year_start, year_end, autel_status, smart_pro_status, vvdi_status, lonsdor_status, obdstar_status, add_key_method, akl_method, pin_required, special_requirements) VALUES

-- GENERAL MOTORS
('Chevrolet', 'Silverado', 2014, 2018, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 0, 'Standard CAN'),
('Chevrolet', 'Silverado', 2019, 2021, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 0, 'Legacy CAN'),
('Chevrolet', 'Silverado', 2022, 2025, 'Add Only', 'Limited', 'No', 'No', 'No', 'OBD (Add)', 'Dealer Only (AKL)', 0, 'VIP Architecture; CAN-FD Adapter req'),
('Chevrolet', 'Tahoe', 2015, 2020, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 0, 'Standard CAN'),
('Chevrolet', 'Tahoe', 2021, 2024, 'Both', 'Both', 'Limited', 'No', 'No', 'OBD', 'OBD', 0, 'CAN-FD Adapter required'),
('Chevrolet', 'Corvette', 2020, 2024, 'Add Only', 'Add Only', 'No', 'No', 'No', 'OBD (Add)', 'Dealer Only (AKL)', 0, 'Encrypted BCM; CAN-FD'),

-- FORD
('Ford', 'F-150', 2015, 2020, 'Both', 'Both', 'Both', 'Add Only', 'Both', 'OBD', 'OBD (2 Keys to close)', 0, 'Standard Prox'),
('Ford', 'F-150', 2021, 2024, 'Both', 'Both', 'Both', 'Add Only', 'Both', 'OBD', 'OBD (Active Alarm Bypass)', 0, 'Active Alarm Cable required for AKL'),
('Ford', 'Bronco', 2021, 2024, 'Both', 'Both', 'Both', 'Add Only', 'Both', 'OBD', 'OBD (Active Alarm Bypass)', 0, 'Active Alarm Cable required'),
('Ford', 'Mustang', 2015, 2020, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 0, 'Backup slot in cupholder'),
('Ford', 'Mustang Mach-E', 2021, 2024, 'Limited', 'Both', 'No', 'No', 'No', 'OBD', 'OBD', 0, 'EV Architecture complex'),

-- STELLANTIS
('Ram', '1500', 2013, 2017, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 1, 'PIN Code required (Pullable)'),
('Ram', '1500', 2018, 2018, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 1, 'SGW - AutoAuth or 12+8 Cable'),
('Ram', '1500', 2019, 2024, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 1, 'SGW - AutoAuth or 12+8 Cable'),
('Jeep', 'Grand Cherokee', 2014, 2021, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 1, 'SGW required on 2018+'),
('Jeep', 'Grand Cherokee L', 2021, 2024, 'No', 'No', 'No', 'No', 'No', 'None', 'Replace RF Hub', 0, 'RF Hub Lock - Cannot program AKL via OBD'),
('Jeep', 'Wagoneer', 2022, 2024, 'No', 'No', 'No', 'No', 'No', 'None', 'Replace RF Hub', 0, 'RF Hub Lock'),

-- TOYOTA
('Toyota', 'Camry', 2012, 2017, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD (Emulator)', 0, 'H-Chip requires APB112/LKE'),
('Toyota', 'Camry', 2018, 2023, 'Both', 'Both', 'Add Only', 'Both', 'Add Only', 'OBD', 'OBD (G-Box)', 0, '8A Smart; G-Box3 + APB112 for AKL'),
('Toyota', 'Sienna', 2021, 2024, 'Both', 'Both', 'No', 'Both', 'No', 'OBD', 'OBD (G-Box)', 0, '8A Smart; G-Box required'),
('Toyota', 'Tundra', 2022, 2024, 'Both', 'No', 'No', 'Both', 'Both', 'OBD', 'OBD (30-Pin)', 0, '8A-BA; Requires 30-Pin Cable'),
('Toyota', 'Corolla Cross', 2022, 2024, 'Both', 'No', 'No', 'Both', 'Both', 'OBD', 'OBD (30-Pin)', 0, '4A Smart; Requires 30-Pin Cable'),

-- HONDA
('Honda', 'Accord', 2013, 2017, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 0, 'Standard Prox'),
('Honda', 'Civic', 2016, 2021, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 0, 'Standard Prox'),
('Honda', 'Civic', 2022, 2024, 'Both', 'Both', 'No', 'No', 'No', 'OBD (Add)', 'OBD (Server Calc)', 0, 'RISK: Weak BCM - Use Battery Maintainer!'),
('Acura', 'Integra', 2023, 2024, 'Both', 'Both', 'No', 'No', 'No', 'OBD (Add)', 'OBD (Server Calc)', 0, 'RISK: Weak BCM'),

-- NISSAN
('Nissan', 'Altima', 2013, 2018, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 1, '20-digit PIN Code from BCM'),
('Nissan', 'Sentra', 2020, 2024, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 1, 'Requires 16+32 Bypass Cable'),
('Nissan', 'Rogue', 2021, 2024, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 1, 'Requires 16+32 Bypass Cable'),

-- SUBARU
('Subaru', 'Outback', 2010, 2017, 'Both', 'Both', 'Both', 'Both', 'Both', 'OBD', 'OBD', 0, 'Legacy G/H Chip'),
('Subaru', 'Outback', 2020, 2024, 'Both', 'Limited', 'No', 'Both', 'No', 'OBD (Add)', 'Eeprom/OBD (Lonsdor)', 0, 'AKL difficult on Autel; K518 preferred'),

-- BMW/EURO
('BMW', '3-Series', 2012, 2018, 'Both', 'No', 'Both', 'No', 'No', 'OBD', 'Bench (FEM)', 0, 'FEM/BDC requires bench unlock'),
('Volvo', 'XC90', 2016, 2022, 'Limited', 'No', 'No', 'Both', 'No', 'OBD', 'OBD (Lonsdor)', 0, 'Lonsdor K518 is definitive tool via OBD'),
('Volkswagen', 'Golf', 2015, 2020, 'Both', 'Limited', 'Both', 'No', 'No', 'OBD', 'Bench (Cluster)', 0, 'MQB System; Requires Sync Data');

-- Update vehicle_variants with summarized data
-- Updated queries to look up vehicle_id from vehicles

UPDATE vehicle_variants
SET
    obd_program = 'CAN-FD Adapter Required',
    akl_procedure = 'Dealer Only / NASTF'
WHERE vehicle_id IN (
    SELECT id FROM vehicles
    WHERE make = 'Chevrolet' AND model IN ('Silverado 1500', 'Tahoe', 'Suburban')
) AND year_start >= 2022;

UPDATE vehicle_variants
SET
    obd_program = 'SGW Bypass (AutoAuth/Cable)',
    akl_procedure = 'Standard OBD'
WHERE vehicle_id IN (
    SELECT id FROM vehicles
    WHERE make IN ('Ram', 'Jeep', 'Dodge', 'Chrysler')
) AND year_start >= 2018;

UPDATE vehicle_variants
SET
    obd_program = 'SGW Bypass (AutoAuth/Cable)',
    akl_procedure = 'Replace RF Hub'
WHERE vehicle_id IN (
    SELECT id FROM vehicles
    WHERE make = 'Jeep' AND model IN ('Grand Cherokee L', 'Wagoneer', 'Grand Wagoneer')
) AND year_start >= 2021;

UPDATE vehicle_variants
SET
    obd_program = 'Standard OBD',
    akl_procedure = '16+32 Bypass Cable'
WHERE vehicle_id IN (
    SELECT id FROM vehicles
    WHERE make = 'Nissan'
) AND year_start >= 2020;

UPDATE vehicle_variants
SET
    obd_program = 'Standard OBD',
    akl_procedure = 'Requires 30-Pin Cable'
WHERE vehicle_id IN (
    SELECT id FROM vehicles
    WHERE make = 'Toyota' AND model IN ('Tundra', 'Sequoia', 'Corolla Cross')
) AND year_start >= 2022;

UPDATE vehicle_variants
SET
    obd_program = 'Bench Unlock Required',
    akl_procedure = 'EEPROM FEM/BDC'
WHERE vehicle_id IN (
    SELECT id FROM vehicles
    WHERE make = 'BMW'
) AND year_start >= 2012;
