<template>
  <div class="payment-cancel">
    <div class="container">
      <div class="cancel-content">
        <!-- Cancel Icon -->
        <div class="cancel-icon">
          <div class="cancel-symbol">
            <div class="cancel-line cancel-line-1"></div>
            <div class="cancel-line cancel-line-2"></div>
          </div>
        </div>

        <!-- Cancel Message -->
        <h1 class="cancel-title">Payment Cancelled</h1>
        <p class="cancel-message">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <!-- Order Details (if available) -->
        <div v-if="order" class="order-details">
          <h2>Order Details</h2>
          <div class="order-info">
            <div class="info-row">
              <span class="label">Order Number:</span>
              <span class="value">{{ order.order_number }}</span>
            </div>
            <div class="info-row">
              <span class="label">Total Amount:</span>
              <span class="value">{{ formatCurrency(order.total_amount) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value status-badge cancelled">{{ order.status.toUpperCase() }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <router-link to="/checkout" class="btn btn-primary">
            Try Again
          </router-link>
          <router-link to="/cart" class="btn btn-secondary">
            Back to Cart
          </router-link>
          <router-link to="/products" class="btn btn-secondary">
            Continue Shopping
          </router-link>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <h3>Need Help?</h3>
          <div class="help-options">
            <div class="help-option">
              <div class="help-icon">💳</div>
              <div class="help-content">
                <h4>Payment Issues</h4>
                <p>If you're experiencing payment problems, please try a different payment method</p>
              </div>
            </div>
            <div class="help-option">
              <div class="help-icon">📞</div>
              <div class="help-content">
                <h4>Contact Support</h4>
                <p>Our support team is here to help with any questions or concerns</p>
              </div>
            </div>
            <div class="help-option">
              <div class="help-icon">🔄</div>
              <div class="help-content">
                <h4>Retry Payment</h4>
                <p>You can retry your payment at any time from your cart or checkout</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Common Issues -->
        <div class="common-issues">
          <h3>Common Payment Issues</h3>
          <div class="issues-list">
            <div class="issue-item">
              <strong>Insufficient Funds:</strong> Make sure your account has sufficient balance
            </div>
            <div class="issue-item">
              <strong>Card Declined:</strong> Contact your bank or try a different card
            </div>
            <div class="issue-item">
              <strong>Network Error:</strong> Check your internet connection and try again
            </div>
            <div class="issue-item">
              <strong>Browser Issues:</strong> Try refreshing the page or using a different browser
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'PaymentCancel',
  setup() {
    const route = useRoute()
    const order = ref(null)
    const loading = ref(true)

    const fetchOrderDetails = async () => {
      try {
        const orderId = route.query.orderId || route.params.orderId
        if (orderId) {
          const response = await axios.get(`/api/orders/${orderId}`)
          order.value = response.data
        }
      } catch (error) {
        console.error('Failed to fetch order details:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchOrderDetails()
    })

    return {
      order,
      loading,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.payment-cancel {
  padding: 60px 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-content {
  max-width: 600px;
  text-align: center;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.cancel-icon {
  margin-bottom: 30px;
}

.cancel-symbol {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.1);
  border: 3px solid #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  animation: cancel-pulse 2s ease-in-out infinite;
}

.cancel-line {
  position: absolute;
  width: 40px;
  height: 3px;
  background: #ff6b6b;
  border-radius: 2px;
}

.cancel-line-1 {
  transform: rotate(45deg);
  animation: cancel-line-1 0.3s ease-in-out forwards;
}

.cancel-line-2 {
  transform: rotate(-45deg);
  animation: cancel-line-2 0.3s ease-in-out 0.1s forwards;
}

@keyframes cancel-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes cancel-line-1 {
  0% { width: 0; }
  100% { width: 40px; }
}

@keyframes cancel-line-2 {
  0% { width: 0; }
  100% { width: 40px; }
}

.cancel-title {
  font-size: 2.5rem;
  color: #ff6b6b;
  text-shadow: 0 0 20px #ff6b6b;
  margin-bottom: 20px;
  font-family: 'Orbitron', monospace;
}

.cancel-message {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  line-height: 1.6;
}

.order-details {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 40px;
  text-align: left;
}

.order-details h2 {
  color: #ff6b6b;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.5rem;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 107, 107, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.value {
  color: #ffffff;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  border: 1px solid;
}

.status-badge.cancelled {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.help-section {
  text-align: left;
  margin-bottom: 40px;
}

.help-section h3 {
  color: #00ffff;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.3rem;
}

.help-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.help-option {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.help-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.help-content h4 {
  color: #ffffff;
  margin-bottom: 5px;
  font-size: 1rem;
}

.help-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

.common-issues {
  text-align: left;
}

.common-issues h3 {
  color: #00ffff;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.3rem;
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.issue-item {
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;
}

.issue-item strong {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .cancel-content {
    padding: 20px;
    margin: 20px;
  }
  
  .cancel-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .help-option {
    flex-direction: column;
    text-align: center;
  }
}
</style>