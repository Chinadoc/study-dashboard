'use client';

import React, { useState } from 'react';
import { AFFILIATE_TAG } from '@/lib/config';
import { useInventory } from '@/contexts/InventoryContext';
import { useUnifiedData } from '@/lib/useUnifiedData';
import OwnedBadge from '@/components/shared/OwnedBadge';

interface KeyConfig {
    name: string;
    fcc?: string;
    type?: 'prox' | 'blade' | 'flip' | 'remote' | 'transponder';
    buttons?: string;
    battery?: string;
    chip?: string;
    keyway?: string;
    partNumber?: string;
    priceRange?: string;
    oem?: Array<{ number: string; label?: string }>;
    image?: string;
    blade?: string;
    profile?: string;
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

export default function KeyCards({ keys, vehicleInfo, pearls }: KeyCardsProps) {
    if (!keys || keys.length === 0) {
        return (
            <div className="glass p-8 text-center text-zinc-500 mb-8">
                <div className="text-4xl mb-2">🔑</div>
                <p>No key configurations available for this vehicle.</p>
            </div>
        );
    }

    // Determine layout mode based on key count
    const keyCount = keys.length;
    const useScrollLayout = keyCount > 4;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔐</span> Key Configurations
                {keyCount > 0 && (
                    <span className="text-sm font-normal text-zinc-500 ml-2">({keyCount} type{keyCount !== 1 ? 's' : ''})</span>
                )}
            </h2>

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
                        {keys.map((key, index) => (
                            <div
                                key={`key-scroll-${index}-${key.name}`}
                                className="flex-shrink-0 snap-start"
                                style={{ width: 'calc(25% - 12px)', minWidth: '220px' }}
                            >
                                <KeyCard config={key} vehicleInfo={vehicleInfo} />
                            </div>
                        ))}
                    </div>
                    {/* Fade indicator on right edge */}
                    <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-zinc-900 to-transparent pointer-events-none" />
                </div>
            ) : (
                /* Flex layout for 2-4 keys - equal width fill */
                <div
                    className="flex gap-4 min-h-[320px]"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: keyCount === 1 ? '1fr'
                            : keyCount === 2 ? 'repeat(2, 1fr)'
                                : keyCount === 3 ? 'repeat(3, 1fr)'
                                    : 'repeat(4, 1fr)'
                    }}
                >
                    {keys.map((key, index) => (
                        <KeyCard key={`key-grid-${index}-${key.name}`} config={key} vehicleInfo={vehicleInfo} />
                    ))}
                </div>
            )}
        </div>
    );
}

