-- Populate lishi_tool field in vehicle_variants based on keyway
-- Uses lishi_tools.csv data: keyway → lishi tool mapping

-- Hyundai/Kia → HY16
UPDATE vehicle_variants 
SET lishi_tool = 'HY16'
WHERE keyway IN ('HY16', 'HYN14R', 'HY14R') OR 
      (lishi_tool IS NULL AND vehicle_id IN (
          SELECT id FROM vehicles_master WHERE make IN ('Hyundai', 'Kia')
      ));

-- Hyundai/Kia Premium → HY22
UPDATE vehicle_variants 
SET lishi_tool = 'HY22'
WHERE keyway IN ('HY22', 'HY18');

-- Honda/Acura → HON66
UPDATE vehicle_variants 
SET lishi_tool = 'HON66'
WHERE keyway = 'HON66' OR
      (lishi_tool IS NULL AND vehicle_id IN (
          SELECT id FROM vehicles_master WHERE make IN ('Honda', 'Acura')
      ));

-- Toyota/Lexus Edge Cut → TOY43
UPDATE vehicle_variants 
SET lishi_tool = 'TOY43'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Toyota', 'Lexus')
) AND year_start < 2012 AND lishi_tool IS NULL;

-- Toyota/Lexus Newer → TOY48
UPDATE vehicle_variants 
SET lishi_tool = 'TOY48'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Toyota', 'Lexus')
) AND year_start >= 2012 AND lishi_tool IS NULL;

-- Ford/Lincoln → HU101
UPDATE vehicle_variants 
SET lishi_tool = 'HU101'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Ford', 'Lincoln')
) AND lishi_tool IS NULL;

-- GM (Chevrolet, Buick, GMC, Cadillac) → HU100
UPDATE vehicle_variants 
SET lishi_tool = 'HU100'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Chevrolet', 'Buick', 'GMC', 'Cadillac')
) AND lishi_tool IS NULL;

-- Chrysler/Dodge/Jeep → CY24
UPDATE vehicle_variants 
SET lishi_tool = 'CY24'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Chrysler', 'Dodge', 'Jeep', 'Ram')
) AND lishi_tool IS NULL;

-- BMW → HU92
UPDATE vehicle_variants 
SET lishi_tool = 'HU92'
WHERE keyway IN ('HU92', 'HU100R') OR
      vehicle_id IN (
          SELECT id FROM vehicles_master WHERE make = 'BMW'
      ) AND lishi_tool IS NULL;

-- Nissan/Infiniti → NSN14
UPDATE vehicle_variants 
SET lishi_tool = 'NSN14'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Nissan', 'Infiniti')
) AND lishi_tool IS NULL;

-- Mazda → MAZ24R
UPDATE vehicle_variants 
SET lishi_tool = 'MAZ24R'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Mazda'
) AND lishi_tool IS NULL;

-- Volkswagen/Audi → HU66 (pre-2015) or HU162 (2015+)
UPDATE vehicle_variants 
SET lishi_tool = 'HU66'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Volkswagen', 'Audi')
) AND year_start < 2015 AND lishi_tool IS NULL;

UPDATE vehicle_variants 
SET lishi_tool = 'HU162'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Volkswagen', 'Audi')
) AND year_start >= 2015 AND lishi_tool IS NULL;

-- Mercedes → HU64
UPDATE vehicle_variants 
SET lishi_tool = 'HU64'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Mercedes-Benz'
) AND lishi_tool IS NULL;

-- Subaru → NSN14 (similar keyway)
UPDATE vehicle_variants 
SET lishi_tool = 'NSN14'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Subaru'
) AND lishi_tool IS NULL;

-- Mitsubishi → MIT11R
UPDATE vehicle_variants 
SET lishi_tool = 'MIT11R'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Mitsubishi'
) AND lishi_tool IS NULL;

-- Jaguar/Land Rover → HU101
UPDATE vehicle_variants 
SET lishi_tool = 'HU101'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make IN ('Jaguar', 'Land Rover')
) AND lishi_tool IS NULL;

-- Volvo → HU101
UPDATE vehicle_variants 
SET lishi_tool = 'HU101'
WHERE vehicle_id IN (
    SELECT id FROM vehicles_master WHERE make = 'Volvo'
) AND lishi_tool IS NULL;
