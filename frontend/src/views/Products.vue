<template>
  <div class="products">
    <div class="container">
      <div class="products-header">
        <h1 class="page-title">Products</h1>
        
        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              placeholder="Search products..."
              class="form-input"
            />
          </div>
          <div class="filter-group">
            <select v-model="selectedCategory" @change="handleCategoryChange" class="form-input">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading"></div>
        <p>Loading products...</p>
      </div>

      <!-- Products Grid -->
      <div v-else class="product-grid">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="product-card"
          @click="goToProduct(product.id)"
        >
          <img 
            :src="product.image_url || '/api/placeholder/300/200'" 
            :alt="product.name"
            class="product-image"
          />
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-category">{{ product.category_name }}</p>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-footer">
              <span class="product-price">${{ product.price }}</span>
              <span class="product-stock" :class="{ 'low-stock': product.stock_quantity < 10 }">
                {{ product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock' }}
              </span>
            </div>
            <button 
              class="btn btn-primary w-100"
              :disabled="product.stock_quantity === 0"
              @click.stop="addToCart(product.id)"
            >
              {{ product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock' }}
            </button>
          </div>
        </div>
      </div>

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

export default {
  name: 'Products',
  setup() {
    const router = useRouter()
    const productsStore = useProductsStore()
    const cartStore = useCartStore()
    
    const searchQuery = ref('')
    const selectedCategory = ref('')

    const products = computed(() => productsStore.products)
    const categories = computed(() => productsStore.categories)
    const loading = computed(() => productsStore.loading)
    const pagination = computed(() => productsStore.pagination)

    const handleSearch = () => {
      productsStore.setSearch(searchQuery.value)
      productsStore.fetchProducts()
    }

    const handleCategoryChange = () => {
      productsStore.setCategory(selectedCategory.value)
      productsStore.fetchProducts()
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
        // Show success message
        console.log('Added to cart')
      } else {
        // Show error message
        console.error(result.message)
      }
    }

    onMounted(async () => {
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
      handleSearch,
      handleCategoryChange,
      clearFilters,
      goToPage,
      goToProduct,
      addToCart
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

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
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

.product-image {
  width: 100%;
  height: 200px;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    min-width: 100%;
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