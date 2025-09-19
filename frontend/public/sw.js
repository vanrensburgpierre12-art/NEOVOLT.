// Service Worker for Neovolt PWA
const CACHE_NAME = 'neovolt-v1.0.0'
const STATIC_CACHE = 'neovolt-static-v1.0.0'
const DYNAMIC_CACHE = 'neovolt-dynamic-v1.0.0'
const API_CACHE = 'neovolt-api-v1.0.0'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/products',
  '/cart',
  '/checkout',
  '/login',
  '/register',
  '/manifest.json',
  '/offline.html'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/products/categories/all',
  '/api/auth/me'
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Static assets - Cache First
  static: {
    strategy: 'cache-first',
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  // API calls - Network First with fallback
  api: {
    strategy: 'network-first',
    cacheName: API_CACHE,
    maxAge: 5 * 60 * 1000 // 5 minutes
  },
  // Images - Cache First with long expiration
  images: {
    strategy: 'cache-first',
    cacheName: STATIC_CACHE,
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
  },
  // HTML pages - Network First
  pages: {
    strategy: 'network-first',
    cacheName: DYNAMIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Service Worker: Static files cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Old caches cleaned up')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Determine cache strategy based on request type
  const strategy = getCacheStrategy(request)
  
  event.respondWith(
    handleRequest(request, strategy)
  )
})

// Get cache strategy for a request
function getCacheStrategy(request) {
  const url = new URL(request.url)
  
  // Static assets (JS, CSS, images, fonts)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)) {
    return CACHE_STRATEGIES.static
  }
  
  // API calls
  if (url.pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.api
  }
  
  // Images from uploads
  if (url.pathname.startsWith('/uploads/')) {
    return CACHE_STRATEGIES.images
  }
  
  // HTML pages
  if (request.headers.get('accept')?.includes('text/html')) {
    return CACHE_STRATEGIES.pages
  }
  
  // Default to network first
  return CACHE_STRATEGIES.api
}

// Handle request with appropriate strategy
async function handleRequest(request, strategy) {
  const cacheName = strategy.cacheName
  
  try {
    switch (strategy.strategy) {
      case 'cache-first':
        return await cacheFirst(request, cacheName)
      
      case 'network-first':
        return await networkFirst(request, cacheName)
      
      case 'network-only':
        return await fetch(request)
      
      case 'cache-only':
        return await caches.match(request)
      
      default:
        return await networkFirst(request, cacheName)
    }
  } catch (error) {
    console.error('Service Worker: Error handling request', error)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return a generic error response
    return new Response('Network error', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    })
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheAge = Date.now() - new Date(cachedResponse.headers.get('sw-cache-timestamp') || 0)
    const maxAge = CACHE_STRATEGIES.static.maxAge
    
    if (cacheAge < maxAge) {
      return cachedResponse
    }
  }
  
  // Fetch from network and cache
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    const responseToCache = networkResponse.clone()
    // Create new headers with the timestamp
    const newHeaders = new Headers(responseToCache.headers)
    newHeaders.set('sw-cache-timestamp', Date.now().toString())
    
    // Create new response with modified headers
    const responseWithTimestamp = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers: newHeaders
    })
    
    cache.put(request, responseWithTimestamp)
  }
  
  return networkResponse
}

// Network First strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the response
      const responseToCache = networkResponse.clone()
      // Create new headers with the timestamp
      const newHeaders = new Headers(responseToCache.headers)
      newHeaders.set('sw-cache-timestamp', Date.now().toString())
      
      // Create new response with modified headers
      const responseWithTimestamp = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: newHeaders
      })
      
      cache.put(request, responseWithTimestamp)
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // If it's a navigation request and no cache, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData())
  }
  
  if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncWishlistData())
  }
})

// Sync cart data when back online
async function syncCartData() {
  try {
    const cartData = await getStoredData('offline-cart')
    if (cartData && cartData.length > 0) {
      // Sync cart items to server
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cartData })
      })
      
      if (response.ok) {
        // Clear offline cart data
        await clearStoredData('offline-cart')
        console.log('Service Worker: Cart synced successfully')
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing cart', error)
  }
}

// Sync wishlist data when back online
async function syncWishlistData() {
  try {
    const wishlistData = await getStoredData('offline-wishlist')
    if (wishlistData && wishlistData.length > 0) {
      // Sync wishlist items to server
      const response = await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: wishlistData })
      })
      
      if (response.ok) {
        // Clear offline wishlist data
        await clearStoredData('offline-wishlist')
        console.log('Service Worker: Wishlist synced successfully')
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing wishlist', error)
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received')
  
  const options = {
    body: 'You have a new notification from Neovolt',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Products',
        icon: '/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.title = data.title || 'Neovolt Notification'
  }
  
  event.waitUntil(
    self.registration.showNotification('Neovolt', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/products')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls
    event.waitUntil(
      caches.open(STATIC_CACHE)
        .then((cache) => cache.addAll(urlsToCache))
    )
  }
})

// Utility functions
async function getStoredData(key) {
  try {
    const cache = await caches.open('neovolt-data')
    const response = await cache.match(`/data/${key}`)
    if (response) {
      return await response.json()
    }
  } catch (error) {
    console.error('Service Worker: Error getting stored data', error)
  }
  return null
}

async function setStoredData(key, data) {
  try {
    const cache = await caches.open('neovolt-data')
    const response = new Response(JSON.stringify(data))
    await cache.put(`/data/${key}`, response)
  } catch (error) {
    console.error('Service Worker: Error setting stored data', error)
  }
}

async function clearStoredData(key) {
  try {
    const cache = await caches.open('neovolt-data')
    await cache.delete(`/data/${key}`)
  } catch (error) {
    console.error('Service Worker: Error clearing stored data', error)
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync', event.tag)
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent())
  }
})

async function syncContent() {
  try {
    // Sync product data, categories, etc.
    const response = await fetch('/api/products/sync')
    if (response.ok) {
      console.log('Service Worker: Content synced successfully')
    }
  } catch (error) {
    console.error('Service Worker: Error syncing content', error)
  }
}