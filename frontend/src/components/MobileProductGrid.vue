<template>
  <div class="mobile-product-grid">
    <!-- Mobile View -->
    <div v-if="isMobile" class="mobile-grid">
      <MobileProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Desktop View -->
    <div v-else class="desktop-grid">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
        @click="goToProduct(product.id)"
      >
        <div class="product-image-container">
          <LazyImage 
            :src="product.image_url || '/api/placeholder/300/200'" 
            :alt="product.name"
            height="200px"
            image-class="product-image"
          />
          <WishlistButton :product="product" />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-category">{{ product.category_name }}</p>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-footer">
            <div class="product-price-rating">
              <span class="product-price">{{ formatCurrency(product.price) }}</span>
              <div v-if="product.average_rating > 0" class="product-rating">
                <div class="stars">
                  <span 
                    v-for="star in 5" 
                    :key="star" 
                    class="star"
                    :class="{ 'filled': star <= Math.round(product.average_rating) }"
                  >
                    ★
                  </span>
                </div>
                <span class="rating-text">({{ product.review_count }})</span>
              </div>
            </div>
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
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import LazyImage from './LazyImage.vue'
import WishlistButton from './WishlistButton.vue'
import MobileProductCard from './MobileProductCard.vue'

export default {
  name: 'MobileProductGrid',
  components: {
    LazyImage,
    WishlistButton,
    MobileProductCard
  },
  props: {
    products: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const cartStore = useCartStore()
    const notificationsStore = useNotificationsStore()
    const isMobile = ref(false)

    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }

    const goToProduct = (productId) => {
      router.push(`/product/${productId}`)
    }

    const addToCart = async (productId) => {
      const result = await cartStore.addToCart(productId)
      if (result.success) {
        notificationsStore.success('Added to Cart', 'Product has been added to your cart!')
      } else {
        notificationsStore.error('Add to Cart Failed', result.message)
      }
    }

    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    return {
      isMobile,
      goToProduct,
      addToCart,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.mobile-product-grid {
  width: 100%;
}

.mobile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.desktop-grid {
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

/* Mobile-specific optimizations */
@media (max-width: 768px) {
  .mobile-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    padding: 15px 0;
  }
  
  .desktop-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .mobile-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 10px 0;
  }
}

/* Touch-friendly interactions */
@media (hover: none) and (pointer: coarse) {
  .product-card:hover {
    transform: none;
    box-shadow: none;
  }
  
  .product-card:active {
    transform: scale(0.98);
  }
}
</style>