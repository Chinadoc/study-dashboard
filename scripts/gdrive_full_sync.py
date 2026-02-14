#!/usr/bin/env python3
"""
Full GDrive Corpus Sync: Last 150 days.
For each locksmith research doc:
  1. Download as zipped HTML (preserves images) -> gdrive_exports/
  2. Download as plain text -> data/gdrive_plaintext/
  3. Update dossier_manifest.json

Non-interactive. Skips already-downloaded docs.
"""

import os
import sys
import json
import zipfile
import re
from pathlib import Path
from datetime import datetime, timedelta

# Google API
try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    import io
except ImportError:
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install",
                    "google-auth", "google-auth-oauthlib", "google-api-python-client"], check=True)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    import io

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
TOKEN_FILE = PROJECT_ROOT / "gdrive_token.json"
EXPORTS_DIR = PROJECT_ROOT / "gdrive_exports"
PLAINTEXT_DIR = PROJECT_ROOT / "data" / "gdrive_plaintext"
MANIFEST_FILE = PROJECT_ROOT / "data" / "dossier_manifest.json"

DAYS_BACK = 150

# Broad keyword search to find all locksmith docs
SEARCH_KEYWORDS = [
    "Locksmith", "Key Programming", "Immobilizer", "AKL", "PATS",
    "Pearl", "Dossier", "Security", "FCC", "Transponder",
    "Smart Key", "Remote Head", "EEPROM", "OBD", "Pin Code",
    "SGW", "Tool Coverage", "BCM", "IMMO", "Chip",
    "Blade", "Intelligence", "Research", "Platform",
    "Architecture", "Forensic", "Reference", "Guide",
    "Programming", "Coverage", "Cross-Reference", "Database",
    "VIN", "Specification", "Bypass", "Recovery",
]

# Exclusion patterns for non-locksmith docs
EXCLUSION_PATTERNS = [
    r'resume', r'cover\s*letter', r'invoice', r'receipt',
    r'meeting\s*notes', r'grocery', r'todo\s*list',
    r'personal', r'budget',
]


