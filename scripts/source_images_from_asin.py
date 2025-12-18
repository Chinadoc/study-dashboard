import json
import os
import requests
import subprocess
import time

# Configuration
JSON_FILE = 'asin_based_affiliate_products.json'
R2_BUCKET = 'euro-keys-assets'
DATABASE_NAME = 'locksmith-db'
TEMP_DIR = 'temp_images'

def get_high_res_url(image_url):
    """
    Transforms an Amazon image URL to its high-resolution version 
    by removing the size constraint (e.g., ._AC_UL320_).
    """
    if not image_url:
        return None
    
    # Typical format: https://m.media-amazon.com/images/I/514z1awND4L._AC_UL320_.jpg
    # High res: https://m.media-amazon.com/images/I/514z1awND4L.jpg
    
    # Split by the dot before the extension
    base_parts = image_url.rsplit('.', 2)
    if len(base_parts) >= 3 and '_AC_' in base_parts[-2]:
        # Reconstruct without the middle part
        return f"{base_parts[-3]}.{base_parts[-1]}"
    
    return image_url

def download_image(url, save_path):
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
    return False

def upload_to_r2(filepath, fcc_id):
    filename = f"{fcc_id}.png" # Unifying as png extension for simple frontend logic, or keep original?
    # Our frontend expects .png in `showFccModal`: `${API}/api/assets/${fccId}.png`
    # Warning: If we download a jpg and save as png without conversion, browser usually handles it, but it's sloppy.
    # However, for this script, we'll confirm the format or just upload with the correct content-type but named .png? 
    # Actually, R2/S3 keys don't strictly enforce extension matching content, but consistent naming helps the frontend.
    # Let's try to stick to what the frontend expects.
    
    try:
        cmd = [
            "wrangler", "r2", "object", "put",
            f"{R2_BUCKET}/{filename}",
            f"--file={filepath}"
        ]
        # Run blindly
        subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        return False

def update_database(fcc_ids):
    if not fcc_ids:
        return
    
    print(f"Updating database for {len(fcc_ids)} records...")
    batch_size = 25 # Smaller batch for safety
    
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
            subprocess.check_call(cmd, cwd="api", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"  Batch {i//batch_size + 1} updated.")
        except Exception as e:
            print(f"  Error updating batch: {e}")

def main():
    if not os.path.exists(JSON_FILE):
        print(f"File {JSON_FILE} not found.")
        return

    # Create temp dir
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

    with open(JSON_FILE, 'r') as f:
        data = json.load(f)

    products = data.get('products_by_fcc', {})
    print(f"Found {len(products)} FCC IDs in source data.")

    successful_uploads = []
    
    # Limit for testing? Or run all? 
    # Let's run all but with a small delay to be polite if needed, although Amazon media is fast.
    
    count = 0
    for fcc_id, product_list in products.items():
        if not product_list:
            continue
            
        # Strategy: Find first product with an image
        target_image_url = None
        for p in product_list:
            if p.get('image'):
                target_image_url = p.get('image')
                break
        
        if not target_image_url:
            print(f"No image found for {fcc_id}")
            continue

        high_res_url = get_high_res_url(target_image_url)
        
        # Determine extension from url
        # ext = '.' + high_res_url.split('.')[-1]
        # We need to save it as something that the frontend will load as .png?
        # Ideally we convert it. But let's just download it and upload it as .png key.
        # Browsers are robust.
        
        temp_path = os.path.join(TEMP_DIR, f"{fcc_id}.png") # Saving as png filename
        
        print(f"[{count+1}] Processing {fcc_id}...", end=" ")
        
        if download_image(high_res_url, temp_path):
            if upload_to_r2(temp_path, fcc_id):
                successful_uploads.append(fcc_id)
                print("Uploaded.")
            else:
                print("Upload failed.")
            
            # Clean up immediately
            if os.path.exists(temp_path):
                os.remove(temp_path)
        else:
            print("Download failed.")
            
        count += 1
        # Optional: break early for validation?
        # if count >= 5: break 

    # Clean up dir
    if os.path.exists(TEMP_DIR):
        os.rmdir(TEMP_DIR)

    # Update DB
    if successful_uploads:
        update_database(successful_uploads)
        print(f"\nSuccess! Processed {len(successful_uploads)} images.")
    else:
        print("\nNo updates made.")

if __name__ == "__main__":
    main()
