<template>
  <div class="yoco-payment">
    <div v-if="!paymentInitialized" class="payment-loading">
      <div class="loading-spinner"></div>
      <p>Initializing payment...</p>
    </div>

    <div v-else class="payment-form">
      <h3>Card Payment</h3>
      <p class="payment-amount">Total: {{ formatCurrency(amount) }}</p>
      
      <form @submit.prevent="processPayment" class="card-form">
        <div class="form-group">
          <label>Card Number</label>
          <input 
            v-model="cardDetails.number" 
            type="text" 
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            @input="formatCardNumber"
            required
          />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Expiry Date</label>
            <input 
              v-model="cardDetails.expiry" 
              type="text" 
              placeholder="MM/YY"
              maxlength="5"
              @input="formatExpiry"
              required
            />
          </div>
          
          <div class="form-group">
            <label>CVV</label>
            <input 
              v-model="cardDetails.cvv" 
              type="text" 
              placeholder="123"
              maxlength="4"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Cardholder Name</label>
          <input 
            v-model="cardDetails.name" 
            type="text" 
            placeholder="John Doe"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="cardDetails.email" 
            type="email" 
            placeholder="john@example.com"
            required
          />
        </div>
        
        <div class="payment-actions">
          <button 
            type="button" 
            @click="$emit('cancel')" 
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            :disabled="processing"
            class="btn btn-primary"
          >
            <span v-if="processing">Processing...</span>
            <span v-else>Pay {{ formatCurrency(amount) }}</span>
          </button>
        </div>
      </form>
      
      <div class="payment-security">
        <p>🔒 Your payment is secured by Yoco</p>
        <div class="security-badges">
          <span class="badge">SSL Encrypted</span>
          <span class="badge">PCI Compliant</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="payment-error">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'YocoPayment',
  props: {
    orderId: {
      type: [String, Number],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'ZAR'
    }
  },
  emits: ['success', 'cancel', 'error'],
  setup(props, { emit }) {
    const paymentInitialized = ref(false)
    const processing = ref(false)
    const error = ref('')
    const cardDetails = ref({
      number: '',
      expiry: '',
      cvv: '',
      name: '',
      email: ''
    })

    const initializePayment = async () => {
      try {
        // Create payment intent
        const response = await axios.post('/api/yoco/create-payment-intent', {
          orderId: props.orderId,
          amount: props.amount,
          currency: props.currency
        })

        // Store payment intent ID for later confirmation
        window.paymentIntentId = response.data.paymentIntentId
        
        paymentInitialized.value = true
      } catch (err) {
        error.value = 'Failed to initialize payment. Please try again.'
        emit('error', err)
      }
    }

    const formatCardNumber = (event) => {
      let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
      if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19)
      cardDetails.value.number = formattedValue
    }

    const formatExpiry = (event) => {
      let value = event.target.value.replace(/\D/g, '')
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4)
      }
      cardDetails.value.expiry = value
    }

    const validateCard = () => {
      const { number, expiry, cvv, name, email } = cardDetails.value
      
      if (!number || number.replace(/\s/g, '').length < 13) {
        throw new Error('Please enter a valid card number')
      }
      
      if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
        throw new Error('Please enter a valid expiry date (MM/YY)')
      }
      
      if (!cvv || cvv.length < 3) {
        throw new Error('Please enter a valid CVV')
      }
      
      if (!name.trim()) {
        throw new Error('Please enter the cardholder name')
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address')
      }
    }

    const processPayment = async () => {
      try {
        processing.value = true
        error.value = ''
        
        validateCard()
        
        // In a real implementation, you would use Yoco's SDK to tokenize the card
        // For now, we'll simulate the payment process
        const paymentData = {
          paymentIntentId: window.paymentIntentId,
          orderId: props.orderId,
          cardDetails: cardDetails.value
        }
        
        // Confirm payment with backend
        const response = await axios.post('/api/yoco/confirm-payment', {
          paymentIntentId: window.paymentIntentId,
          orderId: props.orderId
        })
        
        if (response.data.success) {
          emit('success', {
            paymentId: response.data.paymentId,
            amount: response.data.amount,
            status: response.data.status
          })
        } else {
          throw new Error(response.data.message || 'Payment failed')
        }
        
      } catch (err) {
        error.value = err.message || 'Payment failed. Please try again.'
        emit('error', err)
      } finally {
        processing.value = false
      }
    }

    onMounted(() => {
      initializePayment()
    })

    onUnmounted(() => {
      // Clean up
      if (window.paymentIntentId) {
        delete window.paymentIntentId
      }
    })

    return {
      paymentInitialized,
      processing,
      error,
      cardDetails,
      formatCardNumber,
      formatExpiry,
      processPayment,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.yoco-payment {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
}

.payment-loading {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 255, 255, 0.3);
  border-top: 3px solid #00ffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.payment-form h3 {
  color: #00ffff;
  margin-bottom: 10px;
  text-align: center;
}

.payment-amount {
  font-size: 1.2rem;
  font-weight: 600;
  color: #00ffff;
  text-align: center;
  margin-bottom: 30px;
}

.card-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.payment-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #00ffff;
  color: #000;
}

.btn-primary:hover:not(:disabled) {
  background: #00cccc;
}

.btn-primary:disabled {
  background: rgba(0, 255, 255, 0.5);
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.payment-security {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-top: 20px;
}

.payment-security p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.security-badges {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.badge {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.payment-error {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 6px;
  padding: 15px;
  margin-top: 20px;
  text-align: center;
}

.payment-error p {
  color: #ff6b6b;
  margin: 0;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .payment-actions {
    flex-direction: column;
  }
}
</style>