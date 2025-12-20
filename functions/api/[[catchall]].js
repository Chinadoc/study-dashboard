// Cloudflare Pages Function to proxy /api/* requests to the Worker
// This is a catch-all handler for all /api routes

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const workerBaseUrl = 'https://euro-keys.jeremy-samuels17.workers.dev';

    // Construct the new URL for the Worker
    const newUrl = `${workerBaseUrl}${url.pathname}${url.search}`;

    console.log(`[Pages Function] Proxying: ${url.pathname} -> ${newUrl}`);

    // Forward the request to the Worker
    const response = await fetch(newUrl, {
        method: context.request.method,
        headers: context.request.headers,
        body: context.request.method !== 'GET' && context.request.method !== 'HEAD'
            ? context.request.body
            : undefined,
    });

    // Create a new response with CORS headers preserved
    const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });

    return newResponse;
}
