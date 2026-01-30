'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface ProfitGoal {
    month: string; // Format: "2026-01"
    target: number;
    achieved: number;
    createdAt: number;
}

interface GoalContextType {
    currentGoal: ProfitGoal | null;
    goals: ProfitGoal[];
    // Actions
    setMonthlyGoal: (target: number) => void;
    updateAchieved: (amount: number) => void;
    getGoalForMonth: (month: string) => ProfitGoal | null;
    // Derived
    progressPercent: number;
    isOnTrack: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const GOALS_STORAGE_KEY = 'eurokeys_profit_goals';

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

// ============================================================================
// Provider
// ============================================================================

export function GoalProvider({ children }: { children: ReactNode }) {
    const [goals, setGoals] = useState<ProfitGoal[]>([]);
    const currentMonth = getCurrentMonth();

    // Load from storage on mount
    useEffect(() => {
        setGoals(getGoalsFromStorage());
    }, []);

    // Get current month's goal
    const currentGoal = goals.find(g => g.month === currentMonth) || null;

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
                    achieved: 0,
                    createdAt: Date.now(),
                }];
            }

            saveGoalsToStorage(updated);
            return updated;
        });
    }, [currentMonth]);

    // Update achieved amount (add to it)
    const updateAchieved = useCallback((amount: number) => {
        setGoals(prev => {
            const existingIndex = prev.findIndex(g => g.month === currentMonth);
            if (existingIndex < 0) return prev;

            const updated = [...prev];
            updated[existingIndex] = {
                ...updated[existingIndex],
                achieved: updated[existingIndex].achieved + amount,
            };

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
            updateAchieved,
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
