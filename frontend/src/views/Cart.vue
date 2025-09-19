<template>
  <div class="cart">
    <div class="container">
      <h1 class="page-title">Shopping Cart</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading"></div>
        <p>Loading cart...</p>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartStore.isEmpty" class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id" 
            class="cart-item"
          >
            <img 
              :src="item.imageUrl || '/api/placeholder/100/100'" 
              :alt="item.name"
              class="item-image"
            />
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-price">{{ formatCurrency(item.price) }}</p>
            </div>
            <div class="quantity-controls">
              <button 
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
                class="btn btn-secondary"
              >
                -
              </button>
              <input 
                v-model.number="item.quantity" 
                @change="updateQuantity(item.id, item.quantity)"
                type="number" 
                min="1" 
                :max="item.stockQuantity"
                class="quantity-input"
              />
              <button 
                @click="updateQuantity(item.id, item.quantity + 1)"
                :disabled="item.quantity >= item.stockQuantity"
                class="btn btn-secondary"
              >
                +
              </button>
            </div>
            <div class="item-subtotal">
              {{ formatCurrency(item.subtotal) }}
            </div>
            <button 
              @click="removeItem(item.id)"
              class="btn btn-secondary remove-btn"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Shipping Calculator -->
        <div class="shipping-section">
          <ShippingCalculator @shipping-selected="onShippingSelected" />
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(cartStore.subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span v-if="cartStore.hasShipping">
                {{ formatCurrency(cartStore.shippingCost) }}
                <small class="shipping-method">({{ cartStore.selectedShippingOption?.name }})</small>
              </span>
              <span v-else class="shipping-pending">
                <span class="shipping-warning">⚠️ Calculate shipping required</span>
              </span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ formatCurrency(cartStore.grandTotal) }}</span>
            </div>
            <!-- Shipping Required Notice -->
            <div v-if="!cartStore.hasShipping" class="shipping-required-notice">
              <div class="notice-icon">⚠️</div>
              <div class="notice-content">
                <strong>Shipping Required</strong>
                <p>Please calculate and select a shipping option before proceeding to checkout.</p>
              </div>
            </div>
            
            <router-link 
              to="/checkout" 
              class="btn btn-primary btn-lg w-100"
              :class="{ disabled: !cartStore.hasShipping }"
              :disabled="!cartStore.hasShipping"
            >
              Proceed to Checkout
            </router-link>
            <button @click="clearCart" class="btn btn-secondary w-100 mt-3">
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import { formatCurrency } from '../utils/currency'
import ShippingCalculator from '../components/ShippingCalculator.vue'

export default {
  name: 'Cart',
  components: {
    ShippingCalculator
  },
  setup() {
    const cartStore = useCartStore()

    const updateQuantity = async (itemId, newQuantity) => {
      if (newQuantity < 1) return
      await cartStore.updateQuantity(itemId, newQuantity)
    }

    const removeItem = async (itemId) => {
      await cartStore.removeItem(itemId)
    }

    const clearCart = async () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        await cartStore.clearCart()
      }
    }

    const onShippingSelected = (shippingOption) => {
      cartStore.setShippingOption(shippingOption)
    }

    onMounted(() => {
      cartStore.fetchCart()
    })

    return {
      cartStore,
      updateQuantity,
      removeItem,
      clearCart,
      onShippingSelected,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.cart {
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

.loading-container {
  text-align: center;
  padding: 60px 0;
}

.loading-container p {
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.8);
}

.empty-cart {
  text-align: center;
  padding: 60px 0;
}

.empty-cart h2 {
  color: #00ffff;
  margin-bottom: 15px;
}

.empty-cart p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
}

.shipping-section {
  order: 2;
}

.cart-summary {
  order: 3;
  position: sticky;
  top: 100px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cart-item:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.item-info {
  min-width: 0;
}

.item-name {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 8px;
  word-wrap: break-word;
}

.item-price {
  color: #00ffff;
  font-size: 1.1rem;
  font-weight: 700;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-input {
  width: 60px;
  padding: 8px;
  text-align: center;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
}

.item-subtotal {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00ffff;
  text-align: right;
  min-width: 100px;
}

.remove-btn {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.shipping-method {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-top: 2px;
}

.shipping-pending {
  color: #ffa500;
  font-style: italic;
}

.shipping-warning {
  color: #ff6b6b;
  font-weight: 600;
  font-style: normal;
}

.shipping-required-notice {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notice-content strong {
  color: #ffc107;
  display: block;
  margin-bottom: 5px;
  font-size: 1rem;
}

.notice-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.summary-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
}

.summary-card h3 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.summary-row.total {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00ffff;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  padding-top: 15px;
  margin-top: 15px;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .cart-item {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 15px;
  }
  
  .item-image {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .item-subtotal {
    text-align: center;
  }

  .cart-summary {
    position: static;
  }
}
</style>