-- ═══════════════════════════════════════════════════════════════════════════
-- VW/VAG RESEARCH INTEGRATION MIGRATION
-- Source: Google Docs Research (MQB vs Evo, Immo Specs, FCC ID Mapping, Aftermarket Access)
-- Generated: 2025-12-26
-- ═══════════════════════════════════════════════════════════════════════════

-- ==============================================================================
-- PART 1: Update Vehicle Master Data (Security, Platforms, Lishi)
-- ==============================================================================

-- MQB Platform (2012-2020)
UPDATE vehicles SET
    platform = 'MQB',
    immobilizer_system = 'Immo 5',
    chip = 'ID48 (MQB48/Megamos AES)',
    lishi_tool = 'HU66',
    programming_method = 'OBD (Online Calculation / CS extraction)',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'MQB platform. Requires 16-byte CS. Pre-coded dealer key or dealer-key generation required. Standard tools (Autel/VVDI2) supported.'
WHERE make = 'Volkswagen' AND model IN ('Golf', 'GTI', 'Jetta', 'Tiguan', 'Atlas', 'Arteon')
    AND year_start >= 2012 AND year_end <= 2020;

-- MQB-Evo Platform (2020-2025) - "The Fortress"
UPDATE vehicles SET
    platform = 'MQB-Evo',
    immobilizer_system = 'Immo 6 (SFD + Sync Data)',
    chip = 'Locked NEC35xx / RH850',
    lishi_tool = 'HU66 V.3 / HU162',
    programming_method = 'ODIS Online / Dealer Only',
    vin_ordered = 1,
    dealer_tool_only = 'ODIS',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'MQB-Evo platform. SFD Gateway protection. Requires 32-byte Sync Data. BCM part numbers starting with 5WA or 5H0 are LOCKED. No reliable aftermarket AKL as of 2025.'
WHERE (make = 'Volkswagen' AND model IN ('Golf', 'ID.4', 'ID.7', 'Tiguan') AND year_start >= 2021)
   OR (make = 'Audi' AND model IN ('A3', 'S3', 'RS3') AND year_start >= 2021);

-- Passat B6 (2006-2010) - CCM Based
UPDATE vehicles SET
    platform = 'PQ46',
    immobilizer_system = 'Immo 4 (CCM-based)',
    chip = 'ID48 CAN',
    lishi_tool = 'HU66',
    programming_method = 'EEPROM (95320) or OBD CS Read',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Security master is CCM behind glovebox (NOT cluster). Bench read 95320 if OBD fails. Slot key system.'
WHERE make = 'Volkswagen' AND model IN ('Passat', 'CC')
    AND year_start >= 2006 AND year_end <= 2010;

-- ==============================================================================
-- PART 2: FCC Reference Updates
-- ==============================================================================

-- Legacy/Transition Flip Keys
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes)
VALUES 
    ('NBGFS12P01', 'Volkswagen', 'Golf', 2015, 2019, '315 MHz', 'MQB48', 'Flip Key', 'Legacy MQB. Hella board. Incompatible with FS12A.'),
    ('NBGFS12A01', 'Volkswagen', 'Jetta', 2018, 2021, '315 MHz', 'MQB48', 'Flip Key', 'Transition MQB. Incompatible with FS12P. Remote will not work if interchanged.'),
    ('NBG92596263', 'Volkswagen', 'Jetta', 2006, 2010, '315 MHz', 'ID48', 'Flip Key', 'Jetta Mk5 standard. Part # 1K0959753P supersedes 1K0959753H.'),
    ('NBG009066T', 'Volkswagen', 'Passat', 2006, 2010, '315 MHz', 'ID48', 'Slot Key', 'Passat B6/CC. 3C0959752BA (Non-Prox) vs 3C0959752BG (Prox/KESSY).'),
    ('NBG010180T', 'Volkswagen', 'Passat', 2012, 2014, '315 MHz', 'ID48', 'Flip Key', 'Passat NMS (US-built). Non-prox variant.'),
    ('NBG010206T', 'Volkswagen', 'Passat', 2012, 2014, '315 MHz', 'ID48', 'Flip Key', 'Passat NMS (US-built). KESSY/Push-Start variant.')
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes,
    chip_type = excluded.chip_type;

