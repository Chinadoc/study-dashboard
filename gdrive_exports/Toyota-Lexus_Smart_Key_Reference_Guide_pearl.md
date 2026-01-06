ï»¿The Architecture of Access: A Definitive Locksmithâs Guide to Toyota & Lexus Immobilizer Systems (2012â2026)
Executive Summary
The automotive security landscape has undergone a tectonic shift over the last decade, with Toyota and Lexus standing at the epicenter of this evolution. For the modern locksmith, the days of simple OBD-II "plug-and-play" programming are effectively over. The ecosystem has transitioned from the static, predictable encryption of the early 2010s to dynamic, rolling-code architectures, culminating in the complex "BA" system that now governs the latest generation of vehicles such as the bZ4X, Tundra, and Sienna. This report serves not merely as a catalog of parts, but as a comprehensive operational manual for navigating this hostile new terrain. It dissects the logic behind Toyotaâs immobilizer migrationâfrom 40-bit encryption to 128-bit AES and beyondâand provides the granular, field-tested intelligence required to service these vehicles when standard protocols fail.
The analysis presented here aggregates data from technical service bulletins, aftermarket tool developer logs, and verified field procedures to establish a "single source of truth" for the automotive security professional. We address the critical "Blackout" of 2023, where All-Keys-Lost (AKL) capabilities were stripped from major diagnostic platforms in North America, and detail the specific hardware workarounds now required. Whether dealing with a legacy H-chip Camry or a 2025 hybrid system requiring gateway bypass, this document provides the architectural understanding necessary to maintain access.
________________
CHAPTER 1: IMMOBILIZER SYSTEM EVOLUTION
To effectively service the modern Toyota and Lexus fleet, one must first understand the "language" of the transponder. The key is no longer a physical object in the traditional sense; it is a cryptographic credential involved in a complex handshake protocol. Confusion in the field often arises from a superficial reading of the vehicle's featuresâassuming that because two vehicles both have push-button start, they operate on the same logic. This chapter deconstructs the timeline of security architectures to clarify why a tool that services a 2019 RAV4 may fail catastrophically on a 2022 Tundra, despite similar appearances.


  



1.1 The Legacy Era: G-Chip (4D-72)
The "G-Chip" era, spanning approximately 2010 through 2014, represents the final iteration of the legacy Texas Instruments 4D Crypto architecture.1 Physically identified by a "G" stamped on the metal blade of master keys, this system relied on 80-bit encryption. While robust for its time, it operated on a relatively static challenge-response mechanism.
For the locksmith, these systems are the "Hello World" of Toyota programming. The immobilizer ECU accepts standard OBD-II commands for adding keys without requiring complex server-side verification. In an All-Keys-Lost (AKL) scenario, the system requires a "Reset" or "Re-flash," a procedure that wipes all registered keys and returns the immobilizer to a virgin state (Auto-Learn mode).2 This reset typically enforces a 16-minute security delayâa hardcoded timer in the ECU designed to discourage "smash and grab" theft, though modern tools have largely automated the wait process.
1.2 The Transitional Era: H-Chip (8A / 128-bit AES)
The introduction of the "H-Chip" around 2014 marked a significant leap in cryptographic hardness. Moving to 128-bit AES (Advanced Encryption Standard), Toyota bifurcated its security strategy into two distinct paths that often confuse technicians:
1. Bladed H-Key: Utilized in lower trim levels (e.g., Corolla LE, RAV4 LE) from 2014 to 2019.4 While physically resembling the older G-key (using the same TOY43 or TOY48 profiles), the internal transponder is a Texas Instruments AES 8A chip.
2. Smart H-Key (Prox): Found in higher trims (XLE, Limited). While the industry colloquially refers to these as "Smart Keys," deeply technical discussions classify them as "8A Smart Systems."
The distinction is critical because, unlike the G-chip, the H-chip handshake cannot be easily cloned or simulated by older hardware without specific AES decryption capabilities. This era introduced the requirement for locksmiths to carry tools capable of "sniffing" data from the ignition coil to calculate the encryption key, a process that eventually led to the development of "Key Emulators" (like the Autel APB112 or Lonsdor LKE).5
1.3 The Modern Era: DST-AES (The "Toyota 8A" Smart System)
Between 2018 and 2021, Toyota began hardening the OBD-II port against unauthorized access. This "DST-AES" era is characterized by the migration of immobilizer logic deeper into the vehicle's Certification ECU (often called the Smart Box).
During this period, Toyota introduced a rolling code scheme for diagnostic communication. Previous tools that relied on static backdoors or fixed seed-key algorithms were suddenly locked out. This era birthed the current "All Keys Lost" crisis. In the past, a reset was a simple command. In the DST-AES era, the dealer procedure for AKL mandates the replacement of the Smart ECUâa repair often exceeding $1,500.2 To circumvent this, the aftermarket developed methods to read the EEPROM data directly from the Smart ECU or use emulators to simulate a master key, tricking the ECU into "Add Key" mode rather than requiring a full reset.
1.4 The "BA" Architecture (2021âPresent)
The current frontier of Toyota security is the "BA" system, so named because the "Page 4" data of the transponder chip reads "BA" when scanned.7 This architecture debuted on the 2021 Sienna and Venza, followed by the 2022 Tundra and 2023 bZ4X.9
The "BA" system represents a fundamental change in access philosophy. The Smart ECU in these vehicles will not accept standard OBD commands for key programmingâspecifically in AKL scenariosâwithout a cryptographic authorization that is strictly controlled by Toyota's servers. Most aftermarket tools cannot generate this authorization via OBD alone.
This has necessitated a return to physical intervention. To program these vehicles when all keys are lost, the locksmith must physically bypass the vehicle's gateway by connecting directly to the pins of the Smart ECU.11 This "Bypass" method allows the programming tool to communicate directly with the immobilizer processor, circumventing the gateway's security filters. This requirement has fundamentally changed the locksmith's workflow, turning a software job into a hardware installation task involving dashboard disassembly.
1.5 Lexus-Specific Variations
It is a general rule of thumb that Lexus leads the Toyota implementation timeline by 12 to 24 months.13 Technologies that frustrate locksmiths on a 2022 Tundra often debuted on a 2020 Lexus LS or LC.
Lexus implementations differ in two key ways:
1. Hardware Obfuscation: Lexus Smart ECUs are notoriously difficult to access, often buried behind the evaporator core or high in the kick panels, making the "Bypass" method significantly more labor-intensive than on equivalent Toyota models.2
2. Digital Key Interference: The 2022+ Lexus lineup (NX, RX, LX) heavily integrates "Digital Key" (smartphone access) hardware. This creates a virtual "key slot" in the system.14 If this slot is occupied or corrupted, it can block the programming of physical keys, requiring a specific "Digital Key Reset" procedure that is distinct from the standard immobilizer reset.
________________
CHAPTER 2: COMPLETE FCC ID REGISTRY (2012â2026)
The FCC ID is the primary diagnostic identifier for the locksmith, but relying on it exclusively is a trap. Toyota frequently reuses FCC IDs across incompatible circuit boards. The Board ID (or PCB Number) is the true genetic marker of the key. This chapter provides an exhaustive registry of these identifiers, correlating them with the specific vehicle applications and necessary hardware details.
2.1 Major FCC ID Families and Detailed Specifications
HYQ14FBA (The "Universal" Smart Key)
This is arguably the most common FCC ID in the Toyota ecosystem, covering the vast majority of mid-range vehicles from 2012 to 2019.16 However, it contains a critical bifurcation: the "G" board vs. the "AG" board.
* Variant A: Board ID 281451-0020 ("G" Board)
   * Identification: Green circuit board stamped with "0020" or a "G".
   * Models:
      * Camry: 2012â2017 16
      * Avalon: 2013â2018
      * Corolla: 2014â2019
      * RAV4: 2013â2018 (Note: Power liftgate models use a different button layout)
      * Highlander: 2014â2016 (Non-power liftgate)
   * Frequency: 314.3 MHz / 315 MHz
   * Chip Type: 8A (P4: 88)
   * OEM Part Numbers: 89904-06140, 89904-0R080
