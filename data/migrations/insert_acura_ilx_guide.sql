-- Acura ILX 2013-2022 Master Programming Guide
-- Comprehensive smart key programming reference with AKL support
-- Based on locksmith field data and tool compatibility research

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'acura-ilx-2013-2022',
  'Acura',
  'ILX',
  2013,
  2022,
  '# Acura ILX 2013-2022 Key Programming Master Guide
## Smart Key / Proximity System Reference

---

## Overview

The Acura ILX is a compact luxury sedan using Honda''s **proximity key fob (smart key)** system with push-button start. This guide covers all model years with accurate transponder chips, FCC IDs, and programming procedures.

> 💡 **Pearl:** The 2021 ILX uses **ID47 (HITAG3 AES)** - NOT ID4A. This chip is **non-clonable**; new keys must be generated via OBD tool.

---

## Required Equipment

| Item | Notes |
|------|-------|
| **Autel IM608 / IM608 Pro** | Most popular for Honda/Acura; AKL in ~10-20 minutes |
| **Autel IM508 + XP400 Pro** | Budget alternative with full support |
| **Xhorse VVDI Key Tool Plus** | Full AKL support |
| **Lonsdor K518** | Quick programming |
| **Autel KM100** | Quick for some models |
| **New Programmable Proximity Fob** | See FCC/Part table below |
| **CR2032 Battery** | Replace before programming |

---

## Transponder Chip Specifications

| Years | Chip Type | Protocol | Clonable |
|-------|-----------|----------|----------|
| 2013-2015 | ID46 (PCF7952) | HITAG 2 | ⚠️ Limited |
| 2016-2022 | **ID47 (HITAG3 AES)** | 128-bit AES | ❌ No |

> ⚠️ **Critical:** ID47 chips are encrypted and **non-clonable**. Do not attempt cloning on 2016+ models - OBD generation only.

---

## Programming Requirements

| Requirement | Value |
|-------------|-------|
| **On-Board Programmable** | ❌ No |
| **Method** | OBD-II diagnostic programming only |
| **Add Key** | Requires at least one working key for most tools; otherwise use AKL mode |
| **All Keys Lost (AKL)** | ✅ Supported (not dealer-only) |
| **PIN/Immobilizer Code** | ❌ No PIN required for most aftermarket tools (direct generation via OBD) |

---

## FCC IDs by Year

### 4-Button Smart Keys (No Remote Start)

| Years | FCC ID | OEM Part # | Frequency | Driver |
|-------|--------|------------|-----------|--------|
| 2013-2015 | KR5434760 | 72147-TX6-A01 | 315 MHz | - |
| 2016-2018 | KR5V1X | 72147-TZ3-A01 | 315 MHz | Driver 1 |
| 2016-2018 | KR5V1X | 72147-TZ3-A11 | 315 MHz | Driver 2 |
| 2019-2022 | KR5V2X | 72147-TZ3-A21 | 433-434 MHz | Driver 1 |
| 2019-2022 | KR5V2X | 72147-TZ3-A31 | 433-434 MHz | Driver 2 |

### 5-Button Smart Keys (With Remote Start)

| Years | FCC ID | OEM Part # | Frequency | Notes |
|-------|--------|------------|-----------|-------|
| 2016-2022 | KR580399900 | 72147-TZ3-A51 | 902 MHz | Driver 1, Remote Start |

> 💡 **Part Number Variants:** A21 = Driver 1 memory, A31 = Driver 2 memory. Aftermarket keys often ship as "universal" for these.

---

## Emergency/Mechanical Key Details

| Spec | Value |
|------|-------|
| **Integrated Emergency Blade** | ✅ Yes (high-security side-milled) |
| **Blade Profile** | HON66 (8-cut) |
| **Lishi Tool** | HON66 2-in-1 Pick & Decoder |
| **Cutting Notes** | Use standard HON66 key machine or Silca blanks (e.g., HON66-CP) |

> 📍 **AKL Jobs:** Often require originating a mechanical key for door/glovebox access.

---

## Proximity & Emergency Start Notes

| Feature | Details |
|---------|---------|
| **System Type** | Full proximity (passive entry + push-button start) |
| **Dead Battery Start** | Hold key fob directly against push-button start |
| **Prox Calibration** | Usually automatic after programming; test walk-away locking |
| **Max Keys** | 8 keys can be registered |

---

## Cross-Compatibility

| This Key | Also Fits |
|----------|-----------|
| KR5V2X (2019-2022 ILX) | 2018-2021 TLX in many cases |

---

## Autel IM608 Programming Procedure

### Add Key (With Working Key)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Acura → ILX → [Year]
3. **Select:** Immobilizer → Smart Key → Add Key
4. **Follow prompts** for ignition cycling
5. **Place new key** inside vehicle when prompted
6. **Verify** start and remote functions
7. **Initialize** all doors/handles for passive entry

**Total Time:** 5-10 minutes

### All Keys Lost (AKL)

1. **Connect IM608** to OBD-II port
2. **Navigate:** Acura → ILX → [Year]
3. **Select:** All Keys Lost
4. **Cut emergency blade** using HON66 Lishi or code machine
5. **Follow OBD prompts** - tool calculates and generates key
6. **Test** all functions including passive entry

**Total Time:** 15-45 minutes (depending on tool and year)

---

## Common Issues / Pro Tips

| Issue | Solution |
|-------|----------|
| Frequency tolerance | 433-434 MHz interchangeable in practice |
| After programming | Initialize all doors/handles for passive entry |
| AKL time estimate | 15-45 minutes with proper tool |
| No remote start | Base 4-button version does not include remote start |
| "Key not detected" | Check battery, try holding fob to start button |
| 2016 chip change | ID46 → ID47 transition; verify before ordering chips |

---

## Quick Reference Card

| Spec | Value |
|------|-------|
| **Years** | 2013-2022 |
| **Key Type** | Smart Key / Proximity |
| **Blade** | HON66 |
| **Lishi** | HON66 2-in-1 |
| **Chip (2013-15)** | ID46 (PCF7952) |
| **Chip (2016-22)** | ID47 (HITAG3 AES) |
| **Frequency** | 315 MHz (2013-18), 433 MHz (2019-22), 902 MHz (Remote Start) |
| **Battery** | CR2032 |
| **PIN Required** | No |
| **AKL Supported** | Yes |
| **Programming** | OBD-II Only |

---

## Sources

- OEM catalogs and FCC filings
- Autel IM608 coverage database
- Xhorse VVDI compatibility list
- Field technician reports

---

*Last Updated: December 2025*
',
  '{"sources": ["oem_locksmith_catalog", "fcc_filings", "autel_coverage", "field_reports"], "generated": "2024-12-16", "method": "integrated_reference"}'
);
