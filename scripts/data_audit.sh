#!/usr/bin/env bash
# Data Audit Script for Euro Keys Locksmith Database
# Queries Cloudflare D1 to analyze data quality

echo "=== EURO KEYS DATA AUDIT ==="
echo ""

# Summary statistics
echo "1. TOTAL RECORD COUNT"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT COUNT(*) as total_records FROM locksmith_data;"
echo ""

# Records with N/A or NULL in critical fields
echo "2. RECORDS WITH MISSING KEY BLANK (keyway)"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT make, model, COUNT(*) as count FROM locksmith_data WHERE keyway IS NULL OR keyway = '' OR keyway = 'N/A' GROUP BY make, model ORDER BY count DESC LIMIT 20;"
echo ""

echo "3. RECORDS WITH MISSING FCC ID"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT make, model, COUNT(*) as count FROM locksmith_data WHERE fcc_id IS NULL OR fcc_id = '' OR fcc_id = 'N/A' GROUP BY make, model ORDER BY count DESC LIMIT 20;"
echo ""

echo "4. RECORDS WITH MISSING CHIP TYPE"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT make, model, COUNT(*) as count FROM locksmith_data WHERE chip IS NULL OR chip = '' OR chip = 'N/A' GROUP BY make, model ORDER BY count DESC LIMIT 20;"
echo ""

echo "5. RECORDS WITH MISSING PROGRAMMING METHOD"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT make, model, COUNT(*) as count FROM locksmith_data WHERE prog_method IS NULL OR prog_method = '' GROUP BY make, model ORDER BY count DESC LIMIT 20;"
echo ""

echo "6. DUPLICATE/SIMILAR MODELS (Model name analysis)"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT make, model, COUNT(DISTINCT year) as year_range FROM locksmith_data WHERE make = 'Ford' GROUP BY make, model ORDER BY model;"
echo ""

echo "7. DATA COMPLETENESS DISTRIBUTION"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT 
  CASE 
    WHEN data_completeness >= 80 THEN '80-100% Complete'
    WHEN data_completeness >= 60 THEN '60-79% Complete'
    WHEN data_completeness >= 40 THEN '40-59% Complete'
    WHEN data_completeness >= 20 THEN '20-39% Complete'
    ELSE '0-19% Complete'
  END as completeness_band,
  COUNT(*) as record_count
FROM locksmith_data
GROUP BY completeness_band
ORDER BY completeness_band DESC;"
echo ""

echo "8. MODELS NEEDING ENRICHMENT (needs_enrichment = 1)"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT make, COUNT(*) as count FROM locksmith_data WHERE needs_enrichment = 1 GROUP BY make ORDER BY count DESC LIMIT 15;"
echo ""

echo "9. FIELDS WITH MOST N/A VALUES (Sample check)"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT 
  SUM(CASE WHEN keyway IS NULL OR keyway = '' OR keyway = 'N/A' THEN 1 ELSE 0 END) as missing_keyway,
  SUM(CASE WHEN chip IS NULL OR chip = '' OR chip = 'N/A' THEN 1 ELSE 0 END) as missing_chip,
  SUM(CASE WHEN fcc_id IS NULL OR fcc_id = '' OR fcc_id = 'N/A' THEN 1 ELSE 0 END) as missing_fcc,
  SUM(CASE WHEN frequency IS NULL OR frequency = '' THEN 1 ELSE 0 END) as missing_frequency,
  SUM(CASE WHEN battery IS NULL OR battery = '' THEN 1 ELSE 0 END) as missing_battery,
  SUM(CASE WHEN prog_method IS NULL OR prog_method = '' THEN 1 ELSE 0 END) as missing_prog_method,
  SUM(CASE WHEN prog_tools IS NULL OR prog_tools = '' THEN 1 ELSE 0 END) as missing_prog_tools,
  COUNT(*) as total
FROM locksmith_data;"
echo ""

echo "10. POTENTIAL DUPLICATE MODELS TO CONSOLIDATE"
echo "---"
npx wrangler d1 execute euro-keys-db --remote --command "SELECT make, model FROM locksmith_data WHERE model LIKE '%1-Way%' OR model LIKE '%Raptor%' OR model LIKE '%STX%' OR model LIKE '%ST%' GROUP BY make, model ORDER BY make, model;"
echo ""

echo "=== AUDIT COMPLETE ==="
