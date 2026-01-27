#!/usr/bin/env python3
"""
Pearl Extraction v8 - Context-Preserving Multi-Level Extraction

Extracts pearls with full context preservation for LLM enhancement:
- Level 1: Document metadata (make/model/years from filename + title)
- Level 2: Section structure (H2/H3 → section types)
- Level 3: Entity pre-scan (FCC IDs, chips, Lishi, platforms)
- Level 4: Pearl candidates with context envelope

Output: JSON file ready for enhance_pearls_llm.py processing
"""

import os
import re
import json
import hashlib
from pathlib import Path
from bs4 import BeautifulSoup
from typing import Optional, Dict, List, Tuple
from collections import defaultdict

# ============================================
# CONFIGURATION
# ============================================

GDRIVE_DIR = Path("gdrive_exports")
OUTPUT_DIR = Path("data/pearl_extraction")

# Section type classification keywords
SECTION_TYPES = {
    "procedure": ["akl", "all keys lost", "programming", "add key", "procedure", "steps", "process", "method"],
    "hardware": ["key", "fob", "remote", "blade", "shell", "hardware", "part number", "fcc", "transponder"],
    "mechanical": ["lishi", "keyway", "decode", "cut", "bitting", "cylinder", "lock"],
    "security": ["immobilizer", "chip", "transponder", "bcm", "gateway", "sgw", "encryption", "security"],
    "tools": ["autel", "smart pro", "xtool", "vvdi", "lonsdor", "obdstar", "tool", "adapter"],
    "pricing": ["price", "cost", "charge", "fee", "quote", "dollars", "$"],
    "troubleshooting": ["problem", "issue", "fail", "error", "diagnostic", "symptom", "fix"],
}

# Vehicle make detection patterns
MAKE_PATTERNS = {
    "ford": r"\b(ford|f-?150|f-?250|f-?350|bronco|escape|explorer|transit|mustang|expedition|ranger|edge|pats)\b",
    "chevrolet": r"\b(chevrolet|chevy|silverado|camaro|traverse|equinox|tahoe|suburban|colorado|blazer|malibu)\b",
    "gmc": r"\b(gmc|sierra|yukon|acadia|canyon)\b",
    "cadillac": r"\b(cadillac|escalade|ct[456]|cts|ats|xt[456]|lyriq)\b",
    "dodge": r"\b(dodge|charger|challenger|durango|hornet)\b",
    "ram": r"\b(ram\s*1500|ram\s*2500|ram\s*3500|promaster)\b",
    "jeep": r"\b(jeep|wrangler|gladiator|grand cherokee|cherokee|compass|renegade)\b",
    "chrysler": r"\b(chrysler|pacifica|300|voyager)\b",
    "toyota": r"\b(toyota|camry|tundra|tacoma|rav4|highlander|4runner|prius|corolla|sienna|sequoia|avalon|venza)\b",
    "lexus": r"\b(lexus|rx\d+|es\d+|gx|lx|nx|is|ls|ux)\b",
    "honda": r"\b(honda|accord|civic|cr-v|pilot|odyssey|hr-v|ridgeline|passport)\b",
    "acura": r"\b(acura|mdx|rdx|tlx|ilx|integra|zdx)\b",
    "nissan": r"\b(nissan|altima|rogue|pathfinder|maxima|murano|sentra|frontier|armada|titan|kicks)\b",
    "infiniti": r"\b(infiniti|qx\d+|q50|q60)\b",
    "bmw": r"\b(bmw|fem|bdc|cas[34]|x[1-7]|[1-8]\s*series|m[2-8]|i[348x])\b",
    "mercedes": r"\b(mercedes|benz|fbs[345]|eis|sprinter|c-class|e-class|s-class|gle|glc|gla|glb)\b",
    "audi": r"\b(audi|a[34568]|q[3578]|mqb|mlb|e-tron|tt|r8)\b",
    "volkswagen": r"\b(volkswagen|vw|jetta|atlas|tiguan|passat|golf|id\.[34])\b",
    "hyundai": r"\b(hyundai|sonata|tucson|santa fe|palisade|elantra|kona|ioniq)\b",
    "kia": r"\b(kia|telluride|sorento|sportage|k5|forte|carnival|seltos|ev6)\b",
    "genesis": r"\b(genesis|gv[78]0|g80|g70|gv60)\b",
    "subaru": r"\b(subaru|outback|forester|ascent|crosstrek|impreza|wrx|legacy|brz)\b",
    "mazda": r"\b(mazda|cx-[3590]|mazda3|mazda6|mx-5|cx-30|cx-50)\b",
    "mitsubishi": r"\b(mitsubishi|outlander|eclipse cross|mirage)\b",
    "tesla": r"\b(tesla|model\s*[3sxy])\b",
    "rivian": r"\b(rivian|r1[ts]|edv)\b",
    "volvo": r"\b(volvo|xc[469]0|s[69]0|v[69]0)\b",
    "lincoln": r"\b(lincoln|navigator|aviator|corsair|nautilus)\b",
    "jaguar": r"\b(jaguar|f-pace|e-pace|i-pace|xe|xf|xj)\b",
    "land rover": r"\b(land rover|range rover|defender|discovery|evoque|velar)\b",
    "porsche": r"\b(porsche|cayenne|macan|panamera|taycan|911|boxster|cayman)\b",
    "alfa romeo": r"\b(alfa romeo|giulia|stelvio|tonale)\b",
    "stellantis": r"\b(stellantis|sgw|rf hub)\b",
}

