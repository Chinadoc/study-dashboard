'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Tag, { TagType } from '@/components/shared/Tag';
import { API_BASE, AFFILIATE_TAG } from '@/lib/config';

interface FccRow {
    fcc_id: string;
    vehicles: string;
    frequency: string;
    chip: string;
    primary_oem_part?: string;
    primary_make?: string;
    has_image?: boolean;
    confidence_score?: number;
    verified_context?: string;
}

function FccContent() {
    const [data, setData] = useState<FccRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [keyType, setKeyType] = useState('all');
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${API_BASE}/api/fcc?limit=1000`);
                const json = await res.json();
                setData(json.rows || []);
            } catch (e) {
                console.error('Failed to fetch FCC data', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const getKeyType = (row: FccRow): TagType => {
        const vehicles = (row.vehicles || '').toLowerCase();
        const chip = (row.chip || '').toLowerCase();
        const freqString = String(row.frequency || '');
        const freq = parseFloat(freqString.replace(/[^0-9.]/g, '')) || 0;

        if (chip.includes('hitag') || chip.includes('id47') || chip.includes('id49') ||
            chip.includes('id4a') || vehicles.includes('prox') ||
            vehicles.includes('smart') || vehicles.includes('peps') ||
            freq >= 433) {
            return 'smart';
        }

        if (vehicles.includes('flip') || vehicles.includes('switchblade')) {
            return 'flip';
        }

        if (vehicles.includes('remote head') || vehicles.includes('rhk')) {
            return 'remote-head';
        }

        if (chip.includes('non-transponder') || chip === 'na' || chip === '') {
            return 'mechanical';
        }

        return 'transponder';
    };

    const filteredData = useMemo(() => {
        const activeTagsString = searchParams.get('tags');
        const activeTags = activeTagsString ? activeTagsString.split(',').filter(Boolean) : [];
        const query = search.toLowerCase();

        return data.filter(row => {
            const fccId = (row.fcc_id || '').toLowerCase();
            const vehicles = (row.vehicles || '').toLowerCase();

            const matchesSearch = !query || fccId.includes(query) || vehicles.includes(query);
            if (!matchesSearch) return false;

            if (keyType !== 'all' && getKeyType(row) !== keyType) return false;

            if (activeTags.length > 0) {
                const rowText = `${fccId} ${vehicles} ${row.chip} ${row.frequency}`.toLowerCase();
                return activeTags.every(tag => rowText.includes(tag.toLowerCase()));
            }

            return true;
        });
    }, [data, search, keyType, searchParams]);

    return (
        <div className="space-y-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        FCC ID Intelligence
                    </h1>
                    <p className="text-zinc-400 mt-2">Verified frequency and chip database for locksmiths.</p>
                </div>
                <div className="flex p-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm overflow-x-auto max-w-full">
                    {['all', 'smart', 'flip', 'remote-head', 'transponder', 'mechanical'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setKeyType(type)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${keyType === type
                                    ? 'bg-zinc-800 text-white shadow-lg'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {type.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative group">
                <div className="absolute inset-0 bg-yellow-500/5 blur-2xl group-hover:bg-yellow-500/10 transition-all rounded-3xl" />
                <input
                    type="text"
                    placeholder="Search by FCC ID, Make, Model, or Year..."
                    className="relative w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/30 transition-all backdrop-blur-md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    {loading && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
                    )}
                    {!loading && <span className="hidden sm:inline text-zinc-600 font-mono text-sm">{filteredData.length} matches</span>}
                </div>
            </div>

            {searchParams.get('tags') && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Active Filters:</span>
                    {searchParams.get('tags')?.split(',').map(tag => (
                        <Tag key={tag} label={tag} clickable />
                    ))}
                    <button
                        onClick={() => { setSearch(''); router.push('/fcc'); }}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-bold"
                    >
                        Reset All
                    </button>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl border border-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.slice(0, 48).map((row) => {
                        const currentKeyType = getKeyType(row);
                        return (
                            <div key={row.fcc_id} className="glass group relative p-6 transition-all hover:-translate-y-1 hover:border-zinc-700 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">FCC IDENTIFIER</span>
                                        <h2 className="text-2xl font-mono font-black text-yellow-500 group-hover:text-yellow-400 transition-colors">
                                            {row.fcc_id}
                                        </h2>
                                    </div>
                                    <Tag label={currentKeyType.replace('-', ' ')} type={currentKeyType} clickable={false} />
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase mb-2 block">Compatible Vehicles</span>
                                        <div className="flex flex-wrap gap-2">
                                            {row.vehicles.split(',').slice(0, 4).map((v, i) => (
                                                <Tag key={i} label={v.trim()} type="platform" />
                                            ))}
                                            {row.vehicles.split(',').length > 4 && (
                                                <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded-md">
                                                    +{row.vehicles.split(',').length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/50 pt-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Frequency</span>
                                            <span className="text-sm font-bold text-zinc-200">{row.frequency}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Transponder</span>
                                            <span className="text-sm font-bold text-zinc-200 truncate block" title={row.chip}>{row.chip || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <a
                                        href={`https://www.amazon.com/s?k=${row.fcc_id}&tag=${AFFILIATE_TAG}`}
                                        target="_blank"
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-center py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-yellow-500/10"
                                    >
                                        🛒 SHOP BLANKS
                                    </a>
                                    {row.primary_oem_part && (
                                        <div
                                            className="px-3 py-2.5 rounded-xl border border-zinc-800 text-[10px] font-bold bg-zinc-900/50 text-zinc-400 hover:text-white transition-colors cursor-help flex items-center justify-center max-w-[100px]"
                                            title={`Primary OEM Part: ${row.primary_oem_part}`}
                                        >
                                            <span className="truncate">{row.primary_oem_part}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filteredData.length === 0 && (
                <div className="text-center py-32 glass">
                    <div className="text-6xl mb-6 grayscale opacity-50">📡</div>
                    <h3 className="text-xl font-bold text-zinc-300">No matching identifiers found</h3>
                    <p className="text-zinc-500 mt-2">Try searching by chip type or broader vehicle name.</p>
                    <button
                        onClick={() => { setSearch(''); router.push('/fcc'); }}
                        className="mt-6 text-yellow-500 font-bold hover:underline"
                    >
                        Clear all search parameters
                    </button>
                </div>
            )}
        </div>
    );
}

export default function FccPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-zinc-500">Loading identifier database...</div>}>
            <FccContent />
        </Suspense>
    );
}
