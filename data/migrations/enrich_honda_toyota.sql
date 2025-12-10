-- Enriched Honda and Toyota Guides with Year-Specific FCC ID Data
-- More granular FCC ID tables by year range

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA ACCORD (1998-2024) - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🚗 Honda Accord Master Guide (1998-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Honda Accord has evolved through multiple generations with different key systems. This guide covers year-specific FCC IDs for accurate key replacement.

> **💡 Pro Tip:** 2018+ Accords use an entirely different FCC ID (CWTWB1G0090) than earlier models. Always verify year before ordering.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 1998-2002 | ID13 | Fixed Code | Glass wedge chip |
| 2003-2012 | ID46 | PCF7936AS | Philips Crypto 2 |
| 2013-2017 | ID47 | HITAG 3 | G-chip, 128-bit AES |
| 2018-2024 | ID47 | HITAG 3 | Updated immobilizer |

---

## 📡 Push-to-Start FCC IDs by Year

| Years | FCC ID | Frequency | Buttons | Part Numbers |
|-------|--------|-----------|---------|--------------|
| 2013-2015 | ACJ932HK1210A | 314 MHz | 4 | 72147-T2A-A11, 72147-T2A-A01 |
| 2014-2015 Hybrid | ACJ932HK1210A | 314 MHz | 4 | 72147-T3W-A01 |
| 2016-2017 | ACJ932HK1310A | 433 MHz | 4 | (Verify with VIN) |
| 2018-2024 | CWTWB1G0090 | 433 MHz | 5 | 72147-TWA-A01 (with remote start) |

---

## 📡 Non-Push-to-Start FCC IDs

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2013-2017 (LX) | MLBHLIK6-1T | Remote Head Key | Regular key ignition |
| 2016-2017 | MLBHLIK6-1TA | Remote Head Key | Flip key variant |

---

## 🔧 Key Information

- **Blade:** HON66 (older), MIT11R (newer emergency)
- **Lishi:** HON66 2-in-1, MIT11R 2-in-1
- **Battery:** CR2032
- **Frequencies:** 314 MHz (2013-15), 433 MHz (2016+)

---

## ⚙️ Programming Notes

- **2013-2017:** Requires Autel, VVDI, or Honda HDS
- **2018+:** 5-button key includes remote start
- **All keys lost:** Available for all years with advanced tools

---

## 📚 Sources

- locksmithkeyless.com
- yourcarkeyguys.com
- bestkeysolution.com
- mk3.com
'
WHERE id = 'honda-accord-1998-2024';

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CIVIC (2012-2024) - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🚗 Honda Civic Master Guide (2012-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Honda Civic has used consistent FCC ID (KR5V2X) for push-to-start from 2016-2021, with the 2022+ generation switching to KR5TP-4.

> **💡 Pro Tip:** 2016-2021 Civic PTS all use KR5V2X - verify 4-button vs 5-button (remote start).

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 2012-2015 | ID46 | PCF7936AS | 9th gen |
| 2016-2021 | ID47 | HITAG 3 | 10th gen |
| 2022-2024 | ID47 | HITAG 3 | 11th gen, new key style |

---

## 📡 Push-to-Start FCC IDs by Year

| Years | FCC ID | Frequency | Buttons | Part Numbers |
|-------|--------|-----------|---------|--------------|
| 2016-2021 | KR5V2X | 433 MHz | 4 | 72147-TBA-A11, 72147-TBA-A12 |
| 2016-2021 | KR5V2X | 433 MHz | 5 | 72147-TBA-A01 (with remote start) |
| 2022-2024 | KR5TP-4 | 433 MHz | 4-5 | New generation |

---

## 📡 Non-Push-to-Start FCC IDs

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2012-2015 | MLBHLIK6-1T | Remote Head Key | 9th gen flip key |
| 2016-2021 | MLBHLIK6-1TA | Remote Head Key | 10th gen regular key |

---

## 🔧 Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032
- **Frequency:** 433-434 MHz

---

## ⚙️ Programming Notes

- **2016-2021:** Same FCC ID across all years
- **4-button:** Lock, Unlock, Trunk, Panic
- **5-button:** Adds remote start function

---

## 📚 Sources

- locksmithkeyless.com
- northcoastkeyless.com
- cronolock.ca
'
WHERE id = 'honda-civic-2012-2015';

-- Also update/insert for Civic 2016-2024 separately if needed
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'honda-civic-2016-2024',
  'Honda',
  'Civic',
  2016,
  2024,
  '# 🚗 Honda Civic Master Guide (2016-2024)
## Smart Key Programming Reference

---

## 📋 Overview

10th and 11th generation Civic with consistent KR5V2X FCC ID until 2022.

---

## 📡 FCC IDs by Year

| Years | FCC ID | Buttons | Notes |
|-------|--------|---------|-------|
| 2016-2021 | KR5V2X | 4 | Standard (no remote start) |
| 2016-2021 | KR5V2X | 5 | EX/Touring (with remote start) |
| 2022-2024 | KR5TP-4 | 4-5 | 11th generation |

---

## 🔐 Transponder

| Years | Chip Type |
|-------|-----------|
| 2016-2024 | ID47 (HITAG 3) |

---

## 🔧 Key Information

- **Lishi:** HON66, MIT11R
- **Battery:** CR2032
- **Frequency:** 433 MHz

---

## 📚 Sources

- locksmithkeyless.com
- abkeys.com
',
  '{"sources": ["locksmithkeyless.com", "abkeys.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA CAMRY - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🚗 Toyota Camry Master Guide (2007-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Toyota Camry uses different FCC IDs across generations. Key mid-generation change in 2015 (G-chip to H-chip) and 2018 (new body style).

> **💡 Pro Tip:** 2015 Camrys vary by production half - early 2015 uses G-chip, late 2015 uses H-chip.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 2007-2011 | ID67 | DST | 4D-67 chip |
| 2012-2014 | ID72 (G) | DST-AES | "G-chip" |
| 2015 Early | ID72 (G) | DST-AES | Jan-Jun 2015 |
| 2015 Late-2017 | ID8A (H) | DST-AES 128 | Jul 2015+ |
| 2018-2024 | ID8A (H) | DST-AES 128 | 8th generation |

---

## 📡 Smart Key FCC IDs by Generation

| Years | FCC ID | Frequency | Board | Part Numbers |
|-------|--------|-----------|-------|--------------|
| 2012-2017 | HYQ14FBA | 315 MHz | G Board | 89904-06140 |
| 2018-2023 | HYQ14FBC | 315 MHz | 231451-0351 | 89904-06220, 89904-06240 |
| 2018-2023 | HYQ14FLA | 315 MHz | - | Alternate FCC ID |

---

## 📡 Remote Head Key FCC IDs

| Years | FCC ID | Chip | Notes |
|-------|--------|------|-------|
| 2012-2014 | HYQ12BDM | G-chip | Flip key |
| 2015 | HYQ12BDM | G or H | Verify production date |
| 2018-2021 | HYQ12BFB | H-chip | Non-PTS flip key |

---

## 🔧 Key Information

- **Blade:** TOY43, TOY48
- **Lishi:** TOY43 2-in-1, TOY48 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## ⚙️ Programming Notes

- **2015 critical:** Check production date for G vs H chip
- **HYQ14FBA vs HYQ14FBC:** Not interchangeable
- **All keys lost:** Available with Toyota Techstream or aftermarket tools

---

## 📚 Sources

- locksmithkeyless.com
- remotesandkeys.com
- carandtruckremotes.com
'
WHERE make = 'Toyota' AND model = 'Camry';
