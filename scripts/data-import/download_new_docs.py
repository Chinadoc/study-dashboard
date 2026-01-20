#!/usr/bin/env python3
"""Download the new locksmith research documents"""

import pickle
from pathlib import Path
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

TOKEN_FILE = Path(__file__).parent / 'gdrive_token.pickle'
OUTPUT_DIR = Path(__file__).parent / 'data'

def get_creds():
    with open(TOKEN_FILE, 'rb') as f:
        return pickle.load(f)

def download(service, name, output_dir):
    print(f"Searching: {name}")
    resp = service.files().list(q=f"name = '{name}'", spaces='drive', 
        fields='files(id, name, mimeType)', pageSize=1).execute()
    files = resp.get('files', [])
    if not files:
        print(f"  Not found")
        return None
    f = files[0]
    print(f"  Downloading: {f['name']}")
    
    if f['mimeType'] == 'application/vnd.google-apps.document':
        req = service.files().export_media(fileId=f['id'], mimeType='text/plain')
        fname = f['name'] + '.txt'
    else:
        req = service.files().get_media(fileId=f['id'])
        fname = f['name']
    
    fh = io.BytesIO()
    dl = MediaIoBaseDownload(fh, req)
    done = False
    while not done:
        _, done = dl.next_chunk()
    
    out = output_dir / fname
    with open(out, 'wb') as o:
        o.write(fh.getvalue())
    print(f"  Saved: {out}")
    return out

def main():
    targets = [
        "Mercedes FBS4 Aftermarket Workarounds",
        "VAG Security Bypass Research Matrix"
    ]
    
    creds = get_creds()
    svc = build('drive', 'v3', credentials=creds)
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    for t in targets:
        download(svc, t, OUTPUT_DIR)

if __name__ == '__main__':
    main()
