-- Cleanup Migration: Remove invalid "Part" entries from vehicles_master
-- These entries were incorrectly imported from suppliers_products.csv as distinct vehicle models
-- They often have "N/A" data and fragment the user experience.

DELETE FROM vehicles_master
WHERE model LIKE '%• Part:%'
   OR model LIKE '%Part: %'
   OR model LIKE '%HD106-PT%'
   OR model LIKE '%Bundle%';

-- Ensure strictly clean Honda models remain
-- (Optional: Verify logic before running, but these patterns shouldn't exist in a clean model name)

-- Update the Honda guide mapping to ensure coverage
UPDATE vehicle_guides
SET content = json_patch(content, '{
    "modules": [
        {
            "type": "warning_banner",
            "id": "honda-global-warning",
            "level": "critical",
            "content": "CRITICAL 2022+: Do NOT select ''2020+'' on Autel tools for Civic (FE) / Accord (CY). It bricks the BCM. Use Manual Selection -> Civic (FE)."
        }
    ]
}')
WHERE id = 'honda-complete-guide';
