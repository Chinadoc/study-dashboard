'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    parseExternalInventoryFile,
    detectImportDiscrepancies,
    ExternalInventoryRow,
    ExternalImportResult,
    ImportDiscrepancy
} from '@/lib/inventoryIO';
import { useInventory } from '@/contexts/InventoryContext';
import { API_BASE } from '@/lib/config';

interface InventoryImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: ExternalInventoryRow[]) => void;
}

type ImportStep = 'upload' | 'review' | 'importing';

export default function InventoryImportModal({ isOpen, onClose, onImport }: InventoryImportModalProps) {
    const { inventory } = useInventory();
    const [file, setFile] = useState<File | null>(null);
    const [parseResult, setParseResult] = useState<ExternalImportResult | null>(null);
    const [discrepancies, setDiscrepancies] = useState<ImportDiscrepancy[]>([]);
    const [step, setStep] = useState<ImportStep>('upload');
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [previewCount] = useState(10);

    // Preview items
    const previewItems = useMemo(() => {
        if (!parseResult) return [];
        return parseResult.items.slice(0, previewCount);
    }, [parseResult, previewCount]);

    // Discrepancy stats
    const discrepancyStats = useMemo(() => {
        const conflicts = discrepancies.filter(d => d.hasConflict);
        const newItems = discrepancies.filter(d => d.isNew);
        const withVehicle = discrepancies.filter(d => d.vehicleMatch);
        const toAdd = discrepancies.filter(d => d.action === 'add');
        const toUpdate = discrepancies.filter(d => d.action === 'update');
        return { conflicts: conflicts.length, newItems: newItems.length, withVehicle: withVehicle.length, toAdd: toAdd.length, toUpdate: toUpdate.length };
    }, [discrepancies]);

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsParsing(true);
        setParseResult(null);
        setDiscrepancies([]);

        try {
            const result = await parseExternalInventoryFile(selectedFile);
            setParseResult(result);

            // Detect discrepancies and fetch vehicle matches
            const existingItems = inventory.map(item => ({
                itemKey: item.itemKey,
                qty: item.qty,
                fcc_id: item.fcc_id,
                oem_number: item.oem_number
            }));
            const detected = await detectImportDiscrepancies(result.items, existingItems, API_BASE);
            setDiscrepancies(detected);
            setStep(detected.length > 0 ? 'review' : 'upload');
        } catch (err) {
            console.error('Parse error:', err);
            setParseResult({
                items: [],
                errors: ['Failed to parse file'],
                stats: { total: 0, withFcc: 0, withOem: 0, withQuantity: 0, matchedByOem: 0, matchedByFcc: 0, unmatched: 0 },
                detectedFormat: 'Generic',
                detectedDelimiter: ','
            });
        } finally {
            setIsParsing(false);
        }
    };

    // Toggle discrepancy action
    const toggleAction = useCallback((idx: number, action: 'add' | 'update' | 'skip') => {
        setDiscrepancies(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], action };
            return updated;
        });
    }, []);

    // Handle import confirmation
    const handleImport = () => {
        if (!parseResult || parseResult.items.length === 0) return;

        setIsImporting(true);
        setStep('importing');

        // Filter items based on discrepancy actions
        const itemsToImport = parseResult.items.filter(item => {
            const disc = discrepancies.find(d =>
                d.itemKey === item.itemKey ||
                d.fcc_id === item.fcc_id ||
                d.oemNumber === item.oemNumber
            );
            if (!disc) return true; // No discrepancy, always import
            return disc.action !== 'skip';
        });

        // Apply quantity updates for items marked as 'update'
        const processedItems = itemsToImport.map(item => {
            const disc = discrepancies.find(d =>
                d.itemKey === item.itemKey ||
                d.fcc_id === item.fcc_id ||
                d.oemNumber === item.oemNumber
            );
            if (disc?.action === 'update') {
                // Use imported quantity (overwrite existing)
                return { ...item, qty: disc.importedQty };
            }
            return item;
        });

        setTimeout(() => {
            onImport(processedItems);
            setIsImporting(false);
            setFile(null);
            setParseResult(null);
            setDiscrepancies([]);
            setStep('upload');
            onClose();
        }, 500);
    };

    // Reset and close
    const handleClose = () => {
        setFile(null);
        setParseResult(null);
        setDiscrepancies([]);
        setStep('upload');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl max-h-[85vh] overflow-hidden">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {step === 'review' ? '📋 Review Import Discrepancies' : 'Import Inventory'}
                            </h2>
                            <p className="text-sm text-zinc-400">
                                {step === 'review'
                                    ? 'Review conflicts with existing inventory'
                                    : 'Upload from QuickBooks, Square, or CSV/XLSX'}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Step: Upload */}
                        {step === 'upload' && !parseResult && (
                            <label className="block">
                                <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                                    ${isParsing
                                        ? 'border-yellow-500/50 bg-yellow-500/10'
                                        : 'border-zinc-700 hover:border-yellow-500/50 hover:bg-zinc-800/50'
                                    }`}
                                >
                                    {isParsing ? (
                                        <>
                                            <div className="animate-spin h-8 w-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                            <p className="text-yellow-400 font-medium">Analyzing file & checking inventory...</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-4xl mb-3">📥</div>
                                            <p className="text-white font-medium mb-1">Drop your file here</p>
                                            <p className="text-sm text-zinc-500">or click to browse</p>
                                            <p className="text-xs text-zinc-600 mt-2">Supports QuickBooks, Square, CSV, and XLSX exports</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isParsing}
                                />
                            </label>
                        )}

                        {/* Step: Review Discrepancies */}
                        {step === 'review' && discrepancies.length > 0 && (
                            <>
                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-white">{discrepancies.length}</div>
                                        <div className="text-xs text-zinc-500">Items w/ Identifiers</div>
                                    </div>
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center border border-amber-500/30">
                                        <div className="text-2xl font-bold text-amber-400">{discrepancyStats.conflicts}</div>
                                        <div className="text-xs text-amber-400">Qty Conflicts</div>
                                    </div>
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center border border-green-500/30">
                                        <div className="text-2xl font-bold text-green-400">{discrepancyStats.withVehicle}</div>
                                        <div className="text-xs text-green-400">Vehicle Matched</div>
                                    </div>
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-400">{discrepancyStats.newItems}</div>
                                        <div className="text-xs text-zinc-500">New Items</div>
                                    </div>
                                </div>

                                {/* Discrepancy Table */}
                                <div className="bg-zinc-800 rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto max-h-[40vh]">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-900/50 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">Item</th>
                                                    <th className="text-center px-3 py-2 text-zinc-500 font-medium">Qty</th>
                                                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">Vehicle Match</th>
                                                    <th className="text-right px-3 py-2 text-zinc-500 font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-700">
                                                {discrepancies.slice(0, 50).map((disc, idx) => (
                                                    <tr key={idx} className={`hover:bg-zinc-700/30 ${disc.hasConflict ? 'bg-amber-500/5' : ''}`}>
                                                        <td className="px-3 py-2">
                                                            <div className="text-white text-xs truncate max-w-[180px]" title={disc.itemKey}>
                                                                {disc.oemNumber || disc.fcc_id || disc.itemKey}
                                                            </div>
                                                            <div className="text-zinc-600 text-[10px]">
                                                                {disc.oemNumber && disc.fcc_id ? `FCC: ${disc.fcc_id}` : disc.rawDescription?.slice(0, 30)}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            {disc.hasConflict ? (
                                                                <span className="text-amber-400 text-xs">
                                                                    {disc.existingQty} → <strong>{disc.importedQty}</strong>
                                                                </span>
                                                            ) : disc.isNew ? (
                                                                <span className="text-green-400 text-xs">+{disc.importedQty}</span>
                                                            ) : (
                                                                <span className="text-zinc-500 text-xs">{disc.importedQty}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {disc.vehicleMatch ? (
                                                                <span className="text-green-400 text-xs">
                                                                    ✓ {disc.vehicleMatch.make} {disc.vehicleMatch.model}
                                                                    {disc.vehicleMatch.yearRange && ` (${disc.vehicleMatch.yearRange})`}
                                                                </span>
                                                            ) : (
                                                                <span className="text-zinc-600 text-xs">No match</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <div className="flex gap-1 justify-end">
                                                                {disc.isNew ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => toggleAction(idx, 'add')}
                                                                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${disc.action === 'add'
                                                                                    ? 'bg-green-500 text-white'
                                                                                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                                                                }`}
                                                                        >
                                                                            Add
                                                                        </button>
                                                                        <button
                                                                            onClick={() => toggleAction(idx, 'skip')}
                                                                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${disc.action === 'skip'
                                                                                    ? 'bg-zinc-500 text-white'
                                                                                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                                                                }`}
                                                                        >
                                                                            Skip
                                                                        </button>
                                                                    </>
                                                                ) : disc.hasConflict ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => toggleAction(idx, 'update')}
                                                                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${disc.action === 'update'
                                                                                    ? 'bg-amber-500 text-white'
                                                                                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                                                                }`}
                                                                        >
                                                                            Update
                                                                        </button>
                                                                        <button
                                                                            onClick={() => toggleAction(idx, 'skip')}
                                                                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${disc.action === 'skip'
                                                                                    ? 'bg-zinc-500 text-white'
                                                                                    : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                                                                }`}
                                                                        >
                                                                            Skip
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-zinc-600 text-xs">Same qty</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {discrepancies.length > 50 && (
                                        <div className="p-2 text-center text-xs text-zinc-500 bg-zinc-900/50">
                                            Showing 50 of {discrepancies.length} items
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Legacy: Parse Results (no discrepancies) */}
                        {parseResult && step === 'upload' && (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-white">{parseResult.stats.total}</div>
                                        <div className="text-xs text-zinc-500">Total Items</div>
                                    </div>
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center border border-blue-500/30">
                                        <div className="text-2xl font-bold text-blue-400">{parseResult.stats.matchedByOem}</div>
                                        <div className="text-xs text-blue-400">OEM Match ★</div>
                                    </div>
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{parseResult.stats.matchedByFcc}</div>
                                        <div className="text-xs text-zinc-500">FCC Only</div>
                                    </div>
                                    <div className="bg-zinc-800 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-zinc-500">{parseResult.stats.unmatched}</div>
                                        <div className="text-xs text-zinc-600">No Match</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-zinc-500">Detected format:</span>
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                                        {parseResult.detectedFormat}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800 flex items-center justify-between gap-3">
                        {step === 'review' ? (
                            <>
                                <button
                                    onClick={() => { setStep('upload'); setDiscrepancies([]); }}
                                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm"
                                >
                                    ← Back
                                </button>
                                <div className="text-xs text-zinc-500">
                                    {discrepancyStats.toAdd + discrepancyStats.toUpdate} items to import
                                </div>
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting}
                                    className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2
                                        ${isImporting
                                            ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                                            : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400'
                                        }`}
                                >
                                    {isImporting ? '⏳ Importing...' : `📥 Import ${discrepancyStats.toAdd + discrepancyStats.toUpdate} Items`}
                                </button>
                            </>
                        ) : parseResult ? (
                            <>
                                <button
                                    onClick={() => { setFile(null); setParseResult(null); }}
                                    className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm"
                                >
                                    ← Choose Different File
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting || parseResult.items.length === 0}
                                    className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2
                                        ${isImporting
                                            ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                                            : parseResult.items.length === 0
                                                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400'
                                        }`}
                                >
                                    📥 Import {parseResult.items.length} Items
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleClose}
                                className="ml-auto px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
