'use client';

/**
 * Fleet Management Types for Locksmith Business Platform
 * Tracks fleet accounts, vehicles, and links to jobs
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
// Helper Functions
// ============================================================================

const FLEETS_STORAGE_KEY = 'eurokeys_fleets';

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
    return fleet;
}

export function deleteFleetAccount(id: string) {
    const fleets = getFleetAccountsFromStorage();
    saveFleetAccountsToStorage(fleets.filter(f => f.id !== id));
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
