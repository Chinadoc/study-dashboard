'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UpgradePrompt from '@/components/UpgradePrompt';

const FREE_VEHICLE_IMAGE_LIMIT = 1;

interface ImageReference {
    url?: string;
    filename?: string;
    image_type?: string;
    description?: string;
    tags?: string[];
    r2_key?: string;
    relevance?: {
        score: number;
        reasons: string[];
    };
}

interface VisualReferencesProps {
    images: ImageReference[];
}

const R2_PROXY = 'https://euro-keys.jeremy-samuels17.workers.dev/api/r2';

export default function VisualReferences({ images }: VisualReferencesProps) {
    const { hasImages } = useAuth();
    const [modalIndex, setModalIndex] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);

    // Build the list of navigable (unlocked) images
    const navigableImages = images.filter((_, i) => hasImages || i < FREE_VEHICLE_IMAGE_LIMIT);

    const openModal = useCallback((img: ImageReference) => {
        const idx = navigableImages.indexOf(img);
        setModalIndex(idx >= 0 ? idx : 0);
    }, [navigableImages]);

    const closeModal = useCallback(() => setModalIndex(null), []);

    const goNext = useCallback(() => {
        if (modalIndex === null) return;
        setModalIndex((modalIndex + 1) % navigableImages.length);
    }, [modalIndex, navigableImages.length]);

    const goPrev = useCallback(() => {
        if (modalIndex === null) return;
        setModalIndex((modalIndex - 1 + navigableImages.length) % navigableImages.length);
    }, [modalIndex, navigableImages.length]);

    // Lock body scroll & listen for keyboard when modal is open
    useEffect(() => {
        if (modalIndex === null) return;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeModal();
            else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
        };

        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            window.removeEventListener('keydown', handleKey);
        };
    }, [modalIndex, closeModal, goNext, goPrev]);

    // Touch handlers for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null || touchStartY.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        touchStartX.current = null;
        touchStartY.current = null;

        // Only trigger if horizontal swipe is dominant and > 50px
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) goNext();
            else goPrev();
        }
    };

    if (!images || images.length === 0) {
        return (
            <section className="glass p-6 mb-6">
                <h3 className="flex items-center gap-3 text-lg font-bold text-amber-400 mb-4">
                    <span className="text-xl">📸</span>
                    Visual References
                </h3>
                <div className="text-center text-zinc-500 py-8">
                    <div className="text-4xl mb-2">📷</div>
                    <p>No visual references available for this vehicle yet.</p>
                </div>
            </section>
        );
    }

    const getImageUrl = (img: ImageReference) => img.r2_key
        ? `${R2_PROXY}/${img.r2_key}`
        : img.url || '';

    const displayedImages = showAll ? images : images.slice(0, 6);
    const modalImage = modalIndex !== null ? navigableImages[modalIndex] : null;

    return (
        <section className="glass p-6 mb-6">
            <h3 className="flex items-center gap-3 text-lg font-bold text-amber-400 mb-4">
                <span className="text-xl">📸</span>
                Visual References
                <span className="text-xs text-zinc-500 font-normal ml-2">
                    ({images.length} image{images.length !== 1 ? 's' : ''})
                </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedImages.map((img, index) => {
                    const imageUrl = getImageUrl(img);
                    const isLocked = !hasImages && index >= FREE_VEHICLE_IMAGE_LIMIT;

                    return (
                        <div
                            key={`img-${index}-${img.filename || img.r2_key || 'unknown'}`}
                            className={`bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-700/50 transition-all ${isLocked ? 'opacity-50 cursor-pointer' : 'hover:border-purple-500/50 cursor-pointer'}`}
                            onClick={() => isLocked ? setShowUpgradeModal(true) : openModal(img)}
                            style={isLocked ? { filter: 'blur(3px)' } : {}}
                        >
                            <div className="relative h-44 bg-zinc-900">
                                {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10" style={{ filter: 'none' }}>
                                        <span className="text-3xl">🔒</span>
                                    </div>
                                )}
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={img.description || img.filename || 'Reference image'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect fill="%23374151" width="200" height="150"/><text fill="%236B7280" font-family="system-ui" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Image Unavailable</text></svg>';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <span className="text-4xl">📷</span>
                                    </div>
                                )}

                                {/* Image type badge */}
                                {img.image_type && (
                                    <span className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-black text-[10px] font-bold uppercase rounded">
                                        {img.image_type}
                                    </span>
                                )}

                                {/* Relevance reason badge */}
                                {img.relevance?.reasons?.[0] && (
                                    <span className="absolute top-2 right-2 px-2 py-1 bg-purple-500/80 text-white text-[10px] font-medium rounded">
                                        {img.relevance.reasons[0]}
                                    </span>
                                )}
                            </div>

                            <div className="p-3">
                                <p className="text-sm text-zinc-300 line-clamp-2">
                                    {img.description || img.filename || 'Reference image'}
                                </p>

                                {img.tags && img.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {img.tags.slice(0, 4).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 bg-amber-900/30 text-amber-400 text-[10px] rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show upgrade prompt for locked images */}
            {!hasImages && images.length > FREE_VEHICLE_IMAGE_LIMIT && (
                <div className="mt-4">
                    <UpgradePrompt
                        itemType="images"
                        remainingCount={images.length - FREE_VEHICLE_IMAGE_LIMIT}
                        compact={true}
                    />
                </div>
            )}

            {images.length > 6 && (
                <div className="text-center mt-4">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
                    >
                        {showAll ? 'Show Less' : `View All ${images.length} Images →`}
                    </button>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {modalImage && modalIndex !== null && (
                <div
                    className="fixed inset-0 bg-black/95 flex items-center justify-center"
                    style={{ zIndex: 9999 }}
                    onClick={closeModal}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Close button */}
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl transition-colors z-10 w-10 h-10 flex items-center justify-center"
                        aria-label="Close"
                    >
                        ✕
                    </button>

                    {/* Image counter */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 text-zinc-400 text-sm z-10">
                        {modalIndex + 1} / {navigableImages.length}
                    </div>

                    {/* Previous button */}
                    {navigableImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goPrev(); }}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-4xl sm:text-5xl transition-colors z-10 w-12 h-20 flex items-center justify-center select-none"
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                    )}

                    {/* Next button */}
                    {navigableImages.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goNext(); }}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-4xl sm:text-5xl transition-colors z-10 w-12 h-20 flex items-center justify-center select-none"
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    )}

                    {/* Image + caption */}
                    <div
                        className="flex flex-col items-center max-w-5xl w-full px-14 sm:px-20"
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={getImageUrl(modalImage)}
                            alt={modalImage.description || 'Full-size image'}
                            className="max-w-full max-h-[78vh] object-contain rounded-lg"
                            draggable={false}
                        />
                        <div className="mt-4 text-center">
                            <p className="text-white text-lg">{modalImage.description || modalImage.filename}</p>
                            {modalImage.image_type && (
                                <span className="inline-block mt-2 px-3 py-1 bg-amber-500/90 text-black text-xs font-bold uppercase rounded">
                                    {modalImage.image_type}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div
                    className="fixed inset-0 bg-black/90 flex items-center justify-center p-4"
                    style={{ zIndex: 9999 }}
                    onClick={() => setShowUpgradeModal(false)}
                >
                    <div className="max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <UpgradePrompt
                            itemType="images"
                            message="Unlock All Vehicle Images"
                            remainingCount={images.length - FREE_VEHICLE_IMAGE_LIMIT}
                        />
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="w-full mt-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
