'use client';

import React, { DragEvent, useState, ReactNode } from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';

interface DraggablePearlProps {
    pearlId: string;
    currentSection?: string;
    currentSubsection?: string;
    children: ReactNode;
    onEdit?: (pearlId: string) => void;
}

/**
 * Wrapper component that makes a pearl draggable in admin edit mode.
 * Shows a drag handle on hover and enables drag-and-drop to reorder pearls.
 */
export function DraggablePearl({
    pearlId,
    currentSection,
    currentSubsection,
    children,
    onEdit,
}: DraggablePearlProps) {
    const { isAdminMode, canEdit } = useAdminMode();
    const [isDragging, setIsDragging] = useState(false);

    if (!isAdminMode || !canEdit) {
        // Not in admin mode - render children as-is
        return <>{children}</>;
    }

    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            pearlId,
            fromSection: currentSection,
            fromSubsection: currentSubsection,
        }));
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        if (onEdit) {
            onEdit(pearlId);
        }
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            className={`group relative transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''
                } cursor-move hover:ring-2 hover:ring-purple-500/50 hover:ring-offset-2 hover:ring-offset-zinc-900 rounded-lg`}
        >
            {/* Drag Handle */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <span className="text-zinc-500 hover:text-purple-400 select-none" title="Drag to reorder">
                    ⋮⋮
                </span>
            </div>

            {/* Edit Indicator */}
            <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                    className="inline-flex items-center justify-center w-5 h-5 bg-purple-500 text-white rounded-full text-xs cursor-pointer hover:bg-purple-400"
                    title="Click to edit pearl"
                >
                    ✎
                </span>
            </div>

            {/* Pearl Content */}
            {children}
        </div>
    );
}

export default DraggablePearl;
