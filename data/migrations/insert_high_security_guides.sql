-- High-Security Guide Seeds: GM Global B, Ford Locked BCM, VAG MQB-Evo
-- Surfacing the "Gap" between legacy and next-gen architectures

-- 1. GM: Corvette C8 (2020-2025)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'gm-corvette-c8-2020-2025',
  'Chevrolet',
  'Corvette',
  2020,
  2025,
  '# 🏎️ Chevrolet Corvette C8 Master Guide (2020-2025)
## Global B (VIP) Architecture & E99 Encryption

---

## 📋 Overview
The Corvette C8 was the flagship for GM''s Global B (Vehicle Intelligence Platform). It features high-speed Ethernet and the first fully encrypted E99 ECM.

> **⚠️ CRITICAL:** Programming requires a **CAN FD Adapter** and an **Online Security Token (24-digit)**.

---

## 🔐 Security Context
- **Architecture**: Global B / VIP
- **Handshake**: Dynamic 24-digit response required via server.
- **Protocol**: CAN FD (Standard OBD VCIs will fail).

---

## ⚙️ Key Programming (Add Key)
1. **Hardware**: Connect Autel IM608 (or OEM MDI2) with a CAN FD adapter.
2. **Network**: Ensure a stable high-speed Wi-Fi connection (Phone home required).
3. **Wait Time**: The BCM enters a challenge state. The handshake with the server can take 5-10 minutes.
4. **Authorization**: If using Autel, select "CANFD Smart Key" menu.

---

## 🛡️ All Keys Lost (AKL)
- **Warning**: High risk of module lockout.
- **Method**: Dealer SPS2 is the most stable path.
- **Aftermarket**: Possible via server-side calculation proxy (Autel/OBDSTAR).

---

## 📊 Quick Tech Specs
- **FCC ID**: M3N-A2C140220 / YGOHUF5662
- **Battery**: CR2032
- **Lishi**: HU100 (10-cut)
',
  '{"sources": ["hptuners.com", "autel.com", "chevrolet.com"], "research_phase": "Phase 7"}'
);

-- 2. GM: Silverado 1500 Refresh (2022.5-2025)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'gm-silverado-refresh-2022-2025',
  'Chevrolet',
  'Silverado 1500',
  2022,
  2025,
  '# 🛻 Chevrolet Silverado 1500 Refresh Master Guide (2022.5+)
## Global B Security vs. Limited Legacy

---

## 📋 Overview
GM produced two versions of the 2022 Silverado. The "Refresh" (2022.5) moved to Global B, while the "Limited" stayed on Global A.

---

## 🔍 Identification Logic (The 12th Digit Rule)
Check the **12th Digit** of the VIN:
- **0-4**: Limited (Global A) - Legacy analog interior.
- **5-9**: **Refresh (Global B)** - New digital dash.

---

## ⚙️ Global B Requirements
- **Hardware**: CAN FD Adapter is mandatory.
- **Security**: 24-digit online token required.
- **RPO Code**: Look for **J22** on the B-pillar QR code.

---

## 📊 Quick Tech Specs
- **FCC ID**: TQ8-FOB-4F27 / M3N-A2C140220
- **Chip**: HITAG Pro (ID49)
- **Lishi**: HU100
',
  '{"sources": ["gm-trucks.com", "autelshop.de"], "research_phase": "Phase 7"}'
);

-- 3. FORD: F-150 (2021-2025)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'ford-f150-2021-2025',
  'Ford',
  'F-150',
  2021,
  2025,
  '# 🛻 Ford F-150 Master Guide (2021-2025)
## Locked BCM & Active Theft Security

---

## 📋 Overview
The 14th-gen F-150 uses a "Locked BCM" architecture. In an alarm state, the OBD-II port is disabled by the Gateway Module (GWM).

---

## 🛡️ "Active Theft" Recovery
If you cannot communicate with the vehicle (e.g., All Keys Lost):
- **Option 1**: Wait for the 10-minute alarm cycle to expire.
- **Option 2**: Perform a **Gateway Reset** via a security-authorized tool.
- **Option 3 (Pro)**: Use a **12-Pin Bypass Cable** connected directly to the BCM behind the passenger kick panel.

---

## 🔐 Key Encryption
- **Warning**: 2021+ models use **256-bit AES** encryption.
- **Hardware**: You MUST use keys with FCC ID **M3N-A2C93141200**. Standard 128-bit keys will fail.

---

## 📊 Quick Tech Specs
- **Lishi**: HU101
- **Encryption**: 256-bit AES
- **Programming**: Requires physical 12-pin or SGW bypass.
',
  '{"sources": ["fordtechservice.dealerconnection.com", "autel.us"], "research_phase": "Phase 8"}'
);

-- 4. VAG: Audi A3 / Golf 8 (2020-2025)
INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references")
VALUES (
  'vag-mqb-evo-2020-2025',
  'Audi',
  'A3',
  2020,
  2025,
  '# 🚗 Audi A3 (8Y) / Golf 8 Master Guide (2020+)
## MQB-Evo Platform Security Analysis

---

## 📋 Overview
The MQB-Evo platform introduces advanced cryptographic locks on the BCM2 and Instrument Cluster.

---

## 🛑 The "Sync Data" Blockade
Standard MQB tools (reading CS) will fail on MQB-Evo.
- **Status**: OBD reading of synchronization data is blocked.
- **Requirement**: As of 2024, most technicians require **Online ODIS / SVM** authentication or specialized PCB-level reading.

---

## 🔧 FCC ID Information
- **FS12P**: 315 MHz (North American models).
- **FS12A**: 434 MHz (European / Global models).

---

## 📊 Quick Tech Specs
- **Platform**: MQB-Evo (CD/GY codes)
- **Chip**: Megamos AES (Locked)
- **Blade**: HU162T (9-cut)
',
  '{"sources": ["ross-tech.com", "xhorse.com"], "research_phase": "Phase 9"}'
);
