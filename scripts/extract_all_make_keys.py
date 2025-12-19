#!/usr/bin/env python3
"""
Extract key images for ALL vehicle makes from Strattec 2020 Comprehensive Catalog.
Scans each page for make-specific content and extracts high-res images.
Uploads to R2 with make-based directory structure.
"""

import fitz  # PyMuPDF
import os
from pathlib import Path
import subprocess
import re
from collections import defaultdict

# All major vehicle makes with their identifying patterns
MAKE_PATTERNS = {
    'acura': [r'ACURA', r'35118-', r'72147-S', r'3511-'],
    'audi': [r'AUDI', r'4D0837', r'8E0837', r'8K0837'],
    'bmw': [r'BMW', r'66126933', r'66126940', r'LX8FZ'],
    'buick': [r'BUICK', r'ENCLAVE', r'LACROSSE', r'REGAL', r'ENCORE'],
    'cadillac': [r'CADILLAC', r'ESCALADE', r'CTS', r'ATS', r'XT5', r'22984996'],
    'chevrolet': [r'CHEVROLET', r'CHEVY', r'SILVERADO', r'TAHOE', r'SUBURBAN', r'CAMARO', r'CRUZE', r'EQUINOX', r'TRAVERSE', r'COLORADO', r'MALIBU'],
    'chrysler': [r'CHRYSLER', r'300', r'PACIFICA', r'68066', r'5602'],
    'dodge': [r'DODGE', r'CHARGER', r'CHALLENGER', r'DURANGO', r'RAM', r'CARAVAN', r'JOURNEY', r'68066'],
    'fiat': [r'FIAT', r'500', r'124 SPIDER'],
    'ford': [r'FORD', r'F-150', r'F150', r'EXPLORER', r'ESCAPE', r'EDGE', r'MUSTANG', r'FUSION', r'FOCUS', r'RANGER', r'BRONCO', r'164-R8'],
    'gmc': [r'GMC', r'SIERRA', r'YUKON', r'ACADIA', r'TERRAIN', r'CANYON'],
    'honda': [r'HONDA', r'ODYSSEY', r'ACCORD', r'CIVIC', r'PILOT', r'CR-V', r'HR-V', r'RIDGELINE', r'35118-', r'72147-'],
    'hyundai': [r'HYUNDAI', r'ELANTRA', r'SONATA', r'TUCSON', r'SANTA FE', r'PALISADE', r'KONA', r'SY5'],
    'infiniti': [r'INFINITI', r'Q50', r'Q60', r'QX50', r'QX60', r'QX80', r'285E3'],
    'jeep': [r'JEEP', r'WRANGLER', r'GRAND CHEROKEE', r'CHEROKEE', r'COMPASS', r'GLADIATOR', r'RENEGADE', r'68066'],
    'kia': [r'KIA', r'OPTIMA', r'SORENTO', r'SPORTAGE', r'SOUL', r'TELLURIDE', r'FORTE', r'SY5'],
    'land_rover': [r'LAND ROVER', r'RANGE ROVER', r'DISCOVERY', r'DEFENDER', r'LR'],
    'lexus': [r'LEXUS', r'RX', r'ES', r'NX', r'GX', r'LX', r'IS', r'89904'],
    'lincoln': [r'LINCOLN', r'NAVIGATOR', r'AVIATOR', r'CORSAIR', r'NAUTILUS', r'164-R8'],
    'mazda': [r'MAZDA', r'CX-5', r'CX-9', r'MAZDA3', r'MAZDA6', r'MX-5', r'CX-30', r'GJR9', r'WAZS'],
    'mercedes': [r'MERCEDES', r'BENZ', r'C-CLASS', r'E-CLASS', r'S-CLASS', r'GLC', r'GLE', r'A000'],
    'mitsubishi': [r'MITSUBISHI', r'OUTLANDER', r'ECLIPSE', r'LANCER', r'MIRAGE', r'8637A'],
    'nissan': [r'NISSAN', r'ALTIMA', r'MAXIMA', r'ROGUE', r'PATHFINDER', r'MURANO', r'SENTRA', r'TITAN', r'FRONTIER', r'285E3', r'S180'],
    'subaru': [r'SUBARU', r'OUTBACK', r'FORESTER', r'CROSSTREK', r'IMPREZA', r'LEGACY', r'ASCENT', r'WRX', r'57497'],
    'toyota': [r'TOYOTA', r'CAMRY', r'COROLLA', r'RAV4', r'HIGHLANDER', r'TACOMA', r'TUNDRA', r'4RUNNER', r'SIENNA', r'PRIUS', r'89904'],
    'volkswagen': [r'VOLKSWAGEN', r'VW', r'JETTA', r'PASSAT', r'TIGUAN', r'ATLAS', r'GOLF', r'3G0959'],
    'volvo': [r'VOLVO', r'XC90', r'XC60', r'XC40', r'S60', r'V60', r'31419131'],
}


