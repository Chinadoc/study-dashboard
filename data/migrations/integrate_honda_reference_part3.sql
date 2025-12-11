-- Integrate Comprehensive Honda Reference Document - Part 3
-- S2000, Clarity, Crosstour, Passport, CR-Z + Universal Programming Specs

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA S2000 - Sports Car Collectible (2000-2009)
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda S2000 2000-2009 Master Programming Guide
## Sports Car Collectible - Rare ID8E Warning

---

## Overview

The S2000 is a collectible with rare transponder considerations. **2006-2009 uses ID8E/Sokymat "H-Chip"** - Honda-specific with very limited aftermarket support.

> ⚠️ **Critical Warning (2006-2009):** Uses **Sokymat ID8E "H-Chip"** with fewer aftermarket options. AKL may require EEPROM operations or dealer intervention!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Limited ID8E support |
| **XP400 Pro** | May be required for EEPROM operations |
| **Key Reader** | Verify chip type before ordering! |

---

## Transponder Breakdown

| Years | Chip | Notes |
|-------|------|-------|
| 2000-2005 (AP1/AP2 early) | **Megamos ID13** | Glass transponder |
| 2006-2009 (AP2 late) | **Sokymat ID8E "H-Chip"** | ⚠️ RARE - Honda-specific! |

Key Blade:
- HON66 (2004+)
- HON58R variant (earlier)

---

## ⚠️ No Factory Keyless Entry

Any remote fob on an S2000 is an **aftermarket alarm system** - there was no factory keyless entry remote.

---

## Collectible Considerations

- **Preserve original keys** when possible
- **Record key codes and VIN** for future reference
- **Clone rather than reprogram** to maintain original key functionality
- Many owners have aftermarket alarms - verify system before work

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2006-2009 won''t program | ID8E is rare - may need dealer |
| No remote response | S2000 has no factory remote! |
| Clone vs reprogram | Clone preserves original - preferred for collectibles |

---

## Pro Tips from the Field

- ⚡ **Collectible value:** Don''t ruin original keys
- 📋 **ID8E is rare:** Same as 2007 Fit
- 🔧 **No factory remote:** Any fob is aftermarket alarm
- 💰 **Premium pricing:** Collectible owners pay well

---

## Key Information

- **Blade:** HON66 (2004+), HON58R (earlier)
- **Lishi:** HON66 2-in-1
- **Factory Remote:** None

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'S2000';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CLARITY - Plug-in Hybrid/EV Specifications
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Clarity 2017-2021 Master Programming Guide
## Plug-in Hybrid/EV Specifications

---

## Overview

All Clarity variants (PHEV, BEV, FCV) use identical smart key systems. Unique **6-button configuration** includes Fan/Climate and Charge Lid buttons.

> 💡 **Pearl:** Clarity has **6 buttons** including Fan (climate preheat) and Charge Lid! Unique configuration for Honda.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro** | For all-keys-lost |
| **CR2032 Battery** | Replace before programming |

---

## Key Specifications

| Spec | Value |
|------|-------|
| Chip | **ID47 / HITAG-3** |
| FCC ID | KR5V2X |
| Frequency | 434 MHz |
| Buttons | **6** (Lock, Unlock, Trunk, Fan/Climate, Charge Lid, Panic) |
| All Variants | PHEV, BEV, FCV |
| All Trims | **Push-button start** |

---

## Smart Key Part Numbers

| Part Number | Memory |
|-------------|--------|
| 72147-TRW-A01 | No memory |
| 72147-TRW-A11 | Driver 1 |
| 72147-TRW-A21 | Driver 2 |

---

## ⚠️ High-Voltage Safety Protocol

