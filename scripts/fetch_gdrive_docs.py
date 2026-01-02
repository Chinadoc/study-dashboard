#!/usr/bin/env python3
"""
Fetch 2018 Camaro documents from Google Drive using stored credentials.
Refreshes token if expired, then searches for and downloads the documents.
"""

import json
import requests
import os

# Load credentials
CREDS_FILE = "gdrive_token.json"

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
        # Save updated creds
        with open(CREDS_FILE, "w") as f:
            json.dump(creds, f)
        print(f"✅ Token refreshed successfully")
        return creds["token"]
    else:
        print(f"❌ Failed to refresh token: {response.text}")
        return None

def search_drive(token, query):
    """Search Google Drive for files matching query."""
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "q": f"name contains '{query}'",
        "fields": "files(id, name, mimeType)",
        "pageSize": 10
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
    """Export a Google Doc as plain text."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"https://www.googleapis.com/drive/v3/files/{file_id}/export",
        headers=headers,
        params={"mimeType": "text/plain"}
    )
    if response.status_code == 200:
        return response.text
    else:
        print(f"❌ Failed to get document: {response.text}")
        return None

def main():
    # Load credentials
    with open(CREDS_FILE) as f:
        creds = json.load(f)
    
    # Refresh token (ours is expired)
    token = refresh_token(creds)
    if not token:
        print("Cannot proceed without valid token")
        return
    
    # Search for Camaro documents
    print("\n🔍 Searching for Camaro documents...")
    files = search_drive(token, "2018 Camaro")
    
    if not files:
        print("No files found matching '2018 Camaro'")
        return
    
    print(f"\n📁 Found {len(files)} files:")
    for f in files:
        print(f"  - {f['name']} (ID: {f['id']}, Type: {f['mimeType']})")
    
    # Download each Google Doc
    for f in files:
        if 'google-apps.document' in f['mimeType']:
            print(f"\n📄 Fetching: {f['name']}...")
            content = get_google_doc_content(token, f['id'])
            if content:
                # Save to local file
                safe_name = f['name'].replace(' ', '_').replace('/', '_') + '.txt'
                with open(f"data/doc_notes/{safe_name}", "w") as out:
                    out.write(content)
                print(f"   ✅ Saved to data/doc_notes/{safe_name}")
                print(f"   Preview: {content[:500]}...")

if __name__ == "__main__":
    main()
