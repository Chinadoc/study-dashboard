-- Migration: Cross-Link Vehicles based on Shared Architectures (Agent 5E)
-- Allows the UI to suggest "Similar Security Architectures" or "Related Guides"

BEGIN TRANSACTION;

-- 1. Create architecture_cross_links table if not exists
CREATE TABLE IF NOT EXISTS architecture_cross_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_vehicle_id INTEGER,
    related_vehicle_id INTEGER,
    architecture_tag TEXT,
    notes TEXT,
    UNIQUE(source_vehicle_id, related_vehicle_id)
);

-- 2. Populate shared architectures

-- TOYOTA 8A-BA (2021+ Sienna, Tundra, Sequoia)
INSERT OR IGNORE INTO architecture_cross_links (source_vehicle_id, related_vehicle_id, architecture_tag, notes)
SELECT v1.id, v2.id, 'Toyota 8A-BA', 'Common 128-bit proximity architecture'
FROM vehicles v1, vehicles v2
WHERE v1.id != v2.id 
AND v1.make = 'Toyota' AND v2.make = 'Toyota'
AND v1.model IN ('Sienna', 'Tundra', 'Sequoia', 'Grand Highlander')
AND v2.model IN ('Sienna', 'Tundra', 'Sequoia', 'Grand Highlander')
AND v1.year_start >= 2021 AND v2.year_start >= 2021;

-- Stellantis RAM/Jeep (2021+ Shared RF Hub)
INSERT OR IGNORE INTO architecture_cross_links (source_vehicle_id, related_vehicle_id, architecture_tag, notes)
SELECT v1.id, v2.id, 'Stellantis RFH 2021', 'Shared 902MHz/433MHz RF Hub architecture'
FROM vehicles v1, vehicles v2
WHERE v1.id != v2.id
AND v1.make IN ('Jeep', 'RAM', 'Dodge') AND v2.make IN ('Jeep', 'RAM', 'Dodge')
AND v1.model IN ('Grand Cherokee L', 'Wagoneer', 'RAM 1500')
AND v2.model IN ('Grand Cherokee L', 'Wagoneer', 'RAM 1500')
AND v1.year_start >= 2021 AND v2.year_start >= 2021;

-- GM Global B (Silverado, Sierra, Corvette)
INSERT OR IGNORE INTO architecture_cross_links (source_vehicle_id, related_vehicle_id, architecture_tag, notes)
SELECT v1.id, v2.id, 'GM Global B', 'VIP Architecture requiring CAN FD and Server Tokens'
FROM vehicles v1, vehicles v2
WHERE v1.id != v2.id
AND v1.make IN ('Chevrolet', 'GMC', 'Cadillac') AND v2.make IN ('Chevrolet', 'GMC', 'Cadillac')
AND v1.model IN ('Silverado 1500', 'Sierra 1500', 'Corvette', 'Tahoe', 'Yukon', 'Escalade')
AND v2.model IN ('Silverado 1500', 'Sierra 1500', 'Corvette', 'Tahoe', 'Yukon', 'Escalade')
AND v1.year_start >= 2021 AND v2.year_start >= 2021;

COMMIT;
