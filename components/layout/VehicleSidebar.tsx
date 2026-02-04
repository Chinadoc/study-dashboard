'use client';

import { useState } from 'react';

interface VehicleSidebarProps {
    activeSection?: string;
    onSectionChange?: (section: string) => void;
    availableSections?: {
        specs?: boolean;
        procedures?: boolean;
        keyConfigs?: boolean;
        images?: boolean;
        comments?: boolean;
        pearls?: boolean;
    };
}

const SECTIONS = [
    { id: 'specs', label: 'Specs', icon: '🔧', shortLabel: 'Specs' },
    { id: 'keyConfigs', label: 'Key Configs', icon: '🔑', shortLabel: 'Keys' },
    { id: 'images', label: 'Images', icon: '📷', shortLabel: 'Imgs' },
    { id: 'procedures', label: 'Procedures', icon: '📋', shortLabel: 'Proc' },
    { id: 'pearls', label: 'Pearls', icon: '💎', shortLabel: 'Tips' },
    { id: 'comments', label: 'Comments', icon: '💬', shortLabel: 'Chat' },
];

export default function VehicleSidebar({
    activeSection = 'procedures',
    onSectionChange,
    availableSections = {}
}: VehicleSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Filter sections based on what's available (default all true)
    const visibleSections = SECTIONS.filter(section => {
        const key = section.id as keyof typeof availableSections;
        return availableSections[key] !== false;
    });

    const handleSectionClick = (sectionId: string) => {
        onSectionChange?.(sectionId);
        // Scroll to section
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <>
            {/* Mobile: Horizontal pill bar fixed at top of vehicle page */}
            <div className="lg:hidden sticky top-14 z-30 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-2 py-2 overflow-x-auto">
                <div className="flex gap-1 min-w-max">
                    {visibleSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => handleSectionClick(section.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeSection === section.id
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                }`}
                        >
                            <span>{section.icon}</span>
                            <span>{section.shortLabel}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop: Compact vertical sidebar */}
            <aside
                className={`hidden lg:flex flex-col fixed left-0 top-[104px] z-30 bg-zinc-900/95 backdrop-blur-md border-r border-zinc-800 transition-all duration-200 ${isExpanded ? 'w-36' : 'w-12'
                    }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                style={{ height: 'calc(100vh - 104px)' }}
            >
                <div className="flex flex-col gap-1 p-2">
                    {visibleSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => handleSectionClick(section.id)}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${activeSection === section.id
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                                }`}
                            title={section.label}
                        >
                            <span className="text-lg shrink-0">{section.icon}</span>
                            {isExpanded && (
                                <span className="text-xs font-medium whitespace-nowrap overflow-hidden">
                                    {section.label}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </aside>
        </>
    );
}
