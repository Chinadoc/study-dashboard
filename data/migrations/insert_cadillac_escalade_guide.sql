-- Cadillac Escalade Master Guide (2015-2024)
-- Generated from comprehensive research with verified sources

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'cadillac-escalade-2015-2024',
  'Cadillac',
  'Escalade',
  2015,
  2024,
  '# Cadillac Escalade 2015-2024 Key Programming Master Guide
## Using Autel IM608/IM608 Pro

---

## Overview

The Cadillac Escalade spans two generations: 4th gen (2015-2020, K2XX platform, Global A architecture) and 5th gen (2021-2024, T1XX platform, Global B architecture). The architecture shift between generations significantly impacts key programming - Global A allows straightforward OBD programming, while Global B introduces secure ECM requiring advanced methods for AKL scenarios.

> **Pearl:** The 2021 cutoff is critical. Pre-2021 uses 30-min PK3 relearn and standard OBD tools. Post-2021 requires Global B protocols, CAN FD adapters, and may need bench programming for AKL. Always verify generation before quoting.

---

## Transponder Chip Types by Generation

| Year Range | Generation | Platform | Chip Type | Protocol | Notes |
|------------|------------|----------|-----------|----------|-------|
| 2015-2020 | 4th Gen | K2XX (Global A) | Philips Crypto ID46 | Circle+ | Standard GM protocol; OBD programming |
| 2021-2024 | 5th Gen | T1XX (Global B) | NXP HITAG-PRO ID49 | 128-bit AES | Secure ECM; advanced access required |

**Architecture Differences:**
- **Global A (2015-2020):** Straightforward OBD programming, module communication, key-on/engine-off relearns
- **Global B (2021-2024):** Secure boot ECM, VIN-locked modules, parallel programming required, no module swapping between vehicles

---

## FCC IDs and OEM Part Numbers

### 4th Generation (2015-2020)
| FCC ID | Buttons | OEM Part Numbers | Features |
|--------|---------|------------------|----------|
| HYQ2AB | 6B | 13580812, 13594028, 13598511, 13510242 | Lock/Unlock/Remote Start/Liftgate/Glass Hatch/Panic |
| HYQ2EB | 6B | (variant) | Alternate configuration |

### 5th Generation (2021-2024)
| FCC ID | Buttons | OEM Part Numbers | Features |
|--------|---------|------------------|----------|
| YG0G20TB1 | 6B | 13541571, 13538864, 13546300, 13538866 | Same 6-button layout |

