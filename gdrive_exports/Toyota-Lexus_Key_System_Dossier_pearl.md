ï»¿2021 Toyota 4Runner (N280) + Tacoma (N300) + GX 460 FORENSIC DOSSIER
1. Executive Intelligence Summary
1.1. Strategic Scope and Forensic Objectives
This forensic dossier constitutes an exhaustive technical analysis of the vehicular access control architectures, immobilizer logic, and transponder communication protocols for three definitive Toyota Motor Corporation (TMC) platforms: the Toyota 4Runner (Generation N280), the Toyota Tacoma (Generation N300), and the Lexus GX 460 (Generation J150). While the primary focal point of this investigation is the 2021 model yearâa period representing a critical "security event horizon" for these platformsâthe analysis necessitates a longitudinal study ranging from 2010 through 2024 to contextualize the hardware evolution.
The objective is to provide a unified operational picture for forensic locksmiths, security researchers, and systems integrators. Unlike the modern Toyota New Global Architecture (TNGA) platforms, which standardized security protocols rapidly across the fleet, the N280, N300, and J150 utilize "legacy-adapted" architectures. This has resulted in a fragmented security landscape where specific production months dictate total incompatibility between seemingly identical model years. The dossier dissects the evolution of Radio Frequency (RF) modulation, Federal Communications Commission (FCC) certifications, and cryptographic chipsets, specifically isolating the transition from the legacy "G-Chip" (80-bit) to the "H-Chip" (128-bit) and the subsequent migration to the "Smart 8A" AES architecture.
1.2. The Security Architecture Event Horizon
Our analysis identifies three distinct epochs in the security lifecycle of these vehicles, each requiring distinct intervention strategies and tooling. The 2021 model year sits precariously at the intersection of the second and third epochs, creating a high probability of misidentification and service failure.
The "H-Chip" Paradigm Shift (2014â2016): The first major disruption was the silent migration from Texas Instruments' 4D-72 "G-Chip" to the 128-bit AES "H-Chip." This shift, occurring mid-cycle for the 4Runner and at the launch of the N300 Tacoma, effectively neutralized traditional "cloning" tools, necessitating the development of On-Board Diagnostic (OBD) injection methods for "All Keys Lost" (AKL) scenarios.
The Telematics Bifurcation (2020â2021): For the 4Runner and GX 460, the years 2020 and 2021 represent a schism in Smart Key hardware. The integration of updated infotainment and connected services forced a revision of the Certification ECU (Cert ECU). This resulted in a split where key fobs sharing the exact same external housingâspecifically the "Proximity" style fobsâcontain mutually incompatible internal boards (Board 2110 vs. Board AA). This dossier provides the granular board-level identifiers required to navigate this split.
The "8A" Bypass Evolution: The investigation also highlights the ongoing arms race between TMC security engineers and the aftermarket forensic community. While earlier systems required EEPROM (Electrically Erasable Programmable Read-Only Memory) physical dumpsânecessitating invasive dashboard disassembly to reach the ECUâthe deployment of "8A" adapter cables has enabled direct manipulation of the LIN bus to emulate master keys without component removal.


  



