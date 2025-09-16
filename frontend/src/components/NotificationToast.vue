<template>
  <transition name="toast">
    <div v-if="visible" class="toast" :class="toastClass">
      <div class="toast-icon">
        <span v-if="type === 'success'">✓</span>
        <span v-else-if="type === 'error'">✕</span>
        <span v-else-if="type === 'warning'">⚠</span>
        <span v-else>ℹ</span>
      </div>
      <div class="toast-content">
        <h4 class="toast-title">{{ title }}</h4>
        <p class="toast-message">{{ message }}</p>
      </div>
      <button @click="close" class="toast-close">×</button>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'NotificationToast',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const visible = ref(false)
    let timeoutId = null

    const toastClass = computed(() => `toast-${props.type}`)

    const close = () => {
      visible.value = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      setTimeout(() => {
        emit('close')
      }, 300)
    }

    onMounted(() => {
      visible.value = true
      if (props.autoClose) {
        timeoutId = setTimeout(close, props.duration)
      }
    })

    return {
      visible,
      toastClass,
      close
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 500px;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  animation: slideInRight 0.3s ease-out;
}

.toast-success {
  border-color: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.toast-error {
  border-color: #f44336;
  box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
}

.toast-warning {
  border-color: #ff9800;
  box-shadow: 0 0 20px rgba(255, 152, 0, 0.3);
}

.toast-info {
  border-color: #2196f3;
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
}

.toast-icon {
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-success .toast-icon {
  color: #4caf50;
}

.toast-error .toast-icon {
  color: #f44336;
}

.toast-warning .toast-icon {
  color: #ff9800;
}

.toast-info .toast-icon {
  color: #2196f3;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.toast-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.toast-close:hover {
  color: #ffffff;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .toast {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }
}
</style>