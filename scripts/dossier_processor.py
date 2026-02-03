#!/usr/bin/env python3
"""
Unified Dossier Processor
Single-pass extraction system for procedures, pearls, glossary terms, and vehicle metadata.
Builds an indexed manifest for fast re-queries.
"""
import json
import os
import re
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple

DOSSIERS_DIR = "data/gdrive_plaintext"
OUTPUT_MANIFEST = "data/dossier_extraction_manifest.json"

# Extraction markers for fingerprinting
MARKERS = {
    'procedures': {
        'high': ['Method A:', 'Method B:', 'Step 1:', 'Step-by-Step', 'Add Key Procedure', 'All Keys Lost Procedure'],
        'medium': ['1. Preparation:', '1. Vehicle Connection:', 'AKL', 'Onboard Programming'],
        'low': ['key learning', 'key programming', 'programming procedure']
    },
    'pearls': {
        'high': ['Pearl:', 'Critical Warning:', 'Locksmith Insight:', 'Pro Tip:'],
        'medium': ['Warning:', 'Caution:', 'Important:', 'Note:'],
        'low': ['must be', 'do not', 'never', 'always']
    },
    'glossary': {
        'high': ['CAN-FD', 'MQB-Evo', 'Global B', 'FBS4', 'PEPS', 'SGW', 'BCM', 'ECM'],
        'medium': ['immobilizer', 'transponder', 'encryption', 'authentication'],
        'low': ['module', 'gateway', 'protocol']
    },
    'vehicles': {
        'high': ['MY20', 'MY21', 'MY22', 'MY23', 'MY24', 'MY25'],
        'medium': ['Silverado', 'Tahoe', 'Camry', 'F-150', 'Accord', 'Rogue', 'Wrangler'],
        'low': ['Chevrolet', 'Ford', 'Toyota', 'Honda', 'Nissan', 'Jeep', 'BMW', 'Mercedes']
    }
}

MAKES_MAP = {
    'toyota': 'Toyota', 'lexus': 'Lexus', 'scion': 'Scion',
    'honda': 'Honda', 'acura': 'Acura',
    'nissan': 'Nissan', 'infiniti': 'Infiniti',
    'ford': 'Ford', 'lincoln': 'Lincoln',
    'chevrolet': 'Chevrolet', 'gmc': 'GMC', 'cadillac': 'Cadillac', 'buick': 'Buick',
    'dodge': 'Dodge', 'jeep': 'Jeep', 'ram': 'RAM', 'chrysler': 'Chrysler',
    'bmw': 'BMW', 'mercedes': 'Mercedes-Benz', 'audi': 'Audi',
    'volkswagen': 'Volkswagen', 'vw': 'Volkswagen', 'porsche': 'Porsche',
    'volvo': 'Volvo', 'mazda': 'Mazda', 'subaru': 'Subaru',
    'hyundai': 'Hyundai', 'kia': 'Kia', 'genesis': 'Genesis',
    'mitsubishi': 'Mitsubishi', 'jaguar': 'Jaguar', 'land rover': 'Land Rover',
    'tesla': 'Tesla', 'rivian': 'Rivian', 'alfa romeo': 'Alfa Romeo',
    'stellantis': 'Stellantis', 'fca': 'FCA'
}


