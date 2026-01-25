#!/usr/bin/env python3
"""
Create a comprehensive dossier manifest from Google Drive locksmith documents.
- Makes each doc public ("Anyone with link can view")
- Extracts tags: makes, models, years, topics
- Creates a JSON manifest for the dossier library
"""

import json
import re
from pathlib import Path
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

PROJECT_ROOT = Path(__file__).parent.parent
TOKEN_FILE = PROJECT_ROOT / "gdrive_token.json"
OUTPUT_FILE = PROJECT_ROOT / "data" / "dossier_manifest.json"

# Make extraction patterns
MAKES = [
    "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", 
    "Chrysler", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda",
    "Hyundai", "Infiniti", "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus",
    "Lincoln", "Maserati", "Mazda", "Mercedes", "Mercedes-Benz", "Mini",
    "Mitsubishi", "Nissan", "Porsche", "Ram", "Rivian", "Subaru", "Tesla",
    "Toyota", "Volkswagen", "VW", "Volvo"
]

TOPICS = [
    ("AKL", ["akl", "all keys lost", "all-keys-lost"]),
    ("Key Programming", ["key programming", "program key", "programming procedure"]),
    ("Immobilizer", ["immobilizer", "immo", "immobiliser"]),
    ("Security Gateway", ["sgw", "security gateway", "gateway bypass"]),
    ("Smart Key", ["smart key", "proximity key", "peps", "keyless"]),
    ("PATS", ["pats", "passive anti-theft"]),
    ("FCC ID", ["fcc id", "fcc-id"]),
    ("Chip", ["transponder", "chip", "id46", "id48", "4d", "8a"]),
    ("CAN-FD", ["can-fd", "can fd", "canfd"]),
    ("Remote", ["remote", "fob", "keyfob"]),
    ("Blade", ["blade", "key blade", "emergency key"]),
    ("Pin Code", ["pin code", "pincode", "security code"]),
    ("EEPROM", ["eeprom", "dump", "read ecu"]),
    ("OBD", ["obd", "obd2", "obdii", "on-board"]),
]

