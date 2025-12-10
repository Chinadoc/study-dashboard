-- Standardize more Honda, Toyota, Nissan guides to Odyssey format

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA PILOT - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Pilot 2003-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Pilot uses a **proximity key fob (smart key)** with push-button start on Touring and Elite trims (2016+). Lower trims use traditional remote head keys.

> 💡 **Pearl:** 2016+ Pilot Touring/Elite uses same KR5V2X fob as Civic and CR-V! If you stock those keys, you''re covered for Pilot too.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | KR5V2X for 2016+ PTS |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2003-2015 | Various | Remote Head Key | Blade ignition |
| 2016-2024 | KR5V2X | Smart Key | Touring/Elite only |
| 2016-2024 | MLBHLIK6-1TA | Remote Head | LX/EX trims |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2003-2015 | ID46 | PCF7936 |
| 2016-2024 | ID47 | HITAG 3 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Honda → Pilot → [Year] → Immobilizer
3. **Select:** Add/Delete Keys → Add One Key
4. **Follow prompts:** Ignition cycling sequence
5. **Verify:** Start engine and test remote

**Total Time:** 5-10 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Trim level matters** | Verify if PTS (smart key) or blade ignition |
| **Same key as Civic/CR-V** | KR5V2X works across multiple Honda models |
| **LX/EX vs Touring** | Different key types - verify before ordering |

---

## Pro Tips from the Field

- ⚡ **Trim matters:** Only Touring/Elite get smart keys
- 📋 **Cross-compatible:** KR5V2X = Civic, CR-V, Pilot
- 🔧 **Family vehicle:** Popular 3-row SUV, common job

---

## Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Honda' AND model = 'Pilot';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA FIT - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda Fit 2007-2020 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda Fit uses both traditional remote head keys and **smart keys** (2015+ EX/EX-L). Known for being an economical subcompact, key programming is straightforward.

> 💡 **Pearl:** 2015+ Fit EX uses KR5V1X - different from Civic''s KR5V2X! Don''t confuse them. The "1" vs "2" matters.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **New Programmable Key** | See FCC ID table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2007-2014 | MLBHLIK-1T | Remote Head Key | Blade ignition |
| 2015-2020 | KR5V1X | Smart Key | EX/EX-L only |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2007-2020 | ID47 (HITAG 3) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Honda → Fit → [Year]
3. **Select:** Immobilizer → Add Key
4. **Follow prompts** for ignition cycling
5. **Verify** all functions

**Total Time:** 5-10 minutes

---

## Pro Tips from the Field

- ⚡ **KR5V1X ≠ KR5V2X:** Don''t confuse Fit keys with Civic
- 📋 **Trim matters:** Smart key only on EX/EX-L
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
-- HONDA HR-V - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Honda HR-V 2016-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Honda HR-V (crossover SUV) uses a **proximity key fob (smart key)** with push-button start on EX and higher trims.

> 💡 **Pearl:** 2016-2022 HR-V uses KR5V1X (same as Fit), NOT KR5V2X! The 2023+ second-gen HR-V switched to a different key.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **New Programmable Proximity Fob** | KR5V1X (2016-22) |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2016-2022 | KR5V1X | Smart Key | 1st gen |
| 2023-2024 | KR5TP-4 | Smart Key | 2nd gen (new) |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2016-2024 | ID47 (HITAG 3) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Honda → HR-V → [Year]
3. **Select:** Immobilizer → Add Key
4. **Follow prompts**
5. **Verify** start and remote functions

**Total Time:** 5-10 minutes

---

## Pro Tips from the Field

- ⚡ **Same as Fit:** 2016-22 HR-V uses KR5V1X like Fit
- 📋 **2023 change:** New generation = new key type
- 🔧 **Popular crossover:** Growing segment, common job

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
-- TOYOTA COROLLA - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Toyota Corolla 2008-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Toyota Corolla uses both traditional transponder keys and **smart keys** (2014+ on higher trims). This is the best-selling car in the world, making Corolla key programming extremely common.

