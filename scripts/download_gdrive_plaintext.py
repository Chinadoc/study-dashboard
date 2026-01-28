#!/usr/bin/env python3
"""
Download all locksmith-related Google Docs as plain text for easy parsing.
Exports documents in a format suitable for extracting tool coverage data.

Output formats available:
- text/plain: Plain text (easiest to parse)
- application/pdf: PDF
- application/zip: HTML with images (already handled by gdrive_download_html_zips.py)
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Google API dependencies
try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    import io
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", 
                    "google-auth", "google-auth-oauthlib", "google-api-python-client"], check=True)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    import io

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
TOKEN_FILE = PROJECT_ROOT / "gdrive_token.json"
OUTPUT_DIR = PROJECT_ROOT / "data" / "gdrive_plaintext"

# Locksmith-related search terms
LOCKSMITH_KEYWORDS = [
    "Locksmith",
    "Key Programming", 
    "Immobilizer",
    "AKL",
    "PATS",
    "Pearl",
    "Dossier",
    "Security",
    "FCC ID",
    "Transponder",
    "Smart Key",
    "Remote Head",
    "EEPROM",
    "OBD",
    "Pin Code",
    "SGW",
    "Tool Coverage"
]

def get_credentials():
    """Load credentials from token file."""
    if not TOKEN_FILE.exists():
        print(f"❌ Token file not found: {TOKEN_FILE}")
        print("   Run: python3 scripts/gdrive_reauth.py")
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
    
    # Refresh if expired
    if creds.expired and creds.refresh_token:
        print("🔄 Refreshing expired token...")
        creds.refresh(Request())
        # Save refreshed token
        token_data['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(token_data, f, indent=2)
        print("✅ Token refreshed")
    
    return creds

def get_existing_exports():
    """Get set of already downloaded document IDs."""
    manifest_path = OUTPUT_DIR / "download_manifest.json"
    if manifest_path.exists():
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        return set(manifest.get('downloaded_ids', []))
    return set()

def save_manifest(downloaded_docs):
    """Save manifest of downloaded documents."""
    manifest_path = OUTPUT_DIR / "download_manifest.json"
    manifest = {
        "last_updated": datetime.now().isoformat(),
        "total_documents": len(downloaded_docs),
        "downloaded_ids": list(downloaded_docs.keys()),
        "documents": downloaded_docs
    }
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    print(f"   📋 Saved manifest: {manifest_path.name}")

def search_locksmith_docs(service):
    """Search for locksmith-related documents in Google Drive."""
    all_docs = {}
    
    for keyword in LOCKSMITH_KEYWORDS:
        print(f"  🔎 Searching: \"{keyword}\"...")
        try:
            # Search for Google Docs containing the term
            search_query = f"name contains '{keyword}' and mimeType='application/vnd.google-apps.document'"
            
            response = service.files().list(
                q=search_query,
                spaces='drive',
                fields='files(id, name, mimeType, modifiedTime, createdTime)',
                pageSize=100
            ).execute()
            
            found = response.get('files', [])
            for doc in found:
                if doc['id'] not in all_docs:
                    all_docs[doc['id']] = {
                        'name': doc['name'],
                        'id': doc['id'],
                        'modified': doc.get('modifiedTime', ''),
                        'created': doc.get('createdTime', ''),
                        'matched_keyword': keyword
                    }
            
            if found:
                print(f"     Found {len(found)} documents")
                
        except Exception as e:
            print(f"     ⚠️ Error: {e}")
    
    return all_docs

def sanitize_filename(name):
    """Convert document name to safe filename."""
    # Replace problematic characters
    safe = name.replace(' ', '_').replace('/', '_').replace(':', '_')
    safe = safe.replace('(', '').replace(')', '').replace(',', '')
    safe = safe.replace('&', 'and').replace("'", '')
    # Remove any remaining problematic chars
    safe = "".join(c for c in safe if c.isalnum() or c in "_-.")
    # Limit length
    if len(safe) > 100:
        safe = safe[:100]
    return safe

def download_as_text(service, doc_id, doc_name, output_dir):
    """Download a Google Doc as plain text."""
    safe_name = sanitize_filename(doc_name)
    txt_path = output_dir / f"{safe_name}.txt"
    
    try:
        # Export as plain text
        request = service.files().export_media(
            fileId=doc_id,
            mimeType='text/plain'
        )
        
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
        
        # Decode and save
        content = fh.getvalue().decode('utf-8')
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        file_size = txt_path.stat().st_size
        return True, txt_path.name, file_size
        
    except Exception as e:
        return False, str(e), 0

def main():
    print("=" * 70)
    print("📝 Google Drive Locksmith Docs → Plain Text Downloader")
    print("=" * 70)
    print(f"\nOutput folder: {OUTPUT_DIR}")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Connect to Google Drive
    print("\n🔐 Connecting to Google Drive...")
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    # Get user info
    about = service.about().get(fields="user").execute()
    print(f"   ✅ Connected as: {about['user'].get('emailAddress', 'Unknown')}")
    
    # Check existing downloads
    existing_ids = get_existing_exports()
    if existing_ids:
        print(f"\n📁 Found {len(existing_ids)} previously downloaded documents")
    
    # Search for locksmith documents
    print("\n🔍 Searching for locksmith-related documents...")
    all_docs = search_locksmith_docs(service)
    print(f"\n📊 Found {len(all_docs)} unique locksmith-related documents")
    
    # Filter out already downloaded
    to_download = {k: v for k, v in all_docs.items() if k not in existing_ids}
    
    if not to_download:
        print("\n✅ All documents already downloaded!")
        print(f"   Location: {OUTPUT_DIR}")
        return
    
    print(f"\n📋 {len(to_download)} new documents to download:")
    for i, (doc_id, doc) in enumerate(list(to_download.items())[:15], 1):
        print(f"   {i:2}. {doc['name'][:60]}...")
    if len(to_download) > 15:
        print(f"   ... and {len(to_download) - 15} more")
    
    # Ask for confirmation
    response = input(f"\n⚡ Download {len(to_download)} documents as plain text? [y/N]: ")
    if response.lower() != 'y':
        print("Cancelled.")
        return
    
    # Download documents
    print("\n" + "=" * 70)
    print("📥 Downloading documents as plain text...")
    print("=" * 70)
    
    downloaded_docs = {}
    success = 0
    failed = 0
    
    for i, (doc_id, doc) in enumerate(to_download.items(), 1):
        print(f"\n[{i}/{len(to_download)}] {doc['name'][:50]}...")
        ok, result, size = download_as_text(service, doc_id, doc['name'], OUTPUT_DIR)
        
        if ok:
            print(f"   ✅ Saved: {result} ({size:,} bytes)")
            downloaded_docs[doc_id] = {
                **doc,
                'filename': result,
                'size_bytes': size,
                'downloaded_at': datetime.now().isoformat()
            }
            success += 1
        else:
            print(f"   ❌ Failed: {result}")
            failed += 1
    
    # Merge with existing manifest
    if existing_ids:
        manifest_path = OUTPUT_DIR / "download_manifest.json"
        with open(manifest_path, 'r') as f:
            old_manifest = json.load(f)
        for doc in old_manifest.get('documents', {}).values():
            if doc.get('id') not in downloaded_docs:
                downloaded_docs[doc['id']] = doc
    
    # Save manifest
    save_manifest(downloaded_docs)
    
    print("\n" + "=" * 70)
    print(f"✅ Complete!")
    print(f"   Downloaded: {success}")
    print(f"   Failed: {failed}")
    print(f"   Location: {OUTPUT_DIR}")
    print("=" * 70)

if __name__ == '__main__':
    main()
