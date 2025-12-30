#!/usr/bin/env python3
"""
Google Drive Document Fetcher
Downloads documents from Google Drive using OAuth2 authentication
"""

import os
import json
import pickle
from pathlib import Path

# Google API dependencies
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    import io
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.run(["pip", "install", "google-auth", "google-auth-oauthlib", "google-api-python-client"], check=True)
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    import io

# OAuth2 configuration - Desktop CLI credentials
CLIENT_CONFIG = {
    "installed": {
        "client_id": "1057439383868-04gum028jlqtkr3sdj9bbblaf4dglmbc.apps.googleusercontent.com",
        "client_secret": "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",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost"]
    }
}

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
TOKEN_FILE = Path(__file__).parent / 'gdrive_token.pickle'
OUTPUT_DIR = Path(__file__).parent / 'data'

def get_credentials():
    """Get valid credentials, refreshing or initiating OAuth flow as needed."""
    creds = None
    
    # Load existing token if available
    if TOKEN_FILE.exists():
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid credentials, initiate OAuth flow
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired credentials...")
            creds.refresh(Request())
        else:
            print("Starting OAuth authentication flow...")
            print("A browser window will open for you to authorize access.")
            flow = InstalledAppFlow.from_client_config(CLIENT_CONFIG, SCOPES)
            creds = flow.run_local_server(port=8080)
        
        # Save credentials for future use
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
        print(f"Credentials saved to {TOKEN_FILE}")
    
    return creds

def search_documents(service, queries):
    """Search for documents matching the given queries."""
    results = []
    
    for query in queries:
        print(f"\nSearching for: {query[:50]}...")
        
        # Search by name (partial match)
        search_query = f"name contains '{query[:30]}'"
        
        try:
            response = service.files().list(
                q=search_query,
                spaces='drive',
                fields='files(id, name, mimeType, modifiedTime)',
                pageSize=10
            ).execute()
            
            files = response.get('files', [])
            if files:
                for f in files:
                    print(f"  Found: {f['name']}")
                    results.append(f)
            else:
                print(f"  No results found for this query")
                
        except Exception as e:
            print(f"  Error searching: {e}")
    
    return results

def download_document(service, file_info, output_dir):
    """Download a document from Google Drive."""
    file_id = file_info['id']
    file_name = file_info['name']
    mime_type = file_info.get('mimeType', '')
    
    print(f"\nDownloading: {file_name}")
    
    # Handle Google Docs formats
    if mime_type == 'application/vnd.google-apps.document':
        # Export as plain text
        request = service.files().export_media(fileId=file_id, mimeType='text/plain')
        file_name = file_name + '.txt'
    elif mime_type == 'application/vnd.google-apps.spreadsheet':
        # Export as CSV
        request = service.files().export_media(fileId=file_id, mimeType='text/csv')
        file_name = file_name + '.csv'
    else:
        # Direct download for other file types
        request = service.files().get_media(fileId=file_id)
    
    # Download the file
    output_path = output_dir / file_name
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    
    done = False
    while not done:
        status, done = downloader.next_chunk()
        if status:
            print(f"  Progress: {int(status.progress() * 100)}%")
    
    # Save to file
    with open(output_path, 'wb') as f:
        f.write(fh.getvalue())
    
    print(f"  Saved to: {output_path}")
    return output_path

def main():
    """Main function to search and download documents."""
    print("=" * 60)
    print("Google Drive Document Fetcher")
    print("=" * 60)
    
    # Search queries for the target documents
    search_queries = [
        "Mercedes-Benz Security Compendium",
        "VAG High-Security Access Control",
        "Drive Authorization Systems",
        "Locksmith Database"
    ]
    
    # Get credentials and build service
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    # Test connection
    print("\nConnected to Google Drive successfully!")
    
    # Get user info
    about = service.about().get(fields="user").execute()
    print(f"Authenticated as: {about['user'].get('emailAddress', 'Unknown')}")
    
    # Search for documents
    print("\n" + "=" * 60)
    print("Searching for documents...")
    print("=" * 60)
    
    found_docs = search_documents(service, search_queries)
    
    if not found_docs:
        print("\nNo matching documents found. Listing recent documents instead...")
        response = service.files().list(
            pageSize=20,
            orderBy='modifiedTime desc',
            fields='files(id, name, mimeType, modifiedTime)'
        ).execute()
        
        files = response.get('files', [])
        print("\nRecent documents in your Drive:")
        for i, f in enumerate(files, 1):
            print(f"  {i}. {f['name']}")
        return
    
    # Download found documents
    print("\n" + "=" * 60)
    print(f"Found {len(found_docs)} document(s). Downloading...")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    downloaded = []
    for doc in found_docs:
        try:
            path = download_document(service, doc, OUTPUT_DIR)
            downloaded.append(path)
        except Exception as e:
            print(f"  Error downloading {doc['name']}: {e}")
    
    print("\n" + "=" * 60)
    print(f"Download complete! {len(downloaded)} file(s) saved to {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == '__main__':
    main()