1. **Ensure vehicle is "Ready OFF"** before programming
2. **Do NOT work near orange HV cables**
3. 12V auxiliary battery must be fully charged (12.4V+ minimum)
4. Use **ACC position** for programming - never Ready mode
5. Smart entry antennas are low-voltage safe

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Fan/Charge Lid buttons don''t work | Verify correct 6-button key ordered |
| Programming in Ready mode | Use ACC only - not Ready |
| 12V battery low | Charge auxiliary battery first |

---

## Pro Tips from the Field

- ⚡ **6 buttons unique:** Includes EV-specific functions
- 📋 **12V matters:** Aux battery, not HV pack
- 🔧 **ACC mode only:** Never program in Ready mode
- ⚠️ **HV safety:** Stay away from orange cables

---

## Key Information

- **Blade:** MIT11R (emergency)
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Clarity';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CROSSTOUR - Accord-Based Crossover
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Crosstour 2010-2015 Master Programming Guide
## Accord-Based Crossover

---

## Overview

The Crosstour shares the 8th-gen Accord platform. Chip transition from ID46 (2010-2012) to ID47 (2013-2015). Only EX-L trim (2013+) gets push-start.

> 💡 **Pearl:** Crosstour EX uses traditional ignition. Only **EX-L (2013-2015)** gets push-button start!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support all years |
| **CR2032 Battery** | Replace before programming |

---

## Key System by Trim/Year

| Trim | Years | Key System | Chip |
|------|-------|------------|------|
| EX | 2010-2015 | Remote Head Key | ID46/ID47 |
| EX-L | 2010-2012 | Remote Head Key | ID46 |
| EX-L | 2013-2015 | **Smart Key (PTS)** | ID47 |

---

## FCC IDs

| Key Type | FCC ID |
|----------|--------|
| Remote Head (2010-2012) | MLBHLIK-1T |
| Remote Head (2013-2015) | MLBHLIK6-1T |
| Smart Key (2013-2015) | **ACJ932HK1210A** |

---

## Smart Key Part Numbers (2013-2015 EX-L)

| Part Number | Memory |
|-------------|--------|
| 72147-TP6-A51 | No memory |
| 72147-TP6-A61 | Driver 1 |
| 72147-TP6-A71 | Driver 2 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| EX trim won''t take smart key | Only EX-L has push-start |
| 2012 vs 2013 confusion | ID46 vs ID47 transition |

---

## Pro Tips from the Field

- ⚡ **Trim matters:** Only EX-L gets smart key
- 📋 **Accord platform:** Similar procedures
- 🔧 **Discontinued 2015:** Replaced by HR-V/CR-V focus

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Crosstour';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA PASSPORT - Pilot-Based Mid-Size SUV
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Passport 2019-2024 Master Programming Guide
## Pilot-Based Mid-Size SUV

---

## Overview

The Passport shares Gen 3 Pilot platform. **All trims are push-button start** from launch (Sport, EX-L, Touring, Elite, TrailSport).

> 💡 **Pearl:** All Passport trims are push-start - no traditional ignition option! Uses same keys as Pilot EX+ trims.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Latest firmware for 2023+ |
| **XP400 Pro** | For HITAG-AES (verify 2023+ transition) |
| **CR2032 Battery** | Replace before programming |

---

## Key Specifications

| Years | Chip | FCC ID |
|-------|------|--------|
| 2019-2022 | ID47/HITAG-3 | **KR5V44/KR5T44** (also KR5V2X V44 compatible) |
| 2023-2024 | Verify 4A transition | KR5TP-4 (if transitioned) |

Frequency: 433.92 MHz

---

## Trims (All Push-Start)

- Sport
- EX-L
- Touring
- Elite
- TrailSport

---

## Smart Entry Antenna Locations

- All four door handles
- Tailgate
- Interior cabin sensors
- Center console

---

## Autel IM608 Path

`IMMO → Honda → Passport → Smart Key → Push to Start → Control Unit → Keyless System`

---

## Same Part Numbers as Pilot EX+

