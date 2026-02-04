'use client';

/**
 * useReadiness Hook
 * Calculates real-time readiness status for vehicle coverage based on:
 * - Owned tools (from business profile)
 * - Key stock (from inventory)
 * - Active subscriptions (from localStorage licenses)
 */

import { useMemo, useCallback } from 'react';
import { useUnifiedData } from './useUnifiedData';
import { coverageMatrix, CoverageGroup } from '@/src/data/coverageMatrixLoader';

// ============================================================================
// Types
// ============================================================================

export type ReadinessStatus = 'READY' | 'NEED_PARTS' | 'NEED_SUBSCRIPTION' | 'CANNOT_SERVICE';

export interface VehicleReadiness {
    status: ReadinessStatus;
    hasToolCoverage: boolean;
    hasKeyStock: boolean;
    hasActiveSubscription: boolean;
    blockers: string[];
}

export interface EnhancedCoverageGroup extends CoverageGroup {
    readiness: VehicleReadiness;
}

// Subscription/license storage key (must match LicensureDashboard)
const LICENSES_STORAGE_KEY = 'eurokeys_user_licenses';

// ============================================================================
// Readiness Status Styles
// ============================================================================

export const READINESS_STYLES: Record<ReadinessStatus, {
    bg: string;
    border: string;
    text: string;
    icon: string;
    label: string;
    description: string;
}> = {
    READY: {
        bg: 'bg-green-950/20',
        border: 'border-green-500/50',
        text: 'text-green-400',
        icon: '✅',
        label: 'Ready Now',
        description: 'Tools, stock, and subscriptions all set'
    },
    NEED_PARTS: {
        bg: 'bg-yellow-950/20',
        border: 'border-yellow-500/50',
        text: 'text-yellow-400',
        icon: '📦',
        label: 'Need Parts',
        description: 'Tools ready but key blank out of stock'
    },
    NEED_SUBSCRIPTION: {
        bg: 'bg-orange-950/20',
        border: 'border-orange-500/50',
        text: 'text-orange-400',
        icon: '🔐',
        label: 'Need Subscription',
        description: 'Tool subscription expired or missing'
    },
    CANNOT_SERVICE: {
        bg: 'bg-red-950/20',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: '🚫',
        label: "Can't Service",
        description: 'No tool coverage for this vehicle'
    }
};

// ============================================================================
// Helper: Load active subscriptions
// ============================================================================

interface StoredLicense {
    id: string;
    licenseId: string;
    name: string;
    type: string;
    expirationDate?: string;
    linkedToolId?: string;
    tokensRemaining?: number;
}

function getActiveSubscriptions(): Map<string, StoredLicense> {
    if (typeof window === 'undefined') return new Map();

    try {
        const stored = localStorage.getItem(LICENSES_STORAGE_KEY);
        if (!stored) return new Map();

        const licenses: StoredLicense[] = JSON.parse(stored);
        const now = new Date();

        // Filter to active (non-expired) subscriptions
        const active = new Map<string, StoredLicense>();
        licenses.forEach(license => {
            // Check if expired
            if (license.expirationDate) {
                const expDate = new Date(license.expirationDate);
                if (expDate < now) return; // Expired
            }

            // Check if token-based and depleted
            if (license.tokensRemaining !== undefined && license.tokensRemaining <= 0) {
                return; // No tokens left
            }

            // Active - index by tool ID if linked, otherwise by license ID
            const key = license.linkedToolId || license.licenseId || license.id;
            active.set(key.toLowerCase(), license);
        });

        return active;
    } catch {
        return new Map();
    }
}

// ============================================================================
// Subscription requirements by tool (simplified mapping)
// ============================================================================

