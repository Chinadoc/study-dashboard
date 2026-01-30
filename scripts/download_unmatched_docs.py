#!/usr/bin/env python3
"""
Download specific unmatched documents from GDrive.
These are the 6 unique documents that don't exist locally yet.
"""

import json
import sys
import zipfile
from pathlib import Path

# Google API 
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

PROJECT_ROOT = Path(__file__).parent.parent
TOKEN_FILE = PROJECT_ROOT / "gdrive_token.json"
OUTPUT_DIR = PROJECT_ROOT / "gdrive_exports"
PLAINTEXT_DIR = PROJECT_ROOT / "data" / "gdrive_plaintext"

# The 6 unique unmatched documents (deduped by taking most recent)
DOCS_TO_DOWNLOAD = [
    {"id": "17QZYetio7tfOGZFzLfiG-f-CeMD1m08XwAlsnSoLqfk", "name": "Audi A4 Key Programming Research"},
    {"id": "1M_zuisbfTp7k0_BSiXLQJptHTaXJhGb4aWODAxbDB-c", "name": "BMW Key Programming Research Gaps"},
    {"id": "12CEQlkd34rnn02BLLQHFkqUVprdxSkMJeN9GhcxQsBw", "name": "Automotive Key Programming Data Generation"},
    {"id": "1ACX8EbxKaJQugDyKla4JGo542OIp8itetJEQ0zblT78", "name": "Mercedes W213 Key Programming Research"},
    {"id": "1-MoUZtF7L0p-7es9BTiEQtGfKI80ugIogMMOMwZxo7Q", "name": "VW Tiguan Key Programming Research"},
    {"id": "1Q6AcGUO3rzBqMPECF5QegIgjz6PMrIe8BPwWbi76ZCA", "name": "FCC ID Vehicle Compatibility Research"},
    {"id": "1UlWY0hUvqvtELj4ST2cenyKpQql80S1AkM6HaNG2qEw", "name": "VW Jetta Passat FCC ID Mapping"},
]


def get_credentials():
    """Load credentials from token file."""
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


def sanitize_name(name):
    """Convert to safe filename."""
    return name.replace(' ', '_').replace('/', '_').replace(':', '_')


def download_doc(service, doc_id, doc_name):
    """Download as plaintext + zipped HTML (for images)."""
    safe_name = sanitize_name(doc_name)
    
    print(f"\n📥 Downloading: {doc_name}")
    
    # 1. Download as plaintext
    txt_path = PLAINTEXT_DIR / f"{safe_name}.txt"
    try:
        request = service.files().export_media(fileId=doc_id, mimeType='text/plain')
        content = request.execute()
        with open(txt_path, 'wb') as f:
            f.write(content)
        print(f"   ✅ Saved plaintext: {txt_path.name}")
    except Exception as e:
        print(f"   ❌ Plaintext error: {e}")
    
    # 2. Download as zipped HTML (for images)
    zip_path = OUTPUT_DIR / f"{safe_name}.zip"
    folder_path = OUTPUT_DIR / safe_name
    
    try:
        request = service.files().export_media(fileId=doc_id, mimeType='application/zip')
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
        
        with open(zip_path, 'wb') as f:
            f.write(fh.getvalue())
        
        # Extract
        folder_path.mkdir(exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(folder_path)
        
        # Check for images
        images_dir = folder_path / "images"
        if images_dir.exists():
            image_count = len(list(images_dir.glob("*")))
            print(f"   📸 Extracted {image_count} images")
        else:
            print(f"   📄 No images in document")
        
        # Remove zip after extraction
        zip_path.unlink()
        print(f"   ✅ Saved to: {folder_path.name}/")
        
    except Exception as e:
        print(f"   ❌ HTML error: {e}")


def main():
    print("=" * 60)
    print("📥 Downloading Unmatched GDrive Documents")
    print("=" * 60)
    
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print(f"\n📋 {len(DOCS_TO_DOWNLOAD)} documents to download:")
    for doc in DOCS_TO_DOWNLOAD:
        print(f"   - {doc['name']}")
    
    for doc in DOCS_TO_DOWNLOAD:
        download_doc(service, doc['id'], doc['name'])
    
    print("\n" + "=" * 60)
    print("✅ Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
