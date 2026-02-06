'use client';

/**
 * LogJobButton Component
 * A button that opens the JobLogModal with pre-filled vehicle data
 * Used on vehicle detail pages to quickly log a job for the current vehicle
 */

import React, { useState } from 'react';
import JobLogModal, { JobFormData } from '@/components/shared/JobLogModal';
import { useJobLogs } from '@/lib/useJobLogs';

interface LogJobButtonProps {
    make: string;
    model: string;
    year: number;
    fccId?: string;
    className?: string;
    variant?: 'primary' | 'secondary';
}

export default function LogJobButton({
    make,
    model,
    year,
    fccId,
    className = '',
    variant = 'primary'
}: LogJobButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addJobLog } = useJobLogs();

    // Format vehicle string for prefill
    const vehicleString = `${year} ${make} ${model}`;

    const handleSubmit = (job: JobFormData) => {
        addJobLog({
            vehicle: job.vehicle,
            companyName: job.companyName,
            fccId: job.fccId || undefined,
            keyType: job.keyType || undefined,
            jobType: job.jobType,
            price: job.price,
            date: job.date,
            notes: job.notes || undefined,
            customerName: job.customerName,
            customerPhone: job.customerPhone,
            customerAddress: job.customerAddress,
            fleetId: job.fleetId,
            technicianId: job.technicianId,
            technicianName: job.technicianName,
            partsCost: job.partsCost,
            keyCost: job.keyCost,
            serviceCost: job.serviceCost,
            milesDriven: job.milesDriven,
            gasCost: job.gasCost,
            referralSource: job.referralSource,
            status: job.status || 'completed',
            source: 'manual',
        });
        setIsModalOpen(false);
    };

    const buttonStyles = variant === 'primary'
        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
        : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700';

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`
                    px-4 py-2 rounded-lg font-semibold 
                    transition-all flex items-center gap-2
                    ${buttonStyles}
                    ${className}
                `}
            >
                <span>📝</span>
                <span>Log Job</span>
            </button>

            <JobLogModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                prefillVehicle={vehicleString}
                prefillFccId={fccId || ''}
            />
        </>
    );
}
