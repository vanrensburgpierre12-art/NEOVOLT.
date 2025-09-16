<template>
  <div class="wishlist">
    <div class="container">
      <h1 class="page-title">My Wishlist</h1>

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" message="Loading wishlist..." />

      <!-- Empty Wishlist -->
      <div v-else-if="wishlistStore.isEmpty" class="empty-wishlist">
        <div class="empty-icon">💝</div>
        <h2>Your wishlist is empty</h2>
        <p>Add some products to your wishlist to save them for later!</p>
        <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
      </div>

      <!-- Wishlist Items -->
      <div v-else class="wishlist-content">
        <div class="wishlist-header">
          <p class="wishlist-count">{{ wishlistStore.itemCount }} item(s) in your wishlist</p>
          <button @click="clearWishlist" class="btn btn-secondary">Clear All</button>
        </div>

        <div class="wishlist-grid">
          <div 
            v-for="item in wishlistStore.items" 
            :key="item.id" 
            class="wishlist-item"
          >
            <div class="item-image-container">
              <LazyImage 
                :src="item.image_url || '/api/placeholder/200/200'" 
                :alt="item.name"
                height="200px"
                image-class="item-image"
              />
              <button 
                @click="removeFromWishlist(item.id)"
                class="remove-button"
                title="Remove from wishlist"
              >
                ✕
              </button>
            </div>
            
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-category">{{ item.category_name }}</p>
              <p class="item-price">{{ formatCurrency(item.price) }}</p>
              <p class="item-added">Added {{ formatDate(item.added_at) }}</p>
            </div>

            <div class="item-actions">
              <button 
                @click="goToProduct(item.id)"
                class="btn btn-primary"
              >
                View Product
              </button>
              <button 
                @click="addToCart(item.id)"
                class="btn btn-secondary"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWishlistStore } from '../stores/wishlist'
import { useCartStore } from '../stores/cart'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import LazyImage from '../components/LazyImage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  name: 'Wishlist',
  components: {
    LazyImage,
    LoadingSpinner
  },
  setup() {
    const router = useRouter()
    const wishlistStore = useWishlistStore()
    const cartStore = useCartStore()
    const notificationsStore = useNotificationsStore()

    const loading = computed(() => wishlistStore.loading)

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

    const removeFromWishlist = async (productId) => {
      const result = await wishlistStore.removeFromWishlist(productId)
      if (result.success) {
        notificationsStore.success('Removed from Wishlist', 'Product has been removed from your wishlist')
      } else {
        notificationsStore.error('Remove Failed', result.message)
      }
    }

    const clearWishlist = async () => {
      if (confirm('Are you sure you want to clear your entire wishlist?')) {
        const result = await wishlistStore.clearWishlist()
        if (result.success) {
          notificationsStore.success('Wishlist Cleared', 'Your wishlist has been cleared')
        } else {
          notificationsStore.error('Clear Failed', result.message)
        }
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    onMounted(() => {
      wishlistStore.fetchWishlist()
    })

    return {
      wishlistStore,
      loading,
      goToProduct,
      addToCart,
      removeFromWishlist,
      clearWishlist,
      formatCurrency,
      formatDate
    }
  }
}
</script>

<style scoped>
.wishlist {
  padding: 40px 0;
  min-height: 80vh;
}

.page-title {
  font-size: 3rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin-bottom: 40px;
  text-align: center;
}

.empty-wishlist {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-wishlist h2 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 2rem;
}

.empty-wishlist p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.wishlist-content {
  max-width: 1200px;
  margin: 0 auto;
}

.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(26, 26, 46, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.wishlist-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.wishlist-item {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.wishlist-item:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  transform: translateY(-5px);
}

.item-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;
}

.remove-button:hover {
  background: #f44336;
  transform: scale(1.1);
}

.item-info {
  padding: 20px;
}

.item-name {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 600;
}

.item-category {
  color: #00ffff;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.item-price {
  font-size: 1.3rem;
  color: #00ffff;
  font-weight: 700;
  margin-bottom: 8px;
}

.item-added {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0;
}

.item-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
}

.item-actions .btn {
  flex: 1;
  padding: 10px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .wishlist-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .wishlist-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .item-actions {
    flex-direction: column;
  }
}
</style>