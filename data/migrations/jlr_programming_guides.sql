-- JLR (Jaguar Land Rover) Programming Guides
-- Source: JLR_Security_Architecture_Deep_Dive.txt + jlr_security_architecture.sql
-- Date: 2025-12-27

-- ============================================================================
-- Insert JLR Vehicle Guides with Actual Programming Content
-- ============================================================================

INSERT OR REPLACE INTO vehicle_guides (id, make, model, year_start, year_end, content, "references", created_at) VALUES

-- Jaguar XE/XF/F-Pace (2018-2025)
('jlr_jaguar_xe_2018_2025', 'Jaguar', 'XE', 2018, 2025, 
'## Jaguar XE Key Programming Guide (2018-2025)

### Overview
The Jaguar XE uses IMMO 4/5 generation security with ID88 Hitag Pro chip. Push-button start with passive keyless entry standard on all models.

### Key Information
- **FCC ID:** KOBJTF10A (2018-2020), K8D2 (2021+)
- **Chip Type:** ID88 Hitag Pro (2018-2020), ID88 + UWB (2021+)
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032
- **OEM Part#:** T4K8898 (2018-2020), LR139982 (2021+)

### Required Tools
- Lonsdor K518 or Autel IM608 Pro
- Stable 12V power supply (CRITICAL)
- AutoAuth or JLR SDD subscription for dealer bypass

### AKL Procedure
1. **Connect Battery Maintainer** - Ensure 13.5V+ stable power
2. **Access RFA Module** - Located behind glovebox or under center console
3. **Identify RFA Generation** - IMMO 3 vs IMMO 4/5 determines procedure
4. **Run AutoAuth or Server Authorization** - Required for key slot unlock
5. **Insert New Key and Start Learn Mode**
6. **Wait 5-10 minutes** for key sync completion

### Critical Warnings
⚠️ **JLR 2025 CYBERATTACK IMPACT**: Server availability may be intermittent. Have backup authorization method ready.
⚠️ **VOLTAGE CRITICAL**: Programming with low battery voltage (<12.5V) can corrupt RFA module permanently.
⚠️ **UWB Models (2021+)**: Additional calibration required for ranging sensors.

### Notes
- First key must be programmed via dealer SDD if zero keys present
- Aftermarket keys available but OEM recommended for warranty vehicles
- Active Alarm can lock out OBD access - disarm first with door code
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

('jlr_jaguar_xf_2018_2025', 'Jaguar', 'XF', 2018, 2025,
'## Jaguar XF Key Programming Guide (2018-2025)

### Overview
The Jaguar XF uses D7u/D7a platform with IMMO 4/5 generation. Similar architecture to XE but with some differences in module location.

### Key Information
- **FCC ID:** KOBJTF10A (2018-2020), K8D2 (2021+)
- **Chip Type:** ID88 Hitag Pro (2018-2020), ID88 + UWB (2021+)
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032
- **Lishi Tool:** HU101

### Required Tools
- Lonsdor K518 or Autel IM608 Pro
- Battery maintainer (13.5V+ stable)
- JLR SDD or AutoAuth subscription

### AKL Procedure
1. **Power Stabilization** - Connect battery maintainer
2. **Disable Active Alarm** - Use hidden door code if available
3. **Connect to OBD-II** - Behind driver kick panel
4. **Identity RFA Module Generation**
5. **Initiate Server Authorization** 
6. **Program New Key** - Process takes 5-10 minutes

### Critical Warnings
⚠️ **RFA BRICKING RISK**: Do NOT interrupt programming once started
⚠️ **IMMO 3 vs IMMO 4/5**: Different procedures - verify platform before starting
⚠️ **2021+ Models**: Longer authorization time due to enhanced security

### Notes
- Pre-2018 models use different IMMO generation
- Key blade is HU101 for manual door entry
- Maximum 8 keys can be programmed
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

('jlr_jaguar_fpace_2017_2025', 'Jaguar', 'F-Pace', 2017, 2025,
'## Jaguar F-Pace Key Programming Guide (2017-2025)

### Overview
The F-Pace is built on the D7u (2017-2020) and D7a (2021+) platforms. Uses IMMO 4 (before 2021) and IMMO 5 (2021+) security.

### Key Information
- **FCC ID:** KOBJTF10A (2017-2020), K8D3 (2021+)
- **Chip Type:** ID88 Hitag Pro, UWB on 2021+
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032
- **OEM Part#:** T4A12745, C2D51452 (early)

### Required Tools
- Autel IM608 Pro / MaxiSYS Ultra
- Lonsdor K518 (Best for 2021+)
- Battery maintainer mandatory

### AKL Procedure
1. Connect stable 12V power (13.5V+)
2. Access OBD-II port (behind lower dash)
3. Identify platform via VIN (D7u vs D7a)
4. For D7u: Standard IMMO 4 procedure
5. For D7a: Server authorization + extended wait
6. Follow on-screen prompts for key learning
7. Verify all keys work after programming

### Critical Warnings
⚠️ **SVR MODELS**: Higher security tier, dealer procedure may be required
⚠️ **ACTIVE ALARM**: Must be disabled before OBD access
⚠️ **2021+ TIMEOUT**: Authorization can take 15-20 minutes

### Notes
- RFA module location varies by year
- Door unlock code available in owner documentation
- Hybrid models have same key system as ICE
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

('jlr_jaguar_ipace_2019_2025', 'Jaguar', 'I-Pace', 2019, 2025,
'## Jaguar I-Pace Key Programming Guide (2019-2025)

### Overview
The I-Pace is Jaguar''s all-electric vehicle on the MLA platform. Uses latest IMMO 5 security with UWB positioning for all model years.

### Key Information
- **FCC ID:** T4A42805A (Activity Key), K8D3
- **Chip Type:** ID88 + UWB (Ultra Wideband)
- **Frequency:** 315 MHz + UWB
- **Battery:** CR2032 (key fob), Rechargeable (Activity Key)

### Required Tools
- Lonsdor K518 (Best coverage)
- Autel MaxiSYS Ultra
- Factory JLR SDD for complex issues
- High-voltage safety equipment for EV access

### AKL Procedure (Special EV Considerations)
1. **HV SAFETY FIRST** - Ensure vehicle is in service mode
2. Disable HV system per JLR procedure
3. Connect 12V maintainer to auxiliary battery
4. Access OBD-II port
5. Run server-based authorization
6. Program new key (extended wait times)
7. Verify both fob and Activity Key functions

### Critical Warnings
⚠️ **EV-SPECIFIC**: Must disable HV system before any under-hood work
⚠️ **ACTIVITY KEY**: Waterproof wearable key requires separate programming
⚠️ **UWB CALIBRATION**: Required after key programming for accurate ranging

### Notes
- Activity Key designed for water/outdoor sports
- Phone Key may be available as backup
- 12V battery access requires specific panel removal
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

-- Land Rover / Range Rover 
('jlr_landrover_rangerover_2018_2025', 'Land Rover', 'Range Rover', 2018, 2025,
'## Range Rover Key Programming Guide (2018-2025)

### Overview
The flagship Range Rover uses the most advanced JLR security. 2022+ models use the MLA platform with full UWB integration.

### Key Information
- **FCC ID:** KOBJTF10A (L405), K8D2/K8D3 (L460)
- **Chip Type:** ID88 Hitag Pro, ID88 + UWB (2022+)
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032

### Required Tools
- Autel MaxiSYS Ultra (best L460 coverage)
- Lonsdor K518 (good L405 coverage)
- JLR SDD for dealer-level access
- Battery maintainer (CRITICAL)

### AKL Procedure
1. Verify platform (L405 vs L460 via VIN)
2. Connect battery maintainer before starting
3. For L405: Standard IMMO 4/5 procedure
4. For L460: Enhanced server authorization required
5. Allow 15-30 minutes for full sync
6. Test all functions: lock/unlock, start, tailgate

### Critical Warnings
⚠️ **L460 (2022+)**: Customer approval may require owner verification
⚠️ **AUTOBIOGRAPHY/SVR**: Highest security tier
⚠️ **CYBERATTACK IMPACT**: Server delays possible

### Notes
- Activity Key available for off-road/water activities
- Gesture tailgate may require recalibration
- Maximum 8 keys per vehicle
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

('jlr_landrover_rangerover_sport_2018_2025', 'Land Rover', 'Range Rover Sport', 2018, 2025,
'## Range Rover Sport Key Programming Guide (2018-2025)

### Overview
Range Rover Sport shares platform with Range Rover. L461 (2023+) uses new MLA architecture.

### Key Information
- **FCC ID:** KOBJTF10A (L494), K8D2 (L461)
- **Chip Type:** ID88 Hitag Pro, UWB on 2023+
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032
- **Lishi Tool:** HU101

### Required Tools
- Autel IM608 Pro / MaxiSYS Ultra
- Lonsdor K518
- JLR SDD subscription recommended

### AKL Procedure
1. Identify platform: L494 (2018-2022) vs L461 (2023+)
2. Connect battery maintainer
3. Disable active alarm if triggered
4. Connect to OBD-II
5. L494: Standard server authorization
6. L461: Enhanced verification required
7. Complete key learning sequence

### Critical Warnings
⚠️ **SVR VARIANT**: Additional security layer
⚠️ **L461 ARCHITECTURE**: Longer wait times for authorization
⚠️ **HYBRID MODELS**: Same key system but verify power state

### Notes
- Dynamic Response Pro suspension may need reset after battery work
- Keep backup authorization method
- Activity Key available as option
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

('jlr_landrover_discovery_2017_2025', 'Land Rover', 'Discovery', 2017, 2025,
'## Land Rover Discovery Key Programming Guide (2017-2025)

### Overview
Discovery 5 (L462) platform. Uses IMMO 4/5 security depending on year.

### Key Information
- **FCC ID:** KOBJTF10A
- **Chip Type:** ID88 Hitag Pro
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032
- **OEM Part#:** LR078922

### Required Tools
- Autel IM608 Pro
- Lonsdor K518
- Battery maintainer

### AKL Procedure
1. Connect battery maintainer (13.5V+)
2. Locate OBD-II port (driver footwell)
3. Access RFA module (varies by configuration)
4. Initiate server authorization
5. Follow tool prompts for key learning
6. Test all key functions

### Critical Warnings
⚠️ **TERRAIN RESPONSE**: May need reset after power interruption
⚠️ **AIR SUSPENSION**: Park on level ground during programming
⚠️ **7-SEATER ACCESS**: Third row controls may need reset

### Notes
- Discovery Sport uses different platform/procedure
- Ingenium diesel engines same key system
- Maximum 8 keys
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

('jlr_landrover_defender_2020_2025', 'Land Rover', 'Defender', 2020, 2025,
'## Land Rover Defender Key Programming Guide (2020-2025)

### Overview
New Defender (L663) on D7x platform. Most rugged JLR vehicle with enhanced water/dust ingress protection.

### Key Information
- **FCC ID:** K8D2, K8D3
- **Chip Type:** ID88 Hitag Pro + UWB
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032

### Required Tools
- Lonsdor K518 (Best coverage)
- Autel MaxiSYS Ultra
- Battery maintainer
- JLR SDD for complex issues

### AKL Procedure
1. Ensure vehicle is in accessible location
2. Connect battery maintainer
3. OBD port behind panel (IP65+ rated)
4. Server authorization (D7x platform)
5. Extended wait for key sync
6. Verify all functions including wade sensing

### Critical Warnings
⚠️ **WADE SENSING**: May need reset after battery disconnect
⚠️ **EXPEDITION/TROPHY**: Higher security variants
⚠️ **REMOTE ROOF OPERATION**: Test after programming

### Notes
- Activity Key highly recommended for Defender owners
- Phone Key backup available
- ClearSight mirrors may need recalibration
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP),

('jlr_landrover_evoque_2018_2025', 'Land Rover', 'Evoque', 2018, 2025,
'## Range Rover Evoque Key Programming Guide (2018-2025)

### Overview
Evoque L551 (2020+) on PTA platform. More compact but uses same IMMO 4/5 security.

### Key Information
- **FCC ID:** KOBJTF10A (L538), T4A42805A (L551)
- **Chip Type:** ID88 Hitag Pro
- **Frequency:** 315 MHz (US), 433 MHz (EU)
- **Battery:** CR2032

### Required Tools
- Autel IM608 Pro
- Lonsdor K518
- Battery maintainer

### AKL Procedure
1. Identify generation: L538 (2012-2019) vs L551 (2020+)
2. Connect battery maintainer
3. Access OBD-II port
4. For L551: PTA platform requires extended authorization
5. Complete key learning
6. Test all functions

### Critical Warnings
⚠️ **L551 (2020+)**: ClearSight Mirror camera may need recalibration
⚠️ **HYBRID (P300e)**: Verify 12V battery state
⚠️ **CONVERTIBLE**: Same key system as hardtop

### Notes
- More accessible than larger Range Rovers
- Activity Key available as option
- Maximum 8 keys per vehicle
', 'JLR_Security_Architecture_Deep_Dive.txt, jlr_security_architecture.sql', CURRENT_TIMESTAMP);

-- Verify insertion
SELECT 'JLR Programming Guides Inserted' AS status, COUNT(*) AS guide_count FROM vehicle_guides WHERE make IN ('Jaguar', 'Land Rover');
