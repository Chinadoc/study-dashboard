-- Enriched CR-V and RAV4 Guides with Year-Specific FCC ID Data

-- ═══════════════════════════════════════════════════════════════════════════
-- HONDA CR-V (2002-2024) - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🚙 Honda CR-V Master Guide (2002-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Honda CR-V has used multiple FCC IDs across generations. Critical change in 2017 when it switched from ACJ932HK1210A to KR5V2X.

> **💡 Pro Tip:** 2017+ CR-V uses KR5V2X (same as Civic). 2015-2016 uses ACJ932HK1210A (like older Accord).

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 2002-2006 | ID13 | Fixed Code | Glass wedge |
| 2007-2014 | ID46 | PCF7936AS | Philips Crypto 2 |
| 2015-2024 | ID47 | HITAG 3 | G-chip, 128-bit AES |

---

## 📡 Push-to-Start FCC IDs by Year

| Years | FCC ID | Frequency | Buttons | Notes |
|-------|--------|-----------|---------|-------|
| 2015-2016 | ACJ932HK1210A | 314 MHz | 4 | EX/Touring trims |
| 2017-2020 | KR5V2X | 433 MHz | 5 | Standard with remote start |
| 2021-2024 | KR5T3X | 433 MHz | 5 | Current generation |

---

## 📡 Non-Push-to-Start FCC IDs

| Years | FCC ID | Key Type | Notes |
|-------|--------|----------|-------|
| 2015-2016 | MLBHLIK6-1T | Remote Head Key | LX trim |
| 2017-2020 | MLBHLIK6-1TA | Remote Head Key | LX/EX-L without PTS |

---

## 🔧 Key Information

- **Blade:** HON66, MIT11R
- **Lishi:** HON66 2-in-1
- **Battery:** CR2032
- **Frequencies:** 314 MHz (2015-16), 433 MHz (2017+)

---

## ⚙️ Programming Notes

- **2017+:** Same FCC ID as Civic (KR5V2X)
- **5-button:** Includes remote start
- **Chip:** ID47 (G-chip) for all push-to-start

---

## 📚 Sources

- northcoastkeyless.com
- carandtruckremotes.com
- key4.com
- mk3.com
'
WHERE make = 'Honda' AND model = 'CR-V';

-- ═══════════════════════════════════════════════════════════════════════════
-- TOYOTA RAV4 (2013-2024) - ENRICHED with year-specific FCC IDs
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE vehicle_guides 
SET content = '# 🚙 Toyota RAV4 Master Guide (2013-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Toyota RAV4 uses different smart key FCC IDs by generation. Critical change in 2019 from HYQ14FBA to HYQ14FBC. Also check VIN - US-produced (VIN starts with "2") uses different board.

> **💡 Pro Tip:** 2019+ RAV4 uses HYQ14FBC with Board 0351. Earlier models use HYQ14FBA with Board 0020. NOT interchangeable!

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol | Notes |
|-------|-----------|----------|-------|
| 2013-2015 Early | ID72 (G) | DST-AES | "G-chip" |
| 2015 Late-2018 | ID8A (H) | DST-AES 128 | "H-chip" |
| 2019-2024 | ID8A (H) | DST-AES 128 | Current chip |

---

## 📡 Smart Key FCC IDs by Generation

| Years | FCC ID | Frequency | Board | Buttons |
|-------|--------|-----------|-------|---------|
| 2013-2018 | HYQ14FBA | 315 MHz | Board 0020 | 4 |
| 2019 | HYQ14FBA or HYQ14FBC | 315 MHz | Verify VIN | 3-4 |
| 2019-2021 | HYQ14FBC | 315 MHz | Board 0351 | 3, 4 |
| 2021-2023 | HYQ14FBC | 433 MHz | Board 0351 | 4 (non-hybrid) |

---

## 📡 Remote Head Key FCC IDs

| Years | FCC ID | Chip | Notes |
|-------|--------|------|-------|
| 2013-2018 | HYQ12BDM | G/H-chip | Flip key for non-PTS |
| 2019-2021 | HYQ12BFB | H-chip | Non-PTS flip key |

---

## 🔧 Key Information

- **Blade:** TOY43, TOY48
- **Lishi:** TOY48 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz (US), 433 MHz (some 2021+)

---

## ⚙️ Programming Notes

- **2019 critical year:** Both FCC IDs possible - verify with VIN
- **VIN check:** Starts with "2" = US production = Board 0351
- **Board 0020 vs 0351:** Cannot interchange

---

## 📚 Sources

- locksmithkeyless.com
- americankeysupply.com
- northcoastkeyless.com
- yourcarkeyguys.com
'
WHERE make = 'Toyota' AND model = 'RAV4';
