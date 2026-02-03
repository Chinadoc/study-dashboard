'use client';

/**
 * Autel Model Coverage Derivation
 * 
 * Derives coverage for different Autel models based on the baseline IM608 Pro II data.
 * Coverage percentages are based on industry knowledge of tool capabilities.
 */

// Coverage tier definitions for Autel models
export interface AutoCoverageTier {
    id: string;
    name: string;
    coveragePercent: number;
    excludedPlatforms: string[];  // Platforms this model can't handle
    excludedLimitations: string[]; // Limitations that block this model
    requiresCables: boolean;  // Whether bench/cable work is supported
    supportsCanFD: boolean;
    supportsDoIP: boolean;
    supportsUWB: boolean;
}

export const AUTEL_MODEL_TIERS: Record<string, AutoCoverageTier> = {
    'autel_im508s': {
        id: 'autel_im508s',
        name: 'Autel IM508S',
        coveragePercent: 70,
        excludedPlatforms: ['DoIP', 'DoIP_UWB', 'CAN FD', 'CAN FD/VIP', 'M9R3', 'AAOS', 'RF Hub Lock'],
        excludedLimitations: ['bench_required', 'dealer_only', 'high_risk'],
        requiresCables: false,
        supportsCanFD: false,
        supportsDoIP: false,
        supportsUWB: false,
    },
    'autel_im608': {
        id: 'autel_im608',
        name: 'Autel IM608',
        coveragePercent: 85,
        excludedPlatforms: ['DoIP_UWB', 'CAN FD', 'CAN FD/VIP', 'M9R3', 'AAOS'],
        excludedLimitations: ['dealer_only'],
        requiresCables: true,
        supportsCanFD: false,  // External adapter needed
        supportsDoIP: true,
        supportsUWB: false,
    },
    'autel_im608_pro': {
        id: 'autel_im608_pro',
        name: 'Autel IM608 Pro',
        coveragePercent: 95,
        excludedPlatforms: ['DoIP_UWB', 'M9R3'],
        excludedLimitations: [],
        requiresCables: true,
        supportsCanFD: true,  // With external CAN-FD adapter
        supportsDoIP: true,
        supportsUWB: false,
    },
    'autel_im608_pro2': {
        id: 'autel_im608_pro2',
        name: 'Autel IM608 Pro II',
        coveragePercent: 100,
        excludedPlatforms: [],  // None - full coverage
        excludedLimitations: [],
        requiresCables: true,
        supportsCanFD: true,  // Built-in
        supportsDoIP: true,
        supportsUWB: true,
    },
};

// Coverage key used in the unified data
export type BaselineCoverageKey = 'autel' | 'smartPro' | 'lonsdor' | 'vvdi';

// Map Autel model IDs to their tier
export function getAutelTier(toolId: string): AutoCoverageTier | null {
    return AUTEL_MODEL_TIERS[toolId] || null;
}

/**
 * Determine if a vehicle is covered by a specific Autel model
 * Based on platform, limitations, and model capabilities
 */
export function isVehicleCoveredByAutelModel(
    toolId: string,
    baselineStatus: string,
    platform: string,
    limitations: Array<{ category: string }>,
    yearEnd: number
): { covered: boolean; status: string; confidence: string } {
    const tier = getAutelTier(toolId);

    if (!tier) {
        // Not an Autel model - return baseline
        return { covered: !!baselineStatus, status: baselineStatus, confidence: 'high' };
    }

    // If baseline has no coverage, neither do variants
    if (!baselineStatus || baselineStatus.toLowerCase().includes('no')) {
        return { covered: false, status: '', confidence: 'high' };
    }

    // Check platform exclusions
    const platformLower = platform.toLowerCase();
    const isExcludedPlatform = tier.excludedPlatforms.some(p =>
        platformLower.includes(p.toLowerCase())
    );

    if (isExcludedPlatform) {
        return {
            covered: false,
            status: '',
            confidence: 'medium'
        };
    }

    // Check limitation exclusions
    const hasExcludedLimitation = limitations.some(lim =>
        tier.excludedLimitations.includes(lim.category)
    );

    if (hasExcludedLimitation) {
        // Downgrade to partial or no coverage
        if (baselineStatus.toLowerCase().includes('yes')) {
            return {
                covered: true,
                status: 'Partial',
                confidence: 'medium'
            };
        }
        return { covered: false, status: '', confidence: 'medium' };
    }

    // Check year-based restrictions for entry-level tools
    // Newer vehicles (2022+) often require advanced features
    if (tier.coveragePercent < 80 && yearEnd >= 2022) {
        if (baselineStatus.toLowerCase().includes('yes')) {
            return {
                covered: true,
                status: 'Check',
                confidence: 'low'
            };
        }
    }

    // Full coverage for this model
    return {
        covered: true,
        status: baselineStatus,
        confidence: tier.coveragePercent === 100 ? 'high' : 'medium'
    };
}

/**
 * Get coverage stats for a specific Autel model across all vehicles
 */
export function getAutelModelStats(
    toolId: string,
    vehicles: Array<{
        autel: { status: string; limitations: Array<{ category: string }> };
        platform: string;
        yearEnd: number;
    }>
): { total: number; covered: number; partial: number; percent: number } {
    const tier = getAutelTier(toolId);
    if (!tier) {
        return { total: 0, covered: 0, partial: 0, percent: 0 };
    }

    let covered = 0;
    let partial = 0;

    for (const vehicle of vehicles) {
        const result = isVehicleCoveredByAutelModel(
            toolId,
            vehicle.autel.status,
            vehicle.platform,
            vehicle.autel.limitations,
            vehicle.yearEnd
        );

        if (result.covered) {
            if (result.status.toLowerCase().includes('partial') || result.status.toLowerCase().includes('check')) {
                partial++;
            } else {
                covered++;
            }
        }
    }

    return {
        total: vehicles.length,
        covered,
        partial,
        percent: Math.round(((covered + partial * 0.5) / vehicles.length) * 100),
    };
}
