'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { getAutelTier, AUTEL_MODEL_TIERS } from '@/lib/autelModelCoverage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://euro-keys.jeremy-samuels17.workers.dev';

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

// Map tool IDs to families for API calls
const TOOL_TO_FAMILY: Record<string, string> = {
    autel_im508s: 'autel', autel_im608: 'autel', autel_im608_pro: 'autel', autel_im608_pro2: 'autel', autel_km100_not_updated: 'autel',
    obdstar_x300_mini: 'autel', obdstar_x300_pro4: 'autel', obdstar_x300_dp_plus: 'autel', obdstar_g3: 'autel',
    smart_pro_tcode: 'smartPro', smart_pro: 'smartPro', autopropad_basic: 'smartPro', autopropad: 'smartPro',
    lonsdor_k518s: 'lonsdor', lonsdor_k518ise: 'lonsdor', lonsdor_k518_pro: 'lonsdor',
    xhorse_mini_obd: 'vvdi', xhorse_keytool_max: 'vvdi', xhorse_vvdi2: 'vvdi', xhorse_keytool_plus: 'vvdi',
};

interface HeatmapCell {
    status: string;
    count: number;
    models: string[];
}

interface HeatmapResponse {
    makes: Record<string, Record<string, HeatmapCell>>;
    summary: Record<string, { total: number; full: number; limited: number; none: number }>;
    total_records: number;
}

export default function ToolCoveragePreview({ toolId, className = '' }: ToolCoveragePreviewProps) {
    const [heatmapData, setHeatmapData] = useState<HeatmapResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const isAutelModel = toolId.startsWith('autel_');
    const autelTier = isAutelModel ? getAutelTier(toolId) : null;

    // Fetch heatmap data for this tool
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resp = await fetch(`${API_BASE}/api/tool-coverage/heatmap?tool=${toolId}`);
                if (resp.ok) {
                    setHeatmapData(await resp.json());
                }
            } catch (err) {
                console.error('Failed to fetch tool coverage preview:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toolId]);

    // Calculate coverage grid from API data
    const { grid, stats } = useMemo(() => {
        const gridData: Record<string, Record<string, 'yes' | 'partial' | 'no' | 'unknown'>> = {};
        let totalCovered = 0;
        let totalPartial = 0;
        let totalCells = 0;

        // Initialize grid
        for (const make of PREVIEW_MAKES) {
            gridData[make] = {};
            for (const bucket of YEAR_BUCKETS) {
                gridData[make][bucket.label] = 'unknown';
            }
        }

        if (!heatmapData?.makes) {
            return {
                grid: gridData,
                stats: { covered: 0, partial: 0, total: 0, percent: 0 }
            };
        }

        // Process heatmap data into bucket grid
        for (const make of PREVIEW_MAKES) {
            const makeData = heatmapData.makes[make];
            if (!makeData) continue;

            for (const bucket of YEAR_BUCKETS) {
                totalCells++;
                let bestStatus: 'yes' | 'partial' | 'no' | 'unknown' = 'unknown';

                for (let year = bucket.start; year <= bucket.end; year++) {
                    const cell = makeData[String(year)];
                    if (!cell) continue;

                    if (cell.status === 'full' && bestStatus !== 'yes') {
                        bestStatus = 'yes';
                    } else if (cell.status === 'partial' && bestStatus !== 'yes') {
                        bestStatus = 'partial';
                    } else if (cell.status === 'none' && bestStatus === 'unknown') {
                        bestStatus = 'no';
                    }
                }

                gridData[make][bucket.label] = bestStatus;
                if (bestStatus === 'yes') totalCovered++;
                else if (bestStatus === 'partial') totalPartial++;
            }
        }

        return {
            grid: gridData,
            stats: {
                covered: totalCovered,
                partial: totalPartial,
                total: totalCells,
                percent: totalCells > 0
                    ? Math.round(((totalCovered + totalPartial * 0.5) / totalCells) * 100)
                    : 0
            }
        };
    }, [heatmapData]);

    const getCellColor = (status: 'yes' | 'partial' | 'no' | 'unknown') => {
        switch (status) {
            case 'yes': return 'bg-green-500';
            case 'partial': return 'bg-amber-500';
            case 'no': return 'bg-red-500';
            default: return 'bg-gray-600';
        }
    };

    if (loading) {
        return (
            <div className={`${className}`}>
                <div className="animate-pulse space-y-1">
                    <div className="grid gap-[1px]" style={{ gridTemplateColumns: '1fr repeat(3, 16px)' }}>
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="h-2 bg-gray-700/50 rounded-[1px]" />
                        ))}
                    </div>
                    <div className="h-2 bg-gray-700/30 rounded w-16" />
                </div>
            </div>
        );
    }

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
