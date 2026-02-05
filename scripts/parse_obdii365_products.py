#!/usr/bin/env python3
"""
OBDII365 Product Page Parser
Extracts structured data from scraped HTML product pages.
"""

import json
import re
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
from bs4 import BeautifulSoup
from dataclasses import dataclass, asdict
import html


@dataclass
class VehicleSupport:
    make: str
    model: Optional[str] = None
    year_start: Optional[int] = None
    year_end: Optional[int] = None


@dataclass
class ParsedProduct:
    sku: str
    name: str
    brand: Optional[str]
    price_usd: Optional[float]
    description_short: str
    description_full: str
    categories: List[str]
    keywords: List[str]
    product_tags: List[str]
    vehicle_support: List[Dict]
    locksmith_relevance: str  # high, medium, low
    locksmith_categories: List[str]
    url: str
    source_file: str
    images: List[str]
    weight_kg: Optional[float] = None
    sold_count: Optional[int] = None
    review_count: Optional[int] = None


class OBDII365Parser:
    """Parser for OBDII365 product HTML pages."""
    
    # Categories indicating locksmith relevance
    LOCKSMITH_CATEGORIES = {
        "high": [
            "Lock Picking & Locksmith Tools",
            "Auto Key Blanks",
        ],
        "medium": [
            "Key Programming Tools",
            "Original Xhorse Tools",
            "Original CG Tools",
            "Original OBDSTAR Tools",
        ],
        "low": [
            "OBD Cables & Connectors",
            "ECU Chip Tuning Tools",
            "Car Diagnostic Tools",
            "OBDII Fault Code Scanners",
        ]
    }
    
    # Keywords for locksmith classification
    LOCKSMITH_KEYWORDS = {
        "high": [
            "lishi", "pick", "decoder", "locksmith", "lock pick",
            "key blank", "transponder key", "remote key shell",
        ],
        "medium": [
            "key programming", "immo", "immobilizer", "eeprom",
            "transponder", "smart key", "remote", "fob", "all key lost",
            "add key", "key copy", "key clone",
        ]
    }
    
    # High relevance brands
    HIGH_RELEVANCE_BRANDS = ["LISHI", "XHORSE", "KEYDIY", "2M2"]
    MEDIUM_RELEVANCE_BRANDS = ["AUTEL", "OBDSTAR", "CGDI", "LONSDOR", "XTOOL", "GODIAG"]
    
    # Vehicle extraction patterns
    VEHICLE_PATTERNS = [
        # "5 series from 2002" or "X5 from 2002"
        (r'([A-Z0-9][A-Za-z0-9\s\-]+?)\s+(?:from|since)\s+(\d{4})', 'model_from_year'),
        # "X3, 2000 to 2008" or "X3 2000 to 2008"
        (r'([A-Z][A-Za-z0-9\-]+),?\s+(\d{4})\s+to\s+(\d{4}|current)', 'model_year_range'),
        # "2002-2008" standalone year range
        (r'(\d{4})\s*[-–]\s*(\d{4})', 'year_range'),
        # "2002 to current"
        (r'(\d{4})\s+to\s+current', 'year_to_current'),
    ]
    
    # Known makes for extraction
    KNOWN_MAKES = [
        "BMW", "MINI", "Mercedes", "Benz", "Audi", "VW", "Volkswagen",
        "Porsche", "Toyota", "Lexus", "Honda", "Acura", "Nissan", "Infiniti",
        "Ford", "Lincoln", "GM", "Chevrolet", "Cadillac", "GMC", "Buick",
        "Chrysler", "Dodge", "Jeep", "Ram", "Fiat", "Alfa Romeo",
        "Hyundai", "Kia", "Subaru", "Mazda", "Mitsubishi", "Volvo",
        "Land Rover", "Jaguar", "Range Rover", "Ferrari", "Lamborghini",
        "Bentley", "Rolls-Royce", "Maserati", "Aston Martin",
    ]

    def __init__(self, html_dir: Path, output_dir: Path):
        self.html_dir = html_dir
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.errors: List[Dict] = []
        self.stats = {
            "total_files": 0,
            "parsed_successfully": 0,
            "parse_errors": 0,
            "high_relevance": 0,
            "medium_relevance": 0,
            "low_relevance": 0,
            "with_vehicle_data": 0,
        }

    def parse_all(self) -> List[ParsedProduct]:
        """Parse all HTML files in the directory."""
        products = []
        html_files = list(self.html_dir.glob("*.html"))
        self.stats["total_files"] = len(html_files)
        
        print(f"Parsing {len(html_files)} HTML files...")
        
        for i, html_file in enumerate(html_files):
            if (i + 1) % 100 == 0:
                print(f"  Processed {i + 1}/{len(html_files)}...")
            
            try:
                product = self.parse_file(html_file)
                if product:
                    products.append(product)
                    self.stats["parsed_successfully"] += 1
                    self.stats[f"{product.locksmith_relevance}_relevance"] += 1
                    if product.vehicle_support:
                        self.stats["with_vehicle_data"] += 1
            except Exception as e:
                self.stats["parse_errors"] += 1
                self.errors.append({
                    "file": html_file.name,
                    "error": str(e)
                })
        
        print(f"Parsing complete: {self.stats['parsed_successfully']} successful, {self.stats['parse_errors']} errors")
        return products

    def parse_file(self, html_file: Path) -> Optional[ParsedProduct]:
        """Parse a single HTML product file."""
        with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract Schema.org product data
        sku = self._extract_meta(soup, 'sku') or html_file.stem
        name = self._extract_meta(soup, 'name') or self._extract_title(soup)
        brand = self._extract_meta(soup, 'brand')
        price = self._extract_price(soup)
        description = self._extract_meta(soup, 'description') or ""
        url = self._extract_meta_url(soup)
        
        if not name:
            return None
        
        # Extract categories from breadcrumb
        categories = self._extract_categories(soup)
        
        # Extract keywords
        keywords = self._extract_keywords(soup)
        
        # Extract product tags
        product_tags = self._extract_tags(soup)
        
        # Extract full description
        description_full = self._extract_full_description(soup)
        
        # Extract vehicle support
        vehicle_support = self._extract_vehicle_support(description_full, name)
        
        # Extract images
        images = self._extract_images(soup)
        
        # Extract additional info
        weight = self._extract_weight(soup)
        sold_count = self._extract_sold_count(soup)
        review_count = self._extract_review_count(soup)
        
        # Classify locksmith relevance
        relevance, locksmith_cats = self._classify_locksmith_relevance(
            name, brand, categories, keywords, product_tags, description_full
        )
        
        return ParsedProduct(
            sku=sku,
            name=name,
            brand=brand,
            price_usd=price,
            description_short=description[:500] if description else "",
            description_full=description_full[:5000] if description_full else "",
            categories=categories,
            keywords=keywords,
            product_tags=product_tags,
            vehicle_support=[asdict(v) if isinstance(v, VehicleSupport) else v for v in vehicle_support],
            locksmith_relevance=relevance,
            locksmith_categories=locksmith_cats,
            url=url or f"https://www.obdii365.com/wholesale/{html_file.stem}.html",
            source_file=html_file.name,
            images=images,
            weight_kg=weight,
            sold_count=sold_count,
            review_count=review_count,
        )

    def _extract_meta(self, soup: BeautifulSoup, prop: str) -> Optional[str]:
        """Extract Schema.org meta property."""
        meta = soup.find('meta', itemprop=prop)
        if meta and meta.get('content'):
            return html.unescape(meta['content'].strip())
        return None

    def _extract_meta_url(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract canonical URL."""
        # Try Schema.org offers URL first
        offers = soup.find('div', itemprop='offers')
        if offers:
            url_meta = offers.find('meta', itemprop='url')
            if url_meta and url_meta.get('content'):
                return url_meta['content']
        return None

    def _extract_title(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract page title."""
        title = soup.find('title')
        if title:
            return html.unescape(title.get_text().strip())
        return None

    def _extract_price(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract USD price."""
        price_meta = soup.find('meta', itemprop='price')
        if price_meta and price_meta.get('content'):
            try:
                return float(price_meta['content'])
            except ValueError:
                pass
        return None

    def _extract_categories(self, soup: BeautifulSoup) -> List[str]:
        """Extract category breadcrumb."""
        categories = []
        breadcrumb = soup.find('nav', id='xri_HD_Breadcrumb')
        if breadcrumb:
            for item in breadcrumb.find_all('li', class_='breadcrumb-item'):
                link = item.find('a')
                if link:
                    text = link.get_text().strip()
                    # Skip "Brand:" prefix items
                    if item.get_text().strip().startswith('Brand:'):
                        continue
                    if text and text not in ['Home', 'Products']:
                        categories.append(html.unescape(text))
        return categories

    def _extract_keywords(self, soup: BeautifulSoup) -> List[str]:
        """Extract meta keywords."""
        meta = soup.find('meta', attrs={'name': 'keywords'})
        if meta and meta.get('content'):
            keywords = [k.strip().lower() for k in meta['content'].split(',')]
            return [k for k in keywords if k]
        return []

    def _extract_tags(self, soup: BeautifulSoup) -> List[str]:
        """Extract product tags from footer."""
        tags = []
        # Look for tags section
        tag_links = soup.select('a[href*="/producttags/"]')
        for link in tag_links:
            text = link.get_text().strip()
            if text and len(text) < 50:  # Filter out long text
                tags.append(text.lower())
        return list(set(tags))

    def _extract_full_description(self, soup: BeautifulSoup) -> str:
        """Extract full product description text."""
        desc_div = soup.find('div', id='xri_ProDt_Description')
        if desc_div:
            # Get text content, preserving some structure
            text = desc_div.get_text(separator='\n', strip=True)
            return html.unescape(text)
        return ""

    def _extract_images(self, soup: BeautifulSoup) -> List[str]:
        """Extract product image URLs."""
        images = []
        # Look for gallery images
        gallery = soup.find('div', id='xri_ProDt_Gallery_Disp')
        if gallery:
            for img in gallery.find_all('img'):
                src = img.get('src', '')
                if src and '/upload/pro' in src:
                    # Convert to full-size image URL
                    full_url = src.replace('/pro-md/', '/pro/').replace('/pro-xs/', '/pro/')
                    if not full_url.startswith('http'):
                        full_url = f"https://www.obdii365.com{full_url}"
                    images.append(full_url)
        return list(set(images))[:10]  # Limit to 10 images

    def _extract_weight(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract product weight in kg."""
        # Look for weight row
        for row in soup.find_all('div', class_='form-row'):
            text = row.get_text()
            if 'Weight:' in text:
                # Match patterns like "8.0KG" or "0.2KG"
                match = re.search(r'(\d+\.?\d*)\s*KG', text, re.IGNORECASE)
                if match:
                    return float(match.group(1))
                # Match grams
                match = re.search(r'(\d+)\s*g\b', text)
                if match:
                    return float(match.group(1)) / 1000
        return None

    def _extract_sold_count(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract number of units sold."""
        sold_span = soup.find('span', id=re.compile(r'xri_ProDt_SoldCount'))
        if sold_span:
            match = re.search(r'(\d+)', sold_span.get_text())
            if match:
                return int(match.group(1))
        return None

    def _extract_review_count(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract review count."""
        review_meta = soup.find('meta', itemprop='reviewCount')
        if review_meta and review_meta.get('content'):
            try:
                return int(review_meta['content'])
            except ValueError:
                pass
        return None

    def _extract_vehicle_support(self, description: str, name: str) -> List[VehicleSupport]:
        """Extract vehicle support from description text."""
        vehicles = []
        combined_text = f"{name}\n{description}"
        
        # Find make headings and their following models
        current_make = None
        lines = combined_text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Check if this line is a make name
            for make in self.KNOWN_MAKES:
                if line.upper() == make.upper() or line.upper().startswith(f"{make.upper()} "):
                    current_make = make.upper()
                    # Check for "BMW MINI" style
                    if 'MINI' in line.upper() and 'BMW' in line.upper():
                        current_make = "MINI"
                    break
            
            # Try to extract model/year info from this line
            if current_make:
                for pattern, pattern_type in self.VEHICLE_PATTERNS:
                    matches = re.finditer(pattern, line, re.IGNORECASE)
                    for match in matches:
                        if pattern_type == 'model_from_year':
                            model = match.group(1).strip()
                            year_start = int(match.group(2))
                            vehicles.append(VehicleSupport(
                                make=current_make,
                                model=model,
                                year_start=year_start,
                                year_end=None
                            ))
                        elif pattern_type == 'model_year_range':
                            model = match.group(1).strip()
                            year_start = int(match.group(2))
                            year_end_str = match.group(3)
                            year_end = None if year_end_str == 'current' else int(year_end_str)
                            vehicles.append(VehicleSupport(
                                make=current_make,
                                model=model,
                                year_start=year_start,
                                year_end=year_end
                            ))
        
        # Also check for mentions of makes in title/name
        for make in self.KNOWN_MAKES:
            if make.upper() in name.upper() and not any(v.make == make.upper() for v in vehicles):
                vehicles.append(VehicleSupport(make=make.upper()))
        
        return vehicles

    def _classify_locksmith_relevance(
        self,
        name: str,
        brand: Optional[str],
        categories: List[str],
        keywords: List[str],
        tags: List[str],
        description: str
    ) -> tuple[str, List[str]]:
        """Classify product's locksmith relevance."""
        combined_text = f"{name} {description}".lower()
        locksmith_cats = []
        score = 0
        
        # Check categories
        for cat in categories:
            if cat in self.LOCKSMITH_CATEGORIES["high"]:
                score += 3
                locksmith_cats.append("category_high")
            elif cat in self.LOCKSMITH_CATEGORIES["medium"]:
                score += 2
                locksmith_cats.append("category_medium")
        
        # Check brand
        if brand:
            if brand.upper() in self.HIGH_RELEVANCE_BRANDS:
                score += 2
                locksmith_cats.append("brand_high")
            elif brand.upper() in self.MEDIUM_RELEVANCE_BRANDS:
                score += 1
                locksmith_cats.append("brand_medium")
        
        # Check keywords
        for kw in self.LOCKSMITH_KEYWORDS["high"]:
            if kw in combined_text:
                score += 2
                locksmith_cats.append(f"keyword_{kw.replace(' ', '_')}")
        
        for kw in self.LOCKSMITH_KEYWORDS["medium"]:
            if kw in combined_text:
                score += 1
                locksmith_cats.append(f"keyword_{kw.replace(' ', '_')}")
        
        # Check tags
        locksmith_tags = ["lishi", "key", "lock", "pick", "decoder", "transponder"]
        for tag in tags:
            if any(lt in tag for lt in locksmith_tags):
                score += 1
        
        # Determine relevance level
        if score >= 4:
            relevance = "high"
        elif score >= 2:
            relevance = "medium"
        else:
            relevance = "low"
        
        return relevance, list(set(locksmith_cats))

    def save_results(self, products: List[ParsedProduct]):
        """Save parsed products to JSON files."""
        # Convert to dicts
        all_products = [asdict(p) for p in products]
        
        # Save all products
        all_path = self.output_dir / "parsed_products.json"
        with open(all_path, 'w', encoding='utf-8') as f:
            json.dump(all_products, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(all_products)} products to {all_path}")
        
        # Save locksmith-relevant products
        locksmith_products = [p for p in all_products if p['locksmith_relevance'] in ['high', 'medium']]
        locksmith_path = self.output_dir / "locksmith_products.json"
        with open(locksmith_path, 'w', encoding='utf-8') as f:
            json.dump(locksmith_products, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(locksmith_products)} locksmith products to {locksmith_path}")
        
        # Save vehicle coverage index
        vehicle_index = self._build_vehicle_index(products)
        vehicle_path = self.output_dir / "vehicle_coverage.json"
        with open(vehicle_path, 'w', encoding='utf-8') as f:
            json.dump(vehicle_index, f, indent=2, ensure_ascii=False)
        print(f"Saved vehicle coverage to {vehicle_path}")
        
        # Save summary
        summary = {
            "timestamp": datetime.now().isoformat(),
            "stats": self.stats,
            "errors": self.errors[:50],  # Limit errors in summary
            "error_count": len(self.errors),
            "relevance_breakdown": {
                "high": self.stats["high_relevance"],
                "medium": self.stats["medium_relevance"],
                "low": self.stats["low_relevance"],
            }
        }
        summary_path = self.output_dir / "parse_summary.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"Saved summary to {summary_path}")

    def _build_vehicle_index(self, products: List[ParsedProduct]) -> Dict:
        """Build index of products by vehicle make/model."""
        index = {}
        for product in products:
            for vehicle in product.vehicle_support:
                make = vehicle.get('make', 'Unknown')
                if make not in index:
                    index[make] = {
                        "product_count": 0,
                        "models": {},
                        "products": []
                    }
                
                index[make]["product_count"] += 1
                index[make]["products"].append({
                    "sku": product.sku,
                    "name": product.name,
                    "relevance": product.locksmith_relevance
                })
                
                model = vehicle.get('model')
                if model:
                    if model not in index[make]["models"]:
                        index[make]["models"][model] = []
                    index[make]["models"][model].append(product.sku)
        
        return index


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Parse OBDII365 product HTML files')
    parser.add_argument('--html-dir', type=Path, 
                        default=Path('/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_scraped/html'),
                        help='Directory containing HTML files')
    parser.add_argument('--output-dir', type=Path,
                        default=Path('/Users/jeremysamuels/Documents/study-dashboard/data/obdii365_parsed'),
                        help='Output directory for parsed data')
    parser.add_argument('--sample', type=int, default=0,
                        help='Parse only N files as a sample')
    parser.add_argument('--verbose', action='store_true',
                        help='Print verbose output')
    
    args = parser.parse_args()
    
    print(f"OBDII365 Product Parser")
    print(f"HTML Directory: {args.html_dir}")
    print(f"Output Directory: {args.output_dir}")
    print()
    
    parser_instance = OBDII365Parser(args.html_dir, args.output_dir)
    products = parser_instance.parse_all()
    
    if args.sample > 0:
        products = products[:args.sample]
    
    if args.verbose:
        print("\nSample parsed products:")
        for p in products[:3]:
            print(f"  - {p.name[:60]}... [{p.locksmith_relevance}]")
            if p.vehicle_support:
                print(f"    Vehicles: {p.vehicle_support[:3]}")
    
    parser_instance.save_results(products)
    
    print("\n=== Summary ===")
    print(f"Total files: {parser_instance.stats['total_files']}")
    print(f"Parsed successfully: {parser_instance.stats['parsed_successfully']}")
    print(f"Parse errors: {parser_instance.stats['parse_errors']}")
    print(f"High relevance: {parser_instance.stats['high_relevance']}")
    print(f"Medium relevance: {parser_instance.stats['medium_relevance']}")
    print(f"Low relevance: {parser_instance.stats['low_relevance']}")
    print(f"With vehicle data: {parser_instance.stats['with_vehicle_data']}")


if __name__ == '__main__':
    main()
