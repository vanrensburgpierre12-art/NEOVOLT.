import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    toasts: []
  }),

  actions: {
    addToast(toast) {
      const id = Date.now() + Math.random()
      const newToast = {
        id,
        type: toast.type || 'info',
        title: toast.title,
        message: toast.message,
        duration: toast.duration || 5000,
        autoClose: toast.autoClose !== false
      }
      
      this.toasts.push(newToast)
      
      // Auto remove after duration
      if (newToast.autoClose) {
        setTimeout(() => {
          this.removeToast(id)
        }, newToast.duration)
      }
      
      return id
    },

    removeToast(id) {
      this.toasts = this.toasts.filter(toast => toast.id !== id)
    },

    success(title, message, options = {}) {
      return this.addToast({
        type: 'success',
        title,
        message,
        ...options
      })
    },

    error(title, message, options = {}) {
      return this.addToast({
        type: 'error',
        title,
        message,
        duration: 7000, // Longer duration for errors
        ...options
      })
    },

    warning(title, message, options = {}) {
      return this.addToast({
        type: 'warning',
        title,
        message,
        ...options
      })
    },

    info(title, message, options = {}) {
      return this.addToast({
        type: 'info',
        title,
        message,
        ...options
      })
    },

    clearAll() {
      this.toasts = []
    }
  }
})