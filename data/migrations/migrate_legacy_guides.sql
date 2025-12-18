-- Migration: Standardize and Insert Legacy Guides
-- This script migrates guides from guides_data.js to the vehicle_guides table.

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content)
VALUES 
('ford-f150-2015-2020', 'Ford', 'F-150', 2015, 2020, 
'# Ford F-150 2015-2020 Programming Guide

---

## Required Equipment
- **Autel IM508 / IM608**
- Two New Proximity Keys (for AKL)
- One Programmed Key (for Add Key)
- Stable Wi-Fi connection

---

## Procedures

### Section 1: Add a Smart Key (Proximity)
1. **Navigate:** Ford -> Manual Selection -> F-150 -> 2015-2020 -> Smart Key.
2. **Select:** Hot Function -> Add smart key (guided). Press Start.
3. **Verify:** Confirm no factory alarm is active.
4. **Security:** Wait for security access (approx. 3-10 minutes).
5. **Learning:** Place the new smart key into the programming slot (bottom of front cup holder, remove rubber mat).
6. **Cycle:** Follow prompts. Door locks will cycle to confirm.

### Section 2: All Keys Lost (Smart Key)
1. **Prep:** Place one new key in the cup holder slot.
2. **Navigate:** Control Unit -> Keyless System -> Key Learning -> All smart keys lost.
3. **Warning:** This erases all keys. Select YES.
4. **Security:** Wait 10 minutes for security access.
5. **Key 1:** With first key in slot, press OK. Locks cycle.
6. **Key 2:** Select YES for next key. Remove first key, place second key in slot. Press OK. Locks cycle.
7. **Finish:** Select NO when finished. Two keys are required to start the vehicle.

### Section 3: Add a Bladed Key (Keyed Ignition)
1. **Ignition:** Turn ignition ON with original key.
2. **Select:** Add a key (guided). Press Start.
3. **Security:** Wait 3-10 minutes.
4. **Swap:** When prompted, remove original key and insert NEW key. Turn ignition ON.
5. **Result:** Locks will cycle. Select NO for another key.

---

> ⚠️ **Important:** For All Keys Lost, you MUST program at least two keys for the vehicle to start.'),

('honda-crv-2017-2022', 'Honda', 'CR-V', 2017, 2022,
'# Honda CR-V 2017-2022 Programming Guide

## Required Equipment
- **Autel IM series** or **Pro Key Box Kit**
- One working key
- One new smart key

---

## Procedure (Add Key)
1. **Connect:** Plug programmer into OBD-II.
2. **Prep:** Take ALL smart keys OUTSIDE the vehicle.
3. **Working Key:** Place single WORKING key inside the vehicle. Press OK.
4. **Ignition:** Press Start button TWICE to turn ignition ON (engine OFF).
5. **Swap:** Take working key OUT, bring NEW key INTO the vehicle.
6. **Learning:** Tool will communicate. Listen for two beeps.
7. **Cycle:** Follow prompts to cycle ignition OFF/ON multiple times.

---

> 💡 **Tip:** Pay close attention to the timing of moving keys in and out of the vehicle.'),

('acura-mdx-2014-2018', 'Acura', 'MDX', 2014, 2018,
'# Acura MDX 2014-2018 Programming Guide

## Required Equipment
- **XTOOL EZ400 Pro** or **Autel IM508**
- Programmed Smart Key
- New Smart Key

---

## Procedure
1. **Accessory Mode:** Double-click Start button to enter accessory mode.
2. **Clearance:** Take ALL keys 15 feet away from the vehicle.
3. **Identification:** Bring ONE existing key back inside and press OK.
4. **Swap:** Remove old key, bring NEW key inside.
5. **Sync:** Cycle ignition OFF/ON within 15 seconds as prompted.
6. **Confirm:** Security light on dash should go out.

---

> ⚠️ **Note:** All other keys must be far away for the system to recognize the single key being added.'),

('toyota-rav4-2019-2024', 'Toyota', 'RAV4', 2019, 2024,
'# Toyota RAV4 2019-2024 Programming Guide

## Required Equipment
- **Autel IM508 / IM608**
- Working Key
- New Smart Key (FCC: `HYQ14FBE` or `HYQ14FLB` depending on build)

---

## Procedure
1. **Backup:** BACKUP IMMO DATA first. This saves an EEPROM file. Turn hazards ON.
2. **Maintenance:** If system is full, select "Erase Keys" (uses backup file).
3. **Add Key:** Select "Add Smart Key". Use backed-up data to bypass PIN.
4. **Step 1:** Hold working key to the Start button (1 beep).
5. **Step 2:** Hold new key to the Start button (2 beeps).
6. **Finalize:** Follow prompts to hold the new key to the button again.

---

> 💡 **Tip:** This procedure is identical to the 2018-2024 Toyota Camry.'),

('jeep-grand-cherokee-2014-2021', 'Jeep', 'Grand Cherokee', 2014, 2021,
'# Jeep Grand Cherokee 2014-2021 Programming Guide (Tom''s Key)

## Required Equipment
- **Tom''s Key Bluetooth OBD Device**
- Smartphone with companion app
- Working Key

---

## Procedure
1. **Pairing:** Scan QR code on programmer to pair with phone.
2. **Ignition:** Turn ignition ON (engine RUNNING) with original key.
3. **Cycle:** Turn engine OFF, turn ignition back ON (Run mode, engine OFF).
4. **Security Wait:** App begins a 10-minute security communication.
5. **Learning:** Remove all keys. Place NEW key in the center console sensor area.
6. **Finalize:** Repeatedly press UNLOCK on the new fob. Locks will cycle.

---

> ⚠️ **Important:** Ensure all other smart keys are far away during the final pairing step.'),

('toyota-camry-2018-2024', 'Toyota', 'Camry', 2018, 2024,
'# Toyota Camry 2018-2024 Programming Guide

## Identification
- **Master Key Check:** Insert key. Security light should turn OFF immediately. (If it stays solid for 2s, it is a valet key).

---

## Procedure

### Part 1: Chip Programming
1. **Switch:** Set programmer to **KEY** side.
2. **Connection:** With working key in ON position, plug into OBD.
3. **Wait:** When security light turns SOLID RED, remove working key.
4. **Learn:** Insert NEW key. Light will blink for 60 seconds.
5. **Finish:** Light turns OFF when finished.

### Part 2: Remote Programming
1. **Switch:** Set programmer to **REMOTE** side.
2. **Connection:** With working key in ON position, plug into OBD.
3. **Trigger:** When beep pattern changes, OPEN the driver''s door.
4. **Sync:** Hold Lock + Unlock on the NEW remote for 1.5s, then Lock for 1s.
5. **Result:** Vehicle will cycle locks to confirm.'),

('dodge-ram-2019-2024', 'Dodge', 'Ram 1500', 2019, 2024,
'# Dodge Ram 1500 2019-2024 Programming Guide

## Required Equipment
- **Autel IM508 / IM608**
- **SGM Bypass Cable** (MANDATORY)
- New Smart Key
- Wi-Fi for PIN retrieval

---

## Procedure
1. **Bypass:** Connect bypass cable behind the radio or to the passenger side star connector.
2. **Hazards:** Turn hazards ON to wake the BCM.
3. **Read PIN:** Select "Immobilizer Password" (requires internet). Note the 5-digit PIN.
4. **Learning:** Select "Key Learning". Tool will auto-populate PIN.
5. **Sync:** Hold NEW smart key firmly against the Start/Stop button for 30 seconds.
6. **Confirm:** Select NO for another key and test.

---

> ⚠️ **Important:** Some keys require matching chip values (e.g., 7953 Mary). Verify chip type if programming fails.'),

('chevy-silverado-2014-2018', 'Chevrolet', 'Silverado', 2014, 2018,
'# Chevrolet Silverado 2014-2018 Programming Guide

---

## Procedures

### Section 1: Basic Remote (On-Board)
1. **Ignition:** Turn ON with working key.
2. **Pairing:** Press and hold Lock + Unlock on new remote for 8 seconds.
3. **Confirmation:** Wait for audible beep.

### Section 2: Add/Replace Fob (Bladed)
1. **Navigate:** Immobilizer -> Add/Replace Fobs.
2. **Select Slot:** Choose an empty slot (Fob 1-4).
3. **Wait:** Dash will show "Remote Learning Pending."
4. **Learn:** Hold Lock + Unlock on new fob until beep.

### Section 3: All Keys Lost (Bladed)
1. **Read PIN:** BCM Read PIN Code (requires internet).
2. **Reset:** Select "All Keys Lost".
3. **Wait:** A 10-minute security wait is mandatory.
4. **Register:** Insert first key (ON), then second key (ON) after 10-minute wait.

---

> ⚠️ **Note:** 10-minute wait is mandatory for AKL. Requires two keys minimum for registration.'),

('nissan-altima-2013-2018', 'Nissan', 'Altima', 2013, 2018,
'# Nissan Altima 2013-2018 Programming Guide

## Remote Setup
1. **Code:** Look up activation code (e.g., 42 for 2015).
2. **Enter:** Hold Lock + Panic until blue light. Press top button for first digit, second button for second digit.
3. **Confirm:** Hold bottom button for 2s (fob will flash back code).

---

## Programming Procedure
1. **Prep:** Hazards ON, open/close driver door.
2. **Wake:** Press Start button until dash lights up. Turn OFF.
3. **Re-pair Old:** Press Start with EXISTING remote. Security light flashes 5 times.
4. **Learn New:** Press Start with NEW remote. Security light flashes 5 times.
5. **Finish:** Turn ignition ON then OFF.

---

> ⚠️ **Warning:** Programming erases all fobs. Must re-pair existing ones during the same session.'),

('bmw-e90-e60-2005-2013', 'BMW', '3/5 Series (E90/E60)', 2005, 2013,
'# BMW 3/5 Series (E90/E60) 2005-2013 Programming Guide

## Required Equipment
- **Autel IM Series + XP400**
- Programmed Factory Key
- Internet Connection

---

## Procedure
1. **Identify:** Navigate to Smart Selection. System: **CAS3+**.
2. **Read RAM:** Follow prompts to remove key during RAM read.
3. **Backup:** Save the backed-up key data file.
4. **Slot:** Choose an empty key slot (e.g., Slot 9).
5. **Master Read:** Place WORKING key into XP400 slot.
6. **Write:** Place NEW key into XP400 slot. Tool writes data.
7. **Finalize:** Insert into ignition and start car.'),

('bmw-f10-2012-2017', 'BMW', '5 Series (F10)', 2012, 2017,
'# BMW 5 Series (F10) 2012-2017 Programming Guide

## Preparation
- **DTC Clear:** Perform a status scan and clear all faults. Mandatory first step.
- **Power:** Ensure stable voltage (battery maintainer recommended).

---

## Procedure
1. **Pre-processing:** Select "Key Add (Guided)". Tool reads and saves ECU data.
2. **Generation:** Tool writes data to the new key in the XP400/programmer.
3. **Coil Placement:** Hold new key to the induction coil on the steering column.
4. **Timer:** Press and hold Start button for 10 seconds.
5. **Success:** Tool confirms when learned. Test from a distance.'),

('hyundai-sonata-2015-2019', 'Hyundai', 'Sonata', 2015, 2019,
'# Hyundai Sonata 2015-2019 Programming Guide

## PIN Retrieval
- **Internet Required:** Navigate to Control Unit -> Read PIN (Select **8A**).
- Tool displays 6-digit PIN.

---

## Procedure
1. **Prep:** Hazards ON, door closed.
2. **Reset:** Confirm process will delete existing keys.
3. **Wake:** Open/Close door once.
4. **Sync:** Within 5 seconds of prompt, press NEW smart key against Start/Stop button.
5. **Verify:** Test all remote functions.'),

('acura-tlx-2015-2018', 'Acura', 'TLX', 2015, 2018,
'# Acura TLX 2015-2018 Programming Guide

## Procedure
1. **Hazards:** Turn hazards ON, ignition ON.
2. **Isolation:** Remove ALL keys from vehicle.
3. **Original:** Bring original key back in. Press OK.
4. **New:** Remove original, bring NEW key in. Press OK.
5. **Registration:** Cycle ignition OFF/ON multiple times until security light goes out.'),

('honda-civic-2016-2021', 'Honda', 'Civic', 2016, 2021,
'# Honda Civic 2016-2021 Programming Guide

---

## Procedures

### Section 1: Add a Smart Key
1. **Ignition:** Turn ON with working key inside.
2. **Swap:** Remove working key, bring NEW key inside.
3. **Sync:** Hold back of new key up to the Start button.
4. **Finalize:** Follow prompts to cycle ignition OFF/ON twice.

### Section 2: All Keys Lost (AKL)
1. **Hazards:** Turn hazards ON.
2. **Wake:** Press and hold Start button until dashboard turns on (Accessory Mode).
3. **Note:** Do not put foot on the brake during this process.
4. **Results:** Tool will verify model and display "Key program success."'),

('bmw-1series-2008-2014', 'BMW', '1 Series', 2008, 2014,
'# BMW 1 Series 2008-2014 Programming Guide

## Procedure
1. **Scan:** Navigate: Key Program -> CAS3 -> Keyless -> Learn Key.
2. **Wake:** Press Start button ONCE.
3. **Select:** Choose an empty slot (Status: Free).
4. **Read:** Tool reads vehicle data.
5. **Write:** Place NEW key into the programmer slot.
6. **Finalize:** Insert new key into dashboard slot and start engine.
7. **Sync Remote:** Start engine for 5s, shut off, remove key, close door. Test.');
