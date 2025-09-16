// PWA Service Worker Registration and Management
class PWAManager {
  constructor() {
    this.registration = null
    this.isOnline = navigator.onLine
    this.setupEventListeners()
  }

  // Register service worker
  async register() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        console.log('Service Worker registered successfully:', this.registration)

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              this.showUpdateNotification()
            }
          })
        })

        return this.registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return null
      }
    } else {
      console.log('Service Worker not supported')
      return null
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.handleOnlineStatus()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.handleOfflineStatus()
    })

    // Service worker messages
    navigator.serviceWorker?.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data)
    })

    // Before install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault()
      this.deferredPrompt = event
      this.showInstallPrompt()
    })

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      this.trackInstallation()
    })
  }

  // Handle online status
  handleOnlineStatus() {
    // Sync offline data when back online
    this.syncOfflineData()
    
    // Show online notification
    this.showNotification('You\'re back online!', 'success')
  }

  // Handle offline status
  handleOfflineStatus() {
    // Show offline notification
    this.showNotification('You\'re offline. Some features may be limited.', 'warning')
  }

  // Sync offline data
  async syncOfflineData() {
    try {
      // Sync cart data
      const cartData = this.getStoredData('offline-cart')
      if (cartData && cartData.length > 0) {
        await this.syncCartData(cartData)
      }

      // Sync wishlist data
      const wishlistData = this.getStoredData('offline-wishlist')
      if (wishlistData && wishlistData.length > 0) {
        await this.syncWishlistData(wishlistData)
      }

      // Clear offline data after successful sync
      this.clearStoredData('offline-cart')
      this.clearStoredData('offline-wishlist')
    } catch (error) {
      console.error('Failed to sync offline data:', error)
    }
  }

  // Sync cart data
  async syncCartData(cartData) {
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ items: cartData })
      })

      if (response.ok) {
        console.log('Cart data synced successfully')
      }
    } catch (error) {
      console.error('Failed to sync cart data:', error)
    }
  }

  // Sync wishlist data
  async syncWishlistData(wishlistData) {
    try {
      const response = await fetch('/api/wishlist/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ items: wishlistData })
      })

      if (response.ok) {
        console.log('Wishlist data synced successfully')
      }
    } catch (error) {
      console.error('Failed to sync wishlist data:', error)
    }
  }

  // Handle service worker messages
  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.showNotification('App updated! Refresh to see changes.', 'info')
        break
      case 'OFFLINE_ACTION_QUEUED':
        this.showNotification('Action queued for when you\'re back online.', 'info')
        break
      default:
        console.log('Service Worker message:', data)
    }
  }

  // Show update notification
  showUpdateNotification() {
    if (confirm('A new version of the app is available. Would you like to update?')) {
      this.updateApp()
    }
  }

  // Update app
  updateApp() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  // Show install prompt
  showInstallPrompt() {
    // You can customize this to show a custom install prompt
    console.log('PWA install prompt available')
  }

  // Install PWA
  async install() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt()
      const { outcome } = await this.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      this.deferredPrompt = null
    }
  }

  // Check if app is installed
  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true
  }

  // Check if app can be installed
  canInstall() {
    return !!this.deferredPrompt
  }

  // Show notification
  showNotification(message, type = 'info') {
    // You can integrate this with your notification system
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  // Track installation
  trackInstallation() {
    // Track PWA installation in analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        event_category: 'PWA',
        event_label: 'App Installation'
      })
    }
  }

  // Utility methods for data storage
  getStoredData(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get stored data:', error)
      return null
    }
  }

  setStoredData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to set stored data:', error)
    }
  }

  clearStoredData(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to clear stored data:', error)
    }
  }

  getAuthToken() {
    return localStorage.getItem('auth_token')
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Send notification
  sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options
      })
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging not supported')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VUE_APP_VAPID_PUBLIC_KEY
      })

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(subscription)
      })

      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
        
        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
    }
  }

  // Get app info
  getAppInfo() {
    return {
      isOnline: this.isOnline,
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      hasServiceWorker: !!this.registration,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    }
  }
}

// Create singleton instance
const pwaManager = new PWAManager()

export default pwaManager