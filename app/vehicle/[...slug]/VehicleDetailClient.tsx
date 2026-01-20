'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import VehicleHeader from '@/components/vehicle/VehicleHeader';
import VehicleSpecs from '@/components/vehicle/VehicleSpecs';
import KeyCards from '@/components/vehicle/KeyCards';
import VisualReferences from '@/components/vehicle/VisualReferences';
import TechnicalPearls from '@/components/vehicle/TechnicalPearls';
import VehicleProcedures from '@/components/vehicle/VehicleProcedures';
import LocksmithSidebar from '@/components/vehicle/LocksmithSidebar';
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

    return products.map(p => {
        // Build a descriptive name if title is generic or missing
        let name = p.title || p.product_title || '';
        if (!name || name === 'Unknown' || name.toLowerCase().includes('remote')) {
            const btn = p.buttons || '';
            const tech = p.product_type || '';
            name = `${btn}-Button ${tech}`.trim();
        }

        return {
            name: name,
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
            type: p.product_type?.toLowerCase().includes('smart') || p.product_type?.toLowerCase().includes('prox') ? 'prox'
                : p.product_type?.toLowerCase().includes('flip') ? 'flip'
                    : p.product_type?.toLowerCase().includes('blade') ? 'blade'
                        : 'prox',
            title: p.title,
            item_number: p.item_number,
        };
    });
}

