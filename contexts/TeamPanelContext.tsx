'use client';

import React, { createContext, useContext, useState } from 'react';

interface TeamPanelContextType {
    isTeamPanelOpen: boolean;
    openTeamPanel: () => void;
    closeTeamPanel: () => void;
    toggleTeamPanel: () => void;
}

const TeamPanelContext = createContext<TeamPanelContextType | null>(null);

export function TeamPanelProvider({ children }: { children: React.ReactNode }) {
    const [isTeamPanelOpen, setIsTeamPanelOpen] = useState(false);

    const openTeamPanel = () => setIsTeamPanelOpen(true);
    const closeTeamPanel = () => setIsTeamPanelOpen(false);
    const toggleTeamPanel = () => setIsTeamPanelOpen(prev => !prev);

    return (
        <TeamPanelContext.Provider value={{
            isTeamPanelOpen,
            openTeamPanel,
            closeTeamPanel,
            toggleTeamPanel
        }}>
            {children}
        </TeamPanelContext.Provider>
    );
}

export function useTeamPanel() {
    const context = useContext(TeamPanelContext);
    if (!context) {
        throw new Error('useTeamPanel must be used within a TeamPanelProvider');
    }
    return context;
}
