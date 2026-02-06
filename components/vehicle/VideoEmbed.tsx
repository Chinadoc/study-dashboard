'use client';

import React, { useState, useEffect } from 'react';

// Compact video format: [video_id, title, category, tool]
type CompactVideo = [string, string, string, string];

interface VideoEmbedProps {
    make: string;
    model: string;
    year: number;
}

// Cache the fetched video map globally so it's only loaded once
let cachedVideoMap: Record<string, CompactVideo[]> | null = null;
let fetchPromise: Promise<Record<string, CompactVideo[]>> | null = null;

async function getVideoMap(): Promise<Record<string, CompactVideo[]>> {
    if (cachedVideoMap) return cachedVideoMap;
    if (fetchPromise) return fetchPromise;

    fetchPromise = fetch('/vehicle-videos.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load video map');
            return res.json();
        })
        .then(data => {
            cachedVideoMap = data;
            return data;
        });

    return fetchPromise;
}

/**
 * Get daily rotation index based on UTC date
 */
function getDailyIndex(videoCount: number): number {
    const now = new Date();
    const daySeed = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
    return daySeed % videoCount;
}

/**
 * Look up videos for a vehicle by Make and Model
 */
function lookupVideos(map: Record<string, CompactVideo[]>, make: string, model?: string): CompactVideo[] {
    // Try exact Make|Model match
    if (model) {
        const key = `${make}|${model}`;
        if (map[key]) return map[key];

        // Case-insensitive
        const keyLower = key.toLowerCase();
        for (const [mapKey, videos] of Object.entries(map)) {
            if (mapKey.toLowerCase() === keyLower) return videos;
        }

        // Partial model match
        const modelLower = model.toLowerCase();
        for (const [mapKey, videos] of Object.entries(map)) {
            const [mapMake, mapModel] = mapKey.split('|');
            if (mapMake.toLowerCase() === make.toLowerCase() && mapModel.toLowerCase().startsWith(modelLower)) {
                return videos;
            }
        }
    }

    // Make-only fallback: collect unique videos
    const makeLower = make.toLowerCase();
    const seen = new Set<string>();
    const result: CompactVideo[] = [];
    for (const [mapKey, videos] of Object.entries(map)) {
        const [mapMake] = mapKey.split('|');
        if (mapMake.toLowerCase() === makeLower) {
            for (const v of videos) {
                if (!seen.has(v[0])) {
                    seen.add(v[0]);
                    result.push(v);
                }
            }
        }
    }
    return result;
}

/**
 * Displays a daily-rotating YouTube tutorial video for the current vehicle.
 * Fetches from static JSON and handles rotation client-side.
 */
export default function VideoEmbed({ make, model, year }: VideoEmbedProps) {
    const [video, setVideo] = useState<{ video_id: string; title: string; category: string; tool: string | null } | null>(null);
    const [totalVideos, setTotalVideos] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!make) { setLoading(false); return; }

        getVideoMap()
            .then(map => {
                const videos = lookupVideos(map, make, model);
                if (videos.length > 0) {
                    const idx = getDailyIndex(videos.length);
                    const v = videos[idx];
                    setVideo({
                        video_id: v[0],
                        title: v[1],
                        category: v[2],
                        tool: v[3] || null,
                    });
                    setTotalVideos(videos.length);
                }
            })
            .catch(err => console.error('Video map load error:', err))
            .finally(() => setLoading(false));
    }, [make, model, year]);

    if (loading || !video) return null;

    const categoryLabel = video.category === 'akl' ? '🔓 All Keys Lost' :
        video.category === 'add_key' ? '🔑 Add Key' :
            video.category === 'programming' ? '⚙️ Programming' :
                video.category === 'bypass' ? '🔧 Bypass' :
                    video.category === 'bcm' ? '🧩 BCM' :
                        video.category === 'battery' ? '🔋 Battery' :
                            video.category === 'diagnostic' ? '🔍 Diagnostic' :
                                video.category === 'lishi' ? '🔐 Lishi' :
                                    video.category === 'door_code' ? '🚪 Door Code' :
                                        video.category === 'emergency' ? '🚨 Emergency' :
                                            video.category === 'pin_code' ? '📟 Pin Code' :
                                                '📚 Tutorial';

    const categoryColor = video.category === 'akl' ? 'bg-red-500/20 text-red-400' :
        video.category === 'add_key' ? 'bg-green-500/20 text-green-400' :
            video.category === 'programming' ? 'bg-blue-500/20 text-blue-400' :
                video.category === 'bypass' ? 'bg-amber-500/20 text-amber-400' :
                    video.category === 'bcm' ? 'bg-cyan-500/20 text-cyan-400' :
                        video.category === 'diagnostic' ? 'bg-indigo-500/20 text-indigo-400' :
                            'bg-zinc-500/20 text-zinc-400';

    return (
        <section className="glass p-4 sm:p-6 mb-6">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>📺</span> Related Video
                    {totalVideos > 1 && (
                        <span className="text-xs font-normal text-zinc-500">
                            ({totalVideos} videos · rotates daily)
                        </span>
                    )}
                </h2>
                <span className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {/* Video title */}
            <p className="text-sm text-zinc-400 mt-2 line-clamp-1">{video.title}</p>

            {/* Category + tool badges */}
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor}`}>
                    {categoryLabel}
                </span>
                {video.tool && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        {video.tool}
                    </span>
                )}
            </div>

            {/* Expandable embed */}
            {isExpanded && (
                <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden bg-zinc-900">
                    <iframe
                        src={`https://www.youtube.com/embed/${video.video_id}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            )}

            {/* YouTube link */}
            <a
                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
                Watch on YouTube →
            </a>
        </section>
    );
}
