-- BMW Research Integration Migration
-- Source: BMW_CAS_vs_FEM_BDC_Architecture_Research.txt, BMW_Locksmith_Guide_Development.txt, European_Luxury_Key_Programming_Gap.txt
-- Generated: 2025-12-26

-- ==============================================================================
-- PART 1: Schema Enhancement (Add security columns if not exists)
-- ==============================================================================

-- Note: D1 doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS directly, 
-- so we handle errors gracefully or skip if column exists in production

-- ==============================================================================
-- PART 2: BMW Vehicle Card Updates (FCC IDs, Chips, Frequencies, Platforms)
-- ==============================================================================

-- CAS4 Systems (F10, F01, F25, F07)
UPDATE vehicles_master SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'CAS4',
    security_notes = 'CAS4 located under dash (driver side). Bench read required for AKL. ISN extraction via D-Flash read. Use 5M48H/1N35H MCU adapters.',
    lishi_tool = 'HU92',
    bypass_method = NULL,
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('5 Series', '5-Series', '7 Series', '7-Series') 
    AND year >= 2010 AND year <= 2016;

UPDATE vehicles_master SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'CAS4',
    security_notes = 'CAS4 (F25 platform). Older L6 architecture despite SUV body. Bench read for AKL.',
    lishi_tool = 'HU92',
    bypass_method = NULL,
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('X3') 
    AND year >= 2011 AND year <= 2017;

-- FEM Systems (F30, F32, F20, F22)
UPDATE vehicles_master SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'FEM',
    security_notes = 'FEM in kick panel (passenger side). PREPROCESSING REQUIRED: Read 95128 EEPROM, generate Service File, flash MCU. ISN sync with DME mandatory for AKL.',
    lishi_tool = 'HU100R',
    bypass_method = 'EEPROM Preprocessing',
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('3 Series', '3-Series', '4 Series', '4-Series', '1 Series', '1-Series', '2 Series', '2-Series') 
    AND year >= 2012 AND year <= 2019;

-- BDC Systems (F15, G-Series)
UPDATE vehicles_master SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'BDC',
    security_notes = 'BDC in kick panel (passenger side). Early BDC iteration. Bench preprocessing required.',
    lishi_tool = 'HU100R',
    bypass_method = 'EEPROM Preprocessing',
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('X5', 'X6') 
    AND year >= 2014 AND year <= 2018;

-- BDC2/BDC3 G-Series (2019+)
UPDATE vehicles_master SET
    chip_type = 'NCF2951',
    platform = 'BDC3',
    security_notes = 'BDC3 system. Cloud calculation required (Autel subscription ~$120/VIN). Post-June 2020: BOSCH DME LOCKED - Cannot read ISN, dealer key required for AKL.',
    lishi_tool = 'HU100R',
    bypass_method = 'Cloud Calculation / Dealer Only',
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('3 Series', '3-Series', '5 Series', '5-Series', 'X3', 'X5', 'X7', 'M3', 'M5') 
    AND year >= 2019;

-- ==============================================================================
-- PART 3: BMW FCC Reference Updates
-- ==============================================================================