________________
2. Theoretical Foundations of Toyota Immobilizer Systems
To understand the specific vulnerabilities and procedures for the N280, N300, and J150, one must first grasp the underlying theoretical architecture of Toyotaâs immobilizer strategy. The systems found in these vehicles are not monolithic; rather, they are layered implementations of transponder logic that have matured over two decades.
2.1. The Transponder Handshake Protocol
At the core of the security system is the challenge-response handshake between the vehicle's Immobilizer ECU (often located on the ignition barrel or behind the dash) and the transponder chip embedded in the key head.
In the Legacy G-Chip (4D-72) systems 1, prevalent in early N280 4Runners, the communication operates on an 80-bit encryption standard. When the key is inserted, the coil around the ignition cylinder energizes the transponder. The ECU sends a random number (the challenge). The key processes this number using its stored secret key and sends back a signature (the response). If the math matches the ECU's calculation, the engine is authorized to start. This 80-bit depth, while robust in 2010, eventually became susceptible to cryptographic cloning, where powerful aftermarket tools could "sniff" the handshake and calculate the secret key, allowing a duplicate to be created without ever interacting with the vehicle's ECU.
The transition to the H-Chip (4D-74 / 128-bit AES) 2 marked a significant hardening of this protocol. The Advanced Encryption Standard (AES) implementation increased the computational difficulty of "cracking" the key exponentially. This effectively ended the era of simple cloning for the Tacoma N300 and mid-cycle 4Runners. Consequently, the forensic approach shifted from cloning the key to programming the car. This requires an authorized diagnostic session (via Techstream or similar) to tell the ECU to accept a new, randomly generated key ID.
2.2. Smart Key "Proximity" Architecture
The Smart Key systems (Push-to-Start) operate on a more complex, dual-frequency topology.
1. Low Frequency (LF - 125/134 kHz): The vehicle constantly emits LF signals from antennas located in the door handles, cabin, and trunk. These signals wake up the key fob when it enters the zone.
2. Ultra High Frequency (UHF - 315 MHz): Once woken, the fob transmits its credentials back to the vehicle's Tuner via UHF.1
For the 2021 4Runner and GX 460, this architecture is managed by the Certification ECU (Cert ECU). This module is the "brain" of the smart system. It stores the registered Key IDs and decides whether to grant access. Critical to forensic work is the understanding that the Cert ECU is paired to the ID Code Box (Immobilizer) and the Steering Lock ECU. In an "All Keys Lost" scenario, simply replacing one component is insufficient; the entire "Security Chain" must be synchronized, or the digital handshake must be reset using a Seed-Key exchange via the OBDII port.
________________
3. Forensic Analysis: Toyota 4Runner (Chassis N280)
The N280 4Runner (2010â2024) is a unique case study in automotive longevity. Its production run spans the entire evolution of modern transponder security, creating a "layer cake" of technologies where the chassis remained the same, but the electronic nervous system was transplanted twice.
3.1. Phase I: The Legacy Era (2010â2019)
During this foundational decade, the 4Runner utilized a bifurcated strategy, separating the utilitarian "keyed" models from the premium "smart" models.
3.1.1. Keyed Ignition Systems (SR5 / Trail)
The N280 launched with the Texas Instruments 4D-72 "G" Chip.1 This is visually identifiable by the letter "G" stamped on the metal blade of the master key.
* Forensic Characteristic: The G-chip is a carbon-wedge transponder. It operates on the 4D-67/72 protocol.
* Keyway: The mechanical interface is the TR47 (also known as TOY43), a standard double-sided edge-cut key. It is not laser-cut/milled.2
* Transition to H-Chip: Between late 2013 and 2015, a rolling update replaced the G-Chip with the H-Chip (128-bit).2 Snippet 26 indicates confusion in the field regarding the exact cutoff, with some 2019 models still being listed erroneously as "G" by aftermarket databases. However, definitive forensic data confirms that by the 2015 model year, the H-Chip was the standard for all keyed ignitions.
   * Implication: A technician attempting to clone a 2016 4Runner key onto a "G" chip blank will fail. The systems are mutually exclusive.
