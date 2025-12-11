-- Integrate Comprehensive Honda Reference Document - Part 2
-- Odyssey, HR-V, Fit, Ridgeline, Insight, Element, S2000

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA ODYSSEY - Minivan with Unique Button Configs (2011-2024)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Odyssey 2011-2017 Master Programming Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The 4th generation Odyssey features unique **5-7 button configurations** for sliding doors. Transponder transition from ID46 (2011-2013) to ID47 (2014-2017).

> 💡 **Pearl:** Odyssey remotes have sliding door buttons (L-Slide, R-Slide). 6-button includes hatch. Count buttons carefully before ordering!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost scenarios |
| **New Programmable Fob** | See button configurations below |
| **CR2032 Battery** | Replace before programming |

---

## Transponder Evolution

| Years | Chip | Protocol |
|-------|------|----------|
| 2011-2013 | ID46 / PCF7941A | Philips Crypto |
| 2014-2017 | ID47 / NCF2952X | HITAG-3 |

---

## Trim-Based Key Systems

| Trim | Key Type | Years |
|------|----------|-------|
| LX | Remote Head Key (5-6 btn) | 2011-2017 |
| EX/EX-L/Touring | **Smart Key (PTS)** | 2014-2017 |

---

## Remote Head Key FCC ID: N5F-A04TAA (313.8 MHz)

| Part Number | Buttons | Memory |
|-------------|---------|--------|
| 35118-TK8-A10 | 5 | - |
| 35118-TK8-A20 | 6 | No memory |
| 35118-TK8-A30 | 6 | Memory 1 |
| 35118-TK8-A40 | 6 | Memory 2 |

Button layout: Lock, Unlock, L-Slide, R-Slide, [Hatch], Panic

---

## Smart Key FCC ID: KR5V1X

| Part Number | Memory |
|-------------|--------|
| 72147-TK8-A51 | No memory |
| 72147-TK8-A61 | Driver 1 |
| 72147-TK8-A71 | Driver 2 |
| 72147-TK8-A81 | Driver 3 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port (driver side)
2. **Navigate:** Diagnostics → Honda → Odyssey → [Year] → USA
3. **Select:** Immobilizer → Add/Delete Keys → Add One Key
4. **Programming Sequence:**
   - Turn ignition OFF with old key → Remove
   - Insert NEW key → Turn ON within 16 seconds
   - Wait for prompt → Turn OFF
   - Turn ON without changing key
   - Turn OFF again → Turn ON one last time
5. **Confirm:** Immobilizer light off = success
6. **Test:** Start car, test ALL remote buttons including sliding doors

**Total Time:** ~5 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sliding door buttons don''t work | Verify correct button count ordered |
| Wrong remote ordered | Count buttons: 5 vs 6 for remote head |
| Smart key antenna issues | Verify door handle and console antennas |

---

## Pro Tips from the Field

- ⚡ **Count buttons first:** 5, 6, or 7 button variants
- 📋 **Sliding doors matter:** L-Slide and R-Slide must work
- 🔧 **2014+ = smart key option:** EX and higher trims
- 🔋 **Battery:** CR2032 for all keys

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032
- **Frequency:** 313.8 MHz

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Odyssey' AND year_start = 2011;

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA ODYSSEY 5th Gen (2018-2024)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Odyssey 2018-2024 Master Programming Guide
## 7-Button Smart Key Configuration

---

## Overview

All 5th generation Odyssey models are **push-button start** with **7-button smart keys** including sliding doors and remote start.

> ⚠️ **Frequency Conflict:** Some sources list 433 MHz, USDM traditionally uses 313.8 MHz. **Verify with FCC database before ordering!**

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **CR2032 Battery** | Replace before programming |

---

## Key Specifications

| Spec | Value |
|------|-------|
| Chip | ID47 / HITAG-3 |
| All Trims | **Push-button start** |
| Buttons | **7** (Lock, Unlock, L-Slide, R-Slide, Trunk, Remote Start, Panic) |

---

## FCC IDs by Year

| Years | FCC ID | Notes |
|-------|--------|-------|
| 2018-2020 | **KR5V2X** | Verify frequency |
| 2021-2024 | **KR5T4X** | Updated key |

---

## Smart Key Part Numbers

| Part Number | Memory |
|-------------|--------|
| 72147-THR-A11 | No memory |
| 72147-THR-A21 | Driver 1 |
| 72147-THR-A31 | Driver 2 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Honda → Odyssey → [Year] → Smart Key
3. **Select:** Add Key
4. **Follow prompts**
5. **Test ALL 7 buttons** including sliding doors and remote start

**Total Time:** 5-10 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frequency mismatch | Verify 313.8 vs 433 MHz for your VIN |
| Sliding doors don''t work | All 7 buttons must be functional |
| Remote start fails | Verify hood is closed for horn chirp |

---

## Pro Tips from the Field

- ⚡ **7 buttons:** Most buttons of any Honda smart key
- ⚠️ **Frequency warning:** Verify before ordering
- 📋 **All PTS:** No remote head key option

---

## Key Information

