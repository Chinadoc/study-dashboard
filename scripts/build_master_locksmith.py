import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMMOBILIZERS_CSV = ROOT / "data" / "immobilizers.csv"
OEM_CSV = ROOT / "data" / "oem_locksmith_catalog.csv"
OUT_CSV = ROOT / "data" / "master_locksmith.csv"
OUT_CSV_EXPANDED = ROOT / "data" / "master_locksmith_expanded.csv"
VENDOR_MANUAL_CSV = ROOT / "data" / "vendor_coverage_manual.csv"


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


def normalize_make(name: str) -> str:
    n = (name or "").strip().lower()
    aliases = {
        "chevrolet": "gm",
        "cadillac": "gm",
        "gmc": "gm",
        "buick": "gm",
        "pontiac": "gm",
        "saturn": "gm",
        "hummer": "gm",
        "opel": "gm",
        "vauxhall": "gm",
        "audi": "audi/vw",
        "volkswagen": "audi/vw",
        "vw": "audi/vw",
        "mercedes": "mercedes-benz",
        "mercedes-benz": "mercedes-benz",
        "mb": "mercedes-benz",
        "lincoln": "ford",
        "mercury": "ford",
        "dodge": "chrysler/ram",
        "ram": "chrysler/ram",
        "jeep": "chrysler/ram",
        "chrysler": "chrysler/ram",
        "infiniti": "nissan",
        "acura": "honda/acura",
        "honda": "honda/acura",
        "lexus": "toyota/lexus",
        "toyota": "toyota/lexus",
        "scion": "toyota/lexus",
    }
    return aliases.get(n, (name or "").strip())


def load_immobilizers():
    immos = []
    with IMMOBILIZERS_CSV.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            start, end = parse_year_span(row.get("years", ""))
            immos.append({
                "make": row.get("make", "").strip(),
                "norm_make": normalize_make(row.get("make", "")),
                "module": row.get("module_or_system", "").strip(),
                "start": start,
                "end": end,
                "years_text": row.get("years", "").strip(),
            })
    return immos


def choose_immobilizer(make: str, year: int, immos):
    norm = normalize_make(make)
    cand = [i for i in immos if i["make"].lower() == make.lower() or i["norm_make"].lower() == norm.lower()]
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


def derive_key_category(title: str, product_type: str):
    t = (title or "") + " " + (product_type or "")
    t = t.lower()
    if "smart" in t or "prox" in t or "proximity" in t:
        return "smart"
    if "remote head" in t or "rhk" in t:
        return "remote_head"
    if "remote" in t:
        return "remote"
    if "transponder" in t or "chip" in t:
        return "transponder"
    return "blade"


def derive_transponder_family(chip: str, fcc: str, title: str):
    text = " ".join([chip or "", fcc or "", title or ""]).lower()
    patterns = [
        ("id49", ["id49", "49 "]),
        ("id48", ["id48", "48 "]),
        ("id47", ["id47", "47 "]),
        ("id46", ["id46", "46 "]),
        ("id45", ["id45"]),
        ("id44", ["id44"]),
        ("id33", ["id33"]),
        ("id13", ["id13"]),
        ("4d63", ["4d63"]),
        ("4d67", ["4d67"]),
        ("4d70", ["4d70"]),
        ("4d83", ["4d83"]),
        ("4d", [" 4d", "4d "]),
        ("8a", [" 8a", "8a "]),
        ("4a", [" 4a", "4a "]),
        ("dst80", ["dst80", "dst 80"]),
        ("aes", ["aes"]),
        ("pcf7961", ["7961"]),
        ("pcf7945", ["7945"]),
        ("pcf7937", ["7937"]),
        ("pcf7952", ["7952"]),
        ("megamos48", ["megamos 48", "m48", "megamos48"]),
    ]
    for fam, needles in patterns:
        if any(n in text for n in needles):
            return fam
    return ""


