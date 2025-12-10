-- Standardize Toyota and Ford guides to Odyssey format

-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA CAMRY - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Toyota Camry 2007-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Toyota Camry uses a **proximity key fob (smart key)** with push-button start on SE, XSE, and TRD trims. Lower trims may use traditional remote head keys with blade ignition.

> 💡 **Pearl:** 2015 Camrys are tricky! Early 2015 (Jan-Jun) uses G-chip, late 2015 (Jul+) uses H-chip. Always ask for production date before ordering transponder.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **Toyota Techstream** | Alternative for dealer-level access |
| **New Programmable Proximity Fob** | See FCC ID table below |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation (Critical!)

| Years | FCC ID | Board | Frequency |
|-------|--------|-------|-----------|
| 2012-2017 | HYQ14FBA | Board 0020 | 315 MHz |
| 2018-2023 | HYQ14FBC | Board 0351 | 315 MHz |

> ⚠️ **Warning:** Board 0020 and Board 0351 are NOT interchangeable! Verify year before ordering.

---

## Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 2007-2011 | ID67 | DST | 4D-67 chip |
| 2012-2014 | ID72 (G) | DST-AES | "G-chip" |
| 2015 Early | ID72 (G) | DST-AES | Jan-Jun 2015 |
| 2015 Late+ | ID8A (H) | DST-AES 128 | Jul 2015+ |
| 2016-2024 | ID8A (H) | DST-AES 128 | "H-chip" |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Toyota → Camry → [Year] → Smart Key
3. **Select:** Register Smart Key → Add Key
4. **Follow prompts:** Place new key in vehicle, complete registration
5. **Verify:** Start engine, test all functions

**Total Time:** 5-10 minutes

---

## Procedure: All Keys Lost

1. Navigate to Toyota → Camry → Smart Key → All Keys Lost
2. IM608 reads immobilizer data via OBD
3. Use XP400 Pro to generate new key
4. Complete registration sequence
5. Program at least 2 keys recommended

**Total Time:** 20-30 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Key not detected** | Replace battery; place key in emergency slot on console |
| **Board mismatch** | Verify 0020 (2012-17) vs 0351 (2018+) before ordering |
| **2015 chip mismatch** | Check production date for G vs H chip |
| **All Keys Lost fails** | May need Toyota Techstream for newer models |

---

## Pro Tips from the Field

- ⚡ **2015 is the tricky year:** Production date determines G vs H chip
- 📋 **Board number:** Check FCC label on original key for board ID
- 🔧 **Camry = common:** Very popular vehicle, worth stocking keys
- 💰 **Dealer price:** $400-600 vs $100-150 DIY with IM608

---

## Key Information

- **Blade:** TOY43, TOY48
- **Lishi:** TOY43 2-in-1, TOY48 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Toyota' AND model = 'Camry';

-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA RAV4 - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Toyota RAV4 2013-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Toyota RAV4 uses a **proximity key fob (smart key)** with push-button start across most trims from 2013+. This is one of the most popular SUVs in America, making RAV4 key programming a high-volume service.

> 💡 **Pearl:** 2019 RAV4 is tricky - it can have EITHER HYQ14FBA or HYQ14FBC depending on production! Always check VIN. If VIN starts with "2" = US production = Board 0351.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **Toyota Techstream** | Alternative for stubborn vehicles |
| **New Programmable Proximity Fob** | See FCC ID table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation (Critical!)

| Years | FCC ID | Board | Buttons | Notes |
|-------|--------|-------|---------|-------|
| 2013-2018 | HYQ14FBA | Board 0020 | 4 | Original RAV4 |
| 2019 | EITHER | Verify VIN | 3-4 | Transition year! |
| 2019-2021 | HYQ14FBC | Board 0351 | 3, 4 | 315 MHz US Prod |
| 2021-2023 | HYQ14FBC | Board 0351 | 4 | 433 MHz some versions |

> ⚠️ **Warning:** Board 0020 (2013-18) and Board 0351 (2019+) are NOT interchangeable!

---

## Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2013-2015 Early | ID72 (G) | DST-AES |
| 2015 Late-2024 | ID8A (H) | DST-AES 128 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Toyota → RAV4 → [Year] → Smart Key
3. **Select:** Register Smart Key → Add Key
4. **Follow prompts:** Place new key inside vehicle
5. **Complete registration** and test all functions

**Total Time:** 5-10 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **2019 key not working** | Verify FCC ID - could be either generation |
| **Board 0020 vs 0351** | Check year and VIN before ordering |
| **3 vs 4 button** | Match original key configuration |
| **433 MHz version** | Some 2021+ non-hybrid use 433 MHz |

---

## Pro Tips from the Field

- ⚡ **2019 = danger zone:** Can be either FCC ID
- 📋 **VIN check:** Starts with "2" = US production = newer board
- 🔧 **High volume:** RAV4 is #1 selling SUV - stock these keys
- 💰 **Profit margin:** Great markup on smart keys

---

## Key Information

- **Blade:** TOY43, TOY48
- **Lishi:** TOY48 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Toyota' AND model = 'RAV4';

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD F-150 - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Ford F-150 2015-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Ford F-150 uses **two different frequencies** for smart keys - 315 MHz and 902 MHz. The 902 MHz keys have a tailgate release button and are **NOT interchangeable** with 315 MHz keys!

> 💡 **Pearl:** Count the buttons! 5-button = 902 MHz with tailgate release. 3-4 button = 315 MHz. This is the fastest way to identify which key to order.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **PATS Key Programmer** | Ford-specific when needed |
| **New Programmable Proximity Fob** | VERIFY FREQUENCY before ordering! |
| **CR2450 Battery** | F-150 uses larger battery |

---

## FCC IDs by Frequency (CRITICAL!)

| FCC ID | Frequency | Buttons | Key Feature |
|--------|-----------|---------|-------------|
| M3N-A2C93142300 | **315 MHz** | 3-4 | Lock, Unlock, Panic, (Start) |
| M3N-A2C93142600 | **902 MHz** | 5 | + **Tailgate Release** |

> ⚠️ **Critical Warning:** 315 MHz and 902 MHz keys will NOT work interchangeably! Always verify original key frequency.

---

## FCC ID by Year

| Years | FCC ID Options | Notes |
|-------|----------------|-------|
| 2017+ | M3N-A2C93142300 | 315 MHz, 3-4 button |
| 2018+ | M3N-A2C93142600 | 902 MHz, 5-button with tailgate |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2015-2024 | ID49 | HITAG Pro |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Ford → F-150 → [Year] → Key Programming
3. **Select:** Add Key
4. **Verify frequency** before programming
5. **Follow prompts** and complete registration

**Total Time:** 5-15 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **New key won''t program** | Wrong frequency! Verify 315 vs 902 MHz |
| **Tailgate doesn''t work** | Need 902 MHz key (5-button) |
| **Only 3 buttons work** | Normal for 315 MHz version |
| **Key not detected** | Replace CR2450 battery |

---

## Pro Tips from the Field

- ⚡ **Count buttons first:** 5 = 902 MHz, 3-4 = 315 MHz
- 🔋 **CR2450 battery:** Larger than typical CR2032
- 📡 **No mixing:** Frequencies are NOT compatible
- 🔧 **High profit:** F-150 keys are premium priced

---

## Key Information

- **Blade:** H75, FO24
- **Lishi:** FO38 2-in-1
- **Battery:** CR2450

---

*Last Updated: December 2025*
'
WHERE make = 'Ford' AND model = 'F-150';
