'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import VehicleHeader from '@/components/vehicle/VehicleHeader';
import VehicleSpecs from '@/components/vehicle/VehicleSpecs';
import KeyCards from '@/components/vehicle/KeyCards';
import VisualReferences from '@/components/vehicle/VisualReferences';
import TechnicalPearls from '@/components/vehicle/TechnicalPearls';
import VehicleProcedures from '@/components/vehicle/VehicleProcedures';
import { API_BASE } from '@/lib/config';

// Transform products_by_type from API into KeyConfig[] for KeyCards
function transformProductsByType(pbt: Record<string, any>): any[] {
    if (!pbt || Object.keys(pbt).length === 0) return [];

    return Object.entries(pbt).map(([type, data]) => ({
        name: type,
        fcc: data.fcc_ids?.filter(Boolean).join(', ') || undefined,
        chip: data.chips?.filter(Boolean).join(', ') || undefined,
        battery: data.batteries?.[0] || undefined,
        frequency: data.frequencies?.[0] || undefined,
        keyway: data.keyways?.[0] || undefined,
        buttons: data.buttons?.filter(Boolean).join(', ') || undefined,
        priceRange: data.price_range?.min && data.price_range?.max
            ? `$${Number(data.price_range.min).toFixed(2)} - $${Number(data.price_range.max).toFixed(2)}`
            : undefined,
        oem: data.oem_parts?.filter(Boolean).map((p: string) => ({ number: p })) || [],
        type: type.toLowerCase().includes('prox') || type.toLowerCase().includes('smart') ? 'prox'
            : type.toLowerCase().includes('flip') ? 'flip'
                : type.toLowerCase().includes('blade') ? 'blade'
                    : 'remote',
    }));
}

// Transform products from /api/vehicle-products to include R2 image URLs
function transformProducts(products: any[]): any[] {
    if (!products || products.length === 0) return [];

    return products.map(p => ({
        name: p.title || `${p.buttons}-Button Key`,
        fcc: p.fcc_id,
        chip: p.chip,
        battery: p.battery,
        frequency: p.frequency,
        keyway: p.keyway,
        buttons: p.buttons,
        priceRange: p.price ? `$${p.price}` : undefined,
        oem: p.oem_part_numbers?.map((n: string) => ({ number: n })) || [],
        image: p.image_url,
        image_r2_key: p.image_r2_key,
        type: p.product_type?.toLowerCase().includes('smart') ? 'prox'
            : p.product_type?.toLowerCase().includes('flip') ? 'flip'
                : p.product_type?.toLowerCase().includes('blade') ? 'blade'
                    : 'prox',
        title: p.title,
        item_number: p.item_number,
    }));
}

