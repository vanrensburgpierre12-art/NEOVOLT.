import { defineStore } from 'pinia'
import axios from 'axios'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [],
    ratingDistribution: {},
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    loading: false
  }),

  actions: {
    async fetchProductReviews(productId, page = 1, rating = null) {
      this.loading = true
      try {
        const params = { page, limit: this.pagination.limit }
        if (rating) params.rating = rating

        const response = await axios.get(`/api/reviews/product/${productId}`, { params })
        this.reviews = response.data.reviews
        this.ratingDistribution = response.data.ratingDistribution
        this.pagination = response.data.pagination
      } catch (error) {
        console.error('Failed to fetch product reviews:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserReviews(page = 1) {
      this.loading = true
      try {
        const response = await axios.get('/api/reviews/user', {
          params: { page, limit: this.pagination.limit }
        })
        this.reviews = response.data.reviews
        this.pagination = response.data.pagination
      } catch (error) {
        console.error('Failed to fetch user reviews:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createReview(reviewData) {
      try {
        const response = await axios.post('/api/reviews', reviewData)
        return response.data
      } catch (error) {
        console.error('Failed to create review:', error)
        throw error
      }
    },

    async updateReview(reviewId, reviewData) {
      try {
        const response = await axios.put(`/api/reviews/${reviewId}`, reviewData)
        return response.data
      } catch (error) {
        console.error('Failed to update review:', error)
        throw error
      }
    },

    async deleteReview(reviewId) {
      try {
        await axios.delete(`/api/reviews/${reviewId}`)
      } catch (error) {
        console.error('Failed to delete review:', error)
        throw error
      }
    },

    clearReviews() {
      this.reviews = []
      this.ratingDistribution = {}
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    }
  },

  getters: {
    averageRating: (state) => {
      if (state.reviews.length === 0) return 0
      const sum = state.reviews.reduce((acc, review) => acc + review.rating, 0)
      return (sum / state.reviews.length).toFixed(1)
    },

    totalReviews: (state) => state.reviews.length,

    ratingCounts: (state) => {
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      state.reviews.forEach(review => {
        counts[review.rating]++
      })
      return counts
    },

    verifiedReviews: (state) => state.reviews.filter(review => review.is_verified)
  }
})