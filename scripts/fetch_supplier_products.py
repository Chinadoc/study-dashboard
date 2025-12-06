#!/usr/bin/env python3
"""
Fetch Shopify product JSON feeds for LocksmithKeyless and UHS Hardware,
filter to likely key/remote items, and render CSV outputs.
"""

import csv
import html
import re
import sys
import time
from pathlib import Path
from typing import Dict, Iterable, List, Optional

import requests


# Shopify JSON endpoints
SUPPLIERS = {
    "locksmithkeyless": "https://www.locksmithkeyless.com/collections/keys-and-remotes/products.json",
    "uhs_hardware": "https://www.uhs-hardware.com/products.json",
}

# Heuristic keywords to identify key/remote products
KEY_KEYWORDS = {
    "key",
    "keys",
    "remote",
    "remotes",
    "fob",
    "fobs",
    "smart key",
    "flip key",
    "transponder",
    "fobik",
    "blade",
}


def fetch_all_products(url: str) -> List[Dict]:
    all_products: List[Dict] = []
    page = 1
    while True:
        resp = requests.get(url, params={"limit": 250, "page": page}, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        products = data.get("products", [])
        if not products:
            break
        all_products.extend(products)
        page += 1
        # small pause to be friendly
        time.sleep(0.2)
    return all_products


def strip_html(text: Optional[str]) -> str:
    if not text:
        return ""
    txt = re.sub(r"<[^>]+>", " ", text)
    txt = html.unescape(txt)
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt


def extract_field(body: str, label: str) -> str:
    # Grab up to comma, double-space, or end
    pattern = re.compile(rf"{label}\s*:?\s*([A-Za-z0-9\-\s/#\.]+?)(?:,|\s{{2,}}|$)", re.IGNORECASE)
    m = pattern.search(body)
    return m.group(1).strip() if m else ""


def is_key_product(prod: Dict) -> bool:
    # Check product_type and tags
    text_fields = " ".join(
        [
            str(prod.get("product_type", "")),
            " ".join(prod.get("tags", [])),
            prod.get("title", ""),
        ]
    ).lower()
    return any(kw in text_fields for kw in KEY_KEYWORDS)


def product_rows(source: str, products: Iterable[Dict]) -> List[Dict]:
    rows: List[Dict] = []
    for p in products:
        if not is_key_product(p):
            continue
        body_text = strip_html(p.get("body_html", ""))
        fcc_id = extract_field(body_text, "fcc id")
        frequency = extract_field(body_text, "frequency")
        chip = extract_field(body_text, "chip")
        part_number = extract_field(body_text, "part")
        ic = extract_field(body_text, "ic")

        # pick first variant for pricing/sku/availability
        variants = p.get("variants", []) or [{}]
        v = variants[0]
        sku = v.get("sku", "")
        price = v.get("price", "")
        compare = v.get("compare_at_price", "")
        available = bool(v.get("available", False))

        # first image
        images = p.get("images", []) or [{}]
        image_url = images[0].get("src", "") if images else ""

        rows.append(
            {
                "source": source,
                "product_id": p.get("id", 0),
                "handle": p.get("handle", ""),
                "title": p.get("title", ""),
                "vendor": p.get("vendor", ""),
                "product_type": p.get("product_type", ""),
                "tags": ";".join(p.get("tags", [])),
                "sku": sku,
                "price": price,
                "compare_at_price": compare,
                "available": available,
                "fcc_id": fcc_id,
                "frequency": frequency,
                "chip": chip,
                "part_number": part_number,
                "ic": ic,
                "body_text": body_text,
                "image_url": image_url,
                "product_url": f"https://www.{source.replace('_', '-')}.com/products/{p.get('handle','')}",
            }
        )
    return rows


def write_csv(path: Path, rows: List[Dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        for r in rows:
            writer.writerow(r)


def write_json(path: Path, rows: List[Dict]) -> None:
    import json

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False)


def main():
    out_dir = Path("data")
    all_rows: List[Dict] = []
    for source, url in SUPPLIERS.items():
        print(f"Fetching {source} ...", file=sys.stderr)
        products = fetch_all_products(url)
        rows = product_rows(source, products)
        if rows:
            csv_path = out_dir / f"{source}_products.csv"
            write_csv(csv_path, rows)
            write_json(out_dir / f"{source}_products.json", rows)
            print(f" wrote {len(rows)} rows -> {csv_path}", file=sys.stderr)
            all_rows.extend(rows)
        else:
            print(f" no key-like products found for {source}", file=sys.stderr)

    if all_rows:
        combined = out_dir / "suppliers_products.csv"
        write_csv(combined, all_rows)
        print(f" wrote combined {len(all_rows)} rows -> {combined}", file=sys.stderr)


if __name__ == "__main__":
    main()

