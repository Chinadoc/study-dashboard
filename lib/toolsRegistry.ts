'use client';

/**
 * Unified Tools Registry
 * Single source of truth for all tool data across the platform
 * Includes programming devices, Lishi decoders, and other locksmith tools
 */

// ============================================================================
// Types
// ============================================================================

export type ToolCategory = 'programmer' | 'decoder' | 'pick' | 'accessory' | 'cable';

export interface Tool {
    id: string;
    name: string;
    shortName: string;
    category: ToolCategory;
    icon: string;
    color: string;
    description: string;

    // Coverage mapping - which tool keys in coverage heatmap this maps to
    coverageKey?: 'autel' | 'smartPro' | 'lonsdor' | 'vvdi';

    // Vehicle compatibility (for Lishi/decoders)
    vehicleMakes?: string[];
    keyway?: string;

    // Pricing info
    msrp?: number;
    subscriptionRequired?: boolean;
    subscriptionCost?: number; // Annual
}

// ============================================================================
// Programming Tools
// ============================================================================

export const PROGRAMMING_TOOLS: Tool[] = [
    {
        id: 'autel_im608',
        name: 'Autel IM608 Pro II',
        shortName: 'Autel',
        category: 'programmer',
        icon: '🔴',
        color: '#ef4444',
        description: 'US/Asian database lead. Built-in CAN-FD. Server calculations for Toyota/MB.',
        coverageKey: 'autel',
        msrp: 5999,
        subscriptionRequired: true,
        subscriptionCost: 1295,
    },
    {
        id: 'lonsdor_k518',
        name: 'Lonsdor K518 Pro',
        shortName: 'Lonsdor',
        category: 'programmer',
        icon: '🟣',
        color: '#a855f7',
        description: 'Offline Toyota 8A-BA. Nissan 40-pin bypass. No subscription required.',
        coverageKey: 'lonsdor',
        msrp: 2999,
        subscriptionRequired: false,
    },
    {
        id: 'xhorse_keytool_plus',
        name: 'Xhorse Key Tool Plus',
        shortName: 'Xhorse',
        category: 'programmer',
        icon: '🟠',
        color: '#f59e0b',
        description: 'VAG MQB specialist. Mercedes FBS3. Universal remote generation.',
        coverageKey: 'vvdi',
        msrp: 3499,
        subscriptionRequired: false,
    },
    {
        id: 'obdstar_g3',
        name: 'OBDStar Key Master G3',
        shortName: 'OBDStar',
        category: 'programmer',
        icon: '🟢',
        color: '#22c55e',
        description: 'Nissan blacklist detection. Gateway bypasses. Marine/motorcycle.',
        msrp: 3299,
        subscriptionRequired: true,
        subscriptionCost: 799,
    },
    {
        id: 'autopropad',
        name: 'AutoProPAD',
        shortName: 'AutoProPAD',
        category: 'programmer',
        icon: '🔵',
        color: '#3b82f6',
        description: 'NASTF certified. Strong US domestic coverage. Dealer-level protocols.',
        msrp: 4999,
        subscriptionRequired: true,
        subscriptionCost: 1500,
    },
    {
        id: 'smart_pro',
        name: 'Smart Pro',
        shortName: 'SmartPro',
        category: 'programmer',
        icon: '⚪',
        color: '#6b7280',
        description: 'Advanced Diagnostics. Comprehensive US coverage. Token-based.',
        coverageKey: 'smartPro',
        msrp: 4499,
        subscriptionRequired: true,
        subscriptionCost: 1200,
    },
];

// ============================================================================
// Lishi 2-in-1 Pick/Decoders
// ============================================================================

