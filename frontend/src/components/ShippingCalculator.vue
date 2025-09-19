<template>
  <div class="shipping-calculator">
    <div class="calculator-header">
      <h3>Shipping Calculator</h3>
      <button @click="toggleCalculator" class="btn btn-secondary btn-sm">
        {{ showCalculator ? 'Hide' : 'Show' }} Calculator
      </button>
    </div>

    <div v-if="showCalculator" class="calculator-content">
      <!-- Origin Address (Fixed) -->
      <div class="address-section">
        <h4>From (Our Warehouse)</h4>
        <div class="address-display">
          <div class="address-line">Neovolt Electronics</div>
          <div class="address-line">123 Industrial Street</div>
          <div class="address-line">Frankfurt, 60311</div>
          <div class="address-line">Germany</div>
        </div>
      </div>

      <!-- Quick Shipping Options -->
      <div v-if="!cartStore.hasShipping" class="quick-shipping-section">
        <h4>Quick Shipping Options</h4>
        <p class="quick-shipping-note">Select a common destination for instant shipping calculation:</p>
        <div class="quick-options">
          <button 
            v-for="option in quickShippingOptions" 
            :key="option.country"
            @click="selectQuickOption(option)"
            class="quick-option-btn"
          >
            {{ option.name }} - {{ option.deliveryTime }}
          </button>
        </div>
        <div class="divider-text">OR</div>
      </div>

      <!-- Destination Address -->
      <div class="address-section">
        <h4>To (Your Address)</h4>
        <form @submit.prevent="calculateShipping" class="shipping-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Country *</label>
              <select v-model="destination.country" class="form-input" required>
                <option value="">Select Country</option>
                <option value="DE">Germany</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="FR">France</option>
                <option value="GB">United Kingdom</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="ZA">South Africa</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Postal Code *</label>
              <input 
                v-model="destination.postalCode" 
                type="text" 
                class="form-input" 
                required 
                placeholder="e.g., 10001"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">City *</label>
            <input 
              v-model="destination.city" 
              type="text" 
              class="form-input" 
              required 
              placeholder="e.g., New York"
            />
          </div>

          <!-- Package Details -->
          <div class="package-section">
            <h4>Package Details</h4>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Weight (kg) *</label>
                <input 
                  v-model="packageDetails.weight" 
                  type="number" 
                  class="form-input" 
                  required 
                  min="0.1"
                  step="0.1"
                  placeholder="0.5"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Service Type</label>
                <select v-model="packageDetails.serviceType" class="form-input">
                  <option value="standard">Standard (5-7 days)</option>
                  <option value="express">Express (2-3 days)</option>
                  <option value="overnight">Overnight (1 day)</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Length (cm)</label>
                <input 
                  v-model="packageDetails.dimensions.length" 
                  type="number" 
                  class="form-input" 
                  min="1"
                  placeholder="30"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Width (cm)</label>
                <input 
                  v-model="packageDetails.dimensions.width" 
                  type="number" 
                  class="form-input" 
                  min="1"
                  placeholder="20"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Height (cm)</label>
                <input 
                  v-model="packageDetails.dimensions.height" 
                  type="number" 
                  class="form-input" 
                  min="1"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          <!-- Calculate Button -->
          <button 
            type="submit" 
            :disabled="calculating || !isFormValid"
            class="btn btn-primary btn-lg w-100"
          >
            {{ calculating ? 'Calculating...' : 'Calculate Shipping' }}
          </button>
        </form>
      </div>

      <!-- Shipping Options Results -->
      <div v-if="shippingOptions.length > 0" class="shipping-results">
        <h4>Available Shipping Options</h4>
        <div class="shipping-options">
          <div 
            v-for="option in shippingOptions" 
            :key="option.id"
            class="shipping-option"
            :class="{ selected: selectedOption?.id === option.id }"
            @click="selectOption(option)"
          >
            <div class="option-header">
              <div class="option-name">{{ option.name }}</div>
              <div class="option-price">{{ formatCurrency(option.price) }}</div>
            </div>
            <div class="option-details">
              <div class="delivery-time">
                <span class="label">Delivery:</span>
                <span class="value">{{ option.deliveryTime }}</span>
              </div>
              <div class="tracking-info">
                <span class="label">Tracking:</span>
                <span class="value">{{ option.tracking ? 'Yes' : 'No' }}</span>
              </div>
              <div class="insurance-info">
                <span class="label">Insurance:</span>
                <span class="value">{{ option.insurance ? 'Included' : 'Not included' }}</span>
              </div>
            </div>
            <div v-if="option.specialNotes" class="special-notes">
              {{ option.specialNotes }}
            </div>
          </div>
        </div>

        <div v-if="selectedOption" class="selected-option-actions">
          <button @click="applyShipping" class="btn btn-primary">
            Use This Shipping Option
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <h4>Unable to Calculate Shipping</h4>
          <p>{{ error }}</p>
          <button @click="retryCalculation" class="btn btn-secondary">
            Try Again
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="calculating" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Calculating shipping options...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'
import { useCartStore } from '../stores/cart'

