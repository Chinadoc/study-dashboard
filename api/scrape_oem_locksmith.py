#!/usr/bin/env python3
"""
Scrape locksmith-relevant product data from oemcarkeymall.com and export a CSV.

What it collects (best-effort heuristics):
- make, model, year range (when present in title/body)
- FCC ID, part number, SKU
- chip/transponder, keyway/blade, button count, battery, frequency
- remote start flag, immobilizer flag
- price & currency, product URL, raw title/description for auditability

Usage:
    python api/scrape_oem_locksmith.py --out data/oem_locksmith_catalog.csv --limit 500 --delay 0.5

Notes:
- Respects the site sitemap to discover product pages. If robots or ToS disallow scraping,
  do not run this script.
- Requires: requests, beautifulsoup4
    pip install requests beautifulsoup4
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
from dataclasses import dataclass, asdict
from typing import Dict, Iterable, List, Optional

try:
    import requests
    from bs4 import BeautifulSoup  # type: ignore
except ImportError as exc:  # pragma: no cover
    print("Missing dependencies. Install with: pip install requests beautifulsoup4", file=sys.stderr)
    raise


SITEMAP_INDEX = "https://oemcarkeymall.com/sitemap.xml"
PRODUCT_SITEMAP_MATCH = re.compile(r"sitemap_products", re.I)
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "study-dashboard-scraper/1.0"})


CSV_FIELDS = [
    "make",
    "model",
    "year",
    "fcc_id",
    "part_number",
    "sku",
    "chip",
    "keyway",
    "buttons",
    "battery",
    "frequency",
    "remote_start",
    "immobilizer",
    "notes",
    "price",
    "currency",
    "url",
    "title_raw",
    "compatibility_raw",
]


@dataclass
class ProductRow:
    make: str = ""
    model: str = ""
    year: str = ""
    fcc_id: str = ""
    part_number: str = ""
    sku: str = ""
    chip: str = ""
    keyway: str = ""
    buttons: str = ""
    battery: str = ""
    frequency: str = ""
    remote_start: str = ""
    immobilizer: str = ""
    notes: str = ""
    price: str = ""
    currency: str = ""
    url: str = ""
    title_raw: str = ""
    compatibility_raw: str = ""

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


def fetch_text(url: str) -> str:
    resp = SESSION.get(url, timeout=20)
    resp.raise_for_status()
    return resp.text


def find_product_sitemaps() -> List[str]:
    index_xml = fetch_text(SITEMAP_INDEX)
    soup = BeautifulSoup(index_xml, "xml")
    sitemaps = [
        loc.text.strip()
        for loc in soup.find_all("loc")
        if loc and PRODUCT_SITEMAP_MATCH.search(loc.text or "")
    ]
    return sitemaps or [SITEMAP_INDEX]


def iter_product_urls(limit: Optional[int] = None) -> Iterable[str]:
    seen = set()
    for sm_url in find_product_sitemaps():
        xml = fetch_text(sm_url)
        soup = BeautifulSoup(xml, "xml")
        for loc in soup.find_all("loc"):
            url = (loc.text or "").strip()
            if not url or url in seen:
                continue
            # Restrict to product detail pages
            if "/products/" not in url:
                continue
            seen.add(url)
            yield url
            if limit and len(seen) >= limit:
                return


def fetch_product_json(url: str) -> Optional[Dict]:
    """Fetch Shopify product JSON for a product URL."""
    json_url = url.rstrip("/") + ".json"
    resp = SESSION.get(json_url, timeout=20)
    if not resp.ok:
        return None
    data = resp.json()
    return data.get("product")


def extract_field(text: str, pattern: str) -> str:
    match = re.search(pattern, text, re.I)
    return match.group(1).strip() if match else ""


def clean_text(html: str) -> str:
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(" ", strip=True)


def parse_product(url: str) -> ProductRow:
    product = fetch_product_json(url)

    if not product:
        raise ValueError("Product JSON not found")

    title = product.get("title", "")
    body_text = clean_text(product.get("body_html", ""))
    tags = product.get("tags", "") or ""
    vendor = product.get("vendor", "") or ""
    handle = product.get("handle", "") or ""

    desc_text = " ".join([title, body_text, tags, vendor, handle])

    variants = product.get("variants", []) or []
    primary_variant = next((v for v in variants if v.get("price")), variants[0] if variants else {})
    price = str(primary_variant.get("price", "")) if primary_variant else ""
    currency = primary_variant.get("presentment_prices", [{}])[0].get("price", {}).get("currency") if isinstance(primary_variant.get("presentment_prices"), list) else ""
    currency = currency or "USD"
    sku = primary_variant.get("sku", "") if primary_variant else ""

    # Extract key fields
    fcc_id = extract_field(desc_text, r"FCC[:\s]*([A-Z0-9\-]+)")
    part_number = extract_field(desc_text, r"(?:P/?N|Part\s*Number|PN)[:\s-]*([A-Za-z0-9\-]+)")
    chip = extract_field(desc_text, r"(?:Chip|Transponder|Immobilizer)[:\s-]*([A-Za-z0-9\-\s]+)")
    keyway = extract_field(desc_text, r"(?:Keyway|Blade|Key Type|Emergency Key)[:\s-]*([A-Za-z0-9\-\s]+)")
    buttons = extract_field(desc_text, r"(\d+)\s*(?:button|btn|b)(?!attery)")
    battery = extract_field(desc_text, r"(CR\d{3,4}|BR\d{3,4})")
    frequency = extract_field(desc_text, r"(\d{3}(?:\.\d+)?)\s*MHz") or extract_field(desc_text, r"(?:Freq|Frequency)[:\s-]*([\d\.]+)")

    remote_start = "yes" if re.search(r"remote start", desc_text, re.I) else ""
    immobilizer = "yes" if re.search(r"immobilizer|transponder", desc_text, re.I) else ""

    compat_match = re.search(r"compatible(?: with)?[:\-]\s*([^\.]+)", desc_text, re.I)
    compatibility_raw = compat_match.group(1).strip() if compat_match else ""

    ymm = re.search(r"(\d{4})(?:[-–](\d{4}))?\s+([A-Za-z]+)\s+([A-Za-z0-9\s-]+)", title or "")
    year = f"{ymm.group(1)}-{ymm.group(2)}" if ymm and ymm.group(2) else (ymm.group(1) if ymm else "")
    make = ymm.group(3).strip() if ymm else ""
    model = ymm.group(4).strip() if ymm else ""

    row = ProductRow(
        make=make,
        model=model,
        year=year,
        fcc_id=fcc_id,
        part_number=part_number,
        sku=sku,
        chip=chip,
        keyway=keyway,
        buttons=buttons,
        battery=battery,
        frequency=frequency,
        remote_start=remote_start,
        immobilizer=immobilizer,
        notes="",
        price=price,
        currency=currency,
        url=url,
        title_raw=title,
        compatibility_raw=compatibility_raw,
    )

    return row


def write_csv(rows: List[ProductRow], out_path: str) -> None:
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow(row.to_dict())


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape oemcarkeymall.com locksmith data into CSV.")
    parser.add_argument("--out", default="data/oem_locksmith_catalog.csv", help="Output CSV path")
    parser.add_argument("--limit", type=int, default=200, help="Max products to scrape (0=all)")
    parser.add_argument("--delay", type=float, default=0.4, help="Seconds to sleep between product fetches")
    args = parser.parse_args()

    limit = args.limit if args.limit and args.limit > 0 else None
    rows: List[ProductRow] = []

    for idx, url in enumerate(iter_product_urls(limit=limit), start=1):
        try:
            row = parse_product(url)
            rows.append(row)
            print(f"[{idx}] {row.fcc_id or 'NO-FCC'} | {row.title_raw[:80]}...")
        except Exception as exc:  # pragma: no cover
            print(f"Error parsing {url}: {exc}", file=sys.stderr)
        time.sleep(args.delay)

    write_csv(rows, args.out)
    print(f"Wrote {len(rows)} rows -> {args.out}")


if __name__ == "__main__":  # pragma: no cover
    main()
