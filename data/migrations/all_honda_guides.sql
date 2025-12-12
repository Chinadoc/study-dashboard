-- Honda Accord Master Guide (1998-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-accord-1998-2024',
  'Honda',
  'Accord',
  1998,
  2024,
  '# Honda Accord 1998-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Accord spans multiple generations from 1998-2024, with significant changes in immobilizer technology over the years. This guide covers all generations with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** The Honda Accord is one of the most common vehicles you''ll encounter. Master the generational differences and you''ll handle 90% of Honda key jobs confidently.

---

## Transponder Chip Types by Generation

| Year Range | Chip Type | Protocol | Notes |
|------------|-----------|----------|-------|
| 1998-2002 | ID13 (Megamos) | T5 Crypto | Legacy system, glass wedge chip |
| 2003-2012 | ID46 (PCF7936) | Philips Crypto 2 | Remote head key standard |
| 2013-2017 | ID47 (Honda G) | HITAG 3 | Transition to smart key on higher trims |
| 2018-2021 | ID47 (HITAG 3) | 128-bit AES | Smart key standard on most trims |
| 2022-2024 | ID4A (NCF29A1M) | 128-bit AES | Latest generation smart key |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2003-2007 | OUCG8D-380H-A | 4B | 35118-SDA-A11 |
| 2008-2012 | MLBHLIK-1T | 4B | 35118-TA0-A00 |

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2013-2015 | ACJ932HK1210A | 4B | 72147-T2A-A01 |
| 2016-2017 | KR5V1X | 5B | 72147-T2A-A11 |
| 2018-2021 | CWTWB1G0090 | 5B | 72147-TVA-A01 |
| 2022-2024 | KR5TP-4 | 4B | 72147-T6A-A01 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2003-2018), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2003-2018
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6 (1 shallowest, 6 deepest)

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Accord → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → Accord → [Year]
3. Select "Add Key (Guided)"
4. Place working key inside vehicle
5. Press START button twice (ignition ON, not engine)
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Remove working key, insert NEW key
9. Turn ignition ON (START button x2)
10. Confirm security light turns off
11. Test new key - start engine, lock/unlock doors

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Accord → [Year]
3. Select "All Keys Lost (Guided)"
4. Press and hold START button until ignition activates
5. For 2020+ models, confirm when prompted
6. Turn ignition OFF (without pressing brake)
7. Place new key inside vehicle
8. Turn ignition ON (START button x2 without brake)
9. Confirm keyless access + immo lights are OFF
10. Enter number of keys to program
11. Follow ignition cycle prompts (OFF → ON) for each key
12. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 1998-2012)

This procedure programs the remote buttons ONLY (not the transponder).

1. Close all doors and sit in driver''s seat
2. Insert key in ignition (do NOT start)
3. **Cycle 1:** Turn ON → Press LOCK button → Turn OFF (within 5 seconds)
4. **Cycle 2:** Turn ON → Press LOCK button → Turn OFF (within 5 seconds)
5. **Cycle 3:** Turn ON → Press LOCK button → Turn OFF (within 5 seconds)
6. **Cycle 4 (Programming Mode):** Turn ON → Press LOCK button
7. **Listen for door lock cycling ("clunk-clunk")** = Programming mode entered
8. **Within 10 seconds:** Press LOCK on each additional remote
9. Turn ignition OFF to exit and save
10. Test all remotes

> **Pearl:** Timing is critical! Complete each cycle within 5 seconds. If locks don''t cycle on step 6, start over.

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Green key light blinking | Wrong chip type | Verify ID46 vs ID47 based on year |
| Remote won''t program via OBP | Smart key system | OBP only works on bladed key models |
| "Communication Error" on IM608 | Low battery voltage | Connect battery maintainer, ensure 12.5V+ |
| Key programs but won''t start | Blade not cut correctly | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 (2003-2018) |
| **Lishi Tool** | HON66 2-in-1 |
| **1998-2002 Chip** | ID13 (T5) |
| **2003-2012 Chip** | ID46 (PCF7936) |
| **2013-2021 Chip** | ID47 (HITAG 3) |
| **2022-2024 Chip** | ID4A (NCF29A1M) |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15-20 minutes |

