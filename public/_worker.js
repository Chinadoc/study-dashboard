// Cloudflare Pages _worker.js for SPA routing and API proxying
// - Proxies /api/* requests to the Cloudflare Worker API
// - Serves fallback HTML for /vehicle/* routes (SPA routing)

const WORKER_API = 'https://euro-keys.jeremy-samuels17.workers.dev';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        // ============================================
        // API PROXY: Forward /api/* to Worker API
        // ============================================
        if (pathname.startsWith('/api/')) {
            const apiUrl = `${WORKER_API}${pathname}${url.search}`;

            // Clone request with new URL, preserving method/headers/body
            const apiRequest = new Request(apiUrl, {
                method: request.method,
                headers: request.headers,
                body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
                redirect: 'follow',
            });

            try {
                const response = await fetch(apiRequest);

                // Clone response and add CORS headers for browser compatibility
                const newHeaders = new Headers(response.headers);
                newHeaders.set('Access-Control-Allow-Origin', '*');
                newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: 'API proxy error', message: error.message }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Handle CORS preflight for API routes
        if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
            return new Response(null, {
                status: 204,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // ============================================
        // SPA ROUTING: Handle vehicle routes
        // ============================================
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
