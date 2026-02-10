'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { addChecksum, findCorruptedItems } from './checksum';
import { getUserScopedKey, getCurrentUserId } from './sync/syncUtils';
import { appendFleetTimelineEvent } from './fleetOpsTimeline';

// API base URL - use environment variable or default to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

export interface JobLog {
    id: string;
    vehicle: string;
    fccId?: string;
    keyType?: string;
    keysMade?: number;
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
    companyName?: string;   // Dispatch company/branch label
    fleetId?: string;       // ID of the associated fleet account

    // Technician assignment
    technicianId?: string;  // ID of the technician who handled this job
    technicianName?: string; // Denormalized for display

    // Dispatch workflow status
    status:
    | 'unassigned'
    | 'claimed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'pending'
    | 'appointment'
    | 'accepted'
    | 'on_hold'
    | 'closed'
    | 'pending_close'
    | 'pending_cancel'
    | 'estimate'
    | 'follow_up';

    // Dispatch timestamps (for aging calculations)
    claimedAt?: number;      // When tech claimed/was assigned
    startedAt?: number;      // When work began (in_progress)
    completedAt?: number;    // When job finished

    // Legacy time fields (deprecated, use timestamps above)
    startTime?: string;
    endTime?: string;
    laborMinutes?: number;

    // Priority for dispatch queue
    priority?: 'normal' | 'high' | 'urgent';

    // Job source tracking
    source?: 'pipeline' | 'call_center' | 'walk_in' | 'csv_import' | 'manual';

    // Cost tracking
    partsCost?: number;
    keyCost?: number;     // Cost of key/fob itself (from AKS pricing)
    serviceCost?: number; // Labor/service charge
    milesDriven?: number; // Miles driven for gas calculation
    gasCost?: number;     // Auto-calculated from miles (3.5$/gal at 30mpg)

    // Additional details
    referralSource?: 'google' | 'yelp' | 'referral' | 'repeat' | 'other';
    toolId?: string;               // Owned tool ID used on this job
    toolUsed?: string;             // Human-readable tool name
    toolCapabilityNote?: string;   // Field note attached when verifying capability

