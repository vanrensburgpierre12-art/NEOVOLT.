<template>
  <div class="loading-container" :class="containerClass">
    <div class="loading-spinner" :class="spinnerClass">
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
      <div class="spinner-ring"></div>
    </div>
    <p v-if="message" class="loading-message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    containerClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    spinnerClass() {
      return `spinner-${this.size}`
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.loading-spinner {
  position: relative;
  display: inline-block;
}

.spinner-small {
  width: 30px;
  height: 30px;
}

.spinner-medium {
  width: 50px;
  height: 50px;
}

.spinner-large {
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.1s;
  border-top-color: rgba(0, 255, 255, 0.7);
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.2s;
  border-top-color: rgba(0, 255, 255, 0.4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-message {
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  text-align: center;
}

.spinner-small + .loading-message {
  font-size: 0.9rem;
  margin-top: 15px;
}

.spinner-large + .loading-message {
  font-size: 1.2rem;
  margin-top: 25px;
}
</style>