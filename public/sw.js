// v25 - Fix: /data/ paths now network-first to prevent stale gallery manifest
const CACHE_NAME = 'euro-keys-v25';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/icon-192.png',
    '/assets/icon-512.png'
];

// Background Sync Constants
const SYNC_TAG = 'sync-jobs';
const DB_NAME = 'eurokeys-sync-queue';
const STORE_NAME = 'pending-operations';

// IndexedDB helpers for sync queue persistence
function openSyncDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

async function getQueuedOperations() {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function addToSyncQueue(operation) {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(operation);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function removeFromSyncQueue(id) {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearSyncQueue() {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

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

// Listen for messages from main thread (skip waiting + background sync)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Background sync: Queue an operation for later sync
    if (event.data && event.data.type === 'QUEUE_SYNC') {
        const operation = event.data.operation;
        if (operation) {
            addToSyncQueue(operation).then(() => {
                console.log('Service Worker: Queued operation for sync:', operation.type);
                // Request background sync if supported
                if (self.registration.sync) {
                    self.registration.sync.register(SYNC_TAG).catch(err => {
                        console.log('Service Worker: Background sync registration failed:', err);
                    });
                }
            });
        }
    }

    // Manually trigger sync processing (fallback for browsers without Background Sync API)
    if (event.data && event.data.type === 'PROCESS_QUEUE') {
        processQueuedOperations(event.data.authToken);
    }
});

// Background Sync event - triggered when connectivity is restored
self.addEventListener('sync', (event) => {
    if (event.tag === SYNC_TAG) {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(processQueuedOperations());
    }
});

// Process all queued operations
async function processQueuedOperations(authToken) {
    try {
        const operations = await getQueuedOperations();

        if (operations.length === 0) {
            console.log('Service Worker: No pending operations to sync');
            return;
        }

        console.log(`Service Worker: Processing ${operations.length} queued operations`);

        // Get auth token from storage if not provided
        if (!authToken) {
            // Try to get from clients
            const clients = await self.clients.matchAll();
            for (const client of clients) {
                client.postMessage({ type: 'GET_AUTH_TOKEN' });
            }
            // Wait a bit for response, but proceed anyway
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        for (const op of operations) {
            try {
                const headers = {
                    'Content-Type': 'application/json'
                };

                // Include auth token if available in operation
                if (op.authToken) {
                    headers['Authorization'] = `Bearer ${op.authToken}`;
                }

                const response = await fetch(op.url, {
                    method: op.method || 'POST',
                    headers,
                    body: op.body ? JSON.stringify(op.body) : undefined
                });

                if (response.ok) {
                    console.log(`Service Worker: Successfully synced operation ${op.id}`);
                    await removeFromSyncQueue(op.id);

                    // Notify clients of successful sync
                    const clients = await self.clients.matchAll();
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'SYNC_COMPLETE',
                            operationId: op.id,
                            success: true
                        });
                    });
                } else {
                    console.log(`Service Worker: Failed to sync operation ${op.id}:`, response.status);
                }
            } catch (error) {
                console.log(`Service Worker: Error syncing operation ${op.id}:`, error);
                // Keep in queue for retry
            }
        }
    } catch (error) {
        console.error('Service Worker: Error processing queue:', error);
    }
}

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

    // Main Page, Browse, Vehicle, API & Data files: Network-first (always get fresh content)
    const isMainPage = url.pathname === '/' || url.pathname === '/index.html';
    const isBrowseOrVehicle = url.pathname.startsWith('/browse') || url.pathname.startsWith('/vehicle');
    const isApi = url.pathname.startsWith('/api/') || url.hostname.includes('workers.dev');
    const isDataFile = url.pathname.startsWith('/data/');

    if (isSensitiveApi) {
        event.respondWith(fetch(request)); // Pure network, no cache
        return;
    }

    if (isMainPage || isBrowseOrVehicle || isApi || isDataFile) {
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
