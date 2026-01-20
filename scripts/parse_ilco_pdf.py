#!/usr/bin/env python3
"""
Parse Ilco Auto/Truck Key Blank Reference PDFs using Gemini Vision API.
Outputs structured JSON for database ingestion.

Usage:
    python scripts/parse_ilco_pdf.py assets/2023-auto-truck-key-blank-reference.pdf --output data/ilco_2023.json
    python scripts/parse_ilco_pdf.py assets/2025-auto-truck-key-blank-reference-guide.pdf --output data/ilco_2025.json
"""

import os
import sys
import json
import time
import argparse
import re
from pathlib import Path

# Try to import google.generativeai
try:
    import google.generativeai as genai
except ImportError:
    print("Error: google-generativeai not installed. Run: pip install google-generativeai")
    sys.exit(1)

# Configuration
API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCb8fOkvswJMOhIOitjrQWwDYfcFu2jml0")

# Priority makes to process first (top 10 by market share)
PRIORITY_MAKES = [
    "Toyota", "Lexus",
    "Honda", "Acura", 
    "Ford", "Lincoln",
    "Chevrolet", "GMC", "Buick", "Cadillac",  # GM
    "Chrysler", "Dodge", "Jeep", "Ram",  # Stellantis
    "Nissan", "Infiniti",
    "Hyundai", "Kia", "Genesis",
    "BMW", "Mini",
    "Mercedes", "Mercedes-Benz",
    "Volkswagen", "VW", "Audi"
]

def parse_year_range(year_str):
    """Parse year range string like '2018-2022' or '2020' into (start, end) tuple."""
    if not year_str:
        return None, None
    
    year_str = str(year_str).strip()
    
    # Handle "Present" or "current"
    year_str = re.sub(r'(?i)present|current', '2025', year_str)
    
    # Handle ranges like "2018-2022" or "2018–2022"
    match = re.match(r'(\d{4})\s*[-–]\s*(\d{4})', year_str)
    if match:
        return int(match.group(1)), int(match.group(2))
    
    # Handle single year
    match = re.match(r'(\d{4})', year_str)
    if match:
        year = int(match.group(1))
        return year, year
    
    return None, None


def extract_key_blanks_from_page(model, file_ref, page_num, makes_filter=None):
    """Extract key blank data from a specific page using Gemini."""
    
    filter_instruction = ""
    if makes_filter:
        makes_list = ", ".join(makes_filter[:10])  # Limit to avoid token bloat
        filter_instruction = f"Focus primarily on these makes if present: {makes_list}. But include all makes found."
    
    prompt = f"""
Analyze page {page_num} of this Ilco Auto/Truck Key Blank Reference PDF.

{filter_instruction}

Extract ALL key blank entries visible on this page. For each entry, capture:
- make: Vehicle manufacturer
- model: Vehicle model (or "ALL" if applies to all models)
- year_range: Year or year range (e.g., "2018-2022")
- ilco_ref: Ilco part number (e.g., "HO01T5", "B111-PT")
- blade_profile: Key blade/keyway code if shown
- key_type: "Mechanical", "Transponder", "Remote Head", "Flip Key", "Smart Key", or "Prox"
- chip_type: Transponder chip type if shown (e.g., "ID46", "4D63", "H chip")
- cloneable: true/false if indicated
- oem_ref: OEM part number if shown
- notes: Any special notes or warnings

Return a JSON array of objects. If no key data is found on this page (e.g., it's a title page or index), return an empty array [].

Example output format:
[
    {{
        "make": "Honda",
        "model": "Accord",
        "year_range": "2018-2022",
        "ilco_ref": "HO01T5",
        "blade_profile": "HON66R",
        "key_type": "Transponder",
        "chip_type": "ID47",
        "cloneable": false,
        "oem_ref": "35118-TVA-A10",
        "notes": null
    }}
]

Return ONLY valid JSON, no other text.
"""
    
    try:
        response = model.generate_content([file_ref, prompt])
        text = response.text.strip()
        
        # Clean up JSON response
        text = text.replace("```json", "").replace("```", "").strip()
        
        # Parse JSON
        entries = json.loads(text)
        
        # Post-process entries
        processed = []
        for entry in entries:
            if not entry.get("make"):
                continue
                
            year_start, year_end = parse_year_range(entry.get("year_range"))
            
            processed.append({
                "make": entry.get("make", "").strip(),
                "model": entry.get("model", "").strip() or None,
                "year_start": year_start,
                "year_end": year_end,
                "ilco_ref": entry.get("ilco_ref", "").strip() or None,
                "blade_profile": entry.get("blade_profile", "").strip() or None,
                "key_type": entry.get("key_type", "").strip() or None,
                "chip_type": entry.get("chip_type", "").strip() or None,
                "cloneable": bool(entry.get("cloneable", False)),
                "oem_ref": entry.get("oem_ref", "").strip() or None,
                "notes": entry.get("notes", "").strip() if entry.get("notes") else None
            })
        
        return processed
        
    except json.JSONDecodeError as e:
        print(f"  Warning: JSON parse error on page {page_num}: {e}")
        return []
    except Exception as e:
        print(f"  Error on page {page_num}: {e}")
        return []


