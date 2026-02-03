'use client';

import React from 'react';
import { useTeamPanel } from '@/contexts/TeamPanelContext';
import { useJobLogs } from '@/lib/useJobLogs';
import TeamPanel from '@/components/business/TeamPanel';

export default function TeamPanelWrapper() {
    const { isTeamPanelOpen, closeTeamPanel } = useTeamPanel();
    const { jobLogs } = useJobLogs();

    return (
        <TeamPanel
            isOpen={isTeamPanelOpen}
            onClose={closeTeamPanel}
            jobLogs={jobLogs}
        />
    );
}
