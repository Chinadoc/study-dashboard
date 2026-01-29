'use client';

import React from 'react';
import { useSubscriptions } from '@/contexts/SubscriptionContext';

interface ToolStatusBadgeProps {
    toolName: string;
}

const ToolStatusBadge: React.FC<ToolStatusBadgeProps> = ({ toolName }) => {
    const { getSubscriptionStatus, loading } = useSubscriptions();

    if (loading) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 animate-pulse">
                Checking...
            </span>
        );
    }

    const { status, text } = getSubscriptionStatus(toolName);

    if (status === 'none') return null;

    // Defensive check - ensure text is a string
    const displayText = typeof text === 'string' ? text : 'Unknown';

    const statusStyles = {
        active: 'bg-green-900/30 text-green-400 border-green-800',
        warning: 'bg-yellow-900/30 text-yellow-500 border-yellow-800',
        expired: 'bg-red-900/30 text-red-500 border-red-800',
    };

    const statusIcons = {
        active: '✅',
        warning: '⚠️',
        expired: '❌',
    };

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-semibold ${statusStyles[status as keyof typeof statusStyles]}`}>
            <span>{statusIcons[status as keyof typeof statusIcons]}</span>
            <span>{toolName}: {displayText}</span>
        </div>
    );
};

export default ToolStatusBadge;
