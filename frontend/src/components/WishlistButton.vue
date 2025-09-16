<template>
  <button 
    @click="toggleWishlist" 
    :disabled="loading"
    class="wishlist-button"
    :class="{ 'in-wishlist': isInWishlist, 'loading': loading }"
    :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span v-else class="heart-icon">{{ isInWishlist ? '❤️' : '🤍' }}</span>
  </button>
</template>

<script>
import { computed } from 'vue'
import { useWishlistStore } from '../stores/wishlist'
import { useNotificationsStore } from '../stores/notifications'

export default {
  name: 'WishlistButton',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const wishlistStore = useWishlistStore()
    const notificationsStore = useNotificationsStore()

    const isInWishlist = computed(() => wishlistStore.isInWishlist(props.product.id))
    const loading = computed(() => wishlistStore.loading)

    const toggleWishlist = async () => {
      const result = await wishlistStore.toggleWishlist(props.product)
      if (result.success) {
        if (isInWishlist.value) {
          notificationsStore.success('Removed from Wishlist', `${props.product.name} has been removed from your wishlist`)
        } else {
          notificationsStore.success('Added to Wishlist', `${props.product.name} has been added to your wishlist`)
        }
      } else {
        notificationsStore.error('Wishlist Error', result.message)
      }
    }

    return {
      isInWishlist,
      loading,
      toggleWishlist
    }
  }
}
</script>

<style scoped>
.wishlist-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.wishlist-button:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  transform: scale(1.1);
}

.wishlist-button.in-wishlist {
  background: rgba(244, 67, 54, 0.2);
  border-color: #f44336;
}

.wishlist-button.in-wishlist:hover {
  background: rgba(244, 67, 54, 0.3);
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.3);
}

.wishlist-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.heart-icon {
  font-size: 18px;
  transition: all 0.3s ease;
}

.wishlist-button:hover .heart-icon {
  transform: scale(1.2);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #00ffff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>