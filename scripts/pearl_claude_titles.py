#!/usr/bin/env python3
"""
Pearl Quality Phase 2: Claude-Generated Semantic Titles

This script applies human-quality titles generated using Claude's 
automotive locksmith domain knowledge.
"""

import json
import re
from pathlib import Path

# Claude-generated semantic title mappings
# Format: (content_substring, new_title)
TITLE_MAPPINGS = [
    # Nissan Rogue BCM issues
    ("Widowmaker Module", "⚠️ Nissan Rogue BCM Bricking Risk (2014-2017)"),
    ("BCM BRICKING RISK", "⚠️ T32 Rogue BCM EEPROM Corruption Warning"),
    ("Calsonic Kansei 284B1", "T32 Rogue BCM Hardware Defect (284B1-4BA1A)"),
    
    # Key verification
    ("Verify new keys are", "Key Verification: ID47/4A + FCC CWTWB1G767"),
    
    # Chip type warnings
    ("H-chip handshake cannot be easily cloned", "H-Chip AES Encryption Requirement"),
    ("G stamped TOY43 blade but are actually H-chip", "⚠️ Tacoma Blade/Chip Mismatch Trap"),
    
    # Gateway/SGW
    ("Private Sector Access", "Stellantis Private Sector Gateway Access"),
    ("RF-Hub Lockdown", "Alfa Romeo RF-Hub Bricking Risk"),
    ("RFHub 'unlock' procedures", "Jeep Grand Cherokee RF-Hub Unlock (2021-2024)"),
    
    # Dodge Muscle Cars
    ("Last Call", "Dodge Last Call Edition Security Protocols"),
    ("Scat Pack Swinger", "Dodge Scat Pack Swinger 392 HEMI Security"),
    ("Charger King Daytona", "Dodge King Daytona Hellcat Redeye Protocol"),
    ("cannot simply take a generic black fob", "Red Key vs Black Fob Type Byte Difference"),
    
    # Lishi tools
    ("Lishi tools for picking", "CY24 Lishi Tool Selection Warning"),
    ("CY24 Truck", "⚠️ CY24 Truck Tool - Commercial Only"),
    
    # Toyota/Lexus
    ("TSS 3.0", "Toyota TSS 3.0 (8A-BA) OBD Block"),
    ("8A-BA logic", "8A-BA vs Legacy 8A Programming Difference"),
    ("FP-30 Cable", "Lonsdor FP-30 30-Pin Bypass Cable"),
    ("Smart Key ECU is located behind the glovebox", "Smart Key ECU Location: Behind Glovebox"),
    
    # Tool requirements
    ("AutoAuth service", "AutoAuth Wireless PIN Authentication"),
    ("Autel IM608 Pro II", "Autel IM608 Pro II CAN FD Capability"),
    ("Advanced Diagnostics Smart Pro", "Smart Pro ADS2328 Software Requirement"),
    
    # RF Hub replacement
    ("RF Hub Replacement for All Keys Lost", "RF Hub Replacement for AKL (2022+)"),
    ("virgin or unlocked unit", "Virgin RF Hub Sourcing (UHS, ACR)"),
    
    # Key verification warnings
    ("Never rely solely on the part number", "⚠️ Verify FCC ID, Not Just Part Number"),
    ("cases are swapped frequently", "Key Case Swap Warning - Check Chip ID"),
    
    # Year-specific warnings
    ("Read PIN (2022+)", "⚠️ 2022+ PIN Read Bricking Risk"),
    ("Password Reading Failed", "2022+ AKL: Prefer RF Hub Replacement"),
    
    # Platform verification
    ("Verify the VIN to confirm the T32", "T32 vs T33 Rogue Platform Verification"),
    ("KR5TXN Series keys", "Stock KR5TXN Keys for T32 Rogue"),
    
    # Architecture insights
    ("architecture trap", "Architecture Trap: 8A (FBB) vs 8A-BA (FLA)"),
    ("5th Gen 4Runner", "5th Gen 4Runner Chip Architecture Trap"),
    ("Legacy Vulnerability Era", "Kia/Hyundai Pre-2021 Security Vulnerability"),
    
    # Module locations
    ("BCM Serial Number", "BCM Serial to PIN Conversion Process"),
    ("ESCL fails to unlock", "ESCL Steering Lock Failure Recovery"),
    
    # CAN FD
    ("CAN FD Adapter is mandatory", "CAN FD Adapter Required for 2019+ Models"),
    ("cannot speak past the gateway", "Gateway Blocking - Tool Update Required"),
    
    # General patterns
    ("CRITICAL:", "⚠️ Critical Warning"),
    ("WARNING:", "⚠️ Important Warning"),
    ("Alert:", "⚠️ Alert"),
]

