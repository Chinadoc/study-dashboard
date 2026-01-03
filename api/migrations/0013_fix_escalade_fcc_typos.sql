-- Fix known typos in FCC IDs for Cadillac Escalade 2021+
-- 'ABO' (Letter O) is a common typo for 'AB0' (Zero)
UPDATE vehicles 
SET fcc_id = 'AB01502T', 
    confidence_score = 95 -- Elevate corrected entry
WHERE fcc_id = 'ABO1502T';

-- Ensure the canonical AB01502T has a high score
UPDATE vehicles 
SET confidence_score = 100 
WHERE fcc_id = 'AB01502T' AND source_name = 'AKS';

-- Lower confidence of potentially ambiguous or aftermarket duplicate entries to ensure they lose the rank battle
UPDATE vehicles 
SET confidence_score = 10 
WHERE fcc_id = 'BLUEROCKET';
