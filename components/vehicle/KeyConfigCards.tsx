'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface KeyConfig {
    type: string;
    fcc_ids: string[];
    chip: string | null;
    chip_id: string | null;
    frequency: string | null;
    battery: string | null;
    keyway: string | null;
    buttons: string | null;
    proximity: boolean | null;
    product_count: number;
    image: string | null;
    tools?: Record<string, { status: string; confidence?: string; notes?: string; family?: string }>;
}

interface KeyConfigCardsProps {
    configs: KeyConfig[];
    pushStartTrims?: string | null;
    nonPushStartTrims?: string | null;
}

// Tool display names and order
const TOOL_DISPLAY: Record<string, { name: string; family: string }> = {
    autel_im608_pro2: { name: 'IM608 Pro II', family: 'Autel' },
    autel_im608_pro: { name: 'IM608 Pro', family: 'Autel' },
    autel_im608: { name: 'IM608', family: 'Autel' },
    autel_im508s: { name: 'IM508S', family: 'Autel' },
    smart_pro: { name: 'Smart Pro', family: 'SmartPro' },
    smart_pro_tcode: { name: 'T-Code', family: 'SmartPro' },
    autopropad: { name: 'AutoProPad', family: 'SmartPro' },
    autopropad_basic: { name: 'AutoProPad Basic', family: 'SmartPro' },
    xhorse_vvdi2: { name: 'VVDI2', family: 'Xhorse' },
    xhorse_keytool_max: { name: 'Key Tool Max', family: 'Xhorse' },
    xhorse_keytool_plus: { name: 'Key Tool Plus', family: 'Xhorse' },
    xhorse_mini_obd: { name: 'Mini OBD', family: 'Xhorse' },
    lonsdor_k518_pro: { name: 'K518 Pro', family: 'Lonsdor' },
    lonsdor_k518s: { name: 'K518S', family: 'Lonsdor' },
    lonsdor_k518ise: { name: 'K518ISE', family: 'Lonsdor' },
    obdstar_x300_pro4: { name: 'X300 Pro4', family: 'OBDSTAR' },
    obdstar_x300_dp_plus: { name: 'X300 DP+', family: 'OBDSTAR' },
    obdstar_x300_mini: { name: 'X300 Mini', family: 'OBDSTAR' },
    obdstar_g3: { name: 'G3', family: 'OBDSTAR' },
};

const TOOL_ORDER = Object.keys(TOOL_DISPLAY);

const FAMILY_COLORS: Record<string, string> = {
    Autel: 'text-red-400',
    SmartPro: 'text-zinc-300',
    Xhorse: 'text-yellow-400',
    Lonsdor: 'text-purple-400',
    OBDSTAR: 'text-blue-400',
};

// Key type styling
const KEY_TYPE_STYLES: Record<string, { bg: string; border: string; badge: string; accent: string }> = {
    'Smart Key': { bg: 'bg-emerald-950/30', border: 'border-emerald-700/40', badge: 'bg-emerald-500/20 text-emerald-300', accent: 'emerald' },
    'Remote Keyless Entry': { bg: 'bg-blue-950/30', border: 'border-blue-700/40', badge: 'bg-blue-500/20 text-blue-300', accent: 'blue' },
    'Remote Head Key': { bg: 'bg-amber-950/30', border: 'border-amber-700/40', badge: 'bg-amber-500/20 text-amber-300', accent: 'amber' },
    'Transponder Key': { bg: 'bg-purple-950/30', border: 'border-purple-700/40', badge: 'bg-purple-500/20 text-purple-300', accent: 'purple' },
    'FOBIK': { bg: 'bg-cyan-950/30', border: 'border-cyan-700/40', badge: 'bg-cyan-500/20 text-cyan-300', accent: 'cyan' },
};

const DEFAULT_STYLE = { bg: 'bg-zinc-800/40', border: 'border-zinc-700/40', badge: 'bg-zinc-600/20 text-zinc-400', accent: 'zinc' };

export default function KeyConfigCards({ configs, pushStartTrims, nonPushStartTrims }: KeyConfigCardsProps) {
    if (!configs || configs.length === 0) return null;

    // Filter out non-meaningful types
    const meaningfulConfigs = configs.filter(c =>
        c.type !== 'Unknown' && c.type !== 'Mechanical Key' && c.type !== 'Emergency Key'
    );

    if (meaningfulConfigs.length === 0) return null;

    return (
        <section className="glass p-5 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-blue-400">
                    <span className="text-xl">🔑</span>
                    Key Configurations
                    <span className="text-xs font-normal text-zinc-500 ml-1">
                        ({meaningfulConfigs.length} type{meaningfulConfigs.length !== 1 ? 's' : ''})
                    </span>
                </h3>
            </div>

            {pushStartTrims && (
                <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                    <span className="text-zinc-500">Ignition:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-700/30 font-medium">
                        🟢 Push-start: {pushStartTrims}
                    </span>
                    {nonPushStartTrims && nonPushStartTrims !== 'None' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-700/30 font-medium">
                            🔑 Key-start: {nonPushStartTrims}
                        </span>
                    )}
                </div>
            )}

            <div className="space-y-3">
                {meaningfulConfigs.map((config, i) => (
                    <KeyConfigCard key={`${config.type}-${i}`} config={config} />
                ))}
            </div>
        </section>
    );
}