---

## Sources

- remotesandkeys.com - Chip and FCC ID specifications
- carandtruckremotes.com - OEM part numbers
- obd2gate.com - Autel IM608 procedures
- uhs-hardware.com - Lishi HON66 compatibility
- hondapartsonline.net - OBP programming procedure
- transpondery.com - Transponder chip database
',
  '{"sources": ["remotesandkeys.com", "carandtruckremotes.com", "obd2gate.com", "autelshop.de", "uhs-hardware.com", "hondapartsonline.net", "transpondery.com", "keyless2go.com", "key4.com"], "generated": "2024-12-10", "method": "web_research"}'
);
-- Honda CR-V Master Guide (2002-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-crv-2002-2024',
  'Honda',
  'CR-V',
  2002,
  2024,
  '# Honda CR-V 2002-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda CR-V is one of the best-selling compact SUVs in America. This guide covers all generations from 2002-2024, with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** CR-V jobs are bread and butter for locksmiths. The key evolution follows the same pattern as Accord - ID13 → ID46 → ID47. Know the cutoff years and you''re golden.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2002-2004 | Gen 2 (RD) | ID13 (Megamos) | T5 Crypto | Glass wedge chip |
| 2005-2006 | Gen 2 (RD) | ID46 (PCF7936) | Philips Crypto 2 | Transition year |
| 2007-2011 | Gen 3 (RE) | ID46 (PCF7961) | HITAG 2 | Remote head key standard |
| 2012-2016 | Gen 4 (RM) | ID46 / ID47 | Mixed | 2015-2016 transitioned to ID47 |
| 2017-2024 | Gen 5 (RW) | ID47 (Honda G) | HITAG 3 | Smart key on most trims |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2002-2004 | OUCG8D-344H-A | 3B | 35111-S9A-305 |
| 2005-2006 | OUCG8D-380H-A | 3B | 35111-SCV-315 |
| 2007-2011 | MLBHLIK-1T | 4B | 35111-SWA-305 |
| 2012-2014 | MLBHLIK-1T | 4B | 35111-T0A-305 |

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2015-2016 | MLBHLIK6-1T | 4B | 72147-T0A-A01 |
| 2017-2019 | KR5V2X | 5B | 72147-TLA-A01 |
| 2020-2024 | KR5T4X | 5B | 72147-TLA-A11 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2002-2019), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2002-2020
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6 (1 shallowest, 6 deepest)

> **Pearl:** The 2002+ CR-V door lock contains all wafer positions. You can decode from the door and have a working ignition key - unlike some older Hondas.

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → CR-V → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → CR-V → [Year]
3. Select "Add Key (Guided)"
4. Place working key inside vehicle
5. Turn ignition ON
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Insert NEW key and turn ON
9. Confirm security light turns off
10. Test new key

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → CR-V → [Year]
3. Select "All Keys Lost (Guided)"
4. For smart key: Press START button to wake system
5. Place new key inside vehicle
6. Follow on-screen ignition cycle prompts
7. System will register new keys
8. Confirm immobilizer light OFF
9. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 2002-2014)

1. Close all doors and sit in driver''s seat
2. Insert key in ignition (do NOT start)
3. **Cycle 1:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
4. **Cycle 2:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
5. **Cycle 3:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
6. **Cycle 4:** Turn ON → Press LOCK
7. **Listen for lock cycle ("clunk")** = Programming mode
8. Press LOCK on each additional remote within 10 seconds
9. Turn OFF to save and exit
10. Test all remotes

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Green key light blinking | Wrong chip type | Verify ID46 vs ID47 based on year |
| 2015-2016 won''t program | Using ID46 instead of ID47 | Check if vehicle has HITAG 3 system |
| Smart key not detected | Low fob battery or interference | Replace CR2032 battery |
| Remote programs, won''t start | Wrong blade cut | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 (2002-2019) |
| **Lishi Tool** | HON66 2-in-1 |
| **2002-2004 Chip** | ID13 (Megamos) |
| **2005-2014 Chip** | ID46 (PCF7936/7961) |
| **2015-2024 Chip** | ID47 (Honda G / HITAG 3) |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15-20 minutes |

