'use client';

import React, { useState } from 'react';

interface PearlRendererProps {
    content: string;
    maxLength?: number; // Collapse if longer than this
}

/**
 * Renders pearl content with smart formatting:
 * - Detects and renders tables
 * - Highlights critical warnings
 * - Handles line breaks
 * - Collapsible for long content
 */
export default function PearlRenderer({ content, maxLength = 400 }: PearlRendererProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!content) return null;

    // Parse and format the content
    const formattedContent = formatPearlContent(content);
    const isLong = content.length > maxLength;
    const shouldTruncate = isLong && !isExpanded;

    return (
        <div className="pearl-content">
            <div className={`text-sm text-zinc-300 leading-relaxed ${shouldTruncate ? 'max-h-32 overflow-hidden relative' : ''}`}>
                {formattedContent}
                {shouldTruncate && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900/90 to-transparent" />
                )}
            </div>
            {isLong && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition"
                >
                    {isExpanded ? '▲ Show less' : '▼ Read more'}
                </button>
            )}
        </div>
    );
}

/**
 * Smart formatting for pearl content
 * Detects tables, warnings, and applies proper formatting
 */
function formatPearlContent(content: string): React.ReactNode {
    const parts: React.ReactNode[] = [];

    // Check for table-like content (concatenated columns without spaces)
    // Pattern: "ChassisModelProduction" suggests table headers merged together
    const hasTableContent = /[a-z][A-Z][a-z]+[A-Z]/.test(content) &&
        (content.includes('Production') || content.includes('Type') || content.includes('System'));

    // Extract Critical Warning if present
    const criticalWarningMatch = content.match(/Critical Warning:(.+?)(?:\.|$)/);
    const criticalWarning = criticalWarningMatch ? criticalWarningMatch[0] : null;

    // Remove critical warning from main content for separate rendering
    let mainContent = criticalWarning
        ? content.replace(criticalWarning, '').trim()
        : content;

    // Try to parse table content
    if (hasTableContent) {
        const tableResult = parseTableContent(mainContent);
        if (tableResult.table) {
            parts.push(
                <div key="intro" className="mb-3">
                    {tableResult.intro}
                </div>
            );
            parts.push(tableResult.table);
            if (tableResult.remaining.trim()) {
                parts.push(
                    <div key="remaining" className="mt-3">
                        {tableResult.remaining}
                    </div>
                );
            }
        } else {
            // Fallback: just render with line breaks
            parts.push(renderWithLineBreaks(mainContent));
        }
    } else {
        // Regular content - render with basic formatting
        parts.push(renderWithLineBreaks(mainContent));
    }

    // Add critical warning at the end with special styling
    if (criticalWarning) {
        parts.push(
            <div key="warning" className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                <span className="text-red-400 font-semibold">⚠️ {criticalWarning}</span>
            </div>
        );
    }

    return <>{parts}</>;
}

/**
 * Attempt to parse table-like content
 */
