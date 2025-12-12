-- Populate immobilizer_system for GM vehicles
UPDATE vehicle_variants
SET immobilizer_system = 'GM PK3 / PK3+ / PEPS'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Chevrolet', 'Buick', 'GMC', 'Cadillac')
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Chrysler/Dodge/Jeep
UPDATE vehicle_variants
SET immobilizer_system = 'Chrysler FOBIK / PEPS'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Chrysler', 'Dodge', 'Jeep', 'Ram')
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Ford
UPDATE vehicle_variants
SET immobilizer_system = 'Ford PATS / ID49'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Ford', 'Lincoln')
) AND year_start >= 2015 AND immobilizer_system IS NULL;

UPDATE vehicle_variants
SET immobilizer_system = 'Ford PATS / 4D63-80bit'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Ford', 'Lincoln')
) AND year_start < 2015 AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Honda/Acura
UPDATE vehicle_variants
SET immobilizer_system = 'Honda ID47 / HITAG3'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Honda', 'Acura')
) AND year_start >= 2018 AND immobilizer_system IS NULL;

UPDATE vehicle_variants
SET immobilizer_system = 'Honda ID46'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Honda', 'Acura')
) AND year_start < 2018 AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Toyota/Lexus
UPDATE vehicle_variants
SET immobilizer_system = 'Toyota H-System'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Toyota', 'Lexus')
) AND year_start >= 2014 AND immobilizer_system IS NULL;

UPDATE vehicle_variants
SET immobilizer_system = 'Toyota G-System'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Toyota', 'Lexus')
) AND year_start < 2014 AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Hyundai/Kia
UPDATE vehicle_variants
SET immobilizer_system = 'HITAG-AES / ID4A'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Hyundai', 'Kia')
) AND year_start >= 2020 AND immobilizer_system IS NULL;

UPDATE vehicle_variants
SET immobilizer_system = 'ID46'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Hyundai', 'Kia')
) AND year_start < 2020 AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Nissan/Infiniti
UPDATE vehicle_variants
SET immobilizer_system = 'Nissan ID46 / ID47'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Nissan', 'Infiniti')
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for BMW
UPDATE vehicle_variants
SET immobilizer_system = 'BMW CAS4+ / BDC'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'BMW'
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for VW/Audi
UPDATE vehicle_variants
SET immobilizer_system = 'VAG MQB / ID48 / ID4A'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Volkswagen', 'Audi')
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Mercedes
UPDATE vehicle_variants
SET immobilizer_system = 'Mercedes EIS / ESL'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Mercedes-Benz'
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Mazda
UPDATE vehicle_variants
SET immobilizer_system = 'Mazda ID4D / ID49'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Mazda'
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Subaru
UPDATE vehicle_variants
SET immobilizer_system = 'Subaru 4D62 / ID71'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Subaru'
) AND immobilizer_system IS NULL;

-- Populate immobilizer_system for Mitsubishi
UPDATE vehicle_variants
SET immobilizer_system = 'Mitsubishi ID46 / ID4A'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Mitsubishi'
) AND immobilizer_system IS NULL;
