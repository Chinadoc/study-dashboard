import re
import os

input_path = "/Users/jeremysamuels/Documents/study-dashboard/assets/2023-auto-truck-key-blank-reference.txt"
output_dir = "/Users/jeremysamuels/Documents/study-dashboard/assets/pdf_chunks"

def split_by_manufacturer():
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    manufacturers = [
        "ACURA", "ALFA ROMEO", "AMC", "AUDI", "BMW", "BUICK", "CADILLAC", "CHEVROLET", 
        "CHRYSLER", "DAEWOO", "DAIHATSU", "DE LOREAN", "DODGE", "EAGLE", "FERRARI", 
        "FIAT", "FORD", "GENESIS", "GEO", "GMC TRUCKS", "HINO TRUCK", "HONDA", 
        "HUMMER", "HYUNDAI", "INFINITI", "INTERNATIONAL", "ISUZU", "JAGUAR", "JEEP", 
        "KENWORTH", "KIA", "LAMBORGHINI", "LAND ROVER", "LEXUS", "LINCOLN", "MAZDA", 
        "MERCEDES BENZ", "MERCURY", "MERKUR", "MG", "MINI", "MITSUBISHI", "NAVISTAR", 
        "NISSAN/DATSUN", "OLDSMOBILE", "PANOZ", "PETERBILT", "PEUGEOT", "PLYMOUTH", 
        "PONTIAC", "PORSCHE", "RENAULT", "ROLLS ROYCE", "SAAB", "SATURN", "SCION", 
        "SMART", "STERLING", "SUBARU", "SUZUKI", "TOYOTA", "TRIUMPH", "VOLKSWAGEN", 
        "VOLVO", "VPG", "YUGO"
    ]
    
    positions = []
    for m in manufacturers:
        # Match manufacturer name on a line by itself
        regex = rf"^\s*{m}\s*$"
        matches = list(re.finditer(regex, content, re.MULTILINE))
        if matches:
            for match in matches:
                # Check if it's in the data section (Page 12+)
                preceding = content[:match.start()]
                page_matches = list(re.finditer(r"--- PAGE (\d+) ---", preceding))
                if page_matches:
                    page_num = int(page_matches[-1].group(1))
                    if page_num >= 12:
                        positions.append((match.start(), m))
                        break
    
    positions.sort()
    
    for i in range(len(positions)):
        start = positions[i][0]
        name = positions[i][1]
        end = positions[i+1][0] if i+1 < len(positions) else len(content)
        
        chunk_content = content[start:end]
        safe_name = name.replace("/", "_").replace(" ", "_").lower()
        chunk_path = os.path.join(output_dir, f"{safe_name}.txt")
        
        with open(chunk_path, "w", encoding="utf-8") as f:
            f.write(chunk_content)
            
    print(f"Successfully split into {len(positions)} manufacturer files in {output_dir}")

if __name__ == "__main__":
    split_by_manufacturer()
