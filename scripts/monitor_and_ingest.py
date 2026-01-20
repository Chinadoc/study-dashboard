#!/usr/bin/env python3
"""
Monitor Google Drive for new Pearl Protocol documents and ingest them.
Fetches new docs every 5 minutes, processes them, and generates SQL migrations.
"""

import json
import requests
import os
import time
import subprocess
import sys
from datetime import datetime, timedelta

# Configuration
CREDS_FILE = "gdrive_token.json"
EXPORT_DIR = "gdrive_exports"
PROCESSED_LOG = "gdrive_exports/.processed_files.json"
POLL_INTERVAL = 300  # 5 minutes

def load_processed_files():
    """Load list of already processed file IDs."""
    if os.path.exists(PROCESSED_LOG):
        with open(PROCESSED_LOG) as f:
            return json.load(f)
    return {"processed": []}

def save_processed_files(data):
    """Save list of processed file IDs."""
    with open(PROCESSED_LOG, "w") as f:
        json.dump(data, f, indent=2)

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
        print(f"✅ Token refreshed")
        return creds["token"]
    else:
        print(f"❌ Token refresh failed: {response.text}")
        return None

def search_pearl_docs(token):
    """Search for Pearl Protocol documents in Google Drive."""
    headers = {"Authorization": f"Bearer {token}"}
    # Search for docs with 'pearl' in name, sorted by modified time
    params = {
        "q": "name contains 'pearl' and mimeType = 'application/vnd.google-apps.document'",
        "fields": "files(id, name, modifiedTime, createdTime)",
        "orderBy": "modifiedTime desc",
        "pageSize": 50
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

def get_google_doc_content(token, file_id):
    """Export a Google Doc as plain text (Markdown)."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"https://www.googleapis.com/drive/v3/files/{file_id}/export",
        headers=headers,
        params={"mimeType": "text/plain"}
    )
    if response.status_code == 200:
        return response.text
    else:
        print(f"❌ Failed to export doc: {response.text}")
        return None

def process_document(file_path):
    """Run the Pearl ingestion script on a document."""
    result = subprocess.run(
        ["python3", "scripts/ingest_pearls.py", file_path],
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"⚠️ Ingestion error: {result.stderr}")
    return result.returncode == 0

def execute_migration(sql_file):
    """Execute the generated SQL migration against D1."""
    result = subprocess.run(
        ["npx", "wrangler", "d1", "execute", "locksmith-db", "--remote", f"--file={sql_file}"],
        capture_output=True,
        text=True,
        cwd="api"
    )
    if result.returncode == 0:
        print(f"✅ Migration executed: {sql_file}")
        return True
    else:
        print(f"⚠️ Migration failed: {result.stderr}")
        return False

def run_poll_cycle(token, processed_data):
    """Run a single poll cycle to fetch and process new documents."""
    print(f"\n🔍 [{datetime.now().strftime('%H:%M:%S')}] Scanning for new Pearl documents...")
    
    files = search_pearl_docs(token)
    if not files:
        print("   No Pearl documents found")
        return 0
    
    new_count = 0
    for file in files:
        file_id = file['id']
        
        # Skip if already processed
        if file_id in processed_data['processed']:
            continue
        
        print(f"\n📄 New document: {file['name']}")
        
        # Download content
        content = get_google_doc_content(token, file_id)
        if not content:
            continue
        
        # Save to exports directory
        safe_name = file['name'].replace(' ', '_').replace('/', '_')
        if not safe_name.endswith('.md'):
            safe_name += '.md'
        
        export_path = f"{EXPORT_DIR}/{safe_name}"
        with open(export_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"   💾 Saved: {export_path}")
        
        # Process with ingestion script
        if process_document(export_path):
            # Execute migration
            base_name = safe_name.replace('.md', '_pearl.md') if '_pearl' not in safe_name else safe_name
            sql_file = f"../data/migrations/import_pearls_{safe_name}.sql"
            if os.path.exists(f"data/migrations/import_pearls_{safe_name}.sql"):
                execute_migration(sql_file)
        
        # Mark as processed
        processed_data['processed'].append(file_id)
        save_processed_files(processed_data)
        new_count += 1
    
    if new_count == 0:
        print("   No new documents to process")
    else:
        print(f"\n✅ Processed {new_count} new document(s)")
    
    return new_count

def main():
    print("🚀 Pearl Protocol Monitor Started")
    print(f"   Polling every {POLL_INTERVAL // 60} minutes")
    print("   Press Ctrl+C to stop\n")
    
    # Load credentials
    with open(CREDS_FILE) as f:
        creds = json.load(f)
    
    # Initial token refresh
    token = refresh_token(creds)
    if not token:
        print("❌ Cannot start without valid token")
        return
    
    # Load processed files log
    processed_data = load_processed_files()
    total_processed = 0
    
    try:
        while True:
            # Refresh token every cycle to ensure it's valid
            with open(CREDS_FILE) as f:
                creds = json.load(f)
            token = creds.get("token")
            
            # Run poll cycle
            count = run_poll_cycle(token, processed_data)
            total_processed += count
            
            print(f"\n⏳ Next poll in {POLL_INTERVAL // 60} minutes... (Total processed: {total_processed})")
            time.sleep(POLL_INTERVAL)
            
    except KeyboardInterrupt:
        print(f"\n\n🛑 Monitor stopped. Total documents processed: {total_processed}")

if __name__ == "__main__":
    main()
