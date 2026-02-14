'use client';

import React, { useState } from 'react';
import { AFFILIATE_TAG } from '@/lib/config';
import { useInventory } from '@/contexts/InventoryContext';
import { useUnifiedData } from '@/lib/useUnifiedData';
import OwnedBadge from '@/components/shared/OwnedBadge';
import BladeKeysCard, { BladeKeysData } from '@/components/vehicle/BladeKeysCard';

/** Makes that use 433 MHz natively in North America (CDJR / Stellantis) */
const CDJR_433_MAKES = new Set(['chrysler', 'dodge', 'jeep', 'ram', 'fiat', 'alfa romeo']);

/** Map frequency string to regional market label.
 *  Pass `make` so CDJR 433 MHz is correctly labeled as N. America. */
function getFreqRegion(freq: string | null | undefined, make?: string): string {
    if (!freq) return '';
    const f = freq.toLowerCase();
    if (f.includes('315')) return '🇺🇸 N. America';
    if (f.includes('433') || f.includes('434')) {
        // CDJR / Stellantis vehicles use 433 MHz in North America
        if (make && CDJR_433_MAKES.has(make.toLowerCase())) return '🇺🇸 N. America';
        return '🇪🇺 Europe';
    }
    if (f.includes('868')) return '🇪🇺 Europe';
    if (f.includes('902')) return '🇺🇸 N. America';
    if (f.includes('314.3') || f.includes('314')) return '🇯🇵 Japan';
    return '';
}

interface FccDetail {
    fcc: string;
    oem: (string | { number: string; label?: string })[];
    title: string;
    frequency: string | null;
}

interface KeyVariant {
    label: string;
    buttons: string;
    fcc?: string;
    fccDetails?: FccDetail[];
    chip?: string;
    battery?: string;
    frequency?: string;
    keyway?: string;
    oem?: Array<{ number: string; label?: string }>;
    image?: string;
    priceRange?: string;
    hasRemoteStart?: boolean;
}

interface PushStartInfo {
    push_start_trims: string | null;
    non_push_start_trims: string | null;
    smart_key_fccs: string | null;
    rke_fccs: string | null;
    base_is_push_start: boolean;
    all_trims_push_start_from: number | string | null;
    notes: string | null;
}

interface KeyConfig {
    name: string;
    familyBadge?: string;
    fcc?: string;
    fccDetails?: FccDetail[];
    type?: 'prox' | 'blade' | 'flip' | 'remote' | 'transponder';
    buttons?: string;
    battery?: string;
    chip?: string;
    chipArchitecture?: string;
    frequency?: string;
    keyway?: string;
    partNumber?: string;
    priceRange?: string;
    oem?: Array<{ number: string; label?: string }>;
    image?: string;
    blade?: string;
    profile?: string;
    variants?: KeyVariant[];
    pushStartContext?: {
        isPushStart: boolean | null;  // true = push-start key, false = non-prox, null = unknown
        trims: string | null;        // Which trims this applies to
        note: string | null;         // Curated explanation (artifact, accessory, etc.)
        allPush: boolean;            // Vehicle is all push-start
    };
}

interface Pearl {
    id?: string;
    content: string;
    risk?: string;
    category?: string;
}

interface KeyCardsProps {
    keys: KeyConfig[];
    vehicleInfo?: { make: string; model: string; year: number };
    bladeKeys?: BladeKeysData | null;
    pushStartInfo?: PushStartInfo | null;
    bitting?: {
        spaces: string | null;
        depths: string | null;
        macs: string | null;
        lishi: string | null;
    };
    pearls?: {
        keyConfig?: Pearl[];  // 5-button vs 4-button inventory tips
        frequency?: Pearl[];  // Frequency mismatch warnings
        access?: Pearl[];     // Cylinder access pearls
    };
}

