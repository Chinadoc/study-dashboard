'use client';

import React, { useState } from 'react';
import { getMakeLogo, getBrandColor, getMakeInitials } from '@/lib/make-data';

interface MakeCardProps {
    make: string;
    isSelected: boolean;
    onClick: () => void;
}

function MakeCard({ make, isSelected, onClick }: MakeCardProps) {
    const [imgError, setImgError] = useState(false);
    const logoUrl = getMakeLogo(make);
    const brandColor = getBrandColor(make);
    const initials = getMakeInitials(make);

    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center gap-2 p-4
                rounded-xl border transition-all duration-200 cursor-pointer
                ${isSelected
                    ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/50'
                    : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800'
                }
            `}
        >
            {!imgError ? (
                <img
                    src={logoUrl}
                    alt={make}
                    className="w-12 h-12 object-contain rounded-full bg-white p-1"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: brandColor }}
                >
                    {initials}
                </div>
            )}
            <span className="text-sm text-gray-300 font-medium text-center">{make}</span>
        </button>
    );
}

interface MakeGridProps {
    makes: string[];
    selectedMake: string | null;
    onSelect: (make: string) => void;
}

export function MakeGrid({ makes, selectedMake, onSelect }: MakeGridProps) {
    return (
        <div className="w-full">
            <h3 className="text-center text-gray-400 font-semibold mb-6">Or Select a Make</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {makes.map((make) => (
                    <MakeCard
                        key={make}
                        make={make}
                        isSelected={selectedMake === make}
                        onClick={() => onSelect(make)}
                    />
                ))}
            </div>
        </div>
    );
}
