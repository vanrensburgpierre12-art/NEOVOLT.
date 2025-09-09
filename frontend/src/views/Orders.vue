<template>
  <div class="orders">
    <div class="container">
      <h1 class="page-title">My Orders</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="loading"></div>
        <p>Loading orders...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <h2>No orders found</h2>
        <p>You haven't placed any orders yet.</p>
        <router-link to="/products" class="btn btn-primary">Browse Products</router-link>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="order-card"
          @click="goToOrder(order.id)"
        >
          <div class="order-header">
            <div class="order-info">
              <h3 class="order-number">Order #{{ order.order_number }}</h3>
              <p class="order-date">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="order-status" :class="order.status">
              {{ order.status.toUpperCase() }}
            </div>
          </div>

          <div class="order-details">
            <div class="order-amount">
              <span class="amount-label">Total:</span>
              <span class="amount-value">${{ order.total_amount }}</span>
            </div>
            <div class="order-items">
              <span class="items-label">{{ order.item_count }} item(s)</span>
            </div>
          </div>

          <div class="order-actions">
            <button 
              @click.stop="goToOrder(order.id)"
              class="btn btn-secondary"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button 
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page }} of {{ pagination.pages }}
        </span>
        <button 
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page === pagination.pages"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'Orders',
  setup() {
    const router = useRouter()

    const orders = ref([])
    const loading = ref(true)
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const goToOrder = (orderId) => {
      router.push(`/orders/${orderId}`)
    }

    const goToPage = (page) => {
      pagination.value.page = page
      loadOrders()
    }

    const loadOrders = async () => {
      try {
        loading.value = true
        const response = await axios.get('/api/orders/my-orders', {
          params: {
            page: pagination.value.page,
            limit: pagination.value.limit
          }
        })
        orders.value = response.data.orders
        pagination.value = response.data.pagination
      } catch (error) {
        console.error('Failed to load orders:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadOrders()
    })

    return {
      orders,
      loading,
      pagination,
      formatDate,
      goToOrder,
      goToPage
    }
  }
}
</script>

<style scoped>
.orders {
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

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-state h2 {
  color: #00ffff;
  margin-bottom: 15px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.order-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
  z-index: 1;
}

.order-card:hover::before {
  left: 100%;
}

.order-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  transform: translateY(-5px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
}

.order-info h3 {
  color: #ffffff;
  font-size: 1.3rem;
  margin-bottom: 5px;
}

.order-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.order-status.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.order-status.processing {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid #007bff;
}

.order-status.shipped {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.order-status.delivered {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.order-status.cancelled {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.order-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
}

.order-amount {
  display: flex;
  align-items: center;
  gap: 10px;
}

.amount-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.amount-value {
  color: #00ffff;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px #00ffff;
}

.order-items {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.order-actions {
  position: relative;
  z-index: 2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .order-details {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>