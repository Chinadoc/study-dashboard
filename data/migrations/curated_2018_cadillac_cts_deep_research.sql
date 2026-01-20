-- ================================================================
-- 2018 CADILLAC CTS - PRIORITY CURATED OVERRIDES
-- Source: Google Deep Research (2026-01-20)
-- Weight: 90% (Priority 0 - Overrides all other data sources)
-- ================================================================

-- Drop and recreate with priority column if needed
-- ALTER TABLE curated_overrides ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 50;
-- ALTER TABLE curated_overrides ADD COLUMN IF NOT EXISTS confidence INTEGER DEFAULT 80;
-- ALTER TABLE curated_overrides ADD COLUMN IF NOT EXISTS source_doc TEXT;

-- ================================================================
-- PRIORITY 0: CRITICAL SPECIFICATIONS (90% weight override)
-- These values MUST be shown on the 2018 CTS page regardless of other data
-- ================================================================

INSERT OR REPLACE INTO curated_overrides (
    make, model, year_start, year_end,
    fcc_id, frequency, chip, key_blank,
    programmer, immo_system, notes, amazon_url, priority, confidence, source_doc
) VALUES 
-- Primary North America Key (HYQ2AB @ 315 MHz)
(
    'Cadillac', 'CTS', 2018, 2018,
    'HYQ2AB', '315 MHz', 'Philips ID46 (GM Extended / NCF29A)', 'HU100 (10-Cut)',
    'Autel IM608, Smart Pro, AutoProPad', 'GM PEPS (Passive Entry Passive Start)',
    '5-Button Smart Key with Remote Start. NORTH AMERICA ONLY. OEM P/N: 13598537, 13510254, 13598507. Strattec: 5942706 (5-btn), 5942488 (4-btn). IC: 1551A-2AB. Battery: CR2032. Modulation: ASK.',
    'https://www.amazon.com/s?k=HYQ2AB+cadillac+CTS+smart+key&tag=eurokeys-20',
    0, 98, '2018_Cadillac_CTS_Locksmith_Data.txt'
),
-- Export Key (HYQ2EB @ 433 MHz) - WARNING
(
    'Cadillac', 'CTS', 2018, 2018,
    'HYQ2EB', '433 MHz', 'Philips ID46 (GM Extended)', 'HU100 (10-Cut)',
    'Autel IM608, Smart Pro, AutoProPad', 'GM PEPS',
    '⚠️ EXPORT ONLY (Europe/Middle East). 433 MHz. WILL NOT work on US vehicles - RCDLR is hardware-tuned to 315 MHz. OEM P/N: 13598512, 13598516. Strattec: 5942489. IC: 1551A-2EB.',
    'https://www.amazon.com/s?k=HYQ2EB+cadillac&tag=eurokeys-20',
    0, 98, '2018_Cadillac_CTS_Locksmith_Data.txt'
);

-- ================================================================
-- PRIORITY 0: MECHANICAL SPECIFICATIONS
-- ================================================================
INSERT OR REPLACE INTO vehicle_enrichments (
    make, model, year_start, year_end,
    immobilizer_system, platform, protocol_type, security_gateway,
    can_fd_required, online_required, lishi, 
    key_blank, code_series, spaces, depths, macs,
    battery, confidence_score, source_doc
) VALUES (
    'Cadillac', 'CTS', 2018, 2018,
    'GM PEPS (Passive Entry Passive Start)', 
    'Alpha Platform (Global A)', 
    'GMLAN / High-Speed CAN', 
    'Optional (late production only)',
    0, 0, 
    'HU100 (10-Cut)',
    'HU100', 'Z-Series (Z0001-Z6000)', 10, 5, 2,
    'CR2032',
    98, '2018_Cadillac_CTS_Locksmith_Data.txt'
);

-- ================================================================
-- CRITICAL PEARLS - High-Impact Warnings (Risk: Critical)
-- ================================================================

-- PEARL 1: Frequency Mismatch (CRITICAL - will cause job failure)
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '⚠️ FREQUENCY MISMATCH FAILURE: The 2018 CTS uses TWO different frequencies by market. HYQ2AB (315 MHz) for North America. HYQ2EB (433 MHz) for Export. They are visually IDENTICAL. The RCDLR receiver is HARDWARE-TUNED and cannot hear the wrong frequency. Programming an HYQ2EB to a US vehicle will fail silently. ALWAYS verify FCC ID on back of fob before ordering.',
    'Hardware', 'Cadillac', 'CTS', 2018, 2018,
    'critical', 'key_identification', 0,
    '["frequency", "HYQ2AB", "HYQ2EB", "315mhz", "433mhz", "export", "RCDLR"]',
    '[{"label": "⚠️ FREQUENCY", "color": "red"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'CHECK_FCC_ID_FIRST'
);

