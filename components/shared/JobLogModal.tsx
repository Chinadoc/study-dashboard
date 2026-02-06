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
    companyName?: string;
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
    technicianName?: string;   // Assigned technician name
    partsCost?: number;
    keyCost?: number;     // Cost of key/fob from AKS pricing
    serviceCost?: number; // Labor/service charge
    milesDriven?: number; // Miles driven for gas calculation
    gasCost?: number;     // Auto-calculated from miles (3.5$/gal at 30mpg = $0.117/mile)
    referralSource?: 'google' | 'yelp' | 'referral' | 'repeat' | 'other';
    status?:
    | 'appointment'
    | 'accepted'
    | 'in_progress'
    | 'on_hold'
    | 'closed'
    | 'cancelled'
    | 'pending_close'
    | 'pending_cancel'
    | 'estimate'
    | 'follow_up'
    | 'pending'
    | 'completed'
    | 'unassigned'
    | 'claimed';
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

const STATUS_OPTIONS: Array<{ value: NonNullable<JobFormData['status']>; label: string; color: string; icon: string }> = [
    { value: 'completed', label: 'Completed', color: 'green', icon: '✓' },
    { value: 'in_progress', label: 'In Progress', color: 'blue', icon: '▶' },
    { value: 'appointment', label: 'Appointment', color: 'purple', icon: '📅' },
    { value: 'accepted', label: 'Accepted', color: 'emerald', icon: '✓' },
    { value: 'estimate', label: 'Estimate', color: 'amber', icon: '💰' },
    { value: 'follow_up', label: 'Follow Up', color: 'orange', icon: '↩' },
    { value: 'on_hold', label: 'On Hold', color: 'yellow', icon: '⏸' },
    { value: 'pending', label: 'Pending', color: 'zinc', icon: '⏳' },
    { value: 'pending_close', label: 'Pending Close', color: 'zinc', icon: '⏳' },
    { value: 'pending_cancel', label: 'Pending Cancel', color: 'red', icon: '⏳' },
    { value: 'closed', label: 'Closed', color: 'zinc', icon: '✕' },
    { value: 'cancelled', label: 'Cancelled', color: 'red', icon: '✕' },
];