def file_hash(path: str) -> str:
    """Generate MD5 hash of file for change detection."""
    with open(path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()[:12]


def fingerprint_content(content: str) -> Dict[str, float]:
    """Score content for each extraction type based on marker presence."""
    content_lower = content.lower()
    scores = {}
    
    for extract_type, marker_levels in MARKERS.items():
        score = 0
        # High markers = 3 points each, Medium = 2, Low = 1
        for marker in marker_levels['high']:
            if marker.lower() in content_lower:
                score += 3
        for marker in marker_levels['medium']:
            if marker.lower() in content_lower:
                score += 2
        for marker in marker_levels['low']:
            if marker.lower() in content_lower:
                score += 1
        
        # Normalize to 0-1 (cap at 20 points)
        scores[extract_type] = min(score / 20.0, 1.0)
    
    return scores


def detect_makes_mentioned(content: str) -> List[str]:
    """Find automotive makes mentioned in content."""
    content_lower = content.lower()
    makes = []
    for key, val in MAKES_MAP.items():
        if key in content_lower and val not in makes:
            makes.append(val)
    return makes


def extract_procedure_segments(content: str, lines: List[str]) -> List[Dict]:
    """Find procedure sections with line numbers."""
    segments = []
    
    # Find Add Key sections
    for i, line in enumerate(lines):
        line_lower = line.lower()
        
        # Detect Add Key start
        if any(m in line_lower for m in ['method a:', 'onboard programming', 'add key procedure']):
            seg = find_segment_end(lines, i, ['method b:', 'all keys lost', 'troubleshooting'])
            if seg:
                steps = count_numbered_steps('\n'.join(lines[i:seg['end_line']]))
                if steps >= 2:
                    segments.append({
                        'type': 'procedure',
                        'subtype': 'ADD_KEY',
                        'start_line': i + 1,
                        'end_line': seg['end_line'] + 1,
                        'steps_detected': steps,
                        'heading': line.strip()[:100]
                    })
        
        # Detect AKL start
        if any(m in line_lower for m in ['method b:', 'all keys lost', 'akl procedure', 'diagnostic programming']):
            seg = find_segment_end(lines, i, ['troubleshooting', 'resources', 'appendix', 'critical warnings'])
            if seg:
                steps = count_numbered_steps('\n'.join(lines[i:seg['end_line']]))
                if steps >= 2:
                    segments.append({
                        'type': 'procedure',
                        'subtype': 'AKL',
                        'start_line': i + 1,
                        'end_line': seg['end_line'] + 1,
                        'steps_detected': steps,
                        'heading': line.strip()[:100]
                    })
    
    return segments


def find_segment_end(lines: List[str], start: int, end_markers: List[str]) -> Optional[Dict]:
    """Find where a segment ends based on markers."""
    for i in range(start + 1, min(start + 150, len(lines))):  # Cap at 150 lines
        line_lower = lines[i].lower()
        for marker in end_markers:
            if marker in line_lower:
                return {'end_line': i}
    
    # Default: 100 lines or end of file
    return {'end_line': min(start + 100, len(lines))}


def count_numbered_steps(content: str) -> int:
    """Count numbered steps like '1. Title:' or 'Step 1:'."""
    pattern = r'(?:^|\n)\s*\d+\.\s+[A-Z]'
    return len(re.findall(pattern, content))


def extract_pearl_segments(content: str, lines: List[str]) -> List[Dict]:
    """Find pearl/warning segments."""
    segments = []
    
    for i, line in enumerate(lines):
        # Look for explicit pearls or warnings
        for marker in ['Pearl:', 'Warning:', 'Critical:', 'Caution:', 'Important:', 'Tip:', 'Insight:']:
            if marker in line:
                # Get content until next paragraph break
                content_lines = [line]
                for j in range(i + 1, min(i + 10, len(lines))):
                    if lines[j].strip() == '' or re.match(r'^\d+\.', lines[j]):
                        break
                    content_lines.append(lines[j])
                
                full_content = ' '.join(content_lines)
                if len(full_content) > 30:
                    segments.append({
                        'type': 'pearl',
                        'subtype': marker.rstrip(':').lower(),
                        'line': i + 1,
                        'preview': full_content[:200]
                    })
    
    return segments[:20]  # Cap at 20 pearls per file


def extract_glossary_segments(content: str, lines: List[str]) -> List[Dict]:
    """Find glossary-worthy terms with definitions."""
    segments = []
    glossary_terms = ['CAN-FD', 'MQB-Evo', 'Global B', 'Global A', 'FBS4', 'FBS3', 'PEPS', 
                      'SGW', 'BCM', 'ECM', 'VIP', 'T1XX', 'E2XX', 'TNGA', 'DST-AES']
    
    for i, line in enumerate(lines):
        for term in glossary_terms:
            if term in line and (':' in line or 'is' in line.lower()):
                # Likely a definition
                segments.append({
                    'type': 'glossary',
                    'term': term,
                    'line': i + 1,
                    'context': line.strip()[:150]
                })
    
    return segments[:15]  # Cap at 15 per file


def process_dossier(filepath: str) -> Dict:
    """Process a single dossier file and return manifest entry."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    lines = content.split('\n')
    filename = Path(filepath).name
    
    # Fingerprint
    scores = fingerprint_content(content)
    makes = detect_makes_mentioned(content)
    
    # Extract segments
    procedure_segs = extract_procedure_segments(content, lines)
    pearl_segs = extract_pearl_segments(content, lines)
    glossary_segs = extract_glossary_segments(content, lines)
    
    return {
        'id': Path(filepath).stem,
        'filename': filename,
        'path': filepath,
        'file_hash': file_hash(filepath),
        'line_count': len(lines),
        'char_count': len(content),
        'scores': scores,
        'makes_mentioned': makes,
        'segments': {
            'procedures': procedure_segs,
            'pearls': pearl_segs,
            'glossary': glossary_segs
        },
        'summary': {
            'procedure_count': len(procedure_segs),
            'pearl_count': len(pearl_segs),
            'glossary_count': len(glossary_segs),
            'total_steps': sum(s.get('steps_detected', 0) for s in procedure_segs)
        }
    }


def main():
    """Process all dossiers and build manifest."""
    txt_files = sorted([f for f in os.listdir(DOSSIERS_DIR) if f.endswith('.txt')])
    
    print(f"Processing {len(txt_files)} dossier files...")
    
    manifest = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'total_files': len(txt_files),
            'version': '1.0'
        },
        'dossiers': [],
        'summary': {
            'with_procedures': 0,
            'with_pearls': 0,
            'with_glossary': 0,
            'total_procedures': 0,
            'total_pearls': 0,
            'total_glossary': 0,
            'total_steps': 0
        }
    }
    
    for i, filename in enumerate(txt_files):
        filepath = os.path.join(DOSSIERS_DIR, filename)
        try:
            entry = process_dossier(filepath)
            manifest['dossiers'].append(entry)
            
            # Update summary
            if entry['summary']['procedure_count'] > 0:
                manifest['summary']['with_procedures'] += 1
            if entry['summary']['pearl_count'] > 0:
                manifest['summary']['with_pearls'] += 1
            if entry['summary']['glossary_count'] > 0:
                manifest['summary']['with_glossary'] += 1
            
            manifest['summary']['total_procedures'] += entry['summary']['procedure_count']
            manifest['summary']['total_pearls'] += entry['summary']['pearl_count']
            manifest['summary']['total_glossary'] += entry['summary']['glossary_count']
            manifest['summary']['total_steps'] += entry['summary']['total_steps']
            
            if (i + 1) % 50 == 0:
                print(f"  Processed {i + 1}/{len(txt_files)}")
                
        except Exception as e:
            print(f"  ERROR: {filename}: {e}")
    
    # Save manifest
    with open(OUTPUT_MANIFEST, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n=== MANIFEST COMPLETE ===")
    print(f"Files processed: {len(manifest['dossiers'])}")
    print(f"With procedures: {manifest['summary']['with_procedures']}")
    print(f"With pearls: {manifest['summary']['with_pearls']}")
    print(f"With glossary: {manifest['summary']['with_glossary']}")
    print(f"Total procedure segments: {manifest['summary']['total_procedures']}")
    print(f"Total pearl segments: {manifest['summary']['total_pearls']}")
    print(f"Total steps detected: {manifest['summary']['total_steps']}")
    print(f"\nOutput: {OUTPUT_MANIFEST}")


if __name__ == "__main__":
    main()
