'use client';

// Sandbox mode utilities for free tier preview
// Limits: 3 inventory items, 2 jobs, 1 demo vehicle page

export interface SandboxState {
    active: boolean;
    inventoryUsed: number;
    jobsUsed: number;
    activatedAt: string;
}

const STORAGE_KEY = 'eurokeys_sandbox_mode';

export const SANDBOX_LIMITS = {
    inventoryItems: 3,
    jobs: 2,
    demoVehicle: '/vehicle/chevrolet/silverado-1500/2021',
};

export function getSandboxState(): SandboxState | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

export function isSandboxMode(): boolean {
    const state = getSandboxState();
    return state?.active === true;
}

export function incrementSandboxUsage(type: 'inventory' | 'jobs'): boolean {
    const state = getSandboxState();
    if (!state?.active) return true; // Not in sandbox, allow

    const limit = type === 'inventory' ? SANDBOX_LIMITS.inventoryItems : SANDBOX_LIMITS.jobs;
    const current = type === 'inventory' ? state.inventoryUsed : state.jobsUsed;

    if (current >= limit) {
        return false; // Limit reached
    }

    // Increment usage
    const newState = {
        ...state,
        [type === 'inventory' ? 'inventoryUsed' : 'jobsUsed']: current + 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    return true;
}

export function getSandboxRemaining(): { inventory: number; jobs: number } {
    const state = getSandboxState();
    if (!state?.active) {
        return { inventory: Infinity, jobs: Infinity };
    }

    return {
        inventory: Math.max(0, SANDBOX_LIMITS.inventoryItems - state.inventoryUsed),
        jobs: Math.max(0, SANDBOX_LIMITS.jobs - state.jobsUsed),
    };
}

export function clearSandboxMode(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export function isDemoVehicle(path: string): boolean {
    return path.includes('/vehicle/chevrolet/silverado-1500/2021') ||
        path.includes('/vehicle/Chevrolet/Silverado%201500/2021');
}
