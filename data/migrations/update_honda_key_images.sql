-- Update Honda vehicles with key_image_url pointing to R2
-- Maps to extracted pages from Strattec 2020 catalog

-- Honda Odyssey gets the main Honda keys page
UPDATE vehicles 
SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/assets/key-blanks/honda/page_028.png'
WHERE make = 'Honda' AND model = 'Odyssey' AND key_image_url IS NULL;

-- Honda Accord
UPDATE vehicles 
SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/assets/key-blanks/honda/page_029.png'
WHERE make = 'Honda' AND model = 'Accord' AND key_image_url IS NULL;

-- Honda Civic
UPDATE vehicles 
SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/assets/key-blanks/honda/page_030.png'
WHERE make = 'Honda' AND model = 'Civic' AND key_image_url IS NULL;

-- Honda CR-V
UPDATE vehicles 
SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/assets/key-blanks/honda/page_031.png'
WHERE make = 'Honda' AND model = 'CR-V' AND key_image_url IS NULL;

-- Honda Pilot
UPDATE vehicles 
SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/assets/key-blanks/honda/page_035.png'
WHERE make = 'Honda' AND model = 'Pilot' AND key_image_url IS NULL;

-- Default Honda page for remaining Honda models
UPDATE vehicles 
SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/assets/key-blanks/honda/page_072.png'
WHERE make = 'Honda' AND key_image_url IS NULL;

-- Acura models get page 072 (Acura/Honda key blanks)
UPDATE vehicles 
SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/assets/key-blanks/honda/page_073.png'
WHERE make = 'Acura' AND key_image_url IS NULL;
