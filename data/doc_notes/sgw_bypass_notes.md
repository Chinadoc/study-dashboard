# Technical Notes: SGW Bypass & VIN-Coded Keys

## Secure Gateway (SGW) Bypasses

The Security Gateway (SGW) acts as a firewall between the OBD-II port and the vehicle's internal CAN network.

### 1. Stellantis (FCA) "12+8" Bypass
- **Cable**: Standard 12+8 pin adapter.
- **Locations**:
    - **Ram 1500 (Classic)**: Behind the Radio Stack (High labor).
    - **Ram 1500 (New Body)**: Driver side knee bolster (Easy access).
    - **Wrangler/Gladiator**: Above the OBD port, behind the dash panel.
    - **Grand Cherokee (WK2)**: Behind the glovebox.
- **Star Connector Alternative**: On Charger/Challenger (2018+), it is often easier to plug into the "Green" Star Connector junction block in the passenger kick panel using a specialized cable (ADC2011).

### 2. Nissan "16+32" Bypass
- **Cable**: 16+32 pin adapter.
- **Procedure**: Connects in-line with the Body Control Module (BCM).
- **Triggers**: Necessary for all 2020+ B18 (Sentra) and T33 (Rogue) platforms. AutoAuth will unlock for diagnostics, but immobilizer writes are often blocked without the physical cable.

### 3. Ford "Active Alarm" Bypass
- **Architecture**: FNV2 (Sync 4).
- **Issue**: Attempting to program keys on an active alarm state (AKL) triggers a GWM lockout.
- **Solution**: Connect a bypass cable to the CAN distribution point (usually near the GWM/BCM) to suppress the alarm signals.

---

## VIN-Coded Key Requirements

In these architectures, the key is pre-programmed at the factory with the vehicle's unique identity hash.

| Manufacturer | System | Requirement | Aftermarket Status |
|--------------|--------|-------------|--------------------|
| **Mercedes** | FBS4   | VIN-Ordered | Locked (Read-Only) |
| **BMW**      | BDC3   | Factory Burn| High Risk (Bench Unlock) |
| **VAG**      | MQB-Evo| ODIS Online | Locked (SFD2) |
| **Porsche**  | 992    | PPN Auth    | Locked (Dealer Key) |

### Pro-Tip: The "RFHub Brick" Prevention
On 2021+ Jeep Grand Cherokee (WL) models, **DO NOT** attempt to read the PIN via OBD even with a bypass. The invasive query often corrupts the RFHub bootloader.
- **Safe Workpath**: Remove RFHub -> Bench Unlock (G-Box3/DC706) -> Reinstall -> Program via OBD.
