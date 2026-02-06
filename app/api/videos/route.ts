import { NextRequest, NextResponse } from 'next/server';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';

// Compact video entry: [video_id, title, category, tool]
type CompactVideo = [string, string, string, string];

// Import the compact vehicle-video map at build time
// Keys are "Make|Model", values are arrays of [video_id, title, category, tool]
import vehicleVideoMap from '@/data/vehicle_video_map_compact.json';

// Type the imported map
const VIDEO_MAP = vehicleVideoMap as Record<string, CompactVideo[]>;

/**
 * Get the "video of the day" index for a given vehicle.
 * Uses the current UTC date so every visitor sees the same video that day,
 * but it rotates daily.
 */
function getDailyIndex(videoCount: number): number {
    const now = new Date();
    const daySeed = now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
    return daySeed % videoCount;
}

/**
 * Expand compact video to full object
 */
function expandVideo(compact: CompactVideo) {
    return {
        video_id: compact[0],
        title: compact[1],
        category: compact[2],
        tool: compact[3] || null,
        youtube_url: `https://www.youtube.com/watch?v=${compact[0]}`,
    };
}

/**
 * Look up videos for a vehicle by Make and Model.
 * Falls back to make-only if no exact match.
 */
function lookupVideos(make: string, model?: string): CompactVideo[] {
    // Try exact Make|Model match first
    if (model) {
        const key = `${make}|${model}`;
        if (VIDEO_MAP[key]) return VIDEO_MAP[key];

        // Try case-insensitive
        const keyLower = key.toLowerCase();
        for (const [mapKey, videos] of Object.entries(VIDEO_MAP)) {
            if (mapKey.toLowerCase() === keyLower) return videos;
        }

        // Try partial model match (e.g. "Civic" matches "Civic (FE)")
        const modelLower = model.toLowerCase();
        for (const [mapKey, videos] of Object.entries(VIDEO_MAP)) {
            const [mapMake, mapModel] = mapKey.split('|');
            if (mapMake.toLowerCase() === make.toLowerCase() && mapModel.toLowerCase().startsWith(modelLower)) {
                return videos;
            }
        }
    }

    // Fall back to make-only: collect unique videos for this make
    const makeLower = make.toLowerCase();
    const seen = new Set<string>();
    const makeVideos: CompactVideo[] = [];
    for (const [mapKey, videos] of Object.entries(VIDEO_MAP)) {
        const [mapMake] = mapKey.split('|');
        if (mapMake.toLowerCase() === makeLower) {
            for (const v of videos) {
                if (!seen.has(v[0])) {
                    seen.add(v[0]);
                    makeVideos.push(v);
                }
            }
        }
    }
    return makeVideos;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const all = searchParams.get('all');

    // Return all mapped vehicles summary
    if (all === 'true') {
        const summary = Object.entries(VIDEO_MAP).map(([key, videos]) => {
            const [m, mod] = key.split('|');
            return { make: m, model: mod, videoCount: videos.length };
        });
        return NextResponse.json({ vehicles: summary, total: summary.length });
    }

    // Require make
    if (!make) {
        return NextResponse.json({
            error: 'Missing required parameter: make',
            usage: '/api/videos?make=Honda&model=Civic&year=2018'
        }, { status: 400 });
    }

    const videos = lookupVideos(make, model || undefined);

    if (!videos.length) {
        return NextResponse.json({
            featured: null,
            related: [],
            make,
            model,
            year: year ? parseInt(year) : null,
            totalVideos: 0,
        });
    }

    // Pick featured video using daily rotation
    const dailyIdx = getDailyIndex(videos.length);
    const featured = expandVideo(videos[dailyIdx]);

    // Related: next 3 after featured, wrapping around
    const related = [];
    for (let i = 1; i <= 3 && i < videos.length; i++) {
        related.push(expandVideo(videos[(dailyIdx + i) % videos.length]));
    }

    return NextResponse.json({
        featured,
        related,
        make,
        model,
        year: year ? parseInt(year) : null,
        totalVideos: videos.length,
    });
}
