'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import VehicleHeader from '@/components/vehicle/VehicleHeader';
import VehicleSpecs from '@/components/vehicle/VehicleSpecs';
import CommentSection from '@/components/CommentSection';
import KeyCards from '@/components/vehicle/KeyCards';
import VisualReferences from '@/components/vehicle/VisualReferences';
import TechnicalPearls from '@/components/vehicle/TechnicalPearls';
import DossierReferences from '@/components/vehicle/DossierReferences';
import VehicleProcedures from '@/components/vehicle/VehicleProcedures';
import VideoEmbed from '@/components/vehicle/VideoEmbed';
import LocksmithSidebar from '@/components/vehicle/LocksmithSidebar';
import ToolCoverageSidebar from '@/components/vehicle/ToolCoverageSidebar';
import FloatingCommentTab from '@/components/FloatingCommentTab';
import CommunityHighlight from '@/components/CommunityHighlight';
import VehicleSidebar from '@/components/layout/VehicleSidebar';
import { API_BASE } from '@/lib/config';
import { trackVehicleView } from '@/lib/analytics';
import { filterRelevantImages } from '@/lib/imageRelevanceScorer';
import { useAuth } from '@/contexts/AuthContext';

// Demo vehicle that's free for all users
const DEMO_VEHICLE = { make: 'honda', model: 'civic', year: 2018 };
// Transform products_by_type from API into KeyConfig[] for KeyCards
function transformProductsByType(pbt: Record<string, any>): any[] {
    if (!pbt || Object.keys(pbt).length === 0) return [];

    return Object.entries(pbt).map(([type, data]) => ({
        name: type,
        fcc: Array.isArray(data.fcc_ids) ? data.fcc_ids.filter(Boolean).join(', ') : undefined,
        chip: Array.isArray(data.chips) ? data.chips.filter(Boolean).join(', ') : undefined,
        battery: Array.isArray(data.batteries) ? data.batteries[0] : undefined,
        frequency: Array.isArray(data.frequencies) ? data.frequencies[0] : undefined,
        keyway: Array.isArray(data.keyways) ? data.keyways[0] : undefined,
        buttons: Array.isArray(data.buttons) ? data.buttons.filter(Boolean).join(', ') : undefined,
        priceRange: data.price_range?.min && data.price_range?.max
            ? `$${Number(data.price_range.min).toFixed(2)} - $${Number(data.price_range.max).toFixed(2)}`
            : undefined,
        oem: Array.isArray(data.oem_parts) ? data.oem_parts.filter(Boolean).map((p: string) => ({ number: p })) : [],
        type: type.toLowerCase().includes('prox') || type.toLowerCase().includes('smart') ? 'prox'
            : type.toLowerCase().includes('flip') ? 'flip'
                : type.toLowerCase().includes('blade') ? 'blade'
                    : 'remote',
    }));
}

// Transform aks_key_configs from API into KeyConfig[] for KeyCards
// New format: grouped by keyType → buttonCount with R2 images
function transformAksKeyConfigs(configs: any[]): any[] {
    if (!configs || !Array.isArray(configs) || configs.length === 0) return [];

    return configs
        // Filter out tools, miscellaneous items, and sets (multiple keys in one image)
        .filter(c => {
            const keyType = (c.keyType || '').toLowerCase();
            const name = (c.name || '').toLowerCase();
            const partNumber = (c.partNumber || '').toLowerCase();
            return !keyType.includes('lishi') && !keyType.includes('tool') && keyType !== 'key'
                && !keyType.includes('set') && !name.includes('set') && !partNumber.includes('set');
        })
        .map(c => {
            // Build display name: "3-Button Smart Key" or "Smart Key" or "Emergency Key"
            const buttonPart = c.buttonCount ? `${c.buttonCount}-Button ` : '';
            const name = `${buttonPart}${c.keyType}`;

            // Determine type for styling
            const keyTypeLower = (c.keyType || '').toLowerCase();
            // Determine type for styling - transponder keys are distinct from prox/smart
            const type = keyTypeLower.includes('smart') || keyTypeLower.includes('prox') ? 'prox'
                : keyTypeLower.includes('flip') ? 'flip'
                    : keyTypeLower.includes('blade') || keyTypeLower.includes('emergency') ? 'blade'
                        : keyTypeLower.includes('transponder') ? 'transponder'
                            : keyTypeLower.includes('remote') && !keyTypeLower.includes('smart') ? 'remote'
                                : keyTypeLower.includes('mechanical') ? 'blade'
                                    : 'prox';

            // Parse OEM parts - handle both array and comma-separated string formats
            const oemParts = (c.oemParts || []).flatMap((p: string) =>
                p.split(',').map((part: string) => ({ number: part.trim() }))
            );

            return {
                name,
                fcc: (c.fccIds || []).join(', ') || undefined,
                chip: c.chip || undefined,
                keyway: c.keyway || undefined,
                partNumber: c.partNumber || undefined,
                battery: c.battery || undefined,
                frequency: c.frequency ? `${c.frequency} MHz` : undefined,
                buttons: c.buttonCount || undefined,
                image: c.imageUrl || undefined,
                oem: oemParts,
                type,
            };
        });
}