// Job History Banner - Shows if user has serviced similar vehicles before
function JobHistoryBanner({ vehicleInfo }: { vehicleInfo: { make: string; model: string; year: number } }) {
    const { canServiceVehicle, getJobHistory } = useUnifiedData();

    // Get coverage and history for this vehicle
    const vehicleStr = `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`;
    const jobs = getJobHistory(undefined, vehicleStr);
    const coverage = canServiceVehicle(vehicleInfo.make, vehicleInfo.model, vehicleInfo.year);

    // Don't show if no relevant data
    if (jobs.length === 0 && !coverage.canService) return null;

    return (
        <div className="mb-4 flex flex-wrap gap-2">
            {/* Job History Badge */}
            {jobs.length > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
                    <span>📝</span>
                    <span>You&apos;ve done {jobs.length} job{jobs.length > 1 ? 's' : ''} on similar vehicles</span>
                </div>
            )}

            {/* Can Service Badge */}
            {coverage.canService && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
                    <span>✅</span>
                    <span>You can service this ({coverage.ownedTools.map(t => t.ownedToolName || t.name).join(', ')})</span>
                </div>
            )}

            {/* Stock Status */}
            {coverage.hasStock && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium">
                    <span>📦</span>
                    <span>{coverage.keyStock} in stock</span>
                </div>
            )}
        </div>
    );
}

