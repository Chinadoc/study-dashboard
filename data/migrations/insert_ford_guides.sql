-- Ford Master Guides: F-150, Explorer, Escape, Mustang
-- Generated from web research with verified sources
-- Enhanced formatting for professional presentation

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD F-150 (2004-2024) - America's Best-Selling Vehicle
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-f150-2004-2024',
  'Ford',
  'F-150',
  2004,
  2024,
  '# 🚗 Ford F-150 Master Guide (2004-2024)
## Key Programming & Immobilizer Reference

---

## 📋 Overview

The Ford F-150 is **America''s best-selling vehicle** for over 40 years. Key technology evolved significantly across generations, from 40-bit to 128-bit security.

> **💡 Pro Tip:** Starting 2010, Ford stopped supporting 40-bit chips. Always use 80-bit replacements for pre-2010 models - they''re backward compatible.

---

## 🔐 Transponder Chip Evolution

| Era | Years | Chip Type | Security Level |
|-----|-------|-----------|----------------|
| **Gen 1** | 2004-2009 | 4D63 (40-bit) → 80-bit replacement | Standard |
| **Gen 2** | 2010-2014 | 4D63 (80-bit) | Enhanced |
| **Gen 3** | 2015-2024 | H128 (128-bit Hitag Pro) | Maximum |

### Chip Identification
- **S marking** = 40-bit (legacy)
- **SA marking** = 80-bit (current standard)
- **H128-PT** = 128-bit Hitag Pro (2015+)

---

## 📡 FCC IDs by Generation

### Remote Head Keys (2004-2014)
| Years | FCC ID | Buttons | Frequency |
|-------|--------|---------|-----------|
| 2004-2009 | CWTWB1U345 | 3B | 315 MHz |
| 2004-2009 | CWTWB1U331 | 3B | 315 MHz |
| 2010-2014 | CWTWB1U793 | 4B | 315 MHz |

### Smart Keys (2015-2024)
| Years | FCC ID | Buttons | Frequency |
|-------|--------|---------|-----------|
| 2015-2020 | M3N-A2C31243300 | 5B | 902 MHz |
| 2021-2024 | M3N-A2C93142300 | 5B | 902 MHz |

---

## 🔧 Mechanical Key Information

| Component | Details |
|-----------|---------|
| **Blade Type** | H75 (2004-2014), H128 (2015+) |
| **Lishi Tool** | FO38 2-in-1 Pick & Decoder |
| **Compatible Years** | 1998-2012 (FO38) |
| **Lock Type** | 8-cut wafer |

---

## ⚙️ Programming Procedures

### 🟢 DIY Self-Programming (Requires 2 Working Keys)

**For Transponder Registration:**
1. Insert **Key #1** → Turn to **RUN** → Turn to **OFF** → Remove
2. Within **5 seconds**: Insert **Key #2** → Turn to **RUN** → Turn to **OFF** → Remove
3. Within **10 seconds**: Insert **NEW key** → Turn to **RUN** → Hold 1 second
4. ✅ Security light illuminates 3 seconds = **Success**

**For Remote Programming:**
1. Close all doors, open driver door
2. Press **UNLOCK** button on door panel
3. Turn ignition **OFF → RUN** 8 times in 10 seconds (end in RUN)
4. 🔊 Locks cycle = Programming mode
5. Press any button on remote within 20 seconds
6. 🔊 Locks cycle = Confirmed
7. Turn ignition **OFF** to exit

### 🔴 Professional Programming (2015+ Smart Keys, AKL)

**Autel IM608 Procedure:**
- Menu: IMMO → Ford → F-150 → [Year]
- 2021+ AKL requires BCM D-flash read
- BCM location: Passenger side footwell
- May require APB131 adapter + soldering

---

## ⚠️ Important Notes

> **🚨 US Market AKL Restriction:** Autel IM608 Pro II has AKL restrictions for Ford in US market. Use VVDI, Lonsdor, or Smart Pro for all keys lost scenarios.

---

## 📊 Quick Reference Card

