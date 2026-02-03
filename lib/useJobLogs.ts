'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// API base URL - use environment variable or default to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

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
    customerEmail?: string;
    customerAddress?: string;

    // Fleet linking
    fleetId?: string;       // ID of the associated fleet account

    // Technician assignment
    technicianId?: string;  // ID of the technician who handled this job

    // Job tracking
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    startTime?: string;
    endTime?: string;
    laborMinutes?: number;

    // Cost tracking
    partsCost?: number;
    keyCost?: number;     // Cost of key/fob itself (from AKS pricing)
    serviceCost?: number; // Labor/service charge
    milesDriven?: number; // Miles driven for gas calculation
    gasCost?: number;     // Auto-calculated from miles (3.5$/gal at 30mpg)

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

    // Profit tracking
    totalPartsCost: number;
    totalProfit: number;
    avgProfit: number;
    thisMonthProfit: number;

    // Job status counts
    pendingJobs: number;
    completedJobs: number;

    // Labor metrics
    avgLaborMinutes: number;

    // Referral breakdown
    referralSources: Record<string, number>;

    // Top customers
    topCustomers: { name: string; count: number; revenue: number }[];
}

const STORAGE_KEY = 'eurokeys_job_logs';
const SYNCED_KEY = 'eurokeys_jobs_synced';

function generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    if (!token) return null;

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        console.error(`API error ${res.status}:`, await res.text());
        return null;
    }

    return res.json();
}

