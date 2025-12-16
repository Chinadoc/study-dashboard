-- Verified Honda and Toyota Key Fob Data from keylessentryremotefob.com
-- Confidence: 0.9 (verified from reputable source)
-- Source: keylessentryremotefob.com

-- ============ HONDA ============

-- Honda Ridgeline 2020-2024: FCC A3C0113290000
UPDATE vehicles 
SET 
    fcc_id = 'A3C0113290000',
    buttons = 4,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/honda-a3c0113290000-oem-4-button-key-fob/',
    verified_at = datetime('now')
WHERE make = 'Honda' 
  AND model = 'Ridgeline' 
  AND year_start >= 2020;

-- Honda Odyssey 2021-2022: FCC A3C0094750000 (7 button)
UPDATE vehicles 
SET 
    fcc_id = 'A3C0094750000',
    buttons = 7,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/honda-a3c0094750000-oem-7-button-key-fob/',
    verified_at = datetime('now')
WHERE make = 'Honda' 
  AND model = 'Odyssey' 
  AND year_start >= 2021 
  AND year_end <= 2022;

-- Honda KR5V2X Smart Keys (various models)
UPDATE vehicles 
SET 
    fcc_id = 'KR5V2X',
    oem_part_number = 'A2C99369900',
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/honda-a2c99369900-oem-6-button-key-fob-kr5v2x-driver-2/',
    verified_at = datetime('now')
WHERE make = 'Honda' 
  AND model IN ('Accord', 'Civic', 'CR-V')
  AND year_start >= 2018
  AND fcc_id IS NULL;

-- ============ TOYOTA ============

-- Toyota Tacoma: FCC HYQ12BGG
UPDATE vehicles 
SET 
    fcc_id = 'HYQ12BGG',
    buttons = 3,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/toyota-tacoma-oem-3-button-key-fob-hyq12bgg/',
    verified_at = datetime('now')
WHERE make = 'Toyota' 
  AND model = 'Tacoma';

-- Toyota 4Runner 2021-2024: FCC HYQ14FLA
UPDATE vehicles 
SET 
    fcc_id = 'HYQ14FLA',
    buttons = 3,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/toyota-hyq14fla-oem-3-button-key-fob/',
    verified_at = datetime('now')
WHERE make = 'Toyota' 
  AND model = '4Runner' 
  AND year_start >= 2021;

-- Toyota Prius 2021-2022: FCC HYQ14FLA
UPDATE vehicles 
SET 
    fcc_id = 'HYQ14FLA',
    buttons = 3,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/toyota-prius-hyq14fla-oem-3-button-key-fob/',
    verified_at = datetime('now')
WHERE make = 'Toyota' 
  AND model = 'Prius' 
  AND year_start >= 2021 
  AND year_end <= 2022;

-- Toyota Mirai 2016-2020: FCC HYQ14FBA
UPDATE vehicles 
SET 
    fcc_id = 'HYQ14FBA',
    buttons = 4,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/toyota-oem-hyq14fba-4-button-key-fob/',
    verified_at = datetime('now')
WHERE make = 'Toyota' 
  AND model = 'Mirai' 
  AND year_start >= 2016 
  AND year_end <= 2020;

-- Insert additional verified entries if not exists
INSERT OR IGNORE INTO vehicles (
    make, model, year_start, year_end, key_type, fcc_id, 
    buttons, lishi_tool,
    confidence_score, source_name, source_url, verified_at
) VALUES 
-- Honda Ridgeline 2020-2024
('Honda', 'Ridgeline', 2020, 2024, 'Smart Key', 'A3C0113290000',
 4, 'HO01',
 0.9, 'keylessentryremotefob.com', 
 'https://www.keylessentryremotefob.com/honda-a3c0113290000-oem-4-button-key-fob/',
 datetime('now')
),
-- Toyota 4Runner 2021-2024
('Toyota', '4Runner', 2021, 2024, 'Smart Key', 'HYQ14FLA',
 3, 'TOY43',
 0.9, 'keylessentryremotefob.com',
 'https://www.keylessentryremotefob.com/toyota-hyq14fla-oem-3-button-key-fob/',
 datetime('now')
),
-- Toyota Tacoma with HYQ12BGG
('Toyota', 'Tacoma', 2016, 2024, 'Standard Remote', 'HYQ12BGG',
 3, 'TOY43',
 0.9, 'keylessentryremotefob.com',
 'https://www.keylessentryremotefob.com/toyota-tacoma-oem-3-button-key-fob-hyq12bgg/',
 datetime('now')
);
