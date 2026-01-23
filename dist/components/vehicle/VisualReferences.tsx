'use client';

import React, { useState } from 'react';

interface ImageReference {
    url?: string;
    filename?: string;
    image_type?: string;
    description?: string;
    tags?: string[];
    r2_key?: string;
}

interface VisualReferencesProps {
    images: ImageReference[];
}

const R2_PROXY = 'https://euro-keys.jeremy-samuels17.workers.dev/api/r2';

export default function VisualReferences({ images }: VisualReferencesProps) {
    const [modalImage, setModalImage] = useState<ImageReference | null>(null);
    const [showAll, setShowAll] = useState(false);

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

                    return (
                        <div
                            key={img.filename || index}
                            className="bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
                            onClick={() => setModalImage(img)}
                        >
                            <div className="relative h-44 bg-zinc-900">
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

            {/* Image Modal - Fixed overlay */}
            {modalImage && (
                <div
                    className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/95 flex items-center justify-center p-4"
                    style={{ zIndex: 9999 }}
                    onClick={() => setModalImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setModalImage(null)}
                            className="absolute -top-12 right-0 text-white text-3xl hover:text-amber-400 transition-colors z-10"
                        >
                            ✕
                        </button>
                        <img
                            src={getImageUrl(modalImage)}
                            alt={modalImage.description || 'Full-size image'}
                            className="w-full max-h-[75vh] object-contain rounded-lg bg-zinc-900"
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
        </section>
    );
}
