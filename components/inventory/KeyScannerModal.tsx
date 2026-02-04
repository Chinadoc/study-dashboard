'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE } from '@/lib/config';

interface KeyScanResult {
    type: 'barcode' | 'text' | 'vision';
    value: string;
    fccId?: string;
    oemNumber?: string;
    vehicle?: string;
    productName?: string;
    imageUrl?: string;
}

interface KeyScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKeyIdentified: (result: KeyScanResult) => void;
}

interface LookupResult {
    fcc_id?: string;
    oem_number?: string;
    product_title?: string;
    vehicle?: string;
    image_url?: string;
    type?: string;
}

export default function KeyScannerModal({ isOpen, onClose, onKeyIdentified }: KeyScannerModalProps) {
    const [activeTab, setActiveTab] = useState<'barcode' | 'text' | 'vision'>('text');
    const [textInput, setTextInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [lookupResults, setLookupResults] = useState<LookupResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    // Cleanup scanner on unmount or close
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    // Stop scanner when modal closes or tab changes
    useEffect(() => {
        if (!isOpen || activeTab !== 'barcode') {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
                setIsScanning(false);
            }
        }
    }, [isOpen, activeTab]);

    const startBarcodeScanner = async () => {
        if (!scannerContainerRef.current) return;

        setError(null);
        setIsScanning(true);

        try {
            const html5QrCode = new Html5Qrcode('scanner-container');
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                },
                (decodedText) => {
                    // Barcode scanned successfully
                    setScanResult(decodedText);
                    html5QrCode.stop().catch(() => { });
                    setIsScanning(false);

                    // Try to look up the barcode
                    lookupBarcode(decodedText);
                },
                () => {
                    // QR code scan error (ignore - this just means no code detected yet)
                }
            );
        } catch (err) {
            console.error('Scanner error:', err);
            setError('Could not access camera. Please check permissions.');
            setIsScanning(false);
        }
    };

    const stopBarcodeScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().catch(() => { });
            setIsScanning(false);
        }
    };

    const lookupBarcode = async (barcode: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // First check our local barcode mappings
            const mapRes = await fetch(`${API_BASE}/api/barcode-lookup?code=${encodeURIComponent(barcode)}`);
            if (mapRes.ok) {
                const data = await mapRes.json();
                if (data.result) {
                    setLookupResults([data.result]);
                    setIsLoading(false);
                    return;
                }
            }

            // No mapping found - show the barcode and prompt user
            setLookupResults([]);
            setError(`Barcode "${barcode}" not in database. Enter FCC/OEM to map it.`);
        } catch (err) {
            console.error('Barcode lookup error:', err);
            setError('Failed to look up barcode');
        }

        setIsLoading(false);
    };

    const lookupText = async (query: string) => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setLookupResults([]);

        try {
            // Try FCC lookup first
            const fccRes = await fetch(`${API_BASE}/api/fcc?q=${encodeURIComponent(query)}&limit=5`);
            if (fccRes.ok) {
                const data = await fccRes.json();
                if (data.results && data.results.length > 0) {
                    setLookupResults(data.results.map((r: { fcc_id: string; product_title?: string; image_url?: string }) => ({
                        fcc_id: r.fcc_id,
                        product_title: r.product_title,
                        image_url: r.image_url,
                        type: 'fcc'
                    })));
                    setIsLoading(false);
                    return;
                }
            }

            // Try OEM lookup via vehicle-products
            const oemRes = await fetch(`${API_BASE}/api/vehicle-products?oem=${encodeURIComponent(query)}`);
            if (oemRes.ok) {
                const data = await oemRes.json();
                if (data.products && data.products.length > 0) {
                    setLookupResults(data.products.map((p: { fcc_id?: string; oem_part_numbers?: string[]; product_title?: string; image_url?: string }) => ({
                        fcc_id: p.fcc_id,
                        oem_number: p.oem_part_numbers?.[0],
                        product_title: p.product_title,
                        image_url: p.image_url,
                        type: 'oem'
                    })));
                    setIsLoading(false);
                    return;
                }
            }

            setError(`No results found for "${query}"`);
        } catch (err) {
            console.error('Lookup error:', err);
            setError('Failed to look up code');
        }

        setIsLoading(false);
    };

    const handleSelectResult = (result: LookupResult) => {
        onKeyIdentified({
            type: activeTab,
            value: scanResult || textInput,
            fccId: result.fcc_id,
            oemNumber: result.oem_number,
            productName: result.product_title,
            imageUrl: result.image_url
        });
        handleClose();
    };

    const handleClose = () => {
        stopBarcodeScanner();
        setTextInput('');
        setScanResult(null);
        setLookupResults([]);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">🔍 Scan Key</h2>
                    <button
                        onClick={handleClose}
                        className="text-zinc-400 hover:text-white transition-colors text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'text'
                                ? 'text-yellow-400 border-b-2 border-yellow-400'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        ⌨️ Enter Code
                    </button>
                    <button
                        onClick={() => setActiveTab('barcode')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'barcode'
                                ? 'text-yellow-400 border-b-2 border-yellow-400'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        📷 Scan Barcode
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {/* Text Entry Tab */}
                    {activeTab === 'text' && (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400">
                                Enter an FCC ID or OEM part number to look up key details.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && lookupText(textInput)}
                                    placeholder="e.g., M3N-A2C31243800 or 89904-06220"
                                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:border-yellow-500 focus:outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={() => lookupText(textInput)}
                                    disabled={!textInput.trim() || isLoading}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold rounded-lg transition-colors"
                                >
                                    {isLoading ? '...' : 'Search'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Barcode Scanner Tab */}
                    {activeTab === 'barcode' && (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400">
                                Point your camera at a barcode on key packaging.
                            </p>

                            {/* Scanner container */}
                            <div
                                id="scanner-container"
                                ref={scannerContainerRef}
                                className="w-full h-48 bg-zinc-800 rounded-lg overflow-hidden"
                            />

                            {!isScanning && !scanResult && (
                                <button
                                    onClick={startBarcodeScanner}
                                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                                >
                                    📷 Start Camera
                                </button>
                            )}

                            {isScanning && (
                                <button
                                    onClick={stopBarcodeScanner}
                                    className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Stop Scanning
                                </button>
                            )}

                            {scanResult && (
                                <div className="p-3 bg-zinc-800 rounded-lg">
                                    <div className="text-xs text-zinc-500 mb-1">Scanned Barcode:</div>
                                    <div className="font-mono text-yellow-400">{scanResult}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Results */}
                    {lookupResults.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="text-xs text-zinc-500 uppercase tracking-wide">Results</div>
                            {lookupResults.map((result, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors flex items-center gap-3"
                                >
                                    {result.image_url ? (
                                        <img
                                            src={result.image_url}
                                            alt=""
                                            className="w-10 h-10 object-contain rounded bg-zinc-700"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 flex items-center justify-center text-2xl">🔑</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-mono text-yellow-400 text-sm truncate">
                                            {result.oem_number || result.fcc_id}
                                        </div>
                                        {result.product_title && (
                                            <div className="text-xs text-zinc-400 truncate">
                                                {result.product_title}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-green-400 text-xl">+</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="p-3 border-t border-zinc-800 text-center">
                    <span className="text-xs text-zinc-500">
                        Tap a result to add to inventory
                    </span>
                </div>
            </div>
        </div>
    );
}