def derive_frequency(freq: str):
    if not freq:
        return ""
    s = freq.strip()
    try:
        return float(s)
    except Exception:
        # handle like "433", "315", "902", "434"
        digits = "".join(ch for ch in s if ch.isdigit() or ch == ".")
        try:
            return float(digits) if digits else ""
        except Exception:
            return ""


def derive_remote_start(remote_start: str, title: str, notes: str):
    t = " ".join([remote_start or "", title or "", notes or ""]).lower()
    return "yes" if "remote start" in t or remote_start.lower() == "yes" else "no"


KNOWN_MAKES = {
    "bmw", "mini", "audi", "volkswagen", "vw", "mercedes", "mercedes-benz", "mb",
    "ford", "lincoln", "mercury", "gm", "chevrolet", "chevy", "gmc", "buick", "cadillac", "saturn", "pontiac", "hummer",
    "toyota", "lexus", "scion", "honda", "acura", "nissan", "infiniti",
    "hyundai", "kia", "mazda", "subaru", "mitsubishi",
    "chrysler", "dodge", "jeep", "ram",
    "land rover", "range rover", "jaguar",
    "volvo", "porsche", "fiat", "alfa", "alfa romeo", "peugeot", "citroen",
    "ora", "great wall", "vwv", "seat", "skoda"
}

KNOWN_MODELS = {
    "camry", "corolla", "rav4", "tundra", "tacoma", "prius", "highlander", "4runner", "avalon",
    "civic", "accord", "cr-v", "crv", "pilot", "odyssey", "fit",
    "sentra", "altima", "maxima", "rogue", "murano", "pathfinder",
    "f-150", "f150", "f250", "f350", "f450", "f550", "explorer", "escape", "edge", "fusion", "mustang", "bronco",
    "silverado", "sierra", "tahoe", "suburban", "camaro", "malibu", "impala", "equinox", "terrain",
    "ram", "1500", "2500", "charger", "challenger", "durango", "wrangler", "cherokee", "grand", "compass", "gladiator",
    "a3", "a4", "a5", "a6", "a7", "a8", "q3", "q5", "q7", "q8",
    "golf", "jetta", "passat", "tiguan", "atlas", "polo",
    "x1", "x3", "x4", "x5", "x6", "3", "5", "7", "m3", "m5",
    "c-class", "e-class", "s-class", "gla", "glc", "gle", "gls", "g-wagon",
    "cx-5", "cx-9", "mazda3", "mazda6",
    "outback", "forester", "impreza", "legacy", "ascent",
    "elantra", "sonata", "tucson", "santa", "kona", "palisa", "ioniq",
    "sportage", "sorento", "optima", "telluride", "seltos", "stinger",
}


def parse_compatibility(raw: str):
    if not raw:
        return "", "", "", "", ""
    text = raw.lower()
    found_makes = []
    for mk in KNOWN_MAKES:
        if mk in text:
            found_makes.append(mk)
    years = []
    for m in re.finditer(r"\b(19[89]\d|20[0-3]\d)\b", text):
        y = int(m.group(1))
        if 1980 <= y <= 2035:
            years.append(y)
    year_min = min(years) if years else ""
    year_max = max(years) if years else ""
    makes_str = "; ".join(sorted(set(found_makes)))
    years_list = ";".join(str(y) for y in sorted(set(years))) if years else ""
    compat_models = []
    tokens = re.split(r"[\s,/;]+", raw)
    for i, t in enumerate(tokens):
        if re.fullmatch(r"\d{4}", t):
            if i > 0:
                prev = tokens[i-1].strip(" ,;()")
                if len(prev) >= 3 and prev[0].isalpha():
                    compat_models.append(prev)
        if t.lower() in KNOWN_MODELS:
            compat_models.append(t)
    compat_models_str = "; ".join(sorted(set(m.lower() for m in compat_models)))
    return makes_str, year_min, year_max, years_list, compat_models_str