| Item | 2004-2014 | 2015-2024 |
|------|-----------|-----------|
| **Chip** | 80-bit (4D63) | 128-bit (H128) |
| **DIY OBP** | ✅ Yes | Remote only |
| **Lishi** | FO38 | Limited |
| **Add Key Time** | ~5 min | ~15 min |
| **AKL Time** | ~20 min | ~45 min |

---

## 📚 Sources

- remotesandkeys.com • carandtruckremotes.com • northcoastkeyless.com
- f150forum.com • genuinelishi.com • programautokeys.com
',
  '{"sources": ["remotesandkeys.com", "carandtruckremotes.com", "northcoastkeyless.com", "f150forum.com", "genuinelishi.com", "programautokeys.com", "bestkeysolution.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD EXPLORER (2006-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-explorer-2006-2024',
  'Ford',
  'Explorer',
  2006,
  2024,
  '# 🚗 Ford Explorer Master Guide (2006-2024)
## Key Programming & Immobilizer Reference

---

## 📋 Overview

The Ford Explorer is a full-size SUV that transitioned from body-on-frame to unibody construction in 2011. Key technology evolved alongside these changes.

---

## 🔐 Transponder Chip Evolution

| Generation | Years | Chip Type | Notes |
|------------|-------|-----------|-------|
| **Gen 4** | 2006-2010 | 4D63 (80-bit) | Remote head key |
| **Gen 5** | 2011-2019 | 4D63 (80-bit) / H128 | Smart key option |
| **Gen 6** | 2020-2024 | H128 (128-bit) | Smart key standard |

---

## 📡 FCC IDs

| Years | FCC ID | Key Type |
|-------|--------|----------|
| 2006-2010 | CWTWB1U793 | Remote Head Key |
| 2011-2015 | M3N5WY8609 | Smart Key |
| 2016-2019 | M3N-A2C31243300 | Smart Key |
| 2020-2024 | M3N-A2C93142300 | Smart Key |

---

## 🔧 Key Information

- **Blade:** H75 (2006-2019), Emergency blade (2020+)
- **Lishi:** FO38 (2006-2012)
- **Battery:** CR2032 (smart keys)
- **Frequency:** 315 MHz / 902 MHz (newer)

---

## ⚙️ OBP Remote Programming

1. Close all doors → Open driver door → Press UNLOCK
2. Turn ignition OFF → RUN 8 times in 10 seconds
3. 🔊 Locks cycle = Programming mode
4. Press button on remote within 10 seconds
5. Turn OFF to exit

---

## 📊 Quick Reference

| Item | Value |
|------|-------|
| **2006-2010 Chip** | 80-bit (4D63) |
| **2011-2019 Chip** | 80/128-bit |
| **2020-2024 Chip** | 128-bit (H128) |
| **DIY OBP** | Remote only (most years) |

---

## 📚 Sources

- keyless2go.com • carandtruckremotes.com • weberford.com
',
  '{"sources": ["keyless2go.com", "carandtruckremotes.com", "weberford.com", "tomskey.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD ESCAPE (2008-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-escape-2008-2024',
  'Ford',
  'Escape',
  2008,
  2024,
  '# 🚗 Ford Escape Master Guide (2008-2024)
## Key Programming & Immobilizer Reference

---

## 📋 Overview

The Ford Escape is a compact crossover SUV. The third generation (2013+) introduced smart key options.

---

## 🔐 Transponder Chip Evolution

| Generation | Years | Chip Type |
|------------|-------|-----------|
| **Gen 2** | 2008-2012 | 4D63 (80-bit) |
| **Gen 3** | 2013-2019 | 4D63 / H128 |
| **Gen 4** | 2020-2024 | H128 (128-bit) |

---

## 📡 FCC IDs

| Years | FCC ID | Key Type |
|-------|--------|----------|
| 2008-2012 | CWTWB1U793 | Remote Head Key |
| 2013-2019 | M3N5WY8609 | Smart Key |
| 2020-2024 | M3N-A2C93142300 | Smart Key |

---

