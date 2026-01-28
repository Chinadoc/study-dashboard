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

// FCC ID display with popup for multiple FCCs
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

            {/* Clickable FCC display */}
            <button
                onClick={() => hasMultiple && setShowPopup(!showPopup)}
                className={`font-semibold font-mono text-sm text-white flex items-center gap-2 ${hasMultiple ? 'cursor-pointer hover:text-blue-400 transition-colors' : 'cursor-default'}`}
            >
                📡 {primaryFcc}
                {hasMultiple && (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-sans">
                        +{additionalCount}
                    </span>
                )}
            </button>

            {/* Pearl display */}
            {pearl && (
                <div className="mt-2 text-[11px] text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-800/30">
                    📶 {pearl.content}
                </div>
            )}

            {/* Popup overlay - mobile friendly */}
            {showPopup && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        onClick={() => setShowPopup(false)}
                    />

                    {/* Bottom Sheet for mobile, dropdown for desktop */}
                    <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:min-w-[320px] bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-xl shadow-2xl z-50 max-h-[70vh] sm:max-h-[60vh] overflow-hidden animate-slide-up sm:animate-none">
                        {/* Drag handle for mobile */}
                        <div className="sm:hidden flex justify-center py-2">
                            <div className="w-10 h-1 bg-zinc-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                            <h4 className="font-bold text-white text-lg">All FCC IDs</h4>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="text-zinc-400 hover:text-white text-2xl leading-none p-1"
                            >
                                ×
                            </button>
                        </div>

                        {/* FCC list grouped by category - scrollable */}
                        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(70vh-80px)] sm:max-h-[calc(60vh-60px)]">
                            {groupedFccs && Object.entries(groupedFccs).map(([category, fccs]) => (
                                <div key={category}>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        {category.includes('Smart') ? '📡' : category.includes('Remote Head') ? '🔑' : '📶'}
                                        {category}
                                    </div>
                                    <div className="space-y-2">
                                        {fccs.map((entry, idx) => (
                                            <div
                                                key={`${entry.fcc}-${idx}`}
                                                className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50"
                                            >
                                                <div className="font-mono font-bold text-white text-sm">
                                                    {entry.fcc}
                                                </div>
                                                <div className="text-[11px] text-zinc-400 mt-1">
                                                    {entry.keyType}
                                                </div>
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

// Chip Type display with popup for multiple chips
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

            {/* Clickable chip display */}
            <button
                onClick={() => hasMultiple && setShowPopup(!showPopup)}
                className={`font-semibold text-white flex items-center gap-2 text-left ${hasMultiple ? 'cursor-pointer hover:text-purple-400 transition-colors' : 'cursor-default'}`}
            >
                <GlossaryChipType chipType={primaryChip} make={make} year={year} />
                {hasMultiple && (
                    <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-sans">
                        +{additionalCount}
                    </span>
                )}
            </button>

            {/* Pearl display */}
            {pearl && (
                <div className="mt-2 text-[11px] text-purple-300 bg-purple-900/20 p-2 rounded border border-purple-800/30">
                    💡 {pearl.content}
                </div>
            )}

            {/* Popup overlay - mobile friendly */}
            {showPopup && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                        onClick={() => setShowPopup(false)}
                    />

                    {/* Bottom Sheet for mobile, dropdown for desktop */}
                    <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-0 sm:right-auto sm:top-full sm:mt-2 sm:min-w-[320px] bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-xl shadow-2xl z-50 max-h-[70vh] sm:max-h-[60vh] overflow-hidden animate-slide-up sm:animate-none">
                        {/* Drag handle for mobile */}
                        <div className="sm:hidden flex justify-center py-2">
                            <div className="w-10 h-1 bg-zinc-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                            <h4 className="font-bold text-white text-lg">All Chip Types</h4>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="text-zinc-400 hover:text-white text-2xl leading-none p-1"
                            >
                                ×
                            </button>
                        </div>

                        {/* Chip list grouped by category - scrollable */}
                        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(70vh-80px)] sm:max-h-[calc(60vh-60px)]">
                            {groupedChips && Object.entries(groupedChips).map(([category, chips]) => (
                                <div key={category}>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        {category.includes('Smart') ? '📡' : category.includes('Remote Head') ? '🔑' : category.includes('Transponder') ? '🔒' : '📶'}
                                        {category}
                                    </div>
                                    <div className="space-y-2">
                                        {chips.map((entry, idx) => (
                                            <div
                                                key={`${entry.chip}-${idx}`}
                                                className="bg-zinc-800/60 p-3 rounded-lg border border-zinc-700/50"
                                            >
                                                <div className="font-semibold text-white text-sm">
                                                    🔒 {entry.chip}
                                                </div>
                                                <div className="text-[11px] text-zinc-400 mt-1">
                                                    {entry.keyType}
                                                </div>
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
