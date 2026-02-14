'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

interface BittingCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
    codeSeries: string;
    spaces?: number;
    depths?: number | string;
    macs?: number;
    keyway?: string;
    lishi?: string;
}

// Special position values:
// 0 = blank (unknown)
// -1 = ? (explicit unknown)
// -2 = X (wildcard - any depth valid)
// -10 = A (1½ = 1 or 2)
// -11 = B (3½ = 3 or 4)
// -12 = T (2½ = 2 or 3)
// 1-9 = actual depth values

const SPECIAL_CODES = {
    '?': -1,
    'X': -2,
    'A': -10, // 1½ (1 or 2)
    'B': -11, // 3½ (3 or 4)
    'T': -12, // 2½ (2 or 3)
} as const;

const HALF_DEPTH_EXPANSIONS: Record<number, number[]> = {
    [-10]: [1, 2], // A = 1 or 2
    [-11]: [3, 4], // B = 3 or 4
    [-12]: [2, 3], // T = 2 or 3
};

// Forensic rules by keyway - baked into calculator for validation
// Sources: Greg Brandt High Security Chart, National Locksmith, CLK Supplies, Genuine Lishi docs,
// Allegion specs, UHS Hardware, American Key Supply, Internet Archive, dossier intelligence
const KEYWAY_RULES: Record<string, {
    fixedPositions?: Record<number, number>; // Position must be this depth
    doorOnly?: number[]; // Door lock only has these positions
    ignitionOnly?: number[]; // Ignition-specific positions
    maxConsecutiveSame?: number; // Max consecutive same depths
    minDepthOccurrences?: Record<number, number>; // Minimum times a depth must appear
    macsOverride?: number; // FORCE this MACS — use ONLY when AKS vehicle data is confirmed wrong. 999 = "None".
    macsFallback?: number; // Use this MACS when AKS vehicle data doesn't provide one. AKS wins when present.
    codeSeries?: string; // Known code series range (informational display only)
    angular?: boolean; // Uses angles not depths
    linkedPositions?: Record<number, number>; // Position X should match Position Y (e.g., GM Golden Rule: P1≈P9, P2≈P10)
    positionHints?: Record<number, { likely: number[]; reason: string }>; // Statistical likelihood for unknown positions
    avoidPositionDepths?: Record<number, number[]>; // Position X should avoid these depths (structural/statistical)
    decodeWorkflow?: string; // Locksmith decode strategy for this keyway
    hint?: string;
}> = {
    // === FORD ===
    'HU101': {
        fixedPositions: { 10: 2 },
        doorOnly: [3, 4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        codeSeries: '10001–11500',
        decodeWorkflow: '🔓 HU101 door → P3-P10 readable. P10 is always depth 2 (checksum — if you read anything else, re-decode). P1&P2 must progress. ~1,500 valid codes.',
        hint: '🔒 Ford HU101: MACS=2, 4 depths. P10=2 (retention checksum). Door P3-10, Ign P1-10. ⚠️ EU W9 variant (Mondeo/Fiesta 2017+): door reads P1-9 only (P10 absent). NA 2020+ (F-150/Bronco/Escape): see HU198.'
    },
    'HU198': {
        doorOnly: [3, 4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        hint: '⚠️ Ford HU198 (NA 2020+): INTERNAL 2-track. Door reads P3-P10 only (8 wafers—P1/P2 omitted). Ign has all 10. Must progress P1&2 from door decode. F-150 2021+, Bronco Sport, Maverick, Escape 2020+. NOT compatible with HU101 Lishi—use Lishi HU198.'
    },
    'FO38': {
        macsOverride: 2,
        doorOnly: [1, 2, 3, 4, 5, 6],
        ignitionOnly: [1, 3, 4, 5, 6, 7, 8],
        hint: '⚠️ Ford FO38/H75: 8-cut, 5 depths, MACS=2. Door P1-6. Ign P1,3-8 (skips P2!). Depth 5 = non-binding wafer.'
    },
    'Tibbe-6': {
        angular: true,
        hint: '💡 Ford Tibbe: Cuts are ANGLES (0°-30°), not depths.'
    },
    'Tibbe-8': {
        angular: true,
        hint: '💡 Jaguar Tibbe: 8 positions, only 3 angles (no deep cut 4).'
    },
    // === GM ===
    'HU100': {
        macsOverride: 999,
        doorOnly: [4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7],
        linkedPositions: { 1: 9, 2: 10 },
        decodeWorkflow: '🔓 CY24 door → P4-10 readable. Golden Rule: P1≈P9, P2≈P10. Enter door decode → P1&2 auto-suggested.',
        hint: '🚪 GM HU100: MACS=None. Door P4-10(V)/P5-8(Z), Ign P1-7. "Golden Rule": P1&2 ≈ P9&10.'
    },
    'HU100-10': {
        macsOverride: 999,
        doorOnly: [4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7],
        linkedPositions: { 1: 9, 2: 10 },
        decodeWorkflow: '🔓 HU100 door → P4-10 readable. Golden Rule: P1≈P9, P2≈P10. Enter door decode → auto-suggest P1&2.',
        hint: '🚪 GM HU100-10: MACS=None. Door P5-10, Ign P1-7(9). "Golden Rule": P1&2 depths ≈ P9&10.'
    },
    'B111': {
        macsFallback: 2,
        doorOnly: [3, 4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        codeSeries: 'G-series',
        hint: '⚠️ GM B111: MACS=2. 10-cut sidebar (transponder). Ign P1-9 (P10 dummy). Door P3-10/P5-10. Sidebar lock — conventional picking unreliable. Use sidebar kit or decode+progress.'
    },
    'B106': {
        macsFallback: 2,
        doorOnly: [3, 4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        hint: '⚠️ GM B106: MACS=2. 10-cut sidebar (non-transponder). Ign P1-9 (P10 dummy). Door P3-10/P5-10. Sidebar lock — use sidebar kit or decode+progress.'
    },
    'B110': {
        macsFallback: 2,
        hint: '⚠️ GM B110: 10-cut, 4 depths, MACS=2. Older sidebar architecture — similar to but NOT identical to B111. Sidebar mechanism differs mechanically. Separate from B111 in progression behavior.'
    },
    // === CHRYSLER ===
    'Y159': {
        doorOnly: [2, 3, 4, 5, 6, 7, 8],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8],
        codeSeries: 'M0001–M2618',
        decodeWorkflow: '🔓 CY24 door → P2-P8 readable (7 cuts). P1 is blind. Only ~2,618 valid M-codes exist — with 7 known positions, typically only 1-2 valid P1 options. Cut shallowest first.',
        hint: '🚪 Chrysler Y159: 8-cut, Door P2-8, Ign P1-8. ~2,618 M-codes total. P1 near-deterministic from door decode — cross-reference InstaCode M-series for exact match.'
    },
    'Y157': {
        hint: '💡 Chrysler Y157: 7 positions (older series). Shares depth system with Y159 but shorter blade/fewer active cuts. Triangular head vs Y159 oval. Do NOT auto-inherit Y159 — spacing differs.'
    },
    // === NISSAN ===
    'NSN14': {
        macsOverride: 2,
        fixedPositions: { 1: 3 },
        doorOnly: [3, 4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        positionHints: { 2: { likely: [2, 3], reason: 'P2 constrained by MACS from fixed P1=3' } },
        decodeWorkflow: '🔓 NSN14 door → P3-P10 readable (8 cuts). P1=3 (dummy, fixed). P2 must progress. With MACS=2, P2 constrained by P3. Try shallowest valid first.',
        hint: '🚪 Nissan NSN14: 10-pos, 4 depths, MACS=2. Door P3-10. P1=3 fixed (dummy cut — Lishi/forensic confirmed). Progress P2 only.'
    },
    'DA34': {
        macsOverride: 2,
        hint: '💡 Nissan/Infiniti DA34: 10-cut edge, 4 depths, MACS=2 (Brandt 2025 verified). Older single-sided key (pre-NSN14). Altima/Sentra ~2002–2012. No door/ign split. Lishi DA34 available.'
    },
    // === MERCEDES ===
    'HU64': {
        macsFallback: 2,
        maxConsecutiveSame: 3,
        minDepthOccurrences: { 5: 2 },
        hint: '🔁 Mercedes HU64: MACS=2. Max 3 consec. same. All keys ≥2 depth-5 cuts (Brandt). 2-track laser.'
    },
    // === BMW ===
    'HU92': {
        macsFallback: 2,
        hint: '💡 BMW HU92: 10-cut 2-track internal laser, 5 depths, MACS=2. E-series (2000s–2010s), some Mini/Rover. No door/ign split — all locks read all 10. No fixed positions. Successor: HU100R / newer profiles on F-series.'
    },
    // === HONDA ===
    'HON66': {
        macsOverride: 2,
        fixedPositions: { 6: 1 },
        doorOnly: [1, 2, 3, 4, 5, 6],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8],
        hint: '⚠️ Honda HON66: MACS=2 (Brandt 2025 — auto only; MACS=3 is motorcycle spec). P6 always depth 1. Door 6-cut (6 split wafers), Ign 8-cut (+2 whole plates). 1→4 adjacent FORBIDDEN — web fracture risk.'
    },
    // === TOYOTA / LEXUS ===
    'TOY43': {
        macsFallback: 2,
        hint: '💡 Toyota TOY43: 8 cuts, 4 depths, MACS=2. Split wafers at P4 & P7. Door has all 8 positions.'
    },
    'TOY48': {
        macsFallback: 2,
        hint: '💡 Toyota/Lexus TOY48: 10 cuts (5|5 dual-track), 5 depths, MACS=2. No 5-5 opposing pair at same position.'
    },
    'LXP90': {
        macsFallback: 2,
        hint: '💡 Lexus LXP90: Mechanical twin of TOY48 — same bitting/depths/MACS. Different warding/profile only. Use TOY48 rules for progression. Lishi TOY48 compatible.'
    },
    // === FIAT / PSA ===
    'SIP22': {
        macsOverride: 999,
        doorOnly: [1, 2, 3, 4, 5, 6, 7, 8],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        codeSeries: 'DE0001–DE11210',
        hint: '🚪 Fiat SIP22: MACS=None (Brandt 2025 verified), 4 depths (A-D). Door P1-8, Ign P1-10. ⚠️ Early Punto: P1 empty (7-wafer).'
    },
    'VA2T': {
        macsFallback: 2,
        hint: '💡 PSA VA2T: 6 wafers, 6 depths, MACS=2. Door & ign use same full bitting. No door/ign split. Series 1234Q5678H.'
    },
    'CY24-PSA': {
        hint: '💡 PSA CY24 (Citroën/Peugeot): Older edge-cut key (pre-VA2/VA2T). 6–8 cuts, 4 depths, MACS~3. ⚠️ NOT the Chrysler CY24 Lishi tool — that picks Y157/Y159 keyways.'
    },
    // === VOLVO ===
    'NE66': {
        macsOverride: 999,
        hint: '✅ Volvo NE66: 8-cut laser, 5 depths, MACS=None (.105" spacing allows steep ramps). NOT VW—use HU66 for VAG.'
    },
    // === VW / AUDI / PORSCHE (VAG) ===
    'NE72': {
        hint: '💡 Peugeot/Renault NE72: 6-cut EDGE key (not laser), 4 depths. Older PSA vehicles pre-VA2. NOT VAG.'
    },
    'HU66': {
        macsFallback: 2,
        codeSeries: '01-06000 / 6001-8110',
        avoidPositionDepths: { 8: [4] },
        hint: '💡 VAG HU66: 8-cut internal laser, 4 depths, MACS=2 (1↔4 forbidden). P8 rarely depth 4 (tip integrity). Gen 1: 1-up/1-down wafers. Gen 2/3: paired wafers. ⚠️ NOT HU162T (MQB 2015+ edge-cut with sidebar).'
    },
    'HU66-Kessy': {
        macsFallback: 2,
        fixedPositions: { 0: 4 },
        codeSeries: '01-06000 EXT / 6001-8110 EXT',
        hint: '⚠️ VAG HU66 Kessy: Emergency blade with 9th cut at BOW (Position 0, Depth 4). Actuates ignition microswitch. Silca Card 2399 (not 970). Audi A8 D3, Q7 4L, VW Touareg 7L/Phaeton 3D, Porsche Cayenne 9PA, Bentley Continental. 2003–2015. Doors decode as standard 8-cut.'
    },
    'HU162T': {
        macsFallback: 2,
        hint: '💡 VAG HU162T (MQB 2015+): 10-cut edge-milled + sidebar track (separate coding channel). 4 depths, MACS=2. No door/ign split. Sidebar is variable (not fixed like Kessy). Golf 7/8, Tiguan 2016+, Audi A3/Q2. NOT HU66 — different keyway and Lishi.'
    },
    // === MAZDA ===
    'MAZ24': {
        macsOverride: 2,
        doorOnly: [3, 4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        hint: '🚪 Mazda MAZ24: 10-cut, 5 depths, MACS=2 (Brandt 2025 verified). Door P3-10 (P1-P2 blind). Ign P1-10. Progress missing P1-P2 from door decode.'
    },
    'MAZ24R': {
        hint: '⚠️ Mazda MAZ24R: REVERSED mirror of MAZ24. Wrong blank = destroyed key!'
    },
    'MZ27': {
        macsFallback: 3,
        hint: '💡 Mazda MZ27: 8-cut edge, 4–5 depths, MACS=3. Older single-sided key (pre-MAZ24). Mazda3/6 pre-2013. Not dual-track.'
    },
    // === MITSUBISHI ===
    'MIT17': {
        macsFallback: 2,
        codeSeries: '30010–32009',
        hint: '💡 Mitsubishi MIT17: 8 cuts, 5 depths, MACS=2. Push-to-start emergency key only (no ign cylinder).'
    },
    'MIT11': {
        macsFallback: 2,
        hint: '💡 Mitsubishi MIT11: 8 cuts, 5 depths, MACS=2. Double-sided edge key. Door/ign same positions. Verify blank warding vs MIT8.'
    },
    'MIT8': {
        hint: '💡 Mitsubishi MIT8: 8 cuts, 5 depths. Similar to MIT11 but different keyway warding. MIT8 Lishi won\'t fit MIT11 and vice versa.'
    },
    'MIT3': {
        macsFallback: 2,
        hint: '💡 Mitsubishi MIT3: 8-cut edge, 5 depths, MACS=2. Older predecessor to MIT8/MIT11. Eclipse/Galant/Lancer pre-2007.'
    },
    // === SUBARU ===
    'SUB3': {
        macsFallback: 2,
        codeSeries: 'T0001–T3000',
        hint: '💡 Subaru SUB3/DAT17: 4 depths, MACS=2 (Brandt). Valet warding on secondary locks.'
    },
    // === HYUNDAI / KIA ===
    'HY20': {
        hint: '✅ Hyundai HY20: Depth 1=shallowest (standard). Verify depth increment on cutter calibration before cutting.'
    },
    'KK10': {
        hint: '✅ Kia KK10: Same platform as HY20. Depth 1=shallowest (standard). Verify cutter calibration.'
    },
    'KK12': {
        macsFallback: 2,
        hint: '💡 Hyundai/Kia KK12: 10-cut internal laser, 4 depths, MACS=2. Emergency blade for smart systems (Elantra 2017+, Tucson 2016+, Forte 2019+). No door/ign split. Depth 1=shallowest (same convention as HY20).'
    }
};

function getDisplayValue(value: number): string {
    if (value === 0) return '';
    if (value === -1) return '?';
    if (value === -2) return 'X';
    if (value === -10) return 'A';
    if (value === -11) return 'B';
    if (value === -12) return 'T';
    return value.toString();
}

function isUnknownOrSpecial(value: number): boolean {
    return value <= 0;
}

function isHalfDepth(value: number): boolean {
    return value === -10 || value === -11 || value === -12;
}

export default function BittingCalculator({
    isOpen,
    onClose,
    codeSeries,
    spaces = 8,
    depths = 4,
    macs = 4,
    keyway,
    lishi
}: BittingCalculatorProps) {
    // Parse depths to get max depth value - handle multiple formats:
    // - Number: 4
    // - Comma-separated: "1,2,3,4" or "1,2,3,4,5"
    // - Range format: "1 (Shallow) to 4 (Deep)" or "1-4"
    const maxDepth = useMemo(() => {
        if (typeof depths === 'number') return depths;
        const depthStr = String(depths);

        // Handle comma-separated like "1,2,3,4,5"
        if (depthStr.includes(',')) {
            const values = depthStr.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n));
            return values.length > 0 ? Math.max(...values) : 4;
        }

        // Handle range format like "1 (Shallow) to 4 (Deep)" or "1-4" or "1 to 4"
        // Extract all numbers and take the max
        const numbers = depthStr.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            const values = numbers.map(n => parseInt(n));
            return Math.max(...values);
        }

        return 4; // fallback
    }, [depths]);

    // Active keyway rules — match against compound AKS keyway values
    // AKS stores: "B106 / B109 / P1115", "HU92-P", "MIT3 / X224", etc.
    // Our rules use: "B106", "HU92", "MIT3"
    // Priority: structural keyway rules > hint-only keyway > lishi fallback
    // When both keyway and lishi match, merge: structural from keyway, hint from both
    const { rules, matchedKeyway, matchSource } = useMemo(() => {
        const hasStructural = (r: typeof KEYWAY_RULES[string]) =>
            !!(r.fixedPositions || r.doorOnly || r.ignitionOnly || r.macsOverride !== undefined ||
                r.macsFallback !== undefined || r.maxConsecutiveSame || r.minDepthOccurrences);

        // Try to find a rule by resolving a keyway segment
        const resolveSegment = (seg: string): { key: string; rule: typeof KEYWAY_RULES[string] } | null => {
            if (KEYWAY_RULES[seg]) return { key: seg, rule: KEYWAY_RULES[seg] };
            const bare = seg.replace(/[-_][A-Z]+$/, '');
            if (bare !== seg && KEYWAY_RULES[bare]) return { key: bare, rule: KEYWAY_RULES[bare] };
            return null;
        };

        // Collect all keyway segment matches
        let keywayMatches: { key: string; rule: typeof KEYWAY_RULES[string] }[] = [];
        if (keyway) {
            // Try exact match first
            if (KEYWAY_RULES[keyway]) {
                keywayMatches.push({ key: keyway, rule: KEYWAY_RULES[keyway] });
            } else {
                // Try compound segments
                const segments = keyway.split(/\s*\/\s*/);
                for (const seg of segments) {
                    const match = resolveSegment(seg);
                    if (match) keywayMatches.push(match);
                }
            }
        }

        // Among keyway matches, prefer the one with structural data
        let bestKeyway = keywayMatches.find(m => hasStructural(m.rule)) || keywayMatches[0] || null;

        // Lishi fallback
        const lishiRule = lishi && KEYWAY_RULES[lishi] ? { key: lishi, rule: KEYWAY_RULES[lishi] } : null;

        if (bestKeyway) {
            // If lishi also matched and has useful hint, merge hint into keyway rule
            if (lishiRule && lishiRule.key !== bestKeyway.key && lishiRule.rule.hint) {
                const merged = { ...bestKeyway.rule };
                if (!merged.hint) {
                    merged.hint = lishiRule.rule.hint;
                } else if (!merged.hint.includes(lishiRule.key)) {
                    merged.hint = merged.hint + ` | Lishi ${lishiRule.key}: ${lishiRule.rule.hint.replace(/^[^:]+:\s*/, '')}`;
                }
                return { rules: merged, matchedKeyway: bestKeyway.key, matchSource: 'keyway' as const };
            }
            return { rules: bestKeyway.rule, matchedKeyway: bestKeyway.key, matchSource: 'keyway' as const };
        }

        if (lishiRule) {
            return { rules: lishiRule.rule, matchedKeyway: lishiRule.key, matchSource: 'lishi' as const };
        }

        return { rules: null, matchedKeyway: null, matchSource: null };
    }, [keyway, lishi]);

    // Parse code series into a numeric range for validation
    // Supports: "M1-2618", "10001-11500", "DE0001-DE11210", "G-series", etc.
    const codeSeriesRange = useMemo(() => {
        if (!codeSeries) return null;
        // Match patterns like M1-2618, 10001–11500, DE0001–DE11210
        const rangeMatch = codeSeries.match(/^([A-Z]*)0*(\d+)\s*[-–]\s*([A-Z]*)0*(\d+)$/i);
        if (rangeMatch) {
            const prefix = rangeMatch[1] || rangeMatch[3] || '';
            const low = parseInt(rangeMatch[2]);
            const high = parseInt(rangeMatch[4]);
            if (!isNaN(low) && !isNaN(high) && high > low) {
                return { prefix: prefix.toUpperCase(), low, high, total: high - low + 1 };
            }
        }
        return null;
    }, [codeSeries]);

    // Is this vehicle "fully specified"? (code series + keyway rules + lishi)
    const isFullySpecified = !!(codeSeries && rules && lishi && matchSource === 'keyway');

    // Compound keyway segments for display
    const keywaySegments = useMemo(() => {
        if (!keyway) return [];
        return keyway.split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
    }, [keyway]);

    // Effective MACS: macsOverride (AKS confirmed wrong) > AKS vehicle prop > macsFallback (safety net)
    const effectiveMacs = useMemo(() => {
        if (rules?.macsOverride !== undefined) return rules.macsOverride;
        if (macs) return macs;
        if (rules?.macsFallback !== undefined) return rules.macsFallback;
        return macs; // default to prop (may be undefined)
    }, [rules, macs]);
    const macsIsNone = effectiveMacs >= 999;

    // Lock context: which cylinder are we working with?
    const [lockContext, setLockContext] = useState<'full' | 'door' | 'ignition'>('full');
    const hasDoorIgnitionSplit = !!(rules?.doorOnly || rules?.ignitionOnly);

    // Which positions are active based on lock context (1-indexed position numbers)
    const activePositions = useMemo(() => {
        if (!rules) return null; // All positions active
        if (lockContext === 'door' && rules.doorOnly) {
            return new Set(rules.doorOnly);
        }
        if (lockContext === 'ignition' && rules.ignitionOnly) {
            return new Set(rules.ignitionOnly);
        }
        return null; // Full = all active
    }, [rules, lockContext]);

    // Fixed positions that cannot be edited
    const fixedPositionMap = useMemo(() => {
        return rules?.fixedPositions || {};
    }, [rules]);

    // Initialize position values
    const [positions, setPositions] = useState<number[]>(Array(spaces).fill(0));
    const [keyCode, setKeyCode] = useState('');
    const [macsViolations, setMacsViolations] = useState<number[]>([]);
    const [consecutiveViolations, setConsecutiveViolations] = useState<number[]>([]);
    const [matchingCodes, setMatchingCodes] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [infoExpanded, setInfoExpanded] = useState(false);

    // Refs for auto-advance
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Linked position suggestions — BIDIRECTIONAL
    // e.g., GM Golden Rule: {1: 9, 2: 10} means P1≈P9, P2≈P10
    // If P9 is known and P1 is unknown → suggest P1=P9 depth
    // If P1 is known and P9 is unknown → also suggest P9=P1 depth
    const linkedPositionSuggestions = useMemo(() => {
        if (!rules?.linkedPositions) return {} as Record<number, { suggestedDepth: number; sourcePos: number }>;
        const suggestions: Record<number, { suggestedDepth: number; sourcePos: number }> = {};
        for (const [targetPosStr, sourcePosNum] of Object.entries(rules.linkedPositions)) {
            const targetPos = Number(targetPosStr);
            const sourceIdx = sourcePosNum - 1;
            const targetIdx = targetPos - 1;
            // Forward: source known → suggest target
            if (sourceIdx >= 0 && sourceIdx < positions.length && positions[sourceIdx] > 0 &&
                targetIdx >= 0 && targetIdx < positions.length && (positions[targetIdx] <= 0)) {
                suggestions[targetPos] = { suggestedDepth: positions[sourceIdx], sourcePos: sourcePosNum };
            }
            // Reverse: target known → suggest source
            if (targetIdx >= 0 && targetIdx < positions.length && positions[targetIdx] > 0 &&
                sourceIdx >= 0 && sourceIdx < positions.length && (positions[sourceIdx] <= 0)) {
                suggestions[sourcePosNum] = { suggestedDepth: positions[targetIdx], sourcePos: targetPos };
            }
        }
        return suggestions;
    }, [rules, positions]);

    // Avoid-depth warnings (e.g., HU66 P8 should avoid depth 4)
    const avoidDepthWarnings = useMemo(() => {
        if (!rules?.avoidPositionDepths) return [] as { pos: number; depth: number; avoided: number[] }[];
        const warnings: { pos: number; depth: number; avoided: number[] }[] = [];
        for (const [posStr, avoidedDepths] of Object.entries(rules.avoidPositionDepths)) {
            const pos = Number(posStr);
            const idx = pos - 1;
            if (idx >= 0 && idx < positions.length && positions[idx] > 0 && avoidedDepths.includes(positions[idx])) {
                warnings.push({ pos, depth: positions[idx], avoided: avoidedDepths });
            }
        }
        return warnings;
    }, [rules, positions]);

    // Count unknown/special positions (includes ?, X, A, B, T, and blank)
    const unknownPositions = useMemo(() =>
        positions.map((v, i) => isUnknownOrSpecial(v) ? i : -1).filter(i => i >= 0),
        [positions]
    );
    const knownPositions = useMemo(() =>
        positions.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0),
        [positions]
    );

    // Smart workflow: detect when all door positions are filled and blind cuts remain
    const blindPositionInfo = useMemo(() => {
        if (!rules?.doorOnly || !rules?.ignitionOnly) return null;
        const doorSet = new Set(rules.doorOnly);
        const ignSet = new Set(rules.ignitionOnly);
        // Blind positions = in ignition but NOT in door
        const blindPositions = rules.ignitionOnly.filter(p => !doorSet.has(p));
        if (blindPositions.length === 0) return null;
        // Check if all door positions are filled (known depth > 0)
        const doorAllFilled = rules.doorOnly.every(p => {
            const idx = p - 1;
            return idx >= 0 && idx < positions.length && positions[idx] > 0;
        });
        // Check how many blind positions are still unknown
        const blindUnknown = blindPositions.filter(p => {
            const idx = p - 1;
            return idx >= 0 && idx < positions.length && positions[idx] <= 0;
        });
        return {
            blindPositions,
            doorAllFilled,
            blindUnknownCount: blindUnknown.length,
            blindUnknown,
        };
    }, [rules, positions]);

    // Calculate total combinations and blanks needed
    const combinationStats = useMemo(() => {
        let totalCombinations = 1;
        let maxBlanksNeeded = 1;

        positions.forEach(val => {
            let optionsForPosition = 1;
            if (val === 0 || val === -1) {
                // Unknown: all depths possible
                optionsForPosition = maxDepth;
            } else if (val === -2) {
                // X wildcard: all depths possible
                optionsForPosition = maxDepth;
            } else if (isHalfDepth(val)) {
                // Half-depth: 2 options
                optionsForPosition = 2;
            }
            totalCombinations *= optionsForPosition;
        });

        // Blanks needed is ceil(log_maxDepth(totalCombinations)) but simplified:
        // It's basically how many different keys you'd need to try
        maxBlanksNeeded = Math.min(totalCombinations, 999);

        return { totalCombinations, maxBlanksNeeded };
    }, [positions, maxDepth]);

    // Calculate progressive cutting order (shallow to deep), influenced by forensic hints
    const cuttingOrder = useMemo(() => {
        const ordered = positions
            .map((depth, index) => ({ index, depth }))
            .filter(p => p.depth > 0) // Only known exact positions
            .sort((a, b) => {
                // Primary: sort by depth (shallow to deep)
                if (a.depth !== b.depth) return a.depth - b.depth;
                // Secondary: prefer positions with positionHints (forensically significant)
                const posA = a.index + 1;
                const posB = b.index + 1;
                const hintA = rules?.positionHints?.[posA] ? 0 : 1;
                const hintB = rules?.positionHints?.[posB] ? 0 : 1;
                return hintA - hintB;
            });
        return ordered.map((p, order) => ({ ...p, order: order + 1 }));
    }, [positions, rules]);

    const nextToCut = useMemo(() => {
        if (cuttingOrder.length === 0) return null;
        return cuttingOrder[0]?.index ?? null;
    }, [cuttingOrder]);

    // Auto-fill fixed positions on mount and when rules change
    useEffect(() => {
        if (Object.keys(fixedPositionMap).length > 0) {
            setPositions(prev => {
                const updated = [...prev];
                let changed = false;
                for (const [posStr, depth] of Object.entries(fixedPositionMap)) {
                    const idx = Number(posStr) - 1; // Convert 1-indexed to 0-indexed
                    if (idx >= 0 && idx < updated.length && updated[idx] !== depth) {
                        updated[idx] = depth;
                        changed = true;
                    }
                }
                return changed ? updated : prev;
            });
        }
    }, [fixedPositionMap]);

    // Check MACS violations for known positions
    useEffect(() => {
        const violations: number[] = [];
        for (let i = 1; i < positions.length; i++) {
            const diff = Math.abs(positions[i] - positions[i - 1]);
            if (positions[i] > 0 && positions[i - 1] > 0 && !macsIsNone && diff > effectiveMacs) {
                violations.push(i - 1);
                violations.push(i);
            }
        }
        setMacsViolations([...new Set(violations)]);

        // Check maxConsecutiveSame violations
        const consViolations: number[] = [];
        if (rules?.maxConsecutiveSame) {
            let run = 1;
            for (let i = 1; i < positions.length; i++) {
                if (positions[i] > 0 && positions[i] === positions[i - 1]) {
                    run++;
                    if (run > rules.maxConsecutiveSame) {
                        // Mark all positions in the violating run
                        for (let j = i - run + 1; j <= i; j++) {
                            consViolations.push(j);
                        }
                    }
                } else {
                    run = 1;
                }
            }
        }
        setConsecutiveViolations([...new Set(consViolations)]);
    }, [positions, macs, rules]);

    // Handle position depth change with auto-advance
    const handlePositionChange = (index: number, value: number | string, shouldAutoAdvance = false) => {
        // Block changes to fixed positions
        const posNum = index + 1; // Convert 0-indexed to 1-indexed
        if (fixedPositionMap[posNum] !== undefined) return;

        const newPositions = [...positions];

        if (typeof value === 'string') {
            const upper = value.toUpperCase();
            // Check for special codes
            if (upper in SPECIAL_CODES) {
                newPositions[index] = SPECIAL_CODES[upper as keyof typeof SPECIAL_CODES];
            } else {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue === 0) {
                    newPositions[index] = 0;
                } else {
                    newPositions[index] = Math.max(1, Math.min(maxDepth, numValue));
                }
            }
        } else if (value <= 0) {
            // Special code passed as number
            newPositions[index] = value;
        } else {
            newPositions[index] = Math.max(1, Math.min(maxDepth, value));
        }

        setPositions(newPositions);
        setMatchingCodes([]);

        // Auto-advance to next position if a value was entered
        if (shouldAutoAdvance && newPositions[index] !== 0) {
            const nextIndex = index + 1;
            if (nextIndex < spaces) {
                setTimeout(() => {
                    inputRefs.current[nextIndex]?.focus();
                    inputRefs.current[nextIndex]?.select();
                }, 50);
            }
        }
    };

    // Handle keyboard input on position fields
    const handlePositionKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key.toUpperCase();

        // Handle special codes: ?, X, A, B, T
        if (key === '?' || key === 'X' || key === 'A' || key === 'B' || key === 'T') {
            e.preventDefault();
            handlePositionChange(index, key, true);
            return;
        }

        // Handle numeric keys 1-9 for quick entry with auto-advance
        if (/^[1-9]$/.test(e.key)) {
            e.preventDefault();
            const digit = parseInt(e.key);
            if (digit <= maxDepth) {
                handlePositionChange(index, digit, true);
            }
            return;
        }

        // Handle 0 to clear
        if (e.key === '0') {
            e.preventDefault();
            handlePositionChange(index, 0, true);
            return;
        }

        // Handle arrow keys for navigation
        if (e.key === 'ArrowRight' || e.key === 'Tab') {
            if (!e.shiftKey && index < spaces - 1) {
                e.preventDefault();
                inputRefs.current[index + 1]?.focus();
                inputRefs.current[index + 1]?.select();
            }
        } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
            if (index > 0) {
                e.preventDefault();
                inputRefs.current[index - 1]?.focus();
                inputRefs.current[index - 1]?.select();
            }
        }

        // Handle Backspace to clear and go back
        if (e.key === 'Backspace') {
            if (positions[index] !== 0) {
                e.preventDefault();
                handlePositionChange(index, 0, false);
            } else if (index > 0) {
                e.preventDefault();
                inputRefs.current[index - 1]?.focus();
                inputRefs.current[index - 1]?.select();
            }
        }
    };

    // Parse key code and populate positions (supports A, B, T, X, ?)
    const handleCodeInput = useCallback(() => {
        const chars = keyCode.toUpperCase().split('');
        if (chars.length > 0) {
            const newPositions = Array(spaces).fill(0);
            for (let i = 0; i < Math.min(chars.length, spaces); i++) {
                // Respect fixed positions - don't overwrite
                const posNum = i + 1;
                if (fixedPositionMap[posNum] !== undefined) {
                    newPositions[i] = fixedPositionMap[posNum];
                    continue;
                }
                const char = chars[i];
                if (char in SPECIAL_CODES) {
                    newPositions[i] = SPECIAL_CODES[char as keyof typeof SPECIAL_CODES];
                } else {
                    const digit = parseInt(char);
                    if (!isNaN(digit) && digit >= 1 && digit <= maxDepth) {
                        newPositions[i] = digit;
                    }
                }
            }
            // Ensure fixed positions are filled even if code is shorter
            for (const [posStr, depth] of Object.entries(fixedPositionMap)) {
                const idx = Number(posStr) - 1;
                if (idx >= 0 && idx < newPositions.length) {
                    newPositions[idx] = depth;
                }
            }
            setPositions(newPositions);
            setMatchingCodes([]);
        }
    }, [keyCode, spaces, maxDepth, fixedPositionMap]);

    // Find matching codes - enforces MACS, fixedPositions, maxConsecutiveSame, doorOnly context
    const findMatchingCodes = useCallback(() => {
        setIsSearching(true);
        const results: string[] = [];

        // Build list of possible values for each position
        const possibleValues: number[][] = positions.map((val, idx) => {
            const posNum = idx + 1; // 1-indexed

            // Fixed positions: only their fixed depth
            if (fixedPositionMap[posNum] !== undefined) {
                return [fixedPositionMap[posNum]];
            }

            // Inactive positions (not in current lock context): use value if known, otherwise all
            if (activePositions && !activePositions.has(posNum)) {
                // Position not in this cylinder - treat as wildcard for code generation
                // but it won't be physically validated in the real lock
                if (val > 0) return [val];
                return Array.from({ length: maxDepth }, (_, i) => i + 1);
            }

            if (val > 0) return [val]; // Known depth
            if (val === -2) return Array.from({ length: maxDepth }, (_, i) => i + 1); // X = all
            if (isHalfDepth(val)) {
                const expansion = HALF_DEPTH_EXPANSIONS[val] || [];
                return expansion.filter(d => d <= maxDepth);
            }
            // Unknown (0 or -1): all depths
            return Array.from({ length: maxDepth }, (_, i) => i + 1);
        });

        // Calculate total combinations
        const totalCombos = possibleValues.reduce((acc, vals) => acc * vals.length, 1);

        if (totalCombos > 100000) {
            results.push(`Too many combinations (${totalCombos.toLocaleString()}). Add more known depths.`);
        } else {
            // Generate all combinations with rule enforcement
            const maxConsec = rules?.maxConsecutiveSame;

            const generateCombinations = (index: number, current: number[]): void => {
                if (results.length >= 50) return; // Cap results

                if (index === positions.length) {
                    // Check MACS validity
                    let valid = true;
                    for (let i = 1; i < current.length; i++) {
                        if (!macsIsNone && Math.abs(current[i] - current[i - 1]) > effectiveMacs) {
                            valid = false;
                            break;
                        }
                    }

                    // Check maxConsecutiveSame
                    if (valid && maxConsec) {
                        let run = 1;
                        for (let i = 1; i < current.length; i++) {
                            run = current[i] === current[i - 1] ? run + 1 : 1;
                            if (run > maxConsec) {
                                valid = false;
                                break;
                            }
                        }
                    }

                    // Check minDepthOccurrences (e.g., HU64: at least two #5 depth cuts)
                    if (valid && rules?.minDepthOccurrences) {
                        for (const [depthStr, minCount] of Object.entries(rules.minDepthOccurrences)) {
                            const reqDepth = Number(depthStr);
                            const count = current.filter(d => d === reqDepth).length;
                            if (count < minCount) {
                                valid = false;
                                break;
                            }
                        }
                    }

                    if (valid) {
                        results.push(current.join(''));
                    }
                    return;
                }

                for (const val of possibleValues[index]) {
                    // Early MACS pruning: if this value violates MACS with previous, skip
                    if (!macsIsNone && current.length > 0 && Math.abs(val - current[current.length - 1]) > effectiveMacs) {
                        continue;
                    }
                    // Early consecutive pruning
                    if (maxConsec && current.length >= maxConsec) {
                        let allSame = true;
                        for (let j = 1; j <= maxConsec - 1; j++) {
                            if (current[current.length - j] !== val) {
                                allSame = false;
                                break;
                            }
                        }
                        if (allSame && current.length >= maxConsec - 1 &&
                            current[current.length - (maxConsec - 1)] === val) {
                            continue;
                        }
                    }
                    generateCombinations(index + 1, [...current, val]);
                }
            };

            generateCombinations(0, []);

            // Smart forensic sort: prefer linked-position matches, deprioritize avoided depths
            if (results.length > 1 && rules) {
                results.sort((a, b) => {
                    let scoreA = 0, scoreB = 0;

                    // Boost: results matching linked position suggestions
                    if (rules.linkedPositions) {
                        for (const [targetStr, sourceNum] of Object.entries(rules.linkedPositions)) {
                            const tIdx = Number(targetStr) - 1;
                            const sIdx = sourceNum - 1;
                            if (tIdx < a.length && sIdx < a.length) {
                                if (a[tIdx] === a[sIdx]) scoreA += 10;
                                if (b[tIdx] === b[sIdx]) scoreB += 10;
                            }
                        }
                    }

                    // Boost: results matching positionHints likely values
                    if (rules.positionHints) {
                        for (const [posStr, hint] of Object.entries(rules.positionHints)) {
                            const idx = Number(posStr) - 1;
                            if (idx < a.length) {
                                if (hint.likely.includes(Number(a[idx]))) scoreA += 5;
                                if (hint.likely.includes(Number(b[idx]))) scoreB += 5;
                            }
                        }
                    }

                    // Penalty: results using avoided depths
                    if (rules.avoidPositionDepths) {
                        for (const [posStr, avoidedDepths] of Object.entries(rules.avoidPositionDepths)) {
                            const idx = Number(posStr) - 1;
                            if (idx < a.length) {
                                if (avoidedDepths.includes(Number(a[idx]))) scoreA -= 8;
                                if (avoidedDepths.includes(Number(b[idx]))) scoreB -= 8;
                            }
                        }
                    }

                    // Higher score = better = should come first
                    if (scoreA !== scoreB) return scoreB - scoreA;

                    // Tiebreaker: shallowest first (progressive cutting)
                    for (let i = 0; i < a.length; i++) {
                        const dA = Number(a[i]), dB = Number(b[i]);
                        if (dA !== dB) return dA - dB;
                    }
                    return 0;
                });
            }
        }

        setMatchingCodes(results);
        setIsSearching(false);
    }, [positions, maxDepth, macs, rules, fixedPositionMap, activePositions]);

    // Reset calculator
    const handleReset = () => {
        const freshPositions = Array(spaces).fill(0);
        // Re-apply fixed positions after reset
        for (const [posStr, depth] of Object.entries(fixedPositionMap)) {
            const idx = Number(posStr) - 1;
            if (idx >= 0 && idx < freshPositions.length) {
                freshPositions[idx] = depth;
            }
        }
        setPositions(freshPositions);
        setKeyCode('');
        setMacsViolations([]);
        setConsecutiveViolations([]);
        setMatchingCodes([]);
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Use portal to render modal at body level, above all other elements
    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
            {/* Backdrop - highest z-index to ensure it's above everything */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
                onClick={onClose}
            />

            {/* Modal - also highest z-index, full screen on mobile */}
            <div className="fixed inset-0 sm:inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-zinc-900 border-0 sm:border sm:border-zinc-700 sm:rounded-2xl shadow-2xl z-[9999] overflow-hidden flex flex-col md:max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-4 border-b border-zinc-800 bg-gradient-to-r from-purple-900/30 to-zinc-900">
                    <div className="flex items-center gap-3">
                        <span className="text-lg sm:text-2xl">🧮</span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-white text-base sm:text-lg">Bitting Calculator</h2>
                                {isFullySpecified && (
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-900/50 border border-green-600/50 text-green-400 font-semibold">
                                        ✅ Fully Specified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs text-zinc-400">Code Series: <span className="text-purple-400 font-mono">{codeSeries}</span></p>
                                {codeSeriesRange && (
                                    <span className="text-[9px] text-zinc-500">
                                        ({codeSeriesRange.prefix}{String(codeSeriesRange.low).padStart(4, '0')} → {codeSeriesRange.prefix}{String(codeSeriesRange.high).padStart(4, '0')} • {codeSeriesRange.total.toLocaleString()} codes)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                    >
                        ×
                    </button>
                </div>

                {/* Specs Bar */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-3 px-3 py-2 sm:px-5 sm:py-3 bg-zinc-800/50 border-b border-zinc-800">
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">Spaces</div>
                        <div className="font-mono font-bold text-white text-sm sm:text-base">{spaces}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">Depths</div>
                        <div className="font-mono font-bold text-white text-sm sm:text-base">{depths}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">MACS</div>
                        <div className="font-mono font-bold text-amber-400 text-sm sm:text-base">{macsIsNone ? 'None' : effectiveMacs}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">Combos</div>
                        <div className="font-mono font-bold text-cyan-400 text-sm sm:text-base">
                            {combinationStats.totalCombinations > 9999
                                ? `${(combinationStats.totalCombinations / 1000).toFixed(1)}k`
                                : combinationStats.totalCombinations}
                        </div>
                        {codeSeriesRange && (
                            <div className="text-[8px] text-zinc-600" title={`Only ${codeSeriesRange.total.toLocaleString()} of ${Math.pow(maxDepth, spaces).toLocaleString()} theoretical combos are valid codes`}>
                                of {Math.pow(maxDepth, spaces).toLocaleString()} theoretical
                            </div>
                        )}
                    </div>
                    {keyway && (<div className="col-span-4 sm:col-span-1">
                        <div className="text-center">
                            <div className="text-[10px] text-zinc-500 uppercase">Keyway</div>
                            {keywaySegments.length > 1 ? (
                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                    {keywaySegments.map((seg, i) => (
                                        <span key={seg} className={`font-mono font-bold text-sm ${seg === matchedKeyway
                                            ? 'text-green-400'
                                            : 'text-zinc-500'
                                            }`}>
                                            {seg === matchedKeyway && '✓'}{seg}{i < keywaySegments.length - 1 ? ' /' : ''}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="font-mono font-bold text-green-400 text-sm">{keyway}</div>
                            )}
                        </div>
                    </div>)}
                </div>

                {/* Active Rules & Lock Context */}
                {rules && (
                    <div className="mx-3 mt-2 sm:mx-5 sm:mt-3 space-y-1.5 sm:space-y-2">
                        {/* Lock Context Toggle — always visible */}
                        {hasDoorIgnitionSplit && (
                            <div className="flex items-center gap-2 p-1.5 sm:p-2.5 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-1">Lock:</span>
                                {['full', 'door', 'ignition'].map((ctx) => (
                                    <button
                                        key={ctx}
                                        onClick={() => setLockContext(ctx as 'full' | 'door' | 'ignition')}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${lockContext === ctx
                                            ? ctx === 'door'
                                                ? 'bg-amber-600 text-white'
                                                : ctx === 'ignition'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-zinc-600 text-white'
                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                                            }`}
                                    >
                                        {ctx === 'full' ? '🔑 All' : ctx === 'door' ? '🚪 Door' : '🔧 Ignition'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Collapsible info section: collapsed on mobile, always visible on desktop */}
                        <button
                            onClick={() => setInfoExpanded(!infoExpanded)}
                            className="sm:hidden flex items-center justify-between w-full px-2 py-1.5 bg-zinc-800/60 rounded-lg border border-zinc-700/50 text-xs text-zinc-400"
                        >
                            <span>ℹ️ Rules & Strategy</span>
                            <span className={`transition-transform ${infoExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        <div className={`${infoExpanded ? '' : 'hidden'} sm:block space-y-1.5 sm:space-y-2`}>

                            {/* Enforced Rules Summary */}
                            <div className="flex flex-wrap gap-1.5">
                                {rules.fixedPositions && Object.entries(rules.fixedPositions).map(([pos, depth]) => (
                                    <span key={`fixed-${pos}`} className="text-[10px] px-2 py-0.5 bg-purple-900/40 border border-purple-700/50 text-purple-300 rounded-full">
                                        🔒 P{pos}={depth}
                                    </span>
                                ))}
                                {lockContext === 'door' && rules.doorOnly && (
                                    <span className="text-[10px] px-2 py-0.5 bg-amber-900/40 border border-amber-700/50 text-amber-300 rounded-full">
                                        🚪 Door: P{rules.doorOnly[0]}-{rules.doorOnly[rules.doorOnly.length - 1]}
                                    </span>
                                )}
                                {lockContext === 'ignition' && rules.ignitionOnly && (
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-900/40 border border-blue-700/50 text-blue-300 rounded-full">
                                        🔧 Ign: P{rules.ignitionOnly[0]}-{rules.ignitionOnly[rules.ignitionOnly.length - 1]}
                                    </span>
                                )}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${macsIsNone
                                    ? 'bg-zinc-800/40 border border-zinc-600/50 text-zinc-400'
                                    : 'bg-amber-900/40 border border-amber-700/50 text-amber-300'
                                    }`}>
                                    📏 MACS {macsIsNone ? '= None' : `≤ ${effectiveMacs}`}
                                    {rules?.macsOverride !== undefined && rules.macsOverride !== macs && (
                                        <span className="ml-1 text-yellow-400" title={`Vehicle data says MACS=${macs}, overridden by confirmed correction`}>⚠️</span>
                                    )}
                                    {!rules?.macsOverride && !macs && rules?.macsFallback !== undefined && (
                                        <span className="ml-1 text-zinc-500 text-[8px]" title="AKS vehicle data missing MACS — using keyway rule fallback">(rule)</span>
                                    )}
                                </span>
                                {rules.maxConsecutiveSame && (
                                    <span className="text-[10px] px-2 py-0.5 bg-orange-900/40 border border-orange-700/50 text-orange-300 rounded-full">
                                        🔁 Max {rules.maxConsecutiveSame} consec.
                                    </span>
                                )}
                                {rules.minDepthOccurrences && Object.entries(rules.minDepthOccurrences).map(([depth, min]) => (
                                    <span key={`min-${depth}`} className="text-[10px] px-2 py-0.5 bg-teal-900/40 border border-teal-700/50 text-teal-300 rounded-full">
                                        🎯 ≥{min}× depth {depth}
                                    </span>
                                ))}
                                {rules.codeSeries && (
                                    <span className="text-[10px] px-2 py-0.5 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 rounded-full" title="Known code series range (informational)">
                                        📋 Series: {rules.codeSeries}
                                    </span>
                                )}
                            </div>

                            {/* Hint text */}
                            <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2 sm:line-clamp-none">
                                {rules.hint}
                            </p>

                            {/* Decode Workflow Guide */}
                            {rules.decodeWorkflow && (
                                <div className="p-2 sm:p-2.5 bg-indigo-900/20 rounded-lg border border-indigo-700/40">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs">🔓</span>
                                        <p className="text-[11px] text-indigo-300 leading-relaxed">
                                            <span className="font-semibold text-indigo-200">Decode Strategy: </span>
                                            {rules.decodeWorkflow.replace(/^🔓\s*/, '')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Linked Position Suggestions */}
                            {Object.keys(linkedPositionSuggestions).length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(linkedPositionSuggestions).map(([pos, { suggestedDepth, sourcePos }]) => (
                                        <button
                                            key={`linked-${pos}`}
                                            onClick={() => handlePositionChange(Number(pos) - 1, suggestedDepth)}
                                            className="text-[10px] px-2 py-0.5 bg-cyan-900/40 border border-cyan-600/50 text-cyan-300 rounded-full hover:bg-cyan-800/60 transition-all cursor-pointer"
                                            title={`Golden Rule: P${pos} should match P${sourcePos}. Click to apply.`}
                                        >
                                            🔗 P{pos}→{suggestedDepth} (≈P{sourcePos})
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Avoid-Depth Warnings */}
                            {avoidDepthWarnings.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {avoidDepthWarnings.map(({ pos, depth, avoided }) => (
                                        <span key={`avoid-${pos}`} className="text-[10px] px-2 py-0.5 bg-yellow-900/40 border border-yellow-600/50 text-yellow-300 rounded-full">
                                            ⚠️ P{pos}={depth} (depth {avoided.join(',')} rare here)
                                        </span>
                                    ))}
                                </div>
                            )}

                        </div>{/* end collapsible info */}
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 sm:p-5 sm:space-y-5">
                    {/* Code Input */}
                    <div className="bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-zinc-700/50">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider mb-1 sm:mb-2 block">
                            Enter Full Key Code (or enter partial depths below)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <input
                                type="text"
                                value={keyCode}
                                onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleCodeInput()}
                                placeholder={`e.g., ${codeSeries.split('-')[0]}1234`}
                                className="flex-1 min-w-[120px] bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 font-mono text-white text-sm sm:text-base placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <button
                                onClick={handleCodeInput}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all text-sm sm:text-base"
                            >
                                Parse
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all text-sm sm:text-base"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Position Grid */}
                    <div className="bg-zinc-800/60 p-3 sm:p-4 rounded-xl border border-zinc-700/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div>
                                <label className="text-xs text-zinc-400 uppercase tracking-wider">
                                    Position Depths
                                </label>
                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                    1-{maxDepth}=depth, ?=unknown, X=any, A=1½, B=3½, T=2½
                                </p>
                            </div>
                            {lishi && (
                                <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full w-fit">
                                    🔓 Lishi: {lishi}
                                </span>
                            )}
                        </div>

                        {/* Grid of positions */}
                        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                            {positions.map((depth, index) => {
                                const displayVal = getDisplayValue(depth);
                                const isHalf = isHalfDepth(depth);
                                const isWildcard = depth === -2;
                                const isUnknown = depth === 0 || depth === -1;
                                const posNum = index + 1;
                                const isFixed = fixedPositionMap[posNum] !== undefined;
                                const isInactive = activePositions !== null && !activePositions.has(posNum);
                                const hasConsecViolation = consecutiveViolations.includes(index);
                                const hasMacsViolation = macsViolations.includes(index);

                                return (
                                    <div key={index} className={`flex flex-col items-center ${isInactive ? 'opacity-35' : ''}`}>
                                        {/* Depth input */}
                                        <input
                                            ref={el => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={displayVal}
                                            onChange={(e) => handlePositionChange(index, e.target.value, false)}
                                            onKeyDown={(e) => handlePositionKeyDown(index, e)}
                                            onFocus={() => setFocusedIndex(index)}
                                            onBlur={() => setFocusedIndex(null)}
                                            placeholder={isInactive ? '–' : '?'}
                                            maxLength={1}
                                            disabled={isFixed || isInactive}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 text-center font-mono font-bold text-lg sm:text-xl rounded-lg border-2 transition-all focus:outline-none focus:ring-2 ${isFixed
                                                ? 'bg-green-900/40 border-green-600 text-green-300 cursor-not-allowed'
                                                : hasMacsViolation
                                                    ? 'bg-red-900/50 border-red-500 text-red-300 focus:ring-red-500'
                                                    : hasConsecViolation
                                                        ? 'bg-orange-900/50 border-orange-500 text-orange-300 focus:ring-orange-500'
                                                        : depth > 0
                                                            ? 'bg-purple-900/30 border-purple-500 text-white focus:ring-purple-500'
                                                            : isHalf
                                                                ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 focus:ring-cyan-500'
                                                                : isWildcard
                                                                    ? 'bg-pink-900/30 border-pink-500 text-pink-400 focus:ring-pink-500'
                                                                    : isUnknown || depth === -1
                                                                        ? 'bg-amber-900/30 border-amber-500 text-amber-400 focus:ring-amber-500'
                                                                        : 'bg-zinc-900/80 border-zinc-600 border-dashed text-zinc-500 focus:ring-amber-500 placeholder-zinc-600'
                                                }`}
                                        />
                                        {/* Position label + blind position indicator */}
                                        <span className={`text-[10px] mt-1 ${isFixed
                                            ? 'text-green-400'
                                            : hasMacsViolation
                                                ? 'text-red-400'
                                                : hasConsecViolation
                                                    ? 'text-orange-400'
                                                    : isHalf
                                                        ? 'text-cyan-400'
                                                        : isWildcard
                                                            ? 'text-pink-400'
                                                            : isUnknown
                                                                ? 'text-amber-500'
                                                                : 'text-zinc-500'
                                            }`}>
                                            {isFixed ? '🔒' : linkedPositionSuggestions[posNum] ? '🔗' : posNum}
                                        </span>
                                        {/* Blind position badge: IGN-only or DOOR-only */}
                                        {blindPositionInfo?.blindPositions.includes(posNum) && (
                                            <span className="text-[7px] font-semibold text-amber-400 bg-amber-900/40 px-1 rounded mt-0.5">IGN</span>
                                        )}
                                        {rules?.ignitionOnly && rules?.doorOnly && !rules.ignitionOnly.includes(posNum) && rules.doorOnly.includes(posNum) && (
                                            <span className="text-[7px] font-semibold text-blue-400 bg-blue-900/40 px-1 rounded mt-0.5">DOOR</span>
                                        )}
                                        {/* Position hint for unknown positions */}
                                        {isUnknown && !isInactive && rules?.positionHints?.[posNum] && (
                                            <span className="text-[8px] text-indigo-400/70 mt-0.5" title={rules.positionHints[posNum].reason}>
                                                ≈{rules.positionHints[posNum].likely.join(',')}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>


                        {/* Key Blade Silhouette — inverted: depth 1 = tallest (most metal), depth 4 = shortest (deepest cut) */}
                        <div className="mt-4 hidden sm:flex flex-col items-center">
                            <div className="flex justify-center gap-0 h-16">
                                {positions.map((depth, index) => {
                                    const isHalf = isHalfDepth(depth);
                                    const isWildcard = depth === -2;
                                    const isUnknown = depth <= 0 && !isHalf && !isWildcard;
                                    // Inverted: depth 1 → tallest bar (most metal remaining), depth max → shortest bar (deepest cut)
                                    const metalRemaining = depth > 0
                                        ? ((maxDepth + 1 - depth) / maxDepth) * 100
                                        : (isHalf ? 65 : (isWildcard ? 50 : 100)); // Unknown = full height (uncut blank)
                                    const posNum = index + 1;
                                    const isFixed = fixedPositionMap[posNum] !== undefined;
                                    const isInactive = activePositions !== null && !activePositions.has(posNum);

                                    return (
                                        <div
                                            key={index}
                                            className={`relative w-6 flex flex-col justify-end ${isInactive ? 'opacity-25' : ''}`}
                                        >
                                            <div
                                                className={`transition-all duration-200 ${isFixed
                                                    ? 'bg-gradient-to-b from-green-400 to-green-600'
                                                    : macsViolations.includes(index)
                                                        ? 'bg-red-500'
                                                        : consecutiveViolations.includes(index)
                                                            ? 'bg-orange-500'
                                                            : depth > 0
                                                                ? 'bg-gradient-to-b from-purple-400 to-purple-600'
                                                                : isHalf
                                                                    ? 'bg-gradient-to-b from-cyan-400 to-cyan-600'
                                                                    : isWildcard
                                                                        ? 'bg-gradient-to-b from-pink-400 to-pink-600'
                                                                        : 'bg-zinc-700/60 border border-dashed border-amber-500/30'
                                                    }`}
                                                style={{
                                                    height: `${metalRemaining}%`,
                                                    minHeight: '4px'
                                                }}
                                            >
                                                {(isUnknown || isHalf || isWildcard) && (
                                                    <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isHalf ? 'text-cyan-200' : isWildcard ? 'text-pink-200' : 'text-amber-500'
                                                        }`}>
                                                        {getDisplayValue(depth) || '?'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Key blade spine / baseline */}
                            <div className="h-1.5 rounded-b-sm bg-zinc-500/60" style={{ width: `${spaces * 24}px` }} />
                        </div>

                        {/* Status bar with Find button */}
                        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span className="text-xs text-zinc-400">
                                <span className="text-purple-400 font-bold">{knownPositions.length}</span> known,
                                <span className="text-amber-400 font-bold ml-1">{unknownPositions.length}</span> unknown
                                {blindPositionInfo && blindPositionInfo.blindUnknownCount > 0 && (
                                    <span className="text-amber-500 ml-1">
                                        ({blindPositionInfo.blindUnknownCount} blind)
                                    </span>
                                )}
                            </span>
                            {/* Auto-CTA: door decode complete → progression button */}
                            {blindPositionInfo?.doorAllFilled && blindPositionInfo.blindUnknownCount > 0 ? (
                                <button
                                    onClick={findMatchingCodes}
                                    disabled={isSearching}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 disabled:from-amber-800 disabled:to-orange-800 text-white font-semibold rounded-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-amber-900/30 animate-pulse hover:animate-none"
                                >
                                    {isSearching ? '⏳ Calculating...' : `🔑 Generate Progression for ${blindPositionInfo.blindUnknownCount} Blind Cut${blindPositionInfo.blindUnknownCount > 1 ? 's' : ''}`}
                                </button>
                            ) : unknownPositions.length > 0 && unknownPositions.length <= 4 ? (
                                <button
                                    onClick={findMatchingCodes}
                                    disabled={isSearching}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold rounded-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                    {isSearching ? '⏳ Searching...' : unknownPositions.length <= 2 ? '🔍 Progress Missing Cuts' : '🔍 Find Matching Codes'}
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {/* Progression Cut Sheet / Matching Codes Results */}
                    {matchingCodes.length > 0 && (
                        <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-700/50">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">{blindPositionInfo?.doorAllFilled ? '🔑' : '🎯'}</span>
                                <span className="font-bold text-amber-300">
                                    {matchingCodes.length === 1 && !matchingCodes[0].includes('Too many')
                                        ? 'Exact Match'
                                        : blindPositionInfo?.doorAllFilled
                                            ? `Progression Cut Sheet — ${matchingCodes.length} Trial${matchingCodes.length > 1 ? 's' : ''}`
                                            : `Progression: ${matchingCodes.length} Codes to Try`}
                                </span>
                                {blindPositionInfo?.doorAllFilled && matchingCodes.length > 1 && !matchingCodes[0].includes('Too many') && (
                                    <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded ml-auto">
                                        {matchingCodes.length <= 6 ? '1 blank needed' : `~${Math.ceil(matchingCodes.length / 6)} blanks`}
                                    </span>
                                )}
                            </div>

                            {matchingCodes[0].includes('Too many') ? (
                                <p className="text-amber-400 text-sm">{matchingCodes[0]}</p>
                            ) : blindPositionInfo?.doorAllFilled && matchingCodes.length <= 10 ? (
                                /* Progression Cut Sheet: step-by-step trial checklist */
                                <div className="space-y-2">
                                    {matchingCodes.map((code, idx) => {
                                        const codeDigits = code.split('');
                                        // Describe what changed from previous trial
                                        const prevCode = idx > 0 ? matchingCodes[idx - 1].split('') : null;
                                        const changes: string[] = [];
                                        if (prevCode) {
                                            codeDigits.forEach((d, i) => {
                                                if (d !== prevCode[i]) {
                                                    changes.push(`P${i + 1}: ${prevCode[i]}→${d}`);
                                                }
                                            });
                                        }

                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-3 p-2 rounded-lg border transition-all cursor-pointer hover:bg-purple-900/20 ${idx === 0 ? 'border-green-700/50 bg-green-900/10' : 'border-zinc-700/50 bg-zinc-800/30'
                                                    }`}
                                                onClick={() => {
                                                    const newPositions = codeDigits.map(d => parseInt(d));
                                                    setPositions(newPositions);
                                                    setMatchingCodes([]);
                                                }}
                                            >
                                                {/* Checkbox */}
                                                <span className="text-lg mt-0.5 select-none">{idx === 0 ? '▶️' : '🔲'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-xs font-semibold text-zinc-300">Trial {idx + 1}:</span>
                                                        <span className="font-mono text-sm text-white tracking-wider">
                                                            {codeDigits.map((d, i) => {
                                                                const isBlind = blindPositionInfo?.blindPositions.includes(i + 1);
                                                                const changed = prevCode && d !== prevCode[i];
                                                                return (
                                                                    <span key={i} className={`${isBlind ? 'text-amber-400 font-bold' : ''} ${changed ? 'text-green-400 underline' : ''}`}>
                                                                        {d}{i < codeDigits.length - 1 ? ' ' : ''}
                                                                    </span>
                                                                );
                                                            })}
                                                        </span>
                                                        {idx === 0 && (
                                                            <span className="text-[9px] text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">CUT THIS FIRST</span>
                                                        )}
                                                    </div>
                                                    {/* Action description */}
                                                    <p className="text-[11px] text-zinc-400 mt-0.5">
                                                        {idx === 0
                                                            ? `Cut root key with shallowest blind depths. Test in ignition.`
                                                            : changes.length > 0
                                                                ? `Deepen ${changes.join(', ')}. Test again.`
                                                                : 'Test in ignition.'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Standard results list for non-door-decode or many results */
                                <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {matchingCodes.map((code, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 group"
                                        >
                                            <span className="text-xs text-zinc-500 w-8 text-right font-mono">
                                                {idx + 1}.
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const newPositions = code.split('').map(d => parseInt(d));
                                                    setPositions(newPositions);
                                                    setMatchingCodes([]);
                                                }}
                                                className="font-mono text-sm bg-zinc-800 hover:bg-purple-900/50 px-3 py-1.5 rounded border border-zinc-700 hover:border-purple-500 text-white transition-all tracking-wider"
                                            >
                                                {code.split('').join(' ')}
                                            </button>
                                            {idx === 0 && (
                                                <span className="text-[10px] text-green-400 bg-green-900/30 px-2 py-0.5 rounded">START HERE</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchingCodes.length === 50 && (
                                <p className="text-xs text-amber-500 mt-2">Showing first 50. Enter more depths to narrow down.</p>
                            )}
                        </div>
                    )}

                    {/* MACS Status */}
                    <div className={`p-3 rounded-xl border ${macsViolations.length > 0
                        ? 'bg-red-900/20 border-red-700/50'
                        : 'bg-green-900/20 border-green-700/50'
                        }`}>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                {macsViolations.length > 0 ? '⚠️' : '✓'}
                            </span>
                            <span className={`text-sm ${macsViolations.length > 0 ? 'text-red-300' : 'text-green-300'}`}>
                                {macsViolations.length > 0
                                    ? `MACS Violation! Adjacent cuts exceed ${effectiveMacs}`
                                    : macsIsNone ? 'MACS: None (no restriction)' : `MACS OK (max ${effectiveMacs})`
                                }
                            </span>
                        </div>
                        {macsViolations.length > 0 && (
                            <p className="text-xs text-red-400 mt-1 ml-7">
                                Check positions: {[...new Set(macsViolations)].map(p => p + 1).sort((a, b) => a - b).join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Bitting Repair — auto-suggest fixes when MACS violated */}
                    {macsViolations.length > 0 && !macsIsNone && (() => {
                        // Generate ±1 depth permutations at violation positions, filtered by MACS
                        const knownPositions = positions.filter(v => v > 0);
                        if (knownPositions.length < 2) return null;

                        const repairs: { bitting: number[]; changes: string[] }[] = [];
                        const violatingPairs = macsViolations.map(i => [i, i + 1]);
                        const positionsToTweak = new Set<number>();
                        violatingPairs.forEach(([a, b]) => { positionsToTweak.add(a); positionsToTweak.add(b); });

                        // Try flipping each violating position ±1
                        for (const tweakIdx of positionsToTweak) {
                            if (positions[tweakIdx] <= 0) continue; // skip unknowns
                            for (const delta of [-1, 1]) {
                                const newDepth = positions[tweakIdx] + delta;
                                if (newDepth < 1 || newDepth > maxDepth) continue;

                                const candidate = [...positions];
                                candidate[tweakIdx] = newDepth;

                                // Check ALL adjacent pairs for MACS validity
                                let valid = true;
                                for (let i = 0; i < candidate.length - 1; i++) {
                                    if (candidate[i] > 0 && candidate[i + 1] > 0) {
                                        if (Math.abs(candidate[i] - candidate[i + 1]) > effectiveMacs) {
                                            valid = false;
                                            break;
                                        }
                                    }
                                }

                                if (valid && repairs.length < 5) {
                                    const changes = [`P${tweakIdx + 1}: ${positions[tweakIdx]}→${newDepth}`];
                                    // Avoid duplicates
                                    const bStr = candidate.map(v => v > 0 ? v : '?').join('');
                                    if (!repairs.some(r => r.bitting.map(v => v > 0 ? v : '?').join('') === bStr)) {
                                        repairs.push({ bitting: candidate, changes });
                                    }
                                }
                            }
                        }

                        // Also try 2-position repairs (both sides of a violation)
                        if (repairs.length < 5) {
                            for (const [idxA, idxB] of violatingPairs) {
                                if (positions[idxA] <= 0 || positions[idxB] <= 0) continue;
                                for (const dA of [-1, 1]) {
                                    for (const dB of [-1, 1]) {
                                        const nA = positions[idxA] + dA;
                                        const nB = positions[idxB] + dB;
                                        if (nA < 1 || nA > maxDepth || nB < 1 || nB > maxDepth) continue;

                                        const candidate = [...positions];
                                        candidate[idxA] = nA;
                                        candidate[idxB] = nB;

                                        let valid = true;
                                        for (let i = 0; i < candidate.length - 1; i++) {
                                            if (candidate[i] > 0 && candidate[i + 1] > 0) {
                                                if (Math.abs(candidate[i] - candidate[i + 1]) > effectiveMacs) {
                                                    valid = false;
                                                    break;
                                                }
                                            }
                                        }

                                        if (valid && repairs.length < 5) {
                                            const changes = [`P${idxA + 1}: ${positions[idxA]}→${nA}`, `P${idxB + 1}: ${positions[idxB]}→${nB}`];
                                            const bStr = candidate.map(v => v > 0 ? v : '?').join('');
                                            if (!repairs.some(r => r.bitting.map(v => v > 0 ? v : '?').join('') === bStr)) {
                                                repairs.push({ bitting: candidate, changes });
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (repairs.length === 0) return null;

                        return (
                            <div className="bg-amber-900/15 p-3 rounded-xl border border-amber-700/40">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm">🔧</span>
                                    <span className="text-xs font-bold text-amber-300">Bitting Repair — nearest valid keys</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mb-2 ml-5">
                                    Common cause: Lishi reading drift (±1 depth from wear/parallax). These are the closest MACS-compliant bittings.
                                </p>
                                <div className="space-y-1.5 ml-5">
                                    {repairs.map((repair, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group">
                                            <span className="text-[10px] text-zinc-500 w-4 text-right">{idx + 1}.</span>
                                            <button
                                                onClick={() => {
                                                    const newPos = repair.bitting.map(v => v > 0 ? v : 0);
                                                    setPositions(newPos);
                                                }}
                                                className="font-mono text-xs bg-zinc-800 hover:bg-amber-900/40 px-2.5 py-1 rounded border border-zinc-700 hover:border-amber-500 text-white transition-all tracking-wider"
                                            >
                                                {repair.bitting.map(v => v > 0 ? v : '?').join(' ')}
                                            </button>
                                            <span className="text-[10px] text-amber-400/70">
                                                {repair.changes.join(', ')}
                                            </span>
                                            <span className="text-[10px] text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">← Apply</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Reference Info — hidden on mobile to save space */}
                    <div className="hidden sm:block text-xs text-zinc-500 bg-zinc-800/40 p-3 rounded-lg">
                        <p className="font-semibold text-zinc-400 mb-1">💡 FILL-Style Codes</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                            <span><strong className="text-white">1-{maxDepth}</strong> = exact depth</span>
                            <span><strong className="text-amber-400">?</strong> = unknown (all depths)</span>
                            <span><strong className="text-pink-400">X</strong> = wildcard (any valid)</span>
                            <span><strong className="text-cyan-400">A</strong> = 1½ (1 or 2)</span>
                            <span><strong className="text-cyan-400">B</strong> = 3½ (3 or 4)</span>
                            <span><strong className="text-cyan-400">T</strong> = 2½ (2 or 3)</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-3 py-2 sm:px-5 sm:py-3 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 hidden sm:inline">
                        Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Esc</kbd> to close
                    </span>
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all w-full sm:w-auto text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}
