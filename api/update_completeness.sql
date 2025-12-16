-- Update data completeness scores based on filled fields
UPDATE locksmith_data SET data_completeness = (
  CASE WHEN make IS NOT NULL AND make != '' THEN 1 ELSE 0 END +
  CASE WHEN make_norm IS NOT NULL AND make_norm != '' THEN 1 ELSE 0 END +
  CASE WHEN model IS NOT NULL AND model != '' THEN 1 ELSE 0 END +
  CASE WHEN year IS NOT NULL AND year > 0 THEN 1 ELSE 0 END +
  CASE WHEN immobilizer_system IS NOT NULL AND immobilizer_system != '' THEN 1 ELSE 0 END +
  CASE WHEN key_type IS NOT NULL AND key_type != '' THEN 1 ELSE 0 END +
  CASE WHEN key_category IS NOT NULL AND key_category != '' THEN 1 ELSE 0 END +
  CASE WHEN transponder_family IS NOT NULL AND transponder_family != '' THEN 1 ELSE 0 END +
  CASE WHEN chip IS NOT NULL AND chip != '' THEN 1 ELSE 0 END +
  CASE WHEN fcc_id IS NOT NULL AND fcc_id != '' THEN 1 ELSE 0 END +
  CASE WHEN part_number IS NOT NULL AND part_number != '' THEN 1 ELSE 0 END +
  CASE WHEN keyway IS NOT NULL AND keyway != '' THEN 1 ELSE 0 END +
  CASE WHEN blade_type IS NOT NULL AND blade_type != '' THEN 1 ELSE 0 END +
  CASE WHEN frequency IS NOT NULL AND frequency != '' THEN 1 ELSE 0 END +
  CASE WHEN battery IS NOT NULL AND battery != '' THEN 1 ELSE 0 END +
  CASE WHEN buttons IS NOT NULL AND buttons >= 0 THEN 1 ELSE 0 END +
  CASE WHEN prog_method IS NOT NULL AND prog_method != '' THEN 1 ELSE 0 END +
  CASE WHEN prog_tools IS NOT NULL AND prog_tools != '' THEN 1 ELSE 0 END +
  CASE WHEN akl_supported IS NOT NULL AND akl_supported != '' THEN 1 ELSE 0 END +
  CASE WHEN confidence IS NOT NULL AND confidence != '' THEN 1 ELSE 0 END +
  CASE WHEN notes IS NOT NULL AND notes != '' THEN 1 ELSE 0 END +
  CASE WHEN explainer_text IS NOT NULL AND explainer_text != '' THEN 2 ELSE 0 END
) * 100 / 23; -- 22 regular fields + 1 bonus for explainer_text

-- Mark records as needing enrichment if completeness < 70%
UPDATE locksmith_data SET needs_enrichment = CASE WHEN data_completeness < 70 THEN 1 ELSE 0 END;