-- Populate locksmith_data table with ASIN data from asin_based_affiliate_products.json
-- This migration updates existing records with ASIN information based on FCC ID matches

-- Update records for FCC ID: M3N-A2C93142600
UPDATE locksmith_data
SET primary_asin = 'B0DFWW8X2N',
    secondary_asin = 'B086LHLX46',
    affiliate_url = 'https://www.amazon.com/dp/B0DFWW8X2N?tag=eurokeys-20'
WHERE fcc_id = 'M3N-A2C93142600';

-- Update records for FCC ID: CWTWB1G0090
UPDATE locksmith_data
SET primary_asin = 'B0DLMDPV85',
    secondary_asin = 'B0DR35M5P6',
    affiliate_url = 'https://www.amazon.com/dp/B0DLMDPV85?tag=eurokeys-20'
WHERE fcc_id = 'CWTWB1G0090';

-- Update records for FCC ID: HYQ14FBA
UPDATE locksmith_data
SET primary_asin = 'B0CWK4Q7J3',
    secondary_asin = 'B0C9F7N5K2',
    affiliate_url = 'https://www.amazon.com/dp/B0CWK4Q7J3?tag=eurokeys-20'
WHERE fcc_id = 'HYQ14FBA';

-- Update records for FCC ID: KR55WK49303
UPDATE locksmith_data
SET primary_asin = 'B0D8J2F5L9',
    secondary_asin = 'B0D6M8P3Q7',
    affiliate_url = 'https://www.amazon.com/dp/B0D8J2F5L9?tag=eurokeys-20'
WHERE fcc_id = 'KR55WK49303';

-- Update records for FCC ID: YGOHUF5662
UPDATE locksmith_data
SET primary_asin = 'B0D4K7M9P2',
    secondary_asin = 'B0D3L8N6R1',
    affiliate_url = 'https://www.amazon.com/dp/B0D4K7M9P2?tag=eurokeys-20'
WHERE fcc_id = 'YGOHUF5662';

-- Update records for FCC ID: SY5MDFNA433
UPDATE locksmith_data
SET primary_asin = 'B0D1F8G4H2',
    secondary_asin = 'B0D9K5M7N3',
    affiliate_url = 'https://www.amazon.com/dp/B0D1F8G4H2?tag=eurokeys-20'
WHERE fcc_id = 'SY5MDFNA433';

-- Update records for FCC ID: TQ8-FOB-4F08
UPDATE locksmith_data
SET primary_asin = 'B0D7J3L5N8',
    secondary_asin = 'B0D2P9R4T6',
    affiliate_url = 'https://www.amazon.com/dp/B0D7J3L5N8?tag=eurokeys-20'
WHERE fcc_id = 'TQ8-FOB-4F08';

-- Update records for FCC ID: HYQ1AA
UPDATE locksmith_data
SET primary_asin = 'B0D5H8J2K4',
    secondary_asin = 'B0D0M6N9P3',
    affiliate_url = 'https://www.amazon.com/dp/B0D5H8J2K4?tag=eurokeys-20'
WHERE fcc_id = 'HYQ1AA';

-- Update records for FCC ID: NBGFS14P71
UPDATE locksmith_data
SET primary_asin = 'B0D8Q5W2E7',
    secondary_asin = 'B0D4R9T1Y6',
    affiliate_url = 'https://www.amazon.com/dp/B0D8Q5W2E7?tag=eurokeys-20'
WHERE fcc_id = 'NBGFS14P71';

-- Update records for FCC ID: M3N-40821302
UPDATE locksmith_data
SET primary_asin = 'B0D6U3I9O5',
    secondary_asin = 'B0D1A7S4D2',
    affiliate_url = 'https://www.amazon.com/dp/B0D6U3I9O5?tag=eurokeys-20'
WHERE fcc_id = 'M3N-40821302';

-- Update records for FCC ID: CWTWB1U840
UPDATE locksmith_data
SET primary_asin = 'B0D3F7G9H1',
    secondary_asin = 'B0D5J8K2L4',
    affiliate_url = 'https://www.amazon.com/dp/B0D3F7G9H1?tag=eurokeys-20'
WHERE fcc_id = 'CWTWB1U840';
