'use client';

import React, { useState, useEffect, useRef } from 'react';

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
    recentCustomers?: RecentCustomer[];
}

export interface JobFormData {
    vehicle: string;
    fccId: string;
    keyType: string;
    jobType: 'add_key' | 'akl' | 'remote' | 'blade' | 'rekey' | 'lockout' | 'other';
    price: number;
    date: string;
    notes: string;
    // New fields
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    partsCost?: number;
    keyCost?: number;     // Cost of key/fob itself (~$30-75 aftermarket, $150-400 OEM)
    gasCost?: number;     // Travel/mileage cost (~$10-30 local, $30-75 extended)
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

export default function JobLogModal({ isOpen, onClose, onSubmit, prefillFccId = '', prefillVehicle = '', recentCustomers = [] }: JobLogModalProps) {
    const [showCustomerInfo, setShowCustomerInfo] = useState(false);
    const [showCostTracking, setShowCostTracking] = useState(false);
    const [fccSuggestions, setFccSuggestions] = useState<Array<{ fcc_id: string; key_type: string; price?: number; button_count?: number; image_url?: string }>>([]);
    const [loadingFcc, setLoadingFcc] = useState(false);
    const [showFccPicker, setShowFccPicker] = useState(false);

    const [formData, setFormData] = useState<JobFormData>({
        vehicle: prefillVehicle,
        fccId: prefillFccId,
        keyType: '',
        jobType: 'add_key',
        price: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        partsCost: 0,
        keyCost: 0,
        gasCost: 0,
        referralSource: undefined,
        status: 'completed',
    });

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

    const totalCosts = (formData.partsCost || 0) + (formData.keyCost || 0) + (formData.gasCost || 0);
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

    // Lookup FCC IDs for current vehicle (enhanced with images)
    const lookupFccIds = async (vehicleInput?: string) => {
        const vehicle = vehicleInput || formData.vehicle;
        if (!vehicle.trim()) return;

        setLoadingFcc(true);
        setFccSuggestions([]);

        try {
            const { year, make, model } = parseVehicle(vehicle);
            if (!make) {
                setLoadingFcc(false);
                return;
            }

            const params = new URLSearchParams();
            params.set('make', make);
            if (model) params.set('model', model);
            if (year) params.set('year', year);

            const response = await fetch(`https://euro-keys.jeremy-samuels17.workers.dev/api/vehicle-keys?${params}`);
            if (response.ok) {
                const data = await response.json();
                const rawKeys = (data.keys || []).slice(0, 8);

                // Fetch images for each FCC ID from the FCC database
                const keysWithImages = await Promise.all(
                    rawKeys.map(async (k: any) => {
                        const fccId = k.fcc_id || 'Unknown';
                        let imageUrl = '';

                        // Try to get image from FCC database
                        try {
                            const fccRes = await fetch(`https://euro-keys.jeremy-samuels17.workers.dev/api/fcc?q=${encodeURIComponent(fccId)}&limit=1`);
                            if (fccRes.ok) {
                                const fccData = await fccRes.json();
                                if (fccData.rows?.[0]?.image_url) {
                                    imageUrl = fccData.rows[0].image_url;
                                }
                            }
                        } catch {
                            // Ignore image fetch errors
                        }

                        // Calculate estimated key cost based on type
                        const keyType = k.key_type?.toLowerCase() || '';
                        let estimatedCost = 35;
                        if (keyType.includes('smart')) estimatedCost = 55;
                        else if (keyType.includes('flip')) estimatedCost = 45;
                        else if (keyType.includes('remote head') || keyType.includes('rhk')) estimatedCost = 40;
                        else if (keyType.includes('transponder')) estimatedCost = 25;

                        return {
                            fcc_id: fccId,
                            key_type: k.key_type || 'Key',
                            price: estimatedCost,
                            button_count: k.button_count,
                            image_url: imageUrl
                        };
                    })
                );

                // Deduplicate by FCC ID
                const uniqueKeys = keysWithImages.filter((key, idx, arr) =>
                    arr.findIndex(k => k.fcc_id === key.fcc_id) === idx
                );

                setFccSuggestions(uniqueKeys);

                // Auto-fill if only one result
                if (uniqueKeys.length === 1) {
                    const key = uniqueKeys[0];
                    setFormData(prev => ({
                        ...prev,
                        fccId: key.fcc_id,
                        keyType: key.key_type,
                        keyCost: key.price || 0
                    }));
                    setFccSuggestions([]); // Clear since auto-filled
                } else if (uniqueKeys.length > 1) {
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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
                                    onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
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
                                        onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
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
                                    onChange={e => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>
                    )}

                    {/* Cost Tracking Section */}
                    {showCostTracking && (
                        <div className="space-y-3 p-4 bg-green-950/30 rounded-xl border border-green-900/30">
                            <div className="grid grid-cols-3 gap-3">
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
                                    <div className="text-[10px] text-zinc-500 mt-1">Aftermarket: $35-75 | OEM: $150-400</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        ⛽ Gas/Travel ($)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="15"
                                        min="0"
                                        step="0.01"
                                        value={formData.gasCost || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, gasCost: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-blue-400 font-bold"
                                    />
                                    <div className="text-[10px] text-zinc-500 mt-1">Local: $10-20 | Extended: $30-75</div>
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
