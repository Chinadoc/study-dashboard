#!/usr/bin/env python3
"""
Extract YouTube video links from dossier manifests and map them to vehicles.

This script parses the dossier_manifest.json file to find YouTube URLs in
section preview text, extracts video IDs, parses titles to match vehicles,
and outputs a JSON file ready for D1 database seeding.

Usage:
    python extract_youtube_links.py [--dry-run]
"""

import json
import re
import hashlib
from pathlib import Path
from collections import defaultdict
from typing import Optional

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DOSSIER_MANIFEST = PROJECT_ROOT / "data" / "dossier_manifest.json"
OUTPUT_FILE = PROJECT_ROOT / "data" / "extracted_youtube_videos.json"

# YouTube URL pattern - matches both youtube.com/watch?v= and youtu.be/ formats
YOUTUBE_PATTERN = re.compile(
    r'https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
    re.IGNORECASE
)

# Pattern to extract video title from citation format: "Title - YouTube, accessed..."
TITLE_PATTERN = re.compile(
    r'([^,\n]+?)\s*-\s*YouTube,?\s*accessed',
    re.IGNORECASE
)

# Alternative pattern for titles without "accessed" suffix
TITLE_ALT_PATTERN = re.compile(
    r'([^,\n]+?)\s*-\s*YouTube',
    re.IGNORECASE
)

# Common car makes for matching
CAR_MAKES = [
    "Acura", "Alfa Romeo", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
    "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "Infiniti",
    "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Maserati", "Mazda",
    "Mercedes-Benz", "Mercedes", "Mini", "Mitsubishi", "Nissan", "Porsche", "Ram", "RAM",
    "Rivian", "Subaru", "Tesla", "Toyota", "Volkswagen", "VW", "Volvo"
]

# Common tools for categorization
TOOLS = ["Autel", "IM608", "IM508", "Smart Pro", "SmartPro", "VVDI", "Xhorse", 
         "Lonsdor", "OBDSTAR", "Yanhua", "ACDP", "Key Tool"]


def extract_year_from_title(title: str) -> tuple[Optional[int], Optional[int]]:
    """Extract year or year range from video title."""
    # Look for patterns like "2020-2024", "2020 - 2024", "2020+"
    range_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4})', title)
    if range_match:
        return int(range_match.group(1)), int(range_match.group(2))
    
    # Look for "2020+" pattern
    plus_match = re.search(r'(\d{4})\+', title)
    if plus_match:
        return int(plus_match.group(1)), None  # None means "current"
    
    # Single year
    year_match = re.search(r'\b(20\d{2})\b', title)
    if year_match:
        year = int(year_match.group(1))
        return year, year
    
    return None, None


def extract_make_from_title(title: str) -> Optional[str]:
    """Extract car make from video title."""
    title_upper = title.upper()
    for make in CAR_MAKES:
        if make.upper() in title_upper:
            # Normalize some variations
            if make.upper() == "VW":
                return "Volkswagen"
            if make.upper() == "MERCEDES":
                return "Mercedes-Benz"
            if make.upper() == "RAM":
                return "Ram"
            return make
    return None


