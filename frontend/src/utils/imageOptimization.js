// Image optimization utilities for frontend

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} baseUrl - Base image URL
 * @param {Object} options - Options for image generation
 * @returns {Object} Object with different image sizes
 */
export function generateResponsiveImages(baseUrl, options = {}) {
  const {
    widths = [150, 300, 600, 800, 1200],
    quality = 80,
    format = 'webp'
  } = options

  // If it's a placeholder or external URL, return as is
  if (baseUrl.includes('/api/placeholder/') || baseUrl.startsWith('http')) {
    return {
      original: baseUrl,
      webp: baseUrl,
      sizes: [baseUrl]
    }
  }

  // For optimized images, try to generate different sizes
  const baseName = baseUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
  const extension = baseUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || '.jpg'

  const images = {
    original: baseUrl,
    webp: baseName + '.webp',
    sizes: []
  }

  // Generate different sizes
  widths.forEach(width => {
    const sizeUrl = `${baseName}_${width}w.${format}`
    images.sizes.push({
      width,
      url: sizeUrl,
      webp: sizeUrl
    })
  })

  return images
}

/**
 * Get the best image size for a given container width
 * @param {Array} sizes - Array of available sizes
 * @param {number} containerWidth - Container width in pixels
 * @returns {string} Best image URL
 */
export function getBestImageSize(sizes, containerWidth) {
  if (!sizes || sizes.length === 0) return null

  // Find the smallest image that's larger than the container width
  const suitableSizes = sizes.filter(size => size.width >= containerWidth)
  
  if (suitableSizes.length > 0) {
    return suitableSizes[0].url
  }

  // If no suitable size found, return the largest available
  return sizes[sizes.length - 1].url
}

/**
 * Preload an image
 * @param {string} src - Image source URL
 * @returns {Promise} Promise that resolves when image is loaded
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Check if WebP is supported
 * @returns {Promise<boolean>} Promise that resolves to true if WebP is supported
 */
export function isWebPSupported() {
  return new Promise((resolve) => {
    const webp = new Image()
    webp.onload = webp.onerror = () => {
      resolve(webp.height === 2)
    }
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * Generate srcset string for responsive images
 * @param {Array} sizes - Array of image sizes
 * @param {string} format - Image format (webp, jpg, etc.)
 * @returns {string} Srcset string
 */
export function generateSrcSet(sizes, format = 'webp') {
  return sizes
    .map(size => `${size.url} ${size.width}w`)
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 * @param {Object} breakpoints - Breakpoints configuration
 * @returns {string} Sizes attribute string
 */
export function generateSizes(breakpoints = {}) {
  const defaultBreakpoints = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw'
  }

  const config = { ...defaultBreakpoints, ...breakpoints }
  
  return Object.entries(config)
    .map(([breakpoint, size]) => {
      const mediaQuery = breakpoint === 'mobile' ? '' : `(min-width: ${breakpoint === 'tablet' ? '768px' : '1200px'})`
      return mediaQuery ? `${mediaQuery} ${size}` : size
    })
    .join(', ')
}

/**
 * Optimize image loading with intersection observer
 * @param {HTMLElement} element - Element to observe
 * @param {Function} callback - Callback to execute when element is visible
 * @param {Object} options - Intersection observer options
 */
export function observeImageLoading(element, callback, options = {}) {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1
  }

  const config = { ...defaultOptions, ...options }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target)
          observer.unobserve(entry.target)
        }
      })
    }, config)

    observer.observe(element)
    return observer
  } else {
    // Fallback for older browsers
    callback(element)
    return null
  }
}

/**
 * Generate blur placeholder for images
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Base64 encoded blur placeholder
 */
export function generateBlurPlaceholder(width = 400, height = 300) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  // Create a simple gradient placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(1, '#16213e')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/jpeg', 0.1)
}