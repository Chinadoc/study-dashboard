-- Integrate Comprehensive Honda Reference Document
-- Source: Professional locksmith reference guide covering all Honda models 1998-2024

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA ACCORD - Complete Reference (1998-2024)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Accord 1998-2024 Master Programming Guide
## The Evolution Benchmark

---

## Overview

The Accord serves as Honda''s reference platform for immobilizer evolution, progressing through **five transponder generations**. This guide covers all 10 generations with critical warnings for 2020+ BCM bricking prevention.

> 💡 **Pearl:** For 2020+ Accords, **NEVER auto-detect by VIN**. Manual selection required or you risk bricking the BCM permanently!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware required for 2022+ |
| **XP400 Pro** | Required for HITAG-AES (2022+) |
| **Lishi HON66 2-in-1** | Mechanical access |
| **CR2032 / CR1616 Battery** | Smart key / Remote head |

---

## Generation Breakdown

### Gen 6 (1998-2002) - Megamos ID13
| Spec | Value |
|------|-------|
| Chip | **Megamos ID13** (glass transponder) |
| Key Blade | HON58R (last before high-security) |
| Remote | DIY ignition cycling |
| MICU | Driver side under-dash fuse box |

### Gen 7 (2003-2007) - ID46 Introduction
| Spec | Value |
|------|-------|
| Chip | **ID46 / PCF7936** (Philips Crypto) |
| Key Blade | HON66 (high-security laser-cut) |
| FCC ID | OUCG8D-380H-A |
| Frequency | 313.8 MHz |

**On-Board Programming:**
1. Insert master key → ON
2. Press gas pedal 5 times
3. Press brake 6 times
4. Remove master key → Insert new key
5. Press gas once → Wait 45-60 sec for light

### Gen 8 (2008-2012) - Type 7 IMOES
| Spec | Value |
|------|-------|
| Chip | **ID46 / PCF7941A** |
| FCC ID | KR55WK49308 |
| EEPROM | 93C66 (for emergency recovery) |
| Part Numbers | 35118-TA0-A04 (3-btn), 35118-TP6-A00 (4-btn) |

### Gen 9 (2013-2017) - Push-Start Introduction
| Trim | Key System | FCC ID |
|------|------------|--------|
| LX, Sport | Remote Head Key | MLBHLIK6-1T |
| EX-L, Touring, Hybrid | **Smart Key (PTS)** | ACJ932HK1210A, KR5V1X |

**All trims use ID47/HITAG-3 chips.**

Smart Key Part Numbers:
- 72147-T2A-A01 (no memory)
- 72147-T2A-A11 (Driver 1)
- 72147-T2A-A21 (Driver 2)

### Gen 10 (2018-2024) - Universal Push-Start
| Years | FCC ID | Buttons | Notes |
|-------|--------|---------|-------|
| 2018-2022 | CWTWB1G0090 | 4-5 | 5-btn = remote start |
| 2022-2024 | KR5TP-4 | 4-5 | HITAG-AES (128-bit) |

---

## ⚠️ CRITICAL: 2020+ BCM Bricking Warning

When programming 2021+ vehicles:
1. Autel prompts "Is this a new system?"
2. **WRONG ANSWER = BRICKED BCM** (dealer replacement required!)
3. Some 2022 Accords still use "old" key systems
4. **ALWAYS manually select vehicle** - never auto-detect by VIN

---

## Autel IM608 Path

`IMMO → Honda → Accord → [Year] → [Key Type] → Key Learn`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| BCM bricked | Dealer replacement ($800-1500) |
| Green light blinking | Key not recognized - verify chip type |
| 2022 won''t program | Try "old system" selection |
| AKL fails | Battery must be 12.5V+ with maintainer |

---

## Pro Tips from the Field

- ⚡ **Gen 10 universal PTS:** All 2018+ trims are push-start
- 🔋 **Battery critical:** 12.5V minimum, maintainer recommended
- ⚠️ **2020+ danger zone:** Manual selection prevents BCM bricking
- 📋 **XP400 Pro required:** For 2022+ HITAG-AES systems

---

## Key Information

- **Blade:** HON66 (2003+), HON58R (1998-2002)
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032 (smart), CR1616 (remote head)

---

*Last Updated: December 2025*
'
WHERE id = 'honda-accord-1998-2024';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CIVIC - The Trim-Level Minefield (2012-2024)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Civic 2016-2024 Master Programming Guide
## The KR5V1X/KR5V2X Trap

---

## Overview

The 10th and 11th generation Civic introduced Honda''s most dangerous compatibility issue: the **Civic/Pilot Trap**. Wrong FCC ID selection causes programming to appear successful while creating frequency mismatch.

