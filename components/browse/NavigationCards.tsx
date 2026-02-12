'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NavCard {
    id: string;
    title: string;
    items: string[];
    image: string;
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
        image: '/images/cards/browse.png',
        href: '#finder',
        accentColor: '#a855f7',
        linkLabel: 'Browse by Make',
        isScroll: true,
    },
    {
        id: 'fcc',
        title: 'FCC Intelligence',
        items: ['FCC ID lookup', 'Frequency & chip data', 'Vehicle compatibility'],
        image: '/images/cards/fcc.png',
        href: '/fcc',
        accentColor: '#06b6d4',
        linkLabel: 'Look up FCC data',
    },
    {
        id: 'dossiers',
        title: 'Technical Dossiers',
        items: ['230+ expert guides', 'Wiring & procedures', 'Platform intelligence'],
        image: '/images/cards/dossiers.png',
        href: '/dossiers',
        accentColor: '#f59e0b',
        linkLabel: 'Read dossiers',
    },
    {
        id: 'gallery',
        title: 'Photo Gallery',
        items: ['Key reference photos', 'Tool & board images', 'Tagged & searchable'],
        image: '/images/cards/gallery.png',
        href: '/gallery',
        accentColor: '#10b981',
        linkLabel: 'View gallery',
    },
    {
        id: 'business',
        title: 'Business Suite',
        items: ['Job logging & tracking', 'Inventory management', 'Revenue analytics'],
        image: '/images/cards/business.png',
        href: '/business',
        accentColor: '#eab308',
        linkLabel: 'Open dashboard',
    },
    {
        id: 'community',
        title: 'Community Hub',
        items: ['Expert discussions', 'Tech tips & tricks', 'Vote on solutions'],
        image: '/images/cards/community.png',
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

                    return (
                        <Wrapper
                            key={card.id}
                            {...(wrapperProps as any)}
                            className="group block rounded-xl overflow-hidden transition-all duration-250 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 no-underline"
                            style={{
                                background: 'linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(20,20,30,0.98) 100%)',
                                border: `1px solid rgba(255,255,255,0.08)`,
                            }}
                        >
                            {/* Card Title - Amazon style: bold colored header */}
                            <div className="px-4 pt-3.5 pb-1.5">
                                <h3
                                    className="text-sm md:text-[15px] font-bold leading-tight tracking-tight"
                                    style={{ color: card.accentColor }}
                                >
                                    {card.title}
                                </h3>
                            </div>

                            {/* Card Image with gradient overlay */}
                            <div
                                className="relative w-full h-24 md:h-28 flex items-center justify-center overflow-hidden"
                                style={{
                                    background: `radial-gradient(ellipse at center, ${card.accentColor}12 0%, transparent 75%)`,
                                }}
                            >
                                <Image
                                    src={card.image}
                                    alt={card.title}
                                    width={110}
                                    height={110}
                                    className="object-contain max-h-[88px] md:max-h-[100px] transition-transform duration-300 group-hover:scale-110 drop-shadow-lg"
                                    style={{
                                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                                    }}
                                    unoptimized
                                />
                                {/* Subtle gradient fade at bottom */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-6"
                                    style={{
                                        background: 'linear-gradient(to top, rgba(20,20,30,1) 0%, transparent 100%)',
                                    }}
                                />
                            </div>

                            {/* Card Items - Amazon style: small bullet list */}
                            <div className="px-4 pb-1.5">
                                <ul className="space-y-0.5">
                                    {card.items.map((item, i) => (
                                        <li key={i} className="text-[11px] md:text-xs text-zinc-400 leading-tight truncate">
                                            <span className="text-zinc-600 mr-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Card Link - Amazon style: colored "See more" link */}
                            <div className="px-4 pb-3 pt-1">
                                <span
                                    className="text-[11px] md:text-xs font-medium group-hover:underline transition-colors"
                                    style={{ color: card.accentColor }}
                                >
                                    {card.linkLabel} →
                                </span>
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
