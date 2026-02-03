'use client';

import { API_BASE } from './config';

/**
 * Business Platform Types and Tool Definitions
 * Now with cloud sync support!
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
    subscriptionId?: string;  // Links to associated subscription in LOCKSMITH_REQUIREMENTS
    hasSubscription?: boolean;
    subscriptionNote?: string;  // e.g., "Annual renewal required" or "One-time purchase"
}

// More specific license type categories for automotive locksmiths
export type LicenseCategory =
    | 'state_license'      // State-issued locksmith licenses
    | 'business_license'   // Local business permits
    | 'certification'      // Professional certifications (ALOA, SAVTA, etc.)
    | 'vehicle_access'     // NASTF, AWR, NHTSA programs
    | 'tool_subscription'  // Tool-specific subscriptions (Autel, Xhorse, etc.)
    | 'oem_access'         // OEM portal subscriptions (GM TIS, Ford FDRS, wiTECH, etc.)
    | 'insurance';         // Liability, E&O, commercial auto

export interface LicenseItem {
    id: string;
    name: string;
    type: LicenseCategory;
    icon: string;
    description: string;
    typicalDuration: number; // days
    typicalPrice?: number;   // typical annual/renewal cost
    renewalUrl?: string;
    linkedToolId?: string;   // For tool subscriptions, links back to the tool
    required?: boolean;      // Is this commonly required?
}

// ============================================================================
// LOCKSMITH REQUIREMENTS - Industry-specific licenses, certifications & subscriptions
// ============================================================================

export const LOCKSMITH_REQUIREMENTS: LicenseItem[] = [
    // --- STATE & BUSINESS LICENSES ---
    {
        id: 'state_license',
        name: 'State Locksmith License',
        type: 'state_license',
        icon: '📜',
        description: 'State-issued locksmith license (required in TX, CA, IL, NJ, NC, VA, TN, etc.)',
        typicalDuration: 365,
        typicalPrice: 150,
        required: true
    },
    {
        id: 'business_license',
        name: 'Business License/Permit',
        type: 'business_license',
        icon: '🏪',
        description: 'City/County business operating permit',
        typicalDuration: 365,
        typicalPrice: 100,
        required: true
    },

    // --- PROFESSIONAL CERTIFICATIONS ---
    {
        id: 'aloa_crl',
        name: 'ALOA CRL (Certified Registered Locksmith)',
        type: 'certification',
        icon: '🎓',
        description: 'Entry-level ALOA certification',
        typicalDuration: 730,
        typicalPrice: 200,
        renewalUrl: 'https://www.aloa.org'
    },
    {
        id: 'aloa_cpl',
        name: 'ALOA CPL (Certified Professional Locksmith)',
        type: 'certification',
        icon: '🎓',
        description: 'Advanced ALOA certification',
        typicalDuration: 730,
        typicalPrice: 250
    },
    {
        id: 'aloa_cml',
        name: 'ALOA CML (Certified Master Locksmith)',
        type: 'certification',
        icon: '👑',
        description: 'Highest ALOA certification level',
        typicalDuration: 730,
        typicalPrice: 300
    },
    {
        id: 'aloa_cal',
        name: 'ALOA CAL (Certified Automotive Locksmith)',
        type: 'certification',
        icon: '🚗',
        description: 'Automotive specialty certification',
        typicalDuration: 730,
        typicalPrice: 275
    },
    {
        id: 'savta_cert',
        name: 'SAVTA Certification',
        type: 'certification',
        icon: '🔐',
        description: 'Safe & Vault Technicians Association',
        typicalDuration: 730,
        typicalPrice: 350
    },

    // --- VEHICLE ACCESS PROGRAMS ---
    {
        id: 'nastf_vsp',
        name: 'NASTF VSP Registry',
        type: 'vehicle_access',
        icon: '🔑',
        description: 'Vehicle Security Professional - required for OEM key codes',
        typicalDuration: 365,
        typicalPrice: 75,
        renewalUrl: 'https://www.nastf.org',
        required: true
    },
    {
        id: 'awr_subscription',
        name: 'AWR (Auto Watch Retrieval)',
        type: 'vehicle_access',
        icon: '📡',
        description: 'Access immobilizer PINs and key codes for vehicle programming',
        typicalDuration: 365,
        typicalPrice: 500
    },
    {
        id: 'nhtsa_access',
        name: 'NHTSA Access',
        type: 'vehicle_access',
        icon: '🏛️',
        description: 'National Highway Traffic Safety Administration program access',
        typicalDuration: 365,
        typicalPrice: 0
    },

    // --- TOOL SUBSCRIPTIONS (linked to specific tools) ---
    {
        id: 'autel_subscription',
        name: 'Autel Annual Update',
        type: 'tool_subscription',
        icon: '🔴',
        description: 'IM608 Pro II annual software updates - required for new vehicles',
        typicalDuration: 365,
        typicalPrice: 1295,
        linkedToolId: 'autel_im608',
        renewalUrl: 'https://www.autel.com'
    },
    {
        id: 'xhorse_vip',
        name: 'Xhorse VIP Subscription',
        type: 'tool_subscription',
        icon: '🟠',
        description: 'Key Tool Plus VIP - token discounts & premium features',
        typicalDuration: 365,
        typicalPrice: 599,
        linkedToolId: 'xhorse_keytool_plus'
    },
    {
        id: 'lonsdor_subscription',
        name: 'Lonsdor K518 Update',
        type: 'tool_subscription',
        icon: '🟣',
        description: 'K518 Pro annual updates (optional - offline Toyota included)',
        typicalDuration: 365,
        typicalPrice: 400,
        linkedToolId: 'lonsdor_k518'
    },
    {
        id: 'obdstar_subscription',
        name: 'OBDStar Annual Subscription',
        type: 'tool_subscription',
        icon: '🟢',
        description: 'Key Master G3 updates and new vehicle support',
        typicalDuration: 365,
        typicalPrice: 799,
        linkedToolId: 'obdstar_g3'
    },
    {
        id: 'autopropad_subscription',
        name: 'AutoProPAD Annual',
        type: 'tool_subscription',
        icon: '🔵',
        description: 'AutoProPAD software updates and NASTF integration',
        typicalDuration: 365,
        typicalPrice: 1295,
        linkedToolId: 'autopropad'
    },
    {
        id: 'smartpro_tokens',
        name: 'Smart Pro Token Package',
        type: 'tool_subscription',
        icon: '⚪',
        description: 'Advanced Diagnostics token bundle (pay-per-use model)',
        typicalDuration: 365,
        typicalPrice: 500,
        linkedToolId: 'smart_pro'
    },
    {
        id: 'yanhua_acdp',
        name: 'Yanhua ACDP Subscription',
        type: 'tool_subscription',
        icon: '🟡',
        description: 'Mini ACDP module authorizations and updates',
        typicalDuration: 365,
        typicalPrice: 0  // Pay per module
    },

    // --- OEM ACCESS (Per-VIN, Tokens, Short-Term Subscriptions) ---
    {
        id: 'gm_tis2web',
        name: 'GM TIS2Web (Per-VIN)',
        type: 'oem_access',
        icon: '🚙',
        description: '2 hours or 2 days access per VIN for security data',
        typicalDuration: 1,  // Per-use
        typicalPrice: 45,    // Per VIN
        renewalUrl: 'https://www.acdelcotds.com'
    },
    {
        id: 'gm_techline_connect',
        name: 'GM Techline Connect (SPS2)',
        type: 'oem_access',
        icon: '🚙',
        description: 'Full dealer programming - requires MDI2 + CAN FD',
        typicalDuration: 365,
        typicalPrice: 4000,  // Full domestic coverage
        renewalUrl: 'https://www.acdelcotds.com'
    },
    {
        id: 'ford_fdrs',
        name: 'Ford FDRS Access',
        type: 'oem_access',
        icon: '🚙',
        description: 'PATS security functions - requires NASTF VSP',
        typicalDuration: 1,
        typicalPrice: 40,
        renewalUrl: 'https://www.fordtechservice.dealerconnection.com'
    },
    {
        id: 'witech_subscription',
        name: 'wiTECH 2.0 Subscription',
        type: 'oem_access',
        icon: '🚙',
        description: 'Stellantis OEM diagnostics and programming',
        typicalDuration: 365,
        typicalPrice: 1600,
        renewalUrl: 'https://www.techauthority.com'
    },
    {
        id: 'techauthority_subscription',
        name: 'TechAuthority Subscription',
        type: 'oem_access',
        icon: '🚙',
        description: 'Stellantis service info and flash file access',
        typicalDuration: 365,
        typicalPrice: 1975,
        renewalUrl: 'https://www.techauthority.com'
    },
    {
        id: 'stellantis_flash_tokens',
        name: 'Stellantis Flash Tokens',
        type: 'oem_access',
        icon: '🎫',
        description: 'Per-VIN flash/programming tokens',
        typicalDuration: 1,  // Per-use
        typicalPrice: 35
    },
    {
        id: 'smartpro_tokens',
        name: 'Smart Pro Token Pack',
        type: 'oem_access',
        icon: '🎫',
        description: 'Pay-per-operation tokens ($5-$20 each)',
        typicalDuration: 0,  // No expiration
        typicalPrice: 100    // Typical pack purchase
    },
    {
        id: 'toyota_tis',
        name: 'Toyota TIS Subscription',
        type: 'oem_access',
        icon: '🚙',
        description: 'Access to security functions - 1-day or 3-day options',
        typicalDuration: 1,
        typicalPrice: 55,
        renewalUrl: 'https://techinfo.toyota.com'
    },
    {
        id: 'autoauth_subscription',
        name: 'AutoAuth SGW Bypass',
        type: 'oem_access',
        icon: '🔓',
        description: 'Digital gateway bypass for Stellantis/Nissan/Ford',
        typicalDuration: 365,
        typicalPrice: 50,
        renewalUrl: 'https://www.autoauth.com'
    },

    // --- INSURANCE ---
    {
        id: 'liability_insurance',
        name: 'General Liability Insurance',
        type: 'insurance',
        icon: '🛡️',
        description: 'Covers property damage and bodily injury claims',
        typicalDuration: 365,
        typicalPrice: 1200,
        required: true
    },
    {
        id: 'eo_insurance',
        name: 'Errors & Omissions (E&O)',
        type: 'insurance',
        icon: '⚖️',
        description: 'Professional liability - covers programming errors, failed jobs',
        typicalDuration: 365,
        typicalPrice: 800
    },
    {
        id: 'commercial_auto',
        name: 'Commercial Auto Insurance',
        type: 'insurance',
        icon: '🚐',
        description: 'Coverage for service vehicle and mobile equipment',
        typicalDuration: 365,
        typicalPrice: 2400
    },
    {
        id: 'tools_equipment',
        name: 'Tools & Equipment Coverage',
        type: 'insurance',
        icon: '🧰',
        description: 'Inland marine policy for expensive programming tools',
        typicalDuration: 365,
        typicalPrice: 600
    },
];

// Helper to get subscriptions linked to a specific tool
export function getToolSubscriptions(toolId: string): LicenseItem[] {
    return LOCKSMITH_REQUIREMENTS.filter(
        item => item.type === 'tool_subscription' && item.linkedToolId === toolId
    );
}

// Helper to get all tool subscriptions
export function getAllToolSubscriptions(): LicenseItem[] {
    return LOCKSMITH_REQUIREMENTS.filter(item => item.type === 'tool_subscription');
}

// Helper to check if user has subscription for a tool
export function hasSubscriptionForTool(toolId: string, userLicenseIds: string[]): boolean {
    const toolSubs = getToolSubscriptions(toolId);
    return toolSubs.some(sub => userLicenseIds.includes(sub.id));
}

// Get requirements by category
export function getRequirementsByCategory(category: LicenseCategory): LicenseItem[] {
    return LOCKSMITH_REQUIREMENTS.filter(item => item.type === category);
}

// Category display info
export const LICENSE_CATEGORIES: Record<LicenseCategory, { label: string; icon: string; description: string }> = {
    'state_license': { label: 'State Licenses', icon: '📜', description: 'Required state-issued locksmith licenses' },
    'business_license': { label: 'Business Permits', icon: '🏪', description: 'Local business operating permits' },
    'certification': { label: 'Certifications', icon: '🎓', description: 'Professional certifications (ALOA, SAVTA)' },
    'vehicle_access': { label: 'Vehicle Access Programs', icon: '🔑', description: 'NASTF, AWR, and key code access' },
    'tool_subscription': { label: 'Tool Subscriptions', icon: '🔧', description: 'Annual tool updates and services' },
    'oem_access': { label: 'OEM Portal Access', icon: '🚙', description: 'Per-VIN, tokens, and short-term OEM subscriptions' },
    'insurance': { label: 'Insurance', icon: '🛡️', description: 'Business and professional liability coverage' },
};

export const AVAILABLE_TOOLS: ToolInfo[] = [
    {
        id: 'autel_im508s',
        name: 'Autel IM508S',
        shortName: 'IM508S',
        icon: '🔴',
        badge: 'Entry-Level',
        badgeColor: '#f87171',
        description: 'Entry-level IMMO tool. OBD-based programming, limited high-security vehicles.',
        subscriptionId: 'autel_subscription',
        hasSubscription: true,
        subscriptionNote: 'Annual renewal ~$695 for software updates',
    },
    {
        id: 'autel_im608',
        name: 'Autel IM608',
        shortName: 'IM608',
        icon: '🔴',
        badge: 'Mid-Tier',
        badgeColor: '#ef4444',
        description: 'Mid-range IMMO. Most OBD functions, limited bench work. No CAN-FD.',
        subscriptionId: 'autel_subscription',
        hasSubscription: true,
        subscriptionNote: 'Annual renewal ~$995 for software updates',
    },
    {
        id: 'autel_im608_pro',
        name: 'Autel IM608 Pro',
        shortName: 'IM608 Pro',
        icon: '🔴',
        badge: 'Pro-Tier',
        badgeColor: '#dc2626',
        description: 'Pro-level diagnostics. Bench programming, server functions. Ext. CAN-FD.',
        subscriptionId: 'autel_subscription',
        hasSubscription: true,
        subscriptionNote: 'Annual renewal ~$1,295 for software updates',
    },
    {
        id: 'autel_im608_pro2',
        name: 'Autel IM608 Pro II',
        shortName: 'IM608 Pro II',
        icon: '🔴',
        badge: 'Flagship',
        badgeColor: '#b91c1c',
        description: 'Full coverage. Built-in CAN-FD. Server calculations for Toyota/MB. DoIP ready.',
        subscriptionId: 'autel_subscription',
        hasSubscription: true,
        subscriptionNote: 'Annual renewal ~$1,295 for software updates',
    },
    {
        id: 'lonsdor_k518',
        name: 'Lonsdor K518 Pro',
        shortName: 'Lonsdor',
        icon: '🟣',
        badge: 'Bypass Specialist',
        badgeColor: '#a855f7',
        description: 'Offline Toyota 8A-BA. Nissan 40-pin bypass. No subscription required.',
        subscriptionId: 'lonsdor_subscription',
        hasSubscription: false,  // Optional subscription
        subscriptionNote: 'Optional ~$400/yr updates (Toyota offline works without)',
    },
    {
        id: 'xhorse_keytool_plus',
        name: 'Xhorse Key Tool Plus',
        shortName: 'Xhorse',
        icon: '🟠',
        badge: 'Chip/Remote Expert',
        badgeColor: '#f59e0b',
        description: 'VAG MQB specialist. Mercedes FBS3. Universal remote generation.',
        subscriptionId: 'xhorse_vip',
        hasSubscription: true,
        subscriptionNote: 'VIP subscription ~$599/yr for token discounts',
    },
    {
        id: 'obdstar_g3',
        name: 'OBDStar Key Master G3',
        shortName: 'OBDStar',
        icon: '🟢',
        badge: 'Direct Protocol',
        badgeColor: '#22c55e',
        description: 'Nissan blacklist detection. Gateway bypasses. Marine/motorcycle.',
        subscriptionId: 'obdstar_subscription',
        hasSubscription: true,
        subscriptionNote: 'Annual update ~$799 for new vehicle support',
    },
    {
        id: 'autopropad',
        name: 'AutoProPAD',
        shortName: 'AutoProPAD',
        icon: '🔵',
        badge: 'NASTF Ready',
        badgeColor: '#3b82f6',
        description: 'NASTF certified. Strong US domestic coverage. Dealer-level protocols.',
        subscriptionId: 'autopropad_subscription',
        hasSubscription: true,
        subscriptionNote: 'Annual subscription ~$1,295 required',
    },
    {
        id: 'smart_pro',
        name: 'Smart Pro',
        shortName: 'SmartPro',
        icon: '⚪',
        badge: 'Industry Standard',
        badgeColor: '#6b7280',
        description: 'Advanced Diagnostics. Comprehensive US coverage. Token-based.',
        subscriptionId: 'smartpro_tokens',
        hasSubscription: true,
        subscriptionNote: 'Token-based pay-per-use model',
    },
];

// Mapping of tools to recommended OEM portal access subscriptions
export const TOOL_OEM_RECOMMENDATIONS: Record<string, string[]> = {
    'autel_im508s': ['gm_tis2web', 'toyota_tis', 'autoauth_subscription'],
    'autel_im608': ['gm_tis2web', 'ford_fdrs', 'toyota_tis', 'autoauth_subscription'],
    'autel_im608_pro': ['gm_tis2web', 'gm_techline_connect', 'ford_fdrs', 'toyota_tis', 'autoauth_subscription'],
    'autel_im608_pro2': ['gm_tis2web', 'gm_techline_connect', 'ford_fdrs', 'toyota_tis', 'autoauth_subscription'],
    'lonsdor_k518': ['toyota_tis', 'autoauth_subscription'],
    'xhorse_keytool_plus': ['gm_tis2web', 'autoauth_subscription'],
    'obdstar_g3': ['autoauth_subscription', 'toyota_tis'],
    'autopropad': ['gm_techline_connect', 'ford_fdrs', 'witech_subscription', 'techauthority_subscription'],
    'smart_pro': ['smartpro_tokens', 'gm_techline_connect', 'ford_fdrs'],
};

// Helper to get OEM recommendations for a tool
export function getOemRecommendationsForTool(toolId: string): LicenseItem[] {
    const recommendedIds = TOOL_OEM_RECOMMENDATIONS[toolId] || [];
    return LOCKSMITH_REQUIREMENTS.filter(item => recommendedIds.includes(item.id));
}

// Storage key for business profile (localStorage fallback)
const STORAGE_KEY = 'eurokeys_business_profile';

/**
 * Load business profile - tries cloud first, falls back to localStorage
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
 * Load business profile from cloud (async)
 */
