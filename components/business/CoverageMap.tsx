'use client';

import React, { useMemo } from 'react';
import { loadBusinessProfile, AVAILABLE_TOOLS } from '@/lib/businessTypes';

// Protocol coverage data based on selected tools
const PROTOCOL_COVERAGE = [
    {
        make: 'Toyota / Lexus',
        system: '8A-BA (2018-2024)',
        coverage: {
            autel_im608: { status: 'Medium', note: 'APB112 + Server Calc' },
            lonsdor_k518: { status: 'High', note: 'OFFLINE (Free)' },
            xhorse_keytool_plus: { status: 'Medium', note: 'KS-01 Simulator' },
            obdstar_g3: { status: 'High', note: 'Toyota-30 Cable' },
            autopropad: { status: 'Medium', note: 'Standard coverage' },
            smart_pro: { status: 'Medium', note: 'Token-based' },
        },
    },
    {
        make: 'Nissan',
        system: 'Gateway (2019+)',
        coverage: {
            autel_im608: { status: 'Risky', note: 'Check BCM first!' },
            lonsdor_k518: { status: 'High', note: '40-Pin bypass' },
            xhorse_keytool_plus: { status: 'Low', note: 'Adapter needed' },
            obdstar_g3: { status: 'High', note: 'Blacklist detect' },
            autopropad: { status: 'Medium', note: 'OBD route' },
            smart_pro: { status: 'Medium', note: 'Standard' },
        },
    },
    {
        make: 'Honda / Acura',
        system: 'Keihin IMMO',
        coverage: {
            autel_im608: { status: 'High', note: 'PIN auto-calc' },
            lonsdor_k518: { status: 'High', note: 'OBD + PIN' },
            xhorse_keytool_plus: { status: 'Medium', note: 'Add key OBD' },
            obdstar_g3: { status: 'High', note: 'Strong coverage' },
            autopropad: { status: 'High', note: 'Excellent' },
            smart_pro: { status: 'High', note: 'Full support' },
        },
    },
    {
        make: 'FCA (Jeep/Ram)',
        system: 'SGW (2018+)',
        coverage: {
            autel_im608: { status: 'High', note: 'AutoAuth cloud' },
            lonsdor_k518: { status: 'High', note: '12+8 bypass' },
            xhorse_keytool_plus: { status: 'Medium', note: '12+8 cable' },
            obdstar_g3: { status: 'High', note: '12+8 bypass' },
            autopropad: { status: 'High', note: 'NASTF unlock' },
            smart_pro: { status: 'High', note: 'Dealer access' },
        },
    },
    {
        make: 'VAG (VW/Audi)',
        system: 'MQB / MQB48',
        coverage: {
            autel_im608: { status: 'High', note: 'Cluster data' },
            lonsdor_k518: { status: 'Medium', note: 'OBD + Cluster' },
            xhorse_keytool_plus: { status: 'High', note: 'MQB specialist' },
            obdstar_g3: { status: 'Medium', note: 'Add key OBD' },
            autopropad: { status: 'Low', note: 'Limited' },
            smart_pro: { status: 'Medium', note: 'Partial support' },
        },
    },
    {
        make: 'BMW',
        system: 'CAS3/4 & FEM',
        coverage: {
            autel_im608: { status: 'High', note: 'XP400 Pro' },
            lonsdor_k518: { status: 'Medium', note: 'OBD Add' },
            xhorse_keytool_plus: { status: 'High', note: 'ISN specialist' },
            obdstar_g3: { status: 'Medium', note: 'P001 bench' },
            autopropad: { status: 'Low', note: 'Limited' },
            smart_pro: { status: 'Medium', note: 'ISN reading' },
        },
    },
    {
        make: 'Mercedes-Benz',
        system: 'FBS3 (Pre-2019)',
        coverage: {
            autel_im608: { status: 'High', note: 'G-Box3 server' },
            lonsdor_k518: { status: 'Low', note: 'Token purchase' },
            xhorse_keytool_plus: { status: 'High', note: 'VVDI MB' },
            obdstar_g3: { status: 'Low', note: 'Limited' },
            autopropad: { status: 'Low', note: 'Minimal' },
            smart_pro: { status: 'Medium', note: 'Token-based' },
        },
    },
    {
        make: 'GM (2019+)',
        system: 'CAN-FD',
        coverage: {
            autel_im608: { status: 'High', note: 'Built-in CAN-FD' },
            lonsdor_k518: { status: 'Medium', note: 'Limited 2022+' },
            xhorse_keytool_plus: { status: 'Low', note: 'Adapter needed' },
            obdstar_g3: { status: 'Medium', note: 'Latest update' },
            autopropad: { status: 'High', note: 'Full coverage' },
            smart_pro: { status: 'High', note: 'Full support' },
        },
    },
    {
        make: 'Hyundai / Kia',
        system: 'SMARTRA',
        coverage: {
            autel_im608: { status: 'High', note: 'Strong Korean' },
            lonsdor_k518: { status: 'High', note: 'PIN auto' },
            xhorse_keytool_plus: { status: 'Medium', note: 'Add key' },
            obdstar_g3: { status: 'High', note: 'Excellent' },
            autopropad: { status: 'High', note: 'Full support' },
            smart_pro: { status: 'High', note: 'Full support' },
        },
    },
];

