'use client';

import React from 'react';
import GlossaryChipType from './GlossaryChipType';

interface Pearl {
    id?: string;
    content: string;
    risk?: string;
    category?: string;
}

interface VehicleSpecsProps {
    specs: {
        architecture?: string;
        platform?: string;
        immobilizerSystem?: string;
        canFdRequired?: boolean;
        chipType?: string;
        fccId?: string;
        frequency?: string;
        battery?: string;
        keyway?: string;
        lishi?: string;
        lishiSource?: string;
        spaces?: number;
        depths?: number | string;
        macs?: number;
        codeSeries?: string;
        mechanicalSource?: string | null;
    };
    make?: string;
    year?: number;
    pearls?: {
        lishi?: Pearl[];
        canFd?: Pearl[];
    };
}

export default function VehicleSpecs({ specs, make, year, pearls }: VehicleSpecsProps) {
    if (!specs || Object.keys(specs).length === 0) {
        return null;
    }

    return (
        <section className="glass p-6 mb-6">
            <h3 className="flex items-center gap-3 text-lg font-bold text-green-400 mb-5">
                <span className="text-xl">🔧</span>
                Vehicle Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Architecture / Platform */}
                {(specs.platform || specs.architecture) && (
                    <SpecItem
                        label="Architecture"
                        value={specs.platform || specs.architecture || ''}
                        color="text-purple-400"
                    />
                )}

                {/* CAN-FD Required */}
                {specs.canFdRequired !== undefined && (
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                            CAN FD
                        </div>
                        <div className={`font-semibold ${specs.canFdRequired ? 'text-red-400' : 'text-green-400'}`}>
                            {specs.canFdRequired ? 'REQUIRED' : 'Not Required'}
                        </div>
                        {/* CAN-FD contextual pearl */}
                        {pearls?.canFd?.[0] && (
                            <div className="mt-2 text-[11px] text-orange-300 bg-orange-900/20 p-2 rounded border border-orange-800/30">
                                🔌 {pearls.canFd[0].content}
                            </div>
                        )}
                    </div>
                )}

                {/* Chip Type - with glossary linkage */}
                {specs.chipType && (
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                            Chip Type
                        </div>
                        <div className="font-semibold text-white">
                            <GlossaryChipType chipType={specs.chipType} make={make} year={year} />
                        </div>
                    </div>
                )}

                {/* FCC ID */}
                {specs.fccId && (
                    <SpecItem
                        label="FCC ID"
                        value={specs.fccId}
                        isMono
                        icon="📡"
                    />
                )}

                {/* Frequency */}
                {specs.frequency && (
                    <SpecItem
                        label="Frequency"
                        value={specs.frequency}
                    />
                )}

                {/* Battery */}
                {specs.battery && (
                    <SpecItem
                        label="Battery"
                        value={specs.battery}
                    />
                )}

                {/* Lishi Tool */}
                {specs.lishi && (
                    <div className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                            Lishi Tool
                        </div>
                        <div className="font-semibold text-green-400">
                            {specs.lishi}
                        </div>
                        {specs.lishiSource && (
                            <div className={`text-[9px] mt-1 px-2 py-0.5 rounded-full inline-block ${specs.lishiSource === 'enrichments' ? 'bg-green-900/40 text-green-400' :
                                specs.lishiSource === 'vyp' ? 'bg-purple-900/40 text-purple-400' :
                                    'bg-zinc-800 text-zinc-500'
                                }`}>
                                {specs.lishiSource === 'vyp' ? 'VYP' : specs.lishiSource}
                            </div>
                        )}
                        {/* Lishi contextual pearl */}
                        {pearls?.lishi?.[0] && (
                            <div className="mt-2 text-[11px] text-amber-300 bg-amber-900/20 p-2 rounded border border-amber-800/30">
                                🔑 {pearls.lishi[0].content}
                            </div>
                        )}
                    </div>
                )}

                {/* Keyway */}
                {specs.keyway && (
                    <SpecItem
                        label="Keyway"
                        value={specs.keyway}
                    />
                )}
            </div>

            {/* Bitting Specs Row */}
            {(specs.spaces || specs.depths || specs.macs || specs.codeSeries) && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                            Bitting Specifications
                        </span>
                        {specs.mechanicalSource === 'vehicles' && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700/30">
                                ⚠️ May be inaccurate
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {specs.spaces && (
                            <BittingItem label="Spaces" value={specs.spaces} />
                        )}
                        {specs.depths && (
                            <BittingItem label="Depths" value={specs.depths} />
                        )}
                        {specs.macs && (
                            <BittingItem label="MACS" value={specs.macs} />
                        )}
                        {specs.codeSeries && (
                            <BittingItem label="Code Series" value={specs.codeSeries} />
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

function SpecItem({
    label,
    value,
    color = 'text-white',
    isMono = false,
    icon,
    isWarning = false
}: {
    label: string;
    value: string;
    color?: string;
    isMono?: boolean;
    icon?: string;
    isWarning?: boolean;
}) {
    return (
        <div className={`bg-zinc-800/60 p-4 rounded-xl border ${isWarning ? 'border-red-700/50' : 'border-zinc-700/50'}`}>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
                {label}
            </div>
            <div className={`font-semibold ${color} ${isMono ? 'font-mono text-sm' : ''}`}>
                {icon && <span className="mr-1">{icon}</span>}
                {value}
            </div>
        </div>
    );
}

function BittingItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded-lg">
            <span className="text-xs text-zinc-400">{label}</span>
            <span className="font-mono font-bold text-white">{value}</span>
        </div>
    );
}