def extract_model_from_title(title: str, make: Optional[str]) -> Optional[str]:
    """Extract car model from video title."""
    if not make:
        return None
    
    # Common model patterns by make
    model_patterns = {
        "Kia": ["Telluride", "Sorento", "Sportage", "Forte", "K5", "Carnival", "Soul", "Seltos"],
        "Hyundai": ["Tucson", "Santa Fe", "Palisade", "Sonata", "Elantra", "Ioniq", "Kona"],
        "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "4Runner", "Tundra", "Tacoma", "Sienna", "Sequoia", "Land Cruiser"],
        "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Odyssey", "HR-V", "Passport", "Ridgeline"],
        "Ford": ["F-150", "F150", "Explorer", "Escape", "Bronco", "Mustang", "Edge", "Expedition", "Transit", "Ranger", "Fusion"],
        "Chevrolet": ["Silverado", "Tahoe", "Suburban", "Camaro", "Corvette", "Equinox", "Traverse", "Malibu", "Colorado", "Blazer"],
        "GMC": ["Sierra", "Yukon", "Acadia", "Terrain", "Canyon"],
        "Cadillac": ["Escalade", "CT5", "CT4", "XT5", "XT6"],
        "BMW": ["X5", "X3", "X1", "3 Series", "5 Series", "7 Series", "M3", "M5"],
        "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS"],
        "Volkswagen": ["Atlas", "Tiguan", "Jetta", "Passat", "Golf", "ID.4", "Arteon"],
        "Audi": ["A4", "A6", "Q5", "Q7", "Q3", "A3", "e-tron"],
        "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Gladiator", "Compass", "Renegade"],
        "Ram": ["1500", "2500", "3500", "ProMaster"],
        "Dodge": ["Charger", "Challenger", "Durango"],
        "Nissan": ["Altima", "Rogue", "Sentra", "Pathfinder", "Murano", "Maxima", "Frontier", "Titan"],
        "Lexus": ["RX", "ES", "NX", "GX", "LX", "IS"],
        "Acura": ["MDX", "RDX", "TLX", "ILX"],
        "Mazda": ["CX-5", "CX-9", "CX-30", "Mazda3", "Mazda6"],
        "Subaru": ["Outback", "Forester", "Crosstrek", "Impreza", "Ascent", "WRX"],
        "Volvo": ["XC90", "XC60", "XC40", "S60", "S90"],
        "Land Rover": ["Range Rover", "Discovery", "Defender", "Evoque"],
        "Jaguar": ["F-Pace", "E-Pace", "XF", "XE"],
        "Porsche": ["Cayenne", "Macan", "Panamera", "911", "Taycan"],
        "Genesis": ["GV80", "GV70", "G80", "G70"],
        "Mitsubishi": ["Outlander", "Eclipse Cross", "Mirage"],
        "Infiniti": ["QX60", "QX50", "Q50", "QX80"],
    }
    
    if make in model_patterns:
        for model in model_patterns[make]:
            # Normalize F-150 vs F150
            model_normalized = model.replace("-", "").upper()
            title_normalized = title.replace("-", "").upper()
            if model_normalized in title_normalized:
                return model
    
    return None


def extract_tool_from_title(title: str) -> Optional[str]:
    """Extract programming tool from video title."""
    title_lower = title.lower()
    for tool in TOOLS:
        if tool.lower() in title_lower:
            # Normalize tool names
            if tool in ["IM608", "IM508"]:
                return f"Autel {tool}"
            return tool
    return None


def generate_video_id(video_id: str, make: str, model: str) -> str:
    """Generate a unique ID for the database entry."""
    content = f"{video_id}_{make}_{model}"
    return hashlib.md5(content.encode()).hexdigest()[:16]


