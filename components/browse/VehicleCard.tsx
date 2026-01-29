'use client';

import React from 'react';
import Image from 'next/image';

interface VehicleCardProps {
    label: string;
    imageSrc?: string;
    isSelected?: boolean;
    onClick?: () => void;
    variant?: 'make' | 'model' | 'year';
}

/**
 * Card for displaying a vehicle make, model, or year.
 * Shows image if available, otherwise displays large text.
 */
export function VehicleCard({
    label,
    imageSrc,
    isSelected = false,
    onClick,
    variant = 'model'
}: VehicleCardProps) {
    const isYear = variant === 'year';

    // Size based on variant
    const sizeClasses = isYear
        ? 'w-20 h-16 min-w-[5rem]'
        : 'w-28 h-24 min-w-[7rem]';

    return (
        <button
            onClick={onClick}
            style={{ scrollSnapAlign: 'start' }}
            className={`
        ${sizeClasses}
        flex flex-col items-center justify-center
        rounded-xl transition-all duration-200
        backdrop-blur-sm
        ${isSelected
                    ? 'bg-purple-500/20 border-2 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)] scale-105'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/50'
                }
      `}
        >
            {imageSrc ? (
                <div className="relative w-full h-16 overflow-hidden rounded-t-lg">
                    <Image
                        src={imageSrc}
                        alt={label}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 112px, 112px"
                    />
                </div>
            ) : (
                <div className={`
          font-bold text-center px-2
          ${isYear ? 'text-xl' : 'text-lg'}
          ${isSelected ? 'text-purple-300' : 'text-white/80'}
        `}>
                    {label}
                </div>
            )}

            {/* Show label below image if there's an image */}
            {imageSrc && (
                <div className={`
          text-xs mt-1 px-1 text-center truncate w-full
          ${isSelected ? 'text-purple-300' : 'text-white/60'}
        `}>
                    {label}
                </div>
            )}
        </button>
    );
}
