# Database Field Audit - Gap Analysis Report

Generated: 2025-12-27

## Executive Summary

Analysis of 6,871 vehicle variants (2015+) across 808 make/model combinations revealed significant data gaps in chip type, keyway, and battery fields. FCC IDs are well-populated for most priority makes.

### Gap Severity by Make (2015+ Vehicles)

| Make | Missing FCC | Missing Chip | Missing Battery | Total Variants |
|------|-------------|--------------|-----------------|----------------|
| **Ford** | 77 | 483 | 79 | 485 |
| **Chevrolet** | 66 | 301 | 69 | 301 |
| **Toyota** | 45 | 210 | 46 | 210 |
| **Kia** | 18 | 153 | 19 | 153 |
| **Nissan** | 13 | 151 | 19 | 151 |
| **Honda** | 26 | 130 | 27 | 132 |
| **Hyundai** | 20 | 128 | 27 | 130 |

---

## Toyota Gap Summary (2020+)

| Model | Year | FCC ID | Missing Fields |
|-------|------|--------|----------------|
| Camry | 2025 | HYQ14FBW | Chip, Keyway |
| Corolla | 2024 | HYQ14FBN | Chip, Keyway |
| 4Runner | 2023 | HYQ12BDM | Chip, Keyway |
| 4Runner | 2022 | HYQ14FBB | Chip, Battery, Keyway |
| C-HR | 2022 | MOZB3F2F2L | Chip, Keyway |
| Tacoma | 2022 | HYQ14FBB | Chip, Keyway |

### Toyota Research Queries
```
"2025 Toyota Camry HYQ14FBW smart key chip type transponder"
"2024 Toyota Corolla HYQ14FBN key fob chip ID49 HITAG"
"2023 Toyota 4Runner HYQ12BDM remote keyway blade TOY48"
"2022 Toyota Tacoma smart key chip type programming"
```

---

## Honda Gap Summary (2020+)

| Model | Year | FCC ID | Missing Fields |
|-------|------|--------|----------------|
| Accord | 2024 | KR5TP-4 | Chip, Keyway |
| CR-V | 2024 | KR5TP-4 | Chip, Keyway |
| Civic | 2024 | KR5TP-4 | Chip, Keyway |
| HR-V | 2024 | KR5TP-4 | Chip, Keyway |
| Odyssey | 2024 | KR5T4X | Chip, Keyway |
| Pilot | 2024 | KR5TP-4 | Chip, Keyway |

### Honda Research Queries
```
"2024 Honda Accord KR5TP-4 smart key chip type ID47 HITAG AES"
"2024 Honda Civic 11th gen push start transponder chip"
"2024 Honda CR-V prox key chip programming HON66"
"2024 Honda Odyssey KR5T4X key fob blade keyway"
```

---

## Ford Gap Summary (2020+)

| Model | Year | FCC ID | Missing Fields |
|-------|------|--------|----------------|
| F-150 Remote | 2025 | N5F-A08TBLP | Chip, Keyway |
| Mustang | 2025 | M3N-A3C108397 | Chip, Keyway |
| Expedition | 2024 | M3N-A3C054339 | Chip, Keyway |
| Explorer | 2024 | M3N-A3C108397 | Chip, Keyway |
| F-150 | 2024 | M3N-A3C108397 | Chip, Keyway |
| Escape | 2024 | M3N-A2C93142300 | Chip, Keyway |

### Ford Research Queries
```
"2025 Ford F-150 N5F-A08TBLP smart key chip type ID49 HITAG Pro"
"2025 Ford Mustang M3N-A3C108397 prox key blade H92"
"2024 Ford Expedition M3N-A3C054339 key fob chip transponder"
"2024 Ford Explorer smart key programming chip type"
```

---

## Chevrolet Gap Summary (2020+)

| Model | Year | FCC ID | Missing Fields |
|-------|------|--------|----------------|
| Silverado EV | 2026 | YG0G21TB2 | Chip, Keyway |
| Blazer | 2025 | HYQ4ES | Chip, Keyway |
| Colorado | 2025 | YGOG21TB2 | Chip, Keyway |
| Equinox | 2025 | YGOG21TB2 | Chip, Keyway |
| Silverado | 2025 | YGOG21TB2 | Chip, Keyway |
| Tahoe | 2025 | YGOG21TB2 | Chip, Keyway |

### Chevrolet Research Queries
```
"2025 Chevrolet Silverado YGOG21TB2 smart key chip Global B"
"2025 Chevrolet Tahoe prox key chip type ID49"
"2024 Chevrolet Corvette YG0G20TB1 key fob programming"
"2025 Chevrolet Equinox smart key blade keyway"
```

---

## Key Observations

1. **Chip Type** is the most commonly missing field across all makes (>90% of gaps)
2. **Keyway/Blade** data is universally sparse for 2020+ smart key vehicles
3. **FCC IDs** are well-populated - good foundation for research
4. **Battery types** are mostly present where FCC data exists

## Recommended Actions

1. **Prioritize Toyota & Honda** - High-volume makes with consistent FCC data make chip research straightforward
2. **GM Global B Focus** - 2022+ Chevrolet/GMC vehicles need special attention for CAN FD requirements
3. **Ford FNV2 Mapping** - 2021+ Ford vehicles need chip and keyway data for complete programming guides
