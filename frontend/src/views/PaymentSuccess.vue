<template>
  <div class="payment-success">
    <div class="container">
      <div class="success-content">
        <!-- Success Icon -->
        <div class="success-icon">
          <div class="checkmark">
            <div class="checkmark-circle"></div>
            <div class="checkmark-stem"></div>
            <div class="checkmark-kick"></div>
          </div>
        </div>

        <!-- Success Message -->
        <h1 class="success-title">Payment Successful!</h1>
        <p class="success-message">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        <!-- Order Details -->
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
              <span class="value status-badge">{{ order.status.toUpperCase() }}</span>
            </div>
            <div class="info-row">
              <span class="label">Order Date:</span>
              <span class="value">{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <router-link to="/orders" class="btn btn-primary">
            View My Orders
          </router-link>
          <router-link to="/products" class="btn btn-secondary">
            Continue Shopping
          </router-link>
        </div>

        <!-- What's Next -->
        <div class="next-steps">
          <h3>What's Next?</h3>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Order Confirmation</h4>
                <p>You'll receive an email confirmation shortly</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Processing</h4>
                <p>We'll prepare your order for shipment</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Shipping</h4>
                <p>You'll receive tracking information once shipped</p>
              </div>
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
  name: 'PaymentSuccess',
  setup() {
    const route = useRoute()
    const order = ref(null)
    const loading = ref(true)

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

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
      formatDate,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.payment-success {
  padding: 60px 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-content {
  max-width: 600px;
  text-align: center;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.success-icon {
  margin-bottom: 30px;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #00ffff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  position: relative;
  animation: checkmark-pulse 2s ease-in-out infinite;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #00ffff;
  fill: none;
  animation: checkmark-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-stem {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: #00ffff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-miterlimit: 10;
  animation: checkmark-stem 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

.checkmark-kick {
  transform-origin: 50% 50%;
  stroke-dasharray: 29;
  stroke-dashoffset: 29;
  stroke: #00ffff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-miterlimit: 10;
  animation: checkmark-kick 0.2s cubic-bezier(0.65, 0, 0.45, 1) 1.1s forwards;
}

@keyframes checkmark-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes checkmark-circle {
  0% { stroke-dashoffset: 166; }
  100% { stroke-dashoffset: 0; }
}

@keyframes checkmark-stem {
  0% { stroke-dashoffset: 48; }
  100% { stroke-dashoffset: 0; }
}

@keyframes checkmark-kick {
  0% { stroke-dashoffset: 29; }
  100% { stroke-dashoffset: 0; }
}

.success-title {
  font-size: 2.5rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin-bottom: 20px;
  font-family: 'Orbitron', monospace;
}

.success-message {
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
  color: #00ffff;
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
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
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
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  border: 1px solid #00ffff;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
}

.next-steps {
  text-align: left;
}

.next-steps h3 {
  color: #00ffff;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.3rem;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.step-number {
  width: 30px;
  height: 30px;
  background: #00ffff;
  color: #0a0a0a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content h4 {
  color: #ffffff;
  margin-bottom: 5px;
  font-size: 1rem;
}

.step-content p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .success-content {
    padding: 20px;
    margin: 20px;
  }
  
  .success-title {
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
}
</style>