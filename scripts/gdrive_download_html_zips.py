#!/usr/bin/env python3
"""
Download Google Docs as zipped HTML to preserve images.
Identifies which locksmith documents don't have HTML+images exports yet
and downloads them from Google Drive.
"""

import os
import sys
import json
import zipfile
from pathlib import Path

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
OUTPUT_DIR = PROJECT_ROOT / "gdrive_exports"

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
    """Get list of documents that already have HTML folder exports."""
    existing = set()
    
    # Check for directories (extracted zips with images)
    for item in OUTPUT_DIR.iterdir():
        if item.is_dir() and item.name not in ['html', 'images', '.DS_Store']:
            existing.add(item.name)
    
    # Check for zip files
    for item in OUTPUT_DIR.glob("*.zip"):
        existing.add(item.stem)
    
    return existing

def search_locksmith_docs(service):
    """Search for locksmith-related documents in Google Drive."""
    # Search terms for locksmith documents
    queries = [
        "Locksmith",
        "Key Programming", 
        "Immobilizer",
        "AKL",
        "PATS",
        "Pearl",
        "Dossier",
        "Security",
        "FCC ID"
    ]
    
    all_docs = {}
    
    for query in queries:
        print(f"  Searching for: {query}...")
        try:
            # Search for Google Docs containing the term
            search_query = f"name contains '{query}' and mimeType='application/vnd.google-apps.document'"
            
            response = service.files().list(
                q=search_query,
                spaces='drive',
                fields='files(id, name, mimeType, modifiedTime)',
                pageSize=100
            ).execute()
            
            for doc in response.get('files', []):
                # Normalize name for comparison
                normalized_name = doc['name'].replace(' ', '_').replace('-', '_').replace('/', '_')
                all_docs[doc['id']] = {
                    'name': doc['name'],
                    'normalized': normalized_name,
                    'id': doc['id'],
                    'modified': doc.get('modifiedTime', '')
                }
        except Exception as e:
            print(f"    Error: {e}")
    
    return all_docs

def download_as_zipped_html(service, doc_id, doc_name, output_dir):
    """Download a Google Doc as zipped HTML (preserves images)."""
    safe_name = doc_name.replace(' ', '_').replace('/', '_').replace(':', '_')
    zip_path = output_dir / f"{safe_name}.zip"
    folder_path = output_dir / safe_name
    
    print(f"  📥 Downloading: {doc_name}")
    
    try:
        # Export as zipped HTML
        request = service.files().export_media(
            fileId=doc_id,
            mimeType='application/zip'  # This gives HTML with images
        )
        
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
            if status:
                print(f"     Progress: {int(status.progress() * 100)}%")
        
        # Save zip file
        with open(zip_path, 'wb') as f:
            f.write(fh.getvalue())
        print(f"     ✅ Saved: {zip_path.name}")
        
        # Extract the zip
        folder_path.mkdir(exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(folder_path)
        print(f"     📂 Extracted to: {folder_path.name}/")
        
        return True
        
    except Exception as e:
        print(f"     ❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("📦 Google Drive HTML+Images Downloader")
    print("=" * 60)
    
    # Get existing exports
    print("\n🔍 Checking existing exports...")
    existing = get_existing_exports()
    print(f"   Found {len(existing)} existing HTML exports with images")
    for name in sorted(existing):
        print(f"     - {name}")
    
    # Connect to Google Drive
    print("\n🔐 Connecting to Google Drive...")
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    # Get user info
    about = service.about().get(fields="user").execute()
    print(f"   Connected as: {about['user'].get('emailAddress', 'Unknown')}")
    
    # Search for locksmith documents
    print("\n🔎 Searching for locksmith documents...")
    all_docs = search_locksmith_docs(service)
    print(f"\n   Found {len(all_docs)} locksmith-related documents in Drive")
    
    # Find documents that need downloading
    to_download = []
    for doc_id, doc_info in all_docs.items():
        if doc_info['normalized'] not in existing:
            to_download.append(doc_info)
    
    if not to_download:
        print("\n✅ All documents already have HTML exports!")
        return
    
    print(f"\n📋 {len(to_download)} documents need HTML+images export:")
    for doc in to_download[:20]:  # Show first 20
        print(f"   - {doc['name']}")
    if len(to_download) > 20:
        print(f"   ... and {len(to_download) - 20} more")
    
    # Ask for confirmation
    response = input(f"\n⚡ Download {len(to_download)} documents? [y/N]: ")
    if response.lower() != 'y':
        print("Cancelled.")
        return
    
    # Download documents
    print("\n" + "=" * 60)
    print("📥 Downloading documents as HTML+images...")
    print("=" * 60)
    
    success = 0
    failed = 0
    
    for i, doc in enumerate(to_download, 1):
        print(f"\n[{i}/{len(to_download)}]")
        if download_as_zipped_html(service, doc['id'], doc['name'], OUTPUT_DIR):
            success += 1
        else:
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Complete! Downloaded {success} documents, {failed} failed")
    print("=" * 60)

if __name__ == '__main__':
    main()