- **Blade:** MIT11R (emergency)
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Odyssey' AND year_start = 2018;

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA HR-V - KR5V1X (NOT KR5V2X!)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda HR-V 2016-2024 Master Programming Guide
## KR5V1X - NOT KR5V2X!

---

## Overview

The HR-V uses **KR5V1X** at **313.8/314 MHz** - the same FCC as Fit! This is commonly confused with CR-V/Pilot''s KR5V2X (433 MHz).

> ⚠️ **Critical Warning:** HR-V uses **KR5V1X** (314 MHz). This is NOT the same as CR-V/Pilot''s **KR5V2X** (433 MHz)! Ordering error = non-functional remote.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware for 2023+ |
| **XP400 Pro** | Required for 2023+ HITAG-AES |
| **CR2032 Battery** | Replace before programming |

---

## Generation Breakdown

### Gen 1 (2016-2022)
| Trim | Key Type | FCC ID |
|------|----------|--------|
| LX | Remote Head Key | MLBHLIK6-1T (313.8 MHz) |
| EX and higher | **Smart Key** | **KR5V1X** (314 MHz) |

Part Number: 72147-T7S-A01

### Gen 2 (2023-2024)
| Spec | Value |
|------|-------|
| Chip | **HITAG-AES/4A** |
| FCC ID | KR5TP-4 |
| Frequency | 434 MHz |
| All Trims | Push-button start |

Part Numbers: 72147-T43-A01/A11 (shared with CR-V/Civic)

---

## The KR5V1X vs KR5V2X Difference

| FCC ID | Frequency | Vehicles |
|--------|-----------|----------|
| **KR5V1X** | 313.55/314.15 MHz | **HR-V, Fit** |
| KR5V2X | 433 MHz | CR-V, Pilot, Civic PTS |

**Physical keys look nearly identical!** Always verify FCC label.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Remote won''t work | Ordered KR5V2X instead of KR5V1X! |
| Wrong frequency | HR-V = 314 MHz (NOT 433 MHz) |
| 2023+ won''t program | Requires HITAG-AES tools |

---

## Pro Tips from the Field

- ⚡ **KR5V1X only:** NOT KR5V2X!
- 📋 **Same as Fit:** HR-V and Fit share FCC ID
- 🔧 **2023 change:** New generation = new key type

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'HR-V';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA FIT - Rare ID8E Chip Warning
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Fit 2007-2020 Master Programming Guide
## Rare ID8E Chip Warning (2007)

---

## Overview

The Honda Fit has a dangerous trap: **2007 uses rare ID8E/Sokymat chip** - same as S2000. Verify with key reader before ordering!

> ⚠️ **Critical Warning (2007):** Uses **rare ID8E/Sokymat chip** with limited aftermarket support. AKL may require EEPROM operations or dealer intervention!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Verify ID8E support for 2007 |
| **XP400 Pro** | May be required for 2007 AKL |
| **Key Reader** | Verify chip type before ordering! |
| **CR2032 Battery** | Replace before programming |

---

## Generation Breakdown

### Gen 2 (2007-2008)
| Year | Chip | Warning |
|------|------|---------|
| 2007 | **ID8E / Sokymat** | ⚠️ RARE - verify first! |
| 2008 | ID46 | Mid-production transition |

### Gen 2 Refresh (2009-2014)
| Spec | Value |
|------|-------|
| Chip | ID46 / PCF7936 |
| FCC ID | MLBHLIK-1T |
| Part # | 35118-SZT-A00 |

### Gen 3 (2015-2020)
| Trim | Key Type | FCC ID |
|------|----------|--------|
| LX | Remote Head Key | MLBHLIK6-1T (35118-T5A-A00) at 313.8 MHz |
| EX/EX-L/Sport | **Smart Key** | **KR5V1X** (72147-T5A-A01) |

---

## ID47/NCF2952X (2015-2020)

Same FCC as HR-V: **KR5V1X** (314 MHz)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2007 won''t program | Rare ID8E chip - verify with reader |
| Wrong chip ordered | Always read existing key first |
| Smart key wrong frequency | Must be KR5V1X, not KR5V2X |

---

## Pro Tips from the Field

- ⚡ **2007 = danger:** ID8E is rare and difficult
- 📋 **Same as HR-V:** 2015-2020 uses KR5V1X
- 🔧 **Discontinued 2020:** Last year of US Fit

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Fit';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA RIDGELINE - Pickup Truck Specifications
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Ridgeline 2006-2024 Master Programming Guide
## Pickup Truck Specifications

---

## Overview

Honda''s only pickup truck, the Ridgeline evolved from ID46 remote-only (Gen 1) to ID47 smart key (Gen 2). No on-board programming available for Gen 1.

> 💡 **Pearl:** Gen 2 (2017+) uses KR5V2X - same as Pilot/CR-V. Great for cross-compatible stocking!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Fully supports all years |
| **XP400 Pro** | For all-keys-lost |
| **CR2032 Battery** | Replace before programming |

---

## Generation Breakdown