const STATUS_COLORS = {
    High: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-700/30' },
    Medium: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-700/30' },
    Low: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-700/30' },
    Risky: { bg: 'bg-red-900/50', text: 'text-red-500', border: 'border-red-600/50' },
    None: { bg: 'bg-gray-900/50', text: 'text-gray-600', border: 'border-gray-800' },
};

interface CoverageMapProps {
    tools?: string[];
}

export default function CoverageMap({ tools }: CoverageMapProps) {
    const userTools = tools || loadBusinessProfile().tools;

    const coverageStats = useMemo(() => {
        let high = 0, medium = 0, low = 0;

        PROTOCOL_COVERAGE.forEach(protocol => {
            const bestCoverage = userTools.reduce((best, toolId) => {
                const coverage = protocol.coverage[toolId as keyof typeof protocol.coverage];
                if (!coverage) return best;
                if (coverage.status === 'High' || coverage.status === 'Medium' && best !== 'High') {
                    return coverage.status;
                }
                return best;
            }, 'None');

            if (bestCoverage === 'High') high++;
            else if (bestCoverage === 'Medium') medium++;
            else if (bestCoverage === 'Low' || bestCoverage === 'Risky') low++;
        });

        return { high, medium, low, total: PROTOCOL_COVERAGE.length };
    }, [userTools]);

    if (userTools.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold mb-2">No Tools Selected</h3>
                <p className="text-gray-500">Add your tools to see vehicle coverage</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Coverage Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-green-400">{coverageStats.high}</div>
                    <div className="text-xs text-green-600 uppercase tracking-wider">High Coverage</div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-yellow-400">{coverageStats.medium}</div>
                    <div className="text-xs text-yellow-600 uppercase tracking-wider">Medium</div>
                </div>
                <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-red-400">{coverageStats.low}</div>
                    <div className="text-xs text-red-600 uppercase tracking-wider">Limited</div>
                </div>
            </div>

            {/* Protocol Grid */}
            <div className="space-y-3">
                {PROTOCOL_COVERAGE.map((protocol, idx) => {
                    // Get best tool for this protocol
                    let bestTool = null;
                    let bestStatus = 'None';

                    for (const toolId of userTools) {
                        const coverage = protocol.coverage[toolId as keyof typeof protocol.coverage];
                        if (coverage && (coverage.status === 'High' || (coverage.status === 'Medium' && bestStatus !== 'High'))) {
                            bestTool = AVAILABLE_TOOLS.find(t => t.id === toolId);
                            bestStatus = coverage.status;
                            if (bestStatus === 'High') break;
                        }
                    }

                    const colors = STATUS_COLORS[bestStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS.None;

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border ${colors.border} ${colors.bg} flex items-center justify-between`}
                        >
                            <div>
                                <div className="font-bold text-white">{protocol.make}</div>
                                <div className="text-sm text-gray-400">{protocol.system}</div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold ${colors.text}`}>
                                    {bestStatus}
                                    {bestStatus === 'Risky' && <span className="ml-1">⚠️</span>}
                                </div>
                                {bestTool && (
                                    <div className="text-xs text-gray-500">
                                        via {bestTool.shortName}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
