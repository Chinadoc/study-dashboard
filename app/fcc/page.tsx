'use client';

import React, { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Tag, { TagType } from '@/components/shared/Tag';
import { API_BASE, AFFILIATE_TAG } from '@/lib/config';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { addJobLogToStorage } from '@/lib/useJobLogs';

interface FccRow {
    fcc_id: string;
    vehicles: string;
    frequency: string;
    chip: string;
    key_type?: string;  // smart, remote-head, flip, transponder, mechanical
    primary_oem_part?: string;
    primary_make?: string;
    has_image?: boolean;
    confidence_score?: number;
    verified_context?: string;
    image_url?: string;
    image_r2_key?: string;
}

interface InventoryItem {
    itemKey: string;
    type: 'key' | 'blank';
    qty: number;
    vehicle?: string;
    fcc_id?: string;
}

const INVENTORY_KEY = 'eurokeys_inventory';
const VIEW_PREF_KEY = 'eurokeys_fcc_view';

function getInventoryFromStorage(): InventoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveInventoryToStorage(items: InventoryItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

function FccContent() {
    const [data, setData] = useState<FccRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [keyType, setKeyType] = useState('all');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [selectedFcc, setSelectedFcc] = useState<FccRow | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Load view preference and inventory
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedView = localStorage.getItem(VIEW_PREF_KEY);
        if (savedView === 'list' || savedView === 'card') {
            setViewMode(savedView);
        }
        setInventory(getInventoryFromStorage());
    }, []);

    // Save view preference
    const handleViewChange = (mode: 'card' | 'list') => {
        setViewMode(mode);
        localStorage.setItem(VIEW_PREF_KEY, mode);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
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

    const getStock = useCallback((fccId: string): number => {
        const item = inventory.find(i => i.itemKey === fccId && i.type === 'key');
        return item?.qty || 0;
    }, [inventory]);

    const updateStock = useCallback((fccId: string, delta: number, vehicles: string = '') => {
        setInventory(prev => {
            const existing = prev.find(i => i.itemKey === fccId && i.type === 'key');
            let updated: InventoryItem[];

            if (existing) {
                const newQty = Math.max(0, existing.qty + delta);
                if (newQty === 0) {
                    updated = prev.filter(i => !(i.itemKey === fccId && i.type === 'key'));
                } else {
                    updated = prev.map(i =>
                        i.itemKey === fccId && i.type === 'key'
                            ? { ...i, qty: newQty }
                            : i
                    );
                }
            } else if (delta > 0) {
                updated = [...prev, {
                    itemKey: fccId,
                    type: 'key',
                    qty: delta,
                    vehicle: vehicles,
                    fcc_id: fccId
                }];
            } else {
                updated = prev;
            }

            saveInventoryToStorage(updated);
            return updated;
        });
    }, []);

    const handleLogJob = (row: FccRow) => {
        setSelectedFcc(row);
        setJobModalOpen(true);
    };

    const handleJobSubmit = (job: JobFormData) => {
        addJobLogToStorage({
            vehicle: job.vehicle,
            fccId: job.fccId,
            keyType: job.keyType,
            jobType: job.jobType,
            price: job.price,
            date: job.date,
            notes: job.notes,
        });
        // Optionally auto-decrement inventory
        if (job.fccId) {
            updateStock(job.fccId, -1);
        }
        setJobModalOpen(false);
        setSelectedFcc(null);
    };

    const getKeyType = (row: FccRow): TagType => {
        // Prefer server-provided key_type from fcc_complete table
        if (row.key_type && ['smart', 'flip', 'remote-head', 'transponder', 'mechanical'].includes(row.key_type)) {
            return row.key_type as TagType;
        }

        // Fallback to client-side guessing for older data without key_type
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
        const activeTagsString = searchParams?.get('tags');
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
            {/* Header with View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        FCC ID Intelligence
                    </h1>
                    <p className="text-zinc-400 mt-2">Verified frequency and chip database for locksmiths.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex p-1 rounded-lg bg-zinc-900/50 border border-zinc-800">
                        <button
                            onClick={() => handleViewChange('card')}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'card'
                                ? 'bg-zinc-700 text-white'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            ▦ Cards
                        </button>
                        <button
                            onClick={() => handleViewChange('list')}
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'list'
                                ? 'bg-zinc-700 text-white'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            ≡ List
                        </button>
                    </div>

                    {/* Key Type Filter */}
                    <div className="flex p-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm overflow-x-auto max-w-full">
                        {['all', 'smart', 'remote-head', 'transponder'].map((type) => (
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
            </div>

            {/* Search */}
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

            {/* Active filters */}
            {searchParams?.get('tags') && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Active Filters:</span>
                    {searchParams?.get('tags')?.split(',').map(tag => (
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

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-zinc-900/50 rounded-2xl border border-zinc-800 animate-pulse" />
                    ))}
                </div>
            ) : viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                                    <th className="text-left px-2 py-3 text-xs font-bold text-zinc-500 uppercase w-12"></th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase">FCC ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Vehicles</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase hidden md:table-cell">Freq</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase hidden lg:table-cell">Chip</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Stock</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.slice(0, 100).map((row) => {
                                    const stock = getStock(row.fcc_id);
                                    return (
                                        <tr key={row.fcc_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-2 py-2 w-12">
                                                {row.image_url ? (
                                                    <img
                                                        src={row.image_url}
                                                        alt={row.fcc_id}
                                                        className="w-10 h-10 object-contain rounded-lg bg-zinc-800"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <span className={row.image_url ? 'hidden' : 'text-xl'}>🔑</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono font-bold text-yellow-500">{row.fcc_id}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-zinc-300 line-clamp-1" title={row.vehicles}>
                                                    {row.vehicles.split(',').slice(0, 2).join(', ')}
                                                    {row.vehicles.split(',').length > 2 && ` +${row.vehicles.split(',').length - 2}`}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className="text-sm text-zinc-400">{row.frequency}</span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-sm text-zinc-400 truncate block max-w-[150px]" title={row.chip}>{row.chip || 'N/A'}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-block min-w-[2rem] px-2 py-1 rounded-lg text-sm font-bold ${stock > 0
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-zinc-800 text-zinc-500'
                                                    }`}>
                                                    {stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => updateStock(row.fcc_id, -1, row.vehicles)}
                                                        disabled={stock === 0}
                                                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-bold transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <button
                                                        onClick={() => updateStock(row.fcc_id, 1, row.vehicles)}
                                                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-green-600 text-lg font-bold transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => handleLogJob(row)}
                                                        className="ml-2 px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 text-xs font-bold transition-colors"
                                                        title="Log a job using this key"
                                                    >
                                                        📝 Log
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredData.length > 100 && (
                        <div className="p-4 text-center text-zinc-500 text-sm border-t border-zinc-800">
                            Showing 100 of {filteredData.length} results. Use search to narrow down.
                        </div>
                    )}
                </div>
            ) : (
                /* CARD VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.slice(0, 48).map((row) => {
                        const currentKeyType = getKeyType(row);
                        const stock = getStock(row.fcc_id);
                        return (
                            <div key={row.fcc_id} className="glass group relative transition-all hover:-translate-y-1 hover:border-zinc-700 flex flex-col h-full overflow-hidden">
                                {/* Product Image */}
                                {row.image_url ? (
                                    <div className="relative h-40 bg-zinc-800/50">
                                        <img
                                            src={row.image_url}
                                            alt={`${row.fcc_id} key fob`}
                                            className="w-full h-full object-contain p-4"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <div className="hidden absolute inset-0 flex items-center justify-center text-4xl text-zinc-600">🔑</div>
                                    </div>
                                ) : (
                                    <div className="h-32 bg-zinc-800/30 flex items-center justify-center">
                                        <span className="text-4xl text-zinc-700">🔑</span>
                                    </div>
                                )}

                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">FCC IDENTIFIER</span>
                                            <h2 className="text-2xl font-mono font-black text-yellow-500 group-hover:text-yellow-400 transition-colors">
                                                {row.fcc_id}
                                            </h2>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Tag label={currentKeyType.replace('-', ' ')} type={currentKeyType} clickable={false} />
                                            {stock > 0 && (
                                                <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold">
                                                    {stock} in stock
                                                </span>
                                            )}
                                        </div>
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

                                    <div className="mt-6 flex gap-2">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => updateStock(row.fcc_id, -1, row.vehicles)}
                                                disabled={stock === 0}
                                                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-lg font-bold transition-colors"
                                            >
                                                −
                                            </button>
                                            <button
                                                onClick={() => updateStock(row.fcc_id, 1, row.vehicles)}
                                                className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-green-600 text-lg font-bold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleLogJob(row)}
                                            className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 py-2.5 rounded-xl text-xs font-black transition-all"
                                        >
                                            📝 LOG JOB
                                        </button>
                                        <a
                                            href={`https://www.amazon.com/s?k=${row.fcc_id}&tag=${AFFILIATE_TAG}`}
                                            target="_blank"
                                            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all"
                                        >
                                            🛒
                                        </a>
                                    </div>
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

            {/* Job Log Modal */}
            <JobLogModal
                isOpen={jobModalOpen}
                onClose={() => { setJobModalOpen(false); setSelectedFcc(null); }}
                onSubmit={handleJobSubmit}
                prefillFccId={selectedFcc?.fcc_id || ''}
                prefillVehicle={selectedFcc?.vehicles.split(',')[0]?.trim() || ''}
            />
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