---

## Sources

- carandtruckremotes.com - FCC IDs and part numbers
- crvownersclub.com - Chip type specifications by year
- obd2gate.com - Autel IM608 procedures
- genuinelishi.com - Lishi HON66 compatibility
- abkeys.com - Remote specifications
',
  '{"sources": ["carandtruckremotes.com", "crvownersclub.com", "obd2gate.com", "genuinelishi.com", "abkeys.com", "key4.com", "vvdi.com", "autelshop.de"], "generated": "2024-12-10", "method": "web_research"}'
);
-- Honda Fit Master Guide (2007-2020)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-fit-2007-2020',
  'Honda',
  'Fit',
  2007,
  2020,
  '# Honda Fit 2007-2020 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Fit (Jazz in other markets) is a compact hatchback that uses different key technologies across its three generations. This guide covers all model years with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** The Fit has unique chip variations - the 2007 model uses the rare ID8E "H" chip, while 2008+ switched to standard Honda chips. Always verify year before ordering blanks.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2007 | Gen 1 (GD) | ID8E (Megamos) | "H" Chip | Unique to 2007 Fit |
| 2008 | Gen 1 (GD) | ID46 (PCF7936) | Philips Crypto 2 | Transition year |
| 2009-2014 | Gen 2 (GE) | ID46 (PCF7936) | Philips Crypto 2 | Standard remote head key |
| 2015-2020 | Gen 3 (GK) | PCF7938 G | Honda G Chip | Smart key on EX trim |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2007 | OUCG8D-380H-A | 3B | 35111-SAA-305 |
| 2007 (Sport) | G8D-384H-A | 3B | 35111-SAA-315 |
| 2009-2013 | MLBHLIK-1T | 3B | 35111-TK6-305 |

### Smart Keys (Proximity) - EX Trim Only
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2015-2017 | KR5V1X | 4B | 72147-T5A-A01 |
| 2018-2020 | KR5V1X | 4B | 72147-T5A-A11 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2007-2020), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2007-2020
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Fit → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → Fit → [Year]
3. Select "Add Key (Guided)"
4. Insert/place working key in vehicle
5. Turn ignition ON (or press START twice for smart key)
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Insert/place NEW key
9. Turn ignition ON
10. Confirm security light turns off
11. Test new key

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Fit → [Year]
3. Select "All Keys Lost (Guided)"
4. Follow on-screen prompts for ignition cycling
5. Place new key in vehicle
6. Confirm immobilizer light OFF
7. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 2007-2014)

1. Close all doors and sit in driver''s seat
2. Insert key in ignition (do NOT start)
3. **Cycle 1:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
4. **Cycle 2:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
5. **Cycle 3:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
6. **Cycle 4:** Turn ON → Press LOCK
7. **Listen for lock cycle ("clunk")** = Programming mode
8. Press LOCK on each additional remote within 10 seconds
9. Turn OFF to save and exit
10. Test all remotes

---

## Special Notes for 2007 Model

The 2007 Fit uses the rare **ID8E "H" chip** (Megamos). This is different from other Honda chips:
- Verify chip type before ordering blanks
- Some aftermarket chips labeled "Honda 8E" or "Megamos 8E"
- Programming via OBD supported on Autel IM608

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| 2007 won''t program | Wrong chip type | Verify ID8E "H" chip, not standard ID46 |
| Green key light blinking | Chip mismatch | Check year - 2007 vs 2008+ use different chips |
| Smart key not detected | Low fob battery | Replace CR2032 battery |
| Blade key won''t turn | Wrong cut | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 |
| **Lishi Tool** | HON66 2-in-1 |
| **2007 Chip** | ID8E (Megamos "H") |
| **2008-2014 Chip** | ID46 (PCF7936) |
| **2015-2020 Chip** | PCF7938 G (Honda G) |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15 minutes |