* Variant B: Board ID 281451-2110 ("AG" Board)
   * Identification: Green circuit board stamped with "2110" or "AG".
   * Critical Note: While physically identical to the "G" board, these are not interchangeable. The "AG" board is typically used in SUVs and trucks with different antenna output power requirements.
   * Models:
      * Highlander: 2014â2019 17
      * Tacoma: 2016â2021 (Smart Key Trims) 18
      * Tundra: 2018â2021
      * Land Cruiser: 2016â2019
   * OEM Part Numbers: 89904-0E120, 89904-0E121
HYQ14FBB (The Truck/SUV Specialist)
This key is distinctively shaped (often a thicker, ruggedized fob) and is the standard for Toyota's body-on-frame truck platform prior to the 2022 redesign.9
* Board ID: 231451-0010 (G Board)
* Models:
   * 4Runner: 2010â2022 (Limited/TRD Pro) 9
   * Land Cruiser: 2008â2015 (Earlier ID HYQ14AEM), 2016â2021 (HYQ14FBB)
   * Tacoma: 2015â2021 (Select TRD trims)
   * Tundra: 2020â2021 (Proximity Trims) 9
   * Sequoia: 2019â2021
* Frequency: 314.3 MHz
* Chip Type: 8A (P4: 88)
* Button Layout: Typically 3-button (Lock, Unlock, Panic). Some SUV models include a hatch/glass release.
* OEM Part Numbers: 89904-35060, 89904-0C050
HYQ14FBC (The Modern Standard - Pre-BA)
This key marks the transition to the TNGA (Toyota New Global Architecture) platform. It introduced a new casing style and updated encryption.20
* Board ID: 231451-0351
* Models:
   * Camry: 2018â2022 20
   * RAV4: 2019â2021 21
   * Avalon: 2019â2022
   * Prius: 2016â2022 (Prime and standard)
   * C-HR: 2018â2021
* Frequency: 315 MHz
* Chip Type: 8A (P4: A9)
* Button Layout: 3 or 4 buttons.
* OEM Part Numbers: 89904-06220 (Camry), 8990H-0R010 (RAV4)
HYQ14FBX / HYQ14FLC (The "BA" System)
This is the current generation key, recognizable by its specific application in the newest models.22
* Board ID: 231451-3041 (Sienna/Venza), 14FBX/14FLC (Lexus)
* Critical Identifier: When reading the chip configuration, Page 4 will display "BA".
* Models:
   * Sienna: 2021â2025 23
   * Venza: 2021â2025 10
   * Tundra: 2022â2025 25
   * Sequoia: 2023â2025
   * bZ4X: 2023â2025 22
   * Lexus NX: 2022+ 26
   * Lexus LX600: 2022+ 27
* Frequency: 315 MHz (US Market)
* Chip Type: 8A (P4: BA)
* OEM Part Numbers: 8990H-08020 (Sienna), 8990H-0C010 (Tundra)
HYQ14ACX (Lexus Legacy)
The workhorse of the Lexus lineup for nearly a decade.28
* Board ID: 271451-5290
* Models:
   * RX350/450h: 2010â2015 29
   * CT200h: 2011â2017
   * GX460: 2010â2019
   * LX570: 2008â2015
   * LS460: 2010â2017
