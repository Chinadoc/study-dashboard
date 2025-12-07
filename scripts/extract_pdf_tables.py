import argparse
import csv
import pdfplumber
from pathlib import Path

def clean(cell):
    if cell is None:
        return ''
    return ' '.join(str(cell).split())

def extract(pdf_path, out_path, max_pages=None, min_cols=4):
    rows = []
    with pdfplumber.open(pdf_path) as pdf:
        pages = pdf.pages if max_pages is None else pdf.pages[:max_pages]
        for idx, page in enumerate(pages, start=1):
            # Try stream mode first (works for text-based tables)
            tables = page.extract_tables(table_settings={
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "snap_tolerance": 3,
                "intersection_tolerance": 5,
                "join_tolerance": 3,
            }) or []
            # If nothing, try a looser strategy
            if not tables:
                tables = page.extract_tables(table_settings={
                    "vertical_strategy": "text",
                    "horizontal_strategy": "text",
                    "snap_tolerance": 3,
                }) or []
            for t in tables:
                if not t or len(t[0]) < min_cols:
                    continue
                for row in t:
                    cleaned = [clean(c) for c in row]
                    if any(cleaned):
                        rows.append(cleaned)
    if not rows:
        print("No rows extracted")
        return
    # Normalize to widest row length
    width = max(len(r) for r in rows)
    header = [f"col{i+1}" for i in range(width)]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for r in rows:
            padded = r + [''] * (width - len(r))
            writer.writerow(padded)
    print(f"Wrote {len(rows)} rows to {out_path} with {width} columns")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", help="PDF path")
    ap.add_argument("--out", default=None, help="Output CSV path")
    ap.add_argument("--max-pages", type=int, default=None, help="Limit pages")
    args = ap.parse_args()
    pdf_path = Path(args.pdf)
    out_path = Path(args.out) if args.out else pdf_path.with_suffix(".csv")
    extract(pdf_path, out_path, max_pages=args.max_pages)
