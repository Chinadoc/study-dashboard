'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    // Parse depths to get max depth value
    const maxDepth = typeof depths === 'number' ? depths : parseInt(String(depths)) || 4;

    // Initialize position values (0 = unknown/blank, 1-maxDepth = known depth)
    const [positions, setPositions] = useState<number[]>(Array(spaces).fill(0));
    const [keyCode, setKeyCode] = useState('');
    const [macsViolations, setMacsViolations] = useState<number[]>([]);
    const [matchingCodes, setMatchingCodes] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Count unknown (blank) positions
    const unknownPositions = useMemo(() =>
        positions.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0),
        [positions]
    );
    const knownPositions = useMemo(() =>
        positions.map((v, i) => v > 0 ? i : -1).filter(i => i >= 0),
        [positions]
    );

    // Check MACS violations for known positions
    useEffect(() => {
        const violations: number[] = [];
        for (let i = 1; i < positions.length; i++) {
            const diff = Math.abs(positions[i] - positions[i - 1]);
            // Only check if both positions are known (non-zero)
            if (positions[i] > 0 && positions[i - 1] > 0 && diff > macs) {
                violations.push(i - 1);
                violations.push(i);
            }
        }
        setMacsViolations([...new Set(violations)]);
    }, [positions, macs]);

    // Handle position depth change
    const handlePositionChange = (index: number, value: number) => {
        const newPositions = [...positions];
        // Allow 0 (unknown) or clamp value between 1 and maxDepth
        if (value === 0 || value === -1) {
            newPositions[index] = 0;
        } else {
            newPositions[index] = Math.max(1, Math.min(maxDepth, value));
        }
        setPositions(newPositions);
        setMatchingCodes([]); // Clear previous results when positions change
    };

    // Parse key code and populate positions
    const handleCodeInput = useCallback(() => {
        // Extract numeric portion of code (e.g., "V1234" -> "1234")
        const numericPart = keyCode.replace(/[^0-9]/g, '');

        if (numericPart.length > 0) {
            const newPositions = Array(spaces).fill(0);
            // Each digit represents a depth for each position
            for (let i = 0; i < Math.min(numericPart.length, spaces); i++) {
                const digit = parseInt(numericPart[i]);
                if (!isNaN(digit) && digit >= 1 && digit <= maxDepth) {
                    newPositions[i] = digit;
                }
            }
            setPositions(newPositions);
            setMatchingCodes([]);
        }
    }, [keyCode, spaces, maxDepth]);

    // Find matching codes for unknown positions
    const findMatchingCodes = useCallback(() => {
        setIsSearching(true);
        const results: string[] = [];

        // Generate all possible combinations for unknown positions
        const unknownCount = unknownPositions.length;

        if (unknownCount === 0) {
            // All positions are known - just format the code
            const code = positions.map(d => d.toString()).join('');
            results.push(code);
        } else if (unknownCount <= 4) {
            // Reasonable number of unknowns to enumerate
            const combinations = Math.pow(maxDepth, unknownCount);

            for (let combo = 0; combo < combinations; combo++) {
                // Generate combination of depths for unknown positions
                const testPositions = [...positions];
                let temp = combo;

                for (let i = unknownCount - 1; i >= 0; i--) {
                    const depthValue = (temp % maxDepth) + 1;
                    temp = Math.floor(temp / maxDepth);
                    testPositions[unknownPositions[i]] = depthValue;
                }

                // Check MACS validity
                let valid = true;
                for (let i = 1; i < testPositions.length; i++) {
                    if (Math.abs(testPositions[i] - testPositions[i - 1]) > macs) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    const code = testPositions.map(d => d.toString()).join('');
                    results.push(code);
                }
            }
        } else {
            // Too many unknowns - show message
            results.push(`Too many unknown positions (${unknownCount}). Enter more depths to narrow down.`);
        }

        // Limit results to show
        setMatchingCodes(results.slice(0, 50));
        setIsSearching(false);
    }, [positions, unknownPositions, maxDepth, macs]);

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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3 bg-zinc-800/50 border-b border-zinc-800">
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
                    {keyway && (
                        <div className="text-center">
                            <div className="text-[10px] text-zinc-500 uppercase">Keyway</div>
                            <div className="font-mono font-bold text-green-400 text-sm">{keyway}</div>
                        </div>
                    )}
                </div>

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
                                    Enter known depths. Leave blank for unknown.
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
                            {positions.map((depth, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    {/* Depth input */}
                                    <input
                                        type="number"
                                        min={0}
                                        max={maxDepth}
                                        value={depth || ''}
                                        onChange={(e) => handlePositionChange(index, parseInt(e.target.value) || 0)}
                                        placeholder="?"
                                        className={`w-10 h-10 sm:w-12 sm:h-12 text-center font-mono font-bold text-lg sm:text-xl rounded-lg border-2 transition-all focus:outline-none focus:ring-2 ${macsViolations.includes(index)
                                                ? 'bg-red-900/50 border-red-500 text-red-300 focus:ring-red-500'
                                                : depth > 0
                                                    ? 'bg-purple-900/30 border-purple-500 text-white focus:ring-purple-500'
                                                    : 'bg-zinc-900/80 border-zinc-600 border-dashed text-zinc-500 focus:ring-amber-500 placeholder-zinc-600'
                                            }`}
                                    />
                                    {/* Position label */}
                                    <span className={`text-[10px] mt-1 ${macsViolations.includes(index)
                                            ? 'text-red-400'
                                            : depth === 0
                                                ? 'text-amber-500'
                                                : 'text-zinc-500'
                                        }`}>
                                        {index + 1}{depth === 0 && '?'}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Visual depth representation */}
                        <div className="mt-4 flex justify-center gap-1 h-12 sm:h-16">
                            {positions.map((depth, index) => (
                                <div
                                    key={index}
                                    className="relative w-4 sm:w-6 flex flex-col justify-end"
                                >
                                    <div
                                        className={`rounded-t transition-all duration-200 ${macsViolations.includes(index)
                                                ? 'bg-red-500'
                                                : depth > 0
                                                    ? 'bg-gradient-to-t from-purple-600 to-purple-400'
                                                    : 'bg-zinc-700 border border-dashed border-amber-500/50'
                                            }`}
                                        style={{
                                            height: depth > 0 ? `${(depth / maxDepth) * 100}%` : '100%',
                                            minHeight: '4px'
                                        }}
                                    >
                                        {depth === 0 && (
                                            <span className="absolute inset-0 flex items-center justify-center text-amber-500 text-[8px] sm:text-[10px]">?</span>
                                        )}
                                    </div>
                                </div>
                            ))}
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
                                        : `${matchingCodes.length} Possible Codes`}
                                </span>
                            </div>

                            {matchingCodes[0].includes('Too many') ? (
                                <p className="text-amber-400 text-sm">{matchingCodes[0]}</p>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                                    {matchingCodes.map((code, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                // Apply this code to positions
                                                const newPositions = code.split('').map(d => parseInt(d));
                                                setPositions(newPositions);
                                                setMatchingCodes([]);
                                            }}
                                            className="font-mono text-sm bg-zinc-800 hover:bg-purple-900/50 px-2 py-1.5 rounded border border-zinc-700 hover:border-purple-500 text-white transition-all"
                                        >
                                            {code}
                                        </button>
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
                        <p className="font-semibold text-zinc-400 mb-1">💡 Quick Reference</p>
                        <ul className="space-y-1">
                            <li>• <strong>Depths 1-{maxDepth}</strong>: 1 = shallow, {maxDepth} = deep</li>
                            <li>• <strong>MACS {macs}</strong>: Max difference between adjacent cuts</li>
                            <li>• Leave unknown positions blank, then click "Find Matching Codes"</li>
                        </ul>
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
