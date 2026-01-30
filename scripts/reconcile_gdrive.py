#!/usr/bin/env python3
"""
Reconcile GDrive manifest with local files.
Identifies:
1. GDrive duplicates (same name, different doc IDs)
2. Local files matching GDrive entries
3. Files to prune (same content based on size + name)
"""

import json
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
MANIFEST_PATH = BASE_DIR / "data" / "gdrive_plaintext" / "download_manifest.json"
PLAINTEXT_DIR = BASE_DIR / "data" / "gdrive_plaintext"
GDRIVE_EXPORTS = BASE_DIR / "gdrive_exports"
OUTPUT_REPORT = BASE_DIR / "data" / "gdrive_reconciliation_report.json"


def load_manifest():
    """Load GDrive download manifest."""
    with open(MANIFEST_PATH, 'r') as f:
        return json.load(f)


def get_local_files():
    """Get list of local plaintext files with sizes."""
    files = {}
    for txt in PLAINTEXT_DIR.glob("*.txt"):
        files[txt.stem] = {
            'path': str(txt),
            'size': txt.stat().st_size,
            'name': txt.stem
        }
    return files


def analyze_gdrive_duplicates(manifest):
    """Find duplicate document names in GDrive (different IDs, same name)."""
    name_to_docs = defaultdict(list)
    
    for doc_id, doc_info in manifest.get('documents', {}).items():
        name = doc_info.get('name', '')
        name_to_docs[name].append({
            'id': doc_id,
            'name': name,
            'size': doc_info.get('size_bytes', 0),
            'modified': doc_info.get('modified', ''),
            'created': doc_info.get('created', ''),
            'filename': doc_info.get('filename', '')
        })
    
    # Find names with multiple docs
    duplicates = {name: docs for name, docs in name_to_docs.items() if len(docs) > 1}
    return duplicates, name_to_docs


def main():
    print("=" * 70)
    print("📊 GDRIVE RECONCILIATION REPORT")
    print("=" * 70)
    
    manifest = load_manifest()
    local_files = get_local_files()
    
    print(f"\n📁 GDrive manifest: {manifest.get('total_documents', 0)} documents")
    print(f"📁 Local plaintext: {len(local_files)} files")
    
    # Analyze GDrive duplicates
    duplicates, name_to_docs = analyze_gdrive_duplicates(manifest)
    
    print(f"\n🔍 GDrive duplicates (same name, different IDs): {len(duplicates)}")
    
    # Count by name frequency
    dup_counts = sorted([(name, len(docs)) for name, docs in duplicates.items()], 
                        key=lambda x: -x[1])
    
    print("\n--- Top Duplicates in GDrive ---")
    for name, count in dup_counts[:15]:
        print(f"  {count}x: {name[:60]}...")
    
    # Check which duplicates have identical sizes (likely true duplicates)
    true_duplicates = []
    for name, docs in duplicates.items():
        sizes = [d['size'] for d in docs]
        if len(set(sizes)) == 1:  # All same size
            true_duplicates.append({
                'name': name,
                'count': len(docs),
                'size': sizes[0],
                'docs': docs
            })
    
    print(f"\n✅ True duplicates (same name + same size): {len(true_duplicates)}")
    
    # Unique documents (after dedup)
    unique_count = len(name_to_docs)
    print(f"📄 Unique document names: {unique_count}")
    
    # Missing from local
    gdrive_names = set(name_to_docs.keys())
    local_names = set(local_files.keys())
    
    # Need to normalize names for comparison
    def normalize(name):
        return name.lower().replace('-', '_').replace(' ', '_').replace('/', '_')
    
    gdrive_normalized = {normalize(n): n for n in gdrive_names}
    local_normalized = {normalize(n): n for n in local_names}
    
    missing_locally = []
    for norm_name, orig_name in gdrive_normalized.items():
        if norm_name not in local_normalized:
            missing_locally.append(orig_name)
    
    print(f"\n⚠️  In GDrive but missing locally: {len(missing_locally)}")
    if missing_locally[:5]:
        for name in missing_locally[:5]:
            print(f"    - {name[:60]}")
    
    # Build report
    report = {
        'summary': {
            'gdrive_total': manifest.get('total_documents', 0),
            'gdrive_unique_names': unique_count,
            'gdrive_duplicate_groups': len(duplicates),
            'true_duplicates': len(true_duplicates),
            'local_files': len(local_files),
            'missing_locally': len(missing_locally)
        },
        'duplicates': [
            {
                'name': d['name'],
                'count': d['count'],
                'size': d['size']
            } for d in true_duplicates
        ],
        'missing_locally': missing_locally[:50]  # First 50
    }
    
    with open(OUTPUT_REPORT, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n✅ Report saved to: {OUTPUT_REPORT}")
    
    # Recommendations
    print("\n" + "=" * 70)
    print("💡 RECOMMENDATIONS")
    print("=" * 70)
    print(f"\n1. DELETE {len(true_duplicates)} duplicate documents from GDrive")
    print(f"   (Keep most recently modified, delete older copies)")
    print(f"\n2. DOWNLOAD {len(missing_locally)} missing documents to local")
    print(f"\n3. Total unique docs after cleanup: ~{unique_count}")


if __name__ == "__main__":
    main()
