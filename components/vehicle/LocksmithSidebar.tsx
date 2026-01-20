'use client';

import React from 'react';

interface SidebarProps {
    specs: {
        battery?: string;
        keyway?: string;
        canFdRequired?: boolean;
    };
    platform?: string;
    architecture?: string;
    gotchaText?: string;
    proTipText?: string;
}

export default function LocksmithSidebar({ specs, platform, architecture, gotchaText, proTipText }: SidebarProps) {
    const buyList = [
        { name: `Battery: ${specs.battery || 'CR2032'}`, icon: '🔋', desc: 'Required for all remotes' },
        { name: `Blade: ${specs.keyway || 'MAZ24'}`, icon: '🔑', desc: 'Emergency physical bypass' },
    ];

    if (specs.canFdRequired) {
        buyList.push({ name: 'CAN FD Adapter', icon: '🔌', desc: 'Mandatory for this platform' });
    }

    return (
        <aside className="space-y-6">
            {/* Buy This First */}
            <div className="glass p-5 border-yellow-500/30">
                <h3 className="text-yellow-500 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    🛒 Buy This First
                </h3>
                <div className="space-y-3">
                    {buyList.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-yellow-500/20 transition-all">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center text-lg">
                                {item.icon}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-zinc-100">{item.name}</div>
                                <div className="text-[10px] text-zinc-500">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Critical Gotcha */}
            {(gotchaText || specs.canFdRequired || architecture?.includes('Global B')) && (
                <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-5">
                    <h3 className="text-red-400 font-bold text-sm flex items-center gap-2 mb-2">
                        🛑 Critical Gotcha
                    </h3>
                    <p className="text-xs text-red-200/70 leading-relaxed">
                        {gotchaText || (
                            <>
                                This vehicle uses {architecture || 'Global B'} architecture.
                                <strong> CAN FD adapter is required</strong> for communication.
                                Do NOT attempt programming without a stable battery maintainer (12.5V+).
                            </>
                        )}
                    </p>
                </div>
            )}

            {/* Pro Tip */}
            <div className="bg-green-900/10 border border-green-500/30 rounded-2xl p-5">
                <h3 className="text-green-400 font-bold text-sm flex items-center gap-2 mb-2">
                    💡 Pro Tip
                </h3>
                <p className="text-xs text-green-200/70 leading-relaxed">
                    {proTipText || "Always turn on hazard lights before starting. This sends keep-alive signals on the CAN bus and prevents the BCM from entering sleep mode during programming."}
                </p>
            </div>

            {/* Job Pricing Guide */}
            <div className="glass p-5">
                <h3 className="text-zinc-400 font-bold text-sm uppercase tracking-wider mb-4">
                    💵 Job Pricing Guide
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs p-2 bg-zinc-900/50 rounded-lg">
                        <span className="text-zinc-500">Add Smart Key</span>
                        <span className="text-zinc-100 font-semibold">$185 - $225</span>
                    </div>
                    <div className="flex justify-between text-xs p-2 bg-zinc-900/50 rounded-lg border border-red-500/20">
                        <span className="text-zinc-500">All Keys Lost (AKL)</span>
                        <span className="text-red-400 font-semibold">$350 - $450</span>
                    </div>
                    <div className="text-[10px] text-zinc-600 text-center mt-2 italic">
                        Prices subject to local market variations
                    </div>
                </div>
            </div>
        </aside>
    );
}
