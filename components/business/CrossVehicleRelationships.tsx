'use client';

import React, { useState } from 'react';
import { masterDatabase, type CrossVehicleRelationship } from '@/src/data/masterDatabaseLoader';

export default function CrossVehicleRelationships() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const relationships = masterDatabase.cross_vehicle_relationships;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-100">🔗 Cross-Vehicle Relationships</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-900/50 text-cyan-300">
                        {relationships.length} Platform Groups
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-500">
                Vehicles that share identical platforms, chips, or procedures. If you can program one, you can program all.
            </p>

            {/* Relationship Cards */}
            <div className="grid gap-4">
                {relationships.map(rel => {
                    const isExpanded = expandedId === rel.id;

                    return (
                        <div
                            key={rel.id}
                            className={`rounded-xl border transition-all cursor-pointer ${isExpanded
                                    ? 'border-cyan-700/50 bg-cyan-950/20'
                                    : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'
                                }`}
                            onClick={() => setExpandedId(isExpanded ? null : rel.id)}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">🔗</span>
                                            <h4 className="font-bold text-gray-100 text-sm">
                                                {rel.description}
                                            </h4>
                                        </div>

                                        <p className={`text-sm ${isExpanded ? 'text-cyan-300' : 'text-gray-400'}`}>
                                            <span className="font-semibold">Implication:</span> {rel.implication}
                                        </p>
                                    </div>
                                    <div className="text-gray-600 ml-4">{isExpanded ? '▲' : '▼'}</div>
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 pt-3 border-t border-cyan-900/30">
                                        <div className="text-xs text-gray-500 uppercase font-bold mb-2">
                                            Vehicles in this group ({rel.vehicles.length}):
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {rel.vehicles.map((vehicle, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-300 text-xs border border-cyan-900/50 font-medium"
                                                >
                                                    {vehicle}
                                                </span>
                                            ))}
                                        </div>
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
