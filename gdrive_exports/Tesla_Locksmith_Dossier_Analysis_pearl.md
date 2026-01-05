ï»¿The Palladium Paradigm: A Comprehensive Technical Dossier on the 2021+ Tesla Fleet for the Independent Security Professional
Executive Summary: The Post-Mechanical Era of Automotive Access
The automotive security landscape is currently navigating a period of profound disruption, a shift driven almost exclusively by the digitization of the vehicle access credential. While the industry has been transitioning away from mechanical keys for two decades, the 2021 model year in the Tesla ecosystem represents a definitive "Rubicon" momentâa point of no return where hardware architecture, software security, and physical access protocols diverged radically from traditional automotive norms. For the independent locksmith and security professional, the 2021+ Tesla Model 3, Model Y, and the "Palladium" refresh of the Model S and Model X constitute a new operational reality: the locksmith is no longer a manipulator of tumblers but a systems administrator of high-voltage networks.
This dossier serves as an exhaustive technical resource, synthesized from current field research and technical documentation, specifically designed to guide the independent professional through the servicing of the modern Tesla fleet. The focus is strictly on the 2021â2025 model years, a period characterized by the introduction of the AMD Ryzen processor, the adoption of 16V Lithium-Ion low-voltage architecture, and the complete elimination of physical key cylinders in the flagship S/X models.
The implications of these changes are binary: adapt or become obsolete. The "key" is now a cryptographic token residing on a smartphone, a proprietary Radio Frequency Identification (RFID) smart card, or a Bluetooth Low Energy (BLE) peripheral. Access is granted not by mechanical actuation but by a successful cryptographic handshake with the Vehicle Control Security (VCSEC) module. This report details the necessary tooling, credentialing (NASTF/VSP), and emergency procedures required to service these vehicles safely and effectively, providing a roadmap for the modern digital locksmith.
________________
Section 1: The 2021 Architecture Divergence
To understand the specific challenges of the 2021+ fleet, one must first dissect the underlying computing and electrical architecture. Unlike legacy manufacturers that rely on a distributed network of dozens of Electronic Control Units (ECUs) from disparate suppliers, Tesla employs a highly centralized, vertical integration strategy. In 2021, this architecture underwent a massive revision that directly impacts diagnostic connection points and power management strategies.
1.1 The Processor Schism: Intel Atom vs. AMD Ryzen
Perhaps the most significant, yet invisible, change for the locksmith occurred in the transition of the Media Control Unit (MCU). For years, the Model 3 and Model Y relied on the Intel Atom processor (MCU2). However, starting in late 2021 and standardizing in 2022, Tesla transitioned to the AMD Ryzen chipset (MCU3) to support higher frame rates and more complex computing tasks.1
This transition is not merely a matter of infotainment speed; it fundamentally altered the physical hardware layout of the vehicle's dashboard and firewall. The "brain" of the car changed shape and location, and critically for the locksmith, the access points for the Controller Area Network (CAN) bus were relocated.
* The Intel Era (Pre-2022): Diagnostic connections for "All Keys Lost" (AKL) scenarios often utilized a connector accessible by removing the glovebox or side panels near the MCU.
* The AMD Era (2022+): The AMD Ryzen units draw significantly more power and utilize different thermal management and harnessing. The diagnostic connection points shifted, often requiring access to the "x930" connector at the rear of the center console or specific kick-panel harnesses.3
The distinction is critical because utilizing a diagnostic cable harness designed for an Intel Atom unit on an AMD Ryzen unit can result in a failure to communicate or, in rare cases, electrical damage due to pinout differences. Locksmiths must now identify the processor typeâoften only possible by checking the "Software" tab on the touchscreen or decoding the build dateâbefore selecting their interface cable.


  