function KeyCard({ config, vehicleInfo }: { config: KeyConfig; vehicleInfo?: { make: string; model: string; year: number } }) {
    const [added, setAdded] = useState(false);
    const { addToInventory: contextAddToInventory } = useInventory();

    const handleAddToInventory = () => {
        const itemKey = config.fcc || config.name || 'Unknown Key';
        const vehicleStr = vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : undefined;

        contextAddToInventory(itemKey, vehicleStr, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
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
    const searchQuery = `${config.fcc || ''} ${config.name || ''}`.trim();
    const amazonUrl = config.fcc
        ? `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AFFILIATE_TAG}`
        : '#';

    const CardWrapper = config.fcc ? 'a' : 'div';
    const wrapperProps = config.fcc ? {
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
                    {/* Button count as title */}
                    <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors">
                        {config.buttons ? `${config.buttons}-Button` : config.name?.split(' ')[0] || 'Key'}
                    </h3>
                    {/* Key type as subtitle */}
                    <p className="text-sm text-zinc-400 mt-0.5">
                        {config.name?.replace(/^\d+-Button\s*/i, '') || 'Key'}
                    </p>
                </div>
                {/* Badges container */}
                <div className="flex flex-col items-end gap-1">
                    {/* Key Type Badge - Smart Key, Remote Head, etc. */}
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border whitespace-nowrap ${typeColors[typeLabel] || typeColors.prox}`}>
                        {(() => {
                            const name = config.name?.toLowerCase() || '';
                            if (name.includes('smart')) return 'SMART';
                            if (name.includes('remote head')) return 'RHK';
                            if (name.includes('transponder')) return 'TPK';
                            if (name.includes('emergency') || name.includes('blade')) return 'BLADE';
                            if (name.includes('flip')) return 'FLIP';
                            if (name.includes('mechanical')) return 'MECH';
                            // For remote keyless entry / remote fobs
                            if (name.includes('remote') && !name.includes('smart')) return 'REMOTE';
                            if (typeLabel === 'remote') return 'REMOTE';
                            if (typeLabel === 'transponder') return 'TPK';
                            return typeLabel.toUpperCase();
                        })()}
                    </span>
                    {/* Owned Badge - shows stock count or Add button */}
                    <OwnedBadge
                        fcc={config.fcc}
                        compact
                        vehicleInfo={vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : undefined}
                    />
                </div>
            </div>

            {/* Large Key Image - Hero Style */}
            <div className="w-full h-28 rounded-lg bg-zinc-800/50 flex items-center justify-center overflow-hidden mb-3">
                {config.image ? (
                    <img
                        src={config.image}
                        alt={config.name}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <span className="text-4xl opacity-30">🔑</span>
                )}
            </div>

            {/* Prominent FCC ID */}
            {config.fcc && (() => {
                const fccIds = [...new Set(config.fcc.split(/[\s,]+/).filter(Boolean))];
                return (
                    <div className="text-center mb-3 py-2 bg-zinc-800/70 rounded-lg">
                        <span className="text-[10px] text-zinc-500 block">FCC ID</span>
                        <span className="font-mono text-yellow-500 font-bold text-lg">{fccIds[0]}</span>
                        {fccIds.length > 1 && <span className="text-yellow-400/60 text-sm ml-1">+{fccIds.length - 1}</span>}
                    </div>
                );
            })()}

            {/* Specs Grid */}
            <div className="space-y-1 mb-3">
                {config.partNumber && (
                    <div className="text-xs truncate">
                        <span className="text-zinc-500">Part#: </span>
                        <span className="text-white font-mono">{config.partNumber}</span>
                    </div>
                )}
                {config.chip && (() => {
                    // Detect VATS (resistor values) and display abbreviated
                    const chipLower = config.chip.toLowerCase();
                    const isVATS = chipLower.includes('vats') || chipLower.includes('resistor') ||
                        chipLower.includes('resister') || chipLower.includes('ohms');
                    return (
                        <div className="text-xs truncate">
                            <span className="text-zinc-500">Chip: </span>
                            <span className={isVATS ? 'text-amber-400' : 'text-white'}>
                                {isVATS ? 'VATS (Resistor)' : config.chip}
                            </span>
                        </div>
                    );
                })()}
                {config.keyway && (
                    <div className="text-xs truncate">
                        <span className="text-zinc-500">Blade: </span>
                        <span className="text-white font-mono">{config.keyway}</span>
                    </div>
                )}
                {config.battery && (
                    <div className="text-xs">
                        <span className="text-zinc-500">Battery: </span>
                        <span className="text-white">{config.battery}</span>
                    </div>
                )}
            </div>

            {/* Collapsible OEM Parts - only show first 3, expand on click */}
            {config.oem && config.oem.length > 0 && (
                <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                        {config.oem.slice(0, 3).map((part, i) => (
                            <span
                                key={i}
                                className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono text-zinc-400"
                                title={part.label || ''}
                            >
                                {part.number}
                            </span>
                        ))}
                        {config.oem.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-zinc-600 font-bold">
                                +{config.oem.length - 3}
                            </span>
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
                {config.fcc && (
                    <div className="flex-1 text-center py-2 bg-yellow-500/90 group-hover:bg-yellow-400 text-black font-bold rounded-lg transition-all text-xs">
                        🛒 Buy
                    </div>
                )}
            </div>
        </CardWrapper>
    );
}
