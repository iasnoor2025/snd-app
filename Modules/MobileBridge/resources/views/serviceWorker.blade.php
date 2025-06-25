const CACHE_NAME = '{{ $cacheName }}';
const OFFLINE_URL = '{{ $offlineRoute }}';
const CACHE_STRATEGY = '{{ $cacheStrategy }}';

const PRECACHE_ASSETS = @json($assets);
const CACHEABLE_ROUTES = @json($routes);

// Install event - precache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll([
                    OFFLINE_URL,
                    ...PRECACHE_ASSETS,
                ]);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
        .then(() => self.clients.claim())
    );
});

// Fetch event - handle requests based on strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle different caching strategies
    switch (CACHE_STRATEGY) {
        case 'cache-first':
            event.respondWith(handleCacheFirst(request));
            break;
        case 'network-first':
            event.respondWith(handleNetworkFirst(request));
            break;
        case 'stale-while-revalidate':
            event.respondWith(handleStaleWhileRevalidate(request));
            break;
        default:
            event.respondWith(handleNetworkFirst(request));
    }
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/images/icons/icon-192x192.png',
            badge: '/images/icons/badge-72x72.png',
            data: data.data || {},
            actions: data.actions || [],
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action) {
        // Handle notification action clicks
        const action = event.notification.data.actions.find(
            (a) => a.action === event.action
        );
        if (action && action.url) {
            event.waitUntil(clients.openWindow(action.url));
        }
    } else {
        // Handle notification clicks
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                if (clientList.length > 0) {
                    clientList[0].focus();
                } else {
                    clients.openWindow('/');
                }
            })
        );
    }
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(handleDataSync());
    }
});

// Cache-first strategy
async function handleCacheFirst(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetchAndCache(request);
}

// Network-first strategy
async function handleNetworkFirst(request) {
    try {
        const response = await fetchAndCache(request);
        return response;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If the request is for a page (HTML), return offline page
        if (request.headers.get('Accept').includes('text/html')) {
            return caches.match(OFFLINE_URL);
        }
        
        throw error;
    }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetchAndCache(request);
    
    return cachedResponse || fetchPromise;
}

// Fetch and cache
async function fetchAndCache(request) {
    const response = await fetch(request);
    
    // Only cache valid responses of cacheable routes or assets
    if (response.ok && shouldCache(request.url)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
    }
    
    return response;
}

// Check if URL should be cached
function shouldCache(url) {
    const path = new URL(url).pathname;
    
    // Check if it's a precache asset
    if (PRECACHE_ASSETS.includes(path)) {
        return true;
    }
    
    // Check if it's a cacheable route
    return CACHEABLE_ROUTES.some((route) => {
        if (route.endsWith('*')) {
            return path.startsWith(route.slice(0, -1));
        }
        return path === route;
    });
}

// Handle background data sync
async function handleDataSync() {
    const cache = await caches.open('sync-data');
    const requests = await cache.keys();
    
    return Promise.all(
        requests.map(async (request) => {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.delete(request);
                }
                return response;
            } catch (error) {
                console.error('Sync failed:', error);
                return error;
            }
        })
    );
} 