KEYWAY_MAP = {
    "hu100": "HU100",
    "hu101": "HU101",
    "hu66": "HU66",
    "hu58": "HU58",
    "hu92": "HU92",
    "hu39": "HU39",
    "b111": "B111",
    "b119": "B119",
    "b106": "B106",
    "b102": "B102",
    "h75": "H75",
    "h92": "H92",
    "h94": "H94",
    "h60": "H60",
    "toy43": "TOY43",
    "toy40": "TOY40",
    "hon66": "HON66",
    "ho01": "HO01",
    "ym28": "YM28",
    "sip22": "SIP22",
    "ym15": "YM15",
    "mit8": "MIT8",
    "mit11": "MIT11",
    "hy15": "HY15",
    "hy14": "HY14",
    "hy20": "HY20",
    "kia": "HY14",
    "nsn14": "NSN14",
    "nsn11": "NSN11",
}


HIGH_SECURITY_KEYS = {"HU100", "HU101", "HU66", "B111", "B119", "B106", "TOY43", "HON66"}


def normalize_keyway(keyway: str):
    if not keyway:
        return ""
    k = keyway.strip().lower()
    # split on separators
    tokens = re.split(r"[\\s/,-]+", k)
    for t in tokens:
        if t in KEYWAY_MAP:
            return KEYWAY_MAP[t]
    # fallback: uppercase alnum
    return keyway.strip().upper()


def derive_blade_type(keyway_norm: str):
    if not keyway_norm:
        return ""
    return "laser" if keyway_norm in HIGH_SECURITY_KEYS else "standard"


def derive_emergency_blade(title: str, notes: str, body: str):
    t = " ".join([title or "", notes or "", body or ""]).lower()
    if "blade not included" in t or "without blade" in t or "no blade" in t:
        return "no"
    if "emergency key" in t or "emergency blade" in t or "blade included" in t or "comes with blade" in t:
        return "yes"
    return "unknown"


def derive_confidence(fcc_present: str, chip: str, immo: str):
    reasons = []
    if fcc_present == "yes":
        reasons.append("fcc")
    if chip:
        reasons.append("chip")
    if immo:
        reasons.append("immo_map")
    if not reasons:
        reasons.append("make_year_infer")
        return "low", ";".join(reasons)
    if "fcc" in reasons and "chip" in reasons:
        return "high", ";".join(reasons)
    return "medium", ";".join(reasons)


def derive_support_flags(immo: str, make_norm: str, transponder_family: str):
    im = (immo or "").lower()
    mk = (make_norm or "").lower()
    tf = (transponder_family or "").lower()
    akl_supported = "unknown"
    add_key_supported = "unknown"
    requires_pin_seed = "unknown"
    requires_bench_unlock = "no"
    wait_time = ""
    confidence = "medium"

    # Defaults when we have explicit transponder and FCC
    if tf:
        confidence = "high"

    # BMW
    if "ews" in im:
        akl_supported = "yes"
        add_key_supported = "yes"
        requires_bench_unlock = "yes"
        confidence = "high"
    if "cas3" in im:
        akl_supported = "yes"
        add_key_supported = "yes"
        requires_bench_unlock = "yes"
        confidence = "high"
    if "cas4" in im or "fem" in im or "bdc" in im:
        akl_supported = "yes"
        add_key_supported = "yes"
        requires_bench_unlock = "yes"
        confidence = "high"

    # VAG BCM2 / Immo5
    if "bcm2" in im:
        akl_supported = "yes"
        add_key_supported = "yes"
        requires_pin_seed = "yes"
        confidence = "high"

    # Mercedes EIS/FBS3
    if "eis" in im or "fbs3" in im or "ezs" in im:
        akl_supported = "yes"
        add_key_supported = "yes"
        requires_bench_unlock = "yes"
        confidence = "high"

    # Ford PATS
    if "pats" in im:
        add_key_supported = "yes"
        akl_supported = "yes"
        requires_pin_seed = "yes"
        confidence = "high"

    # Nissan NATS
    if "nats" in im:
        add_key_supported = "yes"
        akl_supported = "yes"
        requires_pin_seed = "yes"
        confidence = "medium"

    # Toyota/Lexus 8A/4D/H
    if mk.startswith("toyota") or mk == "toyota/lexus":
        add_key_supported = "yes"
        akl_supported = "yes"
        wait_time = "16m reset on some smart"
        confidence = "medium"

    # Honda/Acura ID46/47
    if "honda" in mk or "acura" in mk:
        add_key_supported = "yes"
        akl_supported = "yes"
        requires_pin_seed = "yes"
        confidence = "medium"

    # Chrysler/RAM/Jeep Fobik
    if "fobik" in im or "gq4-53t" in im or "ram" in mk or "chrysler" in mk or "jeep" in mk:
        add_key_supported = "yes"
        akl_supported = "yes"
        requires_pin_seed = "yes"
        confidence = "medium"

    # GM ID46
    if mk == "gm" or "gm" in mk or "id46" in im:
        add_key_supported = "yes"
        akl_supported = "yes"
        confidence = "medium"

    # Land Rover EWS
    if "land rover" in mk and "ews" in im:
        akl_supported = "yes"
        add_key_supported = "yes"
        requires_bench_unlock = "yes"
        confidence = "medium"

    return akl_supported, add_key_supported, requires_pin_seed, requires_bench_unlock, wait_time, confidence


