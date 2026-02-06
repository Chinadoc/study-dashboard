'use client';

import React, { useState, useEffect } from 'react';

interface VideoTutorial {
    id: string;
    video_id: string;
    title: string;
    description: string;
    category: string;
    tool: string | null;
    related_make: string | null;
    related_model: string | null;
    related_year_start: number | null;
    related_year_end: number | null;
    youtube_url: string;
}

interface VideoEmbedProps {
    make: string;
    model: string;
    year: number;
}

/**
 * Displays a featured YouTube tutorial video for the current vehicle
 * Fetches from /api/videos endpoint which matches videos by make/model/year
 */
export default function VideoEmbed({ make, model, year }: VideoEmbedProps) {
    const [featured, setFeatured] = useState<VideoTutorial | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        async function fetchVideo() {
            if (!make) return;

            try {
                const params = new URLSearchParams({ make });
                if (model) params.set('model', model);
                if (year) params.set('year', String(year));

                const res = await fetch(`/api/videos?${params}`);
                if (!res.ok) throw new Error('Failed to fetch videos');

                const data = await res.json();
                setFeatured(data.featured || null);
            } catch (err) {
                console.error('Video fetch error:', err);
                setError('Could not load video');
            } finally {
                setLoading(false);
            }
        }

        fetchVideo();
    }, [make, model, year]);

    // Don't render anything if no video found
    if (loading) return null;
    if (error || !featured) return null;

    return (
        <section className="glass p-4 sm:p-6 mb-6">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>📺</span> Related Video
                </h2>
                <span className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {/* Video Info (always visible) */}
            <p className="text-sm text-zinc-400 mt-2 line-clamp-1">{featured.title}</p>

            {/* Category badge */}
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${featured.category === 'akl' ? 'bg-red-500/20 text-red-400' :
                        featured.category === 'add_key' ? 'bg-green-500/20 text-green-400' :
                            featured.category === 'programming' ? 'bg-blue-500/20 text-blue-400' :
                                featured.category === 'bypass' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-zinc-500/20 text-zinc-400'
                    }`}>
                    {featured.category === 'akl' ? '🔓 All Keys Lost' :
                        featured.category === 'add_key' ? '🔑 Add Key' :
                            featured.category === 'programming' ? '⚙️ Programming' :
                                featured.category === 'bypass' ? '🔧 Bypass' :
                                    '📚 Tutorial'}
                </span>
                {featured.tool && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        {featured.tool}
                    </span>
                )}
            </div>

            {/* Expandable Video Embed */}
            {isExpanded && (
                <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden bg-zinc-900">
                    <iframe
                        src={`https://www.youtube.com/embed/${featured.video_id}`}
                        title={featured.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            )}

            {/* External link */}
            <a
                href={featured.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
                Watch on YouTube →
            </a>
        </section>
    );
}
