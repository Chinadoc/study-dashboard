#!/usr/bin/env python3
"""
Backfill script for vehicles table brain columns.
Generates SQL migration to populate cached counts and JSON blobs from related tables.
"""

import json

def generate_backfill_sql():
    """Generate SQL statements to backfill new vehicles columns from existing data."""
    
    sql_statements = []
    
    # =====================================================
    # 1. Backfill pearl_count from vehicle_pearls
    # =====================================================
    sql_statements.append("""
-- Backfill pearl_count
UPDATE vehicles SET pearl_count = (
    SELECT COUNT(*) FROM vehicle_pearls vp
    WHERE LOWER(vp.make) = LOWER(vehicles.make)
    AND LOWER(vp.model) LIKE '%' || LOWER(vehicles.model) || '%'
    AND vehicles.year_start >= vp.year_start 
    AND vehicles.year_end <= vp.year_end
);
""")

    # =====================================================
    # 2. Backfill alert_count from locksmith_alerts
    # =====================================================
    sql_statements.append("""
-- Backfill alert_count
UPDATE vehicles SET alert_count = (
    SELECT COUNT(*) FROM locksmith_alerts la
    WHERE LOWER(la.make) = LOWER(vehicles.make)
    AND LOWER(la.model) = LOWER(vehicles.model)
    AND vehicles.year_start >= la.year_start 
    AND vehicles.year_end <= la.year_end
);
""")

    # =====================================================
    # 3. Backfill has_akl_procedure from vehicle_pearls
    # =====================================================
    sql_statements.append("""
-- Backfill has_akl_procedure
UPDATE vehicles SET has_akl_procedure = (
    SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM vehicle_pearls vp
    WHERE LOWER(vp.make) = LOWER(vehicles.make)
    AND LOWER(vp.model) LIKE '%' || LOWER(vehicles.model) || '%'
    AND vehicles.year_start >= vp.year_start 
    AND vehicles.year_end <= vp.year_end
    AND vp.pearl_type = 'AKL Procedure'
);
""")

    # =====================================================
    # 4. Backfill has_add_key_procedure from vehicle_pearls
    # =====================================================
    sql_statements.append("""
-- Backfill has_add_key_procedure
UPDATE vehicles SET has_add_key_procedure = (
    SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM vehicle_pearls vp
    WHERE LOWER(vp.make) = LOWER(vehicles.make)
    AND LOWER(vp.model) LIKE '%' || LOWER(vehicles.model) || '%'
    AND vehicles.year_start >= vp.year_start 
    AND vehicles.year_end <= vp.year_end
    AND vp.pearl_type = 'Add Key Procedure'
);
""")

    # =====================================================
    # 5. Backfill verified_config_count from vehicle_configs
    # =====================================================
    sql_statements.append("""
-- Backfill verified_config_count  
UPDATE vehicles SET verified_config_count = (
    SELECT COUNT(*) FROM vehicle_configs vc
    WHERE LOWER(vc.make) = LOWER(vehicles.make)
    AND LOWER(vc.model) LIKE '%' || LOWER(vehicles.model) || '%'
    AND vehicles.year_start >= vc.year_start 
    AND vehicles.year_end <= vc.year_end
    AND vc.verified = 1
);
""")

    # =====================================================
    # 6. Build architecture_tags_json from immobilizer_system
    # =====================================================
    sql_statements.append("""
-- Backfill architecture_tags_json from immobilizer_system
-- This parses the immobilizer_system field into a JSON array of tags
UPDATE vehicles SET architecture_tags_json = 
    CASE 
        WHEN immobilizer_system IS NOT NULL AND immobilizer_system != '' THEN
            '["' || REPLACE(immobilizer_system, ' / ', '","') || '"]'
        ELSE '[]'
    END
WHERE architecture_tags_json IS NULL;
""")

    # =====================================================
    # 7. Build quick_facts_json from existing fields
    # =====================================================
    sql_statements.append("""
-- Backfill quick_facts_json
UPDATE vehicles SET quick_facts_json = json_object(
    'pin_required', COALESCE(pin_required, 0),
    'has_image', COALESCE(has_image, 0),
    'programming_method', programming_method
)
WHERE quick_facts_json IS NULL;
""")

    return '\n'.join(sql_statements)


def main():
    """Generate and output the backfill SQL."""
    sql = generate_backfill_sql()
    
    # Write to migration file
    output_path = 'data/migrations/backfill_vehicles_brain.sql'
    with open(output_path, 'w') as f:
        f.write("-- Backfill migration for vehicles brain columns\n")
        f.write("-- Generated: 2026-01-08\n")
        f.write("-- Run AFTER unify_vehicles_brain.sql schema migration\n\n")
        f.write(sql)
    
    print(f"Generated backfill SQL: {output_path}")
    print("\nTo run on production D1:")
    print(f"  cd api && npx wrangler d1 execute locksmith-db --file=../{output_path} --remote")


if __name__ == '__main__':
    main()
