-- Supplemental Research Guides: Telluride & Santa Fe
-- Documenting the CAN FD split and Campaign 993 impacts

-- Kia Telluride (2020-2025)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'kia-telluride-2020-2025',
  'Kia',
  'Telluride',
  2020,
  2025,
  '# 🚙 Kia Telluride Master Guide (2020-2025)
## High-Security Architecture & CAN FD Transition

---

## 📋 Overview
The Telluride uses a sophisticated smart key system. A major hardware shift occurred in **June 2023** (MY2024), moving from standard CAN to CAN FD.

> **⚠️ CRITICAL:** 2024+ models require a **CAN FD Adapter** and likely a **Security Gateway (SGW)** bypass.

---

## 🔐 Security Context
| Generation | Years | Network | Hardware Note |
|------------|-------|---------|---------------|
| **Legacy Smart** | 2020-2022 | High-Speed CAN | TQ8-FOB-4F24 |
| **Next-Gen** | 2023-2025 | **CAN FD** | TQ8-FOB-4F27 (Post-06/23) |

---

## 🔧 FCC IDs
- **TQ8-FOB-4F24**: Standard Smart Key (315/433 MHz)
- **TQ8-FOB-4F27**: Next-Gen Smart Key (Digital Key 2.0 compatible)

---

## ⚙️ Programming Procedure
1. **Verify Production Date**: Check B-pillar sticker. If post-06/2023, you MUST use a CAN FD adapter.
2. **Access SGW**: Located above the driver kick panel. Use a 12+8 digital bypass (AutoAuth) or physical cable.
3. **PIN Code**: Reading via OBD is blocked on updated cars. Obtain via NASTF or VSP.
4. **Register Key**: Follow IM608/Smart Pro prompts. Ensure all doors are closed during the handshake.

---

## 🛡️ "Kia Boys" Patch (Campaign 993)
If this is a turn-key model (bladed key), the Campaign 993 update creates a **Virtual Immobilizer**.
- The car will NOT start unless it was unlocked via the Remote Unlock signal.
- If the fob is lost, you must perform a "Disarm" sequence via the tool before the car will allow key registration.

---

## 📊 Quick Tech Specs
- **Chip**: HITAG 3 (ID47)
- **Battery**: CR2032
- **Lishi**: HYN14R / KK12
',
  '{"sources": ["kiatechinfo.com", "nastf.org", "autel.com"], "generated": "2024-12-21", "research_phase": "Phase 5"}'
);

-- Hyundai Santa Fe (2019-2025)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'hyundai-santafe-2019-2025',
  'Hyundai',
  'Santa Fe',
  2019,
  2025,
  '# 🚙 Hyundai Santa Fe Master Guide (2019-2025)
## CAN FD & SGW Architecture Study

---

## 📋 Overview
The Santa Fe transitioned to the **CAN FD** network architecture for the 2024 model year (NX4 platform).

---

## 🔐 Network Topology
- **2019-2023**: Standard CAN. IM608/Smart Pro works via OBD (with SGW bypass).
- **2024-2025**: **CAN FD**. Mandatory adapter requirement (e.g. Autel CAN FD Adapter).

---

## 🔧 Programming Notes
- **SGW Bypass**: Required for all 2021+ models.
- **PIN Hardening**: 2023+ server-side calculation only.
- **"Virtual Immobilizer"**: Active on all patched 2011-2022 mechanical key models.

---

## 📊 Quick Tech Specs
- **FCC ID**: TQ8-FOB-4F27 (2024+)
- **Chip**: ID47 (AES)
- **Blade**: HYN14R
',
  '{"sources": ["hyundaitechinfo.com", "advanced-diagnostics.com"], "generated": "2024-12-21", "research_phase": "Phase 5"}'
);