-- Evo/SFD Keys
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes)
VALUES 
    ('NBGFS197', 'Audi', 'A3', 2021, 2025, '315 MHz', 'MQB-Evo', 'Smart Key', 'Audi 8Y chassis. Locked BCM2. Requires Sync Data.'),
    ('KR5FS14 T', 'Volkswagen', 'Tiguan', 2021, 2025, '315 MHz', 'MQB-Evo', 'Smart Key', 'MQB-Evo variant. Suffix "T" is critical for facelift compatibility.')
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes;

-- ==============================================================================
-- PART 3: Vehicle Guides (Tool Walkthroughs & Security Deep Dives)
-- ==============================================================================

-- MQB AKL Sync Data Guide
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'vw-mqb-akl-sync',
    'Volkswagen',
    'MQB Platform',
    2015,
    2020,
    'VAG MQB All Keys Lost - Sync Data Guide',
    '## MQB All Keys Lost - Sync Data Procedure
    
### The Challenge
MQB vehicles require a 16-byte Component Security (CS) code. In AKL (All Keys Lost) situations, the OBD port is often locked or the cluster data is unavailable locally.

### Required Tools
- Autel IM608 / IM508 (with XP400)
- Xhorse Key Tool Plus / VVDI2
- Stable Power Supply (13.8V @ 50A)

### Procedure (Autel IM608)
1. **Connect VCI to OBDII** → Select "VW" → "Expert Selection" → "MQB Instrument Cluster".
2. **Read IMMO Data** → The tool will attempt to read the cluster EEPROM.
3. **Calculate Sync Data** → If the tool cannot calculate offline, it will request an "Online Calculation".
   - This typically requires 15-30 minutes and a third-party server token.
4. **Generate Dealer Key** → Place a virginal MQB48 chip in the programmer coil. The tool writes the Sync Data + CS to the chip.
5. **Key Adaptation** → Introduce the pre-coded key to the car via OBD.

### Troubleshooting
- **"Safe Mode" on Dash**: Key is pre-coded correctly but not yet adapted to the vehicle.
- **Fail at 99%**: Cluster data is likely encrypted/locked (NEC35xx). Bench reading or "Service Mode" entry may be required.',
    'AKL_PROCEDURE',
    'Autel/VVDI'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;

-- MQB-Evo / 5WA Lockdown Identification
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'vag-mqb-evo-lockdown',
    'VAG Group',
    'MQB-Evo (8Y/CD/5N Facelift)',
    2021,
    2025,
    'MQB-Evo "5WA" Lockdown Identification',
    '## The MQB-Evo "Hard Stop" (2021+)

### Identifying the Platform
Do not rely on model year alone. Use the **5WA Rule** to avoid bricking modules or wasting time on locked vehicles.

#### The 5WA Rule
Scan the Body Control Module (BCM) part number:
- **Serviceable (MQB)**: Part numbers starting with **5Q0** (e.g., 5Q0 937 087).
- **LOCKED (MQB-Evo)**: Part numbers starting with **5WA** or **5H0** (e.g., 5WA 937 086).

#### VIN Chassis Codes
- **Audi A3 (8Y)**: 7th/8th VIN digits = `8Y` (LOCKED)
- **VW Golf (Mk8)**: 7th/8th VIN digits = `CD` (LOCKED)
- **VW Tiguan/Jetta**: Often retains `5N`/`BU` chassis code but uses `5WA` BCMs in facelifts.

### Security Mechanisms
1. **SFD Gateway**: Requires a digital token from VAG servers for ANY write operation (even clearing some fault codes).
2. **32-byte Sync Data**: Distributed across BCM2, Cluster, and Gateway. Locked processors (RH850) prevent reading.
3. **Secure Coding**: Write operations are validated against a "User Role" in SFD2.

### Locksmith Strategy (2025)
- **Add Key**: High risk. Corrupting BCM data during read attempts is common.
- **AKL**: Effectively impossible with current aftermarket tools (Autel/Xhorse).
- **Recommendation**: Refer to dealer for ODIS-based programming.',
    'IDENTIFICATION',
    'All'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;