---

## Sources

- fitfreak.net - Chip specifications by year (2007 ID8E)
- carandtruckremotes.com - FCC IDs and part numbers
- locksmithkeyless.com - Key specifications
- youtube.com - Autel IM608 programming demos
- transponderisland.com - Transponder database
',
  '{"sources": ["fitfreak.net", "carandtruckremotes.com", "locksmithkeyless.com", "youtube.com", "transponderisland.com", "keyless2go.com", "autelshop.de"], "generated": "2024-12-10", "method": "web_research"}'
);
-- Insert the Honda Odyssey 2011-2017 Master Guide
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references") VALUES (
    'honda-odyssey-2011-2017',
    'Honda',
    'Odyssey',
    2011,
    2017,
    '# Honda Odyssey 2011-2017 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The 2011-2017 Honda Odyssey (4th generation) uses a **proximity key fob (smart key)** system as standard across all trims (LX, EX, EX-L, Touring, Elite). This includes keyless entry and push-button start functionality, with an integrated emergency metal blade for manual door/ignition access if the fob battery fails.

The Autel IM608 is highly effective for Honda key programming and **walks you through everything** with on-screen prompts, making it one of the easiest vehicles to program.

> 💡 **Pearl:** Honda key programming with the IM608 is super easy – you can complete an add-key procedure in under 5 minutes. The hood must be closed for horn chirp confirmation during remote testing.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost scenarios |
| **New Programmable Proximity Fob** | OEM: PN 72147-TK8-A01 or compatible aftermarket |
| **CR2032 Battery** | Replace before programming |

---

## Procedure: Add Key (With Working Key)

This is the most common scenario. Requires at least **one working key**.

### Step-by-Step Walkthrough

1. **Connect the IM608** to the OBD-II port (under dashboard, driver side).

2. **Navigate to the Immobilizer Menu:**
   - Select **Diagnostics** → **Honda** → **Odyssey** → **[Year]** → **USA**
   - Choose **Immobilizer** (system will auto-detect)

3. **Enter Immobilizer Setup:**
   - Select **Add/Delete Keys**
   - Choose **Add One Key**
   - Read all on-screen prompts carefully

4. **Key Programming Sequence:**
   - **Turn ignition OFF** with old key → Remove old key
   - **Insert NEW key** → Turn ignition **ON** within 16 seconds
   - Wait for prompt → Turn ignition **OFF**
   - Turn ignition **ON** without changing key
   - Turn **OFF** again
   - Turn **ON** one last time

5. **Confirm Programming:**
   - The IM608 will display: *"Immobilizer light is turned off"*
   - Select **Yes** to confirm
   - Display: *"Key has been programmed"*

6. **Test the New Key:**
   - Start the car ✅
   - Test lock/unlock remote functions ✅
   - Note: Hood must be closed for horn chirp

7. **Exit and Clear Codes** (optional)

**Total Time:** ~5 minutes

---

## Procedure: All Keys Lost

For situations where no working keys are available.

### Steps

1. **Connect IM608** and navigate to Honda → Odyssey → Immobilizer

2. **Select "All Keys Lost"** option

3. **Read PIN/ECU Data:**
   - Device will read immobilizer PIN via OBD
   - May require XP400 Pro for key generation

4. **Generate New Key:**
   - Use XP400 to write transponder data to blank fob
   - Follow on-screen prompts for ignition cycling

5. **Register & Verify:**
   - Complete registration sequence
   - Confirm immobilizer light off
   - Test start and remote functions

