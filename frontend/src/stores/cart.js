import { defineStore } from 'pinia'
import axios from 'axios'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    total: 0,
    loading: false
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    async fetchCart() {
      this.loading = true
      try {
        const response = await axios.get('/api/cart')
        this.items = response.data.items
        this.total = response.data.total
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        this.loading = false
      }
    },

    async addToCart(productId, quantity = 1) {
      try {
        await axios.post('/api/cart/add', { productId, quantity })
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to add to cart' 
        }
      }
    },

    async updateQuantity(itemId, quantity) {
      try {
        await axios.put(`/api/cart/update/${itemId}`, { quantity })
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to update quantity' 
        }
      }
    },

    async removeItem(itemId) {
      try {
        await axios.delete(`/api/cart/remove/${itemId}`)
        await this.fetchCart()
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to remove item' 
        }
      }
    },

    async clearCart() {
      try {
        await axios.delete('/api/cart/clear')
        this.items = []
        this.total = 0
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to clear cart' 
        }
      }
    }
  }
})