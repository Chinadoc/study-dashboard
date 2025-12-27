-- ═══════════════════════════════════════════════════════════════════════════
-- TOOL COVERAGE & KEY FOB DEEP DIVE INTEGRATION
-- Integrates advanced tool capabilities, key fob specs, and high-risk warnings.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 1: TOOL COVERAGE UPDATES (Autel, Smart Pro, Lonsdor, OBDSTAR)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure tool_coverage table exists (supporting both schemas seen in migrations)
CREATE TABLE IF NOT EXISTS tool_coverage (
    id INTEGER PRIMARY KEY,
    tool_name TEXT,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    function TEXT,
    capability TEXT,
    required_addon TEXT,
    notes TEXT
);

-- TOYOTA 2022+ 8A-BA / 4A (High Difficulty)
INSERT INTO tool_coverage (tool_name, make, model, year_start, year_end, function, capability, required_addon, notes)
VALUES 
    ('Autel IM608', 'Toyota', 'Tundra', 2022, 2025, 'AKL', 'Full', 'G-Box3 + 30-Pin Cable + APB112', 'Requires back-powering Smart ECU via 30-pin harness.'),
    ('Lonsdor K518', 'Toyota', 'Tundra', 2022, 2025, 'AKL', 'Full', '30-Pin Cable', 'Stable 8A-BA support; often bypasses PIN requirement.'),
    ('OBDSTAR X300', 'Toyota', 'Tundra', 2022, 2025, 'AKL', 'Full', 'Toyota-30 Cable', 'Excellent software support for TMLF19 Smart Boxes.');

-- FORD ACTIVE ALARM (2021+)
INSERT INTO tool_coverage (tool_name, make, model, year_start, year_end, function, capability, required_addon, notes)
VALUES 
    ('Smart Pro', 'Ford', 'F-150', 2021, 2024, 'AKL', 'Full', 'None', 'Software bypass (ADS2328) silences alarm via OBD; safest method.'),
    ('Autel IM608', 'Ford', 'F-150', 2021, 2024, 'AKL', 'Partial', 'Ford Alarm Cable', 'Requires direct battery connection to keep bus alive while alarm active.');

-- HONDA 2022+ BCM RISK
INSERT INTO tool_coverage (tool_name, make, model, year_start, year_end, function, capability, required_addon, notes)
VALUES 
    ('Smart Pro', 'Honda', 'Civic', 2022, 2025, 'AKL', 'Full', 'None', 'ADS2336 specifically designed to prevent BCM bricking.'),
    ('Autel IM608', 'Honda', 'Civic', 2022, 2025, 'AKL', 'Partial', 'Battery Maintainer', 'HIGH RISK: Follow "Add Key" path if possible; use 13.6V maintainer.');

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 2: VEHICLE ENRICHMENT (Toyota Board IDs, Honda Memory, Jeep Logic)
-- ═══════════════════════════════════════════════════════════════════════════

-- Toyota Smart Key Board ID Clarification
UPDATE vehicles 
SET service_notes_pro = COALESCE(service_notes_pro, '') || ' [BOARD ID: 0020] Legacy G-Board (4D-G 80-bit).'
WHERE make = 'Toyota' AND model IN ('Prius C', 'RAV4') AND year_start >= 2012 AND year_end <= 2018;

UPDATE vehicles 
SET service_notes_pro = COALESCE(service_notes_pro, '') || ' [BOARD ID: 2110 (AG)] High-Security H-Board (8A-H 128-bit).'
WHERE make = 'Toyota' AND model IN ('Highlander', 'Tacoma', 'Land Cruiser') AND year_start >= 2014 AND year_end <= 2020;

-- Honda Driver 1 / Driver 2 Memory Distinctions
-- We insert/update variants to ensure Driver 1/2 distinction is clear for seat memory.
UPDATE vehicles 
SET service_notes_pro = COALESCE(service_notes_pro, '') || ' Driver 1 Memory Seat compatible.'
WHERE make = 'Honda' AND oem_part LIKE '%A11%';

UPDATE vehicles 
SET service_notes_pro = COALESCE(service_notes_pro, '') || ' Driver 2 Memory Seat compatible.'
WHERE make = 'Honda' AND oem_part LIKE '%A21%';

-- Jeep Compass (2022) Verification & Corrections
-- Correcting the GQ4-54T contamination error.
UPDATE vehicles 
SET fcc_id = 'M3N-40821302', 
    notes = 'EXCLUSIVELY M3N-40821302. Use SIP22 Blade. Verify Sales Codes: XBM (Remote Start), JRC (Power Liftgate).',
    service_notes_pro = 'GQ4-54T is for Cherokee KL only and is INCOMPATIBLE.'
WHERE make = 'Jeep' AND model = 'Compass' AND year_start = 2022;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 3: FREQUENCY & CHIP ID REFERENCE ENRICHMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- Update Ford F-150 (2015+) to 902 MHz where applicable
UPDATE vehicles 
SET frequency = '902 MHz', 
    chip_type = 'ID49 (Hitag Pro)'
WHERE make = 'Ford' AND model = 'F-150' AND year_start >= 2015 AND year_end <= 2020 AND key_type = 'Smart Key';

-- Add Transit Connect (2020+) 315 MHz Anomaly
UPDATE vehicles 
SET frequency = '315 MHz', 
    notes = 'Anomaly: Transit Connect (Euro-derived) stays on 315 MHz while F-Series moved to 902 MHz.'
WHERE make = 'Ford' AND model = 'Transit Connect' AND year_start >= 2020;

-- ═══════════════════════════════════════════════════════════════════════════
-- SECTION 4: HIGH-RISK FLAGS
-- ═══════════════════════════════════════════════════════════════════════════

-- Tagging high-risk vehicles in service_notes_pro for UI warnings
UPDATE vehicles 
SET service_notes_pro = '🔴 RED ALERT: ' || COALESCE(service_notes_pro, '') || ' High risk of BCM bricking. Stabilize voltage to 13.6V+.'
WHERE make = 'Honda' AND model IN ('Civic', 'Integra') AND year_start >= 2022;

UPDATE vehicles 
SET service_notes_pro = '🔴 RED ALERT: ' || COALESCE(service_notes_pro, '') || ' RF Hub Lock. OBD AKL impossible. Replace Hub.'
WHERE make = 'Jeep' AND model IN ('Grand Cherokee L', 'Wagoneer', 'Grand Wagoneer') AND year_start >= 2021;
