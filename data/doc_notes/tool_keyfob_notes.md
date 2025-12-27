# Tool Coverage & Key Fob Technical Notes (2010–2025)

## 1. High-Risk "Red Alert" Vehicles
The following vehicles possess high-liability scenarios where incorrect programming attempts or voltage fluctuations can "brick" the BCM/RF Hub.

| Vehicle | Risk Level | Reason | Mitigation |
| :--- | :--- | :--- | :--- |
| **2022+ Honda Civic / Integra** | 🔴 CRITICAL | Extremely sensitive BCM firmware; prone to bricking during server-auth handshake. | Use Smart Pro (ADS2336) or ODIS. Maintain strictly 13.6V+ with a formal Maintainer. |
| **2021+ Jeep Grand Cherokee L / Wagoneer** | 🔴 CRITICAL | RF Hub locks permanently ("Write Once") after initial setup. | OBD AKL is impossible. Must replace RF Hub with virgin unit or perform advanced bench unlock/wipe. |
| **2021+ Ford F-150 / Bronco** | 🟡 MEDIUM | Active Alarm blocks OBDII port communication. | Use specialized Alarm Bypass Cable to battery or software silencer (Smart Pro). |

---

## 2. Stellantis "Verify by VIN" Logic (Sales Codes)
There is no linear VIN series chart for 2022+ Jeep Compass (MP). Verification must be performed by extracting **Sales Codes** from the Build Sheet.

### The Compass (MP) Logic Matrix
| Feature | Sales Code | Requirement |
| :--- | :--- | :--- |
| **Push-to-Start** | **GX4** | Mandatory for Proximity Smart Keys. |
| **Remote Start** | **XBM** | Differentiates 3-button vs 4/5-button keys. |
| **Power Liftgate** | **JRC** | Differentiates 4-button vs 5-button (Double-Tap) keys. |

**Data Sanitization Note**: FCC ID `GQ4-54T` is a common catalog error for the Compass. It exclusively belongs to the Cherokee (KL). The Compass exclusively uses `M3N-40821302`.

---

## 3. Toyota Board ID Mapping
Toyota uses the same FCC ID (`HYQ14FBA`) for incompatible board generations. Visual PCB inspection or Part Number verification is mandatory.

| PCB Board ID | Generation | Chip ID | Compatible Models |
| :--- | :--- | :--- | :--- |
| **0020** | Legacy "G" | 4D-G (80-bit) | 2012–2020 Prius C, 2013–2018 RAV4 |
| **2110 (AG)** | High-Security "H" | 8A "H" (128-bit)| 2014–2019 Highlander, 2016–2020 Tacoma |

---

## 4. Frequency Architecture Trends
*   **315 MHz**: Legacy North American standard. Crowded spectrum (interference prone).
*   **433/434 MHz**: Global standard (VAG, Volvo, 2020+ Nissan, 2022+ Jeep). Better signal penetration.
*   **902 MHz**: Ford "High-Security" band (2015+ F-150). Lowest congestion; allows extreme range for remote start.

---

## 5. Tool Toolchain Recommendations
1.  **Autel IM608 Pro II**: Best for bench work (BMW, Mercedes, Toyota AKL) and deep EEPROM.
2.  **Smart Pro**: Safest/Fastest for OBD solutions (Ford, GM, Chrysler).
3.  **Lonsdor K518**: Essential for Volvo (OBD access) and Subaru/Toyota specialists.
4.  **VVDI Key Tool Plus**: Best for VAG/BMW and generating universal remotes (Super Chips).