* Chip Type: G-Chip (4D-60/4D-72) or early 8A depending on year.
* OEM Part Numbers: 89904-48191, 89904-50K80
2.2 Table of Common FCC IDs & Applications
FCC ID
	Board ID (PCB)
	Frequency
	Chip/Page 4
	Buttons
	Key Profile
	Primary Models & Years
	HYQ14FBA
	281451-0020 (G)
	315 MHz
	8A / 88
	3/4
	TOY48
	Camry (2012-2017), Avalon (2013-2018), Corolla (2014-2019), RAV4 (2013-2018)
	HYQ14FBA
	281451-2110 (AG)
	315 MHz
	8A / 88
	3/4
	TOY48
	Highlander (2014-2019), Tacoma (2016-2021*), Tundra (2018-2021)
	HYQ14FBB
	231451-0010
	315 MHz
	8A / 88
	3/4
	TOY48
	Tacoma (2015-2021), Tundra (2020-2021), 4Runner (2020-2022), Land Cruiser (2016-2021)
	HYQ14FBC
	231451-0351
	315 MHz
	8A / A9
	3/4
	TOY48
	Camry (2018-2022), RAV4 (2019-2021), Avalon (2019-2022), Prius (2016-2021)
	HYQ14FBN
	231451-2000
	315 MHz
	8A / A9
	3/4
	TOY48
	Corolla (2019-2022), C-HR (2019-2021)
	HYQ14FBX
	231451-3041
	315 MHz
	8A / BA
	3/4/5
	TOY48
	Sienna (2021+), Venza (2021+), Tundra (2022+), Sequoia (2023+), bZ4X (2023+)
	HYQ14FBW
	231451-XXXX
	315 MHz
	8A / BA
	4
	TOY48
	Camry (2025+), Crown (2023+)
	HYQ14ACX
	271451-5290
	315 MHz
	G (4D-60)
	4
	TOY48
	Lexus RX (2010-2015), CT200h (2011-2017), GS (2013-2015), LS (2010-2017)
	HYQ14FBE
	231451-XXXX
	315 MHz
	8A / A8
	4
	TOY48
	Lexus ES (2013-2018), GS (2016-2020), IS (2014-2020)
	HYQ14FLC
	231451-XXXX
	315 MHz
	8A / BA
	3/4
	TOY48
	Lexus NX (2022+), LX600 (2022+), RX (2023+)
	HYQ14FBZ
	231451-3410
	315 MHz
	8A / A9
	3/4
	TOY48
	Lexus ES (2019-2022), LS (2018-2022), UX (2019-2022), LC (2018+)
	HYQ14AEM
	1551A-14AEM
	315 MHz
	4D-67
	3
	TOY43
	Land Cruiser (2008-2015), Tacoma (2016-2017 - Rare)
	2.3 Battery Types & Maintenance
* CR2032: The standard for almost all HYQ14FBA, HYQ14FBC, and HYQ14FBB remotes.
* CR2450: Used in the newer "BA" system keys (HYQ14FBX, HYQ14FLC) due to the higher power draw of the UWB (Ultra Wide Band) radios used for digital key positioning.22
* CR1632: Commonly found in older Lexus keys (HYQ14ACX) and some early Prius fobs.30
________________
CHAPTER 3: PROGRAMMING PROCEDURE MATRIX
The methodology for adding a key or recovering from an All-Keys-Lost (AKL) scenario depends entirely on the chip generation and system architecture. This chapter details the workflows for the three primary system generations.
3.1 H-Chip & G-Chip Vehicles (Pre-2019)
These systems, while legacy, constitute the highest volume of service calls. The architecture is permissive, allowing for relatively straightforward OBD manipulation.
Add Key Procedure (Customer has 1 working key)
* Tools: Autel IM508/608, Smart Pro, Xhorse Key Tool Plus, Techstream.
* Workflow:
   1. Connect the tool to the OBD-II port.
   2. Navigate to Immobilizer -> Toyota -> Auto Detect.
   3. Select "Add Key" or "Add Smart Key".
   4. The system will verify the number of keys currently registered.
   5. Step 1: Hold the existing working key to the Start Button. The vehicle will beep once.
   6. Step 2: Within 30 seconds, hold the new key to the Start Button. The vehicle will beep once (registration) and then twice (verification).
   7. Completion: The dashboard "Security" light will stop flashing.
* Time Estimate: 5â10 minutes.
All Keys Lost (AKL) Procedure
* Method A: Emulator (Preferred)
   * Requirement: An emulator tool (Autel APB112, Lonsdor LKE, or Xhorse Key Tool).
   * Workflow: The tool captures the data stream from the ignition coil and calculates the encryption key. It then writes this data to the emulator, turning it into a "temporary master key." You then proceed with the "Add Key" procedure using the emulator as the "working key."
* Method B: Immobilizer Reset (Re-flash)
   * Workflow: This erases all keys.
   1. Select "All Keys Lost" or "Immobilizer Reset".2
   2. The tool will initiate a 16-minute security timer. This cannot be bypassed on G-chip systems without specific EEPROM work.
   3. After 16 minutes, the ECU enters "Auto-Learn" mode.
   4. You must then register the new keys sequentially (usually up to 3 keys) by holding them to the button.