PLATFORMS = [
    ("MQB", ["mqb"]),
    ("MQB-Evo", ["mqb-evo", "mqb evo"]),
    ("MLB-Evo", ["mlb-evo", "mlb evo"]),
    ("CAS", ["cas3", "cas4", "cas4+"]),
    ("FEM/BDC", ["fem", "bdc", "fem/bdc"]),
    ("TNGA", ["tnga", "tnga-k", "tnga-f"]),
    ("Global A", ["global a", "global-a"]),
    ("Global B", ["global b", "global-b"]),
    ("T1XX", ["t1xx"]),
    ("E2XX", ["e2xx"]),
    ("CD6", ["cd6"]),
    ("FBS4", ["fbs4", "fbs 4"]),
    ("FBS5", ["fbs5", "fbs 5"]),
    ("RF Hub", ["rf hub", "rfhub"]),
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

def extract_tags(title, content=""):
    """Extract makes, topics, platforms, and year ranges from title and content."""
    text = (title + " " + content).lower()
    
    # Extract makes
    makes = []
    for make in MAKES:
        if make.lower() in text:
            # Normalize VW -> Volkswagen
            if make == "VW":
                make = "Volkswagen"
            if make == "Mercedes":
                make = "Mercedes-Benz"
            if make not in makes:
                makes.append(make)
    
    # Handle combined makes
    if "vag" in text:
        for m in ["Volkswagen", "Audi", "Porsche"]:
            if m not in makes:
                makes.append(m)
    if "stellantis" in text:
        for m in ["Chrysler", "Dodge", "Jeep", "Ram", "Fiat", "Alfa Romeo"]:
            if m not in makes:
                makes.append(m)
    if "jlr" in text:
        for m in ["Jaguar", "Land Rover"]:
            if m not in makes:
                makes.append(m)
    if "gm" in text or "general motors" in text:
        for m in ["Chevrolet", "GMC", "Cadillac", "Buick"]:
            if m not in makes:
                makes.append(m)
    
    # Extract topics
    topics = []
    for topic_name, keywords in TOPICS:
        for kw in keywords:
            if kw in text:
                if topic_name not in topics:
                    topics.append(topic_name)
                break
    
    # Extract platforms
    platforms = []
    for platform_name, keywords in PLATFORMS:
        for kw in keywords:
            if kw in text:
                if platform_name not in platforms:
                    platforms.append(platform_name)
                break
    
    # Extract years
    years = []
    year_matches = re.findall(r'\b(19\d{2}|20[0-2]\d)\b', text)
    for y in year_matches:
        year = int(y)
        if 1990 <= year <= 2030 and year not in years:
            years.append(year)
    years.sort()
    
    return {
        "makes": makes,
        "topics": topics,
        "platforms": platforms,
        "years": years
    }

def make_public(service, file_id, file_name):
    """Make a document public (anyone with link can view)."""
    try:
        # Check if already public
        perms = service.permissions().list(
            fileId=file_id, 
            fields='permissions(type, role)'
        ).execute()
        
        for p in perms.get('permissions', []):
            if p.get('type') == 'anyone':
                return True  # Already public
        
        # Make public
        permission = {'type': 'anyone', 'role': 'reader'}
        service.permissions().create(
            fileId=file_id,
            body=permission,
            fields='id'
        ).execute()
        print(f"  ✅ Made public: {file_name[:50]}")
        return True
    except Exception as e:
        print(f"  ❌ Failed to make public: {file_name[:40]} - {e}")
        return False

def extract_sections(docs_service, doc_id):
    """Extract document sections with their headings and content."""
    sections = []
    try:
        doc_content = docs_service.documents().get(documentId=doc_id).execute()
        body = doc_content.get('body', {}).get('content', [])
        
        current_section = {"heading": "Introduction", "content": "", "level": 0}
        
        for elem in body:
            if 'paragraph' in elem:
                para = elem['paragraph']
                style = para.get('paragraphStyle', {}).get('namedStyleType', '')
                
                # Get text content
                text = ""
                for pe in para.get('elements', []):
                    if 'textRun' in pe:
                        text += pe['textRun'].get('content', '')
                
                text = text.strip()
                if not text:
                    continue
                
                # Check if this is a heading
                if style.startswith('HEADING'):
                    # Save previous section if it has content
                    if current_section["content"].strip():
                        sections.append(current_section)
                    
                    # Start new section
                    level = int(style.replace('HEADING_', '')) if '_' in style else 1
                    current_section = {"heading": text, "content": "", "level": level}
                else:
                    # Append to current section
                    current_section["content"] += text + " "
        
        # Don't forget the last section
        if current_section["content"].strip():
            sections.append(current_section)
        
    except Exception as e:
        print(f"     Error reading doc: {e}")
    
    return sections

def main():
    print("=" * 60)
    print("📚 DOSSIER MANIFEST CREATOR (Section-Level Tagging)")
    print("=" * 60)
    
    creds = get_credentials()
    drive_service = build('drive', 'v3', credentials=creds)
    docs_service = build('docs', 'v1', credentials=creds)
    
    # Get all Google Docs
    print("\n🔍 Finding all locksmith documents...")
    all_docs = []
    page_token = None
    while True:
        response = drive_service.files().list(
            q="mimeType='application/vnd.google-apps.document'",
            spaces='drive',
            fields='nextPageToken, files(id, name, webViewLink, modifiedTime)',
            pageSize=100,
            pageToken=page_token
        ).execute()
        all_docs.extend(response.get('files', []))
        page_token = response.get('nextPageToken')
        if not page_token:
            break
    
    # Filter to locksmith docs
    locksmith_keywords = [
        'locksmith', 'key', 'immobilizer', 'programming', 'akl', 'pats', 
        'fcc', 'dossier', 'security', 'sgw', 'chip', 'fob', 'pearl',
        'bmw', 'mercedes', 'audi', 'vw', 'vag', 'ford', 'gm', 'toyota',
        'honda', 'nissan', 'mazda', 'subaru', 'stellantis', 'jeep',
        'chrysler', 'dodge', 'ram', 'cadillac', 'chevrolet', 'lexus',
        'acura', 'infiniti', 'hyundai', 'kia', 'volvo', 'porsche',
        'jaguar', 'land rover', 'jlr', 'tesla', 'rivian', 'genesis', 'alfa'
    ]
    
    locksmith_docs = []
    for doc in all_docs:
        name_lower = doc['name'].lower()
        if any(kw in name_lower for kw in locksmith_keywords):
            locksmith_docs.append(doc)
    
    print(f"   Found {len(locksmith_docs)} locksmith documents")
    
    # Process each document
    print("\n📝 Processing documents with section-level tagging...")
    manifest = []
    
    for i, doc in enumerate(locksmith_docs, 1):
        doc_id = doc['id']
        doc_name = doc['name']
        
        print(f"\n[{i}/{len(locksmith_docs)}] {doc_name[:55]}...")
        
        # Make public
        is_public = make_public(drive_service, doc_id, doc_name)
        
        # Extract sections
        sections = extract_sections(docs_service, doc_id)
        
        # Tag each section
        tagged_sections = []
        all_makes = set()
        all_topics = set()
        all_platforms = set()
        all_years = set()
        
        for section in sections:
            section_tags = extract_tags(section["heading"], section["content"][:1500])
            tagged_sections.append({
                "heading": section["heading"],
                "level": section["level"],
                "preview": section["content"][:300].strip(),
                "makes": section_tags["makes"],
                "topics": section_tags["topics"],
                "platforms": section_tags["platforms"],
                "years": section_tags["years"]
            })
            all_makes.update(section_tags["makes"])
            all_topics.update(section_tags["topics"])
            all_platforms.update(section_tags["platforms"])
            all_years.update(section_tags["years"])
        
        # Also tag the title
        title_tags = extract_tags(doc_name, "")
        all_makes.update(title_tags["makes"])
        all_topics.update(title_tags["topics"])
        all_platforms.update(title_tags["platforms"])
        
        # Build embed URL
        embed_url = f"https://docs.google.com/document/d/{doc_id}/preview"
        view_url = doc.get('webViewLink', f"https://docs.google.com/document/d/{doc_id}/edit")
        
        entry = {
            "id": doc_id,
            "title": doc_name,
            "embed_url": embed_url,
            "view_url": view_url,
            "modified": doc.get('modifiedTime', ''),
            "is_public": is_public,
            # Document-level aggregated tags
            "makes": sorted(list(all_makes)),
            "topics": sorted(list(all_topics)),
            "platforms": sorted(list(all_platforms)),
            "years": sorted(list(all_years)),
            # Section-level details
            "sections": tagged_sections
        }
        manifest.append(entry)
        
        print(f"     Sections: {len(tagged_sections)}")
        print(f"     Makes: {', '.join(sorted(all_makes)[:5]) or 'N/A'}")
        print(f"     Topics: {', '.join(sorted(all_topics)[:4]) or 'N/A'}")
    
    # Save manifest
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✅ Manifest saved to {OUTPUT_FILE}")
    print(f"   Total documents: {len(manifest)}")
    print(f"   Made public: {sum(1 for m in manifest if m['is_public'])}")
    print(f"   Total sections tagged: {sum(len(m['sections']) for m in manifest)}")
    print("=" * 60)

if __name__ == '__main__':
    main()
