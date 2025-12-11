-- Integrate Ford Reference Document - Part 1
-- F-150, Explorer, Escape

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD F-150 - America's Best Selling Truck
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Ford F-150 1997-2024 Master Programming Guide
## 2021+ RH850 BCM Warning

---

## Overview

The F-150 spans multiple PATS generations. **2021+ models use the RH850 BCM** which requires bench programming for All Keys Lost (AKL).

> ⚠️ **Critical Warning (2021+):** AKL requires **removing the BCM** and reading D-flash on bench with XP400 Pro + APB131 adapter. OBD programming alone will fail!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Essential for 2015+ |
| **XP400 Pro + APB131** | **REQUIRED** for 2021+ AKL (RH850) |
| **Lishi HU101 / FO38** | See generation breakdown |
| **Battery Maintainer** | Critical for 2015+ programming |

---

## Generation Breakdown

### Gen 10-11 (1997-2008) - Legacy PATS
| Spec | Value |
|------|-------|
| Keyway | **FO38 / H75** (8-cut) |
| Chip | ID13 (early) → ID63 (40/80 bit) |
| System | PATS II / CAN |
| AKL | 10-min wait or coded access |

### Gen 12 (2009-2014) - Standard CAN
| Spec | Value |
|------|-------|
| Keyway | **HU101** (High Security) |
| Chip | ID63 (80-bit) |
| Remote | Integrated Remote Head (OUC6000022) |

### Gen 13 (2015-2020) - Smart Key Era
| Spec | Value |
|------|-------|
| Keyway | HU101 |
| Smart Key | **902 MHz** (M3N-A2C31243300) or **315 MHz** |
| Chip | ID49 (HITAG Pro) |
| Backup Slot | Center console cupholder area (under rubber mat) |

> 💡 **Pearl:** 2015-2017 often uses 902 MHz. 2018+ often uses 315 MHz. **ALWAYS verify FCC ID!**

### Gen 14 (2021-2024) - RH850 BCM
| Spec | Value |
|------|-------|
| System | **RH850 Processor** (R7F701573) |
| AKL | **Bench Read Required** (D-flash) |
| Add Key | OBD possible with 2 working keys |
| Frequency | 315 MHz / 434 MHz (2024+) |

---

## 2021+ AKL Procedure (RH850)

1. **Locate BCM:** Passenger side footwell, under instrument panel.
2. **Remove BCM:** Physically remove from vehicle.
3. **Connect:** XP400 Pro with **APB131 adapter**.
4. **Read Data:** `Ford → F-150 → 2021-2023 → Smart Key → Keyless System (CAN) → Read Dflash`
5. **Reinstall:** Put BCM back in vehicle.
6. **Program:** Use loaded D-flash data to program keys via OBD.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2021+ AKL fails OBD | Must remove BCM and read on bench! |
| Wrong Frequency | 315 vs 902 MHz - check FCC ID |
| 2024+ F-150 | Cannot self-program. Dealer/NASTF required. |
| Key won''t turn | Check door lock for code - HU101 is 10-cut |

---

## Pro Tips from the Field

- ⚡ **Backup Slot:** Under rubber mat in front cupholder (2015+)
- 📋 **NASTF:** May be required for 2015+ parameter reset
- 🔧 **Lishi:** FO38 (pre-2009) vs HU101 (2009+)
- 🔋 **Voltage:** Keep >12.2V or programming will fail

---

## Key Information

- **Blade:** HU101 (2009+), FO38 (1997-2008)
- **Lishi:** HU101 V3, FO38
- **Battery:** CR2450 (Smart), CR2032 (Remote)

---

*Last Updated: December 2025*
'
WHERE make = 'Ford' AND model = 'F-150';

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD EXPLORER - The Family Hauler
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Ford Explorer 1998-2024 Master Programming Guide
## Platform Evolution & Frequency Changes

---

## Overview

The Explorer has seen major platform shifts. 2011+ moved to unibody (HU101), 2020+ returned to RWD-based platform.

