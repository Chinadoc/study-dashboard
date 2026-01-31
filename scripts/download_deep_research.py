#!/usr/bin/env python3
"""
Download deep research documents from Google Drive for glossary extraction.

Uses the deep_research_docs.json list and existing OAuth credentials
to download as zipped HTML and plain text for processing.
"""

import os
import json
import requests
import zipfile
from pathlib import Path
from bs4 import BeautifulSoup
import re

# Paths
CREDS_PATH = Path("gdrive_token.json")
DOCS_FILE = Path("data/glossary_batches/deep_research_docs.json")
EXPORT_DIR = Path("data/glossary_batches/deep_research_exports")


def get_access_token():
    """Get access token, refreshing if needed."""
    with open(CREDS_PATH) as f:
        creds = json.load(f)
    
    refresh_token = creds.get('refresh_token')
    client_id = creds.get('client_id')
    client_secret = creds.get('client_secret')
    
    if refresh_token and client_id and client_secret:
        print("🔄 Refreshing OAuth token...")
        response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": client_id,
                "client_secret": client_secret
            }
        )
        
        if response.status_code == 200:
            new_tokens = response.json()
            creds['token'] = new_tokens['access_token']
            
            with open(CREDS_PATH, 'w') as f:
                json.dump(creds, f, indent=2)
            
            print("✅ Token refreshed!")
            return creds['token']
        else:
            print(f"⚠️ Token refresh failed: {response.status_code}")
    
    return creds.get('token') or creds.get('access_token')


def download_doc_as_html(access_token: str, file_id: str, title: str) -> str:
    """Download a Google Doc as HTML."""
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}/export"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"mimeType": "text/html"}
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"  ❌ Error downloading {title}: {response.status_code}")
        return None
    
    return response.text


def html_to_text(html_content: str) -> str:
    """Convert HTML to plain text."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.decompose()
    
    # Get text
    text = soup.get_text()
    
    # Clean up whitespace
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    
    return text


def sanitize_filename(name: str) -> str:
    """Convert document name to safe filename."""
    safe = name.replace(" ", "_").replace("/", "-").replace(":", "-").replace("&", "and")
    safe = "".join(c for c in safe if c.isalnum() or c in "_-.")
    return safe


def main():
    print("🔍 Downloading deep research documents for glossary extraction...\n")
    
    # Create export directory
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load docs list
    with open(DOCS_FILE) as f:
        docs = json.load(f)
    
    print(f"📋 Found {len(docs)} documents to download\n")
    
    # Get access token
    try:
        access_token = get_access_token()
        print(f"✅ Got access token\n")
    except Exception as e:
        print(f"❌ Failed to get access token: {e}")
        return
    
    # Download each document
    downloaded = []
    
    print("=" * 50)
    print("DOWNLOADING DOCUMENTS")
    print("=" * 50 + "\n")
    
    for doc in docs:
        title = doc.get('title', 'Unknown')
        file_id = doc.get('id')
        topic = doc.get('topic', '')
        
        print(f"📥 {topic}")
        print(f"   Title: {title}")
        
        # Generate safe filename
        safe_name = sanitize_filename(title)
        html_path = EXPORT_DIR / f"{safe_name}.html"
        txt_path = EXPORT_DIR / f"{safe_name}.txt"
        zip_path = EXPORT_DIR / f"{safe_name}.zip"
        
        # Download HTML
        content = download_doc_as_html(access_token, file_id, title)
        
        if content:
            # Save HTML
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"   ✅ HTML saved: {html_path.name}")
            
            # Convert to text
            text_content = html_to_text(content)
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(text_content)
            print(f"   ✅ TXT saved: {txt_path.name}")
            
            # Create zip
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                zf.write(html_path, html_path.name)
            print(f"   ✅ ZIP saved: {zip_path.name}")
            
            downloaded.append({
                "title": title,
                "topic": topic,
                "html": str(html_path),
                "txt": str(txt_path),
                "zip": str(zip_path)
            })
        else:
            print(f"   ❌ Failed to download")
        
        print()
    
    # Summary
    print("=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"\n✅ Downloaded: {len(downloaded)}/{len(docs)}")
    print(f"📂 Files in {EXPORT_DIR}:")
    for d in downloaded:
        print(f"  - {Path(d['txt']).name}")
    
    # Save manifest
    manifest_path = EXPORT_DIR / "download_manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(downloaded, f, indent=2)
    print(f"\n📋 Manifest saved: {manifest_path}")


if __name__ == "__main__":
    main()