> ⚠️ **Critical Warning:** KR5V1X (314 MHz) and KR5V2X (433 MHz) look identical but are **NOT interchangeable**! Always match FCC ID AND part number suffix.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware for 2022+ |
| **XP400 Pro** | Required for 2022+ HITAG-AES |
| **CR2032 Battery** | Replace before programming |

---

## The Civic/Pilot Trap Explained

| FCC ID | Frequency | Vehicles | Buttons |
|--------|-----------|----------|---------|
| **KR5V1X** | 313.55/314.15 MHz | HR-V, Fit | 4 |
| **KR5V2X** | 433 MHz | Pilot, CR-V, **Civic PTS** | 5 |
| KR5V2X V41 | 433 MHz | Civic (4-button config) | 4 |
| KR5V2X V44 | 433 MHz | Civic (5-button w/remote start) | 5 |

**FCC ID alone is insufficient - match part number suffix!**

---

## 10th Gen (2016-2021) - Trap Origin

| Trim | Key System | Chip |
|------|------------|------|
| LX (2016-2019) | Remote Head Key | ID47 |
| Sport, EX, EX-T, EX-L, Touring | **Smart Key (PTS)** | ID47 |
| Si, Type R | Smart Key (PTS) | ID47 |
| LX (2020-2021) | **Smart Key (PTS)** | ID47 |

**2020-2021 LX transitioned to push-start!**

---

## 11th Gen (2022-2024) - HITAG-AES

| Spec | Value |
|------|-------|
| Chip | **HITAG-AES/4A** (NCF29A1M) |
| Encryption | 128-bit AES |
| FCC ID | KR5TP-4 |
| Part # | 72147-T20-A11 |
| All Trims | Push-button start |

> 💡 **Pearl:** 2022+ requires updated Autel firmware AND XP400 Pro capabilities.

---

## Autel IM608 Path

`IMMO → Honda → Civic → [Year] → Immo Type → Key Learn`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Remote won''t work after programming | Wrong FCC ID! KR5V1X vs KR5V2X frequency mismatch |
| 4 vs 5 button confusion | Verify trim level - EX-L/Touring = 5 button |
| 2022+ won''t program | Requires HITAG-AES capable tools |
| Key appears programmed but fails | Verify exact part number suffix |

---

## Pro Tips from the Field

- ⚡ **KR5V2X for Civic:** NOT KR5V1X (that''s HR-V/Fit)
- 📋 **Part number matters:** Suffix determines configuration
- 🔧 **2022+ new security:** 128-bit AES encryption
- ⚠️ **Trap warning:** Programming "succeeds" with wrong FCC ID

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032
- **Frequency:** 433 MHz (push-start), 313.8 MHz (remote head)

---

*Last Updated: December 2025*
'
WHERE id = 'honda-civic-2016-2024';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CR-V - Complete Reference (2002-2024)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda CR-V 2002-2024 Master Programming Guide
## North America''s Bestselling SUV

---

## Overview

The CR-V evolved through six generations with different transponder technologies. Key transition in 2017 from ID46 to ID47, and 2023+ uses HITAG-AES.

> 💡 **Pearl:** Gen 5 (2017-2022) uses **KR5V2X at 433 MHz** - same as Pilot/Civic! Great for stocking one key type.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware for 2023+ |
| **XP400 Pro** | Required for 2023+ HITAG-AES |
| **CR2032 Battery** | Replace before programming |

---

## Generation Breakdown

### Gen 2 (2002-2006)
| Spec | Value |
|------|-------|
| Chip | ID13 (early) → ID48/ID46 (later) |
| Key Blade | HON66 |
| FCC ID | OUCG8D344H-A |
| Frequency | 313.8 MHz |

### Gen 3 (2007-2011)
| Spec | Value |
|------|-------|
| Chip | **ID46 / PCF7936** |
| FCC ID | MLBHLIK-1T |
| Part Numbers | 35111-SWA-306, 35118-T0A-A00 |

### Gen 4 (2012-2016)
| Years | Chip | PTS Available |
|-------|------|---------------|
| 2012-2013 | ID46 | Touring only |
| 2014 | ID47 | EX-L Navi, Touring |
| 2015-2016 | ID47 | EX-L, Touring |

Smart Key FCC: **ACJ932HK1210A** (72147-T0A-A11)

### Gen 5 (2017-2022) - KR5V2X Era
| Trim | Key Type | FCC ID |
|------|----------|--------|
| LX | Remote Head | MLBHLIK6-1TA (313.8 MHz) |
| EX and higher | **Smart Key** | **KR5V2X** (433 MHz) |

