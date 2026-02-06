import { NextRequest, NextResponse } from 'next/server';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';

/**
 * Lightweight /api/videos endpoint.
 * Video data is now served as a static JSON file at /data/vehicle_video_map.json
 * and the VideoEmbed component handles lookup + daily rotation client-side.
 * This endpoint exists for backwards compatibility.
 */
export async function GET(request: NextRequest) {
    return NextResponse.json({
        message: 'Video data is served statically at /data/vehicle_video_map.json',
        note: 'The VideoEmbed component fetches and processes the map client-side.',
    });
}
