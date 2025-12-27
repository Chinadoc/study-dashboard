# Google Docs Integration - Agent Coordination

## How This Works
Multiple agents can work in parallel on different vehicle makes. Each agent:
1. **Claims** a make by updating STATUS below
2. **Reads** the relevant Google Docs
3. **Generates** SQL migration to `data/migrations/`  
4. **Marks complete** when done

## Status Board
| Make | Agent | Status | Last Updated | Migration File |
|------|-------|--------|--------------|----------------|
| BMW | Agent-1 | ✅ COMPLETE | 2025-12-26T20:40 | `integrate_bmw_google_docs.sql` |
| BMW (Phase B) | Agent-1B | ✅ COMPLETE | 2025-12-26T21:16 | `enrich_bmw_vehicle_cards.sql` |
| Pricing Estimates | Antigravity | ✅ COMPLETE | 2025-12-26T21:25 | `insert_pricing_reference.sql` |
| Cross-Ref Docs | Antigravity | ✅ COMPLETE | 2025-12-26T21:40 | `integrate_crossref_deep_dive.sql` |
| SGW Docs | Agent-3D | ✅ COMPLETE | 2025-12-26T21:45 | `integrate_sgw_bypass_deep_dive.sql` |
| Troubleshooting DB | Agent-2C | ✅ COMPLETE | 2025-12-27T02:45 | `create_troubleshooting.sql` |
| Tool Coverage Matrix | Agent-1C | ✅ COMPLETE | 2025-12-26T21:23 | `create_tool_coverage.sql` |
| Locksmith Alerts | Antigravity | ✅ COMPLETE | 2025-12-26T21:47 | `create_locksmith_alerts.sql` |
| Legacy Docs | Agent-4D | ✅ COMPLETE | 2025-12-26T21:38 | `integrate_legacy_deep_dive.sql` |
| Toyota/Lexus | Antigravity | ✅ COMPLETE | 2025-12-26T20:47 | `integrate_toyota_google_docs.sql` |
| Toyota (Phase B) | Antigravity | ✅ COMPLETE | 2025-12-26T21:15 | `enrich_toyota_vehicle_cards.sql` |
| VW/VAG | Agent-2 | ✅ COMPLETE | 2025-12-26T20:46 | `integrate_vw_google_docs.sql` |
| Stellantis/CDJR | Agent-3 | ✅ COMPLETE | 2025-12-26T20:50 | `integrate_stellantis_google_docs.sql` |
| Stellantis (Phase B) | Agent-3B | ✅ COMPLETE | 2025-12-26T21:20 | `enrich_stellantis_vehicle_cards.sql` |
| Key Blank Cross-Ref | Antigravity | 🔄 IN PROGRESS | 2025-12-26T21:23 | - |
| Ford/GM Docs | Agent 1D | ✅ COMPLETE | 2025-12-26T21:35 | `integrate_ford_gm_deep_dive.sql` |
| Subaru | Agent | ✅ COMPLETE | 2025-12-26T20:45 | `integrate_asian_makes_google_docs.sql` |
| Honda | Agent | ✅ COMPLETE | 2025-12-26T20:45 | `integrate_asian_makes_google_docs.sql` |
| Nissan | Agent | ✅ COMPLETE | 2025-12-26T20:45 | `integrate_asian_makes_google_docs.sql` |
| Hyundai/Kia | Agent | ✅ COMPLETE | 2025-12-26T20:45 | `integrate_asian_makes_google_docs.sql` |
| Mercedes | Agent-5 | ✅ COMPLETE | 2025-12-26T20:46 | `integrate_euro_luxury_google_docs.sql` |
| Volvo | Agent-5 | ✅ COMPLETE | 2025-12-26T20:46 | `integrate_euro_luxury_google_docs.sql` |
| Porsche | Agent-5 | ✅ COMPLETE | 2025-12-26T20:46 | `integrate_euro_luxury_google_docs.sql` |
| Mazda | Agent | ✅ COMPLETE | 2025-12-26T20:45 | `integrate_asian_makes_google_docs.sql` |
| Tool/KeyFob Docs | Agent-5D | ✅ COMPLETE | 2025-12-26T21:36 | `integrate_tool_keyfob_deep_dive.sql` |
| Asian (Phase B) | Antigravity | ✅ COMPLETE | 2025-12-26T21:16 | `enrich_asian_vehicle_cards.sql` |
| Euro (Phase B) | Antigravity | ✅ COMPLETE | 2025-12-26T21:15 | `enrich_euro_vehicle_cards.sql` |
| **Phase E: Integration** | **Antigravity** | **✅ COMPLETE** | **2025-12-27T02:50** | `create_badge_config.sql`, `expand_year_ranges.sql`, `populate_narrative_blocks.sql`, `cross_link_vehicles.sql` |
| 1E: Locksmith Alerts | Antigravity | ✅ COMPLETE | 2025-12-27T02:50 | `create_locksmith_alerts.sql` |
| 2E: Range Expansion | Antigravity | ✅ COMPLETE | 2025-12-27T02:50 | `expand_year_ranges.sql` |
| 3E: Narrative Preservation | Antigravity | ✅ COMPLETE | 2025-12-27T02:50 | `populate_narrative_blocks.sql` |
| 4E: UI Badge Data | Antigravity | ✅ COMPLETE | 2025-12-27T02:50 | `update_variant_badges.sql` |
| 5E: Cross-Linking | Antigravity | ✅ COMPLETE | 2025-12-27T02:50 | `cross_link_vehicles.sql` |
| YouTube Mapping | Antigravity | 🔄 IN PROGRESS | 2025-12-26T21:23 | `insert_youtube_tutorials.sql` |

