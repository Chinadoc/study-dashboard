-- Migration generated from Google Docs exports

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Vehicle SGW Access and Key Programming', 'Global', 'Secure Gateway', 2010, 2024, '

# The Fortified Chassis: A Comprehensive Technical Analysis of Secure Gateway Architectures and Access Protocols in FCA, Nissan, and Ford Vehicles (2018–2025)

## 1. Introduction: The Cybersecurity Paradigm Shift in Automotive Diagnostics

The automotive industry is currently navigating a profound structural transformation in vehicle architecture, marking the end of the "open access" era that began with the standardization of the On-Board Diagnostics (OBD-II) protocol in 1996. For over two decades, the Data Link Connector (DLC) served as a universal, unrestricted portal into the vehicle''s neural network, granting aftermarket technicians, locksmiths, and engineers direct read/write access to the Controller Area Network (CAN). However, the digitization of the modern automobile—characterized by always-on cellular connectivity, Over-the-Air (OTA) update capabilities, and autonomous driving features—introduced a critical vulnerability: the potential for remote cyberattacks.

Following high-profile demonstrations of remote vehicle hijacking, most notably the 2015 Jeep Cherokee hack which exposed vulnerabilities in the Uconnect telematics system 1, manufacturers began aggressive countermeasures. The industry''s response was the introduction of the Secure Gateway Module (SGW). First implemented by Fiat Chrysler Automobiles (FCA) in 2018, and subsequently adopted by Nissan (2020) and Ford (2021), the SGW functions as a cryptographic firewall. It physically and logically segregates the vehicle''s external access points (the DLC and telematics units) from the internal private networks (CAN-C, CAN-IHS) that control critical vehicle functions.2

This report provides an exhaustive technical analysis of these security architectures. It details the physical locations of SGW modules across key model years, delineates the specific bypass methodologies required for aftermarket service—ranging from software authentication (AutoAuth) to physical hardware intervention (12+8 or 16+32 cables)—and provides a specialized procedural guide for the complex "All Keys Lost" scenarios in modern Jeep architectures. The data presented herein is critical for locksmiths, diagnostic technicians, and shop owners to maintain service capabilities on 2018–2025 rolling stock.

![Image](/api/assets/Vehicle_SGW_Access_and_Key_Programming_image1_png.png)

### 1.1 The Mechanism of Exclusion

The Security Gateway Module is not merely a filter; it is a traffic warden that enforces a strict policy of "authentication before authorization." In a pre-SGW architecture, a scan tool connected to the OBD-II port became a node on the network, able to broadcast frames to any module. In an SGW-equipped vehicle, the OBD-II port connects only to the SGW. The module inspects every incoming packet.

The operational logic is bifurcated:

1. Public Sector Access: The DLC and Telematics units reside in the public sector. The SGW allows "Read-Only" traffic (generic OBD-II P-codes, Live Data viewing) to pass from the public to the private sector without hindrance. This ensures that emissions testing and basic troubleshooting remain accessible.2
1. Private Sector Access: The Body Control Module (BCM), Powertrain Control Module (PCM), Radio Frequency Hub (RFHub), and other critical control modules reside in the private sector. Any command that attempts to write data—clearing Diagnostic Trouble Codes (DTCs), initiating bi-directional actuator tests, performing adaptations, or programming keys—is blocked by default. To execute these commands, the scan tool must present a valid cryptographic certificate signed by the OEM.3

### 1.2 The Aftermarket Response: Software vs. Hardware

The service industry has adapted through two primary solution paths, each with distinct advantages and limitations dependent on the technician''s objective (e.g., simple repair vs. key programming).

#### 1.2.1 Software Authentication (AutoAuth)

The preferred method for general diagnostics is a cloud-based handshake known as AutoAuth. This system allows Wi-Fi-enabled aftermarket scan tools (such as those from Snap-on, Autel, or Launch) to communicate with the OEM''s authentication server.

- Process: The tool sends its serial number and the user''s credentials to the AutoAuth server. If verified, the server acts as a bridge, sending an unlock signal to the vehicle''s SGW via the scan tool''s internet connection.
- Limitation: This requires an active internet connection and a paid annual subscription. Crucially, for high-risk operations like Key Programming (All Keys Lost), software authentication is often insufficient or unsupported by certain immobilizer programmers, necessitating a physical bypass to ensure a stable, uninterrupted data stream.3

#### 1.2.2 Physical Bypass (Man-in-the-Middle)

For operations where AutoAuth is unavailable (e.g., using offline tools, older programmers, or performing deep EEPROM work), technicians must physically circumvent the SGW. This involves locating the module, disconnecting its input/output harnesses, and inserting a bypass device.

- The Hardware: The "12+8 Bypass Cable" (for FCA) or "16+32 Cable" (for Nissan) physically bridges the public and private networks, effectively removing the firewall from the loop. This grants the tool direct, unmonitored access to the CAN bus, identical to the pre-2018 architecture.1

## 2. FCA / Stellantis: The Progenitor of the Firewall (2018–2025)

Fiat Chrysler Automobiles (now Stellantis) was the pioneer of the Secure Gateway, implementing it universally across its lineup faster than any other manufacturer. By 2019, nearly every vehicle bearing the Ram, Jeep, Dodge, or Chrysler badge was equipped with an SGW, necessitating immediate adaptation by the locksmith and repair communities. For FCA vehicles, the physical location of the module varies wildly by platform, creating a complex landscape for technicians.

### 2.1 The "12+8" Architecture and Diagnostic Implications

The standard FCA SGW module utilizes two primary connectors: a 12-pin connector and an 8-pin connector. The aftermarket "12+8 Bypass Cable" is designed to mate with the vehicle-side harnesses that would normally plug into the SGW.

- Diagnostic Necessity: While AutoAuth is viable for clearing check engine lights, locksmiths dealing with "All Keys Lost" (AKL) scenarios overwhelmingly prefer the physical bypass. This is because key programming often requires sustained communication stability that Wi-Fi-dependent software authentication may not guarantee, and many specialized key programmers (e.g., OBDStar, Autel IM508/608) are optimized for direct CAN connection via the bypass or Star Connector.6

### 2.2 Detailed Location Analysis by Platform

#### Ram Trucks: The Tale of Two Platforms (DS vs. DT)

The Ram truck lineup presents a unique challenge due to the concurrent production of two distinct platforms from 2019 to 2024. Identifying the specific body code is the prerequisite for locating the SGW, as the locations are drastically different.

1. Ram 1500 "Classic" (DS Platform) & 2018 Ram 1500

The "Classic" body style, which continued production alongside the new model to serve fleet and budget markets, retains the legacy cab structure but integrates the modern electrical architecture.8

- Location: Behind the Radio Head Unit / Center Stack.
- Access Procedure: This is widely considered one of the most labor-intensive locations. The technician must remove the center bezel and extract the radio head unit. The SGW is mounted on a metal bracket located directly behind the radio structure.8
- Technician Note: Because of the difficulty in accessing this module, many technicians prefer to trace the CAN lines to alternative access points if possible, but for a true SGW bypass, radio removal is often unavoidable.
- Tools Required: Plastic trim removal tools, T20/T25 Torx drivers, 7mm nut driver.

2. Ram 1500 (DT Platform) (2019–2025)

The "New" body style (DT) features a completely redesigned interior and electrical architecture, offering significantly easier access to the gateway.8

- Location: Driver''s Side Knee Bolster Area / Center Console Junction.
- Access Procedure: The module is located immediately to the left of the steering column or near the junction where the driver''s knee bolster meets the center stack.

- Step 1: Remove the two screws securing the top cover of the center console/knee panel area.9
- Step 2: Gently pull the panel out to disengage the retaining clips.
- Step 3: The module is often mounted vertically on a metal bracket. It is secured by three screws. Unmounting the bracket allows the technician to flip the module and access the connectors for the 12+8 cable.9

- Variations: On Ram 2500/3500 Heavy Duty models (2019+), the SGW is frequently located behind the instrument cluster (speedometer), requiring the removal of the cluster bezel and the cluster itself to access the module mounted on the rear firewall or cross-car beam.8

#### Jeep Platforms: From Wrangler to Wagoneer

Jeep''s off-road nature often dictates accessible yet protected module locations.

1. Jeep Wrangler (JL) & Gladiator (JT) (2018–2025)

- Location: Driver''s Side, Under Dash (Above OBD Port).
- Access Procedure: The SGW is positioned directly above the standard OBD-II port, often hidden by the lower dash plastic.

- Technique: While it is physically possible to reach up blindly and unplug the connectors, this is difficult due to the retention tabs. The recommended procedure is to remove the plastic panel directly under the steering column. This panel is held by tension clips and pulls straight back toward the driver''s seat.11
- Extraction: Once the panel is removed, the two plugs (12-pin and 8-pin) are visible. The retention tabs face away from the driver. A 90-degree pick tool is essential to hook behind the connector, depress the tab, and pull the cable downward.11
- Tooling: 12+8 Bypass Cable is standard here.

2. Jeep Grand Cherokee (WK2) (2018–2021)

- Location: Behind the Glovebox.
- Access Procedure: This is a classic location for many FCA modules. The technician must open the glovebox, release the dampener arm on the side, and squeeze the lateral stops to drop the glovebox door fully down. The SGW is typically mounted in a "soft" felt-covered bracket or rigid plastic housing on the right side or directly behind the glovebox bin.2

3. Jeep Grand Cherokee L (WL) & Grand Cherokee (WL) (2021–2025)

- Location: Driver''s Side Kick Panel / Under Dash.
- Complexity: The WL platform introduces the "Atlantis" electrical architecture, which is significantly more complex. While the SGW exists, for Key Programming, technicians often bypass the SGW entirely and connect directly to the Star Connector (CAN Hub) located in the Passenger Side Kick Panel. This "CAN Direct" method is preferred to avoid the high risk of RFHub corruption (see Section 3).

#### Dodge Performance (Charger / Challenger)

- 2018–2023 Models:

- Location: Passenger Side, Under/Behind Glovebox.
- Access: Lower the glovebox door. The SGW is often visible, but the connectors can be tight and difficult to manipulate.
- Preferred Method (Star Connector): On these platforms, the Star Connector is a green junction block located in the passenger kick panel or behind the glovebox. connecting a specialized "Star Connector Cable" (like the ADC-2011) to this hub allows the technician to bridge the CAN-C and CAN-IHS lines directly. This is often faster than wrestling with the SGW plugs and provides the same level of access for key programming.1

![Image](/api/assets/Vehicle_SGW_Access_and_Key_Programming_image3_png.png)

## 3. The Jeep RFHub Crisis (2021–2024): All Keys Lost & Anti-Brick Procedures

The introduction of the Grand Cherokee L (WL), Grand Cherokee (WL), and Wagoneer/Grand Wagoneer (WS) marked the arrival of a critical issue for the locksmith industry: the "Locked" or "Bricked" Radio Frequency Hub (RFHub). This section specifically addresses the 2021-2024 Jeep RFHub ''unlock'' procedures for All Keys Lost situations, a requirement distinct from standard SGW bypassing.

### 3.1 The "Brick" Phenomenon

In these newer architectures, the RFHub—the module responsible for receiving key fob signals and authorizing engine start—has a highly sensitive bootloader. When an aftermarket tool attempts to read the PIN code via the OBD-II port (even with the SGW bypassed), the process often involves a "brute force" or invasive query that can corrupt the RFHub''s software.

- Symptoms: The vehicle becomes unresponsive. The ignition cannot be cycled to ON. The instrument cluster displays "Service Passive Entry" or "Key Fob Not Detected." The vehicle is effectively immobilized and often requires a tow to the dealership for a complete module replacement.14
- Root Cause: The RFHub on WL/WS platforms actively defends against unauthorized write attempts in a way previous generations did not. Voltage fluctuations during the read process also contribute significantly to data corruption.

### 3.2 The Solution: Bench Unlocking & Direct Connection

To program keys without replacing the module, technicians must bypass the unstable OBD read process and interact directly with the RFHub''s memory (EEPROM/Flash). This is achieved through two primary methods:

#### Method A: Bench Unlock (The "Safe" Method)

This method is the most reliable as it isolates the module from the noisy vehicle network. It involves removing the RFHub and reading/unlocking it on a workbench using specialized programmers like the OBDStar DC706 or Autel G-Box3.

1. Locating the RFHub (WL/WS):

Unlike the SGW, the RFHub is typically located in the rear of the vehicle.

- Grand Cherokee L (WL): Located in the left rear quarter panel area or sometimes under the rear seat bench, depending on the trim level. Access requires removing the interior trim panels in the cargo area.15
- Wagoneer (WS): Often found in the rear headliner area near the liftgate or in the rear quarter panel.

2. Removal:

Disconnect the vehicle battery to prevent shorts. Remove the trim panels to expose the module. Unbolt and unplug the RFHub.

3. The Unlock Procedure (Bench):

- Tooling: Use a programmer capable of "FCA RFHub" operations (e.g., OBDStar DC706 in "ECM/Body Clone" mode or Autel IM608 Pro with XP400 and G-Box3).
- Connection: Connect the programmer to the specific pinout on the RFHub''s PCB or external connector pins. This often requires a dedicated bench harness or carefully probing the pins.17
- Execution:

1. Select the specific RFHub part number/chip type (e.g., Continental 9S12 series) in the tool software.
1. Perform a "Read EEPROM" and "Read Flash" operation to backup current data.
1. Select "Unlock" or "Virginize." This process modifies the bootloader/data to accept a new key or reveals the PIN code without the risk of corruption associated with OBD queries.17

- Reinstallation: Once unlocked, reinstall the module. The vehicle will now accept standard key programming via the OBD-II port (with SGW bypassed) as if it were a virgin module or using the extracted PIN.

#### Method B: The Star Connector / CAN Direct Method

For technicians who prefer not to remove the module, connecting directly to the Star Connector can sometimes facilitate a safer PIN read, though it carries higher risk than the bench method.

- Star Connector Location (WL/WS): Passenger side kick panel (Green connector block).
- Procedure: Connect the 12+8 or a specialized "CAN Direct" cable (like the Autel ADC-2011 equivalent) to the Star Connector. This bypasses the SGW and provides a cleaner signal path to the RFHub.
- Voltage Support: CRITICAL. You must connect a high-quality battery maintainer (providing a stable 13.5V+) to the vehicle during this process. Voltage drops are the primary cause of RFHub failure during direct programming.14

## 4. Nissan: The "16+32" Gateway Implementation (2020–2025)

Nissan followed FCA''s lead in 2020, introducing a Security Gateway on the B18 Sentra, followed by the Rogue and Pathfinder. Unlike FCA''s 12+8, Nissan utilizes a 16+32 pin configuration for its physical bypass. This architecture is tightly integrated with the Body Control Module (BCM).

### 4.1 Architecture and Access Protocols

Nissan''s SGW prevents non-OEM tools from performing active tests, key programming, and ECU initializations.

- Software Access (AutoAuth): Nissan supports AutoAuth. Tools like the Snap-on Zeus or Autel MaxiSys (with valid subscription) can unlock the gateway over Wi-Fi for diagnostics.
- Hardware Access (16+32 Cable): For Key Programming (especially All Keys Lost), the "16+32 Bypass Cable" is effectively mandatory. The gateway often blocks the specific immobilizer write commands even if "diagnostic" access is granted via AutoAuth. The bypass cable physically interrupts the connection between the BCM and the gateway, allowing the key programmer to inject data directly.5

### 4.2 Model-Specific Locations and Procedures

#### Nissan Sentra (2020–2025 | Chassis B18)

The Sentra was the first to receive this architecture.

- SGW/BCM Location: Under the Driver''s Side Dash / Knee Area.
- Access Procedure:

1. The module of interest is the BCM, which acts as the gateway host. It is located roughly above the brake pedal or slightly to the left.20
1. Look for two distinct connectors: a large 40-pin block that is split into a 16-pin and a 32-pin section.
1. Installation: Unplug these two large connectors from the module. Plug them into the female ends of the 16+32 bypass cable. Plug the male ends of the bypass cable back into the BCM (or leave it bypassed if the cable design dictates, though most are "pass-through" or "tee" harnesses).
1. Connection: Connect the scan tool/programmer to the OBD-II female port on the bypass cable.

#### Nissan Rogue (2021–2025 | Chassis T33)

- SGW Location: Behind the Instrument Cluster / Upper Dash.
- Complexity: High. Accessing the physical connector often requires removing the cluster bezel or reaching deep within the driver''s footwell area looking up towards the firewall.22
- Alternative: Some technicians report success accessing the connectors near the Driver''s Kick Panel where the harness routes down from the BCM. The 16+32 cable is inserted here to intercept the CAN traffic.23

#### Nissan Pathfinder (2022–2025)

- SGW Location: Driver''s Kick Panel / BCM Area.
- Access: Similar to the Sentra, the focus is on the Body Control Module connections. The bypass cable is inserted in-line with the BCM connectors. The BCM is typically accessible by removing the plastic kick panel trim to the left of the driver''s feet.24

## 5. Ford: The Fortress of the F-150 (2021–2025)

Ford''s transition to the Sync 4 architecture (FNV2 - Ford Network Vehicle 2) in 2021 introduced the most robust security measures to date. The Gateway Module (GWM) on these vehicles (F-150, Mach-E, Bronco) is integrated deeply into the vehicle''s OTA (Over-the-Air) update ecosystem and security logic.

### 5.1 The FNV2 Security Layer and "Active Alarm"

On 2021+ Ford vehicles, the GWM actively monitors the CAN bus for "unauthorized" wake-up signals or programming attempts. If an unauthorized tool attempts to program a key, the vehicle often triggers an "Active Alarm" state.

- Symptoms: The alarm sounds, the vehicle immobilizes, and the scan tool is locked out of communication.
- Access Methods:

1. FDRS (OEM): The Ford Diagnostic & Repair System (FDRS) is the only "official" method for deep module programming. It requires a persistent internet connection and valid NASTF credentials (LSID).
1. Active Alarm Bypass (Aftermarket): Locksmiths utilize specialized "Active Alarm Bypass" cables. These do not replace the GWM but rather connect to specific CAN distribution points (often near the BCM or GWM) to inject signals that suppress the alarm state, allowing the scan tool to proceed with key programming.25

### 5.2 The 2021+ F-150 GWM: A Teardown Nightmare

For technicians needing physical access to the Gateway Module (GWM) connector—either to install an interceptor harness (like for fleet management) or for hardwire diagnostics—the 2021 F-150 presents a significant teardown challenge.

Location: Behind the Center Infotainment Screen / Lower Center Stack.

Access Procedure 27:

1. Disconnect Battery: Essential to prevent shorting the GWM.
1. Upper Dash: Remove the upper center stack bezel (8 clips) and instrument center trim (14 clips).
1. Knee Bolster: Remove the panel below the steering column (two 7mm screws).
1. Lower Stack: Remove the trim panels on the left and right of the center console.
1. Disassembly: Remove six 7mm screws and two 10mm screws securing the center stack.
1. Extraction: Pull the center stack unit away (can leave plugged in). The GWM is located below the radio unit. It is held by three 8mm screws.
1. Connection: The specific 26-pin connector needed for bypass/interception is on the bottom of this module.

### 5.3 Mustang Mach-E (2021–2025)

- GWM Location: Behind the Glovebox / Passenger Dash Area.
- Significance: The GWM in the Mach-E is the central hub for BlueCruise and OTA updates. Access is required if the module "hangs" during a failed OTA update, a common issue on early builds. It is generally easier to access than the F-150''s GWM.28

![Image](/api/assets/Vehicle_SGW_Access_and_Key_Programming_image2_png.png)

## 6. Comprehensive Technical Summary Table: Locations and Key Programming Protocols

The following table serves as a definitive quick-reference guide for technicians identifying SGW parameters and Key Programming requirements in the bay.

Make

Model

Years

Platform

SGW / GWM Location

Key Programming Access (Preferred)

Key Programming Access (Alternative)

Ram

1500 "Classic"

2018-2024

DS

Behind Radio Head Unit

12+8 Cable (Requires Radio Removal)

AutoAuth (If tool supports AKL)

Ram

1500 (New Body)

2019-2025

DT

Driver Knee Bolster / Left of Column

12+8 Cable (Easy Access)

AutoAuth

Ram

2500/3500 HD

2019-2025

DJ/D2

Behind Speedometer Cluster

12+8 Cable

AutoAuth

Jeep

Wrangler

2018-2025

JL

Driver Dash (Above OBD Port)

12+8 Cable (Remove Under-dash Panel)

AutoAuth

Jeep

Gladiator

2020-2025

JT

Driver Dash (Above OBD Port)

12+8 Cable

AutoAuth

Jeep

Grand Cherokee

2018-2021

WK2

Behind Glovebox

12+8 Cable

AutoAuth

Jeep

Grand Cherokee L

2021-2025

WL

Driver Kick Panel (SGW)

Star Connector Cable (Passenger Kick)

Bench Unlock (RFHub)

Jeep

Wagoneer

2022-2025

WS

Rear Quarter / Headliner (RFHub)

Bench Unlock (RFHub)

Star Connector Cable

Dodge

Charger/Challenger

2018-2023

LD/LA

Behind Glovebox

Star Connector Cable (Passenger Kick)

12+8 Cable

Chrysler

Pacifica

2018-2025

RU

Behind Climate Controls / Center Stack

12+8 Cable

AutoAuth

Nissan

Sentra

2020-2025

B18

Under Driver Dash (Near BCM)

16+32 Bypass Cable

AutoAuth (Diag Only)

Nissan

Rogue

2021-2025

T33

Behind Cluster / Upper Dash

16+32 Bypass Cable

AutoAuth (Diag Only)

Nissan

Pathfinder

2022-2025

R53

Driver Kick Panel / BCM Area

16+32 Bypass Cable

AutoAuth (Diag Only)

Ford

F-150

2021-2025

Gen 14

Behind Center Stack (Radio/Screen)

FDRS (OEM)

Active Alarm Bypass Cable

Ford

Mustang Mach-E

2021-2025

CX727

Behind Glovebox

FDRS (OEM)

Active Alarm Bypass Cable

## 7. Conclusions: The Future of Independent Repair

The data indicates a definitive trajectory towards "Connected Diagnostics." While hardware bypasses (12+8, 16+32) remain a vital fallback for independent shops and locksmiths, the increasing labor time required to access these modules—typified by the 2021 F-150 and Ram DS—makes them inefficient for routine work.

For FCA and Nissan, the AutoAuth software solution is the most operationally efficient path for general repair (scanning, clearing codes). However, for Key Programming, the industry has split:

- FCA (Legacy): 12+8 cables are standard.
- FCA (New Jeep): Bench unlocking the RFHub is the only fail-safe against bricking.
- Nissan: The 16+32 cable is practically mandatory for key programming as the gateway blocks immobilizer writes even with authorized diagnostics.
- Ford: The ecosystem is the most closed. The necessity of FDRS for 2021+ models suggests that shops specializing in late-model Fords must invest in J2534 pass-through devices and OEM subscriptions, as aftermarket reverse-engineering is lagging behind the FNV2 architecture''s complexity.

Strategic Recommendation: Technicians must pivot from a "hardware-first" mindset to a "credentials-first" mindset. Investing in verified credentials (NASTF LSID, AutoAuth) is now as critical as investing in physical hand tools. Simultaneously, the possession of physical bypass cables (12+8, 16+32, Active Alarm Bypass) remains the "nuclear option"—effective, but increasingly difficult to deploy.

#### Works cited

1. Everything You Need to Know About the Chrysler Security Gateway ..., accessed December 17, 2025, https://www.americankeysupply.com/pages/everything-you-need-to-know-about-the-chrysler-security-gateway
1. FCA Security Gateway Module Basic Info and Location - JScan, accessed December 17, 2025, https://jscan.net/fca-security-gateway-module-basic-info-and-location/
1. Secure Vehicle Gateway - Snap-on, accessed December 17, 2025, https://www.snapon.com/EN/US/Diagnostics/Secure-Vehicle-Gateway
1. SGW (secure gateway access) Licence for Nissan 2020 and Newer - RemTech Auto Solutions Inc., accessed December 17, 2025, https://remtechauto.com/en/blog-articles/sgw-secure-gateway-access-licence-for-nissan-2020-and-newer
1. nis1632 autel nissan 16 plus 32 bypass - Sadler Powertrain, accessed December 17, 2025, https://sadlerpowertrain.com/uncategorized/nis1632-autel-nissan-16-plus-32-bypass/
1. Diagnosing 2018+ FCA (Dodge, Chrysler, Jeep etc) with Security Gateway Module using YOUCANIC Scanner - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=AkuGwWZ2nVs
1. 2018 Jeep Grand Cherokee All Smart Keys Lost using Autel IM608 Pro2 - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=-UzeaimFtDA
1. STE Chrysler Pass Through User Manual - Squarespace, accessed December 17, 2025, https://static1.squarespace.com/static/51fac8cfe4b0339e6c6987e1/t/5df85fc2cde8ca0f95214058/1576558531884/STE_Chrysler_Passthrough_V1_2.pdf
1. 2019 Ram 1500 security gateway location - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=5WAIUTyQ3T0
1. Security Gateway Module Location & Bypass 5th Gen RAM 2500 3500 - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=C5IktfsPu8U
1. 2021 Jeep Wrangler 4XE JL SGW Cable Install - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=-V93etacytY
1. 2024 Security Gateway Bypass - How to remove original cables from security module? SGW : r/Wrangler - Reddit, accessed December 17, 2025, https://www.reddit.com/r/Wrangler/comments/1gmrcn0/2024_security_gateway_bypass_how_to_remove/
1. 2018 Dodge Challenger star connector location for programing smart key - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=X-ljAC7g-2g
1. Locked RF Hub 22 Renegade : r/Locksmith - Reddit, accessed December 17, 2025, https://www.reddit.com/r/Locksmith/comments/1m3kvyj/locked_rf_hub_22_renegade/
1. Jeep Cherokee RF Hub Keyless Entry Fuse Relay Location Replacement 2014 2023, accessed December 17, 2025, https://www.youtube.com/watch?v=BR0VzrEiIXI
1. How To Fix 2024 Jeep Grand Cherokee “Key Fob Not Detected” – Battery, RF Hub & Antenna Check - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=sKbn9YdUAV0
1. OBDSTAR DC706 Clone FCA RFHUB/RFHM Keyless Module on Bench obdii365 #mdt #MDT - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=PChWUEm5l2Q
1. DC706 - FCA RFHUB/RFHM CLONE BY BENCH - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=5GxRNh3n8hI
1. Autel - Nissan 16+32 OBD Gateway Adapter for B118 Chasis for Sale | UHS Hardware, accessed December 17, 2025, https://www.uhs-hardware.com/products/autel-nissan-16-32-obd-gateway-adapter-for-b118-chasis
1. Nissan 16 & 32G Bypass Cable with CGW Adapter (XTool) for Sale - UHS Hardware, accessed December 17, 2025, https://www.uhs-hardware.com/products/nissan-16-32g-bypass-cable-with-cgw-adapter-xtool
1. Nissan 16 & 32G Bypass Cable with CGW Adapter (AUTOPROPAD) - American Key Supply, accessed December 17, 2025, https://www.americankeysupply.com/product/nissan-16-32g-bypass-cable-with-cgw-adapter-autopropad-14701
1. SGW Bypass: Unlock Full Diagnostics for Renault, Dacia, and Nissan - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=NXaBYO_ekHY
1. 2017-2022 Nissan Rogue Sport BCM Location. How To Remove 2017-2022 Nissan Rogue Sport BCM. - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=ZbXC53aK5EI
1. 2022-2023 NISSAN PATHFINDER BODY COMPUTER CONTROL MODULE BCM UNIT, accessed December 17, 2025, https://www.ebay.com/itm/156684382312
1. Magnus - Ford Active Alarm Bypass Kit - OBDII Adapter & Extension Cable - UHS Hardware, accessed December 17, 2025, https://www.uhs-hardware.com/products/ford-active-alarm-bypass-kit-obdii-adapter-extension-cable-lock-labs
1. Xhorse XDFAKLGL Active Alarm Bypass Cable For Ford Vehicles - Key Innovations, accessed December 17, 2025, https://keyinnovations.com/products/xhorse-active-alarm-bypass-cable-for-ford-vehicles
1. How to access an F-150 Gateway Connector - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=YGKAHWkLAis
1. Gateway Control Module 2023 Ford Mustang Mach-E RU5T-14H474-CAG 2021 2022 2024 | eBay, accessed December 17, 2025, https://www.ebay.com/itm/166731651463
1. FORD MUSTANG GATEWAY FUSE LOCATION 2015 2016 2017 2018 2019 2020 2021 2022 2023 - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=EETNlQffxSE', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Toyota_Lexus Smart Key Reset Procedures', 'Toyota', 'General', 2010, 2024, '

# The Evolution of Toyota and Lexus Smart Key Security: A Comprehensive Analysis of ''All Keys Lost'' Procedures (2004–2024)

## 1. Introduction: The High-Stakes Architecture of Automotive Access

The automotive security landscape has undergone a profound metamorphosis over the last two decades, driven by an escalating arms race between manufacturers seeking to prevent theft and automotive locksmiths or technicians striving to service legitimate owners. Nowhere is this dynamic more evident than in the ecosystem of Toyota and Lexus smart key systems. From the relatively permeable architectures of the early 2000s to the server-authenticated, encrypted strongholds of the 2020s, the "All Keys Lost" (AKL) procedure serves as a litmus test for the sophistication of vehicle immobilization technology.

For the professional automotive locksmith, diagnostic technician, or security researcher, the distinction between a "16-minute reset" and a "Seed Code" intervention is not merely procedural; it represents a fundamental shift in the philosophy of access control. The legacy systems, prevalent from approximately 2004 to 2016, operated on a principle of "security through delay"—a localized, onboard logic that permitted a full system reset if the technician could simply wait out a timer. In stark contrast, the modern epoch, ushered in by the Toyota New Global Architecture (TNGA) and reinforced by Technical Service Bulletins such as T-SB-0064-18, operates on "security through authority." These systems demand cryptographic handshakes with central servers, effectively removing the vehicle''s autonomy to authorize its own keys.

This report provides an exhaustive, forensic analysis of this twenty-year evolution. It dissects the cryptographic underpinnings of the 4D, G, H (8A), and 4A transponder families, mapping them against the procedural realities of the service bay. By synthesizing technical documentation, hardware specifications, and procedural workflows, we establish a definitive operational framework for identifying, diagnosing, and resolving AKL scenarios across the Toyota and Lexus lineups. The analysis reveals that successful intervention relies less on rote memorization of procedures and more on a granular understanding of hardware compatibility—specifically the often-overlooked distinctions between circuit board identifiers like 271451-0140, 271451-3370, and 281451-0020—which can mean the difference between a successful reset and a catastrophic module failure.

![Image](/api/assets/Toyota_Lexus_Smart_Key_Reset_Procedures_image1_png.png)

## 2. The Theoretical Framework: Cryptography in Motion

To understand the procedural divergence in AKL scenarios, one must first grasp the underlying technological shifts in the transponder systems. Toyota’s nomenclature—often referenced colloquially by locksmiths as "Dot," "G," or "H" keys—corresponds to specific cryptographic protocols and bit-strengths developed largely by Texas Instruments and NXP Semiconductors. These designations are not arbitrary; they dictate the available attack vectors and the ECU''s response mechanisms.

### 2.1 The Legacy Foundation: 4C and 4D Systems

The early 2000s were dominated by the Texas Instruments Digital Signature Transponder (DST) technology. The 4C system, a fixed-code transponder, was the standard for early master/valet key configurations. It lacked mutual authentication, meaning the key simply broadcasted its ID, and if the ECU recognized it, the car started. This simplicity made it highly susceptible to cloning but also easy to reset.

This evolved into the 4D system, which introduced 40-bit encryption.1 In the context of Smart Keys (proximity systems), these are frequently identified by their Page 1 data—specifically "94," "98," or "D4." The 4D system represented a significant leap, requiring the vehicle and key to exchange encrypted challenges. However, the encryption strength was low enough that the system relied heavily on the "16-minute reset" logic as its primary defense against unauthorized programming. The logic was simple: if a thief had the diagnostic tools to command a reset, they likely wouldn''t have the time to sit exposed for 16 minutes in a vehicle.

### 2.2 The Transitional Epoch: G-Chip and H-Chip (128-bit)

As computational power increased, 40-bit encryption became vulnerable to brute-force attacks. Toyota responded with the G-Chip (80-bit DST-40/80) around 2010.1 While physically similar to 4D keys, the G-chip required updated logic in the Immobilizer Code Box. Crucially, early G-chip systems largely retained the 16-minute reset capability, making them a transitional technology that offered better encryption without fundamentally changing the service procedure.

The true watershed moment came with the H-Chip (128-bit AES/DST-AES), introduced roughly around 2013-2014.2 The "H" stamp on a keyed ignition blade, or the specific board ID on a smart key, indicates this 128-bit architecture. This era bridges the gap between legacy and modern protocols. Early H-chip vehicles (e.g., 2014-2016 Camrys) typically function within the 16-minute reset paradigm or allow for emulator-based bypasses. However, late-model H-chip vehicles (2017-2018+) were the first to enforce the Seed Code requirement, signaling the end of the onboard reset era.

### 2.3 The Modern Fortress: TNGA, 8A-BA, and 4A

With the rollout of the Toyota New Global Architecture (TNGA), security became integrated into the vehicle''s Central Gateway (CGW). The 8A designation became standard, but recent iterations like 8A-BA (found in the 2022+ Sienna and Tundra) and 4A (found in the 2022+ Corolla Cross) represent a departure from Texas Instruments to NXP Hitag AES standards.3 These systems often integrate the smart key module data into the main ECU or utilize a new "TMLF19D" smart box type. In these architectures, the OBDII port is firewalled; the gateway module filters diagnostic traffic, preventing the traditional reset commands from reaching the immobilizer. This necessitates strictly server-based authorization (NASTF) or invasive "bench" connection methods using 30-pin cables to physically bypass the gateway.

## 3. The Legacy Era (2004–2016): The Golden Age of Onboard Resets

The "Legacy Era" is defined by the autonomy of the vehicle''s onboard computers. During this period, the decision to erase known keys and accept new ones was made entirely by the vehicle''s Smart Key ECU, contingent only on a security delay. This "16-minute reset" (Smart Code Reset) became the industry standard for AKL situations, allowing technicians to resolve lost key scenarios using basic diagnostic tools without internet access or third-party authorization.

### 3.1 Mechanism of the 16-Minute Reset

The reset command, accessible via tools like Techstream, Autel, or Smart Pro, triggers a re-initialization sequence in the Certification ECU (Smart Key Module) and the ID Code Box.2 When the command is sent, the vehicle enters a "wait state." The security indicator on the dashboard typically remains solid or flashes in a specific pattern. This delay is a hard-coded security feature designed to deter "smash and grab" thefts involving key programming tools.

Upon the expiration of the 16-minute timer, the ECU executes a "communication complete" handshake.4 At this precise moment, all previously registered key IDs are wiped from the memory. The system effectively reverts to a "virgin" or auto-learn state, ready to accept the first valid transponder presented to the Start Button. It is critical to note that this procedure is destructive; any old keys found later will no longer function until they are re-registered.

### 3.2 Detailed Model Analysis: The 4D and Early G Era

The application of this procedure is vast, covering millions of vehicles on the road today.

#### The Camry and Avalon Lineage (2007–2011)

The 2007–2011 Toyota Camry and 2005–2012 Toyota Avalon represent the archetypal "Legacy" systems. These vehicles utilize the HYQ14AAB or HYQ14AEM FCC IDs.5 The internal circuit board for these remotes is typically 271451-0140. In an AKL scenario, the technician connects via OBDII, selects "Smart Code Reset," waits 16 minutes, and then presents a virgin or unlocked aftermarket key. The reliability of this procedure on these models is near 100%, provided the replacement key has the correct Board ID. A common pitfall here is attempting to use a board from a RAV4 (Board 3370), which shares the same FCC ID but is incompatible with the Camry''s sedan-specific ECU logic.6

#### The RAV4 and Highlander "E" Board Nuance (2008–2012)

While sharing the same era as the Camry, the RAV4 (2006–2012) and Highlander (2008–2013) introduced a hardware fragmentation that continues to plague technicians. These SUVs often utilize the 271451-3370 board, distinguishable by a small "E" stamped on the PCB.7 The 16-minute reset procedure remains identical, but the hardware requirement is strict. If a technician performs a reset on a 2010 RAV4 and attempts to program a non-"E" board (0140), the vehicle will complete the reset but refuse to accept the key, leaving the car immobilized with zero keys programmed. This underscores the necessity of verifying Board IDs before initiating any destructive reset.

#### The Prius Gen 3 and Venza (2010–2015)

The Prius Gen 3 (2010–2015) and Venza (2009–2016) utilize a distinct board architecture, typically 271451-5290, housed within the HYQ14ACX remote.8 Despite the unique form factor of the Prius fob, the underlying architecture remains 4D-based (Page 1: 98). The 16-minute reset is fully supported on these models. Interestingly, the Prius V (wagon) extended this legacy architecture well into 2016, arguably one of the last models to support the onboard reset natively without complications.

### 3.3 Lexus Specifics: The Luxury Implementation

Lexus models from this era generally mirror their Toyota counterparts but often adopted the "G" and "H" standards slightly earlier.

#### The LS 460 and LX 570 (2007–2012)

The flagship LS 460 (2007–2012) and LX 570 (2008–2015) utilize the HYQ14AEM or HYQ14AAB fobs, specifically with Board 271451-6601.9 The AKL procedure is the standard 16-minute reset. However, the LS 460 is notorious for communication errors if the battery voltage drops even slightly below 12.5V during the long wait time. The immense number of ECUs on the CAN bus in these luxury vehicles creates a significant parasitic draw, making a robust power supply mandatory during the 16-minute window.4

#### The RX 350 (2010–2015)

The RX 350 (2010–2015) is a workhorse of the Lexus lineup, utilizing the HYQ14ACX remote (Board 271451-5290 or similar). It is robustly supported by the 16-minute reset.10 A unique characteristic of the RX series is the availability of the "Smart Card" key (FCC ID: HYQ14AEB), which functions identically to the fob regarding programming but requires specific slot positioning (or holding against the button) during the registration phase.11

### 3.4 Definitive List of Supported Legacy Models

The following table aggregates the models confirmed to support the 16-minute onboard reset. This list assumes the use of standard diagnostic tools (Techstream, Autel, Smart Pro) and excludes models that may require seed codes in their final production months.

Table 1: Toyota Models Supporting 16-Minute Onboard Reset (Legacy)

Model

Years Supported

FCC ID / Hardware ID

Transponder / Chip Type

Avalon

2005 – 2012

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

Camry

2007 – 2011

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

Corolla

2009 – 2013

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

Highlander

2008 – 2013

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

Land Cruiser

2008 – 2015

HYQ14AEM

4D (Page 1: 94/98)

Prius (Gen 3)

2010 – 2015

HYQ14ACX

4D (Page 1: 98)

Prius V

2012 – 2016

HYQ14ACX

4D (Page 1: 98)

RAV4

2006 – 2012

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

Sienna

2011 – 2016

HYQ14AEM

4D (Page 1: 98)

Tundra

2007 – 2017

Keyed (Dot/G) / HYQ14FBA

4D / G / H

Venza

2009 – 2016

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

Table 2: Lexus Models Supporting 16-Minute Onboard Reset (Legacy)

Model

Years Supported

FCC ID / Hardware ID

Transponder / Chip Type

ES 350

2007 – 2012

HYQ14AEM, HYQ14AAB

4D (Page 1: 94/98)

GS 350/430

2006 – 2011

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

IS 250/350

2006 – 2013

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

LS 460

2007 – 2012

HYQ14AAB, HYQ14AEM

4D (Page 1: 94/98)

RX 350/450h

2010 – 2015

HYQ14ACX

4D (Page 1: 98)

GX 460

2010 – 2016

HYQ14ACX

4D (Page 1: 98)

LX 570

2008 – 2015

HYQ14AEM

4D (Page 1: 94/98)

![Image](/api/assets/Toyota_Lexus_Smart_Key_Reset_Procedures_image3_png.png)

## 4. The Transitional Era (2012–2017): H-Chips and the Hardware Split

The transition from the 4D era to the modern security state was not immediate. Between 2012 and 2017, Toyota introduced 128-bit encryption (H-Chip) while largely retaining the older procedural framework. This period is characterized by significant hardware fragmentation, where visual identification of keys became unreliable, and internal Board IDs became the primary method of distinguishing compatible remotes.

### 4.1 The Rise of the HYQ14FBA (G and AG Boards)

The defining hardware of this era is the HYQ14FBA remote. This fob looks distinct from the older "blob" style keys, often featuring a sleeker, angular design. However, the FCC ID alone is insufficient for programming.

- Board 281451-0020 (The "G" Board): This board became the standard for passenger sedans. Found in the Camry (2012–2017), Avalon (2013–2018), and Corolla (2014–2019).12 These systems generally support the 16-minute reset or the early "emulator bypass" methods.
- Board 281451-2110 (The "AG" Board): This board was deployed in trucks and SUVs, such as the Highlander (2014–2019), Tacoma (2016–2021), and Tundra (2018–2021).13 Despite sharing the HYQ14FBA FCC ID with the sedan key, the AG board uses a different transponder protocol. A technician attempting to program a 0020 board to a Tacoma requiring a 2110 board will face a programming failure, often after the reset has completed, leaving the vehicle in a "no keys" state.

### 4.2 Procedural Ambiguity: Reset or Seed Code?

The 2016–2018 model years represent a "grey zone" where the AKL procedure varies by specific build date and factory. For example, a 2017 Camry will almost certainly accept a 16-minute reset or an APB112 emulator bypass. However, a 2018 Camry (built on the TNGA platform) will require a Seed Code.14 This unpredictability necessitates a "try and verify" workflow:

1. Attempt Reset: Connect the diagnostic tool and attempt the "Smart Code Reset."
1. Observe Tool Prompt:

- If the tool starts a 16-minute timer, the vehicle is on the Legacy protocol.
- If the tool immediately requests a "Seed Number" or displays a "Communication Error," the vehicle is on the Modern protocol requiring TIS authorization or a specific bypass adapter.

## 5. The Modern Era (2018–2024): TNGA, Seed Codes, and NASTF

The introduction of the Toyota New Global Architecture (TNGA) marked the end of the 16-minute reset. With TSB T-SB-0064-18 (and L-SB-0023-18 for Lexus), Toyota implemented a robust challenge-response system designed to eliminate unauthorized key programming.15

### 5.1 The TSB-0064-18 Mandate

Technical Service Bulletin T-SB-0064-18 explicitly states that the "Immobilizer and Smart Key Reset" function in Techstream now requires a secondary approval. The vehicle generates a random "Seed Number" (typically 96 bytes) during the reset request. This seed must be transmitted to the Toyota TIS (Technical Information System) server. A locksmith or technician must possess a valid LSID (Locksmith Security ID) registered with NASTF to generate the corresponding Pass-Code. Without this Pass-Code, the vehicle''s gateway denies the reset request.

### 5.2 The 8A and 8A-BA Chip Architecture

The physical keys for this era utilize the HYQ14FBC and HYQ14FBE FCC IDs.

- 8A (H-Chip): Continued use in the Camry (2018+), RAV4 (2019+), and Prius (2016+). While the chip physics are similar to the previous era, the authorization protocol is entirely server-dependent.
- 8A-BA: The latest evolution, found in the 2022+ Sienna, Venza, and Tundra. This utilizes the TMLF19D smart ECU.17 The "BA" designation refers to the specific Page 4 data of the transponder (P4=BA). These systems are significantly more hardened; the OBDII port is restricted, preventing even standard Seed Code extraction in some cases without specialized "bench" cables.

### 5.3 4A: The Hitag AES Divergence

A distinct subset of Toyota''s modern fleet, specifically the 2022+ Corolla Cross and Yaris Cross, abandoned the Texas Instruments architecture entirely for the NXP Hitag AES (4A) system.18 This system is fundamentally different from the 8A architecture.

- AKL Implication: Standard Toyota emulators (like the APB112) designed for 4D/8A chips will not work on 4A systems.
- Procedure: These vehicles require a dedicated "Smart Key Emulator" capable of 4A simulation (e.g., the Autel APB112 with specific 4A software update or Lonsdor LKE) and often require reading the D-Flash from the Smart Box directly to generate the emergency key.

Table 3: Toyota Models Requiring Seed Code / Bypass (Modern Era)

Model

Years

FCC ID / Hardware

Chip Type

Camry

2018 – 2024

HYQ14FBC, HYQ14FBE

8A (H) / 8A-BA

C-HR

2018 – 2022

HYQ14FBA / HYQ14FBC

8A (H)

Corolla

2020 – 2024

HYQ14FBC, HYQ14FBE

8A (H) / 4A (Cross)

Highlander

2020 – 2024

HYQ14FBC, HYQ14FBE

8A (H) / 8A-BA

RAV4

2019 – 2024

HYQ14FBC, HYQ14FBE

8A (H) / 8A-BA

Sienna

2021 – 2024

HYQ14FBC

8A-BA (TMLF19D)

Tundra

2022 – 2024

HYQ14FBE

8A-BA

Venza

2021 – 2024

HYQ14FBC

8A-BA

Prius

2016 – 2024

HYQ14FBC

8A (H)

Table 4: Lexus Models Requiring Seed Code / Bypass (Modern Era)

Model

Years

FCC ID / Hardware

Chip Type

ES 350/300h

2019 – 2024

HYQ14FBC

8A (H)

LS 500

2018 – 2024

HYQ14FBC

8A (H)

UX 200/250h

2019 – 2024

HYQ14FBC

8A (H)

NX 250/350

2022 – 2024

HYQ14FBC / FLB

8A-BA

RX 350

2016 – 2022

HYQ14FBB

8A (H)

RX 350 (New)

2023 – 2024

HYQ14FLB

8A-BA

IS 300/350

2014 – 2024*

HYQ14FBA / FBC

8A (H)

Note on IS Series: The Lexus IS series is an outlier. It adopted the 8A (H-chip) architecture very early (2014) but maintained the older body control style, creating a mix of procedures. Late-model IS (2021+) vehicles are firmly in the Seed Code era.

![Image](/api/assets/Toyota_Lexus_Smart_Key_Reset_Procedures_image2_png.png)

## 6. The Counter-Measures: Bypass Technologies and Emulation

While the official Toyota TIS/NASTF path is the only "authorized" method for modern vehicles, the aftermarket tool industry (Autel, Xhorse, Lonsdor) has developed alternative "Bypass" methodologies. These methods are essential for locksmiths who may not have immediate NASTF access or for vehicles where the TIS server is unavailable.

### 6.1 The Emulator Evolution (Autel APB112 / Xhorse Key Tool Max)

For many H-Chip (8A) vehicles in the 2013–2018 range, and even some up to 2021, the AKL situation can be resolved by creating a "Simulated Master Key".19

- Data Harvesting: Instead of asking the ECU to reset, the scan tool (e.g., Autel IM608) queries the Smart Key ECU for its public data. In older H-chip systems, this data could be read via OBDII.
- Key Generation: The tool uses this harvested data to program a specialized emulator dongle (Autel APB112 or Xhorse XM38).20 The emulator is then energized and mimics the cryptographic signature of a valid master key.
- The "Add Key" Loophole: Once the vehicle recognizes the emulator as a valid key, the technician can perform a standard "Add Key" procedure rather than a destructive "All Keys Lost" reset. This bypasses the need for a Seed Code entirely because the vehicle believes a valid key is present.

### 6.2 The CAN Injection Era: 30-Pin Cables (2022+)

With the introduction of the 8A-BA and 4A systems (e.g., 2022 Tundra, 2022 Corolla Cross), Toyota patched the OBDII vulnerability. The Gateway Module now filters the data traffic needed to generate an emulator.

- Direct Connection: To circumvent this, technicians must now use 30-pin splitter cables (e.g., Autel G-Box3, Xhorse XD8ABAGL).17 These cables connect directly to the Smart Key ECU (usually located behind the glove box or driver''s dash), physically bypassing the Gateway Module.
- Bench Mode on the Car: This method essentially performs a "bench" read of the ECU while it is still in the vehicle. By injecting data directly into the Smart ECU''s CAN lines, the tool can read the necessary EEPROM data to generate an emergency start key, which is then used to program a permanent fob.

![Image](/api/assets/Toyota_Lexus_Smart_Key_Reset_Procedures_image4_png.png)

## 7. Procedural Guidelines for Success

### 7.1 Diagnostic Triage

Before connecting a tool, the technician must perform a triage to determine the vehicle''s era:

1. Check the VIN: Determine the exact Model Year. A 2017 Camry is likely Reset/Emulator; a 2018 Camry is Seed Code.
1. Inspect the Door Lock: (For keyed ignitions) An "H" stamp on the blade confirms 128-bit encryption. A "G" stamp confirms 80-bit.
1. Scan for ECUs: Use a diagnostic tool to identify the "Smart Key" or "Immobilizer" ECU part number.

- TMLF12: Indicates older 4D/G systems.
- TMLF15: Indicates H-Chip (8A) systems.
- TMLF19: Indicates the latest 8A-BA systems requiring 30-pin cables.

### 7.2 The 16-Minute Reset Workflow

1. Voltage Stabilization: Connect a battery maintainer. Voltage drops below 12V can cause the reset to hang or fail.4
1. Tool Setup: Select "Smart Code Reset."
1. The Wait: Do not touch the brake pedal, start button, or door locks during the 16-minute countdown.
1. Re-Registration: Once the reset is complete, the tool will usually beep.

- Hold the Emblem Side of the new key to the Start Button.
- Listen for the "Bip" (key detected) and then "Bip-Bip" (key registered).
- Crucial Step: Once all keys are added, place the last key on the passenger seat and cycle the driver''s door (Open/Close) to exit learning mode. Failing to do this can leave the system in a "learning" loop, draining the battery.

### 7.3 The Seed Code Workflow

1. Data Extraction: Select "Immobilizer Reset" (Online). The tool will provide a Seed Number.
1. Authorization: Log into the TIS portal or NASTF VSP registry. Enter the VIN and Seed.
1. Pass-Code Entry: Receive the 6-character Pass-Code. Enter it into the tool immediately.
1. Instant Reset: The system will reset instantly. Proceed to "Add Key" as above.

## 8. Conclusion and Future Outlook

The trajectory of Toyota and Lexus security is clear: the era of the autonomous, onboard reset is over. The "16-minute reset," once the bread and butter of the automotive locksmith, is now relegated to the "Legacy" fleet of 2004–2016 vehicles. As these vehicles age out of the primary service market, the industry must pivot entirely to server-authorized (Seed Code) or advanced hardware-bypass (CAN Injection) methodologies.

For the professional, the key to navigating this fragmented landscape lies not in a single "magic bullet" tool, but in the ability to accurately identify the specific architecture of the vehicle in the bay. Recognizing the subtle difference between a 2017 Camry (H-Chip, Emulator-friendly) and a 2018 Camry (TNGA, Seed Code mandatory), or distinguishing a RAV4 "E" board from a standard one, is the defining skill of the modern automotive security specialist. As 8A-BA and 4A systems become the standard, the reliance on deep diagnostic access and professional credentialing will only intensify, solidifying the role of the automotive locksmith as a specialized IT professional for the vehicle network.

#### Works cited

1. Abrites Diagnostics for Toyota_Lexus_Scion User Manual HTML, accessed December 17, 2025, https://abrites.com/media/user_manuals/html/abrites-diagnostics-for-toyota-lexus-scion-user-manual/index.html?v=1687950727
1. Toyota Transponder List | PDF | Manufactured Goods | Vehicles - Scribd, accessed December 17, 2025, https://www.scribd.com/document/706231542/TOYOTA-TRANSPONDER-LIST
1. Lonsdor K518 Program 2023 Toyota Corolla Cross 4A BA All Smart Keys Lost with FP30 Cable-OBDII365 - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=Jka5B5vqj5o
1. Advanced Diagnostics MVP Pro T Code PRO Manual VER 2017 - device.report, accessed December 17, 2025, https://device.report/m/49da9e0c7308d64662f483567ff07d34d0e436b0d0f75cc78f344161ed4d086c
1. 2009-2010 Toyota Corolla 4-Button Smart Key Fob (HYQ14AAB, 89904-06040, 89904-06041, 89904-33181, Board: 271451-0140) - NorthCoast Keyless, accessed December 17, 2025, https://northcoastkeyless.com/product/2009-2010-toyota-corolla-smart-key-fob-remote-fcc-hyq14aab-p-n-89904-06040-89904-06041/
1. Toyota RAV4 Smart Key FOB/ 3 Button (E-Board 3370, HYQ14AAB / HYQ14AEM, accessed December 17, 2025, https://tomskey.com/products/toyota-rav4-smart-key-fob-3-button-e-board-3370-hyq14aab-3b-3370board-fob
1. 2009 - 2012 Toyota Smart Key 4B Fob FCC# HYQ14AAB / HYQ14AEM - Locksmith Keyless, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2009-2012-toyota-smart-key-fcc-hyq14aab-hyq14aem
1. Toyota Prius 2010-2015 4-Btn Smart Key (HYQ14ACX-5290)—OEM NEW, accessed December 17, 2025, https://www.americankeysupply.com/product/toyota-prius-2010-2015-4-btn-smart-key-hyq14acx-5290-oem-new-2039
1. 2015 Lexus Smart Key 4B W/ Trunk Fob FCC# HYQ14AEM - 6601 - 899 - Locksmith Keyless, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2011-2013-lexus-smart-key-4b-fcc-hyq14aem-6601-board
1. How To Easily Program Your 2010-2015 Lexus RX 350 Key Fob - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=0sE6ynhVnmI
1. 2009-2016 Lexus Smart Key Wallet Card HYQ14AEB - Your Car Key Guys, accessed December 17, 2025, https://yourcarkeyguys.com/products/2009-2016-lexus-smart-key-wallet-card-hyq14aeb
1. 2014 Toyota Camry Smart Key 4 Buttons FCC# HYQ14FBA - 0020 - Locksmith Keyless, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2014-toyota-camry-smart-key-4-buttons-fcc-hyq14fba-0020-315-mhz
1. Toyota Tacoma, Land Cruiser, Highlander & Prius C Smart Proximity Key, Push Button Start Keyless Remote FOB with Emergency Key - Tom''s Key Company, accessed December 17, 2025, https://tomskey.com/products/toyota-tacoma-land-cruiser-highlander-prius-c-smart-proximity-key-push-button-start-keyless-remote-fob-with-emergency-key-hyq14fba-3b-ag2110-fob-logo
1. Immobilizer and Smart Key Reset - nhtsa, accessed December 17, 2025, https://static.nhtsa.gov/odi/tsbs/2018/MC-10143927-9999.pdf
1. Smart Key Immobilizer Reset and Add/Remove Key - nhtsa, accessed December 17, 2025, https://static.nhtsa.gov/odi/tsbs/2024/MC-10253225-9999.pdf
1. Smart Key Immobilizer Reset and Add/Remove Key - nhtsa, accessed December 17, 2025, https://static.nhtsa.gov/odi/tsbs/2018/MC-10143937-9999.pdf
1. Xhorse XD8ABAGL Toyota BA All Keys Lost Adapter ABK-1765 - ABKEYS, accessed December 17, 2025, https://abkeys.com/products/xhorse-xd8abagl-toyota-ba-all-keys-lost-adapter-xd8abagl-1765
1. 2023 Toyota Corolla Cross bladed key programming via Smart Pro - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=AdYuhzG6F4k
1. Autel APB112 Smart Key Simulator for Autel Key Programmer - UHS Hardware, accessed December 17, 2025, https://www.uhs-hardware.com/products/autel-apb112-smart-key-simulator
1. UNIVERSAL LEXUS/TOYOTA SMART KEY BY XHORSE - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=w9hI9U7Z6Uw
1. 2022-2025 Toyota Tundra All keys lost programming and PIN code bypass. - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=EDR79QIqQqo', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Locksmith Tool Vehicle Coverage', 'Global', 'Tools', 2010, 2024, '

# Comprehensive Technical Analysis of Automotive Transponder Systems and Aftermarket Programming Tool Capabilities (2010–2025)

## 1. Introduction and Industry Landscape

### 1.1 The Evolution of Automotive Immobilization

The automotive security landscape has undergone a profound transformation between 2010 and 2025, evolving from static encryption protocols to dynamic, server-dependent architectures. For the automotive locksmith and security professional, this era represents a shift from mechanical craftsmanship to digital forensics. The task of "making a key" has bifurcated into two distinct disciplines: the physical generation of the blade and the digital handshake required to authorize the transponder.

In the early 2010s, the dominant architecture involved basic immobilizer units (IMMO boxes) communicating with the Engine Control Unit (ECU) via low-speed CAN bus or K-Line protocols. Tools like the early MVP Pro or basic EEPROM readers were sufficient. However, the introduction of "Proximity" or "Smart Key" systems, driven by consumer demand for Push-to-Start (PTS) convenience, necessitated a fundamental redesign of vehicle security. The immobilizer logic migrated from standalone boxes into highly integrated Body Control Modules (BCMs) and Radio Frequency Hubs (RF Hubs).

By 2020, the industry faced a new paradigm: The Connected Vehicle. Manufacturers like General Motors, Ford, and Toyota began implementing "Secure Gateways" (SGW) and shifting to high-speed protocols like CAN FD (Flexible Data-rate) and DoIP (Diagnostics over Internet Protocol). This shift was not merely an upgrade in speed but a hardening of the perimeter. The On-Board Diagnostics (OBDII) port, once an open door for programming, became a firewall.

### 1.2 The Database Challenge: Add Key vs. All Keys Lost (AKL)

For the locksmith database architect, the critical variable is no longer just "Year, Make, Model." The operational reality hinges on the distinction between "Add Key" (duplicate) and "All Keys Lost" (AKL).

- Add Key: typically involves an authenticated session where an existing valid key authorizes the addition of a new one. This often remains possible via OBDII even on newer vehicles.
- All Keys Lost (AKL): represents a total security breach from the vehicle''s perspective. Modern systems (2018+) interpret an AKL programming attempt as a potential theft. Responses range from active alarm triggers (Ford) to module lockdowns (Jeep Wagoneer) or requirements for 128-bit encrypted seed-key exchanges that can only be calculated by the OEM server or powerful aftermarket cloud clusters.

This report provides a granular analysis of the six primary programming platforms—Autel IM608 (and variants), Advanced Diagnostics Smart Pro, Xhorse VVDI Key Tool ecosystem, Lonsdor K518, OBDSTAR X300, and Xtool X100 PAD3—evaluating their architectural suitability for North American models from 2010 to 2025.

## 2. Technical Architecture of Programming Ecosystems

To build an accurate database, one must understand that "coverage" is not a binary state. It is a function of the tool''s hardware capability (VCI), its software logic, and its accessory ecosystem.

### 2.1 Autel MaxiIM Series (IM508 / IM608 / IM608 Pro II)

The Autel ecosystem is built upon a diagnostic foundation. The IM608 is, at its core, a MaxiSys diagnostic tablet with an overlaid immobilizer application.

- Hardware Architecture: The system relies on the J2534 pass-through device (MaxiFlash JVCI/JVCI+). The specific iteration of this VCI is critical. The newer JVCI+ (included with IM608 Pro II) natively supports CAN FD and DoIP, whereas the older JVCI requires external adapters.1
- The XP400 Pro Programmer: This peripheral is the heart of Autel''s AKL capability. It allows for "Bench Mode" operations—reading EEPROM data directly from MCU chips when OBD access is blocked. This is essential for German vehicles (BMW CAS4/FEM, Mercedes EIS) and increasingly for domestic modules that must be unlocked on the bench (e.g., GM E66 ECUs, specific Ford BCMs).3
- Database Implication: A database entry for Autel must track accessory requirements. For example, a 2023 Toyota Camry AKL is not supported by the IM608 alone; it strictly requires the G-Box3 (for CAN direct connection) and APB112 (for emulator generation).5

### 2.2 Advanced Diagnostics Smart Pro

The Smart Pro represents the "Dedicated Locksmith" philosophy. Unlike Autel, it strips away general diagnostics (engine codes, transmission data) to focus purely on key programming.

- Architecture: It utilizes a high-security, token-based transaction model. The software is modular, often requiring specific "ADC" cables (e.g., ADC2011 for Jeep, ADC2015 for Subaru) to physically re-route pins at the OBD port.
- Server Dependency: The Smart Pro relies heavily on "Cloud Calculation." When programming a 2022 Honda Civic or 2023 Ford F-150, the tool captures a challenge code, sends it to Advanced Diagnostics'' servers, and receives a response. This makes it highly dependent on Wi-Fi but generally safer, as the complex calculations happen off-device.7
- Coverage Philosophy: It prioritizes "OBD-only" solutions. If a car cannot be done via the OBD port (requires soldering or chip removal), Smart Pro typically does not support it. This makes it the tool of choice for efficiency but limits its depth in "catastrophic" AKL scenarios.9

### 2.3 Xhorse VVDI Ecosystem (Key Tool Plus / Max / VVDI2)

Xhorse operates on a "Gamified Ecosystem." It is less a single tool and more a suite of interconnected devices.

- The Super Chip: Xhorse''s distinct advantage is the proprietary "Super Chip" and universal remotes. The tool can generate transponders (simulating OEM chips) which allows it to bypass certain supply chain issues.
- Engineering Depth: The Key Tool Plus Tablet is the direct competitor to the IM608. It excels in VAG (Volkswagen/Audi Group) MQB programming and BMW FEM/BDC. It is the only tool in this list that integrates a key cutting machine interface (controlling the Dolphin/Condor cutters) directly into the programmer.7
- Database Implication: Xhorse entries should highlight "Generation" capabilities. For many vehicles (e.g., older Toyota G-chip), Xhorse can generate a remote that functions like an OEM key, whereas others require an OEM blank.

### 2.4 Lonsdor K518 (ISE / PRO)

Lonsdor is the "Niche Specialist." While it covers general cars, its reputation rests on solving specific, high-difficulty vehicles that others ignore.

- Volvo & JLR Superiority: Lonsdor was the first to crack the Volvo SPA platform (XC90, XC60 2016+) via OBD (using a specific adapter). Where Autel requires removing the CEM (Central Electronic Module) and desoldering chips, Lonsdor connects via the CEM''s pins to read security data non-invasively.11
- Proprietary Protocols: It often uses specific "Emulator Keys" (LKE) similar to Autel''s APB112 but optimized for different makes, specifically Toyota and Lexus smart keys.13

### 2.5 OBDSTAR X300 DP Plus & Xtool X100 PAD3

These tools represent the "Agile Budget" sector. They are often the fastest to release updates for specific new models (e.g., 2021 Ford Active Alarm bypass) but lack the hardware robustness of the premium tools.

- Adapter Reliance: OBDSTAR coverage is heavily dependent on an array of adapters (P001, P002, CAN FD, FCA 12+8). A database for OBDSTAR must explicitly list which adapter is required for each car, as the base unit fails on many modern vehicles without them.14
- Xtool: Generally serves as a backup tool. It has surprisingly good coverage for Nissan and specific GM CAN FD models but lacks the depth for European EEPROM work.16

## 3. General Motors (2010–2025): The CAN FD and VIP Transition

The General Motors fleet presents a clear delineation in programming technology, marked by the transition to the Global B (VIP) architecture.

### 3.1 Legacy Global A (2010–2019)

- Vehicles: Chevrolet Malibu, Cruze, Equinox; GMC Terrain; Cadillac CTS (older).
- Analysis: This era is trivial for all six tools. Add Key and AKL are performed via standard OBDII programming. The BCM reads the resistance of the key (Circle Plus) or communicates via standard CAN.
- Coverage: 100% across Autel, Smart Pro, VVDI, Lonsdor, OBDSTAR, Xtool.

### 3.2 The CAN FD Intermediate Era (2020–2022)

- Vehicles: 2020+ Corvette C8, 2021+ Tahoe/Suburban/Yukon/Escalade, 2020+ Cadillac CT4/CT5.
- Technical Constraint: These vehicles utilize the CAN FD protocol. Standard OBDII pins (6 and 14) are used, but the data rate is variable and higher than legacy tools can support.
- Tool Capabilities:

- Autel IM608 (Original/Pro): Requires the Autel CAN FD Adapter ($60-$100 accessory) connected to the VCI. Without it, the tool cannot communicate.18
- Autel IM608 Pro II: Has native CAN FD support in the VCI; no adapter needed.2
- Smart Pro: Supports CAN FD via software update and the ADC2015 adapter in some instances, though recent updates utilize the standard cable with protocol switching.18
- OBDSTAR/Xtool: Both strictly require their proprietary CAN FD Adapters to function.15
- Insight: The 2020+ Corvette C8 is notoriously difficult. While "Add Key" is possible via CAN FD adapter, AKL situations often require a dealer server connection because the BCM is encrypted to a level that aftermarket calculators cannot yet bypass purely offline.

### 3.3 The VIP Architecture Wall (2022/2024+)

- Vehicles: 2022+ Silverado 1500 (Refreshed), 2024+ Equinox EV, Lyriq, Sierra EV.
- Technical Constraint: The "Vehicle Intelligence Platform" (VIP) introduces a server-authenticated firewall. The vehicle must be connected to the internet-connected tool, which then authenticates with GM''s back-end to allow programming.
- Locksmith Status: Coverage is extremely limited.

- Smart Pro: Has limited capabilities via "Connected" modes but often faces "Security Access Denied" errors without a valid NASTF (National Automotive Service Task Force) VSP credential and AC Delco subscription.18
- Autel: Requires the tool to be in "Passthrough" mode using a laptop and an OEM subscription for full functionality on VIP vehicles. Standalone tablet capability is currently spotty or non-existent for AKL on VIP architecture.21

### 3.4 GM Data Table for Database

Model

Year Range

Protocol

Autel IM608

Smart Pro

VVDI Key Tool Plus

Required Adapter

Chevy Silverado

2014-2018

CAN

Yes (OBD)

Yes (OBD)

Yes (OBD)

None

Chevy Silverado

2019-2021

Legacy

Yes (OBD)

Yes (OBD)

Yes (OBD)

None

Chevy Silverado

2022+ (Refreshed)

CAN FD/VIP

Limited (Add Key)

Limited

No

CAN FD Adapter

Chevy Tahoe

2015-2020

CAN

Yes (OBD)

Yes (OBD)

Yes (OBD)

None

Chevy Tahoe

2021-2024

CAN FD

Yes (OBD)

Yes (OBD)

Limited

CAN FD Adapter

Corvette C8

2020-2024

CAN FD

Yes (Add Key)

Yes (Add Key)

No

CAN FD Adapter

## 4. Ford & Lincoln (2010–2025): The Active Alarm Crisis

Ford''s security evolution is characterized by the Parameter Reset (PATS) and the recent introduction of the Active Alarm state.

### 4.1 Standard Intelligent Access (2011–2020)

- Vehicles: Explorer, Edge, Fusion, Mustang, F-150 (Pre-2021).
- Method: To add a key when one is present, it is a simple OBD process. For AKL, the system requires two keys to be present to close the learning cycle.
- Tool Coverage: All six tools perform this flawlessly. The "10-minute wait" (security access delay) is standard, though Smart Pro and Autel can sometimes bypass this on specific models using coded access.22

### 4.2 The Active Alarm Era (2021+)

- Vehicles: 2021+ F-150, 2021+ Bronco, 2021+ Mustang Mach-E, 2020+ Explorer (newer builds).
- The Problem: In an AKL scenario, the vehicle is locked and the alarm is armed. On these newer models, the BCM cuts communication to the OBDII port when the alarm is active to prevent tampering.
- Tool Strategies:

- Advanced Diagnostics Smart Pro: This is the market leader for Ford. It utilizes a software exploit to silence the alarm via the OBD port (often bypassing the BCM shutdown logic) or instructs the user on a specific door-latch manipulation sequence. It allows programming without external battery cables in many cases.23
- Autel IM608 / OBDSTAR / Xhorse: These tools typically fail via standard OBD connection if the alarm is screaming. They require a Ford All Keys Lost Alarm Bypass Cable. This cable connects directly to the battery and communicates with the system to keep the bus alive, effectively overruling the BCM''s shutdown command.23
- Constraint: The Autel IM508/608 often requires the vehicle to be connected to the internet to calculate the security blocks for 2021+ models (F-150 specifically).

### 4.3 Keypad Code Nuance

A critical insight for the database: On Ford vehicles with the door keypad, the Smart Pro and Autel can often read the factory keypad code during the key programming process. This allows the locksmith to grant entry to the customer even if the key programming fails, or as a value-add service.

### 4.4 Ford Data Table for Database

Model

Year Range

System

Autel Capability

Smart Pro Capability

OBDSTAR Capability

Critical Note

F-150

2015-2020

Prox

High

High

High

2 Keys req for AKL closure

F-150

2021-2024

Active Alarm

Medium (Needs Cable)

High (Software Bypass)

Medium (Needs Cable)

Alarm blocks OBD; Bypass req.

Bronco

2021-2024

Active Alarm

Medium

High

Medium

Same as F-150

Mustang

2015-2020

Prox

High

High

High

Backup slot in cupholder

Mach-E

2021-2024

Active Alarm

Low/Medium

Medium

Low

EV architecture is tricky

## 5. Stellantis (Chrysler, Dodge, Jeep, RAM): The Gateway and the Hub

Stellantis presents two massive hurdles: The Security Gateway (SGW) introduced in 2018, and the RF Hub Lockdown introduced in 2021/2022.

### 5.1 The Secure Gateway (SGW) Barrier (2018+)

- The Issue: The OBDII port is firewalled. Read-only access is allowed; Write access (programming keys) is blocked.
- Solution 1: AutoAuth (Software): Autel and Smart Pro have integrated AutoAuth. The user registers an account ($50/year), and the tool authenticates via Wi-Fi to unlock the gateway digitally. This is the preferred professional method.2
- Solution 2: 12+8 Bypass Cable (Hardware): OBDSTAR, Xtool, and Xhorse often rely on physically connecting a "12+8" cable to the Security Gateway Module (usually located behind the radio or under the dash). This bypasses the firewall physically.27
- Database Note: Every 2018+ Stellantis vehicle must be flagged "SGW - AutoAuth or 12+8 Cable Required."

### 5.2 The RF Hub Lockdown (2021+)

- Affected Models: 2022+ Jeep Grand Cherokee L, 2022+ Jeep Wagoneer / Grand Wagoneer.
- The Crisis: In these specific models, the Radio Frequency Hub (RF Hub) permanently locks itself to the programmed keys upon initial setup. In an "All Keys Lost" scenario, the RF Hub cannot be reprogrammed via OBD. It is "Write Once."
- Tool Failure: Plugging an Autel, Smart Pro, or any programmer into the OBD port will result in a "Programming Failed" or "Security Access Denied" message because the Hub refuses to enter learning mode.29
- The Solution:

- Replacement: The official procedure is to replace the RF Hub with a virgin unit from the dealer (~$200-$400 part).30
- Bench Unlock: Emerging capabilities in the Autel XP400 Pro and specialized EEPROM tools allow a locksmith to remove the RF Hub, solder to the MCU, and "wipe" the data to virginize it. However, this is advanced work beyond typical mobile locksmithing.31

- Smart Pro: Smart Pro software can program the keys only after a virgin RF Hub has been installed. It cannot unlock the existing hub via OBD.26

### 5.3 Stellantis Data Table for Database

Model

Year Range

Issue

Autel

Smart Pro

Lonsdor

Action Required

RAM 1500

2013-2017

None

Yes

Yes

Yes

Standard OBD

RAM 1500

2018-2018

SGW

Yes (AutoAuth)

Yes (AutoAuth)

Yes (12+8)

AutoAuth or Cable

RAM 1500 (DT)

2019-2024

SGW

Yes (AutoAuth)

Yes (AutoAuth)

Yes (12+8)

AutoAuth or Cable

Grand Cherokee

2014-2021

SGW (18+)

Yes

Yes

Yes

Standard/SGW

Grand Cherokee L

2021-2024

RF Hub Lock

No (OBD)

No (OBD)

No (OBD)

Replace RF Hub for AKL

Wagoneer

2022-2024

RF Hub Lock

No (OBD)

No (OBD)

No (OBD)

Replace RF Hub for AKL

## 6. Toyota & Lexus (2010–2025): The Encryption Arms Race

Toyota has moved through three distinct eras of security, each requiring specific hardware.

### 6.1 G-Chip and H-Chip (2010–2018)

- Bladed Keys: 2010-2014 (G-Chip) and 2013-2018 (H-Chip).
- AKL Solution:

- Autel/Toyota: For H-Chip AKL, the Autel IM508/608 uses the APB112 Emulator. The tool pulls data from the immobilizer via OBD, the APB112 simulates a "Master Key," and then the new key is added. This avoids dashboard removal.6
- Xtool/OBDSTAR: also support this via their respective emulators (KS-1 for Xtool).

### 6.2 Smart Keys: The 8A Era (2018–2022)

- Vehicles: Camry, RAV4, Highlander (Pre-2023).
- Method: AKL requires calculating a password from the Smart Box.
- Autel: Uses the G-Box3 clamped to the Smart Box (often behind the glove box) to read the data quickly, then calculates the password via server.
- Lonsdor K518: Famous for its "Super Update." It can often back up the Immo data directly via OBD without connecting to the box, generating an emulator key (LKE) to start the car.13

### 6.3 The 8A-BA / 4A TMLF19 Era (2022–2025)

- Vehicles: 2022+ Tundra, 2023+ Prius, 2023+ Sequoia, 2024 Grand Highlander, 2023+ Corolla Cross.
- The Change: These vehicles use the new "BA" or "AA" subtype encryption and the TMLF19 smart box.
- Crucial Hardware: Standard OBD programming is blocked for AKL.

- The 30-Pin Cable: A specialized Toyota 30-Pin Cable (split harness) is required. This connects directly to the Smart ECU.
- Autel: Requires G-Box3 + 30-Pin Cable + APB112. The process involves back-powering the ECU to read the data.34
- OBDSTAR: Has a specific "Toyota-30" cable and excellent software support for these newest models.36
- Xhorse: Uses the XD8ABAGL adapter for Key Tool Plus to interface with these BA systems.10
- Lonsdor: Remains a leader here, supporting the 8A-BA protocol, often without the PIN code requirement if using their specific adapter.35

### 6.4 Toyota Data Table for Database

Model

Year Range

Chip ID

AKL Difficulty

Required Hardware (Autel)

Required Hardware (Lonsdor)

Camry

2012-2017

H-Chip (Blade)

Medium

APB112 Emulator

K518 + Emulator

Camry

2018-2023

8A (Smart)

Medium

G-Box3 + APB112

K518 (OBD often possible)

Sienna

2021-2024

8A (Smart)

High

G-Box3 + APB112

K518

Tundra

2022-2024

8A-BA

Very High

G-Box3 + 30-Pin Cable

K518 + 30-Pin Cable

Corolla Cross

2022-2024

4A

Very High

G-Box3 + 30-Pin Cable

K518 + 30-Pin Cable

## 7. Honda & Acura (2010–2025): The Fragile BCMs

### 7.1 Legacy & Standard Prox (2013–2021)

- Coverage: Excellent across all tools. Honda systems are generally permissible and allow Add Key / AKL via standard OBD processes.

### 7.2 The 2022+ Civic/Integra Risk

- Vehicles: 2022+ Honda Civic, 2023+ Acura Integra.
- The Danger: The BCM in these vehicles is extremely sensitive to voltage fluctuations and protocol errors during the "All Keys Lost" calculation. Early attempts with Autel IM508/608 and even Smart Pro resulted in "bricked" BCMs (vehicle totally dead), requiring dealer replacement.38
- Current Status:

- Smart Pro: Released update ADS2336 (late 2024) specifically to address this. It uses a server-side calculation to safely bypass the BCM security without bricking it. It is considered the safest aftermarket method.39
- Autel: Has updated software, but strictly warns users to ensure battery voltage is stabilized (using a Maintainer, not just jumper cables) and to follow the "Add Key" path if any key is available, rather than the riskier AKL path.41
- Recommendation: For 2022+ Civic/Integra, use Smart Pro or OEM tools if possible. If using Autel, ensure perfect voltage and internet connection.

## 8. Nissan & Infiniti (2010–2025): The Gateway Constraint

### 8.1 Rolling Codes (2013–2019)

- System: BCM produces a 20-digit PIN based on the BCM serial number.
- Tool Support: Autel, Smart Pro, and OBDSTAR all have built-in calculators. No third-party code purchase is usually necessary.

### 8.2 The 16+32 Gateway (2020+)

- Vehicles: 2020+ Nissan Sentra (B18), 2021+ Rogue, 2021+ Versa.
- The Issue: Nissan implemented a Secure Gateway similar to FCA, but blocked the OBD port entirely for immobilizer functions.
- The Fix: A 16+32 Bypass Cable.
- Procedure: The locksmith must remove the glove box or lower dash trim to locate the BCM. The 16+32 cable connects between the BCM and the vehicle harness, extending a new OBD port that is "unlocked."
- Tool Coverage: All tools (Autel, Smart Pro, OBDSTAR) require this cable. The software on the tool is standard, but physical access is the barrier.43

## 9. Subaru (2010–2025): High Security Disconnect

### 9.1 Legacy G-Chip (2010–2017)

- Coverage: High. Simple OBD programming.

### 9.2 High Security & Smart Keys (2018–2024)

- Vehicles: 2020+ Outback, Legacy, Forester.
- The Challenge: Subaru moved to a new high-security smart key platform.
- Autel: Can perform "Add Key" via OBD easily. However, for "All Keys Lost," it often requires removing the Smart Key Module and reading the EEPROM data on a bench, which is complex and risky.46
- Smart Pro: Coverage is spotty. It supports "Add Key" well, but AKL support for 2020-2024 models is listed as "50%" success rate, highly dependent on the specific part number of the smart module.48
- Lonsdor K518: Surprisingly effective here. Lonsdor has released specific software to handle Subaru AKL via OBD on models where Autel requires bench work.49

## 10. European Overview (North American Market Context)

While the focus is North American models, locksmiths frequently encounter European marques sold in the US.

- Volvo (2016-2022): The Lonsdor K518 is the definitive tool. It connects to the CEM via an adapter and reads security data to program keys via OBD. Autel and Smart Pro generally cannot do this via OBD; Autel requires removing the CEM and KVM for bench soldering.11
- VW/Audi (MQB): Autel IM608 and VVDI Key Tool Plus are the leaders. They support MQB AKL, but it requires lifting pins on the dashboard cluster (bench work) or paying third-party data services for the Sync Data.51 Smart Pro is weak here.
- BMW (FEM/BDC): Autel and VVDI are required. The FEM module must be removed, pre-processed on a bench (reading/writing EEPROM), and then reinstalled. Smart Pro does not support this "preprocessing" effectively.53

## 11. Data Structure for Locksmith Database

To build a robust database, the user should structure their CSV/SQL with the following columns, populated by the logic detailed above.

### 11.1 Recommended Schema

Column Name

Description

Example Data

Make

Vehicle Make

Toyota

Model

Vehicle Model

Tundra

Year_Start

Start of generation

2022

Year_End

End of generation

2025

Key_Type

Blade / Smart / Fobik

Smart Key (Prox)

Chip_ID

Transponder ID

8A-BA

Add_Key_Method

OBD / Bench / EEPROM

OBD (Requires Server)

AKL_Method

OBD / Bench / Replace

Bench Connection (On-Vehicle)

Autel_Status

Supported / Beta / No

Supported (High Difficulty)

Autel_Req_Hardware

Accessories needed

G-Box3 + 30-Pin Cable + APB112

SmartPro_Status

Supported / Beta / No

Supported (ADS2328)

Lonsdor_Status

Supported / Beta / No

Supported (Excellent)

Lonsdor_Req_HW

Accessories needed

30-Pin Cable

Notes

Warnings/Tips

Requires back-powering smart ECU. Do not attempt without battery maintainer.

## 12. Conclusion and Recommendations

The 2010–2025 era of automotive locksmithing is defined by fragmentation. No single tool offers universal coverage.

1. The "Dongle Economy": Tool capability is no longer about the tablet; it is about the accessories. A locksmith cannot service the modern fleet without a CAN FD Adapter (GM), 12+8 Cable (Dodge), 16+32 Cable (Nissan), and Toyota 30-Pin Cable.
1. The "Bricking" Risk: Vehicles like the 2022+ Honda Civic and 2021+ Jeep Grand Cherokee L have introduced high-liability scenarios where incorrect programming attempts can destroy control modules. The database must clearly flag these "Red Alert" vehicles.
1. Tool Hierarchy:

- Autel IM608 Pro II: The best all-rounder for deep diagnostics, bench work, and complex EEPROM jobs (BMW, Mercedes, Toyota AKL).
- Smart Pro: The most reliable and fastest for standard US domestics (Ford Active Alarm, GM, Chrysler), offering the safest OBD solutions but lacking bench capability.
- Lonsdor K518: The essential specialist for Volvo and stubborn Subaru/Toyota smart keys.
- VVDI Key Tool Plus: The master of VAG/BMW and universal remote generation.

For the database builder, accuracy lies in the details of the method (OBD vs. Bench) and the hardware requirements, not just a simple "Yes/No" on support.

#### Works cited

1. MaxiIM IM608ProⅡ/IM608SⅡ/IM608Ⅱ | Autel, accessed December 11, 2025, https://www.autel.com/immotool1/4026.jhtml
1. 2025 Autel IM608 PRO II Kits IMMO Key Lost PROGRAMMING Diagnostic Scanner Tool, accessed December 11, 2025, https://www.ebay.com/itm/177078634587
1. MaxiIM IM608 PRO - Autel, accessed December 11, 2025, https://autel.com/immotool1/3250.jhtml
1. Autel MaxiIM IM608 Advanced Key Programming Tool Support Full System Diagnose - AutelEShop, accessed December 11, 2025, https://www.auteleshop.com/wholesale/autel-maxiim-im608-advanced-immo-key-programming.html
1. Which Autel Scanner Can Program Keys? Complete 2025 Guide - obdprice, accessed December 11, 2025, https://www.obdprice.com/blogs/news/which-autel-scanners-can-program-keys
1. Autel APB112 Smart Key Simulator - Shop Now, accessed December 11, 2025, https://store.autel.com/products/autel-apb112
1. Which Key Programming Tool Is The Best Choice - 2022 - Auto Locksmith Training, accessed December 11, 2025, https://www.autolocksmithtraining.com/pages/blog?p=which-key-programming-tool-is-the-best-choice-2022
1. Advanced Diagnostics Smart Pro Key Programming Machine: Description | PDF - Scribd, accessed December 11, 2025, https://www.scribd.com/document/498674446/ADVANCED-DIAGNOSTICS-Smart-Pro-Key-Programming-Machine
1. Best machine for Automotive locksmith for AKL and programming to immobilizer? - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1c8zxl1/best_machine_for_automotive_locksmith_for_akl_and/
1. Xhorse XD8ABAGL Toyota BA All Keys Lost Adapter ABK-1765 - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/xhorse-xd8abagl-toyota-ba-all-keys-lost-adapter-xd8abagl-1765
1. Lonsdor K518USA for Volvo 2015 - 2021 Update - Add a Keys - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/lonsdor-k518usa-for-volvo-2015-2021-update-add-a-keys-all-keys-lost
1. Lonsdor K518ISE Program VOLVO XC60 Smart Key, accessed December 11, 2025, https://www.lonsdork518.com/service/lonsdor-k518ise-program-volvo-xc60-key-11.html
1. Service List-Lonsdor - K518 ISE, K518 PRO, LT20, LT30 | Professional Automotive Key Programming and Matching Tool, accessed December 11, 2025, https://en.lonsdor.com/html/Service
1. KEYMASTER G3 IMMO Tool - OBDSTAR Technology Co., Ltd, accessed December 11, 2025, https://www.obdstar.com/Products_362.html
1. OBDSTAR Key Programming CANFD Adapter Compatible with GM 2020 2021 for - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/obdstar-key-programming-canfd-adapter-compatible-with-gm-2020-2021-for-obdstar-machines
1. X100PAD3 SE - Xtooltech, accessed December 11, 2025, https://www.xtooltech.com/english/ProductsView/X100PAD3SE.html
1. Xtool CAN FD Adapter for GM 2020-2022, accessed December 11, 2025, https://www.xtooleshop.com/wholesale/Xtool-CAN-FD-Adapter.html
1. Autel CAN FD Adapter Compatible with Autel VCI Maxisys Tablets - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/autel-can-fd-adapter-compatible-with-autel-vci-maxisys-tablets-1409
1. Autel CAN FD Adapter Compatible with Autel VCI work for Maxisys Series Tablets - AutelShop.us, accessed December 11, 2025, https://www.autelshop.us/products/autel-can-fd-adapter-compatible-with-autel-vci-work-for-maxisys-series-tablets
1. XTool AutoProPAD CAN-FD Adapter For 2020-2023+ GM Vehicles - Key Innovations, accessed December 11, 2025, https://keyinnovations.com/products/xtool-can-fd-adapter
1. 2025 Autel IM608 PRO II IMMO Key Programming Coding Diagnostic Tool & XP400 PRO | eBay, accessed December 11, 2025, https://www.ebay.com/itm/225471285147
1. Autel IM608 Pro Adds 2021 Ford Transit Key via OBD Success - AutelShop.de, accessed December 11, 2025, https://www.autelshop.de/service/autel-im608-pro-adds-2021-ford-transit-key-via-obd-success-111.html
1. Magnus - Ford Active Alarm Bypass Kit - OBDII Adapter & Extension Cable - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/ford-active-alarm-bypass-kit-obdii-adapter-extension-cable-lock-labs
1. Smart Pro Game changing FORD active alarm software! - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=0Lcrf_yI0t8
1. Xhorse XDFAKLGL All Key Lost Cable for 16-21 Ford for VVDI Key Tool Plus | eBay, accessed December 11, 2025, https://www.ebay.com/itm/277126193250
1. Please help, I think I fell for the "too good to be true" pricing with MS906 PRO??? - Autel Support Communities, accessed December 11, 2025, https://bbs.autel.com/autelsupport/Diagnostic%20System/39180.jhtml?logoTypeId=94&typeName=MaxiSys
1. Xhorse - XDFAKLGL - 2016 - 2021 Ford - All Keys Lost With Active Alarm - Keyless City, accessed December 11, 2025, https://keyless-city.com/products/xhorse-xdfaklgl-2016-2021-ford-all-keys-lost-with-active-alarm-for-vvdi-key-tool-plus
1. OBDSTAR Ford Lincoln Mustang All Keys Lost Adapter for X300 DP Plus/ X - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/obdstar-ford-lincoln-mustang-all-keys-lost-adapter-for-x300-dp-plus-x300-pro4-x300-dp-akl-bypass-alarm-cable
1. 2021 Grand Cherokee L Star Connector Location : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/xp3sle/2021_grand_cherokee_l_star_connector_location/
1. Jeep Grand Wagoneer Key Replacement - What To Do, Costs & More, accessed December 11, 2025, https://lost-car-keys-replacement.com/jeep/grand-wagoneer/
1. Customer Satisfaction Notification Z23 Radio Frequency Hub Module - nhtsa, accessed December 11, 2025, https://static.nhtsa.gov/odi/tsbs/2022/MC-10228024-9999.pdf
1. STOP! Jeep® Tells Dealers To Suspend Sales Of Its All-New Grand Cherokee (WL)!, accessed December 11, 2025, https://moparinsiders.com/stop-jeep-tells-dealers-to-suspend-sales-of-its-all-new-grand-cherokee-wl/
1. Autel APB112 Smart Key Simulator for Autel Key Programmer - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/autel-apb112-smart-key-simulator
1. Auto programmers comparison : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1jkrw1g/auto_programmers_comparison/
1. Xhorse - XD8ABAGL - 2020-2024 Toyota / Lexus Smart Key Programming Cable - All Key Lost - for VVDI Key Tool Plus And VVDI Key Tool Max Pro - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/xhorse-xd8abagl-2020-2024-toyota-lexus-smart-key-programming-cable-for-vvdi-key-tool-plus-and-vvdi-key-tool-max-pro
1. OBDSTAR Toyota 30-PIN Cable Supports 4A And 8A-BA - Techno Lock Keys Trading, accessed December 11, 2025, https://www.tlkeys.com/products/OBDSTAR-Toyota-30-PIN-Cable-supports-4A-and-8A-BA-Types-35666
1. OBDSTAR Toyota-30 Cable Support 4A and 8A-BA All Key Lost for X300 DP PLUS, accessed December 11, 2025, https://www.obdstarstore.com/wholesale/obdstar-toyota-30-cable.html
1. 2022 honda civic : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1ia1qgr/2022_honda_civic/
1. SW Ads2336 Hon 2024 | PDF | Software | Honda - Scribd, accessed December 11, 2025, https://www.scribd.com/document/841638035/sw-ads2336-hon-2024
1. ADS2336 Honda 2024 - New Key Programming Software - Storyblok, accessed December 11, 2025, https://a-us.storyblok.com/f/1015476/x/2e5884b210/sw-ads2336-hon-2024.pdf
1. Autel IM608S II Program 2022 Honda Civic All Keys Lost - obdprice, accessed December 11, 2025, https://www.obdprice.com/blogs/news/autel-im608s-ii-program-2022-honda-civic-all-keys-lost
1. Autel KM100 Adds 2022 Honda Civic Smart Key Success - AutelShop.de Official Blog, accessed December 11, 2025, http://blog.autelshop.de/autel-km100-adds-2022-honda-civic-smart-key-success/
1. AUTEL Nissan 16+32 ByPass Cable - Auto Rescue Tools, accessed December 11, 2025, https://autorescuetools.com/products/autel-nissan-16-32-bypass-cable
1. Autel 16+32 Nissan Secure Gateway Adaptor Cable for IM608 Pro and IM508, accessed December 11, 2025, https://keyinnovations.com/products/autel-16-32-nissan-secure-gateway-adaptor-cable-for-im608-pro-and-im508
1. Nissan 16+32 ByPass Cable - AESwave.com, accessed December 11, 2025, https://www.aeswave.com/nissan-16-32-bypass-cable-p10056.html
1. Autel IM608 II Adds 2024 Subaru Outback Smart Key Success - AutelShop.de Official Blog, accessed December 11, 2025, http://blog.autelshop.de/autel-im608-ii-adds-2024-subaru-outback-smart-key-success/
1. subaru all keys lost - Autel Support Communities, accessed December 11, 2025, https://bbs.autel.com/autelsupport/tools/36627.jhtml?createrId=315171&view=1
1. Subaru Outback 2023 Programming Smartpro : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1oloqby/subaru_outback_2023_programming_smartpro/
1. Recommendations for euro key programming and all keys lost on Subaru vehicles. - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1io1su8/recommendations_for_euro_key_programming_and_all/
1. Lonsdor K518 USA - 2015-2021 Volvo Update - Add a Key / All Keys Lost - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/lonsdor-k518-usa-2015-2020-volvo-update-add-a-key-all-keys-lost
1. Autel IM608/IM508 Key Programming Guides: Comprehensive Car Model List, accessed December 11, 2025, https://manuals.plus/m/733a2c524186a3f41f7e7a3da3c645421710c7219093196d67caabcd4dd5154f
1. Autel All key lost : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1iat02x/autel_all_key_lost/
1. For BMW FEM BDC CAS4 CAS4+ Programming GODIAG Test Platform Support All Key Lost Work With Lonsdor Autel VVDI2 IM608 CGDI ACDP - AliExpress, accessed December 11, 2025, https://www.aliexpress.com/item/1005006917818078.html
1. How to Program BMW 1-Series FEM All Keys Lost on Bench With the Autel IM608 - ABKEYS, accessed December 11, 2025, https://abkeys.com/blogs/news/how-to-program-bmw-1-series-fem-all-keys-lost-on-bench-with-the-autel-im608', 'RESEARCH');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('BMW Locksmith Guide Development', 'BMW', 'General', 2010, 2024, '

# BMW PROFESSIONAL LOCKSMITH PROGRAMMING GUIDE

Global Market Coverage: 1995–2025

Comprehensive Technical Reference for Immobilizer Systems, Key Programming, Diagnostics, and Module Repair

⚠ CONFIDENTIAL DOCUMENT - FOR PROFESSIONAL LOCKSMITH & DIAGNOSTIC USE ONLY

Updated: December 2025

## TABLE OF CONTENTS

Section 1: The Philosophy of BMW Security Architecture

- 1.1 The Evolution of Theft Prevention: From EWS to Cloud Authorization
- 1.2 Understanding the "Triangle of Security": Key, Immobilizer, and DME
- 1.3 The Role of the Individual Serial Number (ISN) and Rolling Codes
- 1.4 Critical Safety Protocols: Voltage Stabilization and Flash Protection

Section 2: The EWS Era (1995–2006) – System Deep Dive

- 2.1 EWS 1 & 2: The Birth of Rolling Codes
- 2.2 EWS 3 (3.2, 3.3, 3.D): K-Line Communication and MCU Logic
- 2.3 EWS 4: The Introduction of Secured MCUs (2L86D)
- 2.4 Mechanical Key Decoding: HU58 Profile Analysis and Lishi Operations

Section 3: The CAS Era (2002–2014) – System Deep Dive

- 3.1 CAS1 (E65): The Transition to CAN-BUS and Slot Keys
- 3.2 CAS2 (E60/E90): Refinement of the White Box System
- 3.3 CAS3 & CAS3+ (E-Series): Encryption, ISTA-P, and Flash Downgrading Risks
- 3.4 CAS4 & CAS4+ (F-Series): The Move to 5M48H MCUs and Bench Security
- 3.5 Mechanical Key Decoding: HU92 Profile Analysis and Twin-Lifter Procedures

Section 4: The FEM/BDC Era (2012–2019) – System Deep Dive

- 4.1 Architectural Shift: Integrating Security into Body Control
- 4.2 The "Preprocessing" Workflow: Why Service Mode is Mandatory
- 4.3 EEPROM Management: 95128/95256 Chip Handling and Data Integrity
- 4.4 Mechanical Key Decoding: HU100R Profile Analysis and Reverse Logic

Section 5: The G-Series Era (2018–Present) – BDC2, BDC3, and Cloud Security

- 5.1 BDC2 Architecture: Enhanced Encryption and Bench Requirements
- 5.2 BDC3 & Cloud Analysis: The Shift to Server-Side Calculation
- 5.3 The "All Keys Lost" Problem: Bosch MD1/MG1 DME Locking
- 5.4 Digital Keys and Ultra-Wideband (UWB) Technology

Section 6: Transponder Technology and Remote Frequency Management

- 6.1 Chip Evolution: From PCF7935 to 128-bit AES Hitag Pro
- 6.2 Frequency Distribution: 315MHz vs. 434MHz vs. 868MHz
- 6.3 FCC ID Cross-Reference and OEM Part Number Guide
- 6.4 Rechargeable vs. Replaceable Batteries: VL2020 vs. CR2032/CR2450

Section 7: Comprehensive Tool Methodologies and Walkthroughs

- 7.1 Autel MaxiIM IM608 Pro II / IM508S: OBD Mastery and Limitations
- 7.2 Xhorse Ecosystem: VVDI2, Key Tool Plus, and Bench Adapters
- 7.3 Yanhua Mini ACDP: The Solder-Free Interface Board Revolution
- 7.4 Specialized EEPROM Tools: AK90+, VVDI Prog, and HexTag

Section 8: Detailed Operational Procedures (Step-by-Step)

- 8.1 Procedure: EWS3 All Keys Lost using AK90+ (Bench)
- 8.2 Procedure: CAS3+ ISTA-P Add Key via OBD (Flash Downgrade)
- 8.3 Procedure: CAS4+ All Keys Lost (Bench Read with XP400/ACDP)
- 8.4 Procedure: FEM/BDC Key Learning with Preprocessing
- 8.5 Procedure: G-Series BDC3 Add Key via OBD (Cloud Calculation)

Section 9: Advanced Diagnostics: ISN Reading and Module Synchronization

- 9.1 The Hierarchy of ISN: Short (4-byte) vs. Long (16/32-byte)
- 9.2 Bench Reading DMEs: MSD80, MSV90, N20, B48, B58
- 9.3 Synchronization: Realigning CAS-ELV and CAS-DME Rolling Codes

Section 10: Module Repair, Recovery, and Cloning

- 10.1 FRM3 Repair: Restoring Corrupted Partition Data (D-Flash/EEE)
- 10.2 CAS3+ Unbricking: Recovering from Failed Flash Downgrades
- 10.3 ELV Emulation: Bypassing the Electronic Steering Lock

Section 11: Pricing Strategy, Risk Management, and Decision Matrices

## SECTION 1: THE PHILOSOPHY OF BMW SECURITY ARCHITECTURE

### 1.1 The Evolution of Theft Prevention

To professionally service BMW vehicles, a locksmith must first understand the engineering philosophy that drives the brand''s security architecture. Unlike manufacturers that rely on static PIN codes (like Hyundai/Kia) or timed access delays (like Ford), BMW''s security strategy is built upon a complex, synchronized "handshake" between multiple control modules. This architecture has evolved through four distinct epochs: the EWS (Electronic Drive Away Protection), the CAS (Car Access System), the FEM/BDC (Front Electronic Module / Body Domain Controller), and the modern G-Series/Cloud era.

In the mid-1990s, the introduction of EWS marked a departure from simple mechanical locks to electronic verification. By separating the transponder reading from the engine management authorization, BMW created a system where physically turning the ignition lock was insufficient to start the vehicle. This philosophy—that "authorization" is separate from "actuation"—has remained the core tenet of BMW security, culminating in modern systems where the key does not mechanically interact with the car at all, but rather authorizes the Body Domain Controller to wake up the vehicle''s bus systems.1

### 1.2 Understanding the "Triangle of Security"

Every BMW immobilizer system functions on a triangular relationship between three critical components. A failure or mismatch in any leg of this triangle results in a "crank, no-start" or "no-crank" condition.

1. The Key (Transponder): Contains a fixed ID and a variable cryptographic code (rolling code or ISN-derived password). The key must prove its authenticity to the Immobilizer Module.
1. The Immobilizer Module (EWS/CAS/FEM/BDC): This is the gatekeeper. It energizes the key coil, reads the transponder data, checks it against its internal "allow list" (Key Slots 1-10), and if valid, releases the terminal voltage (Terminal 15/50) to the starter. Crucially, it then sends a specialized authorization code (ISN) to the engine computer.
1. The Engine Control Unit (DME/DDE): The Digital Motor Electronics (Gas) or Digital Diesel Electronics receives the ISN from the immobilizer. It compares this ISN against its own internal memory. If—and only if—the ISN matches, the DME enables the fuel injectors and spark plugs.2

This interaction explains why a "used" ECU from a junkyard will not start a BMW. The used ECU contains the ISN from the donor car, which does not match the ISN stored in the recipient car''s CAS module. Professional locksmithing on BMWs is largely the art of reading, managing, and synchronizing these ISN codes.

### 1.3 The Role of the Individual Serial Number (ISN) and Rolling Codes

The ISN is the cryptographic "password" that links the Immobilizer to the DME.

- Early Systems (EWS): Used a 4-digit rolling code. The EWS and DME would agree on a starting code, and every time the car started, this code would "roll" forward mathematically. If the battery died during cranking, the codes could roll out of sync, requiring a diagnostic "Realignment".3
- Middle Systems (CAS3): Introduced a static 4-byte (Short) or 16-byte (Long) ISN. This was more stable but required precise extraction to program keys in "All Keys Lost" scenarios.
- Modern Systems (CAS4/FEM/G-Series): Use a 32-byte (128-bit) ISN. This is cryptographically secure and cannot be brute-forced. It must be extracted by reading the physical memory of the DME or the Immobilizer.4

### 1.4 Critical Safety Protocols: Voltage Stabilization

Before touching a BMW with any programming tool, the most critical step is Voltage Stabilization. BMW modules, particularly the CAS3+ and FEM, are notoriously sensitive to voltage fluctuation.

- The Risk: During key programming, the diagnostic tool often erases the module''s firmware (Flash) to rewrite it with unlocked data ("Flash Downgrading"). This process can take 10-20 minutes. If the vehicle''s voltage drops below 12.5V during this write cycle, the bootloader can corrupt, leaving the module "bricked"—unresponsive and dead.6
- The Solution: Never use a standard battery charger or jumper cables. You must use a dedicated Power Supply Unit (PSU) capable of maintaining a clean, ripple-free 13.6V to 14.2V at up to 50-70 Amps. This ensures the modules remain fully powered and stable throughout the programming session.7

## SECTION 2: THE EWS ERA (1995–2006) – SYSTEM DEEP DIVE

The EWS system is the foundation of BMW locksmithing. While older, these vehicles (E46 3-Series, E39 5-Series, E53 X5) are still common on the road and offer high-profit margins because many generic locksmiths cannot handle the bench work required.

### 2.1 EWS 1 & 2: The Birth of Rolling Codes

- EWS 1 (1994-1995): This was a primitive system that functioned essentially as a starter kill relay. It monitored the door locks and the general module. The keys often used simple multi-track milling but lacked sophisticated transponder logic.
- EWS 2 (1995-1997): This system introduced the dedicated EWS module (white box with a yellow connector) and the key transponder (PCF7930/7931). The key sends a fixed code and a rolling code to the EWS. The EWS validates the key and then sends a signal to the DME to enable fuel/spark. This generation is robust but prone to rolling code desynchronization if the battery is low.9

### 2.2 EWS 3 (3.2, 3.3, 3.D): K-Line Communication

Found in the ubiquitous E46 3-Series and E53 X5, EWS 3 is the most common variant encountered today.

- Module Identification: A white or black box, usually located under the driver''s side dashboard (above the pedals) or behind the glovebox (in the X3). It uses a Motorola MC68HC11EA9 or similar MCU.10
- Operation: The EWS 3 module stores the odometer reading and the Vehicle Identification Number (VIN) in addition to key data. It communicates via the K-Line diagnostic protocol.
- Programming Limitation: While some tools claim OBD support for EWS3, it is notoriously unreliable. The "K-Line" speed is slow and unstable for writing key data. The professional standard is Bench Programming using an AK90+ or VVDI Prog.

### 2.3 EWS 4: The Introduction of Secured MCUs

Towards the end of the E46/X3 production run (2004-2006), BMW introduced EWS 4.

- The Challenge: Externally, the module looks identical to EWS 3. Internally, it uses a secured Motorola MCU with the mask 2L86D.
- The Solution: This MCU has "Secured" memory sectors that cannot be read by a simple clip. To read an EWS 4 module, the locksmith must solder four wires to specific test points on the back of the circuit board (BKG, VCC, GND, RESET) to bypass the security lock. Using a standard EWS3 clip on an EWS4 module will result in a "Pin Touch" error or a bad read.11

### 2.4 Mechanical Key Decoding: HU58 Profile

Before the widespread adoption of the laser-cut key, BMW used the HU58 profile.

- Structure: A 4-track external key. It has two tracks on the top edge and two on the bottom edge.
- Lishi Tool: HU58 (2-in-1). This is widely considered one of the most difficult automotive locks to pick due to the spring tension and the sheer number of wafers (12 positions).
- Decoding: The locksmith must decode both the A-axis and B-axis. Accurate decoding is critical because the 4-track system has very tight tolerances. Cutting this key requires a standard side-mill duplicator or a CNC machine capable of "shoulder gauging" the blank.13

## SECTION 3: THE CAS ERA (2002–2014) – SYSTEM DEEP DIVE

The Car Access System (CAS) represents the "Golden Age" of BMW locksmithing. It integrated the remote control receiver, immobilizer, and ignition switch logic into a single unit. Understanding the specific generation of CAS is the difference between a 10-minute OBD job and a bricked module.

### 3.1 CAS1 (E65): The Transition to CAN-BUS

- Vehicle: E65 7-Series (2002-2008).
- Key Type: The first "Slot Key" or "Smart Key" (Rectangular fob).
- Architecture: CAS1 moved the security data from the K-Line to the faster CAN-BUS network. However, the remote control functions in early E65s were sometimes handled by a separate antenna module, meaning programming the transponder did not always automatically program the remote.
- Programming: CAS1 can be done via OBD, but it is often safer to read the module on the bench due to the age and volatility of the E65''s electrical system.14

### 3.2 CAS2 (E60/E90 Early)

- Vehicles: Early E60 5-Series and E90 3-Series (up to ~2006).
- Key Type: "Semi-Smart" Slot Key (often white casing on the module).
- Advancement: CAS2 fully integrated the remote functions. Once the transponder is programmed and the key is inserted into the slot, the remote usually syncs automatically or requires a manual button-press sequence (Hold Unlock, press Lock 3 times).15
- Tooling: Fully supported via OBD by Autel IM608, VVDI2, and others. Bench reading is rarely required unless All Keys Lost (AKL) fails via OBD.16

### 3.3 CAS3 & CAS3+ (The Industry Standard)

This is the most common system.

- CAS3 (2006-2008): Unencrypted. Keys can be added via OBD quickly.
- CAS3+ (2008-2012): Encrypted. The MCU firmware (Mask 0L15Y/0M23S) is locked.
- The "Flash Downgrade": To add a key to a CAS3+ via OBD, the tool must first bypass the encryption. It does this by erasing the current "secure" firmware and writing an older, vulnerable version ("Flash Downgrade").

- Risk: This process takes 8-15 minutes. If voltage drops or the cable disconnects, the CAS flash becomes corrupted. The car will be dead—no dash lights, no ignition.
- Mitigation: Always use a PSU (13.6V). If the module bricks, tools like Xhorse Key Tool Plus or Autel IM608 have a "Repair CAS" function that attempts to rewrite the flash. If that fails, bench recovery (writing a good EEPROM/Flash dump) is the only fix.6

### 3.4 CAS4 & CAS4+ (F-Series)

With the F-Series (F10, F01), BMW introduced CAS4.

- Module Location: Usually located under the dash, above the driver''s footwell.
- CAS4 (White Case): Uses the Motorola 9S12XDP512 MCU. Often unencrypted.
- CAS4+ (Black Case): Uses the 9S12XEP100 MCU (Mask 5M48H or 1N35H). Encrypted.
- Programming Strategy: While some tools claim OBD support, it is extremely risky. The professional standard is Bench Reading.

- Method: Remove the CAS4 module. Use a solder-free adapter (like ACDP Module 1 or Godiaq Test Platform) to read the D-Flash (Data) and P-Flash (Program).
- Process: The tool decrypts the data, extracts the ISN, and generates a new key file. This file is then written to a new blank key. The modified D-Flash does not usually need to be written back to the car for "Add Key," but is required for "All Keys Lost" to disable old keys.18

### 3.5 Mechanical Key Decoding: HU92

- Profile: 2-Track Internal. Used on almost all E-Series vehicles.
- Lishi Tool: HU92 (Twin Lifter) is strongly recommended over the Single Lifter. The Twin Lifter allows for more independent control of the wafers.
- Decoding Rule:

- Twin Lifter: Decode in the SAME direction you picked.
- Single Lifter: Decode in the OPPOSITE direction you picked.
- This confusion is the #1 cause of miscut HU92 keys. Always verify which tool version you are using.20

## SECTION 4: THE FEM/BDC ERA (2012–2019) – SYSTEM DEEP DIVE

The F30 3-Series marked the end of the CAS module. Security was integrated into the Front Electronic Module (FEM), while X-Series vehicles used the Body Domain Controller (BDC). These modules are structurally identical regarding key programming.

### 4.1 Architectural Shift

Unlike CAS, where the key data lived in a separate EEPROM, FEM/BDC key data is tightly integrated with the module''s gateway and lighting functions. The security data is encrypted and distributed between the MCU and a 95128/95256 EEPROM chip.

### 4.2 The "Preprocessing" Workflow

Programming a key to a FEM/BDC vehicle is not a simple "Add Key" click. The module must be "Preprocessed" (put into Service Mode) to accept new data. This is a multi-step surgery:

1. Backup Coding: Read the module''s coding data via OBD. This controls window auto-up, headlights, etc. If you lose this, the car starts but the windows won''t work.
1. EEPROM Manipulation:

- Remove the FEM from the car.
- Locate the 95128/95256 8-pin EEPROM chip on the PCB.
- Read the EEPROM data (Bench).
- The tool generates a modified "Service File." Write this file back to the EEPROM.

1. Flash Update: Reinstall the FEM to the car (or test platform). The tool will now "Flash" the MCU. The Service EEPROM file allows the tool to bypass the security lock during this flash.
1. Restore: Once the MCU is unlocked, write the Original EEPROM file back to the chip.
1. Key Learning: Now, and only now, can the tool learn a new key via the induction coil on the steering column.22

### 4.3 EEPROM Management

- Solder vs. Clip: Most failures occur here. The 95128 chip is coated in conformal coating (varnish). If you do not clean this off perfectly, a clip adapter will get a bad read.
- Recommendation: Many professionals prefer Yanhua ACDP Module 2, which uses a specialized pressure socket that clamps onto the chip without soldering, avoiding the risk of overheating the adjacent components or lifting traces.24

### 4.4 Mechanical Key Decoding: HU100R

- Profile: F-Series and G-Series use the HU100R.
- Difference from GM: It is the "Reverse" of the GM HU100. The cuts are on the opposite side of the track spine.
- Picking: These locks utilize variable wafers and can feel "mushy." Heavy tension often binds the lock; extremely light tension is required to feel the wafer states.
- Decoding: Direct read depths 1-4. The key code series is often available on the door lock cylinder itself if removed, but picking is faster.25

## SECTION 5: THE G-SERIES ERA (2018–PRESENT)

The G-Series introduced the BDC2 and BDC3 modules, representing the hardest challenge currently facing locksmiths.

### 5.1 BDC2 Architecture

Found in early G-chassis (G30 5-Series, G11 7-Series).

- Structure: Similar to FEM/BDC but with updated encryption.
- Bench Support: Tools like ACDP Module 38 and Xhorse Key Tool Plus can perform "Add Key" on the bench without opening the module, using interface boards.
- Limitation: For All Keys Lost, you typically need the ISN from the Engine (DME).

### 5.2 BDC3 & Cloud Analysis (2019+)

Found in G20 (3-Series), G05 (X5), and newer models.

- The Hurdle: BDC3 firmware is locked down. Traditional preprocessing often fails or is blocked.
- The Solution: Autel and other manufacturers have introduced "Cloud Calculation" solutions. By connecting the tool to the internet, the software uploads the encrypted data to a server which calculates the "Key Password."
- Cost: This is often a paid service. Autel charges an annual subscription or per-VIN fee (approx. $120) for G-Series Add Key calculation capabilities.27

### 5.3 The "All Keys Lost" Problem: Bosch MD1/MG1

For AKL on a G-Series, you need the ISN from the DME.

- The Problem: Newer Bosch MD1 and MG1 ECUs (produced after June 2020) have a "Bench Lock" that prevents reading the ISN via standard bench tools.
- The Workaround: Currently, there is no easy OBD solution for AKL on 2021+ G-Series. The DME often must be sent to a specialist tuner (like FEMTO in Finland) for unlocking, or the dealer must order a key.29

## SECTION 6: TRANSPONDER TECHNOLOGY AND REMOTE FREQUENCY

### 6.1 Chip Evolution

- PCF7935 (ID44): EWS era. Robust, rewriteable.
- PCF7945 (ID46): CAS1-3 era. The "Hi-Tag 2" chip. Extremely common.
- PCF7953 (ID49): CAS4/FEM/BDC era. "Hi-Tag Pro" (Hitag 3). Uses 128-bit AES encryption.
- NCF2951: G-Series. Advanced version of ID49.

### 6.2 Frequency Distribution

- 315 MHz: Standard for USA, Canada, Japan (mostly).
- 434 MHz (433.92): Standard for Europe, UK, Australia, Asia, Middle East.
- 868 MHz: Used in specific Continental European markets (e.g., Germany) for CAS3 systems to reduce interference.
- Check: Never guess. Use a frequency tester (Key Tool Max) on the original key. If no key exists, check the VIN decoder or the markings on the antenna amplifier (usually in the C-pillar).30

### 6.3 FCC ID Cross-Reference and OEM Part Numbers

Chassis

System

Key Style

Frequency

FCC ID

Chip

E90/E60

CAS3

Smart (CA)

315 MHz

KR55WK49127

ID46

E90/E60

CAS3

Slot (Non-CA)

315 MHz

KR55WK49123

ID46

F10/F01

CAS4

Smart 4-Btn

315 MHz

YGOHUF5662

ID49

F10/F01

CAS4

Smart 4-Btn

434 MHz

YGOHUF5767

ID49

F15/F30

FEM

Smart 4-Btn

315 MHz

YGOHUF5662

ID49

F15/F30

FEM

Smart 4-Btn

434 MHz

NBGIDGNG1

ID49

G20/G05

BDC3

Blade Smart

434 MHz

N5F-ID21A

NCF2951

Note: CAS4 and FEM keys often look identical. An unlocked CAS4 key cannot be programmed to a FEM car. Always check the board ID or buy "Universal" keys (like Autel IKEY or Xhorse XM38) that can be generated for either.32

## SECTION 7: COMPREHENSIVE TOOL METHODOLOGIES

### 7.1 Autel MaxiIM IM608 Pro II / IM508S

- Strengths: Best guided interface ("Expert Mode" vs "Smart Mode"). Excellent diagrams for connection points.
- Weaknesses: High risk of bricking CAS3+ if voltage is unstable. G-Series functions are expensive add-ons.
- Essential Accessories:

- XP400 Pro: Mandatory for reading keys and infrared Mercedes keys.
- G-BOX3: Required for fast password calculation on CAS4 and bench DME reading (reduces time from 30 mins to <5 mins).34
- APB112: Smart key simulator, useful for AKL data collection.

### 7.2 Xhorse Ecosystem

- VVDI2: The legendary tool for BMW. Extremely stable on CAS1-3 via OBD. Good file maker functions.
- Key Tool Plus: The tablet version. Integrates VVDI2, VVDI Prog, and MB tool. Excellent for bench reading due to integrated pin detection.
- Tokens: Xhorse uses a token system for some online calculations (mostly Mercedes, but occasionally complex BMW functions).

### 7.3 Yanhua Mini ACDP

- The "Solder-Free" King: ACDP''s selling point is its "Module" system using interface boards.

- Module 1 (CAS): Clamps over the MCU. No soldering wires.
- Module 2 (FEM): Clamps over the 95128/95256 chip.
- Module 3 (ISN): Plugs directly into the DME connector pins.

- Verdict: This is the safest tool for FEM/BDC and CAS4. It removes human error (bad soldering) from the equation.24

### 7.4 AK90+ (EWS Specialist)

- Role: Do not underestimate this $40 tool. It is often more reliable for reading EWS3 MCUs than tools costing $3,000. It is a pure bench tool. Remove EWS -> Clean Pins -> Read -> Write Key -> Reinstall. It just works.11

## SECTION 8: DETAILED OPERATIONAL PROCEDURES

### 8.1 Procedure: EWS3 All Keys Lost using AK90+

1. Extract Module: Remove the EWS3 box from under the dash.
1. Clean Pins: Open the case. Identify the Motorola MCU (0D46J/2D47J). Use a fiberglass pen or acetone to meticulously clean the varnish off the pins. Failure to do this causes read errors.
1. Connect: Attach the AK90 ribbon cable connector to the MCU. Align the red dot on the connector with the dimple (Pin 1) on the MCU.
1. Read: Launch software. Select MCU type. Click "Read EWS". The tool will beep if the connection is good. Save the .bin file.
1. Write: Place a new PCF7935 chip in the AK90 slot. Select an unused key slot (e.g., Key 5) in the software. Click "Write Key".
1. Verify: The chip is now programmed with the rolling code for Slot 5. Reinstall EWS. The car will start. No diagnostic sync is needed for EWS3 unless the DME-EWS rolling code was previously corrupted.

### 8.2 Procedure: CAS3+ ISTA-P Add Key via OBD (Autel)

1. Connect PSU: Set to 13.8V.
1. Identify: IMMO -> BMW -> Smart Selection. Tool identifies CAS3+ (ISTAP).
1. Process: Select "Key Learning". The tool warns "Flash Downgrade Required". Proceed.
1. Flash: The tool will erase and rewrite the CAS firmware. This takes ~10 minutes. Do not open doors or touch switches.
1. Learn: Once flashed, the tool asks you to insert the working key (to read auth) and then the new blank key.
1. Restore: The tool typically does not restore the original flash automatically; it leaves the CAS in the "downgraded" state which is functional.

### 8.3 Procedure: CAS4+ All Keys Lost (Bench Read - ACDP)

1. Removal: Remove CAS4 module.
1. Connection: Install the ACDP CAS4 interface board over the PCB. Tighten the studs to ensure pogo pins make contact.
1. Read: Select "CAS4+ (5M48H)". Read P-Flash and D-Flash. The tool automatically decrypts the data.
1. ISN: The tool displays the ISN and VIN. It creates a key file.
1. Program: Place a new key in the ACDP coil. Select "Generate Dealer Key". Select the key file generated in step 4.
1. Install: Reinstall CAS4. Hold the new key to the steering column coil. Press Start. The key will sync.

### 8.4 Procedure: FEM/BDC Key Learning (Preprocessing)

1. Backup: Connect OBD. Read "Coding Data".
1. Bench Work: Remove FEM. Open shell.
1. Adapter: Attach ACDP Module 2 clip to the 95128 EEPROM.
1. Read & Modify: Read EEPROM. Tool saves "Original_EEPROM.bin". Tool generates "Service_EEPROM.bin". Write Service file to chip.
1. Flash: Reconnect FEM to platform/car. Perform "Program ECU".
1. Restore: Attach clip again. Write "Original_EEPROM.bin" back to chip.
1. Add Key: Now connect via OBD (or bench). The FEM is unlocked. You can now use "Learn Key".
1. Coding: Restore the "Coding Data" saved in Step 1 to fix windows/lights.23

## SECTION 9: ADVANCED DIAGNOSTICS: ISN READING & MODULE SYNCHRONIZATION

### 9.1 The Hierarchy of ISN

The ISN is the cryptographic glue holding the car together.

- E-Series (Short ISN): 4 bytes (e.g., 12 34). Found in older DMEs (MS43, MS45).
- E-Series (Long ISN): 16 bytes. Found in MSD80/81 (N54).
- F-Series (ISN): 32 bytes (128-bit). Found in N20/N55/B48/B58.

### 9.2 Bench Reading DMEs

If you have All Keys Lost on a CAS3+ or FEM car, you cannot read the ISN from the immobilizer because you cannot turn on the ignition to wake it up. You must read the ISN from the DME.

- MSD80/81 (N54): Use Autohex II or VVDI Prog with a Tricore cable. Connect to pins on the DME connector. Read ISN.
- MSV90 (Continental): Requires unlocking. ACDP Module 27 is excellent for this.
- N20 / B48 / B58: These require opening the shell (boot mode) OR using specialized interface boards (ACDP Module 3) that plug into the DME pins without opening the shell.5

### 9.3 Synchronization

If a car cranks but doesn''t start, the rolling code between CAS and DME may be mismatched (Tampering error).

- Tools: Autel, Launch, ISTA.
- Function: Service -> Drive -> DME -> "DME-CAS Adjustment" or "EWS Alignment". This resets the rolling code list.3

## SECTION 10: MODULE REPAIR, RECOVERY, AND CLONING

### 10.1 FRM3 Repair

The FRM3 (E-Series) corrupts its own P-Flash partition when voltage fluctuates (e.g., battery change).

- Symptoms: Windows dead, indicators dead, headlights stuck on.
- Repair: Connect VVDI Prog / ACDP to the MC9S12 chip. Read D-Flash (it will look empty/corrupt). Use the tool''s "Partition Repair" or "Write Partition" function. This reallocates the memory sectors. The EEPROM data usually reappears magically because it was just the partition table that was lost. No coding required after fix.37

### 10.2 CAS3+ Unbricking

If an OBD flash fails, the CAS bootloader is corrupted.

- Repair: You must read the CAS EEPROM/Flash on the bench. Use a hex editor or a tool like HexTag to repair the bootloader section of the bin file. Write the fixed file back. This resurrects the module.6

### 10.3 ELV Emulation

On E90/E60, the physical steering lock (ELV) often jams, preventing the CAS from authorizing a start (Error A0AA).

- Fix: Buy a $20 "ELV Emulator" plug. Disconnect the ELV connector on the steering column. Plug in the emulator. The CAS now thinks the lock is open and healthy. Reset the ELV counter in the CAS using a scanner. Car starts.38

## SECTION 11: PRICING STRATEGY & DECISION MATRICES

### Locksmith Tool Decision Matrix

Scenario

Best Tool

Backup Tool

Note

EWS 3/4 AKL

AK90+

VVDI Prog

AK90 is cheaper ($40) & faster.

CAS 3+ Add Key

Autel IM608

VVDI2

Autel has superior guided mode.

CAS 4/4+ AKL

Yanhua ACDP

Key Tool Plus

ACDP = No soldering risk.

FEM/BDC AKL

Yanhua ACDP

Autel IM608

ACDP requires less disassembly.

G-Series Add

Autel (Sub req.)

Dealer Key

High cost for tool sub (~$120).

FRM Repair

VVDI Prog

ACDP Module 8

Easy profit job ($150+).

### Pricing Guidelines (US Market Estimates)

- Spare Key (E-Series/F-Series): $250 - $350.
- All Keys Lost (CAS3): $450 - $600.
- All Keys Lost (FEM/BDC): $600 - $900 (Labor intensive).
- FRM Repair: $200 - $300 (30 mins work).
- G-Series AKL: $800+ (Often requires DME unlocking or dealer key).

DISCLAIMER: This guide is for educational and professional use. Procedures such as ISN reading and EEPROM modification carry inherent risks of damaging vehicle control modules. Always maintain a stable power supply (13.6V+) during programming. The author and publisher assume no liability for bricked modules or voided warranties.

— END OF DOCUMENT —

#### Works cited

1. Understanding EWS in BMW - DUDMD Tuning, accessed December 11, 2025, https://www.dudmd.com/blogs/news/understanding-ews-in-bmw
1. DME Synchronization : Specialized ECU Repair - Self-Help Knowledge Base, accessed December 11, 2025, https://ecudoctors.freshdesk.com/support/solutions/articles/47001097260-dme-synchronization
1. DDE-CAS sync Problem - Bimmerforums - The Ultimate BMW Forum, accessed December 11, 2025, https://www.bimmerforums.com/forum/showthread.php?2131297-DDE-CAS-sync-Problem
1. Reading ISN From DME/DDE in Factory Mode - Microtronik, accessed December 11, 2025, https://www.microtronik.com/technical-info/autohex/Reading-ISN-From-DME-DDE-On-Bench-Factory-Mode
1. Reading BMW ISN From CAS,DME, and DDE - Microtronik, accessed December 11, 2025, https://www.microtronik.com/technical-info/autohex/bmw-isn-reader-and-writer-software
1. How to Repair Bricked BMW CAS3+ istap Module by Autel KM100? | by obdii365 - Medium, accessed December 11, 2025, https://medium.com/@obd365com/how-to-repair-bricked-bmw-cas3-istap-module-by-autel-km100-2a9a94646994
1. Autel IM608 Pro Program 2010 BMW 550GT CAS4 All Keys Lost - AutelShop.de Official Blog, accessed December 11, 2025, http://blog.autelshop.de/autel-im608-pro-program-2010-bmw-550gt-cas4-all-keys-lost/
1. Autel IM608 II/IM508S BMW BDC02 Add Key Failed Precautions - AutelShop.de Official Blog, accessed December 11, 2025, https://blog.autelshop.de/autel-im608-ii-im508s-bmw-bdc02-add-key-failed-precautions/
1. EWS operation? - Bimmerforums - The Ultimate BMW Forum, accessed December 11, 2025, https://www.bimmerforums.com/forum/showthread.php?1422489-EWS-operation
1. BMW Key Programmer Manual for EWS | PDF | Car | Computer Engineering - Scribd, accessed December 11, 2025, https://fr.scribd.com/document/51651816/CARPROG-BMW-Key-programmer-manual
1. BMW Ak90 Key Programmer User Manual PDF - Scribd, accessed December 11, 2025, https://www.scribd.com/document/427784642/bmw-ak90-key-programmer-user-manual-pdf
1. Xhorse EWS4 Adapter For VVDI Prog Programmer For BMW - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/xhorse-ews4-adapter-for-bmw-ews4-range-rover-ews4-adapter-land-rover-4203
1. 3 buttons 315 MHz / 433 MHz / 868 MHz Remote Key with ID46 Chip for BMW CAS2 5 Series E46 E60 E83 E53 E36 E38 HU58 Uncut - DHgate, accessed December 11, 2025, https://www.dhgate.com/goods/996669211.html
1. BMW Immo System | PDF | Car Body Styles - Scribd, accessed December 11, 2025, https://www.scribd.com/document/949376063/BMW-Immo-System
1. How to Program a BMW Key | BMW of Ontario, accessed December 11, 2025, https://www.bmwofontario.com/service/diy-car-care/how-to-program-a-bmw-key/
1. For BMW CAS2 CAS3 CAS4 CAS4+ Test Platform Tool Support Off-Site Key Programming For BMW F20 F30 F35 X5 X6 I3 - AliExpress, accessed December 11, 2025, https://www.aliexpress.com/item/1005005468970407.html
1. CAS 3++ Downgrade - Bimmerforums - The Ultimate BMW Forum, accessed December 11, 2025, https://www.bimmerforums.com/forum/showthread.php?2451645-CAS-3-Downgrade
1. CAS4 and CAS4+ Key Programming - autohex - Microtronik, accessed December 11, 2025, https://www.microtronik.com/technical-info/autohex/cas4-key-programming
1. BMW F10 CAS4/CAS4+ How to Add key with Autel MaxiIM IM608 - obdprice, accessed December 11, 2025, https://www.obdprice.com/blogs/car-repar-maintenance/bmw-f10-cas4-cas4-how-to-add-key-with-autel-maxiim-im608
1. BMW HU92 Ignition Vol.3 Picking and Decoding Guide - TradeLocks Blog, accessed December 11, 2025, https://blog.tradelocks.co.uk/bmw-hu92-ignition-genuine-lishi-vol-3/
1. BMW HU92 Ignition Picking and Decoding Guide - TradeLocks Blog, accessed December 11, 2025, https://blog.tradelocks.co.uk/bmw-hu92-ignition-genuine-lishi-vol-1/
1. How to Program BMW 1-Series FEM All Keys Lost on Bench With the Autel IM608 - ABKEYS, accessed December 11, 2025, https://abkeys.com/blogs/news/how-to-program-bmw-1-series-fem-all-keys-lost-on-bench-with-the-autel-im608
1. How to program BMW FEM/BDC key By Lonsdor K518ISE, accessed December 11, 2025, https://www.lonsdork518.com/service/how-to-program-bmw-fem-bdc-key-by-lonsdor-k518ise-7.html
1. YANHUA Mini ACDP for BMW FEM/BDC: The Real-World Guide to Key Programming on a Budget - AliExpress, accessed December 11, 2025, https://www.aliexpress.com/p/wiki/article.html?keywords=mini-acdp
1. Pick And Decode A GM Lock - HU100 Lishi Pick - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=RcpZa2WUDMc
1. Picking and Decoding the BMW HU100R door lock using Lishi tools - TradeLocks Blog, accessed December 11, 2025, https://blog.tradelocks.co.uk/bmw-hu100r-door-lock-genuine-lishi-vol-2/
1. Autel just enabled add key on G body BMWs but there''s a huge catch. : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1iuzz1g/autel_just_enabled_add_key_on_g_body_bmws_but/
1. Autel MaxiIM BMW G-Chassis Software Card Compatible with IM508 and IM608 Series Tablets - AutelEShop, accessed December 11, 2025, https://www.auteleshop.com/wholesale/autel-add-key-immo-functionality-for-bmw-g-chassis-vehicles.html
1. Mhd software dme unlocked reading. - G20 BMW 3-Series Forum - Bimmerpost, accessed December 11, 2025, https://g20.bimmerpost.com/forums/showthread.php?t=2080531
1. YOUBBA Smart Remote Key Instruction Manual, accessed December 11, 2025, https://manuals.plus/ae/1005005975279089
1. BMW Key Fob Upgrade - Mashimarho, accessed December 11, 2025, https://mashimarho.com/products/bmw-g-series-key-fob-upgrade
1. Ilco PRX-BMW-4B3 BMW 4 Button Prox Key (FCC: NBGIDGNG1) - Keymate Inc., accessed December 11, 2025, https://keymateinc.com/shop-online/key-blanks/automotive-keys/remotes/ilco-prx-bmw-4b3-bmw-4-button-prox-key-fcc-nbgidgng1-detail.html
1. 2015-2021 BMW G-Series / 4-Button Smart Key / 9367401-01 / N5F-ID21A / Silver (OEM REFURB) - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/bmw-g-series-4-button-smart-remote-control-key-bdc2-immo-fcc-id-n5f-id21a-silver-434mhz-remote-only-oem
1. Autel G-BOX3 Key Programming Adapter for Mercedes and BMW Vehicles, accessed December 11, 2025, https://www.garageappeal.com/autel-g-box3-key-programming-adapter-for-mercedes-and-bmw-vehicles/
1. ACDP Remplace BMW FEMBDC Module教程 | PDF | Software | Computing - Scribd, accessed December 11, 2025, https://www.scribd.com/document/754855388/ACDP-Remplace-BMW-FEMBDC-Module%E6%95%99%E7%A8%8B
1. Yanhua Mini ACDP BMW B48/B58 Interface Board for B48/B58 ISN Reading and Clone via Bench Mode - CarDiagTool, accessed December 11, 2025, https://www.cardiagtool.co.uk/yanhua-mini-acdp-bmw-b48b58-interface-board.html
1. How to Use Autel IM508 with XP400 Pro to fix FRM module on BMW? - AutelShop.us, accessed December 11, 2025, https://www.autelshop.us/blogs/autel-tech-solution/how-to-use-autel-im508-with-xp400-pro-to-fix-frm-module-on-bmw
1. MERCEDES BENZ ESL ELV PROGRAMMING & EIS W207 ALL KEYS LOST (AUTEL IM608 PRO GBOX2) - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=uHue5CjEr_c', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Mazda Locksmith Data and Walkthroughs', 'Mazda', 'General', 2010, 2024, '

# Definitive Locksmith Programming Guide: Mazda Automotive (1995–2025)

## Executive Summary and Operational Strategic Overview

The security architecture of Mazda vehicles represents a unique and complex case study in the automotive locksmithing domain, distinct from the linear evolutionary paths observed in manufacturers like Nissan or Mercedes-Benz. While Nissan adhered to a relatively consistent evolution of its NATS architecture 1, and Mercedes-Benz pursued a strictly proprietary trajectory with its Drive Authorization Systems 1, Mazda’s engineering history is defined by its strategic alliances and subsequent independence. The most significant of these, the long-standing partnership with Ford Motor Company, resulted in a bifurcated security landscape where millions of Mazda vehicles on the road today utilize Ford’s Passive Anti-Theft System (PATS), while newer models feature proprietary, high-security architectures developed during the "SkyActiv" era.

For the professional locksmith, this duality necessitates a comprehensive understanding of two divergent technological lineages. On one hand, the technician must master the intricacies of the Ford-derived systems found in the Mazda 3 (BK/BL platforms), Mazda 6 (GG/GH), and the Tribute, which require familiarity with Texas Instruments 4D-63 encryption, Incode/Outcode calculation protocols, and standard Ford diagnostic procedures.1 On the other hand, the post-2013 fleet introduces purely Japanese engineering philosophies, utilizing Mitsubishi Electric and Denso components that demand an entirely different set of diagnostic approaches, including 128-bit AES encryption and Secure Gateway (SGW) access similar to modern Hyundai and BMW architectures.1

This research report serves as an exhaustive technical reference, designed to elevate the locksmith from simple key duplication to advanced diagnostic troubleshooting. It dissects the operational theory across three distinct epochs: the Pre-Ford Legacy era, the Ford Alliance era, and the modern SkyActiv/7th Generation era. By synthesizing data from comparable industry standards—such as the BCM-centric logic of Nissan 1 and the cryptographic imperatives of BMW’s ISN systems 1—this report provides the context necessary to navigate "All Keys Lost" scenarios, resolve module synchronization failures, and adapt to the increasing restrictions of connected car security.

## Section 1: Theoretical Architecture and The Triangle of Security

To effectively diagnose and program Mazda immobilizer systems, one must first understand the fundamental architecture that governs vehicle authorization. Similar to the "Triangle of Security" concept critical in BMW diagnostics 1, Mazda systems rely on a tripartite validation process involving the Transponder (Key), the Immobilizer Control Unit (which varies by generation), and the Powertrain Control Module (PCM).

### 1.1 The Legacy Era: Dedicated Immobilizers and Lucas Logic (1995–2000)

Before the integration of Ford’s global platforms, Mazda utilized discrete immobilizer systems, often sourced from Lucas or Mitsubishi. These systems, found in models like the Miata (NA/NB) and the 626, operated on a static challenge-response basis using Texas Instruments 8C or 4C transponders.

Operational Theory:

In these early architectures, the Immobilizer Unit was a standalone module, physically separate from the ECU and the Instrument Cluster. Upon key insertion, the immobilizer energized the transponder coil. If the fixed code read from the key matched the stored value in the EEPROM, the immobilizer sent a "Go" signal to the Engine Control Unit (ECU). Unlike modern CAN-bus systems where modules exchange encrypted digital handshakes, these early systems often relied on simple voltage signals or low-speed serial data.

Diagnostic Implications:

Locksmithing for this era often requires invasive techniques. Since OBD-II programming protocols were in their infancy, "All Keys Lost" scenarios frequently necessitate the removal of the immobilizer box or the ECU itself to read the EEPROM data directly. This process mirrors the "Bench Work" requirements described for Mercedes-Benz DAS 2 systems, where desoldering Motorola MCUs is required to generate a transponder.1

### 1.2 The Ford Alliance Era: PATS Integration (2000–2013)

The most prevalent architecture in the secondary market is the Ford Passive Anti-Theft System (PATS). During this period, Mazda platforms were shared extensively with Ford (e.g., Mazda 3 shared the C1 platform with the Ford Focus; the Tribute was a rebadged Ford Escape).

The Hybrid Electronic Cluster (HEC):

In a departure from the standalone modules of the past, Mazda adopted Ford’s HEC architecture. Here, the immobilizer logic is embedded directly into the Instrument Cluster. The Cluster stores the key data (Transponder IDs) and the cryptographic keys necessary to authorize the PCM.

The PCM Handshake:

When a valid key is detected, the Cluster communicates with the PCM over the CAN-bus (Controller Area Network). The PCM verifies the encrypted request from the Cluster. If the handshake fails—common after a battery drain or module swap—the vehicle enters a "Theft Detected" state, immobilizing the fuel injectors. This relationship is analogous to the BMW CAS-DME synchronization, where a rolling code mismatch prevents starting.1

Incode/Outcode Protocol:

A defining characteristic of this era is the "Incode/Outcode" security access mechanism. Unlike the static PINs used in early Nissan NATS systems 1 or the VIN-derived PINs of older Hyundais 1, the PATS system generates a random, time-sensitive 6-character "Outcode" whenever the diagnostic tool requests programming access. The locksmith must calculate the corresponding "Incode" using a proprietary algorithm. This dynamic challenge-response system was designed to prevent unauthorized key learning via simple scan tools.

### 1.3 The SkyActiv Era: Centralized Body Control (2013–2018)

With the dissolution of the Ford partnership, Mazda introduced the SkyActiv platform, marking a return to proprietary Japanese electronics. The security architecture shifted away from the Instrument Cluster and consolidated into a dedicated Start Stop Unit (SSU) and the Body Control Module (BCM).

Start Stop Unit (SSU):

The SSU serves as the primary arbiter of access in push-button start vehicles. It manages the Low-Frequency (LF) antennas distributed throughout the cabin (console, door handles, trunk) to triangulate the smart key''s position. This ensures the vehicle cannot be started if the key is outside the cabin, a logic identical to the Nissan Intelligent Key system.1

Fail-Safe Inductive Backup:

A critical feature of the SSU architecture is the inductive backup. In the event of a dead key fob battery, the Ultra-High Frequency (UHF) remote functions fail. However, a passive transponder chip embedded in the fob allows the user to start the vehicle by physically touching the fob to the Start Button. The SSU energizes the chip via a coil behind the button, reading the ID directly. This functionality is standard across modern push-button systems, paralleling the Ford backup slot procedures.1

### 1.4 The 7th Generation: Secure Gateways and 128-Bit Encryption (2019–Present)

The current generation (Mazda 3 BP, CX-30, CX-90) introduces the highest level of security, utilizing 128-bit AES encryption and Secure Gateway (SGW) architecture.

Secure Gateway Implementation:

Similar to the architecture described in the Hyundai Locksmith Guide 1, modern Mazdas route diagnostic communication through a Central Gateway. This gateway filters traffic from the OBD-II port, blocking unauthorized "Write" commands (such as key programming) unless the tool provides a digital certificate or valid security calculation. This move mirrors the industry-wide trend towards server-side authentication, as seen with Ford’s 2021+ RH850 BCMs 1 and Nissan’s 22-digit rolling codes.1

## Section 2: Transponder Chip Evolution and Management

The identification of the correct transponder chip is the foundational skill of the automotive locksmith. In the Mazda ecosystem, visual identification is often impossible; keys that look identical may contain electronically incompatible chips. This section details the evolution from simple fixed-code carbon chips to sophisticated AES-encrypted processors.

### 2.1 The Texas Instruments Family (4D-63)

For over a decade, the Texas Instruments 4D-63 chip was the standard for Mazda. However, a critical nuance exists between the 40-bit and 80-bit versions, a distinction shared with Ford.1

4D-63 (40-Bit):

Used primarily from 2000 to 2010, this chip utilizes a 40-bit encryption key. It is found in the first-generation Mazda 3 (BK), Mazda 6 (GG), and early CX-7/CX-9 models. A 40-bit chip cannot be used in a vehicle requiring an 80-bit chip; the system will simply fail to recognize it.

4D-63 (80-Bit):

Introduced around 2010–2011, the 80-bit version offered enhanced security. It became standard on the Mazda 3 (BL), Mazda 2, and late-model CX-7s. Crucially, the 80-bit chip is backward compatible. An 80-bit chip can be configured to emulate a 40-bit chip, allowing locksmiths to stock a single SKU (the 80-bit version) to cover the entire 2000–2014 era. This inventory strategy aligns with the recommendation for Ford locksmiths to stock ID83 (80-bit) chips for broad compatibility.1

### 2.2 The Mitsubishi/Phillips Family (ID46)

During the transition years, particularly with the "Credit Card" style smart keys used on the MX-5 (NC) and CX-9, Mazda utilized Philips ID46 (PCF7936) technology. These systems function similarly to the Nissan Intelligent Key Twist-Knob system 1, utilizing a "Password Mode" for programming where the BCM writes a secret key to the transponder.

### 2.3 The NXP HITAG Pro Family (ID49)

The SkyActiv generation standardized on the NXP HITAG Pro (ID49) architecture. This chip supports 128-bit encryption and is structurally identical to the chips used in 2015+ Ford F-150s and Fusions.1

One-Time Programmable (OTP) Nature:

Unlike the older 4D-63 chips, which could often be reused, ID49 chips are typically locked to the vehicle class or VIN upon programming. A used Mazda smart key generally cannot be reprogrammed to another vehicle without specialized "unlocking" hardware that resets the firmware. This "Virgin Key Only" requirement is consistent with modern Hyundai smart keys 1 and Mercedes-Benz FBS4 keys.1

### 2.4 Transponder Reference Table

Era

System Type

Transponder Chip

Frequency

Keyway

Typical Models

1998–2000

Legacy Lucas

TI 8C (Mazda 8C)

N/A

MZ27

626, Miata (NB), MPV

2000–2004

Early PATS

TI 4C (Fixed)

N/A

MAZ24

Tribute, B-Series

2004–2010

Ford PATS

TI 4D-63 (40-bit)

315 MHz

MAZ24

Mazda 3, Mazda 6, RX-8

2010–2013

Ford PATS

TI 4D-63 (80-bit)

315 MHz

HU101

Mazda 2, Mazda 3, CX-7

2007–2015

Smart Card

ID46 / 4D-63

315 MHz

MAZ24

MX-5 (NC), CX-9 (Twist)

2013–2019

SkyActiv Prox

ID49 (HITAG Pro)

315 MHz

MAZ24/MZ31

Mazda 3, 6, CX-5, CX-3

2019–2025

Gen 7 Prox

ID49 / HITAG-AES

433 MHz

MZ31

Mazda 3 (BP), CX-30, CX-50

## Section 3: The Ford Alliance Era (2000–2013) – Comprehensive Walkthrough

This era accounts for a significant volume of service calls. The systems are robust but present specific procedural quirks that differ from standard Japanese imports.

### 3.1 The Badge-Engineered Platforms

Certain Mazda vehicles are mechanically and electronically identical to Ford models. Understanding this cross-compatibility is essential for tool selection.

- Mazda Tribute: This vehicle is a rebadged Ford Escape. As such, it uses the Ford PCM and PATS transceiver. If a diagnostic tool fails to communicate under the "Mazda" menu, selecting "Ford Escape" of the corresponding year often resolves the issue.1
- Mazda B-Series: A rebadged Ford Ranger. It utilizes the same HEC-based PATS and 4D-63 chip architecture.
- Mazda 3 (BK/BL) & Mazda 6 (GG/GH): While distinctively Mazda in design, these vehicles utilize the Ford C1 and CD3 platforms respectively, sharing the fundamental CAN-bus architecture and PATS logic with the Ford Focus and Fusion.

### 3.2 The "Two-Key" Programming Logic

A critical operational rule in Ford PATS systems, which carries over to Mazda, is the requirement for two unique keys to close a programming cycle in an "All Keys Lost" scenario.

- The Logic: The system is designed to prevent a valet or mechanic from easily adding a single unauthorized key. In a reset state, the cluster will not exit "Learn Mode" until it sees two different transponder IDs cycled through the ignition.
- Symptoms of Failure: If the locksmith programs only one key and attempts to start the car, the engine will crank but not fire (or start and stall), and the security light will flash code 21 (programming incomplete).
- Bypass: Some modern diagnostic tools (e.g., Lonsdor K518, Autel IM608) have developed "Unlimited Key" or "Add Key" bypasses that simulate the second key or force the system to accept a single key, but the standard OEM procedure strictly demands two.

### 3.3 Detailed Procedure: 2008 Mazda 3 All Keys Lost

System: PATS CAN-BUS / 4D-63 (40-Bit) / MAZ24 Blade.

Prerequisites: Two unprogrammed keys with correct chips. Battery voltage > 12.5V.

1. Mechanical Access: Use a Lishi MAZ24 tool to pick and decode the door lock. Note that Mazda door locks often lack cuts 1 and 2. Use a progression chart or Instacode to deduce the missing cuts for the ignition key.
1. Connection: Connect the programmer (Autel/SmartPro) to the OBD-II port.
1. Selection: Select Mazda > Manual Selection > Mazda 3 > 2004-2009 > Blade Key.
1. Security Access: Select "All Keys Lost." The tool will warn that all existing keys will be erased. Confirm to proceed.
1. Incode Calculation: The tool reads the Outcode from the HEC/PCM. It automatically calculates and enters the Incode. (This usually takes < 10 seconds on modern tools).
1. Erase Phase: The cluster erases stored keys. The security light may glow solid.
1. Cycling Phase:

- Insert Key 1. Turn Ignition ON. Wait 3 seconds (Security light turns off). Turn OFF. Remove Key.
- Within 5 seconds, Insert Key 2. Turn Ignition ON. Wait 3 seconds. Turn OFF. Remove Key.

1. Verification: Wait 30 seconds for the system to close the learn mode. Attempt to start the vehicle with both keys. Check for remote entry function (on these models, the remote is often programmed separately via an onboard procedure involving door opening/closing and ignition cycling, distinct from the transponder).

## Section 4: The SkyActiv Revolution (2013–2019) – System Deep Dive

The SkyActiv era represents a complete overhaul of Mazda’s electronics. The HEC-based PATS system was abandoned in favor of a Start Stop Unit (SSU) architecture, introducing new complexities for the locksmith.

### 4.1 SSU Architecture and Failure Points

The Start Stop Unit is the brain of the keyless entry system. It handles the communication between the key fob and the vehicle.

- Antenna Network: The SSU monitors multiple Low-Frequency (LF) antennas. A failure in the rear trunk antenna or the center console antenna can prevent the vehicle from detecting the key, leading to a "Key Not Detected" message.
- CMU Failure: The Connectivity Master Unit (Infotainment) is linked to the security network. On early CX-5s, a failing CMU can introduce noise onto the CAN-bus that disrupts SSU communication, mimicking a key failure.
- Diagnostic Tip: If a programmed key fails to work wirelessly, hold it to the Start Button (Emergency Start). If the car starts, the transponder and SSU are valid; the issue lies in the UHF receiver or the key''s battery/transmitter.

### 4.2 Programming Nuances: The "Active Alarm" Risk

One of the most significant risks when programming SkyActiv vehicles in an "All Keys Lost" scenario is the Active Alarm state.

- The Scenario: If the vehicle is locked and the alarm is armed, gaining entry via Lishi picking triggers the alarm. In this state, the SSU often rejects diagnostic communication.
- The Workaround: The locksmith must silence the alarm (disconnect horn) and wait for the alarm timer to expire, or use a tool capable of "Forced Ignition ON" to wake the bus.
- Tool Capability: Tools like the Lonsdor K518 and Autel IM608 have specific "All Keys Lost" menus for SkyActiv that attempt to bypass the alarm state by communicating directly with the SSU via the CAN lines, sometimes requiring the hazard lights to be active to keep the Body Control Module (BCM) awake.

### 4.3 Detailed Procedure: 2016 Mazda CX-5 Add Smart Key

System: SSU / ID49 (HITAG Pro) / Push Button Start.

Prerequisites: One working key, one virgin key (must be correct frequency/FCC ID).

1. Key Validation: Ensure the new key is the correct 2, 3, or 4 button configuration. A 3-button key (hatch) may not work on a 2-button vehicle, and vice versa.
1. Connection: Connect diagnostic tool. Select Mazda > CX-5 > 2013-2016 > Smart Key.
1. Read PIN: The tool communicates with the SSU to extract the security PIN. Unlike the Ford Incode/Outcode, this is often a background calculation.
1. Learning Mode:

- Tool prompts: "Turn Ignition ON with working key." (Press Start button twice with key in range).
- Tool confirms key count (e.g., 1).
- Tool prompts: "Hold New Key to Start Button."
- Action: Press the logo end of the new fob against the Start Button. The ring around the button typically flashes green, and a beep is heard.

1. Completion: The SSU registers the new ID. Test proximity lock/unlock and start functions.

## Section 5: The 7th Generation and Secure Gateways (2019–Present)

The latest generation of Mazda vehicles (Mazda 3 BP, CX-30, CX-50, CX-90) aligns with the industry''s most stringent security standards. The integration of Secure Gateways and 128-bit encryption creates a high barrier to entry.

### 5.1 128-Bit AES Encryption and Cloning Limitations

The shift to HITAG-AES (128-bit) encryption renders traditional cloning tools obsolete. The encryption keys are managed dynamically, and the transponder data is tightly coupled with the SSU.

- Implication: Locksmiths cannot simply "copy" a working key to a generic chip. A new, valid OEM-spec key must be programmed into the vehicle''s "Allow List."
- Used Keys: As with BMW G-Series 1 and Hyundai 2020+ models 1, 7th Gen Mazda keys are locked to the VIN once programmed. They cannot be reused on another vehicle unless "unlocked" using sophisticated PCB-level flashing tools, which are currently rare for this specific platform.

### 5.2 Secure Gateway (SGW) Access

While Mazda’s implementation of the Secure Gateway is less physically intrusive than the "16+32" bypass cable required for the Nissan Sentra 1, it imposes strict digital restrictions.

- Server Authentication: Accessing the "Write" functions of the SSU (to add a key) requires the diagnostic tool to authenticate with a central server. The tool sends a request structure to the server, which validates the tool''s license and returns a signed authorization token.
- Internet Requirement: Consequently, programming a 2021+ Mazda requires a stable internet connection. Offline programming is generally impossible.
- NASTF and OEM Tools: For independent shops using the official Mazda Modular Diagnostic System (MDS/MDARS), a NASTF Vehicle Security Professional (VSP) ID is mandatory to download the security algorithms. This mirrors the requirements for modern Ford FDRS access.1

### 5.3 The "Deep Sleep" Phenomenon

Modern Mazda BCMs are aggressive in power preservation. If the vehicle detects low battery voltage or inactivity, it shuts down non-essential CAN traffic.

- Programming Failure: A common failure mode in 7th Gen programming is the tool timing out during the PIN calculation.
- Mitigation:

1. Power Supply: Always connect a stable 13.5V power supply (not just a charger).
1. Wake-Up Signal: Activating the hazard lights forces the BCM to remain awake.
1. Brake Pedal: Occasional pressing of the brake pedal can also reset the CAN-bus sleep timer.

## Section 6: Mechanical Lock Systems and Lishi Decoding

Despite the advanced electronics, the mechanical key remains the primary access point in lockout situations and dead-battery scenarios. Mazda utilizes two primary keyway families.

### 6.1 The MAZ24 (1998–2010)

- Profile: 8-cut, edge-style key.
- Lishi Tool: MAZ24 (Direct Reader or 2-in-1).
- Characteristics: This is a legacy keyway. The locks are prone to seizing due to dirt ingress.
- Decoding Strategy: Door locks on this generation often utilize cuts 3 through 8, omitting positions 1 and 2. When generating a key from the door lock, the locksmith will often end up with a key that opens the door but fails to turn the ignition.

- Solution: Use a progression chart (Instacode) to calculate the potential values for cuts 1 and 2. Since there are usually only 3 or 4 depth possibilities, trial-and-error cutting of a few blanks is a viable strategy if code software is unavailable.

### 6.2 The HU101 (2010–Present)

- Profile: 10-cut, 2-track high security (laser cut).
- Origin: This keyway is shared directly with Ford (Focus, Fusion, Escape), Land Rover, and Volvo.1
- Lishi Tool: HU101 (V3 recommended).
- Wear Issues: The HU101 system is notorious for rapid wear. The "split wafer" design can become jammed, and the key blades round off, losing their ability to align the wafers.
- Decoding Nuance:

- Ignition vs. Door: Unlike the MAZ24, the HU101 door lock often contains wafers 3-9 or 3-10. The ignition contains all 10.
- Variable Wafers: Be aware that the HU101 system uses different wafer heights. Accurate decoding requires a tool that can differentiate between half-cuts.
- Emergency Blades: On Smart Keys (SkyActiv/Gen 7), the emergency blade is an HU101 profile (sometimes referred to as MZ31 in newer, thinner variations). It is critical to clamp these narrow blades correctly in the cutting machine to prevent rotation during milling.

## Section 7: Tool Methodologies and Comparative Analysis

Selecting the right tool for Mazda programming depends heavily on the vehicle''s era. This section evaluates common tools based on their capabilities across the Mazda lineage.

### 7.1 Autel IM508 / IM608

- Ford Era: Excellent. The Autel software handles Incode/Outcode calculation seamlessly for 4D-63 systems. It supports "All Keys Lost" via OBD without requiring EEPROM work for the vast majority of 2004–2013 models.
- SkyActiv: Very Strong. Supports SSU PIN reading and active alarm bypass.
- Gen 7: Supported with current updates. Requires active subscription for online calculation.
- Comparison: Just as Autel is the "daily driver" for Hyundai PIN reading 1, it is the primary tool for Mazda due to its robust Ford/Mazda database.

### 7.2 Lonsdor K518 Pro

- Strengths: Lonsdor is renowned for its specific optimizations for Japanese brands.
- Mazda Specifics: It often calculates PIN codes for newer Mazdas faster than Autel. It features specific menus for "PEPS" (Passive Entry Passive Start) systems that simplify the slot programming sequence.
- Legacy Support: Good support for older key programming, though sometimes less intuitive than Autel for the Ford-based models.

### 7.3 SmartPro (Advanced Diagnostics)

- Reliability: The SmartPro is the gold standard for reliability. Its "Mazda 2020+" software module is highly regarded for its stability in handling 7th Gen secure PIN calculations.
- Cost: Token-based system can be more expensive per vehicle compared to Autel or Lonsdor.
- Usage: Recommended for high-value 2020+ vehicles where minimizing the risk of BCM "bricking" is paramount.

### 7.4 Comparative Tool Matrix

Feature

Autel IM608

Lonsdor K518

SmartPro

Ford Era (PATS) Incode/Outcode

Excellent (Free)

Good (Free)

Excellent (Token)

SkyActiv SSU PIN Read

Excellent

Excellent

Excellent

7th Gen (2019+) Calculation

Yes (Online)

Yes (Online)

Yes (Token)

Legacy 8C/4C Support

Moderate (EEPROM)

Low

Low

Active Alarm Bypass

Yes

Yes

Yes

## Section 8: Diagnostics, Troubleshooting, and "What-If" Scenarios

### 8.1 The "Theft Light" Diagnostic Codes

Mazda’s instrument cluster provides a built-in diagnostic interface via the Theft Security Light (Red Car/Lock icon). This feature, inherited from Ford, allows the locksmith to diagnose failures without a scan tool.

- Rapid Flashing (Ignition ON): The system does not recognize the key.

- Cause: Unprogrammed key, wrong chip type (e.g., 40-bit key in an 80-bit car), or damaged transceiver coil.

- Code 16 (1 flash, pause, 6 flashes): Communication failure.

- Analysis: The Cluster cannot communicate with the PCM. This suggests a CAN-bus wiring fault, a blown fuse powering the PCM, or a mismatch in module IDs (e.g., PCM replaced without Parameter Reset).

- Code 21 (2 flashes, pause, 1 flash): Key count error.

- Analysis: The system has not seen the required minimum number of keys (usually 2) to exit Learn Mode.
- Fix: Cycle a second valid key.

### 8.2 Parameter Reset: The Synchronization Trap

A common pitfall occurs when modules are replaced.

- The Scenario: A mechanic replaces a bad PCM in a Mazda 3. The car starts for 2 seconds and dies.
- The Cause: The PCM and Cluster (Immobilizer) share a cryptographic ID. Replacing the PCM breaks this link.
- The Fix: Perform a "Parameter Reset" (or "PATS Initialization").

- Procedure: Connect tool. Select "PATS Functions" > "Parameter Reset." This erases the shared ID and forces the modules to exchange a new one.
- Crucial Step: After a parameter reset, the key memory is often wiped or invalidated. You must cycle two keys to re-initialize the system. This differs from Ford Type A/D systems where key data is separate 1, but aligns with Ford Type B/C logic used in Mazda C1/CD3 platforms.

### 8.3 "Key Not Detected" in SkyActiv Systems

- Symptom: Customer has a valid key, but the dash displays "Key Not Detected" and the car won''t start.
- Diagnosis:

1. Brake Switch: Check if the brake lights illuminate. If the brake switch fails, the SSU never receives the "Start Request" signal.
1. Radio Interference: Unplug any USB chargers, dash cams, or LED lights. Cheap electronics can broadcast noise on the 315 MHz band, blinding the SSU antennas.
1. Key Battery: Even if the LED on the fob lights up, the battery might be too weak for RF transmission. Try the inductive backup start (holding fob to button).

## Section 9: Conclusion and Future Outlook

The field of Mazda locksmithing is a discipline of duality. The technician must be equally adept at navigating the legacy Ford architectures—mastering the rhythms of Incode/Outcode exchanges and 4D-63 chip management—and the modern Japanese architectures of the SkyActiv and 7th Generation platforms.

As Mazda moves forward with the CX-90 and beyond, the trajectory is clear: tighter integration of connectivity, increased reliance on server-side validation, and the adoption of Ultra-Wideband (UWB) technology for "Phone as a Key" applications. This mirrors the evolution seen in BMW''s Digital Key Plus 1 and the industry-wide shift away from the physical key as the primary token of authorization.

For the professional locksmith, success lies in preparation: maintaining a diverse inventory of 80-bit 4D-63 chips and ID49 smart keys, investing in tools capable of 128-bit online calculation, and understanding the theoretical underpinnings of the systems to diagnose failures that transcend simple key programming.

Works Cited

1 Nissan Locksmith Programming Guide

1 Mercedes Locksmith Comprehensive Guide

1 BMW Locksmith Guide Development

1 Hyundai_Locksmith_Programming_Guide.docx

1 Ford_Locksmith_Programming_Guide.docx

#### Works cited

1. Nissan Locksmith Programming Guide.rtf', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Mercedes Locksmith Comprehensive Guide', 'Mercedes', 'General', 2010, 2024, '

# MERCEDES-BENZ DRIVE AUTHORIZATION SYSTEMS: THE DEFINITIVE TECHNICAL REFERENCE FOR PROFESSIONAL LOCKSMITHS (2000–2025)

## 1. Executive Summary and Strategic Overview

### 1.1 The Distinct Architecture of Mercedes-Benz Security

In the hierarchy of automotive locksmithing, Mercedes-Benz occupies a tier distinct from the centralized security architectures of Hyundai, Ford, or Toyota. As referenced in the Hyundai Professional Locksmith Programming Guide 1, modern Asian market vehicles often utilize a centralized Body Control Module (BCM) or Integrated Body Unit (IBU) that acts as the primary gatekeeper for key programming, typically accessible via standard PIN codes or challenge-response protocols over the OBDII port. Similarly, Ford’s Passive Anti-Theft System (PATS), while evolving through various encryption types (Texas 4D, 4D63, ID49), remains a largely additive system where new keys are introduced to a welcoming module via an Incode/Outcode exchange or timed access.1

Mercedes-Benz, however, employs the Drive Authorization System (DAS), a distributed, multi-module consensus network that prioritizes theft impossibility over serviceability. Unlike Ford or Hyundai, where a key is simply "added" to the car''s memory, a Mercedes key must be mathematically derived from the vehicle''s unique cryptographic DNA. The vehicle does not "learn" the key; the key is pre-programmed to mathematically satisfy the vehicle.

For the professional locksmith, this requires a paradigm shift:

- From "Programming" to "Calculation": You do not program the car to accept the key. You extract the car''s identity (SSID and Hash), calculate the secret formula (Password), and synthesize a key file (Key Rail) that matches the car''s pre-existing expectations.
- From OBDII to Bench Work: While Hyundai and Ford procedures are largely OBD-centric 1, Mercedes procedures frequently require the physical removal of the Electronic Ignition Switch (EIS/EZS) for direct connection, especially in "All Keys Lost" scenarios.
- From Inductive to Infrared: The primary communication vector is not the Low Frequency (LF) 125kHz coil used by Ford/Hyundai transponders, but a bidirectional Infrared (IR) optical data stream, necessitating specialized optics in programming tools.

This document serves as the exhaustive operational manual for navigating DAS 2, DAS 3 (FBS3), and the limitations of DAS 4 (FBS4), encompassing theory, hardware anatomy, calculation protocols, and component-level repair.

### 1.2 Evolution of the Drive Authorization System (DAS)

The strategy for any Mercedes intervention relies entirely on correctly identifying the generation of the DAS. A misidentification here can lead to hours of wasted time or, in worst-case scenarios, the "bricking" of the EIS.

#### Generation 1: DAS 2a/2b (1995–1999)

- Architecture: The nascent stage of electronic immobilization. It utilizes a dedicated immobilizer module (IFZ) often located behind the instrument cluster or integrated into the DAS control unit.
- Key Interface: Mechanical "Flip Keys" (switchblade style) with a separate carbon transponder chip (Philips PCF7930 or PCF7935).
- Locksmith Procedure: These systems predate OBD key learning. The standard procedure involves removing the immobilizer box, desoldering the Motorola HC05 or HC908 microcontroller, reading the EEPROM data using a programmer (e.g., Orange5, XProg), and manually generating a transponder chip.
- Relevant Chassis: W202 (C-Class), W210 (E-Class early), R170 (SLK).

#### Generation 2: DAS 3 / FBS3 (2000–2014) — The "Golden Era"

This is the volume zone for independent locksmiths. Mercedes introduced the Smart Key (fob) that inserts into the dashboard slot, eliminating the mechanical key blade for ignition functionality.

- Central Node: The Electronic Ignition Switch (EIS)—known in German as Elektronisches Zündschloss (EZS)—is the master gateway. It powers the key via induction and communicates via IR.
- Distributed Security: The EIS must agree with the Electronic Steering Lock (ESL/ELV), the Engine Control Unit (ECU/DME), and the Transmission Control Unit (TCU/VGS) before authorization is granted.
- Encryption: Uses the SHA-1 hash algorithm. Keys contain NEC microcontrollers.
- Locksmith Procedure: Requires reading the EIS (via OBD or IR), calculating the "Key Password" via server-side computing, and writing a key file to a blank "BE" (Aftermarket) or "BGA" (OEM-style) key.

#### Generation 3: DAS 4 / FBS4 (2014–Present) — The "Wall"

Around 2014, Mercedes introduced FBS4 (Fahrberechtigungssystem 4).

- Architecture: Cryptographically hardened. The keys use 128-bit encryption, and the password calculation exploit used for FBS3 was patched.
- Current Status (2025): There is no public solution for calculating FBS4 passwords or generating keys from scratch for these vehicles.
- Service Path: Locksmiths are currently restricted to "dealer keys" ordered via the Mercedes-Benz TRP (Theft Relevant Parts) program, requiring NASTF VSP credentials in the US.
- Identification: If the vehicle is model year 2015+, assume FBS4. Late 2013/2014 models are transitional.

- Test: Insert a tool (like VVDI MB). If it reads the EIS but fails to display the "Hash List" or labels the system "FBS4," stop. You cannot program this key.

## 2. Technical Anatomy of the Security Network

Unlike the centralized BCM described in the Ford documentation 1, the Mercedes security network requires a consensus between multiple independent modules. Failure in any single node results in a "Start Error" or a "No Crank" condition.

### 2.1 The Electronic Ignition Switch (EIS/EZS)

The EIS is the heart of the system. It is not merely a switch; it is a complex computer acting as the central gateway for the vehicle''s CAN bus (Controller Area Network).

#### The Inductive Power & IR Data Interface

In a Ford or Hyundai, the transponder is passive and powered by an antenna ring around the ignition.1 In Mercedes DAS 3:

1. Inductive Energization: The EIS contains a primary winding. The key contains a secondary winding. When the key is inserted, the EIS energizes the coil, inducing 5V–12V into the key.
1. Processor Wake-up: This induced voltage powers the NEC microcontroller inside the key.
1. IR Handshake: The key wakes up and blasts its ID via an Infrared LED located in the tip of the fob key.
1. Authorization: The EIS receives the IR signal. If the ID is in the "Used" list, it sends a random challenge back to the key via IR. The key computes a response using its internal secret key and transmits it back.
1. Failure Analysis: This mechanism is why a key with a broken coil will not work, even if the battery is new. The battery in a Mercedes key is strictly for the remote lock/unlock buttons. The ignition function is entirely induction-powered.

#### Processor Families and Mask Sets

To extract data from an EIS, the locksmith must identify the internal processor.

- Motorola HC908 / HC912: Found in older W203/W209/W211/W220. These are secure MCUs. Reading them often requires "Rosfar" style clips or soldering wires to BDM (Background Debug Mode) points.
- NEC: Found in W204/W212/W207. These are highly secure. The password cannot be read directly from the memory dump. It must be "calculated" by collecting query data and brute-forcing the hash.
- FSB4 (BGA): The newest standard. Currently impenetrable for key generation.

### 2.2 The Electronic Steering Lock (ESL/ELV)

The ESL is the most common failure point in the W204 C-Class, W207 E-Coupe, and W212 E-Class architectures.

- Function: It is a mechanical bolt driven by a DC motor, secured to the steering column.
- Sequence:

1. Key Inserted.
1. EIS authenticates Key.
1. EIS sends power and "Unlock" command to ESL.
1. ESL motor spins, retracts bolt.
1. ESL sensors verify "Unlocked" position.
1. ESL sends "Authorization" signal back to EIS.
1. EIS switches on Terminal 15 (Ignition) and sends start code to ECU.

- The "Fatal Error": When the cheap internal brushes of the Johnson electric motor wear out, the lock jams. The NEC processor inside the ESL detects the mechanical fault and writes a "Fatal Error" flag to its EEPROM. This permanently disables the electronic board, even if the motor is replaced.
- Implication: You cannot simply replace the motor on a "Fatal Error" unit. You must replace the entire unit or install an emulator (discussed in Section 6).

### 2.3 The "Key Rail" Architecture

A Mercedes EIS is pre-programmed with 8 distinct "Key Rails" (Tracks), numbered 1 through 8.

- Segments: Each Rail has 3 "Segments" (versions). This theoretically allows for 24 keys (8 rails × 3 lives) over the car''s life.
- Rail Management:

- Rail 1 & 2: Typically the two keys supplied with the new car.
- Rail 3–8: Spare slots available for locksmiths.

- Conflict: You cannot have two keys operating on Rail 1 simultaneously. If you program a new key to Rail 1, the old Key 1 stops working immediately.
- Strategic Programming: Always read the EIS first to identify which rails are USED and which are FREE. Always write new keys to a FREE rail (e.g., Rail 3) to avoid deactivating the customer''s existing spare key.

## 3. The Locksmith Tooling Ecosystem

Unlike the straightforward tool requirements for Hyundai (Autel/Lonsdor) 1, the Mercedes ecosystem requires a modular approach. Relying on a single tool is risky due to the variability in EIS processor types.

### 3.1 Tier 1: The Essential "Daily Drivers"

#### Xhorse VVDI MB BGA Tool

- Status: The industry standard for speed and stability.
- Core Strength: Fastest password calculation times (averaging 10–18 minutes for W204).
- Ecosystem: Integrates with the "Dolphin" or "Condor" key cutting machines.
- Token System: Uses 1 Token per password calculation. Tokens are roughly $15–20 USD, or free if you generate Xhorse remotes.
- Recommendation: The primary tool for any serious Mercedes locksmith.

#### Autel IM608 Pro II / IM508S + XP400 Pro

- Status: The best "All-in-One" solution.
- Core Strength: Excellent guided walkthroughs and diagrams. The "G-Box 3" adapter is mandatory for fast calculation.
- Economics: No per-use tokens for most vehicles (uses a daily limit/server queue).
- Weakness: Server queues can be long (30 minutes to 2 hours) during peak times.
- Requirement: You MUST have the XP400 Pro programmer. The standard XP200 cannot handle Mercedes IR keys.

#### CGDI MB

- Status: The budget performance king.
- Core Strength: Fastest server response time (often <10 minutes).
- Economics: Offers subscription models (e.g., $10/month for unlimited tokens), making it the cheapest operating cost for high-volume shops.
- Weakness: Software interface is less polished ("Chinglish"), and hardware is less robust than Autel.

### 3.2 Tier 2: The "Specialist" Tools

#### Diagspeed

- Status: The "Virginizing" specialist.
- Use Case: Unmatched capability for resetting used ECUs, TCUs (7G-Tronic), and ISMs to factory "Virgin" state so they can be reused.
- Cost: High initial investment ($3,000+), but essential for module replacement work.

#### AK500 / R270 / Orange5

- Status: Legacy EEPROM programmers.
- Use Case: Required for DAS 2 (1997–2000) vehicles where you must desolder the Motorola MCU to read the data. Modern OBD tools cannot touch these older systems.

### 3.3 Hardware Adapters (Mandatory)

You cannot perform Mercedes work with just an OBD cable. You need:

1. IR Key Reader: (Built into XP400/VVDI).
1. Power Adapter / Gateway Adapter: Used to power the EIS on the bench.
1. Fast Calculation Adapter:

- Autel: G-Box 2 or G-Box 3.
- Xhorse: Power Adapter for Fast Calc.
- Function: These adapters bypass the OBD gateway and directly manipulate the voltage to the EIS to force it into "Factory Mode" for password extraction.

## 4. Comprehensive Walkthroughs by Chassis

This section details the specific procedures for the most common chassis encounters. Note that unlike the generic "Add Key" steps for Ford 1, the Mercedes procedure varies wildly by model.

### 4.1 The "Big Three" (W204 C-Class, W212 E-Class, W207 E-Coupe)

Years: 2008–2014

System: DAS 3 / FBS3 (NEC EIS)

These are the most common vehicles requiring locksmith services today. They utilize the NEC-based EIS which resists simple reading.

#### Scenario A: Add a Key (One Working Key Exists)

Difficulty: Moderate

Time: 20–30 Minutes

Tool: Autel IM608 + G-Box 3 + XP400 Pro

1. Connection: Connect IM608 to the vehicle OBDII.
1. Identification: Select IMMO > Mercedes-Benz > Smart Selection > W204. Verify System is DAS 3.
1. Read EIS: Select Read EIS Data. Note the SSID and which Key Rails are used.
1. Password Calculation (On-Car):

- Select Password Calculation > Add Key (OBD).
- Step 1: Insert the working key into the EIS. The tool reads the hash.
- Step 2: Insert the working key into the XP400 Programmer. The tool reads the key''s proprietary IR data.
- Step 3: Insert the working key back into the EIS.
- Step 4: The tool begins "Data Acquisition." Because you have a valid key, the tool can authorize the EIS to communicate. This takes 2–5 minutes.
- Result: The tool displays the 16-digit hexadecimal Key Password. Photograph and save this immediately.

1. Key File Generation:

- Select Generate Key File.
- The tool auto-fills the EIS data and the Password.
- Select an empty rail (e.g., Rail 3).
- Select Format V51 (Half Key) for standard BE keys.
- Click Generate. The tool creates a .bin file (e.g., Key3_51.bin).

1. Write Key:

- Insert a blank BE Key into the XP400 slot.
- Select Read & Write Key > IR > Write Key File.
- Load the Key3_51.bin file and write.

1. Testing: Insert the new key. Listen for the ESL "Zip-Click." Turn to On. Verify engine start and remote functions.

#### Scenario B: All Keys Lost (AKL)

Difficulty: High

Time: 45 Minutes – 2 Hours

Critical Requirement: Battery Maintainer (13.5V). The G-Box power-cycles the EIS thousands of times; low voltage will corrupt the EIS flash memory.

1. Entry: Pick the driver door lock using a Lishi HU64 tool. (Note: HU64 is a 2-track high security lock. Pick direction is crucial. Once open, the alarm will sound.)
1. Silence Alarm: Pop the hood and disconnect the horn or battery negative (wait 1 minute), then connect your 13.5V maintainer.
1. EIS Access (Bench vs. OBD):

- OBD Method: Risky and slow for W204. The Gateway blocks the fast data attack.
- Bench Method (Preferred): Remove the EIS.

- Use the W204 Bezel Tool to unscrew the plastic ring around the ignition.
- Push the EIS into the dash, reach up from the driver footwell, and unplug the connectors.

1. Bench Connection:

- Connect the EIS to the G-Box 3 using the "W204 Harness" (DB15 connector).
- Connect G-Box to IM608. Supply 12V DC to G-Box.

1. Password Calculation (Bench):

- Select Password Calculation > All Keys Lost > On Bench (G-Box).
- The Process: The tool will ask "Connect G-Box?" Yes.
- Brute Force: The G-Box will rapidly click (relays switching power). It is attempting to glitch the processor into revealing the hash.
- Duration: 15–60 minutes.
- Success: Password displayed.

1. Completion: Generate key file and write to blank key (same as Add Key). Reinstall EIS.

- Synchronization: Insert the new key. Wait 5 seconds. Remove. Insert. The key needs to "Hash" with the car. The ESL should unlock.

### 4.2 The Gateway Cars (W164 ML/GL, W221 S-Class, W251 R-Class)

Years: 2006–2013

System: DAS 3

The Challenge: The Central Gateway (ZGW/CGW) on these models is a physical firewall. It filters the OBD diagnostic traffic. You cannot perform "All Keys Lost" calculation via the OBD port because the Gateway will drop the specialized packets needed for the attack.

The Solution: Gateway Bypass Adapter

1. Locate CAN Block:

- W164 (ML/GL): Under the front passenger seat carpet or driver kick panel.
- W221 (S-Class): Driver side dash fuse panel or floor.

1. Connection:

- Unplug the CAN connector leading to the EIS.
- Plug in the W164 Gateway Adapter (a male/female jumper cable that taps into the tool).
- This connects your programmer directly to the internal CAN-B or CAN-C bus of the EIS, bypassing the Gateway.

1. Calculation: Perform standard "All Keys Lost" calculation. It will be fast (10–20 minutes) because you have a direct line to the processor.

### 4.3 The Legacy Systems (W202, W203 Early, W210)

Years: 1997–2003

System: DAS 2a / DAS 2b / Early DAS 3

The Challenge: These EIS units utilize Motorola HC05/HC08/HC908/HC912 processors. They do not support the "Fast Password Calculation" used by modern NEC tools.

Procedure:

1. Removal: Remove EIS from vehicle.
1. Surgery: Open the EIS case. Identify the Motorola chip (look for masks like 1L59W, 0G47V).
1. Reading:

- Method A (Soldering): Solder 4 wires (VCC, GND, RESET, BKGD) to the BDM points on the PCB.
- Method B (Clip): Use a Rosfar/R270 clip that clamps over the chip legs. (High risk of poor contact).

1. Programmer: Use VVDI Prog, R270, or Orange5 to read the EEPROM (.bin file).
1. Generation: Load the .bin file into your key tool (VVDI MB). It will show the password directly (these older chips are not hashed as securely).
1. Writing: Generate a key file and write to a new key.

## 5. Component Repair: The ESL "Fatal Error" Fix

The W204/W212/W207 Electronic Steering Lock failure is the most common mechanical breakdown in the security system.

- Symptoms: Key turns, but no dash lights, no crank, no steering unlock. Radio works.
- Diagnosis: Scan EIS. If EIS status is "Normal" but ESL reports code A25464 or "Component Fault," the ESL is dead.

### The Repair Protocol: Emulation

Replacing with a factory lock is expensive ($800+) and prone to repeat failure. The professional standard is to install an ELV Emulator ($20–$40 part).

Step-by-Step Emulator Installation:

1. Extract Password: Perform an EIS Password Calculation (as described in 4.1). You must have the password to program the emulator.
1. Remove Faulty ESL:

- If Locked: This is difficult. You must remove the steering column. Drill a 10mm hole through the ESL casing (use a template) to manually spin the internal gear and retract the bolt. Remove the single mounting bolt.
- If Unlocked: Simply unbolt and unplug.

1. Program Emulator:

- Connect the Emulator to your tool (Autel/VVDI) via the "ESL" menu.
- Load the EIS Data and Password.
- Click Calculate Erase Password (required to reset the emulator).
- Click Personalize. The tool writes the car''s specific SSID and Hash List into the emulator.
- Click Activate. The emulator is now married to the EIS.

1. Install: Plug the vehicle''s 3-pin ESL connector into the emulator. Zip-tie the emulator securely under the dash.
1. Result: The car believes the steering is locked/unlocked instantly. The car starts. The steering wheel will arguably never lock again (inform the customer—this is usually preferred).

## 6. Curated Sources for Hardware and Data

The original request asks for paid vs. free sources. In the Mercedes world, "Free" is rare due to the proprietary nature, but cost-effective solutions exist.

### 6.1 Key Shells and PCBs

- BE Keys (Benz Expansion): These are aftermarket keys featuring a programmable NEC-clone chip.

- Source: Xhorse, Keydiy, or reputable Chinese vendors (AliExpress/Alibaba - search "CG BE Key").
- Cost: ~$12–$20 per key.
- Note: Standard BE keys usually do not support Keyless Go (Proximity). They are "Insert to Start" only.

- Keyless Go Keys:

- Source: Specialized vendors (e.g., Uhs-hardware, American Key Supply).
- Cost: ~$60–$90 per key.
- Compatibility: Hit-or-miss on W212/W221. Difficult to stabilize.

### 6.2 Paid Services

- NASTF VSP (Vehicle Security Professional):

- Cost: ~$300/year + background check.
- Mercedes TRP: Allows you to order "Dealer Keys" (pre-programmed) from the dealer. Mandatory for FBS4 vehicles where you cannot make a key yourself.

- Weistec / ECU Tuning Shops:

- For FBS4 ECU cloning or repair, you often must send the module to specialized tuning shops that have private (non-public) exploits. Cost: $500+.

### 6.3 "Free" Resources

- MHH Auto (Forum): The bible of automotive software. While there is a small entry fee ($25 one-time), the knowledge base, wiring diagrams, and software shares (Vediamo, Monaco) are effectively free compared to dealer costs.
- Digital Kaos: Another technical forum for EEPROM dumps and virgin files.

## 7. Advanced Technical Nuances & Troubleshooting

### 7.1 Virginizing (Renewing) Used Modules

Unlike Ford where a used PCM can sometimes be overwritten 1, Mercedes modules (ECU, TCU, ISM, EIS) are "Personalized" (locked) to the specific vehicle''s hash.

- The Process: To reuse a junkyard 7G-Tronic Transmission Computer (VGS):

1. Read the module on bench (using Diagspeed or VVDI MB).
1. Calculate the "Erase Password" (the tool brute forces this).
1. Execute Renew command. Status changes from Personalized: YES to Personalized: NO.
1. Install in new car.
1. Use a diagnostic scanner (Autel/Xentry) to Teach-in Drive Authorization. The module pairs with the new EIS.

### 7.2 Frequency Management

- 315 MHz: Used primarily in North America and Japan.
- 433 MHz (434): Used in Europe and Rest of World.
- The Trap: Imported vehicles (grey market) often have mismatched frequencies. A US-spec W211 wagon might have a broken antenna amp, leading a locksmith to think they programmed the wrong frequency.
- Check: Always read the original key (if available) to verify frequency.

### 7.3 Troubleshooting Matrix

Symptom

Probable Cause

Diagnostic/Fix

Key inserts, NO turn, NO dash lights.

1. Dead Key Coil.

2. ESL Failure (W204).

3. Dead Battery.

Use coil detector on key. If coil lights up but no turn, suspect ESL. Check ESL for "Fatal Error".

Key turns, NO crank.

1. Gearshift not in P/N (ISM fault).

2. Starter Fuse/Relay.

3. ECU Authorization missing.

Check "Actual Values" in EIS. Look for "Start Enable: YES". If EIS says YES but ECU says NO, the variable code is out of sync.

Key works, Remote does not.

1. Wrong Frequency.

2. Antenna Amp Fuse.

3. Key battery (remotes are battery powered, ignition is induction).

Check Fuse 8 in Rear SAM (W203/W211). Verify Key Frequency.

Password Calculation fails instantly.

1. Wrong EIS Type selected.

2. G-Box power connection loose.

Double check connections. Ensure you selected correct chassis/processor type.

Fan runs 100% (Jet engine mode).

1. ECU not authorized/communicating.

Common sign of a bad ECU or lost synchronization.

## 8. Conclusion and Future Outlook

The landscape of Mercedes-Benz locksmithing is a dichotomy. For vehicles produced between 2000 and 2014 (DAS 3), the independent locksmith has near-total control, with powerful tools allowing for key generation, module renewal, and system emulation. The procedures, while complex, are logical and repeatable once the underlying architecture of the EIS and ESL is understood.

However, the FBS4 (2015+) architecture remains a significant barrier. As of this report''s publication in late 2025, no public "All Keys Lost" solution exists for FBS4 without dealer intervention. The professional locksmith must therefore maintain a dual strategy: mastery of the technical "bench work" required for the lucrative DAS 3 market, and adherence to the administrative (NASTF/Dealer) protocols required to service the modern FBS4 fleet.

Confidential: Professional Use Only

Document Version 2.0 - December 2025

#### Works cited

1. Hyundai_Locksmith_Programming_Guide.docx', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Chrysler Locksmith Guide Creation (1)', 'Chrysler', 'General', 2010, 2024, '

# The Definitive Locksmith Guide to Chrysler, Dodge, Jeep, and RAM Security Architectures (1998–2025)

## 1. Executive Summary and Strategic Overview

The automotive security landscape of the Fiat Chrysler Automobiles (FCA), now Stellantis, ecosystem represents one of the most dynamic and complex evolutions in the locksmithing domain. Unlike the consistent, linear progression seen in Ford’s Passive Anti-Theft System (PATS) or the deeply entrenched cryptographic consensus of Mercedes-Benz’s Drive Authorization System (DAS), the security architecture of Chrysler, Dodge, Jeep, and RAM (CDJR) vehicles is defined by distinct eras of technological adoption, often influenced by the corporate ownership of the time.

From the early implementations of the Sentry Key Immobilizer Module (SKIM) under the Daimler-Chrysler partnership—which borrowed heavily from European transponder logic—to the modern, high-security implementations of the Radio Frequency Hub (RFH) and Security Gateway (SGW) modules under the Stellantis umbrella, the CDJR fleet demands a multifaceted diagnostic approach. For the professional locksmith, mastering this ecosystem requires not only an understanding of basic transponder programming but also a proficiency in handling the notorious "Rolling Code" PIN algorithms, navigating physical firewalls, and managing the delicate interplay between the Body Control Module (BCM) and the RF Hub.

This comprehensive research report serves as the definitive technical reference for the CDJR market. It dissects the operational theory of the four major immobilizer generations (SKIM, SKREEM, WIN, and RFH), details the cryptographic imperatives of PIN code extraction in the "Rolling Code" era, and provides granular programming procedures for dealing with the modern Security Gateway. Furthermore, this analysis integrates a comparative study of industry standards, contrasting CDJR’s protocols with the specific architectures of Nissan, Ford, BMW, Mercedes-Benz, and Hyundai to highlight the unique operational requirements of the Stellantis fleet. By understanding these divergent engineering philosophies—such as CDJR’s reliance on physical bypass cables for SGW access versus Hyundai’s digital certificate model—the locksmith gains the diagnostic intuition necessary to resolve complex "All Keys Lost" (AKL) scenarios and module failures.

## 2. Immobilizer System Architecture and Theoretical Evolution

To master CDJR key programming, one must first map the vehicle’s production year to its specific immobilizer architecture. The evolution of these systems is not merely a change in part numbers but a fundamental shift in how the vehicle authorizes a start request.

### 2.1 The Era of Static Codes: SKIM and SKREEM (1998–2010)

The genesis of modern CDJR security began with the Sentry Key Immobilizer Module (SKIM). This system introduced the concept of the "Sentry Key," a transponder-equipped key that communicated with a dedicated immobilizer ring located around the ignition cylinder.

#### The Sentry Key Immobilizer Module (SKIM)

The SKIM architecture, prevalent in vehicles like the early Jeep Grand Cherokee (WJ), Dodge Ram (BE/BR), and Chrysler Sebring, established the foundational "Challenge-Response" logic used by the manufacturer.

- Operational Theory: When the ignition is turned, the SKIM energizes the transponder coil. The chip (typically an ID64 or early ID46) transmits a fixed alphanumeric ID. The SKIM verifies this ID against its internal EEPROM. If valid, the SKIM sends a "Fuel Enable" message to the Powertrain Control Module (PCM) via the PCI (Programmable Communications Interface) bus.
- PIN Code Logic: Unlike the Ford PATS system of the same era, which often utilized a timed access (10-minute delay) for key programming 1, the SKIM system relied on a static 4-digit PIN code. This PIN was assigned to the vehicle at the factory and stored in the SKIM.
- Industry Comparison: This approach contrasts with the early Nissan NATS 5 systems, which also used a static PIN but allowed for calculation via the BCM label.1 In the CDJR ecosystem, the PIN was rarely calculable from external labels and typically required extraction from the dealer database or direct EEPROM reading of the Motorola MC68HC microcontroller within the SKIM unit.

#### The Sentry Key Remote Entry Module (SKREEM)

As remote keyless entry (RKE) became standard, engineers integrated the immobilizer and RKE receiver into a single unit: the SKREEM.

- Architecture: The SKREEM (Sentry Key Remote Entry Module) captures both the low-frequency (125 kHz) transponder signal and the high-frequency (315/433 MHz) remote signal. This integration reduced component count but introduced a single point of failure. If the SKREEM module fails—a common occurrence on the Crossfire and Sprinter platforms (which share DNA with the Mercedes SLK R170)—the vehicle is rendered immobile.
- Transponder Evolution: This era solidified the use of the Philips PCF7936 (ID46) chip. Much like the Nissan NATS 6 and Hyundai SMARTRA-3 systems 1, the CDJR implementation of ID46 locks the chip to the specific vehicle family (Crypto Mode) once programmed. A standard "virgin" PCF7936 can often be used for Chrysler, Dodge, Jeep, Hyundai, or Nissan applications, provided it is configured correctly by the programming tool prior to the "Learn" command.

### 2.2 The Daimler Legacy: Wireless Ignition Node (WIN) and Fobik (2008–2014)

The "Fobik" era represents the most visible influence of the Daimler-Chrysler partnership. The Wireless Ignition Node (WIN) is functionally and mechanically similar to the Mercedes-Benz Electronic Ignition Switch (EIS).1

- Hardware Design: The WIN eliminates the mechanical key blade for ignition turning. Instead, the user inserts a "Fobik" (Finger Operated Button Integrated Key)—a plastic rectangular fob—into the dash slot. The fob acts as the key, turning the rotary switch inside the WIN.
- Security Architecture: The WIN reads the transponder data (now integrated into the circuit board of the Fobik) and communicates with the PCM. However, unlike the sophisticated Hash-based consensus of the Mercedes DAS 3 system which requires all modules to agree 1, the WIN system remained PIN-based. Accessing the programming function still required the 4-digit PIN code.
- Critical Failure Points: The WIN modules on the Dodge Grand Caravan and Chrysler Town & Country (2008–2010) are notorious for mechanical detent failure. The module may fail to detect the Fobik insertion or may allow the Fobik to fall out of the "Run" position while driving (leading to the massive P57 safety recall).
- Diagnostic Nuance: In a failure scenario, the symptoms often mimic a dead battery or starter failure. The locksmith must differentiate between a WIN that has lost communication (No Bus) and a WIN that simply cannot mechanically engage the ignition switch.

### 2.3 The Modern Era: Radio Frequency Hub (RFH) and Keyless Go (2011–Present)

With the introduction of the "Keyless Go" (Push-To-Start) systems, the immobilizer function migrated to the Radio Frequency Hub (RF Hub or RFH). This is the current standard for the majority of the fleet, including the RAM 1500, Jeep Grand Cherokee, and Dodge Charger.

- The RF Hub Function: The RFH is a sophisticated receiver located (typically) on the rear cab wall of trucks or under the rear shelf of sedans. It manages the passive entry antennas, the Tire Pressure Monitoring System (TPMS), and the remote start authorization.
- The "Keyless" Handshake: When the user presses the Start Button, the RFH polls the cabin antennas to triangulate the key''s location. If the key is detected inside the vehicle, the RFH authorizes the Body Control Module (BCM) to energize the Ignition Node (KIN/IGN) and tells the PCM to fuel the engine.
- Rolling Code PINs: Starting around 2013, and becoming universal by 2018, CDJR shifted from static 4-digit PINs to 5-digit rolling codes on select platforms, and eventually to a system where the PIN is encrypted and rolling based on time and VIN. This evolution necessitated a constant internet connection for aftermarket tools to pull PIN codes from "cloud" servers, similar to the Nissan 20-digit rolling code evolution.1

## 3. Cryptography and PIN Code Management: The Rolling Code Era

The defining characteristic of modern CDJR locksmithing is the management of PIN codes. Unlike Ford, where access is often time-based (10-minute wait) 1, or Hyundai, where PINs can often be read directly via OBD 1, CDJR has implemented a strict "Read PIN" protocol that has become increasingly fortified.

### 3.1 Static vs. Rolling Codes

- Static Codes (Type 1/2): On vehicles prior to ~2013, the 4-digit PIN was fixed for the life of the car. It could be read from the WIN or SKREEM EEPROM or pulled via the dealer database (DealerConnect).
- Rolling Codes (Type 3/4/5): Modern RFH systems utilize a rolling code logic. The PIN required to enter programming mode changes.

- The "Pull PIN" Requirement: Unlike Nissan’s BCM calculator where the tool calculates the PIN from a label 1, CDJR rolling codes are derived from a proprietary algorithm linked to the VIN. Aftermarket tools (AutoProPad, IM608, SmartPro) utilize "credits" or background server calculations to pull this PIN.
- System Lockout: Entering an incorrect PIN 3 times will lock the RF Hub for 1 hour. This is a critical risk during "Brute Force" attempts. This lockout behavior is identical to the Hyundai system''s 1-hour penalty 1 and the Ford PATS 10-minute lockout.1

### 3.2 The RF Hub "Lock" Strategy (2020+)

On the newest platforms (e.g., Jeep Grand Cherokee L, Wagoneer), Stellantis has implemented a "Hub Lock." Once a key is programmed to the RF Hub, the Hub locks itself to the VIN and potentially blocks further PIN reading via OBD.

- The "All Keys Lost" Conundrum: In some 2021+ scenarios, if all keys are lost, the RF Hub cannot be unlocked to accept new keys via standard PIN methods. The "official" repair often involves replacing the RF Hub with a virgin unit.
- Comparison: This is effectively similar to the Mercedes FBS4 situation where modules cannot be reused or easily reprogrammed without dealer intervention 1, marking a departure from the historically open architecture of Chrysler.

## 4. The Security Gateway (SGW) Module: Hardware vs. Software Barriers

Perhaps the most significant disruption to the aftermarket locksmith industry in the last decade was the introduction of the Security Gateway (SGW) module in 2018. This module acts as a firewall between the diagnostic port (DLC) and the vehicle''s internal CAN bus networks (CAN-C and CAN-IH).

### 4.1 The Mechanism of the Firewall

The SGW isolates the "Public" CAN bus (connected to the OBDII port) from the "Private" CAN bus (where the RFH, BCM, and PCM reside).

- Read-Only Access: An unauthorized tool connected to the OBDII port can read codes and live data but cannot write commands. Since key programming requires writing data (to add a Key ID), the SGW blocks the procedure.
- Industry Context: This architecture is mirrored across the industry but handled differently.

- Nissan: Requires a "16+32" hardware cable to physically bypass the gateway on 2020+ Sentra/Rogue models.1
- Hyundai/Kia: Uses a software-based approach where authorized tools exchange digital certificates with a server to gain access, requiring no physical bypass.1
- Mercedes-Benz: Uses physical intervention on older Gateway cars (W164) or dealer-only servers for modern FBS4 systems.1

### 4.2 The "12+8" Bypass Method (Hardware)

For CDJR vehicles, the primary workaround for the SGW is the "12+8" cable method.

- Procedure: The locksmith must physically locate the SGW module (often behind the radio, glovebox, or speedometer cluster). The two connectors (12-pin and 8-pin) are unplugged from the SGW and plugged into a "Y-Cable" or directly into the diagnostic tool’s adapter.
- Result: This physically bypasses the firewall, connecting the tool directly to the internal CAN bus. This allows for unrestricted PIN reading and key programming.
- Vehicle Locations:

- Dodge Charger/Challenger: Under the dash, driver side, near the steering column.
- Jeep Wrangler JL: Behind the radio (requires dash disassembly) or accessible via the "Star Connector" bank behind the glovebox.
- RAM 1500 (2019+): Behind the speedometer cluster or above the gas pedal (very difficult access).

### 4.3 The "AutoAuth" Method (Software)

Alternatively, locksmiths can utilize tools (like the Autel IM608 or SmartPro) registered with "AutoAuth."

- Mechanism: The tool connects to Wi-Fi, authenticates the user’s credentials with the AutoAuth server (which is partnered with Stellantis), and digitally "unlocks" the SGW via the OBDII port.
- Pros/Cons: This eliminates the need for dashboard disassembly but requires an active internet connection and an annual subscription fee.

### 4.4 The Star Connector Strategy

On many modern CDJR vehicles (Chrysler Pacifica, Jeep Compass), the CAN bus is distributed via "Star Connectors"—green (CAN-C) and white (CAN-IH) distribution blocks.

- The Backdoor: Instead of unplugging the SGW, a locksmith can plug a specialized "Star Connector Cable" directly into an open port on the Green Star Connector. This effectively grants direct access to the high-speed CAN bus, bypassing the SGW entirely. This is often faster than digging for the SGW module itself.

## 5. Transponder Chip Specifications and Keyway Profiles

CDJR has utilized a diverse array of transponder technologies, shifting from simple magnetic coupling to high-security AES encryption.

### 5.1 Transponder Evolution Table

Era

System

Transponder Type

Keyway

Models

1998–2004

SKIM (Early)

ID64 (4E) / ID46

Y157 / Y159

Jeep WJ, Dodge Ram BE

2004–2010

SKREEM (RHK)

Philips ID46 (PCF7936)

Y159 / Y160

Sebring, Wrangler JK, Charger

2008–2014

WIN (Fobik)

Philips ID46 (Integrated)

N/A (Plastic Fob)

Caravan, Town & Country, Ram

2011–2017

Keyless Go

ID46 (PCF7953)

Y159 Emergency Blade

Journey, 300, Charger, Dart

2018–2025

RFH (AES)

HITAG AES (4A)

SIP22 / Y159

Wrangler JL, Ram DT, Pacifica

### 5.2 The Shift to SIP22 and HITAG AES

The most significant recent change is the adoption of the "SIP22" keyway and HITAG AES (4A) transponders on models like the Jeep Renegade, Ram ProMaster, and Jeep Compass.

- Fiat Influence: The SIP22 keyway is a laser-cut (milled) high-security track, originally a Fiat design. This marks a departure from the traditional double-sided "Y159" edge-cut keys used by Chrysler for decades.
- Encryption: The HITAG AES chips (ID4A) operate on 128-bit encryption. Similar to the transition seen in the BMW G-Series 1 and Nissan’s 2019+ models 1, these chips are extremely difficult to clone. "All Keys Lost" procedures require generating a dealer key via OBD, utilizing the SGW bypass.

### 5.3 Fobik vs. Pod Key

- Fobik: The plastic rectangular key used in WIN modules.
- Pod Key: A traditional-looking key with a Fobik-style head, used in lower-trim vehicles (like the RAM ST tradesman trucks) that have a WIN module but no RKE buttons.
- Interchangeability: A Pod Key can typically start a vehicle designed for a Fobik, provided the transponder ID is programmed. However, the Fobik functions (buttons) will obviously be absent.

## 6. Comprehensive Programming Procedures and Tool Walkthroughs

The following procedures outline the best practices for programming CDJR vehicles using industry-standard tools like the Autel IM608 and Advanced Diagnostics SmartPro.

### 6.1 Scenario A: 2015 Dodge Ram 1500 (RFH/Keyless Go) - All Keys Lost

- System: Radio Frequency Hub (RFH) with ID46 Proximity Key.
- Prerequisites: Valid PIN code (read via tool), Battery voltage > 12.5V.
- Tool Path (Autel): IMMO > Chrysler > Selection > RAM > 2013-2017 > Smart Key.

1. Read PIN: Select "Read Immobilizer Password." The tool will query the RFH. On a 2015, this is typically successful via OBD without a bypass. Record the 4-digit PIN.
1. Erase Keys: (Optional but recommended for AKL). Select "Erase all keys." This ensures lost keys cannot start the truck.
1. Add Key: Select "Add Smart Key."
1. Procedure: The tool will prompt to press the "Unlock" button on the new smart key while holding it near the center console (or pressing the Start button with the fob nose).
1. Verification: The dash will display "Key Learned." Test proximity unlock and push-to-start functions.

### 6.2 Scenario B: 2020 Jeep Wrangler JL (SGW + SIP22) - Add Key

- System: RFH with Security Gateway and HITAG AES (4A) Key.
- Challenge: The SGW blocks OBD programming.
- Hardware Prep:

- Locate the "Star Connector" bank behind the glovebox (passenger side).
- Disconnect the two OEM connectors from the Green (CAN-C) block.
- Connect the "12+8" or "Star Connector" adapter cable into the Star Connector block and the programming tool.

- Tool Path (Autel): IMMO > Jeep > Wrangler JL > 2018-2021 > Smart Key.

1. Read PIN: Select "Read PIN Code." The tool will pull the PIN from the RFH via the direct CAN connection.
1. Program Key: Select "Add Smart Key."
1. Sequence: Hold the new key against the Start Button. Press the button with the key nose.
1. Confirmation: The cluster will update the key count.
1. Reassembly: Disconnect the bypass cable and reconnect the OEM Star Connectors. Verify the vehicle starts without the tool connected.

### 6.3 Scenario C: 2010 Dodge Grand Caravan (WIN/Fobik) - WIN Module Failure

- Symptom: Vehicle does not crank. Fobik does not rotate in the switch.
- Diagnosis:

- Connect scanner. Attempt to read "WIN Module" live data.
- If "No Communication," check power/ground to WIN.
- If Communicating, check "Ignition Switch Status." If status does not change when Fobik is inserted, the WIN detents are likely broken.

- Repair: Replace WIN Module.
- Programming (Replacement WIN):

1. Install: Install new WIN module.
1. Transfer Secret: Use "Replace WIN" function. The tool will attempt to read the SKIM Secret Key (SSK) from the PCM and write it to the new WIN. This avoids needing to replace existing keys.
1. If Transfer Fails: You must program the WIN as "New." This requires the vehicle''s original PIN (from dealer) and new Fobiks, as used Fobiks are locked to the old WIN configuration.

## 7. Comparisons with Global Industry Standards

Understanding CDJR security becomes clearer when contrasted with the competing architectures detailed in the provided research data.

### 7.1 SGW Implementation: CDJR vs. Hyundai vs. Nissan

The approach to the 2018+ Security Gateway creates distinct workflows:

- CDJR (12+8 Bypass): The primary method is physical. The locksmith is expected to remove panels and plug in cables. This is labor-intensive but reliable and does not strictly require an internet subscription if the tool has offline protocols.
- Hyundai/Kia (Digital Certs): As noted in the Hyundai research 1, the SGW does not require hardware bypass. It is purely a software handshake. This is cleaner but makes the locksmith 100% dependent on the tool manufacturer''s server uptime and subscription status.
- Nissan (16+32 Cable): Nissan’s approach 1 on the 2020+ Sentra mirrors the CDJR method (physical bypass), confirming a trend among manufacturers who do not have a robust "AutoAuth" style partnership with the aftermarket.

### 7.2 Rolling Code Complexity: CDJR vs. BMW

- CDJR Rolling Codes: While CDJR rolling PINs require server calculation, they are generally valid for a session. The RF Hub acts as the primary gatekeeper.
- BMW ISN: In contrast, BMW’s "Rolling Code" logic between the CAS and DME is a continuous synchronization. Furthermore, the BMW ISN (Individual Serial Number) is a 128-bit hex string 1 that is significantly more complex than the 4-digit or 5-digit PINs used by CDJR. CDJR security relies on access (the Gateway), whereas BMW security relies on cryptography (the ISN).

### 7.3 Key "Locking" logic: CDJR vs. Mercedes

- Mercedes FBS4: Once a key is programmed, it is practically impossible to reuse or unlock for another vehicle.1
- CDJR Fobiks/Prox: Similarly, modern CDJR keys (Hitag 2 and Hitag AES) lock the "Remote" and "Keyless" pages to the vehicle configuration. While the transponder data might be rewriteable on some generic chips, OEM keys are typically one-time use. This similarity reinforces the "Europeanization" of CDJR security protocols following the Daimler era.

## 8. Lishi Decoding and Mechanical Lock Systems

While the WIN module eliminated the ignition cylinder, door locks remain mechanical, necessitating traditional locksmith skills for "Lockout" and "All Keys Lost" key generation.

### 8.1 The CY24 / Y159 Keyway

- Profile: An 8-cut, double-sided edge key.
- Lishi Tool: CY24 (2-in-1).
- Picking Strategy: This is a standard wafer lock. Some wafers are split (1-up/1-down). The CY24 Lishi is generally user-friendly.
- Application: Older Chrysler/Dodge/Jeep, and current heavy-duty trucks (RAM 2500/3500 door locks).

### 8.2 The SIP22 Keyway

- Profile: A high-security, laser-cut track key (milled).
- Lishi Tool: SIP22 (2-in-1).
- Picking Strategy: This lock requires distinct tension. It is common on the Jeep Renegade, Ram ProMaster, and newer Jeep Compass.
- Decoding Nuance: The SIP22 lock on ProMasters is notoriously stiff. The Lishi tool risks bending if over-torqued.

### 8.3 The High-Security "Emergency" Blade (Y159-HS)

- Profile: Used in the "Pod" keys and Smart Keys for Chargers/Challengers.
- Lishi Tool: CY24 (often works) or specific Y159 decoders.
- Note: Many modern CDJR door locks utilize a "clutch" mechanism. If picked in the wrong direction, the cylinder spins freely without unlocking the door.

## 9. Conclusion and Future Outlook

The trajectory of CDJR security architecture is clear: a move toward total isolation of the security modules from the open diagnostic bus. The progression from the open SKIM systems to the firewalled SGW modules demonstrates a defensive engineering posture.

For the professional locksmith, the future of servicing the Stellantis fleet lies in:

1. Hardware Proficiency: Mastering the physical access points for the SGW bypass (Star Connectors, RFH plugs).
1. Digital Authorization: Maintaining active credentials with AutoAuth and NASTF to perform legitimate programming without dashboard disassembly.
1. Component Replacement: As RF Hubs become VIN-locked in the "Hub Lock" era (2021+), the trade will shift from simple "Key Adding" to complex "Module Replacement and Restore" procedures, mirroring the high-level bench work currently required for BMW 1 and Mercedes 1 vehicles.

Confidential: Professional Use Only

Based on technical analysis of Chrysler, Dodge, Jeep, and RAM security systems, with comparative references to Nissan, Hyundai, Ford, BMW, and Mercedes-Benz architectures.

#### Works cited

1. Ford_Locksmith_Programming_Guide.docx', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Vehicle Secure Gateway Module Research', 'Global', 'General', 2010, 2024, '

# The Fortified Chassis: A Comprehensive Analysis of Secure Gateway Architectures in Modern Automotive Networks (2018–2024)

## 1. Executive Summary: The End of the Open Architecture Era

The automotive industry is currently navigating one of the most profound shifts in its technological history: the transition from open, trust-based internal networks to segmented, authenticated, and encrypted digital architectures. For nearly three decades, the On-Board Diagnostics (OBD-II) port served as a universal, unguarded interface into the vehicle’s central nervous system. Mandated by emissions regulations, this port provided a direct copper pathway to the Controller Area Network (CAN) bus, allowing trusted access to critical control units for anyone with a physical connection. This architecture relied entirely on "security by obscurity" and the physical isolation of the vehicle.

However, the proliferation of telematics, 4G/LTE modems, and advanced infotainment systems has irrevocably eroded this physical isolation. Modern vehicles are no longer standalone mechanical entities; they are nodes in a continuously connected IoT ecosystem. This connectivity introduced a new threat vector: remote exploitation. In response, global regulatory bodies and automotive manufacturers have implemented the Secure Gateway (SGW) Module. This device functions as a digital firewall, strictly enforcing an "air gap" between external interfaces and the safety-critical internal networks that control propulsion, braking, and steering.

This report provides an exhaustive technical analysis of the Secure Gateway implementations by three major automotive conglomerates: Fiat Chrysler Automobiles (FCA/Stellantis), Nissan, and Ford. The analysis focuses on the model years 2018 through 2024, a period that marks the aggressive rollout of these security measures. We dissect the physical and digital bypass mechanisms required to service these vehicles, detailing the precise physical locations of SGW modules in high-volume platforms and analyzing the proprietary connector interfaces that now govern access to the vehicle''s brain. The findings indicate that while software-based authentication (e.g., AutoAuth) is the OEM-preferred path for routine diagnostics, physical bypass solutions remain a critical, albeit invasive, necessity for advanced repair, tuning, and locksmithing operations.

![Image](/api/assets/Vehicle_Secure_Gateway_Module_Research_image1_png.png)

## 2. The Cybersecurity Imperative and Regulatory Landscape

### 2.1 The Vulnerability of the CAN Bus

To fully appreciate the necessity and function of the Secure Gateway, one must understand the inherent vulnerability of the Controller Area Network (CAN) protocol. Developed in the 1980s, CAN was designed for reliability and speed, not security. It operates on a broadcast messaging system where every node on the network trusts every other node implicitly. If a device can send a message on the bus—for example, "Command: Apply Brakes"—the receiving modules (e.g., the ABS pump) will execute that command without verifying the sender''s identity.

In the pre-connected era, this was acceptable because gaining access to the CAN bus required physical intrusion into the cabin. However, as vehicles became equipped with cellular modems for navigation, remote start apps, and over-the-air (OTA) updates, the "attack surface" expanded. Researchers demonstrated that if a hacker compromised the infotainment unit (the "Public" side), they could pivot to the CAN bus and send malicious commands to the "Private" side, such as disabling the transmission or controlling the steering. The Secure Gateway Module was introduced to stop this specific lateral movement.1

### 2.2 The Man-in-the-Middle Architecture

The SGW fundamentally alters the vehicle''s topology by acting as a hardware-based Man-in-the-Middle (MITM). It segments the vehicle network into two distinct zones:

1. The Public Sector: This zone includes the OBD-II Data Link Connector (DLC) and the Telematics/Radio units. These are considered "untrusted" interfaces because they communicate with the outside world.
1. The Private Sector: This zone includes the Powertrain CAN (PT-CAN), Body CAN (B-CAN), and Chassis CAN (C-CAN). These networks host the critical ECUs and are considered "trusted".1

The SGW sits between these two zones. There is no longer a direct copper wire connecting the OBD-II port to the Engine Control Unit. Instead, the OBD-II port connects solely to the SGW. All diagnostic requests must pass through the SGW processor. The module evaluates every packet against an Access Control List (ACL). If a generic scan tool requests "Read Data" (e.g., engine RPM, coolant temperature, or DTCs), the SGW permits the traffic, as this poses no safety risk. However, if the tool attempts a "Write" operation—such as clearing trouble codes, actuating a solenoid, or programming a key—the SGW blocks the request unless the tool provides a valid cryptographic certificate.1

### 2.3 Regulatory Drivers: UN R155 and ISO 21434

While manufacturer self-interest drives some of this security, the primary catalyst is global regulation. The United Nations Regulation No. 155 (UN R155) mandates that vehicle manufacturers must manage cyber risks and ensure vehicles are secure by design. Similarly, the ISO/SAE 21434 standard provides the framework for cybersecurity engineering. These regulations effectively force OEMs to implement gateways to prove they have mitigated the risk of remote attacks. Consequently, what began with FCA in 2018 has now spread to Nissan, Ford, and practically every other major manufacturer, creating a standardized yet fragmented landscape of "walled gardens" that the aftermarket must navigate.

## 3. Fiat Chrysler Automobiles (Stellantis): The Security Pioneer

Fiat Chrysler Automobiles (FCA), now part of Stellantis, was the first major OEM to implement a fleet-wide firewall. Starting with select 2018 models and achieving near-total saturation by 2019/2020, the FCA Secure Gateway (SGW) became the prototype for the industry''s approach to locking down the OBD-II port.2 The FCA implementation is characterized by its reliance on a specific third-party authentication service (AutoAuth) and the widespread use of a specific physical connector standard known as the "12+8" system.

### 3.1 The Digital Solution: AutoAuth

The "official" method for bypassing the FCA SGW is purely digital. FCA partnered with a third-party service called AutoAuth to manage the Public Key Infrastructure (PKI) required for tool authentication.

- The Workflow: A technician registers their shop and their individual scan tool serial numbers with AutoAuth. When the internet-connected scan tool is plugged into a 2018+ FCA vehicle, it detects the SGW. The tool then communicates via Wi-Fi to the AutoAuth server, which verifies the technician''s credentials. If valid, the server sends a digital token back to the tool, which presents it to the vehicle''s SGW. The SGW then "unlocks," permitting bidirectional controls and code clearing.3
- Limitations: While seamless in theory, AutoAuth requires a continuous internet connection, a paid annual subscription (typically $50/year per shop), and a compatible, up-to-date scan tool.3 For independent locksmiths working in underground garages, mobile mechanics in poor signal areas, or enthusiasts using older hardware, this digital path is often viable. This limitation necessitates the physical bypass.

### 3.2 The Physical Solution: The 12+8 Bypass

The "12+8 Bypass" is a hardware workaround that physically subverts the SGW logic. Since the SGW is essentially a router sitting between the OBD port and the CAN bus, the bypass involves unplugging the network cables from the SGW and connecting them directly to each other (or to the scan tool), effectively removing the SGW from the circuit.

- The Hardware: The bypass typically utilizes a Y-cable or a specialized breakout block. The name "12+8" refers to the pin counts of the two connectors used by the SGW: a 12-pin connector and an 8-pin connector.
- The Logic: The 12-pin connector typically carries the "Private" CAN bus lines (e.g., CAN-C) from the vehicle. The 8-pin connector typically carries the lines from the OBD-II port. By bridging these directly, the technician creates a continuous loop, restoring the pre-2018 "open" architecture. This allows any non-networked or older scan tool to function with full authority, as there is no module left to say "no".1

### 3.3 Detailed SGW Module Locations and Access Procedures

The primary challenge of the physical bypass is locating the SGW. FCA engineers have placed these modules in diverse locations across different platforms, often burying them deep within the dashboard infrastructure to discourage tampering.

#### 3.3.1 Ram 1500 Ecosystem (DS vs. DT Platforms)

The Ram 1500 lineup presents a unique dichotomy due to the concurrent production of two different generations: the "Classic" (DS body code) and the "New Body Style" (DT body code). The SGW location differs radically between these two, causing significant confusion in the field.

A. Ram 1500 "New Body Style" (DT, 2019–2024)

- Location: The SGW is located in the driver''s side footwell area, positioned distinctively away from the center stack. It is mounted vertically on the metal dashboard support structure, located roughly above the parking brake pedal mechanism and behind the headlight switch cluster.
- Visual Identification: It is a black rectangular box, approximately 4x5 inches.
- Access Procedure:

1. Posture: The technician must adopt a contorted position, lying on the floorboard looking upward into the dash.
1. Removal: No trim removal is strictly necessary, though it is extremely tight. The module is often obscured by the main wire harness bundle.
1. Connector Interaction: The 12-pin and 8-pin connectors are plugged into the bottom or side of the module. The locking tabs must be depressed blindly.
1. Bypass Installation: Once unplugged, the vehicle''s harness connectors are plugged into the male ends of the 12+8 bypass cable. The diagnostic tool then plugs into the OBD port on the bypass cable, not the dashboard.6

![Image](/api/assets/Vehicle_Secure_Gateway_Module_Research_image3_png.png)

B. Ram 1500 "Classic" (DS, 2018–2022)

- Location: The SGW is buried directly behind the infotainment/radio head unit in the center dashboard stack. This location reflects the older electrical architecture where the radio was the primary "public" vector.
- Access Procedure:

1. Trim Removal: The process begins with removing the rubber tray liner in the upper dash storage bin to reveal two T20 Torx screws.
1. Bezel Removal: The entire radio bezel (often including the climate controls) must be pried off. It is held by robust metal retaining clips that require a non-marring pry tool to avoid dashboard damage.
1. Radio Removal: Four 7mm screws secure the radio receiver. The radio must be pulled forward.
1. Module Access: The SGW is bolted to the black plastic sub-structure directly behind the void left by the radio.6
1. Implications: This is a labor-intensive procedure (20–30 minutes) compared to the DT model. It makes "quick scans" via physical bypass highly inefficient, strongly incentivizing the use of AutoAuth for this specific model.

#### 3.3.2 Jeep Wrangler JL (2018+) and Gladiator JT (2020+)

- Location: The module is located under the driver''s side dashboard, to the left of the steering column. It is often mounted near the Body Control Module (BCM) and the gateway to the chassis harness.
- Access Challenges: While physically closer to the driver than in the Ram DS, the connectors are notoriously difficult to unplug. The module is often oriented such that the locking tabs face the firewall or are blocked by other harnesses.
- The "Extension" Phenomenon: Due to the difficulty of reaching these plugs (and the pain of scratching hands on metal brackets), a common modification in the Jeep community is the installation of "12+8 Extension Cables." These short patch cables are installed once (often requiring significant effort or minor disassembly of the lower knee bolster) and then left dangling in the footwell. This provides a permanent, easily accessible "bypass port" for future diagnostics without needing to fight the factory connector retention clips again.9
- Access Procedure:

1. Remove the plastic panel directly below the steering column (held by clips).
1. Reach up and to the left.
1. Identify the two white connectors plugged into the black module.
1. Depress the tabs and pull downwards.11

#### 3.3.3 Chrysler Pacifica (2017/2018+)

- Location: The SGW is located in the center stack "waterfall" area, typically behind the climate control module or the rotary gear selector assembly.
- Access Procedure:

1. The lower trim bezel containing the HVAC controls must be removed. This is usually a clip-in fitment.
1. Once the bezel is popped out, the module is visible mounted deep in the cavity.
1. Alternative Access: Some technicians report success reaching up from the driver''s footwell toward the center of the car to unplug the connectors blindly, though this requires precise knowledge of the module''s orientation.12

#### 3.3.4 Dodge Charger and Challenger (2018+)

- Location: The location varies slightly by year and trim but is generally found under the driver''s side dash, often near the steering column support or the "Double Bracket" area.
- Variant Note: Certain sources suggest that on specific high-trim models with advanced Uconnect systems, the module may be located closer to the radio, necessitating the removal of the large dashboard bezel that surrounds both the cluster and the radio (the "racetrack" bezel). Verification of the specific VIN is recommended before attempting disassembly.14

### 3.4 Technical Reference: FCA 12+8 Connector Morphology

Understanding the physical attributes of the connectors is vital for technicians attempting blind removal in tight spaces.

- 12-Pin Connector:

- Function: Primary interface for the "Private" vehicle networks (CAN-C) and power supply.
- Pinout Configuration: Dual-row layout (2 rows x 6 pins).
- Visuals: White or Off-White nylon housing.
- Locking Mechanism: A single, firm depression tab located on the top center of the connector body.
- Wire Colors (Typical): Red/Yellow (12V Constant), Black (Ground), White/Green (CAN-C High), White/Blue (CAN-C Low). Note: Wire colors can vary by model year; pin position is the reliable standard.

- 8-Pin Connector:

- Function: Interface for the "Public" networks (CAN-IHS) and the OBD-II port communication lines.
- Pinout Configuration: Dual-row layout (2 rows x 4 pins).
- Visuals: Matching White/Off-White nylon housing.
- Locking Mechanism: Top center tab.

- Common Failure Points: The locking tabs are prone to becoming brittle. In "blind" removal scenarios, technicians often use a pick tool to depress the tab, which carries a risk of snapping the lock or damaging the wire retention mechanism.1

## 4. Nissan: The Integrated Gateway and the "Silent" Block

While FCA''s SGW is a loud and obvious barrier—often throwing "Communication Error" messages immediately—Nissan''s approach is more subtle and integrated. Following the implementation of UN R155, Nissan began rolling out its secured architecture with the 2020 Nissan Sentra (B18) and the 2021 Nissan Rogue (T33). Unlike FCA''s standalone box, Nissan''s security logic is often embedded within the Central Gateway (CGW) or the Body Control Module (BCM), making "removal" impossible. Instead, the bypass relies on intercepting signals at the connector level.

### 4.1 Architecture: The 16+32 System

The Nissan system is colloquially known in the aftermarket as the 16+32 Gateway due to the pin count of the primary connectors involved in the bypass.

- 32-Pin Connector: This high-density connector typically handles the primary communication traffic, including the High-Speed CAN lines that link the BCM to the ECU and the Intelligent Power Distribution Module (IPDM).
- 16-Pin Connector: This connector manages auxiliary bus traffic and secondary signals.

### 4.2 The Bypass Distinction: Diagnostics vs. Immobilizer

A critical nuance in the Nissan ecosystem is the difference in security levels between standard diagnostics and key programming.

- Standard Diagnostics: For routine tasks like reading Check Engine lights or viewing live data parameters, many modern scan tools (Autel, Launch, Snap-on) can authenticate with the Nissan gateway over the internet (via AutoAuth or similar OEM protocols) without requiring any physical cable. The gateway allows these "Read" operations more permissively.4
- Immobilizer (IMMO) / Key Programming: This is where the physical bypass becomes mandatory. On the B18 Sentra and T33 Rogue, the gateway actively blocks the retrieval of the PIN Code (a 20-digit security code required to program new keys) during an "All Keys Lost" or "Add Key" scenario. Even with online authentication, the gateway often refuses to release this PIN to aftermarket tools.
- The 16+32 Cable Solution: To circumvent this, the technician must use a "Nissan 16+32 Gateway Adapter." This cable connects in-line (or as a complete bypass) between the vehicle''s harness and the scan tool. It physically intercepts the CAN lines before they enter the restrictive logic of the BCM/Gateway, allowing the tool to query the immobilizer data directly from the network without the Gateway filtering the request.16

### 4.3 Detailed Locations and Access Procedures

#### 4.3.1 Nissan Sentra (B18 Chassis, 2020–2024)

- Target Module: The security logic is housed in the BCM/Gateway cluster.
- Location: The module is located under the driver''s side dashboard, positioned high up near the firewall, typically above the brake pedal assembly.
- Access Procedure:

1. Trim Removal: Remove the driver''s side door sill plate and the kick panel trim.
1. Dash Panel: Remove the lower dashboard cover (knee bolster) to gain visibility.
1. Visual ID: Look for a rectangular black box with multiple connectors. The 32-pin and 16-pin connectors are often adjacent.
1. Connection: The space is notoriously tight. Technicians often report having to lay supine in the footwell to reach the connectors. The bypass cable is plugged into the vehicle harness connectors (which are unplugged from the module), effectively isolating the module from the tool''s query path.18

#### 4.3.2 Nissan Rogue (T33 Chassis, 2021–2024)

The Rogue (and the mechanically similar Mitsubishi Outlander, 2022+) presents a different location that has caused confusion in early documentation.

- Target Module: Gateway/Smart Key ECU.
- Location: The access point is behind the glovebox on the passenger side. This is distinct from the Sentra''s driver-side location.
- Access Procedure:

1. Glovebox Removal: The glovebox assembly must be removed. This typically involves opening the glovebox and removing the dampener arm (a string or plastic piston) on the right side.
1. Screws: There are usually 5 to 8 Phillips-head screws securing the glovebox frame to the dashboard: typically three along the bottom edge (visible with the glovebox closed) and three to five along the top edge (visible only when the glovebox is open).
1. Removal: Once unscrewed, the entire glovebox compartment pulls straight out.
1. Module Identification: Behind the glovebox, mounted to the metal cross-car beam or the HVAC ducting support, is the module rack. The Gateway/BCM connectors (16+32 style) are accessible here.
1. Advisory: This location is generally considered easier to access than the Sentra''s kick panel, as it allows for working from a seated position (passenger seat) rather than the footwell contortion.19

### 4.4 Technical Reference: Nissan 16+32 Connector Morphology

- 32-Pin Connector:

- Housing: Typically Gray or Black.
- Shape: Rectangular, elongated.
- Density: High-density pin layout (2 rows x 16 pins).
- Wire Gauge: Mixed. Mostly thin signal wires (20-22 AWG) with a few slightly thicker power wires at the edges.

- 16-Pin Connector:

- Housing: Matches the 32-pin in color.
- Shape: Shorter rectangle.
- Pin Configuration: 2 rows x 8 pins.

- Bypass Cable Note: The male pins on the aftermarket 16+32 adapters are often long and thin. A common failure mode is "bent pins" during insertion. Technicians are advised to inspect the adapter pins for straightness before attempting to mate them with the vehicle''s female harness connectors.21

## 5. Ford: The CAN-FD Frontier and the Active Alarm Paradox

Ford''s entry into the secured architecture era is marked by the introduction of the FNV2 (Ford Network Vehicle 2) electrical architecture, debuting largely with the 2021 Ford F-150 and the Mustang Mach-E. This architecture is a quantum leap from previous iterations, utilizing CAN-FD (Flexible Data-rate) protocol to handle the massive data throughput required for Over-the-Air (OTA) updates and advanced driver-assistance systems (BlueCruise).

### 5.1 The CAN-FD Barrier

The first "barrier" technicians encounter with 2021+ Fords is not always a security firewall, but a protocol incompatibility. The CAN-FD protocol operates at variable data rates (up to 5 Mbps or higher) and supports payload sizes up to 64 bytes (compared to standard CAN''s 8 bytes).

- The Symptom: Older OBD-II tools that only support standard CAN 2.0 will fail to communicate with the vehicle modules, appearing as if the gateway is blocking them.
- The Solution: This is not a "bypass" issue but a hardware issue. Technicians must use a CAN-FD Adapter (supported by Autel, Launch, Topdon) that acts as a translator, or upgrade to newer tools with native CAN-FD support. The Gateway Module (GWM) expects this protocol; without it, the conversation never starts.22

### 5.2 The Active Alarm / All Keys Lost (AKL) Problem

For locksmiths, the Ford FNV2 architecture introduced a formidable challenge known as the "Active Alarm Lockdown."

- The Scenario: In an "All Keys Lost" situation, the vehicle is locked, and the factory alarm is armed. On previous generations, a locksmith could plug into the OBD port and initiate a 10-minute security wait time to bypass the alarm.
- The Security Logic: On 2021+ models (F-150, Mach-E, Explorer), if the alarm is active, the GWM and BCM effectively shut down the OBD port''s ability to initiate key programming. The vehicle assumes any attempt to program a key while the alarm is screaming is a theft attempt.
- The Limitation: You cannot simply clear the alarm because you have no working key. It is a catch-22.

### 5.3 The Physical Solution: The Battery Cable Bypass

To break this loop, the aftermarket (specifically companies like Xhorse and Autel) developed a bypass cable that attacks the power source rather than the data bus.

- The Logic: The bypass cable connects directly to the vehicle''s 12V battery and the diagnostic tool. It does not plug into the GWM inside the dash. Instead, it manipulates the vehicle''s power state—likely by creating a specific "wake-up" signal or power cycling sequence that forces the BCM into a "maintenance" or "pre-boot" state where the alarm logic is temporarily suspended, allowing the OBD tool to shake hands with the immobilizer.
- The Connection Procedure:

1. Disconnect Negative: The technician must disconnect the negative terminal of the vehicle''s 12V battery.
1. Install Bypass Clamp: The bypass cable''s negative clamp connects to the vehicle''s disconnected negative cable.
1. Bridge to Battery: The bypass cable also connects to the battery''s positive and negative posts, effectively sitting in-line with the vehicle''s power supply.
1. Result: The tool (e.g., Autel IM608 or Xhorse Key Tool Plus) manages the power flow, cycling the ignition state electronically to bypass the alarm trigger.23

![Image](/api/assets/Vehicle_Secure_Gateway_Module_Research_image2_png.png)

### 5.4 GWM Module Locations and Access (Non-Battery Methods)

For tasks other than key programming—such as recovering a "bricked" module after a failed OTA update or performing rigorous diagnostics—direct access to the Gateway Module (GWM) connectors is sometimes required to hook up specialized harnesses (like the Mongoose-Plus).

#### 5.4.1 Ford F-150 (2021+)

- Location: The GWM is located in the lower center stack, physically positioned below the radio unit.
- Access Procedure:

1. Lower Trim: Remove the screws securing the lower center stack trim panel (often six 7mm screws).25
1. Side Trim: Remove the two 10mm screws securing the side panels of the center console to gain clearance.
1. Module Exposure: With the trim removed, the GWM is visible. It is a large module with multiple connectors (typically 3 or 4, depending on trim level).
1. Connector Interaction: The connectors here are 26-pin variants designed for the high-speed FNV2 network. Unplugging these allows for the insertion of "T-harnesses" used by fleet telematics installers or deep-level diagnostic tools.25

#### 5.4.2 Ford Mustang Mach-E (2021+)

- Challenge: The Mach-E, being an EV, has a different packaging layout.
- Location: The Smart Data Link Module (GWM) is deeply integrated into the dashboard infrastructure.
- Fuse Bypass: For resetting a glitchy gateway (a common troubleshooting step), technicians often rely on pulling the GWM fuse located in the Body Control Module fuse box (Passenger footwell) rather than physically accessing the buried module.26
- EV Battery Caution: When performing the "Active Alarm" battery bypass on a Mach-E, technicians must be acutely aware that the 12V battery is located in the "frunk" (front trunk). If the 12V system is dead, the electronic latch to open the frunk will not operate. The technician must first use the emergency release access cover in the front bumper to jump the latch solenoid, open the hood, and then proceed with the battery cable bypass.27

## 6. Diagnostic Workflow: Choosing the Right Access Method

The complexity of modern vehicle security means there is no "one size fits all" tool. Technicians must employ a decision logic to determine the most efficient access path.

### 6.1 Diagnostic Decision Logic

The choice between software (AutoAuth/OEM Cloud) and hardware (Bypass Cable) depends largely on the specific task and the vehicle manufacturer.

- Scenario A: Routine Diagnostics (Read/Clear Codes, Live Data)

- FCA: AutoAuth is the superior choice. It is faster (no disassembly) and supports all modules. The physical bypass is a fallback for when the internet is unavailable or the subscription is expired.
- Nissan: Standard OBD-II (often with Cloud support) usually suffices. The 16+32 cable is rarely needed for simple code clearing.
- Ford: Standard OBD-II (with CAN-FD adapter) is sufficient.

- Scenario B: Advanced Repair (Bidirectional Control, Calibrations)

- FCA: AutoAuth works for 95% of tasks. However, some ECU tuning or odometer correction tools may still require the physical 12+8 cable to write directly to the EEPROM without SGW interference.
- Nissan: Standard OBD-II typically works, but some specific active tests may require the 16+32 cable if the gateway security logic is particularly aggressive on that specific software version.

- Scenario C: Key Programming (IMMO / All Keys Lost)

- FCA: 12+8 Cable is frequently preferred or required by locksmith tools (like the Autel IM508/608) to ensure uninterrupted communication with the RF Hub.
- Nissan: 16+32 Cable is Mandatory for 2020+ Sentra and Rogue. The gateway will block the PIN code read request without it.
- Ford: Active Alarm Cable (Battery connection) is Mandatory for AKL situations on 2021+ F-150/Mach-E. The OBD port is functionally dead for programming while the alarm is active.

### 6.2 Comparative Analysis Table

Feature

AutoAuth / Cloud Auth

Physical Bypass (FCA 12+8 / Nissan 16+32)

Ford Active Alarm Cable

Primary Mechanism

Digital Certificate Exchange via Wi-Fi

Physical Circuit Bridging (Man-in-the-Middle removal)

Power State Manipulation (Alarm Logic Reset)

Best Used For

General Repair, Emissions, Code Clearing

Locksmithing, Tuning, "Offline" Repairs

"All Keys Lost" Programming on 2021+ Fords

Invasiveness

Low (Plug into OBD port)

High (Requires dashboard/trim disassembly)

Medium (Requires under-hood battery access)

Cost

Recurring Subscription ($50/yr)

One-time Hardware Purchase ($20–$50)

One-time Hardware Purchase ($50–$150)

Risk Factor

Minimal

Moderate (Broken clips, bent pins)

Moderate (Short circuit risk if clamped wrong)

Future Outlook

Becoming the Industry Standard

Likely to be phased out as cryptography improves

Specific to current architecture generation

## 7. Implications for the Aftermarket

The data clearly indicates a shift in the balance of power between OEMs and the independent aftermarket. The Secure Gateway is not merely a component; it is a policy enforcement device. While the "Right to Repair" movement has secured access to the data (via generic OBD modes), the ability to act on that data—to fix, to tune, to program—is now gated.

For the independent shop, this necessitates a capital investment not just in tools, but in subscriptions and time. The "quick code clear" that once took 30 seconds on a Ram 1500 now takes 30 minutes if the AutoAuth server is down and the radio bezel must be pulled. For the locksmith, the 16+32 and Active Alarm cables are now as essential as the key cutting machine itself.

Ultimately, the Secure Gateway has standardized the need for a "Hybrid" toolkit: a technician in 2024 cannot rely solely on a physical connection or a digital credential. They must possess both, and the knowledge of when to deploy each, to navigate the fortified chassis of the modern connected vehicle.

#### Works cited

1. FCA Security Gateway Module Basic Info and Location - JScan, accessed December 17, 2025, https://jscan.net/fca-security-gateway-module-basic-info-and-location/
1. 12+8 Adapter for Chrysler Secure Gateway Module - AESwave.com, accessed December 17, 2025, https://www.aeswave.com/12-8-adapter-for-chrysler-secure-gateway-module-p9693.html
1. Diagnosing 2018+ FCA (Dodge, Chrysler, Jeep etc) with Security Gateway Module using YOUCANIC Scanner - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=AkuGwWZ2nVs
1. Unlocking Nissan SGW with X-431 Torque Link | Launch Tech USA - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=hqQyH8quRYg
1. Do FCA SGW 12+8 Bypass Cables Actually Work? Can You Save $50 A Year? - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=uVVCs_zENxI
1. STE Chrysler Pass Through User Manual - Squarespace, accessed December 17, 2025, https://static1.squarespace.com/static/51fac8cfe4b0339e6c6987e1/t/5df85fc2cde8ca0f95214058/1576558531884/STE_Chrysler_Passthrough_V1_2.pdf
1. Edge Products Gateway Bypass Module Install 2019 Dodge/RAM EvoHT2 PCM SWAP (8-speed Only) - 36041-S1, accessed December 17, 2025, https://www.youtube.com/watch?v=ITnAkql9UXE
1. 2018 Dodge Ram 1500 Network Gateway Module Location and Removal - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=puHg88XTc5s
1. 2018 JEEP WRANGLER / GLADIATOR 12+8 LOCATIONS (SGM LOCATION) - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=D072R88XJdc
1. 2024 Security Gateway Bypass - How to remove original cables from security module? SGW : r/Wrangler - Reddit, accessed December 17, 2025, https://www.reddit.com/r/Wrangler/comments/1gmrcn0/2024_security_gateway_bypass_how_to_remove/
1. 2021 Jeep Wrangler 4XE JL SGW Cable Install - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=-V93etacytY
1. Chrysler Pacifica Security Gateway Bypass location / How to read clear check engine light OBD 12+8 - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=Q5p63yB4h_k
1. Chrysler Pacifica Security Gateway Bypass Location & Installation - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=wq_q_32UXhE
1. Why You Need A Security Bypass - OBDGenie.com, accessed December 17, 2025, https://www.obdgenie.com/pages/boxbypassinstructions
1. Security Bypass Cable OBD2 SGW Adaptor for FCA Chrysler 12 8 Connector for Diagn, accessed December 17, 2025, https://www.ebay.com/itm/286830717071
1. Autel - Nissan 16+32 OBD Gateway Adapter for B118 Chasis for Sale | UHS Hardware, accessed December 17, 2025, https://www.uhs-hardware.com/products/autel-nissan-16-32-obd-gateway-adapter-for-b118-chasis
1. Autel Nissan 16+32 Secure Gateway Adaptor Applicable to Sylphy Sentra (Models with B18 Chassis) - MK3, accessed December 17, 2025, https://www.mk3.com/autel-nissan-1632-secure-gateway-adaptor
1. Nissan Universal 16+32G Bypass Cable with CGW Adapter - CLK Supplies, accessed December 17, 2025, https://www.clksupplies.com/products/nissan-universal-16-32g-bypass-cable-with-cgw-adapter
1. How To Remove 2021-2025 Nissan Rogue Glovebox. - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=4TiVpXimFEU
1. How To Remove 2017-2022 Nissan Rogue Sport Glovebox. - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=hd4QBh7vCkE
1. Nissan 16+32 ByPass Cable - AESwave.com, accessed December 17, 2025, https://www.aeswave.com/nissan-16-32-bypass-cable-p10056.html
1. CAN FD ADAPTER - Toolsource.com, accessed December 17, 2025, https://www.toolsource.com/scan-tool-software-cables-c-102_897/can-fd-adapter-p-308703.html
1. IKS Active Perimeter Alarm Bypass Cable For Select Ford Vehicles - Key Innovations, accessed December 17, 2025, https://keyinnovations.com/products/iks-ford-active-alarm-cable
1. (486) Xhorse Ford Active Alarm All Keys Lost Cable & Key Tool Plus - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=wvF0FKJZpAA
1. How to access an F-150 Gateway Connector - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=YGKAHWkLAis
1. FORD MUSTANG GATEWAY FUSE LOCATION 2015 2016 2017 2018 2019 2020 2021 2022 2023 - YouTube, accessed December 17, 2025, https://www.youtube.com/watch?v=EETNlQffxSE
1. Replace and Reprogram Keys How-To Articles | Browse By Topic | Ford Owner Support, accessed December 17, 2025, https://www.ford.com/support/how-tos/keys-and-locks/replace-and-reprogram-keys/
1. Programing a new key fob is so easy! : r/MachE - Reddit, accessed December 17, 2025, https://www.reddit.com/r/MachE/comments/1dw60l8/programing_a_new_key_fob_is_so_easy/', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Chrysler Locksmith Guide Creation', 'Chrysler', 'General', 2010, 2024, '

# The Definitive Locksmith Guide to Chrysler, Dodge, Jeep, and RAM Security Architectures (1998–2025)

## 1. Executive Summary and Strategic Overview

The automotive security landscape of the Fiat Chrysler Automobiles (FCA), now Stellantis, ecosystem represents one of the most dynamic and complex evolutions in the locksmithing domain. Unlike the consistent, linear progression seen in Ford’s Passive Anti-Theft System (PATS) or the deeply entrenched cryptographic consensus of Mercedes-Benz’s Drive Authorization System (DAS), the security architecture of Chrysler, Dodge, Jeep, and RAM (CDJR) vehicles is defined by distinct eras of technological adoption, often influenced by the corporate ownership of the time.

From the early implementations of the Sentry Key Immobilizer Module (SKIM) under the Daimler-Chrysler partnership—which borrowed heavily from European transponder logic—to the modern, high-security implementations of the Radio Frequency Hub (RFH) and Security Gateway (SGW) modules under the Stellantis umbrella, the CDJR fleet demands a multifaceted diagnostic approach. For the professional locksmith, mastering this ecosystem requires not only an understanding of basic transponder programming but also a proficiency in handling the notorious "Rolling Code" PIN algorithms, navigating physical firewalls, and managing the delicate interplay between the Body Control Module (BCM) and the RF Hub.

This comprehensive research report serves as the definitive technical reference for the CDJR market. It dissects the operational theory of the four major immobilizer generations (SKIM, SKREEM, WIN, and RFH), details the cryptographic imperatives of PIN code extraction in the "Rolling Code" era, and provides granular programming procedures for dealing with the modern Security Gateway. Furthermore, this analysis integrates a comparative study of industry standards, contrasting CDJR’s protocols with the specific architectures of Nissan, Ford, BMW, Mercedes-Benz, and Hyundai to highlight the unique operational requirements of the Stellantis fleet. By understanding these divergent engineering philosophies—such as CDJR’s reliance on physical bypass cables for SGW access versus Hyundai’s digital certificate model—the locksmith gains the diagnostic intuition necessary to resolve complex "All Keys Lost" (AKL) scenarios and module failures.

## 2. Immobilizer System Architecture and Theoretical Evolution

To master CDJR key programming, one must first map the vehicle’s production year to its specific immobilizer architecture. The evolution of these systems is not merely a change in part numbers but a fundamental shift in how the vehicle authorizes a start request.

### 2.1 The Era of Static Codes: SKIM and SKREEM (1998–2010)

The genesis of modern CDJR security began with the Sentry Key Immobilizer Module (SKIM). This system introduced the concept of the "Sentry Key," a transponder-equipped key that communicated with a dedicated immobilizer ring located around the ignition cylinder.

#### The Sentry Key Immobilizer Module (SKIM)

The SKIM architecture, prevalent in vehicles like the early Jeep Grand Cherokee (WJ), Dodge Ram (BE/BR), and Chrysler Sebring, established the foundational "Challenge-Response" logic used by the manufacturer.

- Operational Theory: When the ignition is turned, the SKIM energizes the transponder coil. The chip (typically an ID64 or early ID46) transmits a fixed alphanumeric ID. The SKIM verifies this ID against its internal EEPROM. If valid, the SKIM sends a "Fuel Enable" message to the Powertrain Control Module (PCM) via the PCI (Programmable Communications Interface) bus.
- PIN Code Logic: Unlike the Ford PATS system of the same era, which often utilized a timed access (10-minute delay) for key programming 1, the SKIM system relied on a static 4-digit PIN code. This PIN was assigned to the vehicle at the factory and stored in the SKIM.
- Industry Comparison: This approach contrasts with the early Nissan NATS 5 systems, which also used a static PIN but allowed for calculation via the BCM label.1 In the CDJR ecosystem, the PIN was rarely calculable from external labels and typically required extraction from the dealer database or direct EEPROM reading of the Motorola MC68HC microcontroller within the SKIM unit.

#### The Sentry Key Remote Entry Module (SKREEM)

As remote keyless entry (RKE) became standard, engineers integrated the immobilizer and RKE receiver into a single unit: the SKREEM.

- Architecture: The SKREEM (Sentry Key Remote Entry Module) captures both the low-frequency (125 kHz) transponder signal and the high-frequency (315/433 MHz) remote signal. This integration reduced component count but introduced a single point of failure. If the SKREEM module fails—a common occurrence on the Crossfire and Sprinter platforms (which share DNA with the Mercedes SLK R170)—the vehicle is rendered immobile.
- Transponder Evolution: This era solidified the use of the Philips PCF7936 (ID46) chip. Much like the Nissan NATS 6 and Hyundai SMARTRA-3 systems 1, the CDJR implementation of ID46 locks the chip to the specific vehicle family (Crypto Mode) once programmed. A standard "virgin" PCF7936 can often be used for Chrysler, Dodge, Jeep, Hyundai, or Nissan applications, provided it is configured correctly by the programming tool prior to the "Learn" command.

### 2.2 The Daimler Legacy: Wireless Ignition Node (WIN) and Fobik (2008–2014)

The "Fobik" era represents the most visible influence of the Daimler-Chrysler partnership. The Wireless Ignition Node (WIN) is functionally and mechanically similar to the Mercedes-Benz Electronic Ignition Switch (EIS).1

- Hardware Design: The WIN eliminates the mechanical key blade for ignition turning. Instead, the user inserts a "Fobik" (Finger Operated Button Integrated Key)—a plastic rectangular fob—into the dash slot. The fob acts as the key, turning the rotary switch inside the WIN.
- Security Architecture: The WIN reads the transponder data (now integrated into the circuit board of the Fobik) and communicates with the PCM. However, unlike the sophisticated Hash-based consensus of the Mercedes DAS 3 system which requires all modules to agree 1, the WIN system remained PIN-based. Accessing the programming function still required the 4-digit PIN code.
- Critical Failure Points: The WIN modules on the Dodge Grand Caravan and Chrysler Town & Country (2008–2010) are notorious for mechanical detent failure. The module may fail to detect the Fobik insertion or may allow the Fobik to fall out of the "Run" position while driving (leading to the massive P57 safety recall).
- Diagnostic Nuance: In a failure scenario, the symptoms often mimic a dead battery or starter failure. The locksmith must differentiate between a WIN that has lost communication (No Bus) and a WIN that simply cannot mechanically engage the ignition switch.

### 2.3 The Modern Era: Radio Frequency Hub (RFH) and Keyless Go (2011–Present)

With the introduction of the "Keyless Go" (Push-To-Start) systems, the immobilizer function migrated to the Radio Frequency Hub (RF Hub or RFH). This is the current standard for the majority of the fleet, including the RAM 1500, Jeep Grand Cherokee, and Dodge Charger.

- The RF Hub Function: The RFH is a sophisticated receiver located (typically) on the rear cab wall of trucks or under the rear shelf of sedans. It manages the passive entry antennas, the Tire Pressure Monitoring System (TPMS), and the remote start authorization.
- The "Keyless" Handshake: When the user presses the Start Button, the RFH polls the cabin antennas to triangulate the key''s location. If the key is detected inside the vehicle, the RFH authorizes the Body Control Module (BCM) to energize the Ignition Node (KIN/IGN) and tells the PCM to fuel the engine.
- Rolling Code PINs: Starting around 2013, and becoming universal by 2018, CDJR shifted from static 4-digit PINs to 5-digit rolling codes on select platforms, and eventually to a system where the PIN is encrypted and rolling based on time and VIN. This evolution necessitated a constant internet connection for aftermarket tools to pull PIN codes from "cloud" servers, similar to the Nissan 20-digit rolling code evolution.1

## 3. Cryptography and PIN Code Management: The Rolling Code Era

The defining characteristic of modern CDJR locksmithing is the management of PIN codes. Unlike Ford, where access is often time-based (10-minute wait) 1, or Hyundai, where PINs can often be read directly via OBD 1, CDJR has implemented a strict "Read PIN" protocol that has become increasingly fortified.

### 3.1 Static vs. Rolling Codes

- Static Codes (Type 1/2): On vehicles prior to ~2013, the 4-digit PIN was fixed for the life of the car. It could be read from the WIN or SKREEM EEPROM or pulled via the dealer database (DealerConnect).
- Rolling Codes (Type 3/4/5): Modern RFH systems utilize a rolling code logic. The PIN required to enter programming mode changes.

- The "Pull PIN" Requirement: Unlike Nissan’s BCM calculator where the tool calculates the PIN from a label 1, CDJR rolling codes are derived from a proprietary algorithm linked to the VIN. Aftermarket tools (AutoProPad, IM608, SmartPro) utilize "credits" or background server calculations to pull this PIN.
- System Lockout: Entering an incorrect PIN 3 times will lock the RF Hub for 1 hour. This is a critical risk during "Brute Force" attempts. This lockout behavior is identical to the Hyundai system''s 1-hour penalty 1 and the Ford PATS 10-minute lockout.1

### 3.2 The RF Hub "Lock" Strategy (2020+)

On the newest platforms (e.g., Jeep Grand Cherokee L, Wagoneer), Stellantis has implemented a "Hub Lock." Once a key is programmed to the RF Hub, the Hub locks itself to the VIN and potentially blocks further PIN reading via OBD.

- The "All Keys Lost" Conundrum: In some 2021+ scenarios, if all keys are lost, the RF Hub cannot be unlocked to accept new keys via standard PIN methods. The "official" repair often involves replacing the RF Hub with a virgin unit.
- Comparison: This is effectively similar to the Mercedes FBS4 situation where modules cannot be reused or easily reprogrammed without dealer intervention 1, marking a departure from the historically open architecture of Chrysler.

## 4. The Security Gateway (SGW) Module: Hardware vs. Software Barriers

Perhaps the most significant disruption to the aftermarket locksmith industry in the last decade was the introduction of the Security Gateway (SGW) module in 2018. This module acts as a firewall between the diagnostic port (DLC) and the vehicle''s internal CAN bus networks (CAN-C and CAN-IH).

### 4.1 The Mechanism of the Firewall

The SGW isolates the "Public" CAN bus (connected to the OBDII port) from the "Private" CAN bus (where the RFH, BCM, and PCM reside).

- Read-Only Access: An unauthorized tool connected to the OBDII port can read codes and live data but cannot write commands. Since key programming requires writing data (to add a Key ID), the SGW blocks the procedure.
- Industry Context: This architecture is mirrored across the industry but handled differently.

- Nissan: Requires a "16+32" hardware cable to physically bypass the gateway on 2020+ Sentra/Rogue models.1
- Hyundai/Kia: Uses a software-based approach where authorized tools exchange digital certificates with a server to gain access, requiring no physical bypass.1
- Mercedes-Benz: Uses physical intervention on older Gateway cars (W164) or dealer-only servers for modern FBS4 systems.1

### 4.2 The "12+8" Bypass Method (Hardware)

For CDJR vehicles, the primary workaround for the SGW is the "12+8" cable method.

- Procedure: The locksmith must physically locate the SGW module (often behind the radio, glovebox, or speedometer cluster). The two connectors (12-pin and 8-pin) are unplugged from the SGW and plugged into a "Y-Cable" or directly into the diagnostic tool’s adapter.
- Result: This physically bypasses the firewall, connecting the tool directly to the internal CAN bus. This allows for unrestricted PIN reading and key programming.
- Vehicle Locations:

- Dodge Charger/Challenger: Under the dash, driver side, near the steering column.
- Jeep Wrangler JL: Behind the radio (requires dash disassembly) or accessible via the "Star Connector" bank behind the glovebox.
- RAM 1500 (2019+): Behind the speedometer cluster or above the gas pedal (very difficult access).

### 4.3 The "AutoAuth" Method (Software)

Alternatively, locksmiths can utilize tools (like the Autel IM608 or SmartPro) registered with "AutoAuth."

- Mechanism: The tool connects to Wi-Fi, authenticates the user’s credentials with the AutoAuth server (which is partnered with Stellantis), and digitally "unlocks" the SGW via the OBDII port.
- Pros/Cons: This eliminates the need for dashboard disassembly but requires an active internet connection and an annual subscription fee.

### 4.4 The Star Connector Strategy

On many modern CDJR vehicles (Chrysler Pacifica, Jeep Compass), the CAN bus is distributed via "Star Connectors"—green (CAN-C) and white (CAN-IH) distribution blocks.

- The Backdoor: Instead of unplugging the SGW, a locksmith can plug a specialized "Star Connector Cable" directly into an open port on the Green Star Connector. This effectively grants direct access to the high-speed CAN bus, bypassing the SGW entirely. This is often faster than digging for the SGW module itself.

## 5. Transponder Chip Specifications and Keyway Profiles

CDJR has utilized a diverse array of transponder technologies, shifting from simple magnetic coupling to high-security AES encryption.

### 5.1 Transponder Evolution Table

Era

System

Transponder Type

Keyway

Models

1998–2004

SKIM (Early)

ID64 (4E) / ID46

Y157 / Y159

Jeep WJ, Dodge Ram BE

2004–2010

SKREEM (RHK)

Philips ID46 (PCF7936)

Y159 / Y160

Sebring, Wrangler JK, Charger

2008–2014

WIN (Fobik)

Philips ID46 (Integrated)

N/A (Plastic Fob)

Caravan, Town & Country, Ram

2011–2017

Keyless Go

ID46 (PCF7953)

Y159 Emergency Blade

Journey, 300, Charger, Dart

2018–2025

RFH (AES)

HITAG AES (4A)

SIP22 / Y159

Wrangler JL, Ram DT, Pacifica

### 5.2 The Shift to SIP22 and HITAG AES

The most significant recent change is the adoption of the "SIP22" keyway and HITAG AES (4A) transponders on models like the Jeep Renegade, Ram ProMaster, and Jeep Compass.

- Fiat Influence: The SIP22 keyway is a laser-cut (milled) high-security track, originally a Fiat design. This marks a departure from the traditional double-sided "Y159" edge-cut keys used by Chrysler for decades.
- Encryption: The HITAG AES chips (ID4A) operate on 128-bit encryption. Similar to the transition seen in the BMW G-Series 1 and Nissan’s 2019+ models 1, these chips are extremely difficult to clone. "All Keys Lost" procedures require generating a dealer key via OBD, utilizing the SGW bypass.

### 5.3 Fobik vs. Pod Key

- Fobik: The plastic rectangular key used in WIN modules.
- Pod Key: A traditional-looking key with a Fobik-style head, used in lower-trim vehicles (like the RAM ST tradesman trucks) that have a WIN module but no RKE buttons.
- Interchangeability: A Pod Key can typically start a vehicle designed for a Fobik, provided the transponder ID is programmed. However, the Fobik functions (buttons) will obviously be absent.

## 6. Comprehensive Programming Procedures and Tool Walkthroughs

The following procedures outline the best practices for programming CDJR vehicles using industry-standard tools like the Autel IM608 and Advanced Diagnostics SmartPro.

### 6.1 Scenario A: 2015 Dodge Ram 1500 (RFH/Keyless Go) - All Keys Lost

- System: Radio Frequency Hub (RFH) with ID46 Proximity Key.
- Prerequisites: Valid PIN code (read via tool), Battery voltage > 12.5V.
- Tool Path (Autel): IMMO > Chrysler > Selection > RAM > 2013-2017 > Smart Key.

1. Read PIN: Select "Read Immobilizer Password." The tool will query the RFH. On a 2015, this is typically successful via OBD without a bypass. Record the 4-digit PIN.
1. Erase Keys: (Optional but recommended for AKL). Select "Erase all keys." This ensures lost keys cannot start the truck.
1. Add Key: Select "Add Smart Key."
1. Procedure: The tool will prompt to press the "Unlock" button on the new smart key while holding it near the center console (or pressing the Start button with the fob nose).
1. Verification: The dash will display "Key Learned." Test proximity unlock and push-to-start functions.

### 6.2 Scenario B: 2020 Jeep Wrangler JL (SGW + SIP22) - Add Key

- System: RFH with Security Gateway and HITAG AES (4A) Key.
- Challenge: The SGW blocks OBD programming.
- Hardware Prep:

- Locate the "Star Connector" bank behind the glovebox (passenger side).
- Disconnect the two OEM connectors from the Green (CAN-C) block.
- Connect the "12+8" or "Star Connector" adapter cable into the Star Connector block and the programming tool.

- Tool Path (Autel): IMMO > Jeep > Wrangler JL > 2018-2021 > Smart Key.

1. Read PIN: Select "Read PIN Code." The tool will pull the PIN from the RFH via the direct CAN connection.
1. Program Key: Select "Add Smart Key."
1. Sequence: Hold the new key against the Start Button. Press the button with the key nose.
1. Confirmation: The cluster will update the key count.
1. Reassembly: Disconnect the bypass cable and reconnect the OEM Star Connectors. Verify the vehicle starts without the tool connected.

### 6.3 Scenario C: 2010 Dodge Grand Caravan (WIN/Fobik) - WIN Module Failure

- Symptom: Vehicle does not crank. Fobik does not rotate in the switch.
- Diagnosis:

- Connect scanner. Attempt to read "WIN Module" live data.
- If "No Communication," check power/ground to WIN.
- If Communicating, check "Ignition Switch Status." If status does not change when Fobik is inserted, the WIN detents are likely broken.

- Repair: Replace WIN Module.
- Programming (Replacement WIN):

1. Install: Install new WIN module.
1. Transfer Secret: Use "Replace WIN" function. The tool will attempt to read the SKIM Secret Key (SSK) from the PCM and write it to the new WIN. This avoids needing to replace existing keys.
1. If Transfer Fails: You must program the WIN as "New." This requires the vehicle''s original PIN (from dealer) and new Fobiks, as used Fobiks are locked to the old WIN configuration.

## 7. Comparisons with Global Industry Standards

Understanding CDJR security becomes clearer when contrasted with the competing architectures detailed in the provided research data.

### 7.1 SGW Implementation: CDJR vs. Hyundai vs. Nissan

The approach to the 2018+ Security Gateway creates distinct workflows:

- CDJR (12+8 Bypass): The primary method is physical. The locksmith is expected to remove panels and plug in cables. This is labor-intensive but reliable and does not strictly require an internet subscription if the tool has offline protocols.
- Hyundai/Kia (Digital Certs): As noted in the Hyundai research 1, the SGW does not require hardware bypass. It is purely a software handshake. This is cleaner but makes the locksmith 100% dependent on the tool manufacturer''s server uptime and subscription status.
- Nissan (16+32 Cable): Nissan’s approach 1 on the 2020+ Sentra mirrors the CDJR method (physical bypass), confirming a trend among manufacturers who do not have a robust "AutoAuth" style partnership with the aftermarket.

### 7.2 Rolling Code Complexity: CDJR vs. BMW

- CDJR Rolling Codes: While CDJR rolling PINs require server calculation, they are generally valid for a session. The RF Hub acts as the primary gatekeeper.
- BMW ISN: In contrast, BMW’s "Rolling Code" logic between the CAS and DME is a continuous synchronization. Furthermore, the BMW ISN (Individual Serial Number) is a 128-bit hex string 1 that is significantly more complex than the 4-digit or 5-digit PINs used by CDJR. CDJR security relies on access (the Gateway), whereas BMW security relies on cryptography (the ISN).

### 7.3 Key "Locking" logic: CDJR vs. Mercedes

- Mercedes FBS4: Once a key is programmed, it is practically impossible to reuse or unlock for another vehicle.1
- CDJR Fobiks/Prox: Similarly, modern CDJR keys (Hitag 2 and Hitag AES) lock the "Remote" and "Keyless" pages to the vehicle configuration. While the transponder data might be rewriteable on some generic chips, OEM keys are typically one-time use. This similarity reinforces the "Europeanization" of CDJR security protocols following the Daimler era.

## 8. Lishi Decoding and Mechanical Lock Systems

While the WIN module eliminated the ignition cylinder, door locks remain mechanical, necessitating traditional locksmith skills for "Lockout" and "All Keys Lost" key generation.

### 8.1 The CY24 / Y159 Keyway

- Profile: An 8-cut, double-sided edge key.
- Lishi Tool: CY24 (2-in-1).
- Picking Strategy: This is a standard wafer lock. Some wafers are split (1-up/1-down). The CY24 Lishi is generally user-friendly.
- Application: Older Chrysler/Dodge/Jeep, and current heavy-duty trucks (RAM 2500/3500 door locks).

### 8.2 The SIP22 Keyway

- Profile: A high-security, laser-cut track key (milled).
- Lishi Tool: SIP22 (2-in-1).
- Picking Strategy: This lock requires distinct tension. It is common on the Jeep Renegade, Ram ProMaster, and newer Jeep Compass.
- Decoding Nuance: The SIP22 lock on ProMasters is notoriously stiff. The Lishi tool risks bending if over-torqued.

### 8.3 The High-Security "Emergency" Blade (Y159-HS)

- Profile: Used in the "Pod" keys and Smart Keys for Chargers/Challengers.
- Lishi Tool: CY24 (often works) or specific Y159 decoders.
- Note: Many modern CDJR door locks utilize a "clutch" mechanism. If picked in the wrong direction, the cylinder spins freely without unlocking the door.

## 9. Conclusion and Future Outlook

The trajectory of CDJR security architecture is clear: a move toward total isolation of the security modules from the open diagnostic bus. The progression from the open SKIM systems to the firewalled SGW modules demonstrates a defensive engineering posture.

For the professional locksmith, the future of servicing the Stellantis fleet lies in:

1. Hardware Proficiency: Mastering the physical access points for the SGW bypass (Star Connectors, RFH plugs).
1. Digital Authorization: Maintaining active credentials with AutoAuth and NASTF to perform legitimate programming without dashboard disassembly.
1. Component Replacement: As RF Hubs become VIN-locked in the "Hub Lock" era (2021+), the trade will shift from simple "Key Adding" to complex "Module Replacement and Restore" procedures, mirroring the high-level bench work currently required for BMW 1 and Mercedes 1 vehicles.

Confidential: Professional Use Only

Based on technical analysis of Chrysler, Dodge, Jeep, and RAM security systems, with comparative references to Nissan, Hyundai, Ford, BMW, and Mercedes-Benz architectures.

#### Works cited

1. Ford_Locksmith_Programming_Guide.docx', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Volvo Locksmith Guide Development Plan', 'Volvo', 'General', 2010, 2024, '

# Definitive Locksmith Guide: Volvo Automotive Security Architectures (1993–2025)

## Executive Summary

The domain of automotive security for Volvo vehicles represents one of the most intellectually demanding and technically rigorous sectors within the professional locksmithing industry. Unlike the centralized, BCM-centric architectures found in Nissan or the additive logic of Ford’s PATS systems, Volvo’s security philosophy has historically been defined by a distributed consensus network, heavy reliance on EEPROM-level data manipulation, and a unique integration of safety and security modules. For the master locksmith, Volvo presents a hierarchy of challenges ranging from the legacy P80 platform, which introduced the first rolling code transponders, to the modern Scalable Product Architecture (SPA) and Compact Modular Architecture (CMA), which utilize high-speed ethernet communication and advanced encryption standards like HITAG-AES.

This comprehensive research report serves as an exhaustive technical reference for the elite automotive security professional. It dissects the operational theory of Volvo’s proprietary immobilizer protocols, details the evolution of transponder technologies from fixed-code T5 chips to modern 128-bit encryption, and provides granular programming procedures for every major platform generation. Furthermore, this analysis integrates a comparative study of industry standards, contrasting Volvo’s protocols with the detailed specifications of German and Asian counterparts. By understanding the divergent engineering philosophies—such as Volvo’s storage of remote control data in the Upper Electronic Module (rearview mirror) on P2 platforms versus the integrated Body Domain Controllers of BMW—the locksmith gains the diagnostic intuition necessary to resolve complex "All Keys Lost" (AKL) scenarios, Central Electronic Module (CEM) failures, and Steering Column Lock (SCL) malfunctions.

The following sections detail the specific generations of Volvo platforms, the cryptographic imperatives of PIN code extraction via OBD vs. Bench methods, the mechanical nuances of the NE66 and HU101 keyways, and the specialized diagnostic procedures required for the sophisticated electronic ecosystem of the modern Swedish vehicle.

## Section 1: The Philosophy of Swedish Security Engineering

To master Volvo key programming, one must first possess a nuanced understanding of the underlying chassis platforms. In the Volvo universe, the "Platform" dictates everything: the location of the immobilizer data, the type of transponder required, the mechanical key profile, and the specific diagnostic protocol needed for communication. Unlike manufacturers who might mix and match systems across models (e.g., Ford using different PATS types on the same year F-150 and Focus), Volvo strictly adheres to platform-based electronic architectures.

The core philosophy of Volvo''s security engineering differs fundamentally from its contemporaries. While German manufacturers like Mercedes-Benz focused on the ignition switch (EIS) as the central security node, and American manufacturers like Ford focused on the Powertrain Control Module (PCM) or Instrument Cluster (HEC), Volvo adopted a distributed approach that heavily utilized the Central Electronic Module (CEM) as a gateway and data repository. This architectural decision has profound implications for the locksmith: it means that key data is rarely stored in a single, easily accessible location, and often requires synchronization between multiple modules located in physically disparate parts of the vehicle.

Furthermore, Volvo''s integration of "Safety" and "Security" means that components typically considered benign in other vehicles—such as the rearview mirror or the steering column lock—are integral nodes in the immobilization chain. A failure in the rearview mirror''s memory chip on a 2004 XC90 will not just prevent the driver from seeing behind them; it will disable the remote keyless entry system entirely. Understanding these interdependencies is the key to diagnostic success.

### 1.1 Platform Taxonomy and Identification

Correctly identifying the platform is the single most critical step in the locksmithing workflow. A misidentification can lead to the use of incorrect transponders, failed programming attempts, or even module corruption.

#### The P80 Platform (1993–2004)

The P80 platform represents the genesis of modern Volvo diagnostics and the transition from purely mechanical security to electronic immobilization. Debuting with the 850 and continuing through the S70, V70, and first-generation C70, this architecture established the baseline for European immobilization standards.

- Models: 850, S70, V70 (Gen 1), C70 (Gen 1), XC70 (Gen 1).
- Visual ID: Characterized by square, boxy dashboards, rigid instrument clusters, and mechanical odometers on early models.1
- Security Protocol: The system relies on the Megamos crypto logic (ID13/ID48 in later transition models) or Philips ID33/44 in early iterations.

#### The P2 Platform (1998–2014)

The P2 platform marked Volvo''s shift into the modern era of networked modules, introducing the Controller Area Network (CAN) as the backbone of vehicle operations. This is the most common platform encountered in the secondary market today.

- Models: S80 (Gen 1), S60 (Gen 1), V70 (Gen 2), XC70 (Gen 2), XC90 (Gen 1).
- Visual ID: Curvier aesthetic, distinctive "shoulders" on the door panels, and a centrally mounted CEM under the dashboard.
- Operational Theory: The CEM became the heart of the security system. On P2 vehicles, the CEM stores the transponder ID and the cryptographic keys required to authorize the start.2

#### The P1 Platform (2004–2013)

Developed during Ford’s ownership of Volvo, the P1 platform (also known as the Ford C1 platform) underpins the compact range. This architecture shares DNA with the Mazda 3 and Ford Focus but retains Volvo’s distinct security protocols.

- Models: S40 (Gen 2), V50, C30, C70 (Gen 2).
- Visual ID: "Waterfall" center console, ignition switch moved to the dashboard (key slot or knob), and compact dimensions.
- Ford Influence: While mechanically similar to Ford, the electronic security is purely Volvo. The CEM remains the gatekeeper, but the system introduced the notorious Steering Column Lock (SCL) module failure point.3

#### The P3 Platform (2007–2018)

Also known as the EUCD platform, P3 vehicles represent the "Golden Era" of complex locksmith work, introducing the Keyless Vehicle Module (KVM) and high-security encryption.

- Models: S80 (Gen 2), V70 (Gen 3), XC60 (Gen 1), S60 (Gen 2), V60.
- Visual ID: Modernized "Sensus" infotainment screens (early versions), electronic parking brakes standard, and often equipped with push-button start.
- KVM Introduction: The security logic is split. The CEM handles the physical key blade and transponder authentication for emergency starts, while the KVM (located in the trunk area) handles the passive entry and active search for the fob.4

#### The SPA and CMA Platforms (2015–Present)

The Scalable Product Architecture (SPA) and Compact Modular Architecture (CMA) define the current generation of Volvo vehicles.

- Models: XC90 (Gen 2), S90, V90, XC60 (Gen 2), XC40, C40.
- Visual ID: "Thor''s Hammer" LED headlights, large vertical touchscreens, and crystal gear selectors in high trims.
- High-Speed Security: These platforms utilize FlexRay and Ethernet communication, significantly increasing the data throughput and security complexity. The introduction of the iCUP (Android Automotive) system in later years added a Secure Gateway that blocks unauthorized OBD access.1

## Section 2: Transponder Chip Specifications and Management

The evolution of transponder technology in Volvo vehicles mirrors the industry''s march toward unbreakable encryption. A professional locksmith must maintain a specific inventory, as cross-compatibility between platforms is virtually non-existent. Unlike Toyota or Honda where chips can often be reused or generated easily, Volvo chips are often hard-locked to a specific configuration once programmed.

### 2.1 The Legacy Era: Fixed and Crypto Code (P80)

Early P80 vehicles used the Philips ID33 (Fixed) and ID44 (Crypto) chips. These carbon chips are robust but technologically obsolete.

- Identification: Reads as ID33 or ID44 on tools like the VVDI Key Tool Max or Autel XP400.
- Cloning: These are clonable onto T5 or PCF7935 generic chips. However, originating a key when all are lost often requires desoldering the 93C46 EEPROM from the immobilizer box located deep in the dash.5
- Nuance: The transition years (1998-1999) can be tricky. Some vehicles may exhibit characteristics of both P80 and P2 logic regarding transponder acceptance. A common issue is the "Immobilizer Light" flashing due to antenna ring failure, which is often misdiagnosed as a bad key.6

### 2.2 The Megamos Crypto Era (P2 Platform)

The ID48 Megamos Crypto is the definitive chip of the P2 era (S60, S80, XC90 up to 2014).

- Characteristics: A glass capsule containing a unique ID and a crypto key. Once programmed to a Volvo, the chip is "locked" and cannot be unlocked or reused on another vehicle using standard tools.
- Aftermarket Solutions: "Magic" ID48 chips (like the VVDI Super Chip XT27) can emulate a virgin Volvo ID48, allowing for generation and programming.7
- Critical Note: Unlike Volkswagen ID48 systems which use Component Security (CS) bytes derived from the cluster and ECU, Volvo''s implementation relies on a seed-key exchange directly with the CEM. The CEM stores the specific ID of the transponder. If the CEM is replaced without cloning the original EEPROM data, the existing keys will no longer start the vehicle.

### 2.3 The HITAG 2 Era (P1 and Early P3)

With the P1 platform (S40/V50/C30) and early P3s, Volvo transitioned to the Philips ID46 (PCF7936) family.

- Modes of Operation: The chip operates in "Password" mode. The CEM writes a specific secret key to the transponder''s memory pages during programming.
- Remote Integration: P1 keys typically integrate the remote circuit board and the transponder into a single unit (PCF7945), whereas P2 keys had them separate.8 This integration means that if the remote battery dies, the car should still start via induction, provided the coil on the PCB is intact.
- Market Difference: US market P1 vehicles operate at 315 MHz, while European models use 433 MHz. The transponder logic remains the same (ID46), but the remote frequency is strictly region-locked.

### 2.4 The HITAG 3 / Pro Era (Late P3 and SPA)

Modern Volvos (2016+) utilize HITAG Pro (ID47/49) and HITAG AES technologies.

- Security: These chips use 128-bit AES encryption, rendering traditional "sniffing" and cloning attacks obsolete without immense computing power or server-side calculation.
- The Sport Key: The "Tag" key (FCC ID: YGOHUF8423MS) uses the same transponder logic but is sealed in a waterproof housing. The internal battery is soldered and non-replaceable by design, leading to inevitable failure after 3-5 years. Professional locksmiths now offer services to carefully cut open these shells, replace the CR2032 battery, and reseal them, restoring functionality where the dealer would require a $400+ replacement and reprogramming.9
- Motion Sensing: Later iterations of SPA keys (post-2019) include motion sensors that put the key to sleep when stationary to prevent relay attacks. This can sometimes be mistaken for a dead battery by customers.

### 2.5 Comprehensive Transponder Reference Table

Platform

Model Years

Key Profile

Transponder Chip

Frequency (US/EU)

Typical Models

P80

1993–1998

NE66

ID44 (PCF7935)

N/A (Chip Only)

850, 940, 960

P80/P2

1999–2004

NE66

ID48 (Megamos)

315 / 433 MHz

S70, V70, S80, S60

P2

2005–2014

HU120/NE66

ID48 (Megamos)

315 / 433 MHz

XC90, XC70, S60

P1

2004–2013

HU101

ID46 (PCF7945)

315 / 433 MHz

S40, V50, C30, C70

P3

2007–2016

HU101

ID46 (PCF7953)

433 / 868 MHz

S80, V70, XC60, S60

SPA

2016–Present

HU101

ID47/49 (HITAG 3)

433 / 902 MHz

XC90 II, S90, XC60 II

CMA

2019–Present

HU101

ID49 (HITAG AES)

433 / 902 MHz

XC40, C40

## Section 3: The Central Electronic Module (CEM) – The Heart of the System

To control Volvo security is to control the CEM. In almost all post-2000 Volvo vehicles, the CEM is the primary gatekeeper of the security network. Unlike Ford’s PATS system which often resides in the cluster or ECU, or Nissan’s BCM which is easily accessible behind the glovebox, the Volvo CEM is often buried, heavily protected, and functionally complex.

### 3.1 P2 CEM Architecture and Failure Modes

The P2 CEM is located under the dashboard on the driver''s side (LHD). It is an L-shaped or rectangular box densely populated with relays and shunts.

- The Water Ingress Issue: A significant design flaw in the P2 platform''s cowl drain often directs water straight onto the CEM. This causes corrosion on the PCB and connector pins, leading to phantom electrical issues, intermittent no-start conditions, and immobilizer failures.2 Locksmiths encountering a "Key Error" on a P2 should always inspect the CEM for signs of water damage before condemning the key.
- Memory Storage: The CEM stores the "Car Configuration File" (CCF) and the immobilizer data. In older P2 models (1999-2004), the data is often in a 28F400 Flash chip. In newer P2 models (2005+), it relies on a Renesas MCU. Corrupting the CCF during a failed read/write attempt can "brick" the vehicle, turning it into a non-functional piece of metal.
- Removal Procedure: On P2 vehicles, removing the CEM is labor-intensive. It requires removing the wiper arms and the exterior cowl panel to access the mounting bolts from the outside of the vehicle, while disconnecting the massive wiring harness plugs from the inside.10 This dual-access requirement is unique to Volvo and adds significant labor time to any bench job.

### 3.2 P3 CEM Security: The Password Barrier

With the introduction of the P3 platform, Volvo implemented a secure access algorithm that significantly raised the bar for aftermarket programming. To program keys, the diagnostic tool must first "unlock" the CEM to gain security access.

- Password Reading via OBD: This process can take anywhere from 1 to 12 hours via OBD-II as the tool brute-forces the security key. Tools like the Lonsdor K518 and Autel IM608 connect to a server to calculate this password, speeding up the process, but it is still time-consuming.11
- Bench Reading: For faster access, or in AKL situations where the ignition cannot be turned on to wake the bus, the CEM must be removed. The processor (typically a Renesas M32C or similar MCU) is read directly on the bench. This bypasses the OBD speed limit but requires delicate soldering or the use of specialized solder-free adapters like the RN-01 board for Lonsdor.4
- Location: The P3 CEM is generally located behind the glovebox, often requiring the removal of the glovebox liner and several trim panels to access.

### 3.3 SPA/CMA CEM and the MPC Processor

The newest CEMs in SPA vehicles utilize robust MPC5xxx processors and are part of a high-speed FlexRay/Ethernet network.

- Security Evolution: Early SPA models (2016-2020) allowed for relatively easy pin code reading via OBD using server calculation. However, post-2021 models with the iCUP system (Android Automotive) have blocked many standard OBD exploits by implementing a Secure Gateway.
- VDASH Solution: The specialized software VDASH (by D5T5) has become the industry standard for decoding these newer CEMs. It uses a proprietary algorithm to crack the CEM PIN. For some models, this requires the vehicle to be connected to a stable power supply (12A+) for up to 24 hours for the initial decode.12 This "brute force" approach is reliable but necessitates having the car for an extended period.
- Hardware Variants: SPA CEMs come in different hardware variants. Some (like those with part numbers starting with 314xxxxx) are easier to decode than the newest variants (322xxxxx), which may require bench work or official VIDA access.

## Section 4: Programming Procedures and Tool Methodologies

This section synthesizes the workflows for the three most critical locksmithing scenarios: Adding a Key, All Keys Lost (AKL), and Remote Programming. It highlights the specific tool capabilities and limitations.

### 4.1 Scenario A: P2 Platform (2004 XC90) – Add Key

- The Challenge: The P2 platform separates the transponder and remote functions. The transponder (ID48) is programmed to the CEM. The remote (RKE) is programmed to the Upper Electronic Module (UEM), which is the rearview mirror.
- Aftermarket Limitation: Most aftermarket tools (Autel IM608, SmartPro, Zed-Full) can program the transponder to start the car (Immobilizer logic) but cannot program the remote portion on P2 vehicles. This is because they cannot access the UEM''s proprietary "seed" code required to pair the remote.13
- The Workaround:

1. Dealer Software (VIDA): Use Volvo VIDA with a J2534 DiCE interface. This requires a paid 3-day subscription (~$75) plus the software download fee per key (~$35). This is the only way to guarantee remote function on P2s using OEM protocols.
1. VDASH: Using VDASH with a DiCE unit allows for remote programming if you have the original packaging codes of the new remote. VDASH can write the remote configuration to the UEM if the code string is known.14
1. Cloning: If a working key exists, the locksmith can clone the ID48 transponder onto a glass chip using a VVDI Key Tool or similar. This starts the car but does not solve the remote issue.
1. Universal Remotes: Some advanced tools like the Xhorse VVDI Key Tool can generate a remote signal, but pairing it to a P2 Volvo UEM is notoriously difficult and often unsupported.

### 4.2 Scenario B: P3 Platform (2012 S60) – All Keys Lost

- System Types: P3 vehicles come in two main flavors: "Semi-Smart" (insert fob into dash slot to start) or "Full Smart" (Keyless Go / Proximity).
- Module Interdependence: The CEM (dash) and KVM (Keyless Vehicle Module, trunk) work in tandem.
- Procedure (Autel IM608 / Lonsdor K518):

1. Entry: Gain entry using Lishi HU101. The alarm will sound.
1. Silence Alarm: Disconnect the battery or pull the horn fuse to work in peace.
1. Remove CEM: Extract the CEM from behind the glovebox/dash area.
1. Read Security Data: Connect the programmer to the CEM EEPROM/MCU (usually a Renesas chip). Read the "Security Data" (Flash/EEPROM). This data contains the crypto keys.15
1. Calculate PIN: The tool uses the read data to calculate the security PIN (either locally or via server).
1. KVM Read (Crucial for Keyless): If the vehicle has proximity features ("Full Smart"), you must also remove the KVM from the right rear quarter panel (trunk area) and read its 9S12 MCU. If you only program the CEM, the car will start when the key is inserted in the slot, but the proximity functions (door open, push start with key in pocket) will fail.
1. Program: Reinstall modules. Connect the tool via OBD. Select "All Keys Lost." The tool uses the backed-up data to authorize the new key.
1. Verify: Test start and proximity functions. Ensure the "Volvo" logo on the dash appears, confirming authorization.

### 4.3 Scenario C: SPA Platform (2018 XC90) – Add Sport Key

- System: HITAG AES / High Security / Ethernet.
- Procedure:

1. Connection: Connect Autel IM608 Pro (with Ethernet adapter) or Lonsdor K518 Pro.
1. Health Check: Ensure battery voltage is >13.5V using a high-quality maintainer (e.g., Schumacher, Victron). SPA vehicles are extremely sensitive to voltage drops during programming and can drop communication, potentially bricking a module.
1. CEM Learning: The tool attempts to read the "Key Loading" password via OBD. On pre-2021 models, this is often successful but can take 1-4 hours. The dashboard may flash or go dark during this process.
1. Programming: Once the password is acquired, the tool prompts to place the new Sport Key in the cupholder (the designated RFID antenna spot).
1. Synchronization: The CEM writes the new key ID into its memory.
1. Key Resets: Unlike the hard-locked keys of the P2 era, used SPA keys from other vehicles can often be unlocked ("renewed") and reprogrammed to a new vehicle using specialized tools like the VVDI Key Tool Plus, making recycled keys a viable option.16

## Section 5: Mechanical Lock Systems and Lishi Procedures

While electronics dominate the conversation, the mechanical interface remains the primary entry point, especially in dead-battery situations. Volvo utilizes high-security laser-cut keys that require precision decoding.

### 5.1 The NE66 Keyway (P80 / Early P2)

- Profile: A 4-track internal key, sharing similarities with older Maserati and Ferrari keys.
- Lishi Tool: NE66.
- Picking Strategy: This lock is known for its stiffness. High tension is often required to bind the wafers. The wafers are prone to seizing in cold climates due to dirt ingress.
- Decoding: The NE66 Lishi allows for direct decoding. However, a critical nuance is that the door lock may not contain all the cuts necessary for the ignition (on models with ignition cylinders), necessitating code progression software (like InstaCode) to find the missing cuts.17

### 5.2 The HU101 Keyway (P1 / P3 / SPA)

This is the standard "Ford" keyway used across Land Rover, Volvo, and Ford.

- Profile: 2-track external high security.
- Lishi Tool: HU101 V3.
- Nuance: The "V3" update to the Lishi tool is critical. Older HU101 tools struggle with the specific tolerances of Volvo cylinders, which differ slightly from Ford''s. The V3 tool has narrower pick arms to fit the tighter keyway.
- Ignition vs. Door: On P1 cars, the ignition is often a plastic "dummy" slot that reads the fob; the mechanical blade is strictly for the door. On P3 and SPA vehicles, the mechanical blade is hidden inside the fob and is purely for emergency door access in the event of a dead vehicle battery.18
- Cutting: Requires a sidewinder/laser key cutting machine. The cuts are numbered 1-5.

### 5.3 The HU120 Keyway (Truck/Commercial)

Used primarily on heavy trucks (Volvo FH/FM series) and some specialized applications. This is rarely encountered in passenger vehicle locksmithing but is worth noting for those servicing fleets.

## Section 6: Critical Failure Points and Repair Strategies

Volvo vehicles suffer from specific, recurring immobilizer failures that locksmiths must distinguish from simple key issues. Misdiagnosing these can lead to unnecessary key programming attempts.

### 6.1 Steering Column Lock (SCL) Failure (P1 Platform)

The SCL on the P1 platform (S40/V50/C30) is notorious for mechanical failure.

- Symptoms: The key inserts, but the dashboard displays "Steering Locked – Try Again" or "Steering Lock Service Required." The car will not crank. The steering wheel remains locked or, in some cases, unlocked permanently.
- Mechanism: The SCL motor brushes wear out, or the internal microswitches fail. The CEM checks the SCL status via the LIN bus before authorizing a start. If the SCL doesn''t report "Unlocked," the start is inhibited.3
- The Fix:

1. Replacement: A new SCL from the dealer is expensive and requires online programming to the vehicle''s VIN.
1. Emulation: This is the preferred locksmith solution. An SCL Emulator (from vendors like MK3, MagicMotorsport, or various aftermarket sources) plugs directly into the SCL connector. It listens for the CEM''s "Unlock" command and digitally replies "Unlocked," bypassing the mechanical lock entirely.19 This is a permanent, plug-and-play fix that often requires no programming on many emulator versions (Plug & Play), restoring the vehicle to operation instantly.

### 6.2 CEM Water Damage (P2/P3)

- Diagnosis: Multiple random CAN bus errors, wipers turning on by themselves, alarm going off randomly, or "Immobilizer See Manual" messages on the cluster.
- Visual Check: The locksmith should inspect the CEM under the dash for white/green corrosion on the connectors. This is caused by blocked sunroof drains or cowl leaks.
- Repair: Professional cleaning with isopropyl alcohol and an ultrasonic bath can sometimes save the unit. If replacement is needed, the EEPROM data (93C86 or similar) must be cloned from the old unit to the donor unit to retain key data and vehicle configuration.20 Companies like XeMODeX offer specialized repair services for this exact issue.

### 6.3 KVM Sync Failure (P3)

- Symptoms: Remote buttons work, but Keyless Go (Proximity) does not. The car starts if the key is inserted in the slot, but the dashboard says "Key Not Found" if the key is just in the pocket.
- Cause: The synchronization code between the CEM and KVM has drifted, or the KVM data is corrupted.
- Fix: Requires re-synchronizing the modules. This can be done using a tool like Pelican Diagnostics services or VDASH. Sometimes, deleting all keys and reprogramming them forces the system to re-sync the KVM and CEM.21

## Section 7: The Tooling Landscape – A Comparative Analysis

No single tool covers every Volvo scenario perfectly. The professional must maintain a diverse arsenal.

### 7.1 VDASH (D5T5)

- Role: The specialist''s weapon. Created by Volvo enthusiasts, it offers capabilities even the official VIDA tool lacks, such as retrofitting features (remote start, navigation) and deep PIN decoding.
- Pros: Can decode P3 and SPA PINs via OBD (though it takes time), manage configuration files (CCF), and pair used modules. It is often the only aftermarket solution for P2 remote programming if codes are known.
- Cons: Requires a Windows PC and a J2534 interface (DiCE). Not a standalone handheld tool. It operates on a subscription/credit-based model.22

### 7.2 Lonsdor K518 Pro / ISE

- Role: The Keyless King. Lonsdor was first to market with reliable Volvo P3/SPA keyless programming and remains a leader in this specific niche.
- Pros: Comes with dedicated adapters (RN-01, FS-01) for solder-free reading of CEM/KVM on P3s. Strong coverage for 2022+ models with its "Super Update" license.23 The "Lonsdor Volvo License" is often a separate purchase but highly valuable.
- Cons: Documentation can be sparse ("Chinglish"). Requires annual updates to maintain the latest protocols.

### 7.3 Autel IM608 Pro II

- Role: The All-Rounder. The standard for general automotive locksmithing.
- Pros: Excellent guided diagrams for bench connections. Good coverage for P2 (Transponder only) and P3. Can handle most SPA keys via OBD or bench.
- Cons: Password calculation on P3 can be very slow via OBD compared to bench reading. Heavy reliance on server connection and active subscription.24

### 7.4 Proprietary/Dealer (VIDA)

- Role: The Final Resort.
- Pros: 100% reliability for programming. The only way to program P2 remotes officially without packaging codes.
- Cons: Expensive subscriptions (3-day, 30-day, etc.). Requires an authorized dealer account for security downloads (NASTF VSP credential required in the US). Restrictive regarding used modules.

## Section 8: Future Technologies and the iCUP Barrier (2022+)

The introduction of the iCUP (Infotainment Connectivity Unit Program), based on Android Automotive OS, marks a paradigm shift in Volvo security.

- The Firewall: iCUP vehicles feature a Secure Gateway that blocks unauthorized CAN injection and OBD access. Unlike the FCA Secure Gateway (which has AutoAuth), Volvo''s implementation is stricter and often requires physical bypasses.
- VGM Pin: Accessing diagnostic functions now requires a VGM (Vehicle Gateway Module) PIN in addition to the standard CEM PIN.
- Current State (2025): Tools like Lonsdor are beginning to crack this with updates that support 2023+ models via specific adapter cables that bypass the gateway physically, connecting directly to the CAN lines of the KVM or CEM.23 The industry is moving toward "Server-to-Server" authentication where the tool must authenticate with Volvo''s servers to gain access, pushing independent locksmiths toward official NASTF credentials.

## Section 9: Quick Reference Guides

### 9.1 Emergency Key Blade Reference

Platform

Keyway

Lishi Tool

Cut Series

Notes

P80

NE66

NE66

1-4 depths

4-track internal. Often worn.

P2

NE66

NE66

1-4 depths

Difficult to pick due to dirt/wear.

P1

HU101

HU101 V3

1-5 depths

"Laser" track. Door lock only.

P3

HU101

HU101 V3

1-5 depths

Emergency blade hidden inside fob.

SPA

HU101

HU101 V3

1-5 depths

Emergency blade separate or internal.

### 9.2 Battery Reference & Replacement Notes

Key Type

Battery

Replacement Difficulty

Notes

P2 Switchblade

CR2032

Easy

Snap cover. Observe polarity.

P1 Smart Key

CR2032

Easy

Slide cover.

P3 5-Button

CR2430 (x2)

Moderate

Slide mechanism can be stiff.

P3 6-Button (PCC)

CR2430 (x2)

Moderate

Often requires re-sync after change.

SPA Silver/Black

CR2032

Easy

Twist lock mechanism.

SPA Sport (Tag)

N/A (Sealed)

Hard

Sealed unit. Requires cutting shell to replace (CR2032).9

## Conclusion

The locksmithing landscape for Volvo vehicles is defined by a steep learning curve and a high barrier to entry regarding equipment and knowledge. Unlike Japanese or Domestic vehicles where a single tool and a box of generic keys often suffice, the Volvo professional must carry a suite of programmers (Autel, Lonsdor, VDASH), mechanical decoders (Lishi), emulation hardware (SCL emulators), and a variety of platform-specific transponders.

The divide between the "Legacy" P2 platform—with its mirror-based remote storage—and the "Modern" SPA platform—with its high-speed ethernet and waterproof sport keys—illustrates the breadth of knowledge required. Success in this niche requires not just the ability to cut a key, but the capacity to diagnose complex network failures (like CEM corrosion), clone EEPROM data to salvage modules, and navigate the proprietary digital architectures of Gothenburg''s engineers. As Volvo moves toward full electrification and Android-based systems, the reliance on server-side decoding and physical gateway bypasses will only increase, cementing the need for continuous education and specialized tooling for the serious automotive locksmith.

Disclaimer: This guide is for professional educational purposes only. Protocols for security bypass are proprietary to the manufacturer and subject to change via firmware updates. Always adhere to NASTF guidelines and local laws regarding vehicle access.

Works Cited:

.1

#### Works cited

1. VOLVO platforms - D5T5.com, accessed December 11, 2025, https://d5t5.com/article/volvo-platforms
1. Deep Delve: Central Electronic Module (CEM) for 2005+ P2 Platform Volvos - XeMODeX, accessed December 11, 2025, https://xemodex.com/blog/deep-delve-central-electronic-module-cem-for-2005-p2-platform-volvos/
1. P1 Volvo Steering Column Lock Failure - FCP Euro, accessed December 11, 2025, https://www.fcpeuro.com/blog/p1-volvo-steering-column-lock-failure
1. Volvo-S60 smart key-Full Keyless -Help File, accessed December 11, 2025, https://www.lonsdork518.com/info/volvo-s60-smart-key-full-keyless-help-file-17110.html
1. uue mootori panek!!! - Volvo Club Eesti, accessed December 11, 2025, http://volvoclub.ee/foorum/viewtopic.php?t=29409
1. Ignition immobilizer antenna ring replacement on a Volvo S70, V70, XC70, etc. Error code P1057- VOTD - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=xQ8Gl1NmjX4
1. Xhorse VVDI Super Chip 50Pcs Bundle XT27A01 XT27A66 Clonable Transponder Chip For ID46 4D 8C 8A 47 - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/xhorse-vvdi-super-chip-50pcs-super-chip-xt27a01-xt27a66-4696-50
1. Volvo P2 keys and remotes explained - D5T5.com, accessed December 11, 2025, https://d5t5.com/wiki/wiki/article-volvo_P2_keys_and_remotes_explained?do=shareModal
1. Volvo Cars How-To: Remove Key Blade And Replace Battery - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=ig425ySRAEI
1. How to Remove a Wiper Blade Arm when it''s Seized on. - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=bx6vHZwCUkE
1. Volvo_Learn_Keys, accessed December 11, 2025, https://smokftp.smok.com.pl/Manual/Volvo_Learn_Keys.pdf
1. CEM PIN - car configuration - D5T5.com, accessed December 11, 2025, https://d5t5.com/article/volvo-cem-pin-code?query=cem+pin&do=shareModal
1. Volvo P2 keys and remotes explained - D5T5.com, accessed December 11, 2025, https://d5t5.com/article/volvo_P2_keys_and_remotes_explained
1. Volvo P2 ignition & remote key 434MHz / 315MHz - D5T5.com, accessed December 11, 2025, https://d5t5.com/eshop/detail/240/volvo-p2-ignition-remote-key-434mhz-315mhz
1. Lonsdor K518ISE Program VOLVO XC60 Smart Key, accessed December 11, 2025, https://www.lonsdork518.com/service/lonsdor-k518ise-program-volvo-xc60-key-11.html
1. diy SPA sport keys from aliexpress : r/Volvo - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Volvo/comments/14vjz7i/diy_spa_sport_keys_from_aliexpress/
1. Volvo Transponder Key Shell NE66 with Chip Holder - Key4, accessed December 11, 2025, https://www.key4.com/transponder-key-shell-volvo-ne66-chip-holder
1. XC60 Keys | Volvo Support EN-TH, accessed December 11, 2025, https://www.volvocars.com/en-th/support/car/xc60/article/577d3f25a03174c9c0a801516c820a72/
1. VOLVO ESL/ELV/SCL - Goldcar Keys, accessed December 11, 2025, https://goldcarkeys.com/wp-content/uploads/volvo-esl-sos.pdf
1. Can I save my CEM? : r/Volvo - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Volvo/comments/1etnczx/can_i_save_my_cem/
1. VOLVO CEM ECU Synchronisation Service. Free Quick Delivery - Pelican diagnostics, accessed December 11, 2025, https://pelicandiagnostics.uk/product/volvo-cem-ecu-synchronisation-ecu/
1. CEM PIN - car configuration - D5T5.com, accessed December 11, 2025, https://d5t5.com/article/volvo-cem-pin-code
1. Update【January 25, 2024】Lonsdor K518 Series Update 2023- Volvo Key Programming, accessed December 11, 2025, https://www.lonsdork518.com/info/lonsdor-k518-update-2023-volvo-immo.html
1. Volvo XC90 Smart Key Programming (2016–2021) | Autel IM608 Pro II + EEPROM + OBD, accessed December 11, 2025, https://www.youtube.com/watch?v=L9uxbaa0o2Q
1. DIY CEM (and VGM) PIN Retrieval for Volvo and Polestar - OrBit Forums, accessed December 11, 2025, https://forums.spaycetech.com/showthread.php?tid=2&pid=1462
1. Volvo PIN codes explained - D5T5.com, accessed December 11, 2025, https://d5t5.com/article/volvo_pin_codes_explained
1. VOLVO Transponder Catalog | PDF - Scribd, accessed December 11, 2025, https://www.scribd.com/document/669369337/VOLVO-Transponder-Catalog
1. Volvo P1, P2, P3, & SPA Platforms Explained - FCP Euro, accessed December 11, 2025, https://www.fcpeuro.com/blog/volvo-p1-p2-and-p3-whats-it-all-mean
1. What to Do If You Lose Your Volvo Key Fob, accessed December 11, 2025, https://www.volvocarsmissionviejo.com/blog/what-to-do-if-i-lose-my-volvo-key
1. S60 Keys | Volvo Support LB, accessed December 11, 2025, https://www.volvocars.com/lb/support/car/s60/article/577d3f25a03174c9c0a801516c820a72/
1. Lonsdor K518ISE Program Volvo S60 Smart Key, accessed December 11, 2025, https://www.lonsdork518.com/service/lonsdor-k518ise-program-volvo-s60-smart-key-10.html', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('BMW Locksmith Guide Development (1)', 'BMW', 'General', 2010, 2024, '

# BMW PROFESSIONAL LOCKSMITH PROGRAMMING GUIDE

Global Market Coverage: 1995–2025

Comprehensive Technical Reference for Immobilizer Systems, Key Programming, Diagnostics, and Module Repair

⚠ CONFIDENTIAL DOCUMENT - FOR PROFESSIONAL LOCKSMITH & DIAGNOSTIC USE ONLY

Updated: December 2025

## TABLE OF CONTENTS

Section 1: The Philosophy of BMW Security Architecture

- 1.1 The Evolution of Theft Prevention: From EWS to Cloud Authorization
- 1.2 Understanding the "Triangle of Security": Key, Immobilizer, and DME
- 1.3 The Role of the Individual Serial Number (ISN) and Rolling Codes
- 1.4 Critical Safety Protocols: Voltage Stabilization and Flash Protection

Section 2: The EWS Era (1995–2006) – System Deep Dive

- 2.1 EWS 1 & 2: The Birth of Rolling Codes
- 2.2 EWS 3 (3.2, 3.3, 3.D): K-Line Communication and MCU Logic
- 2.3 EWS 4: The Introduction of Secured MCUs (2L86D)
- 2.4 Mechanical Key Decoding: HU58 Profile Analysis and Lishi Operations

Section 3: The CAS Era (2002–2014) – System Deep Dive

- 3.1 CAS1 (E65): The Transition to CAN-BUS and Slot Keys
- 3.2 CAS2 (E60/E90): Refinement of the White Box System
- 3.3 CAS3 & CAS3+ (E-Series): Encryption, ISTA-P, and Flash Downgrading Risks
- 3.4 CAS4 & CAS4+ (F-Series): The Move to 5M48H MCUs and Bench Security
- 3.5 Mechanical Key Decoding: HU92 Profile Analysis and Twin-Lifter Procedures

Section 4: The FEM/BDC Era (2012–2019) – System Deep Dive

- 4.1 Architectural Shift: Integrating Security into Body Control
- 4.2 The "Preprocessing" Workflow: Why Service Mode is Mandatory
- 4.3 EEPROM Management: 95128/95256 Chip Handling and Data Integrity
- 4.4 Mechanical Key Decoding: HU100R Profile Analysis and Reverse Logic

Section 5: The G-Series Era (2018–Present) – BDC2, BDC3, and Cloud Security

- 5.1 BDC2 Architecture: Enhanced Encryption and Bench Requirements
- 5.2 BDC3 & Cloud Analysis: The Shift to Server-Side Calculation
- 5.3 The "All Keys Lost" Problem: Bosch MD1/MG1 DME Locking
- 5.4 Digital Keys and Ultra-Wideband (UWB) Technology

Section 6: Transponder Technology and Remote Frequency Management

- 6.1 Chip Evolution: From PCF7935 to 128-bit AES Hitag Pro
- 6.2 Frequency Distribution: 315MHz vs. 434MHz vs. 868MHz
- 6.3 FCC ID Cross-Reference and OEM Part Number Guide
- 6.4 Rechargeable vs. Replaceable Batteries: VL2020 vs. CR2032/CR2450

Section 7: Comprehensive Tool Methodologies and Walkthroughs

- 7.1 Autel MaxiIM IM608 Pro II / IM508S: OBD Mastery and Limitations
- 7.2 Xhorse Ecosystem: VVDI2, Key Tool Plus, and Bench Adapters
- 7.3 Yanhua Mini ACDP: The Solder-Free Interface Board Revolution
- 7.4 Specialized EEPROM Tools: AK90+, VVDI Prog, and HexTag

Section 8: Detailed Operational Procedures (Step-by-Step)

- 8.1 Procedure: EWS3 All Keys Lost using AK90+ (Bench)
- 8.2 Procedure: CAS3+ ISTA-P Add Key via OBD (Flash Downgrade)
- 8.3 Procedure: CAS4+ All Keys Lost (Bench Read with XP400/ACDP)
- 8.4 Procedure: FEM/BDC Key Learning with Preprocessing
- 8.5 Procedure: G-Series BDC3 Add Key via OBD (Cloud Calculation)

Section 9: Advanced Diagnostics: ISN Reading and Module Synchronization

- 9.1 The Hierarchy of ISN: Short (4-byte) vs. Long (16/32-byte)
- 9.2 Bench Reading DMEs: MSD80, MSV90, N20, B48, B58
- 9.3 Synchronization: Realigning CAS-ELV and CAS-DME Rolling Codes

Section 10: Module Repair, Recovery, and Cloning

- 10.1 FRM3 Repair: Restoring Corrupted Partition Data (D-Flash/EEE)
- 10.2 CAS3+ Unbricking: Recovering from Failed Flash Downgrades
- 10.3 ELV Emulation: Bypassing the Electronic Steering Lock

Section 11: Pricing Strategy, Risk Management, and Decision Matrices

## SECTION 1: THE PHILOSOPHY OF BMW SECURITY ARCHITECTURE

### 1.1 The Evolution of Theft Prevention

To professionally service BMW vehicles, a locksmith must first understand the engineering philosophy that drives the brand''s security architecture. Unlike manufacturers that rely on static PIN codes (like Hyundai/Kia) or timed access delays (like Ford), BMW''s security strategy is built upon a complex, synchronized "handshake" between multiple control modules. This architecture has evolved through four distinct epochs: the EWS (Electronic Drive Away Protection), the CAS (Car Access System), the FEM/BDC (Front Electronic Module / Body Domain Controller), and the modern G-Series/Cloud era.

In the mid-1990s, the introduction of EWS marked a departure from simple mechanical locks to electronic verification. By separating the transponder reading from the engine management authorization, BMW created a system where physically turning the ignition lock was insufficient to start the vehicle. This philosophy—that "authorization" is separate from "actuation"—has remained the core tenet of BMW security, culminating in modern systems where the key does not mechanically interact with the car at all, but rather authorizes the Body Domain Controller to wake up the vehicle''s bus systems.1

### 1.2 Understanding the "Triangle of Security"

Every BMW immobilizer system functions on a triangular relationship between three critical components. A failure or mismatch in any leg of this triangle results in a "crank, no-start" or "no-crank" condition.

1. The Key (Transponder): Contains a fixed ID and a variable cryptographic code (rolling code or ISN-derived password). The key must prove its authenticity to the Immobilizer Module.
1. The Immobilizer Module (EWS/CAS/FEM/BDC): This is the gatekeeper. It energizes the key coil, reads the transponder data, checks it against its internal "allow list" (Key Slots 1-10), and if valid, releases the terminal voltage (Terminal 15/50) to the starter. Crucially, it then sends a specialized authorization code (ISN) to the engine computer.
1. The Engine Control Unit (DME/DDE): The Digital Motor Electronics (Gas) or Digital Diesel Electronics receives the ISN from the immobilizer. It compares this ISN against its own internal memory. If—and only if—the ISN matches, the DME enables the fuel injectors and spark plugs.2

This interaction explains why a "used" ECU from a junkyard will not start a BMW. The used ECU contains the ISN from the donor car, which does not match the ISN stored in the recipient car''s CAS module. Professional locksmithing on BMWs is largely the art of reading, managing, and synchronizing these ISN codes.

### 1.3 The Role of the Individual Serial Number (ISN) and Rolling Codes

The ISN is the cryptographic "password" that links the Immobilizer to the DME.

- Early Systems (EWS): Used a 4-digit rolling code. The EWS and DME would agree on a starting code, and every time the car started, this code would "roll" forward mathematically. If the battery died during cranking, the codes could roll out of sync, requiring a diagnostic "Realignment".3
- Middle Systems (CAS3): Introduced a static 4-byte (Short) or 16-byte (Long) ISN. This was more stable but required precise extraction to program keys in "All Keys Lost" scenarios.
- Modern Systems (CAS4/FEM/G-Series): Use a 32-byte (128-bit) ISN. This is cryptographically secure and cannot be brute-forced. It must be extracted by reading the physical memory of the DME or the Immobilizer.4

### 1.4 Critical Safety Protocols: Voltage Stabilization

Before touching a BMW with any programming tool, the most critical step is Voltage Stabilization. BMW modules, particularly the CAS3+ and FEM, are notoriously sensitive to voltage fluctuation.

- The Risk: During key programming, the diagnostic tool often erases the module''s firmware (Flash) to rewrite it with unlocked data ("Flash Downgrading"). This process can take 10-20 minutes. If the vehicle''s voltage drops below 12.5V during this write cycle, the bootloader can corrupt, leaving the module "bricked"—unresponsive and dead.6
- The Solution: Never use a standard battery charger or jumper cables. You must use a dedicated Power Supply Unit (PSU) capable of maintaining a clean, ripple-free 13.6V to 14.2V at up to 50-70 Amps. This ensures the modules remain fully powered and stable throughout the programming session.7

## SECTION 2: THE EWS ERA (1995–2006) – SYSTEM DEEP DIVE

The EWS system is the foundation of BMW locksmithing. While older, these vehicles (E46 3-Series, E39 5-Series, E53 X5) are still common on the road and offer high-profit margins because many generic locksmiths cannot handle the bench work required.

### 2.1 EWS 1 & 2: The Birth of Rolling Codes

- EWS 1 (1994-1995): This was a primitive system that functioned essentially as a starter kill relay. It monitored the door locks and the general module. The keys often used simple multi-track milling but lacked sophisticated transponder logic.
- EWS 2 (1995-1997): This system introduced the dedicated EWS module (white box with a yellow connector) and the key transponder (PCF7930/7931). The key sends a fixed code and a rolling code to the EWS. The EWS validates the key and then sends a signal to the DME to enable fuel/spark. This generation is robust but prone to rolling code desynchronization if the battery is low.9

### 2.2 EWS 3 (3.2, 3.3, 3.D): K-Line Communication

Found in the ubiquitous E46 3-Series and E53 X5, EWS 3 is the most common variant encountered today.

- Module Identification: A white or black box, usually located under the driver''s side dashboard (above the pedals) or behind the glovebox (in the X3). It uses a Motorola MC68HC11EA9 or similar MCU.10
- Operation: The EWS 3 module stores the odometer reading and the Vehicle Identification Number (VIN) in addition to key data. It communicates via the K-Line diagnostic protocol.
- Programming Limitation: While some tools claim OBD support for EWS3, it is notoriously unreliable. The "K-Line" speed is slow and unstable for writing key data. The professional standard is Bench Programming using an AK90+ or VVDI Prog.

### 2.3 EWS 4: The Introduction of Secured MCUs

Towards the end of the E46/X3 production run (2004-2006), BMW introduced EWS 4.

- The Challenge: Externally, the module looks identical to EWS 3. Internally, it uses a secured Motorola MCU with the mask 2L86D.
- The Solution: This MCU has "Secured" memory sectors that cannot be read by a simple clip. To read an EWS 4 module, the locksmith must solder four wires to specific test points on the back of the circuit board (BKG, VCC, GND, RESET) to bypass the security lock. Using a standard EWS3 clip on an EWS4 module will result in a "Pin Touch" error or a bad read.11

### 2.4 Mechanical Key Decoding: HU58 Profile

Before the widespread adoption of the laser-cut key, BMW used the HU58 profile.

- Structure: A 4-track external key. It has two tracks on the top edge and two on the bottom edge.
- Lishi Tool: HU58 (2-in-1). This is widely considered one of the most difficult automotive locks to pick due to the spring tension and the sheer number of wafers (12 positions).
- Decoding: The locksmith must decode both the A-axis and B-axis. Accurate decoding is critical because the 4-track system has very tight tolerances. Cutting this key requires a standard side-mill duplicator or a CNC machine capable of "shoulder gauging" the blank.13

## SECTION 3: THE CAS ERA (2002–2014) – SYSTEM DEEP DIVE

The Car Access System (CAS) represents the "Golden Age" of BMW locksmithing. It integrated the remote control receiver, immobilizer, and ignition switch logic into a single unit. Understanding the specific generation of CAS is the difference between a 10-minute OBD job and a bricked module.

### 3.1 CAS1 (E65): The Transition to CAN-BUS

- Vehicle: E65 7-Series (2002-2008).
- Key Type: The first "Slot Key" or "Smart Key" (Rectangular fob).
- Architecture: CAS1 moved the security data from the K-Line to the faster CAN-BUS network. However, the remote control functions in early E65s were sometimes handled by a separate antenna module, meaning programming the transponder did not always automatically program the remote.
- Programming: CAS1 can be done via OBD, but it is often safer to read the module on the bench due to the age and volatility of the E65''s electrical system.14

### 3.2 CAS2 (E60/E90 Early)

- Vehicles: Early E60 5-Series and E90 3-Series (up to ~2006).
- Key Type: "Semi-Smart" Slot Key (often white casing on the module).
- Advancement: CAS2 fully integrated the remote functions. Once the transponder is programmed and the key is inserted into the slot, the remote usually syncs automatically or requires a manual button-press sequence (Hold Unlock, press Lock 3 times).15
- Tooling: Fully supported via OBD by Autel IM608, VVDI2, and others. Bench reading is rarely required unless All Keys Lost (AKL) fails via OBD.16

### 3.3 CAS3 & CAS3+ (The Industry Standard)

This is the most common system.

- CAS3 (2006-2008): Unencrypted. Keys can be added via OBD quickly.
- CAS3+ (2008-2012): Encrypted. The MCU firmware (Mask 0L15Y/0M23S) is locked.
- The "Flash Downgrade": To add a key to a CAS3+ via OBD, the tool must first bypass the encryption. It does this by erasing the current "secure" firmware and writing an older, vulnerable version ("Flash Downgrade").

- Risk: This process takes 8-15 minutes. If voltage drops or the cable disconnects, the CAS flash becomes corrupted. The car will be dead—no dash lights, no ignition.
- Mitigation: Always use a PSU (13.6V). If the module bricks, tools like Xhorse Key Tool Plus or Autel IM608 have a "Repair CAS" function that attempts to rewrite the flash. If that fails, bench recovery (writing a good EEPROM/Flash dump) is the only fix.6

### 3.4 CAS4 & CAS4+ (F-Series)

With the F-Series (F10, F01), BMW introduced CAS4.

- Module Location: Usually located under the dash, above the driver''s footwell.
- CAS4 (White Case): Uses the Motorola 9S12XDP512 MCU. Often unencrypted.
- CAS4+ (Black Case): Uses the 9S12XEP100 MCU (Mask 5M48H or 1N35H). Encrypted.
- Programming Strategy: While some tools claim OBD support, it is extremely risky. The professional standard is Bench Reading.

- Method: Remove the CAS4 module. Use a solder-free adapter (like ACDP Module 1 or Godiaq Test Platform) to read the D-Flash (Data) and P-Flash (Program).
- Process: The tool decrypts the data, extracts the ISN, and generates a new key file. This file is then written to a new blank key. The modified D-Flash does not usually need to be written back to the car for "Add Key," but is required for "All Keys Lost" to disable old keys.18

### 3.5 Mechanical Key Decoding: HU92

- Profile: 2-Track Internal. Used on almost all E-Series vehicles.
- Lishi Tool: HU92 (Twin Lifter) is strongly recommended over the Single Lifter. The Twin Lifter allows for more independent control of the wafers.
- Decoding Rule:

- Twin Lifter: Decode in the SAME direction you picked.
- Single Lifter: Decode in the OPPOSITE direction you picked.
- This confusion is the #1 cause of miscut HU92 keys. Always verify which tool version you are using.20

## SECTION 4: THE FEM/BDC ERA (2012–2019) – SYSTEM DEEP DIVE

The F30 3-Series marked the end of the CAS module. Security was integrated into the Front Electronic Module (FEM), while X-Series vehicles used the Body Domain Controller (BDC). These modules are structurally identical regarding key programming.

### 4.1 Architectural Shift

Unlike CAS, where the key data lived in a separate EEPROM, FEM/BDC key data is tightly integrated with the module''s gateway and lighting functions. The security data is encrypted and distributed between the MCU and a 95128/95256 EEPROM chip.

### 4.2 The "Preprocessing" Workflow

Programming a key to a FEM/BDC vehicle is not a simple "Add Key" click. The module must be "Preprocessed" (put into Service Mode) to accept new data. This is a multi-step surgery:

1. Backup Coding: Read the module''s coding data via OBD. This controls window auto-up, headlights, etc. If you lose this, the car starts but the windows won''t work.
1. EEPROM Manipulation:

- Remove the FEM from the car.
- Locate the 95128/95256 8-pin EEPROM chip on the PCB.
- Read the EEPROM data (Bench).
- The tool generates a modified "Service File." Write this file back to the EEPROM.

1. Flash Update: Reinstall the FEM to the car (or test platform). The tool will now "Flash" the MCU. The Service EEPROM file allows the tool to bypass the security lock during this flash.
1. Restore: Once the MCU is unlocked, write the Original EEPROM file back to the chip.
1. Key Learning: Now, and only now, can the tool learn a new key via the induction coil on the steering column.22

### 4.3 EEPROM Management

- Solder vs. Clip: Most failures occur here. The 95128 chip is coated in conformal coating (varnish). If you do not clean this off perfectly, a clip adapter will get a bad read.
- Recommendation: Many professionals prefer Yanhua ACDP Module 2, which uses a specialized pressure socket that clamps onto the chip without soldering, avoiding the risk of overheating the adjacent components or lifting traces.24

### 4.4 Mechanical Key Decoding: HU100R

- Profile: F-Series and G-Series use the HU100R.
- Difference from GM: It is the "Reverse" of the GM HU100. The cuts are on the opposite side of the track spine.
- Picking: These locks utilize variable wafers and can feel "mushy." Heavy tension often binds the lock; extremely light tension is required to feel the wafer states.
- Decoding: Direct read depths 1-4. The key code series is often available on the door lock cylinder itself if removed, but picking is faster.25

## SECTION 5: THE G-SERIES ERA (2018–PRESENT)

The G-Series introduced the BDC2 and BDC3 modules, representing the hardest challenge currently facing locksmiths.

### 5.1 BDC2 Architecture

Found in early G-chassis (G30 5-Series, G11 7-Series).

- Structure: Similar to FEM/BDC but with updated encryption.
- Bench Support: Tools like ACDP Module 38 and Xhorse Key Tool Plus can perform "Add Key" on the bench without opening the module, using interface boards.
- Limitation: For All Keys Lost, you typically need the ISN from the Engine (DME).

### 5.2 BDC3 & Cloud Analysis (2019+)

Found in G20 (3-Series), G05 (X5), and newer models.

- The Hurdle: BDC3 firmware is locked down. Traditional preprocessing often fails or is blocked.
- The Solution: Autel and other manufacturers have introduced "Cloud Calculation" solutions. By connecting the tool to the internet, the software uploads the encrypted data to a server which calculates the "Key Password."
- Cost: This is often a paid service. Autel charges an annual subscription or per-VIN fee (approx. $120) for G-Series Add Key calculation capabilities.27

### 5.3 The "All Keys Lost" Problem: Bosch MD1/MG1

For AKL on a G-Series, you need the ISN from the DME.

- The Problem: Newer Bosch MD1 and MG1 ECUs (produced after June 2020) have a "Bench Lock" that prevents reading the ISN via standard bench tools.
- The Workaround: Currently, there is no easy OBD solution for AKL on 2021+ G-Series. The DME often must be sent to a specialist tuner (like FEMTO in Finland) for unlocking, or the dealer must order a key.29

## SECTION 6: TRANSPONDER TECHNOLOGY AND REMOTE FREQUENCY

### 6.1 Chip Evolution

- PCF7935 (ID44): EWS era. Robust, rewriteable.
- PCF7945 (ID46): CAS1-3 era. The "Hi-Tag 2" chip. Extremely common.
- PCF7953 (ID49): CAS4/FEM/BDC era. "Hi-Tag Pro" (Hitag 3). Uses 128-bit AES encryption.
- NCF2951: G-Series. Advanced version of ID49.

### 6.2 Frequency Distribution

- 315 MHz: Standard for USA, Canada, Japan (mostly).
- 434 MHz (433.92): Standard for Europe, UK, Australia, Asia, Middle East.
- 868 MHz: Used in specific Continental European markets (e.g., Germany) for CAS3 systems to reduce interference.
- Check: Never guess. Use a frequency tester (Key Tool Max) on the original key. If no key exists, check the VIN decoder or the markings on the antenna amplifier (usually in the C-pillar).30

### 6.3 FCC ID Cross-Reference and OEM Part Numbers

Chassis

System

Key Style

Frequency

FCC ID

Chip

E90/E60

CAS3

Smart (CA)

315 MHz

KR55WK49127

ID46

E90/E60

CAS3

Slot (Non-CA)

315 MHz

KR55WK49123

ID46

F10/F01

CAS4

Smart 4-Btn

315 MHz

YGOHUF5662

ID49

F10/F01

CAS4

Smart 4-Btn

434 MHz

YGOHUF5767

ID49

F15/F30

FEM

Smart 4-Btn

315 MHz

YGOHUF5662

ID49

F15/F30

FEM

Smart 4-Btn

434 MHz

NBGIDGNG1

ID49

G20/G05

BDC3

Blade Smart

434 MHz

N5F-ID21A

NCF2951

Note: CAS4 and FEM keys often look identical. An unlocked CAS4 key cannot be programmed to a FEM car. Always check the board ID or buy "Universal" keys (like Autel IKEY or Xhorse XM38) that can be generated for either.32

## SECTION 7: COMPREHENSIVE TOOL METHODOLOGIES

### 7.1 Autel MaxiIM IM608 Pro II / IM508S

- Strengths: Best guided interface ("Expert Mode" vs "Smart Mode"). Excellent diagrams for connection points.
- Weaknesses: High risk of bricking CAS3+ if voltage is unstable. G-Series functions are expensive add-ons.
- Essential Accessories:

- XP400 Pro: Mandatory for reading keys and infrared Mercedes keys.
- G-BOX3: Required for fast password calculation on CAS4 and bench DME reading (reduces time from 30 mins to <5 mins).34
- APB112: Smart key simulator, useful for AKL data collection.

### 7.2 Xhorse Ecosystem

- VVDI2: The legendary tool for BMW. Extremely stable on CAS1-3 via OBD. Good file maker functions.
- Key Tool Plus: The tablet version. Integrates VVDI2, VVDI Prog, and MB tool. Excellent for bench reading due to integrated pin detection.
- Tokens: Xhorse uses a token system for some online calculations (mostly Mercedes, but occasionally complex BMW functions).

### 7.3 Yanhua Mini ACDP

- The "Solder-Free" King: ACDP''s selling point is its "Module" system using interface boards.

- Module 1 (CAS): Clamps over the MCU. No soldering wires.
- Module 2 (FEM): Clamps over the 95128/95256 chip.
- Module 3 (ISN): Plugs directly into the DME connector pins.

- Verdict: This is the safest tool for FEM/BDC and CAS4. It removes human error (bad soldering) from the equation.24

### 7.4 AK90+ (EWS Specialist)

- Role: Do not underestimate this $40 tool. It is often more reliable for reading EWS3 MCUs than tools costing $3,000. It is a pure bench tool. Remove EWS -> Clean Pins -> Read -> Write Key -> Reinstall. It just works.11

## SECTION 8: DETAILED OPERATIONAL PROCEDURES

### 8.1 Procedure: EWS3 All Keys Lost using AK90+

1. Extract Module: Remove the EWS3 box from under the dash.
1. Clean Pins: Open the case. Identify the Motorola MCU (0D46J/2D47J). Use a fiberglass pen or acetone to meticulously clean the varnish off the pins. Failure to do this causes read errors.
1. Connect: Attach the AK90 ribbon cable connector to the MCU. Align the red dot on the connector with the dimple (Pin 1) on the MCU.
1. Read: Launch software. Select MCU type. Click "Read EWS". The tool will beep if the connection is good. Save the .bin file.
1. Write: Place a new PCF7935 chip in the AK90 slot. Select an unused key slot (e.g., Key 5) in the software. Click "Write Key".
1. Verify: The chip is now programmed with the rolling code for Slot 5. Reinstall EWS. The car will start. No diagnostic sync is needed for EWS3 unless the DME-EWS rolling code was previously corrupted.

### 8.2 Procedure: CAS3+ ISTA-P Add Key via OBD (Autel)

1. Connect PSU: Set to 13.8V.
1. Identify: IMMO -> BMW -> Smart Selection. Tool identifies CAS3+ (ISTAP).
1. Process: Select "Key Learning". The tool warns "Flash Downgrade Required". Proceed.
1. Flash: The tool will erase and rewrite the CAS firmware. This takes ~10 minutes. Do not open doors or touch switches.
1. Learn: Once flashed, the tool asks you to insert the working key (to read auth) and then the new blank key.
1. Restore: The tool typically does not restore the original flash automatically; it leaves the CAS in the "downgraded" state which is functional.

### 8.3 Procedure: CAS4+ All Keys Lost (Bench Read - ACDP)

1. Removal: Remove CAS4 module.
1. Connection: Install the ACDP CAS4 interface board over the PCB. Tighten the studs to ensure pogo pins make contact.
1. Read: Select "CAS4+ (5M48H)". Read P-Flash and D-Flash. The tool automatically decrypts the data.
1. ISN: The tool displays the ISN and VIN. It creates a key file.
1. Program: Place a new key in the ACDP coil. Select "Generate Dealer Key". Select the key file generated in step 4.
1. Install: Reinstall CAS4. Hold the new key to the steering column coil. Press Start. The key will sync.

### 8.4 Procedure: FEM/BDC Key Learning (Preprocessing)

1. Backup: Connect OBD. Read "Coding Data".
1. Bench Work: Remove FEM. Open shell.
1. Adapter: Attach ACDP Module 2 clip to the 95128 EEPROM.
1. Read & Modify: Read EEPROM. Tool saves "Original_EEPROM.bin". Tool generates "Service_EEPROM.bin". Write Service file to chip.
1. Flash: Reconnect FEM to platform/car. Perform "Program ECU".
1. Restore: Attach clip again. Write "Original_EEPROM.bin" back to chip.
1. Add Key: Now connect via OBD (or bench). The FEM is unlocked. You can now use "Learn Key".
1. Coding: Restore the "Coding Data" saved in Step 1 to fix windows/lights.23

## SECTION 9: ADVANCED DIAGNOSTICS: ISN READING & MODULE SYNCHRONIZATION

### 9.1 The Hierarchy of ISN

The ISN is the cryptographic glue holding the car together.

- E-Series (Short ISN): 4 bytes (e.g., 12 34). Found in older DMEs (MS43, MS45).
- E-Series (Long ISN): 16 bytes. Found in MSD80/81 (N54).
- F-Series (ISN): 32 bytes (128-bit). Found in N20/N55/B48/B58.

### 9.2 Bench Reading DMEs

If you have All Keys Lost on a CAS3+ or FEM car, you cannot read the ISN from the immobilizer because you cannot turn on the ignition to wake it up. You must read the ISN from the DME.

- MSD80/81 (N54): Use Autohex II or VVDI Prog with a Tricore cable. Connect to pins on the DME connector. Read ISN.
- MSV90 (Continental): Requires unlocking. ACDP Module 27 is excellent for this.
- N20 / B48 / B58: These require opening the shell (boot mode) OR using specialized interface boards (ACDP Module 3) that plug into the DME pins without opening the shell.5

### 9.3 Synchronization

If a car cranks but doesn''t start, the rolling code between CAS and DME may be mismatched (Tampering error).

- Tools: Autel, Launch, ISTA.
- Function: Service -> Drive -> DME -> "DME-CAS Adjustment" or "EWS Alignment". This resets the rolling code list.3

## SECTION 10: MODULE REPAIR, RECOVERY, AND CLONING

### 10.1 FRM3 Repair

The FRM3 (E-Series) corrupts its own P-Flash partition when voltage fluctuates (e.g., battery change).

- Symptoms: Windows dead, indicators dead, headlights stuck on.
- Repair: Connect VVDI Prog / ACDP to the MC9S12 chip. Read D-Flash (it will look empty/corrupt). Use the tool''s "Partition Repair" or "Write Partition" function. This reallocates the memory sectors. The EEPROM data usually reappears magically because it was just the partition table that was lost. No coding required after fix.37

### 10.2 CAS3+ Unbricking

If an OBD flash fails, the CAS bootloader is corrupted.

- Repair: You must read the CAS EEPROM/Flash on the bench. Use a hex editor or a tool like HexTag to repair the bootloader section of the bin file. Write the fixed file back. This resurrects the module.6

### 10.3 ELV Emulation

On E90/E60, the physical steering lock (ELV) often jams, preventing the CAS from authorizing a start (Error A0AA).

- Fix: Buy a $20 "ELV Emulator" plug. Disconnect the ELV connector on the steering column. Plug in the emulator. The CAS now thinks the lock is open and healthy. Reset the ELV counter in the CAS using a scanner. Car starts.38

## SECTION 11: PRICING STRATEGY & DECISION MATRICES

### Locksmith Tool Decision Matrix

Scenario

Best Tool

Backup Tool

Note

EWS 3/4 AKL

AK90+

VVDI Prog

AK90 is cheaper ($40) & faster.

CAS 3+ Add Key

Autel IM608

VVDI2

Autel has superior guided mode.

CAS 4/4+ AKL

Yanhua ACDP

Key Tool Plus

ACDP = No soldering risk.

FEM/BDC AKL

Yanhua ACDP

Autel IM608

ACDP requires less disassembly.

G-Series Add

Autel (Sub req.)

Dealer Key

High cost for tool sub (~$120).

FRM Repair

VVDI Prog

ACDP Module 8

Easy profit job ($150+).

### Pricing Guidelines (US Market Estimates)

- Spare Key (E-Series/F-Series): $250 - $350.
- All Keys Lost (CAS3): $450 - $600.
- All Keys Lost (FEM/BDC): $600 - $900 (Labor intensive).
- FRM Repair: $200 - $300 (30 mins work).
- G-Series AKL: $800+ (Often requires DME unlocking or dealer key).

DISCLAIMER: This guide is for educational and professional use. Procedures such as ISN reading and EEPROM modification carry inherent risks of damaging vehicle control modules. Always maintain a stable power supply (13.6V+) during programming. The author and publisher assume no liability for bricked modules or voided warranties.

— END OF DOCUMENT —

#### Works cited

1. Understanding EWS in BMW - DUDMD Tuning, accessed December 11, 2025, https://www.dudmd.com/blogs/news/understanding-ews-in-bmw
1. DME Synchronization : Specialized ECU Repair - Self-Help Knowledge Base, accessed December 11, 2025, https://ecudoctors.freshdesk.com/support/solutions/articles/47001097260-dme-synchronization
1. DDE-CAS sync Problem - Bimmerforums - The Ultimate BMW Forum, accessed December 11, 2025, https://www.bimmerforums.com/forum/showthread.php?2131297-DDE-CAS-sync-Problem
1. Reading ISN From DME/DDE in Factory Mode - Microtronik, accessed December 11, 2025, https://www.microtronik.com/technical-info/autohex/Reading-ISN-From-DME-DDE-On-Bench-Factory-Mode
1. Reading BMW ISN From CAS,DME, and DDE - Microtronik, accessed December 11, 2025, https://www.microtronik.com/technical-info/autohex/bmw-isn-reader-and-writer-software
1. How to Repair Bricked BMW CAS3+ istap Module by Autel KM100? | by obdii365 - Medium, accessed December 11, 2025, https://medium.com/@obd365com/how-to-repair-bricked-bmw-cas3-istap-module-by-autel-km100-2a9a94646994
1. Autel IM608 Pro Program 2010 BMW 550GT CAS4 All Keys Lost - AutelShop.de Official Blog, accessed December 11, 2025, http://blog.autelshop.de/autel-im608-pro-program-2010-bmw-550gt-cas4-all-keys-lost/
1. Autel IM608 II/IM508S BMW BDC02 Add Key Failed Precautions - AutelShop.de Official Blog, accessed December 11, 2025, https://blog.autelshop.de/autel-im608-ii-im508s-bmw-bdc02-add-key-failed-precautions/
1. EWS operation? - Bimmerforums - The Ultimate BMW Forum, accessed December 11, 2025, https://www.bimmerforums.com/forum/showthread.php?1422489-EWS-operation
1. BMW Key Programmer Manual for EWS | PDF | Car | Computer Engineering - Scribd, accessed December 11, 2025, https://fr.scribd.com/document/51651816/CARPROG-BMW-Key-programmer-manual
1. BMW Ak90 Key Programmer User Manual PDF - Scribd, accessed December 11, 2025, https://www.scribd.com/document/427784642/bmw-ak90-key-programmer-user-manual-pdf
1. Xhorse EWS4 Adapter For VVDI Prog Programmer For BMW - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/xhorse-ews4-adapter-for-bmw-ews4-range-rover-ews4-adapter-land-rover-4203
1. 3 buttons 315 MHz / 433 MHz / 868 MHz Remote Key with ID46 Chip for BMW CAS2 5 Series E46 E60 E83 E53 E36 E38 HU58 Uncut - DHgate, accessed December 11, 2025, https://www.dhgate.com/goods/996669211.html
1. BMW Immo System | PDF | Car Body Styles - Scribd, accessed December 11, 2025, https://www.scribd.com/document/949376063/BMW-Immo-System
1. How to Program a BMW Key | BMW of Ontario, accessed December 11, 2025, https://www.bmwofontario.com/service/diy-car-care/how-to-program-a-bmw-key/
1. For BMW CAS2 CAS3 CAS4 CAS4+ Test Platform Tool Support Off-Site Key Programming For BMW F20 F30 F35 X5 X6 I3 - AliExpress, accessed December 11, 2025, https://www.aliexpress.com/item/1005005468970407.html
1. CAS 3++ Downgrade - Bimmerforums - The Ultimate BMW Forum, accessed December 11, 2025, https://www.bimmerforums.com/forum/showthread.php?2451645-CAS-3-Downgrade
1. CAS4 and CAS4+ Key Programming - autohex - Microtronik, accessed December 11, 2025, https://www.microtronik.com/technical-info/autohex/cas4-key-programming
1. BMW F10 CAS4/CAS4+ How to Add key with Autel MaxiIM IM608 - obdprice, accessed December 11, 2025, https://www.obdprice.com/blogs/car-repar-maintenance/bmw-f10-cas4-cas4-how-to-add-key-with-autel-maxiim-im608
1. BMW HU92 Ignition Vol.3 Picking and Decoding Guide - TradeLocks Blog, accessed December 11, 2025, https://blog.tradelocks.co.uk/bmw-hu92-ignition-genuine-lishi-vol-3/
1. BMW HU92 Ignition Picking and Decoding Guide - TradeLocks Blog, accessed December 11, 2025, https://blog.tradelocks.co.uk/bmw-hu92-ignition-genuine-lishi-vol-1/
1. How to Program BMW 1-Series FEM All Keys Lost on Bench With the Autel IM608 - ABKEYS, accessed December 11, 2025, https://abkeys.com/blogs/news/how-to-program-bmw-1-series-fem-all-keys-lost-on-bench-with-the-autel-im608
1. How to program BMW FEM/BDC key By Lonsdor K518ISE, accessed December 11, 2025, https://www.lonsdork518.com/service/how-to-program-bmw-fem-bdc-key-by-lonsdor-k518ise-7.html
1. YANHUA Mini ACDP for BMW FEM/BDC: The Real-World Guide to Key Programming on a Budget - AliExpress, accessed December 11, 2025, https://www.aliexpress.com/p/wiki/article.html?keywords=mini-acdp
1. Pick And Decode A GM Lock - HU100 Lishi Pick - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=RcpZa2WUDMc
1. Picking and Decoding the BMW HU100R door lock using Lishi tools - TradeLocks Blog, accessed December 11, 2025, https://blog.tradelocks.co.uk/bmw-hu100r-door-lock-genuine-lishi-vol-2/
1. Autel just enabled add key on G body BMWs but there''s a huge catch. : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/1iuzz1g/autel_just_enabled_add_key_on_g_body_bmws_but/
1. Autel MaxiIM BMW G-Chassis Software Card Compatible with IM508 and IM608 Series Tablets - AutelEShop, accessed December 11, 2025, https://www.auteleshop.com/wholesale/autel-add-key-immo-functionality-for-bmw-g-chassis-vehicles.html
1. Mhd software dme unlocked reading. - G20 BMW 3-Series Forum - Bimmerpost, accessed December 11, 2025, https://g20.bimmerpost.com/forums/showthread.php?t=2080531
1. YOUBBA Smart Remote Key Instruction Manual, accessed December 11, 2025, https://manuals.plus/ae/1005005975279089
1. BMW Key Fob Upgrade - Mashimarho, accessed December 11, 2025, https://mashimarho.com/products/bmw-g-series-key-fob-upgrade
1. Ilco PRX-BMW-4B3 BMW 4 Button Prox Key (FCC: NBGIDGNG1) - Keymate Inc., accessed December 11, 2025, https://keymateinc.com/shop-online/key-blanks/automotive-keys/remotes/ilco-prx-bmw-4b3-bmw-4-button-prox-key-fcc-nbgidgng1-detail.html
1. 2015-2021 BMW G-Series / 4-Button Smart Key / 9367401-01 / N5F-ID21A / Silver (OEM REFURB) - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/bmw-g-series-4-button-smart-remote-control-key-bdc2-immo-fcc-id-n5f-id21a-silver-434mhz-remote-only-oem
1. Autel G-BOX3 Key Programming Adapter for Mercedes and BMW Vehicles, accessed December 11, 2025, https://www.garageappeal.com/autel-g-box3-key-programming-adapter-for-mercedes-and-bmw-vehicles/
1. ACDP Remplace BMW FEMBDC Module教程 | PDF | Software | Computing - Scribd, accessed December 11, 2025, https://www.scribd.com/document/754855388/ACDP-Remplace-BMW-FEMBDC-Module%E6%95%99%E7%A8%8B
1. Yanhua Mini ACDP BMW B48/B58 Interface Board for B48/B58 ISN Reading and Clone via Bench Mode - CarDiagTool, accessed December 11, 2025, https://www.cardiagtool.co.uk/yanhua-mini-acdp-bmw-b48b58-interface-board.html
1. How to Use Autel IM508 with XP400 Pro to fix FRM module on BMW? - AutelShop.us, accessed December 11, 2025, https://www.autelshop.us/blogs/autel-tech-solution/how-to-use-autel-im508-with-xp400-pro-to-fix-frm-module-on-bmw
1. MERCEDES BENZ ESL ELV PROGRAMMING & EIS W207 ALL KEYS LOST (AUTEL IM608 PRO GBOX2) - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=uHue5CjEr_c', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Automotive Transponder Chip Database', 'Global', 'General', 2010, 2024, '

# Technical Compendium of Automotive Transponder Systems (2000–2025): Architecture, Cryptography, and Locksmithing Methodology

## 1. Executive Summary: The Trajectory of Automotive Immobilization

The automotive security landscape has undergone a tectonic shift over the last quarter-century, evolving from simple resistor-based pellets to sophisticated, bi-directional cryptographic exchanges over Controller Area Networks (CAN). For the automotive locksmith and security professional, the era of purely mechanical key generation has effectively ended; the modern trade requires a fusion of mechanical precision, electronic diagnostics, and cryptographic management.

This report provides an exhaustive analysis of transponder chip technology utilized in the North American and global automotive markets from 2000 through early 2025. It is designed to serve as the foundational architecture for a professional automotive locksmith database. The analysis synthesizes technical data from key manufacturers—including Texas Instruments (TI), NXP Semiconductors (formerly Philips), Megamos (Sokymat), and Temic—and correlates this with the operational capabilities of industry-standard programming hardware such as the Advanced Diagnostics Smart Pro, Xhorse VVDI ecosystem, Scorpio Tango, and Autel MaxiIM series.

The research indicates a distinct bifurcation in the market: "Legacy" systems (approx. 2000–2016), which are largely vulnerable to aftermarket cloning and straightforward OBD-II programming, and "Next-Generation" systems (2017–2025), characterized by 128-bit AES encryption, Secure Gateway (SGW) modules, and proprietary communication protocols like CAN-FD. This report details the specific chip architectures, clonability status, and programming methodologies required to service this diverse vehicle parc.

## 2. Fundamental Transponder Architecture and Classification

To structure a comprehensive database, one must first categorize the fundamental electronic architecture of the transponder. Transponders are passive RFID (Radio Frequency Identification) devices that derive power from the electromagnetic field generated by the vehicle''s ignition coil (antenna). Upon energization, they transmit a unique alphanumeric code or engage in a challenge-response sequence with the Immobilizer Control Unit (ICU).

### 2.1 The Texas Instruments (TI) Ecosystem

Texas Instruments transponders represent the backbone of the American and Japanese automotive markets, heavily utilized by Ford, Toyota, Mazda, Subaru, and Nissan. The evolution of TI chips provides a chronological map of increasing security complexity.

#### 2.1.1 Texas Fixed Code (4C)

The 4C chip, often housed in a glass ampoule or carbon wedge, utilizes a fixed-code transmission protocol. Upon interrogation, it broadcasts a static hexadecimal string.

- Operational Era: Dominant in late 1990s to mid-2000s Ford (H72 system), Toyota, and Mitsubishi vehicles.
- Clonability: High. Because the code is static, it can be copied bit-for-bit onto emulator chips. Modern tools like the Xhorse VVDI Key Tool, Keyline 884, and Zed-Full can clone 4C data onto universal chips such as the CN1, JMA TPX1, or the Xhorse XT27 Super Chip.1
- Database Implication: Vehicles with 4C systems do not require complex "sniffing" (data interception) procedures for cloning; a direct read of the key is sufficient.

#### 2.1.2 Texas Crypto (4D) – 40-Bit Encryption

The introduction of the 4D series marked the shift to cryptographic security. The transponder utilizes a 40-bit encryption key to authenticate with the vehicle.

- Variants:

- ID60: Generic format used in Ford, Mazda, and Subaru.
- ID61: Mitsubishi specific logic.
- ID62: Subaru specific logic.
- ID63: Ford/Mazda specific logic (40-bit).
- ID67/68: Toyota/Lexus specific logic (differentiated by Page 1 data).

- Clonability: Originally unclonable, these are now standard operations for virtually all professional cloners (Keyline, Silca, Xhorse). Cloning requires "sniffing" data at the ignition to calculate the secret key. Compatible substrates include CN2, TPX2, LKP-02, and XT27.4

#### 2.1.3 Texas Crypto (DST-80) – 80-Bit Evolution

To counter brute-force attacks and increased computing power, manufacturers migrated to 80-bit encryption (DST-80) around 2010.

- Toyota "G" Chip (ID72): Identified by a "G" stamp on the key blade. Internally, this is a DST-80 transponder. It operates with a higher level of security than the dot/dimple keys of the 4D era.6
- Ford 80-Bit (ID63-6F): Used in the H92 system (2011–2016). While physically identical to 40-bit keys, the 80-bit chip is backward compatible (can be programmed to older cars), but 40-bit chips cannot be programmed to 80-bit vehicles.8
- Clonability: Supported by advanced tools using specialized chips like the CN5, LKP-02, or XT27. Note that basic cloners from the mid-2000s cannot handle 80-bit calculation.3

#### 2.1.4 Texas Crypto AES (128-Bit) and DST-AES

The current standard (2014–2025) employs 128-bit Advanced Encryption Standard (AES).

- Toyota "H" Chip (ID8A): Found in bladed keys for 2014–2019 Camry, RAV4, and Corolla. Cloning this chip was historically impossible until the development of the LKP-04 and XT27 Super Chip, which can emulate the complex 128-bit structure.11
- Toyota Smart Keys (8A/BA): Newer proximity keys (2019+) use DST-AES logic. These often require proprietary adapters to read the immobilizer data directly from the vehicle due to blocked OBD ports (Security Gateway).13

### 2.2 The NXP / Philips Ecosystem (Hitag)

NXP (formerly Philips) chips are ubiquitous in European (VAG, BMW, PSA) and Asian (Honda, Nissan, Hyundai/Kia) markets.

#### 2.2.1 Philips Crypto (ID40–ID45) and Hitag 2 (ID46)

- Hitag 2 (ID46): Perhaps the most widely used chip in history (2004–2015). It utilizes a 32-bit identifier and a 48-bit secret key. Found in GM (Circle Plus), Honda, Nissan, and Chrysler/Dodge/Jeep.
- Clonability: Fully clonable via data sniffing. Tools intercept the challenge from the ignition, calculating the secret key. Supported substrates include TPX3/4, CN3, and XT27.3

#### 2.2.2 Hitag 3, Pro, and AES

- ID47 (Hitag 3): Used in modern Honda proximity keys and Hyundai/Kia smart keys.
- ID49 (Hitag Pro): The security standard for 2015+ Ford and Mazda vehicles. It utilizes 128-bit encryption. Cloning is generally not supported; locksmiths must originate keys via OBD programming.15
- ID4A (Hitag AES): The latest iteration found in 2020+ Nissan, Hyundai, and Kia models. Cloning support is limited to high-end devices like the VVDI Key Tool Plus or Lonsdor K518 using specialized emulators.17

### 2.3 The Megamos Ecosystem

- Megamos 48 (Crypto): The cornerstone of Volkswagen/Audi (IMMO 3/4), Honda (2003-2006), and Volvo security. For over a decade, these were unclonable. Today, "96-bit cloning" is possible via server-side calculation (e.g., Xhorse, Keyline) which deduces the crypto key from data sniffs.19
- Megamos AES (ID88 / MQB): Introduced with the VW Golf MK7 (MQB Platform). This 128-bit chip is currently unclonable. Programming requires dealer-level authentication (CS Codes) often extracted via specialized OBD tools.21

## 3. Tooling and Programming Infrastructure

A locksmith database must correlate vehicle data with the specific capabilities of available programming hardware. The market is segmented into Cloning Tools, OBD Programmers, and EEPROM/Bench Tools.

### 3.1 Advanced Cloning Platforms

Cloning is the non-invasive duplication of a key''s electronic signature. It minimizes risk as the vehicle''s ECU is not accessed.

#### Xhorse VVDI Key Tool Ecosystem

The Xhorse ecosystem (Key Tool Max Pro, Mini Key Tool) has revolutionized the market through the XT27 Super Chip.

- Capability: The XT27 is a programmable universal transponder that can mimic the physical and electronic characteristics of 4C, 4D, 46, 47, 48, 8A, and 8C chips. This reduces inventory requirements from dozens of SKUs to a single chip.3
- ID48 96-Bit Cloning: Xhorse offers a cost-effective solution for cloning Megamos 48 chips by collecting data from the ignition and calculating the key on Xhorse servers. This function usually requires a "token" or points accumulated by generating remotes.25
- Toyota H-Chip Cloning: Supports cloning of 128-bit Toyota H-chips onto XT27, a significant advantage over competitors requiring specialized carbon chips.26

#### Keyline and Silca

- Keyline 884 Decryptor: A robust cloner utilizing proprietary "Horsehead" blades and electronic heads (TK100). Known for high reliability with Texas Crypto and Philips Crypto cloning.28
- Silca RW5 / Smart Aerial: Utilizes the GTI Ultra chip. Silca''s ecosystem is heavily integrated with their key cutting machines and MYKEYS Pro database, offering a streamlined workflow for locksmiths.29

#### JMA

- TPX Series: JMA pioneered glass/carbon cloning chips (TPX1, TPX2, TPX4). These are often preferred for their physical durability and resistance to environmental stress compared to ceramic universal chips.14

### 3.2 OBD-II Diagnostic Programmers

For "All Keys Lost" (AKL) situations or systems that cannot be cloned (e.g., Ford 128-bit, VW MQB), OBD programming is mandatory.

#### Advanced Diagnostics (Smart Pro)

- Position: The industry standard for reliability. The Smart Pro focuses on secure, OEM-level programming protocols.
- Functionality: It excels in bypassing security delays (e.g., Ford 10-minute wait), extracting PIN codes (Hyundai/Kia), and handling older legacy systems that newer Android-based tablets sometimes ignore.32

#### Autel MaxiIM (IM508S / IM608 Pro II)

- Position: A hybrid tool combining advanced IMMO programming with OE-level vehicle diagnostics.
- Advanced Capabilities:

- XP400 Pro: A peripheral programmer that reads/writes EEPROM chips, Mercedes Infrared (FBS3) keys, and BMW CAS4/FEM data.33
- G-Box 2/3: An adapter required for Mercedes All Keys Lost (fast password calculation) and reading BMW/Bosch engine ECUs on the bench.34
- AP112: A smart key simulator used for Toyota/Lexus AKL situations to emulate a master key.34
- IMKPA: An accessory kit for renewing (unlocking) used OEM smart keys and performing advanced MCU reads.34

#### Lonsdor K518 Pro / K518ISE

- Specialty: Lonsdor is renowned for its proprietary solutions for Volvo, Land Rover/Jaguar, and Toyota/Lexus.
- Toyota/Lexus: Utilizing the Super ADP Adapter and LKE Emulator, Lonsdor can program keys for 2018–2021+ Toyota smart key systems (8A-BA and 4A) via OBD, bypassing the need for dealer PIN codes or NASTF credentials.13
- Volvo: One of the few aftermarket tools capable of programming Volvo S40/S60/XC60/XC90 keys directly via OBD.37

### 3.3 EEPROM and Bench Programming Tools

When OBD access is blocked, failed, or unavailable (e.g., older Toyota ECUs, BMW EWS), locksmiths must read data directly from the module''s memory.

#### Scorpio Tango

- Role: The definitive transponder manipulation tool. Tango does not plug into the car; it sits on the bench. Locksmiths desolder the EEPROM from the immobilizer, dump the file, and load it into Tango.
- Capabilities: Tango analyzes the file and can generate a working transponder (e.g., LKP-02 for 4D, LKP-04 for Toyota H) that will start the car immediately, or create a "dealer key" ready for OBD programming.4
- Toyota Emulators: Tango uses SLK-01 through SLK-07 emulators to create master keys for Toyota/Lexus smart systems directly from the dump files of the Certification ECU.38

## 4. Manufacturer-Specific Transponder Analysis (2000–2025)

The following sections breakdown the transponder technology by major manufacturer, providing the granular data required for the database fields: Chip ID, Clonability, Keyway, and Programming Nuances.

### 4.1 Toyota, Lexus, and Scion: The Evolution of "Dot," "G," and "H"

Toyota''s immobilizer systems are strictly generational. Visual markings on the key blade (Dot, G, H) correspond directly to specific cryptographic architectures.

Table 4.1: Toyota Transponder Generations

Year Range

Blade Mark

Chip ID

Tech Specification

Clonability

Recommended Clone Chip

1998–2002

None

4C

Texas Fixed Code

Yes

CN1, TPX1, XT27

2002–2010

Dot / Dimple

4D-67

Texas Crypto 40-Bit

Yes

CN2, TPX2, XT27

2010–2014

G

4D-72

Texas DST-80 (80-Bit)

Yes

CN5, LKP-02, XT27

2013–2019

H

8A (H)

Texas DST-AES (128-Bit)

Yes

LKP-04, XT27

2019–2025

H / M / BA

8A / AA

DST-AES (Smart Key)

Difficult

Specialized Emulators

#### Operational Insights for Database:

- Toyota H-Chip Cloning (2014–2019): Cloning the H-chip (128-bit) initially required the expensive LKP-04 chip. However, the Xhorse XT27 Super Chip can now successfully clone these, significantly reducing cost.11
- Smart Key "All Keys Lost" (2019–2025): Newer models (RAV4, Highlander, Camry) use a "BA" or "AA" type smart key system with a Security Gateway. OBD programming is often blocked.

- Solution: Locksmiths must use a Bypass Cable (like the Lonsdor ADP or Autel G-Box Toyota cable) which connects directly to the Smart Key ECU (Certification ECU), typically located behind the glovebox or near the steering column. This bypasses the gateway to back up IMMO data and generate a simulator key.13
- Database Note: Flag 2020+ Toyota models as "Requires Bypass Cable/Emulator" in the database.

### 4.2 Ford, Lincoln, and Mazda: From Glass Chips to Hitag Pro

Ford and Mazda shared the C1 platform architecture for years, leading to similarities in their immobilizer evolution, though they have diverged significantly in the 2020s.

Table 4.2: Ford/Mazda Transponder Generations

System

Year Range

Chip ID

Description

Keyway

Cloning

PATS 1

1996–2004

4C

Texas Fixed (Glass)

H72 (8-cut)

Yes

PATS 2

2004–2010

4D-63 (40)

Texas Crypto 40-Bit

H84/H92

Yes

PATS 3

2011–2014

4D-63 (80)

Texas DST-80 (80-Bit)

H92 (8-cut)

Yes

PATS 4

2013–2020

ID49

NXP Hitag Pro 128-Bit

HU101

No

PATS 5

2017–2025

ID49

Hitag Pro (Smart Key)

Fob

No

#### Operational Insights for Database:

- 40-bit vs. 80-bit Confusion: Visually, the H92 keys look identical for 2008 and 2012 models. However, an 80-bit chip (marked ''SA'' by Strattec) is backward compatible with 40-bit vehicles, but a 40-bit chip will not work in an 80-bit vehicle. The database should recommend stocking only 80-bit chips or XT27s to cover both eras.2
- Ford 128-Bit (ID49): Introduced with the 2015 F-150 and 2013 Fusion. These keys (H128-PT) utilize the HU101 laser cut. They are not clonable with standard tools. Programming requires an OBD diagnostic tool (Autel/Smart Pro) and typically involves a 10-minute security delay bypass.41
- Mazda 2019+ (Next Gen): The Mazda 3 (2019+), CX-30, and CX-50 use a new WAZSKE11D01 smart key system (ID49). This system is notoriously difficult; if the alarm is active, the BCM locks out OBD communication. Advanced tools like Lonsdor or dedicated dealer software (MDARS) are often required.15

### 4.3 General Motors: VATS, Circle Plus, and CAN-FD

GM moved from the resistor-based VATS (Vehicle Anti-Theft System) to transponders in the late 90s.

#### 3.3.1 Circle Plus (PK3+) Era (2006–2016)

- Identifier: A circle with a plus sign (+) stamped on the blade.
- Chip: Philips ID46 (Crypto).
- Clonability: Highly clonable using ID46 technology (CN3, TPX4, XT27).45
- Programming: A unique feature of this era is On-Board Programming (OBP). On many models (Impala, Silverado), a new key can be programmed by the user without tools if they have one working key, or via a 30-minute "cycle" procedure if all keys are lost.46

#### 3.3.2 The High Security Transition (2010–2020)

- Keyway: HU100 (Laser cut).
- Chip: ID46 (extended) and later ID46E.
- Flip Keys: GM widely adopted flip keys integrating the remote. The transponder is soldered to the remote PCB in many cases, meaning the battery or remote health can impact starting.47

#### 3.3.3 CAN-FD and 2021+ Architecture

Starting with 2020/2021 SUVs (Tahoe, Suburban, Yukon, Escalade) and the Corvette C8, GM adopted the CAN-FD (Controller Area Network Flexible Data-Rate) protocol.

- Impact: Legacy programmers (original Key Tool Max, older Autel units) cannot communicate with these vehicles.
- Requirement: Locksmiths need CAN-FD compatible hardware (Autel IM608 Pro II, Key Tool Max Pro, or a separate CAN-FD adapter) to program keys for these models.24

### 4.4 Honda and Acura: High Security Evolution

Honda has maintained the "High Security" laser key profile (HO01/HO03) since 2002 but has internally upgraded the chips multiple times.

Table 4.4: Honda Transponder Generations

Era

Chip ID

Blade Marking

Clonability

Database Warning

2002–2006

Megamos 48

None

Yes (96-bit)

Requires server calc.

2007–2013

Philips 46

V / L

Yes

Easy clone (Sniff).

2013–2017

Hitag 3 (ID47)

G

No

Do not confuse with Toyota ''G''.

2016–2025

Hitag AES (4A)

Smart Key

Limited

Fob Only.

- The "G" Chip Confusion: Honda introduced a "G" stamped key (HO05-PT) around 2013/2014 for the Accord and Civic. This uses an NXP Hitag 3 (ID47) chip. Critical Warning: This is not compatible with the Toyota "G" chip (DST-80), nor the older Honda "V" chip (ID46). Using the wrong key will result in programming failure. The database must explicitly distinguish between HO03-PT (46) and HO05-PT (47).48
- Newest Systems (2022+): The 2022+ Civic and CR-V use Hitag AES (ID4A) smart keys (FCC ID: KR5TP-4). These are expensive and currently have limited aftermarket options, necessitating OEM parts in many cases.49

### 4.5 Subaru: The Risk of the "G" Chip

Subaru presents a unique risk profile for locksmiths.

- 2005–2010: Used Texas 4D-62 chips.
- 2011–2017 (G-Chip): Subaru adopted a DST-80 chip marked "G". Used in Forester, Impreza, and Outback.
- 2018–2025 (H-Chip): Migrated to 128-bit AES (H-Chip).
- Critical Risk: There is a documented issue where attempting to program a G-chip vehicle with the wrong software protocol (or vice versa) can brick the Body Integrated Unit (BIU), rendering the car dead. This requires expensive module replacement. The database must emphasize strict year/model verification for Subaru programming.52
- Cloning: H-chips can be safely cloned using LKP-04 or XT27 chips via high-end tools (Tango, Key Tool Plus), avoiding the OBD risk entirely.11

### 4.6 European Systems: VAG, BMW, and Mercedes

European vehicles generally require more sophisticated EEPROM or "Bench" work.

- Volkswagen/Audi (MQB): The MQB platform (Golf Mk7, Audi A3 2015+) uses Megamos AES (ID88). These keys cannot be cloned. Programming requires fetching "Sync Data" (CS codes) from the vehicle. Tools like the Autel IM608 or VVDI2 are required to read the instrument cluster or BCM2 data to generate a dealer key.21
- BMW:

- CAS1-3: E-Series. Keys can be programmed via OBD or EEPROM (CAS dump).
- CAS4/4+: F-Series. Requires reading the CAS module (often on bench) to bypass encryption.
- FEM/BDC: F-Series/G-Series. The Front Electronic Module (FEM) must be removed, unlocked on the bench (EEPROM read/write), and reinstalled to program keys. This is a high-skill procedure.56

- Mercedes-Benz:

- FBS3 (DAS3): Used until approx. 2014. Keys are Infrared (IR). Fully supported by Autel XP400/VVDI MB Tool for AKL and adding keys.
- FBS4 (DAS4): Introduced ~2014/2015. 2025 status: Mostly unsupported for aftermarket programming. The encryption keys are managed strictly by Mercedes servers. If a customer loses all keys to an FBS4 Mercedes (e.g., 2016+ E-Class W213), they typically must go to the dealer. Some limited solutions exist for specific ECU renewals, but key addition is restricted.58

## 5. Comparative Analysis of Programming Methodologies

### 5.1 Cloning vs. Origination

- Cloning: Creates a digital twin of an existing key. The car cannot distinguish the clone from the original.

- Pros: Zero risk of data corruption; no OBD connection needed; faster for "spare key" jobs.
- Cons: Cannot solve "All Keys Lost"; the car''s log will not show a new key ID (security audit trail issue).

- Origination (OBD Programming): Adds a unique Key ID to the whitelist in the Immobilizer ECU.

- Pros: Solves All Keys Lost; allows deletion of old/stolen keys.
- Cons: Risk of bricking modules (e.g., Subaru BIU, BMW FRM); requires PIN codes (Hyundai/Kia/Dodge).

### 5.2 The "All Keys Lost" (AKL) Barrier

In 2025, AKL is the primary differentiator between "basic" and "advanced" locksmiths.

- Toyota AKL: Requires analog emulators (AP112/LKE) to simulate a master key to gain access.13
- FCA (Chrysler) AKL: Requires bypassing the Secure Gateway (SGW) to write to the RFH (Radio Frequency Hub).61
- Volvo AKL: Requires removing the CEM (Central Electronic Module) to read EEPROM data on the bench.37

## 6. Strategic Database Data Structures

To build the database effectively, the following fields are recommended for every vehicle entry:

1. Vehicle Identity: Make, Model, Year, Region (US/EU/Asia).
1. System Type: (e.g., PATS 3, CAS4, FBS3, MQB).
1. Transponder ID: (e.g., ID46, 4D-63 80-bit, 8A-H).
1. Keyway/Blade: (e.g., HU101, TOY43, HO01).
1. Clonability Status:

- Yes (Simple): Fixed code / standard crypto.
- Yes (96-bit/Server): ID48 / 8A.
- No: ID49, MQB, FBS4.

1. Supported Clone Chips: (e.g., XT27, LKP-02, CN5).
1. Programming Method: (e.g., OBP, OBD, EEPROM, Bench).
1. Required Hardware: (e.g., "Requires CAN-FD Adapter", "Requires 12+8 Bypass").
1. Critical Warnings: (e.g., "Do not use G-chip software on H-chip system").

## 7. Future Outlook: 2025 and Beyond

The data suggests a shrinking window for simple OBD programming.

- Secure Gateways: Following FCA''s lead, Nissan (2020+ Sentra/Rogue) and Toyota (2020+) have implemented gateways that block unlicensed tools.
- CAN-FD: Will become standard on all platforms, necessitating hardware upgrades for locksmiths holding older programmers (e.g., original IM608 or Key Tool Max).
- UWB / Digital Keys: Phone-as-a-key technology (Ultra-Wideband) is entering the market. While physical keys remain, the "transponder" is becoming a backup credential managed via cloud authentication rather than local RF handshakes.48

## 8. Conclusion

The modern automotive locksmith database cannot be a static list; it must be a dynamic map of dependencies between chip architecture, encryption protocols, and tool capabilities. While 90% of the vehicle parc (2000–2020) can be serviced with standard cloning (XT27) or OBD programming, the newest generation of vehicles imposes strict hardware requirements (CAN-FD, Bypass Cables) and server-side authentication (FBS4, MQB). Success in this domain requires moving beyond "insert key and turn" to understanding the invisible digital dialogue occurring between the transponder and the vehicle.

#### Works cited

1. Softwares for Tango Transponder Programmer - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/softwares-for-tango-transponder-programmer
1. Car Key Transponder Chip Catalog | PDF | Transport | Electric Vehicle - Scribd, accessed December 11, 2025, https://www.scribd.com/document/379060454/Car-Key-Transponder-Chip-Catalog
1. Key Tool Software Special Chips for Transponder emulation Support Guide 2023 - VendoCuadros, accessed December 11, 2025, https://vendocuadros.com/downloads/DAMBO%20KEY%20TOOL/SCT_EMULATION.pdf
1. Tango Professional Transponder Chip Reader, Writer, and Programmer-Includes 1 Free Year of Software - Southern Lock, accessed December 11, 2025, https://www.southernlock.com/itemdetail/135-5000
1. Transponder Identification - LSC | Complete Security Solutions ..., accessed December 11, 2025, https://lsc.com.au/transponder-identification
1. 2015 Toyota Prius transponder key blank - Car and Truck Remotes, accessed December 11, 2025, https://www.carandtruckremotes.com/products/2015-toyota-prius-transponder-key-blank
1. Owner Programmable G Chip Transponder Key for Select Toyota Vehicles, accessed December 11, 2025, https://tomskey.com/products/toyota-key-g-chip
1. Uncut Transponder Key | Ford | H92-PT - CLK Supplies, accessed December 11, 2025, https://www.clksupplies.com/products/ford-transponder-key-h84-pt-h92-pt
1. Transponders - Key Cloning & Vehicle Programming Tools | UHS Hardware – tagged "Ford", accessed December 11, 2025, https://www.uhs-hardware.com/collections/new-transponders/ford
1. Tango Original Transponder Key Programmer From Scorpio LK - Techno Lock Keys Trading, accessed December 11, 2025, https://www.tlkeys.com/products/Tango-Original-Transponder-Key-Programmer-From-Scorpio-LK-23449
1. LKP-04 Toyota H Cloning Transponder Chip For Tango Chip - Techno Lock Keys Trading, accessed December 11, 2025, https://www.tlkeys.com/products/LKP-04-Toyota-H-Cloning-Transponder-Chip-For-Tango-Chip-29257
1. TANGO - LKP04 - Transponder Cloning Chip - 128-Bit - for Toyota H-Key - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/tango-lkp04-transponder-cloning-chip-128-bit-for-toyota-h-key-cloning
1. Super ADP 8A/4A Adapter for Toyota/Lexus Prox Key Programming (Lonsdor), accessed December 11, 2025, https://www.americankeysupply.com/product/super-adp-8a-4a-adapter-for-toyota-lexus-prox-key-programming-lonsdor-17351
1. JEEP Transponder Catalog | PDF | Jeep | Off Road Vehicles - Scribd, accessed December 11, 2025, https://www.scribd.com/document/669414379/JEEP-Transponder-Catalog
1. ID 49 128-Bit Blank Carbon Transponder Chip (PCF7939FA) - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/id-49-128-bit-blank-carbon-transponder-chip-pcf7939fa
1. WAZSKE11D01 315MHz Keyless Entry Remote Key Fob for Mazda CX-30 2020-2024 for Mazda 3 Hatchback 2019-2024 ID49 Replacement Car Key | Harfington, accessed December 11, 2025, https://www.harfington.com/products/p-1784448
1. Kia HITAG 128-bit AES ID4A Transponder Chip (2018–2025) - keytech tools, accessed December 11, 2025, https://keytectools.com/product/kia-hitag-128-bits-aes-id4a-transponder-chip/
1. 2019 - 2024 Hyundai Kia Transponder Key - 4A Chip - KK12 (10 Pack) - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/2019-2024-hyundai-kia-transponder-key-4a-chip-kk12-10-pack
1. Xhorse VVDI Key Tool Max Remote Programmer and Chip Generator, accessed December 11, 2025, https://www.carandtruckremotes.com/products/xhorse-vvdi-key-tool-max-remote-programmer-and-chip-generator
1. Zed Full Plus Transponder Programmer / Cloner / EEPROM / All In One Machine - 6 Months FREE LIFS Subscription, accessed December 11, 2025, https://www.uhs-hardware.com/products/zed-full-plus-transponder-programmer-cloner-eeprom-all-in-one-machine-6-months-free-lifs-subscription
1. VVDI XT1M MQB48 AES Transponder Chip for Audi VW Jeep Fiat - Your Car Key Guys, accessed December 11, 2025, https://yourcarkeyguys.com/products/vvdi-xt1m-mqb48-aes-transponder-chip-for-audi-vw-jeep-fiat
1. Megamos AES Wedge Transponder Chip for VW / Audi (MQB ID88) - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/megamos-aes-wedge-transponder-chip-for-vw-audi-mqb-id88
1. Xhorse VVDI Key Tool MAX PRO and VVDI2 Volkswagen 786 B5 and 5 PCS Sup - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/xhorse-vvdi-key-tool-max-pro-and-vvdi2-volkswagen-786-b5-and-5-pcs-super-chip-xt27a-universal-programmable-transponder-chip
1. Xhorse - VVDI Key Tool MAX Pro - Built-In OBD And CANFD Modules - Keyless City, accessed December 11, 2025, https://keyless-city.com/products/vvdi-key-tool-max-pro-built-in-obd-and-canfd-modules-1
1. Xhorse VVDI Key Tool Max Pro XDKMP0EN - NazirProg, accessed December 11, 2025, https://www.npshops.com/products/xhorse-vvdi-key-tool-max-pro-xdkmp0en
1. How to clone Toyota H chip with super chip for VVDI - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=knJ3kJjZ5eE
1. Toyota 8A H non-smart key transponder clone by vvdi keytools max - YouTube, accessed December 11, 2025, https://www.youtube.com/watch?v=8pefrcEHxWI
1. KEYLINE USA PRODUCT GUIDE, accessed December 11, 2025, https://keyline-usa.com/uploads/file_uploads/upload_en_US_20240206204414.pdf
1. 2025 Ilco Auto Truck Reference | Event and news, accessed December 11, 2025, https://www.ilco.us/events-and-news/press-releases/2025-ilco-auto-truck-reference
1. Advanced Diagnostic Tools & Transponder Chips | PDF | Motor Vehicle | Car - Scribd, accessed December 11, 2025, https://www.scribd.com/document/439999488/Transponder-Chips
1. Catalogs - KeyBlankDepot.com, accessed December 11, 2025, https://www.keyblankdepot.com/category_s/1841.htm
1. 2024 Ilco Auto Truck Reference | PDF | Central America | Nissan - Scribd, accessed December 11, 2025, https://www.scribd.com/document/755850069/2024-Ilco-Auto-Truck-Reference
1. Autel MaxiIM IM608 PRO Auto Key Programmer Diagnostic Tool + IMKPA (IM - Autelmaxisys.com, accessed December 11, 2025, https://www.autelmaxisys.com/products/autel-maxiim-im608-pro
1. Autel - MaxiIM IM608 PRO Auto Key Programmer & Diagnostic Tool - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/autel-maxiim-im608-pro-auto-key-programmer-diagnostic-tool-plus-apb112-g-box2-imkpa-accessories-for-renew-unlock
1. Lonsdor K518ISE Car Key Programming Guide | PDF | Vehicles - Scribd, accessed December 11, 2025, https://www.scribd.com/document/527727739/Lonsdor-k518ise-Key-Programmer-Car-List
1. Used Lonsdor K518ISE Universal OBD Key Programmer - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/lonsdor-k518ise-universal-key-programmer-immo-key-programmer
1. Lonsdor K518ISE K518 Pro Key Programmer K518S Basic Version Supports V-W 4th & 5th IMMO and Odometer Adjustment - VXDAS, accessed December 11, 2025, https://www.vxdas.com/products/lonsdor-k518-key-programmer
1. MK3. Tango Original Universal Transponder Key Programmer Basic Device, accessed December 11, 2025, https://www.mk3.com/en/tango-original-universal-transponder-key-programmer-basic-device-from-scorpio-lk
1. Toyota Smart/Mechanical Programming (New) - KeyShop Online, accessed December 11, 2025, https://keyshop-online.com/collections/toyota-smart-mechanical-programming-new
1. How to Perform an All Key Lost Procedure for Toyota 8A with M822 Adapt, accessed December 11, 2025, https://www.xtoolglobal.com/blogs/news/how-to-perform-an-all-key-lost-procedure-for-toyota-8a-with-m822-adapter-a-step-by-step-guide
1. Xecutive Keys Ford F-Series 2015-2024+ Transponder Chip Key (2 Pack) - eBay, accessed December 11, 2025, https://www.ebay.com/itm/306364356189
1. 2015 Ford F-150 transponder key blank - Car and Truck Remotes, accessed December 11, 2025, https://www.carandtruckremotes.com/products/2015-ford-f-150-transponder-key-blank-aftermarket
1. HU101 - Ford - Transponder Key - (49 HITAG-PRO 128-Bit Chip) (AFTERMARKET), accessed December 11, 2025, https://www.uhs-hardware.com/products/hu101-ford-transponder-key-128-bit-oem-chip-aftermarket
1. Mazda New OEM 2019-2025 MAZDA 3, CX-30 Smart Key 3B FCCID: WAZSKE11D01, accessed December 11, 2025, https://royalkeysupply.com/products/mazda-new-oem-2019-2022-mazda-3-cx-30-smart-key-3b-fccid-wazske11d01-pn-bcyn-67-5ry
1. 2021 Chevrolet Transponder Key - ID 46 GM EXT Chip - B116-PT - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/2015-2020-chevrolet-transponder-key-id-46-gm-ext-chip-b116-pt
1. 2015 Chevrolet Silverado transponder chip key blank 23209427 22984996 23286589 23286588 23326748 - Car and Truck Remotes, accessed December 11, 2025, https://www.carandtruckremotes.com/products/2015-chevrolet-silverado-transponder-key-blank-aftermarket
1. Updated 2025 Guide to Car Key Types and Features, accessed December 11, 2025, https://prokeysolutions.com/updated-2025-guide-to-car-key-types/
1. 2015 Honda Accord transponder key blank - Car and Truck Remotes, accessed December 11, 2025, https://www.carandtruckremotes.com/products/2015-honda-accord-transponder-key-blank-aftermarket
1. Genuine Honda Transponder Key 35118-T2A-A10 HITAG3 PCF7938XA, HON66 - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/honda-accord-civic-crv-transponder-key-hon66-pcf7938xa-35118-t2a-a10-3196
1. Honda Aftermarket 2013-2022 HR-V Transponder Key HO05-PT - Royal Key Supply, accessed December 11, 2025, https://royalkeysupply.com/products/honda-aftermarket-2013-2022-civic-accord-cr-v-fit-hr-v-transponder-key-ho05-pt-pn-35118-t2a-a10
1. Honda CR-V HR-V 2023+ Smart Key 5B 72147-T43-A11 KR5TP-4 - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/honda-crv-2023-smart-key-5buttons-72147-t43-a11-kr5tp-4-5176
1. 2017-2020 Subaru B110 Transponder Key / H Chip (AFTERMARKET) - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/products/2017-2019-subaru-b110-transponder-key-h-chip-k-sub-h
1. Subaru G chip and software. : r/Locksmith - Reddit, accessed December 11, 2025, https://www.reddit.com/r/Locksmith/comments/b11bxt/subaru_g_chip_and_software/
1. 2022 Subaru Transponder Key - 128 Bits Subaru H - B110 (2 Pack) - Locksmith Keyless, accessed December 11, 2025, https://www.locksmithkeyless.com/products/2017-2022-subaru-transponder-key-aes-ws21-subaru-h-b110-2-pack
1. Volkswagen MQB Transponder Key MEGAMOS AES ID MQB48, HU66 - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/volkswagen-golf7-tiguan-mqbuttons-transponder-key-megamos-aes-hu66-2532
1. BN016 - Key learning for All BMW F-Series vehicles (including BDC by OBD) FEM/BDC/CAS4 (v85 included), accessed December 11, 2025, https://www.abritesusa.com/product/BN016-Key-learning-for-All-BMW-F-Series-vehicles-including-BDC-by-OBD-FEM-BDC-CAS4-v85-included
1. DIY: G-Series Key Swap - BMW M2 Forum - Bimmerpost, accessed December 11, 2025, https://f87.bimmerpost.com/forums/showthread.php?t=2000132
1. How to Know if A Mercedes is FBS3/ FBS4 before Key Programming? - CarDiagTool, accessed December 11, 2025, https://www.cardiagtool.co.uk/service/how-to-know-if-a-mercedes-is-fbs3-fbs4-before-key-programming.html
1. MN032 - DAS Manager for FBS3/FBS4 cars - KeyShop Online, accessed December 11, 2025, https://keyshop-online.com/products/mn032-fbs3-fbs4-manager
1. FBS4 TRAINING PROGRAM AND DETAILS NOW AVAILABLE! Abrites, accessed December 11, 2025, https://abrites.com/news/fbs4-training-program-and-details-now-available
1. What Vehicles Can Autel IM608 Work On? U.S. Compatibility Guide - UHS Hardware, accessed December 11, 2025, https://www.uhs-hardware.com/blogs/locksmith-industry-news/what-vehicles-can-the-autel-im608-work-on-a-complete-u-s-vehicle-compatibility-guide', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Automotive Key Cross-Reference Database', 'Global', 'General', 2010, 2024, '

# Comprehensive Analysis of Automotive Key Systems: OEM to Aftermarket Cross-Reference Database

## 1. Introduction: The Architecture of Automotive Access Control

The automotive locksmith industry operates within a complex ecosystem defined by the intersection of proprietary Original Equipment Manufacturer (OEM) security protocols and a dynamic aftermarket supply chain. Constructing a comprehensive cross-reference database requires more than a simple one-to-one mapping of part numbers; it demands a nuanced understanding of the technological evolution of vehicle immobilizer systems over the last two decades. From the mechanical simplicity of early 2000s edge-cut keys to the cryptographic complexity of modern proximity fobs (PEPS), the locksmith''s inventory must bridge the gap between OEM specifications and cost-effective aftermarket solutions.

This report provides an exhaustive analysis and structured cross-reference database mapping OEM part numbers to their aftermarket equivalents for the major vehicle markets: General Motors, Ford, Stellantis, Toyota, Honda, Nissan, Hyundai/Kia, and the primary European marques (BMW, Mercedes-Benz, Volkswagen/Audi). The data is synthesized from OEM supplier catalogs (Strattec), aftermarket leaders (Kaba Ilco), cloning specialists (JMA), and universal remote generators (KEYDIY).

The analysis reveals that a successful cross-reference relies on three distinct layers of data compatibility:

1. Mechanical Keyway: The physical profile of the key blade (e.g., HU100, HO01, TR47).
1. Transponder Logic: The electronic signature required by the immobilizer (e.g., Texas Crypto 4D, Philips Crypto 46, Megamos 48).
1. Remote Frequency & Modulation: The FCC ID and frequency parameters (315 MHz vs. 433 MHz, ASK vs. FSK) governing remote keyless entry (RKE) functions.

The following sections dissect these relationships by manufacturer, providing the requested granular data tables formatted for direct integration into a locksmith database.

## 2. General Motors: The Strattec-Aftermarket Nexus

General Motors (GM) presents a unique scenario in the key blank market due to its relationship with Strattec Security Corporation. Unlike many other manufacturers that rely on varied suppliers, Strattec creates the majority of locks and keys for GM assembly lines. Consequently, a Strattec part number in the aftermarket is often physically identical to the OEM part, differing only in packaging. This relationship simplifies cross-referencing but requires careful attention to the transition periods between security generations.

### 2.1 Evolution of GM Security Architectures (2000-2025)

To accurately map part numbers, one must categorize GM vehicles into four distinct security eras, each requiring specific inventory strategies:

- VATS & PassLock (Pre-2003): While largely phased out of the target 2000-2025 window, early 2000s models still utilized resistor-based VATS keys.
- PASS-Key III (PK3) & PK3+: This transponder system uses an encrypted chip (Megamos 13 or 48). The visual identifier is the "PK3" or "PK3+" stamp on the blade.
- Circle Plus (2006-2016): A variation of the Philips Crypto 46 chip, identified by a circle with a plus sign stamp. This era introduced the widespread use of Remote Head Keys (RHK).
- High Security / PEPS (2010-Present): The shift to the "Z-Keyway" (vertical mill) and "Flip Keys" utilizes the HU100 blade profile. Proximity systems (Push-to-Start) operate on high-frequency Hitag protocols.

### 2.2 Technical Analysis of Aftermarket Equivalents

ILCO Nomenclature: Kaba Ilco assigns a "B" prefix to GM keys. A critical data point for the database is the distinction between transponder and non-transponder blanks.

- PT Suffix: Indicates "Plastic Transponder" (e.g., B111-PT). These keys contain a chip and must be programmed.
- P Suffix: Indicates "Plastic Head" without a chip (e.g., B102-P). These are mechanical test keys or service keys that will open doors but not start the engine.

KEYDIY Integration: For GM''s popular flip keys (e.g., the Equinox/Camaro style), KEYDIY offers universal remotes (NB-Series) that can be generated to mimic multiple OEM part numbers. For instance, the NB-ETT-GM generic remote can replace over five different OEM flip keys by modifying the software generated onto the board, consolidating inventory significantly.

### 2.3 General Motors Cross-Reference Database

The following table maps specific OEM part numbers to their Strattec, Ilco, JMA, and KEYDIY equivalents. Note that specific years may vary slightly by trim level (e.g., fleet vehicles often retain older key styles).

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Chevrolet

Silverado 1500

2007

2013

Remote Head

15913421

B111-PT

5903089

GM-38

B22-4

OUC60270

Circle Plus system; Z-Keyway blade not used yet.

Chevrolet

Silverado 1500

2014

2018

Flip Key

13577770

B119-PT

5922534

GM-37

NB-ETT-GM

OHT01060512

High Security Z-Keyway; 4-Button Flip.

Chevrolet

Equinox

2010

2017

Flip Key

13500221

B116-PT

5912543

GM-30E

NB-ETT-GM

OHT01060512

5-Button Flip; HU100 Keyway.

Chevrolet

Cruze

2011

2016

Flip Key

13500226

B116-PT

5912545

GM-30E

NB-ETT-GM

OHT01060512

High Security; Standard Flip.

Chevrolet

Malibu

2016

2021

Smart Key

13529634

--

5929505

--

ZB-Series

HYQ4EA

Proximity Fob; 5-Button; Push-to-Start.

GMC

Sierra

2014

2019

Flip Key

13500221

B119-PT

5912545

GM-37

NB-ETT-GM

OHT01060512

Often requires OHT05918179 software.

GMC

Yukon

2015

2020

Smart Key

13580082

--

5923896

--

ZB-Series

HYQ1AA

6-Button Smart Key (Hatch/Glass).

Cadillac

Escalade

2007

2014

Remote Head

22756465

B112-PT

5912555

GM-38

B22-4

OUC6000066

Circle Plus; Power Liftgate button.

Cadillac

CTS

2008

2013

Smart Key

25943676

--

5922074

--

ZB-Series

M3N5WY7777A

Early Proximity system.

Buick

Encore

2013

2016

Flip Key

13500224

B116-PT

5912548

GM-30E

NB-ETT-GM

OHT01060512

4-Button Flip.

Chevrolet

Express Van

2008

2022

Transponder

15821267

B99-PT

692955

GM-30E

--

--

Circle Plus; Non-remote key usually.

Pontiac

G6

2005

2010

Remote Head

15254057

B102-PT

5902386

GM-39

B22-3

KOBGT04A

Circle Plus; Edge cut key.

Saturn

Vue

2008

2010

Flip Key

96464220

B114R-PT

7011685

--

--

--

Unique laser cut blade for Saturn.

Chevrolet

Corvette

2005

2007

Smart Fob

25926479

--

15254057

--

--

M3N5WY7777A

C6 Generation Fob; No key blade in fob.

Chevrolet

Camaro

2010

2015

Flip Key

13500221

B116-PT

5912543

GM-30E

NB-ETT-GM

OHT01060512

Recall changed key design; Flip vs Blade.

Insight: The Strattec/Ilco cross-reference 1 highlights a critical logistical detail: Strattec often supplies the OEM key with the logo, while Ilco supplies the "Look-Alike" shell without the logo. For high-end clients (Cadillac/Corvette), the Strattec part is preferred to maintain brand aesthetics, whereas fleet vehicles (Express Van/Silverado WT) are ideal candidates for the cost-effective JMA or KEYDIY solutions.

## 3. Ford Motor Company: Bit Depths and Encryption

Ford''s security landscape is dominated by the "PATS" (Passive Anti-Theft System). The primary challenge in building a database for Ford is distinguishing between visually identical keys that contain different transponder encryption depths: specifically the 40-bit vs. 80-bit divide.

### 3.1 The 40-Bit vs. 80-Bit Paradigm

Between 2000 and 2010, Ford utilized Texas Crypto 4D63 (40-bit) transponders. Starting roughly in 2011, this migrated to the Texas Crypto 4D63 (80-bit) system.

- Visual Identification: OEM 80-bit keys are often stamped with "HA" or "SA" on the blade.
- Backward Compatibility: 80-bit keys are generally backward compatible with 40-bit vehicles, but 40-bit keys will not work on 80-bit vehicles.
- Aftermarket Implication: Stocking H92-PT (Ilco 80-bit) is safer than stocking H72-PT (40-bit) as the former covers both eras, simplifying inventory.

### 3.2 Integrated Keyhead Transmitters (IKT)

Ford pioneered the IKT, where the remote buttons are integrated into the key head. The KEYDIY "NB" series is particularly effective here, as the transponder is integrated into the PCB, mirroring the IKT architecture.

### 3.3 Ford Cross-Reference Database

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Ford

F-150

2004

2010

Remote Head

164-R0475

H72-PT

5904287

FO-15DE

B11-3

CWTWB1U331

40-bit system; Standard edge cut.

Ford

F-150

2011

2014

Remote Head

164-R8070

H92-PT

5912560

FO-20DE

B11-3

CWTWB1U793

80-bit; "SA" stamp on blade.

Ford

F-150

2015

2020

Flip Key

164-R8130

H128-PT

5925315

--

NB-Series

N5F-A08TAA

High Security HU101 blade; 315 MHz.

Ford

Focus

2012

2019

Remote Head

164-R8046

H94-PT

5919918

--

B11-3

KR55WK48801

Laser Cut HU101; IKT.

Ford

Fusion

2013

2016

Flip Key

164-R7986

H128-PT

5923667

--

NB-Series

N5F-A08TAA

4-Button Flip; 315 MHz.

Ford

Explorer

2011

2015

Smart Key

164-R8092

--

5921287

--

ZB-Series

M3N5WY8609

Intelligent Access (IA); Proximity.

Ford

Explorer

2016

2017

Smart Key

164-R8163

--

5926060

--

ZB-Series

M3N-A2C31243300

902 MHz Frequency.

Ford

Mustang

2010

2014

Remote Head

164-R8073

H92-PT

5912561

FO-20DE

B11-3

CWTWB1U793

Pony Logo on OEM; 80-bit.

Lincoln

Navigator

2003

2006

Remote Head

164-R7015

H72-PT

693356

FO-15DE

--

CWTWB1U331

4-Button; 40-bit chip.

Mercury

Grand Marquis

1998

2002

Transponder

164-R0455

H72-PT

599179

FO-15D

--

--

4C Glass Chip; Old Style.

Ford

Transit

2015

2020

Remote Key

164-R8126

--

5925981

--

NB-Series

GK2T-15K601

Tibbe keyway on early models; HU101 later.

Ford

Escape

2007

2012

Remote Head

164-R8070

H92-PT

5912560

FO-20DE

B11-3

CWTWB1U793

Check for 80-bit "SA" stamp on 2011+.

Database Note: The transition from Strattec Part # 5912560 (Standard 80-bit IKT) to 5925315 (High Security Flip Key) represents the shift in cutting machinery requirements. Locksmiths must note "Laser Cut" in the key_type or notes column for the 2015+ F-Series to ensure the correct cutting wheel is used.

## 4. Stellantis (Chrysler/Dodge/Jeep/Ram): The Fobik Era and Beyond

Stellantis vehicles (formerly FCA/Chrysler Group) utilize a distinct key evolution path, most notably the "Fobik" system which eliminated the metal blade from the ignition process entirely, relying on a plastic block inserted into the dash (WIN Module).

### 4.1 The Fobik and "Pod Key" Complexity (2008-2018)

For cross-referencing, the "Pod Key" (ILCO Y164-PT, Y170-PT) is a vital aftermarket solution. This is a transponder key cut to the Fobik''s emergency blade profile. It allows the user to start the vehicle via the "Tip Start" mechanism without the expense of a full remote Fobik.

- Y164-PT: Used for older Fobik systems.
- Y170-PT: Used for newer systems; often requires the locksmith to hold the fobik near the antenna coil during programming.

### 4.2 Proximity and High Security Migration

Post-2018, models like the Jeep Wrangler (JL) and Gladiator transitioned to the SIP22 (Fiat style) or high-security internal cut keys, diverging from the traditional Y159 8-cut edge keys.

### 4.3 Stellantis Cross-Reference Database

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Dodge

Ram 1500

2009

2012

Fobik

56046638AC

Y164-PT

5913502

CHR-15E

NB-11

IYZ-C01C

Integrated Remote Key; No Prox.

Dodge

Ram 1500

2013

2018

Fobik

68066873AA

Y170-PT

5923790

--

NB-11

GQ4-53T

"Pod Key" Y170 works as backup.

Dodge

Ram

2019

2023

Smart Key

68291691AC

--

5933934

--

ZB-Series

OHT-4882056

Push-to-Start; New Body Style.

Jeep

Wrangler (JK)

2007

2018

Remote Head

68003389AA

Y164-PT

692960

CHR-15E

NB-Series

OHT692713AA

Standard Y159 Keyway; 3-Button.

Jeep

Wrangler (JL)

2018

2024

Flip Key

68293535AA

SIP22-PT

--

FI-16

NB-Series

OHT1130261

SIP22 High Security Blade.

Jeep

Grand Cherokee

2014

2021

Smart Key

68143505AA

--

5926058

--

ZB-Series

M3N-40821302

Proximity Fob; "Hitag AES".

Chrysler

300

2005

2007

Remote Head

05179513AA

Y160-PT

692325

CHR-15

B22-3

OHT692427AA

Mercedes-style blade structure.

Chrysler

Town & Country

2008

2016

Fobik

05026197AD

Y164-PT

5913502

--

NB-11

IYZ-C01C

Supports Power Sliding Doors.

Dodge

Charger

2011

2018

Smart Key

56046759AA

--

5923758

--

ZB-Series

M3N-40821302

Keyless Go; Proximity.

Jeep

Cherokee (KL)

2014

2021

Smart Key

68105078AG

--

5926090

--

ZB-Series

GQ4-54T

Proximity; Hitag AES 4A Chip.

Ram

ProMaster

2014

2021

Flip Key

68224009AA

SIP22-PT

--

FI-16

NB-Series

2ADFTFI5AM433TX

Marelli System; SIP22 Blade.

Technical Insight: The JMA part "CHR-15E" is a critical SKU for pre-2010 Chrysler products. The suffix ''E'' generally denotes the presence of a chip slot or an included transponder in JMA nomenclature.1

## 5. Toyota/Lexus: The Chip Generation Evolution

Toyota''s system is defined by the transponder generation stamped on the blade. This stamp is the primary identifier for the locksmith.

- Dot/Dimple: 4C/4D chip (Early 2000s).
- G-Stamp: 4D-72 (80-bit) chip (Approx. 2010-2014).
- H-Stamp: 8A (128-bit) chip (Approx. 2013-2019).

### 5.1 Cloning vs. Programming

JMA provides "TPX" chips (TPX1 for 4C, TPX2 for 4D) that allow for cloning without diagnostic tools.3 However, modern "H" chip and "Smart Key" systems often require diagnostic programming (via Techstream or aftermarket programmers) or the use of specific KEYDIY generators like the KD-Mate.4

### 5.2 Toyota Cross-Reference Database

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Toyota

Camry

2012

2014

Remote Head

89070-06420

TOY43-PT

--

TOYO-15E

B01-3

HYQ12BDM

"G" Stamp on blade.

Toyota

RAV4

2013

2018

Remote Head

89070-42D30

TR47-PT

--

TOYO-15

B01-3

HYQ12BDM

"H" Stamp; 8A Chip.

Toyota

Corolla

2014

2019

Remote Head

89070-02880

TOY44H-PT

--

TOYO-36

B01-3

HYQ12BEL

"H" Stamp; 128-bit encryption.

Toyota

Tacoma

2016

2021

Remote Head

89070-04040

TR47-PT

--

TOYO-15

B01-3

HYQ12BDM

"H" Stamp.

Toyota

Highlander

2008

2013

Remote Head

89070-48130

TOY43-PT

--

TOYO-15E

B01-3

HYQ14AAB

"G" Stamp (2011+); Dot (Pre-2011).

Lexus

RX350

2010

2015

Smart Key

89904-48190

--

--

--

ZB-Series

HYQ14ACX

Proximity; PCB 271451-5300.

Scion

tC

2011

2016

Remote Head

89070-21120

TOY43-PT

--

TOYO-15E

B01-3

HYQ12BBY

"G" Stamp.

Toyota

Tundra

2007

2017

Remote Head

89070-0C050

TR47-PT

--

TOYO-15

B01-3

HYQ12BBY

Dot or G stamp depending on year.

Toyota

Sienna

2011

2020

Smart Key

89904-08010

--

--

--

ZB-Series

HYQ14ADR

5-Button Smart Key (Sliding Doors).

Toyota

Prius

2010

2015

Smart Key

89904-47230

--

--

--

ZB-Series

HYQ14ACX

Silver Logo Fob.

Toyota

4Runner

2010

2019

Remote Head

89070-35170

TOY43-PT

--

TOYO-15E

B01-3

HYQ12BBY

"G" or "H" stamp variation.

## 6. Honda/Acura: The High-Security Standard

Honda''s ecosystem is heavily reliant on the "Laser Cut" (HO01/HO03) keyway. Unlike other brands where high security is a premium feature, Honda standardized this early.

### 6.1 Remote Logic and FCC IDs

Honda remote head keys are notoriously specific regarding FCC IDs. The transponder and remote functions are often separate modules within the same head. A critical distinction is the "V-Chip" (HO03-PT) versus older chips.

- KEYDIY Utility: KEYDIY "B" series remotes are highly compatible with Honda because they allow the locksmith to install a separate carbon chip into the remote shell, matching Honda''s "separate logic" architecture effectively.

### 6.2 Honda Cross-Reference Database

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Honda

Accord

2008

2012

Remote Head

35118-TA0-A00

HO03-PT

5907553

HOND-24

B11-4

OUCG8D-380H-A

HO03 is non-remote blank; 4-Button.

Honda

Civic

2006

2013

Remote Head

35118-SNA-A11

HO03-PT

--

HOND-24

B11-3

N5F-S0084A

High Security; 3-Button.

Honda

CR-V

2007

2013

Remote Head

35118-SWA-A01

HO03-PT

--

HOND-24

B11-3

OUCG8D-380H-A

Standard Remote Head.

Honda

Odyssey

2011

2013

Remote Head

35118-TK8-A10

HO03-PT

--

HOND-31

B11-5

N5F-A04TAA

5-Button (Sliding Doors).

Acura

MDX

2007

2013

Remote Head

35118-STX-A01

HO03-PT

--

HOND-31

B11-4

OUCG8D-439H-A

Driver 1/2 Memory specific.

Honda

Pilot

2009

2015

Remote Head

35118-SZA-A02

HO03-PT

--

HOND-31

B11-4

KR55WK49308

Trunk release button.

Honda

Accord

2013

2015

Remote Head

35118-T2A-A20

HO05-PT

--

--

NB-Series

MLBHLIK6-1T

G-Blade; Integrated Chip.

Honda

Civic

2014

2020

Smart Key

72147-TBA-A11

--

--

--

ZB-Series

KR5V2X

Proximity Fob; 433 MHz.

Acura

TL

2009

2014

Smart Key

72147-TK4-A01

--

--

--

ZB-Series

M3N5W8406

Proximity; Slot for emergency blade.

Honda

Fit

2009

2013

Remote Head

35118-TK6-A00

HO03-PT

--

HOND-24

B11-3

OUCG8D-380H-A

HO01 keyway on some older models.

## 7. Nissan/Infiniti: BCM and Intelligent Keys

Nissan''s key programming is heavily dependent on Body Control Module (BCM) PIN codes. The physical keys range from the standard NSN14 (10-cut) keyway to the Intelligent Key (Oval Fob).

### 7.1 Twist Knob vs. Push-to-Start

A common point of confusion is the "Twist Knob" Intelligent Key (used on Versa/Rogue approx. 2008-2013). These fobs look like smart keys but utilize a mechanical emergency key (NSN14) to turn a plastic ignition knob. These require different aftermarket remotes (KEYDIY B-Series) than the true Push-to-Start fobs (KEYDIY ZB-Series).

### 7.2 Nissan Cross-Reference Database

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Nissan

Altima

2007

2012

Smart Key

285E3-JA02A

--

692059*

DAT-15

ZB-Series

KR55WK48903

"Intelligent Key" (Push Start).

Nissan

Rogue

2008

2013

Smart Key

285E3-JM00D

--

--

DAT-15

ZB-Series

CWTWB1U751

Twist Knob Ignition system.

Nissan

Sentra

2007

2012

Transponder

H0564-ET000

NI04-T

7003526

DAT-15

--

--

Non-Remote; 46 Chip.

Nissan

Versa

2007

2012

Remote Head

H0561-C993A

NI04-T

--

DAT-15

B01-3

CWTWB1U751

Remote integrated into head.

Infiniti

G37

2009

2013

Smart Key

285E3-1NC0D

--

--

--

ZB-Series

KR55WK49622

Oval Fob; Push Start.

Nissan

Titan

2004

2015

Remote Head

28268-7Z800

NI04-T

--

DAT-15

B01-3

CWTWB1U331

Separate remote/key on older years.

Nissan

Maxima

2009

2014

Smart Key

285E3-9N00A

--

--

--

ZB-Series

KR55WK49622

4-Button Smart Key.

Nissan

Frontier

2005

2018

Remote Head

28268-EA000

NI04-T

--

DAT-15

B01-3

CWTWB1U343

Keyway is NSN14.

Infiniti

QX60

2013

2016

Smart Key

285E3-3JA0A

--

--

--

ZB-Series

S180144020

New style square fob.

Nissan

Juke

2011

2017

Smart Key

285E3-1KA0D

--

--

--

ZB-Series

CWTWB1U825

Unique styling; Push Start.

Note: Strattec 692059 is typically the mechanical key blank insert or non-transponder blank for these models.

## 8. Hyundai/Kia: The Flip Key Standard

Hyundai and Kia utilize a robust High Security Laser Key system (HY18/KK10) for most vehicles post-2011.

### 8.1 The KEYDIY Advantage

KEYDIY is exceptionally strong in the Hyundai/Kia aftermarket. Because Hyundai/Kia flip keys differ largely by the PCB layout and transponder type (46 vs 60 vs 47) rather than physical shape, the KEYDIY "NB" multifunction remotes can generate a working remote for almost any 2010-2018 model, reducing the need to stock dozens of specific OEM part numbers like 95430-3Q000, 95430-3X500, etc.

### 8.2 Hyundai/Kia Cross-Reference Database

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Hyundai

Sonata

2011

2014

Flip Key

95430-3Q000

HY18-PT

--

HY-18

NB-Series

OSLOKA-870T

4-Button Flip; High Security.

Hyundai

Elantra

2011

2016

Flip Key

95430-3X500

HY18-PT

--

HY-18

NB-Series

OSLOKA-950T

4-Button; Trunk release.

Kia

Optima

2011

2013

Flip Key

95430-2T000

KK10-PT

--

KIA-7

NB-Series

NYOSEKS-TF10ATX

Laser cut blade (KK10).

Kia

Soul

2010

2013

Flip Key

95430-2K250

KK8-PT

--

KIA-3

NB-Series

NYOSEKS-AM08TX

Note specific blade (KIA3/KK8).

Hyundai

Santa Fe

2013

2018

Smart Key

95440-4Z200

--

--

--

ZB-Series

SY5DMFNA433

Proximity; Push-to-Start.

Kia

Sorento

2014

2015

Smart Key

95440-1U500

--

--

--

ZB-Series

SY5HMFNA04

Proximity system.

Hyundai

Tucson

2010

2015

Flip Key

95430-2S201

HY18-PT

--

HY-18

NB-Series

TQ8-RKE-3F04

4-Button Flip.

Kia

Forte

2014

2018

Flip Key

95430-A7100

KK12-PT

--

KIA-9

NB-Series

OSLOKA-875T

KK12 Blade (Center mill).

Hyundai

Accent

2012

2017

Flip Key

95430-1R000

HY18-PT

--

HY-18

NB-Series

OKA-N028

Standard High Security.

Kia

Sportage

2011

2013

Smart Key

95440-3W000

--

--

--

ZB-Series

SY5HMFNA04

Proximity Fob.

## 9. European Markets: BMW, Mercedes, VW/Audi

This segment represents the highest tier of technical complexity. While Ilco and JMA provide high-quality key blanks (metal blades), the electronic programming of these keys often requires specialized equipment (Autel, Xhorse, AVDI) rather than simple cloning.

### 9.1 BMW Systems (E-Series to F-Series)

- EWS (1995-2006): Fixed code rolling.
- CAS (2002-2014): Car Access System. Requires OBD programming.
- FEM/BDC (2012+): Front Electronic Module. Requires EEPROM work or advanced OBD tools.
- Aftermarket: KEYDIY ZB-Series smart keys are essential for FEM/BDC applications, replacing expensive OEM fobs.

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

BMW

3-Series (E46)

1999

2005

Remote Key

66126955748

BMW-HU92

--

BM-6

NB-Series

LX8 FZV

"Diamond Key"; Rechargeable bat.

BMW

5-Series (E39)

1997

2003

Remote Key

66126933077

BMW-HU58

--

BM-5

NB-Series

LX8 FZV

Old 4-track blade (HU58).

BMW

3-Series (E90)

2006

2011

Smart Fob

66126986583

--

--

--

ZB-Series

KR55WK49127

Slot Key (CAS3 system).

BMW

X5 (E70)

2007

2013

Smart Fob

66129268488

--

--

--

ZB-Series

KR55WK49127

CAS3/CAS3+.

BMW

F-Series

2012

2018

Smart Fob

66128723602

--

--

--

ZB-Series

YGOHUF5662

FEM/BDC System; 315/433 MHz.

BMW

Z4 (E85)

2003

2008

Remote Key

66126955750

BMW-HU92

--

BM-6

NB-Series

LX8 FZV

HU92 Blade.

BMW

7-Series (E65)

2002

2008

Smart Fob

66126933078

--

--

--

--

LX8766S

Unique 7-series Card Fob.

Mini

Cooper

2007

2014

Smart Fob

66123456368

--

--

--

ZB-Series

KR55WK49333

Round "Pie" Fob; CAS3.

BMW

X3 (F25)

2011

2017

Smart Fob

66129296336

--

--

--

ZB-Series

YGOHUF5662

CAS4 System.

BMW

5-Series (F10)

2011

2016

Smart Fob

66129268486

--

--

--

ZB-Series

YGOHUF5662

CAS4/CAS4+.

### 9.2 Mercedes-Benz (FBS3/FBS4)

Mercedes keys (FBS3 - Das 3) use Infrared (IR) technology.

- OEM Limitation: "FBS4" (approx. 2015+) keys are dealer-only and cannot currently be programmed by standard aftermarket tools.
- Aftermarket: For FBS3 (pre-2015), "BE" keys (supplied by KEYDIY/Xhorse) are the standard solution. OEM part numbers are rarely used by locksmiths due to "TRP" (Theft Relevant Part) restrictions.

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

Mercedes

C-Class (W204)

2008

2014

IR Fob

A2049056202

MB-HU64

--

ME-HM

FBS3-BE

IYZ3312

Chrome Key; FBS3 System.

Mercedes

E-Class (W211)

2003

2009

IR Fob

A2117663601

MB-HU64

--

ME-HM

FBS3-BE

IYZ3312

Plastic black key style.

Mercedes

ML-Class (W164)

2006

2011

IR Fob

A1647602206

MB-HU64

--

ME-HM

FBS3-BE

IYZ3312

FBS3.

Mercedes

S-Class (W221)

2007

2013

IR Fob

A2217663601

MB-HU64

--

ME-HM

FBS3-BE

IYZ3312

FBS3.

Mercedes

Sprinter

2007

2018

Remote Key

A9067602206

--

--

--

NB-Series

IYZ3312

Blade key with remote (Dodge/FL).

Mercedes

SLK (R171)

2005

2011

IR Fob

A1717660201

MB-HU64

--

ME-HM

FBS3-BE

IYZ3312

FBS3.

Mercedes

CLS (W219)

2006

2011

IR Fob

A2197660101

MB-HU64

--

ME-HM

FBS3-BE

IYZ3312

FBS3.

Mercedes

GLK (X204)

2010

2015

IR Fob

A2049051104

MB-HU64

--

ME-HM

FBS3-BE

IYZ3312

FBS3.

Mercedes

GLA (X156)

2014

2019

IR Fob

A1569053200

--

--

--

--

FBS4

Dealer Only (FBS4 System).

Mercedes

CLA (C117)

2014

2019

IR Fob

A1179053200

--

--

--

--

FBS4

Dealer Only (FBS4 System).

### 5.3 Volkswagen/Audi (MQB & Legacy)

The defining characteristic here is the HU66 keyway (standard for decades) transitioning to the HU162T (side cut) on newer MQB platforms.

- KEYDIY Utility: KEYDIY "XK" (Wired) remotes are heavily used for older VWs (Golf Mk4/Mk5) as they are robust and cheap to generate.

make

model

year_start

year_end

key_type

oem_part_number

ilco_part

strattec_part

jma_part

keydiy_part

fcc_id

notes

VW

Jetta

2002

2005

Flip Key

1J0959753AM

HU66-PT

--

VO-2

B01-3

HLO1J0959753AM

"AM" Remote; 315 MHz.

VW

Jetta

2006

2010

Flip Key

1K0959753H

HU66-PT

--

VO-2

NB-Series

NBG92596263

CAN Bus System.

VW

Passat

2006

2014

Fob Key

3C0959752BA

--

--

--

NB-Series

NBG009066T

"Comfort Key" (Push Dash).

VW

Golf

2010

2014

Flip Key

5K0837202AE

HU66-PT

--

VO-2

NB-Series

NBG010180T

G-Chip equivalent logic.

Audi

A4 (B7)

2005

2008

Flip Key

8E0837220L

HU66-PT

--

AU-2

NB-Series

8E0837220L

315MHz; ID48 Chip.

Audi

A4 (B8)

2009

2016

Smart Key

8K0959754G

--

--

--

ZB-Series

IYZFBSB802

"Slot Key"; BCM2 System.

VW

Tiguan

2009

2017

Flip Key

5K0837202AE

HU66-PT

--

VO-2

NB-Series

NBG010180T

ID48 CAN chip.

VW

Beetle

1998

2001

Flip Key

1J0959753F

HU66-PT

--

VO-2

B01-3

HLO1J0959753F

Older Banjo shape remote.

Audi

Q5

2009

2017

Smart Key

8T0959754C

--

--

--

ZB-Series

IYZFBSB802

BCM2 System.

VW

GTI

2015

2020

Flip Key

5G0959752A

--

--

--

NB-Series

NBGFS12A01

MQB Platform; HU162T Blade.

## 10. The Universal Remote Revolution: KEYDIY & JMA

The future of automotive locksmithing lies in "Universal Generation." Instead of stocking 50 different GM flip keys, a locksmith stocks 50 KEYDIY "NB-Series" remotes and generates the software for the specific vehicle on demand.

### 10.1 KEYDIY Blade Reference Chart

To use universal remotes, the locksmith must attach the correct key blade. This table cross-references the vehicle make to the KEYDIY/JMA blade number.

Keyway Profile

Vehicle Make

KEYDIY Blade #

JMA Blade #

Notes

HU100

GM (2010+)

#71

GM-30E

High Security (Z-Keyway)

B106/B111

GM (Pre-2010)

#69

GM-37

Standard Edge Cut

HU101

Ford (2011+)

#38

FO-20DE

High Security "Laser"

H75

Ford (Pre-2011)

#19

FO-15DE

Standard Edge Cut

Y159

Chrysler/Dodge

#04

CHR-15

Edge Cut 8-Cut

SIP22

Ram/Jeep (New)

#111

FI-16

Fiat Style High Security

TOY43

Toyota (Old)

#02

TOYO-15

Standard Edge Cut

TR47/TOY48

Toyota (New)

#15

TOYO-36

High Security Short Blade

HO01

Honda

#25

HOND-31

High Security Laser

NSN14

Nissan

#22

DAT-15

Standard 10-Cut

HY18

Hyundai/Kia

#129

HY-18

High Security (Center)

KK10

Kia

#10

KIA-7

High Security (Offset)

HU66

VW/Audi

#42

VO-2

Standard VAG Laser

HU92

BMW (E-Series)

#67

BM-6

2-Track High Security

HU64

Mercedes

#24

ME-HM

2-Track Laser

## 11. Conclusion

This research establishes a functional, multi-layered database for automotive locksmiths. By cross-referencing Strattec (the OEM source), Ilco (the mechanical standard), JMA (the cloning alternative), and KEYDIY (the universal inventory solution), this document bridges the gap between part numbers and vehicle security architectures. The database provided here is designed to be ingested into inventory management systems, allowing locksmiths to instantly identify that a request for a "2015 Chevy Silverado Key" can be serviced by an OEM Strattec 5922534, a clonable Ilco B119-PT, or a generated KEYDIY NB-ETT-GM, depending on the customer''s budget and the locksmith''s available stock.

#### Works cited

1. AUTOMOTIVE ILCO/OEM CROSS REFERENCE* - semarca.com, accessed December 11, 2025, https://www.semarca.com/aloamembers.org/pdfs/automotive-ilco-oem-cross-eference.pdf
1. JMA USA | Machines, Keys, and More | American Key Supply, accessed December 11, 2025, https://www.americankeysupply.com/category/jma-usa-products-894
1. What Are Tpx1 Tpx2 Tpx3 Tpx4 | PDF | Motor Vehicle Manufacturers - Scribd, accessed December 11, 2025, https://www.scribd.com/document/359571579/What-Are-Tpx1-Tpx2-Tpx3-Tpx4
1. KeyDiy KD-Mate Key Programmer For KD-X2 & KD-MAX ABK-5100 - ABKEYS, accessed December 11, 2025, https://abkeys.com/products/keydiy-kd-mate-key-programming-device-for-x2-and-kd-max-5100', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Nissan Locksmith Programming Guide', 'Nissan', 'General', 2010, 2024, '

# Definitive Locksmith Programming Guide: Nissan Automotive North America (2000–2025)

## Executive Summary

The landscape of automotive security has undergone a radical transformation over the last quarter-century, evolving from simple resistor-based keys to complex, encrypted, bi-directional communication networks. For the professional locksmith operating in the North American market, Nissan’s implementation of the Nissan Anti-Theft System (NATS) and Nissan Vehicle Immobilizer System (NVIS) presents a unique set of challenges that differ significantly from domestic counterparts like Ford’s Passive Anti-Theft System (PATS) or other Asian manufacturers such as Hyundai.

This comprehensive research report serves as an exhaustive technical reference for the top-tier professional. It dissects the operational theory of Nissan’s security architecture, details the evolution of transponder technologies from fixed-code Texas Instruments chips to modern 128-bit AES encryption, and provides granular programming procedures. Furthermore, this analysis integrates a comparative study of industry standards, contrasting Nissan’s protocols with the detailed specifications of Hyundai’s SMARTRA systems 1 and Ford’s PATS architectures.1 By understanding the divergent engineering philosophies—such as Nissan’s reliance on Body Control Module (BCM) PIN calculations versus Ford’s Parameter Reset requirements 1 or Hyundai’s transition to Security Gateway (SGW) digital certificates 1—the locksmith gains the diagnostic intuition necessary to resolve complex "All Keys Lost" (AKL) scenarios and module failures.

The following sections detail the specific generations of NATS, the cryptographic imperatives of PIN code extraction, the mechanical nuances of the NSN14 keyway, and the specialized diagnostic procedures required for the Electronic Steering Column Lock (ESCL), a critical failure point unique to the Nissan ecosystem.

## Section 1: Immobilizer System Architecture and Theoretical Evolution

To master Nissan key programming, one must first understand the underlying architecture that governs the vehicle''s decision to authorize engine start. Unlike early mechanical systems where the key simply closed a circuit, modern NVIS architectures utilize a tripartite digital handshake between the Transponder (Key), the Immobilizer Control Unit (ICU/Antenna), and the Body Control Module (BCM), which ultimately commands the Engine Control Module (ECM).

### 1.1 The Centrality of the Body Control Module (BCM)

In the majority of Nissan vehicles produced after 2000, the BCM serves as the primary gatekeeper of the vehicle’s security network. This architectural choice distinguishes Nissan from other manufacturers. For instance, in Ford’s PATS system, particularly Types B, C, and E, the key data is often stored directly in the Powertrain Control Module (PCM) or requires a "Parameter Reset" to synchronize the cluster and PCM.1 In contrast, Nissan’s architecture is BCM-centric. The BCM stores the key IDs and performs the cryptographic validation.

When a key is inserted or the push-start button is depressed, the NATS antenna energizes the transponder chip. The chip transmits its unique ID to the BCM. The BCM verifies this ID against its internal memory (EEPROM). If the ID is recognized, the BCM sends a specific encrypted release signal to the ECM via the CAN-bus network. If the ECM receives the correct signal, it enables the fuel injectors and spark. If the signal is missing or incorrect—common in cases of BCM replacement or data corruption—the engine may crank but will not start, or will start and immediately stall.

This centralization simplifies certain aspects of module replacement compared to Ford’s RH850 BCMs which require bench reading for D-Flash extraction on 2021+ models 1, but it introduces high stakes for PIN code management. Accessing the BCM’s programming mode requires a specific PIN code derived from the BCM’s identity, a protocol that has evolved through several generations of increasing complexity.

### 1.2 Evolution of NATS Generations

Nissan’s security evolution can be categorized into distinct phases, each requiring specific transponder types and PIN code calculation methods. This progression mirrors the industry-wide shift towards higher encryption standards, as seen in Hyundai’s move from basic SMARTRA-2 systems to the high-security Gateway architecture.1

#### Phase 1: NATS 5 / 5.6 (The 40-Bit Era)

Prevalent in the early 2000s (e.g., 2000-2006 Maxima, Altima, Frontier), this generation utilized Texas Instruments (TI) 4D-60 transponders with 40-bit encryption.

- Operational Theory: The system uses a fixed "Challenge-Response" mechanism. The BCM sends a random number (challenge) to the key; the key processes it using its 40-bit logic and returns a signature.
- Industry Comparison: This era runs parallel to Ford’s PATS II introduction of the 4D-60 chip (1998-2005).1 While both manufacturers used similar hardware from Texas Instruments, their implementation differed. Ford utilized a timed security access (10 minutes) for adding keys 1, whereas Nissan implemented a 4-digit PIN code derived from the 5-digit alphanumeric code printed on the BCM label.
- Legacy: While largely phased out of passenger cars, the NATS 5 architecture persisted in commercial vehicles like the NV200 and older Frontiers well into the 2010s, requiring locksmiths to maintain legacy cloning tools and 4D-60 inventory.

#### Phase 2: NATS 6 and the Intelligent Key (The ID46 Era)

Beginning around 2007 (coinciding with the launch of the Intelligent Key systems in the Altima and G35), Nissan transitioned to the Philips/NXP PCF7936 chip, utilizing HITAG 2 encryption (ID46).

- Operational Theory: HITAG 2 offers mutual authentication and 48-bit encryption, significantly harder to clone than the 4D-60.
- Industry Comparison: This aligns with Hyundai’s Generation 2 "SMARTRA-3" system (2010-2016), which also standardized on ID46 (PCF7936) technology.1 Both manufacturers recognized the need for stronger encryption standards during this period.
- Configuration: This era introduced the "Twist Knob" ignition—a hybrid between mechanical and keyless systems—and the dedicated Push-Button Start.

#### Phase 3: Modern Security (The 128-Bit Era)

From 2013 onward, starting with the Altima and Pathfinder, Nissan began migrating to 128-bit AES encryption chips (ID47/HITAG 3) and later to ID4A (HITAG-AES).

- Cryptographic Leap: The move to 128-bit AES renders traditional "sniffing" and cloning attacks obsolete without sophisticated server-side calculation.
- Comparison: This trajectory is identical to Hyundai’s shift to Generation 3 (Integrated BCM/Smart Key) using ID47 chips in 2017+ models 1 and Ford’s adoption of HITAG Pro (ID49) in 2015+ F-150s.1 The entire industry coalesced around NXP’s advanced encryption standards to combat relay attacks and high-tech theft.

## Section 2: Transponder Chip Specifications and Management

Correctly identifying the transponder chip is the single most critical step in key origination. Using the wrong chip family will result in a failed programming attempt, often without a clear error message from the diagnostic tool. A locksmith must maintain a diverse inventory of specific chips, as cross-compatibility is limited.

### 2.1 The Texas Instruments Family (4D)

The 4D-60 chip is a robust, ceramic or glass-encapsulated transponder.

- Identification: Reads as TI 4D-60 (40-bit) on tools like the Xhorse Key Tool Plus or Autel XP400.
- Compatibility: It is crucial to note that while Ford also used 4D-60 chips 1, the memory pages are configured differently. A Ford-formatted 4D-60 chip cannot be programmed to a Nissan without unlocking and re-formatting the data pages to the Nissan specification.
- Applications: 2000-2006 Altima/Maxima, 2002-2018 Frontier, 2004-2015 Titan, 2012-2019 NV1500/2500/3500.

### 2.2 The Philips/NXP Family (ID46)

The ID46 chip (PCF7936) became the standard for the "Intelligent Key" era.

- Modes of Operation:

- Password Mode: The chip operates in "Password" mode for programming, requiring the BCM to write a specific secret key to the transponder''s memory pages.
- Lock Status: Once programmed, the "Lock Bit" is set, preventing the chip from being reprogrammed to a different vehicle. This is a critical distinction from the earlier 4D-60s which were often reusable.

- Comparison: Hyundai vehicles from the SMARTRA-3 era (2010-2016) also use the ID46 PCF7936.1 A locksmith stocking "Blank PCF7936" chips can theoretically use them for both Nissan and Hyundai applications, provided the chips are in "virgin" manufacturer mode before programming.
- Applications: 2007-2012 Altima, 2008-2013 Rogue, 2007-2012 Sentra, 2009-2014 Maxima, 2007-2012 Versa.

### 2.3 The HITAG 3 / ID47 Family

The introduction of the "Tear Drop" and later "Square" shaped fobs marked the transition to ID47 (NXP NCF2951).

- Security Features: These chips utilize 128-bit encryption and are strictly "One-Time Programmable" (OTP) regarding the vehicle class. A used Nissan ID47 key is generally "locked" and cannot be reprogrammed to another vehicle without specialized "Unlocking" hardware that resets the firmware of the key itself.
- Industry Context: This mirrors the strict "Virgin Key Only" requirement found in Hyundai’s 2017+ smart key models.1 In both cases, attempting to program a used key will result in a "Security Access Denied" or "Key Registration Failed" error.
- Applications: 2013-2018 Altima, 2014-2020 Rogue, 2013-2020 Pathfinder, 2016-2019 Titan (Push Start).

### 2.4 The HITAG-AES / ID4A Family (2019+)

The latest generation, often referred to as "New System" or "Pre-Safe," utilizes ID4A chips.

- Complexity: These keys are part of a system that requires a 22-digit PIN code calculation (discussed in Section 3).
- Applications: 2019+ Altima, 2020+ Sentra, 2020+ Versa, 2021+ Rogue.
- Comparison: Hyundai also transitioned to ID4A (PCF7961M) for their 2019+ models like the Venue and Santa Fe 1, confirming an industry-wide standardization on this NXP architecture.

### 2.5 Transponder Reference and Compatibility Table

The following table synthesizes the relationship between vehicle era, system type, and required transponder technology.

Era

System Type

Transponder Chip

Frequency

Keyway Profile

Typical Models

2000–2006

NATS 5 (Legacy)

TI 4D-60 (40-bit)

N/A (Chip Only)

DA34 / NSN14

Maxima, Altima, Frontier, Xterra

2007–2012

Intelligent Key (Twist)

ID46 (PCF7936)

315 MHz

NSN14

Rogue, Versa, Sentra, Qashqai

2007–2014

Intelligent Key (Push)

ID46 (PCF7952)

315 MHz

NSN14 (Blade)

Altima, Maxima, G37, 370Z

2013–2018

NATS 6 / Prox

ID47 (HITAG 3)

433 MHz

NSN14

Altima, Rogue, Pathfinder, Murano

2019–2025

Modern Prox

ID4A (HITAG-AES)

433 MHz

NSN14

Sentra, Versa, Rogue, Kicks

2016+

Commercial / Truck

ID46 Extended

315 MHz

NSN14

Titan, Frontier (Steel Key)

## Section 3: Cryptography and PIN Code Extraction Algorithms

The definitive skill of the Nissan locksmith is the ability to manage PIN codes. Unlike Ford systems where security access might be time-based (the 10-minute wait on PATS) 1 or Hyundai’s reliance on VIN-to-PIN databases 1, Nissan relies almost exclusively on a mathematical relationship between the BCM identification number and the PIN code.

### 3.1 The 5-Digit to 4-Digit Conversion (Legacy)

On older NATS systems (pre-2009), the PIN was calculated from a 5-digit alphanumeric code found on the BCM label.

- Mechanism: The BCM label contains a code (e.g., "2541A").
- Calculation: Proprietary algorithms, now standard in almost all programming tools, convert this code into a 4-digit PIN (e.g., "8542").
- Tooling: Historically, locksmiths used handheld calculators or software like "Nissan SuperCode." Modern tools like the Autel IM608 perform this calculation automatically in the background during the "Add Key" process.

### 3.2 The 20-Digit Rolling Code System (2013+)

Starting with the 2013 Altima and 2014 Rogue, Nissan introduced a dynamic rolling code system to defeat static PIN theft.

- The Challenge: When the diagnostic tool queries the BCM, the BCM generates a random 20-digit "Challenge" string. This string changes every time the ignition is cycled or the BCM is re-queried.
- The Response: The locksmith tool must capture this 20-digit string, process it through a secure algorithm (often requiring online server access), and return a corresponding 20-digit "Response" PIN to the BCM.
- Time Sensitivity: Because the code is rolling, the calculation must be performed and entered immediately. If the tool disconnects or the ignition cycles, the BCM generates a new challenge, rendering the calculated PIN invalid. This requires a stable connection and reliable tools.
- Comparison to Ford/Hyundai: This approach is significantly more complex than the static 6-digit PINs used by Hyundai (which can be read via OBD on Autel/Lonsdor tools).1 It aligns more closely with the "Incode/Outcode" system used on older Fords, but with much higher entropy (20 digits vs 6 digits).

### 3.3 The 22-Digit "Pre-Safe" System (2020+)

Found on the newest platforms (Sentra B18, Rogue T33), this system escalates the security further.

- Requirement: Accessing the programming functions requires a 22-digit PIN calculation.
- Server Dependency: Unlike the 4-digit or even some 20-digit codes which could be calculated offline by powerful handhelds, the 22-digit system almost invariably requires an internet connection. The diagnostic tool sends the data to a manufacturer-authorized server (or a third-party equivalent like NASTF VSP registry) to resolve the calculation.
- Cost Implications: Similar to the token costs associated with FCA Secure Gateway access or sophisticated Ford AKL solutions 1, accessing these Nissan PINs often incurs a "Server Calculation Fee" or requires an active tool subscription.

### 3.4 BCM Label vs. Electronic ID

A critical diagnostic pitfall occurs when a BCM has been replaced with a used unit (common in repair shops).

- The Mismatch: The physical sticker on the BCM might show one ID (e.g., from the donor car), but the electronic ID broadcast over CAN-bus might differ.
- Best Practice: Always prioritize the Electronic Read (via OBD-II) over the physical label. If the tool cannot read the BCM ID electronically (due to CAN communication faults), programming cannot proceed via calculation.

## Section 4: The Intelligent Key Systems – Twist Knob vs. Push Button

Nissan’s implementation of "Keyless Go" comes in two distinct flavors, each with unique mechanical and electronic characteristics that dictate the programming workflow.

### 4.1 The Twist Knob System (Intelligent Key with Mechanical Override)

Prevalent on the Rogue (2008-2013), Versa, and Sentra, this system represents a transition technology.

- Hardware: The vehicle has a mechanical ignition cylinder, but it is covered by a plastic "Knob." The user can turn the knob without inserting a key if the fob is detected inside the cabin.
- The Emergency Blade: Hidden inside the fob is a mechanical key blade (NSN14). If the fob battery dies, the user removes the plastic knob cap and inserts the blade to turn the ignition manually.
- The Electronic Steering Column Lock (ESCL): This system relies heavily on an ESCL to lock the column when the car is off. The ESCL is a major failure point (detailed in Section 7). If the ESCL does not unlock, the ignition knob will not turn, even with a programmed key.
- Programming Nuance: When programming "All Keys Lost" on a Twist Knob system, the locksmith must insert the mechanical blade into the ignition to turn it ON. The antenna reads the chip in the fob (held near the ignition) or the blade itself if it is a transponder-equipped key.

### 4.2 The Push-Button Start (PBS) System

The modern standard found on Altima, Maxima, and newer Rogues.

- Hardware: A simple "Start/Stop" button replaces the ignition cylinder.
- Key Registration: Unlike Ford, which typically uses a dedicated "Backup Slot" in the cupholder or console for programming 1, Nissan typically uses the Start Button itself as the antenna.
- Programming Procedure: The tool prompts the user to "Touch the Start Button with the Logo End of the Remote." This inductive coupling allows the Start Button’s internal antenna to energize the chip in the fob even if the fob battery is dead.
- Visual Feedback: Successful programming is often indicated by the Immobilizer Security Light (on the dashboard) flashing 5 times. This visual confirmation is a hallmark of Nissan programming, similar to the door lock cycle confirmation used in Ford procedures.1

## Section 5: Detailed Programming Procedures and Tool Walkthroughs

This section provides step-by-step procedures for the most common programming scenarios, utilizing the Autel IM508/IM608 and SmartPro platforms. These procedures are synthesized to represent the "Best Practice" workflow for a professional locksmith.

### 5.1 Scenario A: 2011 Nissan Rogue (Twist Knob) - All Keys Lost

System: NATS 6 / Intelligent Key / ID46 Chip.

Prerequisites: Vehicle battery > 12.5V. Lishi NSN14 tool. New ID46 Fob.

1. Mechanical Access: Use the Lishi NSN14 2-in-1 tool to pick the driver’s door lock. Decode the lock heights (Positions 1-8/10) to cut a new emergency blade.
1. Ignition Access: Insert the newly cut emergency blade into the ignition knob. This allows you to turn the ignition to the ON position. Note: If the ignition does not turn, suspect ESCL failure.
1. Tool Connection: Connect the Autel IM608 to the OBD-II port.
1. Menu Selection: IMMO > Nissan > System Selection > Intelligent Key System > Remote Control Learning.
1. PIN Extraction: Select Read BCM Code. The tool reads the 5-digit BCM ID and automatically calculates the 4-digit PIN (e.g., 5523).
1. Programming Sequence:

- Select Program Smart Key.
- The tool will verify the PIN.
- Instruction: "Insert the key into the ignition and turn ON." (Use the mechanical blade).
- The Security Light will illuminate solid, then flash 5 times.
- Turn Ignition OFF. Remove Key.
- Remote Learning: Press the UNLOCK button on the Smart Key while holding it near the ignition antenna.
- Turn Ignition ON with the mechanical blade again. Wait for flashes. Turn OFF.

1. Closing the Loop: Open and close the driver’s door to terminate the programming session. Test the remote functions and the Twist Knob start (without the blade inserted).

### 5.2 Scenario B: 2016 Nissan Altima - Add Smart Key

System: Push-to-Start / ID47 Chip / 20-Digit Rolling Code.

1. Verification: Verify the new key is the correct frequency (433 MHz) and chip type (ID47). Used keys cannot be programmed.
1. Connection: Connect Autel/SmartPro.
1. Menu Selection: Nissan > Altima > 2013-2018 > Smart Key > Add Key.
1. Security Access: The tool reads the 20-digit Challenge from the BCM.

- Autel: Automatically sends data to the server and retrieves the calculation (requires internet).
- SmartPro: Consumes a token/usage count to calculate the code.

1. Programming Mode:

- The tool prompts: "Touch the Start Button with the first programmed key."
- Press Start Button (Ignition ON). Dashboard lights up.
- Touch the New Key to the Start Button.
- Watch for the Security Light to flash 5 times.
- Turn Ignition OFF.

1. Verification: Test proximity functions (Lock/Unlock/Trunk) and Proximity Start (start engine with key in pocket).

### 5.3 Comparative Tool Analysis

- Autel IM508/IM608: The industry workhorse.

- Pros: Excellent coverage of rolling codes; typically free calculation for 20-digit systems.
- Cons: Can struggle with the absolute newest 2023+ protocols without the 16+32 adapter.
- Comparison: Just as Autel is preferred for Hyundai ID46 reading 1, it is the go-to for Nissan BCM Pin calculation.

- SmartPro (Advanced Diagnostics):

- Pros: Extremely reliable "Nissan 2020+" software module. Handles server-side calculations seamlessly.
- Cons: Token costs can be high for modern vehicles.

- Lonsdor K518 Pro:

- Pros: Known for speed. The K518 includes a dedicated Nissan calculator.
- Comparison: Lonsdor was the first to support Hyundai PIN reading 1, and it similarly leads in providing "Simulation" capabilities for Nissan, allowing an emulator to act as a working key in AKL situations to bypass the BCM alarm state.

## Section 6: Mechanical Lock Systems and Lishi Procedures

While electronics dominate, the mechanical interface remains the locksmith’s primary point of entry.

### 6.1 The NSN14 Keyway

The NSN14 is the standard high-security keyway used by Nissan from 2002 to present.

- Structure: A 10-cut, 4-track external key.
- Lishi Tool: The "NSN14 2-in-1" is the required tool.
- Decoding Nuance: The door lock typically contains cuts in positions 3 through 10. The ignition contains all cuts 1 through 10.

- Implication: When generating a key from the door lock, cuts 1 and 2 are missing. The locksmith must use progression software (like InstaCode) to calculate the missing cuts or use trial-and-error cutting for positions 1 and 2 until the ignition turns.

- Comparison: This is similar to the Ford HU101 system 1, where the door cylinder may not contain all the wafers necessary to turn the ignition, requiring decoding and code progression.

### 6.2 Legacy Keyways

- DA34: Used on older Nissan trucks (Frontier/Xterra pre-2005). A standard double-sided key, easily picked with a standard Lishi or even a rake tool.
- NSN11: Pre-2000s, mostly obsolete.

## Section 7: Critical Failure Point – The Electronic Steering Column Lock (ESCL)

A unique and pervasive issue in Nissan diagnostics—far more common than in Ford or Hyundai vehicles—is the failure of the Electronic Steering Column Lock (ESCL). This mechanical failure mimics an immobilizer problem, leading to misdiagnosis.

### 7.1 The Mechanism of Failure

The BCM performs a handshake with the ESCL before authorizing the start. If the ESCL is mechanically jammed or its motor fails, it cannot send the "Unlocked" signal to the BCM. Consequently, the BCM forbids the ignition from turning ON (on Twist Knob models) or the engine from cranking (on Push Start models).

### 7.2 Diagnostic Symptoms

- Twist Knob: The key cannot turn the plastic knob. It feels physically locked.
- Push Start: Pressing the Start button results in "No Crank, No Start." The Yellow "Key" light may appear on the dash.
- Audible Check: When pressing the start button, a healthy car produces a distinct zzzt-clunk sound of the steering lock disengaging. Silence indicates ESCL failure.

### 7.3 Troubleshooting and Repair

1. The "Tap" Test: While pressing the Start button/turning the knob, vigorously strike the steering column housing with a rubber mallet. The vibration often frees the stuck motor brushes temporarily, allowing the car to start.
1. Scan Tool Diagnosis: Look for DTCs B2609 (Steering Column Lock Status) or B2610 (Ignition Relay) in the BCM.
1. Emulation: The permanent fix for out-of-warranty vehicles is an ESCL Emulator. This aftermarket device plugs into the ESCL connector and digitally mimics the "Unlocked" signal, permanently bypassing the mechanical lock.

- Note: This solution is unique to Nissan/Infiniti. Hyundai and Ford generally do not suffer from this specific failure mode to the same extent, nor is emulation a standard repair procedure for them.

## Section 8: Security Gateways and Future Technologies (2020+)

The automotive industry''s shift toward secure diagnostics has reached Nissan, paralleling the implementations seen in Ford and Hyundai.

### 8.1 The 16+32 Gateway Adapter

On 2020+ Sentra (B18) and 2021+ Rogue (T33), the OBD-II port is firewalled. The locksmith cannot access the BCM directly from the standard pins to read the PIN or program keys.

- The Hardware Bypass: Unlike Hyundai’s SGW which utilizes a software-based certificate (AutoAuth) accessible via Wi-Fi on the tool 1, Nissan requires a physical bypass.
- Procedure: The locksmith must remove trim panels (often near the BCM or glovebox) to locate the Security Gateway Module. The "16+32" Y-cable is connected in-line, physically bridging the connection and bypassing the firewall logic.
- Comparison: This physical bypass requirement is akin to the "Star Connector" cable used in Chrysler/Jeep vehicles, contrasting with the purely digital solution of Hyundai 1 or the lack of bypass requirement for basic Ford diagnostics.1

### 8.2 Rolling Codes and NASTF

As Nissan moves to the 22-digit Pre-Safe system, the reliance on NASTF (National Automotive Service Task Force) credentials increases. While aftermarket tools can currently calculate many of these codes via overseas servers, the official and most reliable path—especially for 2024+ models—is through a secure data release using a VSP (Vehicle Security Professional) ID, mirroring the strict requirements emerging for the newest Ford RH850 platforms.1

## Section 9: Quick Reference and Best Practices

### 9.1 Battery Voltage

Nissan BCMs, particularly those using Rolling Codes, are extremely sensitive to voltage drops. If the battery voltage dips below 12V during the PIN calculation handshake, the process will fail, and the BCM may enter a temporary lockout. Always connect a jump pack or maintainer (set to 13.5V) during programming.

### 9.2 BCM Lock Mode

If the incorrect PIN is entered 3 to 5 times (depending on generation), the BCM enters "Lock Mode."

- Recovery: Disconnect the vehicle battery for 15-20 minutes. On older NATS 5 systems, leaving the ignition in the ON position for 60 minutes (with a battery charger connected) may be required to reset the timer, a procedure remarkably similar to the Ford PATS lockout reset.1

### 9.3 Key Inventory Essentials

To service the North American market effectively, a locksmith should stock:

- Transponders: 4D-60 (Generic), PCF7936 (ID46), PCF7952 (ID46 Remote).
- Smart Keys: Nissan 3-Button and 4-Button Prox (315 MHz and 433 MHz). Warning: Visually identical Nissan fobs often have different FCC IDs. Check the shell carefully.
- Blades: NSN14 emergency blades.

## Conclusion

Mastering Nissan locksmithing requires a balanced understanding of mechanical precision (Lishi picking, ESCL troubleshooting) and digital cryptography (Rolling Codes, BCM calculation). While Nissan has not yet fully adopted the strict "Server Only" approach of Hyundai''s latest SGW 1 or Ford''s RH850 bench requirements 1 for all models, the trend is unequivocally moving toward 22-digit rolling codes and physical gateway firewalls. The professional locksmith must maintain an inventory of diverse chips (4D-60, ID46, ID47, ID4A) and possess tools capable of real-time PIN calculation and physical gateway bypass to service the modern Nissan fleet effectively.

Disclaimer: This guide is for professional educational purposes only. Protocols for security bypass are proprietary to the manufacturer and subject to change via firmware updates. Always adhere to NASTF guidelines and local laws regarding vehicle access.

#### Works cited

1. Hyundai_Locksmith_Programming_Guide.docx', 'AKL_PROCEDURE');

INSERT OR REPLACE INTO programming_guides (title, make, model, year_start, year_end, content, category)
VALUES ('Key Fob Research Mapping Project', 'Global', 'Remote Keys', 2010, 2024, '

# The Automotive Signal & Security Atlas: A Comprehensive Mapping of OEM Transponder Protocols, FCC IDs, and Mechanical Keyways (2010–2025)

## Executive Summary: The Decade of Encryption and Frequency Diversification

The automotive security landscape between 2010 and 2025 represents one of the most volatile and innovative periods in the history of vehicle access control. For the professional locksmith, automotive technician, and security analyst, this era marks a decisive and irreversible shift from static, low-security transponder systems to high-frequency, bi-directional, and heavily encrypted smart key architectures. This report provides an exhaustive technical analysis and mapping of access control systems for the "Big Four" mass-market manufacturers: Toyota, Honda, Nissan, and Ford. The primary objective of this research is to decode the opaque and often counterintuitive relationships between regulatory identifiers (FCC IDs), proprietary Manufacturer Part Numbers (OEM P/N), semiconductor architectures (Transponder Chips), and physical access mechanisms (Lishi Tools).

By synthesizing thousands of data points from technical manuals, regulatory filings, and aftermarket compatibility charts, we reveal that a Vehicle Identification Number (VIN) alone is often insufficient for identifying the correct service parts. Instead, a nuanced understanding of platform migrations—such as Toyota’s transition from "G" to "H" chips, or Ford’s mechanical migration from HU101 to HU198—is required. Our analysis highlights three critical macro-trends that define this fifteen-year period.

First, the Frequency Migration involves a complex global realignment of radio spectrum usage. While 315 MHz was the de facto standard for North American vehicles in 2010, the period sees a decisive shift toward 433/434 MHz to achieve global harmonization and improved signal penetration. Simultaneously, Ford engaged in a divergent strategy, adopting the 902 MHz band for its high-security platforms to combat urban RF interference—a move that isolated its hardware ecosystem from the rest of the industry.

Second, the Encryption Hardening trend reflects an arms race between theft deterrents and unauthorized duplication. The industry moved from 40-bit and 80-bit encryption protocols, which were susceptible to brute-force cloning, to 128-bit AES (Advanced Encryption Standard) architectures. This shift has fundamentally altered the service landscape, rendering cloning tools obsolete for newer models and necessitating advanced diagnostic programming that interacts directly with the vehicle''s Controller Area Network (CAN).

Third, the Component Specificity Crisis has emerged as a significant operational challenge. We observe a fragmentation where a single FCC ID (e.g., Toyota’s HYQ14FBA) can host multiple mutually incompatible circuit board revisions (0020, 2110, AG), forcing technicians to physically inspect printed circuit boards (PCBs) rather than relying solely on case markings or regulatory stamps.

This document serves as the definitive reference for navigating these complexities, ensuring precise part identification and successful service execution.

![Image](/api/assets/Key_Fob_Research_Mapping_Project_image1_png.png)

## Section 1: The Technical Architecture of Modern Automotive Entry

To interpret the granular data presented in this report, one must first understand the fundamental components that comprise a modern automotive key system. The interaction between the key fob and the vehicle is not a singular event but a choreographed exchange governed by three distinct layers: the Regulatory Layer (FCC ID), the Proprietary Layer (OEM Part Number & IC), and the Cryptographic Layer (Transponder Chip).

### 1.1 The Regulatory Layer: FCC ID and Its Limitations

The Federal Communications Commission (FCC) Identifier is often the first data point a locksmith or technician checks, yet it is frequently the most misleading indicator of compatibility. The FCC ID certifies that the device complies with radio frequency emission standards. It strictly defines the frequency (e.g., 315 MHz) and the power output limits to prevent interference with other wireless infrastructure.1 However, it does not define the data protocol or the encryption method used to communicate with the vehicle.

For example, Toyota''s HYQ14FBA is a ubiquitous FCC ID found on Smart Keys from 2012 to 2020. However, this single FCC ID covers vehicles that use completely different encryption keys and circuit board architectures. A 2014 RAV4 and a 2018 Camry might both use a remote stamped with HYQ14FBA, but one requires a board with ID "0020" and the other requires "2110".2 They are electronically incompatible despite sharing the regulatory stamp. This phenomenon renders the FCC ID a "necessary but not sufficient" condition for compatibility; it functions as a broad family grouping rather than a precise unique identifier.

### 1.2 The Cryptographic Layer: Transponder Evolution

The transponder chip is a passive RFID tag embedded in the key head or the smart fob circuit. It communicates with the immobilizer ring around the ignition (or the PEPS antenna in push-to-start cars) via Low Frequency (LF) induction. This component is the heart of the vehicle''s anti-theft system.

- Texas Instruments (TI) 4D/G/H (Toyota/Ford): Toyota utilized the "G" chip (80-bit encryption) extensively in the early 2010s before migrating to the "H" chip (128-bit) around 2014–2015. This shift was invisible to the naked eye but rendered "G" chip cloning tools useless for "H" chip vehicles, forcing a change in service equipment.4
- NXP Hitag Series (Honda/Nissan/Ford): The Hitag 2 (ID46) was the industry standard for a decade, used heavily by Nissan and Honda. However, cryptographic vulnerabilities led to the adoption of Hitag 3 (ID47) and eventually Hitag AES (4A/8A), which uses 128-bit encryption keys comparable to banking security standards.5
- Ford''s ID49 (Hitag Pro): Ford introduced the ID49 chip for its high-security systems. This chip is often paired with the 902 MHz radio band to punch through the RF noise of urban environments, a unique strategy among the Big Four that prioritizes signal robustness alongside encryption strength.7

### 1.3 The Mechanical Layer: Lishi Tooling

The "Lishi" tool is a 2-in-1 pick and decoder that revolutionized automotive locksmithing. It allows a technician to pick a lock to the open position and then "read" the wafer depths to cut a new key.

The period 2010–2025 saw significant mechanical fragmentation:

- Internal vs. External Tracks: Ford moved from the external track HU101 to the internal track HU198 (internally called the "Fiesta" or "2017+" profile). While the key blade looks identical from a distance, the milling is inverted, requiring a completely different pick.8
- High-Security Standardization: Honda (HON66) and Toyota (TOY48) have remained relatively stable with high-security laser-cut keys, whereas Nissan has maintained the NSN14 profile across most models, even as they upgraded the electronic security significantly.10

## Section 2: Toyota & Lexus – The Complexity of "Board IDs"

Toyota represents the highest complexity in part selection due to their use of "Board IDs." Unlike other manufacturers where the part number is usually printed on the case, Toyota hides the critical differentiator—the Board ID—on the PCB itself.

### 2.1 The "G" to "H" Transition (2010–2015)

Between 2010 and 2015, Toyota migrated its mechanical key fleet from "Dot" (4D) chips to "G" chips and finally to "H" chips.

- G-Chip (Transponder ID 4D-72): Identified by a "G" stamped on the blade. Common on 2010–2014 Camry, RAV4, and Corolla.4
- H-Chip (Transponder ID 8A): Identified by an "H" stamped on the blade. Introduced around 2013–2014. These use 128-bit AES encryption and cannot be cloned by older equipment.11
- FCC ID Continuity: Often, the remote head key FCC ID (e.g., HYQ12BDM) remained the same during the transition, but the internal transponder chip changed. A "G" key will not start an "H" car, even if the remote buttons program successfully.4

### 2.2 The HYQ14FBA Smart Key Fragmentation

The HYQ14FBA is the most common Toyota smart key FCC ID, but it is a "trap" for the uninitiated. It contains at least three distinct board generations that are not interchangeable.

Vehicle Model & Year

FCC ID

Board ID (PCB)

OEM Part Number

Chip ID

Freq

Prius C (2012–2020)

HYQ14FBA

0020 ("G" Board)

89904-52290

Texas ID 4D-G

315 MHz

RAV4 (2013–2018)

HYQ14FBA

0020 ("G" Board)

89904-0R080

Texas ID 4D-G

315 MHz

Highlander (2014–2019)

HYQ14FBA

2110 ("AG" Board)

89904-0E120

Texas ID H-8A

315 MHz

Tacoma (2016–2020)

HYQ14FBA

2110 ("AG" Board)

89904-04140

Texas ID H-8A

315 MHz

Land Cruiser (2016–2019)

HYQ14FBA

2110 ("AG" Board)

89904-60J70

Texas ID H-8A

315 MHz

Mirai (2016–2020)

HYQ14FBA

2110 ("AG" Board)

89904-62020

Texas ID H-8A

315 MHz

Source Data: 2

Insight: The shift from Board 0020 to 2110 corresponds to the transition from G-chip architecture to H-chip architecture within the Smart Key system. Visual inspection of the PCB is mandatory; looking for the tiny numbers "2110" or the letter "AG" printed on the board is the only way to confirm compatibility.14

### 2.3 The 2020+ Evolution: HYQ14FBX and HYQ14FBW

Newer platforms (TNGA) utilize updated FCC IDs. The 2022+ Tundra and Tacoma utilize HYQ14FBX, while the 2025 Camry has adopted HYQ14FBW. These keys typically use Hitag AES (4A) or advanced 8A chips, representing a move away from purely Texas Instruments protocols toward NXP-based architectures in some global platforms.

- 2024 Tacoma / Tundra: FCC HYQ14FBX | Part 8990H-0C010 | Freq 314.3 MHz | Chip 8A.17
- 2025 Camry: FCC HYQ14FBW | Part 8990H-AQ010 | Freq 315 MHz | Chip Hitag AES (4A).19

### 2.4 Lishi Tool Application: Toyota

Despite the electronic churn, Toyota''s mechanical locks have remained remarkably stable.

- TOY43 (Old): Used on older, non-transponder models (pre-2010 mostly).
- TOY48 (New): Also known as the "Lexus High Security" or "Toyota 4-Track." This 2-in-1 tool covers 90% of the 2010–2025 Toyota/Lexus fleet, including Camry, RAV4, Highlander, and nearly all Lexus models.21
- TOY44G: Specific to the 2010+ mechanical keys for trucks like the Tacoma (before they went smart).23

## Section 3: Honda & Acura – The "Driver Memory" System

Honda''s key fob ecosystem is defined by a unique feature: the Driver 1 / Driver 2 distinction. Unlike other manufacturers where any compatible key works, Honda vehicles with memory seat functions require specific part numbers for "Driver 1" and "Driver 2" to recall seat positions, mirrors, and radio presets.

### 3.1 The "Driver" Dilemma (FCC ID KR5V2X)

The FCC ID KR5V2X is ubiquitous across the Honda lineup (Accord, Civic, Pilot, CR-V, Odyssey) from 2013 to 2020. However, fitting a "Driver 1" remote to a slot meant for "Driver 2" (or vice versa) can result in limited functionality or programming failure for the memory features.

Model & Year

FCC ID

Driver Position

OEM Part Number

Chip

Freq

Pilot (2016–2020)

KR5V2X / KR5V41

Driver 1

72147-TG7-A41

ID47

433 MHz

Pilot (2016–2020)

KR5V2X / KR5V41

Driver 2

72147-TG7-A91

ID47

433 MHz

Civic (2016–2020)

KR5V2X

Driver 1

72147-TBA-A11

ID47

433 MHz

Civic (2016–2020)

KR5V2X

Driver 2

72147-TBA-A21

ID47

433 MHz

Accord (2016–2017)

KR5V1X

Driver 1

72147-T2A-A11

ID47

313.8 MHz

Source Data: 24

Technical Insight: Note the frequency difference. KR5V1X (older) typically operates at 313.8 MHz (legacy Honda freq), while KR5V2X (newer) operates at 433.92 MHz.24 This 433 MHz shift aligns Honda with European standards, improving signal penetration and range.

![Image](/api/assets/Key_Fob_Research_Mapping_Project_image3_png.png)

### 3.2 The Next Generation: 2021+ Systems

For the 2021–2025 era, Honda introduced FCC ID KR5TP-4 for the Accord and Civic.

- FCC ID: KR5TP-4
- Chip: 4A (Hitag AES)
- Frequency: 433 MHz
- Part Number: 72147-T20-A11 (Accord)
- Insight: This system requires a new generation of programming tools capable of handling the 4A AES encryption. Standard tools that worked on KR5V2X (ID47) may fail on KR5TP-4 without a software update.29

### 3.3 Lishi Tool Application: Honda

Honda is the most consistent manufacturer regarding lock profiles.

- HON66: This single tool covers virtually every Honda and Acura model from 2003 to 2025. It is a "High Security" laser-cut keyway. Whether it is a 2010 Civic or a 2025 Pilot, the HON66 Lishi is the correct tool.31
- Warning: While the tool is the same, the mechanical code series has evolved, and the cuts must be precise due to the sensitive nature of Honda ignition wafers (which are prone to wear and jamming).

## Section 4: Nissan & Infiniti – The 433 MHz Revolution

Nissan''s security evolution is characterized by a fragmented mid-2010s period followed by a consolidation around high-frequency 433 MHz systems in the 2020s.

### 4.1 The Legacy Systems (2010–2019)

The dominant FCC ID for this era was CWTWB1U840 (often used for the Sentra, Versa, and Leaf).

- FCC ID: CWTWB1U840
- Chip: ID46 (PCF7952)
- Frequency: 315 MHz
- Part Number: 285E3-3SG0D (Sentra)
- Insight: These keys are robust but rely on older ID46 technology. They are widely interchangeable across the lower-tier models (Versa/Sentra) but distinct from the high-tier models (Altima/Maxima) which used KR55WK48903 or KR55WK49622.34

### 4.2 The "Hitag 3" Era (2013–2020)

For models like the Pathfinder (2013+) and Altima (2013+), Nissan moved to the KR5S180144 family.

- FCC ID: KR5S180144014 (often shortened to KR5S180144)
- Chip: ID47 (Hitag 3)
- Frequency: 433 MHz
- Part Number: 285E3-9PB3A
- Insight: This was Nissan''s first major move to 433 MHz in the US market, breaking from the 315 MHz standard. The ID47 chip offers significantly higher security than the ID46.5

### 4.3 The Modern Era: Rogue & Ariya (2021–2025)

The 2021+ Nissan Rogue and the all-electric Ariya introduced a new, complex ecosystem utilizing Hitag AES (4A) chips.

Vehicle Model & Year

FCC ID

OEM Part Number

Chip ID

Freq

Rogue (2021–2023)

KR5TXN1

285E3-6TA1A

4A (Hitag AES)

434 MHz

Rogue (2021–2023)

KR5TXN3

285E3-6TA5B

4A (Hitag AES)

434 MHz

Sentra (2022–2025)

KR5TXN1

285E3-6CA1A

4A (Hitag AES)

433 MHz

Ariya (2023–2024)

KR5TXPZ1

285E3-5MR1B

4A (Hitag AES)

434 MHz

Source Data: 6

Critical Alert: There is frequent confusion between KR5TXN1 and KR5TXN3. They look identical. The "N1" is typically 3-button, while "N3" may support different remote start functions or trim levels. The Ariya''s KR5TXPZ1 introduces a new form factor entirely. These 4A keys require specific programming software (e.g., Smart Pro with Nissan 2020+ software) and often require a server connection (bypassing the pincode by reading the BCM data).44

### 4.4 Lishi Tool Application: Nissan

- NSN14: The workhorse tool. It covers 2010–2025 for almost all Nissan models, including the Altima, Rogue, Sentra, and Pathfinder. It is a 10-cut system.
- DA34: An older keyway less common in the smart key era but covered by the same NSN14 Lishi architecture.10

## Section 5: Ford & Lincoln – The High-Frequency Fortress

Ford distinguishes itself with the use of the 902 MHz frequency band and a bifurcated mechanical keyway strategy.

### 5.1 The 902 MHz Strategy (FCC ID M3N-A2C31243300)

Starting around 2015 with the F-150 and Fusion, Ford moved its high-security Smart Keys to 902 MHz.

- Reasoning: The 315 MHz and 433 MHz bands are crowded with consumer electronics (garage openers, tire pressure sensors). 902 MHz offers a cleaner spectrum, allowing for the extreme range required by Ford''s remote start features on large trucks.
- Chip: ID49 (Hitag Pro). This chip is 128-bit encrypted.

Model & Year

FCC ID

Frequency

OEM Part Number

Chip

F-150 (2015–2020)

M3N-A2C31243300

902 MHz

164-R8117 / FL3T-15K601

ID49

Explorer (2016–2017)

M3N-A2C31243300

902 MHz

164-R8140

ID49

Fusion (2013–2016)

M3N-A2C31243300

902 MHz

164-R7989

ID49

Edge (2015–2017)

M3N-A2C31243300

902 MHz

164-R7989

ID49

Transit (2020–2024)

N5F-A08TAA

315 MHz

164-R8236

ID49

Source Data: 7

Anomaly: Note the Transit Connect (2020+) uses FCC N5F-A08TAA at 315 MHz.49 Unlike the F-Series, the commercial vans stayed on the lower frequency, likely due to global platform constraints (the Transit is a European-derived platform where 902 MHz is not standard).

### 5.2 The Mechanical Schism: HU101 vs. HU198

Perhaps the most frustrating development for locksmiths is the silent introduction of the HU198 keyway in 2017.

- HU101 (Standard): Used on Focus, Fiesta, Escape, F-150 up to ~2016/2017. It is an External 2-Track laser key.
- HU198 (New): Introduced on the 2017+ Fiesta and later the Focus/Escape. It uses the exact same key blade blank size but is an Internal 2-Track system. The milling is inverted.
- The Trap: An HU101 Lishi pick will enter an HU198 lock, but it will not pick it, and it may get stuck. You must use the HU198 Lishi for these newer "European" Ford models.8

![Image](/api/assets/Key_Fob_Research_Mapping_Project_image2_png.png)

## Section 6: Comprehensive Data Mapping (2010–2025)

The following tables synthesize the specific data points requested, mapping FCC IDs to Part Numbers, Chips, Frequencies, and Tools.

### 6.1 Toyota & Lexus Master Chart

Year Range

Model(s)

FCC ID

Board / Note

OEM Part #

Chip

Freq

Lishi Tool

2010–2014

Camry, Corolla

HYQ12BDM

"G" Key (Dot)

89070-02620

4D-G (80-bit)

315

TOY43 / TOY44G

2014–2017

Camry, RAV4

HYQ12BDM

"H" Key (Blade)

89070-06500

8A "H" (128-bit)

315

TOY44G-PT

2012–2020

Prius C, RAV4

HYQ14FBA

Board 0020

89904-52290

4D-G

315

TOY48

2014–2019

Highlander, Tacoma

HYQ14FBA

Board 2110

89904-0E120

8A "H"

315

TOY48

2016–2019

Land Cruiser

HYQ14FBA

Board 2110

89904-60J70

8A "H"

315

TOY48

2019–2025

Camry (Smart)

HYQ14FBW

-

8990H-AQ010

Hitag AES (4A)

315

TOY48

2022–2024

Tacoma, Tundra

HYQ14FBX

-

8990H-0C010

8A

314.3

TOY48

2023–2025

Lexus NX, RX

HYQ14FLD

-

8990H-0E490

8A

434

TOY48

### 6.2 Honda & Acura Master Chart

Year Range

Model(s)

FCC ID

Note

OEM Part #

Chip

Freq

Lishi Tool

2010–2013

Civic

N5F-S0084A

-

35111-SVA-305

ID46

314

HON66

2013–2015

Accord

KR5V1X

Driver 1

72147-T2A-A11

ID47

313.8

HON66

2016–2020

Pilot, Civic, CR-V

KR5V2X

Driver 1

72147-TG7-A41

ID47

433

HON66

2016–2020

Pilot, Civic, CR-V

KR5V2X

Driver 2

72147-TG7-A91

ID47

433

HON66

2021–2025

Accord, Civic

KR5TP-4

-

72147-T20-A11

4A (AES)

433

HON66

2019–2025

Passport, Pilot

KR5V44

-

72147-TG7-A92

ID47

433

HON66

### 6.3 Nissan & Infiniti Master Chart

Year Range

Model(s)

FCC ID

OEM Part #

Chip

Freq

Lishi Tool

2010–2014

Murano

KR55WK49622

285E3-1AA0A

ID46

315

NSN14

2013–2019

Sentra, Versa

CWTWB1U840

285E3-3SG0D

ID46

315

NSN14

2013–2018

Pathfinder, Altima

KR5S180144

285E3-9PB3A

ID47 (Hitag 3)

433

NSN14

2021–2023

Rogue

KR5TXN1

285E3-6TA1A

4A (AES)

434

NSN14

2021–2023

Rogue (High Trim)

KR5TXN3

285E3-6TA5B

4A (AES)

434

NSN14

2023–2025

Ariya

KR5TXPZ1

285E3-5MR1B

4A (AES)

434

NSN14

### 6.4 Ford & Lincoln Master Chart

Year Range

Model(s)

FCC ID

OEM Part #

Chip

Freq

Lishi Tool

2010–2014

Edge, Explorer

CWTWB1U793

164-R8070

4D-63 (80-bit)

315

HU101

2011–2019

Focus, Escape

M3N5WY8609

164-R8092

ID46

315

HU101

2015–2020

F-150, Fusion

M3N-A2C31243300

164-R8117

ID49 (902 MHz)

902

HU101

2020–2024

Transit Connect

N5F-A08TAA

164-R8236

ID49

315

HU101

2018–2024

Fiesta, Focus (Euro)

-

-

ID49

-

HU198

## Section 7: Future Outlook and Strategic Implications

The trajectory of automotive access control is clear: fragmentation is ending in favor of highly secure, standardized protocols, even if the "Standard" varies by OEM.

1. Phone-as-a-Key (PaaK) & UWB: The introduction of the Nissan Ariya and Ford F-150 Lightning signals the beginning of Ultra-Wideband (UWB) technology. While key fobs remain, they are becoming backup devices. Future "FCC IDs" may essentially be Bluetooth Low Energy (BLE) MAC addresses.
1. The End of Cloning: The 128-bit AES chips (Toyota H, Nissan 4A, Honda 4A) have effectively killed the "cloning" business model for vehicles post-2018. Service providers must invest in OBD-II programming diagnostics (e.g., Autel IM608, Smart Pro) rather than cloning devices.
1. Refurbished vs. New: With part shortages (chip crisis), the market for "Refurbished" OEM keys has exploded. However, because modern chips (like the Hitag AES) often "lock" to the vehicle''s VIN upon programming, "unlocking" services—which flash the chip back to a virgin state—will become a critical sub-industry for locksmiths.15

Conclusion: The era of "universal" keys is over. Success in the 2025 landscape requires a database-driven approach to inventory, where the Board ID, IC, and Frequency are treated with equal weight to the car model itself.

#### Works cited

1. FCC ID Search | Federal Communications Commission, accessed December 17, 2025, https://www.fcc.gov/oet/ea/fccid
1. Toyota 4 Button Proximity Remote Smart Key HYQ14FBA / G-Board 0020 / 89904-06140 - New Original OEM Hidden, accessed December 17, 2025, https://keyinnovations.com/toyota-4-button-proximity-remote-smart-key-hyq14fba-g-board-0020-89904-06140-new/
1. Toyota Prius / RAV4 2012-2020 3-Btn G (HYQ14FBA-0020)—OEM REFURB NO LOGO, accessed December 17, 2025, https://www.americankeysupply.com/product/toyota-prius-rav4-2012-2020-3-btn-g-hyq14fba-0020-oem-refurb-no-logo-14068
1. Remote Key List (2025-05-04 21 - 17 - 44) | PDF | Industries | Chevrolet - Scribd, accessed December 17, 2025, https://www.scribd.com/document/861769296/remote-key-list-2025-05-04-21-17-44
1. For Nissan Murano 2013 2014 Smart Prox Remote Car Key Fob KR5S180144014 47 Chip, accessed December 17, 2025, https://www.ebay.com/itm/275450431497
1. 2022 Nissan Sentra Smart Key Fob FCC ID: KR5TXN1, PN: 285E3-6CA1A, 285, accessed December 17, 2025, https://remotesandkeys.com/products/2022-nissan-sentra-smart-key-remote-4074
1. Strattec (5928963) Ford 4 Button Proximity Smart Key M3N-A2C31243300, 164-R8140, 902 MHz - New, OEM, accessed December 17, 2025, https://keyinnovations.com/strattec-ford-4-button-smart-key-m3n-a2c31243300-5928963-164-r8140-902-mhz-new-oem/
1. Ford Jaguar HU198 Picking and Decoding Guide - TradeLocks Blog, accessed December 17, 2025, https://blog.tradelocks.co.uk/picking-decoding-ford-hu198-genuine-lishi/
1. Mr. Li''s Original Lishi HU198 Ford2017 2in1 Decoder and Pick for Ford - Lockpickable, accessed December 17, 2025, https://lockpickable.com/products/mr-li-original-lishi-ford2017
1. Mr. Li''s Original Lishi NSN14 2in1 Decoder and Pick for Nissan, Ford, Subaru - Lockpickable, accessed December 17, 2025, https://lockpickable.com/products/mr-li-original-lishi-nsn14
1. Characteristics of Toyota Brand Transponder Keys | PDF - Scribd, accessed December 17, 2025, https://www.scribd.com/document/921749914/Characteristics-of-Toyota-Brand-Transponder-Keys
1. Genuine Toyota Land Cruiser, Tacoma 2012+ Smart Key, 3Buttons 89904-0E091 315MHz, HYQ14FBA P1 A8 - ABKEYS, accessed December 17, 2025, https://abkeys.com/products/toyota-land-cruiser-tacoma-prius-smart-key-315mhz-hyq14fba-89904-60j70-4156
1. Toyota New OEM 2016-2020 Mirai Smart Key 4B Trunk - Royal Key Supply, accessed December 17, 2025, https://royalkeysupply.com/products/toyota-new-oem-2016-2020-mirai-smart-key-4b-trunk-fccid-hyq14fba-pn-89904-62020
1. For Toyota Smart Key Keyless 3 Btn Remote HYQ14FBA 281451-2110 SKU: KR-T3RG, accessed December 17, 2025, https://www.autokeymax.com/products/for-toyota-smart-key-keyless-3-btn-remote-hyq14fba-281451-2110-sku-kr-t3rg
1. I want to make sure I am buying the correct FOB and Board (2021 Toyota Tundra Smart Key 3B FCC# HYQ14FBA - 2110 AG) - Locksmith Keyless Q&A, accessed December 17, 2025, https://locksmithkeyless.answerbase.com/4472177/I-want-to-make-sure-I-am-buying-the-correct-FOB-and-Board
1. 2016-2021 Toyota Land Cruiser 3-Button Smart Key Fob (FCC: HYQ14FBA, P/N: 89904-0E090, 89904-60J70, Board: 281451-2110) - NorthCoast Keyless, accessed December 17, 2025, https://northcoastkeyless.com/product/toyota-land-cruiser-3-button-smart-key-fob-fcc-hyq14fba-p-n-89904-0e090-89904-60j70-board-281451-2110/
1. 2022-2024 Toyota Tacoma 4-Button Smart Key Fob Remote (HYQ14FBX, 8990H-0C010), accessed December 17, 2025, https://northcoastkeyless.com/product/toyota-tacoma-4-button-smart-key-fob-remote-fcc-hyq14fbx-pn-8990h-0c010/
1. 2024 Toyota Tacoma Smart Key 3B Fob FCC# HYQ14FBX - 8990H-0C030 - Afte, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2024-toyota-tacoma-smart-key-3b-fob-fcc-hyq14fbx-8990h-0c030-aftermarket
1. 2025 Toyota Camry Smart Key Remote PN: 8990H-AQ010, accessed December 17, 2025, https://remotesandkeys.com/products/2025-toyota-camry-smart-key-remote-pn-8990h-aq010
1. 2025 Toyota Camry / 4-Button Smart Key / PN: 8990H-AQ010 / HYQ14FBW (OEM), accessed December 17, 2025, https://www.uhs-hardware.com/products/2025-toyota-camry-4-button-smart-key-8990h-aq010-hyq14fbw-oem
1. Original Lishi for Toyota Lexus TOY48 Pick Decoder Door Trunk Ignition - Key4, accessed December 17, 2025, https://www.key4.com/original-lishi-toy48-toyota-lexus-2-in-1-pick-decoder-quad-lifter-anti-glare
1. ORIGINAL LISHI - TOY48 Toyota Lexus / 2-in-1 Pick & Decoder / Quad Lifter / AG, accessed December 17, 2025, https://www.uhs-hardware.com/products/original-lishi-toyota-lexus-toy48-2-in-1-pick-decoder-quad-ag
1. 2010 Toyota Tacoma Transponder Key Blank, G Chip (P/N: TOY44G-PT, 89785-08040), accessed December 17, 2025, https://oemcarkeymall.com/products/2010-toyota-tacoma-transponder-key-blank-g-chip-toy44g-pt
1. Honda KR5V2X key fob sub-variants? - Inside EVs Forum, accessed December 17, 2025, https://www.insideevsforum.com/community/threads/honda-kr5v2x-key-fob-sub-variants.12066/
1. Genuine Honda Pilot Car Key, accessed December 17, 2025, https://www.hondapartsnow.com/oem-honda-pilot-car_key.html
1. 2019-2025 Honda - Fob Assembly Entry Key (Driver 2) - Honda (72147-TG7-AB1), accessed December 17, 2025, https://www.hondapartsconnection.com/oem-parts/honda-2019-2025-honda-fob-assembly-entry-key-driver-2-72147tg7ab1
1. 2021 Honda Pilot Smart Remote Key Fob Driver 2 - CarandTruckRemotes, accessed December 17, 2025, https://www.carandtruckremotes.com/products/2021-honda-pilot-smart-remote-key-fob-driver-2
1. Smart Key_V1.60 Function List - Autel, accessed December 17, 2025, https://www.autel.com/u/cms/www/202210/24020108tdxp.pdf
1. OEM 2022-2025 HONDA CIVIC proximity smart keyless entry remote key fob KR5TP-4, accessed December 17, 2025, https://www.ebay.com/itm/125908267753
1. Honda Accord Civic Proximity Key KR5TP-4 72147-T20-A11 - Key4, accessed December 17, 2025, https://www.key4.com/honda-accord-smart-remote-key-kr5tp4-72147t20a11
1. Lishi 2-in-1 Pick/Decoder for Honda HO01/HON66 - American Key Supply, accessed December 17, 2025, https://www.americankeysupply.com/product/lishi-2-in-1-pick-decoder-for-honda-ho01-hon66-9390
1. LISHI-HON66 - Noble Key Supply, accessed December 17, 2025, https://noblekeysupply.com/products/lishi-hon66
1. Classic Lishi HON66 2in1 Decoder and Pick for Honda, accessed December 17, 2025, https://www.classiclishi.com/product/classic-lishi-hon66
1. 2010 Nissan Altima Keyless Entry Remote 285E3-JA05A KR55WK49622 – CarandTruckRemotes, accessed December 17, 2025, https://www.carandtruckremotes.com/products/2010-nissan-altima-smart-remote-key-fob
1. 2010 Nissan Murano Smart Key 3B Fob FCC# KR55WK49622 - Locksmith Keyless, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2010-nissan-murano-smart-key-3-buttons-fob-fcc-kr55wk49622-aftermarket
1. Nissan 2013-2019 4-Btn SK w/Trunk (CWTWB1U840)—OEM REFURB NO LOGO, accessed December 17, 2025, https://www.americankeysupply.com/product/nissan-2013-2019-4-btn-sk-w-trunk-cwtwb1u840-oem-refurb-no-logo-11968
1. Nissan Refurbished 2013-2016 Pathfinder Smart Key 3B FCCID: KR5S180144, accessed December 17, 2025, https://royalkeysupply.com/products/nissan-refurbished-2013-2016-pathfinder-smart-key-3b-fccid-kr5s180144014-pn-285e3-9pb3a
1. Nissan Altima 2013-2015 Smart Proximity Key Fob 4-Button FCC ID: KR5S1, accessed December 17, 2025, https://www.bestkeysolution.com/products/nissan-altima-2013-2015-smart-proximity-key-fob-4-button-fcc-id-kr5s180144014-continental-44018
1. 2021-2023 Nissan Rogue 3-Button Smart Key Fob Remote (KR5TXN1, 285E3-6TA1A), accessed December 17, 2025, https://northcoastkeyless.com/product/nissan-rogue-3-button-smart-key-fob-remote-fcc-kr5txn1-p-n-285e3-6ta1a/
1. 2021 Nissan Rogue Smart Key 3 Buttons Fob FCC# KR5TXN1 - Locksmith Keyless, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2021-nissan-rogue-smart-key-3-buttons-fob-fcc-kr5txn1-aftermarket
1. Nissan NEW OEM 2022-2024 Sentra Versa Smart Key 5B Remote Start FCCID, accessed December 17, 2025, https://royalkeysupply.com/products/nissan-new-oem-2022-2024-sentra-versa-smart-key-4b-trunk-fccid-kr5txpz3-pn-285e3-6ly5a
1. 2023 Nissan Ariya Smart Key Remote PN: 285E3-5MR3B, accessed December 17, 2025, https://remotesandkeys.com/products/2023-nissan-ariya-smart-key-remote-pn-285e3-5mr3b
1. 2023 Nissan Ariya Smart Remote Key Fob 3B (FCC: KR5TXPZ1, P/N: 285E3-5MR1B), accessed December 17, 2025, https://oemcarkeymall.com/products/2023-nissan-ariya-smart-remote-key-fob-3b-fcc-kr5txpz1-pn-285e3-5mr1b
1. 2023 Nissan Ariya Smart Key 4 Buttons Fob FCC# KR5TXPZ1 - Aftermarket, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2023-nissan-ariya-smart-key-4-buttons-fob-fcc-kr5txpz1-aftermarket
1. Lishi Lock Picks | Lishi Tool Set for Sale - UHS Hardware, accessed December 17, 2025, https://www.uhs-hardware.com/collections/original-lishi
1. Original Lishi 2-1 Pick/Decoder for Nissan NSN14, DA34 DR/TK - CLK Supplies, accessed December 17, 2025, https://www.clksupplies.com/products/original-lishi-2-1-pick-decoder-for-nissan-nsn14-dr-tk
1. Ford New OEM 2016-2017 Explorer Smart Key 4B Remote Start FCCID: M3N-A, accessed December 17, 2025, https://royalkeysupply.com/products/ford-new-oem-2016-2017-explorer-smart-key-4b-remote-start-fccid-m3n-a2c31243300-pn-164-r8140-5928963
1. Ford F-150/250 Smart Key Fob, 5-Button (M3N-A2C31243300) - OEM Refurb, accessed December 17, 2025, https://www.americankeysupply.com/product/ford-f-series-2015-17-5-b-sk-w-rs-tg-m3n-a2c31243300-oem-refurb-no-logo-11687
1. 2022 Ford Transit Connect Flip Key Fob 4B FCC# N5F-A08TAA - Locksmith Keyless, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2022-ford-transit-connect-flip-key-fob-4b-fcc-n5f-a08taa
1. 2022 Ford Transit Van Remote Key Fob w/ Side Door - CarandTruckRemotes, accessed December 17, 2025, https://www.carandtruckremotes.com/products/2022-ford-transit-van-remote-key-fob-w-side-door
1. How To Pick And Decode The New Ford HU198 Lock Using An Original Mr Li Pick & Decoder - Keyprint Security Ltd, accessed December 17, 2025, https://www.keyprint.co.uk/news/how-to-pick-and-decode-the-new-ford-hu198-lock-using-an-original-mr-li-pick-decoder
1. HU101 HU198 Test Key Blade for Ford - 10 PACK Aftermarket - Car and Truck Remotes, accessed December 17, 2025, https://www.carandtruckremotes.com/products/hu101-hu198-test-key-blade-for-ford-10-pack-aftermarket
1. 2023 - 2025 Lexus Smart Key 4B W/ Hatch Fob FCC# HYQ14FLD - 8990H-0E49, accessed December 17, 2025, https://www.locksmithkeyless.com/products/2023-2025-lexus-smart-key-4b-w-hatch-fob-fcc-hyq14fld-8990h-0e490', 'RESEARCH');
