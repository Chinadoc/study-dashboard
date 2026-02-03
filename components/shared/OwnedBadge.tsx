'use client';

import React from 'react';
import { useInventory } from '@/contexts/InventoryContext';

interface OwnedBadgeProps {
    fcc: string | undefined;
    compact?: boolean;
    className?: string;
    vehicleInfo?: string;  // Optional vehicle context for adding to inventory
    showAddWhenNotOwned?: boolean; // Show add button when not in inventory
    onAdd?: () => void; // Callback after adding
}

/**
 * Displays an "Owned" badge when the given FCC ID is in the user's inventory.
 * Shows quantity in parentheses (e.g., "✓ Owned (3)").
 * Optionally shows an "Add" button when not owned.
 */
export default function OwnedBadge({
    fcc,
    compact = false,
    className = '',
    vehicleInfo,
    showAddWhenNotOwned = true,
    onAdd
}: OwnedBadgeProps) {
    const { isOwned, getQuantity, addToInventory } = useInventory();
    const [justAdded, setJustAdded] = React.useState(false);

    if (!fcc) return null;

    const owned = isOwned(fcc);
    const qty = owned ? getQuantity(fcc) : 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToInventory(fcc, vehicleInfo, 1);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
        onAdd?.();
    };

    // Just added feedback
    if (justAdded) {
        return (
            <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/30 text-green-300 border border-green-500/50 ${className}`}
            >
                ✓ Added
            </span>
        );
    }

    // Owned state - show count
    if (owned) {
        if (compact) {
            return (
                <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 ${className}`}
                    title={`You have ${qty} in inventory`}
                >
                    ✓ {qty}
                </span>
            );
        }
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 ${className}`}
                title={`You have ${qty} in inventory`}
            >
                ✓ In Stock ({qty})
            </span>
        );
    }

    // Not owned - show add button if enabled
    if (showAddWhenNotOwned) {
        return (
            <button
                onClick={handleAdd}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-700/50 text-zinc-400 border border-zinc-600/30 hover:bg-purple-600/30 hover:text-purple-300 hover:border-purple-500/30 transition-all active:scale-95 ${className}`}
                title="Add to inventory"
            >
                + Add
            </button>
        );
    }

    return null;
}

