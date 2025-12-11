-- Integrate BMW Reference Document - Part 5
-- MINI & 1-Series Advanced Data

-- ═══════════════════════════════════════════════════════════════════════════
-- MINI COOPER - Advanced (Updated)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'mini-cooper-2002-2024',
  'MINI',
  'Cooper',
  2002,
  2024,
  '# MINI Cooper 2002-2024 Master Programming Guide
## Small Car, Big Security

---

## Overview

MINI R56 is notorious for **FRM3 failures**.

> 💡 **Business Strategy:**
> - **Spare Key:** $250 - $350
> - **FRM Repair:** $200 - $300 (Very common on R56)

---

## Generation Breakdown

### R50/R53 (2002-2006) - EWS
| Spec | Value |
|------|-------|
| System | **EWS3** |
| Keyway | **HU100** (Early) / **HU92** |
| Chip | ID44 |

### R56 (2007-2015) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3 / CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 |
| **Issue** | **FRM3 Failure** (Footwell Module). Windows/Lights die after battery change. |

### F56 (2014+) - BDC
| Spec | Value |
|------|-------|
| System | **BDC** |
| Keyway | **HU100R** |
| Chip | ID49 |
| **Procedure** | **Preprocessing Required.** Same as BMW F-Series. |

---

## Troubleshooting & Repairs

| Issue | System | Fix |
|-------|--------|-----|
| **FRM3 Dead** | R56 | Read D-Flash with VVDI Prog. Use "Partition Repair". |
| **ELV Lock** | R56 | "Steering Lock" error. Use Emulator or reset counter. |

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide", "bmw_update_rtf"], "generated": "2024-12-11", "method": "reference_doc_v2"}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- BMW 1-SERIES - Advanced (Updated)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'bmw-1-series-2008-2024',
  'BMW',
  '1-Series',
  2008,
  2024,
  '# BMW 1-Series / 2-Series Master Programming Guide
## Entry Level, Pro Security

---

## Overview

The 1-Series (F20) and 2-Series (F22) use **FEM**.

> 💡 **Pearl:** 1-Series FEM is physically smaller but electronically identical to 3-Series FEM.

---

## Generation Breakdown

### E82/E88 (2008-2013) - CAS3
| Spec | Value |
|------|-------|
| System | **CAS3+** |
| Keyway | **HU92** |
| Chip | ID46 |

### F20/F22 (2014-2021) - FEM
| Spec | Value |
|------|-------|
| System | **FEM** |
| Keyway | **HU100R** |
| Chip | ID49 |
| **Procedure** | **Bench Preprocessing.** Remove FEM, read 95128, write Service File. |

---

## Detailed Procedures

### 🔧 FEM Bench Unlock (ACDP)
1. **Remove FEM** (Passenger kick panel).
2. **Install Module 2** (Clip on 95128).
3. **Read EEPROM**.
4. **Write Service File**.
5. **Flash** on bench.
6. **Restore Original EEPROM**.
7. **Add Key**.

---

*Last Updated: December 2025*
',
  '{"sources": ["bmw_locksmith_guide", "bmw_update_rtf"], "generated": "2024-12-11", "method": "reference_doc_v2"}'
);
