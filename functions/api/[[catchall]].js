// Cloudflare Pages Function to proxy /api/* requests to the Worker
// This is a catch-all handler for all /api routes

const WORKER_API = 'https://euro-keys.jeremy-samuels17.workers.dev';

// Handle OPTIONS preflight requests
export async function onRequestOptions(context) {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400',
        },
    });
}

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const targetUrl = `${WORKER_API}${url.pathname}${url.search}`;

    console.log(`[Pages Function] Proxying: ${context.request.method} ${url.pathname} -> ${targetUrl}`);

    try {
        // Build request options
        const requestInit = {
            method: context.request.method,
            headers: new Headers(context.request.headers),
            redirect: 'follow',
        };

        // Include body for non-GET/HEAD requests
        if (!['GET', 'HEAD'].includes(context.request.method)) {
            requestInit.body = context.request.body;
            // Ensure duplex streaming for request body
            requestInit.duplex = 'half';
        }

        // Forward the request to the Worker API
        const response = await fetch(targetUrl, requestInit);

        // Build response with CORS headers
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error(`[Pages Function] Proxy error: ${error.message}`);
        return new Response(JSON.stringify({
            error: 'API Proxy Error',
            message: error.message,
            path: url.pathname,
        }), {
            status: 502,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
