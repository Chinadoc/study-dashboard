-- Standardize Jeep and Hyundai guides to Odyssey format

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP GRAND CHEROKEE - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Jeep Grand Cherokee 2014-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Jeep Grand Cherokee uses a **proximity key fob (smart key)** with push-button start and keyless entry across all trims. Two FCC IDs are commonly found: M3N-40821302 (most common) and GQ4-54T.

> 💡 **Pearl:** M3N-40821302 comes in 4 and 5-button versions. The 5-button includes power liftgate. GQ4-54T is 4-button only. Always match button count to original!

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | Match FCC ID and button count |
| **CR2032 Battery** | Replace before programming |

---

## FCC ID Comparison

| FCC ID | Buttons | Power Liftgate | Years |
|--------|---------|----------------|-------|
| M3N-40821302 | 4 | No | 2014-2022 |
| M3N-40821302 | 5 | **Yes** | 2014-2022 |
| GQ4-54T | 4 | No | 2014-2022 |

---

## Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2014-2016 | ID46 | PCF7953, PCF7945A |
| 2017-2024 | ID4A | HITAG AES (PCF7953M) |

> ⚠️ **Note:** 2017+ uses HITAG AES - requires updated tools with AES support.

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Chrysler/Jeep → Grand Cherokee → [Year]
3. **Select:** Proxi → Key Learning → Add Key
4. **Follow prompts:** Place new fob on start button
5. **Complete registration** and test all functions

**Total Time:** 5-10 minutes

---

## Procedure: All Keys Lost

1. Navigate to Grand Cherokee → Proxi → All Keys Lost
2. IM608 reads PIN code
3. Generate new key with XP400 Pro
4. Complete registration

**Total Time:** 20-30 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Wrong button count** | Verify 4 vs 5-button before ordering |
| **Power liftgate not working** | Need 5-button M3N-40821302 |
| **2017+ won''t program** | Verify tool supports HITAG AES |
| **GQ4-54T vs M3N** | Both work, match original |

---

## Pro Tips from the Field

- ⚡ **5-button = liftgate:** Power liftgate only on 5-button
- 📋 **Both FCC IDs work:** M3N and GQ4 both compatible
- 🔧 **Chip change in 2017:** HITAG AES requires updated tools
- 💰 **Premium pricing:** Jeep owners expect higher prices

---

## Key Information

- **Blade:** Y159, Y164
- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433/434 MHz

---

*Last Updated: December 2025*
'
WHERE make = 'Jeep' AND model = 'Grand Cherokee';

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI TUCSON - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Hyundai Tucson 2016-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Hyundai Tucson uses a **proximity key fob (smart key)** with push-button start on most trims from 2016+. FCC ID changed from TQ8-FOB-4F07 to TQ8-FOB-4F11 around 2018, with overlap during that model year.

> 💡 **Pearl:** 2018 Tucson can have EITHER FCC ID! Always check the original key or verify by VIN before ordering. Ask customer to read FCC label on back of existing fob.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | Match FCC ID to year |
| **CR2032 Battery** | Replace before programming |

---

## FCC IDs by Year (Critical!)

| Years | FCC ID | Part Number | Notes |
|-------|--------|-------------|-------|
| 2016-2018 | TQ8-FOB-4F07 | 95440-D3100 | 3rd gen Tucson |
| 2018-2021 | TQ8-FOB-4F11 | 95440-D3510 | Updated key |
| 2022-2024 | TQ8-FOB-4F35 | Verify | 4th gen Tucson |

> ⚠️ **Warning:** 2018 = overlap year! Can have either FCC ID.

---

## Transponder

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2016-2024 | ID47 | HITAG 3 |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Hyundai → Tucson → [Year]
3. **Select:** Smart Key → Add Key
4. **Follow prompts:** Have all existing keys present
5. **Complete registration** and test

**Total Time:** 10-15 minutes

---

## Procedure: All Keys Lost

1. Navigate to Tucson → Smart Key → All Keys Lost
2. IM608 reads immobilizer data
3. Generate key with XP400 Pro
4. Complete registration

**Note:** No DIY onboard programming available for Hyundai smart keys.

**Total Time:** 20-30 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **2018 FCC mismatch** | Verify with VIN or existing key |
| **Key not detected** | Replace CR2032, hold near start button |
| **All keys must be present** | Hyundai requires all keys during programming |
| **No onboard programming** | Professional tools required |

---

## Pro Tips from the Field

- ⚡ **2018 = transition year:** Ask customer for FCC ID from existing key
- 📋 **All keys present:** Hyundai requires all keys during add-key
- 🔧 **No DIY:** Can''t do onboard programming like some Hondas
- 💰 **Growing market:** Tucson very popular, stock these keys

---

## Key Information

- **Blade:** HY15, HY20
- **Lishi:** HY22 2-in-1
- **Battery:** CR2032
- **Frequency:** 433/434 MHz
- **Buttons:** 4 (Lock, Unlock, Hatch, Panic)

---

*Last Updated: December 2025*
'
WHERE make = 'Hyundai' AND model = 'Tucson';

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE CHARGER - Odyssey-style format
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# Dodge Charger 2011-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Dodge Charger uses a **proximity key fob (smart key)** with push-button start. The primary FCC ID is M3N-40821302 (same as Jeep Grand Cherokee and Dodge Challenger).

> 💡 **Pearl:** Charger, Challenger, and Jeep Grand Cherokee all share the same FCC ID (M3N-40821302)! Great for stocking one key type that works across multiple popular vehicles.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Ensure firmware is updated |
| **XP400 Pro Key Programmer** | For all-keys-lost |
| **New Programmable Proximity Fob** | M3N-40821302 |
| **CR2032 Battery** | Replace before programming |

---

## FCC ID

| Years | FCC ID | Buttons | Frequency |
|-------|--------|---------|-----------|
| 2011-2024 | M3N-40821302 | 4-5 | 433 MHz |

---

## Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2011-2016 | ID46 | PCF7941, PCF7945 |
| 2017-2024 | ID4A | HITAG AES (PCF7953M) |

---

## Procedure: Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Chrysler/Dodge → Charger → [Year]
3. **Select:** Proxi → Key Learning
4. **Follow prompts:** Place new fob on start button
5. **Complete and test**

**Total Time:** 5-10 minutes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **2017+ won''t program** | Verify tool supports HITAG AES |
| **Same FCC as Jeep** | Yes, M3N-40821302 works for both |
| **Remote start not working** | May need separate remote learning |

---

## Pro Tips from the Field

- ⚡ **Cross-compatible:** Same key as Challenger and Grand Cherokee
- 📋 **2017 chip change:** ID46 → ID4A (HITAG AES)
- 🔧 **Stock one key:** Works for Charger, Challenger, Grand Cherokee

---

## Key Information

- **Blade:** CY24
- **Lishi:** CY24 2-in-1
- **Battery:** CR2032

---

*Last Updated: December 2025*
'
WHERE make = 'Dodge' AND model = 'Charger';
