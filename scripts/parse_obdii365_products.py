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
class TechnicalSpecs:
    """Structured technical specifications extracted from product."""
    # Transponder/chip types
    chips: List[str]  # PCF79XX, NEC24C64, ID46, etc.
    # IMMO system modules
    immo_modules: List[str]  # BDC2, BDC3, CAS1-4, FEM, etc.
    # Communication protocols
    protocols: List[str]  # CAN-FD, DoIP, K-LINE, etc.
    # Parent/compatible tools
    compatible_tools: List[str]  # IM508, XP400, VVDI2, etc.
    # Supported functions
    functions: List[str]  # key programming, EEPROM read, etc.
    # Lishi keyway codes
    keyways: List[str]  # HU92, HU66, etc.
    # NEW: RF frequencies for remotes
    rf_frequencies: List[str]  # 433MHz, 315MHz, 868MHz
    # NEW: MCU/processor types for bench work
    mcu_types: List[str]  # RH850, TC1797, MC9S12, etc.
    # NEW: EEPROM chip types
    eeprom_chips: List[str]  # 35080, 93C56, 24C64, etc.
    # NEW: Key blade part numbers
    key_blades: List[str]  # GT107, TOY43AT, HU92 blade, etc.
    # NEW: Connectivity options
    connectivity: List[str]  # Bluetooth, WiFi, USB, ENET
    # NEW: Remote button configurations
    button_count: Optional[str]  # 3-button, 4-button, etc.
    # NEW: Required adapters/accessories
    adapters: List[str]  # APB112, VH24, etc.


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
    technical_specs: Dict  # TechnicalSpecs as dict
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
    
    # Chip/transponder patterns to extract
    CHIP_PATTERNS = [
        # PCF series
        r'PCF79[0-9A-Z]{2,4}',
        r'PCF7935', r'PCF7936', r'PCF7939', r'PCF7941', r'PCF7945', r'PCF7952', r'PCF7953',
        # NEC chips
        r'NEC24C(?:32|64|128|256)',
        r'NEC35XX',
        # ID chips
        r'ID(?:46|47|48|49|4A|4D|4E|8A|8C|8E)',
        r'ID\s*(?:46|47|48|49|4A|4D|4E|8A|8C|8E)',
        # Hitag series
        r'HITAG[- ]?(?:2|3|PRO)',
        # Megamos
        r'MEGAMOS(?:[- ]?(?:48|AES|CRYPTO))?',
        # Toyota/Lexus
        r'(?:4D|8A)[- ]?(?:67|68|70|71|72|80)',
        r'H[- ]?CHIP',
        r'G[- ]?CHIP',
        # DST series
        r'DST(?:40|80|AES)',
        # Texas
        r'TI[- ]?(?:DST|CRYPTO)',
        # Generic transponder mentions
        r'(?:46|47|48|4D|8A)[- ]?(?:CHIP|TRANSPONDER)',
    ]
    
    # IMMO module patterns
    IMMO_MODULE_PATTERNS = [
        # BMW
        r'BDC[- ]?[234]?', r'FEM', r'CAS[- ]?[1234]', r'EWS[- ]?[234]',
        # Mercedes
        r'EIS', r'ESL', r'EZS', r'FBS[- ]?[34]',
        # VAG
        r'IMMO[- ]?(?:I{1,5}|[1-5])', r'MQB', r'MLB', r'NEC[- ]?(?:\+|PLUS)?', r'BCM2',
        # General
        r'(?:SMART|KEY)[- ]?ECU', r'KESSY', r'KEYLESS[- ]?(?:GO|ENTRY)',
        # Land Rover/Jaguar
        r'KVM', r'RFA',
        # GM
        r'BCM', r'TPMS',
        # Toyota
        r'SMART[- ]?BOX', r'IMMO[- ]?BOX',
    ]
    
    # Protocol patterns
    PROTOCOL_PATTERNS = [
        r'CAN[- ]?FD', r'DOIP', r'DO[- ]?IP', r'UDS',
        r'K[- ]?LINE', r'J2534', r'PASS[- ]?THRU',
        r'OBD[- ]?II?', r'EOBD', r'JOBD',
        r'CAN[- ]?BUS', r'LIN[- ]?BUS', r'MOST',
        r'JTAG', r'BDM', r'SWD',
    ]
    
    # Compatible tool patterns  
    TOOL_PATTERNS = [
        # Autel
        r'IM(?:508|608|108|508S|608S|608[- ]?PRO[- ]?(?:II|2)?)',
        r'XP400[- ]?(?:PRO)?', r'APB\d{3}', r'G[- ]?BOX[- ]?[23]?',
        # OBDSTAR
        r'X300[- ]?(?:DP[- ]?PLUS|PRO[- ]?4|CLASSIC|PAD)?',
        r'X100[- ]?(?:PRO|PAD)?', r'P001', r'P002', r'Key[- ]?Master',
        # Xhorse
        r'VVDI[- ]?(?:2|MB|BMW|PROG|KEY[- ]?TOOL|MINI|BIM)',
        r'MINI[- ]?(?:PROG|KEY[- ]?TOOL|OBD)',
        r'KEY[- ]?TOOL[- ]?(?:MAX|PLUS|PAD)?',
        r'DOLPHIN', r'CONDOR',
        # Lonsdor
        r'K518[- ]?(?:ISE|PRO|S)?', r'KH100',
        # CGDI
        r'CGDI[- ]?(?:MB|BMW|PROG|PRO)',
        r'CG[- ]?PRO', r'CG100',
        # Others
        r'AVDI', r'ABRITES', r'FVDI', r'SVCI',
        r'YANHUA[- ]?(?:MINI|ACDP)', r'ACDP[- ]?(?:MINI|2)?',
        r'GODIAG[- ]?(?:GT100|GD801)',
        r'LAUNCH[- ]?X431',
        r'XTOOL[- ]?(?:X100|PAD|PS)',
    ]
    
    # Function patterns
    FUNCTION_PATTERNS = [
        r'KEY[- ]?(?:PROGRAMMING|LEARNING|GENERATION|COPY|CLONE|ADD)',
        r'ALL[- ]?KEY[S]?[- ]?LOST', r'AKL',
        r'EEPROM[- ]?(?:READ|WRITE|DUMP)',
        r'MCU[- ]?(?:READ|WRITE|CLONE)',
        r'ECU[- ]?(?:CLONE|READ|WRITE|RESET|VIRGINIZE)',
        r'IMMO[- ]?(?:OFF|BYPASS|DELETE|RESET)',
        r'PIN[- ]?(?:CODE|READ)', r'CS[- ]?READ',
        r'REMOTE[- ]?(?:LEARNING|PROGRAMMING|RENEW)',
        r'TRANSPONDER[- ]?(?:COPY|CLONE|READ|WRITE)',
        r'ODOMETER[- ]?(?:CORRECTION|ADJUST)',
        r'MILEAGE[- ]?(?:CORRECTION|ADJUST|RESET)',
        r'AIRBAG[- ]?RESET', r'SRS[- ]?RESET',
        r'DPF[- ]?(?:REGEN|RESET)', r'EPB[- ]?(?:RESET|SERVICE)',
        r'CODING', r'ADAPTATION', r'VIRGIN(?:IZE)?',
    ]
    
    # Keyway patterns (Lishi tools)
    KEYWAY_PATTERNS = [
        r'HU(?:58|64|66|83|87|92|100|101|162[RT]?|198)',
        r'TOY(?:38R|40|43|43AT|48|51)',
        r'HON(?:58R|66|70)',
        r'NSN14', r'DAT17', r'VA2[RT]?', r'NE72',
        r'HY(?:20|22)R?', r'KIA3R?', r'MIT8',
        r'FO(?:21|38)', r'MAZ24R?',
        r'SIP22', r'GT15', r'WT47T',
    ]
    
    # RF Frequency patterns (for remotes/fobs)
    RF_FREQUENCY_PATTERNS = [
        r'(\d{3})[- ]?MHZ',  # 433MHz, 315MHz, 868MHz, etc.
    ]
    
    # MCU/Processor patterns (for bench/EEPROM work)
    MCU_PATTERNS = [
        r'RH850', r'V850',
        r'TC17(?:66|67|82|96|97)',
        r'MC9S12[A-Z0-9]*',
        r'9S12(?:XDP512|DG256|XEP100|XEQ384)?',
        r'SPC5[0-9]{3}',
        r'MPC5[0-9]{3}',
        r'S12X?E?',
    ]
    
    # EEPROM chip patterns
    EEPROM_PATTERNS = [
        r'35080', r'35160[DW]?',
        r'93C(?:46|56|66|76|86)',
        r'24C(?:01|02|04|08|16|32|64|128|256)',
        r'25(?:040|080|160|320|640)',
    ]
    
    # Key blade part number patterns
    KEY_BLADE_PATTERNS = [
        r'GT1(?:0[0-9]|1[0-9]|2[0-9])',  # GT100-GT129
        r'TOY43(?:AT|R)?',
        r'HU(?:66|92|101|162T?)[- ]?BLADE',
        r'FO(?:21|38)[- ]?BLADE',
        r'NSN14[- ]?BLADE',
        r'(?:MIT|TOY|HON|HY|KIA|SX|YM|NE|VA|FO|MAZ)\d{1,2}[A-Z]{0,2}EN',  # Blade part numbers
    ]
    
    # Connectivity patterns
    CONNECTIVITY_PATTERNS = [
        r'BLUETOOTH', r'BT[- ]?(?:4|5)?\\.?0?',
        r'WI[- ]?FI', r'WIFI', r'WIRELESS',
        r'USB[- ]?(?:C|2\\.0|3\\.0)?', r'TYPE[- ]?C',
        r'ENET', r'ETHERNET',
        r'OBD[- ]?(?:16|II)[- ]?(?:CONNECTOR)?',
    ]
    
    # Button count patterns (for remotes)
    BUTTON_PATTERNS = [
        r'(\d)[- ]?BUTTON',  # 3-button, 4-button, etc.
    ]
    
    # Adapter/accessory part number patterns
    ADAPTER_PATTERNS = [
        r'APB1(?:12|13|14|15|30|31)',
        r'VH(?:24|29|30|31)',
        r'G[- ]?BOX[- ]?[23]?',
        r'IMKPA',
        r'XP400[- ]?(?:PRO)?',
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
            "with_chip_data": 0,
            "with_module_data": 0,
            "with_tool_compat": 0,
            "with_rf_freq": 0,
            "with_mcu_data": 0,
            "with_eeprom_data": 0,
            "with_connectivity": 0,
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
                    # Track technical specs
                    specs = product.technical_specs
                    if specs.get('chips'):
                        self.stats["with_chip_data"] += 1
                    if specs.get('immo_modules'):
                        self.stats["with_module_data"] += 1
                    if specs.get('compatible_tools'):
                        self.stats["with_tool_compat"] += 1
                    if specs.get('rf_frequencies'):
                        self.stats["with_rf_freq"] += 1
                    if specs.get('mcu_types'):
                        self.stats["with_mcu_data"] += 1
                    if specs.get('eeprom_chips'):
                        self.stats["with_eeprom_data"] += 1
                    if specs.get('connectivity'):
                        self.stats["with_connectivity"] += 1
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
        
        # Extract technical specs (chips, modules, protocols, tools)
        technical_specs = self._extract_technical_specs(name, description_full)
        
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
            technical_specs=asdict(technical_specs),
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

    def _extract_technical_specs(self, name: str, description: str) -> TechnicalSpecs:
        """Extract structured technical specifications from product text."""
        combined_text = f"{name} {description}".upper()
        
        def extract_matches(patterns: List[str], text: str) -> List[str]:
            """Extract unique matches for a list of regex patterns."""
            matches = set()
            for pattern in patterns:
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    # Normalize the match
                    value = match.group(0).strip().upper()
                    # Clean up common variations
                    value = re.sub(r'[- ]+', '', value)
                    matches.add(value)
            return sorted(list(matches))
        
        def extract_groups(patterns: List[str], text: str) -> List[str]:
            """Extract capture groups from patterns."""
            matches = set()
            for pattern in patterns:
                for match in re.finditer(pattern, text, re.IGNORECASE):
                    if match.groups():
                        matches.add(match.group(1).upper())
                    else:
                        matches.add(match.group(0).upper())
            return sorted(list(matches))
        
        # Extract each category
        chips = extract_matches(self.CHIP_PATTERNS, combined_text)
        immo_modules = extract_matches(self.IMMO_MODULE_PATTERNS, combined_text)
        protocols = extract_matches(self.PROTOCOL_PATTERNS, combined_text)
        compatible_tools = extract_matches(self.TOOL_PATTERNS, combined_text)
        functions = extract_matches(self.FUNCTION_PATTERNS, combined_text)
        keyways = extract_matches(self.KEYWAY_PATTERNS, combined_text)
        
        # NEW: Extract additional locksmith categories
        rf_frequencies = extract_groups(self.RF_FREQUENCY_PATTERNS, combined_text)
        # Filter valid frequencies
        rf_frequencies = [f + 'MHZ' for f in rf_frequencies if f in ['315', '433', '434', '868', '902', '915', '314', '312']]
        
        mcu_types = extract_matches(self.MCU_PATTERNS, combined_text)
        eeprom_chips = extract_matches(self.EEPROM_PATTERNS, combined_text)
        key_blades = extract_matches(self.KEY_BLADE_PATTERNS, combined_text)
        connectivity = extract_matches(self.CONNECTIVITY_PATTERNS, combined_text)
        adapters = extract_matches(self.ADAPTER_PATTERNS, combined_text)
        
        # Extract button count (take most common/relevant)
        button_matches = re.findall(r'(\d)[- ]?BUTTON', combined_text, re.IGNORECASE)
        button_count = button_matches[0] + '-BUTTON' if button_matches else None
        
        # Filter out false positives
        # Remove generic "IMMO" if we have specific IMMO types
        if immo_modules:
            specific_immo = [m for m in immo_modules if m != 'IMMO' and not re.match(r'^IMMO[IV]+$', m)]
            if specific_immo:
                immo_modules = specific_immo
        
        # Remove overly generic tool matches
        compatible_tools = [t for t in compatible_tools if len(t) > 2]
        
        # Clean up connectivity duplicates
        connectivity = list(set(c.replace('WIFI', 'WIFI').replace('WI-FI', 'WIFI') for c in connectivity))
        
        return TechnicalSpecs(
            chips=chips,
            immo_modules=immo_modules,
            protocols=protocols,
            compatible_tools=compatible_tools,
            functions=functions,
            keyways=keyways,
            rf_frequencies=rf_frequencies,
            mcu_types=mcu_types,
            eeprom_chips=eeprom_chips,
            key_blades=key_blades,
            connectivity=connectivity,
            button_count=button_count,
            adapters=adapters,
        )

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
                print(f"    Vehicles: {p.vehicle_support[:2]}")
            specs = p.technical_specs
            if specs.get('chips'):
                print(f"    Chips: {specs['chips'][:4]}")
            if specs.get('compatible_tools'):
                print(f"    Tools: {specs['compatible_tools'][:4]}")
            if specs.get('rf_frequencies'):
                print(f"    RF Freq: {specs['rf_frequencies']}")
            if specs.get('mcu_types'):
                print(f"    MCU: {specs['mcu_types'][:3]}")
            if specs.get('eeprom_chips'):
                print(f"    EEPROM: {specs['eeprom_chips'][:3]}")
            if specs.get('connectivity'):
                print(f"    Connectivity: {specs['connectivity'][:3]}")
    
    parser_instance.save_results(products)
    
    print("\n=== Summary ===")
    print(f"Total files: {parser_instance.stats['total_files']}")
    print(f"Parsed successfully: {parser_instance.stats['parsed_successfully']}")
    print(f"Parse errors: {parser_instance.stats['parse_errors']}")
    print(f"High relevance: {parser_instance.stats['high_relevance']}")
    print(f"Medium relevance: {parser_instance.stats['medium_relevance']}")
    print(f"Low relevance: {parser_instance.stats['low_relevance']}")
    print("\n--- Technical Data Coverage ---")
    print(f"With vehicle data: {parser_instance.stats['with_vehicle_data']}")
    print(f"With chip data: {parser_instance.stats['with_chip_data']}")
    print(f"With module data: {parser_instance.stats['with_module_data']}")
    print(f"With tool compatibility: {parser_instance.stats['with_tool_compat']}")
    print(f"With RF frequencies: {parser_instance.stats['with_rf_freq']}")
    print(f"With MCU data: {parser_instance.stats['with_mcu_data']}")
    print(f"With EEPROM data: {parser_instance.stats['with_eeprom_data']}")
    print(f"With connectivity: {parser_instance.stats['with_connectivity']}")


if __name__ == '__main__':
    main()