**Note:** Backup ECU data before proceeding. All Keys Lost takes 10-20 minutes.

---

## Remote Fob Learning (If Needed Separately)

Some cases require separate remote learning after transponder registration:

1. Press and **hold Lock + Unlock** buttons near steering column module
2. Hold for ~10 seconds
3. Test all buttons: Lock, Unlock, Trunk, Panic

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Fob not detected** | Replace CR2032 battery; ensure fob is on start button/dash |
| **Immobilizer light stays on** | Retry programming sequence; check for fault codes |
| **Remote doesn''t work after programming** | Perform separate remote learning (see above) |
| **Vehicle beeps during programming** | Another fob detected inside – remove all fobs >5m from car |
| **IM608 shows error** | Update firmware; verify vehicle year selection |

---

## Pro Tips from the Field

- ⚡ **Speed matters:** Complete each ignition cycle within the time window (typically 15-16 seconds)
- 🔋 **Check batteries first:** Low fob battery is the #1 cause of detection failures
- 📡 **Remove all fobs:** Other key fobs inside the vehicle will interfere
- 🔧 **IM608 vs Dealer:** Programming cost ~$50 (your time) vs $200-500 at dealer
- 📋 **Function Viewer:** Use IM608''s Function Viewer to verify coverage before quoting jobs

---

## Coverage by Year

| Year | Key Type | Notes |
|------|----------|-------|
| 2011 | Smart Key (Proximity + Blade) | Early ECU may need PIN read via OBD |
| 2012 | Smart Key (Proximity + Blade) | Blade may be prompted for ignition access |
| 2013 | Smart Key (Proximity + Blade) | Video-tested; consistent procedure |
| 2014 | Smart Key (Proximity + Blade) | Add key mode typical |
| 2015 | Smart Key (Proximity + Blade) | All-keys-lost fully supported |
| 2016 | Smart Key (Proximity + Blade) | Standard push-start across all trims |
| 2017 | Smart Key (Proximity + Blade) | End-of-gen; no major ECU changes |

---

## References

- **YouTube:** Honda Odyssey 2011-2017 Autel IM608 Programming (First-hand tutorial)
- **Autel IM608 User Manual:** Honda IMMO section
- **DIY Forums:** Locksmith/automotive key programming communities
- **Video Tested:** Procedure confirmed on 2013 model with IM608

---

