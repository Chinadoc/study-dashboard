#!/usr/bin/env python3
"""
Export plain-text versions of Google Drive dossiers into each local folder.

For each document folder in gdrive_exports/:
  1. Match it to a Google Drive document ID (via document_manifest.json)
  2. Export as text/plain
  3. Save as {folder}/{slug}.txt alongside the existing .html and /images/

Also moves any root-level .txt files into their matching folders.
"""

import json, re, io, os, shutil
from pathlib import Path
from datetime import datetime

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
GDRIVE_EXPORTS = PROJECT_ROOT / "gdrive_exports"
MANIFEST_PATH = GDRIVE_EXPORTS / "document_manifest.json"
TOKEN_PATH = PROJECT_ROOT / "gdrive_token.json"

SKIP_DIRS = {'images', 'html', '.DS_Store', 'new_batch_2026_01_27'}


def get_drive_service():
    """Authenticate and return Drive API service."""
    with open(TOKEN_PATH) as f:
        td = json.load(f)
    creds = Credentials(
        token=td['token'], refresh_token=td['refresh_token'],
        token_uri='https://oauth2.googleapis.com/token',
        client_id=td['client_id'], client_secret=td['client_secret'],
    )
    if creds.expired:
        creds.refresh(Request())
        td['token'] = creds.token
        with open(TOKEN_PATH, 'w') as f:
            json.dump(td, f, indent=2)
    return build('drive', 'v3', credentials=creds)


def sanitize(name):
    s = name.replace(' ', '_').replace('/', '_').replace(':', '_')
    return re.sub(r'[^A-Za-z0-9_-]', '', s)