def get_credentials():
    """Load and refresh OAuth credentials."""
    if not TOKEN_FILE.exists():
        print(f"❌ Token file not found: {TOKEN_FILE}")
        print("   Run: python3 scripts/gdrive_reauth.py")
        sys.exit(1)

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

    # Refresh if needed
    if creds.expired and creds.refresh_token:
        print("🔄 Refreshing token...")
        creds.refresh(Request())
        token_data['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(token_data, f, indent=2)
        print("✅ Token refreshed")
    elif not creds.valid:
        # Force refresh
        print("🔄 Token invalid, forcing refresh...")
        creds.refresh(Request())
        token_data['token'] = creds.token
        with open(TOKEN_FILE, 'w') as f:
            json.dump(token_data, f, indent=2)

    return creds


def sanitize_filename(name):
    """Convert document name to safe filename."""
    safe = name.replace(' ', '_').replace('/', '_').replace(':', '_')
    safe = safe.replace('(', '').replace(')', '').replace(',', '')
    safe = safe.replace('&', 'and').replace("'", '').replace('"', '')
    safe = "".join(c for c in safe if c.isalnum() or c in "_-.")
    if len(safe) > 120:
        safe = safe[:120]
    return safe


def is_locksmith_doc(name):
    """Check if a doc name looks like a locksmith research doc."""
    name_lower = name.lower()
    # Exclude non-locksmith
    for pat in EXCLUSION_PATTERNS:
        if re.search(pat, name_lower):
            return False
    return True


def search_all_docs(service, days_back):
    """Search GDrive for all Google Docs from the last N days using keyword search."""
    threshold = datetime.now() - timedelta(days=days_back)
    threshold_str = threshold.strftime("%Y-%m-%dT%H:%M:%S")

    all_docs = {}
    seen_keywords = set()

    for keyword in SEARCH_KEYWORDS:
        if keyword in seen_keywords:
            continue
        seen_keywords.add(keyword)

        try:
            search_query = (
                f"name contains '{keyword}' and "
                f"mimeType='application/vnd.google-apps.document' and "
                f"modifiedTime > '{threshold_str}'"
            )

            page_token = None
            while True:
                response = service.files().list(
                    q=search_query,
                    spaces='drive',
                    fields='nextPageToken, files(id, name, mimeType, modifiedTime, createdTime)',
                    pageSize=100,
                    pageToken=page_token
                ).execute()

                for doc in response.get('files', []):
                    if doc['id'] not in all_docs and is_locksmith_doc(doc['name']):
                        all_docs[doc['id']] = {
                            'name': doc['name'],
                            'id': doc['id'],
                            'modified': doc.get('modifiedTime', ''),
                            'created': doc.get('createdTime', ''),
                        }

                page_token = response.get('nextPageToken')
                if not page_token:
                    break

        except Exception as e:
            print(f"  ⚠️ Error searching '{keyword}': {e}")

    print(f"  Found {len(all_docs)} unique docs across {len(seen_keywords)} keyword searches")
    return all_docs


def get_existing_local():
    """Get sets of already-downloaded docs."""
    existing_html = set()
    if EXPORTS_DIR.exists():
        for item in EXPORTS_DIR.iterdir():
            if item.is_dir() and item.name not in ('html', 'images', '.DS_Store'):
                existing_html.add(item.name)

    existing_txt = set()
    if PLAINTEXT_DIR.exists():
        for item in PLAINTEXT_DIR.iterdir():
            if item.suffix == '.txt' and item.name != 'download_manifest.json':
                existing_txt.add(item.stem)

    return existing_html, existing_txt


def download_zip_html(service, doc_id, doc_name, output_dir):
    """Download as zipped HTML (preserving images), then extract."""
    safe_name = sanitize_filename(doc_name)
    zip_path = output_dir / f"{safe_name}.zip"
    folder_path = output_dir / safe_name

    if folder_path.exists():
        return True, safe_name  # Already exists

    try:
        request = service.files().export_media(fileId=doc_id, mimeType='application/zip')
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()

        # Save zip
        with open(zip_path, 'wb') as f:
            f.write(fh.getvalue())

        # Extract
        folder_path.mkdir(exist_ok=True)
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(folder_path)

        return True, safe_name
    except Exception as e:
        return False, str(e)


def download_plaintext(service, doc_id, doc_name, output_dir):
    """Download as plain text."""
    safe_name = sanitize_filename(doc_name)
    txt_path = output_dir / f"{safe_name}.txt"

    if txt_path.exists():
        return True, safe_name, txt_path.stat().st_size

    try:
        request = service.files().export_media(fileId=doc_id, mimeType='text/plain')
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()

        content = fh.getvalue().decode('utf-8')
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return True, safe_name, txt_path.stat().st_size
    except Exception as e:
        return False, str(e), 0


def update_manifest(all_docs, exports_dir, plaintext_dir, manifest_path):
    """Rebuild dossier_manifest.json from actual files on disk."""
    # Load existing manifest if present
    existing = []
    existing_names = set()
    if manifest_path.exists():
        with open(manifest_path, 'r') as f:
            existing = json.load(f)
        existing_names = {d.get('slug', d.get('name', '')) for d in existing}

    # Build make detection
    MAKE_KEYWORDS = {
        'Toyota': ['toyota', 'camry', 'corolla', 'rav4', 'highlander', 'tundra', 'tacoma',
                    '4runner', 'sequoia', 'sienna', 'prius', 'venza', 'supra', 'tnga'],
        'Honda': ['honda', 'civic', 'accord', 'cr-v', 'pilot', 'odyssey', 'ridgeline'],
        'Ford': ['ford', 'f-150', 'f150', 'mustang', 'explorer', 'escape', 'bronco',
                 'expedition', 'ranger', 'maverick', 'transit', 'mach-e'],
        'Chevrolet': ['chevrolet', 'chevy', 'silverado', 'equinox', 'traverse', 'tahoe',
                      'suburban', 'colorado', 'camaro', 'bolt', 'malibu', 'blazer'],
        'BMW': ['bmw', 'fem', 'bdc', 'cas', 'ews'],
        'Mercedes': ['mercedes', 'benz', 'fbs3', 'fbs4', 'w205', 'w206', 'w213'],
        'Audi': ['audi', 'a4', 'a6', 'q5', 'q7', 'q8'],
        'Volkswagen': ['volkswagen', 'vw', 'vag', 'mqb', 'jetta', 'tiguan', 'golf'],
        'Nissan': ['nissan', 'altima', 'rogue', 'pathfinder', 'frontier', 'titan', 'murano'],
        'Hyundai': ['hyundai', 'elantra', 'tucson', 'sonata', 'santa_fe', 'palisade', 'kona'],
        'Kia': ['kia', 'telluride', 'sportage', 'sorento', 'forte', 'soul'],
        'Subaru': ['subaru', 'outback', 'forester', 'crosstrek', 'impreza', 'wrx'],
        'Mazda': ['mazda', 'cx-5', 'cx5', 'cx-50', 'mazda3', 'skyactiv'],
        'Jeep': ['jeep', 'wrangler', 'cherokee', 'gladiator', 'compass'],
        'Ram': ['ram', '1500', 'dt_ram'],
        'Dodge': ['dodge', 'charger', 'challenger', 'durango'],
        'Chrysler': ['chrysler', 'pacifica', '300'],
        'GMC': ['gmc', 'sierra', 'yukon', 'terrain', 'acadia', 'canyon'],
        'Cadillac': ['cadillac', 'escalade', 'lyriq', 'ct4', 'ct5'],
        'Buick': ['buick', 'encore', 'enclave', 'envision'],
        'Lexus': ['lexus', 'rx', 'nx', 'es', 'gx', 'lx'],
        'Acura': ['acura', 'mdx', 'rdx', 'tlx', 'integra'],
        'Infiniti': ['infiniti', 'qx', 'q50', 'q60'],
        'Lincoln': ['lincoln', 'navigator', 'aviator', 'corsair'],
        'Volvo': ['volvo', 'xc90', 'xc60', 'xc40', 'spa', 'cma'],
        'Porsche': ['porsche', 'cayenne', 'macan', 'panamera', '911', 'taycan'],
        'Land Rover': ['land_rover', 'range_rover', 'discovery', 'defender', 'jlr', 'l494'],
        'Jaguar': ['jaguar', 'f-type', 'f-pace', 'e-pace'],
        'Stellantis': ['stellantis', 'fca', 'cdjr', 'sgw'],
        'Genesis': ['genesis', 'gv70', 'gv80', 'g70'],
        'Tesla': ['tesla', 'model_3', 'model_y'],
        'Mini': ['mini', 'cooper', 'countryman'],
        'Alfa Romeo': ['alfa_romeo', 'alfa', 'giulia', 'stelvio'],
        'Mitsubishi': ['mitsubishi', 'outlander'],
        'Fiat': ['fiat'],
    }

    TOPIC_KEYWORDS = {
        'Immobilizer': ['immobilizer', 'immo', 'immobiliser'],
        'Key Programming': ['key_programming', 'programming', 'program'],
        'AKL': ['akl', 'all_keys_lost', 'all-keys-lost'],
        'Smart Key': ['smart_key', 'proximity', 'push_start', 'keyless'],
        'Remote': ['remote', 'fob', 'key_fob'],
        'OBD': ['obd', 'obd-ii', 'obdii', 'diagnostic'],
        'FCC ID': ['fcc', 'fcc_id'],
        'Chip': ['chip', 'transponder', '4a', '8a', 'hitag', 'megamos', '4d'],
        'EEPROM': ['eeprom', 'dump', 'flash', 'reflash', 'bench'],
        'Blade': ['blade', 'key_blank', 'keyway'],
        'SGW': ['sgw', 'gateway', 'security_gateway'],
        'Platform': ['platform', 'architecture', 'tnga', 'mqb', 'sgp'],
        'BCM': ['bcm', 'body_control'],
    }

    # Scan HTML dirs for new entries
    new_entries = 0
    for item in sorted(exports_dir.iterdir()):
        if not item.is_dir() or item.name in ('html', 'images', '.DS_Store'):
            continue

        slug = item.name
        if slug in existing_names:
            continue

        name_lower = slug.lower()

        # Detect makes
        makes = []
        for make, keywords in MAKE_KEYWORDS.items():
            if any(kw in name_lower for kw in keywords):
                makes.append(make)

        # Detect topics
        topics = []
        for topic, keywords in TOPIC_KEYWORDS.items():
            if any(kw in name_lower for kw in keywords):
                topics.append(topic)

        # Check for HTML and images
        html_files = list(item.glob('*.html'))
        has_images = any(item.iterdir() for sub in item.iterdir() if sub.is_dir())
        has_txt = (plaintext_dir / f"{slug}.txt").exists()

        entry = {
            'name': slug.replace('_', ' '),
            'slug': slug,
            'makes': makes if makes else ['General'],
            'topics': topics if topics else ['General'],
            'has_html': len(html_files) > 0,
            'has_images': has_images,
            'has_txt': has_txt,
            'public': False,
        }

        existing.append(entry)
        new_entries += 1

    # Save
    with open(manifest_path, 'w') as f:
        json.dump(existing, f, indent=2)

    return len(existing), new_entries


def main():
    print("=" * 70)
    print("📦 Full GDrive Corpus Sync (Last 150 Days)")
    print("=" * 70)

    EXPORTS_DIR.mkdir(exist_ok=True)
    PLAINTEXT_DIR.mkdir(parents=True, exist_ok=True)

    # Connect
    print("\n🔐 Connecting to Google Drive...")
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)

    about = service.about().get(fields="user").execute()
    print(f"   ✅ Connected as: {about['user'].get('emailAddress', 'Unknown')}")

    # Get existing local files
    existing_html, existing_txt = get_existing_local()
    print(f"\n📁 Local state:")
    print(f"   HTML exports: {len(existing_html)}")
    print(f"   Plaintext: {len(existing_txt)}")

    # Search GDrive
    print(f"\n🔍 Searching GDrive (last {DAYS_BACK} days)...")
    all_docs = search_all_docs(service, DAYS_BACK)

    # Determine what needs downloading
    need_html = []
    need_txt = []

    for doc_id, doc in all_docs.items():
        safe_name = sanitize_filename(doc['name'])
        if safe_name not in existing_html:
            need_html.append((doc_id, doc))
        if safe_name not in existing_txt:
            need_txt.append((doc_id, doc))

    print(f"\n📊 Sync plan:")
    print(f"   GDrive docs (last {DAYS_BACK} days): {len(all_docs)}")
    print(f"   Need HTML zip download: {len(need_html)}")
    print(f"   Need plaintext download: {len(need_txt)}")

    # Download HTML zips
    if need_html:
        print(f"\n📥 Downloading {len(need_html)} HTML zip exports...")
        success = 0
        for i, (doc_id, doc) in enumerate(need_html, 1):
            print(f"  [{i}/{len(need_html)}] {doc['name'][:60]}...")
            ok, result = download_zip_html(service, doc_id, doc['name'], EXPORTS_DIR)
            if ok:
                print(f"    ✅ {result}")
                success += 1
            else:
                print(f"    ❌ {result}")
        print(f"  HTML downloads: {success}/{len(need_html)} successful")

    # Download plaintext
    if need_txt:
        print(f"\n📝 Downloading {len(need_txt)} plaintext exports...")
        success = 0
        for i, (doc_id, doc) in enumerate(need_txt, 1):
            print(f"  [{i}/{len(need_txt)}] {doc['name'][:60]}...")
            ok, result, size = download_plaintext(service, doc_id, doc['name'], PLAINTEXT_DIR)
            if ok:
                print(f"    ✅ {result} ({size:,} bytes)")
                success += 1
            else:
                print(f"    ❌ {result}")
        print(f"  Plaintext downloads: {success}/{len(need_txt)} successful")

    # Update manifest
    print(f"\n📋 Updating manifest...")
    total, new = update_manifest(all_docs, EXPORTS_DIR, PLAINTEXT_DIR, MANIFEST_FILE)
    print(f"   Total manifest entries: {total} ({new} new)")

    # Final verification
    print(f"\n{'=' * 70}")
    print("✅ Sync complete!")
    html_final, txt_final = get_existing_local()
    print(f"   HTML exports: {len(html_final)}")
    print(f"   Plaintext: {len(txt_final)}")

    # Check pairing
    both = html_final & txt_final
    html_only = html_final - txt_final
    txt_only = txt_final - html_final
    print(f"   Paired (HTML + txt): {len(both)}")
    if html_only:
        print(f"   HTML only (missing txt): {len(html_only)}")
    if txt_only:
        print(f"   Txt only (missing HTML): {len(txt_only)}")
    print(f"{'=' * 70}")


if __name__ == '__main__':
    main()
