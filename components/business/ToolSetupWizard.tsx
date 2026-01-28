'use client';

import React, { useState } from 'react';
import { AVAILABLE_TOOLS, ToolInfo, BusinessProfile, saveBusinessProfile, loadBusinessProfile } from '@/lib/businessTypes';

interface ToolSetupWizardProps {
    onComplete: () => void;
    onSkip: () => void;
}

export default function ToolSetupWizard({ onComplete, onSkip }: ToolSetupWizardProps) {
    const [selectedTools, setSelectedTools] = useState<string[]>(() => {
        const profile = loadBusinessProfile();
        return profile.tools;
    });
    const [step, setStep] = useState<'welcome' | 'tools' | 'confirm'>('welcome');

    const toggleTool = (toolId: string) => {
        setSelectedTools(prev =>
            prev.includes(toolId)
                ? prev.filter(id => id !== toolId)
                : [...prev, toolId]
        );
    };

    const handleContinue = () => {
        if (step === 'welcome') {
            setStep('tools');
        } else if (step === 'tools') {
            setStep('confirm');
        } else {
            // Save profile and complete
            const profile: BusinessProfile = {
                tools: selectedTools,
                setupComplete: true,
                setupStep: 'complete',
            };
            saveBusinessProfile(profile);
            onComplete();
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {step === 'welcome' && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-6">🔧</div>
                    <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                        Welcome to EuroKeys Business
                    </h1>
                    <p className="text-xl text-gray-400 max-w-lg mx-auto mb-8">
                        Let's set up your locksmith business profile. We'll help you track inventory,
                        jobs, and tool subscriptions in one place.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleContinue}
                            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20"
                        >
                            Get Started 🚀
                        </button>
                        <button
                            onClick={onSkip}
                            className="px-8 py-4 bg-gray-800 text-gray-400 font-semibold rounded-xl hover:bg-gray-700 transition-colors"
                        >
                            Skip Setup
                        </button>
                    </div>
                </div>
            )}

            {step === 'tools' && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">Select Your Tools</h2>
                        <p className="text-gray-400">
                            Which key programming tools do you own? This helps us show relevant coverage.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {AVAILABLE_TOOLS.map(tool => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                selected={selectedTools.includes(tool.id)}
                                onToggle={() => toggleTool(tool.id)}
                            />
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-800">
                        <div className="text-gray-500">
                            {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('welcome')}
                                className="px-6 py-3 bg-gray-800 text-gray-400 font-semibold rounded-xl hover:bg-gray-700"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleContinue}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-amber-400"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'confirm' && (
                <div className="space-y-8">
                    <div className="text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-3xl font-bold mb-2">You're All Set!</h2>
                        <p className="text-gray-400">
                            Your business profile is ready. You can always update your tools later.
                        </p>
                    </div>

                    {selectedTools.length > 0 && (
                        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">
                                Your Tools
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedTools.map(toolId => {
                                    const tool = AVAILABLE_TOOLS.find(t => t.id === toolId);
                                    if (!tool) return null;
                                    return (
                                        <span
                                            key={toolId}
                                            className="px-3 py-1.5 rounded-lg text-sm font-semibold"
                                            style={{
                                                backgroundColor: `${tool.badgeColor}20`,
                                                color: tool.badgeColor,
                                            }}
                                        >
                                            {tool.icon} {tool.shortName}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <NextStepCard
                            icon="📦"
                            title="Add Inventory"
                            description="Browse FCC database and add keys you have in stock"
                            href="/fcc"
                        />
                        <NextStepCard
                            icon="📝"
                            title="Log Your First Job"
                            description="Track completed jobs and revenue"
                            href="/inventory"
                            action="jobs"
                        />
                        <NextStepCard
                            icon="🔔"
                            title="Track Subscriptions"
                            description="Add tool subscriptions for renewal alerts"
                            href="/inventory"
                            action="subscriptions"
                        />
                    </div>

                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleContinue}
                            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-lg rounded-xl hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/20"
                        >
                            Go to Dashboard →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ToolCard({ tool, selected, onToggle }: { tool: ToolInfo; selected: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`p-5 rounded-xl border text-left transition-all ${selected
                    ? 'bg-gray-800 border-yellow-500/50 ring-2 ring-yellow-500/20'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                        <div className="font-bold text-white">{tool.name}</div>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                                backgroundColor: `${tool.badgeColor}20`,
                                color: tool.badgeColor,
                            }}
                        >
                            {tool.badge}
                        </span>
                    </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected
                        ? 'bg-yellow-500 border-yellow-500'
                        : 'border-gray-600'
                    }`}>
                    {selected && <span className="text-black text-sm">✓</span>}
                </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{tool.description}</p>
        </button>
    );
}

function NextStepCard({ icon, title, description, href, action }: {
    icon: string;
    title: string;
    description: string;
    href: string;
    action?: string;
}) {
    return (
        <a
            href={href + (action ? `?action=${action}` : '')}
            className="block p-5 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
        >
            <div className="text-3xl mb-3">{icon}</div>
            <h4 className="font-bold text-white mb-1">{title}</h4>
            <p className="text-sm text-gray-500">{description}</p>
        </a>
    );
}