-- PEARL 2: Voltage Critical (CRITICAL - can brick BCM)
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '🔋 VOLTAGE BRICKING RISK: GM BCMs are extremely voltage-sensitive. Voltage drop below 12.0V during programming can corrupt EEPROM, potentially bricking the BCM. ALWAYS connect a regulated power supply (13.2V-13.8V) to battery terminals before ANY diagnostic programming. Do NOT rely on jump packs - use a proper battery maintainer with steady amperage.',
    'Security', 'Cadillac', 'CTS', 2018, 2018,
    'critical', 'procedures', 0,
    '["voltage", "bcm", "eeprom", "bricking", "power-supply", "programming"]',
    '[{"label": "🔋 HIGH RISK", "color": "purple"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'STABILIZE_VOLTAGE_FIRST'
);

-- PEARL 3: Transmitter Pocket Location (Important - common mistake)
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '📍 TRANSMITTER POCKET HIDDEN: The immobilizer coil is inside the CENTER CONSOLE storage bin (between seats), NOT on steering column. Critical step: REMOVE THE RUBBER MAT at the bottom of the bin to expose the pocket depression. Place fob with buttons facing UP. This is the #1 missed step causing "key not detected" during programming.',
    'Procedures', 'Cadillac', 'CTS', 2018, 2018,
    'important', 'procedures', 1,
    '["transmitter-pocket", "console", "rubber-mat", "programming", "hidden"]',
    '[{"label": "📍 LOCATION", "color": "blue"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'REMOVE_RUBBER_MAT'
);

-- PEARL 4: HU100 10-Cut vs 8-Cut (Important - wrong tool = wrong cut)
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '🔑 LISHI TOOL WARNING: 2018 CTS uses HU100 10-CUT (Z-Series codes). This is NOT the same as the 8-cut HU100 on Cruze/Equinox. Using Lishi HU100-8 will produce incorrect spacing. Use HU100 (10-Cut) tool only. Door cylinder uses positions 3-10 only (positions 1-2 are ignition-only, absent on push-start vehicles).',
    'Mechanical', 'Cadillac', 'CTS', 2018, 2018,
    'important', 'cutting', 1,
    '["HU100", "10-cut", "8-cut", "lishi", "Z-series", "cutting"]',
    '[{"label": "🔑 CUTTING", "color": "orange"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'USE_10CUT_LISHI'
);

-- PEARL 5: OBP Still Works (Pro Tip - free backup method)
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '✅ FREE AKL METHOD: Unlike many 2018+ luxury vehicles, the CTS supports Onboard Programming (OBP). For All Keys Lost: Insert cut blade in door, turn UNLOCK 5x in 10 sec. Wait three 10-minute cycles (30 min total). This is a FREE backup if your tool cannot read PIN. The 2018 CTS is surprisingly accessible.',
    'Procedures', 'Cadillac', 'CTS', 2018, 2018,
    'important', 'procedures', 1,
    '["OBP", "onboard-programming", "30-minute", "relearn", "AKL", "free"]',
    '[{"label": "✅ PRO TIP", "color": "green"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'USE_OBP_BACKUP'
);

-- PEARL 6: Hidden Door Lock Cylinder
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '🚪 CONCEALED CYLINDER: Door lock is hidden under aesthetic cap on driver handle. Pull handle open, locate slot on underside of cap, pry upward with emergency blade. Cap pops off to reveal cylinder. Turn key COUNTER-CLOCKWISE to unlock. Mechanical access overrides electronic locks when battery dead.',
    'Mechanical', 'Cadillac', 'CTS', 2018, 2018,
    'reference', 'access', 2,
    '["cylinder", "concealed", "cap", "door-handle", "emergency-access"]',
    '[{"label": "🚪 ACCESS", "color": "blue"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'PRY_CAP_OFF'
);

-- PEARL 7: CAN-FD Adapter (Late Production)
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '🔌 LATE PRODUCTION NOTE: Some late-2018 or early-2019 facelift units may require CAN-FD adapter for OBD communication. If standard tool fails to connect to BCM, try Autel CAN-FD Adapter. Keep adapter in van for any 2018+ GM vehicle.',
    'Tools', 'Cadillac', 'CTS', 2018, 2018,
    'reference', 'tools', 2,
    '["CAN-FD", "adapter", "late-production", "BCM", "communication"]',
    '[{"label": "🔌 ADAPTER", "color": "orange"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'CARRY_CANFD_ADAPTER'
);

