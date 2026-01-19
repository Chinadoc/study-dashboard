'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import VehicleHeader from '@/components/vehicle/VehicleHeader';
import KeyCards from '@/components/vehicle/KeyCards';
import VehicleProcedures from '@/components/vehicle/VehicleProcedures';
import { API_BASE } from '@/lib/config';

export default function VehicleDetailPage() {
    const params = useParams();
    const make = decodeURIComponent(params.make as string);
    const model = decodeURIComponent(params.model as string);
    const year = parseInt(params.year as string, 10);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>({});

    useEffect(() => {
        async function fetchVehicleData() {
            setLoading(true);
            setError(null);

            try {
                const queryParams = `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;

                const [detailRes, productsRes, walkthroughsRes, pearlsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/vehicle-detail?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/vehicle-products?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/walkthroughs?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/pearls?${queryParams}`).catch(() => null),
                ]);

                const detail = detailRes?.ok ? await detailRes.json() : {};
                const products = productsRes?.ok ? await productsRes.json() : { products: [] };
                const walkthroughs = walkthroughsRes?.ok ? await walkthroughsRes.json() : { walkthroughs: [] };
                const pearls = pearlsRes?.ok ? await pearlsRes.json() : { pearls: [] };

                setData({ detail, products, walkthroughs, pearls });
            } catch (err) {
                console.error('Failed to fetch vehicle data:', err);
                setError('Failed to load vehicle data. Please try again.');
            } finally {
                setLoading(false);
            }
        }

        if (make && model && year) {
            fetchVehicleData();
        }
    }, [make, model, year]);

    // Transform data for components
    const { detail, products, walkthroughs, pearls } = data;

    const specs = {
        chipType: detail?.chip_type || detail?.transponder_chip || products?.products?.[0]?.chip,
        battery: detail?.battery || products?.products?.[0]?.battery,
        keyway: detail?.keyway || detail?.key_profile,
        fccId: detail?.fcc_id || products?.products?.[0]?.fcc_id,
        frequency: detail?.frequency || products?.products?.[0]?.frequency,
        lishi: detail?.lishi_tool || detail?.lishi,
    };

    const keys = (products?.products || []).map((p: any) => ({
        name: p.key_type || p.name || `${p.buttons || ''} Smart Key`,
        fcc: p.fcc_id,
        type: determineKeyType(p),
        buttons: p.button_count ? `${p.button_count}-Button` : p.buttons,
        battery: p.battery,
        chip: p.chip || p.transponder,
        priceRange: p.price_range || formatPriceRange(p.price_low, p.price_high),
        oem: parseOemParts(p.oem_parts || p.oem_number),
        image: p.image_url,
        blade: p.blade_profile,
    }));

    const procedures = {
        requirements: detail?.requirements || extractRequirements(walkthroughs),
        addKey: walkthroughs?.walkthroughs?.find((w: any) =>
            w.type === 'add_key' || w.title?.toLowerCase().includes('add key')
        ),
        akl: walkthroughs?.walkthroughs?.find((w: any) =>
            w.type === 'akl' || w.title?.toLowerCase().includes('all keys lost')
        ),
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-32 bg-zinc-800 rounded"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-64 bg-zinc-800 rounded"></div>
                        <div className="h-64 bg-zinc-800 rounded"></div>
                        <div className="h-64 bg-zinc-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="glass p-8 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Vehicle</h2>
                    <p className="text-zinc-400">{error}</p>
                    <a href="/browse" className="inline-block mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors">
                        Back to Browse
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            <VehicleHeader
                make={make}
                model={model}
                year={year}
                platform={detail?.platform}
                architecture={detail?.architecture}
                canFd={detail?.can_fd_required || detail?.canFd}
                specs={specs}
            />

            <KeyCards keys={keys} />

            <VehicleProcedures procedures={procedures} />

            {/* Pearls Section */}
            {pearls?.pearls && pearls.pearls.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="text-2xl">💡</span> Tech Insights
                    </h2>
                    <div className="grid gap-4">
                        {pearls.pearls.map((pearl: any, i: number) => (
                            <PearlCard key={i} pearl={pearl} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper components
function PearlCard({ pearl }: { pearl: any }) {
    const severityColors: Record<string, string> = {
        critical: 'border-red-500/50 bg-red-900/20',
        high: 'border-orange-500/50 bg-orange-900/20',
        medium: 'border-yellow-500/50 bg-yellow-900/20',
        low: 'border-blue-500/50 bg-blue-900/20',
        info: 'border-zinc-500/50 bg-zinc-900/20',
    };

    return (
        <div className={`glass p-4 border-l-4 ${severityColors[pearl.severity] || severityColors.info}`}>
            {pearl.title && <h4 className="font-bold text-white mb-1">{pearl.title}</h4>}
            <p className="text-sm text-zinc-300">{pearl.content || pearl.text}</p>
        </div>
    );
}

// Helper functions
function determineKeyType(product: any): 'prox' | 'blade' | 'flip' | 'remote' {
    const name = (product.key_type || product.name || '').toLowerCase();
    if (name.includes('flip')) return 'flip';
    if (name.includes('blade') || name.includes('mechanical')) return 'blade';
    if (name.includes('remote head')) return 'remote';
    return 'prox';
}

function formatPriceRange(low?: number, high?: number): string | undefined {
    if (!low && !high) return undefined;
    if (low && high) return `$${low} - $${high}`;
    return low ? `$${low}+` : `$${high}`;
}

function parseOemParts(oem: any): Array<{ number: string }> {
    if (!oem) return [];
    if (Array.isArray(oem)) return oem.map(n => ({ number: String(n) }));
    return String(oem).split(',').map(n => ({ number: n.trim() }));
}

function extractRequirements(walkthroughs: any): string[] {
    const reqs = new Set<string>();
    (walkthroughs?.walkthroughs || []).forEach((w: any) => {
        (w.requirements || []).forEach((r: string) => reqs.add(r));
    });
    return Array.from(reqs);
}
