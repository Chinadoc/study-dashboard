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
