'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    AVAILABLE_TOOLS,
    BUSINESS_PROFILE_UPDATED_EVENT,
    loadBusinessProfile,
    saveBusinessProfile
} from '@/lib/businessTypes';
import {
    getCoverageFamilyForToolId,
    getStatusBadgeClass,
    getVehicleCoverage,
    getVehicleCoverageAsync,
    VehicleCoverageResult,
    VehicleToolCoverage
} from '@/lib/toolCoverage';
import {
    CapabilityAction,
    CapabilityState,
    getToolVehicleCapabilities,
    updateVehicleToolCapabilities
} from '@/lib/vehicleToolCapabilities';

interface ToolCoverageSidebarProps {
    make: string;
    model: string;
    year: number;
    intelligence?: any;
}

const CAPABILITY_ACTIONS: Array<{ key: CapabilityAction; label: string }> = [
    { key: 'add_key', label: 'Add Key' },
    { key: 'akl', label: 'AKL' },
    { key: 'ecu_reprogram', label: 'ECU Reprogram' },
];

const CAPABILITY_LABELS: Record<CapabilityState, string> = {
    yes: 'Yes',
    no: 'No',
    unknown: 'Unknown',
};

function nextCapabilityState(state: CapabilityState): CapabilityState {
    if (state === 'unknown') return 'yes';
    if (state === 'yes') return 'no';
    return 'unknown';
}

