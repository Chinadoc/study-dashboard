'use client';

import React from 'react';
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

interface KeyCardsProps {
    keys: KeyConfig[];
}

export default function KeyCards({ keys }: KeyCardsProps) {
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
            {/* Auto-fill grid: cards flex to fill row whether 3, 4, or 5 */}
            <div
                className="grid gap-6"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
            >
                {keys.map((key, index) => (
                    <KeyCard key={key.fcc || index} config={key} />
                ))}
            </div>
        </div>
    );
}

function KeyCard({ config }: { config: KeyConfig }) {
    const typeColors: Record<string, string> = {
        prox: 'bg-purple-900/40 text-purple-300 border-purple-700/30',
        blade: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
        flip: 'bg-green-900/40 text-green-300 border-green-700/30',
        remote: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/30',
    };

    const typeLabel = config.type || 'prox';

    return (
        <div className="glass p-5 hover:border-purple-500/50 transition-all group">
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
                {config.fcc && (
                    <div className="flex justify-between text-sm gap-2">
                        <span className="text-zinc-500 shrink-0">FCC ID</span>
                        <span className="font-mono text-yellow-500 font-bold truncate text-right" title={config.fcc}>{config.fcc}</span>
                    </div>
                )}
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

            {/* Shop Button */}
            {config.fcc && (
                <a
                    href={`https://www.amazon.com/s?k=${config.fcc}&tag=${AFFILIATE_TAG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20"
                >
                    🛒 Shop on Amazon
                </a>
            )}
        </div>
    );
}
