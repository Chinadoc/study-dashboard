ï»¿The Definitive Professional Locksmith Guide: 2018â2023 Dodge Challenger Security Architecture and Programming Protocols
1. Introduction: The Paradigm Shift in Mopar Security
The 2018â2023 era of the Dodge Challenger represents a definitive inflection point in the history of automotive security for the Fiat Chrysler Automobiles (FCA, now Stellantis) group. For decades, the "LA" platformâencompassing the Challenger and its sedan sibling, the Chargerârelied on relatively open Controller Area Network (CAN) architectures that allowed aftermarket diagnostic tools unrestricted access to critical control modules.1 However, the rising sophistication of high-tech vehicle theft, particularly relay attacks and port-based key cloning, necessitated a radical hardening of the vehicle's digital perimeter.
This comprehensive guide serves as an operational doctrine for the professional automotive locksmith. It dissects the technical evolution from the open CAN bus systems of the pre-2018 era to the introduction of the Security Gateway Module (SGW) in 2018 and the subsequent adoption of 128-bit AES encryption in 2019. The objective is to equip the field technician not just with a list of steps, but with a deep, systemic understanding of the vehicleâs immobilization architecture, enabling the resolution of complex "All Keys Lost" (AKL) scenarios, high-performance SRT/Hellcat key provisioning, and module-level repairs.3
The service landscape for these vehicles is bifurcated. The 2018 model year acts as a transitional hybrid, introducing the physical firewall (SGW) while retaining legacy transponder technology. The 2019â2023 model years introduce a fully realized high-security environment featuring "locked" Radio Frequency Hubs (RFHUB) and Hitag AES encryption. Success in this domain requires a mastery of three distinct competencies: physical network access via the Star Connector, cryptographic distinction between key generations, and voltage-critical programming hygiene.4


  



2. The Atlantis Architecture and the Security Gateway (SGW)
To program a key, a locksmith's tool must send a "Write" command to the vehicle's Body Control Module (BCM) and Radio Frequency Hub (RFHUB) to register the new transponder ID. In the "Atlantis" electrical architecture used in the 2018+ Challenger, this path is deliberately obstructed.
2.1 The Digital Firewall: Function of the SGW
The Security Gateway Module (SGW) is the gatekeeper of the vehicleâs internal networks. Physically located behind the radio head unit in the dashboard, the SGW intercepts all traffic originating from the Data Link Connector (OBD-II port).1
* Traffic Filtration: The SGW splits the network into "Public" and "Private" sectors. It permits diagnostic read commands (e.g., reading DTCs, streaming live data) to pass through to the internal CAN-C (Chassis) and CAN-IHS (Interior High Speed) buses. However, it blocks all non-authenticated write commands.2
* Implication for Programming: Standard key programming commandsâsuch as "Program PIN," "Add Key," or "Virginize Module"âare classified as critical write commands and are rejected by the SGW unless the tool provides a digital certificate authenticated by FCAâs AutoAuth server.
While AutoAuth integration is available on many modern diagnostic tools (e.g., Autel IM608, Smart Pro), it relies on a stable internet connection and active server subscriptions. In "All Keys Lost" scenarios, where a vehicle may be dead in a parking garage with no cellular signal, relying solely on software authentication is a vulnerability. Therefore, physical bypass remains the industry standard for reliability.5
2.2 Physical Bypass Strategy: The Star Connector
The most effective method to circumvent the SGW is to tap directly into the network behind the firewall. The Dodge Challenger utilizes "Star Connectors"âpassive junction blocks that act as central hubs for the CAN-C network.8 By plugging directly into the Star Connector, the locksmithâs tool becomes a native node on the network, bypassing the SGW and the OBD-II port entirely.
Location A: The Passenger Kick Panel (Green Star)
The primary CAN-C distribution block is located in the front passenger footwell area.
* Access: It is positioned behind the padded kick panel, to the right of the glovebox. On some 2018â2019 models, it may be accessible by dropping the glovebox, but removing the side kick panel is often necessary for clear access.9
* Configuration: This is typically a green connector block with multiple banks of twisted pair wires (usually Yellow and White).
* Usage: This location is electrically central but can be physically difficult to access in tight parking spots where the passenger door cannot be fully opened.
Location B: The Trunk (Right Rear)
For the 2019â2023 models, the trunk location is frequently the superior access point for locksmiths.
* Access: The connector is located behind the trunk liner on the passenger (right) side, near the fuse box and battery. Access requires pulling back the felt liner.9
* Strategic Advantage: The RFHUB module itself is located in the rear shelf/C-pillar area. Connecting at the trunk places the programming tool physically and electrically closer to the target module, reducing signal attenuation. Furthermore, in an AKL scenario, if the vehicle is locked, picking the trunk lock (if equipped) or folding the rear seats to crawl into the trunk is often easier than removing a dashboard panel.10


  



