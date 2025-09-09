<template>
  <div class="admin-dashboard">
    <div class="container">
      <h1 class="page-title">Admin Dashboard</h1>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.userCount }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.productCount }}</div>
            <div class="stat-label">Products</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🛒</div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardStats.orderCount }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">${{ dashboardStats.totalRevenue.toFixed(2) }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="dashboard-section">
        <h2>Recent Orders</h2>
        <div class="orders-table">
          <div class="table-header">
            <div>Order #</div>
            <div>Customer</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
          </div>
          <div 
            v-for="order in recentOrders" 
            :key="order.id" 
            class="table-row"
          >
            <div>{{ order.order_number }}</div>
            <div>{{ order.first_name }} {{ order.last_name }}</div>
            <div>${{ order.total_amount }}</div>
            <div class="status-badge" :class="order.status">
              {{ order.status.toUpperCase() }}
            </div>
            <div>{{ formatDate(order.created_at) }}</div>
          </div>
        </div>
      </div>

      <!-- Low Stock Products -->
      <div class="dashboard-section">
        <h2>Low Stock Products</h2>
        <div v-if="lowStockProducts.length === 0" class="no-data">
          <p>All products are well stocked!</p>
        </div>
        <div v-else class="low-stock-list">
          <div 
            v-for="product in lowStockProducts" 
            :key="product.id" 
            class="low-stock-item"
          >
            <div class="product-name">{{ product.name }}</div>
            <div class="stock-quantity">{{ product.stock_quantity }} left</div>
          </div>
        </div>
      </div>

      <!-- Order Status Distribution -->
      <div class="dashboard-section">
        <h2>Order Status Distribution</h2>
        <div class="status-chart">
          <div 
            v-for="status in orderStatusDistribution" 
            :key="status.status" 
            class="status-item"
          >
            <div class="status-name">{{ status.status.toUpperCase() }}</div>
            <div class="status-count">{{ status.count }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AdminDashboard',
  setup() {
    const dashboardStats = ref({
      userCount: 0,
      productCount: 0,
      orderCount: 0,
      totalRevenue: 0
    })

    const recentOrders = ref([])
    const lowStockProducts = ref([])
    const orderStatusDistribution = ref([])

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const loadDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard')
        const data = response.data

        dashboardStats.value = data.stats
        recentOrders.value = data.recentOrders
        lowStockProducts.value = data.lowStockProducts
        orderStatusDistribution.value = data.orderStatusDistribution
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      dashboardStats,
      recentOrders,
      lowStockProducts,
      orderStatusDistribution,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.stat-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
  margin-bottom: 5px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  font-weight: 500;
}

.dashboard-section {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
}

.dashboard-section h2 {
  color: #00ffff;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.orders-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-weight: 700;
  color: #00ffff;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(0, 255, 255, 0.1);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}

.status-badge.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.status-badge.processing {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid #007bff;
}

.status-badge.shipped {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.status-badge.delivered {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.status-badge.cancelled {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.8);
}

.low-stock-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.low-stock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.product-name {
  color: #ffffff;
  font-weight: 500;
}

.stock-quantity {
  color: #ffc107;
  font-weight: 700;
}

.status-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.status-item {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.status-item:hover {
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.status-name {
  color: #00ffff;
  font-weight: 700;
  margin-bottom: 10px;
}

.status-count {
  font-size: 2rem;
  font-weight: 900;
  color: #ffffff;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .status-chart {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>