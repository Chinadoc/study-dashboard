'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface BrandData {
    display_name: string;
    icon: string;
    product_count: number;
    vehicle_makes_count: number;
    functions: string[];
    function_labels: Record<string, string>;
    chip_types_count: number;
    ecu_types_count: number;
    product_types: Record<string, number>;
    price_range: [number, number] | null;
    top_products: ProductData[];
}

interface ProductData {
    name: string;
    type: string;
    type_label: string;
    price: number | null;
    url: string;
    vehicle_makes_count: number;
    function_count: number;
    chip_count: number;
    ecu_count: number;
    functions: string[];
    vehicle_makes: string[];
    chip_types: string[];
}

type SortKey = 'products' | 'makes' | 'functions' | 'name';

const FUNCTION_LABELS: Record<string, string> = {
    key_programming: 'Key Programming',
    all_keys_lost: 'AKL',
    immo_off: 'IMMO OFF',
    isn_read: 'ISN Read',
    ecu_cloning: 'ECU Clone',
    ecu_programming: 'ECU Program',
    odometer: 'Odometer',
    remote_programming: 'Remote',
    transponder_copy: 'Transponder',
    pin_code: 'PIN Code',
    diagnostic: 'Diagnostics',
    coding: 'Coding',
    dtc_off: 'DTC OFF',
    dpf_off: 'DPF/EGR',
    vin_modify: 'VIN Modify',
    checksum: 'Checksum',
    bench_mode: 'Bench',
    boot_mode: 'Boot',
    obd_mode: 'OBD',
};

