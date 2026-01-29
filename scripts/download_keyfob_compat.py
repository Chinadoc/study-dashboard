#!/usr/bin/env python3
"""
Download Key Fob Compatibility docs that contain TQ8-FOB.
"""
import json
import io
from pathlib import Path

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

PROJECT_ROOT = Path(__file__).parent.parent
TOKEN_FILE = PROJECT_ROOT / "gdrive_token.json"
OUTPUT_DIR = PROJECT_ROOT / "data" / "fcc_research_docs"

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

def download_doc(service, doc_id, output_path):
    request = service.files().export_media(fileId=doc_id, mimeType='text/plain')
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    content = fh.getvalue().decode('utf-8')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return content

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    # Search for Key Fob Compatibility docs
    print("Searching for 'Key Fob Compatibility'...")
    response = service.files().list(
        q="name contains 'Key Fob Compatibility' and mimeType='application/vnd.google-apps.document'",
        spaces='drive',
        fields='files(id, name, modifiedTime)',
        pageSize=10
    ).execute()
    
    docs = response.get('files', [])
    print(f"Found {len(docs)} docs\n")
    
    for i, doc in enumerate(docs, 1):
        output_file = OUTPUT_DIR / f"key_fob_compat_{i}_{doc['id'][:8]}.txt"
        print(f"[{i}] {doc['name']}")
        print(f"    ID: {doc['id']}")
        
        content = download_doc(service, doc['id'], output_file)
        print(f"    Saved: {output_file.name} ({len(content):,} bytes)")
        
        # Check for our missing FCC IDs
        missing = ['TQ8-FOB-4F03', 'TQ8-RKE-4F21', 'LHJ009', 'ACJ8D8E24A04', 'IT7RK700NR']
        found = [fcc for fcc in missing if fcc in content]
        if found:
            print(f"    ✅ Contains: {', '.join(found)}")
        
        # Preview
        preview = content[:200].replace('\n', ' ').replace('\r', '')
        print(f"    Preview: {preview}...")
        print()

if __name__ == "__main__":
    main()
