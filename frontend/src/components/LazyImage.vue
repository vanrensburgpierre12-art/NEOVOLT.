<template>
  <div class="lazy-image-container" :style="{ width: width, height: height }">
    <ResponsiveImage
      v-if="loaded"
      :src="src"
      :alt="alt"
      :image-class="['lazy-image', imageClass]"
      :loading="loading"
      @load="onLoad"
      @error="onError"
    />
    <div v-else class="lazy-image-placeholder" :class="placeholderClass">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import ResponsiveImage from './ResponsiveImage.vue'

export default {
  name: 'LazyImage',
  components: {
    ResponsiveImage
  },
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '200px'
    },
    imageClass: {
      type: String,
      default: ''
    },
    placeholderClass: {
      type: String,
      default: ''
    },
    rootMargin: {
      type: String,
      default: '50px'
    },
    loading: {
      type: String,
      default: 'lazy'
    }
  },
  setup(props) {
    const loaded = ref(false)
    const error = ref(false)
    const observer = ref(null)

    const onLoad = () => {
      loaded.value = true
    }

    const onError = () => {
      error.value = true
      loaded.value = true
    }

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loaded.value = true
          if (observer.value) {
            observer.value.disconnect()
          }
        }
      })
    }

    onMounted(() => {
      if ('IntersectionObserver' in window) {
        observer.value = new IntersectionObserver(handleIntersection, {
          rootMargin: props.rootMargin
        })
        observer.value.observe(document.querySelector('.lazy-image-container'))
      } else {
        // Fallback for older browsers
        loaded.value = true
      }
    })

    onUnmounted(() => {
      if (observer.value) {
        observer.value.disconnect()
      }
    })

    return {
      loaded,
      error,
      onLoad,
      onError
    }
  }
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.lazy-image-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00ffff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>