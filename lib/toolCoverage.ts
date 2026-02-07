'use client';

/**
 * Tool Coverage Utility
 * Maps user's owned tools to vehicle coverage via D1 API
 */

import { loadBusinessProfile, AVAILABLE_TOOLS, ToolInfo } from '@/lib/businessTypes';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

// Coverage data types
interface ToolCoverageDetail {
    status: string;
    confidence: string;
    limitations: Array<{
        category: string;
        cables: string[];
        context: string;
        source: string;
    }>;
    cables: string[];
}

// Map tool IDs from businessTypes to coverage categories
const TOOL_ID_TO_COVERAGE: Record<string, string> = {
    // Autel
    'autel_im508s': 'autel',
    'autel_im608': 'autel',
    'autel_im608_pro': 'autel',
    'autel_im608_pro2': 'autel',
    // OBDStar
    'obdstar_x300_mini': 'autel',
    'obdstar_x300_pro4': 'autel',
    'obdstar_x300_dp_plus': 'autel',
    'obdstar_g3': 'autel',
    // AutoProPAD / Smart Pro
    'autopropad_basic': 'smartPro',
    'autopropad': 'smartPro',
    'smart_pro_tcode': 'smartPro',
    'smart_pro': 'smartPro',
    // Lonsdor
    'lonsdor_k518s': 'lonsdor',
    'lonsdor_k518ise': 'lonsdor',
    'lonsdor_k518_pro': 'lonsdor',
    // Xhorse/VVDI
    'xhorse_mini_obd': 'vvdi',
    'xhorse_keytool_max': 'vvdi',
    'xhorse_vvdi2': 'vvdi',
    'xhorse_keytool_plus': 'vvdi',
};

// Coverage categories with display info
const COVERAGE_TOOLS = [
    { key: 'autel' as const, name: 'Autel (All)', icon: '🔴', color: 'red' },
    { key: 'smartPro' as const, name: 'Smart Pro', icon: '⚪', color: 'gray' },
    { key: 'lonsdor' as const, name: 'Lonsdor K518', icon: '🟣', color: 'purple' },
    { key: 'vvdi' as const, name: 'VVDI/Xhorse', icon: '🟠', color: 'orange' },
];

export interface VehicleToolCoverage {
    key: 'autel' | 'smartPro' | 'lonsdor' | 'vvdi';
    name: string;
    icon: string;
    color: string;
    status: string;
    confidence: string;
    isOwned: boolean;
    ownedToolName?: string;
    limitations: Array<{
        category: string;
        label: string;
        cables: string[];
    }>;
    cables: string[];
    flags: Array<{ year: number; reason: string }>;
}

export interface VehicleCoverageResult {
    found: boolean;
    vehicle?: {
        make: string;
        model: string;
        yearStart: number;
        yearEnd: number;
        platform: string;
        chips: string[];
    };
    tools: VehicleToolCoverage[];
    dossierMentions: number;
}

// Category labels for display
const LIMITATION_LABELS: Record<string, string> = {
    'bench_required': '🔧 Bench Required',
    'server_required': '🌐 Server Required',
    'dealer_only': '🏢 Dealer Only',
    'high_risk': '⚠️ High Risk',
    'adapter_required': '🔌 Adapter Needed',
    'akl_blocked': '🚫 AKL Blocked',
    'pin_required': '🔑 PIN Required',
    'token_required': '💰 Token Required',
};

/**
 * Get vehicle coverage for a specific vehicle via D1 API
 */
