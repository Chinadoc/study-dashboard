import sqlite3
import json
import os

db_path = "/Users/jeremysamuels/Documents/study-dashboard/data/locksmith.db"
output_path = "/tmp/vyp_orphan_audit.json"

def audit():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Get all make/model combinations from vehicle_year_products (VYP)
        # Assuming table name is 'vehicle_year_products' as per context
        # and columns are 'make', 'model'
        # We also need to check if 'aks_products_detail' exists and what its columns are.
        
        # First, let's list tables to be sure
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables in DB: {tables}")

        vyp_table = "vehicle_year_products"
        aks_table = "aks_products_detail"

        if vyp_table not in tables or aks_table not in tables:
            print(f"Error: Missing tables. VYP: {vyp_table in tables}, AKS: {aks_table in tables}")
            return

        # Query for orphans
        # A combination is an orphan if it exists in VYP but NOT in aks_products_detail
        query = f"""
        SELECT v.make, v.model, COUNT(*) as count
        FROM {vyp_table} v
        LEFT JOIN {aks_table} a ON v.make = a.make AND v.model = a.model
        WHERE a.make IS NULL
        GROUP BY v.make, v.model
        """
        
        cursor.execute(query)
        orphans = cursor.fetchall()

        results = {
            "by_make": {},
            "total_orphans": 0,
            "details": []
        }

        for make, model, count in orphans:
            results["by_make"][make] = results["by_make"].get(make, 0) + count
            results["total_orphans"] += count
            results["details"].append({
                "make": make,
                "model": model,
                "count": count
            })

        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Audit complete. Total orphans: {results['total_orphans']}. Results saved to {output_path}")

    except Exception as e:
        print(f"Error during audit: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    audit()
