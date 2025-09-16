<template>
  <div v-if="recentlyViewedStore.hasItems" class="recently-viewed">
    <h3 class="section-title">Recently Viewed</h3>
    <div class="recently-viewed-grid">
      <div 
        v-for="item in recentlyViewedStore.recentItems" 
        :key="item.id" 
        class="recent-item"
        @click="goToProduct(item.id)"
      >
        <div class="item-image-container">
          <LazyImage 
            :src="item.image_url || '/api/placeholder/100/100'" 
            :alt="item.name"
            height="100px"
            image-class="item-image"
          />
          <button 
            @click.stop="removeItem(item.id)"
            class="remove-btn"
            title="Remove from recently viewed"
          >
            ×
          </button>
        </div>
        <div class="item-info">
          <h4 class="item-name">{{ item.name }}</h4>
          <p class="item-category">{{ item.category_name }}</p>
          <p class="item-price">{{ formatCurrency(item.price) }}</p>
          <p class="viewed-time">{{ formatTime(item.viewed_at) }}</p>
        </div>
      </div>
    </div>
    <div class="recently-viewed-actions">
      <button @click="clearAll" class="btn btn-secondary btn-sm">
        Clear All
      </button>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRecentlyViewedStore } from '../stores/recentlyViewed'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import LazyImage from './LazyImage.vue'

export default {
  name: 'RecentlyViewed',
  components: {
    LazyImage
  },
  setup() {
    const router = useRouter()
    const recentlyViewedStore = useRecentlyViewedStore()
    const notificationsStore = useNotificationsStore()

    const goToProduct = (productId) => {
      router.push(`/product/${productId}`)
    }

    const removeItem = (productId) => {
      recentlyViewedStore.removeProduct(productId)
      notificationsStore.info('Removed', 'Item removed from recently viewed')
    }

    const clearAll = () => {
      if (confirm('Clear all recently viewed items?')) {
        recentlyViewedStore.clearAll()
        notificationsStore.info('Cleared', 'All recently viewed items have been cleared')
      }
    }

    const formatTime = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `${diffInHours}h ago`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) return `${diffInDays}d ago`
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }

    onMounted(() => {
      recentlyViewedStore.loadFromStorage()
    })

    return {
      recentlyViewedStore,
      goToProduct,
      removeItem,
      clearAll,
      formatCurrency,
      formatTime
    }
  }
}
</script>

<style scoped>
.recently-viewed {
  margin-top: 40px;
  padding: 30px;
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
}

.section-title {
  color: #00ffff;
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 0 0 10px #00ffff;
}

.recently-viewed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.recent-item {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.recent-item:hover {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
}

.item-image-container {
  position: relative;
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  border-radius: 6px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(244, 67, 54, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  opacity: 0;
}

.recent-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: #f44336;
  transform: scale(1.1);
}

.item-info {
  text-align: center;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 5px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-category {
  color: #00ffff;
  font-size: 0.8rem;
  margin: 0 0 5px 0;
}

.item-price {
  font-size: 1rem;
  color: #00ffff;
  font-weight: 700;
  margin: 0 0 3px 0;
}

.viewed-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin: 0;
}

.recently-viewed-actions {
  text-align: center;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .recently-viewed {
    padding: 20px;
    margin-top: 30px;
  }
  
  .recently-viewed-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .recent-item {
    padding: 12px;
  }
  
  .item-image-container {
    height: 80px;
  }
  
  .item-name {
    font-size: 0.85rem;
  }
  
  .item-price {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .recently-viewed-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .item-image-container {
    height: 70px;
  }
}
</style>