// Collapsible pearl tags for key configurations
function KeyConfigPearlTags({ pearls }: { pearls: KeyCardsProps['pearls'] }) {
    const [expanded, setExpanded] = React.useState<string | null>(null);

    if (!pearls) return null;

    const allPearls = [
        ...(pearls.frequency || []).map(p => ({ ...p, type: 'frequency', icon: '⚠️', label: 'Frequency', color: 'red' })),
        ...(pearls.keyConfig || []).map(p => ({ ...p, type: 'inventory', icon: '📦', label: 'Inventory', color: 'green' })),
        ...(pearls.access || []).map(p => ({ ...p, type: 'access', icon: '🚪', label: 'Access', color: 'blue' })),
    ];

    if (allPearls.length === 0) return null;

    return (
        <div className="mb-4">
            <div className="flex flex-wrap gap-2 items-center">
                {allPearls.map((pearl, i) => (
                    <button
                        key={i}
                        onClick={() => setExpanded(expanded === `${pearl.type}-${i}` ? null : `${pearl.type}-${i}`)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-full border transition-all flex items-center gap-1 ${pearl.color === 'red' ? 'bg-red-900/30 text-red-400 border-red-700/30 hover:bg-red-900/50' :
                            pearl.color === 'green' ? 'bg-green-900/30 text-green-400 border-green-700/30 hover:bg-green-900/50' :
                                'bg-blue-900/30 text-blue-400 border-blue-700/30 hover:bg-blue-900/50'
                            }`}
                    >
                        {pearl.icon} {pearl.label}
                        <span className="opacity-60">{expanded === `${pearl.type}-${i}` ? '▼' : '▶'}</span>
                    </button>
                ))}
            </div>

            {/* Expanded content */}
            {expanded && allPearls.map((pearl, i) => (
                expanded === `${pearl.type}-${i}` && (
                    <div
                        key={i}
                        className={`mt-2 p-3 rounded-lg border text-xs ${pearl.color === 'red' ? 'bg-red-900/10 border-red-800/30 text-red-200' :
                            pearl.color === 'green' ? 'bg-green-900/10 border-green-800/30 text-green-200' :
                                'bg-blue-900/10 border-blue-800/30 text-blue-200'
                            }`}
                    >
                        {pearl.content}
                    </div>
                )
            ))}
        </div>
    );
}

// Normalize FCC for comparison (strip whitespace, lowercase)
function normFcc(fcc: string): string {
    return fcc.trim().replace(/[\s-]/g, '').toLowerCase();
}

// Match a key's FCCs against a comma-separated FCC list
function fccMatchesAny(keyFcc: string | undefined, fccList: string | null): boolean {
    if (!keyFcc || !fccList) return false;
    const keyFccs = keyFcc.split(/[,\s]+/).filter(Boolean).map(normFcc);
    const listFccs = fccList.split(/[,\s]+/).filter(Boolean).map(normFcc);
    return keyFccs.some(kf => listFccs.some(lf => kf === lf || kf.includes(lf) || lf.includes(kf)));
}

export default function KeyCards({ keys, vehicleInfo, pearls, bladeKeys, bitting, pushStartInfo }: KeyCardsProps) {
    const hasBladeCard = bladeKeys && bladeKeys.entries && bladeKeys.entries.length > 0;

    // Enrich keys with push-start context by matching FCCs
    const enrichedKeys = pushStartInfo ? keys.map(key => {
        const isSmartMatch = fccMatchesAny(key.fcc, pushStartInfo.smart_key_fccs);
        const isRkeMatch = fccMatchesAny(key.fcc, pushStartInfo.rke_fccs);
        const allPush = pushStartInfo.push_start_trims === 'All' ||
            (pushStartInfo.non_push_start_trims === 'None' && !!pushStartInfo.push_start_trims);

        // Also check by key type: 'prox' → push-start, 'remote'/'flip'/'transponder' → non-prox
        const typeHint = key.type === 'prox' ? 'smart' : (key.type === 'remote' || key.type === 'flip') ? 'rke' : null;

        let isPushStart: boolean | null = null;
        let trims: string | null = null;
        let note: string | null = null;

        if (isSmartMatch || (typeHint === 'smart' && !isRkeMatch)) {
            isPushStart = true;
            trims = pushStartInfo.push_start_trims;
        } else if (isRkeMatch || (typeHint === 'rke' && !isSmartMatch)) {
            isPushStart = false;
            trims = pushStartInfo.non_push_start_trims;
            note = allPush ? pushStartInfo.notes : null;  // Only show artifact note on all-push vehicles
        }

        return {
            ...key,
            pushStartContext: {
                isPushStart,
                trims,
                note,
                allPush,
            }
        };
    }) : keys;

    if ((!keys || keys.length === 0) && !hasBladeCard) {
        return (
            <div className="glass p-8 text-center text-zinc-500 mb-8">
                <div className="text-4xl mb-2">🔑</div>
                <p>No key configurations available for this vehicle.</p>
            </div>
        );
    }

    // Determine layout mode based on key count (include blade card in total)
    const keyCount = keys.length + (hasBladeCard ? 1 : 0);
    const useScrollLayout = keyCount > 4;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔐</span> Key Configurations
                {keyCount > 0 && (
                    <span className="text-sm font-normal text-zinc-500 ml-2">({keyCount} type{keyCount !== 1 ? 's' : ''})</span>
                )}
            </h2>

            {/* Quick Summary Bar — chips & FCCs at a glance */}
            {keys.length > 0 && (() => {
                // Collect unique chip architectures with their key types for context
                const chipArchMap = new Map<string, Set<string>>();
                const allFccs = new Set<string>();
                for (const k of enrichedKeys) {
                    if (k.chipArchitecture) {
                        if (!chipArchMap.has(k.chipArchitecture)) chipArchMap.set(k.chipArchitecture, new Set());
                        chipArchMap.get(k.chipArchitecture)!.add(k.name || k.type || '');
                    }
                    if (k.fcc) {
                        for (const f of k.fcc.split(',')) {
                            const trimmed = f.trim();
                            if (trimmed) allFccs.add(trimmed);
                        }
                    }
                }
                if (chipArchMap.size === 0 && allFccs.size === 0) return null;
                return (
                    <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-zinc-800/60">
                        {chipArchMap.size > 0 && (
                            <>
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Chips</span>
                                {Array.from(chipArchMap.entries()).map(([arch, keyNames]) => (
                                    <span
                                        key={arch}
                                        title={`Used by: ${Array.from(keyNames).join(', ')}`}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${arch === 'AES' ? 'bg-green-900/30 text-green-400 border-green-700/30'
                                            : arch.includes('HITAG') ? 'bg-teal-900/30 text-teal-400 border-teal-700/30'
                                                : 'bg-amber-900/30 text-amber-400 border-amber-700/30'
                                            }`}
                                    >
                                        {arch}
                                    </span>
                                ))}
                            </>
                        )}
                        {allFccs.size > 0 && (
                            <>
                                <span className="text-zinc-700 mx-1">|</span>
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">FCCs</span>
                                {Array.from(allFccs).slice(0, 5).map(fcc => (
                                    <span
                                        key={fcc}
                                        className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800/50 text-zinc-400 border border-zinc-700/30"
                                    >
                                        {fcc}
                                    </span>
                                ))}
                                {allFccs.size > 5 && (
                                    <span className="text-[10px] text-zinc-500">+{allFccs.size - 5}</span>
                                )}
                            </>
                        )}
                    </div>
                );
            })()}

            {/* Contextual Insight Tags - Compact and collapsible */}
            {(pearls?.keyConfig?.length ?? 0) > 0 || (pearls?.frequency?.length ?? 0) > 0 || (pearls?.access?.length ?? 0) > 0 ? (
                <KeyConfigPearlTags pearls={pearls} />
            ) : null}

            {/* Job History Banner - from Unified Data */}
            {vehicleInfo && <JobHistoryBanner vehicleInfo={vehicleInfo} />}

            {/* Responsive layout: fill space for 2-4 keys, horizontal scroll for 5+ */}
            {useScrollLayout ? (
                /* Horizontal scroll layout for 5+ keys */
                <div className="relative">
                    {/* Scroll container */}
                    <div
                        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-zinc-800"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        {enrichedKeys.map((key, index) => (
                            <div
                                key={`key-scroll-${index}-${key.name}`}
                                className="flex-shrink-0 snap-start"
                                style={{ width: 'calc(25% - 12px)', minWidth: '220px' }}
                            >
                                <KeyCard config={key} vehicleInfo={vehicleInfo} />
                            </div>
                        ))}
                        {hasBladeCard && (
                            <div
                                className="flex-shrink-0 snap-start"
                                style={{ width: 'calc(25% - 12px)', minWidth: '220px' }}
                            >
                                <BladeKeysCard data={bladeKeys!} bitting={bitting} />
                            </div>
                        )}
                    </div>
                    {/* Fade indicator on right edge */}
                    <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-zinc-900 to-transparent pointer-events-none" />
                </div>
            ) : (
                /* Responsive grid layout for 2-4 keys */
                <div
                    className={`grid gap-4 min-h-[320px] ${keyCount === 1 ? 'grid-cols-1'
                        : keyCount === 2 ? 'grid-cols-1 sm:grid-cols-2'
                            : keyCount === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                        }`}
                >
                    {enrichedKeys.map((key, index) => (
                        <KeyCard key={`key-grid-${index}-${key.name}`} config={key} vehicleInfo={vehicleInfo} />
                    ))}
                    {hasBladeCard && (
                        <BladeKeysCard data={bladeKeys!} bitting={bitting} />
                    )}
                </div>
            )}
        </div>
    );
}

