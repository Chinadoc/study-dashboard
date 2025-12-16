-- Simple merge: Insert unique records from locksmith_data into vehicles
INSERT INTO vehicles (
    make, model, year_start, year_end, key_type, immobilizer_system,
    chip, keyway, fcc_id, frequency, buttons, battery,
    oem_part_number, prog_method, prog_difficulty, prog_tools,
    akl_supported, explainer_text, blade_type, transponder_family,
    confidence_score, source_name
)
SELECT 
    make, model, year, year, key_type, immobilizer_system,
    chip, keyway, fcc_id, frequency_mhz, buttons, battery,
    part_number, prog_method, prog_difficulty, prog_tools,
    akl_supported, explainer_text, blade_type, transponder_family,
    0.7, 'locksmith_data_import'
FROM locksmith_data
WHERE make IS NOT NULL AND make != '' 
  AND model IS NOT NULL AND model != ''
  AND year IS NOT NULL
GROUP BY make, model, year;
