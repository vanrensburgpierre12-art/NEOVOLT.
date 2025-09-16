<template>
  <div class="mobile-cart-item">
    <div class="item-image-container">
      <LazyImage 
        :src="item.imageUrl || '/api/placeholder/80/80'" 
        :alt="item.name"
        height="80px"
        image-class="item-image"
      />
    </div>
    
    <div class="item-details">
      <h4 class="item-name">{{ item.name }}</h4>
      <p class="item-price">{{ formatCurrency(item.price) }}</p>
      <p class="item-subtotal">Subtotal: {{ formatCurrency(item.subtotal) }}</p>
    </div>

    <div class="item-controls">
      <div class="quantity-controls">
        <button 
          @click="decreaseQuantity"
          :disabled="item.quantity <= 1"
          class="quantity-btn"
        >
          −
        </button>
        <span class="quantity-display">{{ item.quantity }}</span>
        <button 
          @click="increaseQuantity"
          :disabled="item.quantity >= item.stockQuantity"
          class="quantity-btn"
        >
          +
        </button>
      </div>
      
      <button 
        @click="removeItem"
        class="remove-btn"
        title="Remove item"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '../stores/cart'
import { useNotificationsStore } from '../stores/notifications'
import { formatCurrency } from '../utils/currency'
import LazyImage from './LazyImage.vue'

export default {
  name: 'MobileCartItem',
  components: {
    LazyImage
  },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const cartStore = useCartStore()
    const notificationsStore = useNotificationsStore()

    const increaseQuantity = async () => {
      if (props.item.quantity < props.item.stockQuantity) {
        const result = await cartStore.updateQuantity(props.item.id, props.item.quantity + 1)
        if (!result.success) {
          notificationsStore.error('Update Failed', result.message)
        }
      }
    }

    const decreaseQuantity = async () => {
      if (props.item.quantity > 1) {
        const result = await cartStore.updateQuantity(props.item.id, props.item.quantity - 1)
        if (!result.success) {
          notificationsStore.error('Update Failed', result.message)
        }
      }
    }

    const removeItem = async () => {
      const result = await cartStore.removeItem(props.item.id)
      if (result.success) {
        notificationsStore.success('Removed from Cart', `${props.item.name} has been removed from your cart`)
      } else {
        notificationsStore.error('Remove Failed', result.message)
      }
    }

    return {
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.mobile-cart-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.mobile-cart-item:hover {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.item-image-container {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 5px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  font-size: 0.9rem;
  color: #00ffff;
  margin: 0 0 3px 0;
  font-weight: 500;
}

.item-subtotal {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 600;
}

.item-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 4px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.3);
  transform: scale(1.1);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-display {
  min-width: 30px;
  text-align: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(244, 67, 54, 0.3);
  transform: scale(1.1);
}

/* Touch-friendly sizing */
@media (max-width: 480px) {
  .mobile-cart-item {
    padding: 12px;
    gap: 12px;
  }
  
  .item-image-container {
    width: 70px;
    height: 70px;
  }
  
  .item-name {
    font-size: 0.95rem;
  }
  
  .quantity-btn {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
  
  .remove-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* Touch interactions */
@media (hover: none) and (pointer: coarse) {
  .quantity-btn:active {
    transform: scale(0.95);
  }
  
  .remove-btn:active {
    transform: scale(0.95);
  }
}
</style>