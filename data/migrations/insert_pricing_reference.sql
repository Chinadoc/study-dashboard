-- ═══════════════════════════════════════════════════════════════════════════
-- PRICING AND LABOR TIME REFERENCE DATABASE
-- Source: BMW Locksmith Guide, Mercedes Comprehensive Guide, Volvo Development Plan
-- Generated: 2025-12-26
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN TRANSACTION;

-- Create Pricing Reference Table
CREATE TABLE IF NOT EXISTS pricing_reference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT,
    model TEXT,               -- NULL for make-wide, specific model for exceptions
    procedure TEXT,           -- 'Spare Key', 'AKL OBD', 'AKL Bench', 'Module Repair'
    complexity_tier TEXT,     -- 'Basic', 'Intermediate', 'Advanced', 'Expert'
    labor_mins_low INTEGER,
    labor_mins_high INTEGER,
    price_low REAL,
    price_high REAL,
    special_requirements TEXT,
    high_margin_flag INTEGER  -- 1 = high profit opportunity
);

-- ==============================================================================
-- 1. BASELINE COMPLEXITY TIERS
-- ==============================================================================

INSERT INTO pricing_reference (make, procedure, complexity_tier, labor_mins_low, labor_mins_high, price_low, price_high, special_requirements, high_margin_flag) VALUES
('General', 'Spare Key (OBD)', 'Basic', 15, 30, 150.00, 250.00, 'Requires working key', 0),
('General', 'AKL (OBD)', 'Intermediate', 30, 60, 300.00, 450.00, 'No module removal required', 0),
('General', 'AKL (Bench)', 'Advanced', 60, 120, 500.00, 800.00, 'Requires module removal / ISN extraction', 0),
('General', 'Cloud/Dealer AKL', 'Expert', 120, 240, 800.00, 1200.00, 'Requires online authorization or dealer logic', 0);

-- ==============================================================================
-- 2. HIGH-MARGIN OPPORTUNITIES
-- ==============================================================================

INSERT INTO pricing_reference (make, procedure, complexity_tier, labor_mins_low, labor_mins_high, price_low, price_high, special_requirements, high_margin_flag) VALUES
('BMW', 'FRM3 Repair', 'Advanced', 20, 40, 200.00, 350.00, 'Partition fix via VVDI/ACDP', 1),
('Mercedes', 'Password Calculation', 'Advanced', 15, 45, 400.00, 600.00, 'Requires G-Box and IR key reader', 1),
('Mercedes', 'ESL Emulation', 'Intermediate', 30, 60, 350.00, 500.00, 'Bypasses mechanical lock failure', 1),
('Stellantis', 'Pre-coding / Vineyard', 'Advanced', 30, 60, 450.00, 650.00, 'Expertise premium for SGW bypass', 1);

-- ==============================================================================
-- 3. BRAND SPECIFIC PRICING (BMW)
-- ==============================================================================

INSERT INTO pricing_reference (make, procedure, complexity_tier, labor_mins_low, labor_mins_high, price_low, price_high, special_requirements) VALUES
('BMW', 'Spare Key (E/F Series)', 'Basic', 20, 45, 250.00, 350.00, 'Working key required'),
('BMW', 'AKL (CAS3+)', 'Intermediate', 45, 90, 450.00, 600.00, 'Flash downgrade risk - Power supply mandatory'),
('BMW', 'AKL (FEM/BDC)', 'Advanced', 90, 150, 600.00, 950.00, 'Labor intensive: Module removal and desoldering/clip'),
('BMW', 'AKL (G-Series)', 'Expert', 120, 300, 850.00, 1500.00, 'Often requires dealer key or DME unlock');

-- ==============================================================================
-- 4. BRAND SPECIFIC PRICING (MERCEDES)
-- ==============================================================================

INSERT INTO pricing_reference (make, procedure, complexity_tier, labor_mins_low, labor_mins_high, price_low, price_high, special_requirements) VALUES
('Mercedes', 'Spare Key (FBS3)', 'Intermediate', 30, 60, 300.00, 450.00, 'Password calculation via server'),
('Mercedes', 'AKL (FBS3)', 'Advanced', 60, 120, 500.00, 750.00, 'Bench read of EIS required'),
('Mercedes', 'AKL (FBS4)', 'Expert', 15, 30, 900.00, 1400.00, 'Dealer key only - Verify TRP credentials');

-- ==============================================================================
-- 5. BRAND SPECIFIC PRICING (VOLVO / OTHERS)
-- ==============================================================================

INSERT INTO pricing_reference (make, procedure, complexity_tier, labor_mins_low, labor_mins_high, price_low, price_high, special_requirements) VALUES
('Volvo', 'Sport Key Restoration', 'Intermediate', 45, 75, 200.00, 300.00, 'Shell cutting and battery soldering'),
('Volvo', 'Spare Key (Smart)', 'Advanced', 60, 90, 450.00, 600.00, 'Requires VIDA sub + software fee'),
('VW', 'MQB Add Key', 'Advanced', 45, 90, 350.00, 550.00, 'Sync data acquisition required');

COMMIT;
