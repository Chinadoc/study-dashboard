#!/usr/bin/env python3
"""
Pearl Extraction v8 - AI-Assisted Intelligent Extraction

Extracts curated pearls from prose dossiers using heuristic pattern matching
to identify high-value insights, critical alerts, and actionable tips.

This version handles unstructured text by looking for:
1. Sentences with critical keywords (must, never, always, critical, warning)
2. Numbered tips/pearls embedded in prose
3. Alert patterns (Warning:, Critical:, Note:, Tip:)
4. Sentences near section headers about procedures/troubleshooting
"""

import os, re, hashlib
from bs4 import BeautifulSoup
from pathlib import Path
import json

# Make detection patterns
MAKE_PATTERNS = {
    "Ford": [r"\bford\b", r"\bf-150\b", r"\bf150\b", r"\bpats\b", r"\bbronco\b"],
    "Chevrolet": [r"\bchevrolet\b", r"\bchevy\b", r"\bsilverado\b", r"\bcamaro\b"],
    "GMC": [r"\bgmc\b", r"\bsierra\b", r"\byukon\b"], 
    "Cadillac": [r"\bcadillac\b", r"\bescalade\b", r"\blyriq\b"],
    "Dodge": [r"\bdodge\b", r"\bcharger\b", r"\bchallenger\b", r"\bdurango\b"],
    "RAM": [r"\bram\b", r"\b1500\b", r"\b2500\b", r"\bpromaster\b"],
    "Jeep": [r"\bjeep\b", r"\bwrangler\b", r"\bgladiator\b", r"\bgrand cherokee\b"],
    "Chrysler": [r"\bchrysler\b", r"\bpacifica\b", r"\b300\b"],
    "Toyota": [r"\btoyota\b", r"\bcamry\b", r"\btundra\b", r"\btacoma\b", r"\brav4\b"],
    "Lexus": [r"\blexus\b", r"\brx\b", r"\bes\b", r"\bgx\b", r"\blx\b"],
    "Honda": [r"\bhonda\b", r"\baccord\b", r"\bcivic\b", r"\bcr-v\b", r"\bpilot\b"],
    "Acura": [r"\bacura\b", r"\bmdx\b", r"\brdx\b", r"\btlx\b"],
    "Nissan": [r"\bnissan\b", r"\baltima\b", r"\brogue\b", r"\bpathfinder\b"],
    "Infiniti": [r"\binfiniti\b", r"\bqx\b", r"\bq50\b"],
    "BMW": [r"\bbmw\b", r"\bfem\b", r"\bbdc\b", r"\bcas4\b"],
    "Mercedes": [r"\bmercedes\b", r"\bfbs4\b", r"\bfbs3\b", r"\beis\b"],
    "Audi": [r"\baudi\b", r"\bmqb\b", r"\bmlb\b"],
    "Volkswagen": [r"\bvolkswagen\b", r"\bvw\b", r"\bjetta\b", r"\batlas\b"],
    "Subaru": [r"\bsubaru\b", r"\boutback\b", r"\bforester\b", r"\bascent\b"],
    "Hyundai": [r"\bhyundai\b", r"\bsonata\b", r"\btucson\b", r"\bpalisade\b"],
    "Kia": [r"\bkia\b", r"\btelluride\b", r"\bsorento\b", r"\bsportage\b"],
    "Tesla": [r"\btesla\b", r"\bmodel 3\b", r"\bmodel y\b"],
    "Stellantis": [r"\bstellantis\b", r"\bsgw\b", r"\brf hub\b"],
    "Land Rover": [r"\bland rover\b", r"\brange rover\b"],
    "Jaguar": [r"\bjaguar\b"],
    "Volvo": [r"\bvolvo\b", r"\bxc90\b"],
    "Mazda": [r"\bmazda\b", r"\bcx-5\b"],
    "Mitsubishi": [r"\bmitsubishi\b", r"\boutlander\b"],
    "Genesis": [r"\bgenesis\b", r"\bgv70\b"],
    "Lincoln": [r"\blincoln\b", r"\bnavigator\b"],
    "Porsche": [r"\bporsche\b", r"\bcayenne\b"],
    "Rivian": [r"\brivian\b", r"\br1t\b"],
}

# Keywords that indicate high-value content
CRITICAL_KEYWORDS = [
    "must", "never", "always", "critical", "warning", "caution", "danger",
    "do not", "don't", "avoid", "essential", "required", "mandatory",
    "brick", "fail", "corrupt", "lock", "trap", "risk"
]

INSIGHT_KEYWORDS = [
    "tip", "pearl", "trick", "hack", "shortcut", "key to", "secret",
    "the fix", "solution", "workaround", "bypass", "override"
]

