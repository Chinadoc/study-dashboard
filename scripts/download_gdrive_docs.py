#!/usr/bin/env python3
"""
Download recent Gemini research documents from Google Drive.
Uses existing OAuth credentials from ~/.gemini/oauth_creds.json
"""

import os
import json
import requests
from datetime import datetime, timedelta

# Paths
CREDS_PATH = os.path.expanduser("~/.gemini/oauth_creds.json")
EXPORT_DIR = os.path.expanduser("~/Documents/study-dashboard/gdrive_exports")

def refresh_token_if_needed():
    """Refresh the access token if expired."""
    with open(CREDS_PATH, 'r') as f:
        creds = json.load(f)
    
    # Check if token is expired
    expiry = creds.get('expiry_date', 0)
    if datetime.now().timestamp() * 1000 > expiry - 60000:  # 1 min buffer
        print("🔄 Token expired, refreshing...")
        # Token refresh would need client credentials - for now just warn
        print("⚠️  Token may need manual refresh. Please re-authenticate if needed.")
    
    return creds['access_token']

def list_recent_docs(access_token, hours_back=24):
    """List documents created/modified in the last N hours."""
    # Calculate time threshold
    threshold = datetime.now() - timedelta(hours=hours_back)
    threshold_str = threshold.strftime("%Y-%m-%dT%H:%M:%S")
    
    # Search for recent Google Docs
    query = f"mimeType='application/vnd.google-apps.document' and modifiedTime > '{threshold_str}'"
    
    url = "https://www.googleapis.com/drive/v3/files"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "q": query,
        "fields": "files(id, name, modifiedTime, createdTime)",
        "orderBy": "modifiedTime desc",
        "pageSize": 50
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ Error listing files: {response.status_code}")
        print(response.text)
        return []
    
    return response.json().get('files', [])

def download_doc_as_text(access_token, file_id, filename):
    """Download a Google Doc as plain text."""
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"mimeType": "text/plain"}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"❌ Error downloading {filename}: {response.status_code}")
        return None
    
    return response.text

def sanitize_filename(name):
    """Convert document name to safe filename."""
    # Replace spaces and special chars
    safe = name.replace(" ", "_").replace("/", "-").replace(":", "-")
    # Remove any remaining problematic chars
    safe = "".join(c for c in safe if c.isalnum() or c in "_-.")
    return safe

def main():
    print("🔍 Downloading recent Gemini research documents from Google Drive...")
    
    # Ensure export directory exists
    os.makedirs(EXPORT_DIR, exist_ok=True)
    
    # Get access token
    access_token = refresh_token_if_needed()
    
    # List recent documents (last 48 hours)
    docs = list_recent_docs(access_token, hours_back=48)
    
    if not docs:
        print("📭 No recent documents found.")
        return
    
    print(f"📄 Found {len(docs)} recent documents:")
    
    downloaded = []
    skipped = []
    
    for doc in docs:
        name = doc['name']
        file_id = doc['id']
        modified = doc.get('modifiedTime', 'unknown')
        
        # Filter for locksmith/research documents
        keywords = ['locksmith', 'research', 'ford', 'toyota', 'chevrolet', 'gmc', 
                   'honda', 'nissan', 'explorer', 'escape', 'bronco', 'f-150', 'f150',
                   'maverick', 'mach-e', 'expedition', 'tundra', 'sequoia', 'rav4',
                   'highlander', 'camry', 'silverado', 'equinox', 'blazer', 'traverse',
                   'colorado', 'sierra', 'programming', 'pearl', 'security']
        
        name_lower = name.lower()
        if not any(kw in name_lower for kw in keywords):
            print(f"  ⏭️  Skipped: {name} (not a research doc)")
            skipped.append(name)
            continue
        
        # Generate safe filename
        safe_name = sanitize_filename(name)
        if not safe_name.endswith('.md'):
            safe_name += '_pearl.md'
        
        output_path = os.path.join(EXPORT_DIR, safe_name)
        
        # Check if already downloaded
        if os.path.exists(output_path):
            print(f"  ⏭️  Already exists: {safe_name}")
            skipped.append(name)
            continue
        
        # Download
        print(f"  📥 Downloading: {name}...")
        content = download_doc_as_text(access_token, file_id, name)
        
        if content:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Saved: {safe_name}")
            downloaded.append(safe_name)
        else:
            print(f"  ❌ Failed to download: {name}")
    
    print(f"\n📊 Summary:")
    print(f"  Downloaded: {len(downloaded)}")
    print(f"  Skipped: {len(skipped)}")
    
    if downloaded:
        print("\n📂 New files:")
        for f in downloaded:
            print(f"  - {f}")

if __name__ == "__main__":
    main()
