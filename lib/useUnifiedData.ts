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

export interface RestockRecommendation {
    item: InventoryItem;
    reason: 'low_stock' | 'high_demand' | 'out_of_stock';
    urgency: 'low' | 'medium' | 'high';
    jobCount: number;
    message: string;
}

export interface TrendingVehicle {
    vehicle: string;
    make: string;
    model: string;
    count: number;
    recentJob?: JobLog;
    canService: boolean;
}

export interface CoverageGap {
    vehicle: string;
    make: string;
    model: string;
    jobCount: number;
    missingTools: string[];
    recommendation: string;
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

    // Phase 3: Intelligent Insights
    getRestockRecommendations: () => RestockRecommendation[];
    getTrendingVehicles: () => TrendingVehicle[];
    getCoverageGaps: () => CoverageGap[];

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
    // Phase 3: Restock Recommendations
    // ========================================================================

    const getRestockRecommendations = useCallback((): RestockRecommendation[] => {
        const recommendations: RestockRecommendation[] = [];

        // Build job frequency map for inventory items
        const keyJobCounts = new Map<string, number>();
        jobLogs.forEach(job => {
            if (job.fccId) {
                const normalized = job.fccId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                keyJobCounts.set(normalized, (keyJobCounts.get(normalized) || 0) + 1);
            }
        });

        inventory.forEach(item => {
            const normalizedKey = item.itemKey.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const jobCount = keyJobCounts.get(normalizedKey) || 0;

            // Out of stock with job history = highest urgency
            if (item.qty === 0 && jobCount > 0) {
                recommendations.push({
                    item,
                    reason: 'out_of_stock',
                    urgency: 'high',
                    jobCount,
                    message: `Out of stock! Used in ${jobCount} job${jobCount > 1 ? 's' : ''}`
                });
            }
            // Low stock (1-2) with high demand (3+ jobs)
            else if (item.qty <= 2 && jobCount >= 3) {
                recommendations.push({
                    item,
                    reason: 'high_demand',
                    urgency: 'high',
                    jobCount,
                    message: `Only ${item.qty} left, used in ${jobCount} jobs`
                });
            }
            // Low stock with some demand
            else if (item.qty <= 2 && jobCount > 0) {
                recommendations.push({
                    item,
                    reason: 'low_stock',
                    urgency: 'medium',
                    jobCount,
                    message: `Low stock (${item.qty}), used in ${jobCount} job${jobCount > 1 ? 's' : ''}`
                });
            }
            // Low stock but no recent jobs
            else if (item.qty <= 1) {
                recommendations.push({
                    item,
                    reason: 'low_stock',
                    urgency: 'low',
                    jobCount,
                    message: `Only ${item.qty} in stock`
                });
            }
        });

        // Sort by urgency then job count
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        return recommendations.sort((a, b) =>
            urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || b.jobCount - a.jobCount
        );
    }, [inventory, jobLogs]);

    // ========================================================================
    // Phase 3: Trending Vehicles  
    // ========================================================================

    const getTrendingVehicles = useCallback((): TrendingVehicle[] => {
        // Count vehicles from recent jobs (last 90 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const vehicleCounts = new Map<string, { count: number; recentJob: JobLog }>();

        jobLogs
            .filter(job => new Date(job.date) >= ninetyDaysAgo && job.vehicle)
            .forEach(job => {
                const vehicle = job.vehicle!.trim();
                const existing = vehicleCounts.get(vehicle);
                if (existing) {
                    existing.count++;
                    // Keep most recent job
                    if (new Date(job.date) > new Date(existing.recentJob.date)) {
                        existing.recentJob = job;
                    }
                } else {
                    vehicleCounts.set(vehicle, { count: 1, recentJob: job });
                }
            });

        // Convert to trending list with coverage info
        return Array.from(vehicleCounts.entries())
            .map(([vehicle, data]) => {
                // Parse vehicle string (e.g., "2020 Toyota Camry")
                const parts = vehicle.split(' ');
                const year = parseInt(parts[0]) || new Date().getFullYear();
                const make = parts[1] || '';
                const model = parts.slice(2).join(' ') || '';

                // Check if we can service this vehicle
                const coverage = getVehicleCoverage(make, model, year);
                const canService = coverage.tools.some(t =>
                    t.isOwned && t.status && !t.status.toLowerCase().includes('no')
                );

                return {
                    vehicle,
                    make,
                    model,
                    count: data.count,
                    recentJob: data.recentJob,
                    canService
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [jobLogs]);

    // ========================================================================
    // Phase 3: Coverage Gaps
    // ========================================================================

    const getCoverageGaps = useCallback((): CoverageGap[] => {
        // Find vehicles we worked on but couldn't fully service or had issues
        const vehicleJobCounts = new Map<string, number>();

        // Count jobs per vehicle type
        jobLogs.forEach(job => {
            if (job.vehicle) {
                const vehicle = job.vehicle.trim();
                vehicleJobCounts.set(vehicle, (vehicleJobCounts.get(vehicle) || 0) + 1);
            }
        });

        const gaps: CoverageGap[] = [];

        vehicleJobCounts.forEach((count, vehicle) => {
            // Parse vehicle
            const parts = vehicle.split(' ');
            const year = parseInt(parts[0]) || new Date().getFullYear();
            const make = parts[1] || '';
            const model = parts.slice(2).join(' ') || '';

            // Get coverage
            const coverage = getVehicleCoverage(make, model, year);

            // Find tools that could cover this but we don't own
            const missingButAvailable = coverage.tools.filter(t =>
                !t.isOwned && t.status && !t.status.toLowerCase().includes('no')
            );

            // Only report as gap if we have multiple jobs and missing coverage  
            if (count >= 2 && missingButAvailable.length > 0) {
                const missingNames = missingButAvailable.map(t => t.name);

                // Check if any of our tools can handle this
                const ourCoverage = coverage.tools.filter(t => t.isOwned && t.status);

                if (ourCoverage.length === 0) {
                    gaps.push({
                        vehicle,
                        make,
                        model,
                        jobCount: count,
                        missingTools: missingNames,
                        recommendation: `Consider: ${missingNames.slice(0, 2).join(' or ')}`
                    });
                }
            }
        });

        return gaps.sort((a, b) => b.jobCount - a.jobCount).slice(0, 5);
    }, [jobLogs]);

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
        // Phase 3: Intelligent Insights
        getRestockRecommendations,
        getTrendingVehicles,
        getCoverageGaps,
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