2.3 The "12+8" Cable vs. Star Connector Cable
Two primary cable types exist for bypassing the SGW.
* The 12+8 Adaptor: This cable is designed to unplug the connectors at the SGW module itself and bridge the tool in between. Because the Challenger's SGW is buried behind the radio/screen assembly 1, using a 12+8 cable requires significant dashboard disassembly. This is time-consuming and carries a high risk of damaging dashboard trim. It is generally not recommended for the Challenger unless Star Connector access is impossible.13
* The Star Connector (ADC2011) Cable: This cable plugs into an empty port on the Star Connector block. It is the preferred tool for the Challenger because it requires minimal disassembly (kick panel or trunk liner only) and connects directly to the high-speed bus.12
3. Key Fob Taxonomy: Component Identification and Compatibility
The most critical inventory error locksmiths make with the 2018â2023 Challenger is confusing the legacy 2018 architecture with the modern 2019+ architecture. Externally, the key fobs are identical "teardrop" shapes. Internally, they are incompatible technologies.
3.1 The 2018 Transition: Legacy ID46 Architecture
For the 2018 model year, Dodge largely retained the remote architecture from the 2015â2017 generation, despite adding the SGW.3
* Transponder Chip: Philips ID46 (PCF7953 / Hitag 2). This is a legacy encryption standard used by Chrysler since the mid-2000s.
* FCC ID: M3N-40821302. The "N" is the distinguishing character.
* Part Numbers: 68051387 series.
* Interchange: These keys are often backward compatible with Charger/Challenger models dating back to 2011.3
* Programming Logic: The RFHUB reads the ID46 chip. If you attempt to program an ID46 key to a 2019+ car, the vehicle will simply ignore it, often resulting in a "Key Not Detected" or "Programming Failed" error with no specific explanation.6
3.2 The 2019â2023 Standard: Hitag AES High Security
Starting in 2019, the security protocol was upgraded to 128-bit AES encryption.4
* Transponder Chip: Hitag AES (4A). This chip uses a significantly more robust encryption algorithm.
* FCC ID: M3M-40821302. The "M" indicates the updated manufacturer standard.
* Part Numbers: 68394195AA, 68394191AA.4
* Identification: The circuit board layout is different, often labeled with "4A" on aftermarket boards.
* Critical Constraint: These keys are not backward compatible with 2018 or older models, nor can older keys be used on 2019+ models. The RFHUB firmware is specific to the chip type.6
3.3 The SRT/Hellcat "Red Key" Ecosystem
The "Red Key" is a defining feature of the Hellcat and Demon trims, unlocking the vehicle's full horsepower (700+ HP), while the "Black Key" restricts output to approximately 500 HP.
* The Locksmith's Perspective: To the programming tool, a Red Key and a Black Key are programmed using the exact same "Add Smart Key" software routine.19 There is no special "Red Key Menu" in the scanner.
* The Hardware Secret: The differentiation is hard-coded into the transponder's configuration data (Configuration Page). The Red Key emits a specific "Key Type" ID that the RFHUB recognizes as "Level 2 Access."
* Inventory Requirement: You cannot simply put a red plastic shell on a standard Black Key circuit board and expect it to unlock the horsepower. You must purchase the specific Red Key SKU (e.g., 68234959AA for ID46, 68394203AA for 4A) which has the correct pre-coding on the board.20
* Verification: After programming, the only way to verify success is to start the vehicle and access the SRT Performance Pages on the dashboard screen to confirm that the "700+ HP" mode is selectable.21


  



