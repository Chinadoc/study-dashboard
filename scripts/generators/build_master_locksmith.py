import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMMOBILIZERS_CSV = ROOT / "data" / "immobilizers.csv"
OEM_CSV = ROOT / "data" / "oem_locksmith_catalog.csv"
OUT_CSV = ROOT / "data" / "master_locksmith.csv"


def parse_year_span(text: str):
    if not text:
        return None, None
    s = text.strip().strip('"')
    if not s:
        return None, None
    s = s.replace("~", "")
    parts = re.split(r"[-–]", s)
    if len(parts) == 2 and parts[0].strip().isdigit() and parts[1].strip().isdigit():
        return int(parts[0]), int(parts[1])
    if len(parts) == 1 and parts[0].strip().isdigit():
        y = int(parts[0])
        return y, y
    # Fallback if malformed
    return None, None


def load_immobilizers():
    immos = []
    with IMMOBILIZERS_CSV.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            start, end = parse_year_span(row.get("years", ""))
            immos.append({
                "make": row.get("make", "").strip(),
                "module": row.get("module_or_system", "").strip(),
                "start": start,
                "end": end,
                "years_text": row.get("years", "").strip(),
            })
    return immos


def choose_immobilizer(make: str, year: int, immos):
    cand = [i for i in immos if i["make"].lower() == make.lower()]
    # Prefer matching year range; fallback to first entry for the make
    best = None
    for i in cand:
        if i["start"] is None or i["end"] is None:
            continue
        if year >= i["start"] and year <= i["end"]:
            span = i["end"] - i["start"]
            if best is None or span < (best["end"] - best["start"]):
                best = i
    if best:
        return best["module"], best["years_text"]
    if cand:
        fallback = cand[0]
        return fallback["module"], fallback.get("years_text", "")
    return "", ""


def infer_key_type(title: str, product_type: str):
    t = (title or "") + " " + (product_type or "")
    t = t.lower()
    if "smart" in t or "prox" in t or "proximity" in t:
        return "smart"
    if "remote" in t:
        return "remote"
    if "transponder" in t or "chip" in t:
        return "transponder"
    return "key"


def build_master():
    immos = load_immobilizers()
    out_rows = []
    with OEM_CSV.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            make = row.get("make", "").strip()
            model = row.get("model", "").strip()
            year_raw = row.get("year", "").strip()
            try:
                year = int(year_raw)
            except Exception:
                continue
            immo_sys, immo_years = choose_immobilizer(make, year, immos)
            key_type = infer_key_type(row.get("title_raw", ""), row.get("product_type", ""))
            out_rows.append({
                "make": make,
                "model": model,
                "year": year,
                "immobilizer_system": immo_sys,
                "immobilizer_years": immo_years,
                "key_type": key_type,
                "chip": row.get("chip", "").strip(),
                "fcc_id": row.get("fcc_id", "").strip(),
                "part_number": row.get("part_number", "").strip(),
                "keyway": row.get("keyway", "").strip(),
                "frequency": row.get("frequency", "").strip(),
                "battery": row.get("battery", "").strip(),
                "buttons": row.get("buttons", "").strip(),
                "remote_start": row.get("remote_start", "").strip(),
                "notes": (row.get("notes", "") or row.get("compatibility_raw", "")).strip(),
                "source": "oem_locksmith_catalog.csv",
                "url": row.get("url", "").strip(),
            })

    fieldnames = [
        "make",
        "model",
        "year",
        "immobilizer_system",
        "immobilizer_years",
        "key_type",
        "chip",
        "fcc_id",
        "part_number",
        "keyway",
        "frequency",
        "battery",
        "buttons",
        "remote_start",
        "notes",
        "source",
        "url",
    ]

    with OUT_CSV.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(out_rows)

    print(f"Wrote {len(out_rows)} rows to {OUT_CSV}")


if __name__ == "__main__":
    build_master()