function FunctionBadge({ func }: { func: string }) {
    const label = FUNCTION_LABELS[func] || func.replace(/_/g, ' ');
    const getColor = () => {
        if (['all_keys_lost', 'key_programming'].includes(func)) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        if (['immo_off', 'isn_read'].includes(func)) return 'bg-red-500/20 text-red-300 border-red-500/30';
        if (['ecu_cloning', 'ecu_programming', 'bench_mode', 'boot_mode', 'obd_mode'].includes(func)) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (['diagnostic', 'coding'].includes(func)) return 'bg-green-500/20 text-green-300 border-green-500/30';
        return 'bg-zinc-700/50 text-zinc-300 border-zinc-600/30';
    };
    return (
        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border ${getColor()}`}>
            {label}
        </span>
    );
}

export default function ToolIntelligencePage() {
    const [brands, setBrands] = useState<Record<string, BrandData>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortKey>('products');
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [vehicleCoverage, setVehicleCoverage] = useState<any>(null);
    const [vehicleResults, setVehicleResults] = useState<any>(null);

    useEffect(() => {
        fetch('/data/tool_brands.json')
            .then(r => r.json())
            .then(data => {
                setBrands(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const sortedBrands = useMemo(() => {
        let entries = Object.entries(brands).filter(([key]) => key !== 'other');

        if (search) {
            const q = search.toLowerCase();
            entries = entries.filter(([, b]) =>
                b.display_name.toLowerCase().includes(q) ||
                b.functions.some(f => FUNCTION_LABELS[f]?.toLowerCase().includes(q))
            );
        }

        entries.sort((a, b) => {
            switch (sortBy) {
                case 'makes': return b[1].vehicle_makes_count - a[1].vehicle_makes_count;
                case 'functions': return b[1].functions.length - a[1].functions.length;
                case 'name': return a[1].display_name.localeCompare(b[1].display_name);
                default: return b[1].product_count - a[1].product_count;
            }
        });

        return entries;
    }, [brands, search, sortBy]);

    // Vehicle lookup
    const handleVehicleLookup = async () => {
        if (!vehicleSearch.trim()) return;
        if (!vehicleCoverage) {
            const resp = await fetch('/data/tool_vehicle_coverage.json');
            const data = await resp.json();
            setVehicleCoverage(data);
            doVehicleLookup(data, vehicleSearch);
        } else {
            doVehicleLookup(vehicleCoverage, vehicleSearch);
        }
    };

    const doVehicleLookup = (coverage: any, query: string) => {
        const q = query.toLowerCase().trim();
        const results: Array<{ make: string; model: string; tools: string[]; functions: string[] }> = [];

        for (const [make, makeData] of Object.entries(coverage as Record<string, any>)) {
            if (!make.toLowerCase().includes(q) && !q.includes(make.toLowerCase())) continue;

            for (const [model, modelData] of Object.entries(makeData.models as Record<string, any>)) {
                const allTools = new Set<string>();
                const allFunctions = new Set<string>();

                for (const [, yearData] of Object.entries(modelData as Record<string, any>)) {
                    const yd = yearData as any;
                    if (yd.tools) yd.tools.forEach((t: string) => allTools.add(t));
                    if (yd.functions) yd.functions.forEach((f: string) => allFunctions.add(f));
                }

                if (allTools.size > 0) {
                    results.push({
                        make,
                        model: model === '_all' ? '(all models)' : model,
                        tools: Array.from(allTools).sort(),
                        functions: Array.from(allFunctions).sort().slice(0, 5),
                    });
                }
            }
        }

        results.sort((a, b) => b.tools.length - a.tools.length);
        setVehicleResults(results.slice(0, 50));
    };

    // Stats
    const totalProducts = Object.values(brands).reduce((a, b) => a + b.product_count, 0);
    const totalBrands = Object.keys(brands).filter(k => k !== 'other').length;
    const allFunctions = new Set(Object.values(brands).flatMap(b => b.functions));

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400">Loading tool intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">🛠️</span>
                        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Tool Intelligence
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-sm lg:text-base mb-4">
                        Compare {totalProducts.toLocaleString()} products across {totalBrands} brands. Coverage data from manufacturer support lists.
                    </p>

                    {/* Heatmap CTA */}
                    <Link
                        href="/tools/heatmap"
                        className="block bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-4 mb-6 hover:border-purple-400/50 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🗺️</span>
                                <div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                                        Interactive Coverage Heatmap
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        Select a tool, toggle add-ons & subscriptions, watch your coverage expand
                                    </p>
                                </div>
                            </div>
                            <span className="text-zinc-500 group-hover:text-purple-300 transition-colors text-lg">→</span>
                        </div>
                    </Link>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-purple-400">{totalBrands}</div>
                            <div className="text-xs text-zinc-500">Brands</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-blue-400">{totalProducts.toLocaleString()}</div>
                            <div className="text-xs text-zinc-500">Products</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-green-400">{allFunctions.size}</div>
                            <div className="text-xs text-zinc-500">Functions Tracked</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-amber-400">22K+</div>
                            <div className="text-xs text-zinc-500">Vehicle Entries</div>
                        </div>
                    </div>

                    {/* Vehicle Lookup */}
                    <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-zinc-300 mb-2">🔍 Vehicle Lookup — Which tools support my vehicle?</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={vehicleSearch}
                                onChange={e => setVehicleSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleVehicleLookup()}
                                placeholder="Enter make (e.g. BMW, Toyota, Ford)..."
                                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none"
                            />
                            <button
                                onClick={handleVehicleLookup}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Search
                            </button>
                        </div>

                        {vehicleResults && (
                            <div className="mt-3 max-h-64 overflow-y-auto">
                                {vehicleResults.length === 0 ? (
                                    <p className="text-zinc-500 text-sm">No results found.</p>
                                ) : (
                                    <div className="space-y-1">
                                        {vehicleResults.map((r: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2">
                                                <div>
                                                    <span className="text-sm font-medium text-white">{r.make}</span>
                                                    <span className="text-zinc-500 text-sm ml-2">{r.model}</span>
                                                </div>
                                                <div className="flex gap-1 flex-wrap justify-end">
                                                    {r.tools.map((t: string) => (
                                                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/20">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search + Sort */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filter brands..."
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                    />
                    <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        {([['products', 'Products'], ['makes', 'Makes'], ['functions', 'Functions'], ['name', 'A-Z']] as [SortKey, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${sortBy === key ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedBrands.map(([key, brand]) => (
                        <Link
                            key={key}
                            href={`/tools/${key}`}
                            className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/50 hover:bg-zinc-900/80 transition-all"
                        >
                            {/* Brand header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{brand.icon}</span>
                                    <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {brand.display_name}
                                    </h2>
                                </div>
                                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-full">
                                    {brand.product_count} products
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-400">{brand.vehicle_makes_count}</div>
                                    <div className="text-[10px] text-zinc-500">Makes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-400">{brand.functions.length}</div>
                                    <div className="text-[10px] text-zinc-500">Functions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-amber-400">{brand.chip_types_count}</div>
                                    <div className="text-[10px] text-zinc-500">Chip Types</div>
                                </div>
                            </div>

                            {/* Price range */}
                            {brand.price_range && brand.price_range[1] > 0 && (
                                <div className="text-xs text-zinc-500 mb-3">
                                    💰 ${brand.price_range[0].toFixed(0)} – ${brand.price_range[1].toFixed(0)}
                                </div>
                            )}

                            {/* Function tags */}
                            <div className="flex flex-wrap gap-1">
                                {brand.functions.slice(0, 6).map(func => (
                                    <FunctionBadge key={func} func={func} />
                                ))}
                                {brand.functions.length > 6 && (
                                    <span className="text-[10px] text-zinc-500 px-1.5 py-0.5">
                                        +{brand.functions.length - 6} more
                                    </span>
                                )}
                            </div>

                            {/* Product type breakdown */}
                            <div className="mt-3 flex gap-1.5 flex-wrap">
                                {Object.entries(brand.product_types).slice(0, 3).map(([type, count]) => (
                                    <span key={type} className="text-[9px] text-zinc-500">
                                        {type.replace(/_/g, ' ')} ({count})
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom padding for mobile nav */}
            <div className="h-20" />
        </div>
    );
}
