'use client';

import React, { useState } from 'react';

interface VpmData {
    platform_code?: string;
    chassis_code?: string;
    transition_note?: string;
    hardware_note?: string;
    guide_image?: string;
}

interface TransitionGuideProps {
    vpm: VpmData;
    make?: string;
}

export default function TransitionGuide({ vpm, make }: TransitionGuideProps) {
    const [imageExpanded, setImageExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!vpm) return null;

    const { platform_code, chassis_code, transition_note, hardware_note, guide_image } = vpm;

    // Need at least one meaningful field
    if (!platform_code && !chassis_code && !transition_note && !hardware_note && !guide_image) {
        return null;
    }

    const makeLower = (make || '').toLowerCase();

    // Color theme per make
    const themeColor = makeLower.includes('bmw') ? 'blue'
        : makeLower.includes('mercedes') || makeLower.includes('benz') ? 'slate'
            : makeLower.includes('audi') || makeLower.includes('volkswagen') ? 'red'
                : makeLower.includes('dodge') || makeLower.includes('chrysler') || makeLower.includes('jeep') ? 'amber'
                    : makeLower.includes('gm') || makeLower.includes('chevrolet') || makeLower.includes('cadillac') ? 'yellow'
                        : 'purple';

    const colors: Record<string, { bg: string; border: string; badge: string; text: string; accent: string }> = {
        blue: { bg: 'bg-blue-950/30', border: 'border-blue-700/40', badge: 'bg-blue-600/30 text-blue-300 border-blue-500/40', text: 'text-blue-200', accent: 'text-blue-400' },
        slate: { bg: 'bg-slate-900/40', border: 'border-slate-600/40', badge: 'bg-slate-600/30 text-slate-200 border-slate-500/40', text: 'text-slate-200', accent: 'text-slate-300' },
        red: { bg: 'bg-red-950/20', border: 'border-red-700/30', badge: 'bg-red-600/20 text-red-300 border-red-500/30', text: 'text-red-200', accent: 'text-red-400' },
        amber: { bg: 'bg-amber-950/20', border: 'border-amber-700/30', badge: 'bg-amber-600/20 text-amber-300 border-amber-500/30', text: 'text-amber-200', accent: 'text-amber-400' },
        yellow: { bg: 'bg-yellow-950/20', border: 'border-yellow-700/30', badge: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30', text: 'text-yellow-200', accent: 'text-yellow-400' },
        purple: { bg: 'bg-purple-950/20', border: 'border-purple-700/30', badge: 'bg-purple-600/20 text-purple-300 border-purple-500/30', text: 'text-purple-200', accent: 'text-purple-400' },
    };

    const c = colors[themeColor] || colors.purple;

    return (
        <section className={`rounded-xl border ${c.border} ${c.bg} p-5 mb-6`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🔍</span> Platform Insight
                </h3>
                {(platform_code || chassis_code) && (
                    <div className="flex gap-2">
                        {platform_code && (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${c.badge}`}>
                                {platform_code}
                            </span>
                        )}
                        {chassis_code && (
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${c.badge}`}>
                                {chassis_code}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-3">
                {transition_note && (
                    <div className="flex gap-2">
                        <span className="text-amber-400 shrink-0 mt-0.5">⚠️</span>
                        <p className={`text-sm ${c.text} leading-relaxed`}>{transition_note}</p>
                    </div>
                )}
                {hardware_note && (
                    <div className="flex gap-2">
                        <span className="text-zinc-400 shrink-0 mt-0.5">🔧</span>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            <span className="font-semibold text-zinc-200">Hardware: </span>
                            {hardware_note}
                        </p>
                    </div>
                )}
            </div>

            {/* Guide Image — hidden if load fails (e.g. not in R2) */}
            {guide_image && !imageError && (
                <div className="mt-4">
                    <button
                        onClick={() => setImageExpanded(!imageExpanded)}
                        className={`w-full text-left text-xs font-semibold ${c.accent} hover:opacity-80 transition-opacity flex items-center gap-1.5 mb-2`}
                    >
                        <span>📖</span>
                        System Identification Guide
                        <span className="opacity-60 text-[10px]">{imageExpanded ? '▼' : '▶'}</span>
                    </button>
                    {imageExpanded && (
                        <div className="rounded-lg overflow-hidden border border-zinc-700/50 bg-zinc-900/50">
                            <img
                                src={guide_image}
                                alt="System Identification Guide"
                                className="w-full h-auto"
                                loading="lazy"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