PROCEDURE_KEYWORDS = [
    "procedure", "step", "method", "process", "workflow", "protocol",
    "akl", "add key", "programming", "relearn", "reset"
]

PEARL_TYPE_MAP = {
    "Alert": ["warning", "critical", "caution", "danger", "brick", "fail", "never", "do not"],
    "AKL Procedure": ["all keys lost", "akl", "no keys", "lost all"],
    "Tool Requirement": ["autel", "smart pro", "xtool", "vvdi", "lonsdor", "sps2", "techline"],
    "System Info": ["architecture", "platform", "bcm", "gateway", "can fd", "immobilizer", "chip"],
    "Mechanical": ["keyway", "lishi", "decode", "key blank", "blade", "emergency slot"],
    "FCC/Hardware": ["fcc id", "fcc:", "m3n-", "n5f-", "kr5", "hyq", "frequency", "mhz"],
}


def get_make(content: str, filename: str) -> str:
    """Detect vehicle make from content or filename."""
    text = (content + " " + filename).lower()
    for make, patterns in MAKE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return make
    return "Unknown"


def get_model(content: str, filename: str, make: str) -> str:
    """Extract model from filename or content."""
    fn_clean = filename.replace("_", " ").replace("-", " ")
    model_patterns = {
        "Ford": r"(F-?150|F-?250|F-?350|Bronco|Escape|Explorer|Expedition|Transit|Mustang)",
        "Chevrolet": r"(Silverado|Camaro|Traverse|Equinox|Tahoe|Suburban|Colorado|Blazer)",
        "Toyota": r"(Camry|Tundra|Tacoma|RAV4|Highlander|4Runner|Sequoia|Corolla|Prius)",
        "Dodge": r"(Charger|Challenger|Durango|Hornet)",
        "RAM": r"(1500|2500|3500|ProMaster)",
        "Jeep": r"(Wrangler|Gladiator|Grand Cherokee|Cherokee|Compass)",
        "BMW": r"(X5|X3|3 Series|5 Series|7 Series)",
        "Mercedes": r"(C-Class|E-Class|S-Class|GLE|GLC|Sprinter)",
        "Honda": r"(Accord|Civic|CR-V|Pilot|Odyssey|HR-V)",
        "Nissan": r"(Altima|Rogue|Pathfinder|Maxima|Murano)",
        "Hyundai": r"(Sonata|Tucson|Santa Fe|Palisade|Elantra)",
        "Kia": r"(Telluride|Sorento|Sportage|K5|Forte)",
    }
    
    pattern = model_patterns.get(make, r"")
    if pattern:
        match = re.search(pattern, fn_clean + " " + content[:1000], re.IGNORECASE)
        if match:
            return match.group(1)
    return "Unknown"


def get_years(content: str, filename: str) -> tuple:
    """Extract year range from content."""
    years = re.findall(r'\b(20[0-2][0-9])\b', content + filename)
    years = [int(y) for y in years if 2000 <= int(y) <= 2030]
    if years:
        return min(years), max(years)
    return None, None


def get_pearl_type(text: str) -> tuple:
    """Determine pearl type and if critical."""
    text_lower = text.lower()
    is_critical = any(kw in text_lower for kw in ["critical", "warning", "danger", "never", "brick", "must"])
    
    for ptype, keywords in PEARL_TYPE_MAP.items():
        if any(kw in text_lower for kw in keywords):
            return ptype, is_critical
    
    return "Insight", is_critical


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove common artifacts
    text = re.sub(r'^\s*[\d]+[\.\:\)]\s*', '', text)  # Leading numbers
    text = re.sub(r'^\s*[\*\-\•]\s*', '', text)  # Leading bullets
    text = text.strip()
    return text


def score_sentence(sentence: str) -> int:
    """Score a sentence for pearl-worthiness."""
    score = 0
    text_lower = sentence.lower()
    
    # Length check (ideal: 50-300 chars)
    if 50 <= len(sentence) <= 300:
        score += 2
    elif 30 <= len(sentence) <= 400:
        score += 1
    else:
        return 0  # Too short or too long
    
    # Critical keywords (high value)
    for kw in CRITICAL_KEYWORDS:
        if kw in text_lower:
            score += 3
            break
    
    # Insight keywords
    for kw in INSIGHT_KEYWORDS:
        if kw in text_lower:
            score += 2
            break
    
    # Procedure keywords
    for kw in PROCEDURE_KEYWORDS:
        if kw in text_lower:
            score += 2
            break
    
    # Contains specific data (FCC, voltage, time)
    if re.search(r'\b\d+\s*(?:MHz|V|volt|second|minute|hour|amp)\b', sentence, re.IGNORECASE):
        score += 2
    if re.search(r'\b(?:M3N|HYQ|KR5|N5F|FCC)\b', sentence, re.IGNORECASE):
        score += 2
    
    # Action-oriented (contains verbs)
    if re.search(r'\b(?:place|press|hold|wait|connect|disconnect|check|verify|ensure)\b', text_lower):
        score += 1
    
    # Penalty for generic content
    if re.search(r'^(?:this|the|it|we|you|for|in)\s+(?:is|are|was|were|has|have)\b', text_lower):
        score -= 1
    
    return max(score, 0)


