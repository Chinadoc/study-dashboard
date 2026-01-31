'use client';

import React, { useState } from 'react';

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
    jobType: 'add_key' | 'akl' | 'remote' | 'blade' | 'rekey' | 'lockout' | 'safe' | 'other';
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
    { value: 'safe', label: 'Safe Work', icon: '🔐' },
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
    const [fccSuggestions, setFccSuggestions] = useState<Array<{ fcc_id: string; key_type: string; price?: string; button_count?: number }>>([]);
    const [loadingFcc, setLoadingFcc] = useState(false);

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

    // Lookup FCC IDs for current vehicle
    const lookupFccIds = async () => {
        if (!formData.vehicle.trim()) return;

        setLoadingFcc(true);
        setFccSuggestions([]);

        try {
            const { year, make, model } = parseVehicle(formData.vehicle);
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
                const keys = (data.keys || []).slice(0, 5).map((k: any) => ({
                    fcc_id: k.fcc_id || 'Unknown',
                    key_type: k.key_type || 'Key',
                    price: k.price,
                    button_count: k.button_count
                }));
                setFccSuggestions(keys);
            }
        } catch (err) {
            console.error('FCC lookup error:', err);
        }
        setLoadingFcc(false);
    };

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
                                    onClick={lookupFccIds}
                                    disabled={loadingFcc || !formData.vehicle.trim()}
                                    className="ml-2 text-yellow-500 hover:text-yellow-400 disabled:text-zinc-600 text-xs normal-case font-medium"
                                >
                                    {loadingFcc ? '⏳' : '🔍'} Lookup
                                </button>
                            </label>
                            <input
                                type="text"
                                placeholder="HYQ14FBA"
                                value={formData.fccId}
                                onChange={e => setFormData(prev => ({ ...prev, fccId: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 font-mono text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                            {/* FCC Suggestions */}
                            {fccSuggestions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {fccSuggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    fccId: s.fcc_id,
                                                    keyType: s.key_type || prev.keyType
                                                }));
                                                setFccSuggestions([]);
                                            }}
                                            className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 font-mono"
                                        >
                                            {s.fcc_id}
                                            {s.button_count && <span className="text-zinc-400 ml-1">({s.button_count}btn)</span>}
                                        </button>
                                    ))}
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
