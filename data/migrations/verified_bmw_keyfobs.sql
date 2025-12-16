-- Verified BMW Key Fob Data from keylessentryremotefob.com
-- Confidence: 0.9 (verified from reputable source)
-- Source: keylessentryremotefob.com

-- Update existing BMW entries with verified data

-- BMW 7-Series 2009-2011: FCC KR55WK49663, OEM 9226932-01
UPDATE vehicles 
SET 
    fcc_id = 'KR55WK49663',
    oem_part_number = '9226932-01',
    buttons = 4,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/bmw-9226932-01-factory-oem-key-fob-keyless-entry-remote-alarm-replace/',
    verified_at = datetime('now')
WHERE make = 'BMW' 
  AND model = '7-Series' 
  AND year_start >= 2009 
  AND year_end <= 2011;

-- BMW 3-Series older models: FCC A269ZUA071, OEM 82 11 1 467 015  
UPDATE vehicles 
SET 
    fcc_id = 'A269ZUA071',
    oem_part_number = '82111467015',
    buttons = 3,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/bmw-a269zua071-factory-oem-key-fob-keyless-entry-remote-alarm/',
    verified_at = datetime('now')
WHERE make = 'BMW' 
  AND model = '3-Series' 
  AND year_start >= 1995 
  AND year_end <= 2005;

-- BMW Smart Key with OEM 9266843-02 (various models)
UPDATE vehicles 
SET 
    oem_part_number = '9266843-02',
    buttons = 4,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/bmw-9266843-02-factory-oem-key-fob-keyless-entry-remote-alarm-replace/',
    verified_at = datetime('now')
WHERE make = 'BMW' 
  AND model IN ('X3', 'X5', '3-Series', '5-Series')
  AND year_start >= 2013 
  AND year_end <= 2017
  AND oem_part_number IS NULL;

-- BMW Smart Key with OEM 9266846-03 (newer models)
UPDATE vehicles 
SET 
    oem_part_number = '9266846-03',
    buttons = 4,
    confidence_score = 0.9,
    source_name = 'keylessentryremotefob.com',
    source_url = 'https://www.keylessentryremotefob.com/bmw-9266846-03-oem-4-button-key-fob/',
    verified_at = datetime('now')
WHERE make = 'BMW' 
  AND model IN ('X3', 'X5', '5-Series', '7-Series')
  AND year_start >= 2018 
  AND year_end <= 2024
  AND oem_part_number IS NULL;

-- Insert additional verified BMW entries if not exists
INSERT OR IGNORE INTO vehicles (
    make, model, year_start, year_end, key_type, fcc_id, 
    oem_part_number, buttons, lishi_tool,
    confidence_score, source_name, source_url, verified_at
) VALUES 
-- BMW 7-Series F01 Smart Key
('BMW', '7-Series', 2009, 2015, 'Smart Key', 'KR55WK49663',
 '9226932-02', 4, 'HU92',
 0.9, 'keylessentryremotefob.com', 
 'https://www.keylessentryremotefob.com/bmw-9226932-02-oem-4-button-key-fob-kr55wk49663/',
 datetime('now')
),
-- BMW 5-Series F10 Smart Key  
('BMW', '5-Series', 2010, 2016, 'Smart Key', 'YGOHUF5662',
 '9266846-03', 4, 'HU92',
 0.9, 'keylessentryremotefob.com',
 'https://www.keylessentryremotefob.com/bmw-9266846-03-oem-4-button-key-fob/',
 datetime('now')
),
-- BMW 3-Series E90 Remote
('BMW', '3-Series', 2006, 2011, 'Smart Key', 'A269ZUA111',
 '2111469448', 2, 'HU92',
 0.9, 'keylessentryremotefob.com',
 'https://www.keylessentryremotefob.com/bmw-82-11-1-469-448-factory-oem-key-fob-keyless-entry-remote-alarm-replace/',
 datetime('now')
);
