<template>
  <div class="checkout">
    <div class="container">
      <h1 class="page-title">Checkout</h1>

      <!-- Guest Checkout Option -->
      <div v-if="!authStore.isAuthenticated" class="guest-checkout-section">
        <div class="guest-options">
          <div class="guest-option">
            <h3>Continue as Guest</h3>
            <p>Complete your purchase without creating an account</p>
            <button @click="continueAsGuest" class="btn btn-primary">
              Continue as Guest
            </button>
          </div>
          <div class="divider">
            <span>OR</span>
          </div>
          <div class="guest-option">
            <h3>Sign In</h3>
            <p>Sign in to your account for faster checkout</p>
            <router-link to="/login" class="btn btn-secondary">
              Sign In
            </router-link>
          </div>
        </div>
      </div>

      <!-- Guest Checkout Form -->
      <div v-if="isGuestCheckout" class="checkout-content">
        <div class="checkout-section">
          <h2>Guest Checkout</h2>
          <form @submit.prevent="processGuestOrder" class="checkout-form">
            <!-- Guest Information -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input 
                  v-model="guestInfo.firstName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  v-model="guestInfo.lastName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input 
                v-model="guestInfo.email" 
                type="email" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input 
                v-model="guestInfo.phone" 
                type="tel" 
                class="form-input" 
              />
            </div>

            <!-- Shipping Information -->
            <h3>Shipping Information</h3>
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
                <option value="Germany">Germany</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Belgium">Belgium</option>
                <option value="France">France</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Payment Method -->
            <div class="payment-section">
              <h3>Payment Method</h3>
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

                <label class="payment-option">
                  <input 
                    v-model="paymentMethod" 
                    type="radio" 
                    value="stripe" 
                    class="payment-radio"
                  />
                  <div class="payment-card">
                    <div class="payment-icon">💳</div>
                    <div class="payment-info">
                      <h3>Credit/Debit Card</h3>
                      <p>Pay with Visa, Mastercard, or American Express</p>
                    </div>
                  </div>
                </label>
              </div>

              <!-- Stripe Payment Form -->
              <div v-if="paymentMethod === 'stripe'" class="stripe-form">
                <div id="stripe-card-element" class="stripe-input"></div>
                <div id="stripe-card-errors" class="stripe-errors"></div>
              </div>
            </div>

            <!-- Shipping Information Display -->
            <div v-if="cartStore.hasShipping" class="shipping-info">
              <h3>Selected Shipping</h3>
              <div class="shipping-details">
                <div class="shipping-option">
                  <div class="option-name">{{ cartStore.selectedShippingOption.name }}</div>
                  <div class="option-price">{{ formatCurrency(cartStore.shippingCost) }}</div>
                </div>
                <div class="shipping-address">
                  <strong>Delivery Address:</strong><br>
                  {{ shippingAddress.address }}<br>
                  {{ shippingAddress.city }}, {{ shippingAddress.postalCode }}<br>
                  {{ shippingAddress.country }}
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <h3>Order Summary</h3>
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
                <span v-else class="shipping-pending">Not calculated</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>{{ formatCurrency(cartStore.grandTotal) }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="processing || cartStore.isEmpty || !cartStore.hasShipping"
              class="btn btn-primary btn-lg w-100"
            >
              {{ processing ? 'Processing...' : 'Complete Order' }}
            </button>
            
            <!-- Shipping Required Notice -->
            <div v-if="!cartStore.hasShipping" class="shipping-notice">
              <div class="notice-icon">⚠️</div>
              <div class="notice-content">
                <strong>Shipping Required</strong>
                <p>Please calculate and select a shipping option before proceeding to checkout.</p>
                <router-link to="/cart" class="btn btn-secondary">
                  Go to Cart to Calculate Shipping
                </router-link>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div v-else-if="authStore.isAuthenticated" class="checkout-content">
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

                <label class="payment-option">
                  <input 
                    v-model="paymentMethod" 
                    type="radio" 
                    value="stripe" 
                    class="payment-radio"
                  />
                  <div class="payment-card">
                    <div class="payment-icon">💳</div>
                    <div class="payment-info">
                      <h3>Credit/Debit Card</h3>
                      <p>Pay with Visa, Mastercard, or American Express</p>
                    </div>
                  </div>
                </label>
              </div>

              <!-- Stripe Payment Form -->
              <div v-if="paymentMethod === 'stripe'" class="stripe-form">
                <div id="stripe-card-element" class="stripe-input"></div>
                <div id="stripe-card-errors" class="stripe-errors"></div>
              </div>
            </div>

            <!-- Shipping Information Display -->
            <div v-if="cartStore.hasShipping" class="shipping-info">
              <h3>Selected Shipping</h3>
              <div class="shipping-details">
                <div class="shipping-option">
                  <div class="option-name">{{ cartStore.selectedShippingOption.name }}</div>
                  <div class="option-price">{{ formatCurrency(cartStore.shippingCost) }}</div>
                </div>
                <div class="shipping-address">
                  <strong>Delivery Address:</strong><br>
                  {{ shippingAddress.address }}<br>
                  {{ shippingAddress.city }}, {{ shippingAddress.postalCode }}<br>
                  {{ shippingAddress.country }}
                </div>
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
                <span v-else class="shipping-pending">Not calculated</span>
              </div>
              <div class="summary-total">
                <span>Total:</span>
                <span>{{ formatCurrency(cartStore.grandTotal) }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="processing || cartStore.isEmpty || !cartStore.hasShipping"
              class="btn btn-primary btn-lg w-100"
            >
              {{ processing ? 'Processing...' : 'Complete Order' }}
            </button>
            
            <!-- Shipping Required Notice -->
            <div v-if="!cartStore.hasShipping" class="shipping-notice">
              <div class="notice-icon">⚠️</div>
              <div class="notice-content">
                <strong>Shipping Required</strong>
                <p>Please calculate and select a shipping option before proceeding to checkout.</p>
                <router-link to="/cart" class="btn btn-secondary">
                  Go to Cart to Calculate Shipping
                </router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'
import YocoPayment from '../components/YocoPayment.vue'

export default {
  name: 'Checkout',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const authStore = useAuthStore()

    const isGuestCheckout = ref(false)
    
    const guestInfo = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    })

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
    const stripe = ref(null)
    const stripeElements = ref(null)
    const cardElement = ref(null)

    const continueAsGuest = () => {
      isGuestCheckout.value = true
    }

    const processGuestOrder = async () => {
      if (cartStore.isEmpty) return

      processing.value = true

      try {
        // Create guest order
        const orderResponse = await axios.post('/api/orders/create-guest', {
          guestInfo: guestInfo.value,
          shippingAddress: shippingAddress.value,
          paymentMethod: paymentMethod.value,
          cartItems: cartStore.items,
          shippingOption: cartStore.selectedShippingOption
        })

        const order = orderResponse.data.order

        if (paymentMethod.value === 'paypal') {
          // Create PayPal payment
          const paymentResponse = await axios.post('/api/payments/paypal/create', {
            orderId: order.id,
            returnUrl: `${window.location.origin}/payment/success?orderId=${order.id}`,
            cancelUrl: `${window.location.origin}/payment/cancel?orderId=${order.id}`
          })

          // Redirect to PayPal
          window.location.href = paymentResponse.data.approvalUrl
        } else if (paymentMethod.value === 'stripe') {
          // Create Stripe payment intent
          const paymentResponse = await axios.post('/api/payments/stripe/create', {
            orderId: order.id
          })

          const { clientSecret } = paymentResponse.data

          // Confirm payment with Stripe
          const { error, paymentIntent } = await stripe.value.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement.value,
              billing_details: {
                name: `${guestInfo.value.firstName} ${guestInfo.value.lastName}`,
                email: guestInfo.value.email,
                address: {
                  line1: shippingAddress.value.address,
                  city: shippingAddress.value.city,
                  postal_code: shippingAddress.value.postalCode,
                  country: shippingAddress.value.country
                }
              }
            }
          })

          if (error) {
            console.error('Stripe payment failed:', error)
            alert('Payment failed: ' + error.message)
            return
          }

          // Confirm payment on backend
          await axios.post('/api/payments/stripe/confirm', {
            paymentIntentId: paymentIntent.id,
            orderId: order.id
          })

          // Clear cart and redirect to success page
          cartStore.clearCart()
          router.push(`/payment/success?orderId=${order.id}`)
        }
      } catch (error) {
        console.error('Guest order processing failed:', error)
        alert('Order processing failed. Please try again.')
      } finally {
        processing.value = false
      }
    }

    const processOrder = async () => {
      if (cartStore.isEmpty) return

      processing.value = true

      try {
        // Create order
        const orderResponse = await axios.post('/api/orders/create', {
          shippingAddress: shippingAddress.value,
          paymentMethod: paymentMethod.value,
          shippingOption: cartStore.selectedShippingOption
        })

        const order = orderResponse.data.order

        if (paymentMethod.value === 'paypal') {
          // Create PayPal payment
          const paymentResponse = await axios.post('/api/payments/paypal/create', {
            orderId: order.id,
            returnUrl: `${window.location.origin}/payment/success?orderId=${order.id}`,
            cancelUrl: `${window.location.origin}/payment/cancel?orderId=${order.id}`
          })

          // Redirect to PayPal
          window.location.href = paymentResponse.data.approvalUrl
        } else if (paymentMethod.value === 'stripe') {
          // Create Stripe payment intent
          const paymentResponse = await axios.post('/api/payments/stripe/create', {
            orderId: order.id
          })

          const { clientSecret } = paymentResponse.data

          // Confirm payment with Stripe
          const { error, paymentIntent } = await stripe.value.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement.value,
              billing_details: {
                name: `${shippingAddress.value.firstName} ${shippingAddress.value.lastName}`,
                address: {
                  line1: shippingAddress.value.address,
                  city: shippingAddress.value.city,
                  postal_code: shippingAddress.value.postalCode,
                  country: shippingAddress.value.country
                }
              }
            }
          })

          if (error) {
            console.error('Stripe payment failed:', error)
            alert('Payment failed: ' + error.message)
            return
          }

          // Confirm payment on backend
          await axios.post('/api/payments/stripe/confirm', {
            paymentIntentId: paymentIntent.id,
            orderId: order.id
          })

          // Clear cart and redirect to success page
          cartStore.clearCart()
          router.push(`/orders/${order.id}`)
        }
      } catch (error) {
        console.error('Order processing failed:', error)
        alert('Order processing failed. Please try again.')
      } finally {
        processing.value = false
      }
    }

    const initializeStripe = async () => {
      if (window.Stripe) {
        stripe.value = window.Stripe(process.env.VUE_APP_STRIPE_PUBLISHABLE_KEY)
        stripeElements.value = stripe.value.elements()
        cardElement.value = stripeElements.value.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#ffffff',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
            },
          },
        })
        cardElement.value.mount('#stripe-card-element')
        
        cardElement.value.on('change', (event) => {
          const displayError = document.getElementById('stripe-card-errors')
          if (event.error) {
            displayError.textContent = event.error.message
          } else {
            displayError.textContent = ''
          }
        })
      }
    }

    onMounted(async () => {
      if (cartStore.isEmpty) {
        cartStore.fetchCart()
      }

      // Pre-fill with user data if available
      if (authStore.user) {
        shippingAddress.value.firstName = authStore.user.firstName || ''
        shippingAddress.value.lastName = authStore.user.lastName || ''
      }

      // Initialize Stripe
      await nextTick()
      await initializeStripe()
    })

    return {
      authStore,
      cartStore,
      isGuestCheckout,
      guestInfo,
      shippingAddress,
      paymentMethod,
      processing,
      continueAsGuest,
      processGuestOrder,
      processOrder,
      formatCurrency,
      stripe,
      stripeElements,
      cardElement
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

.guest-checkout-section {
  max-width: 800px;
  margin: 0 auto;
  margin-bottom: 40px;
}

.guest-options {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 30px;
  align-items: center;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
}

.guest-option {
  text-align: center;
}

.guest-option h3 {
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.guest-option p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.5;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 255, 255, 0.3);
}

.divider span {
  background: rgba(26, 26, 46, 0.8);
  color: rgba(255, 255, 255, 0.6);
  padding: 0 20px;
  font-weight: 500;
  position: relative;
  z-index: 1;
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

.stripe-form {
  margin-top: 20px;
  padding: 20px;
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
}

.stripe-input {
  padding: 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 10px;
}

.stripe-errors {
  color: #fa755a;
  font-size: 14px;
  margin-top: 5px;
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

.shipping-info {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.shipping-info h3 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.shipping-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.shipping-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.option-name {
  color: #ffffff;
  font-weight: 600;
}

.option-price {
  color: #00ffff;
  font-weight: 700;
  font-size: 1.1rem;
}

.shipping-address {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
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

.shipping-notice {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.notice-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notice-content strong {
  color: #ffc107;
  display: block;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.notice-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 15px 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .guest-options {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .divider {
    height: auto;
    padding: 20px 0;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .checkout-section {
    padding: 20px;
  }
}
</style>