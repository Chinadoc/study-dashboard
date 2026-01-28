'use client';

import React, { useState } from 'react';
import { AFFILIATE_TAG } from '@/lib/config';

interface KeyConfig {
    name: string;
    fcc?: string;
    type?: 'prox' | 'blade' | 'flip' | 'remote';
    buttons?: string;
    battery?: string;
    chip?: string;
    keyway?: string;
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

    const addToInventory = () => {
        if (typeof window === 'undefined') return;

        const existingRaw = localStorage.getItem('eurokeys_inventory');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];

        const itemKey = config.fcc || config.name || 'Unknown Key';
        const vehicleStr = vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : undefined;

        // Check if already exists
        const existingItem = existing.find((i: any) => i.itemKey === itemKey && i.type === 'key');
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            existing.push({
                itemKey,
                type: 'key',
                qty: 1,
                vehicle: vehicleStr,
                fcc_id: config.fcc,
            });
        }

        localStorage.setItem('eurokeys_inventory', JSON.stringify(existing));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const typeColors: Record<string, string> = {
        prox: 'bg-purple-900/40 text-purple-300 border-purple-700/30',
        blade: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
        flip: 'bg-green-900/40 text-green-300 border-green-700/30',
        remote: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/30',
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
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
                        {config.name || 'Smart Key'}
                    </h3>
                    {config.buttons && (
                        <p className="text-xs text-zinc-500 mt-1">{config.buttons}</p>
                    )}
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${typeColors[typeLabel] || typeColors.prox}`}>
                    {typeLabel}
                </span>
            </div>

            {/* Compact Key Image + FCC inline */}
            <div className="flex gap-3 mb-3">
                {/* Smaller key image */}
                <div className="w-16 h-16 shrink-0 rounded-lg bg-zinc-800/50 flex items-center justify-center overflow-hidden">
                    {config.image ? (
                        <img
                            src={config.image}
                            alt={config.name}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : (
                        <span className="text-2xl opacity-30">🔑</span>
                    )}
                </div>
                {/* Core specs inline */}
                <div className="flex-1 min-w-0 space-y-1">
                    {config.fcc && (() => {
                        const fccIds = [...new Set(config.fcc.split(/[\s,]+/).filter(Boolean))];
                        return (
                            <div className="text-xs">
                                <span className="text-zinc-500">FCC: </span>
                                <span className="font-mono text-yellow-500 font-bold">{fccIds[0]}</span>
                                {fccIds.length > 1 && <span className="text-yellow-400/60 ml-1">+{fccIds.length - 1}</span>}
                            </div>
                        );
                    })()}
                    {config.chip && (
                        <div className="text-xs truncate">
                            <span className="text-zinc-500">Chip: </span>
                            <span className="text-white">{config.chip}</span>
                        </div>
                    )}
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
                        addToInventory();
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
