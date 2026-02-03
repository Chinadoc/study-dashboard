'use client';

import React, { useMemo } from 'react';
import vehicleCoverageData from '@/src/data/unified_vehicle_coverage.json';
import { getAutelTier, isVehicleCoveredByAutelModel, AUTEL_MODEL_TIERS } from '@/lib/autelModelCoverage';

interface VehicleRecord {
    make: string;
    yearStart: number;
    yearEnd: number;
    platform: string;
    autel: { status: string; limitations: Array<{ category: string }> };
    smartPro: { status: string };
    lonsdor: { status: string };
    vvdi: { status: string };
}

interface ToolCoveragePreviewProps {
    toolId: string;
    className?: string;
}

// Compact year buckets for mini display
const YEAR_BUCKETS = [
    { label: 'Pre-2015', start: 1990, end: 2014 },
    { label: '2015-20', start: 2015, end: 2020 },
    { label: '2021+', start: 2021, end: 2030 },
];

// Sample makes for preview (most common)
const PREVIEW_MAKES = [
    'Ford', 'Chevrolet', 'Toyota', 'Honda',
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
    'Jeep', 'RAM', 'Nissan', 'Hyundai'
];

type CoverageKey = 'autel' | 'smartPro' | 'lonsdor' | 'vvdi';

const TOOL_TO_KEY: Record<string, CoverageKey> = {
    'autel_im508s': 'autel',
    'autel_im608': 'autel',
    'autel_im608_pro': 'autel',
    'autel_im608_pro2': 'autel',
    'lonsdor_k518': 'lonsdor',
    'xhorse_keytool_plus': 'vvdi',
    'obdstar_g3': 'autel',
    'autopropad': 'smartPro',
    'smart_pro': 'smartPro',
};

export default function ToolCoveragePreview({ toolId, className = '' }: ToolCoveragePreviewProps) {
    const vehicles = (vehicleCoverageData as { vehicles: VehicleRecord[] }).vehicles || [];
    const coverageKey = TOOL_TO_KEY[toolId] || 'autel';
    const isAutelModel = toolId.startsWith('autel_');
    const autelTier = isAutelModel ? getAutelTier(toolId) : null;

    // Calculate coverage grid
    const { grid, stats } = useMemo(() => {
        const gridData: Record<string, Record<string, 'yes' | 'partial' | 'no' | 'unknown'>> = {};
        let totalCovered = 0;
        let totalPartial = 0;
        let totalVehicles = 0;

        // Initialize grid
        for (const make of PREVIEW_MAKES) {
            gridData[make] = {};
            for (const bucket of YEAR_BUCKETS) {
                gridData[make][bucket.label] = 'unknown';
            }
        }

        // Process vehicles
        for (const vehicle of vehicles) {
            if (!PREVIEW_MAKES.includes(vehicle.make)) continue;

            // Find which bucket this vehicle belongs to
            for (const bucket of YEAR_BUCKETS) {
                if (vehicle.yearEnd >= bucket.start && vehicle.yearStart <= bucket.end) {
                    totalVehicles++;

                    let status = '';
                    if (isAutelModel && autelTier) {
                        // Use derived coverage for Autel models
                        const result = isVehicleCoveredByAutelModel(
                            toolId,
                            vehicle.autel.status,
                            vehicle.platform,
                            vehicle.autel.limitations,
                            vehicle.yearEnd
                        );
                        status = result.status;
                    } else {
                        // Use baseline coverage
                        status = vehicle[coverageKey]?.status || '';
                    }

                    const statusLower = status.toLowerCase();
                    const currentValue = gridData[vehicle.make][bucket.label];

                    // Upgrade cell status (yes > partial > no > unknown)
                    if (statusLower.includes('yes') && currentValue !== 'yes') {
                        gridData[vehicle.make][bucket.label] = 'yes';
                        totalCovered++;
                    } else if ((statusLower.includes('partial') || statusLower.includes('check')) &&
                        currentValue !== 'yes' && currentValue !== 'partial') {
                        gridData[vehicle.make][bucket.label] = 'partial';
                        totalPartial++;
                    } else if (statusLower.includes('no') && currentValue === 'unknown') {
                        gridData[vehicle.make][bucket.label] = 'no';
                    }
                }
            }
        }

        return {
            grid: gridData,
            stats: {
                covered: totalCovered,
                partial: totalPartial,
                total: totalVehicles,
                percent: totalVehicles > 0
                    ? Math.round(((totalCovered + totalPartial * 0.5) / totalVehicles) * 100)
                    : 0
            }
        };
    }, [vehicles, toolId, coverageKey, isAutelModel, autelTier]);

    const getCellColor = (status: 'yes' | 'partial' | 'no' | 'unknown') => {
        switch (status) {
            case 'yes': return 'bg-green-500';
            case 'partial': return 'bg-amber-500';
            case 'no': return 'bg-red-500';
            default: return 'bg-gray-600';
        }
    };

    return (
        <div className={`${className}`}>
            {/* Mini grid */}
            <div className="grid gap-[1px] mb-2" style={{ gridTemplateColumns: '1fr repeat(3, 16px)' }}>
                {/* Header */}
                <div className="text-[8px] text-gray-500"></div>
                {YEAR_BUCKETS.map(bucket => (
                    <div key={bucket.label} className="text-[6px] text-gray-500 text-center">
                        {bucket.label.replace('Pre-', '<')}
                    </div>
                ))}

                {/* Make rows */}
                {PREVIEW_MAKES.slice(0, 6).map(make => (
                    <React.Fragment key={make}>
                        <div className="text-[8px] text-gray-400 truncate pr-1">
                            {make.substring(0, 4)}
                        </div>
                        {YEAR_BUCKETS.map(bucket => (
                            <div
                                key={`${make}-${bucket.label}`}
                                className={`w-3 h-2 rounded-[1px] ${getCellColor(grid[make]?.[bucket.label] || 'unknown')}`}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">
                    {stats.percent}% coverage
                </span>
                {autelTier && (
                    <span className="text-gray-500">
                        Tier: {autelTier.coveragePercent}%
                    </span>
                )}
            </div>
        </div>
    );
}
