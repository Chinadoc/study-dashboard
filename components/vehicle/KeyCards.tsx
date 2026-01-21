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

export default function KeyCards({ keys, vehicleInfo, pearls }: KeyCardsProps) {
    if (!keys || keys.length === 0) {
        return (
            <div className="glass p-8 text-center text-zinc-500 mb-8">
                <div className="text-4xl mb-2">🔑</div>
                <p>No key configurations available for this vehicle.</p>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔐</span> Key Configurations
            </h2>

            {/* Contextual Key Configuration Insights */}
            {pearls?.keyConfig && pearls.keyConfig.length > 0 && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                    <div className="text-sm text-green-300">
                        📦 {pearls.keyConfig[0].content}
                    </div>
                </div>
            )}

            {/* Frequency Warning if present */}
            {pearls?.frequency && pearls.frequency.length > 0 && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                    <div className="text-sm text-red-300">
                        ⚠️ {pearls.frequency[0].content}
                    </div>
                </div>
            )}

            {/* Cylinder Access Tip if present */}
            {pearls?.access && pearls.access.length > 0 && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <div className="text-sm text-blue-300">
                        🚪 {pearls.access[0].content}
                    </div>
                </div>
            )}

            {/* Fixed 3-column grid like demo, 2 on tablet, 1 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[320px]">
                {keys.map((key, index) => (
                    <KeyCard key={key.fcc || index} config={key} vehicleInfo={vehicleInfo} />
                ))}
            </div>
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

            {/* Key Image Placeholder or actual image */}
            <div className="h-32 mb-4 rounded-lg bg-zinc-800/50 flex items-center justify-center overflow-hidden">
                {config.image ? (
                    <img
                        src={config.image}
                        alt={config.name}
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <span className="text-5xl opacity-30">🔑</span>
                )}
            </div>

            {/* Specs */}
            <div className="space-y-2 mb-4">
                {config.fcc && (() => {
                    // Split and deduplicate FCC IDs (handles "YG0G20TB1 YG0G20TB1" duplication)
                    const fccIds = [...new Set(config.fcc.split(/[\s,]+/).filter(Boolean))];
                    return (
                        <div className="flex justify-between text-sm gap-2">
                            <span className="text-zinc-500 shrink-0">FCC ID</span>
                            <span className="font-mono text-yellow-500 font-bold truncate text-right flex flex-wrap gap-1 justify-end" title={fccIds.join(', ')}>
                                {fccIds.map((fcc, i) => (
                                    <span key={fcc} className={i > 0 ? 'text-yellow-400' : ''}>{fcc}</span>
                                ))}
                            </span>
                        </div>
                    );
                })()}
                {config.chip && (
                    <div className="flex justify-between text-sm gap-2">
                        <span className="text-zinc-500 shrink-0">Chip</span>
                        <span className="text-white truncate text-right" title={config.chip}>{config.chip}</span>
                    </div>
                )}
                {config.battery && (
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Battery</span>
                        <span className="text-white">{config.battery}</span>
                    </div>
                )}
                {config.blade && (
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Blade</span>
                        <span className="text-white">{config.blade}</span>
                    </div>
                )}
                {config.priceRange && (
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Price Range</span>
                        <span className="text-green-400 font-bold">{config.priceRange}</span>
                    </div>
                )}
            </div>

            {/* OEM Parts */}
            {config.oem && config.oem.length > 0 && (
                <div className="mb-4 pt-3 border-t border-zinc-800">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">OEM Part Numbers</div>
                    <div className="flex flex-wrap gap-1">
                        {config.oem.slice(0, 6).map((part, i) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-300"
                                title={part.label || ''}
                            >
                                {part.number}
                            </span>
                        ))}
                        {config.oem.length > 6 && (
                            <span className="px-2 py-1 text-[10px] text-zinc-600 font-bold flex items-center">
                                +{config.oem.length - 6} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto">
                {/* Add to Inventory Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToInventory();
                    }}
                    className={`flex-1 py-3 ${added ? 'bg-green-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'} font-bold rounded-xl transition-all text-sm`}
                >
                    {added ? '✓ Added!' : '📦 + Inventory'}
                </button>

                {/* Shop on Amazon Button */}
                {config.fcc && (
                    <div className="flex-1 text-center py-3 bg-yellow-500/90 group-hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
                        🛒 Amazon
                    </div>
                )}
            </div>
        </CardWrapper>
    );
}