4. Operational Workflows: Programming Procedures
This section outlines the step-by-step protocols for the most common service scenarios. These procedures assume the use of professional-grade tools such as the Autel IM608/IM508 or Advanced Diagnostics Smart Pro.
4.1 Scenario A: 2018 Dodge Challenger (Transition Year)
Vehicle Profile: SGW Present + ID46 Chip (M3N).
Step 1: Physical Access and Connection
Do not plug into the OBD-II port initially. Locate the Star Connector in the passenger kick panel. Plug the ADC2011/Star Connector cable into any open slot. If all slots are occupied, unplug a non-essential module (e.g., the heated seat module) to make room, or use a Y-splitter cable.9 Connect the main diagnostic cable to this bypass.
Step 2: Software Selection
On the programmer, navigate to: Dodge > Challenger > 2015-2018 > Smart Key. Do not select 2019+; the tool will attempt to look for AES keys and fail.5
Step 3: PIN Code Retrieval
Select "Read PIN Code." The tool will query the RFHUB via the CAN-C bus. The system should return a 4-digit PIN (e.g., 4993).5 Note the PIN.
Step 4: Programming (Add Key or AKL)
* Add Key: Used if a working key is present. This is safer as it does not delete existing keys.
* All Keys Lost: Will erase all keys.
* Procedure: Select "Add Smart Key." The tool will prompt: "Place the Smart Key against the Start/Stop Button."
* Action: Take the new M3N key. Press the nose of the fob (not the buttons) firmly against the Start button. The Start button contains a Low Frequency (LF) antenna coil.
* Handshake: The RFHUB energizes the coil, reads the ID46 chip, and registers it. You will hear the door locks cycle or the hazards flash upon success.5
4.2 Scenario B: 2019â2023 Dodge Challenger (High Security)
Vehicle Profile: SGW Present + AES 4A Chip (M3M) + Locked RFHUB.
Step 1: Establishing Connection
The trunk Star Connector location is highly recommended here. Access the trunk. Peel back the right-side liner. Connect the bypass cable. Ensure the vehicle battery is connected to a stable power supply (maintaining >12.5V).14
Step 2: Software Selection
Navigate to: Dodge > Challenger > 2019-2023 > Smart Key.
* Note: If your tool does not have a specific 2019+ menu, look for "System Selection" > "Keyless System (CAN)" > "Key Learning".5
Step 3: The Rolling PIN Code
Unlike the static PINs of older models, 2019+ models often utilize a rolling code or encrypted PIN exchange. The tool must be connected to the internet (Wi-Fi) to calculate the PIN from the seed data pulled from the RFHUB. This process may take 1â2 minutes.
Step 4: The "Nose-to-Button" Sensitivity
The 2019+ RFHUB is notoriously sensitive to signal interference.
* The Problem: The tool prompts "Press Start Button," you press the key, and the tool waits... then fails with "Key Not Detected."
* The Fix:
   1. Wake the Bus: Before pressing the key to the button, tap the brake pedal or toggle the hazard lights. This ensures the RFHUB is awake and polling.
   2. Key Orientation: Try pressing the key logo-side or button-side against the start button.
   3. Shielding: If you are in a high-RF environment (near cell towers or Wi-Fi routers), wrap your hand around the back of the key to shield it while pressing it to the button.
   4. Verification: Upon success, the dashboard will display "Key Fob Linked" or the key count will increment.5


  



