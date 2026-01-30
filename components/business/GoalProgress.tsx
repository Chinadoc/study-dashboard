'use client';

import React, { useState } from 'react';
import { useGoals } from '@/contexts/GoalContext';

interface GoalProgressProps {
    className?: string;
    showSetGoal?: boolean;
}

export default function GoalProgress({ className = '', showSetGoal = true }: GoalProgressProps) {
    const { currentGoal, progressPercent, isOnTrack, setMonthlyGoal } = useGoals();
    const [showModal, setShowModal] = useState(false);
    const [goalInput, setGoalInput] = useState('');

    // SVG ring properties
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (progressPercent / 100) * circumference;

    const handleSetGoal = () => {
        const target = parseFloat(goalInput);
        if (!isNaN(target) && target > 0) {
            setMonthlyGoal(target);
            setShowModal(false);
            setGoalInput('');
        }
    };

    // Color based on progress and on-track status
    const getColor = () => {
        if (!currentGoal) return 'text-zinc-600';
        if (progressPercent >= 100) return 'text-green-500';
        if (isOnTrack) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <>
            <div className={`flex items-center gap-4 ${className}`}>
                {/* Progress Ring */}
                <div className="relative">
                    <svg
                        width={size}
                        height={size}
                        className="transform -rotate-90"
                    >
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-zinc-800"
                        />
                        {/* Progress circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - progress}
                            className={`transition-all duration-500 ${getColor()}`}
                        />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${getColor()}`}>
                            {currentGoal ? `${progressPercent}%` : '—'}
                        </span>
                        <span className="text-xs text-zinc-500">of goal</span>
                    </div>
                </div>

                {/* Goal Details */}
                <div className="flex-1">
                    {currentGoal ? (
                        <>
                            <div className="text-sm text-zinc-400">Monthly Goal</div>
                            <div className="text-xl font-bold text-white">
                                ${currentGoal.achieved.toLocaleString()} / ${currentGoal.target.toLocaleString()}
                            </div>
                            <div className={`text-xs mt-1 ${isOnTrack ? 'text-green-400' : 'text-red-400'}`}>
                                {isOnTrack ? '✓ On track' : '⚠ Behind pace'}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-sm text-zinc-400">No goal set</div>
                            <div className="text-zinc-500">Set a monthly revenue target</div>
                        </>
                    )}

                    {showSetGoal && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="mt-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                        >
                            {currentGoal ? 'Update Goal' : 'Set Goal'}
                        </button>
                    )}
                </div>
            </div>

            {/* Set Goal Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-white mb-4">Set Monthly Goal</h3>

                        <div className="mb-4">
                            <label className="block text-sm text-zinc-400 mb-2">Revenue Target ($)</label>
                            <input
                                type="number"
                                value={goalInput}
                                onChange={(e) => setGoalInput(e.target.value)}
                                placeholder="e.g. 5000"
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-lg focus:outline-none focus:border-yellow-500"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetGoal}
                                className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                            >
                                Set Goal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