def derive_immo_specific(make_norm: str, model: str, year: int, immo: str, compat_makes: str):
    mk = (make_norm or "").lower()
    m_str = (model or "").lower()
    cm = (compat_makes or "").lower()
    # VW / Audi MQB vs BCM2
    if "audi" in mk or "vw" in mk or "volkswagen" in mk or "audi/vw" in mk or "audi" in cm or "vw" in cm:
        if year >= 2016:
            return "MQB/MLB Evo"
        if 2008 <= year <= 2015:
            return "BCM2 Immo5"
        return "Immo4/BCM2 early"
    # Hyundai / Kia SMK variants
    if "hyundai" in mk or "kia" in mk or "hyundai" in cm or "kia" in cm:
        if year >= 2019:
            return "SMK AES"
        if year >= 2015:
            return "SMK"
        return "JCI/SMK early"
    # Subaru
    if "subaru" in mk or "subaru" in cm:
        if year >= 2013:
            return "Hitachi Smart AES"
        return "H-chip/4D"
    # Volvo
    if "volvo" in mk or "volvo" in cm:
        if year >= 2010:
            return "KVM"
        return "CEM"
    # PSA
    if "peugeot" in mk or "citroen" in mk or "peugeot" in cm or "citroen" in cm:
        if year >= 2016:
            return "BSI UDS (Continental)"
        return "BSI Delphi/Siemens"
    # Fiat / Alfa
    if "fiat" in mk or "alfa" in mk or "fiat" in cm or "alfa" in cm:
        if year >= 2014:
            return "ID48/AES (late)"
        return "ID46 (early)"
    return immo or ""