export function useJobLogs() {
    const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
    const [loading, setLoading] = useState(true);
    const hasSyncedRef = useRef(false);

    // Load jobs - prioritize cloud, fallback to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadJobs = async () => {
            const token = getAuthToken();

            if (token) {
                // Try to load from cloud
                try {
                    const data = await apiRequest('/api/jobs');
                    if (data?.jobs) {
                        setJobLogs(data.jobs);
                        // Cache in localStorage for offline access
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.jobs));
                        setLoading(false);

                        // Check if we need to sync localStorage jobs to cloud
                        // IMPROVED: Merge any local jobs not yet in cloud
                        if (!hasSyncedRef.current) {
                            const localJobs = getJobLogsFromStorage();
                            const cloudJobIds = new Set(data.jobs.map((j: JobLog) => j.id));
                            const localOnlyJobs = localJobs.filter(j => !cloudJobIds.has(j.id));

                            if (localOnlyJobs.length > 0) {
                                console.log(`Syncing ${localOnlyJobs.length} local-only jobs to cloud...`);
                                await apiRequest('/api/jobs/sync', {
                                    method: 'POST',
                                    body: JSON.stringify({ jobs: localOnlyJobs }),
                                });
                                // Reload to get merged data
                                const refreshed = await apiRequest('/api/jobs');
                                if (refreshed?.jobs) {
                                    setJobLogs(refreshed.jobs);
                                    localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed.jobs));
                                }
                            }
                            hasSyncedRef.current = true;
                        }
                        return;
                    }
                } catch (e) {
                    console.error('Failed to load jobs from cloud:', e);
                }
            }

            // Fallback to localStorage
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setJobLogs(JSON.parse(saved));
                }
            } catch (e) {
                console.error('Failed to load job logs from localStorage:', e);
            }
            setLoading(false);
        };

        loadJobs();
    }, []);

    // Save to localStorage (for cache) and cloud (for sync)
    const saveJob = useCallback(async (job: JobLog): Promise<boolean> => {
        // Always save to localStorage as cache
        const current = getJobLogsFromStorage();
        const exists = current.findIndex(j => j.id === job.id);
        if (exists >= 0) {
            current[exists] = job;
        } else {
            current.unshift(job);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));

        // Save to cloud if authenticated
        const token = getAuthToken();
        if (token) {
            try {
                await apiRequest('/api/jobs', {
                    method: 'POST',
                    body: JSON.stringify(job),
                });
            } catch (e) {
                console.error('Failed to sync job to cloud:', e);
            }
        }

        return true;
    }, []);

    const addJobLog = useCallback((log: Omit<JobLog, 'id' | 'createdAt'>): JobLog => {
        const newLog: JobLog = {
            ...log,
            id: generateId(),
            createdAt: Date.now(),
        };

        setJobLogs(prev => [newLog, ...prev]);
        saveJob(newLog);

        return newLog;
    }, [saveJob]);

    const deleteJobLog = useCallback(async (id: string) => {
        setJobLogs(prev => prev.filter(log => log.id !== id));

        // Remove from localStorage
        const current = getJobLogsFromStorage();
        const updated = current.filter(j => j.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Delete from cloud
        const token = getAuthToken();
        if (token) {
            try {
                await apiRequest(`/api/jobs/${id}`, { method: 'DELETE' });
            } catch (e) {
                console.error('Failed to delete job from cloud:', e);
            }
        }
    }, []);

    const updateJobLog = useCallback((id: string, updates: Partial<Omit<JobLog, 'id' | 'createdAt'>>) => {
        setJobLogs(prev => {
            const updated = prev.map(log =>
                log.id === id ? { ...log, ...updates } : log
            );

            // Find the updated job and save it
            const updatedJob = updated.find(j => j.id === id);
            if (updatedJob) {
                saveJob(updatedJob);
            }

            return updated;
        });
    }, [saveJob]);

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
            // Vehicle counting
            if (log.vehicle) {
                vehicleCounts[log.vehicle] = (vehicleCounts[log.vehicle] || 0) + 1;
            }
            // Key/FCC counting
            if (log.fccId) {
                keyCounts[log.fccId] = (keyCounts[log.fccId] || 0) + 1;
            }
            // Job type breakdown
            if (!jobsByType[log.jobType]) {
                jobsByType[log.jobType] = { count: 0, revenue: 0 };
            }
            jobsByType[log.jobType].count++;
            jobsByType[log.jobType].revenue += log.price;

            // Customer stats
            if (log.customerName) {
                if (!customerStats[log.customerName]) {
                    customerStats[log.customerName] = { count: 0, revenue: 0 };
                }
                customerStats[log.customerName].count++;
                customerStats[log.customerName].revenue += log.price;
            }

            // Labor tracking
            if (log.laborMinutes) {
                totalLaborMinutes += log.laborMinutes;
                laborJobCount++;
            }

            // Status counting
            if (log.status === 'pending' || log.status === 'in_progress') {
                pendingJobs++;
            } else if (log.status === 'completed') {
                completedJobs++;
            }

            // Referral sources
            if (log.referralSource) {
                referralSources[log.referralSource] = (referralSources[log.referralSource] || 0) + 1;
            }
        });

        // Calculate totals
        const totalRevenue = jobLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const totalPartsCost = jobLogs.reduce((sum, log) => sum + (log.partsCost || 0) + (log.keyCost || 0) + (log.serviceCost || 0) + (log.gasCost || 0), 0);
        const totalProfit = totalRevenue - totalPartsCost;

        const thisWeekRevenue = thisWeekLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const thisMonthRevenue = thisMonthLogs.reduce((sum, log) => sum + (log.price || 0), 0);
        const thisMonthPartsCost = thisMonthLogs.reduce((sum, log) => sum + (log.partsCost || 0) + (log.keyCost || 0) + (log.serviceCost || 0) + (log.gasCost || 0), 0);
        const thisMonthProfit = thisMonthRevenue - thisMonthPartsCost;
        const lastMonthRevenue = lastMonthLogs.reduce((sum, log) => sum + (log.price || 0), 0);

        // Top vehicles and keys
        const topVehicles = Object.entries(vehicleCounts)
            .map(([vehicle, count]) => ({ vehicle, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const topKeys = Object.entries(keyCounts)
            .map(([fccId, count]) => ({ fccId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Top customers
        const topCustomers = Object.entries(customerStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

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

    // Get unique recent customers for quick-fill
    const getRecentCustomers = useCallback((): Array<{ name: string; phone?: string; email?: string; address?: string }> => {
        const customerMap = new Map<string, { name: string; phone?: string; email?: string; address?: string; lastUsed: number }>();

        jobLogs.forEach(log => {
            if (log.customerName && log.customerName.trim()) {
                const existing = customerMap.get(log.customerName);
                if (!existing || log.createdAt > existing.lastUsed) {
                    customerMap.set(log.customerName, {
                        name: log.customerName,
                        phone: log.customerPhone || existing?.phone,
                        email: log.customerEmail || existing?.email,
                        address: log.customerAddress || existing?.address,
                        lastUsed: log.createdAt,
                    });
                }
            }
        });

        return Array.from(customerMap.values())
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .slice(0, 10)
            .map(({ name, phone, email, address }) => ({ name, phone, email, address }));
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

// Standalone functions for use outside React components (GoalContext)
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