1.2 The Voltage Revolution: 12V Lead-Acid vs. 16V Lithium-Ion
The second pillar of the 2021+ revolution is the abandonment of the traditional 12-volt lead-acid battery. For a century, the 12V standard has been the bedrock of automotive electronics. Tesla, identifying the high failure rates and weight of lead-acid batteries, transitioned the low-voltage (LV) auxiliary system to a 16-volt Lithium-Ion pack.5
This change is deceptive in its simplicity but dangerous in practice. The LV battery is responsible for powering the VCSEC, the door latches, the windows, and the main computer. Without it, the car is a brick.
* The Incompatibility: A standard 12V lead-acid battery charger or jump pack is designed to float at around 13.5Vâ14V. The Tesla 16V Li-Ion battery operates at a nominal voltage closer to 15.5Vâ16V. Connecting a standard 12V charger may fail to push enough potential to wake the battery's internal management system (BMS) or, conversely, a high-amperage "boost" setting on a shop charger could damage the sensitive electronics of the 16V rail if not regulated correctly.6
* The "Jump" Paradox: The goal of "jumping" a 2021+ Tesla is not to crank an engine but to wake the high-voltage (HV) contactors. Once the HV contactors close, the vehicle's internal DC-DC converter (part of the PCS/Penthouse) takes over, stepping down 400V/800V from the main traction battery to sustain the 16V rail. Therefore, the external power is only needed for a few secondsâjust enough to boot the computer and close the contactors.
1.3 The VCSEC: The Gatekeeper
At the center of the security architecture lies the Vehicle Control Security (VCSEC) module. This is the locksmith's primary adversary and partner.
* Function: The VCSEC manages all entry authentication. It hosts the whitelist of authorized keys. When a key card is presented to the B-pillar, the VCSEC drives the antenna, demodulates the response, checks the cryptographic signature, and if valid, triggers the body controller to actuate the latch.7
* Immobilization Logic: Tesla vehicles do not have a traditional "immobilizer" that cuts fuel or spark. Instead, the immobilization is a logic state within the drive inverter. If the VCSEC does not authenticate a valid key, it simply refuses to send the "Close Contactors" request to the Battery Management System (BMS). The car remains in a "Drive Disabled" state. This is a purely digital inhibition, immune to mechanical bypasses or "hotwiring".7
________________
Section 2: The Digital Keychain â Typology and Specifications
In the Tesla ecosystem, the concept of a "key" has been deconstructed into three distinct form factors: the Phone, the Card, and the Fob. Each utilizes a different area of the electromagnetic spectrum, and the locksmith must understand the physics of each to diagnose failure modes accurately.
2.1 The NFC Key Card: The Root of Trust
The Tesla Key Card is the "Master Key" of the system. In almost every "All Keys Lost" programming scenario, the locksmith's primary objective is to program a new Key Card. Once a Key Card is authorized, it can be used to authorize additional Phone Keys and Fobs via the user menu, often without further diagnostic tools.9
* Frequency and Protocol: The card operates at 13.56 MHz (High Frequency), adhering to the ISO 14443-3A standard. This is the same frequency used by credit cards and passports.10
* The 125 kHz Misconception: A critical error made by generalist locksmiths is attempting to read or clone Tesla cards using 125 kHz proximity tools (standard for older office access badges). Tesla strictly uses 13.56 MHz for access. The 125 kHz antennas found in the vehicle are typically reserved for Tire Pressure Monitoring Systems (TPMS) or internal sensor localization, not entry credentials.12
* Security Mechanism: The card is likely a Java Card running a secure applet (similar to MIFARE DESFire). It does not just broadcast a static serial number (UID). It performs a challenge-response authentication. The vehicle sends a random number (nonce), the card signs it with its private key, and the vehicle verifies the signature. This renders simple "UID cloners" ineffective. The locksmith must perform a "pairing" event where the vehicle's whitelist is updated to accept the new card's public key.14
2.2 The Bluetooth Low Energy (BLE) Phone Key
The Phone Key is the primary interface for the user, relying on the Bluetooth Low Energy protocol.
* Operation: The vehicle is equipped with multiple BLE endpoints (antennas) located in the B-pillars, the fascia, and the rear bumper.11 These antennas triangulate the phone's position. The car can distinguish whether the phone is inside the cabin (allowing Drive) or outside (allowing Entry).
* Locksmith Relevance: Locksmiths do not "program" phones. They program Key Cards. The customer then downloads the Tesla App, logs in, and uses the Key Card to pair their phone. If a customer is locked out because their phone is dead or the Bluetooth connection is failing, the locksmith's solution is to provide a working Key Card.9
2.3 The Key Fob: A Tale of Two Frequencies
The physical key fob, often an optional accessory for the Model 3/Y but standard for S/X, has evolved significantly.
* Model 3/Y Fob: This fob is essentially a "Phone Key in a box." It communicates primarily via BLE. It does not use the legacy 315/433 MHz UHF bands for remote keyless entry commands in the traditional sense; it maintains a BLE connection. The common FCC ID is 2AEIM-1133148.15
* Model S/X (Palladium) Fob: The refreshed S/X fob is more advanced. It likely incorporates Ultra-Wideband (UWB) technology alongside BLE to prevent relay attacks (where a thief amplifies the signal from inside a house). The FCC ID for these newer units is 2AEIM-1614283.16
* Passive NFC Backup: Crucially, every Tesla key fob contains a passive NFC chip (13.56 MHz) embedded within it. If the fob's internal battery dies, it can still unlock and start the car by placing it physically on the reader (B-pillar or Console), acting exactly like a Key Card.9


  