# Programming method/difficulty/tool hints (heuristic by immobilizer family and make)
def derive_prog_metadata(immo: str, make_norm: str):
    im = (immo or "").lower()
    mk = (make_norm or "").lower()
    method = ""
    difficulty = ""
    tools = []

    # BMW
    if "ews" in im:
        method = "eeprom/bench; some onboard older"
        difficulty = "medium"
        tools = ["CGDI BMW", "Autel IM", "Xhorse VVDI", "Lonsdor"]
    if "cas3" in im:
        method = "obd add-key; eeprom/bench for akl"
        difficulty = "medium"
        tools = ["CGDI BMW", "Autel IM", "Xhorse VVDI", "Lonsdor"]
    if "cas4" in im:
        method = "bench obd hybrid; eeprom/bench for akl"
        difficulty = "high"
        tools = ["CGDI BMW", "Autel IM", "Xhorse VVDI", "Lonsdor"]
    if "fem" in im or "bdc" in im:
        method = "bench unlock then obd; add-key post-unlock; akl bench"
        difficulty = "high"
        tools = ["CGDI BMW", "Autel IM", "Xhorse VVDI", "Lonsdor"]

    # VAG BCM2 Immo5
    if "bcm2" in im:
        method = "diag with sync; some require server; akl needs preauth"
        difficulty = "high"
        tools = ["Autel IM", "Xhorse VVDI", "OBDSTAR", "SmartPro"]

    # Mercedes EIS/FBS3
    if "eis" in im or "fbs3" in im or "ezs" in im:
        method = "bench eeprom; key file calc; write token/device"
        difficulty = "very_high"
        tools = ["CGDI MB", "Autel IM", "Xhorse VVDI MB", "ABRITES"]

    # Ford PATS
    if "pats" in im:
        method = "obd; incode/outcode; time delay on older"
        difficulty = "medium"
        tools = ["Autel IM", "OBDSTAR", "SmartPro", "Xhorse Key Tool"]

    # Nissan NATS
    if "nats" in im:
        method = "obd; pin calc; some akl require bcm read"
        difficulty = "medium"
        tools = ["Autel IM", "Xhorse VVDI", "OBDSTAR", "SmartPro"]

    # Toyota/Lexus 4D/8A/H
    if mk.startswith("toyota") or mk == "toyota/lexus":
        if "8a" in im or "h-chip" in im or "4d" in im:
            method = "obd add-key; akl: smart reset/seed; some require 16min"
            difficulty = "medium"
            tools = ["Autel IM", "Xhorse VVDI", "OBDSTAR", "SmartPro"]

    # Honda/Acura ID46/47
    if "honda" in mk or "acura" in mk:
        if "id47" in im or "id46" in im:
            method = "obd add-key; akl may need pin/seed"
            difficulty = "medium"
            tools = ["Autel IM", "Xhorse VVDI", "OBDSTAR", "SmartPro"]

    # Chrysler/RAM Fobik
    if "fobik" in im or "gq4-53t" in im or "ram" in mk or "chrysler" in mk or "jeep" in mk:
        method = "obd add-key; akl: pin read/seed or eeprom"
        difficulty = "medium"
        tools = ["Autel IM", "Xhorse VVDI", "OBDSTAR", "SmartPro"]

    # GM ID46
    if mk == "gm" or "gm" in mk or "id46" in im:
        method = "obd add-key; 10-30 min relearn on some; akl via obd"
        difficulty = "low_medium"
        tools = ["Autel IM", "Xhorse VVDI", "OBDSTAR", "SmartPro"]

    # Land Rover older EWS ref
    if "land rover" in mk and "ews" in im:
        method = "eeprom/bench"
        difficulty = "high"
        tools = ["Autel IM", "Xhorse VVDI", "OBDSTAR"]

    method = method or "unknown"
    difficulty = difficulty or "unknown"
    tools_str = "; ".join(dict.fromkeys(tools)) if tools else ""
    return method, difficulty, tools_str


