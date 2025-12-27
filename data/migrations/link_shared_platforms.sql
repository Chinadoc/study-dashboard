-- Migration: Platform Cross-Vehicle Linking (Agent 5E)
-- Maps shared architectures to allow cross-model data display

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS vehicle_cross_references (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_make TEXT,
    source_model TEXT,
    target_make TEXT,
    target_model TEXT,
    relationship_type TEXT, -- 'REBADGE', 'PLATFORM_SHARE', 'MECHANICAL_TWIN'
    notes TEXT
);

INSERT INTO vehicle_cross_references (source_make, source_model, target_make, target_model, relationship_type, notes) VALUES
('Dodge', 'Hornet', 'Alfa Romeo', 'Tonale', 'PLATFORM_SHARE', 'Identical Global B security architecture.'),
('Jeep', 'Renegade', 'Fiat', '500X', 'PLATFORM_SHARE', 'Shared SGW and RFHub logic.'),
('RAM', 'ProMaster', 'Fiat', 'Ducato', 'REBADGE', 'Identical programming steps.'),
('Ford', 'Bronco Sport', 'Ford', 'Escape', 'PLATFORM_SHARE', 'C2 Platform; uses 315MHz Hitag Pro instead of 902MHz.'),
('Chevrolet', 'Silverado 1500', 'GMC', 'Sierra 1500', 'MECHANICAL_TWIN', 'Identical Global B/CAN FD requirements.'),
('Toyota', 'Matrix', 'Toyota', 'Corolla', 'MECHANICAL_TWIN', 'Shared immobilization systems and 16-min resets.'),
('Toyota', '86', 'Subaru', 'BRZ', 'PLATFORM_SHARE', 'Subaru-based immobilization protocol; G-box/Emulator often required.'),
('Pontiac', 'Vibe', 'Toyota', 'Matrix', 'REBADGE', 'Toyota architecture; uses 4D-67 chips.');

COMMIT;
