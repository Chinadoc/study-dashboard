
import os

INPUT_SQL = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/populate_normalized_unsafe.sql"
OUT_PRODUCTS = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/split_products.sql"
OUT_CONFIGS = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/split_configs.sql"

def main():
    print("Splitting SQL file...")
    with open(INPUT_SQL, 'r') as f:
        lines = f.readlines()
    
    products_lines = ["PRAGMA foreign_keys = OFF;\n"]
    configs_lines = ["PRAGMA foreign_keys = OFF;\n"]
    
    phase = "HEAD" # HEAD, PRODUCTS, CONFIGS
    
    for line in lines:
        if line.startswith("DELETE FROM"):
             products_lines.append(line)
        elif line.startswith("INSERT INTO products"):
            phase = "PRODUCTS"
            products_lines.append(line)
        elif line.startswith("INSERT INTO vehicle_configs") or line.startswith("INSERT INTO config_key_blanks") or line.startswith("INSERT INTO product_vehicle_links") or line.startswith("INSERT OR IGNORE INTO product_vehicle_links"):
            phase = "CONFIGS"
            configs_lines.append(line)
        elif line.startswith("COMMIT"):
             pass # Skip commit, D1 batch handles it
        else:
            # Other lines (PRAGMA, Comments, whitespace)
            if phase == "HEAD" or phase == "PRODUCTS":
                products_lines.append(line)
            else:
                configs_lines.append(line)

    with open(OUT_PRODUCTS, 'w') as f:
        f.write("".join(products_lines))
        
    with open(OUT_CONFIGS, 'w') as f:
        f.write("".join(configs_lines))
        
    print(f"Created {OUT_PRODUCTS} ({len(products_lines)} lines)")
    print(f"Created {OUT_CONFIGS} ({len(configs_lines)} lines)")

if __name__ == "__main__":
    main()
