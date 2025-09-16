import { defineStore } from 'pinia'

export const useRecentlyViewedStore = defineStore('recentlyViewed', {
  state: () => ({
    items: [],
    maxItems: 10
  }),

  getters: {
    recentItems: (state) => state.items.slice(0, state.maxItems),
    hasItems: (state) => state.items.length > 0
  },

  actions: {
    addProduct(product) {
      // Remove if already exists
      this.items = this.items.filter(item => item.id !== product.id)
      
      // Add to beginning
      this.items.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category_name: product.category_name,
        viewed_at: new Date().toISOString()
      })
      
      // Keep only maxItems
      if (this.items.length > this.maxItems) {
        this.items = this.items.slice(0, this.maxItems)
      }
      
      this.saveToStorage()
    },

    removeProduct(productId) {
      this.items = this.items.filter(item => item.id !== productId)
      this.saveToStorage()
    },

    clearAll() {
      this.items = []
      this.saveToStorage()
    },

    loadFromStorage() {
      try {
        const stored = localStorage.getItem('recentlyViewed')
        if (stored) {
          this.items = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Failed to load recently viewed from storage:', error)
      }
    },

    saveToStorage() {
      try {
        localStorage.setItem('recentlyViewed', JSON.stringify(this.items))
      } catch (error) {
        console.error('Failed to save recently viewed to storage:', error)
      }
    }
  }
})