-- Supplemental key data updates for Honda Odyssey 2017-2024
-- These entries have Smart Key / Prox key types

-- 2021-2024 Smart Key / Prox
UPDATE vehicles 
SET key_blank_refs = '{"oem": ["72147-THR-A41", "72147-THR-A51", "72147-THR-A61", "72147-THR-A72"]}',
    key_type_display = 'Smart Key'
WHERE make = 'Honda' 
  AND model = 'Odyssey'
  AND year_start >= 2021 
  AND year_start <= 2024
  AND key_blank_refs IS NULL;

-- 2018-2020 Smart Key / Prox  
UPDATE vehicles 
SET key_blank_refs = '{"oem": ["72147-THR-A01", "72147-THR-A11", "72147-THR-A21", "72147-THR-A31"]}',
    key_type_display = 'Smart Key'
WHERE make = 'Honda' 
  AND model = 'Odyssey'
  AND year_start >= 2018 
  AND year_start <= 2020
  AND key_blank_refs IS NULL;

-- 2014-2017 Smart Key / Prox
UPDATE vehicles 
SET key_blank_refs = '{"oem": ["72147-TK8-A51", "72147-TK8-A81"], "ilco": ["HO01-EMER"]}',
    key_type_display = 'Smart Key'
WHERE make = 'Honda' 
  AND model = 'Odyssey'
  AND year_start >= 2014 
  AND year_start <= 2017
  AND key_blank_refs IS NULL;

-- Fill in any remaining 2005-2016 entries that might have been missed
UPDATE vehicles 
SET key_blank_refs = '{"ilco": ["HO03-PT(V)"], "strattec": ["5907553t"]}',
    key_type_display = 'Transponder'
WHERE make = 'Honda' 
  AND model = 'Odyssey'
  AND year_start >= 2005 
  AND year_start <= 2016
  AND key_blank_refs IS NULL;