def build_master():
    immos = load_immobilizers()
    out_rows = []
    source_file = "oem_locksmith_catalog.csv"
    with OEM_CSV.open() as f:
        reader = csv.DictReader(f)
        for row in reader:
            make = row.get("make", "").strip()
            make_norm = normalize_make(make)
            model = row.get("model", "").strip()
            year_raw = row.get("year", "").strip()
            try:
                year = int(year_raw)
            except Exception:
                continue
            immo_sys, immo_years = choose_immobilizer(make, year, immos)
            key_type = infer_key_type(row.get("title_raw", ""), row.get("product_type", ""))
            key_category = derive_key_category(row.get("title_raw", ""), row.get("product_type", ""))
            transponder_family = derive_transponder_family(row.get("chip", ""), row.get("fcc_id", ""), row.get("title_raw", ""))
            freq_val = derive_frequency(row.get("frequency", ""))
            remote_start_val = derive_remote_start(row.get("remote_start", ""), row.get("title_raw", ""), row.get("notes", "") or row.get("compatibility_raw", ""))
            fcc_present = "yes" if (row.get("fcc_id", "") or "").strip() else "no"
            prog_method, prog_difficulty, prog_tools = derive_prog_metadata(immo_sys, make_norm)
            compat_makes, compat_year_min, compat_year_max, compat_years_list, compat_models = parse_compatibility(row.get("compatibility_raw", ""))
            keyway_norm = normalize_keyway(row.get("keyway", ""))
            blade_type = derive_blade_type(keyway_norm)
            akl_supported, add_key_supported, requires_pin_seed, requires_bench_unlock, wait_time, confidence_prog = derive_support_flags(immo_sys, make_norm, transponder_family)
            confidence_score, confidence_reason = derive_confidence(fcc_present, row.get("chip", "").strip(), immo_sys)
            # Merge confidence (conservative: take lower)
            if confidence_score == "low" or confidence_prog == "low":
                final_confidence = "low"
            elif confidence_score == "medium" or confidence_prog == "medium":
                final_confidence = "medium"
            else:
                final_confidence = "high"
            reason_parts = []
            if confidence_reason:
                reason_parts.append(confidence_reason)
            reason_parts.append(f"prog_conf:{confidence_prog}")
            confidence_reason_str = ";".join(reason_parts)
            emergency_blade = derive_emergency_blade(row.get("title_raw", ""), row.get("notes", ""), row.get("compatibility_raw", ""))
            immo_specific = derive_immo_specific(make_norm, model, year, immo_sys, compat_makes)
            out_rows.append({
                "make": make,
                "make_norm": make_norm,
                "model": model,
                "year": year,
                "immobilizer_system": immo_sys,
                "immobilizer_system_specific": immo_specific,
                "immobilizer_years": immo_years,
                "key_type": key_type,
                "key_category": key_category,
                "transponder_family": transponder_family,
                "chip": row.get("chip", "").strip(),
                "fcc_id": row.get("fcc_id", "").strip(),
                "fcc_present": fcc_present,
                "part_number": row.get("part_number", "").strip(),
                "keyway": row.get("keyway", "").strip(),
                "keyway_norm": keyway_norm,
                "blade_type": blade_type,
                "frequency": row.get("frequency", "").strip(),
                "frequency_mhz": freq_val,
                "battery": row.get("battery", "").strip(),
                "buttons": row.get("buttons", "").strip(),
                "remote_start": remote_start_val,
                "prog_method": prog_method,
                "prog_difficulty": prog_difficulty,
                "prog_tools": prog_tools,
                "akl_supported": akl_supported,
                "add_key_supported": add_key_supported,
                "requires_pin_seed": requires_pin_seed,
                "requires_bench_unlock": requires_bench_unlock,
                "wait_time": wait_time,
                "confidence": final_confidence,
                "confidence_reason": confidence_reason_str,
                "emergency_blade": emergency_blade,
                "compat_makes": compat_makes,
                "compat_year_min": compat_year_min,
                "compat_year_max": compat_year_max,
                "compat_years_list": compat_years_list,
                "compat_models": compat_models,
                "notes": (row.get("notes", "") or row.get("compatibility_raw", "")).strip(),
                "source": source_file,
                "source_record_id": f"{source_file}:row_{reader.line_num}",
                "match_basis": "oem_explicit",
                "url": row.get("url", "").strip(),
            })

    fieldnames = [
        "make",
        "make_norm",
        "model",
        "year",
        "immobilizer_system",
        "immobilizer_system_specific",
        "immobilizer_years",
        "key_type",
        "key_category",
        "transponder_family",
        "chip",
        "fcc_id",
        "fcc_present",
        "part_number",
        "keyway",
        "keyway_norm",
        "blade_type",
        "frequency",
        "frequency_mhz",
        "battery",
        "buttons",
        "remote_start",
        "prog_method",
        "prog_difficulty",
        "prog_tools",
        "akl_supported",
        "add_key_supported",
        "requires_pin_seed",
        "requires_bench_unlock",
        "wait_time",
        "confidence",
        "confidence_reason",
        "emergency_blade",
        "compat_makes",
        "compat_year_min",
        "compat_year_max",
        "compat_years_list",
        "compat_models",
        "notes",
        "source",
        "source_record_id",
        "match_basis",
        "url",
    ]

    with OUT_CSV.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(out_rows)

    # Expanded per-model/year explosion with dedup
    expanded = []
    seen = set()
    for r in out_rows:
        makes = [r["make"]]
        if r.get("compat_makes"):
            makes = [m.strip() for m in r["compat_makes"].split(";") if m.strip()]
        models = [r["model"]]
        if r.get("compat_models"):
            models = [m.strip() for m in r["compat_models"].split(";") if m.strip()]
        years = [r["year"]]
        if r.get("compat_years_list"):
            ylist = [y for y in r["compat_years_list"].split(";") if y.strip().isdigit()]
            if ylist:
                years = [int(y) for y in ylist]
        for mk in makes:
            for md in models:
                for yr in years:
                    key = (mk.lower(), md.lower(), yr, r.get("fcc_id", ""), r.get("part_number", ""), r.get("immobilizer_system_specific", "") or r.get("immobilizer_system", ""))
                    if key in seen:
                        continue
                    seen.add(key)
                    row_copy = dict(r)
                    row_copy["make"] = mk
                    row_copy["make_norm"] = normalize_make(mk)
                    row_copy["model"] = md
                    row_copy["year"] = yr
                    # refresh immo-specific based on new make/model/year
                    row_copy["immobilizer_system_specific"] = derive_immo_specific(row_copy["make_norm"], md, yr, row_copy.get("immobilizer_system", ""), row_copy.get("compat_makes", ""))
                    expanded.append(row_copy)

    # Merge vendor manual coverage if present
    if VENDOR_MANUAL_CSV.exists():
        with VENDOR_MANUAL_CSV.open() as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    yf = int(row.get("year_from", "") or 0) if row.get("year_from") else None
                except Exception:
                    yf = None
                try:
                    yt = int(row.get("year_to", "") or 0) if row.get("year_to") else None
                except Exception:
                    yt = None
                years = []
                if yf and yt:
                    years = list(range(yf, yt + 1))
                elif yf:
                    years = [yf]
                else:
                    years = [0]  # unknown year placeholder
                for yr in years:
                    expanded.append({
                        "make": row.get("make", "").strip(),
                        "make_norm": normalize_make(row.get("make", "")),
                        "model": row.get("model", "").strip(),
                        "year": yr,
                        "immobilizer_system": "",
                        "immobilizer_system_specific": row.get("immobilizer_system_specific", "").strip(),
                        "immobilizer_years": "",
                        "key_type": "",
                        "key_category": "",
                        "transponder_family": "",
                        "chip": "",
                        "fcc_id": "",
                        "fcc_present": "",
                        "part_number": "",
                        "keyway": "",
                        "keyway_norm": "",
                        "blade_type": "",
                        "frequency": "",
                        "frequency_mhz": "",
                        "battery": "",
                        "buttons": "",
                        "remote_start": "",
                        "prog_method": "",
                        "prog_difficulty": "",
                        "prog_tools": row.get("tool", "").strip(),
                        "akl_supported": "",
                        "add_key_supported": "",
                        "requires_pin_seed": "",
                        "requires_bench_unlock": "",
                        "wait_time": "",
                        "confidence": "low",
                        "confidence_reason": "vendor_manual",
                        "emergency_blade": "",
                        "compat_makes": "",
                        "compat_year_min": yf or "",
                        "compat_year_max": yt or "",
                        "compat_years_list": "",
                        "compat_models": "",
                        "notes": row.get("functions_supported", "").strip(),
                        "source": row.get("source_record_id", "").strip(),
                        "source_record_id": row.get("source_record_id", "").strip(),
                        "match_basis": row.get("match_basis", "").strip() or "extracted_pdf",
                        "url": "",
                    })

    with OUT_CSV_EXPANDED.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(expanded)

    print(f"Wrote {len(out_rows)} rows to {OUT_CSV}")
    print(f"Wrote {len(expanded)} rows to {OUT_CSV_EXPANDED}")

if __name__ == "__main__":
    build_master()
