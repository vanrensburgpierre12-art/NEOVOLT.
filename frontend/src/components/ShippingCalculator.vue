<template>
  <div class="shipping-calculator">
    <h3>Shipping Calculator</h3>
    <div class="calculator-form">
      <div class="form-row">
        <div class="form-group">
          <label>Weight (kg)</label>
          <input 
            v-model="weight" 
            type="number" 
            step="0.1" 
            min="0.1" 
            class="form-input"
            placeholder="Enter package weight"
          />
        </div>
        <div class="form-group">
          <label>Service Type</label>
          <select v-model="serviceType" class="form-input">
            <option value="standard">Standard</option>
            <option value="express">Express</option>
            <option value="overnight">Overnight</option>
          </select>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>From City</label>
          <input 
            v-model="origin" 
            type="text" 
            class="form-input"
            placeholder="e.g., Cape Town"
          />
        </div>
        <div class="form-group">
          <label>To City</label>
          <input 
            v-model="destination" 
            type="text" 
            class="form-input"
            placeholder="e.g., Johannesburg"
          />
        </div>
      </div>

      <button 
        @click="calculateShipping" 
        :disabled="loading || !weight || !origin || !destination"
        class="btn btn-secondary"
      >
        {{ loading ? 'Calculating...' : 'Calculate Shipping' }}
      </button>
    </div>

    <div v-if="rates.length > 0" class="shipping-rates">
      <h4>Available Shipping Options</h4>
      <div class="rates-list">
        <div 
          v-for="rate in rates" 
          :key="rate.service" 
          class="rate-item"
        >
          <div class="rate-info">
            <h5>{{ rate.service }}</h5>
            <p>{{ rate.description }}</p>
            <span class="delivery-time">{{ rate.estimated_delivery }}</span>
          </div>
          <div class="rate-price">
            {{ formatCurrency(rate.price) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'ShippingCalculator',
  setup() {
    const weight = ref(1.0)
    const serviceType = ref('standard')
    const origin = ref('Cape Town')
    const destination = ref('')
    const rates = ref([])
    const loading = ref(false)
    const error = ref('')

    const calculateShipping = async () => {
      if (!weight.value || !origin.value || !destination.value) {
        error.value = 'Please fill in all required fields'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const response = await axios.post('/api/shipping/rates', {
          origin: {
            city: origin.value,
            country: 'ZA'
          },
          destination: {
            city: destination.value,
            country: 'ZA'
          },
          weight: parseFloat(weight.value),
          dimensions: {
            length: 30,
            width: 20,
            height: 10
          }
        })

        rates.value = response.data.rates || []
      } catch (err) {
        console.error('Shipping calculation error:', err)
        error.value = 'Failed to calculate shipping rates. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      weight,
      serviceType,
      origin,
      destination,
      rates,
      loading,
      error,
      calculateShipping,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.shipping-calculator {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  margin: 20px 0;
}

.shipping-calculator h3 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.calculator-form {
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #00ffff;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
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

.shipping-rates {
  margin-top: 20px;
}

.shipping-rates h4 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.rates-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.rate-item:hover {
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.rate-info h5 {
  color: #ffffff;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.rate-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.delivery-time {
  color: #00ffff;
  font-size: 0.8rem;
  font-weight: 500;
}

.rate-price {
  color: #00ffff;
  font-size: 1.2rem;
  font-weight: 700;
}

.error-message {
  color: #fa755a;
  background: rgba(250, 117, 90, 0.1);
  border: 1px solid rgba(250, 117, 90, 0.3);
  border-radius: 4px;
  padding: 10px;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .rate-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>