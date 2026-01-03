# Comprehensive Security Analysis: 2021 Ford Bronco (U725)
**YEAR_RANGE:** 2021-2024
**A Technical Dossier for Automotive Locksmiths**

---

## 🚨 CRITICAL ALERTS

### Active Alarm GWM Lockout
- **Level:** CRITICAL
- **Condition:** When the alarm is triggered, the Gateway Module (GWM) quarantines the OBD-II port, blocking ALL diagnostic requests. This creates a "digital deadlock" that prevents BCM communication.
- **Mitigation:** Use an Active Alarm Bypass Cable (e.g., Magnus cable) or have owner use FordPass app to send "Unlock" command before attempting programming.

### Hood Latch False Alarm (SSM 51538)
- **Level:** WARNING
- **Condition:** The hood ajar switch is the MOST COMMON cause of false alarms on 2021-2023 Broncos. Corrosion or vibration causes the BCM to receive "Hood Ajar" signal, triggering the alarm unexpectedly.
- **Mitigation:** Check TSB SSM 51538 - may require replacement of hood latch assembly (P/N 16700).

---

## 💎 PROGRAMMING PEARLS

1. **Active Alarm Bypass Cable is MANDATORY for AKL:** Unlike older Fords, you cannot simply "wait out" the alarm. The GWM blocks OBD-II access indefinitely. You MUST have a bypass cable or get the owner to use FordPass.

2. **FordPass App = 100% Alarm Disarm:** If the customer has the FordPass app configured, an "Unlock" command from the app will immediately disarm the alarm AND open the OBD-II firewall for programming.

3. **2-5 Second Boot Window:** When using a bypass cable, you must cycle vehicle power and initiate the programming script during the BCM's 2-5 second boot window to bypass the firewall.

4. **Ultrasonic Sensors on Higher Trims:** Lariat and above have ultrasonic interior sensors in the overhead console. These are sensitive to air movement - warn customers about leaving windows cracked.

5. **Inclination Sensors Detect Jacking:** The RCM (Restraints Control Module) includes inclination sensing. Attempting to jack or tow the vehicle may trigger the alarm and lock out OBD-II.

6. **FORScan PIDs for Alarm Diagnosis:**
   - `ALARM_SRC`: Current trigger source
   - `ALARM_1`: Last historical trigger (crucial for intermittent faults)
   - `HOOD_SW`: Real-time hood switch status

---

## 🔧 ELECTRONIC SECURITY ARCHITECTURE

### Gateway Module (GWM)
Acts as a firewall between OBD-II and internal networks. During an alarm, it blocks non-essential traffic to prevent "CAN Injection" attacks. This is why standard tools fail during active alarms.

### Body Control Module (BCM)
Primary arbitrator for PATS (Passive Anti-Theft System) and Perimeter Alarms. Monitors all sensors and manages immobilization logic.

### Remote Function Actuator (RFA)
Handles PEPS (Passive Entry Passive Start). During active alarm, may reduce key fob polling frequency, making proximity detection unreliable.

---

## 🔑 MAPPING DATA
- **Platform:** U725 / FNV2 (Fully Networked Vehicle)
- **FCC ID:** M3N-A2C931426 (902 MHz Smart Key), M3N-A2C93142600
- **Chip Type:** HITAG-PRO ID49 (128-bit AES)
- **Frequency:** 902 MHz
- **Keyway/Blade:** HU198 (Internal Track Laser Cut)
- **System Type:** Ford PATS with GWM Gateway
- **Battery:** CR2032
- **Lishi Tool:** HU198

## 🛠️ TOOLS & PROCEDURES
- **Preferred Tool:** Autel IM608 Pro II (native CAN FD) with Ford SGW bypass
- **OEM Tool:** FDRS with VCM3 + NASTF credentials
- **Bypass Required:** Active Alarm Bypass Cable (Magnus or equivalent)
- **Two Key Requirement:** Yes - two unique keys required for AKL completion
- **FordPass Integration:** Customer app can disarm alarm remotely

---

## 📋 SENSOR ARRAY

| Sensor Type | Location | Common Issues |
|-------------|----------|---------------|
| Hood Latch | Engine bay | SSM 51538 - corrosion/false triggers |
| Door Switches | All doors + swing gate | Integrated microswitches |
| Ultrasonic | Overhead console (premium) | Sensitive to airflow |
| Inclination | RCM | Triggers on jacking/towing |

---

## 📖 RELEVANT TSBs

| TSB Number | Description | Solution |
|------------|-------------|----------|
| SSM 51538 | Hood ajar intermittent / false alarms | Replace hood latch assembly P/N 16700 |
