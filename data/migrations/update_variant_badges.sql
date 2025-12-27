-- Migration: Update Variant Badges for Agent 4E
-- Maps vehicle_variants to platform_tag based on architecture triggers

BEGIN TRANSACTION;

-- GM Global B Variants (using VIN pattern or model/year as proxy)
UPDATE vehicle_variants 
SET platform_tag = 'platform_global_b'
WHERE series IN ('Silverado 1500 (Refreshed)', 'Sierra 1500 (Refreshed)', 'Corvette C8', 'Tahoe', 'Yukon', 'Escalade')
AND year_start >= 2021;

-- Ford FNV2 Variants (2021+ F-150, Bronco, etc.)
UPDATE vehicle_variants 
SET platform_tag = 'platform_fnv2'
WHERE model IN ('F-150', 'Bronco', 'Mustang Mach-E', 'Expedition')
AND year_start >= 2021;

-- SGW Bypass Required (Most 2018+ Stellantis, 2020+ Nissan/Mitsubishi, 2017+ Honda)
UPDATE vehicle_variants 
SET platform_tag = 'security_sgw'
WHERE (make IN ('Jeep', 'Dodge', 'RAM', 'Chrysler', 'Fiat', 'Alfa Romeo') AND year_start >= 2018)
   OR (make = 'Nissan' AND year_start >= 2020)
   OR (make = 'Honda' AND model IN ('Civic', 'Accord', 'CR-V') AND year_start >= 2022);

-- High Risk Variants (Honda 2022+, Jeep RF Hub Lock vehicles)
UPDATE vehicle_variants 
SET platform_tag = 'security_high_risk'
WHERE (make = 'Honda' AND model = 'Civic' AND year_start >= 2022)
   OR (make = 'Jeep' AND model IN ('Grand Cherokee L', 'Wagoneer', 'Grand Wagoneer') AND year_start >= 2021);

-- CAN FD Required (Global B + 2020+ Ford/Hyundai)
-- Note: Often overlaps with Global B tag, so we use a bitmask or just the primary tag.
-- For now, we apply to Hyundai/Kia SGW models that explicitly need CAN FD.
UPDATE vehicle_variants 
SET platform_tag = 'hardware_can_fd'
WHERE (make IN ('Hyundai', 'Kia') AND series LIKE '%SGW%')
AND platform_tag IS NULL;

COMMIT;
