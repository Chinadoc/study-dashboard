'use client';

import React from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';

/**
 * Toggle button for admin edit mode.
 * Only visible to developers.
 */
export function EditModeToggle() {
    const { isAdminMode, toggleAdminMode, canEdit } = useAdminMode();

    if (!canEdit) return null;

    return (
        <button
            onClick={toggleAdminMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isAdminMode
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
            title={isAdminMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
            <span>{isAdminMode ? '✓' : '✎'}</span>
            <span>{isAdminMode ? 'Editing' : 'Edit Mode'}</span>
        </button>
    );
}

export default EditModeToggle;
