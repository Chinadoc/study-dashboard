
import os

SQL_FILE = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/populate_normalized_data.sql"
TEMP_FILE = "/Users/jeremysamuels/Documents/study-dashboard/data/migrations/populate_normalized_unsafe.sql"

def main():
    with open(SQL_FILE, 'r') as f:
        content = f.read()
    
    # Prepend PRAGMA
    new_content = "PRAGMA foreign_keys = OFF;\n" + content
    
    with open(TEMP_FILE, 'w') as f:
        f.write(new_content)
    
    print(f"Created {TEMP_FILE} with FKs disabled.")

if __name__ == "__main__":
    main()
