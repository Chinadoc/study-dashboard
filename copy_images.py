import os
import glob
import shutil
import re
import subprocess

source_dir = "/Users/jeremysamuels/.gemini/antigravity/brain/1ddfcbe3-cc5a-40bd-a6b3-b98a6aca703a"
dest_dir = "/Users/jeremysamuels/Documents/study-dashboard/assets/vehicles"

# Ensure destination directory exists
os.makedirs(dest_dir, exist_ok=True)

# Pattern to match vehicle images
# Matches: make_model_clean_timestamp.png, make_model_year_range_timestamp.png
files = glob.glob(os.path.join(source_dir, "*.png"))

count = 0

for file_path in files:
    filename = os.path.basename(file_path)
    
    # Skip uploaded images or badge details or side profiles not marked clean/timeless/year_range
    if "uploaded_image" in filename:
        continue
    if "badge_detail" in filename:
        continue
    if "side_profile" in filename and "clean" not in filename: # specific simplistic check
        continue
    
    # Initialize target name
    target_name = None
    
    # Case 1: Standard clean images (make_model_clean_timestamp.png)
    # Regex: ^([a-z]+_[a-z0-9]+)_clean_([0-9]+).png
    match_clean = re.match(r"^([a-z]+_[a-z0-9]+(?:_[a-z0-9]+)?)_clean_([0-9]+)\.png$", filename)
    if match_clean:
        base_name = match_clean.group(1)
        target_name = f"{base_name}.png"
    
    # Case 2: Year range images (make_model_start_end_timestamp.png)
    # Regex: ^([a-z]+_[a-z0-9]+)_([0-9]{4}_[0-9]{4})_([0-9]+)\.png$
    if not target_name:
        match_years = re.match(r"^([a-z]+_[a-z0-9]+)_([0-9]{4}_[0-9]{4})_([0-9]+)\.png$", filename)
        if match_years:
            base_name = match_years.group(1)
            years = match_years.group(2)
            target_name = f"{base_name}_{years}.png"

    # Case 3: Poster Timeless (early Chevy) - create specific mapping if _clean doesn't exist?
    # Actually I generated _clean versions for most Chevy models later on.
    # formatting check: chevrolet_camaro_clean vs chevrolet_camaro_poster_timeless
    # I'll stick to _clean if possible. 
    # If I see poster_timeless, I'll only copy if target doesn't exist?
    # Let's simplify and mostly trust "_clean" and year ranges.
    
    # Special Case: generic poster timeless if clean missing?
    if not target_name and "poster_timeless" in filename:
         match_timeless = re.match(r"^([a-z]+_[a-z0-9]+)_poster_timeless_([0-9]+)\.png$", filename)
         if match_timeless:
             base_name = match_timeless.group(1)
             target_name = f"{base_name}.png"
             # Only copy if we don't already have one (Clean takes precedence)
             if os.path.exists(os.path.join(dest_dir, target_name)):
                 print(f"Skipping {filename} as {target_name} already exists (likely from clean version)")
                 continue

    if target_name:
        dest_path = os.path.join(dest_dir, target_name)
        print(f"Copying {filename} to {dest_path}")
        
        # Use sips to resize while copying to ensure small file size
        # Resizing to 500px width
        subprocess.run(["sips", "-Z", "500", file_path, "--out", dest_path], check=True, stdout=subprocess.DEVNULL)
        count += 1

print(f"Processed {count} images.")