def extract_videos_from_manifest(manifest_path: Path) -> list[dict]:
    """Extract all YouTube videos from dossier manifest."""
    print(f"Reading manifest from: {manifest_path}")
    
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    videos = {}  # Use dict to deduplicate by video_id
    
    for dossier in manifest:
        dossier_id = dossier.get("id", "unknown")
        dossier_makes = dossier.get("makes", [])
        
        # Search through all sections
        for section in dossier.get("sections", []):
            preview = section.get("preview", "")
            
            # Find all YouTube URLs
            for match in YOUTUBE_PATTERN.finditer(preview):
                youtube_video_id = match.group(1)
                
                # Skip if already processed this video
                if youtube_video_id in videos:
                    continue
                
                # Try to extract title from context around the URL
                url_pos = match.start()
                # Look backwards for the title
                context_start = max(0, url_pos - 200)
                context = preview[context_start:url_pos + 100]
                
                # Extract title
                title = None
                title_match = TITLE_PATTERN.search(context)
                if title_match:
                    title = title_match.group(1).strip()
                else:
                    alt_match = TITLE_ALT_PATTERN.search(context)
                    if alt_match:
                        title = alt_match.group(1).strip()
                
                if not title:
                    title = f"Video from {dossier_id}"
                
                # Clean up title
                title = title.strip(". \n\t")
                if title.startswith(". "):
                    title = title[2:]
                
                # Extract vehicle info from title
                make = extract_make_from_title(title)
                model = extract_model_from_title(title, make)
                year_start, year_end = extract_year_from_title(title)
                tool = extract_tool_from_title(title)
                
                # Fallback to dossier makes if not found in title
                if not make and dossier_makes:
                    # Use first non-RAM make (RAM often appears as generic)
                    for dm in dossier_makes:
                        if dm != "RAM":
                            make = dm
                            break
                
                # Determine category based on title keywords
                title_lower = title.lower()
                if "all keys lost" in title_lower or "akl" in title_lower:
                    category = "akl"
                elif "add key" in title_lower or "duplicate" in title_lower:
                    category = "add_key"
                elif "programming" in title_lower or "program" in title_lower:
                    category = "programming"
                elif "bypass" in title_lower or "sgw" in title_lower:
                    category = "bypass"
                else:
                    category = "tutorial"
                
                videos[youtube_video_id] = {
                    "id": generate_video_id(youtube_video_id, make or "unknown", model or "unknown"),
                    "video_id": youtube_video_id,
                    "title": title,
                    "description": f"Extracted from dossier: {dossier_id}",
                    "category": category,
                    "tool": tool,
                    "related_make": make,
                    "related_model": model,
                    "related_year_start": year_start,
                    "related_year_end": year_end,
                    "source_dossier": dossier_id,
                    "youtube_url": f"https://www.youtube.com/watch?v={youtube_video_id}"
                }
    
    return list(videos.values())


def main():
    import sys
    
    dry_run = "--dry-run" in sys.argv
    
    print("=" * 60)
    print("YouTube Video Extractor for EuroKeys")
    print("=" * 60)
    
    if not DOSSIER_MANIFEST.exists():
        print(f"ERROR: Manifest not found at {DOSSIER_MANIFEST}")
        sys.exit(1)
    
    videos = extract_videos_from_manifest(DOSSIER_MANIFEST)
    
    print(f"\nExtracted {len(videos)} unique videos")
    
    # Statistics
    with_make = sum(1 for v in videos if v["related_make"])
    with_model = sum(1 for v in videos if v["related_model"])
    with_year = sum(1 for v in videos if v["related_year_start"])
    with_tool = sum(1 for v in videos if v["tool"])
    
    print(f"  - With make identified: {with_make}")
    print(f"  - With model identified: {with_model}")
    print(f"  - With year identified: {with_year}")
    print(f"  - With tool identified: {with_tool}")
    
    # Category breakdown
    categories = defaultdict(int)
    for v in videos:
        categories[v["category"]] += 1
    
    print("\nCategory breakdown:")
    for cat, count in sorted(categories.items()):
        print(f"  - {cat}: {count}")
    
    # Make breakdown
    makes = defaultdict(int)
    for v in videos:
        if v["related_make"]:
            makes[v["related_make"]] += 1
    
    print("\nTop makes:")
    for make, count in sorted(makes.items(), key=lambda x: -x[1])[:10]:
        print(f"  - {make}: {count}")
    
    if dry_run:
        print("\n[DRY RUN] Would write to:", OUTPUT_FILE)
        print("\nSample videos:")
        for v in videos[:5]:
            print(f"  - {v['title'][:60]}...")
            print(f"    Make: {v['related_make']}, Model: {v['related_model']}, Year: {v['related_year_start']}")
    else:
        # Write output
        output = {
            "metadata": {
                "total_videos": len(videos),
                "with_make": with_make,
                "with_model": with_model,
                "with_year": with_year,
                "with_tool": with_tool
            },
            "videos": videos
        }
        
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)
        
        print(f"\nWritten to: {OUTPUT_FILE}")
    
    print("\nDone!")


if __name__ == "__main__":
    main()
