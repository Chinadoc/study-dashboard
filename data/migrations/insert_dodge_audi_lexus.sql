-- Dodge, Audi, Lexus Master Guides
-- With proper table formatting

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE CHARGER (2011-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-charger-2011-2024',
  'Dodge',
  'Charger',
  2011,
  2024,
  '# 🚗 Dodge Charger Master Guide (2011-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Dodge Charger muscle sedan with proximity smart key system.

> **💡 Pro Tip:** 2017+ requires professional tools. Earlier models have DIY OBD programmer options.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2011-2016 | ID46 | Philips Crypto 2 |
| 2017-2024 | ID4A | HITAG AES (128-bit) |

---

## 📡 FCC IDs

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2011-2024 | M3N-40821302 | 4-5 |

---

## 🔧 Key Information

- **Blade:** Y159, Y164
- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433 MHz

---

## ⚙️ Programming

Professional required for 2017+. Some DIY OBD tools work on 2011-2016.

---

## 📚 Sources

- locksmithkeyless.com
- bestkeysolution.com
- yourcarkeyguys.com
',
  '{"sources": ["locksmithkeyless.com", "bestkeysolution.com", "yourcarkeyguys.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- DODGE CHALLENGER (2015-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'dodge-challenger-2015-2024',
  'Dodge',
  'Challenger',
  2015,
  2024,
  '# 🚗 Dodge Challenger Master Guide (2015-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Dodge Challenger muscle car with push-to-start smart key.

---

## 🔐 Transponder Chip

| Years | Chip Type |
|-------|-----------|
| 2015-2016 | ID46 (PCF7961M) |
| 2017-2024 | ID4A (HITAG AES) |

---

## 📡 FCC IDs

| Years | FCC ID |
|-------|--------|
| 2015-2024 | M3N-40821302 |

---

## 🔧 Key Information

- **Lishi:** CY24 2-in-1
- **Battery:** CR2032
- **Frequency:** 433 MHz

---

## 📚 Sources

- locksmithkeyless.com
- northcoastkeyless.com
',
  '{"sources": ["locksmithkeyless.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDI A4 (2009-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'audi-a4-2009-2024',
  'Audi',
  'A4',
  2009,
  2024,
  '# 🚗 Audi A4 Master Guide (2009-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Audi A4 luxury sedan with advanced Megamos AES immobilizer.

> **💡 Pro Tip:** 2016+ requires new/virgin key - used keys cannot be reprogrammed. All existing keys must be present during programming.

---

## 🔐 Transponder Chip Evolution

| Years | Chip Type | Protocol |
|-------|-----------|----------|
| 2009-2015 | ID48 | Megamos Crypto |
| 2016-2024 | ID88 (MQB48) | Megamos AES (128-bit) |

---

## 📡 FCC IDs

| Years | FCC ID | Frequency |
|-------|--------|-----------|
| 2009-2016 | IYZFBSB802 | 315 MHz |
| 2017-2024 | NBG92596263 | 315 MHz |

---

## 🔧 Key Information

- **Blade:** HU66
- **Lishi:** HU66 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz (US)

---

## ⚙️ Programming

### 🔴 Professional Only

- Requires ODIS, VAG-COM, or equivalent
- BCM2 module interaction required
- May need ABPROG for BCM2 reading
- All keys must be present

---

## 📚 Sources

- dmllocksmith.com
- locksmithkeyless.com
- abkeys.com
',
  '{"sources": ["dmllocksmith.com", "locksmithkeyless.com", "abkeys.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDI Q5 (2009-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'audi-q5-2009-2024',
  'Audi',
  'Q5',
  2009,
  2024,
  '# 🚙 Audi Q5 Master Guide (2009-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Audi Q5 luxury compact SUV with Megamos immobilizer.

---

## 🔐 Transponder Chip

| Years | Chip Type |
|-------|-----------|
| 2009-2016 | ID48 (Megamos Crypto) |
| 2017-2024 | ID88 (Megamos AES) |

---

## 📡 FCC IDs

| Years | FCC ID |
|-------|--------|
| 2009-2016 | IYZFBSB802 |
| 2017-2024 | NBG92596263 |

---

## 🔧 Key Information

- **Lishi:** HU66 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## 📚 Sources

- dmllocksmith.com
- keyprogtools.com
',
  '{"sources": ["dmllocksmith.com", "keyprogtools.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEXUS RX (2016-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'lexus-rx-2016-2024',
  'Lexus',
  'RX',
  2016,
  2024,
  '# 🚙 Lexus RX Master Guide (2016-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Lexus RX luxury SUV (RX350, RX450h, RX350L) with Toyota H-chip smart keys.

> **💡 Pro Tip:** Dealerships may refuse to program aftermarket keys - use a qualified locksmith.

---

## 🔐 Transponder Chip

| Years | Chip Type | Notes |
|-------|-----------|-------|
| 2016-2024 | ID8A (H-chip) | Texas Instruments DST-AES |

---

## 📡 FCC IDs

| Years | FCC ID | Models |
|-------|--------|--------|
| 2016-2020 | HYQ14FBA | RX350, RX450h |
| 2016-2024 | HYQ14FBB | RX350, RX450h, RX350L |

---

## 🔧 Key Information

- **Blade:** TOY48
- **Lishi:** TOY48 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## ⚙️ Programming

Requires Toyota Techstream or aftermarket OBD tools. Working key often needed.

---

## 📚 Sources

- locksmithkeyless.com
- americankeysupply.com
- key4.com
',
  '{"sources": ["locksmithkeyless.com", "americankeysupply.com", "key4.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEXUS ES (2013-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'lexus-es-2013-2024',
  'Lexus',
  'ES',
  2013,
  2024,
  '# 🚗 Lexus ES Master Guide (2013-2024)
## Smart Key Programming Reference

---

## 📋 Overview

Lexus ES luxury sedan (ES350, ES300h) with H-chip smart key system.

---

## 🔐 Transponder Chip

| Years | Chip Type |
|-------|-----------|
| 2013-2024 | ID8A (H-chip) |

---

## 📡 FCC IDs

| Years | FCC ID |
|-------|--------|
| 2013-2018 | HYQ14FBA |
| 2019-2024 | HYQ14FBN |

---

## 🔧 Key Information

- **Lishi:** TOY48 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## 📚 Sources

- uhs-hardware.com
- keylessentryremotefob.com
',
  '{"sources": ["uhs-hardware.com", "keylessentryremotefob.com"], "generated": "2024-12-10", "method": "web_research"}'
);
