import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    itemCount: (state) => state.items.length,
    isEmpty: (state) => state.items.length === 0,
    isInWishlist: (state) => (productId) => {
      return state.items.some(item => item.id === productId)
    }
  },

  actions: {
    async fetchWishlist() {
      this.loading = true
      try {
        // For now, we'll use localStorage. In a real app, this would be an API call
        const stored = localStorage.getItem('wishlist')
        if (stored) {
          this.items = JSON.parse(stored)
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error)
      } finally {
        this.loading = false
      }
    },

    async addToWishlist(product) {
      try {
        if (!this.isInWishlist(product.id)) {
          this.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category_name: product.category_name,
            added_at: new Date().toISOString()
          })
          this.saveToStorage()
          return { success: true }
        }
        return { success: false, message: 'Product already in wishlist' }
      } catch (error) {
        return { success: false, message: 'Failed to add to wishlist' }
      }
    },

    async removeFromWishlist(productId) {
      try {
        this.items = this.items.filter(item => item.id !== productId)
        this.saveToStorage()
        return { success: true }
      } catch (error) {
        return { success: false, message: 'Failed to remove from wishlist' }
      }
    },

    async toggleWishlist(product) {
      if (this.isInWishlist(product.id)) {
        return await this.removeFromWishlist(product.id)
      } else {
        return await this.addToWishlist(product)
      }
    },

    async clearWishlist() {
      try {
        this.items = []
        this.saveToStorage()
        return { success: true }
      } catch (error) {
        return { success: false, message: 'Failed to clear wishlist' }
      }
    },

    saveToStorage() {
      try {
        localStorage.setItem('wishlist', JSON.stringify(this.items))
      } catch (error) {
        console.error('Failed to save wishlist to storage:', error)
      }
    }
  }
})