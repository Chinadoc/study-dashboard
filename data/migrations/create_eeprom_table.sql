-- Create EEPROM / AKL Data Table
DROP TABLE IF EXISTS eeprom_data;
CREATE TABLE eeprom_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    
    module_name TEXT,        -- e.g. "BCM", "Immobilizer Unit"
    module_location TEXT,    -- e.g. "Behind glove box"
    main_chip TEXT,          -- e.g. "Motorola 9S12"
    eeprom_chip TEXT,        -- e.g. "93C56", "24C16"
    
    pin_via_obd TEXT,        -- "Yes", "No"
    akl_method TEXT,         -- "Reflash", "Clip", "Solder"
    tools_supported TEXT,    -- "Autel", "Tango"
    notes TEXT,
    
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eeprom_make_model ON eeprom_data(make, model);
