'use client';

import React from 'react';
import { useInventory } from '@/contexts/InventoryContext';

interface OwnedBadgeProps {
    fcc: string | undefined;
    compact?: boolean;
    className?: string;
}

/**
 * Displays an "Owned" badge when the given FCC ID is in the user's inventory.
 * Shows quantity in parentheses (e.g., "✓ Owned (3)").
 */
export default function OwnedBadge({ fcc, compact = false, className = '' }: OwnedBadgeProps) {
    const { isOwned, getQuantity } = useInventory();

    if (!fcc || !isOwned(fcc)) {
        return null;
    }

    const qty = getQuantity(fcc);

    if (compact) {
        // Inline compact version for tight spaces
        return (
            <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 ${className}`}
                title={`You have ${qty} of this key in inventory`}
            >
                ✓ {qty}
            </span>
        );
    }

    // Standard badge
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 ${className}`}
            title={`You have ${qty} of this key in inventory`}
        >
            ✓ Owned ({qty})
        </span>
    );
}
