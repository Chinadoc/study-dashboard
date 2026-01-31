'use client';

import React, { DragEvent, useState, ReactNode } from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';

interface PearlDropZoneProps {
    section: string;
    subsection?: string;
    onDrop: (pearlId: string, section: string, subsection?: string, displayOrder?: number) => void;
    children?: ReactNode;
    className?: string;
    label?: string;
}

/**
 * Drop zone component for receiving dragged pearls.
 * Shows visual feedback during drag-over and triggers reorder API on drop.
 */
export function PearlDropZone({
    section,
    subsection,
    onDrop,
    children,
    className = '',
    label,
}: PearlDropZoneProps) {
    const { isAdminMode, canEdit } = useAdminMode();
    const [isOver, setIsOver] = useState(false);

    if (!isAdminMode || !canEdit) {
        // Not in admin mode - just render children
        return <>{children}</>;
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.pearlId) {
                // Calculate display order based on drop position
                // For now, we'll use a simple increment approach
                // A more sophisticated approach would calculate position based on siblings
                const displayOrder = Date.now(); // Use timestamp as a simple ordering mechanism
                onDrop(data.pearlId, section, subsection, displayOrder);
            }
        } catch (err) {
            console.error('Failed to parse drop data:', err);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative transition-all duration-200 ${isOver
                    ? 'ring-2 ring-purple-500 ring-dashed bg-purple-500/10'
                    : ''
                } ${className}`}
        >
            {/* Drop Zone Indicator (shown when dragging over) */}
            {isOver && label && (
                <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20 backdrop-blur-sm rounded-lg z-10 pointer-events-none">
                    <span className="text-purple-300 font-medium text-sm">
                        Drop here: {label}
                    </span>
                </div>
            )}

            {/* Admin Mode Indicator (subtle border when in edit mode) */}
            {!isOver && (
                <div className="absolute inset-0 border-2 border-dashed border-zinc-700/50 rounded-lg pointer-events-none opacity-50" />
            )}

            {/* Section Label Badge (visible in admin mode) */}
            {label && (
                <div className="absolute -top-2 left-2 z-20">
                    <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] rounded-full">
                        {label}
                    </span>
                </div>
            )}

            {children}
        </div>
    );
}

export default PearlDropZone;