# Model patterns by make
MODEL_PATTERNS = {
    "ford": r"(F-?150|F-?250|F-?350|Bronco|Escape|Explorer|Transit|Mustang|Edge|Expedition|Ranger|Maverick)",
    "chevrolet": r"(Silverado|Camaro|Traverse|Equinox|Tahoe|Suburban|Colorado|Blazer|Malibu|Trax)",
    "gmc": r"(Sierra|Yukon|Acadia|Canyon|Terrain|Hummer)",
    "cadillac": r"(Escalade|CT[456]|CTS|ATS|XT[456]|Lyriq)",
    "toyota": r"(Camry|Tundra|Tacoma|RAV4|Highlander|4Runner|Prius|Corolla|Sienna|Sequoia|Avalon|Venza|Grand Highlander)",
    "lexus": r"(RX|ES|GX|LX|NX|IS|LS|UX|TX)[\s-]?\d*",
    "honda": r"(Accord|Civic|CR-V|Pilot|Odyssey|HR-V|Ridgeline|Passport|Prologue)",
    "acura": r"(MDX|RDX|TLX|ILX|Integra|ZDX)",
    "nissan": r"(Altima|Rogue|Pathfinder|Maxima|Murano|Sentra|Frontier|Armada|Titan|Kicks)",
    "bmw": r"(X[1-7]|[1-8] Series|M[2-8]|i[348x]|Z4)",
    "mercedes": r"(C-Class|E-Class|S-Class|GLE|GLC|GLA|GLB|Sprinter|A-Class|EQS|EQE)",
    "hyundai": r"(Sonata|Tucson|Santa Fe|Palisade|Elantra|Kona|Ioniq)",
    "kia": r"(Telluride|Sorento|Sportage|K5|Forte|Carnival|Seltos|EV6)",
    "jeep": r"(Wrangler|Gladiator|Grand Cherokee|Cherokee|Compass|Renegade)",
    "dodge": r"(Charger|Challenger|Durango|Hornet)",
    "ram": r"(1500|2500|3500|ProMaster)",
    "subaru": r"(Outback|Forester|Ascent|Crosstrek|Impreza|WRX|Legacy|BRZ|Solterra)",
    "mazda": r"(CX-[3590]|Mazda3|Mazda6|MX-5|CX-30|CX-50)",
    "tesla": r"(Model [3SXY])",
    "genesis": r"(GV[678]0|G80|G70)",
    "volvo": r"(XC[469]0|S[69]0|V[69]0)",
    "audi": r"(A[34568]|Q[3578]|e-tron|TT|R8)",
}