    // Sync metadata
    updatedAt?: number;       // Timestamp of last modification
    syncedAt?: number;        // When it was last synced to cloud
    syncStatus?: 'pending' | 'synced' | 'conflict';  // Current sync state
    deviceId?: string;        // Origin device for conflict resolution
    _checksum?: string;       // Data integrity verification
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
const JOBS_UPDATED_EVENT = 'eurokeys:jobs-updated';

function parseStoredJobs(raw: string | null): JobLog[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function mergeJobArrays(...jobGroups: JobLog[][]): JobLog[] {
    const merged = new Map<string, JobLog>();

    for (const group of jobGroups) {
        for (const job of group) {
            if (!job || !job.id) continue;
            const existing = merged.get(job.id);
            if (!existing) {
                merged.set(job.id, job);
                continue;
            }

            const existingTs = existing.updatedAt || existing.createdAt || 0;
            const candidateTs = job.updatedAt || job.createdAt || 0;
            if (candidateTs >= existingTs) {
                merged.set(job.id, job);
            }
        }
    }

    return Array.from(merged.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function getJobStorageKeys(): string[] {
    const scopedKey = getUserScopedKey(STORAGE_KEY);
    if (!scopedKey || scopedKey === STORAGE_KEY) {
        return [STORAGE_KEY];
    }
    return [STORAGE_KEY, scopedKey];
}

function readMergedJobsFromStorage(): JobLog[] {
    if (typeof window === 'undefined') return [];
    const [legacyKey, scopedKey] = getJobStorageKeys();
    const legacyJobs = parseStoredJobs(localStorage.getItem(legacyKey));
    const scopedJobs = scopedKey ? parseStoredJobs(localStorage.getItem(scopedKey)) : [];
    return mergeJobArrays(legacyJobs, scopedJobs);
}

function writeJobsToStorage(jobs: JobLog[]): void {
    if (typeof window === 'undefined') return;
    const serialized = JSON.stringify(jobs);
    const keys = getJobStorageKeys();
    keys.forEach(key => localStorage.setItem(key, serialized));
}

function clearJobsFromStorage(): void {
    if (typeof window === 'undefined') return;
    const keys = getJobStorageKeys();
    keys.forEach(key => localStorage.removeItem(key));
}

function emitJobsUpdatedEvent() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(JOBS_UPDATED_EVENT));
}

function generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('session_token') || localStorage.getItem('auth_token');
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

// Conflict item for resolution UI
export interface ConflictItem {
    id: string;
    local: JobLog;
    cloud: JobLog;
}

interface JobTimelineEvent {
    eventType: string;
    status?: string;
    details: string;
    payload: Record<string, unknown>;
    companyName?: string;
    technicianId?: string;
    technicianName?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
}

export function useJobLogs() {
    const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
    const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
    const hasSyncedRef = useRef(false);
    const isSyncingRef = useRef(false);

    // Normalize job to ensure required fields exist (defensive against malformed cloud data)
    const normalizeJob = useCallback((job: Partial<JobLog>): JobLog => {
        // Ensure date is Safari-safe YYYY-MM-DD format
        let safeDate = new Date().toISOString().split('T')[0];
        if (job.date) {
            try {
                const parsed = new Date(job.date);
                if (!isNaN(parsed.getTime())) {
                    safeDate = parsed.toISOString().split('T')[0];
                }
            } catch { /* use default */ }
        }

        return {
            id: job.id || generateId(),
            vehicle: job.vehicle || '',
            jobType: job.jobType || 'other',
            price: typeof job.price === 'number' ? job.price : 0,
            keysMade: typeof job.keysMade === 'number' && Number.isFinite(job.keysMade) && job.keysMade > 0
                ? Math.max(1, Math.round(job.keysMade))
                : undefined,
            createdAt: job.createdAt || Date.now(),
            status: ([
                'unassigned',
                'claimed',
                'in_progress',
                'completed',
                'cancelled',
                'pending',
                'appointment',
                'accepted',
                'on_hold',
                'closed',
                'pending_close',
                'pending_cancel',
                'estimate',
                'follow_up'
            ].includes(job.status as string)
                ? job.status
                : 'completed') as JobLog['status'],
            ...job,
            date: safeDate, // override after spread to ensure Safari-safe date
        } as JobLog;
    }, []);

    // Merge local and cloud jobs using timestamps, detecting conflicts
    const mergeJobs = useCallback((local: JobLog[], cloud: JobLog[]): JobLog[] => {
        const merged = new Map<string, JobLog>();
        const detectedConflicts: ConflictItem[] = [];

        // Start with cloud jobs (normalize to ensure required fields)
        cloud.forEach(job => {
            const normalized = normalizeJob(job);
            merged.set(normalized.id, { ...normalized, syncStatus: 'synced' as const });
        });

        // Merge in local jobs, detect conflicts
        local.forEach(localJob => {
            const cloudJob = merged.get(localJob.id);
            if (!cloudJob) {
                // Local-only job, needs to sync
                merged.set(localJob.id, { ...localJob, syncStatus: 'pending' as const });
            } else {
                // Both exist - check for conflict
                const localTime = localJob.updatedAt || localJob.createdAt || 0;
                const cloudTime = cloudJob.updatedAt || cloudJob.createdAt || 0;
                const localDevice = localJob.deviceId;
                const cloudDevice = cloudJob.deviceId;

                // Conflict: different devices modified within 5 minutes of each other
                const timeDiff = Math.abs(localTime - cloudTime);
                const isConflict = localDevice !== cloudDevice &&
                    timeDiff < 5 * 60 * 1000 && // 5 minutes
                    timeDiff > 0; // Both were modified

                if (isConflict) {
                    // Flag as conflict for manual resolution
                    merged.set(localJob.id, { ...localJob, syncStatus: 'conflict' as const });
                    detectedConflicts.push({
                        id: localJob.id,
                        local: localJob,
                        cloud: cloudJob
                    });
                } else if (localTime > cloudTime) {
                    // Local is newer
                    merged.set(localJob.id, { ...localJob, syncStatus: 'pending' as const });
                }
                // else cloud wins (already in merged)
            }
        });

        // Store conflicts for UI
        if (detectedConflicts.length > 0) {
            setConflicts(prev => {
                // Merge with existing conflicts, avoiding duplicates
                const existing = new Set(prev.map(c => c.id));
                const newConflicts = detectedConflicts.filter(c => !existing.has(c.id));
                return [...prev, ...newConflicts];
            });
        }

        // Sort by createdAt descending
        return Array.from(merged.values()).sort((a, b) =>
            (b.createdAt || 0) - (a.createdAt || 0)
        );
    }, [normalizeJob]);

    // Resolve conflicts based on user choices
    const resolveConflicts = useCallback(async (
        resolutions: { id: string; choice: 'local' | 'cloud' | 'merge' }[]
    ) => {
        const resolved: JobLog[] = [];

        for (const { id, choice } of resolutions) {
            const conflict = conflicts.find(c => c.id === id);
            if (!conflict) continue;

            if (choice === 'local') {
                // Keep local, push to cloud
                resolved.push({ ...conflict.local, syncStatus: 'pending' as const });
            } else if (choice === 'cloud') {
                // Keep cloud version
                resolved.push({ ...conflict.cloud, syncStatus: 'synced' as const });
            } else if (choice === 'merge') {
                // Keep both - create a duplicate of local with new ID
                const localCopy = {
                    ...conflict.local,
                    id: generateId(),
                    syncStatus: 'pending' as const,
                };
                resolved.push({ ...conflict.cloud, syncStatus: 'synced' as const });
                resolved.push(localCopy);
            }
        }

        // Update state
        setJobLogs(prev => {
            const updated = prev.filter(j => !resolutions.some(r => r.id === j.id));
            return [...resolved, ...updated].sort((a, b) =>
                (b.createdAt || 0) - (a.createdAt || 0)
            );
        });

        // Clear resolved conflicts
        setConflicts(prev => prev.filter(c => !resolutions.some(r => r.id === c.id)));

        // Persist and sync
        const allJobs = getJobLogsFromStorage();
        const updated = allJobs.filter(j => !resolutions.some(r => r.id === j.id));
        const final = [...resolved, ...updated];
        writeJobsToStorage(final);
        emitJobsUpdatedEvent();

        // Sync pending ones to cloud
        const pending = resolved.filter(j => j.syncStatus === 'pending');
        if (pending.length > 0 && isOnline()) {
            try {
                await apiRequest('/api/jobs/sync', {
                    method: 'POST',
                    body: JSON.stringify({ jobs: pending, deviceId: getDeviceId() }),
                });
            } catch (e) {
                console.error('Failed to sync resolved conflicts:', e);
            }
        }
    }, [conflicts]);

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

    const filterValidJobs = useCallback((jobs: JobLog[]): JobLog[] => {
        const validJobTypes = ['add_key', 'akl', 'remote', 'blade', 'rekey', 'lockout', 'safe', 'other'];
        return jobs.filter(j => {
            // Basic structural checks
            if (!j || !j.id) return false;
            if (typeof j.vehicle !== 'string' || j.vehicle.trim() === '' || j.vehicle === 'null') return false;
            if (typeof j.jobType !== 'string' || (j.jobType as string) === 'null' || !validJobTypes.includes(j.jobType)) return false;

            // Date validation - filter out jobs with unparseable dates
            if (!j.date || j.date === 'null' || j.date === 'undefined') return false;
            try {
                const d = new Date(j.date);
                if (isNaN(d.getTime())) return false;
            } catch {
                return false;
            }

            return true;
        });
    }, []);

    // Keep multiple hook instances in sync (e.g., Chat widget + Jobs page).
    const refreshFromLocalStorage = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            const merged = readMergedJobsFromStorage();
            if (merged.length === 0) {
                setJobLogs([]);
                return;
            }
            const valid = filterValidJobs(merged);
            setJobLogs(valid);
        } catch (e) {
            console.error('Failed to refresh local jobs:', e);
        }
    }, [filterValidJobs]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleJobsUpdated = () => {
            refreshFromLocalStorage();
        };

