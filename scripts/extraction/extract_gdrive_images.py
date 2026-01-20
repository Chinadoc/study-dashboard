#!/usr/bin/env python3
"""
Google Drive Image Extractor & R2 Uploader
Fetches car-related Google Docs with images and uploads them to Cloudflare R2.

This script:
1. Exports Google Docs as ZIP (HTML + embedded images)
2. Extracts images from the ZIP files
3. Uploads images to R2 bucket 'euro-keys-assets'
4. Generates a manifest of uploaded images
"""

import os
import json
import zipfile
import subprocess
import shutil
import re
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# OAuth Configuration
CLIENT_ID = "1057439383868-04gum028jlqtkr3sdj9bbblaf4dglmbc.apps.googleusercontent.com"
CLIENT_SECRET = "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"

SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
]

TOKEN_FILE = 'gdrive_token.json'
OUTPUT_DIR = 'gdrive_exports_with_images'
R2_BUCKET = 'euro-keys-assets'
API_DIR = 'api'  # Directory with wrangler.toml

# Car-related keywords
CAR_KEYWORDS = [
    'locksmith', 'key', 'programming', 'transponder', 'immobilizer',
    'honda', 'toyota', 'ford', 'nissan', 'hyundai', 'kia', 'bmw', 'mercedes',
    'audi', 'volkswagen', 'vw', 'jetta', 'passat', 'golf', 'tiguan',
    'subaru', 'mazda', 'lexus', 'acura', 'infiniti',
    'chevrolet', 'gmc', 'cadillac', 'dodge', 'jeep', 'chrysler', 'ram',
    'pats', 'immo', 'smart key', 'prox', 'fobik', 'autel', 'lishi', 'fcc'
]


def get_credentials():
    """Get or refresh OAuth credentials."""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_config({
                "installed": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "redirect_uris": ["http://localhost"],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            }, SCOPES)
            print("\n📋 A browser will open. Authorize and it will redirect back.")
            creds = flow.run_local_server(port=0, open_browser=True)
        
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
    
    return creds


def is_car_related(filename):
    """Check if a file is car/locksmith related."""
    name_lower = filename.lower()
    return any(keyword in name_lower for keyword in CAR_KEYWORDS)


def list_google_docs(service, max_results=50):
    """List recent Google Docs from Drive."""
    results = service.files().list(
        pageSize=max_results,
        fields="files(id, name, mimeType, modifiedTime)",
        q="mimeType='application/vnd.google-apps.document'",
        orderBy="modifiedTime desc"
    ).execute()
    return results.get('files', [])


def export_doc_as_zip(service, file_id, filename, output_dir):
    """Export a Google Doc as ZIP (HTML + images)."""
    try:
        # Export as ZIP with embedded images
        content = service.files().export(
            fileId=file_id,
            mimeType='application/zip'
        ).execute()
        
        safe_name = re.sub(r'[^a-zA-Z0-9_-]', '_', filename)
        zip_path = os.path.join(output_dir, f"{safe_name}.zip")
        
        with open(zip_path, 'wb') as f:
            f.write(content)
        
        return zip_path
    except Exception as e:
        print(f"  Error exporting {filename}: {e}")
        return None


def extract_and_upload_images(zip_path, temp_dir):
    """Extract images from ZIP and upload to R2."""
    uploaded_images = []
    
    try:
        base_name = os.path.splitext(os.path.basename(zip_path))[0]
        extract_path = os.path.join(temp_dir, base_name)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        
        # Find all images in the extracted directory
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')
        for root, dirs, files in os.walk(extract_path):
            for file in files:
                if file.lower().endswith(image_extensions):
                    img_path = os.path.join(root, file)
                    
                    # Create unique R2 key
                    safe_base = re.sub(r'[^a-zA-Z0-9]', '_', base_name)
                    safe_file = re.sub(r'[^a-zA-Z0-9.]', '_', file)
                    r2_key = f"gdrive_images/{safe_base}_{safe_file}"
                    
                    # Upload to R2 (use absolute path for file)
                    try:
                        print(f"    Uploading: {r2_key}")
                        abs_img_path = os.path.abspath(img_path)
                        abs_api_dir = os.path.abspath(API_DIR)
                        cmd = [
                            "wrangler", "r2", "object", "put",
                            f"{R2_BUCKET}/{r2_key}",
                            "--file", abs_img_path
                        ]
                        result = subprocess.run(
                            cmd, 
                            cwd=abs_api_dir, 
                            check=True, 
                            capture_output=True
                        )
                        
                        uploaded_images.append({
                            "source_doc": base_name,
                            "original_file": file,
                            "r2_key": r2_key,
                            "r2_url": f"https://pub-e3b3f79a74de46a0b29e9c50e11e8a4b.r2.dev/{r2_key}"
                        })
                        
                    except subprocess.CalledProcessError as e:
                        print(f"    Failed to upload {file}: {e.stderr.decode() if e.stderr else str(e)}")
        
        # Clean up extracted directory
        shutil.rmtree(extract_path, ignore_errors=True)
        
    except Exception as e:
        print(f"  Error processing ZIP: {e}")
    
    return uploaded_images


def main():
    print("🔐 Authenticating with Google Drive...")
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print("📂 Fetching recent Google Docs...")
    docs = list_google_docs(service)
    print(f"   Found {len(docs)} documents total")
    
    # Filter for car-related docs
    car_docs = [doc for doc in docs if is_car_related(doc['name'])]
    print(f"   Found {len(car_docs)} car/locksmith related documents")
    
    if not car_docs:
        print("\n⚠️  No car-related docs found.")
        return
    
    # Create directories
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    temp_dir = os.path.join(OUTPUT_DIR, 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    
    # Track all uploaded images
    all_uploaded = []
    docs_with_images = 0
    
    print(f"\n📥 Exporting {len(car_docs)} documents with images...")
    for doc in car_docs:
        print(f"\n📄 {doc['name']}")
        
        zip_path = export_doc_as_zip(service, doc['id'], doc['name'], OUTPUT_DIR)
        
        if zip_path:
            uploaded = extract_and_upload_images(zip_path, temp_dir)
            if uploaded:
                docs_with_images += 1
                all_uploaded.extend(uploaded)
                print(f"   ✓ Uploaded {len(uploaded)} images")
            else:
                print(f"   ℹ No images found in document")
    
    # Clean up temp directory
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    # Save manifest
    manifest_path = os.path.join(OUTPUT_DIR, 'uploaded_images_manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump({
            "total_docs_processed": len(car_docs),
            "docs_with_images": docs_with_images,
            "total_images_uploaded": len(all_uploaded),
            "images": all_uploaded
        }, f, indent=2)
    
    print(f"\n✅ Done!")
    print(f"   Documents processed: {len(car_docs)}")
    print(f"   Documents with images: {docs_with_images}")
    print(f"   Total images uploaded to R2: {len(all_uploaded)}")
    print(f"   Manifest saved to: {manifest_path}")


if __name__ == "__main__":
    main()
