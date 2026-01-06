import os
import shutil
import glob

# Source directory (where images were generated)
source_dir = '/Users/jeremysamuels/.gemini/antigravity/brain/1ddfcbe3-cc5a-40bd-a6b3-b98a6aca703a'
# Target directory
target_dir = 'assets/vehicles/generations'

# Ensure target exists
os.makedirs(target_dir, exist_ok=True)

# Pattern map: key is part of generated name, value is target prefix
# Example: chevrolet_camaro_1967_clean_123.png -> camaro_1967.png
mapping = {
    'chevrolet_camaro': 'camaro',
    'ford_mustang': 'mustang',
    'dodge_challenger': 'challenger'
}

files = glob.glob(os.path.join(source_dir, '*_clean_*.png'))

print(f"Found {len(files)} files to process.")

for file_path in files:
    filename = os.path.basename(file_path)
    
    # Identify which car
    target_name = None
    for key, prefix in mapping.items():
        if key in filename:
            # Extract year
            parts = filename.split('_')
            # Finding the year part. Usually it is like 'ford_mustang_1965_clean_...'
            # We can look for a 4 digit year
            for part in parts:
                if part.isdigit() and len(part) == 4:
                    year = part
                    target_name = f"{prefix}_{year}.png"
                    break
            break
    
    if target_name:
        target_path = os.path.join(target_dir, target_name)
        print(f"Moving {filename} -> {target_path}")
        shutil.copy2(file_path, target_path)
    else:
        print(f"Skipping {filename} (could not parse)")
