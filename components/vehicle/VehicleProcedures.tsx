'use client';

import React, { useState } from 'react';
import ToolStatusBadge from '@/components/shared/ToolStatusBadge';

interface Procedure {
    title?: string;
    time_minutes?: number;
    risk_level?: 'low' | 'medium' | 'high';
    steps?: string[];
    requirements?: string[];
    menu_path?: string;
}

interface VehicleProceduresProps {
    procedures?: {
        addKey?: Procedure;
        akl?: Procedure;
    };
    toolsToShow?: string[];
}

export default function VehicleProcedures({
    procedures,
    toolsToShow = ['AutoProPad', 'Autel', 'SmartPro']
}: VehicleProceduresProps) {
    const [activeTab, setActiveTab] = useState<'addKey' | 'akl'>('addKey');

    const hasAddKey = procedures?.addKey && (procedures.addKey.steps?.length || 0) > 0;
    const hasAkl = procedures?.akl && (procedures.akl.steps?.length || 0) > 0;

    // If no procedures, show a polished placeholder with clickable tabs
    if (!hasAddKey && !hasAkl) {
        return (
            <div className="space-y-6">
                {/* Clickable Procedure Tabs - both show same "Coming Soon" */}
                <div className="flex border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('addKey')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'addKey'
                                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        🔑 Add Smart Key
                    </button>
                    <button
                        onClick={() => setActiveTab('akl')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'akl'
                                ? 'border-red-500 text-red-400 bg-red-500/10'
                                : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        🚨 All Keys Lost (AKL)
                    </button>
                </div>

                {/* Placeholder Message */}
                <div className="glass p-8 text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-zinc-300 font-semibold">Procedure Data Coming Soon</p>
                    <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
                        Detailed step-by-step programming instructions for this vehicle are being curated.
                        Check back soon or contribute your knowledge!
                    </p>
                    <a
                        href="/guides"
                        className="inline-block mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded-lg transition-colors"
                    >
                        Browse Available Guides →
                    </a>
                </div>

                {/* Tool Status Section */}
                <div className="glass p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            🛠️ Platform Support Status
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {toolsToShow.map(tool => (
                            <ToolStatusBadge key={tool} toolName={tool} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const procedure = activeTab === 'addKey' ? procedures?.addKey : procedures?.akl;

    return (
        <div className="space-y-6">
            {/* Procedure Tabs */}
            <div className="flex border-b border-zinc-800">
                {hasAddKey && (
                    <button
                        onClick={() => setActiveTab('addKey')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'addKey'
                            ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        🔑 Add Smart Key
                    </button>
                )}
                {hasAkl && (
                    <button
                        onClick={() => setActiveTab('akl')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'akl'
                            ? 'border-red-500 text-red-400 bg-red-500/5'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        🚨 All Keys Lost (AKL)
                    </button>
                )}
            </div>

            {/* Requirements Section */}
            <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">✅ Requirements</span>
                        <div className="flex flex-wrap gap-2">
                            {(procedure?.requirements || ['CAN FD Adapter', 'Battery Maintainer', 'Internet Connection']).map((req, i) => (
                                <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300 font-medium">
                                    {req}
                                </span>
                            ))}
                        </div>
                    </div>
                    {procedure?.time_minutes && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <span>⏱️</span>
                            <span>~{procedure.time_minutes} mins</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4">
                {procedure?.menu_path && (
                    <div className="p-3 bg-zinc-900/80 rounded-lg font-mono text-xs text-purple-300 border border-purple-900/20">
                        <span className="text-zinc-500 mr-2">Path:</span>
                        {procedure.menu_path}
                    </div>
                )}

                <div className="grid gap-4">
                    {procedure?.steps?.map((step, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-zinc-800/20 transition-all border border-transparent hover:border-zinc-800 group">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${activeTab === 'akl' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                {i + 1}
                            </div>
                            <div className="pt-1">
                                <p className="text-zinc-200 text-sm leading-relaxed">{step}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tool Status Section */}
            <div className="glass p-4 mt-8">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        🛠️ Platform Support Status
                    </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {toolsToShow.map(tool => (
                        <ToolStatusBadge key={tool} toolName={tool} />
                    ))}
                </div>
            </div>
        </div>
    );
}

