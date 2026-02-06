'use client';

import { useMemo } from 'react';
import { useJobLogs } from '@/lib/useJobLogs';
import { useInventory } from '@/contexts/InventoryContext';
import { useAuth } from '@/contexts/AuthContext';

// Free tier limits for Business Tools add-on
export const FREE_TIER_LIMITS = {
    keys: 8,
    jobs: 1,
};

export interface FreeTierStatus {
    keysUsed: number;
    jobsCompleted: number;
    keysRemaining: number;
    jobsRemaining: number;
    isKeysOverLimit: boolean;
    isJobsOverLimit: boolean;
    hasFullAccess: boolean;
}

/**
 * Hook to track free tier usage for Business Tools.
 * Users without the Business Tools add-on get:
 * - 8 keys in inventory
 * - 5 completed jobs
 * 
 * Pro users and Business Tools subscribers get unlimited access.
 */
export function useFreeTierLimits(): FreeTierStatus {
    const { hasBusinessTools } = useAuth();
    const { jobLogs } = useJobLogs();
    const { inventory } = useInventory();

    return useMemo(() => {
        // Pro or Business Tools subscribers have full access
        if (hasBusinessTools) {
            return {
                keysUsed: 0,
                jobsCompleted: 0,
                keysRemaining: Infinity,
                jobsRemaining: Infinity,
                isKeysOverLimit: false,
                isJobsOverLimit: false,
                hasFullAccess: true,
            };
        }

        // Count actual usage
        const keysUsed = inventory?.length || 0;
        const jobsCompleted = jobLogs.filter(j => j.status === 'completed').length;

        return {
            keysUsed,
            jobsCompleted,
            keysRemaining: Math.max(0, FREE_TIER_LIMITS.keys - keysUsed),
            jobsRemaining: Math.max(0, FREE_TIER_LIMITS.jobs - jobsCompleted),
            isKeysOverLimit: keysUsed >= FREE_TIER_LIMITS.keys,
            isJobsOverLimit: jobsCompleted >= FREE_TIER_LIMITS.jobs,
            hasFullAccess: false,
        };
    }, [hasBusinessTools, jobLogs, inventory]);
}
