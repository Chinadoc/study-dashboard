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
    match_score?: number;
}

type ParsedVehicle = {
    year: string;
    make: string;
    model: string;
};

const VISION_SIGNATURE_SIZE = 24;
const VISION_MAX_CANDIDATES = 20;

function parseVehicleInput(input: string): ParsedVehicle {
    const parts = input.trim().split(/\s+/).filter(Boolean);
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
}

async function readImageSignature(blob: Blob): Promise<Float32Array | null> {
    const canvas = document.createElement('canvas');
    canvas.width = VISION_SIGNATURE_SIZE;
    canvas.height = VISION_SIGNATURE_SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
        const bitmap = await createImageBitmap(blob);
        ctx.drawImage(bitmap, 0, 0, VISION_SIGNATURE_SIZE, VISION_SIGNATURE_SIZE);
        bitmap.close();
    } else {
        const url = URL.createObjectURL(blob);
        try {
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => reject(new Error('Failed to decode image'));
                el.src = url;
            });
            ctx.drawImage(img, 0, 0, VISION_SIGNATURE_SIZE, VISION_SIGNATURE_SIZE);
        } finally {
            URL.revokeObjectURL(url);
        }
    }

    const imageData = ctx.getImageData(0, 0, VISION_SIGNATURE_SIZE, VISION_SIGNATURE_SIZE).data;
    const vector = new Float32Array(VISION_SIGNATURE_SIZE * VISION_SIGNATURE_SIZE);

    let sum = 0;
    for (let i = 0; i < vector.length; i++) {
        const p = i * 4;
        const luminance = (0.299 * imageData[p] + 0.587 * imageData[p + 1] + 0.114 * imageData[p + 2]) / 255;
        vector[i] = luminance;
        sum += luminance;
    }

    const mean = sum / vector.length;
    let variance = 0;
    for (let i = 0; i < vector.length; i++) {
        const centered = vector[i] - mean;
        variance += centered * centered;
    }
    const stdDev = Math.sqrt(variance / vector.length) || 1;

    for (let i = 0; i < vector.length; i++) {
        vector[i] = (vector[i] - mean) / stdDev;
    }

    return vector;
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
    if (a.length !== b.length || a.length === 0) return -1;
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    if (magA === 0 || magB === 0) return -1;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export default function KeyScannerModal({ isOpen, onClose, onKeyIdentified }: KeyScannerModalProps) {
    const [activeTab, setActiveTab] = useState<'barcode' | 'text' | 'vision'>('text');
    const [textInput, setTextInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [lookupResults, setLookupResults] = useState<LookupResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [visionVehicle, setVisionVehicle] = useState('');
    const [visionPhoto, setVisionPhoto] = useState<File | null>(null);
    const [visionPhotoPreview, setVisionPhotoPreview] = useState<string>('');

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);
    const visionFileInputRef = useRef<HTMLInputElement>(null);
    const imageSignatureCacheRef = useRef<Map<string, Float32Array>>(new Map());

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
            if (visionPhotoPreview) {
                URL.revokeObjectURL(visionPhotoPreview);
            }
        };
    }, [visionPhotoPreview]);

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
                    setScanResult(decodedText);
                    html5QrCode.stop().catch(() => { });
                    setIsScanning(false);
                    lookupBarcode(decodedText);
                },
                () => { }
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
            const mapRes = await fetch(`${API_BASE}/api/barcode-lookup?code=${encodeURIComponent(barcode)}`);
            if (mapRes.ok) {
                const data = await mapRes.json();
                if (data.result) {
                    setLookupResults([data.result]);
                    setIsLoading(false);
                    return;
                }
            }

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
            const fccRes = await fetch(`${API_BASE}/api/fcc?q=${encodeURIComponent(query)}&limit=5`);
            if (fccRes.ok) {
                const data = await fccRes.json();
                const fccResults = Array.isArray(data.results) ? data.results : (Array.isArray(data.rows) ? data.rows : []);
                if (fccResults.length > 0) {
                    setLookupResults(fccResults.map((r: { fcc_id: string; product_title?: string; image_url?: string }) => ({
                        fcc_id: r.fcc_id,
                        product_title: r.product_title,
                        image_url: r.image_url,
                        type: 'fcc'
                    })));
                    setIsLoading(false);
                    return;
                }
            }

            const oemRes = await fetch(`${API_BASE}/api/vehicle-products?oem=${encodeURIComponent(query)}`);
            if (oemRes.ok) {
                const data = await oemRes.json();
                if (data.products && data.products.length > 0) {
                    setLookupResults(data.products.map((p: { fcc_id?: string; oem_part_numbers?: string[]; product_title?: string; title?: string; image_url?: string }) => ({
                        fcc_id: p.fcc_id,
                        oem_number: p.oem_part_numbers?.[0],
                        product_title: p.product_title || p.title,
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

    const fetchVisionCandidates = async (vehicleInput: string): Promise<LookupResult[]> => {
        const { year, make, model } = parseVehicleInput(vehicleInput);
        if (!year || !make || !model) {
            throw new Error('Enter vehicle as: YYYY Make Model');
        }

        const params = new URLSearchParams();
        params.set('year', year);
        params.set('make', make);
        params.set('model', model);

        const response = await fetch(`${API_BASE}/api/vehicle-products-v2?${params}`);
        if (!response.ok) {
            throw new Error('Could not load key catalog for that vehicle');
        }

        const data = await response.json();
        const products = Array.isArray(data.products) ? data.products : [];
        const candidates = products
            .filter((p: any) => {
                const type = String(p.type || p.product_type || '').toLowerCase();
                return (
                    type.includes('smart') ||
                    type.includes('remote') ||
                    type.includes('transponder') ||
                    type.includes('flip') ||
                    type.includes('fobik') ||
                    type === 'mechanical key'
                );
            })
            .map((p: any) => {
                const fccId = Array.isArray(p.fcc_ids) && p.fcc_ids.length > 0
                    ? String(p.fcc_ids[0]).split(/[\s,]/)[0].trim()
                    : undefined;
                const oemNumber = Array.isArray(p.oem_parts) && p.oem_parts.length > 0
                    ? String(p.oem_parts[0]).trim()
                    : undefined;
                const imageUrl = Array.isArray(p.images) && p.images.length > 0
                    ? String(p.images[0])
                    : (p.image_url ? String(p.image_url) : undefined);

                return {
                    fcc_id: fccId,
                    oem_number: oemNumber,
                    product_title: p.title || p.type || p.product_type || 'Key',
                    image_url: imageUrl,
                    type: 'vision',
                    vehicle: `${year} ${make} ${model}`
                } satisfies LookupResult;
            })
            .filter((candidate: LookupResult) => !!candidate.image_url)
            .slice(0, VISION_MAX_CANDIDATES);

        return candidates;
    };

    const getSignatureForCandidate = async (imageUrl: string): Promise<Float32Array | null> => {
        const cached = imageSignatureCacheRef.current.get(imageUrl);
        if (cached) return cached;

        const response = await fetch(imageUrl, { mode: 'cors' });
        if (!response.ok) return null;
        const blob = await response.blob();
        const signature = await readImageSignature(blob);
        if (!signature) return null;

        imageSignatureCacheRef.current.set(imageUrl, signature);
        return signature;
    };

    const analyzeVisionPhoto = async () => {
        if (!visionPhoto) {
            setError('Add a key photo first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setLookupResults([]);

        try {
            const candidates = await fetchVisionCandidates(visionVehicle);
            if (candidates.length === 0) {
                setError('No key images found for this vehicle.');
                setIsLoading(false);
                return;
            }

            const targetSignature = await readImageSignature(visionPhoto);
            if (!targetSignature) {
                throw new Error('Could not analyze this photo.');
            }

            const scored: Array<{ candidate: LookupResult; similarity: number }> = [];
            for (const candidate of candidates) {
                if (!candidate.image_url) continue;
                try {
                    const sig = await getSignatureForCandidate(candidate.image_url);
                    if (!sig) continue;
                    const similarity = cosineSimilarity(targetSignature, sig);
                    if (Number.isFinite(similarity)) {
                        scored.push({ candidate, similarity });
                    }
                } catch {
                    continue;
                }
            }

            if (scored.length === 0) {
                setError('No visual matches found. Try a clearer photo or another angle.');
                setIsLoading(false);
                return;
            }

            const topMatches = scored
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 5)
                .map(({ candidate, similarity }) => ({
                    ...candidate,
                    match_score: Math.max(1, Math.min(99, Math.round(((similarity + 1) / 2) * 100)))
                }));

            setScanResult(`photo:${visionPhoto.name}`);
            setLookupResults(topMatches);

            if ((topMatches[0]?.match_score || 0) < 60) {
                setError('Low-confidence match. Confirm FCC/OEM before adding.');
            }
        } catch (err) {
            console.error('Vision match error:', err);
            setError(err instanceof Error ? err.message : 'Photo analysis failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectResult = (result: LookupResult) => {
        const value = activeTab === 'vision'
            ? `${visionVehicle || ''} ${scanResult || ''}`.trim()
            : (scanResult || textInput);

        onKeyIdentified({
            type: activeTab,
            value,
            fccId: result.fcc_id,
            oemNumber: result.oem_number,
            vehicle: result.vehicle || (activeTab === 'vision' ? visionVehicle : undefined),
            productName: result.product_title,
            imageUrl: result.image_url
        });
        handleClose();
    };

    const handleVisionPhotoChange = (file?: File | null) => {
        if (visionPhotoPreview) {
            URL.revokeObjectURL(visionPhotoPreview);
        }

        if (!file) {
            setVisionPhoto(null);
            setVisionPhotoPreview('');
            return;
        }

        setVisionPhoto(file);
        setVisionPhotoPreview(URL.createObjectURL(file));
        setLookupResults([]);
        setError(null);
    };

    const resetVisionState = () => {
        if (visionPhotoPreview) {
            URL.revokeObjectURL(visionPhotoPreview);
        }
        setVisionVehicle('');
        setVisionPhoto(null);
        setVisionPhotoPreview('');
    };

    const handleClose = () => {
        stopBarcodeScanner();
        setActiveTab('text');
        setTextInput('');
        setScanResult(null);
        setLookupResults([]);
        setError(null);
        resetVisionState();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">🔍 Scan Key</h2>
                    <button
                        onClick={handleClose}
                        className="text-zinc-400 hover:text-white transition-colors text-xl"
                    >
                        ×
                    </button>
                </div>

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
                        📷 Barcode
                    </button>
                    <button
                        onClick={() => setActiveTab('vision')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'vision'
                            ? 'text-yellow-400 border-b-2 border-yellow-400'
                            : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        🧠 Photo
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
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

                    {activeTab === 'barcode' && (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400">
                                Point your camera at a barcode on key packaging.
                            </p>

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

                    {activeTab === 'vision' && (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400">
                                Snap a key photo and match it against vehicle-specific key images.
                            </p>

                            <input
                                type="text"
                                value={visionVehicle}
                                onChange={(e) => setVisionVehicle(e.target.value)}
                                placeholder="2021 Toyota Camry"
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none"
                            />

                            <input
                                ref={visionFileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => handleVisionPhotoChange(e.target.files?.[0] || null)}
                            />

                            <button
                                type="button"
                                onClick={() => visionFileInputRef.current?.click()}
                                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg transition-colors border border-zinc-700"
                            >
                                {visionPhoto ? '📷 Replace Photo' : '📷 Add Key Photo'}
                            </button>

                            {visionPhotoPreview && (
                                <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-2">
                                    <img
                                        src={visionPhotoPreview}
                                        alt="Key reference"
                                        className="w-full h-40 object-contain rounded-md bg-zinc-900"
                                    />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={analyzeVisionPhoto}
                                disabled={isLoading || !visionPhoto || !visionVehicle.trim()}
                                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold rounded-lg transition-colors"
                            >
                                {isLoading ? 'Analyzing...' : '✨ Suggest Inventory Item'}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

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
                                        {typeof result.match_score === 'number' && (
                                            <div className="text-[10px] text-emerald-400 mt-0.5">
                                                Match confidence: {result.match_score}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-green-400 text-xl">+</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-zinc-800 text-center">
                    <span className="text-xs text-zinc-500">
                        Tap a result to add to inventory
                    </span>
                </div>
            </div>
        </div>
    );
}