3.1.2. Smart Key Systems (Limited / TRD Pro)
For the Limited and later TRD Pro trims, the HYQ14ACX fob was the standard for nearly ten years.3
* FCC ID: HYQ14ACX.
* Board ID: 271451-5290.
* IC: 1551A-14ACX.
* Encryption: Texas Crypto DST 80-bit.
* Vulnerability: This generation allows for relatively straightforward "Smart Code Resets" via Techstream. The Seed-Key algorithm for this era is well-documented and supported by most locksmith programming tools (Autel, SmartPro, etc.).
3.2. Phase II: The Telematics Integration Era (2020â2021)
The 2020/2021 model years represent the "Event Horizon." The introduction of a new infotainment head unit with Apple CarPlay and Android Auto required a faster CAN bus communication architecture. This ripple effect forced an upgrade of the Certification ECU, rendering the trusted HYQ14ACX obsolete.
* New Hardware (2020-2021 Early): The replacement key was the HYQ14FBA.5
   * Board ID: 2110 AG.
   * Part Number: 89904-0E090.
   * Cross-Compatibility: This fob is shared with the 2016-2021 Tacoma and Tundra. It represents a consolidation of the truck platform security.
* The Trap: Outwardly, the HYQ14ACX and HYQ14FBA look identical (3 or 4 buttons, black shell). However, attempting to program an ACX key to a 2021 4Runner will result in a communication failure during the registration step. The Cert ECU simply does not recognize the older transponder modulation.
3.3. Phase III: The Final Iteration (2021 Late â 2024)
A critical divergence occurred in late 2021, creating a "split year" scenario. While the SR5 Premium and TRD Off-Road Premium models continued using the 14FBA (Board 2110), the high-end Limited and TRD Pro models began migrating to the HYQ14FLA.6
* Identifier: HYQ14FLA.
* Board ID: "AA".7
* Part Number: 8990H-35010.
* Transponder: DST-AES ID8A.
* Distinction: The "FLA" key supports enhanced proximity functions. It is not backward compatible with the "FBA" (2110) system. A 2021 4Runner could require either an FBA or an FLA key depending on its production month and specific trim package.
   * Diagnostic Tip: The only reliable method to distinguish them without a working key is to check the VIN with a dealer parts database or to attempt to read the ECU data stream to identify the Board ID requirement.


  



________________
4. Forensic Analysis: Toyota Tacoma (Chassis N300)
The N300 Tacoma (2016â2023) represents a more standardized security environment than the 4Runner, having launched squarely in the "H-Chip" and "New Smart Key" era. However, it serves as the primary testbed for the "8A" All Keys Lost bypass techniques, making it a focal point for modern forensic study.
4.1. The "H-Chip" Standard (Keyed Ignition)
Unlike the 4Runner, the N300 generation Tacoma never utilized the G-chip. From its inception in 2016, it standardized on the Toyota H-Chip (128-bit AES).
* Key Hardware:
   * FCC ID: HYQ12BDP.8
   * Part Numbers: 89070-04020, 89070-04040.
   * Blade Profile: TR47 / TOY43.10 This is a critical distinctionâwhile the Smart Key Tacomas use a laser-cut emergency blade, the Keyed Ignition Tacomas use the standard edge-cut blade.
* The "All Keys Lost" Challenge: Prior to 2019, losing all keys to an H-Chip Tacoma was a catastrophic event requiring the removal of the dashboard to access the Immobilizer ECU (often buried behind the HVAC unit) to physically reflash the EEPROM chip. This labor-intensive process was the only way to reset the system because the OBD reset command is blocked without a master key presence.
4.1.1. The "8A" Adapter Breakthrough
Around 2019/2020, forensic tool manufacturers (Autel, Xhorse, etc.) released "8A Non-Smart Key Adapters".12 This tooling revolutionized the service procedure for the Tacoma N300.
* Mechanism: The adapter connects to the OBDII port and clamps onto specific fuses in the engine bay or cabin fuse boxâtypically the IG2 relay or power distribution point.
* Exploit: By injecting power and data signals directly onto the LIN bus or K-Line from the fuse box, the tool bypasses the gateway that normally blocks unauthorized OBD access. It forces the Immobilizer ECU into a "Learn" state, allowing the calculation of the encryption seed and the registration of a new master key without removing a single screw from the dashboard. This "Fuse Box Attack" is now the standard operating procedure for 2016-2023 Tacoma AKL scenarios.
4.2. Smart Key Architecture (Push-to-Start)
The N300 Smart Key system is robust and shared with the Tundra and Highlander of similar vintages.
* Primary Credential: HYQ14FBA.
   * IC: 1551A-14FBA.
   * Board ID: 0010 (G Board).13
   * Frequency: 315 MHz.