3.2 8A/DST80 Vehicles (2019â2021)
This generation introduced the "Rolling Code" OBD protection, which disrupted the aftermarket tool industry.
The "Blackout" of 2023
In 2023, Autel and other manufacturers were forced to remove AKL capabilities for these vehicles from their North American tools due to intellectual property disputes and security concerns.32 Consequently, many locksmiths found their IM608s suddenly unable to perform AKL on a 2020 RAV4.
Current Solutions
1. Techstream + NASTF: The official dealer method. Requires a secure professional ID (LSID) and a subscription to TIS. You generate a "Seed Number" from the vehicle, upload it to TIS, and receive a 12-digit passcode to authorize the reset.
2. Lonsdor K518 / Smart Pro: These tools have maintained better coverage for these years, often utilizing proprietary servers to calculate the rolling code bypass without a full NASTF login, though this requires internet access and sometimes token consumption.34
3.3 The "BA" System (2022+ Tundra, Sienna, bZ4X)
This represents the most significant barrier to entry for modern locksmiths.


  



The Bypass Requirement
Standard OBD programming will fail for AKL on BA systems. The Smart ECU actively rejects the reset command. To program these, you must physically bypass the gateway.7
Hardware
* ADC2021 Cable: Used with Advanced Diagnostics (Smart Pro).
* Toyota-30 Cable: Used with Autel, OBDSTAR, and Xhorse.8 This cable is a "Y" splitter that connects directly to the Smart ECU.
AKL Procedure (BA System)
1. Locate the Smart ECU: This is the most difficult step (See Chapter 9).
   * Sienna (2021+): High behind the glovebox.
   * Tundra (2022+): Driver side kick panel/dash.
   * bZ4X: Passenger side instrument panel.
2. Connection: Disconnect the 30-pin connector from the Smart ECU. Plug the Bypass Cable into the ECU and the vehicle harness into the other end of the cable. Connect the OBD end to your programmer.
3. Execution: Select the "BA System" or "Tundra 2022+" menu. The tool communicates directly with the immobilizer chip, bypassing the gateway's security filter.
4. Key Generation: Tools like the Lonsdor K518 Pro with the LT20 board can generate a new master key data file and write it to the universal key, which is then registered to the vehicle.36
Programming Capability Table
Model
	Years
	Chip
	Add Key Tool
	AKL Tool
	PIN Required?
	Bypass Cable?
	Dealer Only Situations
	Camry
	2012-2017
	8A (G)
	Autel/SP/Techstream
	Emulator/Reset
	No
	No
	Rare
	Camry
	2018-2024
	8A (Roll)
	Autel/SP/Techstream
	Lonsdor/SP/Dealer
	Yes (Calc)
	No
	NASTF often required for AKL
	Camry
	2025+
	BA
	Dealer/SP (Beta)
	Dealer/SP (Beta)
	Yes
	Yes (Likely)
	Very New - Limited Aftermarket Support
	Sienna
	2011-2020
	8A (Legacy)
	Any
	Any
	No
	No
	None
	Sienna
	2021+
	BA
	Autel/SP
	SP + ADC2021
	Yes (Bypass)
	YES (Mandatory)
	AKL without Bypass Cable
	Tundra
	2018-2021
	8A (H)
	Autel/SP
	Lonsdor/SP
	Yes (Calc)
	No
	None
	Tundra
	2022+
	BA
	Autel/SP
	SP + ADC2021
	Yes (Bypass)
	YES (Mandatory)
	AKL without Bypass Cable
	bZ4X
	2023+
	BA
	Dealer/SP
	SP + ADC2021
	Yes (Bypass)
	YES (Mandatory)
	12V Battery Dead (See Ch 4)
	________________
