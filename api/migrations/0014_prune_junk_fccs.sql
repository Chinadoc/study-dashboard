-- Clean up scraper artifacts where the Brand Name was put in the FCC ID field
-- Only delete these 'junk' entries if a high-quality OEM entry already exists for the same vehicle
-- This prevents "Duplicate Cards" (e.g. 1 card for AB01502T, 1 card for BLUEROCKET)

DELETE FROM vehicles 
WHERE fcc_id IN ('BLUEROCKET', 'KEYLESS2GO', 'STRATTEC', 'KEYLESSFACTORY') 
AND EXISTS (
    SELECT 1 
    FROM vehicles v2 
    WHERE v2.make = vehicles.make 
    AND v2.model = vehicles.model 
    AND v2.year_start = vehicles.year_start 
    AND v2.fcc_id NOT IN ('BLUEROCKET', 'KEYLESS2GO', 'STRATTEC', 'KEYLESSFACTORY')
);

-- Force cleanup of the visual "Duplicate" configs for Escalade 2021
-- If 'ABO1502T' (typo) still exists (if previous migration missed it or soft-match failed), kill it explicitly
DELETE FROM vehicles
WHERE make = 'Cadillac' AND model = 'Escalade' AND fcc_id = 'ABO1502T';