## Source Documents (by Make)
```
BMW:           BMW_CAS_vs_FEM_BDC_Architecture_Research.txt, BMW_Locksmith_Guide_Development.txt, European_Luxury_Key_Programming_Gap.txt
Toyota/Lexus:  Toyota_Key_Chip_and_Immobilizer_Research.txt, Toyota_Lexus_Smart_Key_Reset_Procedures.txt
VW/VAG:        VAG_MQB_vs._MQB-Evo_Key_Programming.txt, VW_Immobilizer_Specs_and_Lishi_Mapping.txt, VW_Jetta_Passat_FCC_ID_Mapping.txt, Aftermarket_Access:_VAG_SFD2,_BMW_iDrive.txt
Stellantis:    Stellantis_FCC_ID_VIN_Pre-coding_Research.txt, Stellantis_Key_FCC_ID_VIN_Mapping.txt, Jeep_Renegade_Hornet_Key_Programming_Issue.txt, Chrysler_Locksmith_Guide_Creation.txt
Ford:          Ford_BCM_Security_Bypass_Research.txt
GM:            GM_Global_B_Key_Programming_Research.txt, Early_GM_Chrysler_AKL_Coverage.txt
Subaru:        Subaru_Security_Gateway_&_Key_Programming.txt
Honda:         Honda_BSI_Key_Programming_Challenges.txt
Nissan:        Nissan_Gateway_Bypass_Research_Goals.txt, Nissan_Locksmith_Programming_Guide.txt
Hyundai/Kia:   Kia_Hyundai_Security_Update_Research.txt
Mercedes:      Mercedes_FBS4_Forensic_Identification_Research.txt, Mercedes_Locksmith_Comprehensive_Guide.txt
Volvo:         Volvo_Locksmith_Guide_Development_Plan.txt
Porsche:       Porsche_Security_&_Immobilizer_Research.txt
Mazda:         Mazda_Locksmith_Data_and_Walkthroughs.txt
```

## Output Requirements
Each agent produces a migration file with:
1. `vehicles_master` updates (chip_type, platform, security_notes, lishi_tool, bypass_method, sgw_required)
2. `fcc_reference` inserts (fcc_id, make, model, year_start, year_end, frequency, chip_type, notes)
3. `vehicle_guides` inserts for tool-specific walkthroughs (Autel, ACDP, Smart Pro, etc.)
