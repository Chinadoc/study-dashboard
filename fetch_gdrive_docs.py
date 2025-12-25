#!/usr/bin/env python3
"""
Google Drive Data Ingestion Script
Fetches car-related Google Docs from Drive and exports them as text.
"""

import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# OAuth Configuration - Desktop App (allows localhost redirects)
CLIENT_ID = "1057439383868-04gum028jlqtkr3sdj9bbblaf4dglmbc.apps.googleusercontent.com"
CLIENT_SECRET = "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"

SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/documents.readonly'
]

TOKEN_FILE = 'gdrive_token.json'
OUTPUT_DIR = 'gdrive_exports'

# Car-related keywords to filter docs
CAR_KEYWORDS = [
    'locksmith', 'key', 'programming', 'transponder', 'immobilizer',
    'honda', 'toyota', 'ford', 'nissan', 'hyundai', 'kia', 'bmw', 'mercedes',
    'audi', 'volkswagen', 'vw', 'jetta', 'passat', 'golf', 'tiguan',
    'subaru', 'mazda', 'lexus', 'acura', 'infiniti',
    'chevrolet', 'gmc', 'cadillac', 'dodge', 'jeep', 'chrysler', 'ram',
    'pats', 'immo', 'smart key', 'prox', 'fobik', 'autel', 'lishi', 'fcc'
]


def get_credentials():
    """Get or refresh OAuth credentials using Desktop App flow."""
    creds = None
    
    # Check for existing token
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    # Refresh or get new token
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_config({
                "installed": {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "redirect_uris": ["http://localhost"],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            }, SCOPES)
            # Desktop App flow - works with any localhost port
            print("\n📋 A browser will open. Authorize and it will redirect back.")
            creds = flow.run_local_server(port=0, open_browser=True)
        
        # Save token for future use
        with open(TOKEN_FILE, 'w') as f:
            f.write(creds.to_json())
    
    return creds


def is_car_related(filename):
    """Check if a file is car/locksmith related based on name."""
    name_lower = filename.lower()
    return any(keyword in name_lower for keyword in CAR_KEYWORDS)


def list_google_docs(service, max_results=50):
    """List recent Google Docs from Drive."""
    results = service.files().list(
        pageSize=max_results,
        fields="files(id, name, mimeType, modifiedTime)",
        q="mimeType='application/vnd.google-apps.document'",
        orderBy="modifiedTime desc"
    ).execute()
    
    return results.get('files', [])


def export_doc_as_text(service, file_id, filename):
    """Export a Google Doc as plain text."""
    try:
        content = service.files().export(
            fileId=file_id,
            mimeType='text/plain'
        ).execute()
        return content.decode('utf-8')
    except Exception as e:
        print(f"  Error exporting {filename}: {e}")
        return None


def main():
    print("🔐 Authenticating with Google Drive...")
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print("📂 Fetching recent Google Docs...")
    docs = list_google_docs(service)
    print(f"   Found {len(docs)} documents total")
    
    # Filter for car-related docs
    car_docs = [doc for doc in docs if is_car_related(doc['name'])]
    print(f"   Found {len(car_docs)} car/locksmith related documents")
    
    if not car_docs:
        print("\n⚠️  No car-related docs found. All docs:")
        for doc in docs[:10]:
            print(f"   - {doc['name']}")
        return
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Export each car-related doc
    print(f"\n📥 Exporting {len(car_docs)} documents to {OUTPUT_DIR}/...")
    for doc in car_docs:
        safe_name = doc['name'].replace('/', '_').replace(' ', '_')
        output_path = os.path.join(OUTPUT_DIR, f"{safe_name}.txt")
        
        print(f"   Exporting: {doc['name']}")
        content = export_doc_as_text(service, doc['id'], doc['name'])
        
        if content:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"   ✓ Saved to {output_path}")
    
    print(f"\n✅ Done! Exported {len(car_docs)} documents to {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
