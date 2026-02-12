'use client';

import React, { useState, useMemo } from 'react';
import ToolStatusBadge from '@/components/shared/ToolStatusBadge';
import { parseProcedureContent, ProcedureSection, ProcedureStep } from '@/lib/procedureParser';

interface Procedure {
    title?: string;
    time_minutes?: number;
    risk_level?: 'low' | 'medium' | 'high';
    steps?: string[];
    requirements?: string[];
    menu_path?: string;
    pearls?: any[]; // Contextual pearls for this procedure
    rawText?: string; // Raw text to parse into sections/steps
}

interface VehicleProceduresProps {
    procedures?: {
        addKey?: Procedure;
        akl?: Procedure;
    };
    toolsToShow?: string[];
}

// Collapsible pearl tags - shows compact summary, expands on click
function CollapsiblePearls({ pearls }: { pearls: any[] }) {
    const [expanded, setExpanded] = useState(false);

    if (!pearls || pearls.length === 0) return null;

    // Separate critical from info pearls
    const criticalPearls = pearls.filter(p => p.is_critical || p.risk === 'critical');
    const infoPearls = pearls.filter(p => !p.is_critical && p.risk !== 'critical');

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {/* Critical warning tag - always visible as small badge */}
            {criticalPearls.length > 0 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="px-2 py-1 text-[10px] font-bold rounded-full bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50 transition-all flex items-center gap-1"
                >
                    ⚠️ {criticalPearls.length} Warning{criticalPearls.length > 1 ? 's' : ''}
                    <span className="opacity-60">{expanded ? '▼' : '▶'}</span>
                </button>
            )}

            {/* Info tips tag */}
            {infoPearls.length > 0 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="px-2 py-1 text-[10px] font-bold rounded-full bg-amber-900/30 text-amber-400 border border-amber-700/30 hover:bg-amber-900/50 transition-all flex items-center gap-1"
                >
                    💡 {infoPearls.length} Tip{infoPearls.length > 1 ? 's' : ''}
                    <span className="opacity-60">{expanded ? '▼' : '▶'}</span>
                </button>
            )}

            {/* Expanded content */}
            {expanded && (
                <div className="w-full mt-2 space-y-2">
                    {pearls.map((pearl, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-lg border text-xs ${pearl.is_critical || pearl.risk === 'critical'
                                ? 'bg-red-900/10 border-red-800/30 text-red-200'
                                : 'bg-amber-900/10 border-amber-800/30 text-amber-200'
                                }`}
                        >
                            <span className="mr-1">{pearl.is_critical || pearl.risk === 'critical' ? '⚠️' : '💡'}</span>
                            {pearl.content || pearl.pearl_content}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Tool badge for step-level tool indicators
function ToolBadge({ tool }: { tool: string }) {
    const colors: Record<string, string> = {
        'Autel': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Xhorse': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Smart Pro': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Lonsdor': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };

    const colorClass = Object.entries(colors).find(([key]) => typeof tool === 'string' && tool.includes(key))?.[1] || 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30';

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${colorClass}`}>
            🛠️ {tool}
        </span>
    );
}

// Render a single procedure section with steps
function ProcedureSectionView({
    section,
    isAkl = false,
    showSectionTitle = true
}: {
    section: ProcedureSection;
    isAkl?: boolean;
    showSectionTitle?: boolean;
}) {
    const stepColor = isAkl ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400';

    return (
        <div className="space-y-4">
            {showSectionTitle && section.title && (
                <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-zinc-300">{section.title}</h4>
                    {section.tool && <ToolBadge tool={section.tool} />}
                </div>
            )}

            <div className="grid gap-2 md:gap-3">
                {section.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 md:gap-4 p-2 md:p-4 rounded-xl hover:bg-zinc-800/20 transition-all border border-transparent hover:border-zinc-800 group">
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold shrink-0 ${stepColor}`}>
                            {step.stepNumber || i + 1}
                        </div>
                        <div className="flex-1 pt-0.5 md:pt-1">
                            <div className="flex flex-wrap items-start gap-2">
                                {step.tool && <ToolBadge tool={step.tool} />}
                            </div>
                            <p className="text-zinc-200 text-xs md:text-sm leading-relaxed mt-0.5 md:mt-1">
                                {typeof step.content === 'string'
                                    ? step.content
                                    : typeof step.content === 'object' && step.content !== null
                                        ? (step.content as any).content || (step.content as any).text || JSON.stringify(step.content)
                                        : String(step.content ?? '')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Section notes */}
            {section.notes && section.notes.length > 0 && (
                <div className="mt-4 p-3 bg-amber-900/10 border border-amber-800/30 rounded-lg">
                    <div className="text-xs font-bold text-amber-400 mb-1">📝 Important Notes</div>
                    {section.notes.map((note, i) => (
                        <p key={i} className="text-xs text-amber-200/80">{note}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

// Parse raw procedure text and convert steps to parsed sections
function useParsedProcedure(procedure: Procedure | undefined, type: 'add_key' | 'akl') {
    return useMemo(() => {
        if (!procedure) return null;

        // If we have rawText, parse it
        if (procedure.rawText) {
            const parsed = parseProcedureContent(procedure.rawText);
            return parsed;
        }

        // If we have steps as flat array, convert to sections
        if (procedure.steps && procedure.steps.length > 0) {
            // Check if steps are raw text (long strings) or already parsed
            const isRawText = procedure.steps.some(s => typeof s === 'string' && (s.length > 200 || s.includes('Section')));

            if (isRawText) {
                // Parse the concatenated steps
                const parsed = parseProcedureContent(procedure.steps.join('\n'));
                return parsed;
            }

            // Already clean steps - create a single section
            const section: ProcedureSection = {
                title: type === 'akl' ? 'All Keys Lost' : 'Add Key',
                type,
                steps: procedure.steps.map((step, i) => ({
                    stepNumber: i + 1,
                    content: step,
                })),
            };

            return {
                sections: [section],
                detectedTools: [],
                requirements: procedure.requirements,
            };
        }

        return null;
    }, [procedure, type]);
}

export default function VehicleProcedures({
    procedures,
    toolsToShow = ['AutoProPad', 'Autel', 'SmartPro']
}: VehicleProceduresProps) {
    const [activeTab, setActiveTab] = useState<'addKey' | 'akl'>('addKey');
    const [activeTool, setActiveTool] = useState<string | null>(null);

    // Parse both procedures
    const parsedAddKey = useParsedProcedure(procedures?.addKey, 'add_key');
    const parsedAkl = useParsedProcedure(procedures?.akl, 'akl');

    // Check if we have relevant sections for each tab (matching type OR general)
    const hasAddKey = parsedAddKey && parsedAddKey.sections.some(
        s => s.type === 'add_key' || s.type === 'general'
    );
    const hasAkl = parsedAkl && parsedAkl.sections.some(
        s => s.type === 'akl' || s.type === 'general'
    );

    // Get current parsed procedure based on active tab
    const currentParsed = activeTab === 'addKey' ? parsedAddKey : parsedAkl;
    const currentProcedure = activeTab === 'addKey' ? procedures?.addKey : procedures?.akl;

    // Get detected tools for current procedure
    const detectedTools = currentParsed?.detectedTools || [];
    const requirements = currentParsed?.requirements || currentProcedure?.requirements || [];

    // Filter sections by type to match active tab, then group by tool
    const toolSections = useMemo(() => {
        if (!currentParsed?.sections) return {};

        // Map activeTab to section type
        const targetType = activeTab === 'addKey' ? 'add_key' : 'akl';

        // Filter sections that match the target type OR are general (applies to both)
        const filteredSections = currentParsed.sections.filter(
            section => section.type === targetType || section.type === 'general'
        );

        const groups: Record<string, ProcedureSection[]> = {};

        for (const section of filteredSections) {
            const tool = section.tool || 'General';
            if (!groups[tool]) groups[tool] = [];
            groups[tool].push(section);
        }

        return groups;
    }, [currentParsed, activeTab]);

    const toolNames = Object.keys(toolSections);

    // Set default active tool
    if (activeTool === null && toolNames.length > 0) {
        setActiveTool(toolNames[0]);
    }

    // If no procedures, show a polished placeholder with clickable tabs
    // Check if we have contextual pearls even without parsed procedures
    const addKeyHasPearls = procedures?.addKey?.pearls && procedures.addKey.pearls.length > 0;
    const aklHasPearls = procedures?.akl?.pearls && procedures.akl.pearls.length > 0;

    if (!hasAddKey && !hasAkl) {
        // Get pearls for the active tab
        const currentTabPearls = activeTab === 'addKey'
            ? procedures?.addKey?.pearls
            : procedures?.akl?.pearls;

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
                        {addKeyHasPearls && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-600/30 text-amber-400">
                                {procedures!.addKey!.pearls!.length} tips
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('akl')}
                        className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'akl'
                            ? 'border-red-500 text-red-400 bg-red-500/10'
                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        🚨 All Keys Lost (AKL)
                        {aklHasPearls && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-600/30 text-amber-400">
                                {procedures!.akl!.pearls!.length} tips
                            </span>
                        )}
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
                        href="/dossiers"
                        className="inline-block mt-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-sm rounded-lg transition-colors"
                    >
                        Browse Available Dossiers →
                    </a>
                </div>

                {/* Contextual pearls as tips — available even without full procedures */}
                {currentTabPearls && currentTabPearls.length > 0 && (
                    <CollapsiblePearls pearls={currentTabPearls} />
                )}

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

    return (
        <div className="space-y-6">
            {/* Procedure Type Tabs (Add Key / AKL) */}
            <div className="flex border-b border-zinc-800">
                {hasAddKey && (
                    <button
                        onClick={() => { setActiveTab('addKey'); setActiveTool(null); }}
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
                        onClick={() => { setActiveTab('akl'); setActiveTool(null); }}
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
                            {(requirements.length > 0 ? requirements : ['CAN FD Adapter', 'Battery Maintainer', 'Internet Connection']).map((req, i) => (
                                <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300 font-medium">
                                    {req}
                                </span>
                            ))}
                        </div>
                    </div>
                    {currentProcedure?.time_minutes && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <span>⏱️</span>
                            <span>~{currentProcedure.time_minutes} mins</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Contextual Pearls - Compact collapsible tags */}
            {currentProcedure?.pearls && currentProcedure.pearls.length > 0 && (
                <CollapsiblePearls pearls={currentProcedure.pearls} />
            )}

            {/* Tool Sub-Tabs (if multiple tools detected) */}
            {toolNames.length > 1 && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-800/50">
                    {toolNames.map(tool => (
                        <button
                            key={tool}
                            onClick={() => setActiveTool(tool)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTool === tool
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:border-zinc-600'
                                }`}
                        >
                            🛠️ {tool}
                        </button>
                    ))}
                </div>
            )}

            {/* Steps Content */}
            <div className="space-y-4">
                {currentProcedure?.menu_path && (
                    <div className="p-3 bg-zinc-900/80 rounded-lg font-mono text-xs text-purple-300 border border-purple-900/20">
                        <span className="text-zinc-500 mr-2">Path:</span>
                        {currentProcedure.menu_path}
                    </div>
                )}

                {/* Render sections for active tool */}
                {activeTool && toolSections[activeTool] ? (
                    toolSections[activeTool].map((section, i) => (
                        <ProcedureSectionView
                            key={i}
                            section={section}
                            isAkl={activeTab === 'akl'}
                            showSectionTitle={toolSections[activeTool].length > 1}
                        />
                    ))
                ) : currentParsed?.sections && currentParsed.sections.length > 0 ? (
                    // Single tool or general - render all sections
                    currentParsed.sections.map((section, i) => (
                        <ProcedureSectionView
                            key={i}
                            section={section}
                            isAkl={activeTab === 'akl'}
                            showSectionTitle={currentParsed.sections.length > 1}
                        />
                    ))
                ) : (
                    <div className="text-center text-zinc-500 py-8">
                        No procedure steps available
                    </div>
                )}
            </div>

            {/* Tool Status Section */}
            <div className="glass p-4 mt-8">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        🛠️ Platform Support Status
                    </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Show detected tools first, then default tools */}
                    {[...new Set([...detectedTools, ...toolsToShow])].map(tool => (
                        <ToolStatusBadge key={tool} toolName={tool} />
                    ))}
                </div>
            </div>
        </div>
    );
}
