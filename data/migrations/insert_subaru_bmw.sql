-- Subaru & BMW Master Guides
-- With proper table formatting and PTS vs non-PTS distinction

-- ═══════════════════════════════════════════════════════════════════════════
-- SUBARU OUTBACK (2010-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'subaru-outback-2010-2024',
  'Subaru',
  'Outback',
  2010,
  2024,
  '# 🚙 Subaru Outback Master Guide (2010-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Subaru Outback uses proximity smart keys with DST80 chips on push-to-start models.

> **💡 Pro Tip:** 2015+ smart keys cannot be DIY programmed - requires dealer or advanced tools.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 2010-2014 | ID62 | Texas Crypto | Remote head key |
| 2015-2019 | 4D+DST80 | Texas Crypto 3 | Smart key standard |
| 2020-2024 | ID8A (H Chip) | 128-bit AES | Latest generation |

---

## 📡 FCC IDs by Start Type

### ⚡ Push-to-Start (Smart Key)

| Years | FCC ID | Frequency | Buttons |
|-------|--------|-----------|---------|
| 2015-2017 | HYQ14AHC | 315 MHz | 4 |
| 2018-2024 | HYQ14AHK | 434 MHz | 4 |

### 🔑 Non-Push-to-Start (Remote Head Key)

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2010-2014 | CWTWB1U811 | 4 |

---

## 🔧 Key Information

- **Blade:** NSN19, DAT17
- **Lishi:** DAT17 2-in-1, NSN19
- **Battery:** CR2032
- **Frequency:** 315 MHz (US), 434 MHz (newer)

---

## ⚙️ Programming

Professional programming required for 2015+ smart keys.

Older models (2010-2014) may allow DIY remote programming.

---

## 📚 Sources

- yourcarkeyguys.com
- planetsubaru.com
- locksmithkeyless.com
',
  '{"sources": ["yourcarkeyguys.com", "planetsubaru.com", "locksmithkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SUBARU FORESTER (2010-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'subaru-forester-2010-2024',
  'Subaru',
  'Forester',
  2010,
  2024,
  '# 🚙 Subaru Forester Master Guide (2010-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Subaru Forester compact SUV with smart key options since 2014.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2010-2013 | ID62 | Texas Crypto |
| 2014-2018 | 4D+DST80 | Texas Crypto 3 |
| 2019-2024 | ID8A (H Chip) | 128-bit AES |

---

## 📡 FCC IDs

### ⚡ Push-to-Start

| Years | FCC ID | Frequency |
|-------|--------|-----------|
| 2016-2018 | HYQ14AHC | 315 MHz |
| 2019-2024 | HYQ14AHK | 434 MHz |

### 🔑 Non-Push-to-Start

| Years | FCC ID |
|-------|--------|
| 2010-2013 | CWTWB1U811 |

---

## 🔧 Key Information

- **Lishi:** DAT17, NSN19
- **Battery:** CR2032
- **Frequency:** 315/434 MHz

---

## 📚 Sources

- yourcarkeyguys.com
- subarusouthtampa.com
',
  '{"sources": ["yourcarkeyguys.com", "subarusouthtampa.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 3-SERIES (2012-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-3-series-2012-2024',
  'BMW',
  '3-Series',
  2012,
  2024,
  '# 🚗 BMW 3-Series Master Guide (2012-2024)
## Smart Key Programming Reference

---

## 📋 Overview

BMW 3-Series (F30/G20) uses advanced CAS/FEM/BDC immobilizer systems.

> **💡 Pro Tip:** BMW keys require module pre-processing. FEM/BDC must be "unlocked" before adding keys.

---

## 🔐 Immobilizer Systems

| Generation | Years | Module | Notes |
|------------|-------|--------|-------|
| F30/F31 | 2012-2018 | CAS4/FEM | F-Platform |
| G20/G21 | 2019-2024 | BDC/BDC3 | G-Platform, highest security |

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2012-2018 | HITAG Pro 49 (PCF7953) | AES |
| 2019-2024 | HITAG Pro 49 | 128-bit AES |

---

## 📡 FCC IDs

| Years | FCC ID | Module |
|-------|--------|--------|
| 2012-2018 | YGOHUF5767 | FEM |
| 2019-2024 | YGOHUF5767 | BDC3 |

---

## 🔧 Key Information

- **Blade:** HU92, HU100R
- **Lishi:** HU92 2-in-1
- **Battery:** CR2450
- **Frequency:** 433 MHz

---

## ⚙️ Programming

### 🔴 Professional Only - Complex Process

1. **Backup vehicle coding** before starting
2. **Pre-process FEM/BDC module** (20+ min via OBD)
3. Add key to available slot
4. Requires: Autel IM608, ACDP, Xtool

### All Keys Lost (AKL)
Requires reading ISN from DME or module removal.

---

## 📚 Sources

- lost-car-keys-replacement.com
- yourcarkeyguys.com
- transponderisland.com
',
  '{"sources": ["lost-car-keys-replacement.com", "yourcarkeyguys.com", "transponderisland.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW X5 (2014-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-x5-2014-2024',
  'BMW',
  'X5',
  2014,
  2024,
  '# 🚙 BMW X5 Master Guide (2014-2024)
## Smart Key Programming Reference

---

## 📋 Overview

BMW X5 (F15/G05) luxury SUV with CAS4/FEM/BDC systems.

---

## 🔐 Immobilizer Systems

| Generation | Years | Module |
|------------|-------|--------|
| F15 | 2014-2018 | CAS4/FEM |
| G05 | 2019-2024 | BDC/BDC3 |

---

## 🔐 Transponder Chip

| Years | Chip Type |
|-------|-----------|
| 2014-2024 | HITAG Pro 49 (PCF7953) |

---

## 📡 FCC IDs

| Years | FCC ID |
|-------|--------|
| 2014-2018 | YGOHUF5662 |
| 2019-2024 | YGOHUF5767 |

---

## 🔧 Key Information

- **Lishi:** HU92 2-in-1
- **Battery:** CR2450
- **Frequency:** 433 MHz

---

## 📚 Sources

- yourcarkeyguys.com
- obdii365.com
',
  '{"sources": ["yourcarkeyguys.com", "obdii365.com"], "generated": "2024-12-10", "method": "web_research"}'
);
