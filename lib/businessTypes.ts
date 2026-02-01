'use client';

/**
 * Business Platform Types and Tool Definitions
 */

export interface BusinessProfile {
    businessName?: string;
    phone?: string;
    email?: string;
    address?: string;
    logo?: string; // Base64 encoded image
    tools: string[];
    setupComplete: boolean;
    setupStep: 'tools' | 'coverage' | 'inventory' | 'subscriptions' | 'complete';
}

export interface ToolInfo {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    badge: string;
    badgeColor: string;
    description: string;
}

export interface LicenseItem {
    id: string;
    name: string;
    type: 'license' | 'certification' | 'insurance' | 'bond' | 'subscription';
    icon: string;
    description: string;
    typicalDuration: number; // days
    renewalUrl?: string;
}

export const LOCKSMITH_REQUIREMENTS: LicenseItem[] = [
    { id: 'state_license', name: 'State Locksmith License', type: 'license', icon: '📜', description: 'State-issued locksmith license', typicalDuration: 365 },
    { id: 'business_license', name: 'Business License', type: 'license', icon: '🏪', description: 'Local business operating permit', typicalDuration: 365 },
    { id: 'aloa_cert', name: 'ALOA Certification', type: 'certification', icon: '🎓', description: 'Associated Locksmiths of America certification', typicalDuration: 730 },
    { id: 'savta_cert', name: 'SAVTA Certification', type: 'certification', icon: '🔐', description: 'Safe & Vault Technicians Association', typicalDuration: 730 },
    { id: 'liability_insurance', name: 'Liability Insurance', type: 'insurance', icon: '🛡️', description: 'General liability coverage', typicalDuration: 365 },
    { id: 'surety_bond', name: 'Surety Bond', type: 'bond', icon: '📋', description: 'Required surety bond', typicalDuration: 365 },
    { id: 'nastf_access', name: 'NASTF Registry', type: 'subscription', icon: '🚗', description: 'Vehicle security access', typicalDuration: 365 },
    { id: 'awr_subscription', name: 'AWR Subscription', type: 'subscription', icon: '📡', description: 'Auto Watch Retrieval service', typicalDuration: 365 },
];

export const AVAILABLE_TOOLS: ToolInfo[] = [
    {
        id: 'autel_im608',
        name: 'Autel IM608 Pro II',
        shortName: 'Autel',
        icon: '🔴',
        badge: 'Diagnostic Integrator',
        badgeColor: '#ef4444',
        description: 'US/Asian database lead. Built-in CAN-FD. Server calculations for Toyota/MB.',
    },
    {
        id: 'lonsdor_k518',
        name: 'Lonsdor K518 Pro',
        shortName: 'Lonsdor',
        icon: '🟣',
        badge: 'Bypass Specialist',
        badgeColor: '#a855f7',
        description: 'Offline Toyota 8A-BA. Nissan 40-pin bypass. No subscription required.',
    },
    {
        id: 'xhorse_keytool_plus',
        name: 'Xhorse Key Tool Plus',
        shortName: 'Xhorse',
        icon: '🟠',
        badge: 'Chip/Remote Expert',
        badgeColor: '#f59e0b',
        description: 'VAG MQB specialist. Mercedes FBS3. Universal remote generation.',
    },
    {
        id: 'obdstar_g3',
        name: 'OBDStar Key Master G3',
        shortName: 'OBDStar',
        icon: '🟢',
        badge: 'Direct Protocol',
        badgeColor: '#22c55e',
        description: 'Nissan blacklist detection. Gateway bypasses. Marine/motorcycle.',
    },
    {
        id: 'autopropad',
        name: 'AutoProPAD',
        shortName: 'AutoProPAD',
        icon: '🔵',
        badge: 'NASTF Ready',
        badgeColor: '#3b82f6',
        description: 'NASTF certified. Strong US domestic coverage. Dealer-level protocols.',
    },
    {
        id: 'smart_pro',
        name: 'Smart Pro',
        shortName: 'SmartPro',
        icon: '⚪',
        badge: 'Industry Standard',
        badgeColor: '#6b7280',
        description: 'Advanced Diagnostics. Comprehensive US coverage. Token-based.',
    },
];

// Storage key for business profile
const STORAGE_KEY = 'eurokeys_business_profile';

/**
 * Load business profile from localStorage
 */
export function loadBusinessProfile(): BusinessProfile {
    if (typeof window === 'undefined') {
        return { tools: [], setupComplete: false, setupStep: 'tools' };
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load business profile:', e);
    }

    return { tools: [], setupComplete: false, setupStep: 'tools' };
}

/**
 * Save business profile to localStorage
 */
export function saveBusinessProfile(profile: BusinessProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

/**
 * Check if user has completed business setup
 */
export function hasCompletedSetup(): boolean {
    const profile = loadBusinessProfile();
    return profile.setupComplete;
}

/**
 * Get tool info by ID
 */
export function getToolById(id: string): ToolInfo | undefined {
    return AVAILABLE_TOOLS.find(t => t.id === id);
}
