-- Cleanup Invalid Vehicle Records Migration
-- Removes incorrectly imported key blank/remote entries from vehicles
-- These were inserted as separate vehicles instead of cross-reference data

-- Before running: Expected ~350 records will be deleted
-- After running: Only legitimate vehicle models remain

-- Delete key blank entries (these caused duplicate cards like "Colorado Transponder Key Blank")
DELETE FROM vehicles 
WHERE model LIKE '% Transponder Key Blank'
   OR model LIKE '% Transponder Key Blank%';

-- Delete smart remote entries
DELETE FROM vehicles 
WHERE model LIKE '% Smart Remote%'
   OR model LIKE '%Smart Remotes%';

-- Delete standalone remote entries (careful: preserve models that legitimately contain "Remote" in name)
DELETE FROM vehicles 
WHERE model LIKE '% Remote'
   OR model LIKE '% Remote %'
   OR model LIKE '%Remote Fob%'
   OR model = 'Smart Remotes';

-- Delete mechanical key blank entries  
DELETE FROM vehicles 
WHERE model LIKE '% Mechanical Key Blank'
   OR model LIKE '% Key Blank';

-- Verification query (run after to confirm cleanup)
-- SELECT COUNT(*) FROM vehicles WHERE model LIKE '%Transponder%' OR model LIKE '%Remote%' OR model LIKE '%Key Blank%';
-- Expected result: 0
