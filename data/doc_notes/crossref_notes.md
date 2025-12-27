# Cross-Reference Database Deep Dive Notes

## 💡 Technical Highlights

### 1. The 80-Bit / 40-Bit Duality (Ford)
- **Problem**: Ford keys from 2008-2014 look identical but use different encryption depths.
- **Rule**: Stock only 80-bit chips (marked 'SA' or 'HA'). They are backward compatible with 40-bit systems, but the reverse is not true.

### 2. High-Frequency Ford (902 MHz)
- **Observation**: 2015+ F-150 and modern SUVs use 902 MHz for range and signal penetration.
- **Universal Risk**: Most universal fobs struggle with 902 MHz stability. The **Xhorse XM38 XSFO01EN** is the hardware-optimized solution for these models.

### 3. Toyota H-Chip Cloning
- **Shift**: Previously required expensive LKP-04 chips.
- **Update**: The **XT27 Super Chip** now supports 128-bit H-chip cloning, dramatically reducing per-key cost for the locksmith.

### 4. Nissan "No Key Detected" Issues
- **Cause**: Lower LF sensitivity in universal PCBs relative to OEM Nissan Altima (2019+).
- **Optimization**: Use Xhorse **XSNIS2EN** (specifically for Nissan) rather than generic universal fobs to increase wake-up range.

## ⚠️ Critical Warnings

- **Subaru BIU Risk**: Attempting to program a G-chip Subaru with the wrong protocol can brick the Body Integrated Unit (BIU). Recommend cloning the H-chip via XT27 to avoid OBD connection risks.
- **Toyota Battery Drain**: Xhorse universal keys programmed for 8A (Board ID 0410/2310) often suffer from parasitic drain (2-week battery life). **KeyDIY TB Series** are the preferred alternative for 8A Smart Keys.
- **Honda G vs Toyota G**: Honda "G" keys (ID47) are NOT compatible with Toyota "G" (DST-80). Confirm by chip ID before programming.
