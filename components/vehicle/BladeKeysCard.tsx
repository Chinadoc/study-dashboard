'use client';

import React from 'react';

export interface BladeEntry {
    type: string;       // "Transponder", "Mechanical", "Emergency"
    keyway: string | null;
    chip: string | null;
    imageUrl: string | null;
    oemParts: (string | { number: string; label?: string })[];
    purpose: string;    // "For Starting", "Door / Trunk", "Inside FOBIK"
    partNumber: string | null;
    productCount: number;
    reusable: string | null;
    cloneable: string | null;
}

export interface BladeKeysData {
    keyway: string | null;
    entries: BladeEntry[];
}

interface BladeKeysCardProps {
    data: BladeKeysData;
    bitting?: {
        spaces: string | null;
        depths: string | null;
        macs: string | null;
        lishi: string | null;
    };
}

export default function BladeKeysCard({ data, bitting }: BladeKeysCardProps) {
    if (!data || !data.entries || data.entries.length === 0) return null;

    // Sort: Transponder first, then Mechanical, then Emergency
    const typeOrder: Record<string, number> = { 'Transponder': 1, 'Mechanical': 2, 'Emergency': 3 };
    const sorted = [...data.entries].sort((a, b) =>
        (typeOrder[a.type] || 10) - (typeOrder[b.type] || 10)
    );

    return (
        <div className="glass p-5 hover:border-cyan-500/30 transition-all group block relative flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-white group-hover:text-cyan-300 transition-colors">
                        Blade Keys
                    </h3>
                    {data.keyway && (
                        <p className="text-sm text-zinc-400 mt-0.5 font-mono">
                            {data.keyway} Keyway
                        </p>
                    )}
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-bold uppercase border whitespace-nowrap bg-cyan-900/40 text-cyan-300 border-cyan-700/30">
                    BLADE
                </span>
            </div>

            {/* Blade Entries */}
            <div className="space-y-2 mb-3 flex-1">
                {sorted.map((entry, i) => {
                    const isTransponder = entry.type === 'Transponder';
                    return (
                        <div
                            key={i}
                            className={`flex gap-3 items-start p-2.5 rounded-lg transition-all ${isTransponder
                                ? 'bg-cyan-950/30 border border-cyan-700/20'
                                : 'bg-zinc-800/40 border border-zinc-700/20'
                                }`}
                        >
                            {/* Small product image */}
                            <div className="w-12 h-12 rounded bg-zinc-800/80 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {entry.imageUrl ? (
                                    <img
                                        src={entry.imageUrl}
                                        alt={entry.type}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                ) : (
                                    <span className="text-lg opacity-30">🔑</span>
                                )}
                            </div>

                            {/* Entry details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-white">{entry.type}</span>
                                    {entry.keyway && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-700/60 text-zinc-300 border border-zinc-600/30">
                                            {entry.keyway}
                                        </span>
                                    )}
                                </div>

                                {/* Chip badge for transponder */}
                                {entry.chip && (
                                    <div className="mt-1">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-700/20">
                                            {entry.chip}
                                        </span>
                                    </div>
                                )}

                                {/* OEM part numbers */}
                                {entry.oemParts && entry.oemParts.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {entry.oemParts.slice(0, 3).map((oem, j) => (
                                            <span
                                                key={j}
                                                className="px-1 py-0.5 bg-zinc-700/50 rounded text-[9px] font-mono text-zinc-400"
                                            >
                                                {typeof oem === 'string' ? oem : oem.number}
                                            </span>
                                        ))}
                                        {entry.oemParts.length > 3 && (
                                            <span className="text-[9px] text-zinc-600 px-1">
                                                +{entry.oemParts.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Purpose label */}
                                <p className="text-[10px] text-zinc-500 mt-1">{entry.purpose}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reusable / Cloneable from transponder entry — only positive */}
            {(() => {
                const transponder = sorted.find(e => e.type === 'Transponder');
                if (!transponder) return null;
                const { reusable, cloneable } = transponder;
                const showReusable = reusable?.toLowerCase().startsWith('yes');
                const showCloneable = cloneable?.toLowerCase().startsWith('yes');
                if (!showReusable && !showCloneable) return null;
                return (
                    <div className="flex gap-1.5 mb-3">
                        {showReusable && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-900/30 text-green-400 border border-green-700/30">
                                ♻️ Reusable
                            </span>
                        )}
                        {showCloneable && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-900/30 text-blue-400 border border-blue-700/30">
                                📋 Cloneable
                            </span>
                        )}
                    </div>
                );
            })()}

            {/* Shared bitting specs */}
            {bitting && (bitting.spaces || bitting.depths || bitting.macs || bitting.lishi) && (
                <div className="border-t border-zinc-700/30 pt-2 mt-auto">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                        {bitting.spaces && (
                            <span>
                                <span className="text-zinc-500">Spaces: </span>
                                <span className="text-white font-medium">{bitting.spaces}</span>
                            </span>
                        )}
                        {bitting.depths && (
                            <span>
                                <span className="text-zinc-500">Depths: </span>
                                <span className="text-white font-medium">{bitting.depths}</span>
                            </span>
                        )}
                        {bitting.macs && (
                            <span>
                                <span className="text-zinc-500">MACS: </span>
                                <span className="text-white font-medium">{bitting.macs}</span>
                            </span>
                        )}
                        {bitting.lishi && (
                            <span>
                                <span className="text-zinc-500">Lishi: </span>
                                <span className="text-emerald-400 font-medium">{bitting.lishi}</span>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
