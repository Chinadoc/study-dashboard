'use client';

import React, { useState, useCallback } from 'react';
import { API_BASE } from './config';

// ============================================================================
// Force Sync All Data
// This utility forces all local data to sync to the cloud, useful when
// previous sync attempts failed (e.g., due to schema mismatches).
// ============================================================================

interface SyncResult {
    dataType: string;
    success: boolean;
    synced: number;
    error?: string;
}

// Storage keys for each data type
const STORAGE_KEYS = {
    jobs: 'eurokeys_job_logs',
    leads: 'eurokeys_pipeline_leads',
    invoices: 'eurokeys_invoices',
    inventory: 'eurokeys_inventory',
    technicians: 'eurokeys_technicians',
    fleets: 'eurokeys_fleet_customers',
} as const;

function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('session_token') || localStorage.getItem('auth_token');
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`API error ${res.status}:`, text);
            throw new Error(`API error: ${res.status}`);
        }

        return res.json();
    } catch (e) {
        console.error('API request failed:', e);
        throw e;
    }
}

// Sync jobs to cloud
async function syncJobs(): Promise<SyncResult> {
    const dataType = 'jobs';
    try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.jobs) || '[]');
        if (local.length === 0) return { dataType, success: true, synced: 0 };

        // Filter to only actual jobs (not inventory items that were incorrectly stored)
        const actualJobs = local.filter((item: any) => item.jobType || item.status);

        if (actualJobs.length === 0) return { dataType, success: true, synced: 0 };

        console.log(`[ForceSync] Syncing ${actualJobs.length} jobs...`);
        const result = await apiRequest('/api/jobs/sync', {
            method: 'POST',
            body: JSON.stringify({
                jobs: actualJobs,
                deviceId: localStorage.getItem('eurokeys_device_id') || 'unknown',
                forceSync: true
            }),
        });

        if (result?.success) {
            // Mark as synced
            const synced = actualJobs.map((j: any) => ({ ...j, syncStatus: 'synced', syncedAt: Date.now() }));
            localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(synced));
            return { dataType, success: true, synced: result.synced };
        }
        return { dataType, success: false, synced: 0, error: result?.error || 'Unknown error' };
    } catch (e) {
        return { dataType, success: false, synced: 0, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}

// Sync pipeline leads
async function syncLeads(): Promise<SyncResult> {
    const dataType = 'leads';
    try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.leads) || '[]');
        if (local.length === 0) return { dataType, success: true, synced: 0 };

        console.log(`[ForceSync] Syncing ${local.length} leads...`);
        let synced = 0;
        for (const lead of local) {
            const result = await apiRequest('/api/user/pipeline-leads', {
                method: 'POST',
                body: JSON.stringify(lead),
            });
            if (result) synced++;
        }
        return { dataType, success: true, synced };
    } catch (e) {
        return { dataType, success: false, synced: 0, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}

// Sync invoices
async function syncInvoices(): Promise<SyncResult> {
    const dataType = 'invoices';
    try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.invoices) || '[]');
        if (local.length === 0) return { dataType, success: true, synced: 0 };

        console.log(`[ForceSync] Syncing ${local.length} invoices...`);
        let synced = 0;
        for (const inv of local) {
            const result = await apiRequest('/api/user/invoices', {
                method: 'POST',
                body: JSON.stringify(inv),
            });
            if (result) synced++;
        }
        return { dataType, success: true, synced };
    } catch (e) {
        return { dataType, success: false, synced: 0, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}

// Sync technicians
async function syncTechnicians(): Promise<SyncResult> {
    const dataType = 'technicians';
    try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.technicians) || '[]');
        if (local.length === 0) return { dataType, success: true, synced: 0 };

        console.log(`[ForceSync] Syncing ${local.length} technicians...`);
        let synced = 0;
        for (const tech of local) {
            const result = await apiRequest('/api/user/technicians', {
                method: 'POST',
                body: JSON.stringify(tech),
            });
            if (result) synced++;
        }
        return { dataType, success: true, synced };
    } catch (e) {
        return { dataType, success: false, synced: 0, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}

// Sync fleet customers
async function syncFleets(): Promise<SyncResult> {
    const dataType = 'fleets';
    try {
        const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.fleets) || '[]');
        if (local.length === 0) return { dataType, success: true, synced: 0 };

        console.log(`[ForceSync] Syncing ${local.length} fleet customers...`);
        let synced = 0;
        for (const fleet of local) {
            const result = await apiRequest('/api/user/fleet-customers', {
                method: 'POST',
                body: JSON.stringify(fleet),
            });
            if (result) synced++;
        }
        return { dataType, success: true, synced };
    } catch (e) {
        return { dataType, success: false, synced: 0, error: e instanceof Error ? e.message : 'Unknown error' };
    }
}

// Main force sync function - syncs all data types
export async function forceFullSyncAll(): Promise<{
    success: boolean;
    results: SyncResult[];
    totalSynced: number;
}> {
    const token = getAuthToken();
    if (!token) {
        return {
            success: false,
            results: [{ dataType: 'auth', success: false, synced: 0, error: 'Not authenticated' }],
            totalSynced: 0
        };
    }

    console.log('[ForceSync] Starting full sync of all data...');

    const results = await Promise.all([
        syncJobs(),
        syncLeads(),
        syncInvoices(),
        syncTechnicians(),
        syncFleets(),
    ]);

    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    const allSuccess = results.every(r => r.success);

    console.log(`[ForceSync] Complete. Total synced: ${totalSynced}`);

    return {
        success: allSuccess,
        results,
        totalSynced
    };
}

// Get sync status summary (what data exists locally that might need syncing)
export function getSyncStatusSummary(): Record<string, number> {
    const summary: Record<string, number> = {};

    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
        try {
            const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
            summary[key] = Array.isArray(data) ? data.length : 0;
        } catch {
            summary[key] = 0;
        }
    }

    return summary;
}

// React hook for force sync with UI state
export function useForceSync() {
    const [syncing, setSyncing] = useState(false);
    const [results, setResults] = useState<SyncResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const syncAll = useCallback(async () => {
        setSyncing(true);
        setError(null);
        setResults(null);

        try {
            const result = await forceFullSyncAll();
            setResults(result.results);
            if (!result.success) {
                const errors = result.results.filter(r => !r.success).map(r => `${r.dataType}: ${r.error}`);
                setError(errors.join(', '));
            }
            return result;
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setError(msg);
            return { success: false, results: [], totalSynced: 0 };
        } finally {
            setSyncing(false);
        }
    }, []);

    return {
        syncing,
        results,
        error,
        syncAll,
        getSummary: getSyncStatusSummary,
    };
}