# Regex patterns for title generation
TITLE_PATTERNS = [
    # Year range pattern: "2020-2024 Model X uses Y"
    (r'(20\d\d[\-–]20\d\d)\s+(\w+(?:\s+\w+)?)\s+(use|require|need)s?\s+(.{10,40})', 
     lambda m: f"{m.group(2)} {m.group(1)}: {m.group(4)[:30]}"),
    
    # FCC ID pattern
    (r'FCC\s*(?:ID)?[\s:]*([\w\-]+)', 
     lambda m: f"FCC ID: {m.group(1)}"),
    
    # Board ID pattern  
    (r'Board\s*(?:ID)?[\s:]*([\d]+)', 
     lambda m: f"Board ID {m.group(1)} Identification"),
    
    # Chip type pattern
    (r'(8A-BA|8A|4D|46|H-chip|G-chip|ID47|ID46)(?:\s+chip)?', 
     lambda m: f"{m.group(1)} Chip Programming"),
]


def apply_title_mappings(content: str, current_title: str) -> str:
    """Apply Claude-generated title mappings."""
    content_lower = content.lower()
    
    for pattern, new_title in TITLE_MAPPINGS:
        if pattern.lower() in content_lower:
            return new_title
    
    # Try regex patterns
    for pattern, title_func in TITLE_PATTERNS:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            try:
                return title_func(match)
            except:
                pass
    
    return current_title


def generate_semantic_title(content: str, vehicle: dict = None) -> str:
    """Generate a semantic title from content."""
    
    # First try explicit mappings
    for pattern, new_title in TITLE_MAPPINGS:
        if pattern.lower() in content.lower():
            return new_title
    
    # Extract key technical terms for title
    title_parts = []
    
    # Vehicle context
    if vehicle:
        make = vehicle.get("make", "")
        model = vehicle.get("model", "")
        if make and make.lower() not in ["unknown", "general"]:
            title_parts.append(make.title())
        if model and model.lower() not in ["general"]:
            title_parts.append(model.title())
    
    # Technical identifiers
    fcc_match = re.search(r'\b(HYQ\w+|M3N[\w-]+|OHT[\w-]+|KR5\w+)\b', content)
    if fcc_match:
        title_parts.append(fcc_match.group(1))
    
    chip_match = re.search(r'\b(8A-BA|8A|H-chip|G-chip|ID47|4D|46)\b', content, re.I)
    if chip_match:
        title_parts.append(chip_match.group(1).upper())
    
    # Action keywords
    if "warning" in content.lower() or "critical" in content.lower():
        return "⚠️ " + " ".join(title_parts) if title_parts else "⚠️ Critical Warning"
    
    if "akl" in content.lower() or "all keys lost" in content.lower():
        title_parts.append("AKL Procedure")
    elif "add key" in content.lower():
        title_parts.append("Add Key Procedure")
    
    if title_parts:
        return " - ".join(title_parts[:3])[:60]
    
    # Fallback: first sentence
    first_sentence = content.split('.')[0].strip()
    if len(first_sentence) <= 50:
        return first_sentence
    return first_sentence[:47] + "..."