*Last Updated: December 2025*
',
    '{"videos": ["Honda Odyssey 2011-2017 Autel IM608 Tutorial"], "web": "YouTube, Autel Guides, Locksmith Forums"}'
);
-- Honda Pilot Master Guide (2003-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-pilot-2003-2024',
  'Honda',
  'Pilot',
  2003,
  2024,
  '# Honda Pilot 2003-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Pilot is a mid-size SUV that has evolved significantly in key technology over three generations. This guide covers all model years with their specific transponder chips, FCC IDs, and programming procedures.

> **Pearl:** The Pilot follows standard Honda chip evolution - ID13 → ID46 → ID47/HITAG 3. The 2016 model year is the key transition point to smart keys.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2003-2005 | Gen 1 (YF1) | ID13 (Megamos) | T5 Crypto | Glass wedge chip |
| 2006-2008 | Gen 1 (YF2) | ID46 (PCF7936) | Philips Crypto 2 | Transition |
| 2009-2015 | Gen 2 (YF3/YF4) | ID46 (PCF7941A) | HITAG 2 | Remote head key standard |
| 2016-2018 | Gen 3 | HITAG 3 | ID47 | Smart key transition |
| 2019-2024 | Gen 3/4 | ID47 / ID4A | HITAG 3 / AES | Latest smart key |

---

## FCC IDs by Year

### Remote Head Keys (Bladed)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2003-2005 | OUCG8D-340H-A | 3B | 35111-S9V-305 |
| 2006-2008 | OUCG8D-380H-A | 4B | 35111-S9V-325 |
| 2009-2015 | KR55WK49308 | 4B | 35111-SZA-305 |

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2016-2018 | KR5V2X | 5B | 72147-TG7-A01 |
| 2019-2021 | KR5V2X | 5B | 72147-TG7-A11 |
| 2022-2024 | KR5TP-4 | 4B | 72147-TG7-A21 |

---

## Mechanical Key Information

**Key Blade:** HON66 (2003-2019), HU101 (emergency blade on smart keys)

**Lishi Tool:** HON66 2-in-1 Pick & Decoder
- **Compatible Years:** 2003-2020
- **Lock Type:** 4-track external, 6-cut
- **Depths:** 1-6 (1 shallowest, 6 deepest)

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Pilot → [Year] → Smart Key or Blade Key

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → Pilot → [Year]
3. Select "Add Key (Guided)"
4. Place working key inside vehicle
5. For smart key: Press START twice (don''t press brake)
6. System reads existing key data
7. Turn ignition OFF when prompted
8. Insert/place NEW key in vehicle
9. Turn ignition ON
10. Confirm security light turns off
11. Test new key

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. For 2020 Pilot AKL: Tool supports via OBD connection
3. Navigate: IMMO → Honda → Pilot → [Year]
4. Select "All Keys Lost (Guided)"
5. For smart key: Press and hold START to wake system
6. Place new key inside vehicle (remove all others 5+ meters away)
7. Follow on-screen ignition cycle prompts
8. Confirm immobilizer light OFF
9. Test all programmed keys

---

## OBP Remote Programming (Bladed Keys 2003-2015)

1. Close all doors and sit in driver''s seat
2. Insert key in ignition (do NOT start)
3. **Cycle 1:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
4. **Cycle 2:** Turn ON → Press LOCK → Turn OFF (within 5 sec)  
5. **Cycle 3:** Turn ON → Press LOCK → Turn OFF (within 5 sec)
6. **Cycle 4:** Turn ON → Press LOCK
7. **Listen for lock cycle ("clunk")** = Programming mode
8. Press LOCK on each additional remote within 10 seconds
9. Turn OFF to save and exit
10. Test all remotes

> **Pearl:** When programming remotes via OBP, all previously programmed remotes are erased. Have ALL remotes ready to program in the same session.

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Green key light blinking | Wrong chip type | Verify ID46 vs HITAG 3 based on year |
| 2016+ won''t program with OBP | Smart key system | OBP only works on bladed key models |
| "All Keys Lost" fails | Need XP400 Pro | Some AKL scenarios require auxiliary programmer |
| Remote programs, won''t start | Wrong blade cut | Re-decode with Lishi HON66 |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Blade Type** | HON66 (2003-2019) |
| **Lishi Tool** | HON66 2-in-1 |
| **2003-2005 Chip** | ID13 (Megamos) |
| **2006-2015 Chip** | ID46 (PCF7941A) |
| **2016-2024 Chip** | HITAG 3 / ID47 |
| **Frequency** | 315 MHz (North America) |
| **Add Key Time** | ~5 minutes |
| **AKL Time** | ~15-20 minutes |

---

## Sources

- oemcarkeymall.com - Chip specifications by year
- carandtruckremotes.com - FCC IDs and part numbers
- vvdi.com - HITAG 3 specifications for 2016+
- youtube.com - Autel IM608 2020 Pilot AKL demo
- genuinelishi.com - Lishi HON66 compatibility
- mk3.com - Remote specifications
',
  '{"sources": ["oemcarkeymall.com", "carandtruckremotes.com", "vvdi.com", "youtube.com", "genuinelishi.com", "mk3.com", "locksmithkeyless.com", "abkeys.com"], "generated": "2024-12-10", "method": "web_research"}'
);
-- Honda HR-V Master Guide (2016-2024)
-- Generated from web research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-hrv-2016-2024',
  'Honda',
  'HR-V',
  2016,
  2024,
  '# Honda HR-V 2016-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda HR-V is a subcompact crossover SUV that exclusively uses smart key technology from its introduction. All HR-V models require professional key programming.

