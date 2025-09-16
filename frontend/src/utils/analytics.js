// Google Analytics 4 and Search Console integration
class Analytics {
  constructor() {
    this.gaId = process.env.VUE_APP_GA_ID || 'G-XXXXXXXXXX'
    this.gtmId = process.env.VUE_APP_GTM_ID || 'GTM-XXXXXXX'
    this.isInitialized = false
  }

  // Initialize Google Analytics
  init() {
    if (this.isInitialized || typeof window === 'undefined') return

    // Load Google Analytics
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag() { dataLayer.push(arguments) }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', this.gaId, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        'custom_parameter_1': 'user_type',
        'custom_parameter_2': 'product_category'
      }
    })

    this.isInitialized = true
  }

  // Track page views
  trackPageView(pageName, pagePath) {
    if (!this.isInitialized) return

    window.gtag('config', this.gaId, {
      page_title: pageName,
      page_location: window.location.origin + pagePath,
      page_path: pagePath
    })
  }

  // Track e-commerce events
  trackPurchase(transactionId, value, currency, items) {
    if (!this.isInitialized) return

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    })
  }

  // Track product views
  trackProductView(productId, productName, category, price) {
    if (!this.isInitialized) return

    window.gtag('event', 'view_item', {
      currency: 'ZAR',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price
      }]
    })
  }

  // Track add to cart
  trackAddToCart(productId, productName, category, price, quantity = 1) {
    if (!this.isInitialized) return

    window.gtag('event', 'add_to_cart', {
      currency: 'ZAR',
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        quantity: quantity
      }]
    })
  }

  // Track search
  trackSearch(searchTerm, resultsCount) {
    if (!this.isInitialized) return

    window.gtag('event', 'search', {
      search_term: searchTerm,
      results_count: resultsCount
    })
  }

  // Track custom events
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) return

    window.gtag('event', eventName, parameters)
  }

  // Track user engagement
  trackEngagement(action, category, label, value) {
    if (!this.isInitialized) return

    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

// Create singleton instance
const analytics = new Analytics()

export default analytics

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  analytics.init()
}