________________
Section 3: Emergency Entry and Power Restoration
The most frequent service call for a Tesla is not a lost key in the traditional sense, but a "locked out" owner due to a dead low-voltage battery. When the LV battery fails, the VCSEC goes offline, the electronic door latches become inoperative, and the frameless windows (which must drop slightly to clear the trim) fail to retract. The vehicle becomes a sealed vault.
3.1 The "Tow Eye" Method: External Hood Release
Since the auxiliary battery is located in the front trunk (frunk), gaining access to the frunk is the critical first step. Tesla has engineered a failsafe for this exact scenario.
* The Mechanism: Located on the front bumper is a small circular cover, the "tow eye" cover. Behind this cover are two wire leads (usually one red, one black, or a connector block).
* Theory of Operation: These leads are directly connected to the frunk latch actuator, butâand this is the critical security featureâthey are electrically isolated when the vehicle has power. The circuit is only completed/active when the vehicle's low-voltage system is completely dead. This prevents a thief from simply popping the hood on a parked, powered car.19
* The Procedure:
   1. Pry open the tow eye cover (carefully, using a plastic trim tool to avoid paint damage).
   2. Pull out the two wires.
   3. Connect a 12V power supply (a generic 9V battery often works, as does a small jump pack) to the leads. Polarity matters: Red to Positive, Black to Negative.
   4. The hood latch will immediately fire, releasing the primary latch.
   5. Once the hood is open, disconnect the external power immediately.20


  



3.2 Jump Starting the 16V System
Once the frunk is open, the locksmith must energize the vehicle to use diagnostic tools or allow the keys to function.
* Identification: Remove the maintenance panel at the rear of the frunk (near the windshield). Look for the jump post, typically covered by a red cap.
* The Voltage Warning: As noted in Section 1.2, 2021+ models (Model S/X Refresh and Model 3/Y with AMD) likely use the 16V Li-Ion battery.
   * Safe Practice: Connect a regulated power supply or jump pack. If using a 12V pack, ensure it has sufficient amperage. The goal is to wake the contactors.
   * Wait Time: Once connected, it may take 20-45 seconds for the vehicle's computers to boot and the VCSEC to come online. Listen for the "clunk" of the HV contactors closing.5
   * Warning: Do not attempt to "charge" the 16V battery with a standard 12V lead-acid trickle charger. It will never reach the necessary voltage to satisfy the BMS, and prolonged under-voltage connection can confuse the charging logic.
