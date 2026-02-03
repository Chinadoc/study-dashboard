'use client';

import React, { useMemo } from 'react';
import { UserLicense } from './LicensureDashboard';
import { LICENSE_CATEGORIES, LicenseCategory } from '@/lib/businessTypes';

interface CostSummaryCardProps {
    licenses: UserLicense[];
}

interface CategoryTotal {
    category: LicenseCategory;
    label: string;
    icon: string;
    total: number;
    count: number;
}

export default function CostSummaryCard({ licenses }: CostSummaryCardProps) {
    const costBreakdown = useMemo(() => {
        const byCategory = new Map<LicenseCategory, { total: number; count: number }>();

        licenses.forEach(license => {
            const price = license.price || 0;
            const current = byCategory.get(license.type) || { total: 0, count: 0 };
            byCategory.set(license.type, {
                total: current.total + price,
                count: current.count + 1
            });
        });

        // Convert to array with category info
        const breakdown: CategoryTotal[] = [];
        byCategory.forEach((value, key) => {
            const catInfo = LICENSE_CATEGORIES[key];
            breakdown.push({
                category: key,
                label: catInfo?.label || key,
                icon: catInfo?.icon || '📄',
                total: value.total,
                count: value.count
            });
        });

        // Sort by total descending
        breakdown.sort((a, b) => b.total - a.total);

        const grandTotal = breakdown.reduce((sum, cat) => sum + cat.total, 0);

        return { breakdown, grandTotal };
    }, [licenses]);

    // Category colors for chart bars
    const categoryColors: Record<string, string> = {
        tool_subscription: 'bg-yellow-500',
        oem_access: 'bg-blue-500',
        insurance: 'bg-green-500',
        certification: 'bg-purple-500',
        state_license: 'bg-orange-500',
        business_license: 'bg-pink-500',
        vehicle_access: 'bg-cyan-500',
    };

    if (licenses.length === 0) {
        return null;
    }

    // CSV Export function
    const exportToCsv = () => {
        const headers = ['Name', 'Category', 'Obtained Date', 'Expiration Date', 'Annual Cost', 'Renewal URL', 'Notes'];
        const rows = licenses.map(l => [
            l.name,
            l.type,
            l.obtainedDate,
            l.expirationDate,
            l.price?.toString() || '0',
            l.renewalUrl || '',
            l.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `eurokeys-costs-${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        💰 Annual Operating Costs
                    </h3>
                    <p className="text-sm text-gray-400">Track your business licensing & subscription spend</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToCsv}
                        className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Export to CSV"
                    >
                        📊 Export
                    </button>
                    <div className="text-right">
                        <div className="text-3xl font-black text-white">
                            ${costBreakdown.grandTotal.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">Per Year</div>
                    </div>
                </div>
            </div>

            {/* Visual breakdown bar */}
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex mb-4">
                {costBreakdown.breakdown.map((cat, idx) => {
                    const widthPercent = costBreakdown.grandTotal > 0
                        ? (cat.total / costBreakdown.grandTotal) * 100
                        : 0;
                    const color = categoryColors[cat.category] || 'bg-gray-500';
                    return (
                        <div
                            key={cat.category}
                            className={`${color} transition-all duration-500`}
                            style={{ width: `${widthPercent}%` }}
                            title={`${cat.label}: $${cat.total.toLocaleString()}`}
                        />
                    );
                })}
            </div>

            {/* Category breakdown list */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {costBreakdown.breakdown.slice(0, 6).map(cat => {
                    const color = categoryColors[cat.category] || 'bg-gray-500';
                    return (
                        <div
                            key={cat.category}
                            className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg"
                        >
                            <div className={`w-3 h-3 rounded-full ${color}`} />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-400 truncate">{cat.label}</div>
                                <div className="text-sm font-bold text-white">
                                    ${cat.total.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                ({cat.count})
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Monthly equivalent */}
            <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                <span className="text-sm text-gray-500">Monthly average</span>
                <span className="text-lg font-bold text-gray-300">
                    ${(costBreakdown.grandTotal / 12).toFixed(0)}/mo
                </span>
            </div>
        </div>
    );
}
