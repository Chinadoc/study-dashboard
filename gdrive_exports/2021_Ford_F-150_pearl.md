# Technical Compendium: The 2021 Ford F-150 (Generation 14) Security Architecture and Access Control Systems

## 1. Introduction: The Generational Divergence
The automotive industry operates in epochs defined by architectural philosophies. The 2021 F-150 represents a tectonic shift—a "hard fork" from legacy CGEA 1.3 systems to a fully networked, CAN FD-based environment.

## 2. The Digital Nervous System: CAN FD and the Data Revolution
- **2.1 The Physics of CAN FD:** Operates with a dual-phase structure (up to 8 Mbps), rendering legacy J2534 tools obsolete without dedicated adapters.
- **2.2 Gateway Module (GWM):** Acts as a firewall between the OBDII port and internal networks.

## 3. The Active Alarm Lockout
Triggering the alarm creates a "digital deadlock" where the GWM rejects security access requests.
- **3.2 Hardware Bypass:** Requires a specialized Ford Active Alarm Cable connected directly to the GWM (typically driver's side footwell).
- **3.3 Door Latch Trick:** Manually rotating the latch to "closed" can sometimes bypass interior sensors on lower trims.

## 4. Radio Frequency Architecture
- **315 MHz:** FCC ID M3N-A2C93142300 (Smart Key), N5F-A08TAA (Flip Key). Common on XL/XLT.
- **902 MHz:** FCC ID M3N-A2C93142600 (Smart Key), N5F-A08TDA (Flip Key). Common on Lariat and above.

## 5. Immobilizer Logic
- NXP HITAG-PRO ID49 with 128-bit AES encryption. Cloning is ineffective; diagnostic programming is mandatory.
- **"Two Key" Logic:** Two unique keys are required to close an All Keys Lost learning session.

## 6. Mechanical Security: HU198 Internal Track
- Uses the HU198 (HU101-Internal) profile. Requires HU198 Lishi pick.
- Key code series: 11501 - 13000.

## 7. Programming Workflows
- **Autel IM608/Pro II:** Requires CAN FD adapter for Gen 1; native for Gen 2.
- **FDRS (OEM):** Requires VCM3 and NASTF credentials.
- **Onboard Programming:** Possible with 2 working keys using the backup slot (bottom of rear cup holder).

---

## 🚨 CRITICAL ALERTS

### Active Alarm Lockout Risk
- **Level:** CRITICAL
- **Content:** Triggering the alarm creates a "digital deadlock" where the GWM rejects all security access requests. This can brick a job.
- **Mitigation:** Obtain Ford Active Alarm Bypass Cable. Connect directly to GWM in driver's side footwell BEFORE starting programming.

### CAN FD Adapter Requirement
- **Level:** WARNING
- **Content:** Legacy J2534 devices will NOT communicate with Gen 14 F-150 BCM.
- **Mitigation:** Ensure your tool has CAN FD support (Autel IM608 Pro II native, IM608 requires adapter).

---

## 💎 PROGRAMMING PEARLS

1. **Door Latch Trick:** On lower trims (XL/XLT), manually rotating the door latch to "closed" can bypass interior motion sensors and prevent alarm lockout.

2. **Frequency Split is Trim-Dependent:** Base models (XL/XLT) use 315 MHz. Premium trims (Lariat+) use 902 MHz. ALWAYS verify before ordering keys.

3. **Two Keys Required for AKL:** Unlike older Fords, you MUST have two unique keys present to complete an All Keys Lost procedure. A single key will NOT work.

4. **Emergency Key Slot Location:** The backup key slot is hidden at the BOTTOM of the rear cup holder in the center console. Many technicians miss this.

5. **GWM Location:** Gateway Module is in the driver's side footwell, behind the kick panel. This is where the bypass cable connects.

6. **Tool Compatibility Matrix:**
   - Autel IM608 Pro II: Full support (native CAN FD)
   - Autel IM608 (Gen 1): Requires CAN FD adapter purchase
   - SmartPro: Requires Ford SGW cable
   - FDRS: Full OEM support with VCM3

---

## 🔑 MAPPING DATA
- **FCC ID(s):** M3N-A2C93142300, M3N-A2C93142600, N5F-A08TAA, N5F-A08TDA
- **Chip Type:** NXP HITAG-PRO ID49 (128-bit AES)
- **Frequency:** 315 MHz (XL/XLT) or 902 MHz (Lariat+)
- **Keyway/Blade:** HU198 (HU101-Internal, Laser Cut)
- **System Type:** Ford Gen 14 CAN FD + GWM Gateway
- **Battery:** CR2032
- **Lishi Tool:** HU198

## 🛠️ TOOLS & PROCEDURES
- **Preferred Tool:** Autel IM608 Pro II (native CAN FD)
- **Best Method:** Add Key with 2 working keys (Onboard via backup slot)
- **Pincode:** Not required - security handled via two-key logic
- **SGW Bypass:** Required if alarm is active - use Ford Active Alarm Cable
- **Voltage Requirement:** 12.4V minimum, 12.8V recommended