export default function ToolCoverageSidebar({ make, model, year, intelligence }: ToolCoverageSidebarProps) {
    const [coverage, setCoverage] = useState<VehicleCoverageResult>(() => getVehicleCoverage(make, model, year));
    const [businessProfile, setBusinessProfile] = useState(() => loadBusinessProfile());

    useEffect(() => {
        let cancelled = false;
        setCoverage(getVehicleCoverage(make, model, year));

        getVehicleCoverageAsync(make, model, year)
            .then((result) => {
                if (!cancelled) setCoverage(result);
            })
            .catch((err) => {
                console.warn('Failed to fetch async vehicle coverage:', err);
            });

        return () => {
            cancelled = true;
        };
    }, [make, model, year]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const refresh = () => setBusinessProfile(loadBusinessProfile());
        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'eurokeys_business_profile') refresh();
        };

        window.addEventListener(BUSINESS_PROFILE_UPDATED_EVENT, refresh as EventListener);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener(BUSINESS_PROFILE_UPDATED_EVENT, refresh as EventListener);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const familyCoverageMap = useMemo(() => {
        return new Map(coverage.tools.map(tool => [tool.key, tool]));
    }, [coverage.tools]);

    const ownedTools = useMemo(() => {
        const toolIds = [...new Set(businessProfile.tools || [])];
        return toolIds
            .map(id => AVAILABLE_TOOLS.find(tool => tool.id === id))
            .filter((tool): tool is (typeof AVAILABLE_TOOLS)[number] => Boolean(tool));
    }, [businessProfile.tools]);

    const ownedFamilies = useMemo(() => {
        return new Set(
            ownedTools
                .map(tool => getCoverageFamilyForToolId(tool.id))
                .filter((family): family is VehicleToolCoverage['key'] => Boolean(family))
        );
    }, [ownedTools]);

    const otherFamilyTools = useMemo(() => {
        return coverage.tools.filter(tool => !ownedFamilies.has(tool.key));
    }, [coverage.tools, ownedFamilies]);

    const updateCapability = (toolId: string, action: CapabilityAction) => {
        const current = getToolVehicleCapabilities(
            businessProfile.vehicleToolCapabilities,
            make,
            model,
            year,
            toolId
        );
        const currentState = current?.[action] || 'unknown';
        const next = nextCapabilityState(currentState);

        const updatedProfile = {
            ...businessProfile,
            vehicleToolCapabilities: updateVehicleToolCapabilities(businessProfile.vehicleToolCapabilities, {
                make,
                model,
                year,
                toolId,
                changes: { [action]: next },
            }),
        };

        setBusinessProfile(updatedProfile);
        saveBusinessProfile(updatedProfile);
    };

    const updateCapabilityNote = (toolId: string, note: string) => {
        const updatedProfile = {
            ...businessProfile,
            vehicleToolCapabilities: updateVehicleToolCapabilities(businessProfile.vehicleToolCapabilities, {
                make,
                model,
                year,
                toolId,
                note,
            }),
        };

        setBusinessProfile(updatedProfile);
        saveBusinessProfile(updatedProfile);
    };

    // VI tool coverage data
    const viCoverage = intelligence?.tool_coverage;
    // Per-tool details: first try tool_coverage.details, then merge from key_configs
    const viPerTool = useMemo(() => {
        // Primary: tool_coverage.details from VI materialized view
        if (viCoverage?.details && Object.keys(viCoverage.details).length > 0) {
            return viCoverage.details;
        }
        // Fallback: merge tools from all key_configs
        const keyConfigs = intelligence?.key_configs;
        if (keyConfigs && Array.isArray(keyConfigs)) {
            const merged: Record<string, { status: string; notes?: string; family?: string }> = {};
            for (const kc of keyConfigs) {
                if (!kc.tools) continue;
                for (const [toolId, info] of Object.entries(kc.tools)) {
                    if (!merged[toolId]) {
                        merged[toolId] = info as { status: string; notes?: string; family?: string };
                    }
                }
            }
            if (Object.keys(merged).length > 0) return merged;
        }
        return null;
    }, [viCoverage, intelligence?.key_configs]);
    const [showPerTool, setShowPerTool] = React.useState(false);

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    🔧 Tool Coverage
                </h3>
                <Link
                    href="/business/tools?tab=coverage"
                    className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                    View Map →
                </Link>
            </div>

            {/* VI Description + Critical Alert */}
            {intelligence?.field_intel?.description && (
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {intelligence.field_intel.description}
                </p>
            )}
            {intelligence?.field_intel?.critical_alert && (
                <div className="p-2 mb-3 rounded-lg border border-red-500/30 bg-red-950/20">
                    <span className="text-red-400 font-bold text-[10px]">⚠️ CRITICAL: </span>
                    <span className="text-red-300 text-[10px]">{intelligence.field_intel.critical_alert}</span>
                </div>
            )}

            {/* VI Family Status Badges */}
            {viCoverage && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                        { key: 'autel', label: 'Autel', val: viCoverage.autel, color: 'red' },
                        { key: 'smartpro', label: 'Smart Pro', val: viCoverage.smartpro, color: 'gray' },
                        { key: 'lonsdor', label: 'Lonsdor', val: viCoverage.lonsdor, color: 'purple' },
                        { key: 'vvdi', label: 'VVDI', val: viCoverage.vvdi, color: 'amber' },
                    ].map(fam => {
                        if (!fam.val) return null;
                        const isYes = fam.val.toLowerCase().startsWith('yes');
                        const isInferred = fam.val.toLowerCase().includes('inferred');
                        return (
                            <div key={fam.key} className={`flex items-center justify-between px-2.5 py-2 rounded-lg border ${isYes ? 'bg-emerald-950/30 border-emerald-700/30' : 'bg-amber-950/20 border-amber-700/20'
                                }`}>
                                <span className="text-xs font-medium text-zinc-300">{fam.label}</span>
                                <span className={`text-[10px] font-bold ${isYes ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                    {isYes ? '✓' : '△'} {fam.val.replace(' (inferred)', '')}
                                    {isInferred && <span className="text-zinc-500 ml-0.5">*</span>}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Per-tool expansion */}
            {viPerTool && (() => {
                let parsedTools: Record<string, { status: string; notes?: string }> = {};
                try { parsedTools = typeof viPerTool === 'string' ? JSON.parse(viPerTool) : viPerTool; } catch { /* ignore */ }
                const toolEntries = Object.entries(parsedTools);
                if (toolEntries.length === 0) return null;
                const displayTools = showPerTool ? toolEntries : toolEntries.slice(0, 4);
                return (
                    <div className="mb-4">
                        <div className="space-y-1">
                            {displayTools.map(([tid, info]) => (
                                <div key={tid} className="flex items-center justify-between px-2 py-1.5 rounded bg-zinc-800/40 text-[10px]">
                                    <span className="text-zinc-400 font-mono">{tid.replace(/_/g, ' ')}</span>
                                    <span className={info.status?.toLowerCase().startsWith('yes') ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                        {info.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {toolEntries.length > 4 && (
                            <button
                                onClick={() => setShowPerTool(!showPerTool)}
                                className="text-[10px] text-amber-500 hover:text-amber-400 mt-1 transition-colors"
                            >
                                {showPerTool ? 'Less ▲' : `+${toolEntries.length - 4} more ▼`}
                            </button>
                        )}
                    </div>
                );
            })()}

            {!coverage.found && !viCoverage && (
                <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
                    ⚠️ No coverage data found for this vehicle configuration.
                </div>
            )}

            {ownedTools.length > 0 ? (
                <div className="space-y-3">
                    {ownedTools.map((tool) => {
                        const family = getCoverageFamilyForToolId(tool.id);
                        const familyCoverage = family ? familyCoverageMap.get(family) : undefined;
                        const capability = getToolVehicleCapabilities(
                            businessProfile.vehicleToolCapabilities,
                            make,
                            model,
                            year,
                            tool.id
                        );

                        return (
                            <OwnedToolCard
                                key={tool.id}
                                toolId={tool.id}
                                toolName={tool.name}
                                icon={tool.icon}
                                status={familyCoverage?.status || ''}
                                capability={capability}
                                onCycle={(action) => updateCapability(tool.id, action)}
                                onSaveNote={(note) => updateCapabilityNote(tool.id, note)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
                    Add your owned tools to save AKL/Add Key/ECU capabilities for this vehicle.
                </div>
            )}

            {otherFamilyTools.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Other Families
                    </div>
                    {otherFamilyTools.map((tool) => (
                        <FamilyToolCard key={tool.key} tool={tool} />
                    ))}
                </div>
            )}
        </div>
    );
}

function OwnedToolCard({
    toolId,
    toolName,
    icon,
    status,
    capability,
    onCycle,
    onSaveNote,
}: {
    toolId: string;
    toolName: string;
    icon: string;
    status: string;
    capability?: {
        add_key?: CapabilityState;
        akl?: CapabilityState;
        ecu_reprogram?: CapabilityState;
        note?: string;
    };
    onCycle: (action: CapabilityAction) => void;
    onSaveNote: (note: string) => void;
}) {
    const [noteDraft, setNoteDraft] = useState(capability?.note || '');

    useEffect(() => {
        setNoteDraft(capability?.note || '');
    }, [capability?.note]);

    return (
        <div className="p-3 rounded-xl border bg-green-900/20 border-green-700/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <div>
                        <div className="font-semibold text-white text-sm">{toolName}</div>
                        <span className="text-xs text-green-400 font-semibold">✓ OWNED</span>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusBadgeClass(status)}`}>
                    {status || 'Unknown'}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5 mt-2">
                {CAPABILITY_ACTIONS.map((action) => {
                    const state = capability?.[action.key] || 'unknown';
                    return (
                        <button
                            key={`${toolId}-${action.key}`}
                            onClick={() => onCycle(action.key)}
                            className={`w-full text-left rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${getCapabilityClass(state)}`}
                            title="Tap to cycle: Unknown → Yes → No"
                        >
                            {action.label}: {CAPABILITY_LABELS[state]}
                        </button>
                    );
                })}
            </div>

            <div className="mt-2">
                <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onBlur={() => onSaveNote(noteDraft)}
                    placeholder="Tool note (e.g., Not updated KM100)"
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
            </div>
        </div>
    );
}

function FamilyToolCard({ tool }: { tool: VehicleToolCoverage }) {
    return (
        <div className="p-2.5 rounded-lg border bg-gray-800/30 border-gray-700/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm">{tool.icon}</span>
                    <span className="text-xs text-gray-300 font-medium">{tool.name}</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeClass(tool.status)}`}>
                    {tool.status || 'Unknown'}
                </div>
            </div>
        </div>
    );
}

function getCapabilityClass(state: CapabilityState): string {
    if (state === 'yes') return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
    if (state === 'no') return 'bg-red-500/20 border-red-500/40 text-red-300';
    return 'bg-zinc-800/40 border-zinc-700/60 text-zinc-400 hover:border-zinc-600';
}
