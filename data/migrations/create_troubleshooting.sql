-- Migration: Create Troubleshooting Table
-- Description: Creates a table for common locksmith failure points and recovery procedures.

CREATE TABLE IF NOT EXISTS troubleshooting (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    system TEXT,
    error_symptom TEXT NOT NULL,
    likely_cause TEXT,
    solution TEXT,
    tool_specific TEXT,
    prevention_tip TEXT,
    severity TEXT CHECK(severity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium'
);

-- Initial Data Seeding
INSERT INTO troubleshooting (make, system, error_symptom, likely_cause, solution, tool_specific, prevention_tip, severity) VALUES
-- BMW
('BMW', 'CAS4/FEM/BDC', 'EWS/CAS Sync Failure', 'Incorrect manipulation of security sectors or power interruption during writing.', 'Perform CAS/DME synchronization using specialized software (ISN extraction and matching).', 'Requires tools like Autohex II or VVDI2 for sync.', 'Maintain stable 13.8V voltage throughout the procedure.', 'High'),
('BMW', 'BDC/DME', 'Bosch DME Lockout', 'Attempting to read/write ISN on newer Bosch DMEs with locked bootloaders.', 'Requires bDM/Bench mode unlocked with specialized license or 10-digit ISN via donor cloning.', 'Autel IM608 Expert Mode or BMW explorer.', 'Check Bosch hardware version before attempting OBD access.', 'Critical'),

-- Honda
('Honda', 'BSI/BCM', 'Safety Check Failed (11th Gen)', 'Rolling code blockade triggered by unauthorized programming tools.', 'Reset BCM using OEM/Authenticated tools; may require "Virgin" state restoration if bricked.', 'Autel with "Honda/Acura Security" subscription.', 'Use only verified Hitag AES (ID4A) keys.', 'High'),
('Honda', 'BSI', 'BSI Bricking', 'Aggressive tool attempts on 2022+ Civic/Integra platforms.', 'Physical replacement of BSI/BCM or dealer restoration if within safety warranty.', 'Avoid cheap VCI clones; use Smart Pro or genuine Autel.', 'Check for "Rolling Code Blockade" warning before starting.', 'Critical'),

-- Subaru
('Subaru', 'SGW/SLOA', 'Communication Failure (2022+)', 'Secure Gateway (SGW) blocking third-party OBD traffic.', 'Use 12+8 or SGW bypass cable to connect directly behind the gateway.', 'Autel IM608 with Subaru SGW Bypass cable.', 'Locate SGW behind glovebox before beginning.', 'Medium'),
('Subaru', 'SLOA', 'Subaru Locking On Attempt (SLOA)', 'Incorrect part number or unauthenticated key data.', 'Wait 30 minutes for system reset or perform AKL with authenticated 128-bit key.', 'Software version check on tool is critical.', 'Verify 128-bit chip compatibility.', 'High'),

-- Stellantis
('Stellantis', 'RFHub', 'RFHub Lock / Failed to Unlock', 'SGW remains locked or improper bypass connection.', 'Ensure 12+8 bypass is correctly seated; use "RFHub Unlock" function with AutoAuth credentials.', 'Autel IM608 / Smart Pro with AutoAuth.', 'Check for Chrysler 12+8 harness requirement.', 'High'),
('Stellantis', 'Security', 'VIN Pre-coding Mismatch', 'HITAG-AES keys require pre-coding with the specific vehicle VIN.', 'Extract VIN from BCM/RFHub and pre-code the blank key using a producer tool before programming.', 'Xhorse VVDI Key Tool Plus or Autel.', 'Check if vehicle is Continental vs Giobert hardware.', 'Medium'),

-- Nissan
('Nissan', 'ESCL', 'No Crank / Steering Lock Jammed', 'Electronic Steering Column Lock (ESCL) motor failure.', 'Install an ESCL emulator and bridge the "unlock" signal in the BCM.', 'Nissan Emulator required; program via standard menus.', 'Tap the ESCL module while turning key to attempt temporary release.', 'High'),
('Nissan', 'Security', 'Pre-Safe Mode (22-digit PIN)', 'Entering incorrect 20-digit rolling PIN multiple times.', 'Wait 60 minutes for "Cool Down" or use "Pre-Safe" recovery sequence with original dealer code.', 'Autel Expert Mode for 22-digit bypass.', 'Extract 20-digit code correctly before attempting.', 'Critical'),

-- Ford
('Ford', 'BCM/GWM', 'Double Honk / Locked BCM', 'Active Theft system armed, blocking OBD key learning sessions.', 'Use 12-pin bypass cable to isolate power and bypass GWM firewall.', 'Autel IM608 with Ford 12-pin Active Alarm cable.', 'Disconnect negative battery terminal to reset "Panic" state.', 'High'),
('Ford', 'Security', '10-Minute Timer Failure', 'BCM rejects access after timer depletion on 2021+ models.', 'Connect to CAN-FD lines behind the GWM; ensure 13.5V stable power.', 'Smart Pro with ADC2020 adapter.', 'Check for M3N-A2C931426 (902 MHz) key compatibility.', 'Medium'),

-- Kia/Hyundai
('Kia/Hyundai', 'BCM', 'Virtual Immobilizer Lockout (Campaign 993)', 'Vehicle remains in "Armed" state despite physical entry.', 'Unlock with factory fob or wait 30 seconds after door opening.', 'Authentic PIN required via NASTF.', 'Ensure RKE signal is received by BCM before ignition on.', 'Medium'),
('Kia/Hyundai', 'SGW/CAN FD', 'Communication Error (2024+)', 'High-bandwidth CAN FD protocol blocking legacy tools.', 'Use CAN FD adapter and bypass SGW physically if digital auth fails.', 'Autel with CAN FD adapter.', 'Check production date (Post-June 2023).', 'High'),

-- Mercedes
('Mercedes', 'ESL/ELV', 'Fatal Error A25464', 'Electronic Steering Lock motor failure writing a permanent jam flag.', 'Install an ESL Emulator and personalize using the EIS password.', 'VVDI MB BGA Tool or Autel XP400 Pro.', 'Check brushes on internal motor if attempting repair (not recommended).', 'High'),
('Mercedes', 'EIS', 'FBS4 Impenetrability', 'Attempting to calculate password on 2015+ Mercedes.', 'Currently no aftermarket solution for AKL; must order dealer key via NASTF.', 'None (Dealer only).', 'Check DAS version (FBS3 vs FBS4) before quoting.', 'Critical');