> ⚠️ **Frequency Warning:** 2024+ Explorer switched to **434 MHz**. Previous years used 315/902 MHz. Verify FCC ID!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU101 / FO38** | See generation breakdown |
| **Smart Keys** | Stock 315, 902, and 434 MHz |

---

## Generation Breakdown

### Gen 2-4 (1998-2010) - Legacy
| Spec | Value |
|------|-------|
| Keyway | **FO38 / H75** |
| Chip | ID63 (80-bit common 2002+) |
| System | Standard PATS |

### Gen 5 (2011-2019) - Unibody
| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Smart Key | M3N5WY8609 (315 MHz) / M3N-A2C31243300 (902 MHz) |
| Backup Slot | Center console armrest box |

### Gen 6 (2020-2024) - CD6 Platform
| Spec | Value |
|------|-------|
| Keyway | HU101 |
| Smart Key | M3N-A2C931426 (902 MHz) |
| 2024+ | **434 MHz** (New Frequency!) |
| Chip | ID49 / HITAG Pro |

---

## Backup Slot Locations

- **2011-2015:** Center console, front or rear cupholder
- **2016-2019:** Center console storage bin (bottom)
- **2020+:** Center console storage bin (bottom)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2024+ won''t program | Check frequency - likely 434 MHz |
| 902 MHz keys | Common on 2016-2017 Platinum trims |
| AKL Alarm Active | Wait 10 mins or use active alarm bypass |

---

## Pro Tips from the Field

- ⚡ **Frequency Check:** 2016-2017 can be 315 or 902 MHz
- 📋 **2020+ Redesign:** Completely new system
- 🔧 **Door Keypad:** Factory code often on BCM label (driver footwell)

---

## Key Information

- **Blade:** HU101 (2011+), FO38 (1998-2010)
- **Lishi:** HU101 V3, FO38
- **Battery:** CR2450 (Smart), CR2032 (Remote)

---

*Last Updated: December 2025*
'
WHERE make = 'Ford' AND model = 'Explorer';

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD ESCAPE - Compact SUV
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Ford Escape 2001-2024 Master Programming Guide
## High Volume, Multiple Systems

---

## Overview

The Escape is a high-volume vehicle for locksmiths. Major transition in 2013 to HU101 and 2020 to new platform.

> 💡 **Pearl:** 2013-2019 Escape uses **HU101** but 2001-2012 uses **FO38**. Don''t bring the wrong Lishi!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Full support |
| **Lishi HU101 / FO38** | Verify year! |

---

## Generation Breakdown

### Gen 1-2 (2001-2012)
| Spec | Value |
|------|-------|
| Keyway | **FO38 / H75** |
| Chip | ID63 (80-bit) |
| Remote | OUC6000022 (Remote Head) |

### Gen 3 (2013-2019)
| Spec | Value |
|------|-------|
| Keyway | **HU101** |
| Smart Key | M3N5WY8609 (315 MHz) |
| Backup Slot | Steering column (keyed) or Console (smart) |

### Gen 4 (2020-2024)
| Spec | Value |
|------|-------|
| Keyway | HU101 |
| Smart Key | M3N-A2C931426 (902 MHz) |
| Chip | ID49 / HITAG Pro |
| Backup Slot | Center console armrest |

---

## Backup Slot Locations

- **2013-2019:** Steering column (hold key against marked area) or center console
- **2020+:** Center console storage bin (bottom)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Key won''t turn (2013) | Ignition housing failure common |
| Remote head separation | Shells break often - stock replacements |
| 2020+ AKL | Requires active alarm bypass or wait |

---

## Pro Tips from the Field

- ⚡ **Ignition Issues:** 2008-2012 ignitions fail often
- 📋 **Titanium Trim:** Usually smart key, SE/SEL often keyed
- 🔧 **Hybrid:** 12V battery location varies (trunk floor)

---

## Key Information

- **Blade:** HU101 (2013+), FO38 (2001-2012)
- **Lishi:** HU101 V3, FO38
- **Battery:** CR2450 (Smart), CR2032 (Remote)

---

*Last Updated: December 2025*
'
WHERE make = 'Ford' AND model = 'Escape';