* Emergency Key Blade: The N300 Smart Key utilizes a TOY48 (high security/laser cut) emergency blade profile.14 This creates a logistical requirement for service providers: one must carry both TR47 blanks (for keyed SR/SR5 models) and TOY48 blanks (for Limited/TRD Pro smart keys).
* Module Location: For Smart Key Tacomas, the relevant security modules are distributed. The Smart Key ECU (or Certification ECU) acts as the master. Snippet 24 notes that the "Remote Door Control Module" (responsible for receiving the RF signal) can be located in the rear headliner or C-pillar, a distinct placement compared to the 4Runner's glove box location.
________________
5. Forensic Analysis: Lexus GX 460 (Chassis J150)
As a luxury counterpart to the 4Runner, the GX 460 employs a similar chassis but a more advanced iteration of the security suite, typically receiving updates years before the Toyota equivalent.
5.1. The Long Reign of HYQ14ACX (2010â2019)
For nearly a decade, the GX 460 utilized the HYQ14ACX smart key, essentially identical to the 2010â2019 4Runner Limited in terms of RF protocol.
* Board ID: 271451-5290.
* Button Configuration: 4 Buttons (Lock, Unlock, Trunk/Glass Hatch, Panic).15
* Forensic Note: This system is highly stable and known as "Board 5290." It operates on 315 MHz and uses the Texas Crypto DST 80-bit encryption. It is fully cross-compatible with the 4Runner Limited of the same era, provided the button configuration matches the vehicle's features (e.g., Glass Hatch).
5.2. The 2020 Facelift & Security Hardening
In 2020, concurrent with a significant interior and grille refresh, the GX 460 updated its security stack, diverging from the 4Runner's path.
* New Credential: HYQ14FBF.17
   * Part Number: 89904-60U80.
   * Board ID: 231451-0440.18
   * Chip ID: Texas ID H-8A (128-bit).17
* Incompatibility: The 14FBF fob is physically and digitally distinct from the 14ACX. It uses a newer generation of rolling code algorithm. A 2019 GX 460 cannot accept a 2020 key, and vice versa. This is a "hard break" in compatibility.
* Lifecycle: The 14FBF standard continued through the 2022 and 2023 model years. Snippet 27 mentions an HYQ14FLC for the 2024 GX 550 (the new body style), confirming that the J150 platform ended its production run utilizing the HYQ14FBF architecture.
5.3. ECU Topology and Access
The Certification ECU in the GX 460 is the primary target for AKL programming.
* Location: Behind the glove box assembly. It is identified by a black top connector.19
* Pinout Forensics:
   * Pin 10: +12V Power (Violet or Black wire).
   * Pin 11: Ground (White/Black wire).
   * Pin 23: SLP (Steering Lock Position) Output.
   * Pin 16: PTS (Push to Start) Output.
* Forensic Application: In situations where OBD programming fails or the system is "alarmed" (preventing communication), forensic locksmiths can bench-flash this unit. By removing the ECU and connecting directly to pins 10 and 11 on a workbench, the technician can read the EEPROM data directly, bypassing the vehicle's gateway restrictions.
________________
6. Cross-Model Component Dossier
This section consolidates the scattered data into a unified forensic reference for part identification, enabling rapid verification of hardware compatibility.
6.1. Master FCC ID Reference Table


  



6.2. Mechanical Keyway Forensics: TR47 vs. TOY48
A critical distinction exists in the mechanical interface of these keys. Misidentifying the keyway will result in the inability to physically insert the emergency key into the door lock cylinder.
* TR47 (TOY43): This is the standard "edge-cut" key. It features cuts on both top and bottom edges.
   * Usage: It is used on Keyed Ignition models of the 4Runner (N280) and Tacoma (N300).
   * Lishi Tool: The TOY43 Lishi 2-in-1 pick is required to decode this lock.20
