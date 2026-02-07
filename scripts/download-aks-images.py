#!/usr/bin/env python3
"""
Download missing AKS product images and upload to R2.
Python's urllib bypasses Cloudflare's hotlink protection where curl cannot.
"""
import json
import os
import sys
import time
import urllib.request
import subprocess

DOWNLOAD_DIR = "/tmp/aks-images"
API_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "api")
R2_BUCKET = "euro-keys-assets"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def download_image(url, local_path):
    """Download image from AKS CDN using urllib (bypasses Cloudflare)."""
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        data = resp.read()
        if len(data) < 100:
            return False, "Too small"
        with open(local_path, 'wb') as f:
            f.write(data)
        return True, f"{len(data)} bytes"
    except Exception as e:
        return False, str(e)

def upload_to_r2(local_path, r2_key):
    """Upload local file to R2 using wrangler."""
    try:
        subprocess.run(
            ["npx", "wrangler", "r2", "object", "put", f"{R2_BUCKET}/{r2_key}", f"--file={local_path}"],
            cwd=API_DIR, capture_output=True, text=True, check=True, timeout=30
        )
        return True, "OK"
    except subprocess.CalledProcessError as e:
        return False, e.stderr[:200]
    except Exception as e:
        return False, str(e)

def update_db(item_number, r2_key):
    """Update aks_products_detail with R2 key."""
    sql = f"UPDATE aks_products_detail SET image_r2_key = '{r2_key}' WHERE item_number = '{item_number}'"
    try:
        subprocess.run(
            ["npx", "wrangler", "d1", "execute", "locksmith-db", "--remote", "--command", sql],
            cwd=API_DIR, capture_output=True, text=True, check=True, timeout=30
        )
        return True
    except Exception as e:
        print(f"    DB update failed: {e}")
        return False

def main():
    # Load missing images list
    with open("/tmp/missing_aks_images.json") as f:
        images = json.load(f)

    # Filter out noimage.jpg placeholders
    images = [img for img in images if "noimage.jpg" not in img["image_url"]]
    
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    limit = int(sys.argv[1]) if len(sys.argv) > 1 else len(images)
    dry_run = "--dry-run" in sys.argv

    print(f"\n🚀 AKS Image Migration")
    print(f"   Total: {len(images)} images (excluding placeholders)")
    print(f"   Limit: {limit}")
    print(f"   Dry run: {dry_run}\n")

    completed = 0
    failed = 0
    errors = []

    for i, img in enumerate(images[:limit]):
        item = img["item_number"]
        url = img["image_url"]
        filename = url.split("/")[-1]
        r2_key = f"aks-products/{filename}"
        local_path = os.path.join(DOWNLOAD_DIR, filename)

        # 1. Download
        ok, msg = download_image(url, local_path)
        if not ok:
            failed += 1
            errors.append({"item": item, "error": f"Download: {msg}"})
            print(f"  ❌ [{i+1}/{min(limit, len(images))}] Item {item}: Download failed - {msg}")
            continue

        if dry_run:
            completed += 1
            print(f"  ✅ [{i+1}/{min(limit, len(images))}] Item {item}: Downloaded {msg} (dry-run, skipping upload)")
            continue

        # 2. Upload to R2
        ok, msg = upload_to_r2(local_path, r2_key)
        if not ok:
            failed += 1
            errors.append({"item": item, "error": f"R2 upload: {msg}"})
            print(f"  ❌ [{i+1}/{min(limit, len(images))}] Item {item}: R2 upload failed - {msg}")
            continue

        # 3. Update DB
        update_db(item, r2_key)

        completed += 1
        print(f"  ✅ [{i+1}/{min(limit, len(images))}] Item {item} → {r2_key}")

        # Small delay to avoid rate limiting
        if (i + 1) % 10 == 0:
            time.sleep(1)

    print(f"\n📊 Migration Complete")
    print(f"   ✅ Uploaded: {completed}")
    print(f"   ❌ Failed: {failed}")
    if errors:
        print(f"\n   Failed items:")
        for e in errors:
            print(f"   - Item {e['item']}: {e['error']}")

    # Cleanup
    if not dry_run and completed > 0:
        print(f"\n🧹 Cleaning up {DOWNLOAD_DIR}...")
        for f in os.listdir(DOWNLOAD_DIR):
            os.remove(os.path.join(DOWNLOAD_DIR, f))

if __name__ == "__main__":
    main()
