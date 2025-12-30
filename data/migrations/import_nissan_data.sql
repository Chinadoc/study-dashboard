-- Nissan data from Programming Guide

UPDATE vehicle_variants
SET chip = COALESCE(NULLIF(chip, ''), 'TI 4D-60 (40-bit)'),
    immobilizer_system = COALESCE(NULLIF(immobilizer_system, ''), 'NATS 5 (Legacy)'),
    keyway = COALESCE(NULLIF(keyway, ''), 'DA34 / NSN14'),
    frequency = COALESCE(NULLIF(frequency, ''), 'N/A (Chip Only)')
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE LOWER(make) = 'nissan')
AND year_start >= 2000 AND year_end <= 2006;
UPDATE vehicle_variants
SET chip = COALESCE(NULLIF(chip, ''), 'ID46 (PCF7936)'),
    immobilizer_system = COALESCE(NULLIF(immobilizer_system, ''), 'Intelligent Key (Twist)'),
    keyway = COALESCE(NULLIF(keyway, ''), 'NSN14'),
    frequency = COALESCE(NULLIF(frequency, ''), '315')
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE LOWER(make) = 'nissan')
AND year_start >= 2007 AND year_end <= 2012;
UPDATE vehicle_variants
SET chip = COALESCE(NULLIF(chip, ''), 'ID46 (PCF7952)'),
    immobilizer_system = COALESCE(NULLIF(immobilizer_system, ''), 'Intelligent Key (Push)'),
    keyway = COALESCE(NULLIF(keyway, ''), 'NSN14 (Blade)'),
    frequency = COALESCE(NULLIF(frequency, ''), '315')
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE LOWER(make) = 'nissan')
AND year_start >= 2007 AND year_end <= 2014;
UPDATE vehicle_variants
SET chip = COALESCE(NULLIF(chip, ''), 'ID47 (HITAG 3)'),
    immobilizer_system = COALESCE(NULLIF(immobilizer_system, ''), 'NATS 6 / Prox'),
    keyway = COALESCE(NULLIF(keyway, ''), 'NSN14'),
    frequency = COALESCE(NULLIF(frequency, ''), '433')
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE LOWER(make) = 'nissan')
AND year_start >= 2013 AND year_end <= 2018;
UPDATE vehicle_variants
SET chip = COALESCE(NULLIF(chip, ''), 'ID4A (HITAG-AES)'),
    immobilizer_system = COALESCE(NULLIF(immobilizer_system, ''), 'Modern Prox'),
    keyway = COALESCE(NULLIF(keyway, ''), 'NSN14'),
    frequency = COALESCE(NULLIF(frequency, ''), '433')
WHERE vehicle_id IN (SELECT id FROM vehicles WHERE LOWER(make) = 'nissan')
AND year_start >= 2019 AND year_end <= 2025;
