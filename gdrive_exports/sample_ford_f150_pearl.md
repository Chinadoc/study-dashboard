# 2022 Ford F-150 Locksmith Intelligence

## 🚨 CRITICAL ALERTS (Must Stop Work)
- **Title**: Alarm Active Lockdown
- **Level**: CRITICAL
- **Content**: If alarm is active for >20 seconds, BCM rejects programming for 1 hour.
- **Mitigation**: Ensure alarm is disarmed or wait 1 hour with battery disconnected.

## 💎 PROGRAMMING PEARLS (The "6-8" Key Insights)
1. **Door Latch Requirement**: Driver door latch MUST be in "Closed" position (use screwdriver) even if door is open to prevent timeout.
2. **Hazard Lights**: Turns signals must be OFF during initial comms, but ON during key learning.
3. **CAN FD Adapter**: Verify your tool interface supports CAN FD protocol (pins 6/14 high speed).
4. **Key Count Max**: Max 4 keys allowed. Must erase if full.
5. **Ford Server Check**: Requires live internet connection for server calculation.
6. **Sleep Mode**: If ignition off >30 mins, open/close door to wake up bus before connecting OBD.

## 🔑 MAPPING DATA
- **FCC ID(s)**: M3N-A2C93142600
- **Chip Type**: ID49 (Hitag Pro)
- **Frequency**: 902MHz
- **Keyway/Blade**: HU101
- **System Type**: PEPS (Passive Entry)
- **Battery**: CR2450

## 🛠️ TOOLS & PROCEDURES
- **Preferred Tool**: Autel IM608 Pro
- **Best Method**: Add Key (if 1 working), AKL (requires alarm bypass cable)
- **Pincode**: Rolling code (server calculated)
- **Voltage Requirement**: 13.0V minimum (critical)
