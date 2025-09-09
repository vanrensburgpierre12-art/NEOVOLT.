import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    filters: {
      search: '',
      category: '',
      page: 1
    }
  }),

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.filters.search) params.append('search', this.filters.search)
        if (this.filters.category) params.append('category', this.filters.category)
        params.append('page', this.filters.page)
        params.append('limit', this.pagination.limit)

        const response = await axios.get(`/api/products?${params}`)
        this.products = response.data.products
        this.pagination = response.data.pagination
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const response = await axios.get('/api/products/categories/all')
        this.categories = response.data
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    },

    async fetchProduct(id) {
      try {
        const response = await axios.get(`/api/products/${id}`)
        return response.data
      } catch (error) {
        console.error('Failed to fetch product:', error)
        throw error
      }
    },

    setSearch(search) {
      this.filters.search = search
      this.filters.page = 1
    },

    setCategory(category) {
      this.filters.category = category
      this.filters.page = 1
    },

    setPage(page) {
      this.filters.page = page
    },

    clearFilters() {
      this.filters = {
        search: '',
        category: '',
        page: 1
      }
    }
  }
})