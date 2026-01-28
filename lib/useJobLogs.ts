'use client';

import { useState, useEffect, useCallback } from 'react';

export interface JobLog {
    id: string;
    vehicle: string;
    fccId?: string;
    keyType?: string;
    jobType: 'add_key' | 'akl' | 'remote' | 'blade';
    price: number;
    date: string; // ISO string
    notes?: string;
    createdAt: number; // timestamp
}

export interface JobStats {
    totalJobs: number;
    totalRevenue: number;
    avgJobValue: number;
    thisWeekJobs: number;
    thisWeekRevenue: number;
    thisMonthJobs: number;
    thisMonthRevenue: number;
    lastMonthJobs: number;
    lastMonthRevenue: number;
    topVehicles: { vehicle: string; count: number }[];
    topKeys: { fccId: string; count: number }[];
    jobsByType: Record<string, { count: number; revenue: number }>;
}

const STORAGE_KEY = 'eurokeys_job_logs';

function generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useJobLogs() {
    const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setJobLogs(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load job logs:', e);
        }
        setLoading(false);
    }, []);

    // Save to localStorage whenever jobLogs changes
    const saveToStorage = useCallback((logs: JobLog[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }, []);

    const addJobLog = useCallback((log: Omit<JobLog, 'id' | 'createdAt'>) => {
        const newLog: JobLog = {
            ...log,
            id: generateId(),
            createdAt: Date.now(),
        };
        setJobLogs(prev => {
            const updated = [newLog, ...prev];
            saveToStorage(updated);
            return updated;
        });
        return newLog;
    }, [saveToStorage]);

    const deleteJobLog = useCallback((id: string) => {
        setJobLogs(prev => {
            const updated = prev.filter(log => log.id !== id);
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    const getJobStats = useCallback((): JobStats => {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        // Get start of current month and last month
        const today = new Date();
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).getTime();
        const lastMonthEnd = thisMonthStart - 1;

        const thisWeekLogs = jobLogs.filter(log => log.createdAt >= oneWeekAgo);
        const thisMonthLogs = jobLogs.filter(log => log.createdAt >= thisMonthStart);
        const lastMonthLogs = jobLogs.filter(log => log.createdAt >= lastMonthStart && log.createdAt <= lastMonthEnd);

        // Count vehicles
        const vehicleCounts: Record<string, number> = {};
        const keyCounts: Record<string, number> = {};
        const jobsByType: Record<string, { count: number; revenue: number }> = {};

        jobLogs.forEach(log => {
            if (log.vehicle) {
                vehicleCounts[log.vehicle] = (vehicleCounts[log.vehicle] || 0) + 1;
            }
            if (log.fccId) {
                keyCounts[log.fccId] = (keyCounts[log.fccId] || 0) + 1;
            }
            // Track by job type
            if (!jobsByType[log.jobType]) {
                jobsByType[log.jobType] = { count: 0, revenue: 0 };
            }
            jobsByType[log.jobType].count += 1;
            jobsByType[log.jobType].revenue += log.price || 0;
        });

        const topVehicles = Object.entries(vehicleCounts)
            .map(([vehicle, count]) => ({ vehicle, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topKeys = Object.entries(keyCounts)
            .map(([fccId, count]) => ({ fccId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const totalRevenue = jobLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const thisWeekRevenue = thisWeekLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const thisMonthRevenue = thisMonthLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const lastMonthRevenue = lastMonthLogs.reduce((sum, log) => sum + (log.price || 0), 0);

        return {
            totalJobs: jobLogs.length,
            totalRevenue,
            avgJobValue: jobLogs.length > 0 ? totalRevenue / jobLogs.length : 0,
            thisWeekJobs: thisWeekLogs.length,
            thisWeekRevenue,
            thisMonthJobs: thisMonthLogs.length,
            thisMonthRevenue,
            lastMonthJobs: lastMonthLogs.length,
            lastMonthRevenue,
            topVehicles,
            topKeys,
            jobsByType,
        };
    }, [jobLogs]);

    return {
        jobLogs,
        loading,
        addJobLog,
        deleteJobLog,
        getJobStats,
    };
}

// Standalone functions for use outside React components
export function getJobLogsFromStorage(): JobLog[] {
    if (typeof window === 'undefined') return [];
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

export function addJobLogToStorage(log: Omit<JobLog, 'id' | 'createdAt'>): JobLog {
    const newLog: JobLog = {
        ...log,
        id: generateId(),
        createdAt: Date.now(),
    };
    const logs = getJobLogsFromStorage();
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return newLog;
}
