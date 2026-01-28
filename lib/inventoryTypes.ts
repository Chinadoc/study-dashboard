'use client';

/**
 * Inventory Types and Key Categories for Locksmith Business Platform
 */

export type KeyCategory =
    | 'smart_key'
    | 'remote_head'
    | 'transponder'
    | 'remote_only'
    | 'blade'
    | 'other';

export interface KeyCategoryInfo {
    label: string;
    icon: string;
    color: string;
    bgClass: string;
    textClass: string;
    description: string;
}

export const KEY_CATEGORIES: Record<KeyCategory, KeyCategoryInfo> = {
    smart_key: {
        label: 'Smart Key',
        icon: '🔐',
        color: 'purple',
        bgClass: 'bg-purple-900/30',
        textClass: 'text-purple-400',
        description: 'Keyless entry with push-button start',
    },
    remote_head: {
        label: 'Remote Head',
        icon: '📡',
        color: 'blue',
        bgClass: 'bg-blue-900/30',
        textClass: 'text-blue-400',
        description: 'Remote integrated into key blade',
    },
    transponder: {
        label: 'Transponder',
        icon: '🔑',
        color: 'green',
        bgClass: 'bg-green-900/30',
        textClass: 'text-green-400',
        description: 'Chip key without remote functions',
    },
    remote_only: {
        label: 'Remote Only',
        icon: '📶',
        color: 'yellow',
        bgClass: 'bg-yellow-900/30',
        textClass: 'text-yellow-400',
        description: 'Standalone remote fob',
    },
    blade: {
        label: 'Blade/Blank',
        icon: '✂️',
        color: 'slate',
        bgClass: 'bg-slate-800/50',
        textClass: 'text-slate-400',
        description: 'Key blank for cutting',
    },
    other: {
        label: 'Other',
        icon: '🔧',
        color: 'gray',
        bgClass: 'bg-gray-800/50',
        textClass: 'text-gray-400',
        description: 'Miscellaneous key type',
    },
};

/**
 * Auto-detect key category based on item data
 * Uses FCC ID patterns and key type hints
 */
export function detectKeyCategory(item: {
    itemKey?: string;
    type?: string;
    keyType?: string;
    fcc_id?: string;
}): KeyCategory {
    const keyType = (item.keyType || '').toLowerCase();
    const itemKey = (item.itemKey || item.fcc_id || '').toLowerCase();
    const type = (item.type || '').toLowerCase();

    // Check explicit type field
    if (type === 'blank' || type === 'blade') {
        return 'blade';
    }

    // Check keyType hints
    if (keyType.includes('smart') || keyType.includes('prox') || keyType.includes('proximity')) {
        return 'smart_key';
    }
    if (keyType.includes('remote head') || keyType.includes('remotehead')) {
        return 'remote_head';
    }
    if (keyType.includes('transponder') || keyType.includes('chip')) {
        return 'transponder';
    }
    if (keyType.includes('remote') && !keyType.includes('head')) {
        return 'remote_only';
    }

    // Check FCC ID patterns (common prefixes)
    // Smart keys often have specific patterns
    if (itemKey.includes('hyq') || itemKey.includes('kr5') || itemKey.includes('m3n')) {
        return 'smart_key';
    }
    if (itemKey.includes('gq4') || itemKey.includes('oht')) {
        return 'remote_head';
    }

    // Default to other for keys, blade for blanks
    return type === 'key' ? 'other' : 'blade';
}

/**
 * Get inventory breakdown by category
 */
export function getInventoryByCategory<T extends { type?: string; keyType?: string; itemKey?: string; fcc_id?: string; qty?: number }>(
    inventory: T[]
): Record<KeyCategory, { items: T[]; totalQty: number }> {
    const breakdown: Record<KeyCategory, { items: T[]; totalQty: number }> = {
        smart_key: { items: [], totalQty: 0 },
        remote_head: { items: [], totalQty: 0 },
        transponder: { items: [], totalQty: 0 },
        remote_only: { items: [], totalQty: 0 },
        blade: { items: [], totalQty: 0 },
        other: { items: [], totalQty: 0 },
    };

    inventory.forEach(item => {
        const category = detectKeyCategory(item);
        breakdown[category].items.push(item);
        breakdown[category].totalQty += item.qty || 0;
    });

    return breakdown;
}

/**
 * Get low stock items (qty < threshold)
 */
export function getLowStockItems<T extends { qty?: number }>(
    inventory: T[],
    threshold: number = 3
): T[] {
    return inventory.filter(item => (item.qty || 0) < threshold && (item.qty || 0) > 0);
}

/**
 * Get out of stock items (qty === 0)
 */
export function getOutOfStockItems<T extends { qty?: number }>(
    inventory: T[]
): T[] {
    return inventory.filter(item => (item.qty || 0) === 0);
}
