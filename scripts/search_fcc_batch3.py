#!/usr/bin/env python3
"""
Search Google Drive for third FCC research document with various terms.
"""
import os
import sys
import json
import io
from pathlib import Path

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
OUTPUT_DIR = PROJECT_ROOT / "data" / "fcc_research_docs"

# Search terms for the third document
SEARCH_TERMS = [
    "Twelve",
    "Twelve Select",
    "Interoperability",
    "Remote Entry Systems",
    "Cryptographic Architecture",
    "Batch 3",
    "TQ8",
    "LHJ009",
    "IT7RK",
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

def download_as_text(service, doc_id, doc_name, output_dir):
    """Download doc as plain text."""
    safe_name = doc_name.replace(' ', '_').replace('/', '_')[:60]
    output_file = output_dir / f"{safe_name}_{doc_id[:8]}.txt"
    
    request = service.files().export_media(fileId=doc_id, mimeType='text/plain')
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    content = fh.getvalue().decode('utf-8')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    return output_file, len(content)

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print("Searching for third FCC research document...")
    
    all_docs = {}
    for term in SEARCH_TERMS:
        print(f"  Searching: '{term}'")
        try:
            response = service.files().list(
                q=f"name contains '{term}' and mimeType='application/vnd.google-apps.document'",
                spaces='drive',
                fields='files(id, name, modifiedTime)',
                pageSize=20
            ).execute()
            
            for doc in response.get('files', []):
                if doc['id'] not in all_docs:
                    all_docs[doc['id']] = doc
                    print(f"    Found: {doc['name'][:70]}")
        except Exception as e:
            print(f"    Error: {e}")
    
    # Also search full text for the specific FCC IDs we need
    print("\n  Searching full text for TQ8-FOB...")
    try:
        response = service.files().list(
            q="fullText contains 'TQ8-FOB' and mimeType='application/vnd.google-apps.document'",
            spaces='drive',
            fields='files(id, name)',
            pageSize=10
        ).execute()
        for doc in response.get('files', []):
            if doc['id'] not in all_docs:
                all_docs[doc['id']] = doc
                print(f"    Found (fulltext): {doc['name'][:70]}")
    except Exception as e:
        print(f"    Error: {e}")
    
    print(f"\n=== Found {len(all_docs)} docs ===")
    
    # Download any new ones
    for doc_id, doc in all_docs.items():
        name = doc['name']
        if 'FCC' in name or 'Batch' in name or 'Twelve' in name or 'Remote Entry' in name:
            print(f"\nDownloading: {name}")
            output_file, size = download_as_text(service, doc_id, name, OUTPUT_DIR)
            print(f"  Saved: {output_file.name} ({size:,} bytes)")
            
            # Preview first 300 chars
            with open(output_file, 'r') as f:
                preview = f.read(300).replace('\n', ' ')
            print(f"  Preview: {preview[:200]}...")

if __name__ == "__main__":
    main()
