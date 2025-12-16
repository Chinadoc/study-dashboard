-- Tool Coverage Enrichment from research document

-- General Motors CAN FD Era (2020-2022)
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Autel IM608 (with CAN FD adapter), Smart Pro, OBDSTAR/Xtool (with CAN FD adapter)' ELSE prog_tools || ', Autel IM608 (with CAN FD adapter), Smart Pro, OBDSTAR/Xtool (with CAN FD adapter)' END,
  prog_method = CASE WHEN prog_method IS NULL THEN 'Requires CAN FD protocol support' ELSE prog_method || '; Requires CAN FD protocol support' END
WHERE LOWER(make) IN ('chevrolet', 'cadillac', 'gmc', 'buick') AND year BETWEEN 2020 AND 2022 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%CAN FD%');

-- Ford CAN FD and CAN-FD Support
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Autel IM608 Pro II (native CAN FD), FDRS + Autel V200' ELSE prog_tools || ', Autel IM608 Pro II (native CAN FD), FDRS + Autel V200' END,
  prog_method = CASE WHEN prog_method IS NULL THEN 'CAN-FD protocol required for 2021+ models' ELSE prog_method || '; CAN-FD protocol required for 2021+ models' END
WHERE LOWER(make) = 'ford' AND year >= 2021 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%CAN-FD%');

-- Toyota/Lexus Smart Key Emulator Requirements
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Autel IM608 with APB112 emulator, Lonsdor K518 with emulator' ELSE prog_tools || ', Autel IM608 with APB112 emulator, Lonsdor K518 with emulator' END,
  notes = CASE WHEN notes IS NULL THEN 'Requires smart key emulator for AKL scenarios' ELSE notes || '; Requires smart key emulator for AKL scenarios' END
WHERE LOWER(make) IN ('toyota', 'lexus') AND key_type = 'smart' AND year >= 2018 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%emulator%');

-- BMW CAS4/FEM Systems
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Autel IM608 with XP400, VVDI Key Tool, Yanhua' ELSE prog_tools || ', Autel IM608 with XP400, VVDI Key Tool, Yanhua' END,
  prog_difficulty = CASE WHEN prog_difficulty IS NULL THEN 'high' ELSE prog_difficulty END,
  requires_bench_unlock = 'yes'
WHERE LOWER(make) = 'bmw' AND year >= 2014 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%XP400%');

-- Mercedes FBS4 Limitations
UPDATE locksmith_data SET
  prog_tools = 'Dealer keys only - TRP program required',
  akl_supported = 'no',
  prog_method = 'Currently unsupported by aftermarket tools',
  confidence = 'low',
  confidence_reason = 'FBS4 encryption not cracked by aftermarket tools'
WHERE LOWER(make) IN ('mercedes-benz', 'mercedes') AND year >= 2015;

-- Volkswagen MQB Platform
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'VVDI Key Tool Plus, Autel IM608, OBDSTAR X300' ELSE prog_tools || ', VVDI Key Tool Plus, Autel IM608, OBDSTAR X300' END,
  prog_method = CASE WHEN prog_method IS NULL THEN 'MQB platform requires specific adapter support' ELSE prog_method || '; MQB platform requires specific adapter support' END
WHERE LOWER(make) IN ('volkswagen', 'audi', 'seat', 'skoda') AND year >= 2015 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%MQB%');

-- Chrysler/FCA Security Gateway
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Autel IM608 with 12+8 cable, Smart Pro with ADC2011' ELSE prog_tools || ', Autel IM608 with 12+8 cable, Smart Pro with ADC2011' END,
  prog_method = CASE WHEN prog_method IS NULL THEN 'Requires security gateway bypass cable' ELSE prog_method || '; Requires security gateway bypass cable' END
WHERE LOWER(make) IN ('chrysler', 'dodge', 'jeep', 'ram') AND year >= 2018 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%12+8%' OR prog_tools NOT LIKE '%ADC2011%');

-- Hyundai/Kia Post-2015
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Autel IM608, VVDI Key Tool, Lonsdor K518' ELSE prog_tools || ', Autel IM608, VVDI Key Tool, Lonsdor K518' END
WHERE LOWER(make) IN ('hyundai', 'kia') AND year >= 2015 AND (prog_tools IS NULL OR LENGTH(prog_tools) < 10);

-- Nissan/Infiniti BCM EEPROM Access
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Autel IM608, Smart Pro, OBDSTAR (with EEPROM adapter)' ELSE prog_tools || ', Autel IM608, Smart Pro, OBDSTAR (with EEPROM adapter)' END,
  notes = CASE WHEN notes IS NULL THEN 'BCM EEPROM dump often required for AKL' ELSE notes || '; BCM EEPROM dump often required for AKL' END
WHERE LOWER(make) IN ('nissan', 'infiniti') AND year >= 2013 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%EEPROM%');

-- Volvo SPA Platform
UPDATE locksmith_data SET
  prog_tools = CASE WHEN prog_tools IS NULL THEN 'Lonsdor K518 (preferred), Autel IM608 with adapter' ELSE prog_tools || ', Lonsdor K518 (preferred), Autel IM608 with adapter' END,
  prog_method = CASE WHEN prog_method IS NULL THEN 'SPA platform requires specific CEM access' ELSE prog_method || '; SPA platform requires specific CEM access' END
WHERE LOWER(make) = 'volvo' AND year >= 2016 AND (prog_tools IS NULL OR prog_tools NOT LIKE '%SPA%' OR prog_tools NOT LIKE '%CEM%');