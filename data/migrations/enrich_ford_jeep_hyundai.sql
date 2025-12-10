-- Enriched Ford, Jeep, Hyundai Guides with Year-Specific FCC ID Data

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD F-150 (2015-2024) - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🛻 Ford F-150 Master Guide (2015-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Ford F-150 uses TWO different frequencies - 315 MHz and 902 MHz. The 902 MHz keys have tailgate release button and are NOT interchangeable with 315 MHz keys!

> **⚠️ Critical:** Match BOTH FCC ID AND frequency. 315 MHz and 902 MHz keys will NOT work interchangeably!

---

## 🔐 Transponder Chip

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2015-2024 | ID49 | HITAG Pro |

---

## 📡 Smart Key FCC IDs by Frequency

| FCC ID | Frequency | Buttons | Features |
|--------|-----------|---------|----------|
| M3N-A2C93142300 | 315 MHz | 3-4 | Lock, Unlock, Panic, (Remote Start) |
| M3N-A2C93142600 | 902 MHz | 5 | Lock, Unlock, Panic, Remote Start, **Tailgate** |

---

## 📡 FCC ID by Model Year

| Years | FCC ID Options | Notes |
|-------|----------------|-------|
| 2017+ | M3N-A2C93142300 | 315 MHz, 3-4 button |
| 2018+ | M3N-A2C93142600 | 902 MHz, 5-button with tailgate |

---

## 🔧 Key Information

- **Blade:** H75, FO24
- **Lishi:** FO38 2-in-1
- **Battery:** CR2450
- **Frequencies:** 315 MHz OR 902 MHz

---

## ⚙️ Programming Notes

- Check original key for frequency before ordering
- 5-button = 902 MHz (tailgate release)
- 3-4 button = usually 315 MHz

---

## 📚 Sources

- locksmithkeyless.com
- key4.com
- zippylocks.com
- bestkeysolution.com
'
WHERE make = 'Ford' AND model = 'F-150';

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP GRAND CHEROKEE (2014-2024) - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🚙 Jeep Grand Cherokee Master Guide (2014-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Jeep Grand Cherokee uses M3N-40821302 (most common) or GQ4-54T. The M3N version comes in 4 and 5-button variants.

> **💡 Pro Tip:** M3N-40821302 is more versatile - available in 4 and 5-button. GQ4-54T is primarily 4-button.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2014-2016 | ID46 | PCF7953, PCF7945A |
| 2017-2024 | ID4A | HITAG AES (PCF7953M) |

---

## 📡 FCC ID Comparison

| FCC ID | Buttons | Features | Years |
|--------|---------|----------|-------|
| M3N-40821302 | 4 | Lock, Unlock, Remote Start, Panic | 2014-2022 |
| M3N-40821302 | 5 | + Power Liftgate | 2014-2022 |
| GQ4-54T | 4 | Lock, Unlock, Remote Start, Panic | 2014-2022 |

---

## 📡 M3N-40821302 vs GQ4-54T

| Feature | M3N-40821302 | GQ4-54T |
|---------|--------------|---------|
| Button Options | 4, 5 | 4 only |
| Power Liftgate | Yes (5-btn) | No |
| Chip | PCF7953/PCF7945A | PCF7953M (HITAG AES) |
| Frequency | 433 MHz | 433 MHz |

---

## 🔧 Key Information

- **Blade:** Y159, Y164
- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433/434 MHz

---

## ⚙️ Programming Notes

- Professional programming required
- Both FCC IDs require Autel, VVDI, or dealer tools
- Match button count to original key

---

## 📚 Sources

- locksmithkeyless.com
- northcoastkeyless.com
- key4.com
- remotesandkeys.com
'
WHERE make = 'Jeep' AND model = 'Grand Cherokee';

-- ═══════════════════════════════════════════════════════════════════════════
-- HYUNDAI TUCSON (2016-2024) - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🚙 Hyundai Tucson Master Guide (2016-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Hyundai Tucson switched FCC IDs around 2018. TQ8-FOB-4F07 for 2016-2018, TQ8-FOB-4F11 for 2018-2021. There is overlap in 2018.

> **💡 Pro Tip:** 2018 Tucson may use either FCC ID - verify with VIN or existing key.

---

## 🔐 Transponder Chip

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2016-2024 | ID47 | HITAG 3 |

---

## 📡 FCC IDs by Year

| Years | FCC ID | Part Number | Notes |
|-------|--------|-------------|-------|
| 2016-2018 | TQ8-FOB-4F07 | 95440-D3100 | Original Tucson III |
| 2018-2021 | TQ8-FOB-4F11 | 95440-D3510 | Updated key |
| 2022-2024 | TQ8-FOB-4F35 | (Verify) | 4th gen Tucson |

---

## 🔧 Key Information

- **Blade:** HY15, HY20
- **Lishi:** HY22 2-in-1
- **Battery:** CR2032
- **Frequency:** 433/434 MHz
- **Buttons:** 4 (Lock, Unlock, Hatch, Panic)

---

## ⚙️ Programming Notes

- Professional programming required
- No DIY onboard programming
- All keys must be present when adding new key
- Smart key for push-button start vehicles

---

## 📚 Sources

- locksmithkeyless.com
- northcoastkeyless.com
- abkeys.com
- yourcarkeyguys.com
'
WHERE make = 'Hyundai' AND model = 'Tucson';
