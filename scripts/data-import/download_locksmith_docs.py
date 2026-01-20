#!/usr/bin/env python3
"""
Google Drive Document Fetcher - Download specific locksmith documents
"""

import pickle
from pathlib import Path

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

TOKEN_FILE = Path(__file__).parent / 'gdrive_token.pickle'
OUTPUT_DIR = Path(__file__).parent / 'data'

def get_credentials():
    """Load saved credentials."""
    if TOKEN_FILE.exists():
        with open(TOKEN_FILE, 'rb') as token:
            return pickle.load(token)
    raise Exception("No credentials found. Run fetch_gdrive_docs.py first.")

def download_document(service, file_info, output_dir):
    """Download a document from Google Drive."""
    file_id = file_info['id']
    file_name = file_info['name']
    mime_type = file_info.get('mimeType', '')
    
    print(f"\nDownloading: {file_name}")
    
    # Handle Google Docs formats
    if mime_type == 'application/vnd.google-apps.document':
        request = service.files().export_media(fileId=file_id, mimeType='text/plain')
        file_name = file_name + '.txt'
    elif mime_type == 'application/vnd.google-apps.spreadsheet':
        request = service.files().export_media(fileId=file_id, mimeType='text/csv')
        file_name = file_name + '.csv'
    else:
        request = service.files().get_media(fileId=file_id)
    
    output_path = output_dir / file_name
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    
    done = False
    while not done:
        status, done = downloader.next_chunk()
        if status:
            print(f"  Progress: {int(status.progress() * 100)}%")
    
    with open(output_path, 'wb') as f:
        f.write(fh.getvalue())
    
    print(f"  Saved to: {output_path}")
    return output_path

def main():
    """Download specific locksmith documents."""
    print("=" * 60)
    print("Downloading Locksmith Research Documents")
    print("=" * 60)
    
    # Target document names
    target_docs = [
        "Mercedes-Benz Key Programming Database",
        "Audi MQB-Evo Security Deep Dive",
        "Stellantis RF Hub & Fobik Programming",
        "Ford BCM Security Bypass Analysis",
        "Honda 11th Gen Key Chip Research",
        "GM Global B Chip & CAN FD",
        "Toyota Key Chip Specification Research",
        "Kia/Hyundai Security Architecture Update",
        "GM Global A/B Architecture Transition Research",
        "Toyota/Lexus Security Evolution Data",
        "Mazda Key Programming Research Data",
        "VIN to Part Number Mapping Research",
        "JLR Security Architecture Deep Dive",
        "Automotive Key Data Database Creation"
    ]
    
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print(f"\nConnected to Google Drive")
    
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    downloaded = []
    for doc_name in target_docs:
        # Search for the document
        query = f"name = '{doc_name}'"
        try:
            response = service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, mimeType)',
                pageSize=1
            ).execute()
            
            files = response.get('files', [])
            if files:
                path = download_document(service, files[0], OUTPUT_DIR)
                downloaded.append(path)
            else:
                print(f"\nNot found: {doc_name}")
                
        except Exception as e:
            print(f"\nError with {doc_name}: {e}")
    
    print("\n" + "=" * 60)
    print(f"Download complete! {len(downloaded)} files saved to {OUTPUT_DIR}")
    print("=" * 60)
    for p in downloaded:
        print(f"  - {p.name}")

if __name__ == '__main__':
    main()
