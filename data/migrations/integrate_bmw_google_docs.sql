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
UPDATE vehicles SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'CAS4',
    security_notes = 'CAS4 located under dash (driver side). Bench read required for AKL. ISN extraction via D-Flash read. Use 5M48H/1N35H MCU adapters.',
    lishi_tool = 'HU92',
    bypass_method = NULL,
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('5 Series', '5-Series', '7 Series', '7-Series') 
    AND year >= 2010 AND year <= 2016;

UPDATE vehicles SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'CAS4',
    security_notes = 'CAS4 (F25 platform). Older L6 architecture despite SUV body. Bench read for AKL.',
    lishi_tool = 'HU92',
    bypass_method = NULL,
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('X3') 
    AND year >= 2011 AND year <= 2017;

-- FEM Systems (F30, F32, F20, F22)
UPDATE vehicles SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'FEM',
    security_notes = 'FEM in kick panel (passenger side). PREPROCESSING REQUIRED: Read 95128 EEPROM, generate Service File, flash MCU. ISN sync with DME mandatory for AKL.',
    lishi_tool = 'HU100R',
    bypass_method = 'EEPROM Preprocessing',
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('3 Series', '3-Series', '4 Series', '4-Series', '1 Series', '1-Series', '2 Series', '2-Series') 
    AND year >= 2012 AND year <= 2019;

-- BDC Systems (F15, G-Series)
UPDATE vehicles SET
    chip_type = 'ID49 (PCF7953)',
    platform = 'BDC',
    security_notes = 'BDC in kick panel (passenger side). Early BDC iteration. Bench preprocessing required.',
    lishi_tool = 'HU100R',
    bypass_method = 'EEPROM Preprocessing',
    sgw_required = 0
WHERE make = 'BMW' AND model IN ('X5', 'X6') 
    AND year >= 2014 AND year <= 2018;

-- BDC2/BDC3 G-Series (2019+)
UPDATE vehicles SET
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

UPDATE vehicles SET
    frequency = REPLACE(frequency, 'MHz MHz', 'MHz')
WHERE frequency LIKE '%MHz MHz%';

UPDATE vehicles SET
    frequency = REPLACE(frequency, 'mhz', 'MHz')
WHERE frequency LIKE '%mhz%';
