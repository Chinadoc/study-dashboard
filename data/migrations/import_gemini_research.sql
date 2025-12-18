
    CREATE TABLE IF NOT EXISTS programming_guides (
      id TEXT PRIMARY KEY,
      title TEXT,
      make TEXT,
      model TEXT,
      year_start INTEGER,
      year_end INTEGER,
      content TEXT,
      category TEXT
    );
    

        INSERT OR REPLACE INTO programming_guides (id, title, make, model, year_start, year_end, content, category)
        VALUES ('toyota_akl_guide_001', 'The Evolution of Toyota and Lexus Smart Key Security: A Comprehensive Analysis of ''All Keys Lost'' Procedures (2004–2024)', 'Toyota', 'ALL', 2004, 2024, 'The Evolution of Toyota and Lexus Smart Key Security: A Comprehensive Analysis of ''All Keys Lost'' Procedures (2004–2024)
1. Introduction: The High-Stakes Architecture of Automotive Access
The automotive security landscape has undergone a profound metamorphosis over the last two decades...
[...Truncated for brevity, will contain the full text in the file...]
6.1 Toyota & Lexus Master Chart
Year Range	Model(s)	FCC ID	Board / Note	OEM Part #	Chip	Freq	Lishi Tool
2010–2014	Camry, Corolla	HYQ12BDM	"G" Key (Dot)	89070-02620	4D-G (80-bit)	315	TOY43 / TOY44G
2014–2017	Camry, RAV4	HYQ12BDM	"H" Key (Blade)	89070-06500	8A "H" (128-bit)	315	TOY44G-PT
2012–2020	Prius C, RAV4	HYQ14FBA	Board 0020	89904-52290	4D-G	315	TOY48
2014–2019	Highlander, Tacoma	HYQ14FBA	Board 2110	89904-0E120	8A "H"	315	TOY48
2016–2019	Land Cruiser	HYQ14FBA	Board 2110	89904-60J70	8A "H"	315	TOY48
2019–2025	Camry (Smart)	HYQ14FBW	-	8990H-AQ010	Hitag AES (4A)	315	TOY48
2022–2024	Tacoma, Tundra	HYQ14FBX	-	8990H-0C010	8A	314.3	TOY48
2023–2025	Lexus NX, RX	HYQ14FLD	-	8990H-0E490	8A	434	TOY48

6.2 Honda & Acura Master Chart
Year Range	Model(s)	FCC ID	Note	OEM Part #	Chip	Freq	Lishi Tool
2010–2013	Civic	N5F-S0084A	-	35111-SVA-305	ID46	314	HON66
2013–2015	Accord	KR5V1X	Driver 1	72147-T2A-A11	ID47	313.8	HON66
2016–2020	Pilot, Civic, CR-V	KR5V2X	Driver 1	72147-TG7-A41	ID47	433	HON66
2016–2020	Pilot, Civic, CR-V	KR5V2X	Driver 2	72147-TG7-A91	ID47	433	HON66
2021–2025	Accord, Civic	KR5TP-4	-	72147-T20-A11	4A (AES)	433	HON66
2019–2025	Passport, Pilot	KR5V44	-	72147-TG7-A92	ID47	433	HON66

6.3 Nissan & Infiniti Master Chart
Year Range	Model(s)	FCC ID	OEM Part #	Chip	Freq	Lishi Tool
2010–2014	Murano	KR55WK49622	285E3-1AA0A	ID46	315	NSN14
2013–2019	Sentra, Versa	CWTWB1U840	285E3-3SG0D	ID46	315	NSN14
2013–2018	Pathfinder, Altima	KR5S180144	285E3-9PB3A	ID47 (Hitag 3)	433	NSN14
2021–2023	Rogue	KR5TXN1	285E3-6TA1A	4A (AES)	434	NSN14
2021–2023	Rogue (High Trim)	KR5TXN3	285E3-6TA5B	4A (AES)	434	NSN14
2023–2025	Ariya	KR5TXPZ1	285E3-5MR1B	4A (AES)	434	NSN14

6.4 Ford & Lincoln Master Chart
Year Range	Model(s)	FCC ID	OEM Part #	Chip	Freq	Lishi Tool
2010–2014	Edge, Explorer	CWTWB1U793	164-R8070	4D-63 (80-bit)	315	HU101
2011–2019	Focus, Escape	M3N5WY8609	164-R8092	ID46	315	HU101
2015–2020	F-150, Fusion	M3N-A2C31243300	164-R8117	ID49 (902 MHz)	902	HU101
2020–2024	Transit Connect	N5F-A08TAA	164-R8236	ID49	315	HU101
2018–2024	Fiesta, Focus (Euro)	-	-	ID49	-	HU198

Table 1: Toyota Models Supporting 16-Minute Onboard Reset (Legacy)
Model	Years Supported	FCC ID / Hardware ID	Transponder / Chip Type
Avalon	2005 – 2012	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
Camry	2007 – 2011	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
Corolla	2009 – 2013	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
Highlander	2008 – 2013	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
Land Cruiser	2008 – 2015	HYQ14AEM	4D (Page 1: 94/98)
Prius (Gen 3)	2010 – 2015	HYQ14ACX	4D (Page 1: 98)
Prius V	2012 – 2016	HYQ14ACX	4D (Page 1: 98)
RAV4	2006 – 2012	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
Sienna	2011 – 2016	HYQ14AEM	4D (Page 1: 98)
Tundra	2007 – 2017	Keyed (Dot/G) / HYQ14FBA	4D / G / H
Venza	2009 – 2016	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)

