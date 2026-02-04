'use client';

import { API_BASE } from './config';

/**
 * Team/Technician Management Types for Locksmith Business Platform
 * Tracks technicians, their performance, and links to jobs
 * Now with cloud sync support!
 */

export interface Technician {
    id: string;
    name: string;           // Technician name
    phone?: string;
    email?: string;
    role?: string;          // e.g., "Lead Tech", "Apprentice", "Senior Tech"
    commissionRate?: number; // Percentage (0-100) or flat rate per job
    hireDate?: string;
    notes?: string;
    active: boolean;
    createdAt: number;
    updatedAt?: number;
}

// ============================================================================
// Constants & Auth
// ============================================================================

const TECHNICIANS_STORAGE_KEY = 'eurokeys_technicians';

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

export function generateTechnicianId(): string {
    return `tech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getTechniciansFromStorage(): Technician[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(TECHNICIANS_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveTechniciansToStorage(technicians: Technician[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
}

export function saveTechnician(technician: Technician): Technician {
    const technicians = getTechniciansFromStorage();
    const existingIndex = technicians.findIndex(t => t.id === technician.id);

    if (existingIndex >= 0) {
        technicians[existingIndex] = { ...technician, updatedAt: Date.now() };
    } else {
        technicians.unshift({ ...technician, createdAt: Date.now() });
    }

    saveTechniciansToStorage(technicians);

    // Sync to cloud
    syncTechnicianToCloud(technician);

    return technician;
}

export function deleteTechnician(id: string) {
    const technicians = getTechniciansFromStorage();
    saveTechniciansToStorage(technicians.filter(t => t.id !== id));

    // Sync deletion to cloud
    deleteTechnicianFromCloud(id);
}

export function getTechnicianById(id: string): Technician | undefined {
    return getTechniciansFromStorage().find(t => t.id === id);
}

/**
 * Get active technicians only
 */
export function getActiveTechnicians(): Technician[] {
    return getTechniciansFromStorage().filter(t => t.active);
}

/**
 * Calculate technician stats from job logs
 */
export function getTechnicianStats(
    technicianId: string,
    jobs: Array<{ technicianId?: string; price?: number; date?: string; status?: string }>
): { totalJobs: number; totalRevenue: number; avgJobValue: number; thisMonthJobs: number; thisMonthRevenue: number } {
    const techJobs = jobs.filter(j => j.technicianId === technicianId && j.status !== 'cancelled');
    const totalRevenue = techJobs.reduce((sum, j) => sum + (j.price || 0), 0);

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthJobs = techJobs.filter(j => j.date?.startsWith(thisMonth));
    const thisMonthRevenue = thisMonthJobs.reduce((sum, j) => sum + (j.price || 0), 0);

    return {
        totalJobs: techJobs.length,
        totalRevenue,
        avgJobValue: techJobs.length > 0 ? totalRevenue / techJobs.length : 0,
        thisMonthJobs: thisMonthJobs.length,
        thisMonthRevenue
    };
}

// ============================================================================
// Cloud Sync Functions
// ============================================================================

/**
 * Sync a technician to the cloud
 */
async function syncTechnicianToCloud(technician: Technician): Promise<void> {
    if (!getAuthToken()) return;

    await apiRequest('/api/user/technicians', {
        method: 'POST',
        body: JSON.stringify(technician),
    });
}

/**
 * Delete a technician from the cloud
 */
async function deleteTechnicianFromCloud(id: string): Promise<void> {
    if (!getAuthToken()) return;

    await apiRequest(`/api/user/technicians?id=${id}`, {
        method: 'DELETE',
    });
}

/**
 * Load technicians from cloud (async)
 */
export async function loadTechniciansFromCloud(): Promise<Technician[] | null> {
    if (!getAuthToken()) return null;

    const data = await apiRequest('/api/user/technicians');
    if (data?.technicians) {
        // Cache in localStorage
        saveTechniciansToStorage(data.technicians);
        return data.technicians;
    }
    return null;
}

/**
 * Initialize technicians - load from cloud if available, merge with localStorage
 */
export async function initTechnicians(): Promise<Technician[]> {
    const localTechnicians = getTechniciansFromStorage();

    if (!getAuthToken()) return localTechnicians;

    const cloudData = await apiRequest('/api/user/technicians');
    if (cloudData?.technicians) {
        const cloudIds = new Set(cloudData.technicians.map((t: Technician) => t.id));
        const localOnly = localTechnicians.filter(t => !cloudIds.has(t.id));

        // Sync local-only to cloud
        if (localOnly.length > 0) {
            console.log(`[Sync] Syncing ${localOnly.length} local-only technicians to cloud...`);
            for (const tech of localOnly) {
                await apiRequest('/api/user/technicians', {
                    method: 'POST',
                    body: JSON.stringify(tech),
                });
            }
        }

        // Merge and return
        const merged = [...cloudData.technicians, ...localOnly];
        saveTechniciansToStorage(merged);
        return merged;
    }

    return localTechnicians;
}

/**
 * Setup visibility/focus sync handlers
 */
export function setupTechnicianSyncListeners(onUpdate: (technicians: Technician[]) => void): () => void {
    if (typeof window === 'undefined') return () => { };

    const handleSync = async () => {
        if (!getAuthToken()) return;
        console.log('[Sync] Technicians: Checking for updates...');
        const technicians = await loadTechniciansFromCloud();
        if (technicians) {
            onUpdate(technicians);
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