Part Numbers: 72147-TLA-A01/A11/A21

### Gen 6 (2023-2024) - HITAG-AES
| Spec | Value |
|------|-------|
| Chip | **HITAG-AES/4A** (NCF29A1M) |
| FCC ID | KR5TP-4 |
| All Trims | Push-button start |

Part Numbers: 72147-T43-A01/A11 (standard), 72147-3A0-A01 (power liftgate)

---

## Smart Entry Antennas (Gen 5+)

- All four door handles
- Rear hatch
- Interior center console
- Steering column start authorization coil

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2017+ wrong frequency | Must use KR5V2X (433 MHz), not KR5V1X |
| 2023+ won''t program | Requires updated firmware + XP400 Pro |
| Antenna issues | Verify all handle antennas functional |

---

## Pro Tips from the Field

- ⚡ **Same as Civic/Pilot:** Gen 5 uses KR5V2X
- 📋 **2023 change:** HITAG-AES requires new tools
- 🔧 **MICU location:** Driver side under-dash fuse box

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'CR-V';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA PILOT - Full-Size SUV with Trap Potential (2003-2024)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Pilot 2003-2024 Master Programming Guide
## Primary Civic/Pilot Trap Zone

---

## Overview

The Pilot is the primary source of the Civic/Pilot Trap confusion. Gen 3 (2016-2022) uses **KR5V2X** which looks identical to KR5V1X but operates on different frequency.

> ⚠️ **Critical Warning:** Gen 3 Pilot uses KR5V2X at **433 MHz**. KR5V1X (HR-V/Fit) is 314 MHz. They look identical but **will not work interchangeably**!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware for 2023+ |
| **XP400 Pro** | Required for 2023+ HITAG-AES |
| **CR2032 Battery** | Replace before programming |

---

## Generation Breakdown

### Gen 1 (2003-2008)
| Years | Chip | Notes |
|-------|------|-------|
| 2003-2004 | **ID13** | Glass bulb transponder |
| 2005-2008 | **ID46** | Plastic wedge chip |

⚠️ **Unusual:** Gen 1 Pilot uses **433 MHz** - rare for Honda of this era!
FCC ID: CWTWB1U545

### Gen 2 (2009-2015)
| Spec | Value |
|------|-------|
| Chip | **ID46 / PCF7941A** |
| FCC IDs | KR55WK49308, OUCG8D-380H-A |
| Frequency | 313.8-315 MHz |
| Push-Start | **Not available any trim** |

### Gen 3 (2016-2022) - PRIMARY TRAP ZONE
| Trim | Key Type | FCC ID |
|------|----------|--------|
| LX | Remote Head Key | MLBHLIK6-1T (35118-T2A-A50) |
| EX and higher | **Smart Key** | **KR5V2X** |

Smart Key Part Numbers by Configuration:
- **4-button:** 72147-TG7-A01, 72147-THR-A01
- **5-button (remote start):**
  - No memory: 72147-TG7-A61
  - Driver 1: 72147-TG7-AA1/A81/A82
  - Driver 2: 72147-TG7-AB1/A91/A92

**2019-2022 EX-L+:** May show as KR5V44/KR5T44 at 433.92 MHz

### Gen 4 (2023-2024) - HITAG-AES
| Spec | Value |
|------|-------|
| Chip | **HITAG-AES/4A** (NOT ID47!) |
| FCC ID | KR5TP-4 |
| All Trims | Push-button start |

Part Numbers:
- 72147-T43-A11 (no power liftgate)
- 72147-3A0-A01/A11 (with power liftgate)

---

## The KR5V1X vs KR5V2X Trap

| FCC ID | Frequency | Vehicles |
|--------|-----------|----------|
| KR5V1X | **314 MHz** | HR-V, Fit (WRONG for Pilot!) |
| KR5V2X | **433 MHz** | Pilot, CR-V, Civic PTS (CORRECT) |

**Physical appearance is nearly identical - verify FCC label on key!**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Remote works but won''t start | Wrong FCC ID frequency mismatch |
| 2023+ won''t program | Requires HITAG-AES capable tools |
| Programming "succeeds" but fails | Verify KR5V2X not KR5V1X |

---

## Pro Tips from the Field

- ⚡ **433 MHz for Pilot:** Always verify KR5V2X
- 📋 **Part number suffix:** Determines button count/memory
- 🔧 **2023+ = 4A chip:** Not ID47 - requires updated tools
- ⚠️ **Trap warning:** Most common source of FCC ID errors

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Pilot';
