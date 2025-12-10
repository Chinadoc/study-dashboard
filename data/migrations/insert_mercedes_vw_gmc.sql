-- Mercedes, VW, GMC Master Guides
-- With proper table formatting

-- ═══════════════════════════════════════════════════════════════════════════
-- MERCEDES C-CLASS (2015-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'mercedes-c-class-2015-2024',
  'Mercedes',
  'C-Class',
  2015,
  2024,
  '# 🚗 Mercedes C-Class Master Guide (2015-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Mercedes-Benz uses advanced BGA/NEC transponder systems with infrared communication.

> **💡 Pro Tip:** Mercedes keys require specialized tools like VVDI MB or CGDI MB. Standard key programmers won''t work.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Module | Notes |
|-------|-----------|--------|-------|
| 2015-2018 | NEC | EIS/EZS | Older infrared system |
| 2019-2024 | BGA | EIS/EZS | Ball Grid Array chip |

---

## 📡 FCC IDs

| Years | FCC ID | Key Type |
|-------|--------|----------|
| 2015-2020 | IYZDC07K | Chrome Fish Key |
| 2021-2024 | IYZMS5 | New style fob |

---

## 🔧 Key Information

- **Blade:** HU64, HU66
- **Lishi:** HU64 2-in-1
- **Battery:** CR2025
- **Frequency:** 315 MHz (US), 433 MHz (EU)

---

## ⚙️ Programming Process

### 🔴 Requires Specialized Tools

1. Read EIS/EZS data via IR or OBD
2. Calculate password from EIS data
3. Generate key file
4. Write key file to blank BGA/NEC key via IR
5. Sync key with vehicle

**Tools Required:**
- VVDI MB BGA Tool
- CGDI MB Key Programmer
- Mercedes NEC Key Programmer

---

## 📚 Sources

- key4.com
- cgdiprog.com
- bladeautokeys.co.uk
',
  '{"sources": ["key4.com", "cgdiprog.com", "bladeautokeys.co.uk"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- MERCEDES E-CLASS (2015-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'mercedes-e-class-2015-2024',
  'Mercedes',
  'E-Class',
  2015,
  2024,
  '# 🚗 Mercedes E-Class Master Guide (2015-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Mercedes E-Class luxury sedan with BGA smart key system.

---

## 🔐 Transponder Chip

| Years | Chip Type | Module |
|-------|-----------|--------|
| 2015-2024 | BGA | EIS/EZS |

---

## 📡 FCC IDs

| Years | FCC ID |
|-------|--------|
| 2015-2020 | IYZDC07K |
| 2021-2024 | IYZMS5 |

---

## 🔧 Key Information

- **Lishi:** HU64 2-in-1
- **Battery:** CR2025
- **Frequency:** 315/433 MHz

---

## 📚 Sources

- key4.com
- vxdas.com
',
  '{"sources": ["key4.com", "vxdas.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- VOLKSWAGEN JETTA (2011-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'vw-jetta-2011-2024',
  'Volkswagen',
  'Jetta',
  2011,
  2024,
  '# 🚗 Volkswagen Jetta Master Guide (2011-2024)
## Smart Key Programming Reference

---

## 📋 Overview

VW Jetta compact sedan with ID48/ID88 Megamos AES transponders.

> **💡 Pro Tip:** 2016+ may use ID88 Megamos AES - verify before ordering.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2011-2015 | ID48 | Megamos Crypto |
| 2016-2024 | ID88 | Megamos AES |

---

## 📡 FCC IDs

### ⚡ Push-to-Start

| Years | FCC ID |
|-------|--------|
| 2015-2024 | NBGFS12P01 |

### 🔑 Non-Push-to-Start

| Years | FCC ID |
|-------|--------|
| 2011-2018 | HLO1J0959753AM |

---

## 🔧 Key Information

- **Blade:** HU66
- **Lishi:** HU66 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## ⚙️ Programming

Professional programming required. Tools: Autel, VVDI, Vagtacho.

---

## 📚 Sources

- northcoastkeyless.com
- maltchev.com
- keyless2go.com
',
  '{"sources": ["northcoastkeyless.com", "maltchev.com", "keyless2go.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- VOLKSWAGEN TIGUAN (2012-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'vw-tiguan-2012-2024',
  'Volkswagen',
  'Tiguan',
  2012,
  2024,
  '# 🚙 Volkswagen Tiguan Master Guide (2012-2024)
## Smart Key Programming Reference

---

## 📋 Overview

VW Tiguan compact SUV with Megamos transponder system.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2012-2017 | ID48 | Megamos Crypto |
| 2018-2024 | ID88 | Megamos AES |

---

## 📡 FCC IDs

| Years | FCC ID | Key Type |
|-------|--------|----------|
| 2012-2017 | NBG010206T | Flip Key |
| 2018-2024 | NBGFS12P01 | Smart Key |

---

## 🔧 Key Information

- **Lishi:** HU66 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## 📚 Sources

- northcoastkeyless.com
- uhs-hardware.com
',
  '{"sources": ["northcoastkeyless.com", "uhs-hardware.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- GMC SIERRA (2014-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'gmc-sierra-2014-2024',
  'GMC',
  'Sierra',
  2014,
  2024,
  '# 🚛 GMC Sierra Master Guide (2014-2024)
## Smart Key Programming Reference

---

## 📋 Overview

GMC Sierra full-size pickup with push-to-start smart key options.

> **💡 Pro Tip:** 2015-2016 models may allow DIY remote programming with existing working key.

---

## 🔐 Transponder Chip

| Years | Chip Type | Notes |
|-------|-----------|-------|
| 2014-2018 | ID46 | PCF7937E |
| 2019-2024 | ID47 | HITAG Pro |

---

## 📡 FCC IDs

### ⚡ Push-to-Start

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2014-2019 | M3N32337100 | 5 |
| 2020-2024 | YG0G20TB1 | 5 |

### 🔑 Non-Push-to-Start (Flip Key)

| Years | FCC ID |
|-------|--------|
| 2014-2018 | OHT01060512 |

---

## 🔧 Key Information

- **Blade:** B111
- **Lishi:** HU100 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## ⚙️ DIY Programming (2015-2016 with existing key)

1. Remove emergency key from working remote
2. Place working remote in cupholder  
3. Insert emergency key in driver door lock
4. Turn counter-clockwise 5x within 10 sec
5. DIC displays "READY FOR REMOTE #2"
6. Place new remote in console pocket
7. Press ENGINE START/STOP

---

## 📚 Sources

- prokeybox.com
- locksmithkeyless.com
- carandtruckremotes.com
',
  '{"sources": ["prokeybox.com", "locksmithkeyless.com", "carandtruckremotes.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- GMC YUKON (2015-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'gmc-yukon-2015-2024',
  'GMC',
  'Yukon',
  2015,
  2024,
  '# 🚙 GMC Yukon Master Guide (2015-2024)
## Smart Key Programming Reference

---

## 📋 Overview

GMC Yukon full-size SUV with proximity smart key system.

---

## 🔐 Transponder Chip

| Years | Chip Type |
|-------|-----------|
| 2015-2020 | ID46 (PCF7937E) |
| 2021-2024 | ID47 (HITAG Pro) |

---

## 📡 FCC IDs

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2015-2020 | M3N32337100 | 5-6 |
| 2021-2024 | YG0G20TB1 | 5 |

---

## 🔧 Key Information

- **Lishi:** HU100 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## 📚 Sources

- prokeybox.com
- northcoastkeyless.com
',
  '{"sources": ["prokeybox.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);
