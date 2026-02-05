'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FleetAccount, getFleetAccountsFromStorage } from '@/lib/fleetTypes';
import { Technician, getTechniciansFromStorage, getActiveTechnicians } from '@/lib/technicianTypes';
import { useFleetCustomers } from '@/lib/useFleetCustomers';

interface RecentCustomer {
    name: string;
    phone?: string;
    address?: string;
}

interface JobLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (job: JobFormData) => void;
    prefillFccId?: string;
    prefillVehicle?: string;
    prefillDate?: string;  // YYYY-MM-DD format for calendar date selection
    prefillCustomerName?: string;
    prefillCustomerPhone?: string;
    prefillCustomerAddress?: string;
    prefillNotes?: string;
    prefillPrice?: number;
    prefillJobType?: string;
    prefillReferralSource?: string;
    recentCustomers?: RecentCustomer[];
    fleetAccounts?: FleetAccount[];  // Optional fleet accounts for linking
}


export interface JobFormData {
    vehicle: string;
    fccId: string;
    keyType: string;
    jobType: 'add_key' | 'akl' | 'remote' | 'blade' | 'rekey' | 'lockout' | 'other';
    price: number;
    date: string;
    notes: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    fleetId?: string;          // Link to fleet account
    technicianId?: string;     // Assigned technician
    partsCost?: number;
    keyCost?: number;     // Cost of key/fob from AKS pricing
    serviceCost?: number; // Labor/service charge
    milesDriven?: number; // Miles driven for gas calculation
    gasCost?: number;     // Auto-calculated from miles (3.5$/gal at 30mpg = $0.117/mile)
    referralSource?: 'google' | 'yelp' | 'referral' | 'repeat' | 'other';
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

const JOB_TYPES = [
    { value: 'add_key', label: 'Add Key', icon: '🔑' },
    { value: 'akl', label: 'All Keys Lost', icon: '🚨' },
    { value: 'remote', label: 'Remote Only', icon: '📡' },
    { value: 'blade', label: 'Blade Cut', icon: '✂️' },
    { value: 'rekey', label: 'Rekey', icon: '🔄' },
    { value: 'lockout', label: 'Lockout', icon: '🚗' },
    { value: 'other', label: 'Other', icon: '🔧' },
];

const REFERRAL_SOURCES = [
    { value: 'google', label: 'Google' },
    { value: 'yelp', label: 'Yelp' },
    { value: 'referral', label: 'Referral' },
    { value: 'repeat', label: 'Repeat Customer' },
    { value: 'other', label: 'Other' },
];

export default function JobLogModal({ isOpen, onClose, onSubmit, prefillFccId = '', prefillVehicle = '', prefillDate, prefillCustomerName = '', prefillCustomerPhone = '', prefillCustomerAddress = '', prefillNotes = '', prefillPrice, prefillJobType, prefillReferralSource, recentCustomers = [], fleetAccounts }: JobLogModalProps) {
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [showCostTracking, setShowCostTracking] = useState(false);
    const [fccSuggestions, setFccSuggestions] = useState<Array<{ fcc_id: string; key_type: string; price?: number; button_count?: number; image_url?: string }>>([]);
    const [loadingFcc, setLoadingFcc] = useState(false);
    const [showFccPicker, setShowFccPicker] = useState(false);

    // Load fleet accounts if not provided
    const [loadedFleets, setLoadedFleets] = useState<FleetAccount[]>([]);
    useEffect(() => {
        if (!fleetAccounts) {
            setLoadedFleets(getFleetAccountsFromStorage());
        }
    }, [fleetAccounts]);

    const availableFleets = fleetAccounts || loadedFleets;

    // Load technicians for assignment
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    useEffect(() => {
        setTechnicians(getActiveTechnicians());
    }, []);

    // Community tips for the vehicle being logged
    const [communityTips, setCommunityTips] = useState<Array<{ content: string; user_name: string; score: number }>>([]);
    const [loadingTips, setLoadingTips] = useState(false);

    // Fleet customers management for saving customers
    const { addCustomer: addFleetCustomer, customerExists } = useFleetCustomers();
    const [customerSaved, setCustomerSaved] = useState(false);

    // Determine valid job type from prefill
    const validJobTypes = ['add_key', 'akl', 'remote', 'blade', 'rekey', 'lockout', 'other'] as const;
    const initialJobType = prefillJobType && validJobTypes.includes(prefillJobType as any)
        ? prefillJobType as JobFormData['jobType']
        : 'add_key';

    // Determine valid referral source from prefill
    const validSources = ['google', 'yelp', 'referral', 'repeat', 'other'] as const;
    const initialReferral = prefillReferralSource && validSources.includes(prefillReferralSource as any)
        ? prefillReferralSource as JobFormData['referralSource']
        : undefined;

    const [formData, setFormData] = useState<JobFormData>({
        vehicle: prefillVehicle,
        fccId: prefillFccId,
        keyType: '',
        jobType: initialJobType,
        price: prefillPrice || 0,
        date: prefillDate || new Date().toISOString().split('T')[0],
        notes: prefillNotes,
        customerName: prefillCustomerName,
        customerPhone: prefillCustomerPhone,
        customerAddress: prefillCustomerAddress,
        fleetId: '',
        partsCost: 0,
        keyCost: 0,
        serviceCost: 0,
        milesDriven: 0,
        gasCost: 0,
        referralSource: initialReferral,
        status: 'completed',
    });

    // Auto-show customer info section if prefilled
    useEffect(() => {
        if (prefillCustomerName || prefillCustomerPhone) {
            setShowCustomerInfo(true);
        }
    }, [prefillCustomerName, prefillCustomerPhone]);

    // Update date when prefillDate changes (e.g., from calendar selection)
    useEffect(() => {
        if (prefillDate) {
            setFormData(prev => ({ ...prev, date: prefillDate }));
        }
    }, [prefillDate]);

    // Handle fleet selection - auto-fill customer info from fleet
    const handleFleetSelect = (fleetId: string) => {
        const fleet = availableFleets.find(f => f.id === fleetId);
        if (fleet) {
            setFormData(prev => ({
                ...prev,
                fleetId: fleet.id,
                customerName: fleet.name,
                customerPhone: fleet.phone || prev.customerPhone,
                customerAddress: fleet.address || prev.customerAddress,
                referralSource: 'repeat'
            }));
            setShowCustomerInfo(true);  // Auto-show customer section
        } else {
            setFormData(prev => ({ ...prev, fleetId: '' }));
        }
    };

    // Save current customer to fleet customers
    const handleSaveCustomer = async () => {
        const name = formData.customerName?.trim();
        if (!name) return;

        if (customerExists(name)) {
            setCustomerSaved(true);
            return;
        }

        await addFleetCustomer({
            name,
            phone: formData.customerPhone,
            address: formData.customerAddress,
        });
        setCustomerSaved(true);
    };

    // Check if current customer can be saved
    const canSaveCustomer = (formData.customerName?.trim().length || 0) > 0
        && !customerExists(formData.customerName || '')
        && !customerSaved;

    // Keep track of last looked-up FCC ID to avoid duplicate lookups
    const lastLookedUpFcc = useRef<string>('');

    // Auto-lookup FCC details when FCC ID changes (with debounce)
    useEffect(() => {
        const fccId = formData.fccId.trim().toUpperCase();

        // Skip if empty, too short, or already looked up
        if (!fccId || fccId.length < 4 || fccId === lastLookedUpFcc.current) {
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                // Fetch FCC details from API
                const response = await fetch(`https://euro-keys.jeremy-samuels17.workers.dev/api/fcc-detail/${encodeURIComponent(fccId)}`);
                if (!response.ok) return;

                const data = await response.json();
                lastLookedUpFcc.current = fccId;

                // Extract key type from first OEM part or FCC info
                let keyType = '';
                let estimatedKeyCost = 0;

                if (data.oem_parts && data.oem_parts.length > 0) {
                    const firstPart = data.oem_parts[0];
                    // Determine key type from key_type field or buttons
                    if (firstPart.vehicles?.[0]?.key_type) {
                        const kt = firstPart.vehicles[0].key_type.toLowerCase();
                        if (kt.includes('smart')) keyType = 'Smart Key';
                        else if (kt.includes('flip')) keyType = 'Flip Key';
                        else if (kt.includes('remote head') || kt.includes('rhk')) keyType = 'Remote Head Key';
                        else if (kt.includes('transponder')) keyType = 'Transponder Key';
                        else if (kt.includes('remote')) keyType = 'Remote';
                        else keyType = firstPart.vehicles[0].key_type;
                    }

                    // Estimate key cost based on type
                    // Smart keys: $40-75 aftermarket, Remote head: $30-50, Transponder: $15-30
                    const ktLower = keyType.toLowerCase();
                    if (ktLower.includes('smart')) estimatedKeyCost = 55;
                    else if (ktLower.includes('flip')) estimatedKeyCost = 45;
                    else if (ktLower.includes('remote head')) estimatedKeyCost = 40;
                    else if (ktLower.includes('transponder')) estimatedKeyCost = 25;
                    else if (ktLower.includes('remote')) estimatedKeyCost = 35;
                }

                // Auto-fill if we got data and fields are empty
                setFormData(prev => ({
                    ...prev,
                    keyType: prev.keyType || keyType,
                    keyCost: prev.keyCost || estimatedKeyCost
                }));
            } catch (err) {
                console.error('FCC detail lookup error:', err);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.fccId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        // Reset form
        setFormData({
            vehicle: '',
            fccId: '',
            keyType: '',
            jobType: 'add_key',
            price: 0,
            date: new Date().toISOString().split('T')[0],
            notes: '',
            customerName: '',
            customerPhone: '',
            customerAddress: '',
            fleetId: '',
            partsCost: 0,
            keyCost: 0,
            gasCost: 0,
            referralSource: undefined,
            status: 'completed',
        });
        setShowCustomerInfo(false);
        setShowCostTracking(false);
        onClose();
    };

    const totalCosts = (formData.partsCost || 0) + (formData.keyCost || 0) + (formData.serviceCost || 0) + (formData.gasCost || 0);
    const profit = (formData.price || 0) - totalCosts;

    // Parse vehicle string to extract year, make, model
    const parseVehicle = (vehicleStr: string) => {
        // Format: "2023 Toyota Camry" or "Toyota Camry 2023"
        const parts = vehicleStr.trim().split(/\s+/);
        let year = '';
        let make = '';
        let model = '';

        for (const part of parts) {
            if (/^(19|20)\d{2}$/.test(part)) {
                year = part;
            } else if (!make) {
                make = part;
            } else {
                model = model ? `${model} ${part}` : part;
            }
        }
        return { year, make, model };
    };

    // Lookup all key types for current vehicle (using vehicle-products-v2 for complete coverage)
    const lookupFccIds = async (vehicleInput?: string) => {
        const vehicle = vehicleInput || formData.vehicle;
        if (!vehicle.trim()) return;

        setLoadingFcc(true);
        setFccSuggestions([]);

        try {
            const { year, make, model } = parseVehicle(vehicle);
            if (!make || !model) {
                setLoadingFcc(false);
                return;
            }

            const params = new URLSearchParams();
            params.set('make', make);
            params.set('model', model);
            if (year) params.set('year', year);

            // Use vehicle-products-v2 which includes ALL key types (smart, transponder, RHK, etc.)
            const response = await fetch(`https://euro-keys.jeremy-samuels17.workers.dev/api/vehicle-products-v2?${params}`);
            if (response.ok) {
                const data = await response.json();
                const products = data.products || [];

                // Filter to only include actual keys (not shells, blades, or batteries)
                const keyProducts = products.filter((p: any) => {
                    const type = (p.product_type || p.type || '').toLowerCase();
                    return type.includes('smart') ||
                        type.includes('remote') ||
                        type.includes('transponder') ||
                        type.includes('flip') ||
                        type.includes('fobik') ||
                        type === 'mechanical key';
                });

                // Map to suggestion format
                const suggestions = keyProducts.slice(0, 8).map((p: any) => {
                    // Get FCC ID if available (first one from array)
                    const fccIds = p.fcc_ids || [];
                    const fccId = fccIds[0]?.split(/[\s\\n]/)[0]?.trim() || '';

                    // Get first image
                    const imageUrl = p.images?.[0] || '';

                    // Calculate price from price_range
                    const minPrice = p.price_range?.min || 0;
                    let estimatedCost = Math.round(minPrice) || 35;
                    // Adjust estimates for aftermarket prices
                    const keyType = (p.type || p.product_type || '').toLowerCase();
                    if (keyType.includes('smart')) estimatedCost = Math.max(estimatedCost, 45);
                    else if (keyType.includes('remote head')) estimatedCost = Math.max(estimatedCost, 25);
                    else if (keyType.includes('transponder')) estimatedCost = Math.max(estimatedCost, 10);

                    return {
                        fcc_id: fccId || `(${p.type || 'Key'})`,
                        key_type: p.type || p.product_type || 'Key',
                        price: estimatedCost,
                        button_count: p.buttons ? parseInt(p.buttons) : undefined,
                        image_url: imageUrl
                    };
                });

                setFccSuggestions(suggestions);

                // Auto-fill if only one result
                if (suggestions.length === 1) {
                    const key = suggestions[0];
                    setFormData(prev => ({
                        ...prev,
                        fccId: key.fcc_id.startsWith('(') ? '' : key.fcc_id, // Don't fill placeholder
                        keyType: key.key_type,
                        keyCost: key.price || 0
                    }));
                    setFccSuggestions([]); // Clear since auto-filled
                } else if (suggestions.length > 1) {
                    setShowFccPicker(true);
                }
            }
        } catch (err) {
            console.error('FCC lookup error:', err);
        }
        setLoadingFcc(false);
    };

    // Auto-lookup FCC IDs when vehicle changes (debounced)
    const lastVehicleLookup = useRef<string>('');
    useEffect(() => {
        const vehicle = formData.vehicle.trim();

        // Skip if empty, too short, or same as last lookup
        if (!vehicle || vehicle.length < 8 || vehicle === lastVehicleLookup.current) {
            return;
        }

        // Only trigger if we have make, model, and year
        const { year, make, model } = parseVehicle(vehicle);
        if (!year || !make || !model) return;

        const timeoutId = setTimeout(() => {
            lastVehicleLookup.current = vehicle;
            lookupFccIds(vehicle);
        }, 800); // 800ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.vehicle]);

    // Fetch community tips when vehicle changes
    useEffect(() => {
        const vehicle = formData.vehicle.trim();
        if (!vehicle || vehicle.length < 8) {
            setCommunityTips([]);
            return;
        }

        const { year, make, model } = parseVehicle(vehicle);
        if (!make || !model) return;

        const fetchTips = async () => {
            setLoadingTips(true);
            try {
                const vehicleKey = encodeURIComponent(`${make}|${model}${year ? `|${year}` : ''}`);
                const res = await fetch(`https://euro-keys.jeremy-samuels17.workers.dev/api/vehicle-comments?vehicle_key=${vehicleKey}`);
                if (res.ok) {
                    const data = await res.json();
                    const comments = (data.comments || [])
                        .filter((c: any) => (c.upvotes - (c.downvotes || 0)) >= 1)
                        .slice(0, 3)
                        .map((c: any) => ({
                            content: c.content,
                            user_name: c.user_name,
                            score: c.upvotes - (c.downvotes || 0)
                        }));
                    setCommunityTips(comments);
                }
            } catch (err) {
                console.error('Failed to fetch community tips:', err);
            }
            setLoadingTips(false);
        };

        const timeoutId = setTimeout(fetchTips, 1000); // 1s debounce
        return () => clearTimeout(timeoutId);
    }, [formData.vehicle]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        Log Job
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Vehicle */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Vehicle *
                            {loadingFcc && <span className="ml-2 text-yellow-500 animate-pulse">⏳ Finding keys...</span>}
                        </label>
                        <input
                            type="text"
                            placeholder="2023 Toyota Camry"
                            value={formData.vehicle}
                            onChange={e => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            required
                        />
                    </div>

                    {/* FCC ID / Key */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                FCC ID
                                <button
                                    type="button"
                                    onClick={() => lookupFccIds()}
                                    disabled={loadingFcc || !formData.vehicle.trim()}
                                    className="ml-2 text-zinc-400 hover:text-zinc-300 disabled:text-zinc-600 text-xs normal-case font-medium"
                                    title="Suggest FCC IDs for vehicle"
                                >
                                    {loadingFcc ? '⏳' : '🔍'}
                                </button>
                                <a
                                    href={`/fcc?search=${encodeURIComponent(formData.fccId || '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        if (!formData.fccId.trim()) {
                                            e.preventDefault();
                                            return;
                                        }
                                    }}
                                    className={`ml-1 text-xs normal-case font-medium ${formData.fccId.trim() ? 'text-yellow-500 hover:text-yellow-400 cursor-pointer' : 'text-zinc-600 cursor-not-allowed'}`}
                                    title={formData.fccId.trim() ? 'Open FCC page in new tab' : 'Enter an FCC ID first'}
                                >
                                    Lookup
                                </a>
                            </label>
                            <input
                                type="text"
                                placeholder="HYQ14FBA"
                                value={formData.fccId}
                                onChange={e => setFormData(prev => ({ ...prev, fccId: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 font-mono text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                            {/* FCC Suggestions with Images */}
                            {fccSuggestions.length > 0 && showFccPicker && (
                                <div className="mt-2 relative">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-zinc-400">Select key:</span>
                                        <button
                                            type="button"
                                            onClick={() => { setShowFccPicker(false); setFccSuggestions([]); }}
                                            className="text-xs text-zinc-500 hover:text-zinc-400"
                                        >
                                            ✕ Close
                                        </button>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
                                        {fccSuggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        fccId: s.fcc_id,
                                                        keyType: s.key_type || prev.keyType,
                                                        keyCost: s.price || prev.keyCost
                                                    }));
                                                    setFccSuggestions([]);
                                                    setShowFccPicker(false);
                                                }}
                                                className="flex-shrink-0 w-24 bg-zinc-800 border border-zinc-700 rounded-xl p-2 hover:border-yellow-500/50 hover:bg-zinc-750 transition-all"
                                            >
                                                {s.image_url ? (
                                                    <img
                                                        src={s.image_url}
                                                        alt={s.fcc_id}
                                                        className="w-full h-16 object-contain rounded-lg bg-zinc-900 mb-1"
                                                    />
                                                ) : (
                                                    <div className="w-full h-16 bg-zinc-900 rounded-lg flex items-center justify-center text-2xl mb-1">
                                                        🔑
                                                    </div>
                                                )}
                                                <div className="text-xs font-mono text-yellow-500 truncate">{s.fcc_id}</div>
                                                <div className="text-xs text-zinc-500">{s.key_type}</div>
                                                {s.price && <div className="text-xs text-green-500">${s.price}</div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Key Type
                            </label>
                            <input
                                type="text"
                                placeholder="Smart Key"
                                value={formData.keyType}
                                onChange={e => setFormData(prev => ({ ...prev, keyType: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                        </div>
                    </div>

                    {/* Job Type - Now 4x2 grid */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Job Type
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {JOB_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, jobType: type.value as JobFormData['jobType'] }))}
                                    className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${formData.jobType === type.value
                                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                        }`}
                                >
                                    <span className="text-lg">{type.icon}</span>
                                    <span className="truncate w-full text-center">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Community Tips Panel */}
                    {(communityTips.length > 0 || loadingTips) && (
                        <div className="p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm">💡</span>
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                                    Community Tips
                                </span>
                                {loadingTips && (
                                    <span className="text-xs text-zinc-500 animate-pulse">Loading...</span>
                                )}
                            </div>
                            {communityTips.length > 0 && (
                                <div className="space-y-2">
                                    {communityTips.map((tip, i) => (
                                        <div key={i} className="text-sm text-zinc-300">
                                            <span className="text-purple-400">•</span>{' '}
                                            <span className="line-clamp-2">{tip.content}</span>
                                            <span className="text-xs text-zinc-500 ml-1">
                                                — {tip.user_name} ({tip.score > 0 ? '+' : ''}{tip.score})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Price & Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                placeholder="150"
                                min="0"
                                step="0.01"
                                value={formData.price || ''}
                                onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-green-400 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                        </div>
                    </div>

                    {/* Optional Sections Toggle */}
                    <div className="flex gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${showCustomerInfo
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                                }`}
                        >
                            👤 Customer Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCostTracking(!showCostTracking)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${showCostTracking
                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                                }`}
                        >
                            💰 Cost Tracking
                        </button>
                    </div>

                    {/* Fleet Account Selector */}
                    {availableFleets.length > 0 && (
                        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                🚗 Fleet Account (optional)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {availableFleets.slice(0, 4).map(fleet => (
                                    <button
                                        key={fleet.id}
                                        type="button"
                                        onClick={() => handleFleetSelect(fleet.id)}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${formData.fleetId === fleet.id
                                            ? 'bg-blue-500/30 border-blue-500/60 text-blue-300'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                            }`}
                                    >
                                        🚗 {fleet.name}
                                        {fleet.vehicles.length > 0 && (
                                            <span className="ml-1 text-zinc-500">({fleet.vehicles.length})</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {availableFleets.length > 4 && (
                                <select
                                    value={formData.fleetId || ''}
                                    onChange={(e) => handleFleetSelect(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                >
                                    <option value="">Select fleet account...</option>
                                    {availableFleets.map(fleet => (
                                        <option key={fleet.id} value={fleet.id}>
                                            {fleet.name} ({fleet.vehicles.length} vehicles)
                                        </option>
                                    ))}
                                </select>
                            )}
                            {formData.fleetId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, fleetId: '' }));
                                    }}
                                    className="mt-2 text-xs text-zinc-500 hover:text-zinc-400"
                                >
                                    ✕ Clear fleet selection
                                </button>
                            )}
                        </div>
                    )}

                    {/* Technician Assignment */}
                    {technicians.length > 0 && (
                        <div className="p-4 bg-green-950/30 rounded-xl border border-green-900/30">
                            <label className="block text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                                👷 Assign Technician (optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {technicians.map(tech => (
                                    <button
                                        key={tech.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            technicianId: prev.technicianId === tech.id ? '' : tech.id
                                        }))}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${formData.technicianId === tech.id
                                            ? 'bg-green-500/30 border-green-500/60 text-green-300'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                            }`}
                                    >
                                        👷 {tech.name}
                                        {tech.role && <span className="ml-1 text-zinc-500">({tech.role})</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Customer Info Section */}
                    {showCustomerInfo && (
                        <div className="space-y-3 p-4 bg-blue-950/30 rounded-xl border border-blue-900/30">
                            {/* Quick-fill from recent customers */}
                            {recentCustomers.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        ⚡ Quick Fill
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {recentCustomers.slice(0, 5).map((customer, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setFormData(prev => ({
                                                    ...prev,
                                                    customerName: customer.name,
                                                    customerPhone: customer.phone || prev.customerPhone,
                                                    customerAddress: customer.address || prev.customerAddress,
                                                    referralSource: 'repeat'
                                                }))}
                                                className="text-xs px-2.5 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                                            >
                                                👤 {customer.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Smith"
                                    value={formData.customerName || ''}
                                    onChange={e => {
                                        setFormData(prev => ({ ...prev, customerName: e.target.value }));
                                        setCustomerSaved(false);
                                    }}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="555-123-4567"
                                        value={formData.customerPhone || ''}
                                        onChange={e => {
                                            setFormData(prev => ({ ...prev, customerPhone: e.target.value }));
                                            setCustomerSaved(false);
                                        }}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        Referral
                                    </label>
                                    <select
                                        value={formData.referralSource || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, referralSource: e.target.value as JobFormData['referralSource'] || undefined }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    >
                                        <option value="">Select...</option>
                                        {REFERRAL_SOURCES.map(source => (
                                            <option key={source.value} value={source.value}>{source.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="123 Main St, City, ST"
                                    value={formData.customerAddress || ''}
                                    onChange={e => {
                                        setFormData(prev => ({ ...prev, customerAddress: e.target.value }));
                                        setCustomerSaved(false);
                                    }}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>

                            {/* Add Customer Button */}
                            <div className="flex items-center gap-2 pt-2">
                                {canSaveCustomer && (
                                    <button
                                        type="button"
                                        onClick={handleSaveCustomer}
                                        className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                                    >
                                        👤 Save to My Customers
                                    </button>
                                )}
                                {customerSaved && (
                                    <span className="text-sm text-zinc-500 flex items-center gap-1">
                                        ✓ Customer saved
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cost Tracking Section */}
                    {showCostTracking && (
                        <div className="space-y-3 p-4 bg-green-950/30 rounded-xl border border-green-900/30">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">
                                        🔑 Key Cost ($)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="45"
                                        min="0"
                                        step="0.01"
                                        value={formData.keyCost || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, keyCost: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 text-yellow-400 font-bold"
                                    />
                                    <div className="text-[10px] text-zinc-500 mt-1">From AKS pricing</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                                        ⚙️ Service Cost ($)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="75"
                                        min="0"
                                        step="0.01"
                                        value={formData.serviceCost || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, serviceCost: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-purple-400 font-bold"
                                    />
                                    <div className="text-[10px] text-zinc-500 mt-1">Labor charge</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        ⛽ Miles Driven
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="25"
                                        min="0"
                                        step="1"
                                        value={formData.milesDriven || ''}
                                        onChange={e => {
                                            const miles = parseFloat(e.target.value) || 0;
                                            // Calculate gas cost: $3.50/gallon at 30mpg = $0.117/mile
                                            const gasCost = Math.round(miles * 0.117 * 100) / 100;
                                            setFormData(prev => ({ ...prev, milesDriven: miles, gasCost }));
                                        }}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-blue-400 font-bold"
                                    />
                                    <div className="text-[10px] text-zinc-500 mt-1">= ${((formData.milesDriven || 0) * 0.117).toFixed(2)} gas (30mpg @ $3.50)</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                                        🔧 Other Parts ($)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        value={formData.partsCost || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, partsCost: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-orange-400 font-bold"
                                    />
                                    <div className="text-[10px] text-zinc-500 mt-1">Blades, batteries, etc.</div>
                                </div>
                            </div>
                            {/* Profit Summary */}
                            <div className="bg-zinc-800/50 rounded-lg p-3 flex justify-between items-center">
                                <div className="text-sm">
                                    <span className="text-zinc-500">Total Costs: </span>
                                    <span className="text-red-400 font-bold">${totalCosts.toFixed(2)}</span>
                                </div>
                                <div className="text-lg">
                                    <span className="text-zinc-500">Profit: </span>
                                    <span className={`font-black ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${profit.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            placeholder="Customer notes, issues, etc..."
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500/30 resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black py-4 rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20"
                    >
                        Log Job ✓
                    </button>
                </form>
            </div>
        </div>
    );
}
