import csv
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent

SOURCES = [
    ROOT / "data" / "oem_locksmith_catalog.csv",
    ROOT / "data" / "locksmithkeyless_products.csv",
    ROOT / "data" / "suppliers_products.csv",
    ROOT / "data" / "uhs_hardware_products.csv",
    ROOT / "data" / "strattec_transponder_2008.csv",
]

MASTER_IN = ROOT / "data" / "master_locksmith_expanded.csv"
MASTER_OUT = ROOT / "data" / "master_locksmith_expanded_fcc.csv"


def safe_int(val):
    try:
        return int(val)
    except Exception:
        return None


def normalize_make(m):
    return (m or "").strip().lower()


def load_sources():
    by_key = defaultdict(list)  # (make, model, year) -> list of fcc
    fcc_set = set()
    for src in SOURCES:
        if not src.exists():
            continue
        with src.open() as f:
            reader = csv.DictReader(f)
            for row in reader:
                make = normalize_make(row.get("make", ""))
                model = (row.get("model", "") or row.get("title", "") or "").strip().lower()
                year = safe_int(row.get("year", "") or row.get("Year", ""))
                fcc = (row.get("fcc_id", "") or row.get("fccId", "") or row.get("FCC ID", "") or "").strip()
                if not fcc:
                    continue
                if make and model and year:
                    by_key[(make, model, year)].append(fcc)
                fcc_set.add(fcc)
    # prefer most common FCC per key
    by_key_resolved = {}
    for k, vals in by_key.items():
        counts = defaultdict(int)
        for v in vals:
            counts[v] += 1
        best = sorted(counts.items(), key=lambda x: (-x[1], x[0]))[0][0]
        by_key_resolved[k] = best
    return by_key_resolved, fcc_set


def reconcile():
    by_key, fcc_set = load_sources()
    if not MASTER_IN.exists():
        raise SystemExit(f"Master input not found: {MASTER_IN}")

    with MASTER_IN.open() as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        extra_fields = ["fcc_confidence", "fcc_source"]
        for ef in extra_fields:
            if ef not in fieldnames:
                fieldnames.append(ef)
        rows_out = []
        for row in reader:
            make = normalize_make(row.get("make", ""))
            model = (row.get("model", "") or "").strip().lower()
            year = safe_int(row.get("year", ""))
            fcc_existing = row.get("fcc_id", "").strip()
            key = (make, model, year)
            filled = False
            confidence = row.get("confidence", "").strip() or "unknown"
            fcc_source = (row.get("fcc_source") or "").strip()

            if fcc_existing:
                # mark confidence high if we have explicit fcc
                confidence = "high"
                if not fcc_source:
                    fcc_source = "master_explicit"
            elif key in by_key:
                row["fcc_id"] = by_key[key]
                confidence = "high"
                fcc_source = "reconciled_sources"
                filled = True
            else:
                confidence = confidence or "unknown"
                fcc_source = fcc_source or "missing"

            row["fcc_confidence"] = confidence
            row["fcc_source"] = fcc_source
            rows_out.append(row)

    with MASTER_OUT.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Reconciled rows: {len(rows_out)}")
    print(f"Output: {MASTER_OUT}")


if __name__ == "__main__":
    reconcile()