5. The RFHUB "Lockout" Crisis and Module Virginization
A critical service scenario for the 2018+ Challenger is the "Bricked" or "Locked" RFHUB. This module is the central node for key authentication, and it has a high failure rate during programming if voltage drops or if incorrect data is written.
5.1 The Problem: OTP and VIN Locking
The RFHUB in 2018+ vehicles contains One-Time Programmable (OTP) memory sectors. Once a VIN is written to the module, it is "locked" to that vehicle.22
* Scenario: A customer buys a used RFHUB from eBay to replace a water-damaged unit.
* Result: The locksmith plugs it in. The car will not start. The tool cannot program keys because the VIN in the RFHUB (from the donor car) does not match the VIN in the PCM/BCM (the recipient car). The system enters an "Immobilizer Mismatch" state.
5.2 The Solution: Bench Virginization
To reuse a locked module, the locksmith must "virginize" itâwipe the VIN and security data, returning it to a factory-new state.22 This cannot be done via the OBD-II port; it requires direct EEPROM access.
Required Tools:
* OBDSTAR DC706: A specialized ECU tool capable of reading the RFHUB's Motorola/NXP MCU directly.
* Autel XP400 Pro: With the correct breakout cables.
The Workflow:
1. Removal: Locate the RFHUB. In the Challenger, it is mounted on the rear parcel shelf (C-pillar area), accessible from the trunk or by removing the rear seat backrest.24
2. Bench Connection: Connect the programmer to the specific pins on the RFHUB (12V, Ground, CAN-H, CAN-L). Soldering is usually not required; pin-probes or dedicated clamp cables are sufficient.23
3. Virginize: Run the "Virginize/Renew" function. The tool edits the hex data in the EEPROM to clear the VIN and key slots.
4. Re-commissioning:
   * Reinstall the now-virgin module in the car.
   * Use the diagnostic tool (Autel/Smart Pro) to perform "Replace RFHUB" or "Restore Vehicle Configuration."
   * The BCM will write the vehicleâs original VIN into the virgin RFHUB.
   * Proceed to program keys as if it were a new car.22
5.3 Cost Analysis: Virginization vs. Replacement
A new OEM RFHUB can cost upwards of $400â$800 and may be on backorder.20 A used unit from a salvage yard might cost $50â$100. By investing in virginization tools (like the DC706), a locksmith can offer a profitable repair service that undercuts the dealership while maintaining high margins.
6. Mechanical Access and Emergency Protocols
In the event of a total battery failure or a damaged key fob, the high-tech electronics become secondary to basic mechanical locksmithing.
6.1 Mechanical Key Decoding (Lishi CY24)
The Challenger utilizes the standard Chrysler CY24 / Y159 keyway.25
* The Lock: A 2-track external keyway.
* The Tool: The Lishi CY24 (2-in-1) pick and decoder is the industry standard.
* Wafer Geometry: The lock contains 8 wafer positions. However, the door lock typically only utilizes positions 2 through 8 (7 cuts). The ignition does not have a mechanical tumbler (it is push-button), so the door lock is the master record for the key code.
* Decoding Strategy: Pick the lock to the unlocked position. Read the depths of wafers 2â8. The depths range from 1 to 4.
* Cutting: Input the code into a key machine (e.g., "Code Series M"). Ensure the machine is set to cut a "Shoulder Stop" key.27
6.2 Emergency Start Procedure (Dead Fob)
When a key fob battery dies, the passive entry system fails. The customer is locked out, and the car won't start.
1. Entry: Use the mechanical key cut in step 6.1 to unlock the driver's door. Note: The alarm will sound immediately upon opening the door (horn honking).
2. Silence and Start:
   * Ignore the "Key Fob Not Detected" message on the dash.
   * Take the nose of the dead key fob.
   * Press it directly into the Start/Stop button while depressing the brake.
   * The inductive coil in the button transfers power to the chip, authenticating the key and silencing the alarm.28
7. Tooling and Equipment Recommendations
To service the 2018â2023 Challenger effectively, the following equipment list is recommended for the professional locksmith.


