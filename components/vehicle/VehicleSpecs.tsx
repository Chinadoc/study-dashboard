'use client';

import React, { useState } from 'react';
import GlossaryChipType from './GlossaryChipType';
import BittingCalculator from './BittingCalculator';

interface FccEntry {
    fcc: string;
    keyType: string;
    buttons: string | null;
    frequency: string | null;
}

// Map FCC prefixes to known manufacturers for disambiguation
function getFccManufacturer(fcc: string): string | null {
    const prefix = fcc.split('-')[0]?.toUpperCase();
    const mfgMap: Record<string, string> = {
        'M3N': 'Continental',
        'M3M': 'Mopar',
        'GQ4': 'Hyundai/Kia',
        'HYQ': 'Toyota/Hella',
        'KR5': 'Continental',
        'CWTWB': 'Continental',
        'OHT': 'UJA',
        'OUCG8D': 'Mitsubishi',
        'KR55WK': 'Continental',
        'NBGIDGNG1': 'Continental',
    };
    // Check exact prefix first, then partial matches
    if (mfgMap[prefix]) return mfgMap[prefix];
    for (const [key, val] of Object.entries(mfgMap)) {
        if (fcc.toUpperCase().startsWith(key)) return val;
    }
    return null;
}

// Normalize raw chip names to standard chip IDs
function normalizeChipDisplay(raw: string): { chipId: string; detail: string } | null {
    const lower = raw.toLowerCase();
    if (lower.includes('hitag aes') || (lower.includes('nxp') && lower.includes('aes') && lower.includes('128')))
        return { chipId: 'Hitag AES (4A)', detail: raw };
    if (lower.includes('pcf7939') || lower.includes('id49'))
        return { chipId: 'ID49', detail: raw };
    if (lower.includes('philips 46') || lower.includes('id46') || lower.includes('pcf7941') || lower.includes('pcf7936'))
        return { chipId: 'ID46', detail: raw };
    if (lower.includes('texas 4d') || lower.includes('id4d') || lower.includes('4d63') || lower.includes('4d60'))
        return { chipId: 'ID4D', detail: raw };
    if (lower.includes('texas 4c') || lower.includes('id4c'))
        return { chipId: 'ID4C', detail: raw };
    if (lower.includes('hitag 3') || lower.includes('hitag3') || lower.includes('id47') || lower.includes('pcf7953'))
        return { chipId: 'ID47', detail: raw };
    if (lower.includes('hitag 2') || lower.includes('hitag2') || lower.includes('pcf7945') || lower.includes('pcf7946'))
        return { chipId: 'ID46 (Hitag2)', detail: raw };
    if (lower.includes('megamos 48') || lower.includes('id48') || lower.includes('megamos crypto'))
        return { chipId: 'ID48', detail: raw };
    if (lower.includes('texas aes') || lower.includes('dsp+') || lower.includes('id8a') || lower.includes('8a'))
        return { chipId: 'ID8A', detail: raw };
    if (lower.includes('id13') || lower.includes('t5'))
        return { chipId: 'ID13 (T5)', detail: raw };
    if (lower.includes('id11') || lower.includes('id12'))
        return { chipId: 'ID11/12', detail: raw };
    return null;
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
        canFdRequired?: boolean;  // Deprecated: use adapterType
        adapterType?: string;     // 'None' | 'CAN FD' | 'FCA 12+8' | '30-Pin' | 'Gateway Bypass' | 'DoIP'
        chipType?: string;
        allChips?: ChipEntry[];
        fccId?: string;
        allFccs?: FccEntry[];
        frequency?: string;
        battery?: string;
        keyway?: string;
        transponderKey?: string;
        mechanicalKey?: string;
        lishi?: string;
        lishiSource?: string;
        spaces?: number;
        depths?: number | string;
        macs?: number;
        codeSeries?: string;
        mechanicalSource?: string | null;
        bittingSource?: string | null;
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
    const [showAdapterPearl, setShowAdapterPearl] = React.useState(false);

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

                {/* Adapter Type - show for 2016+ vehicles where adapters may be relevant */}
                {(specs.adapterType || specs.canFdRequired !== undefined) && year && year >= 2016 && (() => {
                    // Support both new adapterType and legacy canFdRequired
                    const adapterType = specs.adapterType || (specs.canFdRequired ? 'CAN FD' : 'None');
                    const needsAdapter = adapterType !== 'None';

                    // Color coding by adapter type
                    const colorClass = needsAdapter ? 'text-red-400' : 'text-green-400';
                    const bgClass = needsAdapter ? 'border-red-700/30' : 'border-zinc-700/50';

                    return (
                        <div className={`bg-zinc-800/60 p-4 rounded-xl border ${bgClass}`}>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                                Adapter
                            </div>
                            <div className={`font-semibold ${colorClass}`}>
                                {needsAdapter ? `🔌 ${adapterType}` : 'None Required'}
                                {pearls?.canFd?.[0] && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowAdapterPearl(!showAdapterPearl); }}
                                        className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full transition-all ${showAdapterPearl
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-amber-600/80 text-white hover:bg-amber-500'
                                            }`}
                                    >
                                        {showAdapterPearl ? '×' : '💡 Tip'}
                                    </button>
                                )}
                            </div>
                            {/* Centered modal popup for adapter pearl - matches Lishi Tool Tip style */}
                            {showAdapterPearl && pearls?.canFd?.[0] && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAdapterPearl(false)}>
                                    <div className="absolute inset-0 bg-black/60" />
                                    <div
                                        className="relative bg-zinc-900 border border-orange-700/50 rounded-xl p-4 max-w-lg shadow-2xl"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-bold text-orange-400 flex items-center gap-2">
                                                🔌 Adapter Tip: {adapterType}
                                            </h4>
                                            <button
                                                onClick={() => setShowAdapterPearl(false)}
                                                className="text-zinc-400 hover:text-white text-xl leading-none"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="text-orange-200 text-sm leading-relaxed">
                                            {pearls.canFd[0].content}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

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
                    <LishiToolWithPearl
                        lishi={specs.lishi}
                        lishiSource={specs.lishiSource}
                        pearl={pearls?.lishi?.[0]}
                    />
                )}

                {/* Keyway */}
                {specs.keyway && (
                    <SpecItem
                        label="Keyway"
                        value={specs.keyway}
                    />
                )}

                {/* Transponder Key */}
                {specs.transponderKey && specs.transponderKey !== 'N/A' && (
                    <SpecItem
                        label="Transponder Key"
                        value={specs.transponderKey}
                        icon="🔑"
                    />
                )}

                {/* Mechanical Key */}
                {specs.mechanicalKey && specs.mechanicalKey !== 'N/A' && (
                    <SpecItem
                        label="Mechanical Key"
                        value={specs.mechanicalKey}
                        icon="🗝️"
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
                        {(specs.mechanicalSource === 'vehicles' || specs.bittingSource === 'inferred') && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700/30">
                                {specs.bittingSource === 'inferred' ? '⚠️ Inferred (not from AKS scrape)' : '⚠️ May be inaccurate'}
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
                            <CodeSeriesWithCalculator
                                codeSeries={specs.codeSeries}
                                spaces={specs.spaces}
                                depths={specs.depths}
                                macs={specs.macs}
                                keyway={specs.keyway}
                                lishi={specs.lishi}
                            />
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

// Lishi Tool with expandable pearl (avoids cramped layout in grid)
function LishiToolWithPearl({
    lishi,
    lishiSource,
    pearl
}: {
    lishi: string;
    lishiSource?: string;
    pearl?: Pearl;
}) {
    const [showPearl, setShowPearl] = useState(false);

    return (
        <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                Lishi Tool
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-green-400">{lishi}</span>
                {pearl && (
                    <button
                        onClick={() => setShowPearl(!showPearl)}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full transition-all ${showPearl
                            ? 'bg-amber-500 text-black'
                            : 'bg-amber-600/80 text-white hover:bg-amber-500'
                            }`}
                    >
                        {showPearl ? '×' : '💡 Tip'}
                    </button>
                )}
            </div>
            {/* Source badge removed — VYP/enrichments are internal provenance labels, not useful to locksmiths */}
            {/* Expandable pearl - positioned as overlay to avoid cramped grid */}
            {showPearl && pearl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPearl(false)}>
                    <div className="absolute inset-0 bg-black/60" />
                    <div
                        className="relative bg-zinc-900 border border-amber-700/50 rounded-xl p-4 max-w-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-amber-400 flex items-center gap-2">
                                🔑 Lishi Tool Tip: {lishi}
                            </h4>
                            <button
                                onClick={() => setShowPearl(false)}
                                className="text-zinc-400 hover:text-white text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-amber-200 text-sm leading-relaxed">
                            {pearl.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
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

// Code Series with Calculator button
function CodeSeriesWithCalculator({
    codeSeries,
    spaces,
    depths,
    macs,
    keyway,
    lishi
}: {
    codeSeries: string;
    spaces?: number;
    depths?: number | string;
    macs?: number;
    keyway?: string;
    lishi?: string;
}) {
    const [showCalculator, setShowCalculator] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowCalculator(true)}
                className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded-lg w-full hover:bg-purple-900/30 hover:border-purple-500/50 border border-transparent transition-all group cursor-pointer"
            >
                <span className="text-xs text-zinc-400 group-hover:text-purple-300">Code Series</span>
                <span className="font-mono font-bold text-white flex items-center gap-2">
                    {codeSeries}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        🧮
                    </span>
                </span>
            </button>

            <BittingCalculator
                isOpen={showCalculator}
                onClose={() => setShowCalculator(false)}
                codeSeries={codeSeries}
                spaces={spaces}
                depths={depths}
                macs={macs}
                keyway={keyway}
                lishi={lishi}
            />
        </>
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
    const [showPearl, setShowPearl] = useState(false);

    // Parse primaryFcc - it may contain multiple FCC IDs separated by commas/spaces
    const parsedFccs = primaryFcc.split(/[,\s]+/).filter(Boolean).map(f => f.trim());
    const displayFcc = parsedFccs[0] || primaryFcc;  // Show first FCC ID

    // Count additional FCCs from both parsed primary and allFccs array
    const allFccCount = Math.max(parsedFccs.length, allFccs?.length || 0);
    const additionalCount = allFccCount - 1;
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
                📡 {displayFcc}
                {hasMultiple && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans transition-all ${showPopup ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}
                        title={`${allFccCount} FCC IDs for this vehicle`}
                    >
                        {showPopup ? '×' : `${allFccCount} FCCs`}
                    </span>
                )}
            </button>

            {/* Pearl toggle button */}
            {pearl && (
                <button
                    onClick={() => setShowPearl(!showPearl)}
                    className={`mt-2 text-[10px] px-1.5 py-0.5 rounded-full transition-all ${showPearl
                        ? 'bg-blue-500 text-black'
                        : 'bg-blue-600/80 text-white hover:bg-blue-500'
                        }`}
                >
                    {showPearl ? '×' : '💡 Tip'}
                </button>
            )}

            {/* Centered modal popup for FCC ID pearl - matches Lishi Tool Tip style */}
            {showPearl && pearl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPearl(false)}>
                    <div className="absolute inset-0 bg-black/60" />
                    <div
                        className="relative bg-zinc-900 border border-blue-700/50 rounded-xl p-4 max-w-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-blue-400 flex items-center gap-2">
                                📡 FCC ID Tip: {displayFcc}
                            </h4>
                            <button
                                onClick={() => setShowPearl(false)}
                                className="text-zinc-400 hover:text-white text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-blue-200 text-sm leading-relaxed">
                            {pearl.content}
                        </div>
                    </div>
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
                                        {fccs.map((entry, idx) => {
                                            const mfg = getFccManufacturer(entry.fcc);
                                            return (
                                                <div key={`${entry.fcc}-${idx}`} className="bg-zinc-800/60 p-2 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-white text-sm">{entry.fcc}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            {entry.buttons && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300">{entry.buttons}-Btn</span>
                                                            )}
                                                            {entry.frequency && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-900/40 rounded text-emerald-400">{entry.frequency}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-zinc-400">{entry.keyType}</span>
                                                        {mfg && <span className="text-[9px] text-zinc-500 italic">({mfg})</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
    const [showVatsDetails, setShowVatsDetails] = useState(false);
    const [showPearl, setShowPearl] = useState(false);

    // Detect VATS (Vehicle Anti-Theft System) - uses resistor pellets, not transponder chips
    // VATS chip fields often contain resistor value tables which stretch the layout
    const isVATS = primaryChip.toLowerCase().includes('vats') ||
        primaryChip.toLowerCase().includes('resistor') ||
        primaryChip.toLowerCase().includes('resister') ||  // common typo
        (primaryChip.includes('Ohms') && primaryChip.includes('Value'));

    // Extract VATS resistor values if present (for expandable display)
    const vatsValues = isVATS ? primaryChip : null;

    // For VATS systems, display a clean label with expandable details
    if (isVATS) {
        return (
            <div className="relative bg-zinc-800/60 p-4 rounded-xl border border-amber-700/50">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                    Immobilizer Type
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-amber-400">🔐 VATS (Resistor)</span>
                    <button
                        onClick={() => setShowVatsDetails(!showVatsDetails)}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-600 text-white hover:bg-amber-500 transition-all"
                    >
                        {showVatsDetails ? '×' : 'Values ▶'}
                    </button>
                </div>
                {showVatsDetails && vatsValues && (
                    <div className="mt-2 p-2 bg-amber-900/20 border border-amber-800/30 rounded text-xs text-amber-200 max-h-32 overflow-y-auto">
                        <div className="font-bold mb-1">Resistor Values (Ohms):</div>
                        <div className="font-mono text-[10px] whitespace-pre-wrap">
                            {vatsValues.replace(/Resister Values?/i, '').replace(/\(see below\)/i, '').trim()}
                        </div>
                    </div>
                )}
                {pearl && (
                    <button
                        onClick={() => setShowPearl(!showPearl)}
                        className={`mt-2 text-[10px] px-1.5 py-0.5 rounded-full transition-all ${showPearl
                            ? 'bg-amber-500 text-black'
                            : 'bg-amber-600/80 text-white hover:bg-amber-500'
                            }`}
                    >
                        {showPearl ? '×' : '💡 Tip'}
                    </button>
                )}
                {showPearl && pearl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPearl(false)}>
                        <div className="absolute inset-0 bg-black/60" />
                        <div
                            className="relative bg-zinc-900 border border-amber-700/50 rounded-xl p-4 max-w-lg shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-amber-400 flex items-center gap-2">
                                    🔐 VATS Chip Tip
                                </h4>
                                <button
                                    onClick={() => setShowPearl(false)}
                                    className="text-zinc-400 hover:text-white text-xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="text-amber-200 text-sm leading-relaxed">
                                {pearl.content}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

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

    const normalizedChip = normalizeChipDisplay(primaryChip);

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
                <div className="flex flex-col">
                    {normalizedChip ? (
                        <>
                            <span className="text-white font-bold">🔐 {normalizedChip.chipId}</span>
                            <span className="text-[10px] text-zinc-500 font-normal">{normalizedChip.detail}</span>
                        </>
                    ) : (
                        <GlossaryChipType chipType={primaryChip} make={make} year={year} />
                    )}
                </div>
                {hasMultiple && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans transition-all ${showPopup ? 'bg-purple-500 text-white' : 'bg-purple-600 text-white'}`}
                        title={`${uniqueChips.length} chip types for this vehicle`}
                    >
                        {showPopup ? '×' : `${uniqueChips.length} chips`}
                    </span>
                )}
            </button>

            {/* Pearl toggle button */}
            {pearl && (
                <button
                    onClick={() => setShowPearl(!showPearl)}
                    className={`mt-2 text-[10px] px-1.5 py-0.5 rounded-full transition-all ${showPearl
                        ? 'bg-purple-500 text-black'
                        : 'bg-purple-600/80 text-white hover:bg-purple-500'
                        }`}
                >
                    {showPearl ? '×' : '💡 Tip'}
                </button>
            )}

            {/* Centered modal popup for Chip Type pearl - matches Lishi Tool Tip style */}
            {showPearl && pearl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPearl(false)}>
                    <div className="absolute inset-0 bg-black/60" />
                    <div
                        className="relative bg-zinc-900 border border-purple-700/50 rounded-xl p-4 max-w-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-purple-400 flex items-center gap-2">
                                🔒 Chip Type Tip: {primaryChip}
                            </h4>
                            <button
                                onClick={() => setShowPearl(false)}
                                className="text-zinc-400 hover:text-white text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-purple-200 text-sm leading-relaxed">
                            {pearl.content}
                        </div>
                    </div>
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
