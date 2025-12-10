-- Jeep & Ram Master Guides
-- Enhanced with Push-to-Start (PTS) vs Non-PTS FCC ID distinction

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP WRANGLER (2007-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-wrangler-2007-2024',
  'Jeep',
  'Wrangler',
  2007,
  2024,
  '# 🚙 Jeep Wrangler Master Guide (2007-2024)
## Key Programming Reference

---

## 📋 Overview

The Jeep Wrangler is an iconic off-road SUV. Key technology evolved significantly with the JL generation (2018+).

> **💡 Pro Tip:** 2018+ Wranglers with Push-to-Start use completely different keys than non-PTS models - always verify!

---

## 🔐 Transponder Chip Evolution

| Generation | Years | Chip Type | Start Type |
|------------|-------|-----------|------------|
| **JK** | 2007-2017 | ID46 (PCF7941) | Key Start |
| **JL (Non-PTS)** | 2018-2024 | ID46 | Key Start |
| **JL (PTS)** | 2018-2024 | 4A (NXP AES 128-bit) | Push-to-Start |

---

## 📡 FCC IDs by Start Type

### ⚡ Push-to-Start (Smart Key)
| Years | FCC ID | Key Type | Buttons |
|-------|--------|----------|---------|
| 2018-2024 | OHT1130261 | Flip Smart Key | 4B |

### 🔑 Non-Push-to-Start (Remote Head Key)
| Years | FCC ID | Key Type | Buttons |
|-------|--------|----------|---------|
| 2007-2017 | OHT692427AA | Remote Head | 3B |
| 2018-2024 | 68416784AA | Remote Head | 3B |

---

## 🔧 Key Information

| Component | JK (2007-2017) | JL (2018-2024) |
|-----------|----------------|----------------|
| **Blade** | Y159 | CY24 |
| **Lishi** | CY24 2-in-1 | CY24 2-in-1 |
| **Battery** | CR2032 | CR2032 |
| **Frequency** | 315 MHz | 433 MHz |

---

## ⚙️ Programming

### 🔴 Professional Only for Smart Keys

All Jeep smart keys require professional programming:
- Autel IM608 Pro II supported
- VVDI supported

### 🟢 Some Non-PTS Models DIY (2 Keys Required)

For JK 2007-2017 with 2 existing keys:
1. Insert Key #1 → Turn ON → OFF → Remove
2. Within 15 sec: Key #2 → ON → OFF → Remove
3. Within 15 sec: New Key → ON → Security light goes off

---

## 📚 Sources

- key4.com • northcoastkeyless.com • americankeysupply.com • locksmithkeyless.com
',
  '{"sources": ["key4.com", "northcoastkeyless.com", "americankeysupply.com", "locksmithkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP GRAND CHEROKEE (2011-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-grand-cherokee-2011-2024',
  'Jeep',
  'Grand Cherokee',
  2011,
  2024,
  '# 🚙 Jeep Grand Cherokee Master Guide (2011-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Jeep Grand Cherokee WK2 (2011-2021) and WL (2022+) use proximity smart keys.

---

## 🔐 Transponder Chip Evolution

| Generation | Years | Chip Type | Frequency |
|------------|-------|-----------|-----------|
| **WK2** | 2011-2013 | ID46 | 433 MHz |
| **WK2** | 2014-2021 | 4A (NXP AES 128-bit) | 433 MHz |
| **WL** | 2022-2024 | 4A (NXP AES 128-bit) | 433 MHz |

---

## 📡 FCC IDs (All Push-to-Start)

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2011-2013 | M3N-40821302 | 5B |
| 2014-2021 | M3N40821302 | 5B |
| 2015-2022 | GQ4-54T | 5B |
| 2022-2024 | M3N-97395900 | 5B |

---

## 🔧 Key Information

- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433 MHz

---

## ⚙️ Programming

Professional programming required - no DIY option.

---

## 📚 Sources

- key4.com • northcoastkeyless.com • locksmithkeyless.com • walmart.com
',
  '{"sources": ["key4.com", "northcoastkeyless.com", "locksmithkeyless.com", "walmart.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- JEEP CHEROKEE (2014-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'jeep-cherokee-2014-2024',
  'Jeep',
  'Cherokee',
  2014,
  2024,
  '# 🚙 Jeep Cherokee Master Guide (2014-2024)
## Smart Key Programming Reference

---

## 📋 Overview

The Jeep Cherokee KL uses proximity smart keys with 4A chip technology.

---

## 🔐 Transponder Chip Type

| Years | Chip Type | Notes |
|-------|-----------|-------|
| 2014-2024 | 4A (NXP AES PCF7953M) | 128-bit AES |

---

## 📡 FCC IDs (All Push-to-Start)

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2014-2023 | GQ4-54T | 4B |

---

## 🔧 Key Information

- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433 MHz

---

## ⚙️ Programming

Professional programming required.

---

## 📚 Sources

- key4.com • northcoastkeyless.com • locksmithkeyless.com
',
  '{"sources": ["key4.com", "northcoastkeyless.com", "locksmithkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RAM 1500 (2013-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ram-1500-2013-2024',
  'Ram',
  '1500',
  2013,
  2024,
  '# 🚛 Ram 1500 Master Guide (2013-2024)
## Key Programming Reference

---

## 📋 Overview

The Ram 1500 offers both traditional key start and push-to-start options - **always verify before ordering**.

> **💡 Pro Tip:** Ram 1500 Classic (sold alongside new generation) uses older key system through 2024.

---

## 🔐 Transponder Chip Evolution

| Variant | Years | Chip Type | Start Type |
|---------|-------|-----------|------------|
| **DS (Non-PTS)** | 2013-2018 | ID46 (CHR) | Key Start |
| **DS (PTS)** | 2013-2018 | ID46 | Push-to-Start |
| **DT** | 2019-2024 | 4A (HITAG AES) | Push-to-Start |
| **Classic** | 2019-2024 | ID46 | Key Start |

---

## 📡 FCC IDs by Start Type

### ⚡ Push-to-Start (Smart Key)
| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2013-2018 | GQ4-54T | 3-5B |
| 2019-2024 | OHT4882056 | 5B |

### 🔑 Non-Push-to-Start
| Years | FCC ID | Key Type |
|-------|--------|----------|
| 2013-2018 | GQ4-53T | Remote Head |
| 2019-2024 (Classic) | GQ4-76T | Remote Head |

---

## 🔧 Key Information

- **Blade:** Y159 (2013-2018), CY24 (2019+)
- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433 MHz

---

## ⚙️ Programming

Professional programming required for all smart keys.

---

## 📚 Sources

- key4.com • northcoastkeyless.com • bestkeysolution.com • locksmithkeyless.com • carandtruckremotes.com
',
  '{"sources": ["key4.com", "northcoastkeyless.com", "bestkeysolution.com", "locksmithkeyless.com", "carandtruckremotes.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RAM 2500/3500 (2013-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ram-2500-2013-2024',
  'Ram',
  '2500',
  2013,
  2024,
  '# 🚛 Ram 2500/3500 Master Guide (2013-2024)
## Key Programming Reference

---

## 📋 Overview

The Ram Heavy Duty trucks share key systems with the 1500 but typically lag in smart key adoption.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Start Type |
|-------|-----------|------------|
| 2013-2018 | ID46 (CHR) | Key Start |
| 2019-2024 | 4A (HITAG AES) | Key/PTS |

---

## 📡 FCC IDs

### ⚡ Push-to-Start
| Years | FCC ID |
|-------|--------|
| 2013-2018 | GQ4-54T |
| 2019-2024 | OHT4882056 |

### 🔑 Non-Push-to-Start
| Years | FCC ID |
|-------|--------|
| 2013-2018 | GQ4-53T |
| 2019-2024 | GQ4-76T |

---

## 🔧 Key Information

- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433 MHz

---

## 📚 Sources

- key4.com • americankeysupply.com • northcoastkeyless.com
',
  '{"sources": ["key4.com", "americankeysupply.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);
