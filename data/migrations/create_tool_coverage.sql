-- Tool-to-Vehicle Coverage Matrix
-- Defines technical capabilities, required addons, and methods for priority locksmith tools.

CREATE TABLE IF NOT EXISTS tool_coverage (
    id INTEGER PRIMARY KEY,
    tool_name TEXT,           -- 'Autel IM608', 'VVDI2', 'Smart Pro', 'ACDP'
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    function TEXT,            -- 'Add Key', 'AKL', 'Read PIN', 'ISN Read'
    capability TEXT,          -- 'Full', 'Partial', 'Requires Addon', 'Not Supported'
    required_addon TEXT,      -- 'G-Box3', 'XP400 Pro', 'ADA2100 Dongle'
    notes TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW COVERAGE
-- ═══════════════════════════════════════════════════════════════════════════

-- EWS3/4 (Non-OBD)
INSERT INTO tool_coverage VALUES (NULL, 'AK90+', 'BMW', '3-Series (E46)', 1999, 2006, 'AKL', 'Full', 'None', 'Dedicated EWS bench tool; most reliable for 0D46J/2D47J MCUs.');
INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'BMW', '3-Series (E46)', 1999, 2006, 'AKL', 'Requires Addon', 'XP400 Pro + APA106', 'Bench read of EWS MCU required; manual key generation.');
INSERT INTO tool_coverage VALUES (NULL, 'VVDI Key Tool Plus', 'BMW', '3-Series (E46)', 1999, 2006, 'AKL', 'Requires Addon', 'EWS Adapter', 'Bench read required; stable file-make function.');

-- CAS3/3+ (OBD)
INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'BMW', '3-Series (E90)', 2007, 2012, 'Add Key', 'Full', 'None', 'OBD Flash Downgrade required for ISTAP; maintain 13.6V+.');
INSERT INTO tool_coverage VALUES (NULL, 'Smart Pro', 'BMW', '3-Series (E90)', 2007, 2012, 'Add Key', 'Full', 'Smart Aerial', 'Safe OBD procedure; avoids aggressive flash downgrading when possible.');

-- CAS4/4+ (F-Series)
INSERT INTO tool_coverage VALUES (NULL, 'ACDP', 'BMW', '5-Series (F10)', 2011, 2016, 'AKL', 'Full', 'Module 1', 'Solderless interface board; safest method for 5M48H MCUs.');
INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'BMW', '5-Series (F10)', 2011, 2016, 'AKL', 'Requires Addon', 'G-Box3 + XP400 Pro', 'Bench read mandatory for CAS4+; G-Box3 speeds up ISN extraction.');

-- FEM/BDC (F-Series)
INSERT INTO tool_coverage VALUES (NULL, 'ACDP', 'BMW', '3-Series (F30)', 2012, 2019, 'Add Key', 'Full', 'Module 2', 'Solderless EEPROM preprocessing; integrated workflow.');
INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'BMW', '3-Series (F30)', 2012, 2019, 'Add Key', 'Requires Addon', 'XP400 Pro', 'Requires desoldering or clean clip on 95128 EEPROM for Service Mode.');

-- G-Series (BDC3)
INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'BMW', '3-Series (G20)', 2019, 2025, 'Add Key', 'Requires Addon', 'Cloud Subscription', 'Requires internet and server calculation (~$120/yr).');

-- ═══════════════════════════════════════════════════════════════════════════
-- MERCEDES-BENZ COVERAGE (DAS3/FBS3)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'Mercedes', 'E-Class (W211)', 2003, 2009, 'AKL', 'Requires Addon', 'G-Box3 + XP400 Pro', 'Fast password calculation via G-Box man-in-the-middle attack.');
INSERT INTO tool_coverage VALUES (NULL, 'Smart Pro', 'Mercedes', 'E-Class (W211)', 2003, 2009, 'AKL', 'Requires Addon', 'ADC260 Kit', 'Reliable calculation; requires removing EIS for bench connection.');
INSERT INTO tool_coverage VALUES (NULL, 'Lonsdor K518', 'Mercedes', 'E-Class (W211)', 2003, 2009, 'Add Key', 'Full', 'None', 'Fastest OBD add-key; server calculation required.');

-- ═══════════════════════════════════════════════════════════════════════════
-- VOLVO COVERAGE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO tool_coverage VALUES (NULL, 'Lonsdor K518', 'Volvo', 'XC90 (P2)', 2003, 2014, 'AKL', 'Full', 'None', 'Industry leader for OBD Volvo; bypasses CEM removal.');
INSERT INTO tool_coverage VALUES (NULL, 'Smart Pro', 'Volvo', 'XC90 (P2)', 2003, 2014, 'AKL', 'Requires Addon', 'ADA2100 Dongle', 'Independent dongle decryption; slow but safe.');

-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA & FORD COVERAGE
-- ═══════════════════════════════════════════════════════════════════════════

-- Toyota 8A-BA (2022+)
INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'Toyota', 'Tundra', 2022, 2025, 'AKL', 'Requires Addon', '30-Pin Cable + G-Box3', 'Must back-power Smart ECU; high difficulty.');
INSERT INTO tool_coverage VALUES (NULL, 'Lonsdor K518', 'Toyota', 'Tundra', 2022, 2025, 'AKL', 'Requires Addon', '30-Pin Cable', 'Stable 8A-BA protocol support.');

-- Ford Active Alarm (2021+)
INSERT INTO tool_coverage VALUES (NULL, 'Smart Pro', 'Ford', 'F-150', 2021, 2024, 'AKL', 'Full', 'None', 'Software bypass silences alarm via OBD; no extra cables needed.');
INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'Ford', 'F-150', 2021, 2024, 'AKL', 'Requires Addon', 'Ford Alarm Cable', 'Requires direct battery connection to keep bus alive while alarm is active.');

-- ═══════════════════════════════════════════════════════════════════════════
-- FCA (Stellantis) COVERAGE
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO tool_coverage VALUES (NULL, 'Autel IM608', 'Jeep', 'Grand Cherokee', 2018, 2021, 'Add Key', 'Requires Addon', 'AutoAuth', 'SGW bypass via Wi-Fi authentication.');
INSERT INTO tool_coverage VALUES (NULL, 'VVDI Key Tool Plus', 'Jeep', 'Grand Cherokee', 2018, 2021, 'Add Key', 'Requires Addon', '12+8 Bypass Cable', 'Physical hardware bypass for firewalled OBD port.');