Category
	Recommended Tool
	Role & Justification
	Programmer
	Autel IM508S / IM608 Pro II
	Primary programming. Excellent coverage for PIN reading and 12+8/Star Connector bypass menus.5
	Programmer
	Advanced Diagnostics Smart Pro
	Secondary/Primary. Very stable on FCA platforms. Guided photos for Star Connector locations.15
	Bypass
	ADC2011 / Star Connector Cable
	Mandatory. The 12+8 cable is too difficult to install on Challengers. The Star Connector cable is the only viable field solution.11
	ECU Tool
	OBDSTAR DC706
	RFHUB Virginization. Essential for fixing "bricked" cars or using salvage parts.23
	Mechanical
	Lishi CY24
	Decoding the door lock for emergency keys.25
	Power
	Victron / Clore Maintainer
	A stable power supply (not just a jump pack) is critical to prevent RFHUB corruption during programming.14
	8. Conclusion
The transition of the Dodge Challenger platform in 2018 to the Atlantis architecture marked the end of the "easy" OBD-II programming era. The introduction of the Security Gateway (SGW) and the subsequent 2019 upgrade to Hitag AES encryption created a complex service environment that punishes the unprepared.
However, for the equipped professional, this complexity is an asset. The requirement for specialized hardware (Star Connector cables), distinct inventory (M3M vs M3N keys), and advanced knowledge (RFHUB virginization) creates a high barrier to entry that excludes unskilled competition. By adhering to the protocols outlined in this guideâspecifically the strict use of battery support, the correct identification of transponder types, and the mastery of the Star Connector bypassâthe locksmith can confidently service the entire 2018â2023 Challenger lineup, including the high-value Hellcat and SRT variants.
Works cited
1. STE Chrysler Pass Through User Manual - Squarespace, accessed January 2, 2026, https://static1.squarespace.com/static/51fac8cfe4b0339e6c6987e1/t/5df85fc2cde8ca0f95214058/1576558531884/STE_Chrysler_Passthrough_V1_2.pdf
2. FCA Security Gateway Module Basic Info and Location - JScan, accessed January 2, 2026, https://jscan.net/fca-security-gateway-module-basic-info-and-location/
3. 2018 Dodge Challenger Smart Key 4B Fob FCC# M3N-40821302 - Locksmith Keyless, accessed January 2, 2026, https://www.locksmithkeyless.com/products/2018-dodge-challenger-smart-key-4b-fob-fcc-m3n-40821302-aftermarket
4. 2023 Dodge Challenger Smart Key Fob PN: 68394202AA, accessed January 2, 2026, https://remotesandkeys.com/products/2023-dodge-challenger-smart-key-fob-pn-68394202aa
5. Autel IM608 Pro Adds 2018 Dodge Challenger Key Success - AutelShop.de Official Blog, accessed January 2, 2026, https://blog.autelshop.de/autel-im608-pro-adds-2018-dodge-challenger-key-success/
6. Chrysler / Dodge 2015-2023 Smart Key Fob 4-Button FCC ID: M3N-40821302, accessed January 2, 2026, https://www.bestkeysolution.com/products/chrysler-dodge-2015-2023-smart-key-fob-4-button-fcc-id-m3m-40821302-chip-id-46-433-mhz
7. Dodge charger 2020. I can't get the passcode. Help : r/Locksmith - Reddit, accessed January 2, 2026, https://www.reddit.com/r/Locksmith/comments/180sfpu/dodge_charger_2020_i_cant_get_the_passcode_help/
8. How To Program Dodge Keys with Autel KM100 Generating a Universal Key: Dodge Challenger: Up to 2023 - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=LEkHxchBvhU
9. 2018 Dodge Challenger star connector location via Smart Pro - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=n6wAbGWWTCQ
10. Dodge Charger/Challenger 2020 New Smart Key and Star Connector Used - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=UWnZ74XMvBQ
11. 2018+ RAM, DODGE, JEEP, CHRYSLER, BYPASS CABLE-HOW TO READ PIN/PROGRAM KEY (AUTOPROPAD BASIC) - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=4xxMkw0UNdc
12. 2019 Dodge Challenger proximity key programming via the star connector in the trunk!, accessed January 2, 2026, https://www.youtube.com/watch?v=qcn0Hm1jkcA
13. Dodge Challenger: How to Diagnose Security Gateway Module (SGM) Issues | Clear DTCs, accessed January 2, 2026, https://www.youtube.com/watch?v=-q9ei9-LsOc
14. 2023 Dodge challenger with all key lost - Autel Support Communities, accessed January 2, 2026, https://bbs.autel.com/autelsupport/Diagnostics/37356.jhtml?createrId=1982936&view=1
15. 2018 Dodge Charger star location & program proximity key via Smart Pro - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=VCmD5obSywU
16. Smart Remote Key FOB 433MHz 5B for 2015 -2018 DODGE CHARGER SRT HELLCAT RED | eBay, accessed January 2, 2026, https://www.ebay.com/itm/145249851382
17. 19-23 Charger Challenger Remote Key Fob Smart Key 4A Chip New M3M-40821302 | eBay, accessed January 2, 2026, https://www.ebay.com/itm/276415087221
18. Eye4Techs Replcament Smart Key Fob for 2019 Dodge Challenger FCC M3M-40821302 M3M40821302 Part Number 68155687 68155687AB 68394191 68394191AA 68394195AA 68394195 AA Pack of 2 - Walmart, accessed January 2, 2026, https://www.walmart.com/ip/Eye4Techs-Replcament-Smart-Key-Fob-2019-Dodge-Challenger-FCC-M3M-40821302-M3M40821302-Part-Number-68155687-68155687AB-68394191-68394191AA-68394195AA/12705954508
19. Dodge Challenger Hellcat RedKey : r/Locksmith - Reddit, accessed January 2, 2026, https://www.reddit.com/r/Locksmith/comments/1myu1qw/dodge_challenger_hellcat_redkey/
20. 2015-2018 Dodge Charger Challenger Hellcat SRT 5B Trunk Red Full Power Key ID46, accessed January 2, 2026, https://yourcarkeyguys.com/products/m3n-40821302-dodge-2015-2018-charger-challenger-hellcat-5b-5-button-smart-key-fob-remote
21. 2015-2018 Dodge Challenger Hellcat Logo SRT 5-Button Smart Key Fob Remote Start (FCC: M3N-40821302, P/N: 68234959) - NorthCoast Keyless, accessed January 2, 2026, https://northcoastkeyless.com/product/dodge-challenger-hellcat-srt-5-button-smart-key-fob-remote-start-fcc-m3n-40821302-p-n-68234959-2/
22. CLONING SERVICE KEYLESS MODULE RFHUB RFHM CHRYSLER DODGE JEEP RAM, accessed January 2, 2026, https://www.ebay.com/itm/187594001418
23. OBDSTAR DC706 Clone FCA RFHUB/RFHM Keyless Module on Bench obdii365 #mdt #MDT - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=PChWUEm5l2Q
24. RF Hub Location Dodge Challenger #shorts - YouTube, accessed January 2, 2026, https://www.youtube.com/shorts/QhkdEUnEozU
25. Original Lishi 2-1 Pick/Decoder for Chrysler CY24 - CLK Supplies, accessed January 2, 2026, https://www.clksupplies.com/products/original-lishi-2-1-pick-decoder-for-chrysler-cy24
26. Original Lishi 2-In-1 Pick and Decoder 8-Cut Anti-Glare CY24 / Y157 / Y159, accessed January 2, 2026, https://www.bestkeysupply.com/products/original-lishi-2-in-1-pick-and-decoder-8-cut-anti-glare-cy24-y157-y159-y160-l03
27. Original Lishi Chrysler 8 Cut Y160 Reader CY24 | Transponder Island Inc., accessed January 2, 2026, https://transponderisland.com/shop/tit-dec-26-original-lishi-chrysler-8-cut-y160-reader-cy24-1853
28. 2015 - 2021 Dodge Challenger - How To Open With Dead Battery Or Key Fob - Unlock & Jump Start Charge - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=ekaltis6-as
29. 2023 Dodge Challenger Key Fob Not Detected - How To Start With Dead, Bad Or Broken ... - YouTube, accessed January 2, 2026, https://www.youtube.com/watch?v=G1Pr_wTLr-k