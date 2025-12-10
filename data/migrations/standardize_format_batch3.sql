-- Standardize Ford Escape, Explorer, Subaru Outback/Forester, VW Jetta/Tiguan

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD ESCAPE - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Ford Escape 2008-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Ford Escape uses both traditional transponder keys and **smart keys** with push-button start (2017+ Titanium). Popular compact SUV, common programming job.

> 💡 **Pearl:** 2020+ Escape is completely redesigned with new key system. Don''t assume 2019 keys work on 2020!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **New Programmable Key/Fob** | See FCC table |
| **CR2032/CR2450 Battery** | Varies by year |

---

## FCC IDs by Generation

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2017-2019 | M3N-A2C93142300 | Smart Key | 315 MHz |
| 2020-2024 | M3N-A2C931426 | Smart Key | New platform |
| 2008-2019 | OUCD6000022 | Remote Head | Blade ignition |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2008-2019 | ID63 |
| 2020-2024 | ID49 (HITAG Pro) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Ford → Escape → [Year]
3. **Select:** Key Programming → Add Key
4. **Follow prompts**
5. **Verify** all functions

**Total Time:** 5-15 minutes

---

## Pro Tips from the Field

- ⚡ **2020 redesign:** Completely new key
- 📋 **Popular SUV:** Common job, stock keys
- 🔧 **Trim matters:** Only Titanium gets smart key (2017-19)

---

## Key Information

- **Blade:** H75, HU101, H94
- **Lishi:** FO38 2-in-1, HU101
- **Battery:** CR2032/CR2450

---

*Last Updated: December 2025*
'
WHERE make = 'Ford' AND model = 'Escape';

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD EXPLORER - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Ford Explorer 2006-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Ford Explorer uses both traditional keys and **smart keys** (2016+ Platinum). Popular 3-row SUV.

> 💡 **Pearl:** 2020+ Explorer is a completely new platform. Key programming is very different from 2019 and earlier.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **New Programmable Key/Fob** | See FCC table |
| **CR2450 Battery** | For smart keys |

---

## FCC IDs by Generation

| Years | FCC ID | Key Type |
|-------|--------|----------|
| 2016-2019 | M3N-A2C93142300 | Smart Key (315 MHz) |
| 2020-2024 | M3N-A2C931426 | Smart Key |
| 2006-2019 | OUCD6000022 | Remote Head |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2006-2019 | ID63 |
| 2020-2024 | ID49 (HITAG Pro) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Ford → Explorer → [Year]
3. **Select:** Key Programming → Add Key
4. **Follow prompts**
5. **Verify** all functions

**Total Time:** 5-15 minutes

---

## Pro Tips from the Field

- ⚡ **2020 = new platform:** Different key system
- 📋 **3-row SUV:** Popular family vehicle
- 🔧 **RWD platform:** 2020+ changed to RWD-based

---

## Key Information

- **Blade:** H75, HU101
- **Lishi:** FO38, HU101
- **Battery:** CR2450

---

*Last Updated: December 2025*
'
WHERE make = 'Ford' AND model = 'Explorer';

-- ═══════════════════════════════════════════════════════════════════════════
-- SUBARU OUTBACK - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Subaru Outback 2010-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Subaru Outback uses a **proximity key fob (smart key)** with push-button start on most trims (2015+).

> 💡 **Pearl:** Subaru uses same key style across models - Outback, Forester, Crosstrek often share FCC IDs. Stock one type!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **Subaru SSM4** | Alternative for dealer-level access |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Notes |
|-------|--------|-------|
| 2015-2019 | HYQ14AHC | Standard smart key |
| 2020-2024 | HYQ14AHK | 6th gen Outback |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2010-2014 | ID62 |
| 2015-2024 | ID8A (H-chip) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Subaru → Outback → [Year]
3. **Select:** Smart Key → Add Key
4. **Follow prompts**
5. **Verify** start and remote

**Total Time:** 10-15 minutes

---

## Pro Tips from the Field

- ⚡ **Cross-model:** Same keys as Forester/Crosstrek
- 📋 **AWD standard:** All Subarus have AWD
- 🔧 **SSM4 backup:** Have dealer tools ready

