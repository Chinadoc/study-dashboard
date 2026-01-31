'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { JobLog, getJobLogsFromStorage } from '@/lib/useJobLogs';

// ============================================================================
// Types
// ============================================================================

export interface ProfitGoal {
    month: string; // Format: "2026-01"
    target: number;
    createdAt: number;
}

interface GoalContextType {
    currentGoal: (ProfitGoal & { achieved: number }) | null;
    goals: ProfitGoal[];
    // Actions
    setMonthlyGoal: (target: number) => void;
    getGoalForMonth: (month: string) => ProfitGoal | null;
    // Derived
    progressPercent: number;
    isOnTrack: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const GOALS_STORAGE_KEY = 'eurokeys_profit_goals_v2';

// ============================================================================
// Context
// ============================================================================

const GoalContext = createContext<GoalContextType | undefined>(undefined);

// ============================================================================
// Helper Functions
// ============================================================================

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getGoalsFromStorage(): ProfitGoal[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(GOALS_STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveGoalsToStorage(goals: ProfitGoal[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
}

// Calculate revenue from jobs for a given month
function calculateMonthRevenue(jobs: JobLog[], month: string): number {
    return jobs.reduce((sum, job) => {
        const jobMonth = job.date.slice(0, 7); // "2026-01"
        if (jobMonth === month) {
            return sum + (job.price || 0);
        }
        return sum;
    }, 0);
}

// ============================================================================
// Provider
// ============================================================================

export function GoalProvider({ children }: { children: ReactNode }) {
    const [goals, setGoals] = useState<ProfitGoal[]>([]);
    const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
    const currentMonth = getCurrentMonth();

    // Load from storage on mount and listen for changes
    useEffect(() => {
        setGoals(getGoalsFromStorage());
        setJobLogs(getJobLogsFromStorage());

        // Listen for storage changes to update job logs
        const handleStorage = () => {
            setJobLogs(getJobLogsFromStorage());
        };
        window.addEventListener('storage', handleStorage);

        // Poll for changes every 2 seconds to catch same-tab updates
        const interval = setInterval(() => {
            setJobLogs(getJobLogsFromStorage());
        }, 2000);

        return () => {
            window.removeEventListener('storage', handleStorage);
            clearInterval(interval);
        };
    }, []);

    // Calculate current month's achieved revenue from actual jobs
    const currentMonthRevenue = useMemo(() => {
        return calculateMonthRevenue(jobLogs, currentMonth);
    }, [jobLogs, currentMonth]);

    // Get current month's goal with calculated achieved
    const goalData = goals.find(g => g.month === currentMonth);
    const currentGoal = goalData ? { ...goalData, achieved: currentMonthRevenue } : null;

    // Set/update goal for current month
    const setMonthlyGoal = useCallback((target: number) => {
        setGoals(prev => {
            const existingIndex = prev.findIndex(g => g.month === currentMonth);
            let updated: ProfitGoal[];

            if (existingIndex >= 0) {
                // Update existing
                updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    target,
                };
            } else {
                // Create new
                updated = [...prev, {
                    month: currentMonth,
                    target,
                    createdAt: Date.now(),
                }];
            }

            saveGoalsToStorage(updated);
            return updated;
        });
    }, [currentMonth]);

    // Get goal for a specific month
    const getGoalForMonth = useCallback((month: string): ProfitGoal | null => {
        return goals.find(g => g.month === month) || null;
    }, [goals]);

    // Calculated values
    const progressPercent = currentGoal
        ? Math.min(100, Math.round((currentGoal.achieved / currentGoal.target) * 100))
        : 0;

    // On track if we've achieved at least (day of month / days in month) * target
    const isOnTrack = (() => {
        if (!currentGoal) return true;
        const now = new Date();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const expectedProgress = (dayOfMonth / daysInMonth) * currentGoal.target;
        return currentGoal.achieved >= expectedProgress * 0.9; // Allow 10% buffer
    })();

    return (
        <GoalContext.Provider value={{
            currentGoal,
            goals,
            setMonthlyGoal,
            getGoalForMonth,
            progressPercent,
            isOnTrack,
        }}>
            {children}
        </GoalContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useGoals() {
    const context = useContext(GoalContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalProvider');
    }
    return context;
}