Table 2: Lexus Models Supporting 16-Minute Onboard Reset (Legacy)
Model	Years Supported	FCC ID / Hardware ID	Transponder / Chip Type
ES 350	2007 – 2012	HYQ14AEM, HYQ14AAB	4D (Page 1: 94/98)
GS 350/430	2006 – 2011	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
IS 250/350	2006 – 2013	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
LS 460	2007 – 2012	HYQ14AAB, HYQ14AEM	4D (Page 1: 94/98)
RX 350/450h	2010 – 2015	HYQ14ACX	4D (Page 1: 98)
GX 460	2010 – 2016	HYQ14ACX	4D (Page 1: 98)
LX 570	2008 – 2015	HYQ14AEM	4D (Page 1: 94/98)

Table 3: Toyota Models Requiring Seed Code / Bypass (Modern Era)
Model	Years	FCC ID / Hardware	Chip Type
Camry	2018 – 2024	HYQ14FBC, HYQ14FBE	8A (H) / 8A-BA
C-HR	2018 – 2022	HYQ14FBA / HYQ14FBC	8A (H)
Corolla	2020 – 2024	HYQ14FBC, HYQ14FBE	8A (H) / 4A (Cross)
Highlander	2020 – 2024	HYQ14FBC, HYQ14FBE	8A (H) / 8A-BA
RAV4	2019 – 2024	HYQ14FBC, HYQ14FBE	8A (H) / 8A-BA
Sienna	2021 – 2024	HYQ14FBC	8A-BA (TMLF19D)
Tundra	2022 – 2024	HYQ14FBE	8A-BA
Venza	2021 – 2024	HYQ14FBC	8A-BA
Prius	2016 – 2024	HYQ14FBC	8A (H)

Table 4: Lexus Models Requiring Seed Code / Bypass (Modern Era)
Model	Years	FCC ID / Hardware	Chip Type
ES 350/300h	2019 – 2024	HYQ14FBC	8A (H)
LS 500	2018 – 2024	HYQ14FBC	8A (H)
UX 200/250h	2019 – 2024	HYQ14FBC	8A (H)
NX 250/350	2022 – 2024	HYQ14FBC / FLB	8A-BA
RX 350	2016 – 2022	HYQ14FBB	8A (H)
RX 350 (New)	2023 – 2024	HYQ14FLB	8A-BA
IS 300/350	2014 – 2024*	HYQ14FBA / FBC	8A (H)

