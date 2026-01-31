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
const KEYWAY_RULES: Record<string, {
    fixedPositions?: Record<number, number>; // Position must be this depth
    doorOnly?: number[]; // Door lock only has these positions
    ignitionOnly?: number[]; // Ignition-specific positions
    maxConsecutiveSame?: number; // Max consecutive same depths
    reverseDepth?: boolean; // Depth logic inverted
    angular?: boolean; // Uses angles not depths
    hint?: string;
}> = {
    'HU101': {
        fixedPositions: { 10: 2 },
        hint: '⚠️ Ford HU101: Position 10 is ALWAYS depth 2'
    },
    'Y159': {
        doorOnly: [2, 3, 4, 5, 6, 7, 8],
        hint: '⚠️ Chrysler: Door lock missing P1. Only ~2600 valid M-codes exist.'
    },
    'HU100': {
        doorOnly: [4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7],
        hint: '⚠️ GM HU100: Door has P4-10, Ignition has P1-7. Little overlap!'
    },
    'HU100-10': {
        doorOnly: [4, 5, 6, 7, 8, 9, 10],
        ignitionOnly: [1, 2, 3, 4, 5, 6, 7],
        hint: '⚠️ GM HU100: Door has P4-10, Ignition has P1-7. Little overlap!'
    },
    'NSN14': {
        doorOnly: [4, 5, 6, 7, 8, 9, 10],
        hint: '⚠️ Nissan: Door lock has P4-10. P1 usually depth 3.'
    },
    'HU64': {
        maxConsecutiveSame: 3,
        hint: '⚠️ Mercedes: No more than 3 consecutive same depths allowed.'
    },
    'HON66': {
        hint: '💡 Honda: Read Axis A (1,3,5) and Axis B (2,4,6) separately.'
    },
    'HY20': {
        reverseDepth: true,
        hint: '⚠️ Hyundai: Depth logic may be INVERTED. Verify with Card 1311.'
    },
    'KK10': {
        reverseDepth: true,
        hint: '⚠️ Kia: Depth logic may be INVERTED. Same as HY20.'
    },
    'MAZ24R': {
        hint: '⚠️ Mazda REVERSE: Mirror image of MAZ24. Wrong blank = destroyed key!'
    },
    'Tibbe-6': {
        angular: true,
        hint: '💡 Ford Tibbe: Cuts are ANGLES (0°-30°), not depths.'
    },
    'Tibbe-8': {
        angular: true,
        hint: '💡 Jaguar Tibbe: 8 positions, only 3 angles (no deep cut 4).'
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
    // Parse depths to get max depth value - handle both number and comma-separated string
    const maxDepth = useMemo(() => {
        if (typeof depths === 'number') return depths;
        const depthStr = String(depths);
        // Handle comma-separated like "1,2,3,4,5"
        if (depthStr.includes(',')) {
            const values = depthStr.split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n));
            return Math.max(...values, 4);
        }
        return parseInt(depthStr) || 4;
    }, [depths]);

    // Initialize position values
    const [positions, setPositions] = useState<number[]>(Array(spaces).fill(0));
    const [keyCode, setKeyCode] = useState('');
    const [macsViolations, setMacsViolations] = useState<number[]>([]);
    const [matchingCodes, setMatchingCodes] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    // Refs for auto-advance
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Count unknown/special positions (includes ?, X, A, B, T, and blank)
    const unknownPositions = useMemo(() =>
        positions.map((v, i) => isUnknownOrSpecial(v) ? i : -1).filter(i => i >= 0),
        [positions]
    );
    const knownPositions = useMemo(() =>
        positions.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0),
        [positions]
    );

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

    // Calculate progressive cutting order (shallow to deep)
    const cuttingOrder = useMemo(() => {
        const ordered = positions
            .map((depth, index) => ({ index, depth }))
            .filter(p => p.depth > 0) // Only known exact positions
            .sort((a, b) => a.depth - b.depth);
        return ordered.map((p, order) => ({ ...p, order: order + 1 }));
    }, [positions]);

    const nextToCut = useMemo(() => {
        if (cuttingOrder.length === 0) return null;
        return cuttingOrder[0]?.index ?? null;
    }, [cuttingOrder]);

    // Check MACS violations for known positions
    useEffect(() => {
        const violations: number[] = [];
        for (let i = 1; i < positions.length; i++) {
            const diff = Math.abs(positions[i] - positions[i - 1]);
            if (positions[i] > 0 && positions[i - 1] > 0 && diff > macs) {
                violations.push(i - 1);
                violations.push(i);
            }
        }
        setMacsViolations([...new Set(violations)]);
    }, [positions, macs]);

    // Handle position depth change with auto-advance
    const handlePositionChange = (index: number, value: number | string, shouldAutoAdvance = false) => {
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
            setPositions(newPositions);
            setMatchingCodes([]);
        }
    }, [keyCode, spaces, maxDepth]);

    // Find matching codes - now handles half-depths and wildcards
    const findMatchingCodes = useCallback(() => {
        setIsSearching(true);
        const results: string[] = [];

        // Build list of possible values for each position
        const possibleValues: number[][] = positions.map(val => {
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
            // Generate all combinations
            const generateCombinations = (index: number, current: number[]): void => {
                if (results.length >= 50) return; // Cap results

                if (index === positions.length) {
                    // Check MACS validity
                    let valid = true;
                    for (let i = 1; i < current.length; i++) {
                        if (Math.abs(current[i] - current[i - 1]) > macs) {
                            valid = false;
                            break;
                        }
                    }
                    if (valid) {
                        results.push(current.join(''));
                    }
                    return;
                }

                for (const val of possibleValues[index]) {
                    generateCombinations(index + 1, [...current, val]);
                }
            };

            generateCombinations(0, []);
        }

        setMatchingCodes(results);
        setIsSearching(false);
    }, [positions, maxDepth, macs]);

    // Reset calculator
    const handleReset = () => {
        setPositions(Array(spaces).fill(0));
        setKeyCode('');
        setMacsViolations([]);
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
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-gradient-to-r from-purple-900/30 to-zinc-900">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🧮</span>
                        <div>
                            <h2 className="font-bold text-white text-lg">Bitting Calculator</h2>
                            <p className="text-xs text-zinc-400">Code Series: <span className="text-purple-400 font-mono">{codeSeries}</span></p>
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-5 py-3 bg-zinc-800/50 border-b border-zinc-800">
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">Spaces</div>
                        <div className="font-mono font-bold text-white">{spaces}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">Depths</div>
                        <div className="font-mono font-bold text-white">{depths}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">MACS</div>
                        <div className="font-mono font-bold text-amber-400">{macs}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] text-zinc-500 uppercase">Blanks</div>
                        <div className="font-mono font-bold text-cyan-400">
                            {combinationStats.totalCombinations > 9999
                                ? `${(combinationStats.totalCombinations / 1000).toFixed(1)}k`
                                : combinationStats.totalCombinations}
                        </div>
                    </div>
                    {keyway && (
                        <div className="text-center">
                            <div className="text-[10px] text-zinc-500 uppercase">Keyway</div>
                            <div className="font-mono font-bold text-green-400 text-sm">{keyway}</div>
                        </div>
                    )}
                </div>

                {/* Keyway-specific hint */}
                {keyway && KEYWAY_RULES[keyway]?.hint && (
                    <div className="mx-5 mt-3 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg text-xs text-amber-300">
                        {KEYWAY_RULES[keyway].hint}
                        {KEYWAY_RULES[keyway].doorOnly && (
                            <div className="mt-1 text-amber-400/70">
                                Door positions: {KEYWAY_RULES[keyway].doorOnly?.join(', ')}
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Code Input */}
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider mb-2 block">
                            Enter Full Key Code (or enter partial depths below)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <input
                                type="text"
                                value={keyCode}
                                onChange={(e) => setKeyCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && handleCodeInput()}
                                placeholder={`e.g., ${codeSeries.split('-')[0]}1234`}
                                className="flex-1 min-w-[150px] bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <button
                                onClick={handleCodeInput}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all"
                            >
                                Parse
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Position Grid */}
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
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
                        <div className="flex flex-wrap justify-center gap-2">
                            {positions.map((depth, index) => {
                                const displayVal = getDisplayValue(depth);
                                const isHalf = isHalfDepth(depth);
                                const isWildcard = depth === -2;
                                const isUnknown = depth === 0 || depth === -1;

                                return (
                                    <div key={index} className="flex flex-col items-center">
                                        {/* Depth input */}
                                        <input
                                            ref={el => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="text"
                                            value={displayVal}
                                            onChange={(e) => handlePositionChange(index, e.target.value, false)}
                                            onKeyDown={(e) => handlePositionKeyDown(index, e)}
                                            onFocus={() => setFocusedIndex(index)}
                                            onBlur={() => setFocusedIndex(null)}
                                            placeholder="?"
                                            maxLength={1}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 text-center font-mono font-bold text-lg sm:text-xl rounded-lg border-2 transition-all focus:outline-none focus:ring-2 ${macsViolations.includes(index)
                                                ? 'bg-red-900/50 border-red-500 text-red-300 focus:ring-red-500'
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
                                        {/* Position label */}
                                        <span className={`text-[10px] mt-1 ${macsViolations.includes(index)
                                            ? 'text-red-400'
                                            : isHalf
                                                ? 'text-cyan-400'
                                                : isWildcard
                                                    ? 'text-pink-400'
                                                    : isUnknown
                                                        ? 'text-amber-500'
                                                        : 'text-zinc-500'
                                            }`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>


                        {/* Visual depth representation */}
                        <div className="mt-4 flex justify-center gap-1 h-12 sm:h-16">
                            {positions.map((depth, index) => {
                                const isHalf = isHalfDepth(depth);
                                const isWildcard = depth === -2;
                                const isUnknown = depth <= 0 && !isHalf && !isWildcard;
                                const displayDepth = depth > 0 ? depth : (isHalf ? 2.5 : 0);

                                return (
                                    <div
                                        key={index}
                                        className="relative w-4 sm:w-6 flex flex-col justify-end"
                                    >
                                        <div
                                            className={`rounded-t transition-all duration-200 ${macsViolations.includes(index)
                                                ? 'bg-red-500'
                                                : depth > 0
                                                    ? 'bg-gradient-to-t from-purple-600 to-purple-400'
                                                    : isHalf
                                                        ? 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                                                        : isWildcard
                                                            ? 'bg-gradient-to-t from-pink-600 to-pink-400'
                                                            : 'bg-zinc-700 border border-dashed border-amber-500/50'
                                                }`}
                                            style={{
                                                height: depth > 0 ? `${(displayDepth / maxDepth) * 100}%` : (isHalf || isWildcard ? '60%' : '100%'),
                                                minHeight: '4px'
                                            }}
                                        >
                                            {(isUnknown || isHalf || isWildcard) && (
                                                <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-bold ${
                                                    isHalf ? 'text-cyan-200' : isWildcard ? 'text-pink-200' : 'text-amber-500'
                                                }">
                                                    {getDisplayValue(depth) || '?'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Status bar with Find button */}
                        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span className="text-xs text-zinc-400">
                                <span className="text-purple-400 font-bold">{knownPositions.length}</span> known,
                                <span className="text-amber-400 font-bold ml-1">{unknownPositions.length}</span> unknown
                            </span>
                            {unknownPositions.length > 0 && unknownPositions.length <= 4 && (
                                <button
                                    onClick={findMatchingCodes}
                                    disabled={isSearching}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white font-semibold rounded-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                    {isSearching ? '⏳ Searching...' : '🔍 Find Matching Codes'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Matching Codes Results */}
                    {matchingCodes.length > 0 && (
                        <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-700/50">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">🎯</span>
                                <span className="font-bold text-amber-300">
                                    {matchingCodes.length === 1 && !matchingCodes[0].includes('Too many')
                                        ? 'Matching Code'
                                        : `Progression: ${matchingCodes.length} Codes to Try`}
                                </span>
                            </div>

                            {matchingCodes[0].includes('Too many') ? (
                                <p className="text-amber-400 text-sm">{matchingCodes[0]}</p>
                            ) : (
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
                                    ? `MACS Violation! Adjacent cuts exceed ${macs}`
                                    : `MACS OK (max ${macs})`
                                }
                            </span>
                        </div>
                        {macsViolations.length > 0 && (
                            <p className="text-xs text-red-400 mt-1 ml-7">
                                Check positions: {[...new Set(macsViolations)].map(p => p + 1).sort((a, b) => a - b).join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Reference Info */}
                    <div className="text-xs text-zinc-500 bg-zinc-800/40 p-3 rounded-lg">
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
                <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 hidden sm:inline">
                        Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Esc</kbd> to close
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all w-full sm:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}
