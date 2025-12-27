-- Migration: Create and Populate badge_config table
-- Defines UI badges for vehicle platform and security status

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS badge_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_key TEXT UNIQUE,
    display_label TEXT,
    badge_class TEXT,
    description TEXT
);

INSERT OR REPLACE INTO badge_config (tag_key, display_label, badge_class, description) VALUES
('platform_global_b', 'Global B (VIP)', 'badge-primary', 'GM Next-Gen Architecture requiring CAN FD and Server Tokens.'),
('platform_fnv2', 'FNV2 Locked BCM', 'badge-danger', 'Ford Next-Gen Architecture with active theft gateway filtering.'),
('security_sgw', '🔒 Gateway', 'badge-secondary', 'Security Gateway present; requires physical bypass or authorized software login.'),
('security_fem_bdc', 'Bench Work', 'badge-warning', 'Requires removal of module for bench-level unlocking or EEPROM reading.'),
('security_high_risk', '🔴 HIGH RISK', 'badge-danger', 'High probability of module bricking if procedure or voltage is incorrect.'),
('security_caution', '🟡 CAUTION', 'badge-warning', 'Procedural nuances or hardware compatibility issues exist.'),
('hardware_can_fd', 'CAN FD Required', 'badge-info', 'Vehicle uses Controller Area Network Flexible Data-rate; requires CAN FD adapter.');

COMMIT;