export default function VehicleDetailClient() {
    const pathname = usePathname() ?? '';
    const searchParams = useSearchParams();

    // Check for 'original' query param from 404 redirect, otherwise use pathname
    const originalPath = searchParams?.get('original') || pathname;
    const segments = originalPath.split('/').filter(Boolean);

    // Path: /vehicle/make/model/year -> segments: ["vehicle", make, model, year]
    const make = segments[1] ? decodeURIComponent(segments[1]) : '';
    const model = segments[2] ? decodeURIComponent(segments[2]) : '';
    const year = segments[3] ? parseInt(segments[3], 10) : 0;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;
        async function fetchVehicleData() {
            if (!make || !model || !year) return;
            setLoading(true);
            setError(null);
            try {
                const queryParams = `make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;
                const makeOnlyParams = `make=${encodeURIComponent(make)}`;

                // First batch: vehicle-specific data
                const [detailRes, productsRes, walkthroughsRes, pearlsRes, imagesRes] = await Promise.all([
                    fetch(`${API_BASE}/api/vehicle-detail?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/vehicle-products?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/walkthroughs?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/pearls?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/images?${makeOnlyParams}`).catch(() => null), // Images at make level (cross-pollinated)
                ]);

                const detail = detailRes?.ok ? await detailRes.json() : {};
                const products = productsRes?.ok ? await productsRes.json() : { products: [] };
                const walkthroughs = walkthroughsRes?.ok ? await walkthroughsRes.json() : { walkthroughs: [] };
                let pearls = pearlsRes?.ok ? await pearlsRes.json() : { pearls: [] };
                const images = imagesRes?.ok ? await imagesRes.json() : { images: [] };

                // Fallback: If no model-specific pearls, fetch make-level pearls
                if (!pearls.pearls?.length) {
                    const makePearlsRes = await fetch(`${API_BASE}/api/pearls?${makeOnlyParams}`).catch(() => null);
                    pearls = makePearlsRes?.ok ? await makePearlsRes.json() : { pearls: [] };
                }

                setData({ detail, products, walkthroughs, pearls, images });
            } catch (err) {
                console.error('Failed to fetch vehicle data:', err);
                setError('Failed to load vehicle data.');
            } finally {
                setLoading(false);
            }
        }
        fetchVehicleData();
    }, [make, model, year]);

    if (!make || !model || !year) {
        return <div className="container mx-auto p-12 text-center text-zinc-400">Loading route parameters...</div>;
    }

    if (loading) {
        return (
            <div className="container mx-auto p-12 text-center">
                <div className="animate-pulse">
                    <div className="text-4xl mb-4">🔑</div>
                    <div className="text-white text-lg">Loading vehicle intelligence...</div>
                    <div className="text-zinc-500 text-sm mt-2">{year} {make} {model}</div>
                </div>
            </div>
        );
    }

    // Extract data using correct API response paths
    const detail = data.detail || {};
    const header = detail.header || {};
    const specs = detail.specs || {};
    const productsByType = detail.products_by_type || {};
    const vyp = detail.vyp || {};

    // Merge keys: prioritize /api/vehicle-products (has R2 images), fallback to products_by_type
    const keysFromProducts = transformProducts(data.products?.products || []);
    const keysFromPBT = transformProductsByType(productsByType);
    const mergedKeys = keysFromProducts.length > 0 ? keysFromProducts : keysFromPBT;

    // Extract pearls and images
    const pearlsList = data.pearls?.pearls || [];
    const imagesList = data.images?.images || [];

    // Build complete specs object for VehicleSpecs component
    const fullSpecs = {
        architecture: header.immobilizer_system,
        platform: header.platform,
        immobilizerSystem: header.immobilizer_system,
        canFdRequired: header.can_fd_required === 1 || header.can_fd_required === true,
        chipType: specs.chip,
        fccId: specs.fcc_id,
        frequency: specs.frequency,
        battery: specs.battery,
        keyway: specs.keyway,
        lishi: specs.lishi,
        lishiSource: specs.lishi_source,
        spaces: specs.spaces,
        depths: specs.depths,
        macs: specs.macs,
        codeSeries: specs.code_series,
    };

    // Map walkthroughs to procedures format
    const addKeyWalkthrough = data.walkthroughs?.walkthroughs?.find((w: any) =>
        w.category?.toLowerCase().includes('add') || w.title?.toLowerCase().includes('add key')
    );
    const aklWalkthrough = data.walkthroughs?.walkthroughs?.find((w: any) =>
        w.category?.toLowerCase().includes('akl') || w.title?.toLowerCase().includes('all keys lost')
    );

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header with title and badges */}
            <VehicleHeader
                make={make}
                model={model}
                year={year}
                platform={header.platform}
                architecture={header.immobilizer_system}
                canFd={header.can_fd_required === 1 || header.can_fd_required === true}
                specs={{
                    chipType: specs.chip,
                    fccId: specs.fcc_id,
                    frequency: specs.frequency,
                    battery: specs.battery,
                    keyway: specs.keyway,
                    lishi: specs.lishi,
                    lishiSource: specs.lishi_source,
                }}
            />

            {/* Vehicle Specifications Grid */}
            <VehicleSpecs specs={fullSpecs} />

            {/* Key Configuration Cards with R2 images */}
            <KeyCards keys={mergedKeys} />

            {/* Visual References Gallery */}
            <VisualReferences images={imagesList} />

            {/* Technical Pearls / Insights */}
            <TechnicalPearls pearls={pearlsList} />

            {/* Programming Procedures */}
            <VehicleProcedures procedures={{
                addKey: addKeyWalkthrough ? {
                    title: addKeyWalkthrough.title,
                    time_minutes: addKeyWalkthrough.estimated_time_mins,
                    steps: addKeyWalkthrough.content?.split('\n').filter(Boolean).slice(0, 10),
                    menu_path: addKeyWalkthrough.platform_code,
                } : undefined,
                akl: aklWalkthrough ? {
                    title: aklWalkthrough.title,
                    time_minutes: aklWalkthrough.estimated_time_mins,
                    risk_level: 'high' as const,
                    steps: aklWalkthrough.content?.split('\n').filter(Boolean).slice(0, 10),
                    menu_path: aklWalkthrough.platform_code,
                } : undefined,
            }} />
        </div>
    );
}


