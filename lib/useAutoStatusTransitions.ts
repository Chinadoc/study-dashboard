'use client';

import { useEffect, useRef, useCallback } from 'react';
import { JobLog } from '@/lib/useJobLogs';

/**
 * Auto-Status Transitions Hook
 * 
 * Mirrors Power Dispatch behavior:
 * - Appointment → Accepted: 2 hours before the scheduled date/time
 * 
 * Runs on a 60-second interval and checks all eligible jobs.
 */

interface UseAutoStatusTransitionsOptions {
    jobs: JobLog[];
    updateJobLog: (id: string, updates: Partial<JobLog>) => void;
    enabled?: boolean;
}

// 2 hours in milliseconds
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function useAutoStatusTransitions({
    jobs,
    updateJobLog,
    enabled = true,
}: UseAutoStatusTransitionsOptions) {
    const updateRef = useRef(updateJobLog);
    updateRef.current = updateJobLog;

    const processTransitions = useCallback(() => {
        if (!enabled) return;

        const now = Date.now();

        for (const job of jobs) {
            // Appointment → Accepted: 2 hours before scheduled date
            if (job.status === 'appointment' && job.date) {
                try {
                    // Parse the job date - assume start of day if no time
                    const scheduledTime = new Date(job.date + 'T08:00:00').getTime();
                    const transitionTime = scheduledTime - TWO_HOURS_MS;

                    if (now >= transitionTime) {
                        updateRef.current(job.id, {
                            status: 'accepted',
                            acceptedAt: now,
                        } as Partial<JobLog>);
                    }
                } catch {
                    // Skip jobs with invalid dates
                }
            }
        }
    }, [jobs, enabled]);

    useEffect(() => {
        if (!enabled) return;

        // Run immediately on mount
        processTransitions();

        // Then check every 60 seconds
        const interval = setInterval(processTransitions, 60_000);

        return () => clearInterval(interval);
    }, [processTransitions, enabled]);
}
