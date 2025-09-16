<template>
  <div class="products">
    <div class="container">
      <div class="products-header">
        <h1 class="page-title">Products</h1>
        
        <!-- Advanced Search -->
        <AdvancedSearch
          :categories="categories"
          :price-bounds="priceBounds"
          @search="handleAdvancedSearch"
        />

        <!-- Basic Filters (Fallback) -->
        <ProductFilters
          v-if="showFilters"
          :categories="categories"
          :sort-by="productsStore.filters.sortBy"
          :sort-order="productsStore.filters.sortOrder"
          :price-min="productsStore.filters.priceMin"
          :price-max="productsStore.filters.priceMax"
          :in-stock="productsStore.filters.inStock"
          :category="productsStore.filters.category"
          @update:sortBy="productsStore.setSortBy"
          @update:sortOrder="productsStore.setSortOrder"
          @update:priceMin="(value) => productsStore.setPriceRange(value, productsStore.filters.priceMax)"
          @update:priceMax="(value) => productsStore.setPriceRange(productsStore.filters.priceMin, value)"
          @update:inStock="productsStore.setInStock"
          @update:category="productsStore.setCategory"
          @clear-filters="clearFilters"
        />
      </div>

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" message="Loading products..." />

      <!-- Products Grid -->
      <MobileProductGrid v-else :products="products" />

      <!-- Empty State -->
      <div v-if="!loading && products.length === 0" class="empty-state">
        <h3>No products found</h3>
        <p>Try adjusting your search or filter criteria</p>
        <button @click="clearFilters" class="btn btn-primary">Clear Filters</button>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button 
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page }} of {{ pagination.pages }}
        </span>
        <button 
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import LazyImage from '../components/LazyImage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ProductFilters from '../components/ProductFilters.vue'
import AdvancedSearch from '../components/AdvancedSearch.vue'
import WishlistButton from '../components/WishlistButton.vue'
import MobileProductGrid from '../components/MobileProductGrid.vue'
import { useMeta } from '../composables/useMeta'

export default {
  name: 'Products',
  components: {
    LazyImage,
    LoadingSpinner,
    ProductFilters,
    AdvancedSearch,
    WishlistButton,
    MobileProductGrid
  },
  setup() {
    const router = useRouter()
    const productsStore = useProductsStore()
    const cartStore = useCartStore()
    const notificationsStore = useNotificationsStore()
    const { setMeta } = useMeta()
    
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const showFilters = ref(false)
    const priceBounds = ref({ min: 0, max: 1000 })

    const products = computed(() => productsStore.products)
    const categories = computed(() => productsStore.categories)
    const loading = computed(() => productsStore.loading)
    const pagination = computed(() => productsStore.pagination)

    const handleSearch = () => {
      productsStore.setSearch(searchQuery.value)
      productsStore.fetchProducts()
    }

    const handleAdvancedSearch = (searchData) => {
      // Update store with advanced search data
      productsStore.setSearch(searchData.query)
      productsStore.setCategory(searchData.categories?.[0] || '')
      productsStore.setPriceRange(searchData.priceRange?.min || '', searchData.priceRange?.max || '')
      productsStore.setInStock(searchData.stockFilter === 'in-stock')
      productsStore.setSortBy(searchData.sortBy)
      productsStore.fetchProducts()
    }

    const handleCategoryChange = () => {
      productsStore.setCategory(selectedCategory.value)
      productsStore.fetchProducts()
    }

    const toggleFilters = () => {
      showFilters.value = !showFilters.value
    }

    const clearFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = ''
      productsStore.clearFilters()
      productsStore.fetchProducts()
    }

    const goToPage = (page) => {
      productsStore.setPage(page)
      productsStore.fetchProducts()
    }

    const goToProduct = (productId) => {
      router.push(`/product/${productId}`)
    }

    const addToCart = async (productId) => {
      const result = await cartStore.addToCart(productId)
      if (result.success) {
        notificationsStore.success('Added to Cart', 'Product has been added to your cart successfully!')
      } else {
        notificationsStore.error('Add to Cart Failed', result.message)
      }
    }

    onMounted(async () => {
      // Set SEO meta tags for products page
      setMeta({
        title: 'Products - Neovolt | Deutsche Connectors & Electrical Hardware',
        description: 'Browse our complete collection of high-quality German electrical connectors and hardware. Find the perfect Deutsche connectors for your electrical projects.',
        keywords: 'deutsche connectors, german electrical, electrical hardware, power connectors, electrical supplies, industrial connectors, electrical products',
        image: '/api/placeholder/1200/630'
      })
      
      await productsStore.fetchCategories()
      await productsStore.fetchProducts()
    })

    return {
      products,
      categories,
      loading,
      pagination,
      searchQuery,
      selectedCategory,
      showFilters,
      priceBounds,
      handleSearch,
      handleAdvancedSearch,
      handleCategoryChange,
      toggleFilters,
      clearFilters,
      goToPage,
      goToProduct,
      addToCart,
      formatCurrency,
      productsStore
    }
  }
}
</script>

<style scoped>
.products {
  padding: 40px 0;
  min-height: 80vh;
}

.products-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 3rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin-bottom: 30px;
  text-align: center;
}

.search-section {
  margin-bottom: 30px;
}

.search-input-container {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.loading-container p {
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.product-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
  z-index: 1;
}

.product-card:hover::before {
  left: 100%;
}

.product-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  transform: translateY(-10px);
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 20px;
  position: relative;
  z-index: 2;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}

.product-category {
  color: #00ffff;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.product-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 15px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.product-price-rating {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.star.filled {
  color: #ffc107;
  text-shadow: 0 0 5px #ffc107;
}

.rating-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 900;
  color: #00ffff;
}

.product-stock {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.low-stock {
  color: #ff6b6b;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-state h3 {
  color: #00ffff;
  margin-bottom: 15px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

@media (max-width: 768px) {
  .search-input-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>