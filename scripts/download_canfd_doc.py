#!/usr/bin/env python3
"""
Download the newest Google Docs created today.
- Downloads as HTML+images zip
- Extracts and keeps images only
- Also saves .txt version
"""

import os
import sys
import json
import io
import zipfile
from pathlib import Path
from datetime import datetime, timezone

try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
except ImportError:
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", 
                    "google-auth", "google-auth-oauthlib", "google-api-python-client"], check=True)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload

PROJECT_ROOT = Path(__file__).parent.parent
TOKEN_FILE = PROJECT_ROOT / "gdrive_token.json"
OUTPUT_DIR = PROJECT_ROOT / "data" / "gdrive_today"

def get_credentials():
    if not TOKEN_FILE.exists():
        print(f"❌ Token file not found: {TOKEN_FILE}")
        sys.exit(1)
    
    with open(TOKEN_FILE, 'r') as f:
        token_data = json.load(f)
    
    creds = Credentials(
        token=token_data.get('token'),
        refresh_token=token_data.get('refresh_token'),
        token_uri=token_data.get('token_uri'),
        client_id=token_data.get('client_id'),
        client_secret=token_data.get('client_secret'),
        scopes=token_data.get('scopes')
    )
    
    if creds.expired and creds.refresh_token:
        print("🔄 Refreshing token...")
        creds.refresh(Request())
        token_data['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(token_data, f, indent=2)
    
    return creds

def sanitize_filename(name):
    safe = name.replace(' ', '_').replace('/', '_').replace(':', '_')
    safe = safe.replace('(', '').replace(')', '').replace(',', '')
    safe = "".join(c for c in safe if c.isalnum() or c in "_-.")
    return safe[:80]

def get_todays_docs(service):
    """Get all Google Docs created today - increased page size."""
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    print(f"🔍 Searching for docs created on {today}...")
    
    query = f"createdTime >= '{today}T00:00:00' and mimeType='application/vnd.google-apps.document'"
    
    response = service.files().list(
        q=query,
        spaces='drive',
        fields='files(id, name, mimeType, createdTime, modifiedTime)',
        orderBy='createdTime desc',
        pageSize=100  # Increased
    ).execute()
    
    return response.get('files', [])

def get_already_downloaded(output_dir):
    """Get set of already downloaded doc names."""
    if not output_dir.exists():
        return set()
    return {d.name for d in output_dir.iterdir() if d.is_dir()}

def download_doc(service, doc_id, doc_name, output_dir):
    """Download doc as .txt and extract images from HTML zip."""
    safe_name = sanitize_filename(doc_name)
    doc_dir = output_dir / safe_name
    doc_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Download as plain text
    txt_path = doc_dir / f"{safe_name}.txt"
    request = service.files().export_media(fileId=doc_id, mimeType='text/plain')
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(fh.getvalue().decode('utf-8'))
    print(f"   ✅ Text: {txt_path.name}")
    
    # 2. Download as HTML zip and extract images only
    request = service.files().export_media(fileId=doc_id, mimeType='application/zip')
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    # Extract only images from the zip
    images_dir = doc_dir / "images"
    images_dir.mkdir(exist_ok=True)
    
    image_count = 0
    fh.seek(0)
    with zipfile.ZipFile(fh, 'r') as zf:
        for name in zf.namelist():
            if name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')):
                img_name = Path(name).name
                img_data = zf.read(name)
                img_path = images_dir / img_name
                with open(img_path, 'wb') as f:
                    f.write(img_data)
                image_count += 1
    
    if image_count > 0:
        print(f"   ✅ Images: {image_count} files in {images_dir.name}/")
    else:
        images_dir.rmdir()
        print(f"   ℹ️ No images found")
    
    return doc_dir, image_count

def main():
    print("=" * 60)
    print("📥 Google Drive - Download Today's Docs (Refresh)")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    about = service.about().get(fields="user").execute()
    print(f"✅ Connected as: {about['user'].get('emailAddress')}")
    
    docs = get_todays_docs(service)
    
    # Filter out generic docs like "Letter", "Report", etc.
    skip_names = {'Letter', 'Report', 'Untitled document'}
    docs = [d for d in docs if d['name'] not in skip_names]
    
    if not docs:
        print("\n❌ No relevant documents created today")
        return
    
    # Check which are already downloaded
    already_downloaded = get_already_downloaded(OUTPUT_DIR)
    
    print(f"\n📋 Found {len(docs)} relevant docs created today:")
    for i, doc in enumerate(docs, 1):
        created = doc.get('createdTime', '')[:16].replace('T', ' ')
        safe_name = sanitize_filename(doc['name'])
        status = "✓ downloaded" if safe_name in already_downloaded else "NEW"
        print(f"   {i}. [{status}] {doc['name'][:50]}")
        print(f"      Created: {created}")
    
    # Download only new ones
    new_docs = [d for d in docs if sanitize_filename(d['name']) not in already_downloaded]
    
    if not new_docs:
        print("\n✅ All relevant documents already downloaded!")
        return
    
    print(f"\n📥 Downloading {len(new_docs)} new documents...")
    print("-" * 60)
    
    total_images = 0
    for doc in new_docs:
        print(f"\n📄 {doc['name'][:50]}...")
        doc_dir, img_count = download_doc(service, doc['id'], doc['name'], OUTPUT_DIR)
        total_images += img_count
    
    print("\n" + "=" * 60)
    print(f"✅ Complete!")
    print(f"   New documents: {len(new_docs)}")
    print(f"   Total images: {total_images}")
    print(f"   Location: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == '__main__':
    main()
