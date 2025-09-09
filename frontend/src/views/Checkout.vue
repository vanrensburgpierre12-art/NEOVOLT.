<template>
  <div class="checkout">
    <div class="container">
      <h1 class="page-title">Checkout</h1>

      <div class="checkout-content">
        <!-- Shipping Information -->
        <div class="checkout-section">
          <h2>Shipping Information</h2>
          <form @submit.prevent="processOrder" class="checkout-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input 
                  v-model="shippingAddress.firstName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  v-model="shippingAddress.lastName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Address *</label>
              <input 
                v-model="shippingAddress.address" 
                type="text" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">City *</label>
                <input 
                  v-model="shippingAddress.city" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">Postal Code *</label>
                <input 
                  v-model="shippingAddress.postalCode" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Country *</label>
              <select v-model="shippingAddress.country" class="form-input" required>
                <option value="">Select Country</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Belgium">Belgium</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Payment Method -->
            <div class="payment-section">
              <h2>Payment Method</h2>
              <div class="payment-options">
                <label class="payment-option">
                  <input 
                    v-model="paymentMethod" 
                    type="radio" 
                    value="paypal" 
                    class="payment-radio"
                  />
                  <div class="payment-card">
                    <div class="payment-icon">💳</div>
                    <div class="payment-info">
                      <h3>PayPal</h3>
                      <p>Pay securely with PayPal</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <h2>Order Summary</h2>
              <div class="summary-items">
                <div 
                  v-for="item in cartStore.items" 
                  :key="item.id" 
                  class="summary-item"
                >
                  <span>{{ item.name }} x{{ item.quantity }}</span>
                  <span>{{ formatCurrency(item.subtotal) }}</span>
                </div>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>{{ formatCurrency(cartStore.total) }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="processing || cartStore.isEmpty"
              class="btn btn-primary btn-lg w-100"
            >
              {{ processing ? 'Processing...' : 'Complete Order' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'Checkout',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const authStore = useAuthStore()

    const shippingAddress = ref({
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: ''
    })

    const paymentMethod = ref('paypal')
    const processing = ref(false)

    const processOrder = async () => {
      if (cartStore.isEmpty) return

      processing.value = true

      try {
        // Create order
        const orderResponse = await axios.post('/api/orders/create', {
          shippingAddress: shippingAddress.value,
          paymentMethod: paymentMethod.value
        })

        const order = orderResponse.data.order

        if (paymentMethod.value === 'paypal') {
          // Create PayPal payment
          const paymentResponse = await axios.post('/api/payments/paypal/create', {
            orderId: order.id,
            returnUrl: `${window.location.origin}/payment/success`,
            cancelUrl: `${window.location.origin}/payment/cancel`
          })

          // Redirect to PayPal
          window.location.href = paymentResponse.data.approvalUrl
        } else {
          // For other payment methods, redirect to success page
          router.push(`/orders/${order.id}`)
        }
      } catch (error) {
        console.error('Order processing failed:', error)
        alert('Order processing failed. Please try again.')
      } finally {
        processing.value = false
      }
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }

      if (cartStore.isEmpty) {
        cartStore.fetchCart()
      }

      // Pre-fill with user data if available
      if (authStore.user) {
        shippingAddress.value.firstName = authStore.user.firstName || ''
        shippingAddress.value.lastName = authStore.user.lastName || ''
      }
    })

    return {
      cartStore,
      shippingAddress,
      paymentMethod,
      processing,
      processOrder,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.checkout {
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

.checkout-content {
  max-width: 800px;
  margin: 0 auto;
}

.checkout-section {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 30px;
}

.checkout-section h2 {
  color: #00ffff;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #00ffff;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.payment-section {
  margin: 40px 0;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-option {
  cursor: pointer;
}

.payment-radio {
  display: none;
}

.payment-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(26, 26, 46, 0.5);
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.payment-option:hover .payment-card {
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.payment-radio:checked + .payment-card {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.payment-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.payment-info h3 {
  color: #ffffff;
  margin-bottom: 5px;
}

.payment-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.order-summary {
  background: rgba(0, 0, 0, 0.3);
  padding: 30px;
  border-radius: 8px;
  margin: 30px 0;
}

.order-summary h2 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.summary-items {
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.3rem;
  font-weight: 700;
  color: #00ffff;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  padding-top: 15px;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkout-section {
    padding: 20px;
  }
}
</style>