def extract_numbered_pearls(text: str) -> list:
    """Extract numbered list items that look like pearls."""
    pearls = []
    
    # Pattern for numbered insights: "1. Title: Content" or "1. Content"
    pattern = r'(?:^|\n)\s*(\d+)\.\s*(?:\*\*([^*]+)\*\*[:\s]+)?([^\n]+(?:\n(?!\s*\d+\.)(?!\n\n)[^\n]+)*)'
    
    matches = re.findall(pattern, text, re.MULTILINE)
    for num, title, content in matches:
        full_content = clean_text(f"{title}: {content}" if title else content)
        
        if 40 <= len(full_content) <= 500 and score_sentence(full_content) >= 3:
            ptype, is_crit = get_pearl_type(full_content)
            pearls.append({
                'title': (title if title else full_content[:60] + "...").strip(),
                'content': full_content,
                'type': ptype,
                'is_critical': is_crit,
                'score': score_sentence(full_content)
            })
    
    return pearls


def extract_alert_patterns(text: str) -> list:
    """Extract alert-style patterns like 'Warning:', 'Critical:', etc."""
    pearls = []
    
    patterns = [
        r'(?:^|\n)\s*(?:⚠️|🚨|❗|Warning|Critical|Alert|Caution|Note|Tip)[:\s]+([^\n]+(?:\n(?![A-Z]|\s*[\*\-\d])(?!\n\n)[^\n]+)*)',
        r'(?:Technical Alert|Stop Sale|Do Not)[:\s]+([^\n]+)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
        for content in matches:
            content = clean_text(content)
            if 30 <= len(content) <= 400:
                ptype, is_crit = get_pearl_type(content)
                pearls.append({
                    'title': content[:60] + ('...' if len(content) > 60 else ''),
                    'content': content,
                    'type': 'Alert',
                    'is_critical': True,
                    'score': 5  # Alerts get high priority
                })
    
    return pearls


def extract_high_value_sentences(text: str, max_items: int = 8) -> list:
    """Extract individual sentences that score high for pearl-worthiness."""
    pearls = []
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    scored = []
    for sentence in sentences:
        sentence = clean_text(sentence)
        score = score_sentence(sentence)
        if score >= 4 and 40 <= len(sentence) <= 350:
            scored.append((score, sentence))
    
    # Sort by score and take top items
    scored.sort(reverse=True)
    
    seen_content = set()
    for score, content in scored[:max_items * 2]:  # Get more, filter later
        # Deduplicate similar content
        content_key = content[:50].lower()
        if content_key in seen_content:
            continue
        seen_content.add(content_key)
        
        ptype, is_crit = get_pearl_type(content)
        pearls.append({
            'title': content[:60] + ('...' if len(content) > 60 else ''),
            'content': content,
            'type': ptype,
            'is_critical': is_crit,
            'score': score
        })
        
        if len(pearls) >= max_items:
            break
    
    return pearls


def extract_ai_pearls(path: Path) -> list:
    """
    AI-assisted pearl extraction from prose dossiers.
    
    Uses multiple strategies to identify high-value content.
    """
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Get plain text
        if path.suffix.lower() in ['.html', '.htm']:
            soup = BeautifulSoup(content, 'html.parser')
            # Remove scripts and styles
            for tag in soup(['script', 'style', 'nav', 'footer']):
                tag.decompose()
            text = soup.get_text(separator='\n')
        else:
            text = content
        
        filename = path.stem
        
        # Get metadata
        make = get_make(text, filename)
        model = get_model(text, filename, make)
        year_start, year_end = get_years(text, filename)
        
        all_pearls = []
        
        # Strategy 1: Look for numbered pearls section
        pearl_section = re.search(
            r'(?:Programming Pearls|Critical Insights|Key Insights|Technical Pearls)[^\n]*\n([\s\S]{200,5000}?)(?=\n\d+\.\s+[A-Z][a-z]+\s+[A-Z]|\nConclusion|\nAppendix|\nWorks cited|\Z)',
            text, re.IGNORECASE
        )
        if pearl_section:
            numbered = extract_numbered_pearls(pearl_section.group(1))
            all_pearls.extend(numbered)
        
        # Strategy 2: Extract alert patterns
        alerts = extract_alert_patterns(text)
        all_pearls.extend(alerts)
        
        # Strategy 3: If not enough pearls, extract high-value sentences
        if len(all_pearls) < 6:
            sentences = extract_high_value_sentences(text, 8 - len(all_pearls))
            all_pearls.extend(sentences)
        
        # Deduplicate and sort by score
        seen = set()
        unique_pearls = []
        for p in sorted(all_pearls, key=lambda x: x.get('score', 0), reverse=True):
            key = p['content'][:50].lower()
            if key not in seen:
                seen.add(key)
                unique_pearls.append(p)
        
        # Take top 12 max
        unique_pearls = unique_pearls[:12]
        
        # Add metadata
        result = []
        for i, p in enumerate(unique_pearls):
            result.append({
                'make': make,
                'model': model,
                'year_start': year_start,
                'year_end': year_end,
                'pearl_title': p['title'],
                'pearl_content': p['content'],
                'pearl_type': p['type'],
                'is_critical': p['is_critical'],
                'source_document': filename,
                'display_order': i,
                'is_curated': True
            })
        
        return result
    
    except Exception as e:
        print(f"Error extracting {path}: {e}")
        import traceback
        traceback.print_exc()
        return []


def generate_sql(pearls: list, output_path: Path):
    """Generate SQL migration file for curated pearls."""
    
    sql_lines = [
        "-- Pearl Extraction v8: AI-Assisted Intelligent Extraction",
        f"-- Total pearls: {len(pearls)}",
        "",
        "-- Clear existing fragment pearls and insert curated ones",
        "DELETE FROM vehicle_pearls;",
        "",
    ]
    
    for p in pearls:
        title = p['pearl_title'].replace("'", "''")[:500]
        content = p['pearl_content'].replace("'", "''")
        source = p.get('source_document', '').replace("'", "''")
        
        # Handle NULL years with defaults
        ys = p['year_start'] if p['year_start'] else 2020
        ye = p['year_end'] if p['year_end'] else 2025
        
        # Generate vehicle_key
        make = p['make']
        model = p['model'] if p['model'] != 'Unknown' else 'General'
        vehicle_key = f"{make.lower()}|{model.lower()}|{ys}|{ye}".replace("'", "''")
        
        sql = f"""INSERT OR REPLACE INTO vehicle_pearls (vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, pearl_type, is_critical, source_doc, display_order)
VALUES ('{vehicle_key}', '{make}', '{model}', {ys}, {ye}, '{title}', '{content}', '{p['pearl_type']}', {1 if p['is_critical'] else 0}, '{source}', {p['display_order']});"""
        
        sql_lines.append(sql)
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"\nGenerated {output_path} with {len(pearls)} curated pearls")