const TOOL_SUBSCRIPTION_REQUIREMENTS: Record<string, string[]> = {
    'autel_im608': ['autel_update', 'nastf_vsp'],
    'autel_im508': ['autel_update'],
    'lonsdor_k518': ['lonsdor_update'],
    'smartpro': ['smart_pro_update', 'smart_pro_tokens'],
    'xtool_x100': [],
    'xhorse_vvdi': [],
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useReadiness() {
    const unifiedData = useUnifiedData();
    const { inventory, tools, profile } = unifiedData;

    // Get active subscriptions (memoized but will refresh on re-render)
    const activeSubscriptions = useMemo(() => getActiveSubscriptions(), []);

    // ========================================================================
    // Calculate readiness for a specific vehicle group
    // ========================================================================

    const calculateReadiness = useCallback((group: CoverageGroup): VehicleReadiness => {
        const blockers: string[] = [];

        // 1. Check tool coverage
        const hasCoveringTool = group.tools_claiming_coverage.some(tool => {
            const toolName = tool.tool_name.toLowerCase();
            // Check if user owns any tool that claims coverage
            return profile.tools.some(ownedId =>
                toolName.includes(ownedId.toLowerCase()) ||
                ownedId.toLowerCase().includes(toolName.split(' ')[0])
            );
        });

        if (!hasCoveringTool) {
            // Check if gap status already indicates no coverage
            if (group.status === 'RED') {
                blockers.push('No tool currently supports this vehicle');
            } else {
                blockers.push('You don\'t own a tool for this vehicle');
            }
        }

        // 2. Check subscriptions for owned tools
        let hasActiveSubscription = true;
        if (hasCoveringTool) {
            profile.tools.forEach(toolId => {
                const requiredSubs = TOOL_SUBSCRIPTION_REQUIREMENTS[toolId.toLowerCase()] || [];
                requiredSubs.forEach(subId => {
                    if (!activeSubscriptions.has(subId.toLowerCase())) {
                        hasActiveSubscription = false;
                        blockers.push(`${subId.replace(/_/g, ' ')} subscription needed`);
                    }
                });
            });
        }

        // 3. Check key stock (simplified - check if any related inventory exists)
        // In reality, this would need FCC ID mapping from vehicle data
        const hasKeyStock = true; // Default to true for now, can enhance later

        // 4. Determine status
        let status: ReadinessStatus;

        if (!hasCoveringTool) {
            status = 'CANNOT_SERVICE';
        } else if (!hasActiveSubscription) {
            status = 'NEED_SUBSCRIPTION';
        } else if (!hasKeyStock) {
            status = 'NEED_PARTS';
        } else {
            status = 'READY';
        }

        return {
            status,
            hasToolCoverage: hasCoveringTool,
            hasKeyStock,
            hasActiveSubscription,
            blockers: [...new Set(blockers)] // Dedupe
        };
    }, [profile.tools, activeSubscriptions]);

    // ========================================================================
    // Enhanced coverage matrix with readiness
    // ========================================================================

    const enhancedMatrix = useMemo((): EnhancedCoverageGroup[] => {
        return coverageMatrix.map(group => ({
            ...group,
            readiness: calculateReadiness(group)
        }));
    }, [calculateReadiness]);

    // ========================================================================
    // Group by readiness status
    // ========================================================================

    const groupsByReadiness = useMemo(() => {
        const groups: Record<ReadinessStatus, EnhancedCoverageGroup[]> = {
            READY: [],
            NEED_PARTS: [],
            NEED_SUBSCRIPTION: [],
            CANNOT_SERVICE: []
        };

        enhancedMatrix.forEach(g => {
            groups[g.readiness.status].push(g);
        });

        return groups;
    }, [enhancedMatrix]);

    // ========================================================================
    // Summary stats
    // ========================================================================

    const readinessStats = useMemo(() => ({
        ready: groupsByReadiness.READY.length,
        needParts: groupsByReadiness.NEED_PARTS.length,
        needSubscription: groupsByReadiness.NEED_SUBSCRIPTION.length,
        cannotService: groupsByReadiness.CANNOT_SERVICE.length,
        total: enhancedMatrix.length
    }), [groupsByReadiness, enhancedMatrix]);

    return {
        enhancedMatrix,
        groupsByReadiness,
        readinessStats,
        calculateReadiness,
        ...unifiedData
    };
}
