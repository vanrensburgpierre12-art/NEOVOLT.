<template>
  <div class="order-tracking">
    <h3>Track Your Order</h3>
    
    <div class="tracking-form">
      <div class="form-group">
        <label>Tracking Number</label>
        <input 
          v-model="trackingNumber" 
          type="text" 
          class="form-input"
          placeholder="Enter tracking number"
          @keyup.enter="trackOrder"
        />
      </div>
      <button 
        @click="trackOrder" 
        :disabled="loading || !trackingNumber"
        class="btn btn-primary"
      >
        {{ loading ? 'Tracking...' : 'Track Order' }}
      </button>
    </div>

    <div v-if="trackingInfo" class="tracking-results">
      <div class="tracking-header">
        <h4>Tracking Information</h4>
        <span class="tracking-number">#{{ trackingNumber }}</span>
      </div>
      
      <div class="status-info">
        <div class="current-status">
          <span class="status-label">Current Status:</span>
          <span class="status-value" :class="getStatusClass(trackingInfo.status)">
            {{ getStatusText(trackingInfo.status) }}
          </span>
        </div>
        
        <div v-if="trackingInfo.last_update" class="last-update">
          <span class="update-label">Last Update:</span>
          <span class="update-value">{{ formatDate(trackingInfo.last_update) }}</span>
        </div>
        
        <div v-if="trackingInfo.location" class="location">
          <span class="location-label">Location:</span>
          <span class="location-value">{{ trackingInfo.location }}</span>
        </div>
        
        <div v-if="trackingInfo.estimated_delivery" class="estimated-delivery">
          <span class="delivery-label">Estimated Delivery:</span>
          <span class="delivery-value">{{ formatDate(trackingInfo.estimated_delivery) }}</span>
        </div>
      </div>

      <div v-if="trackingInfo.timeline && trackingInfo.timeline.length > 0" class="timeline">
        <h5>Tracking Timeline</h5>
        <div class="timeline-items">
          <div 
            v-for="(event, index) in trackingInfo.timeline" 
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-title">{{ event.title }}</div>
              <div class="timeline-description">{{ event.description }}</div>
              <div class="timeline-date">{{ formatDate(event.timestamp) }}</div>
            </div>
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

export default {
  name: 'OrderTracking',
  setup() {
    const trackingNumber = ref('')
    const trackingInfo = ref(null)
    const loading = ref(false)
    const error = ref('')

    const trackOrder = async () => {
      if (!trackingNumber.value) {
        error.value = 'Please enter a tracking number'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const response = await axios.get(`/api/shipping/track/${trackingNumber.value}`)
        trackingInfo.value = response.data.tracking
      } catch (err) {
        console.error('Tracking error:', err)
        if (err.response?.status === 404) {
          error.value = 'Tracking number not found. Please check your tracking number.'
        } else {
          error.value = 'Failed to track order. Please try again.'
        }
      } finally {
        loading.value = false
      }
    }

    const getStatusClass = (status) => {
      const statusClasses = {
        'pending': 'status-pending',
        'shipped': 'status-shipped',
        'in_transit': 'status-in-transit',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
      }
      return statusClasses[status] || 'status-unknown'
    }

    const getStatusText = (status) => {
      const statusTexts = {
        'pending': 'Pending',
        'shipped': 'Shipped',
        'in_transit': 'In Transit',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
      }
      return statusTexts[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      trackingNumber,
      trackingInfo,
      loading,
      error,
      trackOrder,
      getStatusClass,
      getStatusText,
      formatDate
    }
  }
}
</script>

<style scoped>
.order-tracking {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  margin: 20px 0;
}

.order-tracking h3 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.tracking-form {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  align-items: end;
}

.form-group {
  flex: 1;
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

.tracking-results {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.tracking-header h4 {
  color: #00ffff;
  margin: 0;
}

.tracking-number {
  color: #ffffff;
  font-weight: 500;
  background: rgba(0, 255, 255, 0.1);
  padding: 5px 10px;
  border-radius: 4px;
}

.status-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.status-info > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-label,
.update-label,
.location-label,
.delivery-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.status-value,
.update-value,
.location-value,
.delivery-value {
  color: #ffffff;
  font-weight: 500;
}

.status-pending {
  color: #ffa500;
}

.status-shipped {
  color: #00bfff;
}

.status-in-transit {
  color: #00ffff;
}

.status-delivered {
  color: #00ff00;
}

.status-cancelled {
  color: #ff4444;
}

.timeline {
  margin-top: 20px;
}

.timeline h5 {
  color: #00ffff;
  margin-bottom: 15px;
}

.timeline-items {
  position: relative;
  padding-left: 20px;
}

.timeline-items::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 255, 255, 0.3);
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.timeline-marker {
  position: absolute;
  left: -16px;
  top: 5px;
  width: 12px;
  height: 12px;
  background: #00ffff;
  border-radius: 50%;
  border: 2px solid rgba(26, 26, 46, 1);
}

.timeline-content {
  flex: 1;
}

.timeline-title {
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 5px;
}

.timeline-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.timeline-date {
  color: #00ffff;
  font-size: 0.8rem;
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
  .tracking-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-info {
    grid-template-columns: 1fr;
  }
  
  .tracking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>