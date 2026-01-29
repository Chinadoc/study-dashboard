#!/usr/bin/env python3
"""
Download specific Google Docs by ID for FCC research.
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

# The 4 FCC research doc IDs from manifest
DOC_IDS = [
    "1Q6AcGUO3rzBqMPECF5QegIgjz6PMrIe8BPwWbi76ZCA",
    "1t1o83-BUxZgUimBBno5mol-k6BE__pBVW8s2SLv_01o",
    "1Vge_9Ozb2uvlDyEHTjqwvkx8xzS_oEv_Ma_Hf9vkT_M",
    "1NjdQCornPomTtDTqGXbGFYLpLvC8XZ-ZNi8Xzycyk10",
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

def download_as_text(service, doc_id, output_path):
    """Download doc as plain text."""
    request = service.files().export_media(fileId=doc_id, mimeType='text/plain')
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    
    content = fh.getvalue().decode('utf-8')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    return len(content)

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print("Downloading FCC research docs by ID...")
    
    for i, doc_id in enumerate(DOC_IDS, 1):
        # Get doc name
        doc = service.files().get(fileId=doc_id, fields='name').execute()
        name = doc['name']
        
        # Save with unique filename
        output_file = OUTPUT_DIR / f"fcc_research_{i}_{doc_id[:8]}.txt"
        
        print(f"\n[{i}/{len(DOC_IDS)}] {name}")
        print(f"  ID: {doc_id}")
        
        size = download_as_text(service, doc_id, output_file)
        print(f"  Saved: {output_file.name} ({size:,} bytes)")
        
        # Show first 200 chars to identify which batch
        with open(output_file, 'r') as f:
            preview = f.read(200).replace('\n', ' ')
        print(f"  Preview: {preview}...")
    
    print(f"\n✅ Downloaded {len(DOC_IDS)} docs to {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
