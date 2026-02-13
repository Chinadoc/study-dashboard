'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EditModeToggle } from '@/components/admin';

interface VehicleHeaderProps {
    make: string;
    model: string;
    year: number;
    prevYear?: number | null;
    nextYear?: number | null;
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
    architecture,
    canFd,
    specs = {},
}: VehicleHeaderProps) {
    const [imageError, setImageError] = useState(false);

    // Build path to vehicle image: /assets/vehicles/{make}/{make}_{model}.png
    // Normalize: lowercase, replace spaces/hyphens with underscores
    const normalizedMake = make.toLowerCase().replace(/[\s-]+/g, '_');
    const normalizedModel = model.toLowerCase().replace(/[\s-]+/g, '_');
    const vehicleImagePath = `/assets/vehicles/${normalizedMake}/${normalizedMake}_${normalizedModel}.png`;

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
            <div className="glass p-6 mb-4 relative overflow-hidden">
                {/* Faded vehicle silhouette background */}
                {!imageError && (
                    <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-[160%] w-[45%] pointer-events-none select-none"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                        }}
                    >
                        <Image
                            src={vehicleImagePath}
                            alt=""
                            fill
                            className="object-contain object-right opacity-[0.18]"
                            sizes="(max-width: 768px) 40vw, 30vw"
                            onError={() => setImageError(true)}
                            priority={false}
                        />
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
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
                                {architecture && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/40 text-emerald-300 border border-emerald-700/30">
                                        {architecture}
                                    </span>
                                )}
                                {canFd && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-900/40 text-red-400 border border-red-700/30">
                                        ⚠️ CAN-FD Required
                                    </span>
                                )}
                                {/* Service Readiness Badge - disabled pending proper tool coverage logic */}
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

                    {/* Quick Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <a
                            href={`/business/jobs?action=log&vehicle=${encodeURIComponent(`${year} ${make} ${model}`)}&fcc=${encodeURIComponent(specs.fccId || '')}&keyType=${encodeURIComponent(specs.chipType || '')}`}
                            className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                        >
                            <span>📝</span>
                            <span>Log Job</span>
                        </a>
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

