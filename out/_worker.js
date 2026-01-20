// Cloudflare Pages _worker.js for SPA routing
// This intercepts requests to /vehicle/* and serves the fallback page
// while preserving the clean URL in the browser

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        // Handle vehicle routes - serve fallback HTML
        if (pathname.startsWith('/vehicle/') && !pathname.includes('/_next/') && !pathname.includes('.')) {
            // Rewrite to the fallback page
            const fallbackUrl = new URL('/vehicle/fallback/index.html', url.origin);
            const response = await env.ASSETS.fetch(fallbackUrl);

            // Return with clean URL (no redirect)
            return new Response(response.body, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'public, max-age=0, must-revalidate',
                },
            });
        }

        // For all other requests, pass through to static assets
        return env.ASSETS.fetch(request);
    },
};
