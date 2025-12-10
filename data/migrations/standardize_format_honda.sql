-- Standardize Guide Format to Match Honda Odyssey Template
-- Includes: Pearl callouts, Equipment tables, Step-by-step procedures, Troubleshooting, Pro Tips

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA ACCORD (1998-2024) - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Accord 1998-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Accord has evolved through multiple generations with different key systems. From 2013+, all Accords use a **proximity key fob (smart key)** system with push-button start. Earlier models (1998-2012) use traditional transponder keys.

The Autel IM608 provides excellent coverage for all Accord years and **walks you through everything** with on-screen prompts.

> 💡 **Pearl:** For 2018+ Accords, verify the FCC ID before ordering keys. 2018+ uses CWTWB1G0090 (433 MHz, 5-button with remote start) which is completely different from earlier models.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost scenarios |
| **New Programmable Proximity Fob** | See FCC ID by year below |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year (Critical!)

| Years | FCC ID | Frequency | Buttons |
|-------|--------|-----------|---------|
| 2013-2015 | ACJ932HK1210A | 314 MHz | 4 |
| 2014-2015 Hybrid | ACJ932HK1210A | 314 MHz | 4 |
| 2016-2017 | ACJ932HK1310A | 433 MHz | 4 |
| 2018-2024 | CWTWB1G0090 | 433 MHz | 5 (with remote start) |

---

## Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 1998-2002 | ID13 | Fixed Code | Glass wedge chip |
| 2003-2012 | ID46 | PCF7936AS | Philips Crypto 2 |
| 2013-2017 | ID47 | HITAG 3 | G-chip, 128-bit AES |
| 2018-2024 | ID47 | HITAG 3 | Updated immobilizer |

---

## Procedure: Add Key (With Working Key)

### Step-by-Step Walkthrough

1. **Connect the IM608** to the OBD-II port (under dashboard, driver side).

2. **Navigate to the Immobilizer Menu:**
   - Select **Diagnostics** → **Honda** → **Accord** → **[Year]** → **USA**
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
   - Turn **OFF** again → Turn **ON** one last time

5. **Confirm Programming:**
   - IM608 displays: *"Immobilizer light is turned off"*
   - Select **Yes** to confirm
   - Display: *"Key has been programmed"*

6. **Test the New Key:**
   - Start the car ✅
   - Test lock/unlock remote functions ✅

**Total Time:** ~5 minutes

---

## Procedure: All Keys Lost

1. **Connect IM608** and navigate to Honda → Accord → Immobilizer
2. **Select "All Keys Lost"** option
3. **Read PIN/ECU Data** via OBD (may require XP400 Pro)
4. **Generate New Key** using XP400
5. **Register & Verify** - Complete registration, confirm immobilizer light off

**Note:** All Keys Lost takes 15-25 minutes.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Fob not detected** | Replace CR2032 battery; ensure fob is near start button |
| **Immobilizer light stays on** | Retry sequence; check for fault codes |
| **Remote doesn''t work** | Perform separate remote learning |
| **Wrong FCC ID ordered** | Verify year and check frequency compatibility |

---

## Pro Tips from the Field

- ⚡ **2018+ is different:** CWTWB1G0090 has 5 buttons with remote start - don''t order older style
- 🔋 **Battery first:** Low fob battery = detection failures
- 📡 **Frequency matters:** 2013-2015 = 314 MHz, 2016+ = 433 MHz
- 🔧 **Cost savings:** Programming ~$50 (your time) vs $200-500 at dealer

---

## Key Information

- **Blade:** HON66 (older), MIT11R (newer emergency)
- **Lishi:** HON66 2-in-1, MIT11R 2-in-1
- **Battery:** CR2032

---

## References

- **Autel IM608 User Manual:** Honda IMMO section
- **locksmithkeyless.com** - FCC ID lookup
- **yourcarkeyguys.com** - Part number verification

---

*Last Updated: December 2025*
'
WHERE id = 'honda-accord-1998-2024';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CIVIC (2016-2024) - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Civic 2016-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The 10th and 11th generation Honda Civic (2016-2024) uses a **proximity key fob (smart key)** with push-button start on EX and higher trims. Lower trims may use traditional remote head keys.