export const LISHI_TOOLS: Tool[] = [
    // Asian
    {
        id: 'lishi_toy48',
        name: 'Lishi TOY48',
        shortName: 'TOY48',
        category: 'decoder',
        icon: '🔓',
        color: '#f97316',
        description: 'Toyota/Lexus/Scion 2006+. 10-cut laser key.',
        keyway: 'TOY48',
        vehicleMakes: ['Toyota', 'Lexus', 'Scion'],
    },
    {
        id: 'lishi_toy43at',
        name: 'Lishi TOY43AT',
        shortName: 'TOY43AT',
        category: 'decoder',
        icon: '🔓',
        color: '#f97316',
        description: 'Toyota/Lexus older models. Anti-glare.',
        keyway: 'TOY43AT',
        vehicleMakes: ['Toyota', 'Lexus'],
    },
    {
        id: 'lishi_hon66',
        name: 'Lishi HON66',
        shortName: 'HON66',
        category: 'decoder',
        icon: '🔓',
        color: '#ef4444',
        description: 'Honda/Acura 2002-2014. High-security laser.',
        keyway: 'HON66',
        vehicleMakes: ['Honda', 'Acura'],
    },
    {
        id: 'lishi_maz24',
        name: 'Lishi MAZ24',
        shortName: 'MAZ24',
        category: 'decoder',
        icon: '🔓',
        color: '#ef4444',
        description: 'Mazda 2004+. Reverse track design.',
        keyway: 'MAZ24',
        vehicleMakes: ['Mazda'],
    },
    {
        id: 'lishi_nsn14',
        name: 'Lishi NSN14',
        shortName: 'NSN14',
        category: 'decoder',
        icon: '🔓',
        color: '#3b82f6',
        description: 'Nissan/Infiniti. Standard 10-cut.',
        keyway: 'NSN14',
        vehicleMakes: ['Nissan', 'Infiniti'],
    },
    {
        id: 'lishi_hy22',
        name: 'Lishi HY22',
        shortName: 'HY22',
        category: 'decoder',
        icon: '🔓',
        color: '#22c55e',
        description: 'Hyundai/Kia 2006+. High-security.',
        keyway: 'HY22',
        vehicleMakes: ['Hyundai', 'Kia'],
    },
    {
        id: 'lishi_mit8',
        name: 'Lishi MIT8',
        shortName: 'MIT8',
        category: 'decoder',
        icon: '🔓',
        color: '#ef4444',
        description: 'Mitsubishi 2007+.',
        keyway: 'MIT8',
        vehicleMakes: ['Mitsubishi'],
    },
    {
        id: 'lishi_sub1',
        name: 'Lishi SUB1',
        shortName: 'SUB1',
        category: 'decoder',
        icon: '🔓',
        color: '#3b82f6',
        description: 'Subaru 2010+.',
        keyway: 'SUB1',
        vehicleMakes: ['Subaru'],
    },
    // European
    {
        id: 'lishi_hu66',
        name: 'Lishi HU66',
        shortName: 'HU66',
        category: 'decoder',
        icon: '🔓',
        color: '#a855f7',
        description: 'VW/Audi/Seat/Skoda. Most common VAG.',
        keyway: 'HU66',
        vehicleMakes: ['Volkswagen', 'Audi', 'Seat', 'Skoda'],
    },
    {
        id: 'lishi_hu101',
        name: 'Lishi HU101',
        shortName: 'HU101',
        category: 'decoder',
        icon: '🔓',
        color: '#3b82f6',
        description: 'Ford/Lincoln/Jaguar/Land Rover/Volvo.',
        keyway: 'HU101',
        vehicleMakes: ['Ford', 'Lincoln', 'Jaguar', 'Land Rover', 'Volvo'],
    },
    {
        id: 'lishi_hu92',
        name: 'Lishi HU92',
        shortName: 'HU92',
        category: 'decoder',
        icon: '🔓',
        color: '#0ea5e9',
        description: 'BMW 2-track. 2002+.',
        keyway: 'HU92',
        vehicleMakes: ['BMW'],
    },
    {
        id: 'lishi_hu64',
        name: 'Lishi HU64',
        shortName: 'HU64',
        category: 'decoder',
        icon: '🔓',
        color: '#6b7280',
        description: 'Mercedes older models.',
        keyway: 'HU64',
        vehicleMakes: ['Mercedes-Benz'],
    },
    {
        id: 'lishi_sip22',
        name: 'Lishi SIP22',
        shortName: 'SIP22',
        category: 'decoder',
        icon: '🔓',
        color: '#22c55e',
        description: 'Fiat/Alfa Romeo/Lancia/Iveco.',
        keyway: 'SIP22',
        vehicleMakes: ['Fiat', 'Alfa Romeo', 'Lancia'],
    },
    // American
    {
        id: 'lishi_gm37',
        name: 'Lishi GM37',
        shortName: 'GM37',
        category: 'decoder',
        icon: '🔓',
        color: '#eab308',
        description: 'GM 10-cut high security. 2006+.',
        keyway: 'GM37',
        vehicleMakes: ['Chevrolet', 'GMC', 'Buick', 'Cadillac'],
    },
    {
        id: 'lishi_gm39',
        name: 'Lishi GM39',
        shortName: 'GM39',
        category: 'decoder',
        icon: '🔓',
        color: '#eab308',
        description: 'GM B111/B106. Older models.',
        keyway: 'GM39',
        vehicleMakes: ['Chevrolet', 'GMC', 'Buick', 'Cadillac', 'Oldsmobile', 'Pontiac'],
    },
    {
        id: 'lishi_fo38',
        name: 'Lishi FO38',
        shortName: 'FO38',
        category: 'decoder',
        icon: '🔓',
        color: '#3b82f6',
        description: 'Ford 8-cut older models.',
        keyway: 'FO38',
        vehicleMakes: ['Ford', 'Lincoln', 'Mercury'],
    },
    {
        id: 'lishi_chr1',
        name: 'Lishi CHR1',
        shortName: 'CHR1',
        category: 'decoder',
        icon: '🔓',
        color: '#ef4444',
        description: 'Chrysler/Dodge/Jeep Y157.',
        keyway: 'Y157',
        vehicleMakes: ['Chrysler', 'Dodge', 'Jeep', 'Ram'],
    },
];

// ============================================================================
// All Tools Combined
// ============================================================================

export const ALL_TOOLS: Tool[] = [...PROGRAMMING_TOOLS, ...LISHI_TOOLS];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get tool by ID
 */
export function getToolById(id: string): Tool | undefined {
    return ALL_TOOLS.find(t => t.id === id);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: ToolCategory): Tool[] {
    return ALL_TOOLS.filter(t => t.category === category);
}

/**
 * Get Lishi decoder for a vehicle make
 */
export function getLishiForMake(make: string): Tool[] {
    return LISHI_TOOLS.filter(t =>
        t.vehicleMakes?.some(m => m.toLowerCase() === make.toLowerCase())
    );
}

/**
 * Map user's owned tool IDs to coverage heatmap keys
 */
export function mapToolsToCoverageKeys(toolIds: string[]): string[] {
    const coverageKeys: string[] = [];
    for (const id of toolIds) {
        const tool = getToolById(id);
        if (tool?.coverageKey) {
            coverageKeys.push(tool.coverageKey);
        }
    }
    return [...new Set(coverageKeys)];
}

/**
 * Get programming tools with subscription info
 */
export function getToolsWithSubscriptions(): Tool[] {
    return PROGRAMMING_TOOLS.filter(t => t.subscriptionRequired && t.subscriptionCost);
}

// Re-export for backward compatibility with businessTypes.ts
export const AVAILABLE_TOOLS = PROGRAMMING_TOOLS.map(t => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    icon: t.icon,
    badge: t.description.split('.')[0],
    badgeColor: t.color,
    description: t.description,
}));