def main():
    print("=" * 70)
    print("📄 EXPORTING PLAIN TEXT FOR ALL DOSSIER DOCUMENTS")
    print("=" * 70)

    service = get_drive_service()

    # --- Step 0: Move root-level .txt files into matching folders ---
    print("\n📁 Moving root-level .txt files into matching folders...")
    root_txts = list(GDRIVE_EXPORTS.glob("*.txt"))
    moved = 0
    for txt_file in root_txts:
        stem = txt_file.stem
        # Try to find a matching local directory
        best_match = None
        for d in GDRIVE_EXPORTS.iterdir():
            if not d.is_dir() or d.name in SKIP_DIRS:
                continue
            if sanitize(d.name).lower().startswith(sanitize(stem).lower()[:20]):
                best_match = d
                break
            if sanitize(stem).lower()[:20] in sanitize(d.name).lower():
                best_match = d
                break
        if best_match:
            dest = best_match / txt_file.name
            if not dest.exists():
                shutil.move(str(txt_file), str(dest))
                print(f"   ✅ {txt_file.name} → {best_match.name}/")
                moved += 1
            else:
                print(f"   ⏭️  {txt_file.name} already exists in {best_match.name}/")
        else:
            print(f"   ⚠️  No match for {txt_file.name}")
    print(f"   Moved {moved} root .txt files\n")

    # --- Step 1: Build Drive ID map ---
    # Load manifest for Drive IDs
    drive_id_map = {}  # local_dir → drive_id
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH) as f:
            manifest = json.load(f)
        for doc in manifest.get('documents', []):
            if doc.get('local_dir') and doc.get('drive_id'):
                drive_id_map[doc['local_dir']] = doc['drive_id']

    # For dirs without Drive IDs in manifest, search Drive
    print(f"📋 Manifest has Drive IDs for {len(drive_id_map)} documents")

    # Get all dirs that need .txt
    dirs_needing_txt = []
    dirs_already_have_txt = 0
    for d in sorted(GDRIVE_EXPORTS.iterdir()):
        if not d.is_dir() or d.name in SKIP_DIRS:
            continue
        if d.name.startswith('Copy_of_'):
            continue
        # Check if already has a .txt file
        existing_txts = list(d.glob("*.txt"))
        if existing_txts:
            dirs_already_have_txt += 1
            continue
        dirs_needing_txt.append(d)

    print(f"📂 {dirs_already_have_txt} folders already have .txt")
    print(f"📥 {len(dirs_needing_txt)} folders need .txt export")

    if not dirs_needing_txt:
        print("\n✅ All folders already have .txt files!")
        return

    # --- Step 2: For dirs missing Drive IDs, search Drive ---
    missing_ids = [d for d in dirs_needing_txt if d.name not in drive_id_map]
    if missing_ids:
        print(f"\n🔍 Searching Drive for {len(missing_ids)} unmatched documents...")
        # Get all docs from Drive
        all_drive_docs = []
        page_token = None
        while True:
            r = service.files().list(
                q="mimeType='application/vnd.google-apps.document'",
                fields='nextPageToken, files(id, name)',
                pageSize=200, pageToken=page_token
            ).execute()
            all_drive_docs.extend(r.get('files', []))
            page_token = r.get('nextPageToken')
            if not page_token:
                break

        # Build lookup
        drive_name_map = {}
        for doc in all_drive_docs:
            key = sanitize(doc['name']).lower()
            if key not in drive_name_map:
                drive_name_map[key] = doc

        # Match
        newly_matched = 0
        for d in missing_ids:
            s = sanitize(d.name).lower()
            drive_doc = drive_name_map.get(s)
            if not drive_doc:
                # Fuzzy match
                for dk, dv in drive_name_map.items():
                    if dk.startswith(s[:25]) or s.startswith(dk[:25]):
                        drive_doc = dv
                        break
            if drive_doc:
                drive_id_map[d.name] = drive_doc['id']
                newly_matched += 1

        print(f"   Matched {newly_matched} additional documents to Drive IDs")

    # --- Step 3: Export .txt for each folder ---
    print(f"\n📄 Exporting .txt for {len(dirs_needing_txt)} folders...")
    exported = 0
    skipped_no_id = 0
    failed = 0

    for i, d in enumerate(dirs_needing_txt, 1):
        drive_id = drive_id_map.get(d.name)
        if not drive_id:
            skipped_no_id += 1
            continue

        slug = sanitize(d.name)
        txt_path = d / f"{slug}.txt"

        try:
            request_obj = service.files().export_media(
                fileId=drive_id,
                mimeType='text/plain'
            )
            buffer = io.BytesIO()
            downloader = MediaIoBaseDownload(buffer, request_obj)
            done = False
            while not done:
                _, done = downloader.next_chunk()

            text_content = buffer.getvalue().decode('utf-8', errors='replace')

            # Skip if empty or trivially short
            if len(text_content.strip()) < 20:
                skipped_no_id += 1
                continue

            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(text_content)

            exported += 1
            if i % 25 == 0:
                print(f"   [{i}/{len(dirs_needing_txt)}] Exported {exported} so far...")

        except Exception as e:
            failed += 1
            if 'not found' not in str(e).lower() and i <= 10:
                print(f"   ❌ {d.name[:40]}: {str(e)[:60]}")

    print(f"\n{'=' * 70}")
    print(f"✅ EXPORT COMPLETE")
    print(f"   Exported:     {exported}")
    print(f"   Already had:  {dirs_already_have_txt}")
    print(f"   No Drive ID:  {skipped_no_id}")
    print(f"   Failed:       {failed}")
    print(f"   Total dirs:   {exported + dirs_already_have_txt + skipped_no_id + failed}")

    # --- Step 4: Update manifest with has_txt ---
    print(f"\n📋 Updating document manifest...")
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH) as f:
            manifest = json.load(f)

        txt_count = 0
        for doc in manifest.get('documents', []):
            local_dir = doc.get('local_dir')
            if local_dir:
                d = GDRIVE_EXPORTS / local_dir
                has_txt = bool(list(d.glob("*.txt"))) if d.exists() else False
                doc['has_txt'] = has_txt
                if has_txt:
                    txt_count += 1

        manifest['stats']['with_txt'] = txt_count
        manifest['last_txt_export'] = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

        with open(MANIFEST_PATH, 'w') as f:
            json.dump(manifest, f, indent=2)

        print(f"   ✅ {txt_count} documents now have .txt")
    print(f"{'=' * 70}")


if __name__ == '__main__':
    main()