def find_make_pages(pdf_path):
    """Scan all pages and categorize by make."""
    doc = fitz.open(pdf_path)
    make_pages = defaultdict(set)
    
    print(f"Scanning {len(doc)} pages...")
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text().upper()
        
        for make, patterns in MAKE_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    make_pages[make].add(page_num)
                    break
    
    doc.close()
    return make_pages


def extract_page_as_image(pdf_path, page_num, output_path, dpi=150):
    """Extract a PDF page as PNG image."""
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    
    mat = fitz.Matrix(dpi/72, dpi/72)
    pix = page.get_pixmap(matrix=mat)
    pix.save(output_path)
    
    doc.close()
    return output_path


def upload_to_r2(local_path, r2_key, api_dir):
    """Upload image to R2 bucket."""
    cmd = [
        'wrangler', 'r2', 'object', 'put',
        f'euro-keys-assets/{r2_key}',
        '--file', local_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=api_dir)
    return result.returncode == 0


def main():
    catalog_path = Path(__file__).parent.parent / 'assets' / '2020_Comprehensive_Catalog.pdf'
    api_dir = str(Path(__file__).parent.parent / 'api')
    
    if not catalog_path.exists():
        print(f"Catalog not found: {catalog_path}")
        return
    
    print(f"Scanning catalog: {catalog_path}")
    
    # Find pages for all makes
    make_pages = find_make_pages(catalog_path)
    
    total_pages = sum(len(pages) for pages in make_pages.values())
    print(f"\nFound pages for {len(make_pages)} makes ({total_pages} total pages)")
    
    for make in sorted(make_pages.keys()):
        print(f"  {make.title()}: {len(make_pages[make])} pages")
    
    # Create output directories
    output_base = Path(__file__).parent.parent / 'assets' / 'key_images_by_make'
    output_base.mkdir(exist_ok=True)
    
    # Extract and upload for each make
    uploaded_count = 0
    failed_count = 0
    
    for make in sorted(make_pages.keys()):
        pages = sorted(make_pages[make])
        make_dir = output_base / make
        make_dir.mkdir(exist_ok=True)
        
        print(f"\n{make.upper()}: Extracting {len(pages)} pages...")
        
        for page_num in pages[:10]:  # Limit to 10 pages per make to manage size
            output_file = make_dir / f'page_{page_num:03d}.png'
            
            # Extract if not exists
            if not output_file.exists():
                extract_page_as_image(catalog_path, page_num, str(output_file))
            
            # Upload to R2
            r2_key = f"key-blanks/{make}/page_{page_num:03d}.png"
            if upload_to_r2(str(output_file), r2_key, api_dir):
                print(f"  ✓ {r2_key}")
                uploaded_count += 1
            else:
                print(f"  ✗ {r2_key}")
                failed_count += 1
    
    print(f"\n{'='*50}")
    print(f"COMPLETE: {uploaded_count} uploaded, {failed_count} failed")
    print(f"Images saved to: {output_base}")


if __name__ == '__main__':
    main()