-- PEARL 8: No Remote Detected Diagnostics
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '🔍 "NO REMOTE DETECTED" DIAGNOSTICS: 1) Try pocket start - if works, UHF path issue not transponder. 2) Replace CR2032 - below 2.9V causes cold-weather failures. 3) Unplug dash cams, USB chargers, radar detectors (RF interference). 4) If pocket start fails with new battery, RCDLR module failure (C-pillar/headliner area).',
    'Troubleshooting', 'Cadillac', 'CTS', 2018, 2018,
    'important', 'diagnostics', 1,
    '["no-remote-detected", "troubleshooting", "battery", "RCDLR", "RF-interference"]',
    '[{"label": "🔍 DIAGNOSTIC", "color": "yellow"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'DIAGNOSE_NO_REMOTE'
);

-- PEARL 9: Stock 5-Button Key
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '📦 INVENTORY TIP: Stock the 5-button fob (w/ remote start). It programs to 4-button vehicles (remote start button just won''t function). A 4-button fob CANNOT operate remote start on equipped vehicles. Strattec 5942706 is OEM-identical at lower wholesale cost than GM-branded.',
    'Inventory', 'Cadillac', 'CTS', 2018, 2018,
    'reference', 'inventory', 2,
    '["5-button", "4-button", "strattec", "inventory", "remote-start"]',
    '[{"label": "📦 INVENTORY", "color": "green"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'STOCK_5BUTTON'
);

-- PEARL 10: NASTF Backup for PIN
INSERT INTO refined_pearls (
    content, category, make, model, year_start, year_end,
    risk, section, priority, tags, display_tags, source_doc, action
) VALUES (
    '🔐 NASTF BACKUP: If tool cannot read PIN (updated BCM firmware, electrical fault), you need NASTF VSP credentials to purchase PIN by VIN from ACDelco TDS. Never rely solely on tool-based PIN reading without NASTF backup plan.',
    'Business', 'Cadillac', 'CTS', 2018, 2018,
    'important', 'business', 1,
    '["NASTF", "PIN", "TDS", "ACDelco", "VSP", "backup"]',
    '[{"label": "🔐 BUSINESS", "color": "blue"}]',
    '2018_Cadillac_CTS_Locksmith_Data.txt', 'HAVE_NASTF_BACKUP'
);

-- ================================================================
-- TOOL COVERAGE MATRIX
-- ================================================================
INSERT OR REPLACE INTO tool_coverage (make, model, year_start, year_end, tool_name, add_key, akl, read_pin, notes, priority) VALUES
('Cadillac', 'CTS', 2018, 2018, 'Autel IM608/IM508', 1, 1, 1, 'Smart Mode available. Reads PIN via OBD, bypasses 30-min wait. Excellent coverage.', 0),
('Cadillac', 'CTS', 2018, 2018, 'Smart Pro', 1, 1, 0, 'Requires tokens. Fast via server. Uses ADC2000 cable. Path: GM > Cadillac > CTS > 2017+', 0),
('Cadillac', 'CTS', 2018, 2018, 'AutoProPad', 1, 1, 1, 'Unlimited use (no tokens). Path: GM > USA > Cadillac > CTS > 2017-2019. Reliable.', 0),
('Cadillac', 'CTS', 2018, 2018, 'Tech2/MDI', 1, 1, 1, 'OEM dealer tool. Requires TIS2Web subscription. 100% reliable but complex setup.', 0);

-- ================================================================
-- PRICING REFERENCE
-- ================================================================
INSERT OR REPLACE INTO pricing_reference (make, model, year_start, year_end, service_type, dealer_price, locksmith_low, locksmith_high, notes, priority) VALUES
('Cadillac', 'CTS', 2018, 2018, 'Smart Key + Cut + Program', 450, 200, 300, 'Includes HYQ2AB fob, HU100 cut blade, and programming', 0),
('Cadillac', 'CTS', 2018, 2018, 'All Keys Lost (AKL)', 550, 275, 400, 'Includes 1 key, cut, program. Note: Customer loses access to all previous keys.', 0),
('Cadillac', 'CTS', 2018, 2018, 'Additional Key (has working)', 350, 150, 225, 'When customer already has working key. Can use OBP if 2+ keys exist.', 0);