* TOY48: This is the "high-security" or "laser-cut" key. It features a central milled groove running down the spine of the blade.
   * Usage: It is used exclusively for the Emergency Insert Key inside the Smart Fobs for the 4Runner (Limited/Pro), Tacoma (Limited/TRD Pro with Smart Key), and all Lexus GX 460s.14
   * Short vs. Long: Smart key inserts are typically the "Short" TOY48 variant. Using a "Long" TOY48 blank (intended for older Lexus ignition cylinders like the LS400) may prevent the fob from snapping back together correctly.
   * Lishi Tool: The TOY48 Lishi 2-in-1 pick is required. It is distinct from the TOY43 tool and they are not interchangeable.21
________________
7. Advanced Programming Protocols & Diagnostics
7.1. Techstream Protocols & "Seed Code" Logic
Toyota's Techstream software remains the primary diagnostic interface for key registration. The process for "All Keys Lost" involves a rigorous security check known as the "Passcode Calculation."
1. Seed Generation: Upon initiating the "Smart Code Reset" utility, the Certification ECU generates a 96-digit "Seed Number".22 This is a cryptographic hash representing the current security state of the vehicle.
2. Passcode Response: This seed must be transmitted to an authorized calculator (TIS - Toyota Information System, or a third-party forensic calculator). The calculator returns a 6-character Passcode.
3. Authorization: Entering the correct Passcode into Techstream authorizes the ECU to wipe the existing key table and open the registration window for new keys.
4. H-Chip Challenge: For H-Chip (keyed) vehicles, the reset process is even more strictly controlled. The "Immo Box" requires a handshake that older versions of Techstream (pre-v12) cannot perform. Version 18 or higher is recommended for 2021+ models.23
7.2. ECU Location and Physical Access
In forensic scenarios where software access is blockedâoften due to a "Bricked" ECU from a failed write attempt or an aftermarket alarm interferenceâphysical access to the ECU is mandatory.
* 4Runner N280 / GX 460 Certification ECU: The module is located immediately behind the glove box assembly. To access it, one must remove the glove box stops and drop the compartment. The ECU is identified by a black top connector.
   * Connection Points: As detailed in snippet 19, Pin 10 provides the +12V input (Violet/Black) and Pin 11 provides the Ground (White/Black). Accessing these pins allows a technician to power the bench for direct EEPROM reading.