---

## Key Information

- **Blade:** DAT17
- **Lishi:** DAT17 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Subaru' AND model = 'Outback';

-- ═══════════════════════════════════════════════════════════════════════════
-- SUBARU FORESTER - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Subaru Forester 2010-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Subaru Forester uses a **proximity key fob (smart key)** with push-button start on most trims (2014+).

> 💡 **Pearl:** Forester uses same keys as Outback and Crosstrek! Great for stocking one key type.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Notes |
|-------|--------|-------|
| 2014-2018 | HYQ14AHC | Smart key |
| 2019-2024 | HYQ14AHK | 5th gen Forester |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2010-2013 | ID62 |
| 2014-2024 | ID8A (H-chip) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Subaru → Forester → [Year]
3. **Select:** Smart Key → Add Key
4. **Follow prompts**
5. **Verify** all functions

**Total Time:** 10-15 minutes

---

## Pro Tips from the Field

- ⚡ **Same as Outback:** Cross-compatible keys
- 📋 **Popular SUV:** Very common vehicle

---

## Key Information

- **Blade:** DAT17
- **Lishi:** DAT17 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Subaru' AND model = 'Forester';

-- ═══════════════════════════════════════════════════════════════════════════
-- VW JETTA - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Volkswagen Jetta 2011-2024 Key Programming Master Guide
## Using Autel IM608 + VAG Software

---

## Overview

The VW Jetta uses VW''s **KESSY** (Keyless Entry Start System) with proximity keys on higher trims.

> 💡 **Pearl:** Jetta 2019+ uses MQB platform with more secure ID88 chip. Older tools may not work - verify MQB support!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | With VAG software update |
| **VAG-COM / ODIS** | Dealer-level alternative |
| **New Programmable Key** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Platform

| Years | FCC ID | Platform | Chip |
|-------|--------|----------|------|
| 2011-2018 | HLO3C0959752AD | PQ25 | ID48 |
| 2019-2024 | 5G6959752L | MQB | ID88 |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2011-2018 | ID48 | Megamos Crypto |
| 2019-2024 | ID88 | MQB48 (AES) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Volkswagen → Jetta → [Year]
3. **Verify platform:** PQ25 or MQB
4. **Select:** Key Adaptation → Add Key
5. **Follow VAG-specific prompts**

**Total Time:** 15-30 minutes

---

## Pro Tips from the Field

- ⚡ **2019+ = MQB:** More secure, needs updated tools
- 📋 **All keys present:** May be required
- 🔧 **VAG complexity:** Charge accordingly

---

## Key Information

- **Blade:** HU66
- **Lishi:** HU66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Volkswagen' AND model = 'Jetta';

-- ═══════════════════════════════════════════════════════════════════════════
-- VW TIGUAN - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Volkswagen Tiguan 2012-2024 Key Programming Master Guide
## Using Autel IM608 + VAG Software

---

## Overview

The VW Tiguan (compact SUV) uses VW''s **KESSY** proximity key system.

> 💡 **Pearl:** 2018+ Tiguan is MQB platform with ID88 chip. Don''t confuse with older Tiguan - completely different key system!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | With VAG software update |
| **VAG-COM / ODIS** | Dealer-level alternative |
| **New Programmable Key** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Platform | Chip |
|-------|--------|----------|------|
| 2012-2017 | HLO3C0959752 | PQ35 | ID48 |
| 2018-2024 | 5G6959752L | MQB | ID88 |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2012-2017 | ID48 |
| 2018-2024 | ID88 (MQB48) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** with VAG software
2. **Navigate:** Volkswagen → Tiguan → [Year]
3. **Verify platform:** PQ35 or MQB
4. **Select:** Key Adaptation
5. **Follow prompts**

**Total Time:** 15-30 minutes

---

## Pro Tips from the Field

- ⚡ **2018 redesign:** New MQB platform
- 📋 **ID48 vs ID88:** Different programming
- 🔧 **VW expertise:** Charge premium for complexity

---

## Key Information

- **Blade:** HU66
- **Lishi:** HU66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Volkswagen' AND model = 'Tiguan';
