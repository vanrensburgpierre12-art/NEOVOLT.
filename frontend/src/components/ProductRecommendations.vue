<template>
  <div class="product-recommendations">
    <div class="recommendations-header">
      <h3>{{ title }}</h3>
      <div class="recommendation-tabs">
        <button 
          v-for="tab in recommendationTabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="['tab-button', { active: activeTab === tab.key }]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="recommendations-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Finding recommendations...</p>
      </div>

      <!-- Recommendations Grid -->
      <div v-else-if="recommendations.length > 0" class="recommendations-grid">
        <div 
          v-for="product in recommendations" 
          :key="product.id"
          class="recommendation-card"
          @click="goToProduct(product.id)"
        >
          <div class="product-image-container">
            <LazyImage 
              :src="product.image_url || '/api/placeholder/300/200'"
              :alt="product.name"
              class="product-image"
            />
            <div class="recommendation-badge">
              {{ getRecommendationReason(product) }}
            </div>
          </div>

          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-category">{{ product.category_name }}</p>
            <p class="product-description">{{ truncateText(product.description, 80) }}</p>
            
            <div class="product-rating" v-if="product.average_rating">
              <div class="stars">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  :class="['star', { filled: star <= Math.round(product.average_rating) }]"
                >
                  ⭐
                </span>
              </div>
              <span class="rating-text">({{ product.review_count || 0 }})</span>
            </div>

            <div class="product-price">{{ formatCurrency(product.price) }}</div>
            
            <div class="product-actions">
              <button 
                @click.stop="addToCart(product.id)"
                :disabled="addingToCart === product.id"
                class="btn btn-primary btn-sm"
              >
                {{ addingToCart === product.id ? 'Adding...' : 'Add to Cart' }}
              </button>
              <WishlistButton 
                :product-id="product.id"
                @click.stop
                class="wishlist-btn"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h4>No Recommendations Found</h4>
        <p>We couldn't find any recommendations at the moment. Try browsing our products instead.</p>
        <router-link to="/products" class="btn btn-primary">
          Browse Products
        </router-link>
      </div>
    </div>

    <!-- View All Button -->
    <div v-if="recommendations.length > 0" class="view-all-section">
      <button @click="viewAllRecommendations" class="btn btn-outline">
        View All {{ title }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useWishlistStore } from '../stores/wishlist'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import LazyImage from './LazyImage.vue'
import WishlistButton from './WishlistButton.vue'
import axios from 'axios'

export default {
  name: 'ProductRecommendations',
  components: {
    LazyImage,
    WishlistButton
  },
  props: {
    type: {
      type: String,
      default: 'similar', // similar, popular, recently_viewed, frequently_bought
      validator: (value) => ['similar', 'popular', 'recently_viewed', 'frequently_bought', 'trending'].includes(value)
    },
    productId: {
      type: [String, Number],
      default: null
    },
    categoryId: {
      type: [String, Number],
      default: null
    },
    limit: {
      type: Number,
      default: 6
    },
    title: {
      type: String,
      default: 'Recommended for You'
    }
  },
  setup(props) {
    const router = useRouter()
    const cartStore = useCartStore()
    const wishlistStore = useWishlistStore()
    const notificationsStore = useNotificationsStore()

    const recommendations = ref([])
    const loading = ref(false)
    const addingToCart = ref(null)
    const activeTab = ref('similar')

    const recommendationTabs = [
      { key: 'similar', label: 'Similar Products' },
      { key: 'popular', label: 'Popular' },
      { key: 'trending', label: 'Trending' },
      { key: 'frequently_bought', label: 'Frequently Bought' }
    ]

    // Computed properties
    const currentType = computed(() => activeTab.value)

    // Methods
    const fetchRecommendations = async () => {
      loading.value = true
      try {
        const params = {
          type: currentType.value,
          limit: props.limit
        }

        if (props.productId) {
          params.product_id = props.productId
        }

        if (props.categoryId) {
          params.category_id = props.categoryId
        }

        const response = await axios.get('/api/products/recommendations', { params })
        recommendations.value = response.data.recommendations || []
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
        recommendations.value = []
      } finally {
        loading.value = false
      }
    }

    const getRecommendationReason = (product) => {
      const reasons = {
        similar: 'Similar',
        popular: 'Popular',
        trending: 'Trending',
        frequently_bought: 'Frequently Bought',
        recently_viewed: 'Recently Viewed'
      }
      return reasons[product.recommendation_type] || 'Recommended'
    }

    const truncateText = (text, maxLength) => {
      if (!text) return ''
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const goToProduct = (productId) => {
      router.push(`/product/${productId}`)
    }

    const addToCart = async (productId) => {
      addingToCart.value = productId
      try {
        const result = await cartStore.addToCart(productId)
        if (result.success) {
          notificationsStore.success('Added to Cart', 'Product has been added to your cart!')
        } else {
          notificationsStore.error('Add to Cart Failed', result.message)
        }
      } catch (error) {
        notificationsStore.error('Error', 'Failed to add product to cart')
      } finally {
        addingToCart.value = null
      }
    }

    const viewAllRecommendations = () => {
      const query = { recommendation_type: currentType.value }
      if (props.productId) query.product_id = props.productId
      if (props.categoryId) query.category_id = props.categoryId
      
      router.push({
        path: '/products',
        query
      })
    }

    // Watch for tab changes
    watch(activeTab, () => {
      fetchRecommendations()
    })

    // Watch for prop changes
    watch(() => [props.type, props.productId, props.categoryId], () => {
      activeTab.value = props.type
      fetchRecommendations()
    }, { immediate: true })

    onMounted(() => {
      fetchRecommendations()
    })

    return {
      recommendations,
      loading,
      addingToCart,
      activeTab,
      recommendationTabs,
      currentType,
      fetchRecommendations,
      getRecommendationReason,
      truncateText,
      goToProduct,
      addToCart,
      viewAllRecommendations,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.product-recommendations {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.recommendations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.recommendations-header h3 {
  color: #00ffff;
  margin: 0;
  font-size: 1.3rem;
}

.recommendation-tabs {
  display: flex;
  gap: 5px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 4px;
}

.tab-button {
  padding: 8px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  white-space: nowrap;
}

.tab-button:hover {
  color: #ffffff;
  background: rgba(0, 255, 255, 0.1);
}

.tab-button.active {
  background: #00ffff;
  color: #0a0a0a;
  font-weight: 600;
}

.recommendations-content {
  min-height: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-top: 3px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.recommendation-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.recommendation-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  transform: translateY(-5px);
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recommendation-card:hover .product-image {
  transform: scale(1.05);
}

.recommendation-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 255, 255, 0.9);
  color: #0a0a0a;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.product-info {
  padding: 15px;
}

.product-name {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.product-category {
  color: #00ffff;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
}

.star.filled {
  color: #ffc107;
}

.rating-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.product-price {
  color: #00ffff;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.product-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
  flex: 1;
}

.wishlist-btn {
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.empty-state h4 {
  color: #00ffff;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.view-all-section {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.btn-outline {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-outline:hover {
  background: #00ffff;
  color: #0a0a0a;
}

@media (max-width: 768px) {
  .recommendations-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recommendation-tabs {
    width: 100%;
    overflow-x: auto;
    padding: 4px 0;
  }
  
  .tab-button {
    flex-shrink: 0;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .btn-sm {
    width: 100%;
  }
}
</style>