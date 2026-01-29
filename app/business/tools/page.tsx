'use client';

import React, { useState, useEffect } from 'react';
import { loadBusinessProfile, saveBusinessProfile, AVAILABLE_TOOLS } from '@/lib/businessTypes';
import CoverageMap from '@/components/business/CoverageMap';

type ToolsSubTab = 'mytools' | 'coverage' | 'add';

export default function ToolsPage() {
    const [activeSubTab, setActiveSubTab] = useState<ToolsSubTab>('mytools');
    const [businessProfile, setBusinessProfile] = useState(() => loadBusinessProfile());

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBusinessProfile(loadBusinessProfile());
        }
    }, []);

    const userTools = businessProfile.tools || [];

    const toggleTool = (toolId: string) => {
        const updatedTools = userTools.includes(toolId)
            ? userTools.filter(t => t !== toolId)
            : [...userTools, toolId];

        const updatedProfile = { ...businessProfile, tools: updatedTools };
        saveBusinessProfile(updatedProfile);
        setBusinessProfile(updatedProfile);
    };

    const subtabs = [
        { id: 'mytools', label: 'My Tools', icon: '🛠️', count: userTools.length },
        { id: 'coverage', label: 'Coverage', icon: '📊' },
        { id: 'add', label: 'Add Tool', icon: '➕' },
    ];

    return (
        <div className="space-y-6">
            {/* Subtab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-x-auto w-fit">
                {subtabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id as ToolsSubTab)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                            ${activeSubTab === tab.id
                                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50'
                            }
                        `}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`
                                text-xs px-1.5 py-0.5 rounded-full
                                ${activeSubTab === tab.id ? 'bg-yellow-500/30 text-yellow-300' : 'bg-zinc-700 text-gray-400'}
                            `}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* My Tools View */}
            {activeSubTab === 'mytools' && (
                <div className="space-y-4">
                    {userTools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userTools.map((toolId) => {
                                const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
                                if (!tool) return null;
                                return (
                                    <ToolCard
                                        key={toolId}
                                        tool={tool}
                                        owned={true}
                                        onToggle={() => toggleTool(toolId)}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-3">🛠️</div>
                            <p className="font-medium">No tools added yet</p>
                            <p className="text-sm mt-1">Add your programming tools to see vehicle coverage</p>
                            <button
                                onClick={() => setActiveSubTab('add')}
                                className="mt-4 px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400"
                            >
                                Add Tools
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Coverage View */}
            {activeSubTab === 'coverage' && (
                <CoverageMap />
            )}

            {/* Add Tool View */}
            {activeSubTab === 'add' && (
                <div className="space-y-4">
                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                        <h3 className="font-bold text-lg mb-2">Select Your Tools</h3>
                        <p className="text-sm text-gray-400">
                            Choose the programming tools you own to see which vehicles you can service.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {AVAILABLE_TOOLS.map((tool) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                owned={userTools.includes(tool.id)}
                                onToggle={() => toggleTool(tool.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Tool Card Component
function ToolCard({
    tool,
    owned,
    onToggle
}: {
    tool: { id: string; name: string; shortName: string; icon: string; badge: string };
    owned: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            className={`
                p-4 rounded-xl border cursor-pointer transition-all
                ${owned
                    ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/10 border-green-500/40'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }
            `}
            onClick={onToggle}
        >
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <span>{tool.icon}</span>
                        <span className="font-bold text-white">{tool.shortName}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{tool.name}</div>
                </div>
                <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center transition-all
                    ${owned ? 'bg-green-500 text-white' : 'bg-zinc-700 text-gray-500'}
                `}>
                    {owned ? '✓' : '+'}
                </div>
            </div>
            <div className="text-xs text-gray-500">{tool.badge}</div>
        </div>
    );
}

