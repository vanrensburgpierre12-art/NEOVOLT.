<template>
  <div class="admin-orders">
    <div class="container">
      <h1 class="page-title">Order Management</h1>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <select v-model="statusFilter" @change="loadOrders" class="form-input">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="orders-table">
        <div class="table-header">
          <div>Order #</div>
          <div>Customer</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Payment</div>
          <div>Date</div>
          <div>Actions</div>
        </div>
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="table-row"
          @click="viewOrder(order.id)"
        >
          <div class="order-number">{{ order.order_number }}</div>
          <div class="customer-info">
            <div class="customer-name">{{ order.first_name }} {{ order.last_name }}</div>
            <div class="customer-email">{{ order.email }}</div>
          </div>
          <div class="order-amount">${{ order.total_amount }}</div>
          <div class="order-status">
            <select 
              :value="order.status" 
              @change="updateOrderStatus(order.id, $event.target.value)"
              @click.stop
              class="status-select"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="payment-status" :class="order.payment_status">
            {{ order.payment_status || 'N/A' }}
          </div>
          <div class="order-date">{{ formatDate(order.created_at) }}</div>
          <div class="order-actions" @click.stop>
            <button @click="viewOrder(order.id)" class="btn btn-secondary btn-sm">
              View
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

      <!-- Order Details Modal -->
      <div v-if="selectedOrder" class="modal-overlay" @click="closeOrderModal">
        <div class="modal-content" @click.stop>
          <h2>Order Details - {{ selectedOrder.order.orderNumber }}</h2>
          <div class="order-details">
            <div class="order-info">
              <h3>Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Order Number:</span>
                  <span class="info-value">{{ selectedOrder.order.orderNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span>
                  <span class="info-value">{{ selectedOrder.order.status }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Total Amount:</span>
                  <span class="info-value">${{ selectedOrder.order.totalAmount }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Payment Status:</span>
                  <span class="info-value">{{ selectedOrder.order.paymentStatus }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Created:</span>
                  <span class="info-value">{{ formatDate(selectedOrder.order.createdAt) }}</span>
                </div>
              </div>
            </div>

            <div class="customer-info">
              <h3>Customer Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">{{ selectedOrder.order.customer.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ selectedOrder.order.customer.email }}</span>
                </div>
              </div>
            </div>

            <div class="shipping-info">
              <h3>Shipping Address</h3>
              <div class="address">
                {{ selectedOrder.order.shippingAddress.address }}<br>
                {{ selectedOrder.order.shippingAddress.city }}, {{ selectedOrder.order.shippingAddress.postalCode }}<br>
                {{ selectedOrder.order.shippingAddress.country }}
              </div>
            </div>

            <div class="order-items">
              <h3>Order Items</h3>
              <div class="items-list">
                <div 
                  v-for="item in selectedOrder.items" 
                  :key="item.id" 
                  class="item-row"
                >
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-quantity">Qty: {{ item.quantity }}</div>
                  <div class="item-price">${{ item.price }}</div>
                  <div class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
          <button @click="closeOrderModal" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AdminOrders',
  setup() {
    const orders = ref([])
    const selectedOrder = ref(null)
    const statusFilter = ref('')
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadOrders = async () => {
      try {
        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit
        }
        if (statusFilter.value) {
          params.status = statusFilter.value
        }

        const response = await axios.get('/api/orders/admin/all', { params })
        orders.value = response.data.orders
        pagination.value = response.data.pagination
      } catch (error) {
        console.error('Failed to load orders:', error)
      }
    }

    const goToPage = (page) => {
      pagination.value.page = page
      loadOrders()
    }

    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        await axios.put(`/api/orders/${orderId}/status`, { status: newStatus })
        await loadOrders()
      } catch (error) {
        console.error('Failed to update order status:', error)
        alert('Failed to update order status')
      }
    }

    const viewOrder = async (orderId) => {
      try {
        const response = await axios.get(`/api/orders/${orderId}`)
        selectedOrder.value = response.data
      } catch (error) {
        console.error('Failed to load order details:', error)
        alert('Failed to load order details')
      }
    }

    const closeOrderModal = () => {
      selectedOrder.value = null
    }

    onMounted(() => {
      loadOrders()
    })

    return {
      orders,
      selectedOrder,
      statusFilter,
      pagination,
      formatDate,
      loadOrders,
      goToPage,
      updateOrderStatus,
      viewOrder,
      closeOrderModal
    }
  }
}
</script>

<style scoped>
.admin-orders {
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

.filters {
  margin-bottom: 30px;
}

.filter-group {
  max-width: 200px;
}

.orders-table {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
}

.table-header {
  display: grid;
  grid-template-columns: 150px 200px 100px 150px 100px 150px 100px;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #00ffff;
}

.table-row {
  display: grid;
  grid-template-columns: 150px 200px 100px 150px 100px 150px 100px;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.table-row:hover {
  background: rgba(0, 255, 255, 0.05);
}

.order-number {
  color: #00ffff;
  font-weight: 700;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  color: #ffffff;
  font-weight: 500;
}

.customer-email {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.order-amount {
  color: #00ffff;
  font-weight: 700;
}

.status-select {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  padding: 4px 8px;
  font-size: 0.9rem;
}

.payment-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.payment-status.completed {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.order-date {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.9rem;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #00ffff;
  margin-bottom: 30px;
  font-size: 2rem;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.order-details h3 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.info-value {
  color: #ffffff;
  font-weight: 500;
}

.address {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  align-items: center;
}

.item-name {
  color: #ffffff;
  font-weight: 500;
}

.item-quantity {
  color: rgba(255, 255, 255, 0.8);
}

.item-price {
  color: #00ffff;
  font-weight: 700;
}

.item-total {
  color: #00ffff;
  font-weight: 700;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .item-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>