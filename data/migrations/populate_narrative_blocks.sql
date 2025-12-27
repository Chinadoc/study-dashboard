-- Migration: Populate Narrative Blocks for Agent 3E
-- Synthesizes deep-dive technical narratives into guide_systems.architecture_notes

BEGIN TRANSACTION;

-- Update Ford Modern PATS (FNV2 / FNV3)
UPDATE guide_systems 
SET architecture_notes = 'The FNV2 "Fortress Architecture" (2021+) implements a Gateway Module (GWM) firewall that filters OBD diagnostic commands. ' ||
                         'Security uses 128-bit AES encryption with 902.6 MHz frequencies. ' ||
                         'A "Locked BCM" state (e.g., active alarm) disables standard OBD access, necessitating the 12-pin physical bypass and secondary 12V power isolation. ' ||
                         'The "Double Honk" indicator confirms the vehicle has entered programming mode.'
WHERE id = 'ford-pats-modern';

-- Update GM Global B (VIP)
INSERT OR REPLACE INTO guide_systems (id, name, applies_to_makes, year_start, year_end, architecture_notes) VALUES
('gm-global-b', 'GM Global B (VIP)', 'Chevrolet,GMC,Cadillac,Buick', 2020, 2029, 
'Vehicle Intelligence Platform (VIP) Transition. Requires CAN FD hardware and server-calculated 24-digit security tokens. ' ||
'Critical "12th Digit Rule": A "Y" in the 12th VIN position (2022 Silverado/Sierra) indicates Global B, while an "A-L" digit indicates Global A. ' ||
'AKL procedures on Global B typically require BCM removal or authorized remote tokens.');

-- Update VAG MQB-Evo
INSERT OR REPLACE INTO guide_systems (id, name, applies_to_makes, year_start, year_end, architecture_notes) VALUES
('vag-mqb-evo', 'VAG MQB-Evo (SFD2)', 'Volkswagen,Audi,Skoda,Seat', 2020, 2029, 
'The SFD (Schutz Fahrzeug Diagnose) and SFD2 protocols require UN/ECE R155 authorized tokens. ' ||
'Identification: BCM part numbers starting with "5WA" indicate MQB-Evo. ' ||
'Requires "Sync Data" from dealer servers for component protection. ' ||
'Key Fob Divergence: FS12P (MQB) vs. FS12A (MQB-Evo) - these are NOT cross-compatible despite visual similarity.');

-- Update Honda Hitag AES
INSERT OR REPLACE INTO guide_systems (id, name, applies_to_makes, year_start, year_end, architecture_notes) VALUES
('honda-hitag-aes', 'Honda Hitag AES (11th Gen)', 'Honda,Acura', 2021, 2029, 
'The "Rolling Code Blockade" architecture. Uses 128-bit Hitag AES (4A) transponders. ' ||
'Risk: Using the "2020+" prompt in older software versions can brick the BSI (Body Systems Interface) by wiping the rolling code counter. ' ||
'Recovery: If bricked, Xhorse XM38 universal keys can often reset the counter via "BSI Service Mode".');

COMMIT;
