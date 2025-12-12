-- Clean up D1 database: Keep only unified schema tables
-- Disable foreign key constraints first

PRAGMA foreign_keys=OFF;

-- Tables to DELETE (legacy/fragmented):
DROP TABLE IF EXISTS lishi_tool_keyways;
DROP TABLE IF EXISTS locksmith_data;
DROP TABLE IF EXISTS lishi_tools;
DROP TABLE IF EXISTS vehicle_guides;
DROP TABLE IF EXISTS video_tutorials;
DROP TABLE IF EXISTS curated_overrides;
DROP TABLE IF EXISTS fcc_ids;
DROP TABLE IF EXISTS keyways;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS vehicle_generations;
DROP TABLE IF EXISTS immobilizer_sources;
DROP TABLE IF EXISTS immobilizers;
DROP TABLE IF EXISTS lonsdor_k518_car_list;
DROP TABLE IF EXISTS d1_migrations;

PRAGMA foreign_keys=ON;

-- Tables remaining (unified schema):
-- vehicles_master
-- vehicle_variants
-- fcc_registry
-- keyway_registry
-- chip_registry