def process_pearls(input_path: Path, output_path: Path):
    """Main processing function."""
    print(f"Loading pearls from {input_path}...")
    
    with open(input_path, 'r') as f:
        data = json.load(f)
    
    pearls = data.get("pearls", [])
    print(f"Loaded {len(pearls)} pearls")
    
    print("\n=== Applying Claude-Generated Semantic Titles ===")
    improved_count = 0
    
    for pearl in pearls:
        content = pearl.get("paragraph") or pearl.get("content", "")
        current_title = pearl.get("improved_title") or pearl.get("snippet", "")
        vehicle = pearl.get("vehicle", {})
        
        new_title = apply_title_mappings(content, current_title)
        
        if new_title != current_title:
            pearl["claude_title"] = new_title
            improved_count += 1
        else:
            # Try semantic generation
            generated = generate_semantic_title(content, vehicle)
            if generated and len(generated) > 10 and generated != current_title:
                pearl["claude_title"] = generated
                improved_count += 1
    
    print(f"  Improved {improved_count} titles using Claude knowledge")
    
    # Save
    with open(output_path, 'w') as f:
        json.dump({"total": len(pearls), "claude_improved": improved_count, "pearls": pearls}, f, indent=2)
    
    print(f"Saved to {output_path}")
    return pearls


def generate_sql(pearls: list, output_path: Path):
    """Generate SQL with Claude titles."""
    
    def escape(text):
        if text is None:
            return "NULL"
        return "'" + str(text).replace("'", "''") + "'"
    
    sql_lines = [
        "-- Pearl Quality Phase 2: Claude Semantic Titles",
        f"-- Pearls: {len(pearls)}",
        "",
        "DELETE FROM vehicle_pearls;",
        "",
    ]
    
    for pearl in pearls:
        vehicle = pearl.get("vehicle", {})
        make = vehicle.get("make") or "Unknown"
        model = vehicle.get("model") or "General"
        year_start = int(vehicle.get("year_start") or 2020)
        year_end = int(vehicle.get("year_end") or 2025)
        
        # Priority: claude_title > llm_title > improved_title > snippet
        title = (pearl.get("claude_title") or 
                 pearl.get("llm_title") or 
                 pearl.get("improved_title") or 
                 pearl.get("snippet", ""))[:60]
        
        content = pearl.get("paragraph") or pearl.get("content", "")
        pearl_type = pearl.get("category", "insight")
        is_critical = 1 if "⚠️" in title or pearl.get("quality", {}).get("is_gotcha", False) else 0
        source_doc = pearl.get("source_doc", "")
        target_section = pearl.get("target_section", "insight")
        
        vehicle_key = f"{make.lower()}|{model.lower()}|{year_start}|{year_end}"
        
        sql = f"""INSERT OR REPLACE INTO vehicle_pearls (vehicle_key, make, model, year_start, year_end, pearl_title, pearl_content, pearl_type, is_critical, source_doc, target_section, display_order)
VALUES ({escape(vehicle_key)}, {escape(make)}, {escape(model)}, {year_start}, {year_end}, {escape(title)}, {escape(content)}, {escape(pearl_type)}, {is_critical}, {escape(source_doc)}, {escape(target_section)}, 0);"""
        sql_lines.append(sql)
    
    with open(output_path, 'w') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated: {output_path}")


def main():
    input_path = Path("data/quality_phase2_3_pearls.json")
    output_path = Path("data/quality_claude_titles.json")
    migration_path = Path("data/migrations/quality_claude_titles.sql")
    
    if not input_path.exists():
        print(f"Error: {input_path} not found")
        return
    
    pearls = process_pearls(input_path, output_path)
    generate_sql(pearls, migration_path)
    
    print("\n" + "="*50)
    print("To upload to D1:")
    print(f"  cd api && npx wrangler d1 execute locksmith-db --remote --file=../{migration_path}")


if __name__ == "__main__":
    main()
