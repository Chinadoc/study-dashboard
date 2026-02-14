'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

interface BrandDetail {
    display_name: string;
    icon: string;
    product_count: number;
    vehicle_makes_count: number;
    vehicle_makes: string[];
    functions: string[];
    function_labels: Record<string, string>;
    chip_types_count: number;
    ecu_types_count: number;
    product_types: Record<string, number>;
    price_range: [number, number] | null;
    top_products: ProductData[];
    all_products: ProductData[];
}

const TYPE_COLORS: Record<string, string> = {
    key_programmer: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    diagnostic_tool: 'bg-green-500/20 text-green-300 border-green-500/30',
    ecu_tool: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    remote_shell: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    locksmith_tool: 'bg-red-500/20 text-red-300 border-red-500/30',
    key_cutting: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    software_license: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    emulator: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

const FUNCTION_LABELS: Record<string, string> = {
    key_programming: 'Key Programming', all_keys_lost: 'AKL', immo_off: 'IMMO OFF',
    isn_read: 'ISN Read', ecu_cloning: 'ECU Clone', ecu_programming: 'ECU Program',
    odometer: 'Odometer', remote_programming: 'Remote', transponder_copy: 'Transponder',
    pin_code: 'PIN Code', diagnostic: 'Diagnostics', coding: 'Coding',
    dtc_off: 'DTC OFF', dpf_off: 'DPF/EGR', vin_modify: 'VIN Modify',
    checksum: 'Checksum', bench_mode: 'Bench', boot_mode: 'Boot', obd_mode: 'OBD',
};

type Tab = 'products' | 'coverage';
type ProductSort = 'relevance' | 'price_low' | 'price_high' | 'name';

export default function BrandDetailPage() {
    const params = useParams();
    const brandKey = (params?.brand as string) || '';
    const [brand, setBrand] = useState<BrandDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('products');
    const [productSearch, setProductSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [productSort, setProductSort] = useState<ProductSort>('relevance');
    const [vehicleCoverage, setVehicleCoverage] = useState<any>(null);
    const [coverageMake, setCoverageMake] = useState<string>('');

    useEffect(() => {
        fetch(`/data/tool_brands/${brandKey}.json`)
            .then(r => r.json())
            .then(data => {
                setBrand(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [brandKey]);

    // Lazy-load vehicle coverage when that tab is selected
    useEffect(() => {
        if (tab === 'coverage' && !vehicleCoverage) {
            fetch('/data/tool_vehicle_coverage.json')
                .then(r => r.json())
                .then(setVehicleCoverage);
        }
    }, [tab, vehicleCoverage]);

    // Filtered + sorted products
    const filteredProducts = useMemo(() => {
        if (!brand) return [];
        let products = brand.all_products;

        if (productSearch) {
            const q = productSearch.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.vehicle_makes.some(m => m.toLowerCase().includes(q)) ||
                p.functions.some(f => FUNCTION_LABELS[f]?.toLowerCase().includes(q))
            );
        }

        if (typeFilter !== 'all') {
            products = products.filter(p => p.type === typeFilter);
        }

        switch (productSort) {
            case 'price_low':
                products = [...products].sort((a, b) => (a.price || 999999) - (b.price || 999999));
                break;
            case 'price_high':
                products = [...products].sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'name':
                products = [...products].sort((a, b) => a.name.localeCompare(b.name));
                break;
            // 'relevance' is default order from generator
        }

        return products;
    }, [brand, productSearch, typeFilter, productSort]);

    // Vehicle coverage for this brand
    const brandCoverage = useMemo(() => {
        if (!vehicleCoverage || !brand) return null;

        const makes: Record<string, { models: Record<string, Record<string, any>>; tool_count: number }> = {};

        for (const [make, makeData] of Object.entries(vehicleCoverage as Record<string, any>)) {
            // Only include makes where this brand has coverage
            if (!makeData.tools?.includes(brand.display_name)) continue;

            const filteredModels: Record<string, Record<string, any>> = {};
            for (const [model, modelData] of Object.entries(makeData.models as Record<string, any>)) {
                const filteredYears: Record<string, any> = {};
                for (const [year, yearData] of Object.entries(modelData as Record<string, any>)) {
                    if ((yearData as any).tools?.includes(brand.display_name)) {
                        filteredYears[year] = yearData;
                    }
                }
                if (Object.keys(filteredYears).length > 0) {
                    filteredModels[model] = filteredYears;
                }
            }

            if (Object.keys(filteredModels).length > 0) {
                makes[make] = {
                    models: filteredModels,
                    tool_count: Object.values(filteredModels).reduce(
                        (acc, m) => acc + Object.keys(m).length, 0
                    ),
                };
            }
        }

        return makes;
    }, [vehicleCoverage, brand]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-zinc-400 mb-4">Brand not found</p>
                    <Link href="/tools" className="text-purple-400 hover:text-purple-300">← Back to Tool Intelligence</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Link href="/tools" className="text-zinc-500 hover:text-zinc-300 text-sm mb-3 inline-block">
                        ← Tool Intelligence
                    </Link>

                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{brand.icon}</span>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-white">
                                {brand.display_name}
                            </h1>
                            <p className="text-zinc-500 text-sm">
                                {brand.product_count} products · {brand.vehicle_makes_count} vehicle makes · {brand.functions.length} functions
                            </p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-purple-400">{brand.product_count}</div>
                            <div className="text-[10px] text-zinc-500">Products</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-blue-400">{brand.vehicle_makes_count}</div>
                            <div className="text-[10px] text-zinc-500">Makes</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-green-400">{brand.functions.length}</div>
                            <div className="text-[10px] text-zinc-500">Functions</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                            <div className="text-xl font-bold text-amber-400">{brand.chip_types_count}</div>
                            <div className="text-[10px] text-zinc-500">Chip Types</div>
                        </div>
                    </div>

                    {/* Functions */}
                    <div className="flex flex-wrap gap-1.5">
                        {brand.functions.map(func => (
                            <span
                                key={func}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
                            >
                                {brand.function_labels[func] || func}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab bar */}
            <div className="max-w-7xl mx-auto px-4 pt-4">
                <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-4 w-fit">
                    <button
                        onClick={() => setTab('products')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'products' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Products ({brand.product_count})
                    </button>
                    <button
                        onClick={() => setTab('coverage')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'coverage' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Vehicle Coverage
                    </button>
                </div>

                {/* Products Tab */}
                {tab === 'products' && (
                    <div>
                        {/* Search + filters */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input
                                type="text"
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                placeholder="Search products, makes, or functions..."
                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                            />
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                            >
                                <option value="all">All Types</option>
                                {Object.entries(brand.product_types).map(([type, count]) => (
                                    <option key={type} value={type}>{type.replace(/_/g, ' ')} ({count})</option>
                                ))}
                            </select>
                            <select
                                value={productSort}
                                onChange={e => setProductSort(e.target.value as ProductSort)}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300"
                            >
                                <option value="relevance">Most Relevant</option>
                                <option value="price_low">Price: Low → High</option>
                                <option value="price_high">Price: High → Low</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>

                        <p className="text-xs text-zinc-500 mb-3">{filteredProducts.length} products</p>

                        {/* Product grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProducts.map((product, i) => (
                                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                                    {/* Type badge + price */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[product.type] || 'bg-zinc-700/50 text-zinc-300 border-zinc-600/30'}`}>
                                            {product.type_label}
                                        </span>
                                        {product.price && (
                                            <span className="text-sm font-bold text-green-400">${product.price.toFixed(0)}</span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>

                                    {/* Stats */}
                                    <div className="flex gap-3 text-xs text-zinc-500 mb-2">
                                        {product.vehicle_makes_count > 0 && (
                                            <span>🚗 {product.vehicle_makes_count} makes</span>
                                        )}
                                        {product.function_count > 0 && (
                                            <span>⚡ {product.function_count} functions</span>
                                        )}
                                        {product.chip_count > 0 && (
                                            <span>🔧 {product.chip_count} chips</span>
                                        )}
                                    </div>

                                    {/* Function badges */}
                                    {product.functions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {product.functions.slice(0, 4).map(func => (
                                                <span key={func} className="text-[9px] px-1 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                                                    {FUNCTION_LABELS[func] || func}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Vehicle makes */}
                                    {product.vehicle_makes.length > 0 && (
                                        <div className="text-[10px] text-zinc-600 truncate">
                                            {product.vehicle_makes.slice(0, 8).join(' · ')}
                                            {product.vehicle_makes.length > 8 && ` +${product.vehicle_makes.length - 8}`}
                                        </div>
                                    )}

                                    {/* Link */}
                                    {product.url && (
                                        <a
                                            href={product.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-block text-xs text-purple-400 hover:text-purple-300"
                                        >
                                            View on OBDII365 →
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Coverage Tab */}
                {tab === 'coverage' && (
                    <div>
                        {!brandCoverage ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3" />
                                <span className="text-zinc-400">Loading vehicle coverage...</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={coverageMake}
                                        onChange={e => setCoverageMake(e.target.value)}
                                        placeholder="Filter makes..."
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-purple-500 outline-none"
                                    />
                                </div>

                                <p className="text-xs text-zinc-500 mb-3">
                                    {Object.keys(brandCoverage).length} vehicle makes with {brand.display_name} coverage
                                </p>

                                {/* Make cards */}
                                <div className="space-y-3">
                                    {Object.entries(brandCoverage)
                                        .filter(([make]) => !coverageMake || make.toLowerCase().includes(coverageMake.toLowerCase()))
                                        .sort((a, b) => b[1].tool_count - a[1].tool_count)
                                        .slice(0, 30)
                                        .map(([make, makeData]) => (
                                            <MakeCoverageCard key={make} make={make} makeData={makeData} />
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="h-20" />
        </div>
    );
}

function MakeCoverageCard({ make, makeData }: { make: string; makeData: any }) {
    const [expanded, setExpanded] = useState(false);
    const modelCount = Object.keys(makeData.models).filter(m => m !== '_all').length;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{make}</span>
                    <span className="text-xs text-zinc-500">{modelCount} models</span>
                </div>
                <svg
                    className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="px-4 pb-3 border-t border-zinc-800">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs mt-2">
                            <thead>
                                <tr className="text-zinc-500 text-left">
                                    <th className="pb-1 pr-4">Model</th>
                                    <th className="pb-1 pr-4">Years</th>
                                    <th className="pb-1 pr-4">ECU</th>
                                    <th className="pb-1">Functions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(makeData.models)
                                    .filter(([m]) => m !== '_all')
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .slice(0, 30)
                                    .map(([model, yearData]: [string, any]) => {
                                        const years = Object.keys(yearData).filter(y => y !== '_all').sort();
                                        const yearRange = years.length > 0 ? `${years[0]}–${years[years.length - 1]}` : '—';
                                        const allEcu = new Set<string>();
                                        const allFunc = new Set<string>();
                                        Object.values(yearData).forEach((yd: any) => {
                                            yd.ecu?.forEach((e: string) => allEcu.add(e));
                                            yd.functions?.forEach((f: string) => allFunc.add(f));
                                        });

                                        return (
                                            <tr key={model} className="border-t border-zinc-800/50 hover:bg-zinc-800/30">
                                                <td className="py-1.5 pr-4 text-white font-medium whitespace-nowrap">{model}</td>
                                                <td className="py-1.5 pr-4 text-zinc-400 whitespace-nowrap">{yearRange}</td>
                                                <td className="py-1.5 pr-4 text-zinc-500 max-w-[200px] truncate">
                                                    {Array.from(allEcu).slice(0, 3).join(', ')}
                                                </td>
                                                <td className="py-1.5 text-zinc-500">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {Array.from(allFunc).slice(0, 3).map(f => (
                                                            <span key={f} className="text-[9px] px-1 py-0.5 bg-zinc-800 rounded text-zinc-400">
                                                                {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                        {Object.keys(makeData.models).length > 31 && (
                            <p className="text-xs text-zinc-600 mt-2">
                                +{Object.keys(makeData.models).length - 30} more models
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
