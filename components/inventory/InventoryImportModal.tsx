'use client';

import React, { useState, useMemo } from 'react';
import { parseExternalInventoryCSV, ExternalInventoryRow, ExternalImportResult } from '@/lib/inventoryIO';

interface InventoryImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: ExternalInventoryRow[]) => void;
}

export default function InventoryImportModal({ isOpen, onClose, onImport }: InventoryImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parseResult, setParseResult] = useState<ExternalImportResult | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [previewCount] = useState(10);

    // Preview items
    const previewItems = useMemo(() => {
        if (!parseResult) return [];
        return parseResult.items.slice(0, previewCount);
    }, [parseResult, previewCount]);

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsParsing(true);
        setParseResult(null);

        try {
            const result = await parseExternalInventoryCSV(selectedFile);
            setParseResult(result);
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

    // Handle import confirmation
    const handleImport = () => {
        if (!parseResult || parseResult.items.length === 0) return;

        setIsImporting(true);

        // Slight delay for UX
        setTimeout(() => {
            onImport(parseResult.items);
            setIsImporting(false);
            setFile(null);
            setParseResult(null);
            onClose();
        }, 500);
    };

    // Reset and close
    const handleClose = () => {
        setFile(null);
        setParseResult(null);
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
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-2xl max-h-[85vh] overflow-hidden">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                        <div>
                            <h2 className="text-lg font-bold text-white">Import Inventory</h2>
                            <p className="text-sm text-zinc-400">Upload from QuickBooks, Square, or CSV</p>
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
                        {/* File Upload */}
                        {!parseResult && (
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
                                            <p className="text-yellow-400 font-medium">Analyzing file...</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-4xl mb-3">📥</div>
                                            <p className="text-white font-medium mb-1">Drop your CSV file here</p>
                                            <p className="text-sm text-zinc-500">or click to browse</p>
                                            <p className="text-xs text-zinc-600 mt-2">Supports QuickBooks, Square, and standard CSV exports</p>
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

                        {/* Parse Results */}
                        {parseResult && (
                            <>
                                {/* Stats - OEM priority matching */}
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

                                {/* Format Detection */}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-zinc-500">Detected format:</span>
                                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                                        {parseResult.detectedFormat}
                                    </span>
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-zinc-500">
                                        Delimiter: <code className="text-yellow-400">{parseResult.detectedDelimiter === ';' ? 'semicolon' : parseResult.detectedDelimiter === '\t' ? 'tab' : 'comma'}</code>
                                    </span>
                                </div>

                                {/* Errors */}
                                {parseResult.errors.length > 0 && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                        <p className="text-yellow-400 text-sm font-medium mb-1">⚠️ {parseResult.errors.length} rows had issues</p>
                                        <p className="text-xs text-yellow-500/70">These rows were skipped during import</p>
                                    </div>
                                )}

                                {/* Preview Table */}
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        Preview ({Math.min(previewCount, parseResult.items.length)} of {parseResult.items.length})
                                    </h3>
                                    <div className="bg-zinc-800 rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-900/50">
                                                    <tr>
                                                        <th className="text-left px-3 py-2 text-zinc-500 font-medium">Item Name</th>
                                                        <th className="text-left px-3 py-2 text-zinc-500 font-medium">FCC ID</th>
                                                        <th className="text-right px-3 py-2 text-zinc-500 font-medium">Qty</th>
                                                        <th className="text-right px-3 py-2 text-zinc-500 font-medium">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-700">
                                                    {previewItems.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-zinc-700/30">
                                                            <td className="px-3 py-2 text-white truncate max-w-[200px]" title={item.itemKey}>
                                                                {item.itemKey}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {item.matchedBy === 'oem' ? (
                                                                    <span className="text-blue-400 font-mono text-xs" title="OEM Match (priority)">
                                                                        {item.oemNumber}
                                                                    </span>
                                                                ) : item.matchedBy === 'fcc' ? (
                                                                    <span className="text-yellow-400 font-mono text-xs" title="FCC Match">
                                                                        {item.fcc_id}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-zinc-600" title="No match found">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-3 py-2 text-right text-zinc-300">{item.qty}</td>
                                                            <td className="px-3 py-2 text-right text-green-400">
                                                                {item.salesPrice ? `$${item.salesPrice.toFixed(0)}` : '—'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-zinc-800 flex items-center justify-between gap-3">
                        {parseResult ? (
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
                                    {isImporting ? (
                                        <>
                                            <span className="animate-spin">⏳</span>
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            📥 Import {parseResult.items.length} Items
                                        </>
                                    )}
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
