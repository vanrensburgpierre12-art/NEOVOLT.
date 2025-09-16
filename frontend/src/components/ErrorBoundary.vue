<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="retry" class="btn btn-primary">Try Again</button>
        <button @click="goHome" class="btn btn-secondary">Go Home</button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ErrorBoundary',
  setup() {
    const hasError = ref(false)
    const errorMessage = ref('')
    const router = useRouter()

    onErrorCaptured((error, instance, info) => {
      console.error('Error caught by boundary:', error, info)
      hasError.value = true
      errorMessage.value = error.message || 'An unexpected error occurred'
      return false
    })

    const retry = () => {
      hasError.value = false
      errorMessage.value = ''
      // Force re-render of child components
      window.location.reload()
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      hasError,
      errorMessage,
      retry,
      goHome
    }
  }
}
</script>

<style scoped>
.error-boundary {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.2);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-title {
  color: #f44336;
  font-size: 2rem;
  margin-bottom: 15px;
  text-shadow: 0 0 10px #f44336;
}

.error-message {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 30px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .error-content {
    padding: 30px 20px;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .btn {
    width: 200px;
  }
}
</style>