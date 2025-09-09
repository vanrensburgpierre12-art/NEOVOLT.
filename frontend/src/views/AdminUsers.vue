<template>
  <div class="admin-users">
    <div class="container">
      <h1 class="page-title">User Management</h1>

      <!-- Search -->
      <div class="search-section">
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            @input="searchUsers"
            type="text" 
            placeholder="Search users by name or email..."
            class="form-input"
          />
        </div>
      </div>

      <!-- Users Table -->
      <div class="users-table">
        <div class="table-header">
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Role</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>
        <div 
          v-for="user in users" 
          :key="user.id" 
          class="table-row"
          @click="viewUser(user.id)"
        >
          <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
          <div class="user-email">{{ user.email }}</div>
          <div class="user-phone">{{ user.phone || 'N/A' }}</div>
          <div class="user-role" :class="user.role">
            {{ user.role.toUpperCase() }}
          </div>
          <div class="user-joined">{{ formatDate(user.created_at) }}</div>
          <div class="user-actions" @click.stop>
            <button @click="viewUser(user.id)" class="btn btn-secondary btn-sm">
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

      <!-- User Details Modal -->
      <div v-if="selectedUser" class="modal-overlay" @click="closeUserModal">
        <div class="modal-content" @click.stop>
          <h2>User Details - {{ selectedUser.user.first_name }} {{ selectedUser.user.last_name }}</h2>
          <div class="user-details">
            <div class="user-info">
              <h3>Personal Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name:</span>
                  <span class="info-value">{{ selectedUser.user.first_name }} {{ selectedUser.user.last_name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ selectedUser.user.email }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">{{ selectedUser.user.phone || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Role:</span>
                  <span class="info-value">{{ selectedUser.user.role.toUpperCase() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Joined:</span>
                  <span class="info-value">{{ formatDate(selectedUser.user.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="user-orders">
              <h3>Recent Orders</h3>
              <div v-if="selectedUser.recentOrders.length === 0" class="no-orders">
                <p>No orders found</p>
              </div>
              <div v-else class="orders-list">
                <div 
                  v-for="order in selectedUser.recentOrders" 
                  :key="order.id" 
                  class="order-item"
                >
                  <div class="order-info">
                    <div class="order-number">{{ order.order_number }}</div>
                    <div class="order-date">{{ formatDate(order.created_at) }}</div>
                  </div>
                  <div class="order-details">
                    <div class="order-amount">${{ order.total_amount }}</div>
                    <div class="order-status" :class="order.status">
                      {{ order.status.toUpperCase() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button @click="closeUserModal" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AdminUsers',
  setup() {
    const users = ref([])
    const selectedUser = ref(null)
    const searchQuery = ref('')
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
        day: 'numeric'
      })
    }

    const loadUsers = async () => {
      try {
        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit
        }
        if (searchQuery.value) {
          params.search = searchQuery.value
        }

        const response = await axios.get('/api/admin/users', { params })
        users.value = response.data.users
        pagination.value = response.data.pagination
      } catch (error) {
        console.error('Failed to load users:', error)
      }
    }

    const searchUsers = () => {
      pagination.value.page = 1
      loadUsers()
    }

    const goToPage = (page) => {
      pagination.value.page = page
      loadUsers()
    }

    const viewUser = async (userId) => {
      try {
        const response = await axios.get(`/api/admin/users/${userId}`)
        selectedUser.value = response.data
      } catch (error) {
        console.error('Failed to load user details:', error)
        alert('Failed to load user details')
      }
    }

    const closeUserModal = () => {
      selectedUser.value = null
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      selectedUser,
      searchQuery,
      pagination,
      formatDate,
      loadUsers,
      searchUsers,
      goToPage,
      viewUser,
      closeUserModal
    }
  }
}
</script>

<style scoped>
.admin-users {
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

.search-section {
  margin-bottom: 30px;
}

.search-group {
  max-width: 400px;
}

.users-table {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
}

.table-header {
  display: grid;
  grid-template-columns: 200px 250px 150px 100px 150px 100px;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #00ffff;
}

.table-row {
  display: grid;
  grid-template-columns: 200px 250px 150px 100px 150px 100px;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.table-row:hover {
  background: rgba(0, 255, 255, 0.05);
}

.user-name {
  color: #ffffff;
  font-weight: 500;
}

.user-email {
  color: rgba(255, 255, 255, 0.8);
}

.user-phone {
  color: rgba(255, 255, 255, 0.8);
}

.user-role {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid #007bff;
}

.user-role.admin {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.user-joined {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.user-actions {
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

.user-details {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.user-details h3 {
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

.no-orders {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.8);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.order-item:hover {
  background: rgba(0, 255, 255, 0.05);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  color: #00ffff;
  font-weight: 700;
}

.order-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.order-details {
  display: flex;
  align-items: center;
  gap: 15px;
}

.order-amount {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.1rem;
}

.order-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
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

@media (max-width: 768px) {
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .order-item {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .order-details {
    width: 100%;
    justify-content: space-between;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>