3.3 The "Palladium" No-Cylinder Reality
The 2021+ Model S and Model X "Palladium" refresh introduced a stark reality for locksmiths: Zero Physical Key Cylinders.
* Legacy vs. Modern: Previous generations of the Model S had a mechanical key blade hidden inside the fob that could open the glovebox or a hidden cylinder in the passenger door. The 2021+ refresh eliminated this.
* Implication: If the power restoration method (Tow Eye) failsâperhaps due to a severed harness in a collisionâthere is no non-destructive way to enter the vehicle using a key. Entry must be gained via wedge-and-reach tools (air jacks and long-reach rods) to pull the manual door release handle located on the interior door panel.
* Risk: The Model S/X refresh uses frameless windows. Wedging the glass carries a high risk of breakage. Locksmiths should prioritize the electrical entry method (Tow Eye) above all else.21
________________
Section 4: Diagnostic Pathways â The Official vs. Aftermarket Dilemma
Once entry is gained, the task shifts to programming. This requires communicating with the vehicle's internal network. The locksmith industry is currently bifurcated between the "Official" path (Tesla Toolbox 3) and the "Aftermarket" path (Autel, Loki).
4.1 The Official Path: Tesla Toolbox 3 & NASTF
Tesla is unique among manufacturers in offering a direct, albeit expensive, pathway for independent repairers that mirrors the dealer experience.
* Tesla Toolbox 3: This is a cloud-based diagnostic platform accessible via a web browser (Google Chrome is recommended). It is the same software used by Tesla Service Centers.22
   * Subscription Cost: Access is sold in time blocks. As of 2025, a subscription can range from ~$125/month for basic service manuals to significantly higher tiers for full diagnostic capabilities (Toolbox 3), often costing upwards of $500â$700 annually or per specific high-level duration.23
   * Hardware: It requires a specialized pass-through cable. For Model S/X, this is an Ethernet-to-Vehicle adapter. For Model 3/Y, it is a USB-to-CAN or Ethernet adapter depending on the specific task and model year.25
* The NASTF Requirement: For security-related functions like "All Keys Lost" or "Immobilizer Reset," Tesla enforces strict vetting via the National Automotive Service Task Force (NASTF).
   * VSP Credential: The locksmith must be a registered Vehicle Security Professional (VSP). This involves a background check and a registry listing. The cost is approximately $435 for a two-year subscription.27
   * The Workflow: When attempting to pair a key in Toolbox 3 without a working admin key, the software will prompt for VSP credentials. The system checks the NASTF registry in real-time. If validated, the software authorizes the secure transaction.
   * 2025 Streamlining: In late 2025, Tesla updated the process to remove the cumbersome "Owner Authorization Request" for every transaction, trusting the VSP's logged-in status and shifting the liability of ownership verification to the locksmith, streamlining the process significantly.28
4.2 The Aftermarket Path: Autel and Loki
For shops that do not wish to maintain a Toolbox subscription or require offline capabilities, the aftermarket has developed robust solutions.
Autel IM608 Pro / IM608 II
The Autel IM608 is the standard-bearer for generalist automotive locksmiths.
* Capabilities: It allows for "All Keys Lost" programming for Model 3 and Y.
* The "Bench" Constraint: For many AKL scenarios, specifically on the Model 3, the Autel cannot program directly via the OBDII port because the Gateway module blocks the command. The procedure often involves:
   1. Removing the VCSEC or MCU from the vehicle.
   2. Connecting it to the Autel "G-BOX" adapter on a workbench (providing power and CAN communication directly to the module pins).
   3. Reading the encrypted password data.
   4. Sending this data to Autel's server to calculate the password.
   5. Writing the new key data back to the module.29
* Risk: This method is invasive and carries a risk of damaging pins or the module itself during removal/reinstallation.
Loki: The Specialist's Scalpel
Loki is a dedicated Tesla diagnostic tool, designed for deep-level repair and salvage work.
* Functionality: Loki operates closer to a "root" level access tool. It connects via specialized cables (LC001 through LC006) that interface with both CAN and LAN networks.
* The AMD Solution: For the 2021+ AMD Ryzen vehicles, Loki provides specific cables (LC006-C3) that connect to the CAN bus at the kick panel or center console, bypassing the secure gateway limitations that block standard OBD tools.4
* Feature Set: Beyond keys, Loki allows for the "marrying" of used modules (e.g., installing a used VCSEC from a donor car), resetting Crash Data in the Airbag module (RCM), and deeper BMS analysisâfeatures often locked out or restricted in Toolbox 3 for independent users.4
* Cost: The hardware investment is significant ($3,000â$4,000+), but it avoids the recurring subscription fees of Toolbox 3 for diagnostics, though updates may incur costs.33


  



