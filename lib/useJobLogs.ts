'use client';

import { useState, useEffect, useCallback } from 'react';

export interface JobLog {
    id: string;
    vehicle: string;
    fccId?: string;
    keyType?: string;
    jobType: 'add_key' | 'akl' | 'remote' | 'blade' | 'rekey' | 'lockout' | 'safe' | 'other';
    price: number;
    date: string; // ISO string
    notes?: string;
    createdAt: number; // timestamp

    // Customer info
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;

    // Job tracking
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    startTime?: string;
    endTime?: string;
    laborMinutes?: number;

    // Cost tracking
    partsCost?: number;
    keyCost?: number;     // Cost of key/fob itself
    gasCost?: number;     // Travel/mileage cost

    // Additional details
    referralSource?: 'google' | 'yelp' | 'referral' | 'repeat' | 'other';
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

    // NEW: Profit tracking
    totalPartsCost: number;
    totalProfit: number;
    avgProfit: number;
    thisMonthProfit: number;

    // NEW: Job status counts
    pendingJobs: number;
    completedJobs: number;

    // NEW: Labor metrics
    avgLaborMinutes: number;

    // NEW: Referral breakdown
    referralSources: Record<string, number>;

    // NEW: Top customers
    topCustomers: { name: string; count: number; revenue: number }[];
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

        // Count vehicles, keys, customers
        const vehicleCounts: Record<string, number> = {};
        const keyCounts: Record<string, number> = {};
        const jobsByType: Record<string, { count: number; revenue: number }> = {};
        const customerStats: Record<string, { count: number; revenue: number }> = {};
        const referralSources: Record<string, number> = {};

        let totalLaborMinutes = 0;
        let laborJobCount = 0;
        let pendingJobs = 0;
        let completedJobs = 0;

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

            // Track customers
            if (log.customerName) {
                if (!customerStats[log.customerName]) {
                    customerStats[log.customerName] = { count: 0, revenue: 0 };
                }
                customerStats[log.customerName].count += 1;
                customerStats[log.customerName].revenue += log.price || 0;
            }

            // Track referral sources
            if (log.referralSource) {
                referralSources[log.referralSource] = (referralSources[log.referralSource] || 0) + 1;
            }

            // Track labor
            if (log.laborMinutes && log.laborMinutes > 0) {
                totalLaborMinutes += log.laborMinutes;
                laborJobCount += 1;
            }

            // Track status
            if (log.status === 'pending' || log.status === 'in_progress') {
                pendingJobs += 1;
            } else if (log.status === 'completed') {
                completedJobs += 1;
            } else {
                // Default: treat jobs without status as completed
                completedJobs += 1;
            }
        });

        const topVehicles = Object.entries(vehicleCounts)
            .map(([vehicle, count]) => ({ vehicle, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topKeys = Object.entries(keyCounts)
            .map(([fccId, count]) => ({ fccId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topCustomers = Object.entries(customerStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
            .slice(0, 5);

        const totalRevenue = jobLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const totalPartsCost = jobLogs.reduce((sum, log) => sum + (log.partsCost || 0) + (log.keyCost || 0) + (log.gasCost || 0), 0);
        const totalProfit = totalRevenue - totalPartsCost;

        const thisWeekRevenue = thisWeekLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const thisMonthRevenue = thisMonthLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const thisMonthPartsCost = thisMonthLogs.reduce((sum, log) => sum + (log.partsCost || 0) + (log.keyCost || 0) + (log.gasCost || 0), 0);
        const thisMonthProfit = thisMonthRevenue - thisMonthPartsCost;
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
            // New stats
            totalPartsCost,
            totalProfit,
            avgProfit: jobLogs.length > 0 ? totalProfit / jobLogs.length : 0,
            thisMonthProfit,
            pendingJobs,
            completedJobs,
            avgLaborMinutes: laborJobCount > 0 ? totalLaborMinutes / laborJobCount : 0,
            referralSources,
            topCustomers,
        };
    }, [jobLogs]);

    const updateJobLog = useCallback((id: string, updates: Partial<Omit<JobLog, 'id' | 'createdAt'>>) => {
        setJobLogs(prev => {
            const updated = prev.map(log =>
                log.id === id ? { ...log, ...updates } : log
            );
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    // Get unique recent customers for quick-fill
    const getRecentCustomers = useCallback((): Array<{ name: string; phone?: string; address?: string }> => {
        const customerMap = new Map<string, { name: string; phone?: string; address?: string; lastUsed: number }>();

        jobLogs.forEach(log => {
            if (log.customerName && log.customerName.trim()) {
                const existing = customerMap.get(log.customerName);
                if (!existing || log.createdAt > existing.lastUsed) {
                    customerMap.set(log.customerName, {
                        name: log.customerName,
                        phone: log.customerPhone || existing?.phone,
                        address: log.customerAddress || existing?.address,
                        lastUsed: log.createdAt,
                    });
                }
            }
        });

        return Array.from(customerMap.values())
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, 10)
            .map(({ name, phone, address }) => ({ name, phone, address }));
    }, [jobLogs]);

    return {
        jobLogs,
        loading,
        addJobLog,
        updateJobLog,
        deleteJobLog,
        getJobStats,
        getRecentCustomers,
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
