'use client';

import React from 'react';
import Link from 'next/link';
import { EditModeToggle } from '@/components/admin';
import ReadinessBadge from './ReadinessBadge';

interface VehicleHeaderProps {
    make: string;
    model: string;
    year: number;
    prevYear?: number | null;
    nextYear?: number | null;
    platform?: string;
    architecture?: string;
    canFd?: boolean;
    specs?: {
        chipType?: string;
        battery?: string;
        keyway?: string;
        fccId?: string;
        frequency?: string;
        lishi?: string;
    };
}

export default function VehicleHeader({
    make,
    model,
    year,
    prevYear,
    nextYear,
    platform,
    architecture,
    canFd,
    specs = {},
}: VehicleHeaderProps) {
    return (
        <div className="mb-8">
            {/* Back Button & Edit Mode Toggle */}
            <div className="flex items-center justify-between mb-4">
                <a
                    href="/browse"
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-400 transition-colors"
                >
                    ← Back to Browse
                </a>
                <EditModeToggle />
            </div>

            {/* Main Header */}
            <div className="glass p-6 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {/* Previous Year Arrow */}
                        {prevYear ? (
                            <Link
                                href={`/vehicle/${make}/${model}/${prevYear}`}
                                className="p-2 rounded-lg bg-zinc-800/60 hover:bg-purple-900/40 border border-zinc-700/50 hover:border-purple-700/50 transition-all group"
                                title={`${prevYear} ${make} ${model}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-400 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                        ) : (
                            <div className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/50 opacity-30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                                {year} {make} {model}
                            </h1>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {platform && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/40 text-purple-300 border border-purple-700/30">
                                        {platform}
                                    </span>
                                )}
                                {architecture && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-900/40 text-blue-300 border border-blue-700/30">
                                        {architecture}
                                    </span>
                                )}
                                {canFd && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-900/40 text-red-400 border border-red-700/30">
                                        ⚠️ CAN-FD Required
                                    </span>
                                )}
                                {/* Service Readiness Badge */}
                                <ReadinessBadge make={make} model={model} year={year} size="sm" />
                            </div>
                        </div>

                        {/* Next Year Arrow */}
                        {nextYear ? (
                            <Link
                                href={`/vehicle/${make}/${model}/${nextYear}`}
                                className="p-2 rounded-lg bg-zinc-800/60 hover:bg-purple-900/40 border border-zinc-700/50 hover:border-purple-700/50 transition-all group"
                                title={`${nextYear} ${make} ${model}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-400 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ) : (
                            <div className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/50 opacity-30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

function SpecItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="text-center p-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{label}</div>
            <div className={`font-bold text-sm ${highlight ? 'text-yellow-500 font-mono' : 'text-white'}`}>
                {value}
            </div>
        </div>
    );
}