export default function JobLogModal({ isOpen, onClose, onSubmit, prefillFccId = '', prefillVehicle = '', prefillDate, prefillCustomerName = '', prefillCustomerPhone = '', prefillCustomerAddress = '', prefillNotes = '', prefillPrice, prefillJobType, prefillReferralSource, recentCustomers = [], fleetAccounts }: JobLogModalProps) {
    const [showCustomerInfo, setShowCustomerInfo] = useState(true);
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
    const [validationError, setValidationError] = useState<string | null>(null);

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
        companyName: '',
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
        technicianName: '',
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
                companyName: fleet.name || prev.companyName,
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

        const missing: string[] = [];
        if (!formData.vehicle?.trim()) missing.push('Vehicle');
        if (!formData.companyName?.trim()) missing.push('Company');
        if (!formData.jobType?.trim()) missing.push('Job Description');
        if (!formData.technicianName?.trim()) missing.push('Technician');
        if (!formData.customerName?.trim()) missing.push('Customer Name');
        if (!formData.customerPhone?.trim()) missing.push('Customer Phone');
        if (!formData.status?.trim()) missing.push('Status');

        if (missing.length > 0) {
            setValidationError(`Required fields: ${missing.join(', ')}`);
            if (!showCustomerInfo) setShowCustomerInfo(true);
            return;
        }

        setValidationError(null);
        onSubmit(formData);
        // Reset form
        setFormData({
            vehicle: '',
            companyName: '',
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
            technicianName: '',
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

    // Status color mapping for chips
    const getStatusColor = (color: string, isSelected: boolean) => {
        const colors: Record<string, { bg: string; border: string; text: string }> = {
            green: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
            blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
            purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
            emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
            amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400' },
            orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
            yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
            red: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
            zinc: { bg: 'bg-zinc-700/30', border: 'border-zinc-600/50', text: 'text-zinc-400' },
        };
        const c = colors[color] || colors.zinc;
        return isSelected
            ? `${c.bg} ${c.border} ${c.text}`
            : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:border-zinc-600';
    };

    // Completeness tracking
    const requiredFields = [
        { label: 'Vehicle', filled: !!formData.vehicle?.trim() },
        { label: 'Company', filled: !!formData.companyName?.trim() },
        { label: 'Job Type', filled: !!formData.jobType },
        { label: 'Technician', filled: !!formData.technicianName?.trim() },
        { label: 'Customer', filled: !!formData.customerName?.trim() },
        { label: 'Phone', filled: !!formData.customerPhone?.trim() },
        { label: 'Status', filled: !!formData.status },
    ];
    const filledCount = requiredFields.filter(f => f.filled).length;
    const [showStatusPicker, setShowStatusPicker] = useState(false);

    if (!isOpen) return null;

    const currentStatus = STATUS_OPTIONS.find(s => s.value === formData.status) || STATUS_OPTIONS[0];

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-700/50 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/50 max-h-[92vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Gradient accent bar */}
                <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-t-2xl" />

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                            <span className="text-lg">📋</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">New Job</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex gap-0.5">
                                    {requiredFields.map((f, i) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${f.filled ? 'bg-amber-400' : 'bg-zinc-700'}`}
                                            title={`${f.label}: ${f.filled ? '✓' : 'Required'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] text-zinc-500">{filledCount}/{requiredFields.length}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all hover:scale-105 text-zinc-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Community Tips Banner */}
                {communityTips.length > 0 && (
                    <div className="mx-6 mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs">💡</span>
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Community Tips</span>
                        </div>
                        <div className="space-y-1">
                            {communityTips.map((tip, i) => (
                                <div key={i} className="text-xs text-zinc-400 line-clamp-1">
                                    <span className="text-purple-400">•</span> {tip.content}
                                    <span className="text-zinc-600 ml-1">— {tip.user_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Validation Error */}
                {validationError && (
                    <div className="mx-6 mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <span>⚠️</span> {validationError}
                    </div>
                )}

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">

                    {/* ─── SECTION: Vehicle & Key ─── */}
                    <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-4 space-y-3">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            🚗 Vehicle & Key
                            {loadingFcc && <span className="text-yellow-500 animate-pulse normal-case font-medium">Finding keys...</span>}
                        </div>

                        {/* Vehicle input */}
                        <div>
                            <input
                                type="text"
                                placeholder="2023 Toyota Camry"
                                value={formData.vehicle}
                                onChange={e => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 text-white placeholder-zinc-600 transition-all"
                                required
                            />
                        </div>

                        {/* FCC ID & Key Type row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    FCC ID
                                    <button
                                        type="button"
                                        onClick={() => lookupFccIds()}
                                        disabled={loadingFcc || !formData.vehicle.trim()}
                                        className="text-zinc-500 hover:text-amber-400 disabled:text-zinc-700 transition-colors"
                                        title="Suggest FCC IDs"
                                    >
                                        {loadingFcc ? '⏳' : '🔍'}
                                    </button>
                                    <a
                                        href={`/fcc?search=${encodeURIComponent(formData.fccId || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => { if (!formData.fccId.trim()) e.preventDefault(); }}
                                        className={`text-[10px] normal-case font-medium ${formData.fccId.trim() ? 'text-amber-500 hover:text-amber-400' : 'text-zinc-700 cursor-not-allowed'}`}
                                    >
                                        Lookup
                                    </a>
                                </label>
                                <input
                                    type="text"
                                    placeholder="HYQ14FBA"
                                    value={formData.fccId}
                                    onChange={e => setFormData(prev => ({ ...prev, fccId: e.target.value }))}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 font-mono text-amber-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-zinc-600 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Key Type</label>
                                <input
                                    type="text"
                                    placeholder="Smart Key"
                                    value={formData.keyType}
                                    onChange={e => setFormData(prev => ({ ...prev, keyType: e.target.value }))}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-zinc-600 transition-all"
                                />
                            </div>
                        </div>

                        {/* FCC Key Picker Carousel */}
                        {fccSuggestions.length > 0 && showFccPicker && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Select key type:</span>
                                    <button type="button" onClick={() => { setShowFccPicker(false); setFccSuggestions([]); }} className="text-xs text-zinc-500 hover:text-zinc-400">✕</button>
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-700">
                                    {fccSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, fccId: s.fcc_id, keyType: s.key_type || prev.keyType, keyCost: s.price || prev.keyCost }));
                                                setFccSuggestions([]); setShowFccPicker(false);
                                            }}
                                            className="flex-shrink-0 w-24 bg-zinc-900/60 border border-zinc-700 rounded-xl p-2 hover:border-amber-500/40 hover:bg-zinc-800/60 transition-all group"
                                        >
                                            {s.image_url ? (
                                                <img src={s.image_url} alt={s.fcc_id} className="w-full h-14 object-contain rounded-lg bg-zinc-900 mb-1 group-hover:scale-105 transition-transform" />
                                            ) : (
                                                <div className="w-full h-14 bg-zinc-900 rounded-lg flex items-center justify-center text-xl mb-1">🔑</div>
                                            )}
                                            <div className="text-[10px] font-mono text-amber-400 truncate">{s.fcc_id}</div>
                                            <div className="text-[10px] text-zinc-500 truncate">{s.key_type}</div>
                                            {s.price && <div className="text-[10px] text-green-500">${s.price}</div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── SECTION: Job Details ─── */}
                    <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-4 space-y-3">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">🔧 Job Details</div>

                        {/* Job Type Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            {JOB_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, jobType: type.value as JobFormData['jobType'] }))}
                                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 hover:scale-[1.02] ${formData.jobType === type.value
                                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10'
                                        : 'bg-zinc-900/40 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800/40'
                                        }`}
                                >
                                    <span className="text-lg">{type.icon}</span>
                                    <span className="truncate w-full text-center text-[10px]">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Company */}
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Company</label>
                            <input
                                type="text"
                                placeholder="Prolocksmith Orlando"
                                value={formData.companyName || ''}
                                onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-zinc-600 transition-all"
                                required
                            />
                        </div>


                        {/* Price & Date row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">💲 Price</label>
                                <input type="number" placeholder="150" min="0" step="0.01"
                                    value={formData.price || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 text-green-400 font-bold placeholder-zinc-600" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">📅 Date</label>
                                <input type="date" value={formData.date}
                                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
                            </div>
                        </div>
                        {/* Status Chips */}
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Status</label>
                            <div className="flex flex-wrap gap-1.5">
                                {STATUS_OPTIONS.map(opt => (
                                    <button key={opt.value} type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${formData.status === opt.value
                                            ? getStatusColor(opt.color, true)
                                            : 'bg-zinc-900/40 border-zinc-700/50 text-zinc-500 hover:border-zinc-600'}`}>
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ─── SECTION: Customer ─── */}
                    <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-4 space-y-3">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">👤 Customer</div>
                        {recentCustomers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {recentCustomers.slice(0, 5).map((customer, i) => (
                                    <button key={i} type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, customerName: customer.name, customerPhone: customer.phone || prev.customerPhone, customerAddress: customer.address || prev.customerAddress, referralSource: 'repeat' as const }))}
                                        className="text-[10px] px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                                        ⚡ {customer.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Name</label>
                                <input type="text" placeholder="John Smith" value={formData.customerName || ''}
                                    onChange={e => { setFormData(prev => ({ ...prev, customerName: e.target.value })); setCustomerSaved(false); }}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-zinc-600" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Phone</label>
                                <input type="tel" placeholder="555-123-4567" value={formData.customerPhone || ''}
                                    onChange={e => { setFormData(prev => ({ ...prev, customerPhone: e.target.value })); setCustomerSaved(false); }}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-zinc-600" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Address</label>
                                <input type="text" placeholder="123 Main St, City, ST" value={formData.customerAddress || ''}
                                    onChange={e => { setFormData(prev => ({ ...prev, customerAddress: e.target.value })); setCustomerSaved(false); }}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-zinc-600" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Referral</label>
                                <select value={formData.referralSource || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, referralSource: e.target.value as JobFormData['referralSource'] || undefined }))}
                                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                                    <option value="">Select...</option>
                                    {REFERRAL_SOURCES.map(source => (<option key={source.value} value={source.value}>{source.label}</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {availableFleets.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-zinc-500">Fleet:</span>
                                    {availableFleets.slice(0, 3).map(fleet => (
                                        <button key={fleet.id} type="button" onClick={() => handleFleetSelect(fleet.id)}
                                            className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${formData.fleetId === fleet.id ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:border-zinc-600'}`}>
                                            🚗 {fleet.name}
                                        </button>
                                    ))}
                                    {formData.fleetId && (<button type="button" onClick={() => setFormData(prev => ({ ...prev, fleetId: '' }))} className="text-[10px] text-zinc-600 hover:text-zinc-400">✕</button>)}
                                </div>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                {canSaveCustomer && (<button type="button" onClick={handleSaveCustomer} className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1">💾 Save Customer</button>)}
                                {customerSaved && <span className="text-[10px] text-zinc-500">✓ Saved</span>}
                            </div>
                        </div>
                    </div>

                    {/* ─── SECTION: Technician ─── */}
                    <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-4 space-y-3">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">👷 Technician</div>
                        {technicians.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {technicians.map(tech => (
                                    <button key={tech.id} type="button"
                                        onClick={() => setFormData(prev => {
                                            const selected = prev.technicianId === tech.id;
                                            return { ...prev, technicianId: selected ? '' : tech.id, technicianName: (selected && prev.technicianName === tech.name) ? '' : tech.name };
                                        })}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all hover:scale-[1.02] ${formData.technicianId === tech.id ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-zinc-900/40 border-zinc-700/50 text-zinc-400 hover:border-zinc-600'}`}>
                                        👷 {tech.name}{tech.role && <span className="ml-1 text-zinc-500 text-[10px]">({tech.role})</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                        <input type="text" placeholder={technicians.length > 0 ? 'Or type a name...' : 'Technician name'}
                            value={formData.technicianName || ''}
                            onChange={e => setFormData(prev => ({ ...prev, technicianName: e.target.value }))}
                            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder-zinc-600" required />
                    </div>


                    {/* ─── SECTION: Costs & Profit (collapsible) ─── */}
                    <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl overflow-hidden">
                        <button type="button" onClick={() => setShowCostTracking(!showCostTracking)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-all">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">💰 Costs & Profit</span>
                                {(formData.price || 0) > 0 && (
                                    <span className={`text-xs font-black ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${profit.toFixed(0)} profit
                                    </span>
                                )}
                            </div>
                            <span className={`text-zinc-500 text-xs transition-transform ${showCostTracking ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        {showCostTracking && (
                            <div className="px-4 pb-4 space-y-3 border-t border-zinc-700/30">
                                <div className="grid grid-cols-2 gap-3 pt-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">🔑 Key Cost</label>
                                        <input type="number" placeholder="45" min="0" step="0.01"
                                            value={formData.keyCost || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, keyCost: parseFloat(e.target.value) || 0 }))}
                                            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 text-yellow-400 font-bold placeholder-zinc-600" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">⚙️ Service Cost</label>
                                        <input type="number" placeholder="75" min="0" step="0.01"
                                            value={formData.serviceCost || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, serviceCost: parseFloat(e.target.value) || 0 }))}
                                            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-purple-400 font-bold placeholder-zinc-600" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">⛽ Miles Driven</label>
                                        <input type="number" placeholder="25" min="0" step="1"
                                            value={formData.milesDriven || ''}
                                            onChange={e => {
                                                const miles = parseFloat(e.target.value) || 0;
                                                const gasCost = Math.round(miles * 0.117 * 100) / 100;
                                                setFormData(prev => ({ ...prev, milesDriven: miles, gasCost }));
                                            }}
                                            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-blue-400 font-bold placeholder-zinc-600" />
                                        <div className="text-[10px] text-zinc-600 mt-1">= ${((formData.milesDriven || 0) * 0.117).toFixed(2)} gas</div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">🔧 Parts Cost</label>
                                        <input type="number" placeholder="0" min="0" step="0.01"
                                            value={formData.partsCost || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, partsCost: parseFloat(e.target.value) || 0 }))}
                                            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 text-orange-400 font-bold placeholder-zinc-600" />
                                    </div>
                                </div>
                                {/* Live Profit Calculator */}
                                <div className="bg-zinc-900/60 rounded-xl p-3 flex justify-between items-center border border-zinc-700/30">
                                    <div className="text-xs">
                                        <span className="text-zinc-500">Costs: </span>
                                        <span className="text-red-400 font-bold">${totalCosts.toFixed(2)}</span>
                                    </div>
                                    <div className="text-base">
                                        <span className="text-zinc-500">Profit: </span>
                                        <span className={`font-black ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${profit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ─── SECTION: Notes ─── */}
                    <div className="bg-zinc-800/30 border border-zinc-700/40 rounded-xl p-4 space-y-2">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">📝 Notes</label>
                        <textarea
                            placeholder="Customer notes, issues, etc..."
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                            className="w-full bg-zinc-900/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-zinc-600 resize-none transition-all"
                        />
                    </div>

                    {/* Community Tips (inline) */}
                    {communityTips.length > 0 && (
                        <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs">💡</span>
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Community Tips</span>
                            </div>
                            <div className="space-y-1">
                                {communityTips.slice(0, 3).map((tip, i) => (
                                    <div key={i} className="text-xs text-zinc-400 flex gap-1.5">
                                        <span className="text-purple-400 shrink-0">•</span>
                                        <span className="line-clamp-1">{tip.content}</span>
                                        <span className="text-zinc-600 shrink-0">— {tip.user_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Validation Error */}
                    {validationError && (
                        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
                            <span>⚠️</span> {validationError}
                        </div>
                    )}

                </form>

                {/* ─── STICKY FOOTER ─── */}
                <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/95 backdrop-blur-sm flex gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={() => {
                            const form = document.querySelector('form') as HTMLFormElement;
                            if (form) form.requestSubmit();
                        }}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20 text-sm"
                    >
                        ✓ Log Job
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            setFormData(prev => ({ ...prev, status: 'unassigned' }));
                            setTimeout(() => {
                                const form = document.querySelector('form') as HTMLFormElement;
                                if (form) form.requestSubmit();
                            }, 0);
                        }}
                        className="px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 text-sm"
                        title="Save and send to the Dispatch queue"
                    >
                        🚚 Dispatch
                    </button>
                </div>
            </div>
        </div>
    );
}

