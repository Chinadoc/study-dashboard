-- Migration: Create vehicle_walkthroughs and expand year ranges (Agent 2E)
-- Ensures that every specific year for a vehicle has a linked programming guide/walkthrough.

BEGIN TRANSACTION;

-- Create the table for year-specific walkthroughs
CREATE TABLE IF NOT EXISTS vehicle_walkthroughs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    content TEXT,
    source_guide_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_walkthrough_lookup ON vehicle_walkthroughs(make, model, year);

-- Expansion Logic for Ford F-150 2021-2025 (Locked BCM)
WITH RECURSIVE years(year) AS (
  SELECT 2021
  UNION ALL
  SELECT year + 1 FROM years WHERE year < 2025
)
INSERT INTO vehicle_walkthroughs (make, model, year, content, source_guide_id)
SELECT 'Ford', 'F-150', year, 
'# Ford F-150 ' || year || ' AKL Guide (Locked BCM)
1. Physical Entry: Gain entry via Lishi HU101 or air wedge.
2. Isolation: Disconnect vehicle battery. Connect 12-pin Bypass Cable to GWM behind glovebox.
3. Power: Supply external 12V to VCI. Reconnect vehicle battery.
4. Tool: Use Autel/Smart Pro "Force Ignition" -> "All Keys Lost".
5. Key: Place M3N-A2C931426 key in cupholder slot to program.', 
'ford-f150-2021-2025-deep-dive'
FROM years;

-- Expansion Logic for Ford Bronco 2021-2025
WITH RECURSIVE years(year) AS (
  SELECT 2021
  UNION ALL
  SELECT year + 1 FROM years WHERE year < 2025
)
INSERT INTO vehicle_walkthroughs (make, model, year, content, source_guide_id)
SELECT 'Ford', 'Bronco', year, 
'# Ford Bronco ' || year || ' AKL Guide (Locked BCM)
1. Physical Entry: Doors are removable; ensure BCM registers door status.
2. Bypass: Connect 12-pin cable behind glovebox.
3. Power: Supply external 12V to tool.
4. Tool: Select 2021+ Bronco Smart Key. Force Ignition.
5. Key: Program FCC: M3N-A2C931426.', 
'ford-bronco-2021-2025-deep-dive'
FROM years;

-- Expansion Logic for GM Silverado 1500 (Global B Refresh)
WITH RECURSIVE years(year) AS (
  SELECT 2022
  UNION ALL
  SELECT year + 1 FROM years WHERE year < 2025
)
INSERT INTO vehicle_walkthroughs (make, model, year, content, source_guide_id)
SELECT 'Chevrolet', 'Silverado 1500', year, 
'# Chevy Silverado 1500 ' || year || ' (Global B)
1. Identification: Verify 12th VIN digit >= 5 (Refresh model).
2. Hardware: CAN FD adapter is mandatory.
3. Authentication: Ensure stable internet for 24-digit server token.
4. Procedure: Select "CANFD Smart Key" menu. Follow server-auth prompts.
5. Warning: Maintain stable voltage; avoid session timeout.', 
'gm-silverado-refresh-global-b'
FROM years;

-- Expansion Logic for Jeep Grand Cherokee L 2021-2024
WITH RECURSIVE years(year) AS (
  SELECT 2021
  UNION ALL
  SELECT year + 1 FROM years WHERE year < 2024
)
INSERT INTO vehicle_walkthroughs (make, model, year, content, source_guide_id)
SELECT 'Jeep', 'Grand Cherokee L', year, 
'# Jeep Grand Cherokee L ' || year || ' AKL Guide
1. SGW Bypass: Connect 12+8 cable behind radio or glovebox.
2. RFHub Safety: DO NOT read PIN via OBD. Remove RFHub and bench unlock.
3. Key: Program new virgin smart key.
4. Warning: RFHub is "Write Once"; incorrect setup requires new hardware.', 
'jeep-gcl-2021-2024-akl'
FROM years;

COMMIT;
