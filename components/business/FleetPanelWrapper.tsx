'use client';

import React from 'react';
import { useFleetPanel } from '@/contexts/FleetPanelContext';
import { useJobLogs } from '@/lib/useJobLogs';
import FleetPanel from './FleetPanel';

/**
 * Wrapper component that renders FleetPanel with required context
 */
export default function FleetPanelWrapper() {
    const { isFleetPanelOpen, closeFleetPanel } = useFleetPanel();
    const { jobLogs } = useJobLogs();

    return (
        <FleetPanel
            isOpen={isFleetPanelOpen}
            onClose={closeFleetPanel}
            jobLogs={jobLogs}
        />
    );
}
