#!/usr/bin/env python3
"""
Download missing dossiers from Google Drive.

Uses the missing_dossiers.json list and existing OAuth credentials
to download dossiers that weren't processed for pearls.
"""

import os
import json
import requests
from pathlib import Path

# Paths
CREDS_PATH = Path("gdrive_token.json")
MISSING_FILE = Path("data/pearl_extraction/missing_dossiers.json")
EXPORT_DIR = Path("data/pearl_extraction/downloaded_dossiers")


def get_access_token():
    """Get access token, refreshing if needed."""
    import requests
    
    with open(CREDS_PATH) as f:
        creds = json.load(f)
    
    # Try to refresh the token
    refresh_token = creds.get('refresh_token')
    client_id = creds.get('client_id')
    client_secret = creds.get('client_secret')
    
    if refresh_token and client_id and client_secret:
        print("🔄 Refreshing OAuth token...")
        response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": client_id,
                "client_secret": client_secret
            }
        )
        
        if response.status_code == 200:
            new_tokens = response.json()
            creds['token'] = new_tokens['access_token']
            
            # Save updated token
            with open(CREDS_PATH, 'w') as f:
                json.dump(creds, f, indent=2)
            
            print("✅ Token refreshed!")
            return creds['token']
        else:
            print(f"⚠️ Token refresh failed: {response.status_code}")
            print(f"   {response.text[:200]}")
    
    return creds.get('token') or creds.get('access_token')


def download_doc_as_html(access_token: str, file_id: str, title: str) -> str:
    """Download a Google Doc as HTML."""
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"mimeType": "text/html"}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"  ❌ Error downloading {title}: {response.status_code}")
        print(f"     {response.text[:200]}")
        return None
    
    return response.text


def sanitize_filename(name: str) -> str:
    """Convert document name to safe filename."""
    safe = name.replace(" ", "_").replace("/", "-").replace(":", "-")
    safe = "".join(c for c in safe if c.isalnum() or c in "_-.")
    return safe


def main():
    print("🔍 Downloading missing locksmith dossiers from Google Drive...\n")
    
    # Create export directory
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load missing dossiers list
    with open(MISSING_FILE) as f:
        missing = json.load(f)
    
    print(f"📋 Found {len(missing)} missing dossiers\n")
    
    # Filter out "Copy of" duplicates
    to_download = []
    skipped_copies = []
    skipped_unrelated = []
    
    for d in missing:
        title = d.get('title', '')
        if title.lower().startswith('copy of'):
            skipped_copies.append(title)
        elif not any(kw in title.lower() for kw in ['locksmith', 'key', 'programming', 'research', 'dossier', 'security', 'immobilizer', 'platform', 'ford', 'toyota', 'honda', 'bmw', 'audi', 'mercedes', 'stellantis', 'gm', 'vag', 'nissan', 'hyundai', 'genesis', 'acura', 'subaru', 'mazda', 'volvo', 'tesla', 'dodge', 'cadillac', 'tool', 'techstream', 'fdrs', 'witech', 'yanhua', 'keydiy']):
            skipped_unrelated.append(title)
        else:
            to_download.append(d)
    
    print(f"📥 Will download: {len(to_download)}")
    print(f"⏭️  Skipping 'Copy of': {len(skipped_copies)}")
    print(f"⏭️  Skipping unrelated: {len(skipped_unrelated)}")
    
    if skipped_unrelated:
        print("\n   Unrelated skipped:")
        for t in skipped_unrelated:
            print(f"     - {t}")
    
    # Get access token
    try:
        access_token = get_access_token()
        print(f"\n✅ Got access token")
    except Exception as e:
        print(f"\n❌ Failed to get access token: {e}")
        return
    
    # Download each document
    downloaded = []
    failed = []
    
    print("\n" + "="*50)
    print("DOWNLOADING DOSSIERS")
    print("="*50 + "\n")
    
    for d in to_download:
        title = d.get('title', 'Unknown')
        file_id = d.get('id')
        
        if not file_id:
            print(f"  ⚠️  No ID for: {title}")
            failed.append(title)
            continue
        
        # Generate safe filename
        safe_name = sanitize_filename(title)
        if not safe_name.endswith('.html'):
            safe_name += '.html'
        
        output_path = EXPORT_DIR / safe_name
        
        # Check if already exists
        if output_path.exists():
            print(f"  ⏭️  Already exists: {safe_name}")
            continue
        
        # Download
        print(f"  📥 Downloading: {title[:50]}...")
        content = download_doc_as_html(access_token, file_id, title)
        
        if content:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Saved: {safe_name}")
            downloaded.append(safe_name)
        else:
            failed.append(title)
    
    # Summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"\n✅ Downloaded: {len(downloaded)}")
    print(f"❌ Failed: {len(failed)}")
    print(f"⏭️  Skipped (Copy of): {len(skipped_copies)}")
    print(f"⏭️  Skipped (unrelated): {len(skipped_unrelated)}")
    
    if downloaded:
        print(f"\n📂 New files in {EXPORT_DIR}:")
        for f in downloaded[:10]:
            print(f"  - {f}")
        if len(downloaded) > 10:
            print(f"  ... and {len(downloaded) - 10} more")
    
    if failed:
        print(f"\n❌ Failed downloads:")
        for f in failed:
            print(f"  - {f}")


if __name__ == "__main__":
    main()
