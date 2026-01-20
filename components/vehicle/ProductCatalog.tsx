'use client';

import React, { useState } from 'react';

interface ProductCatalogProps {
    vyp: {
        product_count?: number;
        fcc_ids?: string[];
        oem_parts?: string[];
        chips?: string[];
        product_types?: string[];
    };
    specs?: {
        mechanical_key?: string;
        transponder_key?: string;
        lishi?: string;
    };
}

const AKS_BASE = 'https://americankeysupply.com';

export default function ProductCatalog({ vyp, specs }: ProductCatalogProps) {
    const [expanded, setExpanded] = useState(false);

    if (!vyp || !vyp.product_count || vyp.product_count === 0) {
        return null;
    }

    const productTypes = vyp.product_types || [];
    const oemParts = [...new Set((vyp.oem_parts || []).map(p => p.trim()).filter(p => p.length > 0))];
    const fccIds = [...new Set((vyp.fcc_ids || []).map(f => f.trim()).filter(f => f.length > 0))];
    const chips = [...new Set((vyp.chips || []).map(c => c.trim()).filter(c => c.length > 0))];

    // Categorize product types
    const categories: Record<string, string[]> = {
        'Remote Keyless Entry': productTypes.filter(t => t.toLowerCase().includes('remote') && !t.toLowerCase().includes('shell')),
        'Transponder Keys': productTypes.filter(t => t.toLowerCase().includes('transponder') && !t.toLowerCase().includes('shell')),
        'Mechanical Keys': productTypes.filter(t => t.toLowerCase().includes('mechanical')),
        'Key Shells': productTypes.filter(t => t.toLowerCase().includes('shell')),
        'Locks & Ignitions': productTypes.filter(t => t.toLowerCase().includes('ignition') || t.toLowerCase().includes('lock')),
    };

    return (
        <div className="glass p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-3 text-lg font-bold text-green-400">
                    <span className="text-xl">🛒</span>
                    Available Products
                    <span className="text-xs text-zinc-500 font-normal ml-2">
                        ({vyp.product_count} items from AKS)
                    </span>
                </h3>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                    {expanded ? 'Show Less' : 'Show All'}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{oemParts.length}</div>
                    <div className="text-[10px] uppercase text-zinc-500">OEM Parts</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{fccIds.length}</div>
                    <div className="text-[10px] uppercase text-zinc-500">FCC IDs</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">{chips.length}</div>
                    <div className="text-[10px] uppercase text-zinc-500">Chip Types</div>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">{productTypes.length}</div>
                    <div className="text-[10px] uppercase text-zinc-500">Categories</div>
                </div>
            </div>

            {/* Product Categories */}
            {expanded && (
                <div className="space-y-4 border-t border-zinc-800 pt-4">
                    {Object.entries(categories).map(([category, types]) => types.length > 0 && (
                        <div key={category}>
                            <h4 className="text-sm font-bold text-zinc-300 mb-2">{category}</h4>
                            <div className="flex flex-wrap gap-2">
                                {types.map((type, i) => (
                                    <span key={i} className="px-3 py-1 bg-zinc-800 rounded-lg text-xs text-zinc-400">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* OEM Part Numbers */}
                    <div>
                        <h4 className="text-sm font-bold text-zinc-300 mb-2">OEM Part Numbers</h4>
                        <div className="flex flex-wrap gap-1">
                            {oemParts.slice(0, 20).map((part, i) => (
                                <span key={i} className="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-mono rounded">
                                    {part}
                                </span>
                            ))}
                            {oemParts.length > 20 && (
                                <span className="px-2 py-1 text-zinc-500 text-xs">
                                    +{oemParts.length - 20} more
                                </span>
                            )}
                        </div>
                    </div>

                    {/* FCC IDs */}
                    <div>
                        <h4 className="text-sm font-bold text-zinc-300 mb-2">FCC IDs</h4>
                        <div className="flex flex-wrap gap-1">
                            {fccIds.map((fcc, i) => (
                                <span key={i} className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs font-mono rounded">
                                    {fcc}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Chips */}
                    <div>
                        <h4 className="text-sm font-bold text-zinc-300 mb-2">Transponder Chips</h4>
                        <div className="flex flex-wrap gap-1">
                            {chips.map((chip, i) => (
                                <span key={i} className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">
                                    {chip}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tools */}
                    {specs?.lishi && (
                        <div>
                            <h4 className="text-sm font-bold text-zinc-300 mb-2">Recommended Tools</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-lg">
                                    🔓 Lishi {specs.lishi}
                                </span>
                                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs rounded-lg">
                                    🔍 EEZ Reader GM-Z
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Shop Link */}
            <div className="mt-4 text-center">
                <a
                    href={`${AKS_BASE}/collections/all`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20"
                >
                    🛒 Shop All on American Key Supply
                </a>
            </div>
        </div>
    );
}
