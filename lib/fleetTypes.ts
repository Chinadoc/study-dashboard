'use client';

import { API_BASE } from './config';

/**
 * Fleet Management Types for Locksmith Business Platform
 * Tracks fleet accounts, vehicles, and links to jobs
 * Now with cloud sync support!
 */

export interface FleetVehicle {
    id: string;
    year: number;
    make: string;
    model: string;
    vin?: string;
    licensePlate?: string;
    notes?: string;
}

export interface FleetAccount {
    id: string;
    name: string;           // Company/fleet name
    contactName?: string;   // Primary contact person
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    vehicles: FleetVehicle[];
    createdAt: number;
    updatedAt?: number;
}

// ============================================================================
// Constants & Auth
// ============================================================================

const FLEETS_STORAGE_KEY = 'eurokeys_fleets';

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
            console.error(`API error ${res.status}:`, await res.text());
            return null;
        }

        return res.json();
    } catch (e) {
        console.error('API request failed:', e);
        return null;
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function generateFleetId(): string {
    return `fleet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateVehicleId(): string {
    return `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getFleetAccountsFromStorage(): FleetAccount[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(FLEETS_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveFleetAccountsToStorage(fleets: FleetAccount[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FLEETS_STORAGE_KEY, JSON.stringify(fleets));
}

export function saveFleetAccount(fleet: FleetAccount): FleetAccount {
    const fleets = getFleetAccountsFromStorage();
    const existingIndex = fleets.findIndex(f => f.id === fleet.id);

    if (existingIndex >= 0) {
        fleets[existingIndex] = { ...fleet, updatedAt: Date.now() };
    } else {
        fleets.unshift({ ...fleet, createdAt: Date.now() });
    }

    saveFleetAccountsToStorage(fleets);

    // Sync to cloud
    syncFleetToCloud(fleet);

    return fleet;
}

export function deleteFleetAccount(id: string) {
    const fleets = getFleetAccountsFromStorage();
    saveFleetAccountsToStorage(fleets.filter(f => f.id !== id));

    // Sync deletion to cloud
    deleteFleetFromCloud(id);
}

/**
 * Find fleet account by customer name (case-insensitive partial match)
 */
export function getFleetByCustomerName(customerName: string): FleetAccount | undefined {
    if (!customerName) return undefined;
    const fleets = getFleetAccountsFromStorage();
    const lowerName = customerName.toLowerCase();
    return fleets.find(f =>
        f.name.toLowerCase().includes(lowerName) ||
        lowerName.includes(f.name.toLowerCase())
    );
}

/**
 * Suggest fleet accounts based on repeat customers in job logs
 * Returns customers with 3+ jobs that aren't already fleet accounts
 */
export function suggestFleetAccounts(
    jobs: Array<{ customerName?: string; customerPhone?: string; customerEmail?: string }>
): Array<{ name: string; jobCount: number; phone?: string; email?: string }> {
    const customerCounts = new Map<string, { count: number; phone?: string; email?: string }>();
    const existingFleets = getFleetAccountsFromStorage();
    const existingNames = new Set(existingFleets.map(f => f.name.toLowerCase()));

    jobs.forEach(job => {
        if (!job.customerName || job.customerName.trim() === '') return;
        const name = job.customerName.trim();

        // Skip if already a fleet
        if (existingNames.has(name.toLowerCase())) return;

        const existing = customerCounts.get(name);
        if (existing) {
            existing.count++;
            if (job.customerPhone) existing.phone = job.customerPhone;
            if (job.customerEmail) existing.email = job.customerEmail;
        } else {
            customerCounts.set(name, {
                count: 1,
                phone: job.customerPhone,
                email: job.customerEmail
            });
        }
    });

    // Return customers with 3+ jobs
    return Array.from(customerCounts.entries())
        .filter(([_, data]) => data.count >= 3)
        .map(([name, data]) => ({ name, jobCount: data.count, phone: data.phone, email: data.email }))
        .sort((a, b) => b.jobCount - a.jobCount);
}

/**
 * Format vehicle display string
 */
export function formatVehicle(vehicle: FleetVehicle): string {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

// ============================================================================
// Cloud Sync Functions
// ============================================================================

/**
 * Sync a fleet account to the cloud
 */
async function syncFleetToCloud(fleet: FleetAccount): Promise<void> {
    if (!getAuthToken()) return;

    await apiRequest('/api/user/fleet-customers', {
        method: 'POST',
        body: JSON.stringify(fleet),
    });
}

/**
 * Delete a fleet account from the cloud
 */
async function deleteFleetFromCloud(id: string): Promise<void> {
    if (!getAuthToken()) return;

    await apiRequest(`/api/user/fleet-customers?id=${id}`, {
        method: 'DELETE',
    });
}

/**
 * Load fleet accounts from cloud (async)
 */
export async function loadFleetsFromCloud(): Promise<FleetAccount[] | null> {
    if (!getAuthToken()) return null;

    const data = await apiRequest('/api/user/fleet-customers');
    if (data?.fleets) {
        // Cache in localStorage
        saveFleetAccountsToStorage(data.fleets);
        return data.fleets;
    }
    return null;
}

/**
 * Initialize fleets - load from cloud if available, merge with localStorage
 */
export async function initFleets(): Promise<FleetAccount[]> {
    const localFleets = getFleetAccountsFromStorage();

    if (!getAuthToken()) return localFleets;

    const cloudData = await apiRequest('/api/user/fleet-customers');
    if (cloudData?.fleets) {
        const cloudIds = new Set(cloudData.fleets.map((f: FleetAccount) => f.id));
        const localOnly = localFleets.filter(f => !cloudIds.has(f.id));

        // Sync local-only to cloud
        if (localOnly.length > 0) {
            console.log(`[Sync] Syncing ${localOnly.length} local-only fleet accounts to cloud...`);
            for (const fleet of localOnly) {
                await apiRequest('/api/user/fleet-customers', {
                    method: 'POST',
                    body: JSON.stringify(fleet),
                });
            }
        }

        // Merge and return
        const merged = [...cloudData.fleets, ...localOnly];
        saveFleetAccountsToStorage(merged);
        return merged;
    }

    return localFleets;
}

/**
 * Setup visibility/focus sync handlers
 */
export function setupFleetSyncListeners(onUpdate: (fleets: FleetAccount[]) => void): () => void {
    if (typeof window === 'undefined') return () => { };

    const handleSync = async () => {
        if (!getAuthToken()) return;
        console.log('[Sync] Fleets: Checking for updates...');
        const fleets = await loadFleetsFromCloud();
        if (fleets) {
            onUpdate(fleets);
        }
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            handleSync();
        }
    };

    const handleFocus = () => {
        handleSync();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
    };
}