> **Pearl:** The HR-V uses the same KR5V1X smart key as the Honda Fit EX. Cross-check compatibility when sourcing aftermarket keys.

---

## Transponder Chip Type

| Year Range | Chip Type | Protocol | Notes |
|------------|-----------|----------|-------|
| 2016-2024 | ID47 (PCF7938) | HITAG 3 | Smart key only, no bladed key option |

---

## FCC IDs

### Smart Keys (Proximity)
| Year | FCC ID | Buttons | OEM Part Number | Battery |
|------|--------|---------|-----------------|---------|
| 2016-2020 | KR5V1X | 4B | 72147-T7S-A01 | CR2032 |
| 2021-2024 | KR5V1X | 4B | 72147-T7S-A11 | CR2032 |

**Button Configuration:** Lock, Unlock, Hatch, Panic

**Frequency:** 314 MHz (313.85 MHz)

---

## Mechanical Key Information

**Emergency Blade:** HU101 (integrated in smart key fob)

**Lishi Tool:** HU101 2-in-1 for emergency door access
- Not typically needed unless fob battery dead
- Door lock is emergency access point only

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → HR-V → [Year] → Smart Key → Push to Start

### Add Key Procedure (With Working Key)

1. Connect Autel IM608 via OBDII with J2534 VCI
2. Navigate: IMMO → Honda → HR-V → [Year]
3. Select "Add Key (Guided)"
4. One registered key MUST be present in vehicle
5. Press START button twice (don''t press brake)
6. System reads existing key data
7. Follow on-screen prompts for ignition cycling
8. Place NEW key inside vehicle
9. Move other keys 5+ meters away
10. Confirm immobilizer light turns off
11. Test new key - start, lock/unlock, hatch

### All Keys Lost Procedure

1. Connect Autel IM608 via OBDII
2. May require XP400 Pro + APB131 adapter for some scenarios
3. Navigate: IMMO → Honda → HR-V → [Year]
4. Select "All Keys Lost (Guided)"
5. Press and hold START to wake system
6. Place new key inside vehicle
7. Follow on-screen ignition cycle prompts
8. If alarm activates, remove horn fuse during procedure
9. Confirm immobilizer light OFF
10. Test all programmed keys

---

## Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Smart key not detected | Low fob battery | Replace CR2032 battery |
| "Key Not Detected" message | Key too far from START | Hold key against START button |
| AKL fails on newer model | Requires XP400 Pro | Use auxiliary programmer |
| Alarm going off during AKL | Normal behavior | Remove horn fuse temporarily |

---

## Quick Reference Card

| Item | Value |
|------|-------|
| **Key Type** | Smart Key Only |
| **Emergency Blade** | HU101 |
| **2016-2024 Chip** | ID47 (PCF7938 HITAG 3) |
| **FCC ID** | KR5V1X |
| **Frequency** | 314 MHz |
| **Battery** | CR2032 |
| **Add Key Time** | ~10 minutes |
| **AKL Time** | ~20-30 minutes |

---

## Sources

- yourcarkeyguys.com - Key specifications
- locksmithkeyless.com - FCC ID and part numbers
- vvdi.com - HITAG 3 chip specifications
- youtube.com - Autel programming demonstrations
- autelshop.de - All keys lost procedure
',
  '{"sources": ["yourcarkeyguys.com", "locksmithkeyless.com", "vvdi.com", "youtube.com", "autelshop.de", "carandtruckremotes.com", "mk3.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- Honda Ridgeline Master Guide (2006-2024)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-ridgeline-2006-2024',
  'Honda',
  'Ridgeline',
  2006,
  2024,
  '# Honda Ridgeline 2006-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Ridgeline is a unique pickup truck that uses standard Honda key technology across two generations. This guide covers both the original (2006-2014) and second generation (2017-2024) models.

