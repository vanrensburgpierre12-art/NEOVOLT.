import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials)
        const { user, token } = response.data
        
        this.user = user
        this.token = token
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed' 
        }
      }
    },

    async register(userData) {
      try {
        const response = await axios.post('/api/auth/register', userData)
        const { user, token } = response.data
        
        this.user = user
        this.token = token
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Registration failed' 
        }
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },

    async checkAuth() {
      if (this.token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          const response = await axios.get('/api/auth/me')
          this.user = response.data
          this.isAuthenticated = true
        } catch (error) {
          this.logout()
        }
      }
    },

    async updateProfile(profileData) {
      try {
        const response = await axios.put('/api/users/profile', profileData)
        this.user = { ...this.user, ...response.data }
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Update failed' 
        }
      }
    },

    async changePassword(passwordData) {
      try {
        await axios.put('/api/users/change-password', passwordData)
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Password change failed' 
        }
      }
    }
  }
})