CHAPTER 4: HYBRID & EV SPECIFICS
Programming keys for High Voltage (HV) vehicles introduces risks and procedural variances that do not exist with internal combustion engines (ICE).
4.1 The 12-Volt Dependency
A pervasive misconception is that the massive high-voltage battery (200V-400V) powers the vehicle's electronics. It does not. The entire 12V busâincluding the Smart ECU, Body Control Module (BCM), and door locksâis powered by a standard 12V auxiliary battery.37
The Locksmith Trap: The HV battery cannot engage its contactors (relays) to power the drive motor unless the 12V system is healthy (~10.5V+). In an AKL situation on a bZ4X or Prius, if the 12V battery is dead, the car appears completely bricked. Even if you successfully program a key, the car will not enter "READY" mode.
12V Battery Locations:
* Prius (Gen 3/4): Rear passenger quarter panel or under the cargo floor.
* Sienna Hybrid: Rear cargo area (side panel).
* bZ4X/Solterra: Under the hood in the conventional location, though often obscured by trim.38
Procedure: ALWAYS connect a jump pack or power supply to the 12V jump points under the hood before attempting programming. Do not rely on the vehicle's standby power, especially if it has been sitting.
4.2 bZ4X & Lexus RZ450e (Full EV)
These vehicles utilize the e-TNGA platform and exclusively employ the BA System.22
* Parasitic Drain: The bZ4X has a documented issue with rapid 12V drainage if the vehicle is left in "Accessory" mode or if there is a telematics hang.38
* Lockout Protocol: If the 12V is dead, the electronic door latches will not fire. You must use the mechanical emergency key.
* Hidden Cylinder: The key cylinder on the bZ4X is concealed behind a fixed plastic cap on the driver's handle. Unlike older models where the cap slides off, this one must be pried carefully from a slot on the underside.37
4.3 "Ready" vs. "Crank"
In a standard gas vehicle, the sound of the starter motor confirms success. In a hybrid or EV, silence is normal.
* Success Indicator: The programming is only confirmed successful when the "READY" light illuminates on the dashboard.
* False Positive: If the dash lights up but "READY" is off, the immobilizer may be satisfied, but the start sequence is inhibited. This is often due to a low 12V battery, an open charge port door, or an interlock faultânot necessarily a bad key.39
________________
CHAPTER 5: CRITICAL ALERTS & KNOWN ISSUES
These operational "landmines" are frequent causes of frustration and misdiagnosis in the field.
5.1 The "Sleep Mode" Protocol
Toyota Smart Keys feature a battery-saving "Sleep Mode" that disables the RF transmitter to prevent relay attacks and conserve power.40
* Symptoms: The customer reports the key works intermittently or has stopped working entirely. Testing the battery shows full voltage.
* Trigger: Holding the LOCK button while pressing the UNLOCK button twice. The LED on the fob will flash 4 times.
* The Fix: Pressing any button on the fob wakes it up. Locksmiths often misdiagnose this as a defective key. Always check for Sleep Mode before selling a replacement.
5.2 "Key Not Detected" - The 12V Hard Reset
* Scenario: You have successfully programmed a key (Add Key or AKL). The tool confirms "Success." However, the car displays "Key Not Detected" and will not start.
* Cause: The Certification ECU (Smart Box) can sometimes hang or fail to sync with the Steering Lock ECU after a programming event, particularly on 2019+ models.
* Solution: Disconnect the negative terminal of the 12V battery for 2 minutes. This "hard reset" forces all modules to reboot and re-establish the handshake. This simple step resolves approximately 80% of "programming success but no start" issues.11
5.3 Range Reduction with Aftermarket Keys
* Issue: Aftermarket "Universal" smart keys (e.g., Xhorse XS series, KeyDIY) often exhibit significantly shorter range than OEM fobs.
* Data: OEM fobs typically function at 30-50 meters. Generic fobs often drop to 5-10 meters.
* BA System Sensitivity: On "BA" systems, the vehicle uses precise timing for its challenge-response. High-latency aftermarket keys can sometimes cause the remote start function to fail, even if the proximity start works. Always warn customers of potential range loss if they opt for non-OEM shells.
5.4 High-Security Blade Orientation (TOY48)
The TOY48 keyway utilizes a "split wafer" system. It is possible to cut a key that turns the door lock but fails in the ignition (on bladed models) or the glovebox/trunk.
* Lishi Tool: Use the Lishi TOY48 tool for decoding. Note that TOY48 requires extreme precision; a depth deviation of just 0.5mm can cause the split wafers to bind.
* Cutting: When using a CNC machine (Condor/Dolphin), ensure the jaw is free of debris. The TOY48 profile is unforgiving of Z-axis errors.
________________
CHAPTER 6: LEXUS-SPECIFIC INTELLIGENCE
While mechanically similar to Toyota, Lexus vehicles employ digital distinctions that can trap the unwary technician.
6.1 Part Number Structure: The "H" Prefix
* Toyota: Part numbers typically follow the 89904-XXXXX format.
* Lexus: While older models use 89904, newer models (2018+) predominantly use 8990H-XXXXX.26
* Significance: The 8990H prefix usually denotes the newer encryption standards (A9 or BA). You cannot cross-program an 89904 key to an 8990H vehicle, even if the FCC ID matches. The firmware on the board is different.
6.2 Digital Key Interference (2022+ NX, RX, LX)
The "Digital Key" feature (Phone-as-a-Key) occupies a designated slot in the immobilizer memory.15
* Symptoms: When attempting to add a physical key, the tool fails immediately or returns a "Memory Full" error, even if the key count shows only 1 or 2 keys registered.
* Mechanism: The system reserves slots for digital keys. If these slots are "zombie" (occupied by a previous owner's phone profile), they block new physical keys.
* Resolution: You must access the "Digital Key" menu in the OEM diagnostics (or supported aftermarket tool) and DELETE the Digital Key profile before adding a new physical key. Once the physical key is added, the customer must re-pair their phone.
6.3 The Smart Key Card (Wallet Key)
* FCC ID: Often HYQ14CBP or similar unique IDs.27
* Compatibility: These cards are highly model-specific. An LS500 card key will usually not work on an LX600 despite looking identical.
* Battery: The battery in these cards (often CR2412) is difficult to replace. On older versions, the battery was sealed, requiring a destructive opening of the case. Newer versions (2021+) feature a small slide-out tray, but the mechanism is fragile.
________________
CHAPTER 7: AFTERMARKET PARTS GUIDE
Navigating the aftermarket is treacherous. The "Universal" key revolution has made stock-keeping easier but programming harder.
7.1 Cross-Reference Master List
OEM FCC ID
	OEM P/N
	Ilco Look-Alike
	Lonsdor
	Xhorse
	Notes
	HYQ14FBA
	89904-06140
	PRX-TOY-4B10
	FT01-2110
	XM38 (Toyota)
	The "Universal" choice. High reliability.
	HYQ14FBB
	89904-0C050
	PRX-TOY-3B5
	FT01-0010
	XM38 (Toyota)
	Ensure "Truck/SUV" frequency settings.
	HYQ14FBX
	8990H-0C010
	N/A
	LT20 (BA)
	XM38 (BA)
	MUST use BA-specific universal boards. Old XM38s won't work.
	HYQ14AAB
	89904-06070
	PRX-TOY-4B5
	FT02-PH
	XM38 (Toyota)
	E-Board (0140). Very common on older Camry.
	HYQ14FLC
	8990H-78010
	N/A
	LT20-Lexus
	XM38 (Lexus)
	For Lexus NX/LX. Requires precise frequency config.
	7.2 Quality & Reliability Ratings
* OEM (Denso/Tokai Rika): 10/10. The gold standard. Guaranteed to work if the part number matches.
* Lonsdor (LT20 Series): 9/10. Currently the industry leader for "BA" system emulation. Highly stable and supports generating the specific "BA" configuration required for 2022+ Tundras and Siennas.36
* Xhorse (XM38): 8/10. Excellent for older 8A/H chips. Firmware updates are frequent. However, they sometimes struggle with range on newer BA systems and require precise frequency generation (e.g., setting 314.35MHz vs 315.12MHz manually).
* KeyDIY (TB Series): 7/10. A good budget option. The "TB" series covers the BA system, but the plastic shell quality is generally lower than Xhorse or Lonsdor.44
________________
CHAPTER 8: BLADE CUTTING REFERENCE
Toyota and Lexus rely on high-security milling, but standardizing on a few profiles simplifies the cutting process.
8.1 TOY48 (The Standard)
* Applications: Almost all Lexus (2010+) and most Toyota Smart Keys (2012+).
* Profile: High security, internal track (laser cut).
* Cutting Tip: This key utilizes a "split wafer" design. If you are originating a key from a door lock code, be aware that the door lock cylinder may not contain all the cuts required for the trunk or glovebox.
* Code Series: 40000-49999, 50000-69999.
* Recommended Cutter: 2.0mm or 1.5mm end mill.
8.2 TOY43 (The Old Guard)
* Applications: Older Tacoma (pre-2016), some base model Corollas, and the "H-Key" bladed systems.
* Profile: Edge cut (double sided).
* Alert: Some 2015+ Tacomas use a "G" stamped TOY43 blade but are actually H-chip systems electronically. Never trust the blade profile alone to determine the chip type.
8.3 TOY51 (The Truck Key)
* Applications: 2022+ Tundra, Sequoia.
* Profile: A variant of the high-security internal track, typically slightly wider than the TOY48.
* Precaution: Ensure your key cutting machine (Condor/Dolphin/Futura) is updated to the latest database. Using a TOY48 decoding profile on a TOY51 key can result in a broken probe or cutter due to width differences.
________________
CHAPTER 9: EMERGENCY ACCESS PROCEDURES
When the electronics failâdead fob, dead vehicle battery, or interferenceâthe locksmith must rely on mechanical redundancy.


  



9.1 The "Dead Fob" Start (Limp Mode)
* Scenario: The fob battery is completely depleted, and the car is locked.
* Entry: Use the mechanical insert key in the driver's door cylinder.
* Start Procedure:
   1. Depress the brake pedal firmly (Note: The Start button LED may not light up, confusing the customer).
   2. Touch the Toyota/Lexus Logo side of the fob directly to the Start Button.
   3. Hold it there for 2-3 seconds until the vehicle buzzer sounds.
   4. Press the Start Button within 5 seconds while keeping the brake depressed.
* BA System Note: On new models like the Tundra and bZ4X, the LF antenna in the button is extremely directional. The key must be held center-flush against the button.
9.2 Manual Door Lock Locations
* Hidden Cylinders: On newer models like the Lexus NX and Toyota bZ4X, the key cylinder is not visible. It is hidden behind a fixed plastic cap on the driver's door handle.
* Removal: Look for a small slot on the underside of the fixed cap. Insert the tip of the mechanical key and pry up and out. The plastic cap will pop off, revealing the cylinder.
* Warning: These caps are often painted body-color and are fragile. Use a plastic pry tool if available to avoid scratching the paint.
9.3 12V Jump Start (Hybrids/EVs)
* Safety: Do NOT attempt to jump the High Voltage battery.
* Jump Points: Look for the fuse box under the hood. Inside, there is usually a dedicated "Exclusive Jump Starting Terminal" (a metal tab under a red plastic cover with a + sign). Connect the Positive cable here, and the Negative cable to an unpainted chassis ground bolt.
* Trunk Access: If there are no under-hood jump points (common on some older Prius models), you must access the 12V battery directly in the rear. If the tailgate is electric and dead, you must crawl through the back seats and manually release the latch using a small screwdriver in the emergency slot on the interior trim panel.
________________
OUTPUT FORMAT: Database-Ready Structure
The following dataset is structured for ingestion into locksmith inventory or ERP systems.
Make, Model, Year_Start, Year_End, FCC_ID, OEM_PN, Chip_Type, Immo_System, Frequency, Key_Type, Blade_Profile, Battery, Add_Key_Tool, AKL_Tool, AKL_Supported, PIN_Required, Dealer_Only_Notes, Critical_Alert, Aftermarket_PN, Hybrid_EV_Flag
Toyota, Camry, 2012, 2017, HYQ14FBA, 89904-06140, 8A (88), Prox, 315, Smart, TOY48, CR2032, Autel/SP, Emulator, Yes, No, None, Check Board ID (0020 vs 2110), PRX-TOY-4B10, No
Toyota, Camry, 2018, 2024, HYQ14FBC, 89904-06220, 8A (A9), Prox, 315, Smart, TOY48, CR2032, Autel/SP, Lonsdor/Dealer, Yes, Yes (Calc), NASTF for AKL (NA), Rolling Code OBD, PRX-TOY-CAM18, No
Toyota, Sienna, 2021, 2025, HYQ14FBX, 8990H-08020, 8A (BA), BA-Prox, 315, Smart, TOY48, CR2450, Autel/SP, SP+Cable, Yes, Yes (Bypass), AKL Requires Bypass Cable, BA System - No OBD AKL, N/A, Yes
Toyota, Tundra, 2022, 2025, HYQ14FBX, 8990H-0C010, 8A (BA), BA-Prox, 315, Smart, TOY51, CR2450, Autel/SP, SP+Cable, Yes, Yes (Bypass), AKL Requires Bypass Cable, BA System - No OBD AKL, N/A, No
Lexus, RX350, 2010, 2015, HYQ14ACX, 89904-48191, G (4D), Prox, 315, Smart, TOY48, CR1632, Autel/SP, Reset, Yes, No, None, 16-min Reset Timer, PRX-LEX-RX, No
Lexus, NX350, 2022, 2025, HYQ14FLC, 8990H-78010, 8A (BA), BA-Prox, 315, Smart, TOY48, CR2032, Dealer/SP, SP+Cable, Yes, Yes (Bypass), Digital Key Interference, Delete Digital Key First, N/A, No
________________
CONCLUSION
The transition from the H-Key to the BA System represents the most significant escalation in locksmith difficulty in Toyotaâs history. The restrictions on NASTF codes and the requirement for hardware bypasses have effectively bifurcated the market: those who invest in the training and hardware to touch the Smart ECU, and those who will be left behind. By adhering to the identification protocols and bypass procedures outlined in this report, the automotive security professional can maintain profitability and service capability across the entire 2012â2026 model range.
Works cited
1. The Truth About Transponder Super Chips: A Guide for Automotive Locksm - Keyless City, accessed January 5, 2026, https://keyless-city.com/blogs/locksmith-101/the-truth-about-transponder-super-chips-a-guide-for-automotive-locksmiths
2. Toyota and Lexus Reflashing Services - McGuire Lock, accessed January 5, 2026, https://mcguirelocksmith.com/locksmith-services/automotive-locksmith/toyota-lexus-reflashing-service/
3. Toyota Lexus Black Box Immobilizer Reflash and Cloneout Demo using the Automotive Locksmith Kit - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=zClbsnc7NDs
4. 2017-2019 Toyota Corolla vs. 2020-2023; Unpacking the H-Chip key protocol - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=nLshouDCfaA
5. Bypass Cable for Toyota* ADC2021 | AD NEWS - Advanced Diagnostics, accessed January 5, 2026, https://www.advanced-diagnostics.com/news-posts/bypass-cable-for-toyota-adc2021
6. Autel IM508S + G-BOX3 Adapter + APB112 Emulator + Toyota Lexus New System Bypass Cable (Autel USA) - UHS Hardware, accessed January 5, 2026, https://www.uhs-hardware.com/products/autel-im508s-g-box3-adapter-apb112-emulator-toyota-lexus-new-system-bypass-cable-autel-usa
7. Toyota Security Bypass Cable | ADC-2021 - CLK Supplies, accessed January 5, 2026, https://www.clksupplies.com/products/d756924ad
8. A-30 Cable 8A-BA for Toyota 4A Smart Key Cable OBDSTAR Autel IM508 IM608 K518, accessed January 5, 2026, https://www.ebay.com/itm/365255787791
9. New For Toyota Tacoma Tundra Smart Remote Key Fob HYQ14FBB 231451-0010 (G), accessed January 5, 2026, https://www.ebay.com/itm/385785875240
10. 2021 Toyota Venza Smart Key Fob PN: 8990H-48050, 8990H-48120 - Remotes And Keys, accessed January 5, 2026, https://remotesandkeys.com/products/2021-toyota-venza-smart-key-remote-4498
11. Introducing the ADC2021 Gateway Bypass Cable for Toyota Models - Key Innovations, accessed January 5, 2026, https://keyinnovations.com/blog/introducing-the-adc2021-gateway-bypass-cable-for-toyota-models/
12. Advanced Diagnostics ADC2021 Smart Pro Bypass Cable for Toyota - Locksmith Keyless, accessed January 5, 2026, https://www.locksmithkeyless.com/products/advanced-diagnostics-adc2021-smart-pro-bypass-cable-for-toyota
13. lexus - nhtsa, accessed January 5, 2026, https://static.nhtsa.gov/odi/tsbs/2012/MC-10133966-9999.pdf
14. What conditions may prevent Digital Key to function? - Support Home - Lexus, accessed January 5, 2026, https://support.lexus.com/s/article/What-conditions-may-prevent-Digital-Key-to-function
15. What Is Toyota Digital Key And How Does It Work? [2025], accessed January 5, 2026, https://www.mikekellytoyota.com/blog/what-is-toyota-digital-key-and-how-does-it-work/
16. 2012-2020 Smart Prox Remote Key Fob for Toyota 4B FCC# HYQ14FBA - 0020, accessed January 5, 2026, https://www.locksmithkeyless.com/products/2012-2019-toyota-smart-key-4b-fcc-hyq14fba
17. Smart Fob Key | Auto Smart Key Replacement | UHS Hardware â tagged "Toyota", accessed January 5, 2026, https://www.uhs-hardware.com/collections/new-r-smart-keys/toyota
18. Smart Remote Key for 2015-2021 Toyota HYQ14FBA 89904-0E091 2110 Board - Key4, accessed January 5, 2026, https://www.key4.com/smart-remote-key-toyota-hyq14fba-899040e091
19. OEM Refurbished Smart Key Fob for 2021-2022 Toyota Tacoma & Tundra â F, accessed January 5, 2026, https://www.bestkeysolution.com/products/oem-refurbished-smart-key-fob-for-toyota-tacoma-and-tundra-this-replacement-smart-key-fob-is-compatible-with-fcc-hyq14fbb-and-features-part-numbers-89904-35060-and-89904-0c050
20. 2018-2022 Toyota Camry 4-Button Smart Key Fob (FCC: HYQ14FBC, P/N: 89904-06220), accessed January 5, 2026, https://northcoastkeyless.com/product/toyota-camry-4-button-smart-key-fob-fcc-hyq14fbc-p-n-89904-06220/
21. 19-21 Toyota RAV4 Smart Remote Key HYQ14FBC 8990H-0R010 0351 - Key4, accessed January 5, 2026, https://www.key4.com/smart-remote-key-toyota-rav4-hyq14fbc-8990h0r010
22. 2025 Toyota bZ4X Smart Key Remote PN: 8990H-42510, accessed January 5, 2026, https://remotesandkeys.com/products/2025-toyota-bz4x-smart-key-remote-pn-8990h-42510
23. 2021 - 2023 Toyota Sienna Smart Key Fob 5 Buttons FCC# HYQ14FBX - Locksmith Keyless, accessed January 5, 2026, https://www.locksmithkeyless.com/products/2021-2023-toyota-sienna-smart-key-fob-5-buttons-fcc-hyq14fbx-unlocked
24. Toyota Sienna 2021-2024 Smart Key, 6Buttons 8990H-08010 315MHz, HYQ14FBX P1 BA - ABKEYS, accessed January 5, 2026, https://abkeys.com/products/toyota-sienna-2021-2023-smart-key-8990h-08010-315mhz-hyq14fbx-5517
25. 2022 Toyota Tundra Smart Remote Key Fob - CarandTruckRemotes, accessed January 5, 2026, https://www.carandtruckremotes.com/products/2022-toyota-tundra-smart-remote-key-fob
26. 2022-2024 Lexus LX NX RX TX Smart Key Remote Fob FCC: HYQ14FLC - eBay, accessed January 5, 2026, https://www.ebay.com/itm/156166653451
27. OEM 2022 2023 2024 LEXUS LX600 SMART ACCESS CARD KEY HYQ14CBP 8990H-78491 | eBay, accessed January 5, 2026, https://www.ebay.com/itm/116151457781
28. 2010 - 2015 Lexus Smart Key 4B W/ Hatch Fob FCC# HYQ14ACX - 5290 Board, accessed January 5, 2026, https://www.locksmithkeyless.com/products/2010-2015-lexus-smart-key-4b-fcc-hyq14acx-5290-board
29. Fits Lexus HYQ14ACX OEM 4 Button Key Fob | eBay, accessed January 5, 2026, https://www.ebay.com/itm/372641820772
30. 2012 Toyota Land Cruiser Smart Remote Key Fob - CarandTruckRemotes, accessed January 5, 2026, https://www.carandtruckremotes.com/products/2012-toyota-land-cruiser-smart-remote-key-fob
31. 2012 Toyota Corolla Smart Key 4B FCC# HYQ14AAB / HYQ14AEM - Locksmith Keyless, accessed January 5, 2026, https://www.locksmithkeyless.com/products/2012-toyota-corolla-smart-key-4b-fcc-hyq14aab-hyq14aem-board-3370-e
32. 2019 Lexus RX350 How My IM608 Update Strategy Saved This Locksmith in an All Keys Lost Crisis - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=AtXvzJmAP4o
33. Why were we not notified that Autel will no longer support all keys lost with Toyota and Lexus?, accessed January 5, 2026, https://bbs.autel.com/autelsupport/Diagnostics/38410.jhtml
34. Smart Pro Toyota Proximity All Keys Lost - LSC | Complete Security Solutions, accessed January 5, 2026, https://lsc.com.au/smart-pro-toyota-proximity-all-keys-lost
35. OBDStar Toyota 30 PIN Cable Supports 4A and 8A-BA All Key Lost - ABK-1553 - ABKEYS, accessed January 5, 2026, https://abkeys.com/products/obdstar-toyota-30-pin-cable-supports-4a-8a-ba-all-key-lost-1553
36. TOYOTA Smart Key BABA System Programming - THE SECRET IS OUT!! - YouTube, accessed January 5, 2026, https://www.youtube.com/watch?v=itPt4iGpY_M
37. How to open and jump start a Toyota or Lexus EV that has a dead start (12-volt) battery., accessed January 5, 2026, https://www.youtube.com/watch?v=Wa28fRZInGQ
38. 12v battery dead, what next? : r/BZ4X - Reddit, accessed January 5, 2026, https://www.reddit.com/r/BZ4X/comments/1igdlji/12v_battery_dead_what_next/
39. Check Hybrid System: What Does the Warning Mean? - Greentec Auto, accessed January 5, 2026, https://greentecauto.com/check-hybrid-system-what-does-the-warning-mean/
40. What Are Some Lesser-Known Functions of a Toyota Key Fob? - Keith Pierson Toyota, accessed January 5, 2026, https://www.keithpiersontoyota.com/blogs/1539/toyota-tips/toyota-key-fob-tricks-you-may-not-know/
41. Which Toyota Smart Key Fobs Sleep With Inactivity? - Reddit, accessed January 5, 2026, https://www.reddit.com/r/Toyota/comments/1kfp1s8/which_toyota_smart_key_fobs_sleep_with_inactivity/
42. 2022 Lexus LX600 Smart Key Remote PN: 8990H-78640, accessed January 5, 2026, https://remotesandkeys.com/products/2022-lexus-lx600-smart-key-remote-pn-8990h-78640
43. What is Digital Key? - Toyota Support, accessed January 5, 2026, https://support.toyota.com/s/article/What-is-Digital-Key-Toyota
44. KeyDiy Toyota Smart Key 3Buttons KD Smart Key 8A Chip TB01 - ABK-5092-3B2 - ABKEYS, accessed January 5, 2026, https://abkeys.com/products/keydiy-toyota-smart-key-3buttons-tb01-kd-smart-key-5092-3b2