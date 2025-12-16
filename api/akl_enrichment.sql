-- AKL Enrichment Updates from research documents
-- Chevrolet Silverado 2014-2019 AKL Procedure
UPDATE locksmith_data SET
  prog_method = 'Read BCM EEPROM via OBD or on-bench; requires 95320 SPI EEPROM dump',
  prog_difficulty = 'high',
  prog_tools = 'Autel IM608, VVDI2, Smart Pro',
  akl_supported = 'yes',
  requires_bench_unlock = 'yes',
  notes = CASE WHEN notes IS NULL THEN 'Immobilizer data stored in BCM EEPROM. AKL requires BCM EEPROM dump via OBD adapter or bench work.' ELSE notes || '; Immobilizer data stored in BCM EEPROM. AKL requires BCM EEPROM dump via OBD adapter or bench work.' END,
  explainer_text = 'For Chevrolet Silverado 2014-2019 AKL: Locate BCM under dash left of steering column. Use professional tool to read 95320 SPI EEPROM. Generate key file from dump data.'
WHERE LOWER(make) = 'chevrolet' AND LOWER(model) LIKE '%silverado%' AND year BETWEEN 2014 AND 2019 AND (prog_method IS NULL OR prog_method = '');

-- Ford F-150 2015-2020 AKL Procedure
UPDATE locksmith_data SET
  prog_method = 'OBD PATS reset; 10-minute security wait or dealer code required',
  prog_difficulty = 'medium_high',
  prog_tools = 'Autel IM608, Smart Pro',
  akl_supported = 'yes',
  requires_pin_seed = 'yes',
  wait_time = '10 minutes',
  notes = CASE WHEN notes IS NULL THEN 'Requires working key for OBD access. 10-minute security wait period. FDRS recommended for complex cases.' ELSE notes || '; Requires working key for OBD access. 10-minute security wait period. FDRS recommended for complex cases.' END,
  explainer_text = 'For Ford F-150 2015-2020 AKL: Insert working key, turn to ON position. Use professional tool to perform PATS reset. Wait 10 minutes for security timeout.'
WHERE LOWER(make) = 'ford' AND LOWER(model) LIKE '%f-150%' AND year BETWEEN 2015 AND 2020 AND (prog_method IS NULL OR prog_method = '');

-- Honda Accord 2018+ AKL Procedure
UPDATE locksmith_data SET
  prog_method = 'Remove gauge cluster; read IMMO EEPROM; program via OBD',
  prog_difficulty = 'high',
  prog_tools = 'Autel IM608, K518, OBDSTAR X300',
  akl_supported = 'yes',
  requires_bench_unlock = 'yes',
  notes = CASE WHEN notes IS NULL THEN 'Requires cluster removal to access IMMO module. No PIN available - must dump IMMO data.' ELSE notes || '; Requires cluster removal to access IMMO module. No PIN available - must dump IMMO data.' END,
  explainer_text = 'For Honda Accord 2018+ AKL: Remove instrument cluster to access immobilizer module. Read EEPROM data with professional tool. Program new key via OBD.'
WHERE LOWER(make) = 'honda' AND LOWER(model) LIKE '%accord%' AND year >= 2018 AND (prog_method IS NULL OR prog_method = '');

-- Toyota Camry 2018+ AKL Procedure
UPDATE locksmith_data SET
  prog_method = 'OBD programming with smart key emulator; 16-minute wait bypass',
  prog_difficulty = 'medium_high',
  prog_tools = 'Autel IM608 with APB112, Lonsdor K518',
  akl_supported = 'yes',
  wait_time = '16 minutes (bypass available)',
  notes = CASE WHEN notes IS NULL THEN 'Use smart key emulator (APB112) to bypass 16-minute wait. Requires emulator for AKL scenarios.' ELSE notes || '; Use smart key emulator (APB112) to bypass 16-minute wait. Requires emulator for AKL scenarios.' END,
  explainer_text = 'For Toyota Camry 2018+ AKL: Connect to OBD with professional tool. Use smart key emulator to bypass security timeout. Program key without waiting.'
WHERE LOWER(make) = 'toyota' AND LOWER(model) LIKE '%camry%' AND year >= 2018 AND (prog_method IS NULL OR prog_method = '');

-- Hyundai Sonata 2015-2019 AKL Procedure
UPDATE locksmith_data SET
  prog_method = 'Direct EEPROM read from BCM; 8-pin SOIC clip required',
  prog_difficulty = 'high',
  prog_tools = 'Tango, VVDI Prog, Autel IM608',
  akl_supported = 'yes',
  requires_bench_unlock = 'yes',
  notes = CASE WHEN notes IS NULL THEN 'BCM located in driver kick panel. Requires SOIC clip to read immobilizer EEPROM directly.' ELSE notes || '; BCM located in driver kick panel. Requires SOIC clip to read immobilizer EEPROM directly.' END,
  explainer_text = 'For Hyundai Sonata 2015-2019 AKL: Locate BCM in driver kick panel. Use SOIC-8 clip to read EEPROM data. Generate key from dump.'
WHERE LOWER(make) = 'hyundai' AND LOWER(model) LIKE '%sonata%' AND year BETWEEN 2015 AND 2019 AND (prog_method IS NULL OR prog_method = '');

-- Nissan Altima 2013-2018 AKL Procedure
UPDATE locksmith_data SET
  prog_method = 'Read BCM EEPROM dump or obtain 20-digit PIN',
  prog_difficulty = 'medium_high',
  prog_tools = 'Autel IM608, Smart Pro',
  akl_supported = 'yes',
  requires_pin_seed = 'yes',
  notes = CASE WHEN notes IS NULL THEN '12- or 20-digit PIN required from cluster. BCM EEPROM dump alternative. PIN from cluster needed.' ELSE notes || '; 12- or 20-digit PIN required from cluster. BCM EEPROM dump alternative. PIN from cluster needed.' END,
  explainer_text = 'For Nissan Altima 2013-2018 AKL: Obtain 12- or 20-digit PIN code from instrument cluster. Use PIN with professional tool for programming.'
WHERE LOWER(make) = 'nissan' AND LOWER(model) LIKE '%altima%' AND year BETWEEN 2013 AND 2018 AND (prog_method IS NULL OR prog_method = '');

-- Jeep Grand Cherokee 2005-2010 AKL Procedure
UPDATE locksmith_data SET
  prog_method = 'Remove SKIM module; read 24C16 EEPROM dump',
  prog_difficulty = 'high',
  prog_tools = 'Orange5, UPA-USB, Autel',
  akl_supported = 'yes',
  requires_bench_unlock = 'yes',
  requires_pin_seed = 'yes',
  notes = CASE WHEN notes IS NULL THEN 'SKIM module in steering column. 4-digit PIN from EEPROM dump required. OBD cannot extract PIN.' ELSE notes || '; SKIM module in steering column. 4-digit PIN from EEPROM dump required. OBD cannot extract PIN.' END,
  explainer_text = 'For Jeep Grand Cherokee 2005-2010 AKL: Remove SKIM from steering column. Read 24C16 EEPROM to extract 4-digit PIN. Program key with PIN.'
WHERE LOWER(make) = 'jeep' AND LOWER(model) LIKE '%grand cherokee%' AND year BETWEEN 2005 AND 2010 AND (prog_method IS NULL OR prog_method = '');