-- ================================================================
-- WALKTHROUGHS (Full Step-by-Step)
-- ================================================================
INSERT OR REPLACE INTO walkthroughs_v2 (
    id, type, title, make, model, year_start, year_end,
    difficulty, time_minutes, risk_level,
    requirements_json, tools_json, steps_json, menu_path, source_file, priority
) VALUES 
(
    'cadillac-cts-2018-akl-obp',
    'akl',
    'All Keys Lost - OBP Method (30-Minute Free Method)',
    'Cadillac', 'CTS', 2018, 2018,
    'easy', 35, 'low',
    '["HU100 10-cut blade (cut to code or decoded)", "New HYQ2AB smart key fob (315 MHz NA)", "Fresh CR2032 battery installed in fob"]',
    '["HU100 10-Cut Lishi OR code cutting machine", "None required - uses vehicle OBP"]',
    '[
        "PREP: Verify FCC ID is HYQ2AB (315 MHz). Cut HU100 blade to code.",
        "ACCESS: Driver door - pry off handle cap to expose concealed cylinder if needed.",
        "TRIGGER: Insert cut blade into door lock. Turn to UNLOCK 5 times within 10 seconds.",
        "DISPLAY: DIC shows: REMOTE LEARN PENDING, PLEASE WAIT",
        "WAIT 1: Wait exactly 10 minutes. DIC changes to: PRESS ENGINE START BUTTON TO LEARN",
        "ACTION: Press ENGINE START/STOP button.",
        "WAIT 2: DIC returns to PENDING. Wait another 10 minutes.",
        "ACTION: Press ENGINE START/STOP button.",
        "WAIT 3: DIC returns to PENDING. Wait final 10 minutes (30 min total elapsed).",
        "ACTION: Press ENGINE START/STOP. DIC shows: READY FOR REMOTE #1. All previous keys ERASED.",
        "POCKET: Open center console. REMOVE RUBBER MAT to expose transmitter pocket.",
        "PLACE: Put new fob in pocket depression, buttons facing UP toward roof.",
        "LEARN: Press ENGINE START/STOP. System reads chip and registers key.",
        "REPEAT: For additional keys, remove first, place second in pocket, press START/STOP.",
        "EXIT: Hold ENGINE START/STOP for 12 seconds to exit programming mode.",
        "TEST: Verify Lock/Unlock buttons, Remote Start (if equipped), Engine Start."
    ]',
    'Onboard Programming (No Tool Required)',
    '2018_Cadillac_CTS_Locksmith_Data.txt',
    0
),
(
    'cadillac-cts-2018-akl-tool',
    'akl',
    'All Keys Lost - Diagnostic Tool Method (Fast)',
    'Cadillac', 'CTS', 2018, 2018,
    'medium', 15, 'moderate',
    '["Stable 12.5V+ battery or power supply (CRITICAL)", "New HYQ2AB smart key (315 MHz)", "Cut HU100 blade", "NASTF VSP credentials (backup for PIN)"]',
    '["Autel IM608/IM508", "Smart Pro w/ ADC2000", "AutoProPad", "Battery maintainer (13.2-13.8V)"]',
    '[
        "⚠️ VOLTAGE: Connect battery maintainer FIRST. Ensure steady 13.2-13.8V. BCM is voltage-sensitive.",
        "CONNECT: Plug diagnostic tool into OBD-II port (under steering column left side).",
        "NAVIGATE: Immobilizer > GM > USA > Cadillac > CTS > 2018",
        "SELECT: ALL KEYS LOST function",
        "PIN: Tool attempts to READ PIN from BCM via OBD.",
        "IF PIN SUCCESS: Follow prompts. Programming takes ~5 minutes.",
        "IF PIN FAIL: Use NASTF/ACDelco TDS to purchase PIN by VIN. Enter manually.",
        "POCKET: When prompted, open center console, remove rubber mat, place fob in pocket (buttons UP).",
        "LEARN: Follow tool prompts to register key.",
        "CLEAR: Clear DTCs after successful programming.",
        "TEST: Lock, Unlock, Remote Start, Engine Start - verify all functions."
    ]',
    'Diagnostics > GM > Cadillac > CTS > 2018 > IMMO > All Keys Lost',
    '2018_Cadillac_CTS_Locksmith_Data.txt',
    0
);

-- ================================================================
-- CROSS-REFERENCE (Same FCC ID / Same Platform)
-- ================================================================
INSERT OR REPLACE INTO vehicle_cross_reference (source_make, source_model, source_year, related_make, related_model, related_year_start, related_year_end, relationship_type, notes) VALUES
('Cadillac', 'CTS', 2018, 'Cadillac', 'ATS', 2014, 2019, 'same_fcc_id', 'HYQ2AB compatible'),
('Cadillac', 'CTS', 2018, 'Cadillac', 'CT6', 2016, 2019, 'same_fcc_id', 'HYQ2AB compatible'),
('Cadillac', 'CTS', 2018, 'Cadillac', 'XTS', 2014, 2019, 'same_fcc_id', 'HYQ2AB compatible'),
('Cadillac', 'CTS', 2018, 'Cadillac', 'CTS', 2014, 2019, 'same_platform', 'Alpha platform, same procedures'),
('Cadillac', 'CTS', 2018, 'Chevrolet', 'Camaro', 2016, 2019, 'same_platform', 'Alpha platform cousin');
