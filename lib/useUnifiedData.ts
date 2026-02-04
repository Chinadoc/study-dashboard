'use client';

/**
 * Unified Data Hook
 * Combines inventory, jobs, business profile, and tool coverage into a single composable hook
 */

import { useMemo, useCallback } from 'react';
import { useInventory, InventoryItem } from '@/contexts/InventoryContext';
import { useJobLogs, JobLog } from '@/lib/useJobLogs';
import { loadBusinessProfile, AVAILABLE_TOOLS, BusinessProfile, ToolInfo } from '@/lib/businessTypes';
import { getVehicleCoverage, VehicleCoverageResult, VehicleToolCoverage } from '@/lib/toolCoverage';

// ============================================================================
// Types
// ============================================================================

export interface UnifiedStats {
    // Inventory stats
    totalKeyTypes: number;
    totalKeyUnits: number;
    lowStockCount: number;

    // Job stats
    totalJobs: number;
    thisMonthJobs: number;
    thisMonthRevenue: number;

    // Coverage stats
    ownedToolsCount: number;

    // Cross-referenced stats
    mostUsedKeys: { fcc: string; count: number; vehicle?: string }[];
    keysByJobFrequency: Map<string, number>;
}

export interface CoverageResult {
    canService: boolean;
    hasStock: boolean;
    ownedTools: VehicleToolCoverage[];
    missingTools: VehicleToolCoverage[];
    keyStock: number;
    relatedJobs: JobLog[];
}

export interface UnifiedData {
    // Raw data
    inventory: InventoryItem[];
    jobs: JobLog[];
    profile: BusinessProfile;
    tools: ToolInfo[];
    loading: boolean;

    // Computed properties
    canServiceVehicle: (make: string, model: string, year: number, fcc?: string) => CoverageResult;
    getKeyStock: (fcc: string) => number;
    getJobHistory: (fcc?: string, vehicle?: string) => JobLog[];
    getJobsUsingKey: (fcc: string) => JobLog[];

    // Aggregated stats
    stats: UnifiedStats;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useUnifiedData(): UnifiedData {
    const { inventory, loading: inventoryLoading } = useInventory();
    const { jobLogs, loading: jobsLoading } = useJobLogs();

    // Load business profile (synchronous from localStorage)
    const profile = useMemo(() => loadBusinessProfile(), []);

    // Get owned tools
    const ownedTools = useMemo(() => {
        return AVAILABLE_TOOLS.filter(tool => profile.tools.includes(tool.id));
    }, [profile.tools]);

    // ========================================================================
    // Computed: Key Stock Lookup
    // ========================================================================

    const getKeyStock = useCallback((fcc: string): number => {
        const normalizedFcc = fcc.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const item = inventory.find(i =>
            i.itemKey.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === normalizedFcc
        );
        return item?.qty || 0;
    }, [inventory]);

    // ========================================================================
    // Computed: Job History
    // ========================================================================

    const getJobHistory = useCallback((fcc?: string, vehicle?: string): JobLog[] => {
        return jobLogs.filter(job => {
            if (fcc) {
                const normalizedFcc = fcc.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                const jobFcc = job.fccId?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '';
                if (jobFcc === normalizedFcc) return true;
            }
            if (vehicle) {
                const normalizedVehicle = vehicle.toLowerCase();
                const jobVehicle = job.vehicle?.toLowerCase() || '';
                if (jobVehicle.includes(normalizedVehicle) || normalizedVehicle.includes(jobVehicle)) {
                    return true;
                }
            }
            return false;
        });
    }, [jobLogs]);

    const getJobsUsingKey = useCallback((fcc: string): JobLog[] => {
        return getJobHistory(fcc);
    }, [getJobHistory]);

    // ========================================================================
    // Computed: Can Service Vehicle
    // ========================================================================

    const canServiceVehicle = useCallback((
        make: string,
        model: string,
        year: number,
        fcc?: string
    ): CoverageResult => {
        // Get tool coverage for this vehicle
        const coverage = getVehicleCoverage(make, model, year);

        // Filter to owned tools with coverage
        const ownedWithCoverage = coverage.tools.filter(t =>
            t.isOwned && t.status && !t.status.toLowerCase().includes('no')
        );

        // Find tools that could cover but user doesn't own
        const missingWithCoverage = coverage.tools.filter(t =>
            !t.isOwned && t.status && !t.status.toLowerCase().includes('no')
        );

        // Check key stock
        const keyStock = fcc ? getKeyStock(fcc) : 0;

        // Get related job history
        const vehicleString = `${year} ${make} ${model}`;
        const relatedJobs = getJobHistory(fcc, vehicleString);

        return {
            canService: ownedWithCoverage.length > 0,
            hasStock: keyStock > 0,
            ownedTools: ownedWithCoverage,
            missingTools: missingWithCoverage,
            keyStock,
            relatedJobs,
        };
    }, [getKeyStock, getJobHistory]);

    // ========================================================================
    // Stats Computation
    // ========================================================================

    const stats = useMemo((): UnifiedStats => {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Inventory stats
        const keys = inventory.filter(i => i.type === 'key');
        const lowStock = inventory.filter(i => i.qty <= 2);

        // Job stats
        const thisMonthJobs = jobLogs.filter(j => new Date(j.date) >= thisMonthStart);
        const thisMonthRevenue = thisMonthJobs.reduce((sum, j) => sum + (j.price || 0), 0);

        // Key usage frequency from jobs
        const keyUsage = new Map<string, number>();
        jobLogs.forEach(job => {
            if (job.fccId) {
                const normalizedFcc = job.fccId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                keyUsage.set(normalizedFcc, (keyUsage.get(normalizedFcc) || 0) + 1);
            }
        });

        // Most used keys
        const mostUsedKeys = Array.from(keyUsage.entries())
            .map(([fcc, count]) => {
                const item = inventory.find(i =>
                    i.itemKey.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === fcc
                );
                return { fcc, count, vehicle: item?.vehicle };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalKeyTypes: keys.length,
            totalKeyUnits: keys.reduce((sum, k) => sum + k.qty, 0),
            lowStockCount: lowStock.length,
            totalJobs: jobLogs.length,
            thisMonthJobs: thisMonthJobs.length,
            thisMonthRevenue,
            ownedToolsCount: ownedTools.length,
            mostUsedKeys,
            keysByJobFrequency: keyUsage,
        };
    }, [inventory, jobLogs, ownedTools]);

    // ========================================================================
    // Return unified data object
    // ========================================================================

    return {
        inventory,
        jobs: jobLogs,
        profile,
        tools: ownedTools,
        loading: inventoryLoading || jobsLoading,
        canServiceVehicle,
        getKeyStock,
        getJobHistory,
        getJobsUsingKey,
        stats,
    };
}

// ============================================================================
// Utility exports for non-React contexts
// ============================================================================

export function getKeyStockSync(fcc: string, inventory: InventoryItem[]): number {
    const normalizedFcc = fcc.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const item = inventory.find(i =>
        i.itemKey.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === normalizedFcc
    );
    return item?.qty || 0;
}
