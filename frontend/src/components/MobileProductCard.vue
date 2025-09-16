<template>
  <div class="mobile-product-card" @click="goToProduct">
    <div class="product-image-container">
      <LazyImage 
        :src="product.image_url || '/api/placeholder/300/200'" 
        :alt="product.name"
        height="150px"
        image-class="product-image"
      />
      <WishlistButton :product="product" />
      <div v-if="product.stock_quantity === 0" class="out-of-stock-overlay">
        <span>Out of Stock</span>
      </div>
    </div>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-category">{{ product.category_name }}</p>
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
    </div>

    <div class="product-actions">
      <button 
        @click.stop="addToCart"
        :disabled="product.stock_quantity === 0"
        class="btn btn-primary add-to-cart-btn"
      >
        {{ product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock' }}
      </button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import LazyImage from './LazyImage.vue'
import WishlistButton from './WishlistButton.vue'

export default {
  name: 'MobileProductCard',
  components: {
    LazyImage,
    WishlistButton
  },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const cartStore = useCartStore()
    const notificationsStore = useNotificationsStore()

    const goToProduct = () => {
      router.push(`/product/${props.product.id}`)
    }

    const addToCart = async () => {
      if (props.product.stock_quantity === 0) return
      
      const result = await cartStore.addToCart(props.product.id)
      if (result.success) {
        notificationsStore.success('Added to Cart', 'Product has been added to your cart!')
      } else {
        notificationsStore.error('Add to Cart Failed', result.message)
      }
    }

    return {
      goToProduct,
      addToCart,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.mobile-product-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mobile-product-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mobile-product-card:hover .product-image {
  transform: scale(1.05);
}

.out-of-stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.out-of-stock-overlay span {
  color: #f44336;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 10px #f44336;
}

.product-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 5px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-category {
  color: #00ffff;
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.product-price-rating {
  margin-top: auto;
}

.product-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00ffff;
  display: block;
  margin-bottom: 8px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.3);
}

.star.filled {
  color: #ffc107;
}

.rating-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.product-actions {
  padding: 0 15px 15px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.add-to-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-to-cart-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

/* Touch-friendly sizing for mobile */
@media (max-width: 768px) {
  .mobile-product-card {
    min-height: 280px;
  }
  
  .product-image-container {
    height: 120px;
  }
  
  .product-info {
    padding: 12px;
  }
  
  .product-name {
    font-size: 1rem;
  }
  
  .product-price {
    font-size: 1.2rem;
  }
  
  .add-to-cart-btn {
    padding: 14px;
    font-size: 1rem;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .mobile-product-card {
    min-height: 260px;
  }
  
  .product-image-container {
    height: 100px;
  }
  
  .product-info {
    padding: 10px;
  }
  
  .product-name {
    font-size: 0.95rem;
  }
  
  .product-price {
    font-size: 1.1rem;
  }
}
</style>