function parseTableContent(content: string): {
    intro: string;
    table: React.ReactNode | null;
    remaining: string;
} {
    // Try to identify the BDC2/BDC3 table pattern
    // Pattern: "ChassisModelProduction YearsSystemMCU TypeG11/G127 Series2015..."

    // Check for known table pattern
    const bdcTableMatch = content.match(
        /ChassisModel(?:Production Years?|Years)System(?:MCU Type|MCU|Type)([\s\S]+?)(?:Production Years|Critical Warning|$)/i
    );

    if (bdcTableMatch) {
        // Extract intro text
        const introEnd = content.indexOf('Chassis');
        const intro = introEnd > 0 ? content.substring(0, introEnd).trim() : '';

        // Try to parse the table data
        const tableData = extractBdcTable(content);

        if (tableData && tableData.length > 0) {
            return {
                intro,
                table: (
                    <div key="table" className="my-3 overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-zinc-800/60">
                                    <th className="px-2 py-1.5 text-left text-zinc-400 border border-zinc-700/50">Chassis</th>
                                    <th className="px-2 py-1.5 text-left text-zinc-400 border border-zinc-700/50">Model</th>
                                    <th className="px-2 py-1.5 text-left text-zinc-400 border border-zinc-700/50">Years</th>
                                    <th className="px-2 py-1.5 text-left text-zinc-400 border border-zinc-700/50">System</th>
                                    <th className="px-2 py-1.5 text-left text-zinc-400 border border-zinc-700/50">MCU</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-800/20'}>
                                        <td className="px-2 py-1 text-white border border-zinc-700/30 font-mono">{row.chassis}</td>
                                        <td className="px-2 py-1 text-zinc-300 border border-zinc-700/30">{row.model}</td>
                                        <td className="px-2 py-1 text-zinc-300 border border-zinc-700/30">{row.years}</td>
                                        <td className={`px-2 py-1 border border-zinc-700/30 font-semibold ${row.system === 'BDC3' ? 'text-green-400' : 'text-amber-400'}`}>
                                            {row.system}
                                        </td>
                                        <td className="px-2 py-1 text-zinc-400 border border-zinc-700/30 font-mono text-[10px]">{row.mcu}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ),
                remaining: ''
            };
        }
    }

    return { intro: content, table: null, remaining: '' };
}

/**
 * Extract BDC table data from concatenated string
 */
function extractBdcTable(content: string): Array<{
    chassis: string;
    model: string;
    years: string;
    system: string;
    mcu: string;
}> | null {
    // Known BDC patterns to match
    const patterns = [
        { chassis: 'G11/G12', model: '7 Series', years: '2015 - 02/2019', system: 'BDC2', mcu: 'MPC5777C' },
        { chassis: 'G11/G12', model: '7 Series (LCI)', years: '03/2019 - 2022', system: 'BDC3', mcu: 'Renesas/NXP' },
        { chassis: 'G30/G31', model: '5 Series', years: '2017 - 2019', system: 'BDC2', mcu: 'MPC5777C' },
        { chassis: 'G30/G31', model: '5 Series (LCI)', years: '2020 - 2023', system: 'BDC3', mcu: 'Renesas/NXP' },
        { chassis: 'G32', model: '6 GT', years: '2017 - 2020', system: 'BDC2', mcu: 'MPC5777C' },
        { chassis: 'F90', model: 'M5', years: '2018 - 2020', system: 'BDC2', mcu: 'MPC5777C' },
        { chassis: 'G01', model: 'X3', years: '2017 - 07/2021', system: 'BDC2', mcu: 'MPC5777C' },
        { chassis: 'G02', model: 'X4', years: '2018 - 07/2021', system: 'BDC2', mcu: 'MPC5777C' },
        { chassis: 'G05', model: 'X5', years: '2019 - Present', system: 'BDC3', mcu: 'Renesas/NXP' },
        { chassis: 'G20', model: '3 Series', years: '2019 - Present', system: 'BDC3', mcu: 'Renesas/NXP' },
        { chassis: 'G07', model: 'X7', years: '2019 - Present', system: 'BDC3', mcu: 'Renesas/NXP' },
        { chassis: 'G22/G23', model: '4 Series', years: '2020 - Present', system: 'BDC3', mcu: 'Renesas/NXP' },
    ];

    // Check if this content contains BDC table data
    if (content.includes('G11') || content.includes('G20') || content.includes('BDC2') || content.includes('BDC3')) {
        return patterns.filter(p =>
            content.includes(p.chassis) || content.includes(p.model)
        );
    }

    return null;
}

/**
 * Render text with proper line breaks
 */
function renderWithLineBreaks(text: string): React.ReactNode {
    // Split on double spaces or actual line breaks
    const lines = text.split(/\s{2,}|\n/).filter(line => line.trim());

    if (lines.length <= 1) {
        return <span>{text}</span>;
    }

    return (
        <div className="space-y-2">
            {lines.map((line, i) => (
                <p key={i}>{line}</p>
            ))}
        </div>
    );
}