| Button Count | Part Numbers |
|--------------|--------------|
| 4-button | 72147-TG7-A01, 72147-THR-A01 |
| 5-button (remote start) | 72147-TG7-A61/AA1/AB1 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2023+ won''t program | Verify if HITAG-AES transition occurred |
| Same as Pilot key? | Yes - uses Pilot EX+ smart keys |

---

## Pro Tips from the Field

- ⚡ **All trims PTS:** No traditional ignition option
- 📋 **Same as Pilot:** Cross-compatible keys
- 🔧 **Verify 2023+:** Check for 4A chip transition

---

## Key Information

- **Blade:** MIT11R (emergency)
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Passport';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CR-Z - Sport Hybrid Coupe
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda CR-Z 2011-2016 Master Programming Guide
## Sport Hybrid Coupe

---

## Overview

The sporty CR-Z hybrid coupe progressed from ID46 to ID47. All **2016 models are push-button start**.

> 💡 **Pearl:** All 2016 CR-Z models are push-button start with ID47 smart keys. Earlier years may have traditional ignition on base trim.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support all years |
| **CR2032 Battery** | Replace before programming |

---

## Key System Evolution

| Years | Key Type | Chip |
|-------|----------|------|
| 2011-2015 (base) | Remote Head Key | ID46 |
| 2011-2015 (higher trims) | May have PTS | ID46/ID47 |
| 2016 (all) | **Smart Key (PTS)** | ID47 |

---

## FCC IDs

| Key Type | FCC ID |
|----------|--------|
| Remote Head (2011-2015) | MLBHLIK-1T |
| Smart Key (2016) | **ACJ932HK1310A** |

Frequency: 433 MHz (smart key)

---

## Smart Key Part Numbers (2016)

Part: 72147-SZT-A01

---

## Hybrid Battery Notes

- 12V auxiliary battery must be healthy (12.5V+ minimum)
- IMA battery does NOT affect immobilizer
- Green key light operates identically to non-hybrids

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Earlier year smart key? | Verify trim level - may be traditional ignition |
| 2016 is straightforward | All trims are PTS |

---

## Pro Tips from the Field

- ⚡ **2016 = all PTS:** Final year simplifies things
- 📋 **12V matters:** Not the IMA pack
- 🔧 **Verify trim:** Earlier years vary by trim

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'CR-Z';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CIVIC 2012-2015 (9th Gen) - No Push-Start
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Civic 2012-2015 Master Programming Guide
## 9th Generation - No Push-Start

---

## Overview

All 2012-2015 Civics used **traditional turn-key ignition** regardless of trim. No push-start option existed for this generation.

> 💡 **Pearl:** All 9th gen Civics are traditional ignition - no smart key option! Straightforward ID46 programming.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **CR1616 Battery** | Replace before programming |

---

## Key Specifications

| Spec | Value |
|------|-------|
| Chip | **ID46 / PCF7936** |
| Key Type | Remote Head Key (all trims) |
| Push-Start | **Not available any trim** |
| Frequency | 313.8 MHz |

---

## FCC IDs

| FCC ID | Part Number |
|--------|-------------|
| N5F-A05TAA | 35118-TR0-A00 |
| MLBHLIK-1T | 35111-SWA-306 |

---

## MICU Location

Integrates with interior fuse block under driver''s dash.

---

## Autel IM608 Path

`IMMO → Honda → Civic → 2012-2015 → Immo Type 1 → Key Learn`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Expecting smart key | 9th gen has no PTS option |
| ID46 issues | Standard Philips Crypto - well supported |

---

## Pro Tips from the Field

- ⚡ **All traditional:** No smart key option this generation
- 📋 **ID46 standard:** Well-supported chip
- 🔧 **Simple procedures:** Straightforward programming

---

## Key Information

- **Blade:** HON66
- **Lishi:** HON66 2-in-1
- **Battery:** CR1616

---

*Last Updated: December 2025*
'
WHERE id = 'honda-civic-2012-2015';