// Transform products from /api/vehicle-products to include R2 image URLs
// Filters out cross-vehicle products that don't match the target model
function transformProducts(products: any[], targetModel?: string): any[] {
    if (!products || !Array.isArray(products) || products.length === 0) return [];

    // Filter products that are clearly for other models
    const filtered = products.filter(p => {
        const title = (p.title || '').toLowerCase();
        const model = (targetModel || '').toLowerCase();

        // If title mentions specific models and doesn't include target model, skip it
        // Pattern: "For Make Model1/Model2/Model3" - check if target model is included
        const modelsInTitle = title.match(/(?:for\s+)?(?:honda|toyota|ford|gm|chevrolet|nissan)\s+([a-z0-9/-]+(?:\/[a-z0-9-]+)+)/);
        if (modelsInTitle && model) {
            const mentionedModels = modelsInTitle[1].toLowerCase().split('/');
            // If title explicitly lists models and our model isn't in the list, skip
            if (mentionedModels.length > 1 && !mentionedModels.some((m: string) => model.includes(m) || m.includes(model))) {
                return false;
            }
        }

        return true;
    });

    return filtered.map(p => {
        // Build a descriptive name if title is generic or missing
        let name = p.title || p.product_title || '';
        if (!name || name === 'Unknown' || name.toLowerCase().includes('remote')) {
            const btn = p.buttons || '';
            const tech = p.product_type || '';
            name = `${btn}-Button ${tech}`.trim();
        }

        return {
            name: name,
            fcc: Array.isArray(p.fcc_id) ? p.fcc_id.join(', ') : p.fcc_id,
            chip: Array.isArray(p.chip) ? p.chip.join(', ') : p.chip,
            battery: p.battery,
            frequency: p.frequency,
            keyway: p.keyway,
            buttons: p.buttons,
            priceRange: p.price ? `$${p.price}` : undefined,
            oem: Array.isArray(p.oem_part_numbers) ? p.oem_part_numbers.map((n: string) => ({ number: n })) : [],
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

// Consolidate keys by button count: Group all keys by their button count,
// aggregate all OEM parts, FCC IDs, and chips underneath each group.
// This reduces fragmentation (e.g., 9 cards → 3 cards for Honda Accord)
function consolidateKeysByButtonCount(keys: any[], specs?: any): any[] {
    if (!keys || (keys.length === 0 && !specs?.keyway)) return [];

    // Group keys by button count (primary grouping)
    const buttonGroups: Record<string, {
        buttons: number;
        fccIds: Set<string>;
        oemParts: Set<string>;
        chips: Set<string>;
        batteries: Set<string>;
        keyways: Set<string>;
        frequencies: Set<string>;
        images: string[];
        types: Set<string>; // prox, flip, etc.
        hasRemoteStart: boolean;
        hasTrunk: boolean;
        priceMin: number;
        priceMax: number;
    }> = {};

    // Special group for blades/emergency keys
    let bladeGroup: any = null;

    keys.forEach(key => {
        const name = (key.name || key.title || '').toLowerCase();
        const keyType = key.type || 'prox';

        // Skip bulk packs and shells
        if (name.includes('-pack') || name.includes('pack ') || name.includes('shell')) return;

        // Handle blades separately
        if (name.includes('blade') || name.includes('emergency') || keyType === 'blade') {
            if (!bladeGroup) {
                bladeGroup = {
                    keyways: new Set<string>(),
                    oemParts: new Set<string>(),
                    images: [] as string[],
                };
            }
            if (key.keyway) bladeGroup.keyways.add(key.keyway);
            if (key.oem) key.oem.forEach((o: any) => bladeGroup.oemParts.add(o.number || o));
            if (key.image) bladeGroup.images.push(key.image);
            return;
        }

        // Extract button count from name or buttons field
        let buttonCount = 0;
        const btnMatchName = name.match(/(\d)-btn/) || name.match(/(\d)-button/) || name.match(/(\d) btn/) || name.match(/(\d) button/);
        if (btnMatchName) {
            buttonCount = parseInt(btnMatchName[1], 10);
        } else if (key.buttons) {
            const btnNum = typeof key.buttons === 'number' ? key.buttons : parseInt(String(key.buttons).match(/\d+/)?.[0] || '0', 10);
            buttonCount = btnNum;
        }

        // Skip if no button count detected
        if (buttonCount === 0) return;

        const groupKey = `${buttonCount}btn`;

        // Initialize group if needed
        if (!buttonGroups[groupKey]) {
            buttonGroups[groupKey] = {
                buttons: buttonCount,
                fccIds: new Set(),
                oemParts: new Set(),
                chips: new Set(),
                batteries: new Set(),
                keyways: new Set(),
                frequencies: new Set(),
                images: [],
                types: new Set(),
                hasRemoteStart: false,
                hasTrunk: false,
                priceMin: Infinity,
                priceMax: 0,
            };
        }

        const group = buttonGroups[groupKey];

        // Aggregate FCC IDs (handle comma-separated and duplicates)
        if (key.fcc) {
            String(key.fcc).split(/[,\s]+/).filter(Boolean).forEach(f => group.fccIds.add(f.trim()));
        }

        // Aggregate OEM parts
        if (key.oem && Array.isArray(key.oem)) {
            key.oem.forEach((o: any) => {
                const partNum = o.number || o;
                if (partNum && partNum !== '--') group.oemParts.add(partNum);
            });
        }

        // Aggregate chips
        if (key.chip) {
            String(key.chip).split(/[,\s]+/).filter(Boolean).forEach(c => group.chips.add(c.trim()));
        }

        // Aggregate batteries
        if (key.battery) group.batteries.add(key.battery);

        // Aggregate keyways
        if (key.keyway) group.keyways.add(key.keyway);

        // Aggregate frequencies
        if (key.frequency) group.frequencies.add(key.frequency);

        // Track key type (prox, flip, remote)
        if (keyType) group.types.add(keyType);

        // Track features
        if (name.includes('remote start') || name.includes('rs') || name.includes('w/rs')) {
            group.hasRemoteStart = true;
        }
        if (name.includes('trunk') || name.includes('hatch')) {
            group.hasTrunk = true;
        }

        // Collect images (prefer ones with actual URLs)
        if (key.image && !group.images.includes(key.image)) {
            group.images.push(key.image);
        }

        // Track price range
        if (key.priceRange) {
            const prices = key.priceRange.match(/\$?([\d.]+)/g);
            if (prices) {
                prices.forEach((p: string) => {
                    const val = parseFloat(p.replace('$', ''));
                    if (val > 0) {
                        group.priceMin = Math.min(group.priceMin, val);
                        group.priceMax = Math.max(group.priceMax, val);
                    }
                });
            }
        }
    });

    // Convert groups to KeyConfig format
    const result: any[] = [];

    // Sort button counts (ascending)
    const sortedButtonCounts = Object.keys(buttonGroups).sort((a, b) => {
        const aNum = parseInt(a.replace('btn', ''), 10);
        const bNum = parseInt(b.replace('btn', ''), 10);
        return aNum - bNum;
    });

    sortedButtonCounts.forEach(groupKey => {
        const group = buttonGroups[groupKey];

        // Build descriptive name with features
        let name = `${group.buttons}-Button`;
        const features: string[] = [];
        if (group.hasRemoteStart) features.push('Remote Start');
        if (group.hasTrunk) features.push('Trunk');
        if (features.length > 0) {
            name += ` (${features.join(', ')})`;
        }

        // Determine primary type
        const primaryType = group.types.has('prox') ? 'prox'
            : group.types.has('flip') ? 'flip'
                : 'remote';

        // Build price range string
        let priceRange: string | undefined;
        if (group.priceMin < Infinity && group.priceMax > 0) {
            priceRange = group.priceMin === group.priceMax
                ? `$${group.priceMin.toFixed(2)}`
                : `$${group.priceMin.toFixed(2)} - $${group.priceMax.toFixed(2)}`;
        }

        result.push({
            name,
            buttons: String(group.buttons),
            fcc: Array.from(group.fccIds).slice(0, 3).join(', ') || undefined,
            chip: Array.from(group.chips).slice(0, 2).join(', ') || undefined,
            battery: Array.from(group.batteries)[0] || undefined,
            frequency: Array.from(group.frequencies)[0] || undefined,
            keyway: Array.from(group.keyways)[0] || undefined,
            oem: Array.from(group.oemParts).slice(0, 8).map(p => ({ number: p })),
            image: group.images[0] || undefined,
            type: primaryType,
            priceRange,
        });
    });

    // Add blade/emergency key if found or synthesize from specs
    if (bladeGroup || specs?.keyway) {
        const keyway = bladeGroup ? Array.from(bladeGroup.keyways)[0] : specs.keyway;
        result.push({
            name: `Emergency Blade${keyway ? ` (${keyway})` : ''}`,
            type: 'blade',
            keyway: keyway || undefined,
            oem: bladeGroup ? Array.from(bladeGroup.oemParts as Set<string>).slice(0, 4).map((p: string) => ({ number: p })) : [],
            image: bladeGroup?.images[0] || undefined,
            priceRange: '$2.00 - $15.00',
        });
    }

    return result;
}

export default function VehicleDetailClient() {
    const pathname = usePathname() ?? '';
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get Pro status from auth
    const { isPro, login, isAuthenticated } = useAuth();

    // Check for 'original' query param from 404 redirect, otherwise use pathname
    const originalPath = searchParams?.get('original') || pathname;
    const segments = originalPath.split('/').filter(Boolean);

    // Path: /vehicle/make/model/year -> segments: ["vehicle", make, model, year]
    const make = segments[1] ? decodeURIComponent(segments[1]) : '';
    const model = segments[2] ? decodeURIComponent(segments[2]) : '';
    const year = segments[3] ? parseInt(segments[3], 10) : 0;

    // Check if this is the free demo vehicle
    const isDemoVehicle = make.toLowerCase() === DEMO_VEHICLE.make
        && model.toLowerCase() === DEMO_VEHICLE.model
        && year === DEMO_VEHICLE.year;

    // User can access if Pro OR if viewing demo vehicle
    const canAccess = isPro || isDemoVehicle;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>({});
    const [activeSection, setActiveSection] = useState('specs');

    // Track section visibility with Intersection Observer
    useEffect(() => {
        if (typeof window === 'undefined' || loading) return;

        const sectionIds = ['section-specs', 'section-keyConfigs', 'section-procedures', 'section-images', 'section-pearls', 'section-comments'];
        const sectionMap: Record<string, string> = {
            'section-specs': 'specs',
            'section-keyConfigs': 'keyConfigs',
            'section-procedures': 'procedures',
            'section-images': 'images',
            'section-pearls': 'pearls',
            'section-comments': 'comments',
        };

        const observer = new IntersectionObserver(
            (entries) => {
                // Find the first visible section from top
                const visibleEntry = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

                if (visibleEntry) {
                    const sectionKey = sectionMap[visibleEntry.target.id];
                    if (sectionKey) {
                        setActiveSection(sectionKey);
                    }
                }
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        );

        sectionIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [loading]);

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
                const [detailRes, productsRes, walkthroughsRes, pearlsRes, imagesRes, proceduresRes] = await Promise.all([
                    fetch(`${API_BASE}/api/vehicle-detail?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/vehicle-products?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/walkthroughs?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/pearls?${queryParams}`).catch(() => null),
                    fetch(`${API_BASE}/api/images?${makeOnlyParams}`).catch(() => null), // Images at make level (cross-pollinated)
                    fetch(`${API_BASE}/api/procedures?${queryParams}`).catch(() => null), // New procedure packages
                ]);

                const detail = detailRes?.ok ? await detailRes.json() : {};
                const products = productsRes?.ok ? await productsRes.json() : { products: [] };
                const walkthroughs = walkthroughsRes?.ok ? await walkthroughsRes.json() : { walkthroughs: [] };
                let pearls = pearlsRes?.ok ? await pearlsRes.json() : { pearls: [] };
                const images = imagesRes?.ok ? await imagesRes.json() : { images: [] };
                const procedurePackages = proceduresRes?.ok ? await proceduresRes.json() : { procedures: [] };

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

                setData({ detail, products, walkthroughs, pearls, images, procedurePackages });

                // Track vehicle view for analytics
                trackVehicleView(make, model, String(year));
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

    // Merge keys: prioritize aks_key_configs (AKS with R2 images), fallback to products, then products_by_type, then VYP
    const keysFromAks = transformAksKeyConfigs(data.detail?.aks_key_configs || []);
    const aksTools = data.detail?.aks_tools || [];
    const keysFromProducts = transformProducts(data.products?.products || [], model);
    const keysFromPBT = transformProductsByType(productsByType);
    const keysFromVYP = classifyVypProducts(vyp, specs);

    // aks_key_configs is already grouped by key type → button count, so use directly if available
    // Otherwise fallback to legacy sources with consolidation
    const rawKeys = keysFromAks.length > 0 ? keysFromAks
        : keysFromProducts.length > 0 ? keysFromProducts
            : keysFromPBT.length > 0 ? keysFromPBT
                : keysFromVYP;

    // Deduplicate keys by type (3-btn, 4-btn, blade) - only needed for legacy sources
    const mergedKeys = keysFromAks.length > 0 ? keysFromAks : consolidateKeysByButtonCount(rawKeys, specs);

    // Extract pearls and images - ensure they are arrays
    const rawPearls = data.pearls?.pearls;
    const pearlsList = Array.isArray(rawPearls) ? rawPearls : [];
    const rawImages = data.images?.images;
    const rawImagesList = Array.isArray(rawImages) ? rawImages : [];

    // Apply intelligent relevance filtering to images
    // Scores based on model match, platform/architecture, and year overlap
    const imagesList = filterRelevantImages(rawImagesList, {
        make,
        model,
        year,
        platform: header.platform,
        architecture: header.immobilizer_system
    }, { minScore: 10, maxResults: 30 });

    // Extract dynamic sidebar content from pearls
    const criticalPearl = pearlsList.find((p: any) => (p.risk || '').toLowerCase() === 'critical');
    const proTipPearl = pearlsList.find((p: any) => (p.risk || '').toLowerCase() === 'important' || (p.risk || '').toLowerCase() === 'info');

    // Extract chip from AKS key configs (prioritize over legacy specs)
    const aksChip = keysFromAks.find((k: any) => k.chip)?.chip || null;
    const aksKeyway = keysFromAks.find((k: any) => k.keyway)?.keyway || null;
    const aksBattery = keysFromAks.find((k: any) => k.battery)?.battery || null;

    // Build allChips array with key type context
    const allChips = keysFromAks
        .filter((k: any) => k.chip)
        .map((k: any) => ({
            chip: k.chip,
            keyType: k.name || 'Key',
            buttons: k.buttons || null
        }));

    // Build allFccs array with key type context for +1 display
    const allFccsRaw = keysFromAks
        .filter((k: any) => k.fcc)
        .flatMap((k: any) =>
            String(k.fcc).split(/[,\s]+/).filter(Boolean).map((fcc: string) => ({
                fcc: fcc.trim().replace(/O(\d)/g, '0$1'), // Normalize O→0 typos
                keyType: k.name || 'Key',
                buttons: k.buttons || null
            }))
        );

    // Deduplicate FCCs - keep only unique FCC values
    const fccMap = new Map<string, { fcc: string; keyType: string; buttons: string | null }>();
    for (const entry of allFccsRaw) {
        if (!fccMap.has(entry.fcc)) {
            fccMap.set(entry.fcc, entry);
        }
    }
    const allFccs = Array.from(fccMap.values());

    // Build allFccs - prefer key configs, fallback to parsing legacy fcc_id
    let finalAllFccs = allFccs.length > 0 ? allFccs : specs.all_fccs;

    // If still no allFccs but specs.fcc_id has multiple IDs, parse them
    if ((!finalAllFccs || finalAllFccs.length === 0) && specs.fcc_id) {
        const fccIds = String(specs.fcc_id).split(/[,\s]+/).filter(Boolean);
        if (fccIds.length > 0) {
            finalAllFccs = fccIds.map((fcc: string) => ({
                fcc: fcc.trim(),
                keyType: 'Key',
                buttons: null
            }));
        }
    }

    // Build complete specs object for VehicleSpecs component
    const fullSpecs = {
        architecture: header.immobilizer_system,
        platform: header.platform,
        immobilizerSystem: header.immobilizer_system,
        canFdRequired: header.can_fd_required === 1 || header.can_fd_required === true,
        chipType: aksChip || specs.chip,  // AKS first, fallback to legacy
        allChips: allChips.length > 0 ? allChips : undefined,
        fccId: specs.fcc_id,
        allFccs: finalAllFccs,
        frequency: specs.frequency,
        battery: aksBattery || specs.battery,  // AKS first, fallback to legacy
        keyway: aksKeyway || specs.keyway,  // AKS first, fallback to legacy
        lishi: specs.lishi,
        lishiSource: specs.lishi_source,
        spaces: specs.spaces,
        depths: specs.depths,
        macs: specs.macs,
        codeSeries: specs.code_series,
        mechanicalSource: specs.mechanical_source,
    };

    // Map walkthroughs to procedures format
    // API returns: type ('add_key' or 'akl'), steps_json (array), title, time_minutes, risk_level
    const addKeyWalkthrough = data.walkthroughs?.walkthroughs?.find((w: any) =>
        w.type === 'add_key' || w.title?.toLowerCase().includes('add key')
    );
    const aklWalkthrough = data.walkthroughs?.walkthroughs?.find((w: any) =>
        w.type === 'akl' || w.title?.toLowerCase().includes('all keys lost')
    );

    // NEW: Get procedure packages from /api/procedures (preferred over walkthroughs)
    const proceduresList = data.procedurePackages?.procedures || [];
    const addKeyProcedure = proceduresList.find((p: any) => p.scenario === 'add_key');
    const aklProcedure = proceduresList.find((p: any) => p.scenario === 'akl');
    const generalProcedure = proceduresList.find((p: any) => p.scenario === 'general');

    // Helper to parse steps from walkthroughs_v2 (steps_json is a JSON array string)
    const parseSteps = (walkthrough: any): string[] => {
        if (!walkthrough) return [];
        // Try steps_json first (from walkthroughs_v2)
        if (walkthrough.steps_json) {
            try {
                const parsed = typeof walkthrough.steps_json === 'string'
                    ? JSON.parse(walkthrough.steps_json)
                    : walkthrough.steps_json;
                if (Array.isArray(parsed)) return parsed;
            } catch { /* fallback */ }
        }
        // Fallback to content field (legacy walkthroughs table)
        if (walkthrough.content) {
            return walkthrough.content.split('\n').filter(Boolean).slice(0, 15);
        }
        // Try structured_steps_json (legacy)
        if (walkthrough.structured_steps_json) {
            try {
                const parsed = typeof walkthrough.structured_steps_json === 'string'
                    ? JSON.parse(walkthrough.structured_steps_json)
                    : walkthrough.structured_steps_json;
                if (Array.isArray(parsed)) return parsed.map((s: any) => s.text || s.instruction || String(s));
            } catch { /* fallback */ }
        }
        return [];
    };

    // Filter pearls by context - safely handle tags as string or array
    const getTags = (p: any): string[] => {
        if (!p.tags) return [];
        if (Array.isArray(p.tags)) return p.tags.map((t: string) => t.toLowerCase());
        if (typeof p.tags === 'string') return p.tags.split(',').map((t: string) => t.trim().toLowerCase());
        return [];
    };

    const addKeyPearls = pearlsList.filter((p: any) => {
        const tags = getTags(p);
        const cat = (p.category || '').toLowerCase();
        return tags.includes('add key') || tags.includes('spare key') || cat.includes('add key');
    });

    const aklPearls = pearlsList.filter((p: any) => {
        const tags = getTags(p);
        const cat = (p.category || '').toLowerCase();
        const risk = (p.risk || '').toLowerCase();
        return tags.includes('akl') || tags.includes('all keys lost') || cat.includes('akl') || risk === 'critical';
    });

    // ============================================
    // CONTEXTUAL PEARL ROUTING
    // Route pearls by target_section from API (Phase 3 data)
    // ============================================
    const routedPearls = {
        // Lishi/mechanical pearls → VehicleSpecs Lishi section
        lishi: pearlsList.filter((p: any) =>
            p.target_section === 'mechanical' ||
            getTags(p).some((t: string) => ['lishi', 'hu100', '10-cut', '8-cut', 'cutting'].includes(t))
        ),
        // CAN-FD/tool requirement pearls → VehicleSpecs CAN FD section
        canFd: pearlsList.filter((p: any) =>
            p.target_section === 'tool_requirement' ||
            getTags(p).some((t: string) => ['can-fd', 'adapter'].includes(t))
        ),
        // Chip/security pearls → VehicleSpecs chip section
        chip: pearlsList.filter((p: any) =>
            p.target_section === 'chip_security' ||
            (p.pearl_content || '').toLowerCase().match(/\b(8a-ba|8a|h-chip|g-chip|id47|fbb|fla)\b/)
        ),
        // FCC/hardware pearls → VehicleSpecs FCC section
        fcc: pearlsList.filter((p: any) =>
            p.target_section === 'fcc_hardware' ||
            (p.pearl_content || '').toLowerCase().match(/\b(hyq|m3n|fcc|315\s*mhz|433\s*mhz)\b/)
        ),
        // Key configuration pearls → KeyCards section
        keyConfig: pearlsList.filter((p: any) =>
            getTags(p).some((t: string) => ['5-button', '4-button', 'inventory', 'strattec', 'remote-start'].includes(t))
        ),
        // Frequency pearls → KeyCards (per-card context)
        frequency: pearlsList.filter((p: any) =>
            getTags(p).some((t: string) => ['frequency', 'hyq2ab', 'hyq2eb', '315mhz', '433mhz'].includes(t))
        ),
        // Cylinder/access pearls → KeyCards blade section
        access: pearlsList.filter((p: any) =>
            getTags(p).some((t: string) => ['cylinder', 'concealed', 'door-handle', 'emergency-access'].includes(t))
        ),
        // Voltage/BCM pearls → Procedures (critical warning)
        voltage: pearlsList.filter((p: any) =>
            p.target_section === 'warning_alert' ||
            getTags(p).some((t: string) => ['voltage', 'bcm', 'eeprom', 'bricking'].includes(t))
        ),
        // Transmitter pocket pearls → Procedures
        transmitter: pearlsList.filter((p: any) =>
            getTags(p).some((t: string) => ['transmitter-pocket', 'console', 'hidden'].includes(t))
        ),
        // AKL procedure pearls - match by target_section OR category/tags
        akl: pearlsList.filter((p: any) => {
            if (p.target_section === 'akl_procedure') return true;
            const cat = (p.category || '').toLowerCase();
            const content = (p.content || p.pearl_content || '').toLowerCase();
            const tags = getTags(p);
            // Include procedure pearls that mention AKL/all keys lost
            return (cat === 'procedure' && (
                content.includes('all keys lost') ||
                content.includes('akl') ||
                tags.includes('akl')
            ));
        }),
        // Add key procedure pearls - match by target_section OR category/tags
        addKey: pearlsList.filter((p: any) => {
            if (p.target_section === 'add_key_procedure') return true;
            const cat = (p.category || '').toLowerCase();
            const content = (p.content || p.pearl_content || '').toLowerCase();
            const tags = getTags(p);
            // Include procedure pearls that mention add key/spare key
            return (cat === 'procedure' && (
                content.includes('add a key') ||
                content.includes('add key') ||
                content.includes('spare key') ||
                tags.includes('add_key') ||
                tags.includes('add key')
            ));
        }),
        // OBP/free method pearls → Procedures AKL
        obp: pearlsList.filter((p: any) =>
            getTags(p).some((t: string) => ['obp', 'onboard-programming', '30-minute', 'relearn'].includes(t))
        ),
        // Troubleshooting pearls → Sidebar or new section
        troubleshooting: pearlsList.filter((p: any) =>
            getTags(p).some((t: string) => ['troubleshooting', 'no-remote-detected', 'rf-interference'].includes(t))
        ),
        // Business/NASTF pearls → Procedures tool method
        business: pearlsList.filter((p: any) =>
            getTags(p).some((t: string) => ['nastf', 'pin', 'tds', 'acdelco'].includes(t))
        ),
    };

    // Collect all routed pearl IDs to exclude from general section
    const allRoutedPearlIds = new Set([
        ...routedPearls.lishi,
        ...routedPearls.canFd,
        ...routedPearls.chip,
        ...routedPearls.fcc,
        ...routedPearls.keyConfig,
        ...routedPearls.frequency,
        ...routedPearls.access,
        ...routedPearls.voltage,
        ...routedPearls.transmitter,
        ...routedPearls.akl,
        ...routedPearls.addKey,
        ...routedPearls.obp,
        ...routedPearls.troubleshooting,
        ...routedPearls.business,
    ].map(p => p.id));

    // General pearls = those not routed anywhere specific
    const generalPearls = pearlsList.filter((p: any) => !allRoutedPearlIds.has(p.id));

    // Show paywall overlay for non-Pro users on non-demo vehicles
    if (!canAccess) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="glass p-8 sm:p-12 text-center border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-zinc-900">
                    {/* Lock Icon */}
                    <div className="text-6xl mb-6">🔒</div>

                    {/* Vehicle Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {year} {make} {model}
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        This vehicle data is available with Pro
                    </p>

                    {/* Pro Benefits */}
                    <div className="text-left bg-zinc-800/50 rounded-xl p-6 mb-8">
                        <h3 className="font-bold text-zinc-200 mb-4">Pro includes:</h3>
                        <ul className="space-y-3 text-sm text-zinc-300">
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span> Full access to all 800+ vehicle models
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span> FCC ID database (500+ entries)
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span> 230+ technical dossiers
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span> Unlimited job logging & inventory
                            </li>
                        </ul>
                    </div>

                    {/* CTA Buttons */}
                    <button
                        onClick={() => router.push('/pricing')}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl transition-colors text-lg mb-4"
                    >
                        Upgrade to Pro →
                    </button>

                    {/* Sign in option */}
                    {!isAuthenticated && (
                        <button
                            onClick={() => login()}
                            className="text-zinc-400 hover:text-white text-sm underline transition-colors mb-6"
                        >
                            Already have Pro? Sign in
                        </button>
                    )}

                    {/* Demo vehicle option */}
                    <div className="border-t border-zinc-800 pt-6 mt-2">
                        <p className="text-zinc-500 text-sm mb-3">Or explore the free demo vehicle:</p>
                        <a
                            href={`/vehicle/${DEMO_VEHICLE.make}/${DEMO_VEHICLE.model}/${DEMO_VEHICLE.year}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-colors"
                        >
                            🚗 Try 2018 Honda Civic Demo
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm mb-4 text-zinc-400">
                <a href="/browse" className="hover:text-purple-400 transition-colors">Browse</a>
                <span className="text-zinc-600">›</span>
                <a href={`/browse?make=${encodeURIComponent(make)}`} className="hover:text-purple-400 transition-colors">{make}</a>
                <span className="text-zinc-600">›</span>
                <a href={`/browse?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`} className="hover:text-purple-400 transition-colors">{model}</a>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-200">{year}</span>
            </nav>

            {/* Header with title and badges */}
            <VehicleHeader
                make={make}
                model={model}
                year={year}
                prevYear={year > 1990 ? year - 1 : null}
                nextYear={year < new Date().getFullYear() + 1 ? year + 1 : null}
                platform={header.platform}
                architecture={header.immobilizer_system}
                canFd={header.can_fd_required === 1 || header.can_fd_required === true}
                specs={{
                    fccId: fullSpecs.fccId,
                    chipType: fullSpecs.chipType,
                }}
            />

            {/* Quick Log Job Button - Prefills vehicle data */}
            <div className="flex items-center gap-3 mt-4">
                <a
                    href={`/business/jobs?action=log&vehicle=${encodeURIComponent(`${year} ${make} ${model}`)}&fcc=${encodeURIComponent(fullSpecs.fccId || '')}&keyType=${encodeURIComponent(fullSpecs.chipType || '')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-green-500/20"
                >
                    📝 Log Job for This Vehicle
                </a>
                <a
                    href={`/business/inventory?action=add&vehicle=${encodeURIComponent(`${year} ${make} ${model}`)}&fcc=${encodeURIComponent(fullSpecs.fccId || '')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl font-medium text-sm transition-all"
                >
                    📦 Add to Inventory
                </a>
            </div>

            {/* Section Navigation Sidebar */}
            <VehicleSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                availableSections={{
                    specs: true,
                    procedures: !!(addKeyProcedure || aklProcedure || addKeyWalkthrough || aklWalkthrough),
                    keyConfigs: mergedKeys.length > 0,
                    images: imagesList.length > 0,
                    comments: true,
                    pearls: pearlsList.length > 0,
                }}
            />

            {/* Two-Column Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">

                {/* Left Column: Main Content (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Community Highlight - Top voted tip */}
                    <CommunityHighlight make={make} model={model} year={year} />

                    {/* Vehicle Specifications Grid */}
                    <div id="section-specs">
                        <VehicleSpecs
                            specs={fullSpecs}
                            make={make}
                            year={year}
                            pearls={{
                                lishi: routedPearls.lishi,
                                canFd: routedPearls.canFd,
                                chip: routedPearls.chip,
                                fcc: routedPearls.fcc,
                            }}
                        />
                    </div>

                    {/* Related YouTube Video */}
                    <VideoEmbed make={make} model={model} year={year} />

                    {/* Key Configuration Cards with R2 images */}
                    <div id="section-keyConfigs">
                        <KeyCards
                            keys={mergedKeys}
                            vehicleInfo={{ make, model, year }}
                            pearls={{
                                keyConfig: routedPearls.keyConfig,
                                frequency: routedPearls.frequency,
                                access: routedPearls.access,
                            }}
                        />
                    </div>

                    {/* Tools Section - Lishi picks matched by keyway */}
                    {aksTools.length > 0 && (
                        <section className="glass p-6 mb-6">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span>🔧</span> Tools
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {aksTools.map((tool: any, idx: number) => (
                                    <div key={idx} className="bg-zinc-800/50 rounded-lg p-4 hover:border-purple-500/50 border border-transparent transition-all">
                                        <div className="flex gap-3">
                                            {tool.imageUrl && (
                                                <div className="w-20 h-20 shrink-0 rounded bg-zinc-700/50 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={tool.imageUrl}
                                                        alt={tool.name}
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-white text-sm truncate">{tool.name}</h3>
                                                {tool.partNumber && (
                                                    <p className="text-xs text-zinc-400 font-mono mt-1">{tool.partNumber}</p>
                                                )}
                                                {tool.keyways?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {tool.keyways.map((kw: string, i: number) => (
                                                            <span key={i} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-mono">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {/* Programming Procedures */}
                    <div id="section-procedures">
                        <VehicleProcedures procedures={{
                            addKey: addKeyProcedure ? {
                                title: addKeyProcedure.title,
                                time_minutes: parseInt(addKeyProcedure.time_estimate) || 30,
                                steps: addKeyProcedure.steps?.map((s: any) => s.action || s) || [],
                                requirements: addKeyProcedure.tools || [],
                                pearls: routedPearls.addKey
                            } : addKeyWalkthrough ? {
                                title: addKeyWalkthrough.title,
                                time_minutes: addKeyWalkthrough.time_minutes || addKeyWalkthrough.estimated_time_mins,
                                steps: parseSteps(addKeyWalkthrough),
                                menu_path: addKeyWalkthrough.menu_path || addKeyWalkthrough.platform_code,
                                pearls: routedPearls.addKey
                            } : routedPearls.addKey.length > 0 ? {
                                // Third fallback: Build procedure from pearls (pass as rawText for parsing)
                                title: 'Add Key Procedure',
                                rawText: routedPearls.addKey.map((p: any) => p.content || p.pearl_content || '').filter(Boolean).join('\n'),
                                pearls: routedPearls.addKey
                            } : undefined,
                            akl: aklProcedure ? {
                                title: aklProcedure.title,
                                time_minutes: parseInt(aklProcedure.time_estimate) || 45,
                                risk_level: 'high' as const,
                                steps: aklProcedure.steps?.map((s: any) => s.action || s) || [],
                                requirements: aklProcedure.tools || [],
                                pearls: routedPearls.akl
                            } : aklWalkthrough ? {
                                title: aklWalkthrough.title,
                                time_minutes: aklWalkthrough.time_minutes || aklWalkthrough.estimated_time_mins,
                                risk_level: ((aklWalkthrough.risk_level === 'moderate' ? 'medium' : aklWalkthrough.risk_level) as 'low' | 'medium' | 'high') || 'high',
                                steps: parseSteps(aklWalkthrough),
                                menu_path: aklWalkthrough.menu_path || aklWalkthrough.platform_code,
                                pearls: routedPearls.akl
                            } : routedPearls.akl.length > 0 ? {
                                // Third fallback: Build procedure from pearls (pass as rawText for parsing)
                                title: 'All Keys Lost (AKL) Procedure',
                                risk_level: 'high' as const,
                                rawText: routedPearls.akl.map((p: any) => p.content || p.pearl_content || '').filter(Boolean).join('\n'),
                                pearls: routedPearls.akl
                            } : undefined,
                        }} />
                    </div>

                    {/* Visual References Gallery */}
                    <div id="section-images">
                        <VisualReferences images={imagesList} />
                    </div>

                    {/* Technical Pearls / Insights (General only) */}
                    <div id="section-pearls">
                        <TechnicalPearls pearls={generalPearls} make={make} model={model} />
                    </div>

                    {/* Research Dossier References */}
                    <DossierReferences
                        make={make}
                        year={year}
                        sourceDocs={[...new Set(pearlsList.filter((p: any) => p.source_doc).map((p: any) => p.source_doc))]}
                    />

                    {/* Community Discussion Section */}
                    <div id="section-comments">
                        <CommentSection make={make} model={model} />
                    </div>
                </div>

                {/* Right Column: Locksmith Sidebar (4/12) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Tool Coverage - Show which tools cover this vehicle */}
                    <ToolCoverageSidebar make={make} model={model} year={year} />

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

            {/* Floating Community Tab for Mobile */}
            <FloatingCommentTab make={make} model={model} />
        </div>
    );
}


