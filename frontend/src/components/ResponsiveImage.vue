<template>
  <picture class="responsive-image">
    <!-- WebP images for modern browsers -->
    <source 
      v-if="webpSrc" 
      :srcset="webpSrc" 
      type="image/webp"
    />
    
    <!-- Fallback for older browsers -->
    <img 
      :src="fallbackSrc" 
      :alt="alt"
      :class="imageClass"
      :style="imageStyle"
      :loading="loading"
      @load="onLoad"
      @error="onError"
    />
  </picture>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'ResponsiveImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: ''
    },
    imageStyle: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: String,
      default: 'lazy'
    },
    sizes: {
      type: String,
      default: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    },
    quality: {
      type: String,
      default: '80'
    }
  },
  setup(props, { emit }) {
    const isLoaded = ref(false)
    const hasError = ref(false)

    // Generate responsive image URLs
    const generateImageUrls = (baseSrc) => {
      if (!baseSrc || baseSrc.startsWith('http') || baseSrc.startsWith('data:')) {
        return {
          webp: baseSrc,
          fallback: baseSrc
        }
      }

      // For placeholder images, return as is
      if (baseSrc.includes('/api/placeholder/')) {
        return {
          webp: baseSrc,
          fallback: baseSrc
        }
      }

      // For optimized images, try to get different sizes
      const baseUrl = baseSrc.replace(/\.(jpg|jpeg|png|gif)$/i, '')
      const extension = baseSrc.match(/\.(jpg|jpeg|png|gif)$/i)?.[0] || '.jpg'

      return {
        webp: baseUrl + '.webp',
        fallback: baseSrc
      }
    }

    const imageUrls = computed(() => generateImageUrls(props.src))

    const webpSrc = computed(() => {
      if (hasError.value) return null
      return imageUrls.value.webp
    })

    const fallbackSrc = computed(() => {
      if (hasError.value) {
        // Return placeholder on error
        return '/api/placeholder/400/300'
      }
      return imageUrls.value.fallback
    })

    const onLoad = () => {
      isLoaded.value = true
      emit('load')
    }

    const onError = () => {
      hasError.value = true
      emit('error')
    }

    onMounted(() => {
      // Preload the image
      if (props.src) {
        const img = new Image()
        img.onload = onLoad
        img.onerror = onError
        img.src = props.src
      }
    })

    return {
      isLoaded,
      hasError,
      webpSrc,
      fallbackSrc,
      onLoad,
      onError
    }
  }
}
</script>

<style scoped>
.responsive-image {
  display: block;
  width: 100%;
  height: 100%;
}

.responsive-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.responsive-image img[loading="lazy"] {
  opacity: 0;
}

.responsive-image img[loading="lazy"].loaded {
  opacity: 1;
}
</style>