export default {
  name: 'ShippingCalculator',
  emits: ['shipping-selected'],
  setup(props, { emit }) {
    const cartStore = useCartStore()
    const showCalculator = ref(true)
    const calculating = ref(false)
    const error = ref('')
    const shippingOptions = ref([])
    const selectedOption = ref(null)

    // Form data
    const destination = ref({
      country: '',
      postalCode: '',
      city: ''
    })

    const packageDetails = ref({
      weight: 1,
      serviceType: 'standard',
      dimensions: {
        length: 30,
        width: 20,
        height: 10
      }
    })

    // Quick shipping options for common destinations
    const quickShippingOptions = ref([
      {
        country: 'DE',
        name: 'Germany',
        deliveryTime: '2-3 days',
        standard: 5.99,
        express: 12.99,
        overnight: 24.99
      },
      {
        country: 'NL',
        name: 'Netherlands',
        deliveryTime: '3-4 days',
        standard: 8.99,
        express: 15.99,
        overnight: 29.99
      },
      {
        country: 'BE',
        name: 'Belgium',
        deliveryTime: '3-4 days',
        standard: 8.99,
        express: 15.99,
        overnight: 29.99
      },
      {
        country: 'FR',
        name: 'France',
        deliveryTime: '4-5 days',
        standard: 9.99,
        express: 17.99,
        overnight: 32.99
      },
      {
        country: 'GB',
        name: 'United Kingdom',
        deliveryTime: '5-7 days',
        standard: 14.99,
        express: 24.99,
        overnight: 39.99
      },
      {
        country: 'US',
        name: 'United States',
        deliveryTime: '7-10 days',
        standard: 24.99,
        express: 39.99,
        overnight: 59.99
      }
    ])

    // Computed properties
    const isFormValid = computed(() => {
      return destination.value.country && 
             destination.value.postalCode && 
             destination.value.city &&
             packageDetails.value.weight > 0
    })

    // Methods
    const toggleCalculator = () => {
      showCalculator.value = !showCalculator.value
    }

    const calculateShipping = async () => {
      if (!isFormValid.value) return

      calculating.value = true
      error.value = ''
      shippingOptions.value = []

      try {
        // First try the detailed calculation
        const response = await axios.post('/api/shipping/calculate', {
          destination: destination.value,
          packageDetails: packageDetails.value
        })

        shippingOptions.value = response.data.options || []
        
        if (shippingOptions.value.length === 0) {
          error.value = 'No shipping options available for this destination'
        }
      } catch (err) {
        console.error('Detailed shipping calculation error:', err)
        
        // Fallback to simple cart-based calculation
        try {
          const fallbackResponse = await axios.post('/api/shipping/cart-cost', {
            items: [], // Empty items array for basic calculation
            destination: destination.value
          })
          
          const costs = fallbackResponse.data.cost
          shippingOptions.value = [
            {
              id: 'standard',
              name: 'Standard Delivery',
              price: costs.standard,
              deliveryTime: '5-7 business days',
              tracking: true,
              insurance: true,
              specialNotes: 'Most economical option'
            },
            {
              id: 'express',
              name: 'Express Delivery',
              price: costs.express,
              deliveryTime: '2-3 business days',
              tracking: true,
              insurance: true,
              specialNotes: 'Faster delivery for urgent orders'
            },
            {
              id: 'overnight',
              name: 'Overnight Delivery',
              price: costs.overnight,
              deliveryTime: '1 business day',
              tracking: true,
              insurance: true,
              specialNotes: 'Next business day delivery'
            }
          ]
        } catch (fallbackErr) {
          console.error('Fallback shipping calculation error:', fallbackErr)
          error.value = err.response?.data?.message || 'Failed to calculate shipping rates'
        }
      } finally {
        calculating.value = false
      }
    }

    const selectOption = (option) => {
      selectedOption.value = option
    }

    const applyShipping = () => {
      if (selectedOption.value) {
        // Save destination for future use
        localStorage.setItem('shippingDestination', JSON.stringify(destination.value))
        emit('shipping-selected', selectedOption.value)
      }
    }

    const retryCalculation = () => {
      error.value = ''
      calculateShipping()
    }

    const selectQuickOption = (option) => {
      // Set destination
      destination.value.country = option.country
      destination.value.postalCode = '00000' // Placeholder
      destination.value.city = option.name
      
      // Create shipping options from quick option
      shippingOptions.value = [
        {
          id: 'standard',
          name: 'Standard Delivery',
          price: option.standard,
          deliveryTime: option.deliveryTime,
          tracking: true,
          insurance: true,
          specialNotes: 'Most economical option'
        },
        {
          id: 'express',
          name: 'Express Delivery',
          price: option.express,
          deliveryTime: '1-2 business days',
          tracking: true,
          insurance: true,
          specialNotes: 'Faster delivery for urgent orders'
        },
        {
          id: 'overnight',
          name: 'Overnight Delivery',
          price: option.overnight,
          deliveryTime: '1 business day',
          tracking: true,
          insurance: true,
          specialNotes: 'Next business day delivery'
        }
      ]
    }

    // Load saved destination from localStorage and auto-calculate if possible
    onMounted(() => {
      const savedDestination = localStorage.getItem('shippingDestination')
      if (savedDestination) {
        try {
          const data = JSON.parse(savedDestination)
          destination.value = { ...destination.value, ...data }
          // Auto-calculate if we have all required fields
          if (destination.value.country && destination.value.postalCode && destination.value.city) {
            calculateShipping()
          }
        } catch (error) {
          console.error('Failed to load saved destination:', error)
        }
      }
    })

    return {
      cartStore,
      showCalculator,
      calculating,
      error,
      shippingOptions,
      selectedOption,
      destination,
      packageDetails,
      quickShippingOptions,
      isFormValid,
      toggleCalculator,
      calculateShipping,
      selectOption,
      applyShipping,
      retryCalculation,
      selectQuickOption,
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
  padding: 20px;
  margin-bottom: 30px;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calculator-header h3 {
  color: #00ffff;
  margin: 0;
  font-size: 1.3rem;
}

.calculator-content {
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  padding-top: 20px;
}

.quick-shipping-section {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.quick-shipping-section h4 {
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.quick-shipping-note {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.quick-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.quick-option-btn {
  padding: 12px 16px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-option-btn:hover {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.divider-text {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  margin: 15px 0;
  background: rgba(26, 26, 46, 0.8);
  padding: 0 15px;
  z-index: 2;
}

.divider-text::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 255, 255, 0.3);
  z-index: 1;
}

.address-section {
  margin-bottom: 30px;
}

.address-section h4 {
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.address-display {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.address-line {
  margin-bottom: 5px;
}

.address-line:last-child {
  margin-bottom: 0;
}

.shipping-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-label {
  color: #00ffff;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.package-section {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
}

.package-section h4 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 1.1rem;
}

.w-100 {
  width: 100%;
}

.shipping-results {
  margin-top: 30px;
}

.shipping-results h4 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.shipping-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.shipping-option {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shipping-option:hover {
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.shipping-option.selected {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.option-name {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
}

.option-price {
  color: #00ffff;
  font-weight: 700;
  font-size: 1.3rem;
}

.option-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 10px;
}

.delivery-time, .tracking-info, .insurance-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-transform: uppercase;
}

.value {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.special-notes {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-style: italic;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.selected-option-actions {
  text-align: center;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.error-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.error-content h4 {
  color: #ff6b6b;
  margin: 0 0 10px 0;
  font-size: 1.1rem;
}

.error-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 15px 0;
}

.loading-state {
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

.loading-state p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .option-details {
    grid-template-columns: 1fr;
  }
  
  .error-message {
    flex-direction: column;
    text-align: center;
  }
}
</style>