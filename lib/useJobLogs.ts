'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getDeviceId,
    getSyncState,
    updateSyncState,
    addToQueue,
    removeFromQueue,
    getQueue,
    isOnline,
    setupConnectivityListeners,
    SyncStatus,
    getSyncStatus as getQueueSyncStatus
} from './syncQueue';
import { syncEvents } from './syncEvents';

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

    // Sync metadata
    updatedAt?: number;       // Timestamp of last modification
    syncedAt?: number;        // When it was last synced to cloud
    syncStatus?: 'pending' | 'synced' | 'conflict';  // Current sync state
    deviceId?: string;        // Origin device for conflict resolution
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
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
    const hasSyncedRef = useRef(false);
    const isSyncingRef = useRef(false);

    // Merge local and cloud jobs using timestamps
    const mergeJobs = useCallback((local: JobLog[], cloud: JobLog[]): JobLog[] => {
        const merged = new Map<string, JobLog>();

        // Start with cloud jobs
        cloud.forEach(job => {
            merged.set(job.id, { ...job, syncStatus: 'synced' as const });
        });

        // Merge in local jobs, using updatedAt for conflict resolution
        local.forEach(localJob => {
            const cloudJob = merged.get(localJob.id);
            if (!cloudJob) {
                // Local-only job, needs to sync
                merged.set(localJob.id, { ...localJob, syncStatus: 'pending' as const });
            } else {
                // Both exist - compare timestamps
                const localTime = localJob.updatedAt || localJob.createdAt || 0;
                const cloudTime = cloudJob.updatedAt || cloudJob.createdAt || 0;

                if (localTime > cloudTime) {
                    // Local is newer
                    merged.set(localJob.id, { ...localJob, syncStatus: 'pending' as const });
                }
                // else cloud wins (already in merged)
            }
        });

        // Sort by createdAt descending
        return Array.from(merged.values()).sort((a, b) =>
            (b.createdAt || 0) - (a.createdAt || 0)
        );
    }, []);

    // Process pending sync queue
    const processSyncQueue = useCallback(async () => {
        if (isSyncingRef.current || !isOnline()) return;

        const queue = getQueue();
        const jobOps = queue.filter(op => op.entityType === 'job');

        if (jobOps.length === 0) return;

        isSyncingRef.current = true;
        setSyncStatus('syncing');

        try {
            const token = getAuthToken();
            if (!token) {
                isSyncingRef.current = false;
                setSyncStatus('pending');
                return;
            }

            // Batch sync all pending jobs
            const pendingJobs = jobOps
                .filter(op => op.type !== 'delete')
                .map(op => op.data as unknown as JobLog);

            if (pendingJobs.length > 0) {
                await apiRequest('/api/jobs/sync', {
                    method: 'POST',
                    body: JSON.stringify({
                        jobs: pendingJobs,
                        deviceId: getDeviceId()
                    }),
                });
            }

            // Process deletes
            const deleteOps = jobOps.filter(op => op.type === 'delete');
            for (const op of deleteOps) {
                await apiRequest(`/api/jobs/${op.id}`, { method: 'DELETE' });
                removeFromQueue(op.id, 'job');
            }

            // Clear synced items from queue
            pendingJobs.forEach(job => removeFromQueue(job.id, 'job'));

            // Update sync state
            updateSyncState({
                lastCloudSync: Date.now(),
                pendingCount: 0
            });

            setSyncStatus('synced');
        } catch (e) {
            console.error('Failed to process sync queue:', e);
            updateSyncState({
                lastError: e instanceof Error ? e.message : 'Sync failed',
                lastErrorTime: Date.now()
            });
            setSyncStatus('error');
        } finally {
            isSyncingRef.current = false;
        }
    }, []);

    // Bidirectional sync: load from both local and cloud, merge, then push local-only to cloud
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadJobs = async () => {
            setSyncStatus('syncing');

            // 1. Load local jobs first (instant UI)
            let localJobs: JobLog[] = [];
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    localJobs = JSON.parse(saved);
                    setJobLogs(localJobs);
                }
            } catch (e) {
                console.error('Failed to load local jobs:', e);
            }

            const token = getAuthToken();

            if (!token) {
                // Not authenticated - just use local
                setLoading(false);
                setSyncStatus(localJobs.length > 0 ? 'pending' : 'synced');
                return;
            }

            // 2. Fetch from cloud (with delta sync - only fetch jobs updated since last sync)
            try {
                const syncState = getSyncState();
                const lastSync = syncState.lastCloudSync;

                // Use delta sync if we have a previous sync timestamp and some local data
                const endpoint = lastSync && localJobs.length > 0
                    ? `/api/jobs?since=${lastSync}`
                    : '/api/jobs';

                const data = await apiRequest(endpoint);

                if (data?.jobs) {
                    // 3. Merge local and cloud
                    const cloudJobs: JobLog[] = data.jobs;
                    const merged = mergeJobs(localJobs, cloudJobs);

                    setJobLogs(merged);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

                    // 4. Find local-only jobs that need to sync
                    const cloudIds = new Set(cloudJobs.map(j => j.id));
                    const localOnlyJobs = merged.filter(j =>
                        !cloudIds.has(j.id) || j.syncStatus === 'pending'
                    );

                    if (localOnlyJobs.length > 0 && !hasSyncedRef.current) {
                        console.log(`Syncing ${localOnlyJobs.length} local-only jobs to cloud...`);
                        await apiRequest('/api/jobs/sync', {
                            method: 'POST',
                            body: JSON.stringify({
                                jobs: localOnlyJobs,
                                deviceId: getDeviceId()
                            }),
                        });

                        // Mark as synced
                        const synced = merged.map(j => ({
                            ...j,
                            syncStatus: 'synced' as const,
                            syncedAt: Date.now()
                        }));
                        setJobLogs(synced);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
                    }

                    hasSyncedRef.current = true;
                    // Store serverTime for more accurate sync tracking
                    const serverTime = data.serverTime || Date.now();
                    updateSyncState({
                        lastCloudSync: serverTime,
                        pendingCount: 0
                    });
                    setSyncStatus('synced');
                } else {
                    // Cloud returned nothing, use local
                    setSyncStatus(localJobs.length > 0 ? 'pending' : 'synced');
                }
            } catch (e) {
                console.error('Failed to sync with cloud:', e);
                setSyncStatus(isOnline() ? 'error' : 'offline');
            }

            setLoading(false);
        };

        loadJobs();

        // Process any queued operations
        processSyncQueue();

        // Set up connectivity listener
        const cleanup = setupConnectivityListeners(
            () => {
                // Online - process queue
                setSyncStatus('syncing');
                processSyncQueue();
            },
            () => {
                // Offline
                setSyncStatus('offline');
            }
        );

        return cleanup;
    }, [mergeJobs, processSyncQueue]);

    // Save to localStorage (for cache) and cloud (for sync)
    const saveJob = useCallback(async (job: JobLog, isNew: boolean = false): Promise<boolean> => {
        // Add sync metadata
        const jobWithMeta: JobLog = {
            ...job,
            updatedAt: Date.now(),
            deviceId: getDeviceId(),
            syncStatus: 'pending',
        };

        // Always save to localStorage as cache
        const current = getJobLogsFromStorage();
        const exists = current.findIndex(j => j.id === job.id);
        if (exists >= 0) {
            current[exists] = jobWithMeta;
        } else {
            current.unshift(jobWithMeta);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        updateSyncState({ lastLocalModified: Date.now() });

        // Save to cloud if authenticated and online
        const token = getAuthToken();
        if (token && isOnline()) {
            try {
                await apiRequest('/api/jobs', {
                    method: 'POST',
                    body: JSON.stringify(jobWithMeta),
                });
                // Mark as synced
                const synced = current.map(j =>
                    j.id === job.id ? { ...j, syncStatus: 'synced' as const, syncedAt: Date.now() } : j
                );
                localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
                updateSyncState({ lastCloudSync: Date.now() });
                setSyncStatus('synced');
            } catch (e) {
                console.error('Failed to sync job to cloud, queuing for retry:', e);
                // Queue for later sync
                addToQueue({
                    id: job.id,
                    type: isNew ? 'create' : 'update',
                    entityType: 'job',
                    data: jobWithMeta as unknown as Record<string, unknown>,
                    timestamp: Date.now(),
                });
                setSyncStatus('pending');
            }
        } else if (token) {
            // Offline - queue for later
            addToQueue({
                id: job.id,
                type: isNew ? 'create' : 'update',
                entityType: 'job',
                data: jobWithMeta as unknown as Record<string, unknown>,
                timestamp: Date.now(),
            });
            setSyncStatus('offline');
        }

        return true;
    }, []);

    const addJobLog = useCallback((log: Omit<JobLog, 'id' | 'createdAt'>): JobLog => {
        const newLog: JobLog = {
            ...log,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            deviceId: getDeviceId(),
            syncStatus: 'pending',
        };

        setJobLogs(prev => [newLog, ...prev]);
        saveJob(newLog, true);

        return newLog;
    }, [saveJob]);

    const deleteJobLog = useCallback(async (id: string) => {
        // Save original job before deletion (for potential rollback)
        const originalJobs = getJobLogsFromStorage();
        const deletedJob = originalJobs.find(j => j.id === id);

        // Optimistic update - remove immediately
        setJobLogs(prev => prev.filter(log => log.id !== id));

        // Remove from localStorage
        const updated = originalJobs.filter(j => j.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        updateSyncState({ lastLocalModified: Date.now() });

        // Rollback function
        const rollback = () => {
            if (deletedJob) {
                const current = getJobLogsFromStorage();
                current.unshift(deletedJob);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
                setJobLogs(prev => [deletedJob, ...prev]);
            }
        };

        // Delete from cloud
        const token = getAuthToken();
        if (token && isOnline()) {
            try {
                await apiRequest(`/api/jobs/${id}`, { method: 'DELETE' });
                // Emit success event
                syncEvents.success('job', id, 'delete', 'Job deleted');
            } catch (e) {
                console.error('Failed to delete job from cloud, queuing for retry:', e);
                // Queue for later, don't rollback yet - let SW handle it
                addToQueue({
                    id,
                    type: 'delete',
                    entityType: 'job',
                    data: { id, _rollbackData: deletedJob },
                    timestamp: Date.now(),
                });
                setSyncStatus('pending');
                // Emit error event with rollback action
                syncEvents.error('job', id, 'delete', 'Failed to delete, queued for retry', { rollback });
            }
        } else if (token) {
            // Offline - queue for later
            addToQueue({
                id,
                type: 'delete',
                entityType: 'job',
                data: { id, _rollbackData: deletedJob },
                timestamp: Date.now(),
            });
            setSyncStatus('offline');
            syncEvents.offline('job', id, 'delete');
        }
    }, []);

    const updateJobLog = useCallback((id: string, updates: Partial<Omit<JobLog, 'id' | 'createdAt'>>) => {
        setJobLogs(prev => {
            const updated = prev.map(log =>
                log.id === id
                    ? {
                        ...log,
                        ...updates,
                        updatedAt: Date.now(),
                        syncStatus: 'pending' as const
                    }
                    : log
            );

            // Find the updated job and save it
            const updatedJob = updated.find(j => j.id === id);
            if (updatedJob) {
                saveJob(updatedJob, false);
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
        syncStatus,
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
