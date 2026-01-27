// v21 - Resilient caching that doesn't fail on individual asset errors
const CACHE_NAME = 'euro-keys-v21';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/icon-192.png',
    '/assets/icon-512.png'
];

// Helper: Cache assets one by one, tolerating individual failures
async function cacheAssetsResiliently(cache, assets) {
    const results = await Promise.allSettled(
        assets.map(async (url) => {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    await cache.put(url, response);
                    return { url, success: true };
                }
                return { url, success: false, status: response.status };
            } catch (error) {
                return { url, success: false, error: error.message };
            }
        })
    );
    const cached = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`Service Worker: Cached ${cached}/${assets.length} static assets`);
}

// Install: Cache static assets (tolerate failures) and skip waiting immediately
self.addEventListener('install', (event) => {
    console.log(`Service Worker: Installing ${CACHE_NAME}`);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching static assets');
            return cacheAssetsResiliently(cache, STATIC_ASSETS);
        })
    );
    // Skip waiting to activate immediately
    self.skipWaiting();
});


// Activate: Clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
    console.log(`Service Worker: Activating ${CACHE_NAME}`);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('Service Worker: Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            // Claim all clients immediately
            return self.clients.claim();
        }).then(() => {
            // Notify all clients to reload for the update
            return self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
                });
            });
        })
    );
});

// Listen for skip waiting message from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch: Network-first for main pages, browse, vehicle & API, cache-first for other assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip non-HTTP(S) requests
    if (!url.protocol.startsWith('http')) return;

    // Sensitive APIs: NEVER cache /api/user, /api/auth, or /api/admin
    const isSensitiveApi = url.pathname.includes('/api/user') ||
        url.pathname.includes('/api/auth/') ||
        url.pathname.includes('/api/admin/');

    // Main Page, Browse, Vehicle & API: Network-first (always get fresh content)
    const isMainPage = url.pathname === '/' || url.pathname === '/index.html';
    const isBrowseOrVehicle = url.pathname.startsWith('/browse') || url.pathname.startsWith('/vehicle');
    const isApi = url.pathname.startsWith('/api/') || url.hostname.includes('workers.dev');

    if (isSensitiveApi) {
        event.respondWith(fetch(request)); // Pure network, no cache
        return;
    }

    if (isMainPage || isBrowseOrVehicle || isApi) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Update cache for main page
                    if (isMainPage && response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if offline
                    return caches.match(request).then((cached) => {
                        if (cached) return cached;
                        if (isApi) {
                            return new Response(JSON.stringify({ error: 'Offline - Data unavailable' }), {
                                headers: { 'Content-Type': 'application/json' }
                            });
                        }
                    });
                })
        );
        return;
    }

    // Static assets: Cache-first, then network
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request).then((response) => {
                // Cache successful responses
                if (response.ok && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, clone);
                    });
                }
                return response;
            });
        })
    );
});