________________
Section 5: Model-Specific Workflows (2021+)
The actual "hands-on" procedure varies depending on the specific model and its hardware generation.
5.1 Model 3 and Model Y (2021+ Refresh)
* Entry Points: If the vehicle is locked and dead, use the Tow Eye method (Section 3.1). If powered but locked, verify ownership and use the app if available, or proceed to mechanical entry using the manual release lever (requires careful wedging of the frameless glass).
* Connection (Intel Atom): Diagnostic connection is often made behind the glovebox. This requires removing the lower dash panel to access the MCU connectors.
* Connection (AMD Ryzen): The connection point moved. Locksmiths typically access the x930 connector located at the rear of the center console (accessible by removing the rear vent panel) or a specific connector in the driver's kick panel near the A-pillar.3
* Programming:
   * Official: In Toolbox 3, select the routine PROC_VCSEC_C_PAIR-NFC-CARD-V2. Follow the on-screen prompts to place the new card on the center console reader.7
   * Aftermarket: Connect the tool (Loki/Autel) to the CAN bus. Run the "All Keys Lost" function. The tool will communicate with the VCSEC, calculate the necessary bypass, and put the car into "Learn Mode."
5.2 Model S and Model X (Palladium / 2021+ Refresh)
* The "Dead Fob" Procedure: The location for the emergency start (passive NFC read) changed with the refresh.
   * Old S/X: Key fob was placed near the 12V socket or cup holder.
   * Refresh S/X: The key fob must be placed on the Wireless Phone Charger (Left Side). Crucially, the fob must be swiped downwards or placed against the center divider. This is non-intuitive and a common source of frustration for owners and locksmiths alike.18
* Connection: The diagnostic port is an Ethernet-style connector. For Toolbox 3, an RJ45-to-Proprietary cable is used. The port is typically found behind the cubby below the central screen (requires removing the trim panel) or, on some builds, near the driver's footwell.
* No-Cylinder Entry: As emphasized, there are no lock cylinders. If the electrical system is catastrophically damaged and the Tow Eye release fails (e.g., wire severed in a front-end collision), entry may require destructive methods or specialized body shop tools to mechanically release the latch cable from underneath the vehicle.21
________________
Section 6: Business Implications & Future Outlook
For the automotive locksmith business, the Tesla fleet represents a distinct vertical marketâa "high barrier, high reward" segment.
* The Investment Calculation: Servicing Teslas is not a casual add-on. It requires specific hardware (Loki or Toolbox subscription) and credentials (NASTF VSP). The total initial investment to be "Tesla Ready" is in the range of $3,000â$5,000, significantly higher than the cost of a basic key programmer for domestic vehicles.
* Inventory Strategy:
   * Cards: High volume, low cost. Stocking generic or OEM Tesla NFC cards is essential.
   * Fobs: High cost ($150+). Due to the high cost and the fact that most users prefer Phone Key/Card access, many locksmiths choose not to stock Plaid fobs, offering them only on special order.
