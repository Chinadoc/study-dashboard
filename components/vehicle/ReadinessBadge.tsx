'use client';

/**
 * ReadinessBadge Component
 * Shows a compact readiness status for a specific vehicle
 * Uses the useReadiness hook internally
 */

import React, { useMemo, useState } from 'react';
import { useReadiness, READINESS_STYLES, ReadinessStatus } from '@/lib/useReadiness';
import { coverageMatrix } from '@/src/data/coverageMatrixLoader';

interface ReadinessBadgeProps {
    make: string;
    model: string;
    year: number;
    showTooltip?: boolean;
    size?: 'sm' | 'md';
}

export default function ReadinessBadge({
    make,
    model,
    year,
    showTooltip = true,
    size = 'sm'
}: ReadinessBadgeProps) {
    const { calculateReadiness } = useReadiness();
    const [showDetails, setShowDetails] = useState(false);

    // Find matching coverage group for this vehicle
    const matchedGroup = useMemo(() => {
        const searchMake = make.toLowerCase();
        const searchModel = model.toLowerCase();

        return coverageMatrix.find(group => {
            const vehicleGroup = group.vehicle_group.toLowerCase();
            const matchesMake = vehicleGroup.includes(searchMake);
            const matchesModel = vehicleGroup.includes(searchModel);

            // Also check year range
            const yearMatch = group.years.match(/(\d{4})/g);
            if (yearMatch) {
                const years = yearMatch.map(y => parseInt(y));
                const minYear = Math.min(...years);
                const maxYear = Math.max(...years);
                // If year is in range or close, consider it a match
                if (year >= minYear && year <= (maxYear || year + 5)) {
                    return matchesMake || matchesModel;
                }
            }

            return matchesMake && matchesModel;
        });
    }, [make, model, year]);

    // Calculate readiness if we found a matching group
    const readiness = useMemo(() => {
        if (!matchedGroup) return null;
        return calculateReadiness(matchedGroup);
    }, [matchedGroup, calculateReadiness]);

    // No matching coverage data - don't show badge
    if (!readiness) {
        return null;
    }

    const style = READINESS_STYLES[readiness.status];
    const isSmall = size === 'sm';

    return (
        <div className="relative">
            <button
                onClick={() => showTooltip && setShowDetails(!showDetails)}
                className={`
                    ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
                    rounded-full font-bold 
                    ${style.bg} ${style.text} 
                    border ${style.border}
                    transition-all hover:opacity-80
                    flex items-center gap-1
                `}
                title={style.description}
            >
                <span>{style.icon}</span>
                <span>{style.label}</span>
            </button>

            {/* Tooltip/Dropdown */}
            {showDetails && readiness.blockers.length > 0 && (
                <div
                    className="absolute top-full mt-2 left-0 z-50 w-64 p-3 rounded-lg bg-gray-900 border border-gray-700 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className={`font-bold mb-2 ${style.text}`}>
                        {style.icon} {style.label}
                    </div>
                    <ul className="text-xs text-gray-400 space-y-1">
                        {readiness.blockers.map((blocker, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-gray-600 mt-0.5">•</span>
                                <span>{blocker}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-2 pt-2 border-t border-gray-800">
                        <a
                            href="/business/coverage-heatmap"
                            className="text-xs text-blue-400 hover:underline"
                        >
                            View full coverage →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Standalone function to get readiness for server-side or non-hook contexts
 */
export function getVehicleReadinessStatus(make: string, model: string, year: number): ReadinessStatus | null {
    const searchMake = make.toLowerCase();
    const searchModel = model.toLowerCase();

    const matchedGroup = coverageMatrix.find(group => {
        const vehicleGroup = group.vehicle_group.toLowerCase();
        return vehicleGroup.includes(searchMake) || vehicleGroup.includes(searchModel);
    });

    if (!matchedGroup) return null;

    // Simplified check without hook context
    // Returns status based on gap analysis
    if (matchedGroup.status === 'RED') return 'CANNOT_SERVICE';
    if (matchedGroup.status === 'ORANGE') return 'NEED_SUBSCRIPTION';
    if (matchedGroup.status === 'YELLOW') return 'NEED_PARTS';
    return 'READY';
}
