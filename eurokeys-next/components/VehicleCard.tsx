import React from 'react';
import { KeyConfig } from '@/lib/types';

interface VehicleCardProps {
    config: KeyConfig;
    color?: 'purple' | 'cyan' | 'amber';
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ config, color = 'purple' }) => {
    const theme = {
        purple: {
            border: 'border-purple-500/30',
            bg: 'bg-purple-500/10',
            text: 'text-purple-400',
            header: 'bg-purple-500/20'
        },
        cyan: {
            border: 'border-cyan-500/30',
            bg: 'bg-cyan-500/10',
            text: 'text-cyan-400',
            header: 'bg-cyan-500/20'
        },
        amber: {
            border: 'border-amber-500/30',
            bg: 'bg-amber-500/10',
            text: 'text-amber-400',
            header: 'bg-amber-500/20'
        }
    }[color];

    return (
        <div className={`rounded-xl border ${theme.border} bg-white/5 overflow-hidden transition-all hover:scale-[1.02]`}>
            <div className={`${theme.header} p-4`}>
                <div className={`font-bold text-sm leading-tight ${theme.text}`}>{config.name}</div>
                <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Configuration</div>
            </div>

            <div className="p-4 flex flex-col items-center">
                {config.image ? (
                    <img src={config.image} alt={config.name} className="w-24 h-auto rounded-lg mb-4 shadow-lg p-1 bg-white/5" />
                ) : (
                    <div className="w-24 h-32 rounded-lg mb-4 bg-gray-800 flex items-center justify-center text-2xl">🔑</div>
                )}

                <div className="text-xs text-gray-300 text-center font-medium">
                    {config.buttons || 'Standard Controls'}
                </div>
            </div>

            <div className="p-4 pt-0 border-t border-white/5 mt-auto">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-gray-400 mb-4 mt-4">
                    {config.fcc && (
                        <span><strong className="text-gray-200">FCC:</strong> {config.fcc}</span>
                    )}
                    {config.freq && (
                        <span><strong className="text-gray-200">Freq:</strong> {config.freq}</span>
                    )}
                    {config.chip && (
                        <span><strong className="text-gray-200">Chip:</strong> {config.chip}</span>
                    )}
                    {config.battery && (
                        <span><strong className="text-gray-200">Battery:</strong> {config.battery}</span>
                    )}
                </div>

                {config.oem && config.oem.length > 0 && (
                    <div className="border-t border-white/5 pt-3">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-2 font-bold">OEM Parts</div>
                        <div className="grid grid-cols-1 gap-1">
                            {config.oem.map((part, idx) => (
                                <div key={idx} className="text-[10px] text-gray-300 flex justify-between">
                                    <span className="text-gray-500">{part.label}:</span>
                                    <span>{part.number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {config.priceRange && (
                    <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-end">
                        <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Est. Market</div>
                        <div className={`text-sm font-bold ${theme.text}`}>{config.priceRange}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