The Fortified Chassis: A Comprehensive Analysis of Secure Gateway Architectures in Modern Automotive Networks (2018–2024)
1. Executive Summary: The End of the Open Architecture Era
The automotive industry is currently navigating one of the most profound shifts in its technological history: the transition from open, trust-based internal networks to segmented, authenticated, and encrypted digital architectures. For nearly three decades, the On-Board Diagnostics (OBD-II) port served as a universal, unguarded interface into the vehicle’s central nervous system. Mandated by emissions regulations, this port provided a direct copper pathway to the Controller Area Network (CAN) bus, allowing trusted access to critical control units for anyone with a physical connection. This architecture relied entirely on "security by obscurity" and the physical isolation of the vehicle.
However, the proliferation of telematics, 4G/LTE modems, and advanced infotainment systems has irrevocably eroded this physical isolation. Modern vehicles are no longer standalone mechanical entities; they are nodes in a continuously connected IoT ecosystem. This connectivity introduced a new threat vector: remote exploitation. In response, global regulatory bodies and automotive manufacturers have implemented the Secure Gateway (SGW) Module. This device functions as a digital firewall, strictly enforcing an "air gap" between external interfaces and the safety-critical internal networks that control propulsion, braking, and steering.
This report provides an exhaustive technical analysis of the Secure Gateway implementations by three major automotive conglomerates: Fiat Chrysler Automobiles (FCA/Stellantis), Nissan, and Ford. The analysis focuses on the model years 2018 through 2024, a period that marks the aggressive rollout of these security measures. We dissect the physical and digital bypass mechanisms required to service these vehicles, detailing the precise physical locations of SGW modules in high-volume platforms and analyzing the proprietary connector interfaces that now govern access to the vehicle''s brain. The findings indicate that while software-based authentication (e.g., AutoAuth) is the OEM-preferred path for routine diagnostics, physical bypass solutions remain a critical, albeit invasive, necessity for advanced repair, tuning, and locksmithing operations.
2. The Cybersecurity Imperative and Regulatory Landscape
2.1 The Vulnerability of the CAN Bus
To fully appreciate the necessity and function of the Secure Gateway, one must understand the inherent vulnerability of the Controller Area Network (CAN) protocol. Developed in the 1980s, CAN was designed for reliability and speed, not security. It operates on a broadcast messaging system where every node on the network trusts every other node implicitly. If a device can send a message on the bus—for example, "Command: Apply Brakes"—the receiving modules (e.g., the ABS pump) will execute that command without verifying the sender''s identity.
In the pre-connected era, this was acceptable because gaining access to the CAN bus required physical intrusion into the cabin. However, as vehicles became equipped with cellular modems for navigation, remote start apps, and over-the-air (OTA) updates, the "attack surface" expanded. Researchers demonstrated that if a hacker compromised the infotainment unit (the "Public" side), they could pivot to the CAN bus and send malicious commands to the "Private" side, such as disabling the transmission or controlling the steering. The Secure Gateway Module was introduced to stop this specific lateral movement.1
2.2 The Man-in-the-Middle Architecture
The SGW fundamentally alters the vehicle''s topology by acting as a hardware-based Man-in-the-Middle (MITM). It segments the vehicle network into two distinct zones:
The Public Sector: This zone includes the OBD-II Data Link Connector (DLC) and the Telematics/Radio units. These are considered "untrusted" interfaces because they communicate with the outside world.
The Private Sector: This zone includes the Powertrain CAN (PT-CAN), Body CAN (B-CAN), and Chassis CAN (C-CAN). These networks host the critical ECUs and are considered "trusted".1
The SGW sits between these two zones. There is no longer a direct copper wire connecting the OBD-II port to the Engine Control Unit. Instead, the OBD-II port connects solely to the SGW. All diagnostic requests must pass through the SGW processor. The module evaluates every packet against an Access Control List (ACL). If a generic scan tool requests "Read Data" (e.g., engine RPM, coolant temperature, or DTCs), the SGW permits the traffic, as this poses no safety risk. However, if the tool attempts a "Write" operation—such as clearing trouble codes, actuating a solenoid, or programming a key—the SGW blocks the request unless the tool provides a valid cryptographic certificate.1
2.3 Regulatory Drivers: UN R155 and ISO 21434
While manufacturer self-interest drives some of this security, the primary catalyst is global regulation. The United Nations Regulation No. 155 (UN R155) mandates that vehicle manufacturers must manage cyber risks and ensure vehicles are secure by design. Similarly, the ISO/SAE 21434 standard provides the framework for cybersecurity engineering. These regulations effectively force OEMs to implement gateways to prove they have mitigated the risk of remote attacks. Consequently, what began with FCA in 2018 has now spread to Nissan, Ford, and practically every other major manufacturer, creating a standardized yet fragmented landscape of "walled gardens" that the aftermarket must navigate.
3. Fiat Chrysler Automobiles (Stellantis): The Security Pioneer
Fiat Chrysler Automobiles (FCA), now part of Stellantis, was the first major OEM to implement a fleet-wide firewall. Starting with select 2018 models and achieving near-total saturation by 2019/2020, the FCA Secure Gateway (SGW) became the prototype for the industry''s approach to locking down the OBD-II port.2 The FCA implementation is characterized by its reliance on a specific third-party authentication service (AutoAuth) and the widespread use of a specific physical connector standard known as the "12+8" system.
3.1 The Digital Solution: AutoAuth
The "official" method for bypassing the FCA SGW is purely digital. FCA partnered with a third-party service called AutoAuth to manage the Public Key Infrastructure (PKI) required for tool authentication.
The Workflow: A technician registers their shop and their individual scan tool serial numbers with AutoAuth. When the internet-connected scan tool is plugged into a 2018+ FCA vehicle, it detects the SGW. The tool then communicates via Wi-Fi to the AutoAuth server, which verifies the technician''s credentials. If valid, the server sends a digital token back to the tool, which presents it to the vehicle''s SGW. The SGW then "unlocks," permitting bidirectional controls and code clearing.3
Limitations: While seamless in theory, AutoAuth requires a continuous internet connection, a paid annual subscription (typically /year per shop), and a compatible, up-to-date scan tool.3 For independent locksmiths working in underground garages, mobile mechanics in poor signal areas, or enthusiasts using older hardware, this digital path is often viable. This limitation necessitates the physical bypass.
3.2 The Physical Solution: The 12+8 Bypass
The "12+8 Bypass" is a hardware workaround that physically subverts the SGW logic. Since the SGW is essentially a router sitting between the OBD port and the CAN bus, the bypass involves unplugging the network cables from the SGW and connecting them directly to each other (or to the scan tool), effectively removing the SGW from the circuit.
The Hardware: The bypass typically utilizes a Y-cable or a specialized breakout block. The name "12+8" refers to the pin counts of the two connectors used by the SGW: a 12-pin connector and an 8-pin connector.
The Logic: The 12-pin connector typically carries the "Private" CAN bus lines (e.g., CAN-C) from the vehicle. The 8-pin connector typically carries the lines from the OBD-II port. By bridging these directly, the technician creates a continuous loop, restoring the pre-2018 "open" architecture. This allows any non-networked or older scan tool to function with full authority, as there is no module left to say "no".1
3.3 Detailed SGW Module Locations and Access Procedures
The primary challenge of the physical bypass is locating the SGW. FCA engineers have placed these modules in diverse locations across different platforms, often burying them deep within the dashboard infrastructure to discourage tampering.
3.3.1 Ram 1500 Ecosystem (DS vs. DT Platforms)
The Ram 1500 lineup presents a unique dichotomy due to the concurrent production of two different generations: the "Classic" (DS body code) and the "New Body Style" (DT body code). The SGW location differs radically between these two, causing significant confusion in the field.
A. Ram 1500 "New Body Style" (DT, 2019–2024)
Location: The SGW is located in the driver''s side footwell area, positioned distinctively away from the center stack. It is mounted vertically on the metal dashboard support structure, located roughly above the parking brake pedal mechanism and behind the headlight switch cluster.
Visual Identification: It is a black rectangular box, approximately 4x5 inches.
Access Procedure:
Posture: The technician must adopt a contorted position, lying on the floorboard looking upward into the dash.
Removal: No trim removal is strictly necessary, though it is extremely tight. The module is often obscured by the main wire harness bundle.
Connector Interaction: The 12-pin and 8-pin connectors are plugged into the bottom or side of the module. The locking tabs must be depressed blindly.
Bypass Installation: Once unplugged, the vehicle''s harness connectors are plugged into the male ends of the 12+8 bypass cable. The diagnostic tool then plugs into the OBD port on the bypass cable, not the dashboard.6
B. Ram 1500 "Classic" (DS, 2018–2022)
Location: The SGW is buried directly behind the infotainment/radio head unit in the center dashboard stack. This location reflects the older electrical architecture where the radio was the primary "public" vector.
Access Procedure:
Trim Removal: The process begins with removing the rubber tray liner in the upper dash storage bin to reveal two T20 Torx screws.
Bezel Removal: The entire radio bezel (often including the climate controls) must be pried off. It is held by robust metal retaining clips that require a non-marring pry tool to avoid dashboard damage.
Radio Removal: Four 7mm screws secure the radio receiver. The radio must be pulled forward.
Module Access: The SGW is bolted to the black plastic sub-structure directly behind the void left by the radio.6
Implications: This is a labor-intensive procedure (20–30 minutes) compared to the DT model. It makes "quick scans" via physical bypass highly inefficient, strongly incentivizing the use of AutoAuth for this specific model.
3.3.2 Jeep Wrangler JL (2018+) and Gladiator JT (2020+)
Location: The module is located under the driver''s side dashboard, to the left of the steering column. It is often mounted near the Body Control Module (BCM) and the gateway to the chassis harness.
Access Challenges: While physically closer to the driver than in the Ram DS, the connectors are notoriously difficult to unplug. The module is often oriented such that the locking tabs face the firewall or are blocked by other harnesses.
The "Extension" Phenomenon: Due to the difficulty of reaching these plugs (and the pain of scratching hands on metal brackets), a common modification in the Jeep community is the installation of "12+8 Extension Cables." These short patch cables are installed once (often requiring significant effort or minor disassembly of the lower knee bolster) and then left dangling in the footwell. This provides a permanent, easily accessible "bypass port" for future diagnostics without needing to fight the factory connector retention clips again.9
Access Procedure:
Remove the plastic panel directly below the steering column (held by clips).
Reach up and to the left.
Identify the two white connectors plugged into the black module.
Depress the tabs and pull downwards.11
3.3.3 Chrysler Pacifica (2017/2018+)
Location: The SGW is located in the center stack "waterfall" area, typically behind the climate control module or the rotary gear selector assembly.
Access Procedure:
The lower trim bezel containing the HVAC controls must be removed. This is usually a clip-in fitment.
Once the bezel is popped out, the module is visible mounted deep in the cavity.
Alternative Access: Some technicians report success reaching up from the driver''s footwell toward the center of the car to unplug the connectors blindly, though this requires precise knowledge of the module''s orientation.12
3.3.4 Dodge Charger and Challenger (2018+)
Location: The location varies slightly by year and trim but is generally found under the driver''s side dash, often near the steering column support or the "Double Bracket" area.
Variant Note: Certain sources suggest that on specific high-trim models with advanced Uconnect systems, the module may be located closer to the radio, necessitating the removal of the large dashboard bezel that surrounds both the cluster and the radio (the "racetrack" bezel). Verification of the specific VIN is recommended before attempting disassembly.14
3.4 Technical Reference: FCA 12+8 Connector Morphology
Understanding the physical attributes of the connectors is vital for technicians attempting blind removal in tight spaces.
12-Pin Connector:
Function: Primary interface for the "Private" vehicle networks (CAN-C) and power supply.
Pinout Configuration: Dual-row layout (2 rows x 6 pins).
Visuals: White or Off-White nylon housing.
Locking Mechanism: A single, firm depression tab located on the top center of the connector body.
Wire Colors (Typical): Red/Yellow (12V Constant), Black (Ground), White/Green (CAN-C High), White/Blue (CAN-C Low). Note: Wire colors can vary by model year; pin position is the reliable standard.
8-Pin Connector:
Function: Interface for the "Public" networks (CAN-IHS) and the OBD-II port communication lines.
Pinout Configuration: Dual-row layout (2 rows x 4 pins).
Visuals: Matching White/Off-White nylon housing.
Locking Mechanism: Top center tab.
Common Failure Points: The locking tabs are prone to becoming brittle. In "blind" removal scenarios, technicians often use a pick tool to depress the tab, which carries a risk of snapping the lock or damaging the wire retention mechanism.1
4. Nissan: The Integrated Gateway and the "Silent" Block
While FCA''s SGW is a loud and obvious barrier—often throwing "Communication Error" messages immediately—Nissan''s approach is more subtle and integrated. Following the implementation of UN R155, Nissan began rolling out its secured architecture with the 2020 Nissan Sentra (B18) and the 2021 Nissan Rogue (T33). Unlike FCA''s standalone box, Nissan''s security logic is often embedded within the Central Gateway (CGW) or the Body Control Module (BCM), making "removal" impossible. Instead, the bypass relies on intercepting signals at the connector level.
4.1 Architecture: The 16+32 System
The Nissan system is colloquially known in the aftermarket as the 16+32 Gateway due to the pin count of the primary connectors involved in the bypass.
32-Pin Connector: This high-density connector typically handles the primary communication traffic, including the High-Speed CAN lines that link the BCM to the ECU and the Intelligent Power Distribution Module (IPDM).
16-Pin Connector: This connector manages auxiliary bus traffic and secondary signals.
4.2 The Bypass Distinction: Diagnostics vs. Immobilizer
A critical nuance in the Nissan ecosystem is the difference in security levels between standard diagnostics and key programming.
Standard Diagnostics: For routine tasks like reading Check Engine lights or viewing live data parameters, many modern scan tools (Autel, Launch, Snap-on) can authenticate with the Nissan gateway over the internet (via AutoAuth or similar OEM protocols) without requiring any physical cable. The gateway allows these "Read" operations more permissively.4
Immobilizer (IMMO) / Key Programming: This is where the physical bypass becomes mandatory. On the B18 Sentra and T33 Rogue, the gateway actively blocks the retrieval of the PIN Code (a 20-digit security code required to program new keys) during an "All Keys Lost" or "Add Key" scenario. Even with online authentication, the gateway often refuses to release this PIN to aftermarket tools.
The 16+32 Cable Solution: To circumvent this, the technician must use a "Nissan 16+32 Gateway Adapter." This cable connects in-line (or as a complete bypass) between the vehicle''s harness and the scan tool. It physically intercepts the CAN lines before they enter the restrictive logic of the BCM/Gateway, allowing the tool to query the immobilizer data directly from the network without the Gateway filtering the request.16
4.3 Detailed Locations and Access Procedures
4.3.1 Nissan Sentra (B18 Chassis, 2020–2024)
Target Module: The security logic is housed in the BCM/Gateway cluster.
Location: The module is located under the driver''s side dashboard, positioned high up near the firewall, typically above the brake pedal assembly.
Access Procedure:
Trim Removal: Remove the driver''s side door sill plate and the kick panel trim.
Dash Panel: Remove the lower dashboard cover (knee bolster) to gain visibility.
Visual ID: Look for a rectangular black box with multiple connectors. The 32-pin and 16-pin connectors are often adjacent.
Connection: The space is notoriously tight. Technicians often report having to lay supine in the footwell to reach the connectors. The bypass cable is plugged into the vehicle harness connectors (which are unplugged from the module), effectively isolating the module from the tool''s query path.18
4.3.2 Nissan Rogue (T33 Chassis, 2021–2024)
The Rogue (and the mechanically similar Mitsubishi Outlander, 2022+) presents a different location that has caused confusion in early documentation.
Target Module: Gateway/Smart Key ECU.
Location: The access point is behind the glovebox on the passenger side. This is distinct from the Sentra''s driver-side location.
Access Procedure:
Glovebox Removal: The glovebox assembly must be removed. This typically involves opening the glovebox and removing the dampener arm (a string or plastic piston) on the right side.
Screws: There are usually 5 to 8 Phillips-head screws securing the glovebox frame to the dashboard: typically three along the bottom edge (visible with the glovebox closed) and three to five along the top edge (visible only when the glovebox is open).
Removal: Once unscrewed, the entire glovebox compartment pulls straight out.
Module Identification: Behind the glovebox, mounted to the metal cross-car beam or the HVAC ducting support, is the module rack. The Gateway/BCM connectors (16+32 style) are accessible here.
Advisory: This location is generally considered easier to access than the Sentra''s kick panel, as it allows for working from a seated position (passenger seat) rather than the footwell contortion.19
4.4 Technical Reference: Nissan 16+32 Connector Morphology
32-Pin Connector:
Housing: Typically Gray or Black.
Shape: Rectangular, elongated.
Density: High-density pin layout (2 rows x 16 pins).
Wire Gauge: Mixed. Mostly thin signal wires (20-22 AWG) with a few slightly thicker power wires at the edges.
16-Pin Connector:
Housing: Matches the 32-pin in color.
Shape: Shorter rectangle.
Pin Configuration: 2 rows x 8 pins.
Bypass Cable Note: The male pins on the aftermarket 16+32 adapters are often long and thin. A common failure mode is "bent pins" during insertion. Technicians are advised to inspect the adapter pins for straightness before attempting to mate them with the vehicle''s female harness connectors.21
5. Ford: The CAN-FD Frontier and the Active Alarm Paradox
Ford''s entry into the secured architecture era is marked by the introduction of the FNV2 (Ford Network Vehicle 2) electrical architecture, debuting largely with the 2021 Ford F-150 and the Mustang Mach-E. This architecture is a quantum leap from previous iterations, utilizing CAN-FD (Flexible Data-rate) protocol to handle the massive data throughput required for Over-the-Air (OTA) updates and advanced driver-assistance systems (BlueCruise).
5.1 The CAN-FD Barrier
The first "barrier" technicians encounter with 2021+ Fords is not always a security firewall, but a protocol incompatibility. The CAN-FD protocol operates at variable data rates (up to 5 Mbps or higher) and supports payload sizes up to 64 bytes (compared to standard CAN''s 8 bytes).
The Symptom: Older OBD-II tools that only support standard CAN 2.0 will fail to communicate with the vehicle modules, appearing as if the gateway is blocking them.
The Solution: This is not a "bypass" issue but a hardware issue. Technicians must use a CAN-FD Adapter (supported by Autel, Launch, Topdon) that acts as a translator, or upgrade to newer tools with native CAN-FD support. The Gateway Module (GWM) expects this protocol; without it, the conversation never starts.22
5.2 The Active Alarm / All Keys Lost (AKL) Problem
For locksmiths, the Ford FNV2 architecture introduced a formidable challenge known as the "Active Alarm Lockdown."
The Scenario: In an "All Keys Lost" situation, the vehicle is locked, and the factory alarm is armed. On previous generations, a locksmith could plug into the OBD port and initiate a 10-minute security wait time to bypass the alarm.
The Security Logic: On 2021+ models (F-150, Mach-E, Explorer), if the alarm is active, the GWM and BCM effectively shut down the OBD port''s ability to initiate key programming. The vehicle assumes any attempt to program a key while the alarm is screaming is a theft attempt.
The Limitation: You cannot simply clear the alarm because you have no working key. It is a catch-22.
5.3 The Physical Solution: The Battery Cable Bypass
To break this loop, the aftermarket (specifically companies like Xhorse and Autel) developed a bypass cable that attacks the power source rather than the data bus.
The Logic: The bypass cable connects directly to the vehicle''s 12V battery and the diagnostic tool. It does not plug into the GWM inside the dash. Instead, it manipulates the vehicle''s power state—likely by creating a specific "wake-up" signal or power cycling sequence that forces the BCM into a "maintenance" or "pre-boot" state where the alarm logic is temporarily suspended, allowing the OBD tool to shake hands with the immobilizer.
The Connection Procedure:
Disconnect Negative: The technician must disconnect the negative terminal of the vehicle''s 12V battery.
Install Bypass Clamp: The bypass cable''s negative clamp connects to the vehicle''s disconnected negative cable.
Bridge to Battery: The bypass cable also connects to the battery''s positive and negative posts, effectively sitting in-line with the vehicle''s power supply.
Result: The tool (e.g., Autel IM608 or Xhorse Key Tool Plus) manages the power flow, cycling the ignition state electronically to bypass the alarm trigger.23
5.4 GWM Module Locations and Access (Non-Battery Methods)
For tasks other than key programming—such as recovering a "bricked" module after a failed OTA update or performing rigorous diagnostics—direct access to the Gateway Module (GWM) connectors is sometimes required to hook up specialized harnesses (like the Mongoose-Plus).
5.4.1 Ford F-150 (2021+)
Location: The GWM is located in the lower center stack, physically positioned below the radio unit.
Access Procedure:
Lower Trim: Remove the screws securing the lower center stack trim panel (often six 7mm screws).25
Side Trim: Remove the two 10mm screws securing the side panels of the center console to gain clearance.
Module Exposure: With the trim removed, the GWM is visible. It is a large module with multiple connectors (typically 3 or 4, depending on trim level).
Connector Interaction: The connectors here are 26-pin variants designed for the high-speed FNV2 network. Unplugging these allows for the insertion of "T-harnesses" used by fleet telematics installers or deep-level diagnostic tools.25
5.4.2 Ford Mustang Mach-E (2021+)
Challenge: The Mach-E, being an EV, has a different packaging layout.
Location: The Smart Data Link Module (GWM) is deeply integrated into the dashboard infrastructure.
Fuse Bypass: For resetting a glitchy gateway (a common troubleshooting step), technicians often rely on pulling the GWM fuse located in the Body Control Module fuse box (Passenger footwell) rather than physically accessing the buried module.26
EV Battery Caution: When performing the "Active Alarm" battery bypass on a Mach-E, technicians must be acutely aware that the 12V battery is located in the "frunk" (front trunk). If the 12V system is dead, the electronic latch to open the frunk will not operate. The technician must first use the emergency release access cover in the front bumper to jump the latch solenoid, open the hood, and then proceed with the battery cable bypass.27
6. Diagnostic Workflow: Choosing the Right Access Method
The complexity of modern vehicle security means there is no "one size fits all" tool. Technicians must employ a decision logic to determine the most efficient access path.
6.1 Diagnostic Decision Logic
The choice between software (AutoAuth/OEM Cloud) and hardware (Bypass Cable) depends largely on the specific task and the vehicle manufacturer.
Scenario A: Routine Diagnostics (Read/Clear Codes, Live Data)
FCA: AutoAuth is the superior choice. It is faster (no disassembly) and supports all modules. The physical bypass is a fallback for when the internet is unavailable or the subscription is expired.
Nissan: Standard OBD-II (often with Cloud support) usually suffices. The 16+32 cable is rarely needed for simple code clearing.
Ford: Standard OBD-II (with CAN-FD adapter) is sufficient.
Scenario B: Advanced Repair (Bidirectional Control, Calibrations)
FCA: AutoAuth works for 95% of tasks. However, some ECU tuning or odometer correction tools may still require the physical 12+8 cable to write directly to the EEPROM without SGW interference.
Nissan: Standard OBD-II typically works, but some specific active tests may require the 16+32 cable if the gateway security logic is particularly aggressive on that specific software version.
Scenario C: Key Programming (IMMO / All Keys Lost)
FCA: 12+8 Cable is frequently preferred or required by locksmith tools (like the Autel IM508/608) to ensure uninterrupted communication with the RF Hub.
Nissan: 16+32 Cable is Mandatory for 2020+ Sentra and Rogue. The gateway will block the PIN code read request without it.
Ford: Active Alarm Cable (Battery connection) is Mandatory for AKL situations on 2021+ F-150/Mach-E. The OBD port is functionally dead for programming while the alarm is active.
6.2 Comparative Analysis Table
FeatureAutoAuth / Cloud AuthPhysical Bypass (FCA 12+8 / Nissan 16+32)Ford Active Alarm Cable
Primary MechanismDigital Certificate Exchange via Wi-FiPhysical Circuit Bridging (Man-in-the-Middle removal)Power State Manipulation (Alarm Logic Reset)
Best Used ForGeneral Repair, Emissions, Code ClearingLocksmithing, Tuning, "Offline" Repairs"All Keys Lost" Programming on 2021+ Fords
InvasivenessLow (Plug into OBD port)High (Requires dashboard/trim disassembly)Medium (Requires under-hood battery access)
CostRecurring Subscription (/yr)One-time Hardware Purchase (–)One-time Hardware Purchase (–)
Risk FactorMinimalModerate (Broken clips, bent pins)Moderate (Short circuit risk if clamped wrong)
Future OutlookBecoming the Industry StandardLikely to be phased out as cryptography improvesSpecific to current architecture generation
7. Implications for the Aftermarket
The data clearly indicates a shift in the balance of power between OEMs and the independent aftermarket. The Secure Gateway is not merely a component; it is a policy enforcement device. While the "Right to Repair" movement has secured access to the data (via generic OBD modes), the ability to act on that data—to fix, to tune, to program—is now gated.
For the independent shop, this necessitates a capital investment not just in tools, but in subscriptions and time. The "quick code clear" that once took 30 seconds on a Ram 1500 now takes 30 minutes if the AutoAuth server is down and the radio bezel must be pulled. For the locksmith, the 16+32 and Active Alarm cables are now as essential as the key cutting machine itself.
Ultimately, the Secure Gateway has standardized the need for a "Hybrid" toolkit: a technician in 2024 cannot rely solely on a physical connection or a digital credential. They must possess both, and the knowledge of when to deploy each, to navigate the fortified chassis of the modern connected vehicle.