## 🔧 Key Information

- **Blade:** H75 (2008-2019)
- **Lishi:** FO38 (2008-2012)
- **Battery:** CR2032
- **Frequency:** 315 MHz

---

## ⚙️ DIY Programming (Requires 2 Keys)

**Transponder:**
1. Insert Key #1 → RUN → OFF → Remove
2. Within 5 sec: Key #2 → RUN → OFF → Remove
3. Within 10 sec: NEW key → RUN → Hold
4. Security light 3 sec = Success

**Remote:**
Standard Ford 8-cycle OBP procedure

---

## 📊 Quick Reference

| Item | Value |
|------|-------|
| **2008-2012 Chip** | 80-bit |
| **2013-2019 Chip** | 80/128-bit |
| **2020-2024 Chip** | 128-bit |
| **DIY Available** | ✅ With 2 keys |

---

## 📚 Sources

- carandtruckremotes.com • keyless2go.com • programautokeys.com
',
  '{"sources": ["carandtruckremotes.com", "keyless2go.com", "programautokeys.com", "oemcarkeymall.com"], "generated": "2024-12-10", "method": "web_research"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORD MUSTANG (2005-2024)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-mustang-2005-2024',
  'Ford',
  'Mustang',
  2005,
  2024,
  '# 🏎️ Ford Mustang Master Guide (2005-2024)
## Key Programming & Immobilizer Reference

---

## 📋 Overview

The iconic Ford Mustang pony car. The S550 generation (2015+) introduced push-button start and 128-bit security.

> **💡 Pro Tip:** 2015 is the critical year - everything changed. Pre-2015 uses 80-bit, post-2015 uses 128-bit.

---

## 🔐 Transponder Chip Evolution

| Generation | Years | Chip Type |
|------------|-------|-----------|
| **S197** | 2005-2009 | 4D63 (80-bit) |
| **S197 II** | 2010-2014 | 4D63 (80-bit) |
| **S550** | 2015-2022 | H128 (Hitag Pro 128-bit) |
| **S650** | 2024+ | H128 (128-bit) |

---

## 📡 FCC IDs by Generation

| Years | FCC ID | Key Type |
|-------|--------|----------|
| 2005-2009 | CWTWB1U331 | Remote Head |
| 2010-2014 | CWTWB1U793 | Remote Head |
| 2015-2022 | M3N-A2C931426 | Smart Key |
| 2024 | M3N-A3C108397 | Smart Key |

---

## 🔧 Key Information

| Component | S197 (2005-2014) | S550/S650 (2015+) |
|-----------|------------------|-------------------|
| **Blade** | H75 | Emergency blade |
| **Lishi** | FO38 | Limited |
| **Chip** | 80-bit | 128-bit |
| **Battery** | N/A | CR2032 |

---

## ⚙️ Programming Procedures

### 🟢 DIY Remote (2005-2014)

1. Close all doors → Open driver door → Press UNLOCK
2. Turn ignition OFF → RUN 8 times in 10 seconds
3. 🔊 Locks cycle = Programming mode
4. Press button on remote
5. Turn OFF to exit

### 🔴 2015+ Smart Keys

- Requires professional tool (Autel, VVDI)
- Learning slot in cup holder area
- US AKL restrictions apply

---

## 📊 Quick Reference

| Item | 2005-2014 | 2015-2024 |
|------|-----------|-----------|
| **Chip** | 80-bit | 128-bit |
| **DIY** | ✅ Remote + Transponder (2 keys) | ❌ Remote only |
| **Lishi** | FO38 | N/A |
| **Smart Key** | ❌ | ✅ |

---

## 📚 Sources

- locksmithkeyless.com • northcoastkeyless.com • abkeys.com
- carandtruckremotes.com • oemcarkeymall.com
',
  '{"sources": ["locksmithkeyless.com", "northcoastkeyless.com", "abkeys.com", "carandtruckremotes.com", "oemcarkeymall.com", "standardautopart.com"], "generated": "2024-12-10", "method": "web_research"}'
);