**Memory Seat Support:** Yes - fobs are linked to memory seat positions (#1/#2), automatically recalling driver preferences (seat, mirrors, steering) based on detected fob via passive entry.

---

## Mechanical Key Information

**Emergency Blade:** HU100 across all years (high-security, 10-cut sidebar design)

**Key Codes:** VIN-based from GM databases (V0001-V5573 code series)

**Lishi 2-in-1 Tool:**
- **Tool:** Original Lishi HU100 (10-cut or 8-cut variants)
- **Compatible:** Door, ignition, trunk (GM sidebar locks)
- **Tip:** Anti-glare finish aids visibility; avoid force to prevent damage

> **Pearl:** The sidebar mechanism requires precise picking. For AKL, decode via Lishi before cutting - it saves time if OBD fails.

---

## Battery and Frequency

| Spec | 2015-2020 | 2021-2024 |
|------|-----------|-----------|
| **Battery** | CR2032 | CR2450 |
| **Frequency** | 315 MHz | 315 MHz |

> **Tip:** Dead battery override - place fob directly against START button to start. International variants may use 433/434 MHz.

---

## Autel IM608 Programming

### Menu Path
Diagnostics → GM → Escalade → [Year] → Immobilizer → Add Key / AKL

**2021+ Requirement:** Connect CAN FD adapter for Global B access.

### Add Key Procedure (With Working Key)

1. Connect IM608 to OBD-II port
2. Navigate: GM → Escalade → [Year] → Immobilizer
3. Scan VIN for vehicle identification
4. Select "Add Key" function
5. Follow prompts for chip detection (10-15 min)
6. Press START to sync new fob
7. Test all functions: start, lock, unlock, liftgate, remote start
8. Verify memory seat recall works with new fob

### All Keys Lost (AKL) Procedure

**2015-2020 (Global A - Standard OBD):**
1. Connect IM608 to OBD-II
2. Navigate to AKL function
3. Tool reads BCM/ECM data directly
4. Program new key via OBD
5. Optional: Use 30-min PK3 relearn as backup

**30-Minute PK3 Relearn (2015-2020 Backup):**
1. Insert new programmed key
2. Turn ignition ON (not start)
3. Wait 10 minutes until security light extinguishes
4. Turn OFF, then ON again
5. Wait 10 minutes (security light off)
6. Turn OFF, then ON again
7. Wait 10 minutes (security light off)
8. Turn OFF - vehicle should now start

**2021-2024 (Global B - Advanced Required):**
1. Connect IM608 with CAN FD adapter
2. Attempt OBD AKL function
3. If blocked: May require bench BCM/ECM programming
4. Use ACDP Mini, Yanhua, or send ECM data to third-party service
5. After code calculation, program via tool
6. Clear DTCs and test all functions

> **⚠️ Warning:** 2021+ may require tow to dealer or mobile locksmith with bench capabilities if OBD access fails. No module swapping - parts are VIN-locked.

---

## On-Board Programming (OBP) for Remotes

**Limited OBP Support** - Push-button start systems typically require professional tools.

### 2015-2020 DIC Method (If Available):
1. Unlock door 5x using emergency blade
2. Enter DIC "Remote Learn" mode
3. Press fob buttons to sync
4. Test remote functions

### 2021-2024:
- No true OBP available
- Requires OBD tool or dealer for fob sync
- Proximity detection complicates manual procedures

---

## Critical Alerts

| Alert | Details |
|-------|---------|
| **BCM/ECM Pairing (2021+)** | Modules are VIN-locked in Global B. Replacement requires reprogramming - no swapping between vehicles |
| **Anti-Theft Relearn** | Use 30-min PK3 for 2015-2020; OBD relearn with security code for 2021+ |
| **Firmware Requirements** | 2021+ tools need latest updates for Global B support; older versions may fail |
| **Super Cruise Vehicles** | No key programming differences - Super Cruise uses separate modules unaffected by immobilizer |
| **SGW Bypass** | NOT required for GM - SGW is FCA-specific (RAM/Chrysler). GM uses internal security protocols |

---

## Quick Reference Card

| Item | 2015-2020 (K2XX) | 2021-2024 (T1XX) |
|------|------------------|------------------|
| **Architecture** | Global A | Global B |
| **Chip** | ID46 (Philips Crypto) | ID49 (HITAG-PRO AES) |
| **Key Blank** | HU100 | HU100 |
| **Lishi** | HU100 | HU100 |
| **FCC ID** | HYQ2AB | YG0G20TB1 |
| **AKL Method** | OBD / 30-min relearn | Tool + CAN FD / Bench |
| **OBP Remote** | ⚠️ Limited (DIC) | ❌ Not available |
| **Battery** | CR2032 | CR2450 |
| **Frequency** | 315 MHz | 315 MHz |

---

## Tool Coverage

| Tool | 2015-2020 AKL | 2021-2024 AKL | Notes |
|------|---------------|---------------|-------|
| Autel IM608/IM508 | ✅ Full | ✅ (with CAN FD) | Menu: GM → Escalade → Immobilizer |
| VVDI Key Tool | ✅ Full | ✅ | Supports PCB reading for smart keys |
| Smart Pro | ✅ Full | ⚠️ Partial (updates needed) | By Advanced Diagnostics |
| ACDP Mini | ⚠️ Partial | ✅ Full | Bench flashing for ECM |
| Yanhua | ⚠️ Partial | ✅ Full | For secure module access |
| Xhorse Key Tool | ✅ Full | ✅ | With XM38 keys for GM |
| Lonsdor K518 | ✅ | ✅ | Check firmware version |
| XTOOL D9 | ✅ | ✅ | With proper adapters |

---

## Sources

- locksmithkeyless.com (FCC IDs and smart key specs)
- lost-car-keys-replacement.com (Escalade procedures)
- northcoastkeyless.com (OEM part numbers)
- obdii365.com (Autel programming guides)
- cadillac.com (memory seat features)
- cardone.com (VTD relearn procedures)
- gmtnation.com (Global architecture info)
- YouTube tutorials (programming demonstrations)
',
  '{"sources": ["locksmithkeyless.com", "lost-car-keys-replacement.com", "northcoastkeyless.com", "obdii365.com", "cadillac.com", "cardone.com", "gmtnation.com", "youtube.com", "vvdi.com", "zautomotive.com"], "generated": "2024-12-27", "method": "web_research"}'
);
