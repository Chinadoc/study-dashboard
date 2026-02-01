'use client';

import React, { createContext, useContext, useState } from 'react';

interface FleetPanelContextType {
    isFleetPanelOpen: boolean;
    openFleetPanel: () => void;
    closeFleetPanel: () => void;
    toggleFleetPanel: () => void;
}

const FleetPanelContext = createContext<FleetPanelContextType | null>(null);

export function FleetPanelProvider({ children }: { children: React.ReactNode }) {
    const [isFleetPanelOpen, setIsFleetPanelOpen] = useState(false);

    const openFleetPanel = () => setIsFleetPanelOpen(true);
    const closeFleetPanel = () => setIsFleetPanelOpen(false);
    const toggleFleetPanel = () => setIsFleetPanelOpen(prev => !prev);

    return (
        <FleetPanelContext.Provider value={{
            isFleetPanelOpen,
            openFleetPanel,
            closeFleetPanel,
            toggleFleetPanel
        }}>
            {children}
        </FleetPanelContext.Provider>
    );
}

export function useFleetPanel() {
    const context = useContext(FleetPanelContext);
    if (!context) {
        throw new Error('useFleetPanel must be used within a FleetPanelProvider');
    }
    return context;
}