// Deduplicate keys by type: show one representative per key configuration
// (e.g., one 3-button, one 4-button with RS, one emergency blade)
// Excludes bulk packs and prioritizes OEM NEW
function deduplicateKeysByType(keys: any[], specs?: any): any[] {
    if (!keys || (keys.length === 0 && !specs?.keyway)) return [];

    // Group keys by their "key type" - determined by button count and features
    const groups: Record<string, any[]> = {};

    keys.forEach(key => {
        const name = (key.name || key.title || '').toLowerCase();
        const buttons = key.buttons || '';

        // Skip bulk packs (5-PACK, 10-PACK, etc.)
        if (name.includes('-pack') || name.includes('pack ')) return;

        // Determine key type group
        let groupKey: string;
        if (name.includes('blade') || name.includes('emergency') || key.type === 'blade') {
            groupKey = 'emergency_blade';
        } else if (name.includes('remote start') || name.includes('w/rs')) {
            // 4-button with remote start
            const btnMatch = name.match(/(\d)-btn/) || name.match(/(\d)-button/);
            const btnCount = btnMatch ? btnMatch[1] : '4';
            groupKey = `${btnCount}btn_rs`;
        } else {
            // Regular button count
            const btnMatch = name.match(/(\d)-btn/) || name.match(/(\d)-button/);
            const btnCount = btnMatch ? btnMatch[1] : buttons.split(',')[0]?.match(/\d+/)?.[0] || 'prox';
            groupKey = `${btnCount}btn`;
        }

        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(key);
    });

    // Synthesis: If a keyway exists in specs but no emergency_blade group was found, add it
    if (specs?.keyway && !groups['emergency_blade']) {
        groups['emergency_blade'] = [{
            name: `Emergency Blade (${specs.keyway})`,
            type: 'blade',
            keyway: specs.keyway,
            priceRange: '$12.00 - $18.00',
            image: undefined, // Will show 🔑 emoji in KeyCard
            oem: []
        }];
    }

    // From each group, select best representative: prefer OEM NEW > OEM REFURB MINT > BRK, lowest price
    const result: any[] = [];
    Object.values(groups).forEach(groupKeys => {
        // Sort by quality preference then price
        groupKeys.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();

            // Prioritize OEM NEW
            if (nameA.includes('oem new') && !nameB.includes('oem new')) return -1;
            if (!nameA.includes('oem new') && nameB.includes('oem new')) return 1;

            // Then OEM REFURB MINT
            if (nameA.includes('mint') && !nameB.includes('mint')) return -1;
            if (!nameA.includes('mint') && nameB.includes('mint')) return 1;

            // Deprioritize BRK (aftermarket)
            if (!nameA.includes('brk') && nameB.includes('brk')) return -1;
            if (nameA.includes('brk') && !nameB.includes('brk')) return 1;

            return nameA.localeCompare(nameB);
        });

        // Grouping improvement: If multiple FCCs/Buttons exist that are distinct, 
        // they might be different legitimate options (e.g. 5-btn vs 6-btn on Enclave)
        if (groupKeys.length > 0) {
            result.push(groupKeys[0]);

            // If there's another key with a different button count in the same group, keep it too
            const firstButtons = groupKeys[0].buttons;
            const differentButtonVariant = groupKeys.find(k => k.buttons && k.buttons !== firstButtons && !k.name.toLowerCase().includes('brk'));
            if (differentButtonVariant) {
                result.push(differentButtonVariant);
            }
        }
    });

    // Sort result: blade last, then by button count
    result.sort((a, b) => {
        const aIsBlade = (a.name || '').toLowerCase().includes('blade');
        const bIsBlade = (b.name || '').toLowerCase().includes('blade');
        if (aIsBlade && !bIsBlade) return 1;
        if (!aIsBlade && bIsBlade) return -1;
        return 0;
    });

    return result;
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

                // Cross-pollination: If still no pearls, fetch from related makes by architecture
                if (!pearls.pearls?.length) {
                    const architecture = detail.header?.immobilizer_system || '';
                    const ARCHITECTURE_MAKES: Record<string, string[]> = {
                        'GM PK3 / PK3+ / PEPS': ['Chevrolet', 'GMC', 'Cadillac'],
                        'Global A': ['Chevrolet', 'GMC', 'Cadillac'],
                        'Global B': ['Chevrolet', 'GMC', 'Cadillac'],
                    };

                    // Find related makes for this architecture
                    const relatedMakes = Object.entries(ARCHITECTURE_MAKES)
                        .filter(([arch]) => architecture.toLowerCase().includes(arch.toLowerCase().split(' ')[0]))
                        .flatMap(([, makes]) => makes)
                        .filter(m => m.toLowerCase() !== make.toLowerCase());

                    // Fetch pearls from the first related make that has data
                    for (const relatedMake of relatedMakes) {
                        const relatedPearlsRes = await fetch(`${API_BASE}/api/pearls?make=${encodeURIComponent(relatedMake)}`).catch(() => null);
                        const relatedPearls = relatedPearlsRes?.ok ? await relatedPearlsRes.json() : { pearls: [] };
                        if (relatedPearls.pearls?.length > 0) {
                            pearls = { ...relatedPearls, source: `cross-pollinated from ${relatedMake}` };
                            break;
                        }
                    }
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

    // Universal key classification system
    // Groups products by (type + button count), filters packs/shells, aggregates OEM parts
    function classifyVypProducts(vypData: any, vehicleSpecs: any): any[] {
        if (!vypData || !vypData.product_types) return [];

        // Extract unique product types found in VYP to cross-reference with our knowledge base
        const productTypes = Array.from(new Set(
            vypData.product_types.filter((t: any): t is string => typeof t === 'string')
        ));
        const fccIds: string[] = (vypData.fcc_ids || []).map((f: string) => f.trim()).filter(Boolean);
        const oemParts: string[] = [...new Set((vypData.oem_parts || []).map((p: string) => p.trim()).filter(Boolean))];
        const chips: string[] = (vypData.chips || []).map((c: string) => c.trim()).filter(Boolean);

        // Detect button configurations from product type names
        const buttonConfigs: Set<string> = new Set();
        productTypes.forEach(t => {
            const lowerT = t.toLowerCase();
            // Skip packs and shells
            if (lowerT.includes('pack') || lowerT.includes('shell')) return;

            // Parse button count from product types or FCC descriptions
            if (lowerT.includes('3-btn') || lowerT.includes('3 btn') || lowerT.includes('3-button')) {
                buttonConfigs.add('3btn');
            }
            if (lowerT.includes('4-btn') || lowerT.includes('4 btn') || lowerT.includes('4-button')) {
                buttonConfigs.add('4btn');
            }
            if (lowerT.includes('5-btn') || lowerT.includes('5 btn') || lowerT.includes('5-button')) {
                buttonConfigs.add('5btn');
            }
            if (lowerT.includes('6-btn') || lowerT.includes('6 btn') || lowerT.includes('6-button')) {
                buttonConfigs.add('6btn');
            }
        });

        // Also scan FCC strings for button hints
        fccIds.forEach(f => {
            const lowerF = f.toLowerCase();
            if (lowerF.includes('3-btn')) buttonConfigs.add('3btn');
            if (lowerF.includes('4-btn')) buttonConfigs.add('4btn');
            if (lowerF.includes('5-btn')) buttonConfigs.add('5btn');
        });

        // Determine key types present
        const hasRemotes = productTypes.some(t => t.toLowerCase().includes('remote') && !t.toLowerCase().includes('shell'));
        const hasTransponder = productTypes.some(t => t.toLowerCase().includes('transponder') && !t.toLowerCase().includes('shell'));
        const hasMechanical = productTypes.some(t => t.toLowerCase().includes('mechanical'));
        const hasFlip = productTypes.some(t => t.toLowerCase().includes('flip'));

        const keys: any[] = [];

        // If we have specific button configs, create a card for each
        if (hasRemotes && buttonConfigs.size > 0) {
            const buttonList = Array.from(buttonConfigs).sort();
            buttonList.forEach(btnKey => {
                const btnNum = btnKey.replace('btn', '');
                const features = btnNum === '4' ? ' w/Start or Hatch' : btnNum === '5' ? ' w/Hatch' : '';
                keys.push({
                    name: `${btnNum}-Button Remote${features}`,
                    type: 'prox',
                    buttons: btnNum,
                    fcc: fccIds.slice(0, 3).join(', '),
                    chip: chips[0]?.replace(/PHILIPS\s*/i, ''),
                    battery: 'CR2032',
                    oem: oemParts.slice(0, 6).map(p => ({ number: p })),
                    priceRange: `$12 - $${parseInt(btnNum) > 4 ? '95' : '85'}`,
                });
            });
        } else if (hasRemotes) {
            // Generic remote if no specific buttons detected
            keys.push({
                name: 'Remote Key Fob',
                type: 'prox',
                fcc: fccIds.slice(0, 3).join(', '),
                chip: chips[0]?.replace(/PHILIPS\s*/i, ''),
                battery: 'CR2032',
                oem: oemParts.slice(0, 6).map(p => ({ number: p })),
                priceRange: '$12 - $95',
            });
        }

        // Transponder key (chip key without remote buttons)
        if (hasTransponder) {
            const keyway = vehicleSpecs.transponder_key || vehicleSpecs.mechanical_key || 'B111';
            keys.push({
                name: `Transponder Key (${keyway})`,
                type: hasFlip ? 'flip' : 'prox',
                chip: chips[0]?.replace(/PHILIPS\s*/i, ''),
                keyway: keyway,
                priceRange: '$4 - $15',
                oem: [],
            });
        }

        // Mechanical/Emergency blade
        if (hasMechanical || vehicleSpecs.mechanical_key) {
            const blade = vehicleSpecs.mechanical_key || 'B106';
            keys.push({
                name: `Emergency Blade (${blade})`,
                type: 'blade',
                keyway: blade,
                priceRange: '$0.70 - $7',
                oem: [],
            });
        }

        return keys;
    }

    // Merge keys: prioritize /api/vehicle-products (has R2 images), fallback to products_by_type, then VYP
    const keysFromProducts = transformProducts(data.products?.products || []);
    const keysFromPBT = transformProductsByType(productsByType);
    const keysFromVYP = classifyVypProducts(vyp, specs);
    const rawKeys = keysFromProducts.length > 0 ? keysFromProducts
        : keysFromPBT.length > 0 ? keysFromPBT
            : keysFromVYP;

    // Deduplicate keys by type (3-btn, 4-btn, blade) to avoid showing all product variants
    const mergedKeys = deduplicateKeysByType(rawKeys, specs);

    // Extract pearls and images
    const pearlsList = data.pearls?.pearls || [];
    const imagesList = data.images?.images || [];

    // Extract dynamic sidebar content from pearls
    const criticalPearl = pearlsList.find((p: any) => (p.risk || '').toLowerCase() === 'critical');
    const proTipPearl = pearlsList.find((p: any) => (p.risk || '').toLowerCase() === 'important' || (p.risk || '').toLowerCase() === 'info');

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

    // Filter pearls by context
    const addKeyPearls = pearlsList.filter((p: any) => {
        const tags = (p.tags || []).map((t: string) => t.toLowerCase());
        const cat = (p.category || '').toLowerCase();
        return tags.includes('add key') || tags.includes('spare key') || cat.includes('add key');
    });

    const aklPearls = pearlsList.filter((p: any) => {
        const tags = (p.tags || []).map((t: string) => t.toLowerCase());
        const cat = (p.category || '').toLowerCase();
        const risk = (p.risk || '').toLowerCase();
        return tags.includes('akl') || tags.includes('all keys lost') || cat.includes('akl') || risk === 'critical';
    });

    // Pearls to show in the general section (exclude ones shown in procedures)
    const procedurePearlIds = new Set([...addKeyPearls, ...aklPearls].map(p => p.id));
    const generalPearls = pearlsList.filter((p: any) => !procedurePearlIds.has(p.id));

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header with title and badges */}
            <VehicleHeader
                make={make}
                model={model}
                year={year}
                platform={header.platform}
                architecture={header.immobilizer_system}
                canFd={header.can_fd_required === 1 || header.can_fd_required === true}
            />

            {/* Two-Column Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">

                {/* Left Column: Main Content (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Vehicle Specifications Grid */}
                    <VehicleSpecs specs={fullSpecs} make={make} year={year} />

                    {/* Key Configuration Cards with R2 images */}
                    <KeyCards keys={mergedKeys} />

                    {/* Programming Procedures */}
                    <VehicleProcedures procedures={{
                        addKey: addKeyWalkthrough ? {
                            title: addKeyWalkthrough.title,
                            time_minutes: addKeyWalkthrough.estimated_time_mins,
                            steps: addKeyWalkthrough.content?.split('\n').filter(Boolean).slice(0, 10),
                            menu_path: addKeyWalkthrough.platform_code,
                            pearls: addKeyPearls
                        } : undefined,
                        akl: aklWalkthrough ? {
                            title: aklWalkthrough.title,
                            time_minutes: aklWalkthrough.estimated_time_mins,
                            risk_level: 'high' as const,
                            steps: aklWalkthrough.content?.split('\n').filter(Boolean).slice(0, 10),
                            menu_path: aklWalkthrough.platform_code,
                            pearls: aklPearls
                        } : undefined,
                    }} />

                    {/* Visual References Gallery */}
                    <VisualReferences images={imagesList} />

                    {/* Technical Pearls / Insights (General only) */}
                    <TechnicalPearls pearls={generalPearls} />
                </div>

                {/* Right Column: Locksmith Sidebar (4/12) */}
                <div className="lg:col-span-4 space-y-6">
                    <LocksmithSidebar
                        specs={{
                            ...fullSpecs,
                            // Override battery/keyway with representative key data if available
                            battery: mergedKeys[0]?.battery || fullSpecs.battery,
                            keyway: mergedKeys[0]?.blade || mergedKeys[0]?.keyway || fullSpecs.keyway,
                        }}
                        platform={header.platform}
                        architecture={header.immobilizer_system}
                        gotchaText={criticalPearl?.content}
                        proTipText={proTipPearl?.content}
                    />
                </div>
            </div>
        </div>
    );
}


