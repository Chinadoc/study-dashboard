#!/usr/bin/env python3
"""
Fetch Google Docs as HTML (preserves images and formatting!)
Exports locksmith intelligence documents with full fidelity.

Usage: python3 scripts/fetch_html_docs.py [search_query]
       python3 scripts/fetch_html_docs.py "Tacoma"
       python3 scripts/fetch_html_docs.py --all  # Fetch all locksmith docs
"""

import json
import requests
import os
import sys
from pathlib import Path

# Credentials file location
CREDS_FILE = "gdrive_token.json"
OUTPUT_DIR = Path("gdrive_exports/html")

def refresh_token(creds):
    """Refresh the access token using the refresh token."""
    response = requests.post(
        creds["token_uri"],
        data={
            "client_id": creds["client_id"],
            "client_secret": creds["client_secret"],
            "refresh_token": creds["refresh_token"],
            "grant_type": "refresh_token"
        }
    )
    if response.status_code == 200:
        new_token = response.json()
        creds["token"] = new_token["access_token"]
        with open(CREDS_FILE, "w") as f:
            json.dump(creds, f)
        print(f"✅ Token refreshed successfully")
        return creds["token"]
    else:
        print(f"❌ Failed to refresh token: {response.text}")
        return None

def search_drive(token, query, page_size=100):
    """Search Google Drive for files matching query."""
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "q": f"name contains '{query}' and mimeType = 'application/vnd.google-apps.document'",
        "fields": "files(id, name, mimeType, modifiedTime)",
        "pageSize": page_size,
        "orderBy": "modifiedTime desc"
    }
    response = requests.get(
        "https://www.googleapis.com/drive/v3/files",
        headers=headers,
        params=params
    )
    if response.status_code == 200:
        return response.json().get("files", [])
    else:
        print(f"❌ Search failed: {response.text}")
        return []

def list_all_docs(token, page_size=100):
    """List all Google Docs in the drive, handling pagination."""
    headers = {"Authorization": f"Bearer {token}"}
    files = []
    page_token = None
    
    while True:
        params = {
            "q": "mimeType = 'application/vnd.google-apps.document' and trashed = false",
            "fields": "nextPageToken, files(id, name, mimeType, modifiedTime)",
            "pageSize": page_size,
            "orderBy": "modifiedTime desc"
        }
        if page_token:
            params["pageToken"] = page_token
            
        response = requests.get(
            "https://www.googleapis.com/drive/v3/files",
            headers=headers,
            params=params
        )
        
        if response.status_code == 200:
            result = response.json()
            new_files = result.get("files", [])
            files.extend(new_files)
            print(f"   Found {len(new_files)} files (Total so far: {len(files)})")
            
            page_token = result.get("nextPageToken")
            if not page_token:
                break
        else:
            print(f"❌ List failed: {response.text}")
            break
            
    return files

def get_google_doc_html(token, file_id):
    """
    Export a Google Doc as HTML.
    
    THIS IS THE KEY CHANGE: text/html preserves:
    - All formatting (bold, italic, headers, tables)
    - Images (embedded as data URIs or Google CDN links)
    - Colors and styling
    """
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"https://www.googleapis.com/drive/v3/files/{file_id}/export",
        headers=headers,
        params={"mimeType": "text/html"}  # ← THIS PRESERVES IMAGES!
    )
    if response.status_code == 200:
        return response.text
    else:
        print(f"❌ Failed to export: {response.text}")
        return None

def sanitize_filename(name):
    """Create a safe filename from document name."""
    return name.replace(' ', '_').replace('/', '_').replace(':', '_').replace('?', '')

def main():
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Parse args
    if len(sys.argv) > 1:
        if sys.argv[1] == "--all":
            query = None  # List all
        else:
            query = sys.argv[1]
    else:
        query = "Locksmith"  # Default search
    
    # Load credentials
    if not os.path.exists(CREDS_FILE):
        print(f"❌ Credentials file not found: {CREDS_FILE}")
        print("   Run gdrive_reauth.py first to authenticate")
        return
    
    with open(CREDS_FILE) as f:
        creds = json.load(f)
    
    # Refresh token
    token = refresh_token(creds)
    if not token:
        print("❌ Cannot proceed without valid token")
        return
    
    # Search or list
    if query:
        print(f"\n🔍 Searching for: {query}")
        files = search_drive(token, query)
    else:
        print(f"\n📁 Listing all Google Docs...")
        files = list_all_docs(token)
    
    if not files:
        print("No files found")
        return
    
    print(f"\n📄 Found {len(files)} documents:")
    for i, f in enumerate(files[:20]):  # Show first 20
        print(f"  {i+1}. {f['name']}")
    if len(files) > 20:
        print(f"  ... and {len(files) - 20} more")
    
    # Download as HTML
    print(f"\n⬇️ Downloading as HTML...")
    success = 0
    errors = 0
    
    for f in files:
        try:
            html = get_google_doc_html(token, f['id'])
            if html:
                safe_name = sanitize_filename(f['name']) + '.html'
                output_path = OUTPUT_DIR / safe_name
                
                # Write HTML file
                with open(output_path, "w", encoding="utf-8") as out:
                    out.write(html)
                
                # Check if it has images
                has_images = 'img' in html.lower() or 'data:image' in html
                img_indicator = "🖼️" if has_images else ""
                
                print(f"  ✅ {f['name'][:50]:50} {img_indicator}")
                success += 1
            else:
                errors += 1
        except Exception as e:
            print(f"  ❌ {f['name']}: {e}")
            errors += 1
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Downloaded: {success}")
    print(f"   ❌ Errors: {errors}")
    print(f"   📁 Output: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
