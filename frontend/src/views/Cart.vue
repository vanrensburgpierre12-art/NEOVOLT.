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

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(cartStore.total) }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>{{ formatCurrency(cartStore.total) }}</span>
            </div>
            <router-link to="/checkout" class="btn btn-primary btn-lg w-100">
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

export default {
  name: 'Cart',
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

    onMounted(() => {
      cartStore.fetchCart()
    })

    return {
      cartStore,
      updateQuantity,
      removeItem,
      clearCart,
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
  grid-template-columns: 2fr 1fr;
  gap: 40px;
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

.cart-summary {
  position: sticky;
  top: 100px;
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
}
</style>