function KeyCard({ config, vehicleInfo }: { config: KeyConfig; vehicleInfo?: { make: string; model: string; year: number } }) {
    const [added, setAdded] = useState(false);
    const [showOemSelector, setShowOemSelector] = useState(false);
    const [showFccDetails, setShowFccDetails] = useState(false);
    const [oemExpanded, setOemExpanded] = useState<string>('');
    const [activeVariant, setActiveVariant] = useState(0);
    const { addToInventory: contextAddToInventory } = useInventory();

    // If variants exist, merge active variant's data over config
    const variant = config.variants?.[activeVariant];
    const effective = variant ? {
        ...config,
        buttons: variant.buttons,
        fcc: variant.fcc,
        fccDetails: variant.fccDetails || config.fccDetails,
        chip: variant.chip,
        battery: variant.battery,
        frequency: variant.frequency,
        keyway: variant.keyway,
        oem: variant.oem,
        image: variant.image,
        priceRange: variant.priceRange,
    } : config;

    const vehicleStr = vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : undefined;

    // Handle adding a specific OEM to inventory
    const handleAddOem = (oemNumber: string) => {
        contextAddToInventory(oemNumber, vehicleStr, 1, {
            fcc_id: config.fcc,
            oem_number: oemNumber,
            related_oems: config.oem?.map(o => o.number).join(','),
            related_fccs: config.fcc || ''
        });
        setAdded(true);
        setShowOemSelector(false);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleAddToInventory = () => {
        const oems = config.oem || [];

        if (oems.length === 0) {
            // No OEM data - fall back to FCC as primary key
            const itemKey = config.fcc || config.name || 'Unknown Key';
            contextAddToInventory(itemKey, vehicleStr, 1, {
                fcc_id: config.fcc
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } else if (oems.length === 1) {
            // Single OEM - use directly
            handleAddOem(oems[0].number);
        } else {
            // Multiple OEMs - show selection modal
            setShowOemSelector(true);
        }
    };

    const typeColors: Record<string, string> = {
        prox: 'bg-purple-900/40 text-purple-300 border-purple-700/30',
        blade: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
        flip: 'bg-green-900/40 text-green-300 border-green-700/30',
        remote: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/30',
        transponder: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/30',
    };

    const typeLabel = config.type || 'prox';

    // Construct Amazon Search URL
    // Search query: FCC ID + Name (e.g., "M3N-A2C31243800 4-Button Smart Key")
    const searchQuery = `${effective.fcc || ''} ${effective.buttons ? `${effective.buttons}-Button ` : ''}${config.name || ''}`.trim();
    const amazonUrl = effective.fcc
        ? `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AFFILIATE_TAG}`
        : '#';

    const CardWrapper = effective.fcc ? 'a' : 'div';
    const wrapperProps = effective.fcc ? {
        href: amazonUrl,
        target: '_blank',
        rel: 'noopener noreferrer'
    } : {};

    return (
        <CardWrapper
            {...wrapperProps}
            className="glass p-5 hover:border-purple-500/50 transition-all group block relative"
        >
            {/* Header with Key Type Badge */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    {/* Family name as title */}
                    <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors">
                        {config.name || 'Key'}
                    </h3>
                    {/* Chip differentiator subtitle — shows why multiple cards of same type exist */}
                    {config.chipArchitecture && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                            <span className={`font-bold ${config.chipArchitecture === 'AES' ? 'text-green-400'
                                : config.chipArchitecture.includes('HITAG') ? 'text-teal-400'
                                    : 'text-amber-400'
                                }`}>{config.chipArchitecture}</span>
                            {config.chip && !config.chip.toLowerCase().includes(config.chipArchitecture.toLowerCase()) && (
                                <span className="text-zinc-500 ml-1">· {config.chip}</span>
                            )}
                        </p>
                    )}
                </div>
                {/* Badges container */}
                <div className="flex flex-col items-end gap-1">
                    {/* Key Type Badge */}
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border whitespace-nowrap ${typeColors[typeLabel] || typeColors.prox}`}>
                        {config.familyBadge || typeLabel.toUpperCase()}
                    </span>
                    {/* Push-Start Context Badge */}
                    {config.pushStartContext?.isPushStart === true && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border whitespace-nowrap bg-emerald-900/40 text-emerald-300 border-emerald-700/30"
                            title={config.pushStartContext.trims === 'All' ? 'Push-button start standard on all trims' : `Push-start trims: ${config.pushStartContext.trims}`}
                        >
                            ✓ PUSH-START
                        </span>
                    )}
                    {config.pushStartContext?.isPushStart === false && (
                        <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border whitespace-nowrap ${config.pushStartContext.allPush
                                ? 'bg-amber-900/40 text-amber-300 border-amber-700/30'  // Artifact on all-push vehicle
                                : 'bg-red-900/40 text-red-300 border-red-700/30'        // Genuine non-push key
                                }`}
                            title={config.pushStartContext.note || (config.pushStartContext.trims ? `Non-push trims: ${config.pushStartContext.trims}` : 'Standard key / non-push-start')}
                        >
                            {config.pushStartContext.allPush ? '⚠ DATA ARTIFACT' : '🔑 KEY START'}
                        </span>
                    )}
                    {/* Owned Badge - shows stock count or Add button */}
                    <OwnedBadge
                        fcc={effective.fcc}
                        compact
                        vehicleInfo={vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : undefined}
                    />
                </div>
            </div>

            {/* Variant Tabs — button count selector */}
            {config.variants && config.variants.length > 1 && (
                <div className="flex gap-1 mb-3">
                    {config.variants.map((v, i) => (
                        <button
                            key={v.label}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveVariant(i); }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${i === activeVariant
                                ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                                : 'bg-zinc-800/40 border-zinc-700/40 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                                }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Large Key Image - Hero Style */}
            <div className="w-full h-28 rounded-lg bg-zinc-800/50 flex items-center justify-center overflow-hidden mb-3">
                {effective.image ? (
                    <img
                        src={effective.image}
                        alt={config.name}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <span className="text-4xl opacity-30">🔑</span>
                )}
            </div>

            {/* Push-Start Context Note (visible inline, not just tooltip) */}
            {config.pushStartContext?.isPushStart === false && config.pushStartContext.note && (
                <div className="mb-3 px-2.5 py-2 rounded-lg bg-amber-900/20 border border-amber-800/30">
                    <p className="text-[10px] text-amber-300/80 leading-tight line-clamp-3">
                        <span className="font-bold">⚠ Not a primary vehicle key.</span>{' '}
                        {config.pushStartContext.note.length > 120
                            ? config.pushStartContext.note.substring(0, 120) + '…'
                            : config.pushStartContext.note}
                    </p>
                </div>
            )}
            {config.pushStartContext?.isPushStart === false && !config.pushStartContext.allPush && config.pushStartContext.trims && (
                <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-red-900/20 border border-red-800/30">
                    <p className="text-[10px] text-red-300/80 leading-tight">
                        <span className="font-bold">🔑 Key-start trims:</span>{' '}
                        {config.pushStartContext.trims}
                    </p>
                </div>
            )}

            {/* Prominent FCC ID — expandable to show per-FCC details */}
            {effective.fcc && (() => {
                const fccIds = [...new Set(effective.fcc.split(/[\s,]+/).filter(Boolean).filter(
                    t => /^[A-Z0-9]+-?[A-Z0-9]+$/i.test(t) && t.length >= 5
                ))];
                const hasDetails = effective.fccDetails && effective.fccDetails.length > 0;
                return (
                    <div className="mb-3">
                        <div className="text-center py-2 bg-zinc-800/70 rounded-lg">
                            <span className="text-[10px] text-zinc-500 block">FCC ID</span>
                            <span className="font-mono text-yellow-500 font-bold text-lg">{fccIds[0]}</span>
                            {fccIds.length > 1 && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowFccDetails(!showFccDetails); }}
                                    className="text-yellow-400/60 text-sm ml-1 hover:text-yellow-300 transition-colors"
                                    title={`${fccIds.length} FCC IDs for this key type`}
                                >
                                    {fccIds.length} FCCs {showFccDetails ? '▼' : '▶'}
                                </button>
                            )}
                        </div>
                        {/* Expanded FCC details */}
                        {showFccDetails && (
                            <div className="mt-1 space-y-1">
                                {hasDetails ? (
                                    // Rich FCC details with OEM parts
                                    effective.fccDetails!.map((detail, i) => (
                                        <div key={i} className="px-2 py-1.5 bg-zinc-800/40 rounded border border-zinc-700/30 text-[10px]">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-yellow-400 font-bold">{detail.fcc}</span>
                                                {detail.frequency && (
                                                    <span className="text-emerald-400 font-medium">
                                                        {detail.frequency}
                                                        {getFreqRegion(detail.frequency, vehicleInfo?.make) && (
                                                            <span className="text-zinc-500 ml-1 font-normal">({getFreqRegion(detail.frequency, vehicleInfo?.make)})</span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {detail.title && (
                                                <div className="text-zinc-500 truncate mt-0.5">{detail.title}</div>
                                            )}
                                            {detail.oem.length > 0 && (
                                                <div className="flex flex-wrap gap-0.5 mt-1">
                                                    {detail.oem.slice(0, 3).map((oem, j) => (
                                                        <span key={j} className="px-1 py-0.5 bg-zinc-700/50 rounded text-zinc-400 font-mono" title={detail.title}>{typeof oem === 'string' ? oem : oem.number}</span>
                                                    ))}
                                                    {detail.oem.length > 3 && <span className="text-zinc-600 px-1">+{detail.oem.length - 3}</span>}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    // Fallback: show raw FCC IDs when fccDetails is not populated
                                    fccIds.map((fcc, i) => (
                                        <div key={i} className="px-2 py-1.5 bg-zinc-800/40 rounded border border-zinc-700/30 text-[10px]">
                                            <span className="font-mono text-yellow-400 font-bold">{fcc}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Specs Grid */}
            <div className="space-y-1 mb-3">
                {effective.frequency && (
                    <div className="text-xs">
                        <span className="text-zinc-500">Freq: </span>
                        <span className="text-emerald-400 font-medium">{effective.frequency}</span>
                        {getFreqRegion(effective.frequency, vehicleInfo?.make) && (
                            <span className="text-zinc-500 ml-1">({getFreqRegion(effective.frequency, vehicleInfo?.make)})</span>
                        )}
                    </div>
                )}
                {effective.chip && (() => {
                    // Detect VATS (resistor values) and display abbreviated
                    const chipLower = effective.chip.toLowerCase();
                    const isVATS = chipLower.includes('vats') || chipLower.includes('resistor') ||
                        chipLower.includes('resister') || chipLower.includes('ohms');

                    // Normalize chip names to standard IDs
                    const normalizeChip = (raw: string): { id: string; detail: string } | null => {
                        const l = raw.toLowerCase();
                        if (l.includes('hitag aes') || (l.includes('nxp') && l.includes('aes')))
                            return { id: 'Hitag AES (4A)', detail: raw };
                        if (l.includes('pcf7939') || l.includes('id49'))
                            return { id: 'ID49', detail: raw };
                        if (l.includes('philips 46') || l.includes('id46') || l.includes('pcf7941') || l.includes('pcf7936'))
                            return { id: 'ID46', detail: raw };
                        if (l.includes('texas 4d') || l.includes('id4d') || l.includes('4d63') || l.includes('4d60'))
                            return { id: 'ID4D', detail: raw };
                        if (l.includes('hitag 3') || l.includes('hitag3') || l.includes('id47') || l.includes('pcf7953'))
                            return { id: 'ID47', detail: raw };
                        if (l.includes('hitag 2') || l.includes('hitag2') || l.includes('pcf7945') || l.includes('pcf7946'))
                            return { id: 'ID46 (Hitag2)', detail: raw };
                        if (l.includes('megamos 48') || l.includes('id48') || l.includes('megamos crypto'))
                            return { id: 'ID48', detail: raw };
                        if (l.includes('texas aes') || l.includes('dsp+') || l.includes('id8a'))
                            return { id: 'ID8A', detail: raw };
                        return null;
                    };
                    const normalized = !isVATS ? normalizeChip(effective.chip) : null;

                    return (
                        <div className="text-xs">
                            <span className="text-zinc-500">Chip: </span>
                            {isVATS ? (
                                <span className="text-amber-400">VATS (Resistor)</span>
                            ) : normalized ? (
                                <span className="text-white">
                                    <span className="font-bold">{normalized.id}</span>
                                    <span className="text-zinc-500 text-[10px] ml-1">({normalized.detail})</span>
                                </span>
                            ) : (
                                <span className="text-white">{effective.chip}</span>
                            )}
                            {/* Chip Architecture Badge */}
                            {(config as any).chipArchitecture && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${(config as any).chipArchitecture === 'AES' ? 'bg-green-900/40 text-green-400 border border-green-700/30'
                                    : (config as any).chipArchitecture === 'HITAG 128-BIT' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/30'
                                        : (config as any).chipArchitecture === 'HITAG-PRO' ? 'bg-teal-900/40 text-teal-400 border border-teal-700/30'
                                            : 'bg-amber-900/40 text-amber-400 border border-amber-700/30'
                                    }`}>
                                    {(config as any).chipArchitecture}
                                </span>
                            )}
                        </div>
                    );
                })()}


            </div>

            {/* Collapsible OEM Parts - show first 3, click +N to expand */}
            {effective.oem && effective.oem.length > 0 && (
                <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                        {(oemExpanded === effective.fcc ? effective.oem : effective.oem.slice(0, 3)).map((part, i) => {
                            const displayNum = part.number.length > 20 ? part.number.slice(0, 18) + '…' : part.number;
                            return (
                                <span
                                    key={i}
                                    className="relative group/oem px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-400 cursor-help"
                                >
                                    {displayNum}
                                    {part.label && (
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-zinc-700 text-zinc-200 text-[9px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover/oem:opacity-100 transition-opacity pointer-events-none z-50 max-w-[200px] truncate">
                                            {part.label}
                                        </span>
                                    )}
                                </span>
                            );
                        })}
                        {effective.oem.length > 3 && oemExpanded !== effective.fcc && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOemExpanded(effective.fcc || ''); }}
                                className="px-1.5 py-0.5 text-[10px] text-amber-500 font-bold hover:text-amber-300 transition-colors cursor-pointer"
                            >
                                +{effective.oem.length - 3}
                            </button>
                        )}
                        {effective.oem.length > 3 && oemExpanded === effective.fcc && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOemExpanded(''); }}
                                className="px-1.5 py-0.5 text-[10px] text-zinc-500 font-bold hover:text-zinc-300 transition-colors cursor-pointer"
                            >
                                ▲
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Compact Action Buttons */}
            <div className="flex gap-2 mt-auto">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToInventory();
                    }}
                    className={`flex-1 py-2 ${added ? 'bg-green-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'} font-bold rounded-lg transition-all text-xs`}
                >
                    {added ? '✓' : '📦'}
                </button>
                {effective.fcc && (
                    <div className="flex-1 text-center py-2 bg-yellow-500/90 group-hover:bg-yellow-400 text-black font-bold rounded-lg transition-all text-xs">
                        🛒 Buy
                    </div>
                )}
            </div>
            {/* OEM Selection Modal */}
            {showOemSelector && config.oem && config.oem.length > 1 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowOemSelector(false);
                    }}
                >
                    <div
                        className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 w-80 max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-2 text-white">Select OEM Part Number</h3>
                        <p className="text-xs text-zinc-400 mb-3">
                            This key has {config.oem.length} OEM variants. Select the one you&apos;re adding to inventory:
                        </p>
                        <div className="space-y-2">
                            {config.oem.map((oem, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddOem(oem.number);
                                    }}
                                    className="w-full px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors"
                                >
                                    <span className="font-mono text-yellow-400">{oem.number}</span>
                                    {oem.label && <span className="text-zinc-500 ml-2 text-xs">{oem.label}</span>}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowOemSelector(false);
                            }}
                            className="w-full mt-3 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-300 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </CardWrapper>
    );
}