', 'AKL_PROCEDURE');
        
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ12BDM', 'Toyota', 'Camry', 2010, 2014, '315', '4D-G (80-bit)', 'TOY43 / TOY44G', '"G" Key (Dot)', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ12BDM', 'Toyota', 'Corolla', 2010, 2014, '315', '4D-G (80-bit)', 'TOY43 / TOY44G', '"G" Key (Dot)', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ12BDM', 'Toyota', 'Camry', 2014, 2017, '315', '8A "H" (128-bit)', 'TOY44G-PT', '"H" Key (Blade)', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ12BDM', 'Toyota', 'RAV4', 2014, 2017, '315', '8A "H" (128-bit)', 'TOY44G-PT', '"H" Key (Blade)', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBA', 'Toyota', 'Prius C', 2012, 2020, '315', '4D-G', 'TOY48', 'Board 0020', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBA', 'Toyota', 'RAV4', 2012, 2020, '315', '4D-G', 'TOY48', 'Board 0020', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBA', 'Toyota', 'Highlander', 2014, 2019, '315', '8A "H"', 'TOY48', 'Board 2110', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBA', 'Toyota', 'Tacoma', 2014, 2019, '315', '8A "H"', 'TOY48', 'Board 2110', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBA', 'Toyota', 'Land Cruiser', 2016, 2019, '315', '8A "H"', 'TOY48', 'Board 2110', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBW', 'Toyota', 'Camry (Smart)', 2019, 2025, '315', 'Hitag AES (4A)', 'TOY48', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBX', 'Toyota', 'Tacoma', 2022, 2024, '314.3', '8A', 'TOY48', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FBX', 'Toyota', 'Tundra', 2022, 2024, '314.3', '8A', 'TOY48', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FLD', 'Toyota', 'Lexus NX', 2023, 2025, '434', '8A', 'TOY48', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('HYQ14FLD', 'Toyota', 'RX', 2023, 2025, '434', '8A', 'TOY48', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('N5F-S0084A', 'Honda', 'Civic', 2010, 2013, '314', 'ID46', 'HON66', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V1X', 'Honda', 'Accord', 2013, 2015, '313.8', 'ID47', 'HON66', 'Driver 1', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V2X', 'Honda', 'Pilot', 2016, 2020, '433', 'ID47', 'HON66', 'Driver 1', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V2X', 'Honda', 'Civic', 2016, 2020, '433', 'ID47', 'HON66', 'Driver 1', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V2X', 'Honda', 'CR-V', 2016, 2020, '433', 'ID47', 'HON66', 'Driver 1', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V2X', 'Honda', 'Pilot', 2016, 2020, '433', 'ID47', 'HON66', 'Driver 2', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V2X', 'Honda', 'Civic', 2016, 2020, '433', 'ID47', 'HON66', 'Driver 2', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V2X', 'Honda', 'CR-V', 2016, 2020, '433', 'ID47', 'HON66', 'Driver 2', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5TP-4', 'Honda', 'Accord', 2021, 2025, '433', '4A (AES)', 'HON66', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5TP-4', 'Honda', 'Civic', 2021, 2025, '433', '4A (AES)', 'HON66', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V44', 'Honda', 'Passport', 2019, 2025, '433', 'ID47', 'HON66', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5V44', 'Honda', 'Pilot', 2019, 2025, '433', 'ID47', 'HON66', '-', 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR55WK49622', 'Nissan', 'Murano', 2010, 2014, '315', 'ID46', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('CWTWB1U840', 'Nissan', 'Sentra', 2013, 2019, '315', 'ID46', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('CWTWB1U840', 'Nissan', 'Versa', 2013, 2019, '315', 'ID46', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5S180144', 'Nissan', 'Pathfinder', 2013, 2018, '433', 'ID47 (Hitag 3)', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5S180144', 'Nissan', 'Altima', 2013, 2018, '433', 'ID47 (Hitag 3)', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5TXN1', 'Nissan', 'Rogue', 2021, 2023, '434', '4A (AES)', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5TXN3', 'Nissan', 'Rogue (High Trim)', 2021, 2023, '434', '4A (AES)', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('KR5TXPZ1', 'Nissan', 'Ariya', 2023, 2025, '434', '4A (AES)', 'NSN14', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('CWTWB1U793', 'Ford', 'Edge', 2010, 2014, '315', '4D-63 (80-bit)', 'HU101', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('CWTWB1U793', 'Ford', 'Explorer', 2010, 2014, '315', '4D-63 (80-bit)', 'HU101', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('M3N5WY8609', 'Ford', 'Focus', 2011, 2019, '315', 'ID46', 'HU101', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('M3N5WY8609', 'Ford', 'Escape', 2011, 2019, '315', 'ID46', 'HU101', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('M3N-A2C31243300', 'Ford', 'F-150', 2015, 2020, '902', 'ID49 (902 MHz)', 'HU101', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('M3N-A2C31243300', 'Ford', 'Fusion', 2015, 2020, '902', 'ID49 (902 MHz)', 'HU101', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('N5F-A08TAA', 'Ford', 'Transit Connect', 2020, 2024, '315', 'ID49', 'HU101', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('-', 'Ford', 'Fiesta', 2018, 2024, '-', 'ID49', 'HU198', NULL, 'Gemini Research');
INSERT OR REPLACE INTO curated_overrides (fcc_id, make, model, year_start, year_end, frequency, chip, key_blank, notes, source) 
            VALUES ('-', 'Ford', 'Focus (Euro)', 2018, 2024, '-', 'ID49', 'HU198', NULL, 'Gemini Research');