# Legacy & Pre-2005 Technical Notes

## 1. Transponder Reference (1995–2005)

| Chip Type | Technology | Logic | Major Makes | Notes |
|-----------|------------|-------|-------------|-------|
| **4C** | TI Fixed | Fixed | Toyota, Lexus | No OBD AKL (except Lonsdor SKE). Requires EEPROM 93C66. |
| **4D60** | TI Crypto | 40-bit | Nissan, Ford | NATS 5 (Nissan), early PATS (Ford). Weak encryption. |
| **4D67/68** | TI Crypto | 40-bit | Toyota, Lexus | "Dot" Keys. Supports 16-min OBD reset. |
| **ID33** | Fixed | Fixed | Nissan, GM | Early NATS and early GM/Opel. |
| **ID46** | Philips | Hitag 2 | GM, Honda | PK3+ (GM), Type 2/3 (Honda). Sniffing required for cloning. |
| **Megamos 13**| Fixed | Fixed | Honda, GM | Used in early "Red Key" Honda systems. |
| **VATS** | Resistor | Analog | GM | 15 possible resistor values. No chip. |

## 2. Platform Specific Logic

### Toyota/Lexus (Type 1 - 4C)
- **The AKL Trap**: Losing all master keys requires ECU replacement or EEPROM work (virginizing 93C66).
- **Lonsdor Bypass**: Uses SKE (Smart Key Emulator) to force programming via OBD.

### Honda/Acura (Type 1 - Red Key)
- **Red Key System**: Delivery included 1 Red (Learning) and 2 Black (Slave) keys.
- **AKL Recovery**: Requires 93C46 EEPROM reading from the Immobilizer Box or ICU replacement.

### GM Passlock I/II
- **Identification**: No chip symbol on blade. Key is purely mechanical.
- **Requirement**: 30-minute relearn (3 cycles of 10 min) to sync BCM and PCM.

### Ford PATS
- **Evolution**: Transitioned from 4C -> 4D63 (40-bit) -> 4D63 (80-bit).
- **Security Access**: Historically uses a 10-minute timed wait for OBD security access.

## 3. Tool Support Matrix

- **Xhorse Dolphin XP-005**: Superior for decoding worn legacy profiles (TOY43, NSN11, HO01) and cutting by code.
- **Autel IM508/608**: Best for EEPROM recovery (XP400) and GMLAN/Chrysler CAN programming.
- **Lonsdor K518**: Industry leader for Toyota/Subaru AKL via OBD emulation.
- **Xtool IK618**: Stable for Honda ID46 and Nissan NATS.
