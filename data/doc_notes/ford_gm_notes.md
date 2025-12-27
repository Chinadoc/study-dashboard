# Document Deep Dive Notes: Ford & GM

## Extracted Data Summary

### Ford 2021+ (F-150, Bronco, Mach-E, Expedition)
- **Architecture**: FNV2 / Next-Gen with "Locked BCM".
- **Key Hardware**: 902 MHz frequency for full-size trucks (FCC ID: `M3N-A2C931426`).
- **Cryptographic Shift**: Transition to 128-bit Hitag Pro (ID49).
- **Bypass Method**: Physical 12-pin T-harness connected to the Gateway Module (GWM) behind the glovebox. External 12V power must be supplied to the VCI to prevent BCM monitoring logic from triggering an alarm.

### GM Global B (VIP Platform)
- **Identification**: The "12th Digit Rule" is critical for the 2022 Truck split (Silverado/Sierra). VIN 12th digit ≥ 5 indicates Global B.
- **Protocols**: CAN FD is mandatory. Requires specialized adapters for all diagnostic tools.
- **Security Access**: 24-digit seeds and tokens generated via a "Challenge-Response" server handshake.
- **Staggered Rollout**: Corvette C8 (2020), full-size SUVs (2021), 1500 Trucks (2022.5), HD Trucks (2024).

### Legacy Domestic (2000-2010)
- **Passlock**: No transponder chip in keys; analog voltage based. 30-minute relearn is the only reliable path.
- **Chrysler PCI**: PIN code isolation on the bus. Tools cannot pull PIN via OBD; EEPROM reading from the SKIM remains the standard.

---

## Data Gaps Identfied
- **Ford Mach-E Power Management**: Need more data on "Deep Sleep" mode triggers during AKL.
- **GM Global B "Server-Side" Bypass**: The reliability of third-party PIN brokers for 2024+ models is volatile and needs ongoing monitoring.
- **Chrysler PIN Code Logic**: Exact PCI-to-CAN transition dates for specific trim levels of "Export" models are inconsistent in the docs.

## Research Recommendations
1. **FDRS vs. Aftermarket**: Investigate why OEM FDRS fails more often than Autel in Active Alarm scenarios.
2. **GM ECUs**: Deep dive into the E99 (Corvette) vs. E01 (Trucks) encryption differences.
3. **Ford 902 MHz Range**: Verify if universal 902 MHz fobs exist or if OEM-only is currently required.