export async function getVehicleCoverageAsync(
    make: string,
    model: string,
    year: number
): Promise<VehicleCoverageResult> {
    const profile = loadBusinessProfile();
    const ownedToolIds = profile.tools || [];

    try {
        const resp = await fetch(
            `${API_BASE}/api/vehicle-coverage/infer?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`
        );

        if (!resp.ok) {
            return getEmptyResult(ownedToolIds);
        }

        const data = await resp.json() as {
            make: string;
            model: string;
            year: number;
            chips: string[];
            coverage: Record<string, {
                status: string;
                confidence: string;
                source: string;
                limitations: Array<any>;
                cables: string[];
                inferred_from_chips: string[];
            }>;
        };

        if (!data.coverage || Object.keys(data.coverage).length === 0) {
            return getEmptyResult(ownedToolIds);
        }

        const ownedCategories = new Set(
            ownedToolIds.map(id => TOOL_ID_TO_COVERAGE[id]).filter(Boolean)
        );

        const tools: VehicleToolCoverage[] = COVERAGE_TOOLS.map(tool => {
            const cov = data.coverage[tool.key];
            const isOwned = ownedCategories.has(tool.key);

            return {
                ...tool,
                status: cov?.status || '',
                confidence: cov?.confidence || 'unknown',
                isOwned,
                ownedToolName: isOwned ? getOwnedToolName(ownedToolIds, tool.key) : undefined,
                limitations: (cov?.limitations || []).map((lim: any) => ({
                    category: lim.category || '',
                    label: LIMITATION_LABELS[lim.category] || lim.category || '',
                    cables: lim.cables || [],
                })),
                cables: cov?.cables || [],
                flags: [],
            };
        });

        return {
            found: true,
            vehicle: {
                make: data.make,
                model: data.model,
                yearStart: data.year,
                yearEnd: data.year,
                platform: '',
                chips: data.chips || [],
            },
            tools,
            dossierMentions: 0,
        };
    } catch (err) {
        console.error('Failed to fetch vehicle coverage:', err);
        return getEmptyResult(ownedToolIds);
    }
}

/**
 * Synchronous wrapper that returns empty result immediately
 * For backward compatibility — callers should migrate to getVehicleCoverageAsync
 */
export function getVehicleCoverage(
    make: string,
    model: string,
    year: number
): VehicleCoverageResult {
    const profile = loadBusinessProfile();
    const ownedToolIds = profile.tools || [];
    return getEmptyResult(ownedToolIds);
}

function getEmptyResult(ownedToolIds: string[]): VehicleCoverageResult {
    return {
        found: false,
        tools: COVERAGE_TOOLS.map(tool => ({
            ...tool,
            status: '',
            confidence: 'unknown',
            isOwned: ownedToolIds.some(id => TOOL_ID_TO_COVERAGE[id] === tool.key),
            ownedToolName: getOwnedToolName(ownedToolIds, tool.key),
            limitations: [],
            cables: [],
            flags: [],
        })),
        dossierMentions: 0,
    };
}

/**
 * Get the user's owned tool name for a coverage category
 */
function getOwnedToolName(ownedToolIds: string[], coverageKey: string): string | undefined {
    for (const id of ownedToolIds) {
        if (TOOL_ID_TO_COVERAGE[id] === coverageKey) {
            const tool = AVAILABLE_TOOLS.find(t => t.id === id);
            if (tool) return tool.name;
        }
    }
    return undefined;
}

/**
 * Check if user owns any tools that cover a specific vehicle (async)
 */
export async function hasOwnedCoverageAsync(make: string, model: string, year: number): Promise<boolean> {
    const result = await getVehicleCoverageAsync(make, model, year);
    return result.tools.some(t => t.isOwned && t.status);
}

/**
 * Synchronous check — for backward compatibility, always returns false
 * Callers should migrate to hasOwnedCoverageAsync
 */
export function hasOwnedCoverage(make: string, model: string, year: number): boolean {
    return false;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
    if (!status) return 'text-gray-500';
    const lower = status.toLowerCase();
    if (lower.includes('yes')) return 'text-green-400';
    if (lower.includes('partial') || lower.includes('check')) return 'text-amber-400';
    if (lower.includes('no') || lower.includes('low')) return 'text-red-400';
    return 'text-gray-400';
}

/**
 * Get status badge color class
 */
export function getStatusBadgeClass(status: string): string {
    if (!status) return 'bg-gray-500/20 text-gray-400';
    const lower = status.toLowerCase();
    if (lower.includes('yes')) return 'bg-green-500/20 text-green-400';
    if (lower.includes('partial') || lower.includes('check')) return 'bg-amber-500/20 text-amber-400';
    if (lower.includes('no') || lower.includes('low')) return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-400';
}