def parse_pdf(pdf_path, output_path, priority_only=False, max_pages=None, start_page=1):
    """Parse entire Ilco PDF and save results to JSON."""
    
    genai.configure(api_key=API_KEY)
    
    pdf_path = Path(pdf_path)
    output_path = Path(output_path)
    
    if not pdf_path.exists():
        print(f"Error: PDF not found: {pdf_path}")
        return
    
    print(f"Uploading {pdf_path.name} to Gemini...")
    try:
        uploaded_file = genai.upload_file(path=str(pdf_path), display_name=pdf_path.stem)
        print(f"  Uploaded: {uploaded_file.name}")
    except Exception as e:
        print(f"Error uploading file: {e}")
        return
    
    # Wait for processing
    wait_count = 0
    while uploaded_file.state.name == "PROCESSING":
        wait_count += 1
        print(f"  Processing... ({wait_count * 5}s)")
        time.sleep(5)
        uploaded_file = genai.get_file(uploaded_file.name)
        if wait_count > 60:  # 5 minute timeout
            print("Error: File processing timeout")
            return
    
    if uploaded_file.state.name == "FAILED":
        print("Error: File processing failed")
        return
    
    print("File ready!")
    
    # Initialize model
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # First, get the page count
    print("Analyzing document structure...")
    try:
        response = model.generate_content([
            uploaded_file,
            "How many pages does this PDF have? Return just the number."
        ])
        total_pages = int(re.search(r'\d+', response.text).group())
        print(f"  Total pages: {total_pages}")
    except:
        total_pages = 200  # Fallback estimate
        print(f"  Could not determine page count, using estimate: {total_pages}")
    
    if max_pages:
        total_pages = min(total_pages, max_pages + start_page - 1)
    
    # Process pages
    all_entries = []
    makes_filter = PRIORITY_MAKES if priority_only else None
    
    print(f"\nExtracting key blank data from pages {start_page}-{total_pages}...")
    
    for page_num in range(start_page, total_pages + 1):
        print(f"  Page {page_num}/{total_pages}...", end=" ", flush=True)
        
        entries = extract_key_blanks_from_page(model, uploaded_file, page_num, makes_filter)
        
        if entries:
            all_entries.extend(entries)
            print(f"found {len(entries)} entries")
        else:
            print("no data")
        
        # Rate limiting - be gentle with API
        time.sleep(1)
        
        # Save progress every 10 pages
        if page_num % 10 == 0:
            temp_output = output_path.with_suffix('.partial.json')
            with open(temp_output, 'w', encoding='utf-8') as f:
                json.dump(all_entries, f, indent=2)
            print(f"    Progress saved: {len(all_entries)} total entries")
    
    # Deduplicate entries
    seen = set()
    unique_entries = []
    for entry in all_entries:
        key = (
            entry['make'], 
            entry['model'], 
            entry['year_start'], 
            entry['year_end'], 
            entry['ilco_ref']
        )
        if key not in seen:
            seen.add(key)
            unique_entries.append(entry)
    
    print(f"\nTotal entries: {len(all_entries)}")
    print(f"Unique entries: {len(unique_entries)}")
    
    # Save final output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_entries, f, indent=2)
    
    print(f"Saved to: {output_path}")
    
    # Clean up uploaded file
    try:
        genai.delete_file(uploaded_file.name)
        print("Cleaned up uploaded file")
    except:
        pass
    
    # Print summary by make
    print("\n=== Summary by Make ===")
    make_counts = {}
    for entry in unique_entries:
        make = entry['make']
        make_counts[make] = make_counts.get(make, 0) + 1
    
    for make, count in sorted(make_counts.items(), key=lambda x: -x[1])[:20]:
        print(f"  {make}: {count}")


def main():
    parser = argparse.ArgumentParser(description="Parse Ilco PDF catalogs using Gemini Vision API")
    parser.add_argument("pdf", help="Path to Ilco PDF file")
    parser.add_argument("--output", "-o", default=None, help="Output JSON path")
    parser.add_argument("--priority-only", action="store_true", help="Only extract priority makes")
    parser.add_argument("--max-pages", type=int, default=None, help="Maximum pages to process")
    parser.add_argument("--start-page", type=int, default=1, help="Start from this page number")
    
    args = parser.parse_args()
    
    pdf_path = Path(args.pdf)
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = Path("data") / f"{pdf_path.stem}.json"
    
    parse_pdf(
        pdf_path=pdf_path,
        output_path=output_path,
        priority_only=args.priority_only,
        max_pages=args.max_pages,
        start_page=args.start_page
    )


if __name__ == "__main__":
    main()