* Liability: Working on High Voltage (HV) adjacent systems (like the 16V DC-DC supported rail) carries liability. Locksmiths must be trained in EV safety basicsâspecifically, knowing never to cut orange high-voltage cables and understanding the difference between the 16V rail and the 400V traction bus.
6.1 Insight: The End of Mechanical Locksmithing
The 2021 Model S Plaid is a harbinger of the industry's future. By eliminating the key cylinder entirely, Tesla has signaled that mechanical access is a legacy vulnerability to be removed, not a feature to be preserved. Locksmiths who rely solely on picking locks and cutting blades will find their addressable market shrinking. The future belongs to the "Digital Locksmith"âa hybrid professional capable of navigating cloud diagnostics, local area networks, and encrypted radio protocols with equal fluency.
________________
Conclusion
The 2021+ Tesla fleet, with its transition to AMD Ryzen processing, 16V Lithium-Ion power, and purely digital access credentials, stands as the most technically demanding platform for the independent locksmith. Success requires a shift in mindset from mechanical manipulation to network administration. The procedures detailed in this dossierâfrom the precise extraction of the Tow Eye leads to the VSP-authenticated programming in Toolbox 3âform the curriculum for this new era. For the professional willing to invest in the tooling and training, the Tesla ecosystem offers a lucrative, protected market; for the unprepared, it remains a sealed, high-voltage fortress.
References
* Architecture & Specs: 1
* Key Frequencies & FCC: 10
* Emergency Entry: 5
* Toolbox & NASTF: 22
* Aftermarket Tools: 3
Works cited
1. Tesla Intel Atom (MCU 2) and AMD Ryzen (MCU 3): Feature Differences and How to Tell What You Have | Drive Tesla Parts, accessed January 3, 2026, https://drive-parts.com.ua/en/tesla-intel-atom-mcu-2-i-amd-ryzen-mcu-3-vidminnosti-funktsii-i-yak-vyznachyty-shcho-u-vas-ye/
2. What's the difference between intel and amd? : r/TeslaLounge - Reddit, accessed January 3, 2026, https://www.reddit.com/r/TeslaLounge/comments/1d4wqw5/whats_the_difference_between_intel_and_amd/
3. The connection of LOKI to Tesla Model 3 - for diagnostics procedure - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=KQfmACRKI9U
4. Latest Loki & Tesla Diagnostic News, accessed January 3, 2026, https://lokidiagnostics.com/news/
5. Jump Starting - Tesla, accessed January 3, 2026, https://www.tesla.com/ownersmanual/model3/en_us/GUID-3567D5F4-A5F4-4323-8BE0-023D5438FFC6.html
6. Tesla Model 3 Won't Start? | Dead 12V Battery Fix & Emergency Jump Guide - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=WPoPmwkkLvE
7. Replacement Keys - Program (No Keys Present) - Tesla Service, accessed January 3, 2026, https://service.tesla.com/docs/ModelY/ServiceManual/en-us/GUID-55917424-BE25-40DF-98B2-B3BBF1ED9646.html
8. Tesla Key Programming - Locksmith Pro Academy, accessed January 3, 2026, https://locksmithproacademy.org/tesla-key-programming/
9. Tesla Vehicle Keys | Tesla Support, accessed January 3, 2026, https://www.tesla.com/support/tesla-vehicle-keys
10. Here are technical details about Model3 keyfob : r/teslamotors - Reddit, accessed January 3, 2026, https://www.reddit.com/r/teslamotors/comments/6re0h4/here_are_technical_details_about_model3_keyfob/
11. Certification Conformity - Tesla, accessed January 3, 2026, https://www.tesla.com/ownersmanual/model3/en_my/GUID-A884F312-E99F-47CF-9699-253D501A198D.html
12. Understanding the Differences Between 13.56 MHz and 125 kHz RFID Tags, accessed January 3, 2026, https://jiarfidtag.com/differences-between-13-56-mhz-and-125-khz-rfid-tags/
13. what is the difference between 13.56 mhz and 125khz rfid tags, accessed January 3, 2026, https://custom-rfid-tags.com/difference-between-13-56-mhz-and-125khz-rfid-tags/
14. Telsa Model 3 RFID Cards - Projects - Dangerous Things Forum, accessed January 3, 2026, https://forum.dangerousthings.com/t/telsa-model-3-rfid-cards/1100
15. 2017-25 TESLA MODEL 3/Y OEM SMART KEY REMOTE FOB FCC: 2AEIM-1133148 ... - eBay, accessed January 3, 2026, https://www.ebay.com/itm/176478605663
16. 2021-25 TESLA MODEL S SMART KEY REMOTE FOB 1618096-91-G FCC: 2AEIM-1614283 MINT! | eBay, accessed January 3, 2026, https://www.ebay.com/itm/175900938471
17. Certification Conformity - Tesla, accessed January 3, 2026, https://www.tesla.com/ownersmanual/models/en_us/GUID-DAD2ACC3-FBA3-4474-AF11-EF052D4322FC.html
18. Additional Key - Program (Existing Key Present) - Tesla Service, accessed January 3, 2026, https://service.tesla.com/docs/ModelS/ServiceManual/Palladium/en-us/GUID-D51F3BE6-ADA8-4D58-A225-30DE9A972F65.html
19. Opening the Hood with No Power - Tesla, accessed January 3, 2026, https://www.tesla.com/ownersmanual/model3/en_us/GUID-34181E3A-B4A7-4658-906A-38C6647B5664.html
20. Tesla Model 3/Y - Hide An Emergency Battery - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=xUOy5uomA7g
21. Key Blade - Job Instruction, accessed January 3, 2026, https://jobinstructions.geturgently.com/docs/tesla-model-s-2015-2022-key-blade
22. Diagnostic Software Subscription - Tesla Service, accessed January 3, 2026, https://service.tesla.com/en-US/diagnostic-software
23. 7 Shocking Ways Tesla Toolbox 3's New $700 Subscription Price Revolutionizes EV Repair, accessed January 3, 2026, https://mkt.sbtur.com/digital-fame-alert-2/7-shocking-ways-tesla-toolbox-3s-new-700-subscription-price-revolutionizes-ev-repair-x9wpi.html
24. Extended Service Agreement Subscription | Tesla Support, accessed January 3, 2026, https://www.tesla.com/support/extended-service-agreement
25. Tesla Toolbox 3 Service and Diagnostic Software - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=usffq1iUAzI
26. Tesla Diagnostic Software - How To Access - YouTube, accessed January 3, 2026, https://www.youtube.com/watch?v=TkBeuTDdrus
27. What is NASTF? (credentials for mechanics, technicians, locksmiths), accessed January 3, 2026, https://support.nastf.org/support/solutions/articles/43000755440-what-is-nastf-credentials-for-mechanics-technicians-locksmiths-
28. National Automotive Service Task Force - NASTF, accessed January 3, 2026, https://wp.nastf.org/
29. A GUIDE TO THE IM608 ALL LOST KEY PROGRAMMING FOR AUDI A3 - 3D Group, accessed January 3, 2026, https://3dgroupuk.com/tutorials/a-guide-to-the-im608-all-lost-key-programming-for-audi-a3
30. Autel IM608 XP400 | How to do All Keys Lost on 2018 Range Rover | Training 2020, accessed January 3, 2026, https://www.youtube.com/watch?v=B8XTzFXbnnA
31. LOKI USER GUIDE, accessed January 3, 2026, https://dev-srv.tlkeys.com/storage/files/diagnostic-tools/LOKI/LOKI-USER-GUIDE.pdf
32. Loki Tesla Diagnostic Kit - The First Aftermarket Tesla Tool, accessed January 3, 2026, https://www.maverickdiagnostics.com/shop/am-tools/loki-tesla/
33. LOKI - Tesla Key Programming & Diagnostics Tool - Base Tool - Live Data from CAN - Free Software Updates, accessed January 3, 2026, https://www.uhs-hardware.com/products/loki-tesla-key-programming-diagnostics-tool-base-tool-live-data-from-can-free-software-updates
34. Replacement Keys - Program (No Keys Present) - Tesla Service, accessed January 3, 2026, https://service.tesla.com/docs/ModelS/ServiceManual/Palladium/en-us/GUID-EB89DDAA-0D65-4BCB-90FC-A7C2F62CEEC0.html
35. Comparison Between Tesla Models: Model S, Model 3, Model X, and Model Y - V2C, accessed January 3, 2026, https://v2charge.com/comparison-tesla-models/
36. Tesla Product Specifications: The Ultimate Technical Deep Dive, accessed January 3, 2026, https://cheatsheets.davidveksler.com/tesla-products.html
37. Tesla Model 3 - Wikipedia, accessed January 3, 2026, https://en.wikipedia.org/wiki/Tesla_Model_3
38. Service Mode User Guide, accessed January 3, 2026, https://service.tesla.com/docs/Public/ServiceMode/service_mode_user_guide.pdf