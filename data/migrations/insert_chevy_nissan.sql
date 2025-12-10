-- Chevrolet & Nissan Master Guides
-- Enhanced formatting with professional presentation

-- ═══════════════════════════════════════════════════════════════════════════
-- CHEVROLET SILVERADO (2007-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'chevrolet-silverado-2007-2024',
  'Chevrolet',
  'Silverado',
  2007,
  2024,
  '# 🚛 Chevrolet Silverado Master Guide (2007-2024)
## Key Programming & Immobilizer Reference

---

## 📋 Overview

The Chevrolet Silverado is one of the most popular full-size trucks in America. Key technology evolved from Circle Plus transponders to proximity smart keys.

> **💡 Pro Tip:** The "Circle Plus" symbol (⊕) on GM key blanks indicates a 46 chip transponder. This is standard for 2007-2014 Silverados.

---

## 🔐 Transponder Chip Evolution

| Generation | Years | Chip Type | Key Marking |
|------------|-------|-----------|-------------|
| **Gen 1** | 2007-2013 | 46 (Circle Plus) | B111PT |
| **Gen 2** | 2014-2018 | 46 / Megamos 48 | Circle Plus |
| **Gen 3** | 2019-2024 | Proximity Smart Key | N/A |

---

## 📡 FCC IDs

| Years | FCC ID | Key Type | Buttons |
|-------|--------|----------|---------|
| 2007-2013 | OUC60270 | Remote | 3B |
| 2007-2017 | OUC60221 | Remote | 3B |
| 2014-2019 | M3N-32337100 | Remote w/ Start | 4-5B |
| 2020-2024 | M3N-32337200 | Smart Key | 5B |

---

## 🔧 Key Information

| Component | Details |
|-----------|---------|
| **Blade Type** | B111 (Circle Plus) |
| **Lishi Tool** | GM37 (2007-2013), HU100 10-cut (2014+) |
| **Battery** | CR2032 |
| **Frequency** | 315 MHz |

---

## ⚙️ Programming Procedures

### 🟢 DIY Transponder (With 1 Working Key)

1. Insert **working key** → Turn to **ON** → Wait 5 seconds → **OFF**
2. Within 5 seconds: Insert **NEW key** → Turn **ON** → Wait 5 seconds
3. ✅ Security light turns off = **Success**

### 🟡 DIY Remote (OBD Method for 2014-2019)

1. Insert key, turn to **ON** position
2. Plug OBD programmer into port
3. Display shows "REMOTE KEY LEARNING ACTIVE"
4. Press and hold **LOCK + UNLOCK** for 15-30 seconds
5. 🔊 Locks cycle = Confirmed

### 🔴 All Keys Lost (30-Minute Relearn)

1. Insert newly cut key → Turn to **ON**
2. Wait **10 minutes 30 seconds** (security light goes off)
3. Turn **OFF** → Immediately turn **ON** again
4. Wait another **10 min 30 sec**
5. Repeat one more time (total ~31 minutes)
6. Turn **OFF** → Start vehicle

---

## ⚠️ Important Notes

> **🚨 2020+ Push-Button Start:** Requires professional equipment. Autel V200 with Techline Connect subscription often needed.

---

## 📊 Quick Reference

| Item | 2007-2013 | 2014-2019 | 2020-2024 |
|------|-----------|-----------|-----------|
| **Chip** | 46 | 46/48 | Smart Key |
| **DIY OBP** | ✅ | ✅ Remote | ❌ |
| **Lishi** | GM37 | HU100 | HU100 |
| **AKL Time** | ~31 min | ~31 min | Pro tool |

---

## 📚 Sources

- northcoastkeyless.com • carandtruckremotes.com • keyless2go.com
- prokeyfob.com • starlingchevygmc.com • americankeysupply.com
',
  '{"sources": ["northcoastkeyless.com", "carandtruckremotes.com", "keyless2go.com", "prokeyfob.com", "starlingchevygmc.com", "americankeysupply.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- NISSAN ALTIMA (2013-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'nissan-altima-2013-2024',
  'Nissan',
  'Altima',
  2013,
  2024,
  '# 🚗 Nissan Altima Master Guide (2013-2024)
## Intelligent Key Programming Reference

---

## 📋 Overview

The Nissan Altima uses the Nissan Intelligent Key system with proximity entry and push-button start.

> **💡 Pro Tip:** The 6-10 insert/remove DIY method works on many Nissan models. Count quickly but don''t rush - consistency is key.

---

## 🔐 Key System Evolution

| Generation | Years | Key Type |
|------------|-------|----------|
| **Gen 5** | 2013-2018 | Intelligent Key (Smart) |
| **Gen 6** | 2019-2024 | Intelligent Key (Smart) |

---

## 📡 FCC IDs

| Years | FCC ID | Buttons | Frequency |
|-------|--------|---------|-----------|
| 2013-2018 | CWTWB1U840 | 4B | 315 MHz |
| 2019-2024 | KR5TXN7 | 4-5B | 433.92 MHz |

---

## 🔧 Key Information

| Component | Details |
|-----------|---------|
| **Key Type** | Intelligent Key (Proximity) |
| **Emergency Blade** | NSN14 |
| **Lishi Tool** | NSN14 2-in-1 |
| **Battery** | CR2032 |

---

## ⚙️ DIY Programming (Intelligent Key Sync)

### Method 1: Insert/Remove Cycle

1. Get inside vehicle with key, **lock all doors**
2. Insert key in ignition, **remove immediately**
3. Repeat **6-10 times in 10 seconds**
4. 🚨 Hazard lights flash 2x = Programming mode
5. Insert key → Turn to **ON** (don''t start)
6. Press any button on key fob within 5 seconds
7. ✅ Test lock/unlock functions

### Method 2: Door Lock Button

1. Close all doors
2. Find small **padlock button** on driver door panel
3. Press and hold for **5 seconds**
4. Within 6 seconds, press **LOCK/UNLOCK** on fob
5. 🔊 Chime + lights flash = Success

---

## ⚠️ Notes

> **🚨 Transponder Programming:** For starting the car, the transponder chip in new keys must be programmed by a professional locksmith - DIY only syncs remote functions.

---

## 📊 Quick Reference

| Item | Value |
|------|-------|
| **Key Type** | Intelligent Key (Smart) |
| **DIY Remote Sync** | ✅ Yes |
| **DIY Transponder** | ❌ Professional only |
| **Lishi** | NSN14 |
| **Emergency Start** | Blade in door, hold fob to button |

---

## 📚 Sources

- keyless2go.com • siddillonnissan.com • bobhowardnissan.com
- advantagenissan.com • northcoastkeyless.com
',
  '{"sources": ["keyless2go.com", "siddillonnissan.com", "bobhowardnissan.com", "advantagenissan.com", "northcoastkeyless.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- NISSAN ROGUE (2014-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'nissan-rogue-2014-2024',
  'Nissan',
  'Rogue',
  2014,
  2024,
  '# 🚙 Nissan Rogue Master Guide (2014-2024)
## Intelligent Key Programming Reference

---

## 📋 Overview

The Nissan Rogue is a compact crossover SUV using the Nissan Intelligent Key system.

---

## 🔐 Key System

| Generation | Years | Key Type | Notes |
|------------|-------|----------|-------|
| **Gen 2** | 2014-2020 | Intelligent Key | CWTWB1U840 |
| **Gen 3** | 2021-2024 | Intelligent Key | KR5TXN7 |

---

## 📡 FCC IDs

| Years | FCC ID | Buttons |
|-------|--------|---------|
| 2014-2020 | CWTWB1U840 | 4B |
| 2021-2024 | KR5TXN7 | 5B |

---

## 🔧 Key Information

- **Emergency Blade:** NSN14
- **Lishi Tool:** NSN14 2-in-1
- **Battery:** CR2032
- **Frequency:** 315 MHz / 433.92 MHz

---

## ⚙️ DIY Remote Sync

Same procedure as Altima:
1. Lock all doors from inside
2. Insert/remove key 6-10 times in 10 seconds
3. Hazards flash = Programming mode
4. Turn ON, press any fob button
5. Test functions

---

## 📊 Quick Reference

| Item | 2014-2020 | 2021-2024 |
|------|-----------|-----------|
| **FCC ID** | CWTWB1U840 | KR5TXN7 |
| **Buttons** | 4 | 5 |
| **DIY Remote** | ✅ | ✅ |
| **Transponder** | Pro only | Pro only |

---

## 📚 Sources

- ebay.com • keyless2go.com • northcoastkeyless.com
',
  '{"sources": ["ebay.com", "keyless2go.com", "northcoastkeyless.com", "nissanofmckinney.com"], "generated": "2024-12-10", "method": "web_research"}'
);