function KeyConfigCard({ config }: { config: KeyConfig }) {
    const [showTools, setShowTools] = useState(false);
    const style = KEY_TYPE_STYLES[config.type] || DEFAULT_STYLE;

    const hasTools = config.tools && Object.keys(config.tools).length > 0;
    const toolCount = hasTools ? Object.keys(config.tools!).length : 0;

    // Group tools by family for display
    const toolsByFamily: Record<string, Array<{ id: string; name: string; status: string; notes?: string }>> = {};
    if (config.tools) {
        for (const toolId of TOOL_ORDER) {
            const info = config.tools[toolId];
            if (!info) continue;
            const display = TOOL_DISPLAY[toolId];
            if (!display) continue;
            if (!toolsByFamily[display.family]) toolsByFamily[display.family] = [];
            toolsByFamily[display.family].push({
                id: toolId,
                name: display.name,
                status: info.status || 'Unknown',
                notes: info.notes,
            });
        }
        // Also handle tools not in TOOL_DISPLAY
        for (const [toolId, info] of Object.entries(config.tools)) {
            if (TOOL_DISPLAY[toolId]) continue; // already handled
            const family = (info as any).family || 'Other';
            if (!toolsByFamily[family]) toolsByFamily[family] = [];
            toolsByFamily[family].push({
                id: toolId,
                name: toolId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                status: info.status || 'Unknown',
                notes: info.notes,
            });
        }
    }

    // Quick summary: count Yes/Limited/No
    let yesCount = 0, limitedCount = 0, noCount = 0;
    if (config.tools) {
        for (const info of Object.values(config.tools)) {
            const l = (info.status || '').toLowerCase();
            if (l.startsWith('yes')) yesCount++;
            else if (l === 'limited') limitedCount++;
            else noCount++;
        }
    }

    return (
        <div className={`rounded-xl border p-4 ${style.bg} ${style.border} transition-all duration-200`}>
            {/* Header row: image + type badge + specs */}
            <div className="flex gap-4">
                {/* Optional image */}
                {config.image && (
                    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-zinc-900/60 border border-zinc-700/30">
                        <Image
                            src={config.image}
                            alt={config.type}
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                            unoptimized
                        />
                    </div>
                )}

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {/* Type badge + proximity + chip ID */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${style.badge}`}>
                            {config.type}
                        </span>
                        {config.proximity === true && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-600/30">
                                PROX
                            </span>
                        )}
                        {config.proximity === false && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-700/40 text-zinc-400 border border-zinc-600/30">
                                NO PROX
                            </span>
                        )}
                        {config.chip_id && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-900/30 text-amber-300 border border-amber-700/30">
                                {config.chip_id}
                            </span>
                        )}
                        <span className="text-[10px] text-zinc-500 ml-auto">
                            {config.product_count} product{config.product_count !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Specs row */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {config.chip && <SpecChip label="Chip" value={config.chip} />}
                        {config.frequency && <SpecChip label="Freq" value={config.frequency} />}
                        {config.fcc_ids.length > 0 && <SpecChip label="FCC" value={config.fcc_ids.join(' / ')} />}
                        {config.battery && <SpecChip label="Battery" value={config.battery} />}
                        {config.keyway && <SpecChip label="Keyway" value={config.keyway} />}
                        {config.buttons && <SpecChip label="Buttons" value={config.buttons} />}
                    </div>
                </div>
            </div>

            {/* Tool coverage summary + expandable detail */}
            {hasTools && (
                <div className="mt-3 pt-3 border-t border-zinc-700/30">
                    <button
                        onClick={() => setShowTools(!showTools)}
                        className="w-full flex items-center justify-between text-[11px] group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 group-hover:text-zinc-300 transition-colors font-medium">
                                Tool Coverage
                            </span>
                            <div className="flex items-center gap-1.5">
                                {yesCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">
                                        {yesCount} ✓
                                    </span>
                                )}
                                {limitedCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400">
                                        {limitedCount} △
                                    </span>
                                )}
                                {noCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-700/40 text-zinc-500">
                                        {noCount} ✗
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            {showTools ? '▼' : '▶'}
                        </span>
                    </button>

                    {showTools && (
                        <div className="mt-3 space-y-3">
                            {Object.entries(toolsByFamily).map(([family, tools]) => (
                                <div key={family}>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${FAMILY_COLORS[family] || 'text-zinc-500'}`}>
                                        {family}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                                        {tools.map(tool => {
                                            const isYes = tool.status.toLowerCase().startsWith('yes');
                                            const isLimited = tool.status.toLowerCase() === 'limited';
                                            return (
                                                <div
                                                    key={tool.id}
                                                    className={`flex items-center justify-between px-2 py-1 rounded text-[10px] ${isYes ? 'bg-emerald-950/40 border border-emerald-700/25' :
                                                            isLimited ? 'bg-amber-950/30 border border-amber-700/25' :
                                                                'bg-zinc-800/50 border border-zinc-700/30'
                                                        }`}
                                                    title={tool.notes || tool.status}
                                                >
                                                    <span className="text-zinc-300 font-medium truncate mr-1">{tool.name}</span>
                                                    <span className={`font-bold flex-shrink-0 ${isYes ? 'text-emerald-400' :
                                                            isLimited ? 'text-amber-400' :
                                                                'text-zinc-500'
                                                        }`}>
                                                        {isYes ? '✓' : isLimited ? '△' : '—'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SpecChip({ label, value }: { label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900/70 border border-zinc-700/30 text-[10px]">
            <span className="text-zinc-500 font-medium">{label}:</span>
            <span className="text-zinc-200 font-semibold truncate max-w-[150px]" title={value}>{value}</span>
        </span>
    );
}