> **Pearl:** The first-gen Ridgeline (2006-2014) shares key specs with many Honda SUVs of that era. The second-gen (2017+) uses the same smart key platform as Pilot.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Chip Type | Protocol | Notes |
|------------|------------|-----------|----------|-------|
| 2006-2014 | Gen 1 | ID46 (Philips "V") | Philips Crypto 2 | Remote head key |
| 2017-2024 | Gen 2 | ID47 / HITAG 3 | 128-bit AES | Smart key standard |

**Note:** No 2015-2016 model years were produced.

---

## FCC IDs by Year

### Remote Head Keys (Gen 1)
| Year | FCC ID | Buttons | OEM Part Number |
|------|--------|---------|-----------------|
| 2006-2014 | OUCG8D-380H-A | 4B | 35111-SHJ-305 |

### Smart Keys (Gen 2)
| Year | FCC ID | Buttons | OEM Part Number | Battery |
|------|--------|---------|-----------------|---------|
| 2017-2020 | KR5V2X | 4-5B | 72147-T6Z-A01 | CR2032 |
| 2021-2024 | KR5V2X (V44) | 4-5B | 72147-T6Z-A51 | CR2032 |

---

## Mechanical Key Information

**Gen 1 Key Blade:** HON66 (2006-2014)
**Gen 2 Emergency Blade:** HU101 (in smart key fob)

**Lishi Tool:** HON66 2-in-1 for Gen 1
- **Compatible Years:** 2006-2014
- **Lock Type:** 4-track external, 6-cut

---

## Autel IM608 Programming

### Menu Path
IMMO → Honda → Manual Selection → Ridgeline → [Year] → [Key Type]

### Add Key - Gen 1 (2006-2014)

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Ridgeline → [Year] → Blade Key
3. Select "Add Key (Guided)"
4. Insert working key and turn ON
5. System reads key data
6. Turn OFF, insert NEW key
7. Turn ON, confirm security light off
8. Test new key

### Add Key - Gen 2 (2017-2024)

1. Connect Autel IM608 via OBDII
2. Navigate: IMMO → Honda → Ridgeline → [Year] → Smart Key
3. Select "Add Key (Guided)"
4. One registered key must be present
5. Press START twice (no brake)
6. Follow on-screen prompts
7. Place new key in vehicle, move others away
8. Confirm lights off, test key

### All Keys Lost

1. Connect Autel IM608 via OBDII
2. IM608 supports AKL with code bypass for Ridgeline
3. Follow guided procedure
4. For Gen 2: XP400 Pro may be required
5. Test all keys after programming

---

## OBP Remote Programming (Gen 1 Only)

1. Close all doors, sit in driver''s seat
2. Insert key, do NOT start
3. **Cycle 1-3:** Turn ON → Press LOCK → Turn OFF (within 5 sec each)
4. **Cycle 4:** Turn ON → Press LOCK
5. Listen for lock cycle = Programming mode
6. Press LOCK on each remote within 10 sec
7. Turn OFF to save
8. Test all remotes

---

## Quick Reference Card

| Item | Gen 1 (2006-2014) | Gen 2 (2017-2024) |
|------|-------------------|-------------------|
| **Key Type** | Remote Head Key | Smart Key |
| **Blade** | HON66 | HU101 (emergency) |
| **Chip** | ID46 | ID47 / HITAG 3 |
| **FCC ID** | OUCG8D-380H-A | KR5V2X |
| **Frequency** | 314 MHz | 314 MHz |
| **Lishi Tool** | HON66 | N/A |

---

## Sources

- carandtruckremotes.com - FCC IDs and part numbers
- locksmithkeyless.com - Key specifications
- oemcarkeymall.com - Transponder chip info
- youtube.com - Autel programming demos
- hondainfocenter.com - Immobilizer system info
',
  '{"sources": ["carandtruckremotes.com", "locksmithkeyless.com", "oemcarkeymall.com", "youtube.com", "hondainfocenter.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);