-- CAS4 315 MHz (Pre-2014 US Market)
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('YGOHUF5662', 'BMW', '5 Series', 2010, 2014, '315 MHz', 'ID49', 'Smart Key', 'CAS4 legacy. US market pre-2014. Continental/HUF board.', NULL),
    ('YGOHUF5662', 'BMW', '7 Series', 2009, 2014, '315 MHz', 'ID49', 'Smart Key', 'CAS4 legacy. US market pre-2014.', NULL),
    ('YGOHUF5662', 'BMW', 'X3', 2011, 2014, '315 MHz', 'ID49', 'Smart Key', 'CAS4 (F25 platform). US market.', NULL),
    ('YGOHUF5662', 'BMW', 'X5', 2013, 2014, '315 MHz', 'ID49', 'Smart Key', 'Early BDC (F15). 315 MHz before frequency transition.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    frequency = excluded.frequency,
    chip_type = excluded.chip_type,
    notes = excluded.notes;

-- CAS4/FEM 434 MHz (Post-2014)
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('YGOHUF5767', 'BMW', '5 Series', 2014, 2016, '434 MHz', 'ID49', 'Smart Key', 'CAS4 post-frequency transition. HUF board standard.', NULL),
    ('YGOHUF5767', 'BMW', '7 Series', 2014, 2016, '434 MHz', 'ID49', 'Smart Key', 'CAS4 post-frequency transition.', NULL),
    ('YGOHUF5767', 'BMW', 'X5', 2014, 2018, '434 MHz', 'ID49', 'Smart Key', 'BDC (F15). 434 MHz standard.', NULL),
    ('YGOHUF5767', 'BMW', 'X6', 2014, 2019, '434 MHz', 'ID49', 'Smart Key', 'BDC (F16). 434 MHz standard.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    frequency = excluded.frequency,
    chip_type = excluded.chip_type,
    notes = excluded.notes;

-- FEM 434 MHz (F30/F32)
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('NBGIDGNG1', 'BMW', '3 Series', 2014, 2019, '434 MHz', 'ID49', 'Smart Key', 'FEM system. Preprocessing required. HUF board.', NULL),
    ('NBGIDGNG1', 'BMW', '4 Series', 2014, 2020, '434 MHz', 'ID49', 'Smart Key', 'FEM system identical to F30.', NULL),
    ('NBGIDGNG1', 'BMW', '1 Series', 2014, 2019, '434 MHz', 'ID49', 'Smart Key', 'FEM system.', NULL),
    ('NBGIDGNG1', 'BMW', '2 Series', 2014, 2020, '434 MHz', 'ID49', 'Smart Key', 'FEM system.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    frequency = excluded.frequency,
    chip_type = excluded.chip_type,
    notes = excluded.notes;

-- G-Series BDC3 (2019+)
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('N5F-ID21A', 'BMW', '3 Series', 2019, 2025, '434 MHz', 'NCF2951', 'Blade Smart', 'BDC3 system. Cloud calculation required. Post-06/2020: Bosch DME locked.', NULL),
    ('N5F-ID21A', 'BMW', '5 Series', 2017, 2025, '434 MHz', 'NCF2951', 'Blade Smart', 'BDC2/BDC3 (G30). Cloud calculation.', NULL),
    ('N5F-ID21A', 'BMW', 'X3', 2018, 2025, '434 MHz', 'NCF2951', 'Blade Smart', 'BDC3 (G01). Cloud calculation required.', NULL),
    ('N5F-ID21A', 'BMW', 'X5', 2019, 2025, '434 MHz', 'NCF2951', 'Blade Smart', 'BDC3 (G05). Cloud calculation required.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    frequency = excluded.frequency,
    chip_type = excluded.chip_type,
    notes = excluded.notes;

-- CAS3 (E-Series for reference)
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('KR55WK49127', 'BMW', '3 Series', 2006, 2011, '315 MHz', 'ID46 (PCF7945)', 'Smart Key', 'CAS3 system. Comfort Access version. Flash downgrade may be needed for CAS3+ add key.', NULL),
    ('KR55WK49123', 'BMW', '5 Series', 2006, 2010, '315 MHz', 'ID46 (PCF7945)', 'Slot Key', 'CAS3 system. Non-Comfort Access slot key.', NULL),
    ('KR55WK49127', 'BMW', '5 Series', 2006, 2010, '315 MHz', 'ID46 (PCF7945)', 'Smart Key', 'CAS3 system. Comfort Access version.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    frequency = excluded.frequency,
    chip_type = excluded.chip_type,
    notes = excluded.notes;

-- ==============================================================================
-- PART 4: BMW Tool-Specific Walkthroughs (Insert into vehicle_guides)
-- ==============================================================================

-- BMW FEM/BDC All Keys Lost - Autel Procedure
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'bmw-fem-akl-autel',
    'BMW',
    'F30/F32/F15 FEM/BDC',
    2012,
    2019,
    'BMW FEM/BDC All Keys Lost (Autel IM608)',
    '## BMW FEM/BDC All Keys Lost - Autel IM608

### Prerequisites
- ⚡ **CRITICAL: Power Supply Unit (13.8V @ 50A+)** - Never attempt without stable voltage
- Autel IM608 Pro II with G-Box3
- XP400 Pro + APB112 Smart Key Emulator
- SOIC-8 clip or ACDP Module 2 (preferred)

### Step 1: Backup Coding Data
Connect OBD → Select BMW → Read "Coding Data" and save file

### Step 2: Remove FEM Module
FEM Location: **Passenger side kick panel (A-pillar)**
- Remove trim panel (push clips)
- Disconnect FEM connectors
- Remove 3x T20 screws

### Step 3: Read ISN from DME (Bench)
**CRITICAL STEP** - FEM requires DME ISN to unlock
- Connect G-Box3 to DME (MSD80/N20/B48)
- Read ISN via "Boot Mode" or "Factory Mode"
- Save ISN code

### Step 4: Preprocess FEM (EEPROM)
1. Locate **95128/95256 EEPROM** chip on FEM PCB
2. Clean pins with acetone (remove conformal coating)
3. Attach SOIC-8 clip → Connect to XP400 Pro
4. **Read EEPROM** → Save as `Original_EEPROM.bin` (BACKUP!)
5. Tool generates **Service_EEPROM.bin**
6. **Write** Service file back to chip

### Step 5: Flash MCU / Enter Service Mode
- Reconnect FEM to vehicle (or test platform)
- IM608 → IMMO → BMW → FEM/BDC → "Program ECU"
- Input ISN from Step 3 when prompted
- Wait for flash completion (~10 mins)

### Step 6: Restore Original EEPROM
- Reattach clip → Write `Original_EEPROM.bin` back

### Step 7: Learn New Key
- Insert blank key in APB112 coil
- IM608 → "Learn Key" → Select slot
- Hold new key to steering column coil → Press Start

### Step 8: Restore Coding
- OBD → Write saved Coding Data
- Clear DTCs

### ⚠️ Common Failures
| Issue | Cause | Fix |
|-------|-------|-----|
| "Comm Error" during flash | Voltage drop | Check PSU output |
| Key not recognized | Wrong ISN | Re-read DME ISN |
| Windows/lights dead | Missing coding | Restore backup |
| BDC bricked | Interrupted write | Use AutoHex for repair |',
    'AKL_PROCEDURE',
    'Autel'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content, title = excluded.title;

-- BMW FEM/BDC All Keys Lost - ACDP Procedure
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'bmw-fem-akl-acdp',
    'BMW',
    'F30/F32/F15 FEM/BDC',
    2012,
    2019,
    'BMW FEM/BDC All Keys Lost (Yanhua ACDP)',
    '## BMW FEM/BDC All Keys Lost - Yanhua ACDP (Solder-Free)

### Why ACDP?
- **No soldering** - Interface boards clamp to chips
- **Lower risk** of bent pins or thermal damage
- Faster workflow for high-volume shops

### Required Modules
- ACDP Module 1 (CAS4)
- ACDP Module 2 (FEM/BDC EEPROM)
- ACDP Module 3 (DME ISN Reader)

### Step 1: Read DME ISN
1. Remove DME or locate test connector
2. Attach **Module 3** to DME pins (N20/B48/B58 diagrams in app)
3. App → BMW → ISN → "Read ISN"
4. Save ISN code

### Step 2: Preprocess FEM
1. Remove FEM from vehicle
2. Open case (T8 screws typically)
3. Attach **Module 2** clamp over 95128 EEPROM chip
4. App → BMW → FEM/BDC → "Read EEPROM"
5. App auto-generates Service File
6. "Write EEPROM" → Service data written

### Step 3: Unlock FEM
1. Reinstall FEM (or use test platform)
2. App → BMW → FEM → "Unlock"
3. Enter ISN from Step 1
4. Wait for unlock (~5 mins)

### Step 4: Generate Key
1. Place blank key in ACDP coil
2. Select "Generate Dealer Key"
3. Key is programmed with FEM data

### Step 5: Learn to Vehicle
1. Hold key to steering column coil
2. Press Engine Start button
3. Key syncs automatically

### Step 6: Restore & Test
- Reconnect clip → "Write Original EEPROM"
- Reconnect FEM → Clear DTCs
- Test start, windows, lights

### ACDP Advantage: No Hex Editing
Unlike manual tools, ACDP handles checksum corrections automatically.',
    'AKL_PROCEDURE',
    'ACDP'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content, title = excluded.title;

-- BMW CAS3+ Flash Downgrade Warning
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'bmw-cas3-flash-warning',
    'BMW',
    'E90/E60 CAS3+',
    2008,
    2012,
    'BMW CAS3+ Flash Downgrade Risks',
    '## ⚠️ CAS3+ Flash Downgrade - Critical Warnings

### What is Flash Downgrading?
CAS3+ (ISTAP) firmware is encrypted. To add a key via OBD, the tool must:
1. **Erase** current secure firmware
2. **Write** an older, vulnerable version
3. Program the key
4. (Sometimes) Restore original firmware

### 🔴 THE RISK
If power is interrupted during the ~15 minute flash process:
- CAS bootloader corrupts
- **NO dash lights, NO ignition, NO communication**
- Vehicle is **BRICKED**

### Mandatory Precautions
1. **PSU Required**: 13.6V minimum, ripple-free, 50A+ capacity
2. **No battery chargers** - they cannot maintain stable voltage
3. **No interruptions** - do not open doors, touch switches, disconnect cables
4. **Backup** CAS EEPROM BEFORE starting

### If Bricked:
1. Try tool''s "CAS Repair" function
2. If fails: Bench read EEPROM with VVDI Prog or HexTag
3. Hex edit bootloader section
4. Write repaired file back

### When to Avoid OBD:
- Battery condition unknown
- CAS has been previously tampered
- No bench backup equipment available

**Recommendation**: ACDP or bench method is safer for CAS3+ AKL.',
    'WARNING',
    'All'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content, title = excluded.title;

-- BMW Architecture Identification Guide
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'bmw-architecture-id',
    'BMW',
    'All Models',
    2006,
    2025,
    'BMW Immobilizer Architecture Identification',
    '## BMW Architecture Identification Matrix

### VIN Decoding (Positions 4-7)
The chassis code in the VIN determines the immobilizer type:

| Chassis | Models | Years | Architecture | Module Location |
|---------|--------|-------|--------------|-----------------|
| F10/F11 | 5 Series | 2010-2016 | **CAS4** | Under dash (driver) |
| F25 | X3 | 2011-2017 | **CAS4** | Under dash (driver) |
| F30/F31 | 3 Series | 2012-2019 | **FEM** | Kick panel (passenger) |
| F32/F33 | 4 Series | 2013-2020 | **FEM** | Kick panel (passenger) |
| F15 | X5 | 2014-2018 | **BDC** | Kick panel (passenger) |
| G20 | 3 Series | 2019+ | **BDC3** | Kick panel (passenger) |
| G30 | 5 Series | 2017+ | **BDC2/3** | Kick panel (passenger) |
| G01 | X3 | 2018+ | **BDC3** | Kick panel (passenger) |

### ⚠️ X3 vs X5 Trap
- **2015 X3 (F25)** = CAS4 (like F10, older architecture)
- **2015 X5 (F15)** = BDC (like G-Series, newer architecture)
- These look similar but require completely different procedures!

### The June 2020 Cutoff
Post-June 2020 G-Series vehicles have **Bosch DME Lock**:
- Cannot read ISN via bench
- Cannot perform aftermarket AKL
- **Dealer key only** or send to FEMTO for unlock

### Secure Coding 2.0 (2021+)
- Coding requires BMW server signature
- Aftermarket tools can READ but not WRITE
- Module replacement requires ISTA + AOS online account',
    'IDENTIFICATION',
    'All'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content, title = excluded.title;

-- ==============================================================================
-- PART 5: Fix Frequency Display Bug (Remove duplicate "MHz")
-- ==============================================================================

UPDATE vehicles_master SET
    frequency = REPLACE(frequency, 'MHz MHz', 'MHz')
WHERE frequency LIKE '%MHz MHz%';

UPDATE vehicles_master SET
    frequency = REPLACE(frequency, 'mhz', 'MHz')
WHERE frequency LIKE '%mhz%';
-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA/LEXUS COMPREHENSIVE RESEARCH INTEGRATION
-- Source: Google Drive Research Documents (TSS Protocols, AKL Procedures, Hardware ID)
-- Generated: 2025-12-26
-- ═══════════════════════════════════════════════════════════════════════════

-- ==============================================================================
-- PART 1: Update Vehicle Master Data (Security, Platforms, Lishi)
-- ==============================================================================

-- TNGA-K Platform (Camry 2018+, RAV4 2019+, Highlander 2020+)
UPDATE vehicles SET
    immobilizer_system = 'TSS 2.0/3.0 (Seed Code)',
    chip = '8A-AES (Page 1 AA/BA)',
    lishi_tool = 'TOY48',
    programming_method = 'OBD + Bypass (30-Pin)',
    notes = 'TNGA architecture. 2018-2022 uses Page 1 AA. 2023+ uses Page 1 BA. TSS 3.0 requires CAN-injection or 30-pin bypass cable. Seed code required for AKL via NASTF or calculation.'
WHERE make = 'Toyota' AND model IN ('Camry', 'RAV4', 'Highlander', 'Avalon', 'Sienna', 'Venza')
    AND year_start >= 2018;

-- TNGA-C Platform (Corolla 2019+, Corolla Cross 2022+)
UPDATE vehicles SET
    immobilizer_system = 'TSS 2.0 (8A) / Hitag-AES (4A)',
    chip = CASE WHEN model = 'Corolla Cross' THEN '4A (Hitag-AES)' ELSE '8A-AES' END,
    lishi_tool = 'TOY48',
    programming_method = 'OBD (8A) / Direct Connect (4A)',
    notes = 'Corolla Cross uses NXP Hitag-AES (4A) system. Others use TI 8A-AES. 2023+ models may have TGG (Toyota Security Gateway) blocking OBD write access.'
WHERE make = 'Toyota' AND model IN ('Corolla', 'Corolla Cross', 'Prius')
    AND year_start >= 2019;

-- TNGA-F Platform (Tundra 2022+, Sequoia 2023+, Land Cruiser 300)
UPDATE vehicles SET
    immobilizer_system = 'TSS 3.0',
    chip = '8A-BA',
    lishi_tool = 'TOY48',
    programming_method = '30-Pin Bypass / CAN Injection',
    notes = 'Modern Full-Size architecture. Uses 8A-BA (TMLF19D). 30-pin bypass cable is mandatory for AKL and most key additions to bypass Security Gateway.'
WHERE make = 'Toyota' AND model IN ('Tundra', 'Sequoia', 'Land Cruiser')
    AND year_start >= 2022;

-- Lexus TNGA Transition (NX 2022+, RX 2023+, ES 2019+)
UPDATE vehicles SET
    immobilizer_system = 'TSS 2.0/3.0',
    chip = CASE WHEN model IN ('NX', 'RX') AND year_start >= 2022 THEN '8A-BA' ELSE '8A-AES' END,
    lishi_tool = 'TOY48',
    programming_method = 'OBD/30-Pin Bypass',
    notes = 'NX (2022+) and RX (2023+) use the "BA" encryption system. Requires latest tool updates and often a 30-pin bypass cable to communicate with Certification ECU.'
WHERE make = 'Lexus' AND model IN ('ES 350', 'NX 250', 'NX 350', 'RX 350', 'UX 200')
    AND year_start >= 2019;

-- ==============================================================================
-- PART 2: FCC Reference & Hardware Mapping
-- ==============================================================================

-- Modern Smart Keys (2018-2024+)
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('HYQ14FBC', 'Toyota', 'Camry', 2018, 2024, '315 MHz', '8A-AES', 'Smart Key', 'Denso Board 0351. Page 1 AA. US Production (VIN starts with 1, 2, 4, 5).', '89904-06240'),
    ('HYQ14FBC', 'Toyota', 'RAV4', 2019, 2024, '315 MHz', '8A-AES', 'Smart Key', 'Denso Board 0351. Page 1 AA. US Production.', '89904-0R080'),
    ('HYQ14FBN', 'Toyota', 'Camry', 2018, 2024, '314.3 MHz', '8A-AES', 'Smart Key', 'Tokai Rika Board B74EA. Japan Production (J-VIN).', '89904-06240'),
    ('HYQ14FBX', 'Toyota', 'RAV4', 2019, 2024, '314.3 MHz', '8A-AES', 'Smart Key', 'Tokai Rika Board B51TH. Japan Production (J-VIN).', '89904-0R080'),
    ('HYQ14FBE', 'Toyota', 'Tundra', 2022, 2024, '315 MHz', '8A-BA', 'Smart Key', 'Denso Board 231451-0410. TNGA-F. Requires 30-pin bypass.', '89904-0C020'),
    ('HYQ14FLB', 'Lexus', 'RX 350', 2023, 2024, '315 MHz', '8A-BA', 'Smart Key', 'Denso. Page 1 BA. Highly secured. Requires latest software.', '89904-48G20'),
    ('HYQ14FBW', 'Toyota', 'Corolla Cross', 2022, 2024, '315 MHz', '4A', 'Smart Key', 'Hitag-AES system. First Toyota 4A implementation in US.', '89904-02010')
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes,
    chip_type = excluded.chip_type,
    oem_part_numbers = excluded.oem_part_numbers;

-- ==============================================================================
-- PART 3: Vehicle Guides (Technical Walkthroughs)
-- ==============================================================================

-- TSS 2.0/3.0 Bypass Procedures
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'toyota-tss-bypass-guide',
    'Toyota',
    'TNGA Platforms',
    2018,
    2024,
    'Toyota TSS 2.0 & 3.0 Bypass Methodologies',
    '# Toyota TSS 2.0 & 3.0 Bypass Guide (2018–2024)

## Overview
Modern Toyota/Lexus vehicles use a "Secured Gateway" (TGG) that blocks OBD2 write commands. To program keys, you must bypass this gateway using hardware.

### 1. Autel Methodology (IM508/608)
- **TSS 2.0 (2018-2021)**: Use **APB112** Smart Key Simulator. 
    1. Backup IMMO Data (via OBD).
    2. Generate Simulator Key on APB112.
    3. Use Simulator to "Add Key".
- **TSS 3.0 / BA Keys (2022+)**: Requires **G-Box3** and **Toyota 30-Pin Cable**.
    1. Locate Certification ECU (usually behind glovebox or cluster).
    2. Connect 30-pin bypass cable directly to the ECU harness.
    3. Perform "All Keys Lost" or "Add Key" via G-Box3. **Server calculation required.**

### 2. Advanced Diagnostics (Smart Pro)
- **Cables**: Use **ADC2021** (Toyota Bypass Cable).
- **Procedure**: 
    1. Connect ADC2021 between the vehicle harness and the Smart Pro.
    2. This bypasses the 16-minute wait and the PIN/Seed code requirement for most 8A models.
    3. For newer BA systems, ensure the **ADC2015** emulator is used for signature verification.

### ⚠️ Warning: The 12nd Digit Rule
When ordering rolling codes or seed calculations, ensure you provide the full 96-byte seed or the tool-generated 12-digit request code. Page 1 "BA" systems (2023 Corolla Cross, Tundra) will NOT accept "AA" calculations.',
    'BYPASS_PROCEDURE',
    'Autel/Smart Pro'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;

-- Hardware ID & Triage
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'toyota-hardware-triage',
    'Toyota/Lexus',
    'Smart Key Systems',
    2004,
    2024,
    'Hardware ID Triage: 16-Minute Reset vs. Seed Code',
    '# Diagnostic Triage: Reset Method Identification

### 1. The Legacy Era (2004–2016)
- **Identification**: FCC IDs HYQ14AAB, HYQ14AEM, HYQ14ACX.
- **Method**: **16-Minute Reset**.
- **Procedure**: 
    1. Erase/Reset Immobilizer.
    2. Wait 16 minutes with ignition ON.
    3. ECU enters learn mode automatically. No NASTF required.

### 2. The TNGA Era (2018–2024)
- **Identification**: FCC IDs HYQ14FBC, HYQ14FBE, HYQ14FBN.
- **Method**: **Seed Code / Rolling Code**.
- **Procedure**: 
    1. Tool requests Reset.
    2. Vehicle provides a 12-digit or 96-byte Seed.
    3. Technician enters Pass-Code (via NASTF or server calc).
    4. Immediate reset, no 16-minute wait.

### 3. Denso vs. Tokai Rika Warning
| Feature | Denso | Tokai Rika |
|---------|-------|------------|
| VIN | US-Built (1, 2, 4, 5) | Japan-Built (J-VIN) |
| Frequency | 315 MHz | 314.3 MHz |
| Incompatibility | Will NOT program | Will NOT program |

**Pro Tip**: Always check the "Board ID" inside the shell. Denso uses numeric IDs (e.g. 0351); Tokai Rika uses alphanumeric (e.g. B74EA).',
    'DIAGNOSTICS',
    'General'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;
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
-- Stellantis/CDJR Research Integration Migration
-- Sources: Stellantis_FCC_ID_VIN_Pre-coding_Research.txt, Stellantis_Key_FCC_ID_VIN_Mapping.txt, 
--          Jeep_Renegade_Hornet_Key_Programming_Issue.txt, Chrysler_Locksmith_Guide_Creation.txt
-- Generated: 2025-12-26

-- ==============================================================================
-- PART 1: vehicles_master ENRICHMENT (Security & Platform)
-- ==============================================================================

-- Dodge Hornet (2023-2025)
INSERT OR IGNORE INTO vehicles_master (make, model, make_normalized, model_normalized) 
VALUES ('Dodge', 'Hornet', 'dodge', 'hornet');

UPDATE vehicles_master SET
    chip_type = 'HITAG-AES (Type 4A)',
    platform = 'Alfa Romeo Tonale (Giorgio-derived)',
    security_notes = 'Italian-built (VIN starts with Z). Uses Giobert (2ADPXFI7PE) or Alfa (KR5ALFA434) hardware. Pre-coding REQUIRED. Locked RF Hub protocol means virgin keys must be pre-coded with CS bytes before adding.',
    lishi_tool = 'SIP22',
    bypass_method = 'AutoAuth / 12+8 Cable / Star Connector',
    sgw_required = 1
WHERE make = 'Dodge' AND model = 'Hornet';

-- Jeep Renegade (2022-2024 Evolution)
UPDATE vehicles_master SET
    chip_type = 'HITAG-AES (Type 6A)',
    platform = 'Small Wide 4x4',
    security_notes = 'Critical supplier split in 2022: Melfi plant (Italy) moved to Giobert (2ADPXFI7PE). NAFTA models may still use M3N. Italian-built (VIN starts with Z) requires pre-coding. Locked RF Hub status common.',
    lishi_tool = 'SIP22',
    bypass_method = '12+8 Cable / Star Connector / AutoAuth',
    sgw_required = 1
WHERE make = 'Jeep' AND model = 'Renegade' AND id IN (
    -- Target only variants that would be in the 2022+ range if normalized
    SELECT vehicle_id FROM vehicle_variants WHERE year_start >= 2022
);

-- Jeep Compass (2023-2024 Mexican Production)
UPDATE vehicles_master SET
    security_notes = 'NAFTA-built (VIN starts with 3) typically stay on M3N-40821302. SGW present but pre-coding usually NOT required compared to Hornet/Renegade. Verify VIN origin (Z=Italy, 3=Mexico).',
    lishi_tool = 'SIP22',
    bypass_method = '12+8 Cable / AutoAuth',
    sgw_required = 1
WHERE make = 'Jeep' AND model = 'Compass';

-- RAM ProMaster (2022-2024)
UPDATE vehicles_master SET
    security_notes = 'Fiat-based architecture. 2022+ models feature SGW and likely move to HITAG-AES. SIP22 lock is notoriously stiff; use caution with Lishi tools.',
    lishi_tool = 'SIP22',
    bypass_method = '12+8 Cable / AutoAuth',
    sgw_required = 1
WHERE make = 'RAM' AND model = 'ProMaster';

-- ==============================================================================
-- PART 2: fcc_reference INSERTS
-- ==============================================================================

INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('2ADPXFI7PE', 'Jeep', 'Renegade', 2022, 2024, '434 MHz', 'HITAG-AES (6A)', 'Smart Key', 'Giobert S.p.A. hardware. Italian-built. Requires pre-coding.', '7TB23DX9AA'),
    ('2ADPXFI7PE', 'Dodge', 'Hornet', 2023, 2025, '434 MHz', 'HITAG-AES (4A)', 'Smart Key', 'Giobert S.p.A. hardware. Integrated Key Fob Transmitter.', '7QV80LXHPA, 7QV81LXHPA'),
    ('KR5ALFA434', 'Dodge', 'Hornet', 2023, 2025, '434 MHz', 'HITAG-AES (4A)', 'Smart Key', 'Continental Europe hardware. Shared with Alfa Romeo Tonale.', '6EP44LXHAA'),
    ('M3N-40821302', 'Jeep', 'Compass', 2017, 2024, '433 MHz', 'ID46 / ID4A', 'Smart Key', 'NAFTA-built (Toluca, Mexico). Standard Smart Proximity key.', '68250343AB, 68417823AA')
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes,
    oem_part_numbers = excluded.oem_part_numbers;

-- ==============================================================================
-- PART 3: vehicle_guides INSERTS (Tool Walkthroughs)
-- ==============================================================================

-- 3.1 DODGE HORNET (2023-2025) GUIDE
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-hornet-2023-2025',
  'Dodge',
  'Hornet',
  2023,
  2025,
  '# Dodge Hornet 2023-2025 Key Programming Guide
## High-Security Italian Platform (Alfa Romeo Tonale Architecture)

---

## Overview

The Dodge Hornet is a rebadged **Alfa Romeo Tonale**, built in Pomigliano d''Arco, Italy (VIN starts with **ZAC**). It uses an entirely different security architecture from legacy Dodge models.

> ⚠️ **Critical:** Do NOT attempt to use standard Dodge keys (M3N). The Hornet requires pre-coded HITAG-AES keys (FCC 2ADPX or KR5ALFA).

---

## Security Architecture

| Feature | Specification |
|---------|---------------|
| **Immobilizer** | Radio Frequency Hub (RFH) - Locked |
| **Encryption** | HITAG-AES (128-bit) |
| **SGW** | Security Gateway active |
| **Supplier** | Giobert S.p.A / Continental Europe |

---

## Required Equipment

- **Autel IM608 Pro / Pro II** (with AutoAuth support)
- **12+8 SGW Bypass Cable** (if AutoAuth unavailable)
- **XP400 Pro** (for pre-coding blank chips)
- **Programming Key:** 7QV80LXHPA or 7QV81LXHPA

---

## The "Pre-Coding" Workflow (AKL)

Because the RF Hub is "Locked" at the factory, it cannot generate new Secret Keys for blank transponders.

1. **Read Immo Data:** Read CS (Component Security) bytes and MAC from the BCM/RFH.
2. **Pre-Code Key:** Use XP400 Pro to write this data to a virgin 2ADPX-compatible key. This turns the blank into a "Dealer Key" for this specific VIN.
3. **Connect to Vehicle:** Use WiTech 2.0 or Autel with SGW bypass.
4. **Enable Fobik:** Select the **"Enable Fobik"** routine (usually replacing the "Program Keys" option).
5. **Handshake:** Hold pre-coded key to Start Button and press Unlock when prompted.

---

## VIN Identification Tips

| VIN 1st Digit | Architecture | Programming |
|---------------|--------------|-------------|
| **Z** (Italy) | Italian/Giobert | Pre-coding REQUIRED |
| **1/2/3** (NAFTA) | Legacy/Continental | Standard OBD (if variant exists) |

---

## Common Issues

- **"Security Access Denied":** SGW is blocking communication or RF Hub is in alarm state (wait 1 hour).
- **"Key Not Supported":** Attempting to use a standard Dodge M3N key.
- **"Enable Fobik" only option:** Normal behavior for locked hubs; proceed with pre-coded key.

---
*Last Updated: December 2025*',
  '{"sources": ["Stellantis_FCC_ID_VIN_Research", "Jeep_Renegade_Hornet_Issue"], "generated": "2025-12-26"}'
);

-- 3.2 JEEP RENEGADE (2022-2024) - UPDATED SUPPLIER SPLIT
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-renegade-2022-2024-split',
  'Jeep',
  'Renegade',
  2022,
  2024,
  '# Jeep Renegade 2022-2024 Supplier Transition Guide
## Continental vs. Giobert Architectures

---

## The 2022 Supplier Split

Starting in mid-2022, Jeep Renegade models (Melfi, Italy assembly) transitioned from Continental to **Giobert** hardware.

| System | FCC ID | OEM Part # Starts With | Programming |
|--------|--------|------------------------|-------------|
| **Continental** | M3N-40821302 | **6...** (e.g., 6BY88) | Standard OBD |
| **Giobert** | 2ADPXFI7PE | **7...** (e.g., 7TB23) | Pre-coding REQUIRED |

---

## Identification Strategy (VIN)

Check the **11th character** of the VIN (Plant Code):
- **P** or **L** (Melfi, Italy): Likely Giobert for 2022+ models.
- **Prefix Rule:** If the OEM Part Number starts with **7**, it is the new Giobert system.

---

## RF Hub "Locked" Protocol (CSN Z23)

Vehicles with the Z23 update or newer revisions (...AM or later) feature a hardware-level lockdown.
- Rejects new keys without authenticated pre-coding.
- Requires **"Enable Fobik"** workflow in WiTech 2.0/Autel.
- If all keys lost and hub is bricked, RF Hub replacement may be necessary.

---

## Key Specs (2022+)

- **Keyway:** SIP22 (Laser-cut)
- **Lishi:** SIP22 2-in-1 (USE CAUTION - locks are stiff)
- **Chip:** HITAG-AES (Type 6A)
- **Frequency:** 434 MHz

---
*Last Updated: December 2025*',
  '{"sources": ["Stellantis_Key_FCC_Mapping"], "generated": "2025-12-26"}'
);
-- Migration: Integrate Asian Makes from Google Docs Research
-- Target Tables: vehicles_master, fcc_reference, vehicle_guides

BEGIN TRANSACTION;

-- =============================================
-- 1. HONDA / ACURA
-- =============================================

-- Update vehicles_master for 11th Gen Honda/Acura
UPDATE vehicles_master 
SET 
    chip_type = 'Hitag AES (4A)',
    security_notes = 'Rolling Code Blockade: Extreme risk of BCM/BSI bricking if incorrect protocol selected. Manual selection "Civic FE" or "Accord CY" mandatory.',
    bypass_method = 'None (OBD Handshake)',
    sgw_required = 0
WHERE (make = 'Honda' AND model IN ('Civic', 'Accord') AND year_start >= 2022)
   OR (make = 'Acura' AND model = 'Integra' AND year_start >= 2023);

-- Insert FCC References for Honda
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('KR5TP-4', 'Honda', 'Civic', 2022, 2025, '433.92MHz', 'NCF29A1M (4A)', '11th Gen Sedan/Hatchback'),
('KR5TP-4', 'Honda', 'Accord', 2023, 2025, '433.0MHz', 'NCF29A1M (4A)', '11th Gen'),
('KR5TP-2', 'Acura', 'Integra', 2023, 2025, '434.0MHz', 'Hitag AES (4A)', 'Uses KR5TP-2 specifically');

-- Honda Guide
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, tool, guide_type, content) VALUES
('Honda', 'Civic', 2022, 2025, 'Autel', 'AKL', '## Honda 11th Gen BSI Recovery
1. **Selection Alert**: DO NOT select "Yes" when asked if vehicle is 2020+. Manually select "Civic (FE)".
2. **Procedure**: Immo Scan -> Manual Selection -> Civic -> Smart Key -> Push to Start.
3. **Recovery**: If BCM is "bricked" (No Start), use Xhorse Universal Smart Key (Honda 2022+ profile) to force sync. Capacitive discharge recommended before recovery.'),
('Honda', 'Accord', 2023, 2025, 'Autel', 'AKL', '## Honda Accord 11th Gen Security
1. **BSI Access**: Connect via OBD. Requires internet for online challenge-response calculation.
2. **Warning**: Selecting generic CAN-FD protocol will induce Defensive Lockdown (Brick). Use Manual Selection CY chassis.'),
('Acura', 'Integra', 2023, 2025, 'Autel', 'AKL', 'Follow 11th Gen Civic FE protocol. Requires KR5TP-2 FCC ID key.');

-- =============================================
-- 2. NISSAN / INFINITI
-- =============================================

-- Update vehicles_master for New Gateway Systems
UPDATE vehicles_master 
SET 
    chip_type = 'Hitachi AES (4A)',
    security_notes = 'Security Gateway (SGW) present. 22-digit or 28-digit Rolling PIN. 433MHz standardize.',
    bypass_method = 'Nissan 16+32 or 40-Pin BCM',
    sgw_required = 1
WHERE make IN ('Nissan', 'Infiniti') AND year_start >= 2020;

-- Specific Bypass Requirements
UPDATE vehicles_master SET bypass_method = 'Nissan 40-Pin BCM Mandatory' WHERE make = 'Nissan' AND model IN ('Rogue', 'Pathfinder') AND year_start >= 2021;
UPDATE vehicles_master SET bypass_method = 'Nissan 40-Pin BCM Preferred' WHERE make = 'Nissan' AND model = 'Sentra' AND year_start >= 2020;
UPDATE vehicles_master SET bypass_method = '16+32 Bypass Cable' WHERE make = 'Nissan' AND model = 'Frontier' AND year_start >= 2022;

-- Insert FCC References for Nissan
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('KR5TXN1', 'Nissan', 'Rogue', 2021, 2025, '433MHz', '4A', 'Base S/SV trims'),
('KR5TXN3', 'Nissan', 'Rogue', 2021, 2025, '433MHz', '4A', 'SL/Platinum trims'),
('KR5TXN7', 'Nissan', 'Pathfinder', 2022, 2025, '433MHz', '4A', 'R53 Platform'),
('KR5TXN3', 'Nissan', 'Sentra', 2020, 2025, '433MHz', '4A', 'B18 Platform'),
('KR5TXN7', 'Nissan', 'Frontier', 2022, 2025, '433MHz', '4A', 'D41 Platform');

-- Nissan Guide
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, tool, guide_type, content) VALUES
('Nissan', 'Rogue', 2021, 2025, 'General', 'AKL', '## Nissan T33 / R53 Bypass Guide
1. **AKL Requirement**: 16+32 cable is NOT sufficient for PIN reading on Read-Protected BCMs.
2. **Hardware**: Must use Nissan-40 Pin BCM Cable to connect directly to the BCM.
3. **PIN**: Requires server calculation for 22-digit rolling PIN.
4. **Frequency**: 433MHz only. 315MHz keys will fail.'),
('Nissan', 'Sentra', 2020, 2025, 'Autel', 'AKL', '## Sentra B18 AKL
1. **Access**: SGW under driver dashboard. Use 40-pin BCM cable for reliable PIN extraction.
2. **PIN**: 28-digit encryption. Server calculation required.'),
('Nissan', 'Frontier', 2022, 2025, 'General', 'AKL', '16+32 Bypass cable generally sufficient. SGW located near OBD or fuse box.');

-- =============================================
-- 3. HYUNDAI / KIA
-- =============================================

-- Update vehicles_master for CAN FD / SGW
UPDATE vehicles_master 
SET 
    chip_type = 'Hitag3 (ID47)',
    security_notes = 'Post-June 2023 production uses CAN FD. SGW 12+8 bypass often required. Campaign 993/CS920 blocks OBD PIN reading.',
    bypass_method = '12+8 Bypass + CAN FD Adapter',
    sgw_required = 1
WHERE (make IN ('Hyundai', 'Kia') AND year_start >= 2022);

-- Insert FCC References for Hyundai/Kia
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('TQ8-FOB-4F24', 'Kia', 'Telluride', 2020, 2022, '433MHz', 'ID47', 'Standard CAN'),
('TQ8-FOB-4F27', 'Kia', 'Telluride', 2023, 2025, '433MHz', 'ID47', 'SGW/CAN FD'),
('TQ8-FOB-4F27', 'Kia', 'Sportage', 2023, 2025, '433MHz', 'ID47', 'SGW/CAN FD'),
('TQ8-FOB-4F27', 'Hyundai', 'Palisade', 2023, 2025, '433MHz', 'ID47', 'SGW/CAN FD'),
('TQ8-FOB-4F27', 'Hyundai', 'Santa Fe', 2021, 2024, '433MHz', 'ID47', 'SGW/CAN FD');

-- Hyundai/Kia Guide
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, tool, guide_type, content) VALUES
('Kia', 'Telluride', 2023, 2025, 'General', 'AKL', '## Kia/Hyundai 2024+ CAN FD Protocol
1. **Hardware**: CAN FD Adapter is MANDATORY for post-June 2023 production.
2. **Bypass**: Use 12+8 Bypass cable if AutoAuth/SGW blocks write access.
3. **PIN**: OBD PIN reading is blocked by Campaign 993/CS920 firmware. Must purchase 6-digit PIN from dealer/broker.
4. **Teaching**: Once PIN is accepted, teaching window is only 5 seconds. Hold fob to button immediately.'),
('Hyundai', 'Solterra', 2023, 2025, 'General', 'AKL', 'Uses Toyota e-TNGA platform. 315MHz frequency. FCC ID HYQ14FBX (Toyota 8A).');

-- =============================================
-- 4. MAZDA
-- =============================================

-- Update vehicles_master for SkyActiv / Gen 7
UPDATE vehicles_master 
SET 
    chip_type = 'Hitag Pro (ID49)',
    security_notes = 'SkyActiv SSU system. Gen 7 (2019+) uses SGW and 128-bit AES. OTP Keys (No Reuse).',
    bypass_method = 'SGW Online Auth (Hazard/Brake wake)',
    sgw_required = 1
WHERE make = 'Mazda' AND year_start >= 2013;

-- Insert FCC References for Mazda
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('MAZ24', 'Mazda', '3', 2004, 2013, '315MHz', '4D-63', 'Ford PATS Era'),
('MAZ24', 'Mazda', '6', 2004, 2013, '315MHz', '4D-63', 'Ford PATS Era'),
('MZ31', 'Mazda', '3', 2014, 2018, '315MHz', 'ID49', 'SkyActiv Gen 1'),
('MZ31', 'Mazda', '3', 2019, 2025, '433MHz', 'ID49/AES', 'Gen 7 Secure Gateway');

-- Mazda Guide
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, tool, guide_type, content) VALUES
('Mazda', 'General', 2014, 2019, 'Autel', 'AKL', '## Mazda SkyActiv AKL
1. **Alarm**: Locked vehicles in AKL state will trigger alarm. Silence horn and wait for timer or use Forced Ignition.
2. **Procedure**: Immo Scan -> SSU -> All Keys Lost. Hold fob to Start Button (Inductive Backup).
3. **Note**: Keys are OTP (One-Time Programmable). Used keys cannot be reused.'),
('Mazda', 'General', 2019, 2025, 'General', 'AKL', '## Mazda Gen 7 Security
1. **SGW Access**: Requires online auth token. Stable internet and battery maintainer (13.5V) mandatory.
2. **Wake-up**: Keep Hazard lights ON to prevent BCM Deep Sleep/Timeout during calculation.');

-- =============================================
-- 5. SUBARU
-- =============================================

-- Update vehicles_master for SGP
UPDATE vehicles_master 
SET 
    chip_type = 'DST-AES (8A/H)',
    security_notes = 'Subaru Global Platform (SGP). Secure Gateway (SGW) + DCM Telematics Interference. SLOA Brute-force Lockout.',
    bypass_method = '12+8 Bypass + DCM Fuse Pull',
    sgw_required = 1
WHERE make = 'Subaru' AND year_start >= 2019;

-- Insert FCC References for Subaru
INSERT OR REPLACE INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes) VALUES
('CWTB1G077', 'Subaru', 'Forester', 2019, 2024, '433MHz', 'H-Chip', 'Bladed RHK'),
('HYQ14AHK', 'Subaru', 'Forester', 2019, 2025, '433MHz', 'ID47/8A', 'Smart Prox'),
('HYQ14AKB', 'Subaru', 'Outback', 2020, 2025, '433MHz', 'ID47/8A', '7th Gen High Security'),
('HYQ14AKB', 'Subaru', 'Ascent', 2019, 2025, '433MHz', 'ID47/8A', 'SGP Platform');

-- Subaru Guide
INSERT OR REPLACE INTO vehicle_guides (make, model, year_start, year_end, tool, guide_type, content) VALUES
('Subaru', 'General', 2019, 2025, 'General', 'AKL', '## Subaru Global Platform (SGP) AKL
1. **Isolation**: Pull DCM/Telematics fuse and Eyesight fuse. DCM causes bus jamming; Eyesight causes write collisions.
2. **Bypass**: 12+8 Bypass mandatory. AutoAuth/Software bypass ineffective for Immobilizer.
3. **Lockout**: SLOA (Locking On Attempt) triggered by 3 failed attempts. If triggered, wait 15-30 mins with Ignition ON.
4. **H-Chip**: For bladed AKL, must use APB112/Simulator to sniff challenge and calculate master key signature.');

COMMIT;
-- European Luxury Research Integration Migration: Mercedes, Volvo, Porsche
-- Source: Mercedes_FBS4_Forensic_Identification_Research.txt, Mercedes_Locksmith_Comprehensive_Guide.txt, Volvo_Locksmith_Guide_Development_Plan.txt, Porsche_Security_&_Immobilizer_Research.txt
-- Generated: 2025-12-26

-- ==============================================================================
-- PART 1: MERCEDES-BENZ DATA INTEGRATION
-- ==============================================================================

-- FBS3/DAS3 Systems (Legacy - 2000-2014)
UPDATE vehicles_master SET
    chip_type = 'ID48 (NEC BGA)',
    platform = 'FBS3 / DAS3',
    security_notes = 'DAS3 IR system. Induction powers key, battery for remote only. W204/W212 common ESL failure (A25464). Password calculation via IR/OBD required.',
    lishi_tool = 'HU64',
    bypass_method = 'IR Calculation',
    sgw_required = 0
WHERE make = 'Mercedes-Benz' AND model IN ('C-Class', 'E-Class', 'S-Class', 'GLK-Class', 'ML-Class') 
    AND year >= 2008 AND year <= 2014;

-- FBS4/DAS4 Systems (Modern - 2015+)
UPDATE vehicles_master SET
    chip_type = 'FBS4 Proprietary (Infineon)',
    platform = 'FBS4 / DAS4',
    security_notes = 'FBS4 "Hard Wall". 128-bit AES encryption. NO AFTERMARKET KEY PROGRAMMING (AKL) currently supported (2025). Dealer key via NASTF/TRP required. Module virginization (7G/9G/ISM) possible with G-Box 3.',
    lishi_tool = 'HU64',
    bypass_method = 'Dealer Only / NASTF',
    sgw_required = 1
WHERE make = 'Mercedes-Benz' AND model IN ('C-Class', 'E-Class', 'S-Class', 'GLE-Class', 'GLC-Class') 
    AND year >= 2015;

-- Mercedes FCC Reference Data
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('IYZDC12K', 'Mercedes-Benz', 'C-Class', 2015, 2023, '315 MHz', 'FBS4', 'Smart Key', 'Confirmed FBS4 identifier. Keyless Go support. Triangular panic button.', '285904500R'),
    ('NBGDM3', 'Mercedes-Benz', 'A-Class', 2013, 2020, '434 MHz', 'FBS4', 'Smart Key', 'Definitive FBS4 indicator for W177 architectures.', 'A-177-905-22-01'),
    ('IYZDC12B', 'Mercedes-Benz', 'E-Class', 2014, 2023, '315 MHz', 'FBS4', 'Smart Key', '4-button smart key (315MHz). FBS4 indicator.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes;

-- ==============================================================================
-- PART 2: VOLVO DATA INTEGRATION
-- ==============================================================================

-- P2 Platform (2000-2014)
UPDATE vehicles_master SET
    chip_type = 'ID48 (Megamos Crypto)',
    platform = 'P2',
    security_notes = 'Keys stored in CEM (L-shaped box under dash). Re-motes stored in UEM (Rearview mirror). Water ingress on CEM common. Remote programming requires VIDA/VDASH.',
    lishi_tool = 'NE66',
    bypass_method = 'CEM EEPROM Clone',
    sgw_required = 0
WHERE make = 'Volvo' AND model IN ('S60', 'S80', 'XC90', 'V70', 'XC70') 
    AND year >= 2005 AND year <= 2014;

-- P3 Platform (2007-2016)
UPDATE vehicles_master SET
    chip_type = 'ID46 (Hitag 2)',
    platform = 'P3',
    security_notes = 'CEM behind glovebox. KVM in trunk (right rear). Password brute force via OBD can take 1-12 hours. KVM read mandatory for Proximity/Keyless Go.',
    lishi_tool = 'HU101',
    bypass_method = 'CEM/KVM Bench Read',
    sgw_required = 0
WHERE make = 'Volvo' AND model IN ('S60', 'S80', 'XC60', 'V60') 
    AND year >= 2010 AND year <= 2016;

-- SPA Platform (2016+)
UPDATE vehicles_master SET
    chip_type = 'ID47/49 (HITAG 3/AES)',
    platform = 'SPA',
    security_notes = 'Scalable Product Architecture. 128-bit AES. Secure Gateway (post-2021 iCUP) blocks OBD access. Sport Key (Tag) is waterproof/sealed. Requires high-voltage PSU (13.5V+).',
    lishi_tool = 'HU101',
    bypass_method = 'VGM PIN / Secure Gateway Bypass',
    sgw_required = 1
WHERE make = 'Volvo' AND model IN ('XC90', 'S90', 'V90', 'XC60') 
    AND year >= 2016;

-- Volvo FCC Reference Data
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('YGOHUF8423MS', 'Volvo', 'XC90', 2016, 2025, '433/902 MHz', 'ID47', 'Sport Key', 'Waterproof sealed tag key. Battery non-replaceable by design.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes;

-- ==============================================================================
-- PART 3: PORSCHE DATA INTEGRATION
-- ==============================================================================

-- BCM2 Era (2010-2018)
UPDATE vehicles_master SET
    chip_type = 'ID49 (Hitag Pro)',
    platform = 'BCM2',
    security_notes = 'Security integrated in Rear BCM (BCM2). MCUs often locked (1N35H/2N35H/5M48H). Bench read with glitching (ACDP/Xhorse) required for AKL. ELV desync risk.',
    lishi_tool = 'HU66',
    bypass_method = 'BCM2 Bench Read',
    sgw_required = 0
WHERE make = 'Porsche' AND model IN ('911', 'Cayenne', 'Panamera', 'Macan') 
    AND year >= 2012 AND year <= 2018;

-- MLB Evo (2018-2025)
UPDATE vehicles_master SET
    chip_type = 'Hitag AES (NCF29A1)',
    platform = 'MLB Evo',
    security_notes = 'Connect Gateway with internet dependency. SFD logic requires token. Dealer only for AKL currently (2025). UWB keys neutralize relay attacks.',
    lishi_tool = 'HU66',
    bypass_method = 'Dealer Only / SFD Unlock',
    sgw_required = 1
WHERE make = 'Porsche' AND model IN ('911', 'Cayenne', 'Taycan', 'Panamera') 
    AND year >= 2019;

-- Porsche FCC Reference Data
INSERT INTO fcc_reference (fcc_id, make, model, year_start, year_end, frequency, chip_type, key_type, notes, oem_part_numbers)
VALUES 
    ('KR55WK50138', 'Porsche', '911', 2010, 2017, '315/433 MHz', 'ID49', 'Smart Key', 'BCM2 system. Smart selection common.', NULL),
    ('IYZ-PK3', 'Porsche', '911', 2019, 2025, '315/433 MHz', 'Hitag AES', 'MLB Evo / NCF29A1. Always online connectivity.', NULL)
ON CONFLICT(fcc_id, make, model) DO UPDATE SET
    notes = excluded.notes;

-- ==============================================================================
-- PART 4: TOOL-SPECIFIC GUIDES (WALKTHROUGHS)
-- ==============================================================================

-- Mercedes ESL Emulator Installation
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'mercedes-esl-emulator',
    'Mercedes-Benz',
    'W204 / W212 / W207',
    2008,
    2014,
    'Mercedes ESL Emulator Installation & Programming',
    '## Mercedes ESL Emulator Solution (W204/W212)

### Symptoms of ESL Failure
- Key inserts and turns, but dashboard stays black
- Steering is locked (or permanently unlocked)
- Scan shows fault code **A25464** in EIS

### Tools Required
- Autel IM608 Pro or VVDI MB
- Mercedes ESL Emulator (MK3 or similar)
- G-Box 3 (for fast password calculation)

### Step 1: Extract Password
1. Connect tool to OBD and EIS.
2. Select **Password Calculation** → **All Keys Lost** (or Add Key if you have a working key).
3. Use G-Box 3 for fast calculation (15-45 mins).
4. Save the persistent 16-digit hexadecimal password.

### Step 2: Program Emulator
1. Connect the Emulator to the tool''s ESL interface.
2. Load EIS data and the extracted password.
3. Select **Renew ESL** (or Reset).
4. Select **Personalize** and **Activate**.
5. The emulator is now "married" to this vehicle''s EIS.

### Step 3: Mechanical Bypass
- If the original ESL is **Locked**: Remove the steering column and drill the casing to manually retract the bolt.
- If **Unlocked**: Unplug the 3-pin connector from the old unit.

### Step 4: Final Install
- Plug the 3-pin vehicle harness into the programmed emulator.
- Zip-tie the emulator securely under the dash.
- Insert key; dash should light up instantly.',
    'REPAIR_PROCEDURE',
    'Autel/VVDI'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;

-- Volvo P3 All Keys Lost (Lonsdor)
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'volvo-p3-akl-lonsdor',
    'Volvo',
    'S60 / XC60 / S80 (P3 Platform)',
    2010,
    2016,
    'Volvo P3 All Keys Lost (Lonsdor K518)',
    '## Volvo P3 Platform All Keys Lost - Lonsdor K518

### Required Hardware
- Lonsdor K518 Pro
- RN-01 (CEM Adapter)
- FS-01 (KVM Adapter)

### Step 1: CEM Read (Benchmark)
1. Remove CEM (under dash/behind glovebox).
2. Attach **RN-01 Adapter** to the Renesas MCU pins (no soldering required with board).
3. Select **Volvo** → **P3** → **CEM** → **Read Security Data**.
4. Save the `.bin` file.

### Step 2: KVM Read (Crucial for Keyless Go)
1. **CRITICAL**: If the car has proximity/push-start, you MUST read the KVM.
2. KVM Location: **Right rear quarter panel (trunk)**.
3. Attach **FS-01 Adapter** to KVM pins.
4. Select **Read KVM Data** and save file.

### Step 3: PIN Calculation
- The tool uses the CEM/KVM dumps to calculate the 8-digit security PIN.

### Step 4: Key Learning
1. Reinstall CEM and KVM.
2. Connect K518 via OBD.
3. Select **All Keys Lost** → Load saved CEM/KVM files.
4. Place new key in the dash slot (or cupholder for smart).
5. Follow prompts to program transponder and remote.

### Troubleshooting
- **No Start**: If car starts only in slot, you missed the KVM read in Step 2.
- **Relay Clicking**: Low battery. Connect stable 13V+ PSU.',
    'AKL_PROCEDURE',
    'Lonsdor'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;

-- Porsche BCM2 Bench Programming (ACDP)
INSERT INTO vehicle_guides (id, make, model, year_start, year_end, title, content, category, tool)
VALUES (
    'porsche-bcm2-acdp',
    'Porsche',
    '991 / Macan / Panamera',
    2011,
    2018,
    'Porsche BCM2 Add Key/AKL (Yanhua ACDP)',
    '## Porsche BCM2 Key Programming - Solder-Free ACDP

### Advantage
Uses **Module 10** interface board to clamp onto BCM2 test points, bypassing the "Locked" MCU bit without soldering.

### Procedure
1. **Locate BCM2**: Right rear luggage area (Suvs) or under dash (sports cars).
2. **Mount Interface Board**: Screw the Module 10 board onto the BCM2 PCB. Use the alignment pins.
3. **Read D-Flash/P-Flash**: App → Porsche → BCM2 → **Read Data**.
4. **Calculated CS Bytes**: The app parses the dump for Component Security data.
5. **Generate Dealer Key**: Place blank ID49 key in ACDP coil.
6. **Learn Key**: Reinstall BCM2. Connect ACDP to OBD. Select **Learn Key** and cycle the ignition.

### ⚠️ WARNING: ELV Desync
Do not turn ignition ON during bench read. If ELV counter drifts, you will get "Steering Lock Defective" error.',
    'AKL_PROCEDURE',
    'ACDP'
)
ON CONFLICT(id) DO UPDATE SET content = excluded.content;
-- BMW Per-Vehicle Enrichment (Phase B)
-- Enriches priority models with FCC ID, OEM Part Number, Battery, and Buttons.
-- Source: BMW Locksmith Guide Development, BMW Research Integration Research.

-- ═══════════════════════════════════════════════════════════════════════════
-- 3-SERIES ENRICHMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- F30 (2012-2018)
UPDATE vehicles_master SET
    fcc_id = 'NBGIDGNG1',
    oem_part_number = '66126805993',
    battery = 'CR2450',
    buttons = 4,
    key_blank = 'HU100R'
WHERE make = 'BMW' 
  AND model IN ('3 Series', '3-Series') 
  AND year >= 2012 AND year <= 2018;

-- G20 (2019-2025)
UPDATE vehicles_master SET
    fcc_id = 'N5F-ID21A',
    oem_part_number = '66122471611',
    battery = 'CR2032',
    buttons = 4,
    key_blank = 'HU66'
WHERE make = 'BMW' 
  AND model IN ('3 Series', '3-Series') 
  AND year >= 2019;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5-SERIES ENRICHMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- F10 (2011-2016)
UPDATE vehicles_master SET
    fcc_id = 'YGOHUF5662',
    oem_part_number = '66129268486',
    battery = 'CR2450',
    buttons = 4,
    key_blank = 'HU100R'
WHERE make = 'BMW' 
  AND model IN ('5 Series', '5-Series') 
  AND year >= 2011 AND year <= 2016;

-- ═══════════════════════════════════════════════════════════════════════════
-- X3 ENRICHMENT
-- ═══════════════════════════════════════════════════════════════════════════

-- F25 (2011-2017)
UPDATE vehicles_master SET
    fcc_id = 'YGOHUF5662',
    oem_part_number = '66129268486',
    battery = 'CR2450',
    buttons = 4,
    key_blank = 'HU100R'
WHERE make = 'BMW' 
  AND model = 'X3' 
  AND year >= 2011 AND year <= 2017;

-- G01 (2018-2025)
UPDATE vehicles_master SET
    fcc_id = 'N5F-ID21A',
    oem_part_number = '66122471611',
    battery = 'CR2032',
    buttons = 4,
    key_blank = 'HU66'
WHERE make = 'BMW' 
  AND model = 'X3' 
  AND year >= 2018;
-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA/LEXUS VEHICLE CARD ENRICHMENT (PHASE B)
-- Source: Phase A Results, Tier 1/2 Guides, Amazon Affiliate Data
-- Focus: Per-row hardware specs (FCC ID, Chip, Battery, Key Blank)
-- Generated: 2025-12-26
-- ═══════════════════════════════════════════════════════════════════════════

-- ==============================================================================
-- 1. TOYOTA CAMRY
-- ==============================================================================

-- 2012-2017: Smart Key (Transition Era)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBA',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'Camry' AND year >= 2012 AND year <= 2017;

-- 2018-2024: Smart Key (TNGA Era)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBC',
    chip_type = '8A-AES (Page 1 AA)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Camry' AND year >= 2018 AND year <= 2024;

-- ==============================================================================
-- 2. TOYOTA RAV4
-- ==============================================================================

-- 2013-2018: Smart Key
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBA',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'RAV4' AND year >= 2013 AND year <= 2018;

-- 2019-2024: Smart Key (TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBC',
    chip_type = '8A-AES (Page 1 AA)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'RAV4' AND year >= 2019 AND year <= 2024;

-- ==============================================================================
-- 3. TOYOTA HIGHLANDER
-- ==============================================================================

-- 2014-2019: Smart Key
UPDATE vehicles_master SET
    fcc_id = 'HYQ14AAB',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'Highlander' AND year >= 2014 AND year <= 2019;

-- 2020-2024: Smart Key (TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FLA',
    chip_type = '8A-AES (Page 1 AA)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Highlander' AND year >= 2020 AND year <= 2024;

-- ==============================================================================
-- 4. TOYOTA SIENNA
-- ==============================================================================

-- 2011-2020: Smart Key
UPDATE vehicles_master SET
    fcc_id = 'HYQ14ADR',
    chip_type = '8A-AES (H-Chip)',
    battery = 'CR2032',
    key_blank = 'TOY48'
WHERE make = 'Toyota' AND model = 'Sienna' AND year >= 2011 AND year <= 2020;

-- 2021-2024: Smart Key (TNGA-K / Hybrid Only)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBX',
    chip_type = '8A-BA',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Sienna' AND year >= 2021 AND year <= 2024;

-- ==============================================================================
-- 5. TOYOTA COROLLA CROSS
-- ==============================================================================

-- 2022-2024: Smart Key (First 4A System)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBW',
    chip_type = '4A (Hitag-AES)',
    battery = 'CR2450',
    key_blank = 'TOY51'
WHERE make = 'Toyota' AND model = 'Corolla Cross' AND year >= 2022 AND year <= 2024;

-- ==============================================================================
-- 6. LEXUS MODELS (SAMPLE ENRICHMENT)
-- ==============================================================================

-- RX 350 (2023+ TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FLB',
    chip_type = '8A-BA',
    battery = 'CR2450',
    key_blank = 'LXP90'
WHERE make = 'Lexus' AND model = 'RX 350' AND year >= 2023;

-- ES 350 (2019+ TNGA)
UPDATE vehicles_master SET
    fcc_id = 'HYQ14FBF',
    chip_type = '8A-AES',
    battery = 'CR2032',
    key_blank = 'LXP90'
WHERE make = 'Lexus' AND model = 'ES 350' AND year >= 2019;
-- Phase B: Stellantis/CDJR Per-Vehicle Card Data Enrichment
-- Source: Phase A Research + Consolidated CDJR Security Data
-- Generated: 2025-12-26

-- ==============================================================================
-- JEEP WRANGLER - IMMOBILIZER EVOLUTION
-- ==============================================================================

-- Wrangler JK (2007-2017): Legacy SKREEM System
UPDATE vehicles_master SET
    fcc_id = 'GQ4-53T',
    key_blank = 'Y157-PT',
    battery = 'CR2032',
    chip_type = 'ID46 (PCF7936)'
WHERE make = 'Jeep' AND model = 'Wrangler' AND year_start <= 2017;

-- Wrangler JL (2018+): SGW + HITAG-AES System
UPDATE vehicles_master SET
    fcc_id = 'GQ4-54T',
    key_blank = 'Y164-PT',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1,
    bypass_method = 'AutoAuth / 12+8 Cable'
WHERE make = 'Jeep' AND model = 'Wrangler' AND year_start >= 2018;

-- ==============================================================================
-- JEEP GRAND CHEROKEE - PLATFORM SHIFT
-- ==============================================================================

-- Grand Cherokee WK2 (2014-2021): RFH System
UPDATE vehicles_master SET
    fcc_id = 'M3N-40821302',
    key_blank = 'Y164-PT',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = CASE WHEN year_start >= 2018 THEN 1 ELSE 0 END
WHERE make = 'Jeep' AND model = 'Grand Cherokee' AND year_end <= 2021;

-- Grand Cherokee WL (2022+): Locked RF Hub Protocol
UPDATE vehicles_master SET
    fcc_id = 'OHT4882056',
    key_blank = 'Y164-PT',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1,
    security_notes = 'WL Platform. Locked RF Hub. Pre-coding or Enable Fobik routine required for AKL.'
WHERE make = 'Jeep' AND model = 'Grand Cherokee' AND year_start >= 2022;

-- ==============================================================================
-- THE ITALIAN PLATFORMS (HORNET, RENEGADE 22+)
-- ==============================================================================

-- Dodge Hornet (2023+): Alfa Romeo Architecture
UPDATE vehicles_master SET
    fcc_id = '2ADPXFI7PE',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1,
    platform = 'Alfa Romeo Tonale',
    security_notes = 'Giobert/Alfa Hardware. Italian-built. Requires pre-coding with CS bytes.'
WHERE make = 'Dodge' AND model = 'Hornet';

-- Jeep Renegade 2015-2021 (Legacy Continental)
UPDATE vehicles_master SET
    fcc_id = '2ADFTFI5AM433TX',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'Megamos AES',
    security_notes = 'Legacy Continental/Fiat architecture. No SGW.'
WHERE make = 'Jeep' AND model = 'Renegade' AND year_end <= 2021;

-- Jeep Renegade 2022+ (Giobert Transition)
UPDATE vehicles_master SET
    fcc_id = '2ADPXFI7PE',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 6A)',
    sgw_required = 1,
    security_notes = '2022+ Giobert transition. Italian-built. Requires pre-coding.'
WHERE make = 'Jeep' AND model = 'Renegade' AND year_start >= 2022;

-- ==============================================================================
-- JEEP COMPASS & RAM PROMASTER
-- ==============================================================================

-- Jeep Compass (2017+)
UPDATE vehicles_master SET
    fcc_id = 'M3N-40821302',
    key_blank = 'SIP22',
    battery = 'CR2032',
    chip_type = 'HITAG-AES (Type 4A)',
    sgw_required = 1
WHERE make = 'Jeep' AND model = 'Compass' AND year_start >= 2017;

-- RAM ProMaster (2022+)
UPDATE vehicles_master SET
    key_blank = 'SIP22',
    battery = 'CR2032',
    sgw_required = 1,
    security_notes = 'Fiat Ducato based. Extreme Lishi stiffness on SIP22.'
WHERE make = 'RAM' AND model = 'ProMaster' AND year_start >= 2022;

-- ==============================================================================
-- CLEANUP & STANDARDIZATION
-- ==============================================================================

-- Ensure all battery entries are standardized
UPDATE vehicles_master SET battery = 'CR2032' WHERE make IN ('Jeep', 'Dodge', 'RAM') AND battery IS NULL;

-- Fix common casing issues in key_blank
UPDATE vehicles_master SET key_blank = UPPER(key_blank) WHERE make IN ('Jeep', 'Dodge', 'RAM') AND key_blank LIKE 'y%';
-- Migration: Phase B - Asian Makes Per-Vehicle Enrichment
-- Targets: Honda, Nissan, Hyundai/Kia, Mazda, Subaru
-- Enhancements: FCC ID, Lishi Tool, Keyway, Frequency, Battery, and Technical Notes

BEGIN TRANSACTION;

-- =============================================
-- 1. HONDA / ACURA ENRICHMENT
-- =============================================

-- Civic 10th Gen (2016-2021)
-- Addressing the KR5V1X vs KR5V2X Trap
UPDATE vehicles_master 
SET 
    fcc_id = 'KR5V2X (433MHz) / KR5V1X (314MHz)*',
    lishi_tool = 'HON66',
    notes = COALESCE(notes, '') || ' [Phase B] Frequency Trap: Civic PTS traditionally uses KR5V2X (433MHz). Verification of FCC label mandatory. Uses CR2032 battery.'
WHERE make = 'Honda' AND model = 'Civic' AND year_start >= 2016 AND year_end <= 2021;

-- Civic 11th Gen (2022-2025)
UPDATE vehicles_master 
SET 
    fcc_id = 'KR5TP-4',
    lishi_tool = 'HON66',
    notes = COALESCE(notes, '') || ' [Phase B] 11th Gen AES system. NCF29A1M (4A) chip. Battery: CR2032.'
WHERE make = 'Honda' AND model = 'Civic' AND year_start >= 2022;

-- Accord 10th Gen (2018-2022)
UPDATE vehicles_master 
SET 
    fcc_id = 'CWTWB1G0090',
    lishi_tool = 'HON66',
    notes = COALESCE(notes, '') || ' [Phase B] 10th Gen PTS. Frequency: 433MHz. Battery: CR2032.'
WHERE make = 'Honda' AND model = 'Accord' AND year_start >= 2018 AND year_end <= 2022;

-- =============================================
-- 2. NISSAN / INFINITI ENRICHMENT
-- =============================================

-- Rogue 2021+ (T33)
UPDATE vehicles_master 
SET 
    fcc_id = 'KR5TXN1 (Base) / KR5TXN3 (SL/Plat)',
    lishi_tool = 'NSN14',
    notes = COALESCE(notes, '') || ' [Phase B] 2021+ T33 Platform. 433MHz. Hitachi AES (4A). Keyway: NSN14.'
WHERE make = 'Nissan' AND model = 'Rogue' AND year_start >= 2021;

-- Pathfinder 2022+ (R53)
UPDATE vehicles_master 
SET 
    fcc_id = 'KR5TXN7',
    lishi_tool = 'NSN14',
    notes = COALESCE(notes, '') || ' [Phase B] R53 Platform. 433MHz. Hitachi AES (4A). Keyway: NSN14.'
WHERE make = 'Nissan' AND model = 'Pathfinder' AND year_start >= 2022;

-- =============================================
-- 3. HYUNDAI / KIA ENRICHMENT
-- =============================================

-- Telluride Pre-2023
UPDATE vehicles_master 
SET 
    fcc_id = 'TQ8-FOB-4F24',
    lishi_tool = 'KK12',
    notes = COALESCE(notes, '') || ' [Phase B] Legacy Modern system. ID47 chip. Battery: CR2032.'
WHERE make = 'Kia' AND model = 'Telluride' AND year_start >= 2020 AND year_end <= 2022;

-- Telluride 2023+ (CAN FD)
UPDATE vehicles_master 
SET 
    fcc_id = 'TQ8-FOB-4F27',
    lishi_tool = 'HYN14',
    notes = COALESCE(notes, '') || ' [Phase B] 2023+ CAN FD Requirement. ID47 chip. Keyway: HYN14. Battery: CR2032.'
WHERE make = 'Kia' AND model = 'Telluride' AND year_start >= 2023;

-- =============================================
-- 4. SUBARU ENRICHMENT
-- =============================================

-- Outback 2020+
UPDATE vehicles_master 
SET 
    fcc_id = 'HYQ14AKB',
    lishi_tool = 'DAT17',
    notes = COALESCE(notes, '') || ' [Phase B] 7th Gen SGP High Security. NOT HYQ14AHK. Battery: CR2032. Keyway: DAT17.'
WHERE make = 'Subaru' AND model = 'Outback' AND year_start >= 2020;

-- =============================================
-- 5. MAZDA ENRICHMENT
-- =============================================

-- Standardize Mazda common fields for recent models (2019+)
UPDATE vehicles_master 
SET 
    fcc_id = 'MZ31',
    lishi_tool = 'MAZ24/MZ31',
    notes = COALESCE(notes, '') || ' [Phase B] Gen 7 Secure Gateway. 128-bit AES. 433MHz.'
WHERE make = 'Mazda' AND year_start >= 2019 AND fcc_id IS NULL;

COMMIT;
-- Euro Phase B Enrichment: Mercedes, Volvo, Porsche, VW/Audi
-- Generated: 2025-12-26

-- ==============================================================================
-- MERCEDES-BENZ ENRICHMENT
-- ==============================================================================

-- C-Class W204 (2008-2014)
UPDATE vehicles SET 
    fcc_id = 'IYZDC07K', 
    lishi_tool = 'HU64', 
    battery = 'CR2025',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'W204 platform. FBS3/DAS3 system.'
WHERE make = 'Mercedes-Benz' AND model = 'C-Class' AND year_start >= 2008 AND year_end <= 2014;

-- C-Class W205 (2015-2021)
UPDATE vehicles SET 
    fcc_id = 'IYZ-3312', 
    lishi_tool = 'HU64', 
    battery = 'rechargeable',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'W205 platform. FBS4 system. Internal rechargeable battery.'
WHERE make = 'Mercedes-Benz' AND model = 'C-Class' AND year_start >= 2015 AND year_end <= 2021;

-- E-Class W213 (2017+)
UPDATE vehicles SET 
    fcc_id = 'NBGIDGNG1', 
    lishi_tool = 'HU64', 
    programming_method = 'IR/RF',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'W213 platform. FBS4 / DAS4 system.'
WHERE make = 'Mercedes-Benz' AND model = 'E-Class' AND year_start >= 2017;

-- ==============================================================================
-- VOLVO ENRICHMENT
-- ==============================================================================

-- S60/V60/XC60 (2015-2019)
UPDATE vehicles SET 
    lishi_tool = 'NE66', 
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'CEM-based security.'
WHERE make = 'Volvo' AND model IN ('S60', 'V60', 'XC60') AND year_start >= 2015 AND year_end <= 2019;

-- XC90 (2016+)
UPDATE vehicles SET 
    platform = 'SPA', 
    lishi_tool = 'NE66',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Scalable Product Architecture (SPA) platform.'
WHERE make = 'Volvo' AND model = 'XC90' AND year_start >= 2016;

-- ==============================================================================
-- PORSCHE ENRICHMENT
-- ==============================================================================

-- Cayenne (2011-2018)
UPDATE vehicles SET 
    fcc_id = 'KR55WK50138', 
    lishi_tool = 'HU66',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'BCM2 system. Smart selection common.'
WHERE make = 'Porsche' AND model = 'Cayenne' AND year_start >= 2011 AND year_end <= 2018;

-- Macan (2014+)
UPDATE vehicles SET 
    fcc_id = 'KR55WK50138', 
    lishi_tool = 'HU66',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'Similar BCM2 architecture to Cayenne.'
WHERE make = 'Porsche' AND model = 'Macan' AND year_start >= 2014;

-- ==============================================================================
-- VW/AUDI ENRICHMENT
-- ==============================================================================

-- Jetta (2019+)
UPDATE vehicles SET 
    fcc_id = 'NBG010206T', 
    platform = 'MQB', 
    lishi_tool = 'HU162',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'MQB platform. Requires 16-byte CS.'
WHERE make = 'Volkswagen' AND model = 'Jetta' AND year_start >= 2019;

-- Passat (2020+)
UPDATE vehicles SET 
    fcc_id = 'NBGFS12P01', 
    platform = 'MQB-Evo', 
    lishi_tool = 'HU162',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'MQB-Evo platform. SFD Gateway protection.'
WHERE make = 'Volkswagen' AND model = 'Passat' AND year_start >= 2020;

-- Audi A4/A5 (2017+)
UPDATE vehicles SET 
    oem_part_number = '4M0959754', 
    lishi_tool = 'HU162',
    service_notes_pro = COALESCE(service_notes_pro || ' | ', '') || 'BCM2 / MQB platform interaction.'
WHERE make = 'Audi' AND model IN ('A4', 'A5') AND year_start >= 2017;
