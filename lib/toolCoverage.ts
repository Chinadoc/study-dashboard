'use client';

/**
 * Tool Coverage Utility
 * Maps user's owned tools to vehicle coverage from unified_vehicle_coverage.json
 */

import vehicleCoverageData from '@/src/data/unified_vehicle_coverage.json';
import { loadBusinessProfile, AVAILABLE_TOOLS, ToolInfo } from '@/lib/businessTypes';

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

interface VehicleCoverageRecord {
    make: string;
    model: string;
    yearStart: number;
    yearEnd: number;
    autel: ToolCoverageDetail;
    smartPro: ToolCoverageDetail;
    lonsdor: ToolCoverageDetail;
    vvdi: ToolCoverageDetail;
    platform: string;
    chips: string[];
    flags: Array<{ tool: string; year: number; reason: string }>;
    dossierMentions: number;
}

// Type assertion for the JSON data
const COVERAGE_DATA = (vehicleCoverageData as { vehicles: VehicleCoverageRecord[] }).vehicles || [];

// Map tool IDs from businessTypes to coverage categories
// Brand models all use their respective baseline data (derived coverage can be added per-brand)
const TOOL_ID_TO_COVERAGE: Record<string, keyof Pick<VehicleCoverageRecord, 'autel' | 'smartPro' | 'lonsdor' | 'vvdi'>> = {
    // Autel
    'autel_im508s': 'autel',
    'autel_im608': 'autel',
    'autel_im608_pro': 'autel',
    'autel_im608_pro2': 'autel',
    // OBDStar (uses autel baseline - similar coverage)
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
// Note: When filtering by specific Autel model, use AUTEL_MODEL_TIERS from autelModelCoverage.ts
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
    ownedToolName?: string;  // e.g., "Autel IM608 Pro II"
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
 * Get vehicle coverage for a specific vehicle
 */
export function getVehicleCoverage(
    make: string,
    model: string,
    year: number
): VehicleCoverageResult {
    const profile = loadBusinessProfile();
    const ownedToolIds = profile.tools || [];

    // Find matching vehicle in coverage data
    const normalizedMake = make.trim().toLowerCase();
    const normalizedModel = model.trim().toLowerCase();

    const vehicle = COVERAGE_DATA.find(v => {
        const vMake = v.make.toLowerCase();
        const vModel = v.model.toLowerCase();
        return (
            vMake === normalizedMake &&
            (vModel === normalizedModel || vModel.includes(normalizedModel) || normalizedModel.includes(vModel)) &&
            year >= v.yearStart && year <= v.yearEnd
        );
    });

    if (!vehicle) {
        // Return empty result with all tools as unknown
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

    // Map owned tool IDs to coverage categories
    const ownedCategories = new Set(
        ownedToolIds.map(id => TOOL_ID_TO_COVERAGE[id]).filter(Boolean)
    );

    // Build coverage result for each tool
    const tools: VehicleToolCoverage[] = COVERAGE_TOOLS.map(tool => {
        const coverage = vehicle[tool.key];
        const isOwned = ownedCategories.has(tool.key);

        // Get flags specific to this tool
        const toolFlags = vehicle.flags
            .filter(f => f.tool === tool.key)
            .map(f => ({ year: f.year, reason: f.reason }));

        // Parse limitations
        const limitations = (coverage.limitations || []).map(lim => ({
            category: lim.category,
            label: LIMITATION_LABELS[lim.category] || lim.category,
            cables: lim.cables || [],
        }));

        return {
            ...tool,
            status: coverage.status || '',
            confidence: coverage.confidence || 'unknown',
            isOwned,
            ownedToolName: isOwned ? getOwnedToolName(ownedToolIds, tool.key) : undefined,
            limitations,
            cables: coverage.cables || [],
            flags: toolFlags,
        };
    });

    return {
        found: true,
        vehicle: {
            make: vehicle.make,
            model: vehicle.model,
            yearStart: vehicle.yearStart,
            yearEnd: vehicle.yearEnd,
            platform: vehicle.platform,
            chips: vehicle.chips,
        },
        tools,
        dossierMentions: vehicle.dossierMentions,
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
 * Check if user owns any tools that cover a specific vehicle
 */
export function hasOwnedCoverage(make: string, model: string, year: number): boolean {
    const result = getVehicleCoverage(make, model, year);
    return result.tools.some(t => t.isOwned && t.status);
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
