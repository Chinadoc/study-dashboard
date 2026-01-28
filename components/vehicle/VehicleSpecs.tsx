'use client';

import React, { useState } from 'react';
import GlossaryChipType from './GlossaryChipType';

interface FccEntry {
    fcc: string;
    keyType: string;
    buttons: string | null;
}

interface ChipEntry {
    chip: string;
    keyType: string;
    buttons: string | null;
}

interface Pearl {
    id?: string;
    content: string;
    risk?: string;
    category?: string;
}

interface VehicleSpecsProps {
    specs: {
        architecture?: string;
        platform?: string;
        immobilizerSystem?: string;
        canFdRequired?: boolean;
        chipType?: string;
        allChips?: ChipEntry[];
        fccId?: string;
        allFccs?: FccEntry[];
        frequency?: string;
        battery?: string;
        keyway?: string;
        lishi?: string;
        lishiSource?: string;
        spaces?: number;
        depths?: number | string;
        macs?: number;
        codeSeries?: string;
        mechanicalSource?: string | null;
    };
    make?: string;
    year?: number;
    pearls?: {
        lishi?: Pearl[];
        canFd?: Pearl[];
        chip?: Pearl[];
        fcc?: Pearl[];
    };
}

export default function VehicleSpecs({ specs, make, year, pearls }: VehicleSpecsProps) {
    if (!specs || Object.keys(specs).length === 0) {
        return null;
    }

    return (
        <section className="glass p-6 mb-6">
            <h3 className="flex items-center gap-3 text-lg font-bold text-green-400 mb-5">
                <span className="text-xl">🔧</span>
                Vehicle Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Architecture / Platform */}
                {(specs.platform || specs.architecture) && (
                    <SpecItem
                        label="Architecture"
                        value={specs.platform || specs.architecture || ''}
                        color="text-purple-400"
                    />
                )}

                {/* CAN-FD Required */}
                {specs.canFdRequired !== undefined && (
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                            CAN FD
                        </div>
                        <div className={`font-semibold ${specs.canFdRequired ? 'text-red-400' : 'text-green-400'}`}>
                            {specs.canFdRequired ? 'REQUIRED' : 'Not Required'}
                        </div>
                        {/* CAN-FD contextual pearl */}
                        {pearls?.canFd?.[0] && (
                            <div className="mt-2 text-[11px] text-orange-300 bg-orange-900/20 p-2 rounded border border-orange-800/30">
                                🔌 {pearls.canFd[0].content}
                            </div>
                        )}
                    </div>
                )}

                {/* Chip Type - with glossary linkage and contextual pearls */}
                {specs.chipType && (
                    <ChipTypeWithPopup
                        primaryChip={specs.chipType}
                        allChips={specs.allChips}
                        make={make}
                        year={year}
                        pearl={pearls?.chip?.[0]}
                    />
                )}

                {/* FCC ID with popup for multiple FCCs */}
                {specs.fccId && (
                    <FccIdWithPopup
                        primaryFcc={specs.fccId}
                        allFccs={specs.allFccs}
                        pearl={pearls?.fcc?.[0]}
                    />
                )}

                {/* Frequency */}
                {specs.frequency && (
                    <SpecItem
                        label="Frequency"
                        value={specs.frequency}
                    />
                )}

                {/* Battery */}
                {specs.battery && (
                    <SpecItem
                        label="Battery"
                        value={specs.battery}
                    />
                )}

                {/* Lishi Tool */}
                {specs.lishi && (
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                            Lishi Tool
                        </div>
                        <div className="font-semibold text-green-400">
                            {specs.lishi}
                        </div>
                        {specs.lishiSource && (
                            <div className={`text-[9px] mt-1 px-2 py-0.5 rounded-full inline-block ${specs.lishiSource === 'enrichments' ? 'bg-green-900/40 text-green-400' :
                                specs.lishiSource === 'vyp' ? 'bg-purple-900/40 text-purple-400' :
                                    'bg-zinc-800 text-zinc-500'
                                }`}>
                                {specs.lishiSource === 'vyp' ? 'VYP' : specs.lishiSource}
                            </div>
                        )}
                        {/* Lishi contextual pearl */}
                        {pearls?.lishi?.[0] && (
                            <div className="mt-2 text-[11px] text-amber-300 bg-amber-900/20 p-2 rounded border border-amber-800/30">
                                🔑 {pearls.lishi[0].content}
                            </div>
                        )}
                    </div>
                )}

                {/* Keyway */}
                {specs.keyway && (
                    <SpecItem
                        label="Keyway"
                        value={specs.keyway}
                    />
                )}
            </div>

            {/* Bitting Specs Row */}
            {(specs.spaces || specs.depths || specs.macs || specs.codeSeries) && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                            Bitting Specifications
                        </span>
                        {specs.mechanicalSource === 'vehicles' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700/30">
                                ⚠️ May be inaccurate
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {specs.spaces && (
                            <BittingItem label="Spaces" value={specs.spaces} />
                        )}
                        {specs.depths && (
                            <BittingItem label="Depths" value={specs.depths} />
                        )}
                        {specs.macs && (
                            <BittingItem label="MACS" value={specs.macs} />
                        )}
                        {specs.codeSeries && (
                            <BittingItem label="Code Series" value={specs.codeSeries} />
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

function SpecItem({
    label,
    value,
    color = 'text-white',
    isMono = false,
    icon,
    isWarning = false
}: {
    label: string;
    value: string;
    color?: string;
    isMono?: boolean;
    icon?: string;
    isWarning?: boolean;
}) {
    return (
        <div className={`bg-zinc-800/60 p-4 rounded-xl border ${isWarning ? 'border-red-700/50' : 'border-zinc-700/50'}`}>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                {label}
            </div>
            <div className={`font-semibold ${color} ${isMono ? 'font-mono text-sm' : ''}`}>
                {icon && <span className="mr-1">{icon}</span>}
                {value}
            </div>
        </div>
    );
}

function BittingItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded-lg">
            <span className="text-xs text-zinc-400">{label}</span>
            <span className="font-mono font-bold text-white">{value}</span>
        </div>
    );
}

// FCC ID display with tooltip popup ABOVE (conversation style)
function FccIdWithPopup({
    primaryFcc,
    allFccs,
    pearl
}: {
    primaryFcc: string;
    allFccs?: FccEntry[];
    pearl?: Pearl;
}) {
    const [showPopup, setShowPopup] = useState(false);

    // Count additional FCCs (excluding primary if it's in the list)
    const additionalCount = allFccs ? allFccs.length - 1 : 0;
    const hasMultiple = additionalCount > 0;

    // Group FCCs by key type category (Smart Key vs Remote Head Key)
    const groupedFccs = allFccs?.reduce((acc, entry) => {
        const category = entry.keyType.includes('Smart') ? 'Smart Keys' :
            entry.keyType.includes('Remote Head') ? 'Remote Head Keys' :
                entry.keyType.includes('Remote') ? 'Remote Keys' : 'Keys';
        if (!acc[category]) acc[category] = [];
        acc[category].push(entry);
        return acc;
    }, {} as Record<string, FccEntry[]>);

    return (
        <div className="relative bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                FCC ID
            </div>

            {/* Clickable FCC display - toggles tooltip popup */}
            <button
                onClick={() => hasMultiple && setShowPopup(!showPopup)}
                className={`font-semibold font-mono text-sm text-white flex items-center gap-2 ${hasMultiple ? 'cursor-pointer hover:text-blue-400 transition-colors' : 'cursor-default'}`}
            >
                📡 {primaryFcc}
                {hasMultiple && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans transition-all ${showPopup ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                        {showPopup ? '×' : `+${additionalCount}`}
                    </span>
                )}
            </button>

            {/* Pearl display */}
            {pearl && (
                <div className="mt-2 text-[11px] text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-800/30">
                    📶 {pearl.content}
                </div>
            )}

            {/* Tooltip popup ABOVE - conversation style */}
            {showPopup && (
                <>
                    {/* Click-away backdrop (transparent) */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowPopup(false)} />

                    {/* Tooltip panel - positioned ABOVE the element */}
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Arrow pointer */}
                        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-800/50">
                            <h4 className="font-bold text-white text-sm">All FCC IDs</h4>
                            <button onClick={() => setShowPopup(false)} className="text-zinc-400 hover:text-white text-lg leading-none">×</button>
                        </div>

                        {/* FCC list grouped by category */}
                        <div className="p-3 max-h-64 overflow-y-auto space-y-3">
                            {groupedFccs && Object.entries(groupedFccs).map(([category, fccs]) => (
                                <div key={category}>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        {category.includes('Smart') ? '📡' : category.includes('Remote Head') ? '🔑' : '📶'}
                                        {category}
                                    </div>
                                    <div className="space-y-1">
                                        {fccs.map((entry, idx) => (
                                            <div key={`${entry.fcc}-${idx}`} className="bg-zinc-800/60 p-2 rounded-lg">
                                                <div className="font-mono text-white text-sm">{entry.fcc}</div>
                                                <div className="text-[10px] text-zinc-400">{entry.keyType}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Chip Type display with tooltip popup ABOVE (conversation style)
function ChipTypeWithPopup({
    primaryChip,
    allChips,
    make,
    year,
    pearl
}: {
    primaryChip: string;
    allChips?: ChipEntry[];
    make?: string;
    year?: number;
    pearl?: Pearl;
}) {
    const [showPopup, setShowPopup] = useState(false);

    // Count additional chips (excluding duplicates)
    const uniqueChips = allChips ? [...new Set(allChips.map(c => c.chip))] : [primaryChip];
    const additionalCount = uniqueChips.length - 1;
    const hasMultiple = additionalCount > 0;

    // Group chips by key type category
    const groupedChips = allChips?.reduce((acc, entry) => {
        const category = entry.keyType.includes('Smart') ? 'Smart Keys' :
            entry.keyType.includes('Remote Head') ? 'Remote Head Keys' :
                entry.keyType.includes('Transponder') ? 'Transponder Keys' :
                    entry.keyType.includes('Remote') ? 'Remote Keys' : 'Keys';
        if (!acc[category]) acc[category] = [];
        // Only add if not already present
        if (!acc[category].some(c => c.chip === entry.chip)) {
            acc[category].push(entry);
        }
        return acc;
    }, {} as Record<string, ChipEntry[]>);

    return (
        <div className="relative bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Chip Type
            </div>

            {/* Clickable chip display - toggles tooltip popup */}
            <button
                onClick={() => hasMultiple && setShowPopup(!showPopup)}
                className={`font-semibold text-white flex items-center gap-2 text-left ${hasMultiple ? 'cursor-pointer hover:text-purple-400 transition-colors' : 'cursor-default'}`}
            >
                <GlossaryChipType chipType={primaryChip} make={make} year={year} />
                {hasMultiple && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans transition-all ${showPopup ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white'}`}>
                        {showPopup ? '×' : `+${additionalCount}`}
                    </span>
                )}
            </button>

            {/* Pearl display */}
            {pearl && (
                <div className="mt-2 text-[11px] text-purple-300 bg-purple-900/20 p-2 rounded border border-purple-800/30">
                    💡 {pearl.content}
                </div>
            )}

            {/* Tooltip popup ABOVE - conversation style */}
            {showPopup && (
                <>
                    {/* Click-away backdrop (transparent) */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowPopup(false)} />

                    {/* Tooltip panel - positioned ABOVE the element */}
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        {/* Arrow pointer */}
                        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-800/50">
                            <h4 className="font-bold text-white text-sm">All Chip Types</h4>
                            <button onClick={() => setShowPopup(false)} className="text-zinc-400 hover:text-white text-lg leading-none">×</button>
                        </div>

                        {/* Chip list grouped by category */}
                        <div className="p-3 max-h-64 overflow-y-auto space-y-3">
                            {groupedChips && Object.entries(groupedChips).map(([category, chips]) => (
                                <div key={category}>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        {category.includes('Smart') ? '📡' : category.includes('Remote Head') ? '🔑' : category.includes('Transponder') ? '🔒' : '📶'}
                                        {category}
                                    </div>
                                    <div className="space-y-1">
                                        {chips.map((entry, idx) => (
                                            <div key={`${entry.chip}-${idx}`} className="bg-zinc-800/60 p-2 rounded-lg">
                                                <div className="text-white text-sm">🔒 {entry.chip}</div>
                                                <div className="text-[10px] text-zinc-400">{entry.keyType}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