# Entity extraction patterns
ENTITY_PATTERNS = {
    "fcc_id": r"\b(HYQ[A-Z0-9]+|M3N[-]?[A-Z0-9]+|KR5[A-Z0-9]+|N5F[-]?[A-Z0-9]+|GQ4[-]?[A-Z0-9]+|OHT[A-Z0-9]+|CWTWB[A-Z0-9]+)\b",
    "chip": r"\b(ID46|ID47|ID49|8A[-]?BA|8A|H[-]?Chip|G[-]?Chip|HITAG[\s-]?(PRO|AES|2)?|PCF\d+|NCF\d+|4A|4D|Texas Crypto)\b",
    "lishi": r"\b(HU\d+|TOY\d+|HON\d+|MIT\d+|VA\d+|NE\d+|B111|SIP22|HY\d+|NSN14|DAT17)\b",
    "platform": r"\b(TNGA-[CFKL]|T1XX|K2XX|GMT[T\d]+|MQB|MLB|CAS[34]|FEM|BDC|Epsilon|Alpha|Giorgio|SGW|RF Hub)\b",
    "frequency": r"\b(315\s*MHz|433\s*MHz|902\s*MHz|UHF|LF)\b",
    "part_number": r"\b(\d{5}[-]\d{3,}|\d{2}[-]\d{4}[-]\d+)\b",
}

# Keywords for pearl quality scoring
QUALITY_KEYWORDS = {
    "critical": ["critical", "warning", "danger", "never", "must", "always", "crucial", "important", "caution"],
    "actionable": ["use", "avoid", "select", "program", "insert", "remove", "locate", "press", "hold", "wait"],
    "specific": ["fcc", "chip", "lishi", "bcm", "akl", "pin", "eeprom", "gateway", "sgw"],
    "gotcha": ["trap", "gotcha", "mistake", "common error", "watch out", "beware", "pitfall"],
}


# ============================================
# LEVEL 1: DOCUMENT METADATA EXTRACTION
# ============================================

def extract_document_metadata(filepath: Path, soup: BeautifulSoup) -> Dict:
    """Extract vehicle info from filename, title, and H1."""
    filename = filepath.stem
    
    # Get title and H1
    title_tag = soup.find("title")
    title_text = title_tag.get_text().strip() if title_tag else ""
    
    h1_tag = soup.find("h1")
    h1_text = h1_tag.get_text().strip() if h1_tag else ""
    
    # Combined text for detection
    combined = f"{filename} {title_text} {h1_text}".lower()
    
    # Detect make
    detected_make = None
    for make, pattern in MAKE_PATTERNS.items():
        if re.search(pattern, combined, re.IGNORECASE):
            detected_make = make
            break
    
    # Detect model
    detected_model = None
    if detected_make and detected_make in MODEL_PATTERNS:
        match = re.search(MODEL_PATTERNS[detected_make], combined, re.IGNORECASE)
        if match:
            detected_model = match.group(1)
    
    # Detect years
    years = [int(y) for y in re.findall(r'\b(20[0-2][0-9])\b', combined)]
    years = [y for y in years if 2000 <= y <= 2030]
    year_start = min(years) if years else None
    year_end = max(years) if years else None
    
    # Single year case
    if year_start and not year_end:
        year_end = year_start
    
    return {
        "filename": filename,
        "title": title_text or h1_text or filename.replace("_", " "),
        "make": detected_make,
        "model": detected_model,
        "year_start": year_start,
        "year_end": year_end,
    }


# ============================================
# LEVEL 2: SECTION STRUCTURE MAPPING
# ============================================

