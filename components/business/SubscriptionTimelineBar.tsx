'use client';

import React from 'react';

interface SubscriptionTimelineBarProps {
    obtainedDate: string;
    expirationDate: string;
    showLabels?: boolean;
    compact?: boolean;
}

export default function SubscriptionTimelineBar({
    obtainedDate,
    expirationDate,
    showLabels = true,
    compact = false
}: SubscriptionTimelineBarProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const obtained = new Date(obtainedDate);
    const expiry = new Date(expirationDate);

    // Calculate total duration and elapsed
    const totalDuration = expiry.getTime() - obtained.getTime();
    const elapsed = today.getTime() - obtained.getTime();
    const remaining = expiry.getTime() - today.getTime();

    // Percentage (clamped 0-100)
    const percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    const remainingPercent = 100 - percentage;

    // Days remaining
    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    const daysTotal = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));

    // Urgency colors
    let barColor = 'bg-green-500';
    let textColor = 'text-green-400';
    let glowColor = '';

    if (daysRemaining <= 0) {
        barColor = 'bg-red-500';
        textColor = 'text-red-400';
        glowColor = 'shadow-red-500/50 shadow-lg';
    } else if (daysRemaining <= 7) {
        barColor = 'bg-orange-500 animate-pulse';
        textColor = 'text-orange-400';
        glowColor = 'shadow-orange-500/30 shadow-md';
    } else if (daysRemaining <= 30) {
        barColor = 'bg-yellow-500';
        textColor = 'text-yellow-400';
    }

    if (compact) {
        return (
            <div className="w-full">
                <div className={`h-1.5 bg-gray-800 rounded-full overflow-hidden ${glowColor}`}>
                    <div
                        className={`h-full ${barColor} transition-all duration-500`}
                        style={{ width: `${remainingPercent}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2">
            {/* Progress bar */}
            <div className={`h-2.5 bg-gray-800 rounded-full overflow-hidden relative ${glowColor}`}>
                {/* Remaining portion (what's left) */}
                <div
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${remainingPercent}%` }}
                />

                {/* Today marker */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/80"
                    style={{ left: `${percentage}%` }}
                />
            </div>

            {showLabels && (
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">
                        {obtained.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`font-bold ${textColor}`}>
                        {daysRemaining > 0
                            ? `${remainingPercent.toFixed(0)}% remaining (${daysRemaining}d)`
                            : `Expired ${Math.abs(daysRemaining)}d ago`
                        }
                    </span>
                    <span className="text-gray-500">
                        {expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            )}
        </div>
    );
}