The Autel IM608 provides full coverage and **walks you through everything** with on-screen prompts.

> 💡 **Pearl:** 2016-2021 Civic all use the same FCC ID (KR5V2X). The only difference is 4-button vs 5-button (remote start). 2022+ switched to KR5TP-4 with the 11th generation.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost scenarios |
| **New Programmable Proximity Fob** | KR5V2X (2016-21) or KR5TP-4 (2022+) |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year

| Years | FCC ID | Buttons | Notes |
|-------|--------|---------|-------|
| 2016-2021 | KR5V2X | 4 | Lock, Unlock, Trunk, Panic |
| 2016-2021 | KR5V2X | 5 | With Remote Start (EX/Touring) |
| 2022-2024 | KR5TP-4 | 4-5 | 11th generation |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2016-2024 | ID47 | HITAG 3 (128-bit AES) |

---

## Procedure: Add Key (With Working Key)

### Step-by-Step Walkthrough

1. **Connect the IM608** to the OBD-II port.
2. **Navigate:** Diagnostics → Honda → Civic → [Year] → USA
3. **Select:** Immobilizer → Add/Delete Keys → Add One Key
4. **Programming Sequence:**
   - Turn ignition OFF with old key → Remove
   - Insert NEW key → Turn ON within 16 seconds
   - Follow IM608 prompts for ignition cycling
5. **Confirm:** Immobilizer light off = success

**Total Time:** ~5 minutes

---

## Procedure: All Keys Lost

1. Navigate to Honda → Civic → Immobilizer → All Keys Lost
2. IM608 reads PIN via OBD
3. Use XP400 Pro to generate key
4. Complete registration sequence

**Total Time:** 15-20 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Fob not detected** | Replace CR2032; hold fob to start button |
| **Wrong button count** | Verify trim level before ordering |
| **2022+ won''t program** | Ensure you have KR5TP-4, not KR5V2X |

---

## Pro Tips from the Field

- ⚡ **Same key for 6 years:** 2016-2021 all use KR5V2X
- 🔋 **4 vs 5 button:** 5-button = remote start for EX/Touring trims
- 📡 **Frequency:** All use 433 MHz
- 🔧 **Cost:** ~$50 DIY vs $200-400 at dealer

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE id = 'honda-civic-2016-2024';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CR-V - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda CR-V 2002-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda CR-V has used multiple key systems across generations. From 2015+, most CR-Vs feature a **proximity key fob (smart key)** with push-button start on EX and higher trims.

> 💡 **Pearl:** 2017+ CR-V uses KR5V2X - the same FCC ID as Civic! This means the same key fob works for both models (2017-2020). Great for multi-vehicle Honda households.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | See FCC ID table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year (Critical!)

| Years | FCC ID | Frequency | Notes |
|-------|--------|-----------|-------|
| 2015-2016 | ACJ932HK1210A | 314 MHz | Same as 2013-15 Accord |
| 2017-2020 | KR5V2X | 433 MHz | Same as Civic! |
| 2021-2024 | KR5T3X | 433 MHz | Current generation |

---

## Transponder Chip Evolution

| Years | Chip Type | Notes |
|-------|-----------|-------|
| 2002-2006 | ID13 | Glass wedge |
| 2007-2014 | ID46 | Philips Crypto 2 |
| 2015-2024 | ID47 | HITAG 3 (G-chip) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Honda → CR-V → [Year] → Immobilizer
3. **Select:** Add/Delete Keys → Add One Key
4. **Follow:** On-screen ignition cycling prompts
5. **Verify:** Immobilizer light off, start engine

**Total Time:** ~5 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Fob not detected** | Check battery, hold near start button |
| **Wrong FCC ID** | 2017+ uses KR5V2X (like Civic) |
| **2015-16 vs 2017+** | Different FCC IDs! Don''t mix |

---

## Pro Tips from the Field

- ⚡ **2017+ = Civic key:** KR5V2X works for both CR-V and Civic
- 🔋 **5-button = Remote Start:** All 2017+ CR-V smart keys include remote start
- 📡 **Frequency change:** 2015-16 = 314 MHz, 2017+ = 433 MHz

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'CR-V';
