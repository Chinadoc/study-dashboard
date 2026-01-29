'use client';

import React, { useRef, useState, useEffect } from 'react';

interface HorizontalScrollerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Horizontal scroller with fade indicators showing more content available
 */
export function HorizontalScroller({ children, className = '' }: HorizontalScrollerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(true);

    const updateFades = () => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        setShowLeftFade(scrollLeft > 10);
        setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        updateFades();
        el.addEventListener('scroll', updateFades);
        window.addEventListener('resize', updateFades);

        return () => {
            el.removeEventListener('scroll', updateFades);
            window.removeEventListener('resize', updateFades);
        };
    }, []);

    // Re-check when children change
    useEffect(() => {
        updateFades();
    }, [children]);

    return (
        <div className={`relative ${className}`}>
            {/* Left fade indicator */}
            {showLeftFade && (
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0d1117] to-transparent z-10 pointer-events-none flex items-center">
                    <span className="text-white/40 ml-1 text-lg">‹</span>
                </div>
            )}

            {/* Scrollable content */}
            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {children}
            </div>

            {/* Right fade indicator - shows scroll hint */}
            {showRightFade && (
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0d1117] to-transparent z-10 pointer-events-none flex items-center justify-end">
                    <div className="flex items-center gap-1 mr-2 text-purple-400/60 animate-pulse">
                        <span className="text-xs">swipe</span>
                        <span className="text-lg">›</span>
                    </div>
                </div>
            )}
        </div>
    );
}
