#!/usr/bin/env python3
"""
Search Google Drive for specific FCC research documents by name.
"""
import os
import sys
import json
from pathlib import Path

try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
except ImportError:
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", 
                    "google-auth", "google-auth-oauthlib", "google-api-python-client"], check=True)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

PROJECT_ROOT = Path(__file__).parent.parent
TOKEN_FILE = PROJECT_ROOT / "gdrive_token.json"

SEARCH_TERMS = [
    "Exhaustive Technical Analysis",
    "Batch 2 Automotive RF",
    "Comprehensive Forensic Audit",
    "Twelve Select Identifiers",
    "Interoperability of Twelve"
]

def get_credentials():
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
        creds.refresh(Request())
        token_data['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(token_data, f, indent=2)
    
    return creds

def main():
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    all_docs = {}
    for term in SEARCH_TERMS:
        print(f"Searching for: {term}")
        response = service.files().list(
            q=f"name contains '{term}' and mimeType='application/vnd.google-apps.document'",
            spaces='drive',
            fields='files(id, name, modifiedTime)',
            pageSize=20
        ).execute()
        
        for doc in response.get('files', []):
            if doc['id'] not in all_docs:
                all_docs[doc['id']] = doc
                print(f"  Found: {doc['name'][:80]}")
    
    print(f"\n=== Total unique docs found: {len(all_docs)} ===")
    for doc in all_docs.values():
        print(f"ID: {doc['id']}")
        print(f"Name: {doc['name']}")
        print()

if __name__ == "__main__":
    main()