        const storageKeys = new Set(getJobStorageKeys());
        const handleStorage = (event: StorageEvent) => {
            if (event.key && storageKeys.has(event.key)) {
                refreshFromLocalStorage();
            }
        };

        window.addEventListener(JOBS_UPDATED_EVENT, handleJobsUpdated);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener(JOBS_UPDATED_EVENT, handleJobsUpdated);
            window.removeEventListener('storage', handleStorage);
        };
    }, [refreshFromLocalStorage]);

    // Bidirectional sync: load from both local and cloud, merge, then push local-only to cloud
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadJobs = async () => {
            setSyncStatus('syncing');

            // 1. Load local jobs first (instant UI)
            let localJobs: JobLog[] = [];
            try {
                localJobs = filterValidJobs(readMergedJobsFromStorage());
                if (localJobs.length > 0) setJobLogs(localJobs);
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
                    // 3. Merge local and cloud, filtering out malformed entries
                    const cloudJobs: JobLog[] = filterValidJobs(data.jobs);
                    const merged = filterValidJobs(mergeJobs(localJobs, cloudJobs));

                    setJobLogs(merged);
                    writeJobsToStorage(merged);
                    emitJobsUpdatedEvent();

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
                        writeJobsToStorage(synced);
                        emitJobsUpdatedEvent();
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

        // Visibility change handler - re-sync when returning to tab
        // This ensures cross-device consistency when user switches back from another device/tab
        // Throttle to prevent sync storms (especially on mobile Safari where focus fires frequently)
        let lastSyncAttempt = 0;
        const SYNC_THROTTLE_MS = 30_000; // 30 seconds minimum between re-syncs

        const handleVisibilityChange = () => {
            const now = Date.now();
            if (document.visibilityState === 'visible' && getAuthToken() && isOnline() && (now - lastSyncAttempt) > SYNC_THROTTLE_MS) {
                console.log('[Sync] Tab became visible - checking for cloud updates...');
                lastSyncAttempt = now;
                // Reset hasSyncedRef to force a full fetch (not delta) on visibility change
                // This ensures we get all latest data from other devices
                hasSyncedRef.current = false;
                loadJobs();
            }
        };

        // Focus handler as backup for mobile browsers
        const handleFocus = () => {
            const now = Date.now();
            if (getAuthToken() && isOnline() && (now - lastSyncAttempt) > SYNC_THROTTLE_MS) {
                console.log('[Sync] Window focused - checking for cloud updates...');
                lastSyncAttempt = now;
                hasSyncedRef.current = false;
                loadJobs();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            cleanup();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [mergeJobs, processSyncQueue, filterValidJobs]);

    // Save to localStorage (for cache) and cloud (for sync)
    const saveJob = useCallback(async (job: JobLog, isNew: boolean = false): Promise<boolean> => {
        // Add sync metadata
        const jobWithMeta: JobLog = {
            ...job,
            updatedAt: Date.now(),
            deviceId: getDeviceId(),
            syncStatus: 'pending',
        };

        // Add checksum for integrity verification
        const jobWithChecksum = addChecksum(jobWithMeta as unknown as Record<string, unknown>) as unknown as JobLog;

        // Always save to localStorage as cache
        const current = getJobLogsFromStorage();
        const exists = current.findIndex(j => j.id === job.id);
        if (exists >= 0) {
            current[exists] = jobWithChecksum;
        } else {
            current.unshift(jobWithChecksum);
        }
        writeJobsToStorage(current);
        emitJobsUpdatedEvent();
        updateSyncState({ lastLocalModified: Date.now() });

        // Save to cloud if authenticated and online
        const token = getAuthToken();
        if (token && isOnline()) {
            try {
                await apiRequest('/api/jobs', {
                    method: 'POST',
                    body: JSON.stringify(jobWithChecksum),
                });
                // Mark as synced
                const synced = current.map(j =>
                    j.id === job.id ? { ...j, syncStatus: 'synced' as const, syncedAt: Date.now() } : j
                );
                writeJobsToStorage(synced);
                emitJobsUpdatedEvent();
                updateSyncState({ lastCloudSync: Date.now() });
                setSyncStatus('synced');
            } catch (e) {
                console.error('Failed to sync job to cloud, queuing for retry:', e);
                // Queue for later sync
                addToQueue({
                    id: job.id,
                    type: isNew ? 'create' : 'update',
                    entityType: 'job',
                    data: jobWithChecksum as unknown as Record<string, unknown>,
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
                data: jobWithChecksum as unknown as Record<string, unknown>,
                timestamp: Date.now(),
            });
            setSyncStatus('offline');
        }

        return true;
    }, []);

    const addJobLog = useCallback((log: Omit<JobLog, 'id' | 'createdAt'>): JobLog => {
        // Validation: require valid jobType and vehicle
        const validJobTypes = ['add_key', 'akl', 'remote', 'blade', 'rekey', 'lockout', 'safe', 'other'];
        if (!log.jobType || !validJobTypes.includes(log.jobType)) {
            console.warn('[JobLog] Invalid jobType, defaulting to other:', log.jobType);
            log = { ...log, jobType: 'other' };
        }
        if (!log.vehicle || log.vehicle.trim() === '') {
            console.warn('[JobLog] Missing vehicle, using Unknown');
            log = { ...log, vehicle: 'Unknown' };
        }

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

        // Append immutable timeline event for fleet ops visibility.
        appendFleetTimelineEvent({
            eventType: 'job_created',
            eventSource: 'system',
            jobId: newLog.id,
            status: newLog.status,
            companyName: newLog.companyName || newLog.fleetId || undefined,
            technicianId: newLog.technicianId,
            technicianName: newLog.technicianName,
            customerName: newLog.customerName,
            customerPhone: newLog.customerPhone,
            customerAddress: newLog.customerAddress,
            details: `${newLog.jobType.replace('_', ' ')} job created`,
            occurredAt: newLog.updatedAt || Date.now(),
            payload: {
                vehicle: newLog.vehicle,
                price: newLog.price,
                source: newLog.source,
            },
        }).catch(() => {
            // Timeline logging is best-effort; never block local dispatch flow.
        });

        return newLog;
    }, [saveJob]);

    const deleteJobLog = useCallback(async (id: string) => {
        // Save original job before deletion (for potential rollback)
        const originalJobs = getJobLogsFromStorage();
        const deletedJob = originalJobs.find(j => j.id === id);

        // Optimistic update - remove immediately
        setJobLogs(prev => prev.filter(log => log.id !== id));

        if (deletedJob) {
            appendFleetTimelineEvent({
                eventType: 'job_deleted',
                eventSource: 'system',
                jobId: deletedJob.id,
                status: deletedJob.status,
                companyName: deletedJob.companyName || deletedJob.fleetId || undefined,
                technicianId: deletedJob.technicianId,
                technicianName: deletedJob.technicianName,
                customerName: deletedJob.customerName,
                customerPhone: deletedJob.customerPhone,
                customerAddress: deletedJob.customerAddress,
                details: 'Job deleted',
                occurredAt: Date.now(),
                payload: {
                    vehicle: deletedJob.vehicle,
                    source: deletedJob.source,
                },
            }).catch(() => { });
        }

        // Remove from localStorage
        const updated = originalJobs.filter(j => j.id !== id);
        writeJobsToStorage(updated);
        emitJobsUpdatedEvent();
        updateSyncState({ lastLocalModified: Date.now() });

        // Rollback function
        const rollback = () => {
            if (deletedJob) {
                const current = getJobLogsFromStorage();
                current.unshift(deletedJob);
                writeJobsToStorage(current);
                emitJobsUpdatedEvent();
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
        let timelineEvent: JobTimelineEvent | null = null;

        setJobLogs(prev => {
            const original = prev.find(log => log.id === id);
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

                if (original) {
                    const statusChanged = typeof updates.status === 'string' && updates.status !== original.status;
                    const technicianChanged = typeof updates.technicianId === 'string' && updates.technicianId !== original.technicianId;

                    if (statusChanged) {
                        timelineEvent = {
                            eventType: 'status_changed',
                            status: updatedJob.status,
                            details: `Status changed from ${original.status} to ${updatedJob.status}`,
                            companyName: updatedJob.companyName || updatedJob.fleetId,
                            technicianId: updatedJob.technicianId,
                            technicianName: updatedJob.technicianName,
                            customerName: updatedJob.customerName,
                            customerPhone: updatedJob.customerPhone,
                            customerAddress: updatedJob.customerAddress,
                            payload: {
                                previousStatus: original.status,
                                nextStatus: updatedJob.status,
                                source: updatedJob.source,
                            },
                        };
                    } else if (technicianChanged) {
                        timelineEvent = {
                            eventType: 'technician_assigned',
                            status: updatedJob.status,
                            details: `Technician assigned: ${updatedJob.technicianName || updatedJob.technicianId || 'Unknown'}`,
                            companyName: updatedJob.companyName || updatedJob.fleetId,
                            technicianId: updatedJob.technicianId,
                            technicianName: updatedJob.technicianName,
                            customerName: updatedJob.customerName,
                            customerPhone: updatedJob.customerPhone,
                            customerAddress: updatedJob.customerAddress,
                            payload: {
                                previousTechnicianId: original.technicianId || null,
                                nextTechnicianId: updatedJob.technicianId || null,
                                source: updatedJob.source,
                            },
                        };
                    }
                }
            }

            return updated;
        });

        const eventToAppend = timelineEvent as JobTimelineEvent | null;
        if (eventToAppend) {
            const now = Date.now();
            appendFleetTimelineEvent({
                eventType: eventToAppend.eventType,
                eventSource: 'system',
                jobId: id,
                status: eventToAppend.status,
                companyName: eventToAppend.companyName,
                technicianId: eventToAppend.technicianId,
                technicianName: eventToAppend.technicianName,
                customerName: eventToAppend.customerName,
                customerPhone: eventToAppend.customerPhone,
                customerAddress: eventToAppend.customerAddress,
                details: eventToAppend.details,
                occurredAt: now,
                payload: eventToAppend.payload,
            }).catch(() => { });
        }
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
            // Job type breakdown - guard against null/undefined jobType
            const jt = log.jobType as string;
            if (jt && typeof jt === 'string' && jt !== 'null' && jt !== 'undefined') {
                if (!jobsByType[jt]) {
                    jobsByType[jt] = { count: 0, revenue: 0 };
                }
                jobsByType[jt].count++;
                jobsByType[jt].revenue += (log.price || 0);
            }

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
            if (
                log.status === 'pending' ||
                log.status === 'in_progress' ||
                log.status === 'unassigned' ||
                log.status === 'claimed' ||
                log.status === 'appointment' ||
                log.status === 'accepted' ||
                log.status === 'on_hold' ||
                log.status === 'pending_close' ||
                log.status === 'pending_cancel' ||
                log.status === 'estimate' ||
                log.status === 'follow_up'
            ) {
                pendingJobs++;
            } else if (log.status === 'completed' || log.status === 'closed') {
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

    // Force full sync - clears sync state and pushes ALL local jobs to cloud
    const forceFullSync = useCallback(async (): Promise<{ success: boolean; synced: number; error?: string }> => {
        const token = getAuthToken();
        if (!token) {
            return { success: false, synced: 0, error: 'Not authenticated' };
        }

        setSyncStatus('syncing');

        try {
            // Clear sync state to treat this as a fresh sync
            updateSyncState({ lastCloudSync: 0, pendingCount: 0 });
            hasSyncedRef.current = false;

            // Get all local jobs
            const localJobs = getJobLogsFromStorage();

            if (localJobs.length === 0) {
                // No local data to sync, just fetch from cloud
                const data = await apiRequest('/api/jobs');
                if (data?.jobs) {
                    setJobLogs(data.jobs);
                    writeJobsToStorage(data.jobs);
                    emitJobsUpdatedEvent();
                    updateSyncState({ lastCloudSync: data.serverTime || Date.now() });
                }
                setSyncStatus('synced');
                return { success: true, synced: 0 };
            }

            // Push ALL local jobs to cloud (force sync)
            console.log(`[ForceSync] Pushing ${localJobs.length} jobs to cloud...`);
            const result = await apiRequest('/api/jobs/sync', {
                method: 'POST',
                body: JSON.stringify({
                    jobs: localJobs,
                    deviceId: getDeviceId(),
                    forceSync: true
                }),
            });

            if (!result?.success) {
                throw new Error(result?.error || 'Sync failed');
            }

            // Mark all as synced
            const synced = localJobs.map(j => ({
                ...j,
                syncStatus: 'synced' as const,
                syncedAt: Date.now()
            }));
            setJobLogs(synced);
            writeJobsToStorage(synced);
            emitJobsUpdatedEvent();

            // Update sync state
            updateSyncState({
                lastCloudSync: result.serverTime || Date.now(),
                pendingCount: 0
            });
            hasSyncedRef.current = true;
            setSyncStatus('synced');

            console.log(`[ForceSync] Successfully synced ${result.synced} jobs`);
            return { success: true, synced: result.synced };
        } catch (e) {
            console.error('[ForceSync] Failed:', e);
            setSyncStatus('error');
            return {
                success: false,
                synced: 0,
                error: e instanceof Error ? e.message : 'Unknown error'
            };
        }
    }, []);

    // Clear local cache and fetch fresh from cloud
    // This is useful when localStorage has stale/corrupt data
    const clearLocalCache = useCallback(async (): Promise<{ success: boolean; loaded: number; error?: string }> => {
        const token = getAuthToken();
        if (!token) {
            return { success: false, loaded: 0, error: 'Not authenticated' };
        }

        setSyncStatus('syncing');

        try {
            console.log('[ClearCache] Clearing local job data and fetching fresh from cloud...');

            // Clear localStorage job data
            clearJobsFromStorage();
            emitJobsUpdatedEvent();

            // Clear any pending sync queue items for jobs
            const queue = getQueue();
            queue.filter(op => op.entityType === 'job').forEach(op => {
                removeFromQueue(op.id, 'job');
            });

            // Reset sync state
            updateSyncState({ lastCloudSync: 0, pendingCount: 0 });
            hasSyncedRef.current = false;

            // Fetch fresh from cloud
            const data = await apiRequest('/api/jobs');

            if (data?.jobs) {
                // Filter out any malformed jobs from cloud
                const validJobs = data.jobs.filter((j: JobLog) =>
                    j.id && j.vehicle && j.jobType && String(j.jobType) !== 'null'
                );

                setJobLogs(validJobs);
                writeJobsToStorage(validJobs);
                emitJobsUpdatedEvent();

                updateSyncState({ lastCloudSync: data.serverTime || Date.now() });
                hasSyncedRef.current = true;
                setSyncStatus('synced');

                console.log(`[ClearCache] Loaded ${validJobs.length} valid jobs from cloud`);
                return { success: true, loaded: validJobs.length };
            } else {
                setJobLogs([]);
                setSyncStatus('synced');
                return { success: true, loaded: 0 };
            }
        } catch (e) {
            console.error('[ClearCache] Failed:', e);
            setSyncStatus('error');
            return {
                success: false,
                loaded: 0,
                error: e instanceof Error ? e.message : 'Unknown error'
            };
        }
    }, []);

    return {
        jobLogs,
        loading,
        syncStatus,
        conflicts,
        addJobLog,
        updateJobLog,
        deleteJobLog,
        resolveConflicts,
        getJobStats,
        getRecentCustomers,
        forceFullSync,
        clearLocalCache,
    };
}

// Standalone functions for use outside React components (GoalContext)
export function getJobLogsFromStorage(): JobLog[] {
    if (typeof window === 'undefined') return [];
    return readMergedJobsFromStorage();
}

export function addJobLogToStorage(log: Omit<JobLog, 'id' | 'createdAt'>): JobLog {
    const newLog: JobLog = {
        ...log,
        id: generateId(),
        createdAt: Date.now(),
    };
    const logs = readMergedJobsFromStorage();
    logs.unshift(newLog);
    writeJobsToStorage(logs);
    return newLog;
}
