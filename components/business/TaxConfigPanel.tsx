'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface TaxArea {
    id: string;
    name: string;
    rate: number; // percentage, e.g. 7 for 7%
}

const STORAGE_KEY = 'eurokeys_tax_areas';
const DEFAULT_RATE_KEY = 'eurokeys_default_tax_rate';

export function getTaxAreasFromStorage(): TaxArea[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveTaxAreasToStorage(areas: TaxArea[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
}

export function getDefaultTaxRate(): number {
    if (typeof window === 'undefined') return 0;
    try {
        return parseFloat(localStorage.getItem(DEFAULT_RATE_KEY) || '0') || 0;
    } catch {
        return 0;
    }
}

export function setDefaultTaxRate(rate: number) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DEFAULT_RATE_KEY, rate.toString());
}

export function getTaxRateForArea(areaName: string): number {
    const areas = getTaxAreasFromStorage();
    const match = areas.find(a => a.name.toLowerCase() === areaName.toLowerCase());
    return match ? match.rate : getDefaultTaxRate();
}

interface TaxConfigPanelProps {
    revenue: number;
    timeRangeLabel: string;
}

export default function TaxConfigPanel({ revenue, timeRangeLabel }: TaxConfigPanelProps) {
    const [taxAreas, setTaxAreas] = useState<TaxArea[]>([]);
    const [defaultRate, setDefaultRateState] = useState(0);
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaRate, setNewAreaRate] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        setTaxAreas(getTaxAreasFromStorage());
        setDefaultRateState(getDefaultTaxRate());
    }, []);

    const handleAddArea = useCallback(() => {
        if (!newAreaName.trim() || !newAreaRate) return;
        const rate = parseFloat(newAreaRate);
        if (isNaN(rate) || rate < 0 || rate > 30) return;

        const area: TaxArea = {
            id: `tax_${Date.now()}`,
            name: newAreaName.trim(),
            rate,
        };

        const updated = [...taxAreas, area];
        setTaxAreas(updated);
        saveTaxAreasToStorage(updated);
        setNewAreaName('');
        setNewAreaRate('');
        setShowAddForm(false);
    }, [newAreaName, newAreaRate, taxAreas]);

    const handleDeleteArea = useCallback((id: string) => {
        const updated = taxAreas.filter(a => a.id !== id);
        setTaxAreas(updated);
        saveTaxAreasToStorage(updated);
    }, [taxAreas]);

    const handleDefaultRateChange = useCallback((val: string) => {
        const rate = parseFloat(val) || 0;
        setDefaultRateState(rate);
        setDefaultTaxRate(rate);
    }, []);

    // Calculate estimated taxes
    const estimatedTax = taxAreas.length > 0
        ? taxAreas.reduce((sum, area) => sum + (revenue * (area.rate / 100)) / taxAreas.length, 0)
        : revenue * (defaultRate / 100);

    // Weighted average rate
    const effectiveRate = taxAreas.length > 0
        ? taxAreas.reduce((sum, a) => sum + a.rate, 0) / taxAreas.length
        : defaultRate;

    return (
        <div className="space-y-6">
            {/* Estimated Tax Summary */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-800/10 rounded-xl border border-indigo-700/30 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    🏛️ Estimated Tax — {timeRangeLabel}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Revenue</div>
                        <div className="text-2xl font-black text-white">${revenue.toFixed(0)}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Effective Rate</div>
                        <div className="text-2xl font-black text-indigo-300">{effectiveRate.toFixed(2)}%</div>
                    </div>
                    <div className="text-center col-span-2 md:col-span-1">
                        <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Est. Tax Owed</div>
                        <div className="text-2xl font-black text-red-400">${estimatedTax.toFixed(2)}</div>
                    </div>
                </div>

                {/* Per-area breakdown */}
                {taxAreas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-indigo-800/30 space-y-2">
                        <div className="text-xs text-indigo-400 uppercase tracking-wider mb-2">By Service Area</div>
                        {taxAreas.map(area => {
                            const areaShare = revenue / taxAreas.length;
                            const areaTax = areaShare * (area.rate / 100);
                            return (
                                <div key={area.id} className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-300">{area.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-zinc-500">{area.rate}%</span>
                                        <span className="font-bold text-red-400">${areaTax.toFixed(2)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {taxAreas.length === 0 && defaultRate === 0 && (
                    <div className="mt-4 pt-4 border-t border-indigo-800/30 text-center text-zinc-500 text-sm">
                        <p>Set a default rate or add service areas below to see estimated taxes</p>
                    </div>
                )}
            </div>

            {/* Tax Configuration */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    ⚙️ Sales Tax Configuration
                </h3>

                {/* Default Rate */}
                <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg mb-4">
                    <div className="flex-1">
                        <div className="text-sm font-bold text-white">Default Tax Rate</div>
                        <div className="text-xs text-zinc-500">Used when no service area is specified</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={defaultRate || ''}
                            onChange={(e) => handleDefaultRateChange(e.target.value)}
                            placeholder="0"
                            min="0"
                            max="30"
                            step="0.01"
                            className="w-20 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-right text-sm"
                        />
                        <span className="text-zinc-400 text-sm font-bold">%</span>
                    </div>
                </div>

                {/* Service Areas */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Service Areas</div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="text-sm text-yellow-500 hover:text-yellow-400 font-bold"
                        >
                            {showAddForm ? '✕ Cancel' : '+ Add Area'}
                        </button>
                    </div>

                    {/* Add area form */}
                    {showAddForm && (
                        <div className="flex gap-2 items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <input
                                type="text"
                                value={newAreaName}
                                onChange={(e) => setNewAreaName(e.target.value)}
                                placeholder="Area name (e.g., Miami-Dade)"
                                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
                            />
                            <input
                                type="number"
                                value={newAreaRate}
                                onChange={(e) => setNewAreaRate(e.target.value)}
                                placeholder="%"
                                min="0"
                                max="30"
                                step="0.01"
                                className="w-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm text-right"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
                            />
                            <button
                                onClick={handleAddArea}
                                className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm hover:bg-yellow-400 transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    )}

                    {/* Area list */}
                    {taxAreas.length > 0 ? (
                        <div className="space-y-1">
                            {taxAreas.map(area => (
                                <div key={area.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-white font-medium">{area.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-indigo-400">{area.rate}%</span>
                                        <button
                                            onClick={() => handleDeleteArea(area.id)}
                                            className="text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-zinc-500 text-sm">
                            <div className="text-2xl mb-2">📍</div>
                            <p>No service areas configured</p>
                            <p className="text-xs mt-1">Add areas with different tax rates for accurate estimates</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
