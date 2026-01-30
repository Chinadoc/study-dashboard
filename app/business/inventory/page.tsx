'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '@/contexts/InventoryContext';
import { getLowStockItems, TOOL_CATEGORIES, ToolType } from '@/lib/inventoryTypes';
import { loadBusinessProfile, saveBusinessProfile } from '@/lib/businessTypes';
import { exportInventoryToCSV, parseInventoryCSV, generateAmazonSearchUrl } from '@/lib/inventoryIO';
import ToolSetupWizard from '@/components/business/ToolSetupWizard';

// Click-to-expand vehicles popover component
function VehiclesPopover({
    vehicles,
    maxVisible = 2
}: {
    vehicles: string;
    maxVisible?: number;
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
            <span className="text-sm text-gray-400">
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

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 left-0 top-full mt-2 w-80 max-h-64 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">All Compatible Vehicles ({vehicleList.length})</span>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none">×</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {vehicleList.map((v, i) => (
                                <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg">{v}</span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

type InventorySubTab = 'all' | 'keys' | 'blanks' | 'tools' | 'consumables' | 'low';

export default function InventoryPage() {
    const { isAuthenticated, login, loading: authLoading } = useAuth();
    const { inventory, loading, updateQuantity, removeFromInventory } = useInventory();
    const [activeSubTab, setActiveSubTab] = useState<InventorySubTab>('all');
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [businessProfile, setBusinessProfile] = useState(() => loadBusinessProfile());
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Export handler
    const handleExport = () => {
        const exportData = inventory.map(item => ({
            itemKey: item.itemKey,
            type: item.type,
            qty: item.qty,
            vehicle: item.vehicle,
            fcc_id: item.fcc_id,
        }));
        exportInventoryToCSV(exportData);
    };

    // Import handler
    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportError(null);
        const { items, errors } = await parseInventoryCSV(file);

        if (errors.length > 0) {
            setImportError(`${errors.length} rows had issues`);
        }

        // Add each item to inventory
        items.forEach(item => {
            updateQuantity(item.itemKey, item.qty, item.vehicle);
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Check for first-time user
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const profile = loadBusinessProfile();
            setBusinessProfile(profile);
            if (!profile.setupComplete) {
                setShowOnboarding(true);
            }
        }
    }, []);

    // Filter inventory based on subtab and search
    const keys = useMemo(() => inventory.filter(i => i.type === 'key'), [inventory]);
    const blanks = useMemo(() => inventory.filter(i => i.type === 'blank'), [inventory]);
    const tools = useMemo(() => inventory.filter(i => i.type === 'tool'), [inventory]);
    const consumables = useMemo(() => inventory.filter(i => i.type === 'consumable'), [inventory]);
    const lowStock = useMemo(() => getLowStockItems(inventory), [inventory]);

    const displayItems = useMemo(() => {
        let items = inventory;
        switch (activeSubTab) {
            case 'keys': items = keys; break;
            case 'blanks': items = blanks; break;
            case 'tools': items = tools; break;
            case 'consumables': items = consumables; break;
            case 'low': items = lowStock; break;
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.itemKey.toLowerCase().includes(q) ||
                (item.vehicle && item.vehicle.toLowerCase().includes(q)) ||
                (item.fcc_id && item.fcc_id.toLowerCase().includes(q)) ||
                (item.serialNumber && item.serialNumber.toLowerCase().includes(q))
            );
        }

        return items;
    }, [activeSubTab, inventory, keys, blanks, tools, consumables, lowStock, searchQuery]);

    // Stats
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.qty, 0);
    const lowStockCount = lowStock.length;

    const subtabs = [
        { id: 'all', label: 'All', count: inventory.length },
        { id: 'keys', label: 'Keys', icon: '🔑', count: keys.length },
        { id: 'blanks', label: 'Blanks', icon: '🔧', count: blanks.length },
        { id: 'tools', label: 'Tools', icon: '💻', count: tools.length },
        { id: 'consumables', label: 'Supplies', icon: '📦', count: consumables.length },
        { id: 'low', label: 'Low Stock', icon: '⚠️', count: lowStock.length },
    ];

    const handleDelete = (itemKey: string) => {
        // Get full quantity to remove
        const item = inventory.find(i => i.itemKey === itemKey);
        if (item) {
            removeFromInventory(itemKey, item.qty);
        }
        setDeleteConfirm(null);
    };

    const handleSetupComplete = () => {
        const profile = loadBusinessProfile();
        const updatedProfile = { ...profile, setupComplete: true };
        saveBusinessProfile(updatedProfile);
        setBusinessProfile(updatedProfile);
        setShowOnboarding(false);
    };

    if (showOnboarding) {
        return <ToolSetupWizard onComplete={handleSetupComplete} onSkip={handleSetupComplete} />;
    }

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">{totalItems}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">Item Types</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-400">{totalQuantity}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">Total Units</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className={`text-3xl font-bold ${lowStockCount > 0 ? 'text-red-400' : 'text-zinc-500'}`}>{lowStockCount}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide">Low Stock</div>
                </div>
            </div>

            {/* Search and Subtabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto">
                    {subtabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as InventorySubTab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                                ${activeSubTab === tab.id
                                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50'
                                }`}
                        >
                            {tab.icon && <span>{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeSubTab === tab.id ? 'bg-yellow-500/30 text-yellow-300' : 'bg-zinc-700 text-gray-400'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search FCC, vehicle..."
                        className="w-full sm:w-64 px-4 py-2 pl-10 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >×</button>
                    )}
                </div>

                {/* Export/Import Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors"
                        title="Export to CSV"
                    >
                        📤 Export
                    </button>
                    <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                        📥 Import
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* Import Error Alert */}
            {importError && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg text-sm flex justify-between items-center">
                    <span>⚠️ {importError}</span>
                    <button onClick={() => setImportError(null)} className="text-yellow-400 hover:text-yellow-300">×</button>
                </div>
            )}

            {/* Sign-in prompt */}
            {!isAuthenticated && !authLoading && (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-4 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="font-medium">📱 Sign in to sync your inventory</p>
                            <p className="text-sm opacity-75 mt-1">Your data will be saved to the cloud and accessible across devices</p>
                        </div>
                        <button onClick={login} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg whitespace-nowrap transition-colors">
                            Sign In
                        </button>
                    </div>
                </div>
            )}

            {/* Inventory List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
                </div>
            ) : displayItems.length > 0 ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <div className="divide-y divide-gray-800">
                        {displayItems.map((item) => (
                            <div key={item.itemKey} className="p-4 flex items-center gap-4 hover:bg-gray-800/30 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded ${item.type === 'key' ? 'bg-yellow-500/20 text-yellow-400' :
                                                item.type === 'blank' ? 'bg-blue-500/20 text-blue-400' :
                                                    item.type === 'tool' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-green-500/20 text-green-400'
                                            }`}>
                                            {item.type === 'key' ? '🔑 Key' :
                                                item.type === 'blank' ? '🔧 Blank' :
                                                    item.type === 'tool' ? `💻 ${item.toolType ? TOOL_CATEGORIES[item.toolType as ToolType]?.label || 'Tool' : 'Tool'}` :
                                                        '📦 Supply'}
                                        </span>
                                        {item.qty <= 2 && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">Low Stock</span>
                                        )}
                                        {item.warrantyExpiry && new Date(item.warrantyExpiry) > new Date() && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">In Warranty</span>
                                        )}
                                    </div>
                                    <div className="font-bold text-white truncate">{item.itemKey}</div>
                                    {item.serialNumber && (
                                        <div className="text-xs text-zinc-500">S/N: {item.serialNumber}</div>
                                    )}
                                    {item.vehicle && <VehiclesPopover vehicles={item.vehicle} maxVisible={2} />}
                                </div>

                                {/* Quantity controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.itemKey, -1)}
                                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                                    >−</button>
                                    <span className={`w-12 text-center font-bold text-lg ${item.qty <= 2 ? 'text-red-400' : 'text-white'}`}>
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.itemKey, 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                                    >+</button>
                                </div>

                                {/* Delete button */}
                                {deleteConfirm === item.itemKey ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(item.itemKey)}
                                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-bold"
                                        >Delete</button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="px-3 py-1.5 bg-zinc-700 text-gray-300 rounded-lg text-sm"
                                        >Cancel</button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setDeleteConfirm(item.itemKey)}
                                        className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                                        title="Delete item"
                                    >🗑️</button>
                                )}

                                {/* Buy Link for Low Stock */}
                                {item.qty <= 2 && (
                                    <a
                                        href={generateAmazonSearchUrl(item.itemKey)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-500/30 transition-colors whitespace-nowrap"
                                    >
                                        🛒 Buy
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="font-medium">{searchQuery ? 'No matching items' : 'No items in this view'}</p>
                    <p className="text-sm mt-1">{searchQuery ? 'Try a different search term' : 'Add inventory items to track your stock'}</p>
                </div>
            )}
        </div>
    );
}