def classify_section_type(heading_text: str) -> str:
    """Classify section heading into type."""
    heading_lower = heading_text.lower()
    
    for section_type, keywords in SECTION_TYPES.items():
        if any(kw in heading_lower for kw in keywords):
            return section_type
    
    return "general"


def extract_sections(soup: BeautifulSoup) -> List[Dict]:
    """Build section map from H2/H3 headers."""
    sections = []
    section_id = 0
    
    for header in soup.find_all(["h2", "h3"]):
        heading_text = header.get_text().strip()
        if len(heading_text) < 3 or len(heading_text) > 200:
            continue
        
        section_id += 1
        sections.append({
            "id": section_id,
            "level": int(header.name[1]),
            "heading": heading_text,
            "type": classify_section_type(heading_text),
        })
    
    return sections


def get_current_section(element, sections: List[Dict]) -> Optional[Dict]:
    """Find which section an element belongs to by looking backwards."""
    # Walk backwards through siblings and parents to find header
    current = element
    while current:
        # Check previous siblings
        prev = current.find_previous_sibling(["h2", "h3"])
        if prev:
            heading_text = prev.get_text().strip()
            for section in sections:
                if section["heading"] == heading_text:
                    return section
            break
        
        # Move to parent
        current = current.parent
        if current and current.name in ["h2", "h3"]:
            heading_text = current.get_text().strip()
            for section in sections:
                if section["heading"] == heading_text:
                    return section
    
    return None


# ============================================
# LEVEL 3: ENTITY PRE-EXTRACTION
# ============================================

def extract_entities(text: str) -> Dict[str, List[str]]:
    """Pre-scan for technical entities."""
    entities = defaultdict(set)
    
    for entity_type, pattern in ENTITY_PATTERNS.items():
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                match = match[0]
            if len(match) > 2:
                entities[entity_type].add(match.upper())
    
    # Convert sets to sorted lists
    return {k: sorted(list(v)) for k, v in entities.items()}


# ============================================
# LEVEL 4: PEARL CANDIDATE EXTRACTION
# ============================================

def clean_text(text: str) -> str:
    """Clean and normalize text."""
    # Remove HTML entities
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    text = text.replace("&quot;", '"').replace("&gt;", ">").replace("&lt;", "<")
    text = text.replace("&#39;", "'").replace("&rsquo;", "'").replace("&ldquo;", '"')
    text = text.replace("&rdquo;", '"').replace("&ndash;", "-").replace("&mdash;", "-")
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def score_pearl_quality(text: str) -> Tuple[int, Dict]:
    """Score pearl quality based on keywords."""
    text_lower = text.lower()
    score = 0
    scores = {}
    
    for category, keywords in QUALITY_KEYWORDS.items():
        category_score = sum(1 for kw in keywords if kw in text_lower)
        scores[category] = category_score
        
        # Weight by category
        if category == "critical":
            score += category_score * 3
        elif category == "gotcha":
            score += category_score * 4
        elif category == "actionable":
            score += category_score * 2
        else:
            score += category_score
    
    # Bonus for containing numbers (specificity)
    if re.search(r'\d', text):
        score += 1
        scores["has_numbers"] = 1
    
    return score, scores


def get_context(element, direction: str, max_chars: int = 300) -> str:
    """Get text context before or after an element."""
    context_parts = []
    
    if direction == "before":
        siblings = element.find_all_previous(["p", "li"], limit=2)
    else:
        siblings = element.find_all_next(["p", "li"], limit=2)
    
    for sibling in siblings:
        if sibling.name in ["h1", "h2", "h3"]:
            break
        text = clean_text(sibling.get_text())
        if len(text) > 20:
            context_parts.append(text)
    
    combined = " [...] ".join(context_parts)
    if len(combined) > max_chars:
        combined = combined[:max_chars] + "..."
    
    return combined


