'use client';

import React from 'react';

interface VehicleHeaderProps {
    make: string;
    model: string;
    year: number;
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
    platform,
    architecture,
    canFd,
    specs = {},
}: VehicleHeaderProps) {
    return (
        <div className="mb-8">
            {/* Back Button */}
            <a
                href="/browse"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-400 transition-colors mb-4"
            >
                ← Back to Browse
            </a>

            {/* Main Header */}
            <div className="glass p-6 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Specs Grid */}
            <div className="glass p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {specs.chipType && (
                        <SpecItem label="Chip Type" value={specs.chipType} />
                    )}
                    {specs.battery && (
                        <SpecItem label="Battery" value={specs.battery} />
                    )}
                    {specs.keyway && (
                        <SpecItem label="Keyway" value={specs.keyway} />
                    )}
                    {specs.fccId && (
                        <SpecItem label="Primary FCC" value={specs.fccId} highlight />
                    )}
                    {specs.frequency && (
                        <SpecItem label="Frequency" value={specs.frequency} />
                    )}
                    {specs.lishi && (
                        <SpecItem label="Lishi Tool" value={specs.lishi} />
                    )}
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
