<template>
  <div class="product-detail" v-if="product">
    <div class="container">
      <div class="product-content">
        <!-- Product Image -->
        <div class="product-image-section">
          <img 
            :src="product.image_url || '/api/placeholder/500/400'" 
            :alt="product.name"
            class="product-image"
          />
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-category">{{ product.category_name }}</p>
          <p class="product-description">{{ product.description }}</p>
          
          <!-- Specifications -->
          <div v-if="product.specifications" class="specifications">
            <h3>Specifications</h3>
            <div class="spec-grid">
              <div 
                v-for="(value, key) in product.specifications" 
                :key="key"
                class="spec-item"
              >
                <span class="spec-key">{{ formatSpecKey(key) }}:</span>
                <span class="spec-value">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- Price and Stock -->
          <div class="price-stock">
            <div class="price">{{ formatCurrency(product.price) }}</div>
            <div class="stock" :class="{ 'low-stock': product.stock_quantity < 10, 'out-of-stock': product.stock_quantity === 0 }">
              {{ product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock' }}
            </div>
          </div>

          <!-- Add to Cart -->
          <div class="add-to-cart">
            <div class="quantity-selector">
              <label>Quantity:</label>
              <div class="quantity-controls">
                <button @click="decreaseQuantity" :disabled="quantity <= 1" class="btn btn-secondary">-</button>
                <input v-model.number="quantity" type="number" min="1" :max="product.stock_quantity" class="quantity-input">
                <button @click="increaseQuantity" :disabled="quantity >= product.stock_quantity" class="btn btn-secondary">+</button>
              </div>
            </div>
            <button 
              @click="addToCart"
              :disabled="product.stock_quantity === 0 || addingToCart"
              class="btn btn-primary btn-lg w-100"
            >
              {{ addingToCart ? 'Adding...' : (product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Product Reviews -->
      <ProductReviews 
        v-if="product" 
        :product-id="product.id" 
        @review-submitted="handleReviewSubmitted"
      />

      <!-- Review Form -->
      <ReviewForm 
        v-if="product && showReviewForm" 
        :product-id="product.id"
        @review-submitted="handleReviewSubmitted"
        @cancel="showReviewForm = false"
      />

      <!-- Add Review Button -->
      <div v-if="product && !showReviewForm" class="add-review-section">
        <button @click="showReviewForm = true" class="btn btn-primary">
          Write a Review
        </button>
      </div>

      <!-- Recently Viewed -->
      <RecentlyViewed />

      <!-- Related Products -->
      <div class="related-products">
        <h2>Related Products</h2>
        <div class="product-grid">
          <div 
            v-for="relatedProduct in relatedProducts" 
            :key="relatedProduct.id" 
            class="product-card"
            @click="goToProduct(relatedProduct.id)"
          >
            <img 
              :src="relatedProduct.image_url || '/api/placeholder/300/200'" 
              :alt="relatedProduct.name"
              class="product-image"
            />
            <h3 class="product-name">{{ relatedProduct.name }}</h3>
            <p class="product-price">{{ formatCurrency(relatedProduct.price) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="loading-container">
    <div class="loading"></div>
    <p>Loading product...</p>
  </div>

  <!-- Error State -->
  <div v-else class="error-container">
    <h2>Product not found</h2>
    <p>The product you're looking for doesn't exist or has been removed.</p>
    <router-link to="/products" class="btn btn-primary">Back to Products</router-link>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { useRecentlyViewedStore } from '../stores/recentlyViewed'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import ProductReviews from '../components/ProductReviews.vue'
import ReviewForm from '../components/ReviewForm.vue'
import RecentlyViewed from '../components/RecentlyViewed.vue'
import { useMeta } from '../composables/useMeta'

export default {
  name: 'ProductDetail',
  components: {
    ProductReviews,
    ReviewForm,
    RecentlyViewed
  },
  props: {
    id: String
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const productsStore = useProductsStore()
    const cartStore = useCartStore()
    const recentlyViewedStore = useRecentlyViewedStore()
    const notificationsStore = useNotificationsStore()
    const { setMeta } = useMeta()
    
    const product = ref(null)
    const loading = ref(true)
    const quantity = ref(1)
    const addingToCart = ref(false)
    const relatedProducts = ref([])
    const showReviewForm = ref(false)

    const productId = props.id || route.params.id

    const formatSpecKey = (key) => {
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const increaseQuantity = () => {
      if (quantity.value < product.value.stock_quantity) {
        quantity.value++
      }
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const addToCart = async () => {
      if (product.value.stock_quantity === 0) return
      
      addingToCart.value = true
      const result = await cartStore.addToCart(product.value.id, quantity.value)
      addingToCart.value = false
      
      if (result.success) {
        notificationsStore.success('Added to Cart', 'Product has been added to your cart!')
      } else {
        notificationsStore.error('Add to Cart Failed', result.message)
      }
    }

    const goToProduct = (productId) => {
      router.push(`/product/${productId}`)
    }

    const handleReviewSubmitted = () => {
      showReviewForm.value = false
      // The ProductReviews component will automatically refresh
    }

    const loadProduct = async () => {
      try {
        loading.value = true
        product.value = await productsStore.fetchProduct(productId)
        
        // Set SEO meta tags for product page
        if (product.value) {
          setMeta({
            title: `${product.value.name} - Neovolt | Deutsche Connectors`,
            description: `${product.value.description} | High-quality German electrical connector. Price: ${formatCurrency(product.value.price)}. In stock: ${product.value.stock_quantity} units.`,
            keywords: `${product.value.name}, deutsche connectors, german electrical, ${product.value.category_name}, electrical hardware, power connectors`,
            image: product.value.image_url || '/api/placeholder/1200/630'
          })
          
          // Add to recently viewed
          recentlyViewedStore.addProduct(product.value)
        }
        
        // Load related products from the same category
        if (product.value.category_id) {
          await productsStore.fetchProducts()
          relatedProducts.value = productsStore.products
            .filter(p => p.category_id === product.value.category_id && p.id !== product.value.id)
            .slice(0, 4)
        }
      } catch (error) {
        console.error('Failed to load product:', error)
        product.value = null
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadProduct()
    })

    return {
      product,
      loading,
      quantity,
      addingToCart,
      relatedProducts,
      showReviewForm,
      formatSpecKey,
      increaseQuantity,
      decreaseQuantity,
      addToCart,
      goToProduct,
      handleReviewSubmitted,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.product-detail {
  padding: 40px 0;
  min-height: 80vh;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-bottom: 80px;
}

.product-image-section {
  position: relative;
}

.product-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.product-info {
  padding: 20px 0;
}

.product-name {
  font-size: 2.5rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin-bottom: 15px;
}

.product-category {
  color: #00ffff;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.product-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
}

.specifications {
  margin-bottom: 30px;
}

.specifications h3 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.spec-key {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.spec-value {
  color: #00ffff;
  font-weight: 700;
}

.price-stock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
}

.price {
  font-size: 2.5rem;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.stock {
  font-size: 1.1rem;
  font-weight: 500;
  color: #4ade80;
}

.low-stock {
  color: #fbbf24;
}

.out-of-stock {
  color: #ef4444;
}

.add-to-cart {
  background: rgba(26, 26, 46, 0.8);
  padding: 30px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
}

.quantity-selector {
  margin-bottom: 20px;
}

.quantity-selector label {
  display: block;
  margin-bottom: 10px;
  color: #00ffff;
  font-weight: 500;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-input {
  width: 80px;
  padding: 8px;
  text-align: center;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.add-review-section {
  margin: 40px 0;
  text-align: center;
}

.related-products {
  margin-top: 60px;
}

.related-products h2 {
  color: #00ffff;
  text-align: center;
  margin-bottom: 40px;
  font-size: 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.product-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  transform: translateY(-5px);
}

.product-card .product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-card .product-name {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #ffffff;
}

.product-card .product-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00ffff;
}

.loading-container, .error-container {
  text-align: center;
  padding: 60px 0;
}

.loading-container p, .error-container p {
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.error-container h2 {
  color: #ef4444;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .product-name {
    font-size: 2rem;
  }
  
  .price-stock {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .spec-grid {
    grid-template-columns: 1fr;
  }
}
</style>