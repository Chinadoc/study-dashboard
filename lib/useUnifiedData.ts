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

// ============================================================================
// Utility Functions: Fuzzy Matching & Normalization
// ============================================================================

/**
 * Normalize FCC ID - handles variants like "M3N-A2C31243800-1"
 * Strips hyphens, spaces, and trailing variant numbers
 */
function normalizeFcc(fcc: string): string {
    // Remove all non-alphanumeric except trailing variant marker
    let normalized = fcc.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    // Strip common trailing variant patterns (like "1", "2" at end after numbers)
    normalized = normalized.replace(/(\d)([12])$/, '$1');
    return normalized;
}

/**
 * Parse vehicle string into components
 * Handles: "2020 Toyota Camry", "Toyota Camry 2020", "Toyota Camry"
 */
function parseVehicle(vehicleStr: string): { year?: number; make: string; model: string } {
    const parts = vehicleStr.trim().split(/\s+/);

    // Find year - could be at start or end
    let year: number | undefined;
    let yearIndex = -1;

    for (let i = 0; i < parts.length; i++) {
        const num = parseInt(parts[i]);
        if (num >= 1990 && num <= 2030) {
            year = num;
            yearIndex = i;
            break;
        }
    }

    // Remove year from parts
    if (yearIndex !== -1) {
        parts.splice(yearIndex, 1);
    }

    // First remaining word is make, rest is model
    const make = parts[0] || '';
    const model = parts.slice(1).join(' ') || '';

    return { year, make, model };
}

/**
 * Fuzzy vehicle match - handles different formats and partial matches
 */
function vehiclesMatch(vehicle1: string, vehicle2: string): boolean {
    if (!vehicle1 || !vehicle2) return false;

    const v1 = parseVehicle(vehicle1);
    const v2 = parseVehicle(vehicle2);

    // Normalize for comparison
    const make1 = v1.make.toLowerCase();
    const make2 = v2.make.toLowerCase();
    const model1 = v1.model.toLowerCase();
    const model2 = v2.model.toLowerCase();

    // Makes must match (or one be substring of other for "Chevy" vs "Chevrolet" type cases)
    const makeMatch = make1 === make2 ||
        make1.includes(make2) ||
        make2.includes(make1) ||
        areSimilarMakes(make1, make2);

    if (!makeMatch) return false;

    // Models must have overlap
    const modelMatch = model1 === model2 ||
        model1.includes(model2) ||
        model2.includes(model1);

    if (!modelMatch) return false;

    // If both have years, they should match (within 1 year tolerance for platform overlap)
    if (v1.year && v2.year) {
        return Math.abs(v1.year - v2.year) <= 1;
    }

    return true;
}

/**
 * Common make aliases
 */
function areSimilarMakes(make1: string, make2: string): boolean {
    const aliases: Record<string, string[]> = {
        'chevrolet': ['chevy'],
        'volkswagen': ['vw'],
        'mercedes': ['mercedes-benz', 'mb'],
        'bmw': ['bimmer'],
    };

    for (const [canonical, variants] of Object.entries(aliases)) {
        const all = [canonical, ...variants];
        if (all.includes(make1) && all.includes(make2)) return true;
    }
    return false;
}

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

export interface DeadStock {
    item: InventoryItem;
    daysSinceLastUsed: number | null; // null = never used
    qty: number;
    message: string;
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
    getDeadStock: () => DeadStock[];

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
        const normalizedFcc = normalizeFcc(fcc);
        const item = inventory.find(i =>
            normalizeFcc(i.itemKey) === normalizedFcc
        );
        return item?.qty || 0;
    }, [inventory]);

    // ========================================================================
    // Computed: Job History (using fuzzy matching)
    // ========================================================================

    const getJobHistory = useCallback((fcc?: string, vehicle?: string): JobLog[] => {
        return jobLogs.filter(job => {
            // FCC matching with variant handling
            if (fcc) {
                const normalizedSearch = normalizeFcc(fcc);
                const jobFcc = normalizeFcc(job.fccId || '');
                if (jobFcc === normalizedSearch) return true;
            }
            // Vehicle matching with fuzzy logic
            if (vehicle && job.vehicle) {
                if (vehiclesMatch(vehicle, job.vehicle)) return true;
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
                // Use parseVehicle utility for consistent parsing
                const parsed = parseVehicle(vehicle);
                const year = parsed.year || new Date().getFullYear();
                const make = parsed.make;
                const model = parsed.model;

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
            // Use parseVehicle utility
            const parsed = parseVehicle(vehicle);
            const year = parsed.year || new Date().getFullYear();
            const make = parsed.make;
            const model = parsed.model;

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
    // Phase 4: Dead Stock Detection
    // ========================================================================

    const getDeadStock = useCallback((): DeadStock[] => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const deadStock: DeadStock[] = [];

        // Build a map of FCC -> last used date
        const lastUsedMap = new Map<string, Date>();
        jobLogs.forEach(job => {
            if (job.fccId) {
                const normalized = normalizeFcc(job.fccId);
                const jobDate = new Date(job.date);
                const existing = lastUsedMap.get(normalized);
                if (!existing || jobDate > existing) {
                    lastUsedMap.set(normalized, jobDate);
                }
            }
        });

        // Check each inventory item
        inventory.forEach(item => {
            if (item.qty === 0) return; // Skip out-of-stock items

            const normalized = normalizeFcc(item.itemKey);
            const lastUsed = lastUsedMap.get(normalized);

            // Never used in a job
            if (!lastUsed) {
                deadStock.push({
                    item,
                    daysSinceLastUsed: null,
                    qty: item.qty,
                    message: `${item.qty} in stock, never used in a job`
                });
            }
            // Last used > 6 months ago
            else if (lastUsed < sixMonthsAgo) {
                const daysSince = Math.floor((Date.now() - lastUsed.getTime()) / (1000 * 60 * 60 * 24));
                deadStock.push({
                    item,
                    daysSinceLastUsed: daysSince,
                    qty: item.qty,
                    message: `${item.qty} in stock, last used ${Math.floor(daysSince / 30)} months ago`
                });
            }
        });

        // Sort: never used first, then by days since last used
        return deadStock.sort((a, b) => {
            if (a.daysSinceLastUsed === null && b.daysSinceLastUsed === null) return 0;
            if (a.daysSinceLastUsed === null) return -1;
            if (b.daysSinceLastUsed === null) return 1;
            return b.daysSinceLastUsed - a.daysSinceLastUsed;
        });
    }, [inventory, jobLogs]);

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
        // Phase 4: Dead Stock
        getDeadStock,
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
