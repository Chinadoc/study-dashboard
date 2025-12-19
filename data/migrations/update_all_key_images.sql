-- Update all vehicles with key_image_url pointing to R2
-- Uses the first page available for each make

-- Acura
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/acura/page_002.png' WHERE make = 'Acura' AND key_image_url IS NULL;

-- Audi
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/audi/page_013.png' WHERE make = 'Audi' AND key_image_url IS NULL;

-- Buick
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/buick/page_002.png' WHERE make = 'Buick' AND key_image_url IS NULL;

-- Cadillac
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/cadillac/page_002.png' WHERE make = 'Cadillac' AND key_image_url IS NULL;

-- Chevrolet
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chevrolet/page_001.png' WHERE make = 'Chevrolet' AND key_image_url IS NULL;

-- Chrysler
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chrysler/page_002.png' WHERE make = 'Chrysler' AND key_image_url IS NULL;

-- Dodge
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/dodge/page_001.png' WHERE make = 'Dodge' AND key_image_url IS NULL;

-- Fiat
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/fiat/page_040.png' WHERE make = 'Fiat' AND key_image_url IS NULL;

-- Ford
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/ford/page_001.png' WHERE make = 'Ford' AND key_image_url IS NULL;

-- GMC
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/gmc/page_002.png' WHERE make = 'GMC' AND key_image_url IS NULL;

-- Honda (already done)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/honda/page_002.png' WHERE make = 'Honda' AND key_image_url IS NULL;

-- Hyundai
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/hyundai/page_195.png' WHERE make = 'Hyundai' AND key_image_url IS NULL;

-- Infiniti
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/infiniti/page_002.png' WHERE make = 'Infiniti' AND key_image_url IS NULL;

-- Jeep
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/jeep/page_002.png' WHERE make = 'Jeep' AND key_image_url IS NULL;

-- Land Rover
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/land_rover/page_004.png' WHERE make = 'Land Rover' AND key_image_url IS NULL;

-- Lexus
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/lexus/page_000.png' WHERE make = 'Lexus' AND key_image_url IS NULL;

-- Lincoln
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/lincoln/page_002.png' WHERE make = 'Lincoln' AND key_image_url IS NULL;

-- Mazda
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/mazda/page_002.png' WHERE make = 'Mazda' AND key_image_url IS NULL;

-- Mercedes-Benz
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/mercedes/page_001.png' WHERE make = 'Mercedes-Benz' AND key_image_url IS NULL;
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/mercedes/page_001.png' WHERE make = 'Mercedes' AND key_image_url IS NULL;

-- Mitsubishi
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/mitsubishi/page_002.png' WHERE make = 'Mitsubishi' AND key_image_url IS NULL;

-- Nissan
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/nissan/page_002.png' WHERE make = 'Nissan' AND key_image_url IS NULL;

-- Subaru
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/subaru/page_002.png' WHERE make = 'Subaru' AND key_image_url IS NULL;

-- Toyota
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/toyota/page_002.png' WHERE make = 'Toyota' AND key_image_url IS NULL;

-- Volkswagen
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/volkswagen/page_002.png' WHERE make = 'Volkswagen' AND key_image_url IS NULL;

-- Volvo
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/volvo/page_002.png' WHERE make = 'Volvo' AND key_image_url IS NULL;

-- BMW (add even though not extracted - may need separate source)
-- UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/bmw/page_001.png' WHERE make = 'BMW' AND key_image_url IS NULL;

-- Kia
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/hyundai/page_195.png' WHERE make = 'Kia' AND key_image_url IS NULL;

-- Ram (shares with Dodge)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/dodge/page_001.png' WHERE make = 'Ram' AND key_image_url IS NULL;

-- Scion (shares with Toyota)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/toyota/page_002.png' WHERE make = 'Scion' AND key_image_url IS NULL;

-- Saturn (GM)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chevrolet/page_001.png' WHERE make = 'Saturn' AND key_image_url IS NULL;

-- Pontiac (GM)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chevrolet/page_001.png' WHERE make = 'Pontiac' AND key_image_url IS NULL;

-- Oldsmobile (GM)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chevrolet/page_001.png' WHERE make = 'Oldsmobile' AND key_image_url IS NULL;

-- Mercury (Ford)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/ford/page_001.png' WHERE make = 'Mercury' AND key_image_url IS NULL;

-- Plymouth (Chrysler)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chrysler/page_002.png' WHERE make = 'Plymouth' AND key_image_url IS NULL;

-- Geo (GM/Suzuki)
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chevrolet/page_001.png' WHERE make = 'Geo' AND key_image_url IS NULL;

-- Isuzu 
UPDATE vehicles SET key_image_url = 'https://euro-keys.jeremy-samuels17.workers.dev/api/assets/key-blanks/chevrolet/page_001.png' WHERE make = 'Isuzu' AND key_image_url IS NULL;
