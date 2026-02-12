'use client';

import React from 'react';
import Link from 'next/link';
import {
    Search,
    Radio,
    BookOpen,
    Image as ImageIcon,
    Briefcase,
    MessageSquare,
    LucideIcon
} from 'lucide-react';

interface NavCard {
    id: string;
    title: string;
    items: string[];
    icon: LucideIcon;
    href: string;
    accentColor: string;
    linkLabel: string;
    isScroll?: boolean;
}

const NAV_CARDS: NavCard[] = [
    {
        id: 'browse',
        title: 'Vehicle Database',
        items: ['Search 800+ vehicles', 'Key programming data', 'Part numbers & pricing'],
        icon: Search,
        href: '/browse',
        accentColor: '#a855f7',
        linkLabel: 'Browse by Make',
    },
    {
        id: 'fcc',
        title: 'FCC Intelligence',
        items: ['FCC ID lookup', 'Frequency & chip data', 'Vehicle compatibility'],
        icon: Radio,
        href: '/fcc',
        accentColor: '#06b6d4',
        linkLabel: 'Look up FCC data',
    },
    {
        id: 'dossiers',
        title: 'Technical Dossiers',
        items: ['230+ expert guides', 'Wiring & procedures', 'Platform intelligence'],
        icon: BookOpen,
        href: '/dossiers',
        accentColor: '#f59e0b',
        linkLabel: 'Read dossiers',
    },
    {
        id: 'gallery',
        title: 'Photo Gallery',
        items: ['Key reference photos', 'Tool & board images', 'Tagged & searchable'],
        icon: ImageIcon,
        href: '/gallery',
        accentColor: '#10b981',
        linkLabel: 'View gallery',
    },
    {
        id: 'business',
        title: 'Business Suite',
        items: ['Job logging & tracking', 'Inventory management', 'Revenue analytics'],
        icon: Briefcase,
        href: '/business',
        accentColor: '#eab308',
        linkLabel: 'Open dashboard',
    },
    {
        id: 'community',
        title: 'Community Hub',
        items: ['Expert discussions', 'Tech tips & tricks', 'Vote on solutions'],
        icon: MessageSquare,
        href: '/community',
        accentColor: '#f43f5e',
        linkLabel: 'Join the conversation',
    },
];

export function NavigationCards() {
    const handleCardClick = (card: NavCard, e: React.MouseEvent) => {
        if (card.isScroll) {
            e.preventDefault();
            const finder = document.getElementById('finder');
            if (finder) {
                finder.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <div className="mb-6 mt-2">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {NAV_CARDS.map((card) => {
                    const Wrapper = card.isScroll ? 'a' : Link;
                    const wrapperProps = card.isScroll
                        ? { href: card.href, onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleCardClick(card, e) }
                        : { href: card.href };

                    const Icon = card.icon;

                    return (
                        <Wrapper
                            key={card.id}
                            {...(wrapperProps as any)}
                            className="group relative block rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 no-underline h-full"
                            style={{
                                background: 'linear-gradient(145deg, rgba(20,20,25,0.95) 0%, rgba(10,10,15,0.98) 100%)',
                                border: `1px solid rgba(255,255,255,0.06)`,
                            }}
                        >
                            {/* Faded Background Logo */}
                            <div className="absolute -right-6 -bottom-6 opacity-[0.07] transition-all duration-500 group-hover:opacity-[0.12] group-hover:scale-110 rotate-[-15deg]">
                                <Icon size={140} color={card.accentColor} />
                            </div>

                            {/* Card Content Container */}
                            <div className="relative z-10 flex flex-col h-full p-4">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors"
                                        style={{ color: card.accentColor }}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-white tracking-tight">
                                        {card.title}
                                    </h3>
                                </div>

                                {/* Items List */}
                                <ul className="space-y-1.5 mb-4 flex-grow">
                                    {card.items.map((item, i) => (
                                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5 leading-relaxed">
                                            <span
                                                className="mt-1 w-1 h-1 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: card.accentColor, opacity: 0.6 }}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>

                                {/* Link Label */}
                                <div className="mt-auto pt-2 border-t border-white/5">
                                    <span
                                        className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                                        style={{ color: card.accentColor }}
                                    >
                                        {card.linkLabel} <span className="text-[10px]">→</span>
                                    </span>
                                </div>
                            </div>

                            {/* Hover glow border effect */}
                            <div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                style={{
                                    boxShadow: `inset 0 0 0 1px ${card.accentColor}30`,
                                }}
                            />
                        </Wrapper>
                    );
                })}
            </div>
        </div>
    );
}
