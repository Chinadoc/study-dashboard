-- Migration: Create Locksmith Alerts
-- Description: Creates a repository for high-risk vehicle programming alerts and "Red Alert" warnings.

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS locksmith_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT,
    model TEXT,
    year_start INTEGER,
    year_end INTEGER,
    alert_level TEXT,  -- 'CRITICAL', 'WARNING', 'INFO'
    alert_title TEXT,
    alert_content TEXT,
    mitigation TEXT
);

-- 2. Populate Alerts
INSERT INTO locksmith_alerts (make, model, year_start, year_end, alert_level, alert_title, alert_content, mitigation) VALUES
('Honda', 'Civic', 2022, 2025, 'CRITICAL', 'BCM Bricking Risk', 'Extremely sensitive BCM firmware; prone to bricking during server-auth handshake. Incorrect tool selection or voltage drop can disable the vehicle.', 'Use Smart Pro (ADS2336). Maintain strictly 13.6V+ with a formal PSU.'),
('Honda', 'Integra', 2022, 2025, 'CRITICAL', 'BCM Bricking Risk', 'Extremely sensitive BCM firmware; prone to bricking during server-auth handshake. Incorrect tool selection or voltage drop can disable the vehicle.', 'Use Smart Pro (ADS2336). Maintain strictly 13.6V+ with a formal PSU.'),
('Jeep', 'Grand Cherokee L', 2021, 2025, 'CRITICAL', 'Permanent RF Hub Lock', 'RF Hub locks permanently ("Write Once") after initial setup. Standard OBD AKL is impossible once locked.', 'Must replace RF Hub with virgin unit or perform advanced bench unlock/wipe.'),
('Jeep', 'Wagoneer', 2021, 2025, 'CRITICAL', 'Permanent RF Hub Lock', 'RF Hub locks permanently ("Write Once") after initial setup. Standard OBD AKL is impossible once locked.', 'Must replace RF Hub with virgin unit or perform advanced bench unlock/wipe.'),
('Jeep', 'Grand Cherokee (WL)', 2021, 2025, 'CRITICAL', 'RFHub Bootloader Corruption', 'Attempting to read the PIN via OBD even with a bypass often corrupts the RFHub bootloader on WL platforms.', 'DO NOT read PIN via OBD. Remove RFHub -> Bench Unlock (G-Box3/DC706) -> Reinstall -> Program.'),
('Ford', 'F-150', 2021, 2025, 'WARNING', 'Active Alarm OBD Lockout', 'The Active Theft system blocks communication from the OBDII port when the alarm is triggered (AKL).', 'Use specialized Alarm Bypass Cable to battery or software silencer (Smart Pro).'),
('Ford', 'Bronco', 2021, 2025, 'WARNING', 'Active Alarm OBD Lockout', 'The Active Theft system blocks communication from the OBDII port when the alarm is triggered (AKL).', 'Use specialized Alarm Bypass Cable to battery or software silencer (Smart Pro).'),
('BMW', 'CAS4', 2011, 2018, 'CRITICAL', 'CAS Flash Corruption', 'OBD flashing/downgrading takes 8-15 minutes. Voltage drops or cable disconnects will corrupt the flash, killing the module.', 'Always use a stable PSU (13.6V). Use "Repair CAS" function or bench recovery if bricked.'),
('BMW', 'CAS4+', 2011, 2018, 'CRITICAL', 'CAS Flash Corruption', 'OBD flashing/downgrading takes 8-15 minutes. Voltage drops or cable disconnects will corrupt the flash, killing the module.', 'Always use a stable PSU (13.6V). Use "Repair CAS" function or bench recovery if bricked.'),
('Subaru', 'All Models', 2012, 2017, 'WARNING', 'BIU Bricking Risk', 'Attempting to program G-chip Subaru (ID82) with the wrong protocol via OBD can brick the Body Integrated Unit (BIU).', 'Recommend cloning the G-chip/H-chip via XT27 Super Chip to avoid OBD risks.'),
('Toyota', 'All Models', 2012, 2020, 'INFO', 'Board ID Mismatch', 'FCC ID HYQ14FBA used for incompatible board generations (Legacy G vs High-Sec H). Wrong board will not program.', 'Perform visual PCB inspection or Part Number verification. 0020 = G, 2110 = H.'),
('Toyota', 'All Models', 2018, 2025, 'WARNING', '8A Smart Key Battery Drain', 'Xhorse universal keys programmed for 8A (Board ID 0410/2310) often suffer from parasitic drain (2-week battery life).', 'Use KeyDIY TB Series as preferred alternative for 8A Smart Keys.');