* Tacoma N300 Smart Key ECU: The topology is denser in the Tacoma. The Smart Key ECU is often located deep within the dashboard near the firewall, making physical removal significantly more labor-intensive than on the 4Runner. However, the "Remote Door Control Module" (responsible for TPMS and remote lock/unlock) is often located in the rear C-pillar or headliner 24, though this module does not store the Immobilizer data.
7.3. The "Pedal Dance" Myth
A persistent myth in online forums suggests that keys can be programmed using a sequence of door openings and pedal presses (the "Pedal Dance"). While effective on 1990s-era Toyotas, this procedure is totally ineffective on the N280 4Runner, N300 Tacoma, or J150 GX 460 for transponder programming.25 These vehicles utilize a fully digital authorization process. The "Pedal Dance" on these modern platforms is restricted solely to disabling features like the seatbelt chime or traction control, and has no interaction with the Immobilizer EEPROM.
________________
8. Conclusions & Strategic Recommendations
The forensic analysis of the 2021 Toyota 4Runner, Tacoma N300, and GX 460 reveals a "Mixed-Generation" security landscape that demands precision in identification and execution.
Strategic Verification: For any 2020-2021 4Runner or GX 460, the model year alone is an insufficient data point for key selection. The mid-cycle introduction of the HYQ14FBA and subsequent shift to HYQ14FLA means that two identical-looking 4Runners from 2021 could require completely different keys. Verification via VIN or by reading the Board ID (2110 vs AA) is the only fail-safe method.
Inventory Implications: Service providers must maintain a segmented inventory. The "Universal" Toyota keys often fail on the N300 Tacoma due to strict transponder range requirements. Furthermore, the split between TR47 (keyed) and TOY48 (smart) emergency blades necessitates distinct cutting equipment setup.
The "8A" Imperative: Dealing with N300 Tacomas (Keyed) and 2020+ 4Runners requires "8A" compatible tooling. Standard "G-Chip" programmers will fail to communicate with the encryption layer of these modern ECUs. The "Fuse Box Attack" method utilizing an 8A adapter is now the standard for efficient, non-destructive entry and programming.
Future-Proofing: As the N280 and J150 platforms have now been superseded by the next generation (Tacoma N400, 4Runner N380, GX 550), parts availability for the specific "transition years" (2020-2021) will likely tighten. The specific boards (2110 AG and 0440) are unique to this short production window and may become scarce, making the preservation of working fobs and the ability to refurbish used OEM boards (by resetting the immobilizer status) a critical skill for forensic preservation.
Works cited
1. 2017 Toyota 4Runner Key Fob 3 Buttons FCC# HYQ12BBY / G Chip - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2017-toyota-4runner-key-fob-3-buttons-fcc-hyq12bby-g-chip-315-mhz
2. Toyota Transponder Key | Does the "H" Matter- TOY44H - CLK Supplies, accessed January 3, 2026, https://www.clksupplies.com/blogs/news/toyota-transponder-key-does-the-h-matter-toy44h
3. Key Fob Replacement Compatible Toyota 4Runner 2010-2019 Keyless Entry Remote, accessed January 3, 2026, https://www.ebay.com/itm/126472283643
4. 2010-2019 Toyota 4Runner 3-Button Smart Key Fob (FCC: HYQ14ACX, P/N: 89904-47370, Board: 271451-5290) - NorthCoast Keyless, accessed January 3, 2026, https://northcoastkeyless.com/product/toyota-4runner-smart-key-fob-remote-fcc-hyq14acx-p-n-89904-47370/
5. 2021 Toyota 4Runner Smart Key 3B FCC# HYQ14FBA - 2110 AG - Locksmith Keyless, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2021-toyota-4runner-smart-key-3-buttons-fcc-hyq14fba-2110-ag
6. New OEM 2021 - 2023 Toyota 4Runner Smart Key 3B - HYQ14FLA | eBay, accessed January 3, 2026, https://www.ebay.com/itm/334831304751
7. Toyota 4Runner Smart Key 8990H-35010 315MHz HYQ14FLA ABK-3961 - ABKEYS, accessed January 3, 2026, https://abkeys.com/products/toyota-4runner-smart-key-2021up-3b-8990h-35010-315mhz-hyq14fla-3961
8. OEM 2015 - 2021 Toyota Tacoma Remote Head Key 3B - HYQ12BDP - H Chip | eBay, accessed January 3, 2026, https://www.ebay.com/itm/332683934326
9. 2015-2022 Toyota Tacoma 3-Button âHâ Chip Remote Head Key Fob (FCC, accessed January 3, 2026, https://northcoastkeyless.com/product/2015-2019-toyota-tacoma-3-button-h-chip-remote-head-key-fob-fcc-hyq12bdp-p-n-89070-04020-89070-04040/
10. Toyota New OEM 2015-2024 Tacoma Remote Head Key - Royal Key Supply, accessed January 3, 2026, https://royalkeysupply.com/products/toyota-new-oem-2015-2023-tacoma-remote-head-key-3b-fccid-hyq12bdp-pn-89070-04020
11. Remote Key Shell For Toyota 4 Button with Blade TOY48 - eBay, accessed January 3, 2026, https://www.ebay.com/itm/313584530718
12. Xhorse - Toyota 8A Non-Smart Key - All Keys Lost Adapter Via OBD - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/products/xhorse-toyota-8a-non-smart-key-all-keys-lost-adapter-via-obd
13. 2015-2022 Toyota 4Runner Tundra Tacoma / 3-Button Smart Key / PN: 89904-35060 / HYQ14FBB-0010 (AFTERMARKET) - UHS Hardware, accessed January 3, 2026, https://www.uhs-hardware.com/products/2015-2022-toyota-4runner-tundra-tacoma-3-button-smart-key-pn-89904-35060-hyq14fbb-0010-aftermarket
14. Toyota 2005+ Smart Key Blade 69515-52120 TOY48 - ABK-317 - ABKEYS, accessed January 3, 2026, https://abkeys.com/products/toyota-smart-key-blade-toy48-2005up-69515-52120-317
15. 2010 Lexus GX460 Smart Key 4B W/ Hatch Glass Fob FCC# HYQ14ACX - 5290, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2010-lexus-gx460-smart-key-4b-w-hatch-gkass-fob-fcc-hyq14acx-5290-89904-60590-aftermarket
16. Lexus GX460 2010-2019 Genuine Smart Remote Key 315MHz FSK 89904-60590 - MK3, accessed January 3, 2026, https://www.mk3.com/lexus-remote-gx460-2010-315mhz-89904-60590
17. 2022 Lexus GX460 Smart Key 4B W/ Hatch Glass Fob FCC# HYQ14FBF - 89904, accessed January 3, 2026, https://www.locksmithkeyless.com/products/2022-lexus-gx460-smart-key-4b-w-hatch-glass-fob-fcc-hyq14fbf-89904-60u80-aftermarket
18. For 2019 2020 2021 2022 Lexus GX460 Smart Remote Keyless Key Fob 0440 HYQ14FBF, accessed January 3, 2026, https://www.ebay.com/itm/387088871691
19. DB3: Installation Guide. 2020 Lexus GX 460 (Smart Key). 403.TL19 1.03.105 RSR - NET, accessed January 3, 2026, https://directechs.blob.core.windows.net/ddt/403-TL19-1.03.105-RSR_2020-Lexus-GX-460-(Smart-Key)_IG_EN_20231114.pdf
20. ORIGINAL LISHI - TOY43AT Toyota / 10-Cut / 2-in-1 Pick & Decoder / DR & BT / AG, accessed January 3, 2026, https://www.uhs-hardware.com/products/original-lishi-toyota-toy43at-tr47-dr-2-in-1-pick-decoder-ag
21. Lishi TOY48 2in1 Decoder and Pick - GOSO Lock Picks, accessed January 3, 2026, https://gosolockpicks.com/product/lishi-toy48
22. Techstream Smart Key Programming - nhtsa, accessed January 3, 2026, https://static.nhtsa.gov/odi/tsbs/2016/MC-10134271-9999.pdf
23. How to Program a key fob on a Toyota, Lexus, or Scion with Techstream v18 - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=Ftiy-nO5_p4
24. 2018 Toyota Tacoma TPMS Remote Door Control Module Location and Removal - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=bRyYayHcW-0
25. Key Immobilizer and Remote Programming Using Toyota Techstream Software - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=4F3Xu_GdbqU
26. 2019 Toyota G key problems : r/Locksmith - Reddit, accessed January 3, 2026, https://www.reddit.com/r/Locksmith/comments/ip67dw/2019_toyota_g_key_problems/
27. 2023 Lexus RX 350 RX 500H/ 4-Button Smart Key / PN: 8990H-0E620 / HYQ14FLC (OEM), accessed January 3, 2026, https://www.uhs-hardware.com/products/2023-lexus-rx-350-rx-500h-4-button-smart-key-pn-8990h-0e620-hyq14flc-oem