### Gen 1 (2006-2014)
| Spec | Value |
|------|-------|
| Chip | ID46 / PCF7941A |
| FCC ID | OUCG8D-380H-A |
| Frequency | 314 MHz |
| Part # | 35111-SHJ-305 |
| Push-Start | **Not available** |
| On-Board | **No** - diagnostic equipment required |

### Gen 2 (2017-2024)
| Trim | Key Type | FCC ID |
|------|----------|--------|
| RT, RTS | Remote Head Key | Traditional ignition |
| RTL, RTL-E, Black Edition | **Smart Key** | **KR5V2X** (A2C97488400) |

Frequency: 433 MHz

Smart Key Part Numbers:
- 72147-T6Z-A11 (4-button)
- 72147-T6Z-A21 (Driver 1)
- 72147-T6Z-A31 (Driver 2)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Gen 1 needs DIY | No on-board programming - tool required |
| Gen 2 trim confusion | Verify RTL+ for smart key |

---

## Pro Tips from the Field

- ⚡ **Same as Pilot/CR-V:** Gen 2 uses KR5V2X
- 📋 **No DIY for Gen 1:** Diagnostic tools required
- 🔧 **Trim matters:** Only RTL and higher get smart key

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Ridgeline';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA INSIGHT - Hybrid Evolution
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Insight 2010-2022 Master Programming Guide
## Hybrid Evolution

---

## Overview

The Insight evolved from ID46 (Gen 2) to **NXP AES 128-bit** (Gen 3). Gen 3 uses same key as 2018-2022 Accord Hybrid!

> 💡 **Pearl:** 2019-2022 Insight uses **CWTWB1G0090** - cross-compatible with 2018-2022 Accord Hybrid!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware for Gen 3 |
| **XP400 Pro** | Required for Gen 3 AES chips |
| **CR2032 Battery** | Replace before programming |

---

## Generation Breakdown

### Gen 2 (2010-2014)
| Spec | Value |
|------|-------|
| Chip | ID46 / PCF7936 |
| FCC ID | MLBHLIK-1T (35118-TM8-A00) |
| Frequency | 313.8 MHz |
| Push-Start | **Not available** |

**On-Board Remote Programming:**
1. Insert key → ON then OFF within 4 seconds
2. Press Lock/Unlock on remote
3. Repeat ON-OFF cycle 3 more times
4. On 4th cycle, doors cycle to confirm
5. Press Lock/Unlock on each remote

### Gen 3 (2019-2022)
| Spec | Value |
|------|-------|
| Chip | ⚠️ **NXP AES 128-bit** (sometimes listed as "4A") |
| FCC ID | CWTWB1G0090 |
| Frequency | 433.92 MHz FSK |
| All Trims | **Push-button start** |

Part Numbers:
- 72147-TXM-A01 (4-button LX)
- 72147-TWA-A11/A21/A31 (5-button with remote start)

---

## Hybrid Battery Notes

- 12V battery must be healthy (12.5V+ minimum)
- IMA battery does NOT affect immobilizer programming
- Green key light operates identically to non-hybrids

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Gen 3 won''t program | Uses AES 128-bit - verify tool support |
| Chip confusion | "NXP AES" = "4A chip" - same thing |
| 12V battery low | Hybrid aux battery must be charged |

---

## Pro Tips from the Field

- ⚡ **Cross-compatible:** Gen 3 = same as Accord Hybrid
- 📋 **AES chip:** Not standard ID47
- 🔧 **12V matters:** IMA doesn''t but aux battery does

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Insight';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA ELEMENT - Discontinued Utility Vehicle
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Element 2003-2011 Master Programming Guide
## Discontinued Utility Vehicle

---

## Overview

The quirky Element is discontinued but still common. Watch for MICU water intrusion from A/C drain.

> 💡 **Pearl:** MICU water intrusion from A/C drain causes intermittent immobilizer failures. Check for moisture if having issues!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Fully supports all Element years |
| **CR1616 / CR2032 Battery** | Varies by fob type |

---

## Transponder Evolution

| Years | Chip |
|-------|------|
| 2003-2005 | **ID13 / Megamos 13** |
| 2006-2011 | **ID46 / PCF7941A** |

---

## FCC IDs

| FCC ID | Part Number | Buttons |
|--------|-------------|---------|
| OUCG8D-344H-A | 72147-S5T-A01 | 3 |
| OUCG8D-380H-A | 72147-SCV-A02 | 4 (EX trim) |

Frequency: 313.8 MHz

---

## Common Issues

| Issue | Cause |
|-------|-------|
| Intermittent immobilizer | **MICU water intrusion** from A/C drain |
| Lock cylinder wear | Common at 100K+ miles |
| Transponder fails | Check for moisture damage |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Intermittent no-start | Check MICU for water damage |
| Key works sometimes | Clean/dry MICU contacts |
| High mileage wear | Cylinder may need replacement |

---

## Pro Tips from the Field

- ⚡ **Water intrusion:** Common cause of immobilizer issues
- 📋 **Full support:** Autel IM608 handles all years
- 🔧 **Discontinued:** But still common in service

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR1616 / CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Element';
