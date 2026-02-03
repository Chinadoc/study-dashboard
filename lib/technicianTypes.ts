'use client';

/**
 * Team/Technician Management Types for Locksmith Business Platform
 * Tracks technicians, their performance, and links to jobs
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
// Helper Functions
// ============================================================================

const TECHNICIANS_STORAGE_KEY = 'eurokeys_technicians';

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
    return technician;
}

export function deleteTechnician(id: string) {
    const technicians = getTechniciansFromStorage();
    saveTechniciansToStorage(technicians.filter(t => t.id !== id));
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
