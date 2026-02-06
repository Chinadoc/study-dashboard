'use client';

import React, { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Tag, { TagType } from '@/components/shared/Tag';
import { API_BASE, AFFILIATE_TAG } from '@/lib/config';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { addJobLogToStorage } from '@/lib/useJobLogs';
import { trackFCCView, trackAffiliateClick, trackEvent } from '@/lib/analytics';
import { useInventory } from '@/contexts/InventoryContext';
import { useAuth } from '@/contexts/AuthContext';
import OwnedBadge from '@/components/shared/OwnedBadge';
import TourBanner from '@/components/onboarding/TourBanner';

// Free tier limits
const FREE_FCC_LIMIT = 3;

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

const VIEW_PREF_KEY = 'eurokeys_fcc_view';

// Click-to-expand vehicles popover component
function VehiclesPopover({
    vehicles,
    maxVisible = 2,
    variant = 'list'
}: {
    vehicles: string;
    maxVisible?: number;
    variant?: 'list' | 'card'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const vehicleList = vehicles ? vehicles.split(',').map(v => v.trim()).filter(Boolean) : [];
    const visibleVehicles = vehicleList.slice(0, maxVisible);
    const hiddenCount = vehicleList.length - maxVisible;

    if (vehicleList.length === 0) {
        return <span className="text-zinc-500 text-sm italic">No vehicles</span>;
    }

    return (
        <div className="relative">
            {variant === 'list' ? (
                // List view - inline text with clickable +N
                <span className="text-sm text-zinc-300">
                    {visibleVehicles.join(', ')}
                    {hiddenCount > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                            className="ml-1 text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                        >
                            +{hiddenCount}
                        </button>
                    )}
                </span>
            ) : (
                // Card view - tags with clickable +N
                <div className="flex flex-wrap gap-2">
                    {visibleVehicles.map((v, i) => (
                        <Tag key={i} label={v} type="platform" />
                    ))}
                    {hiddenCount > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                            className="text-[10px] text-yellow-500 hover:text-yellow-400 bg-zinc-800/50 hover:bg-zinc-700/50 px-2 py-1 rounded-md font-medium transition-all"
                        >
                            +{hiddenCount} more
                        </button>
                    )}
                </div>
            )}

            {/* Expanded popover */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-50 left-0 top-full mt-2 w-80 max-h-64 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">All Compatible Vehicles ({vehicleList.length})</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {vehicleList.map((v, i) => (
                                <span
                                    key={i}
                                    className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg"
                                >
                                    {v}
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Extract a clean "YEAR Make Model" vehicle name from the raw FCC vehicles string.
 * Raw format: "Dodge Ram (2013-2013),Dodge Ram (2014-2014),Lexus ES350 (2009-2009),..."
 * Returns: "2013 Dodge Ram" (uses the first entry, extracts the start year)
 */
function cleanVehicleName(raw: string): string {
    if (!raw) return '';
    const first = raw.split(',')[0]?.trim() || '';
    if (!first) return '';

    // Match "Make Model (StartYear-EndYear)" or "Make Model (Year)"
    const match = first.match(/^(.+?)\s*\((\d{4})(?:-\d{4})?\)\s*$/);
    if (match) {
        const makeModel = match[1].trim();
        const year = match[2];
        return `${year} ${makeModel}`;
    }

    // If no year-range pattern, return as-is (already clean)
    return first;
}

function FccContent() {
    const [data, setData] = useState<FccRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [keyType, setKeyType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 100;
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [jobModalOpen, setJobModalOpen] = useState(false);
    const [selectedFcc, setSelectedFcc] = useState<FccRow | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get Pro status from auth
    const { isPro, login, isAuthenticated } = useAuth();

    // Use shared inventory context
    const { getQuantity, updateQuantity } = useInventory();

    // Wrapper for compatibility with existing usage
    const getStock = useCallback((fccId: string): number => {
        return getQuantity(fccId);
    }, [getQuantity]);

    const updateStock = useCallback((fccId: string, delta: number, vehicles: string = '') => {
        updateQuantity(fccId, delta, vehicles);
    }, [updateQuantity]);

    // Load view preference
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedView = localStorage.getItem(VIEW_PREF_KEY);
        if (savedView === 'list' || savedView === 'card') {
            setViewMode(savedView);
        }
    }, []);

    // Initialize search from URL query param
    useEffect(() => {
        const searchQuery = searchParams?.get('search');
        if (searchQuery) {
            setSearch(searchQuery);
        }
    }, [searchParams]);


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

    const handleLogJob = (row: FccRow) => {
        trackFCCView(row.fcc_id);  // Track FCC engagement
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
            status: 'completed',
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
        if (row.key_type && ['smart', 'flip', 'remote-head', 'remote', 'transponder', 'mechanical'].includes(row.key_type)) {
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

        // Remote-only keys: have FCC ID + frequency but no transponder chip
        if ((chip.includes('non-transponder') || chip === 'na' || chip === '' || chip === 'n/a') && freq > 0) {
            return 'remote';
        }

        // Mechanical keys: no chip AND no frequency (pure blade)
        if ((chip.includes('non-transponder') || chip === 'na' || chip === '' || chip === 'n/a') && freq === 0) {
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

    // Limit results for non-Pro users
    const displayData = useMemo(() => {
        if (isPro) return filteredData;
        return filteredData.slice(0, FREE_FCC_LIMIT);
    }, [filteredData, isPro]);

    // Count locked results for paywall display
    const lockedCount = isPro ? 0 : Math.max(0, filteredData.length - FREE_FCC_LIMIT);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, keyType, searchParams]);

    return (
        <div className="space-y-8 py-6">
            <TourBanner tourId="fcc-power-user" storageKey="eurokeys_fcc_first_visit" />
            {/* Header with View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        FCC ID Intelligence
                    </h1>
                    <p className="text-zinc-400 mt-2">Verified frequency and chip database for locksmiths.</p>
                </div>

                {/* Controls - Stack on mobile */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

                    {/* Key Type Filter - Scrollable on mobile */}
                    <div className="flex p-1 rounded-xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm overflow-x-auto scrollbar-hide flex-1 md:flex-auto min-w-0">
                        {['all', 'smart', 'remote-head', 'transponder'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setKeyType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap flex-shrink-0 ${keyType === type
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
                    {/* Desktop Table - Hidden on Mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-900/80">
                                    <th className="text-left px-3 py-3 text-xs font-bold text-zinc-500 uppercase w-20">Image</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase">FCC ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Vehicles</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase hidden lg:table-cell">Freq</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-zinc-500 uppercase hidden lg:table-cell">Chip</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Stock</th>
                                    <th className="text-center px-4 py-3 text-xs font-bold text-zinc-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((row) => {
                                    const stock = getStock(row.fcc_id);
                                    return (
                                        <tr key={row.fcc_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-3 py-3">
                                                {row.image_url ? (
                                                    <img
                                                        src={row.image_url}
                                                        alt={row.fcc_id}
                                                        className="w-14 h-14 object-contain rounded-lg bg-zinc-800"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <span className={row.image_url ? 'hidden' : 'text-2xl'}>🔑</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono font-bold text-yellow-500">{row.fcc_id}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <VehiclesPopover vehicles={row.vehicles} maxVisible={2} variant="list" />
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
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
                                {/* Paywall Row */}
                                {lockedCount > 0 && (
                                    <tr className="bg-gradient-to-r from-amber-900/20 to-zinc-900">
                                        <td colSpan={7} className="px-6 py-6 text-center">
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                                <span className="text-2xl">🔒</span>
                                                <span className="text-zinc-300 font-medium">+{lockedCount} more FCC IDs available with Pro</span>
                                                <button
                                                    onClick={() => router.push('/pricing')}
                                                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
                                                >
                                                    Upgrade →
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List View - Stacked Cards */}
                    <div className="md:hidden divide-y divide-zinc-800">
                        {displayData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((row) => {
                            const stock = getStock(row.fcc_id);
                            return (
                                <div key={row.fcc_id} className="p-4">
                                    <div className="flex gap-4">
                                        {/* Large Image with FCC ID below */}
                                        <div className="flex-shrink-0 flex flex-col items-center w-24">
                                            {row.image_url ? (
                                                <img
                                                    src={row.image_url}
                                                    alt={row.fcc_id}
                                                    className="w-20 h-20 object-contain rounded-xl bg-zinc-800"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center">
                                                    <span className="text-3xl">🔑</span>
                                                </div>
                                            )}
                                            {/* FCC ID under image */}
                                            <span className="mt-2 font-mono font-bold text-yellow-500 text-xs text-center break-all leading-tight">{row.fcc_id}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Vehicles */}
                                            <div className="mb-2">
                                                <VehiclesPopover vehicles={row.vehicles} maxVisible={2} variant="list" />
                                            </div>
                                            {/* Frequency */}
                                            <div className="text-sm text-zinc-400 mb-3">{row.frequency}</div>

                                            {/* Actions Row */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Stock */}
                                                <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${stock > 0
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-zinc-800 text-zinc-500'
                                                    }`}>
                                                    {stock}
                                                </span>
                                                {/* +/- buttons */}
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
                                                {/* Log button */}
                                                <button
                                                    onClick={() => handleLogJob(row)}
                                                    className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 text-xs font-bold transition-colors"
                                                >
                                                    📝 Log
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Mobile Paywall Card */}
                        {lockedCount > 0 && (
                            <div className="p-6 text-center bg-gradient-to-b from-amber-900/20 to-zinc-900">
                                <span className="text-3xl block mb-3">🔒</span>
                                <p className="text-zinc-300 font-medium mb-4">+{lockedCount} more FCC IDs with Pro</p>
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors"
                                >
                                    Upgrade to Pro →
                                </button>
                            </div>
                        )}
                    </div>
                    {filteredData.length > ITEMS_PER_PAGE && (
                        <div className="p-4 flex items-center justify-between border-t border-zinc-800">
                            <span className="text-zinc-500 text-sm">
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} results
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                                >
                                    ← Previous
                                </button>
                                <span className="text-zinc-400 text-sm px-3">
                                    Page {currentPage} of {Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredData.length / ITEMS_PER_PAGE), p + 1))}
                                    disabled={currentPage >= Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                                    className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* CARD VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((row) => {
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
                                            <VehiclesPopover vehicles={row.vehicles} maxVisible={4} variant="card" />
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
                                        <button
                                            onClick={() => {
                                                const url = `https://www.amazon.com/s?k=${row.fcc_id}&tag=${AFFILIATE_TAG}`;
                                                trackAffiliateClick(row.fcc_id, url, 'fcc_page');
                                                window.open(url, '_blank');
                                            }}
                                            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all"
                                        >
                                            🛒
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Paywall Card - shown when there are locked results */}
                    {lockedCount > 0 && (
                        <div className="glass relative flex flex-col h-full overflow-hidden border-2 border-dashed border-amber-500/30 bg-gradient-to-br from-amber-900/10 to-zinc-900">
                            <div className="h-32 bg-zinc-800/30 flex items-center justify-center">
                                <span className="text-5xl">🔒</span>
                            </div>
                            <div className="p-6 flex flex-col flex-1 items-center justify-center text-center">
                                <h3 className="text-xl font-bold text-white mb-2">
                                    +{lockedCount} More FCC IDs
                                </h3>
                                <p className="text-zinc-400 text-sm mb-6">
                                    Unlock the complete database with Pro
                                </p>
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-colors"
                                >
                                    Upgrade to Pro →
                                </button>
                                {!isAuthenticated && (
                                    <button
                                        onClick={() => login()}
                                        className="mt-3 text-zinc-400 hover:text-white text-sm underline transition-colors"
                                    >
                                        Already have Pro? Sign in
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Card View Pagination */}
            {!loading && viewMode === 'card' && filteredData.length > ITEMS_PER_PAGE && (
                <div className="mt-6 p-4 flex items-center justify-center gap-4 glass">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                    >
                        ← Previous
                    </button>
                    <span className="text-zinc-400 text-sm">
                        Page {currentPage} of {Math.ceil(filteredData.length / ITEMS_PER_PAGE)} ({filteredData.length} total)
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredData.length / ITEMS_PER_PAGE), p + 1))}
                        disabled={currentPage >= Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                    >
                        Next →
                    </button>
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
                prefillVehicle={cleanVehicleName(selectedFcc?.vehicles || '')}
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
