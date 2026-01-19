'use client';

import React from 'react';
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
        requirements?: string[];
    };
    toolsToShow?: string[];
}

export default function VehicleProcedures({
    procedures,
    toolsToShow = ['AutoProPad', 'Autel', 'SmartPro']
}: VehicleProceduresProps) {
    const hasAddKey = procedures?.addKey && (procedures.addKey.steps?.length || 0) > 0;
    const hasAkl = procedures?.akl && (procedures.akl.steps?.length || 0) > 0;
    const hasRequirements = (procedures?.requirements?.length || 0) > 0;

    return (
        <div className="space-y-6">
            {/* Tool Status Section */}
            <div className="glass p-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    Your Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                    {toolsToShow.map(tool => (
                        <ToolStatusBadge key={tool} toolName={tool} />
                    ))}
                </div>
            </div>

            {/* Requirements */}
            {hasRequirements && (
                <div className="glass p-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">
                        Requirements
                    </h3>
                    <ul className="space-y-1">
                        {procedures?.requirements?.map((req, i) => (
                            <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                                <span className="text-purple-400">✓</span> {req}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Procedures Grid */}
            {(hasAddKey || hasAkl) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {hasAddKey && (
                        <ProcedureCard
                            title="Add Key Procedure"
                            icon="🔑"
                            procedure={procedures!.addKey!}
                        />
                    )}
                    {hasAkl && (
                        <ProcedureCard
                            title="All Keys Lost (AKL)"
                            icon="🚨"
                            procedure={procedures!.akl!}
                            isAkl
                        />
                    )}
                </div>
            )}

            {/* No Procedures Message */}
            {!hasAddKey && !hasAkl && (
                <div className="glass p-8 text-center text-zinc-500">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No procedure data available for this vehicle yet.</p>
                    <p className="text-sm mt-1">Check back soon or contribute to our database.</p>
                </div>
            )}
        </div>
    );
}

function ProcedureCard({
    title,
    icon,
    procedure,
    isAkl = false
}: {
    title: string;
    icon: string;
    procedure: Procedure;
    isAkl?: boolean;
}) {
    const riskColors: Record<string, string> = {
        low: 'bg-green-900/40 text-green-400 border-green-700/30',
        medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/30',
        high: 'bg-red-900/40 text-red-400 border-red-700/30',
    };

    const risk = procedure.risk_level || 'medium';

    return (
        <div className={`glass p-5 ${isAkl ? 'border-red-900/50' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${riskColors[risk]}`}>
                    {risk} risk
                </span>
            </div>

            {/* Time estimate */}
            {procedure.time_minutes && (
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                    <span>⏱️</span>
                    <span>~{procedure.time_minutes} minutes</span>
                </div>
            )}

            {/* Menu path */}
            {procedure.menu_path && (
                <div className="mb-4 p-2 bg-zinc-800/50 rounded text-xs font-mono text-zinc-400">
                    {procedure.menu_path}
                </div>
            )}

            {/* Steps */}
            {procedure.steps && procedure.steps.length > 0 && (
                <ol className="space-y-2">
                    {procedure.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-900/40 text-purple-300 flex items-center justify-center text-xs font-bold">
                                {i + 1}
                            </span>
                            <span className="text-zinc-300 pt-0.5">{step}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