> 💡 **Pearl:** 2019+ Corolla uses HYQ14FBN with a different board than Camry''s HYQ14FBC. Requires specialized tools (Lonsdor K518, VVDI) - NOT standard TechStream programming!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **Lonsdor K518 / VVDI** | For 2019+ smart keys |
| **Toyota Techstream** | For some procedures |
| **New Programmable Key** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Generation

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2014-2018 | HYQ14FBA | Smart Key | G-chip, H-chip |
| 2019-2024 | HYQ14FBN | Smart Key | Special programming! |
| 2008-2018 | HYQ12BDM | Remote Head | Blade ignition |

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2008-2013 | ID67 | DST |
| 2014-2018 | ID72/ID8A | G/H-chip |
| 2019-2024 | ID8A | H-chip |

> ⚠️ **Warning:** 2019+ Corolla smart keys require Lonsdor K518, VVDI, or Tango - NOT standard Techstream!

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Toyota → Corolla → [Year]
3. **Select:** Smart Key → Add Key
4. **Follow prompts**
5. **Verify** all functions

**Total Time:** 10-15 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **2019+ won''t program** | Requires specialized tools, not Techstream |
| **HYQ14FBN not working** | Verify board number 231451-2000 |
| **G vs H chip** | 2015 = transition year |

---

## Pro Tips from the Field

- ⚡ **Best-selling car:** Very common job, stock keys
- 📋 **2019+ special:** Different tools required than Camry
- 🔧 **High volume:** Worth mastering Corolla programming

---

## Key Information

- **Blade:** TOY43, TOY48
- **Lishi:** TOY43 2-in-1, TOY48 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Toyota' AND model = 'Corolla';

-- ═══════════════════════════════════════════════════════════════════════════
-- NISSAN ALTIMA - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Nissan Altima 2013-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Nissan Altima uses Nissan''s **Intelligent Key** system with push-button start. All Altimas 2013+ come standard with smart key.

> 💡 **Pearl:** Nissan smart keys are relatively easy to program - the IM608 handles them well. Main FCC ID is KR5S180144014 for most 2013+ models.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | See FCC table |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year

| Years | FCC ID | Buttons | Notes |
|-------|--------|---------|-------|
| 2013-2015 | KR5S180144014 | 4 | Standard Intelligent Key |
| 2016-2018 | KR5S180144014 | 4 | Same FCC ID |
| 2019-2024 | KR5TXN4 | 4-5 | Updated key |

---

## Transponder

| Years | Chip Type |
|-------|-----------|
| 2013-2024 | ID46 / ID47 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Nissan → Altima → [Year]
3. **Select:** Intelligent Key → Add Key
4. **Follow prompts:** Place key inside vehicle
5. **Verify** start and remote functions

**Total Time:** 5-10 minutes

---

## Pro Tips from the Field

- ⚡ **Consistent FCC:** Same key for many years
- 📋 **Easy programming:** IM608 handles Nissan well
- 🔧 **All standard:** Smart key across all trims

---

## Key Information

- **Blade:** NSN14, NSN11
- **Lishi:** NSN14 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

*Last Updated: December 2025*
'
WHERE make = 'Nissan' AND model = 'Altima';

-- ═══════════════════════════════════════════════════════════════════════════
-- NISSAN ROGUE - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Nissan Rogue 2014-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Nissan Rogue (compact SUV) uses Nissan''s **Intelligent Key** system. This is one of Nissan''s best-selling vehicles, making Rogue key programming a common job.

> 💡 **Pearl:** 2021+ Rogue switched to a new platform with different key. Always verify year before ordering - 2020 vs 2021 = different keys!

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
| 2014-2020 | KR5S180144106 | 1st/2nd gen Rogue |
| 2021-2024 | KR5TXN7 | 3rd gen Rogue |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Nissan → Rogue → [Year]
3. **Select:** Intelligent Key → Add Key
4. **Follow prompts**
5. **Verify** all functions

**Total Time:** 5-10 minutes

---

## Pro Tips from the Field

- ⚡ **2021 = new gen:** Different key than 2020
- 📋 **Top seller:** Very common job
- 🔧 **Stock both:** Keep old and new gen keys

---

## Key Information

- **Blade:** NSN14
- **Lishi:** NSN14 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Nissan' AND model = 'Rogue';