export async function loadBusinessProfileFromCloud(): Promise<BusinessProfile | null> {
    try {
        const response = await fetch(`${API_BASE}/api/user/business-profile`, {
            credentials: 'include',
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (data.profile) {
            // Cache in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
            }
            return data.profile as BusinessProfile;
        }
        return null;
    } catch (e) {
        console.warn('Cloud profile load failed, using localStorage:', e);
        return null;
    }
}

/**
 * Save business profile to localStorage (immediate) and cloud (async)
 */
export function saveBusinessProfile(profile: BusinessProfile): void {
    if (typeof window === 'undefined') return;

    // Immediate localStorage save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

    // Async cloud sync
    syncBusinessProfileToCloud(profile).catch(e => {
        console.warn('Cloud sync failed (profile saved locally):', e);
    });
}

/**
 * Sync business profile to cloud
 */
export async function syncBusinessProfileToCloud(profile: BusinessProfile): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/api/user/business-profile`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        });
        return response.ok;
    } catch (e) {
        console.error('Cloud sync error:', e);
        return false;
    }
}

/**
 * Initialize business profile - load from cloud if available, merge with localStorage
 */
export async function initBusinessProfile(): Promise<BusinessProfile> {
    const localProfile = loadBusinessProfile();
    const cloudProfile = await loadBusinessProfileFromCloud();

    if (cloudProfile) {
        // Cloud takes precedence, but merge tools arrays
        const mergedTools = [...new Set([...cloudProfile.tools, ...localProfile.tools])];
        const merged: BusinessProfile = {
            ...localProfile,
            ...cloudProfile,
            tools: mergedTools,
        };
        // Save merged back to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
    }

    // If we have local data but no cloud data, push to cloud
    if (localProfile.tools.length > 0 || localProfile.setupComplete) {
        syncBusinessProfileToCloud(localProfile).catch(() => { });
    }

    return localProfile;
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