def extract_pearl_candidates(soup: BeautifulSoup, sections: List[Dict], doc_entities: Dict) -> List[Dict]:
    """Extract pearl candidates with full context."""
    candidates = []
    seen_hashes = set()
    
    for element in soup.find_all(["p", "li"]):
        text = clean_text(element.get_text())
        
        # Length filter
        if len(text) < 50 or len(text) > 600:
            continue
        
        # Quality score
        quality_score, quality_breakdown = score_pearl_quality(text)
        
        # Minimum quality threshold
        if quality_score < 3:
            continue
        
        # Deduplication
        content_hash = hashlib.md5(text.lower().encode()).hexdigest()[:12]
        if content_hash in seen_hashes:
            continue
        seen_hashes.add(content_hash)
        
        # Get section context
        current_section = get_current_section(element, sections)
        
        # Get surrounding context
        context_before = get_context(element, "before")
        context_after = get_context(element, "after")
        
        # Extract entities from this pearl
        pearl_entities = extract_entities(text)
        
        candidates.append({
            "content": text,
            "content_hash": content_hash,
            "element_type": element.name,
            "quality_score": quality_score,
            "quality_breakdown": quality_breakdown,
            "section_id": current_section["id"] if current_section else None,
            "section_heading": current_section["heading"] if current_section else None,
            "section_type": current_section["type"] if current_section else "general",
            "context_before": context_before,
            "context_after": context_after,
            "entities": pearl_entities,
        })
    
    # Sort by quality score
    candidates.sort(key=lambda x: x["quality_score"], reverse=True)
    
    return candidates


# ============================================
# MAIN PROCESSING
# ============================================

def process_document(filepath: Path) -> Optional[Dict]:
    """Process a single HTML document."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        full_text = soup.get_text()
        
        # Level 1: Document metadata
        doc_metadata = extract_document_metadata(filepath, soup)
        
        # Level 2: Section structure
        sections = extract_sections(soup)
        
        # Level 3: Entity pre-scan
        doc_entities = extract_entities(full_text)
        
        # Level 4: Pearl candidates
        pearls = extract_pearl_candidates(soup, sections, doc_entities)
        
        if not pearls:
            return None
        
        return {
            "document": doc_metadata,
            "entities": doc_entities,
            "sections": sections,
            "pearls": pearls,
            "stats": {
                "total_pearls": len(pearls),
                "section_count": len(sections),
                "entity_types": list(doc_entities.keys()),
            }
        }
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return None


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Pearl Extraction v8 - Context Preserving')
    parser.add_argument('--input', '-i', default='gdrive_exports', help='Input directory')
    parser.add_argument('--output', '-o', default='data/pearl_extraction/extracted_pearls_v8.json')
    parser.add_argument('--limit', '-l', type=int, default=0, help='Limit documents to process')
    args = parser.parse_args()
    
    input_dir = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Find all HTML files in subdirectories
    html_files = list(input_dir.glob("**/*.html"))
    print(f"Found {len(html_files)} HTML files")
    
    if args.limit > 0:
        html_files = html_files[:args.limit]
        print(f"Limited to {args.limit} files")
    
    # Process documents
    all_results = []
    total_pearls = 0
    
    for i, filepath in enumerate(html_files):
        result = process_document(filepath)
        if result:
            all_results.append(result)
            total_pearls += len(result["pearls"])
            
            if (i + 1) % 50 == 0:
                print(f"  Processed {i + 1}/{len(html_files)} files, {total_pearls} pearls...")
    
    # Compile output
    output_data = {
        "extraction_version": "v8.0",
        "total_documents": len(all_results),
        "total_pearls": total_pearls,
        "documents": all_results,
    }
    
    # Save output
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"Extraction Complete!")
    print(f"  Documents: {len(all_results)}")
    print(f"  Pearls: {total_pearls}")
    print(f"  Output: {output_path}")
    print(f"\nNext step: python scripts/enhance_pearls_llm.py --input {output_path}")


if __name__ == "__main__":
    main()
