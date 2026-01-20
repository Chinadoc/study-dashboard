import os
import sys
import subprocess
import glob
import json

# Configuration
R2_BUCKET = "euro-keys-assets"
DATABASE_NAME = "locksmith-db"

def upload_image(filepath, fcc_id):
    """Uploads an image to R2 using wrangler r2 object put."""
    # Assuming wrangler is in the path or run via npx
    filename = f"{fcc_id}.png"
    print(f"Uploading {filepath} to {filename}...")
    try:
        # We need to read the file and pipe it to wrangler
        # Use simpler command: wrangler r2 object put bucket/key --file=path
        cmd = [
            "wrangler", "r2", "object", "put",
            f"{R2_BUCKET}/{filename}",
            f"--file={filepath}"
        ]
        subprocess.check_call(cmd)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error uploading {fcc_id}: {e}")
        return False

def update_database(fcc_ids):
    """Updates the database to set has_image=1 for the given FCC IDs."""
    if not fcc_ids:
        return

    print(f"Updating database for {len(fcc_ids)} FCC IDs...")
    
    # Construct a big update statement or multiple small ones
    # For D1, we can do: UPDATE vehicles SET has_image=1 WHERE fcc_id IN (...)
    
    # Batch them to avoid command line length limits
    batch_size = 50
    for i in range(0, len(fcc_ids), batch_size):
        batch = fcc_ids[i:i+batch_size]
        quoted = [f"'{fid}'" for fid in batch]
        in_clause = ",".join(quoted)
        sql = f"UPDATE vehicles SET has_image=1 WHERE fcc_id IN ({in_clause});"
        
        try:
            cmd = [
                "wrangler", "d1", "execute", DATABASE_NAME,
                "--remote",
                f"--command={sql}"
            ]
            # Use cwd=api because wrangler.toml for d1 is likely there
            subprocess.check_call(cmd, cwd="api") 
            print(f"Updated batch {i//batch_size + 1}")
        except subprocess.CalledProcessError as e:
            print(f"Error updating DB batch: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 upload_key_photos.py <directory_with_images>")
        sys.exit(1)

    img_dir = sys.argv[1]
    
    # Find images (assume png or jpg)
    # Strategy: 
    # 1. Normalize filename to get FCC ID (remove extension, uppercase)
    # 2. Upload
    # 3. Collect successful uploads
    # 4. Update DB
    
    files = glob.glob(os.path.join(img_dir, "*.*"))
    successful_fcc_ids = []

    print(f"Found {len(files)} files in {img_dir}")

    for f in files:
        basename = os.path.basename(f)
        name, ext = os.path.splitext(basename)
        
        if ext.lower() not in ['.png', '.jpg', '.jpeg', '.webp']:
            continue
            
        fcc_id = name.upper().strip()
        
        # Upload
        if upload_image(f, fcc_id):
            successful_fcc_ids.append(fcc_id)

    # Update DB
    if successful_fcc_ids:
        update_database(successful_fcc_ids)
        print("Done!")
    else:
        print("No images uploaded.")

if __name__ == "__main__":
    main()
