'use client';

import React, { useState } from 'react';

interface ToolDetail {
    status: string;
    notes?: string;
    confidence?: string;
}

interface ToolCoverageProps {
    coverage: {
        autel: string | null;
        smartpro: string | null;
        lonsdor: string | null;
        vvdi: string | null;
        obdstar?: string | null;
        lock50?: string | null;
        kr55?: string | null;
        yanhua?: string | null;
        keydiy?: string | null;
        cgdi?: string | null;
        details: Record<string, ToolDetail> | null;
    };
    security?: {
        level: string | null;
        obd_supported: boolean;
        bench_required: boolean;
    };
    programming?: {
        method: string | null;
        pin_required: string | null;
        akl_method: string | null;
        akl_supported: string | null;
    };
    eeprom?: {
        chip: string;
        module: string | null;
        location: string | null;
        tools: string | null;
    } | null;
}

function statusColor(status: string | null): string {
    if (!status) return 'bg-zinc-800/40 text-zinc-500 border-zinc-700/30';
    const s = status.toLowerCase();
    if (s === 'yes' || s === 'supported') return 'bg-green-900/30 text-green-400 border-green-700/30';
    if (s === 'limited' || s === 'partial' || s.startsWith('yes')) return 'bg-yellow-900/30 text-yellow-400 border-yellow-700/30';
    if (s === 'no' || s === 'unsupported') return 'bg-red-900/30 text-red-400 border-red-700/30';
    return 'bg-zinc-800/40 text-zinc-400 border-zinc-700/30';
}

function statusIcon(status: string | null): string {
    if (!status) return '—';
    const s = status.toLowerCase();
    if (s === 'yes' || s === 'supported') return '✅';
    if (s === 'limited' || s === 'partial' || s.startsWith('yes')) return '⚠️';
    if (s === 'no' || s === 'unsupported') return '❌';
    return '❓';
}

export default function ToolCoverageBadges({ coverage, security, programming, eeprom }: ToolCoverageProps) {
    const [expanded, setExpanded] = useState(false);

    const primaryTools = [
        { name: 'Autel', status: coverage.autel },
        { name: 'SmartPro', status: coverage.smartpro },
        { name: 'Lonsdor', status: coverage.lonsdor },
        { name: 'VVDI', status: coverage.vvdi },
        { name: 'OBDStar', status: coverage.obdstar || null },
        { name: 'Lock50', status: coverage.lock50 || null },
        { name: 'KR55', status: coverage.kr55 || null },
        { name: 'ACDP', status: coverage.yanhua || null },
        { name: 'KEYDIY', status: coverage.keydiy || null },
        { name: 'CGDI', status: coverage.cgdi || null },
    ];

    const hasAnyTool = primaryTools.some(t => t.status);
    const hasProgramming = programming && (programming.method || programming.akl_method || programming.pin_required);
    const hasDetails = coverage.details && Object.keys(coverage.details).length > 0;

    if (!hasAnyTool && !hasProgramming && !eeprom) return null;

    return (
        <div className="space-y-3">
            {/* Tool Coverage Row */}
            {hasAnyTool && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-zinc-500 text-xs font-medium">🔧 Tool Coverage</span>
                        {hasDetails && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                {expanded ? 'Less ▼' : 'More ▶'}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {primaryTools.map(tool => (
                            <span
                                key={tool.name}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border ${statusColor(tool.status)}`}
                            >
                                {statusIcon(tool.status)} {tool.name}
                                {tool.status && tool.status.toLowerCase() !== 'yes' && tool.status.toLowerCase() !== 'no' && (
                                    <span className="font-normal opacity-70">{tool.status}</span>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* Expanded details */}
                    {expanded && hasDetails && (
                        <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                            {Object.entries(coverage.details!).map(([toolId, detail]) => (
                                <div key={toolId} className="flex items-start gap-2 px-2 py-1.5 bg-zinc-800/30 rounded text-[10px]">
                                    <span className="flex-shrink-0">{statusIcon(detail.status)}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="font-bold text-zinc-300">{toolId}</span>
                                        <span className={`ml-1.5 ${statusColor(detail.status).split(' ')[1]}`}>
                                            {detail.status}
                                        </span>
                                        {detail.notes && (
                                            <p className="text-zinc-500 mt-0.5 leading-tight">{detail.notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Security & Programming Row */}
            {(hasProgramming || security?.level) && (
                <div>
                    <span className="text-zinc-500 text-xs font-medium block mb-1.5">⚙️ Programming</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {programming?.method && (
                            <div className="px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">Method: </span>
                                <span className="text-white font-medium">{programming.method}</span>
                            </div>
                        )}
                        {programming?.pin_required && (
                            <div className="px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">PIN: </span>
                                <span className={programming.pin_required.toLowerCase() === 'yes' ? 'text-yellow-400 font-medium' : 'text-white font-medium'}>
                                    {programming.pin_required}
                                </span>
                            </div>
                        )}
                        {programming?.akl_supported && (
                            <div className="px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">AKL: </span>
                                <span className={`font-medium ${programming.akl_supported.toLowerCase() === 'yes' ? 'text-green-400' : programming.akl_supported.toLowerCase() === 'no' ? 'text-red-400' : 'text-yellow-400'}`}>
                                    {programming.akl_supported}
                                </span>
                            </div>
                        )}
                        {programming?.akl_method && (
                            <div className="px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">AKL Method: </span>
                                <span className="text-white font-medium">{programming.akl_method}</span>
                            </div>
                        )}
                        {security?.level && (
                            <div className="px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">Security: </span>
                                <span className={`font-medium ${security.level === 'critical' ? 'text-red-400' : security.level === 'high' ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {security.level.charAt(0).toUpperCase() + security.level.slice(1)}
                                </span>
                            </div>
                        )}
                        {security && (
                            <>
                                {security.bench_required && (
                                    <div className="px-2 py-1 bg-red-900/20 rounded border border-red-700/20">
                                        <span className="text-red-400 font-medium">⚠️ Bench Required</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* EEPROM Section */}
            {eeprom && (
                <div>
                    <span className="text-zinc-500 text-xs font-medium block mb-1.5">🔬 EEPROM / Bench</span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="px-2 py-1 bg-zinc-800/40 rounded">
                            <span className="text-zinc-500">Chip: </span>
                            <span className="text-cyan-400 font-mono font-medium">{eeprom.chip}</span>
                        </div>
                        {eeprom.module && (
                            <div className="px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">Module: </span>
                                <span className="text-white font-medium">{eeprom.module}</span>
                            </div>
                        )}
                        {eeprom.location && (
                            <div className="col-span-2 px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">📍 </span>
                                <span className="text-white">{eeprom.location}</span>
                            </div>
                        )}
                        {eeprom.tools && (
                            <div className="col-span-2 px-2 py-1 bg-zinc-800/40 rounded">
                                <span className="text-zinc-500">Tools: </span>
                                <span className="text-white">{eeprom.tools}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
