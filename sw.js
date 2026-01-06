// v38 - Force Pearl Update
const CACHE_NAME = 'euro-keys-v38-pearls';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/icon-192.png',
    '/assets/icon-512.png',
    '/assets/data/structured_guides.json',
    '/public/js/tool_coverage_data.js',
    '/public/js/programming_guides_data.js'
];

// Install: Cache static assets and skip waiting immediately
self.addEventListener('install', (event) => {
    console.log(`Service Worker: Installing ${CACHE_NAME}`);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching static assets');
            return cache.addAll(STATIC_ASSETS);
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
        })
    );
});

// Listen for skip waiting message from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Fetch: Network-first for main pages & API, cache-first for other assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip non-HTTP(S) requests
    if (!url.protocol.startsWith('http')) return;

    // v30 CRITICAL: Skip ALL cross-origin requests entirely!
    // If we accidentally proxy a third-party page (e.g. Google Sign-In), 
    // its subrequests (gstatic.com, etc.) will be fetched with our origin 
    // and fail CORS. We should ONLY handle requests to our own domain.
    const isOurDomain = url.hostname === 'eurokeys.app' ||
        url.hostname.endsWith('.eurokeys.app') ||
        url.hostname === 'localhost' ||
        url.hostname.includes('127.0.0.1');
    if (!isOurDomain) {
        console.log(`SW: Skipping cross-origin: ${url.hostname}`);
        return;
    }

    // Sensitive APIs: NEVER cache /api/user, /api/auth, or /api/admin
    // v29 - HARDENING: Check request.url string directly to avoid URL parsing issues
    const urlString = request.url.toLowerCase();
    const isSensitiveApi = urlString.includes('/api/user') ||
        urlString.includes('/api/auth/') ||
        urlString.includes('/api/admin/');

    // Define isMainPage and isApi BEFORE they are used
    const isMainPage = url.pathname === '/' || url.pathname === '/index.html';
    const isApi = url.pathname.startsWith('/api/') || url.hostname.includes('workers.dev');

    // Debug logging for sensitive paths
    if (urlString.includes('/api/')) {
        console.log(`SW Fetch: ${urlString} | Sensitive: ${isSensitiveApi}`);
    }

    if (isSensitiveApi) {
        console.log('SW: Bypassing interception for sensitive API');
        return; // Fall through to browser network (CRITICAL for redirects)
    }

    if (isMainPage || isApi) {
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