def main():
    """Main extraction workflow."""
    import argparse
    
    parser = argparse.ArgumentParser(description='AI-assisted pearl extraction (v8)')
    parser.add_argument('--input', '-i', default='gdrive_exports', help='Input directory')
    parser.add_argument('--output', '-o', default='data/migrations/ai_curated_pearls.sql', help='Output SQL file')
    parser.add_argument('--pattern', '-p', default='*.html', help='File pattern to match')
    parser.add_argument('--also-md', action='store_true', help='Also process markdown files')
    args = parser.parse_args()
    
    input_dir = Path(args.input)
    output_path = Path(args.output)
    
    if not input_dir.exists():
        print(f"Input directory not found: {input_dir}")
        return
    
    # Find files
    files = list(input_dir.glob(args.pattern))
    if args.also_md:
        files.extend(input_dir.glob('*.md'))
    
    # Also check html subdirectory
    html_dir = input_dir / 'html'
    if html_dir.exists():
        files.extend(html_dir.glob('*.html'))
    
    # Deduplicate
    files = list(set(files))
    
    print(f"Found {len(files)} files to process")
    
    all_pearls = []
    files_with_pearls = 0
    
    for path in sorted(files):
        pearls = extract_ai_pearls(path)
        if pearls:
            print(f"  {path.name}: {len(pearls)} pearls")
            all_pearls.extend(pearls)
            files_with_pearls += 1
    
    print(f"\n{'='*50}")
    print(f"Total: {len(all_pearls)} curated pearls from {files_with_pearls}/{len(files)} files")
    print(f"Average: {len(all_pearls)/max(files_with_pearls,1):.1f} pearls per file with content")
    
    # Generate SQL
    output_path.parent.mkdir(parents=True, exist_ok=True)
    generate_sql(all_pearls, output_path)


if __name__ == "__main__":
    main()
