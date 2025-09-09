<template>
  <div class="admin-users">
    <div class="container">
      <div class="admin-header">
        <h1 class="page-title">User Management</h1>
        <div class="header-actions">
          <button @click="showBulkActions = !showBulkActions" class="btn btn-secondary">
            Bulk Actions
          </button>
          <button @click="showAddUser = true" class="btn btn-primary">
            Add New User
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            @input="searchUsers"
            type="text" 
            placeholder="Search users by name or email..."
            class="form-input"
          />
        </div>
        <div class="filter-group">
          <select v-model="roleFilter" @change="filterUsers" class="form-input">
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="statusFilter" @change="filterUsers" class="form-input">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Bulk Actions Panel -->
      <div v-if="showBulkActions" class="bulk-actions-panel">
        <div class="bulk-actions-content">
          <span class="selected-count">{{ selectedUsers.length }} users selected</span>
          <div class="bulk-buttons">
            <button @click="bulkActivate" class="btn btn-success btn-sm" :disabled="selectedUsers.length === 0">
              Activate
            </button>
            <button @click="bulkDeactivate" class="btn btn-warning btn-sm" :disabled="selectedUsers.length === 0">
              Deactivate
            </button>
            <button @click="bulkDelete" class="btn btn-danger btn-sm" :disabled="selectedUsers.length === 0">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="users-table">
        <div class="table-header">
          <div>
            <input 
              type="checkbox" 
              @change="toggleAllSelection" 
              :checked="allSelected"
              class="bulk-checkbox"
            />
          </div>
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
        >
          <div @click.stop>
            <input 
              type="checkbox" 
              :value="user.id"
              v-model="selectedUsers"
              class="bulk-checkbox"
            />
          </div>
          <div class="user-name" @click="viewUser(user.id)">{{ user.first_name }} {{ user.last_name }}</div>
          <div class="user-email" @click="viewUser(user.id)">{{ user.email }}</div>
          <div class="user-phone" @click="viewUser(user.id)">{{ user.phone || 'N/A' }}</div>
          <div class="user-role" :class="user.role" @click="viewUser(user.id)">
            {{ user.role.toUpperCase() }}
          </div>
          <div class="user-joined" @click="viewUser(user.id)">{{ formatDate(user.created_at) }}</div>
          <div class="user-actions" @click.stop>
            <button @click="viewUser(user.id)" class="btn btn-secondary btn-sm">
              View
            </button>
            <button @click="editUser(user)" class="btn btn-warning btn-sm">
              Edit
            </button>
            <button @click="toggleUserStatus(user)" class="btn btn-info btn-sm">
              {{ user.is_active ? 'Deactivate' : 'Activate' }}
            </button>
            <button @click="deleteUser(user.id)" class="btn btn-danger btn-sm">
              Delete
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

      <!-- Add/Edit User Modal -->
      <div v-if="showAddUser || editingUser" class="modal-overlay" @click="closeUserFormModal">
        <div class="modal-content" @click.stop>
          <h2>{{ editingUser ? 'Edit User' : 'Add New User' }}</h2>
          <form @submit.prevent="saveUser" class="user-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input 
                  v-model="userForm.firstName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input 
                  v-model="userForm.lastName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email *</label>
              <input 
                v-model="userForm.email" 
                type="email" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input 
                  v-model="userForm.phone" 
                  type="tel" 
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Role *</label>
                <select v-model="userForm.role" class="form-input" required>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div v-if="!editingUser" class="form-group">
              <label class="form-label">Password *</label>
              <input 
                v-model="userForm.password" 
                type="password" 
                class="form-input" 
                :required="!editingUser"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="userForm.isActive" class="form-input">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeUserFormModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="saving" class="btn btn-primary">
                {{ saving ? 'Saving...' : 'Save User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
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
    const showBulkActions = ref(false)
    const selectedUsers = ref([])
    const showAddUser = ref(false)
    const editingUser = ref(null)
    const saving = ref(false)
    const roleFilter = ref('')
    const statusFilter = ref('')
    const allUsers = ref([])

    const userForm = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      isActive: true
    })

    const allSelected = computed(() => {
      return users.value.length > 0 && selectedUsers.value.length === users.value.length
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
        allUsers.value = response.data.users
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

    const filterUsers = () => {
      let filtered = [...allUsers.value]

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(user => 
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      }

      if (roleFilter.value) {
        filtered = filtered.filter(user => user.role === roleFilter.value)
      }

      if (statusFilter.value) {
        const isActive = statusFilter.value === 'active'
        filtered = filtered.filter(user => user.is_active === isActive)
      }

      users.value = filtered
    }

    const toggleAllSelection = () => {
      if (allSelected.value) {
        selectedUsers.value = []
      } else {
        selectedUsers.value = users.value.map(u => u.id)
      }
    }

    const editUser = (user) => {
      editingUser.value = user
      userForm.value = {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        password: '',
        isActive: user.is_active
      }
    }

    const toggleUserStatus = async (user) => {
      try {
        await axios.put(`/api/admin/users/${user.id}`, {
          is_active: !user.is_active
        })
        await loadUsers()
      } catch (error) {
        console.error('Failed to toggle user status:', error)
        alert('Failed to update user status')
      }
    }

    const deleteUser = async (userId) => {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await axios.delete(`/api/admin/users/${userId}`)
          await loadUsers()
        } catch (error) {
          console.error('Failed to delete user:', error)
          alert('Failed to delete user')
        }
      }
    }

    const saveUser = async () => {
      saving.value = true

      try {
        const userData = {
          first_name: userForm.value.firstName,
          last_name: userForm.value.lastName,
          email: userForm.value.email,
          phone: userForm.value.phone,
          role: userForm.value.role,
          is_active: userForm.value.isActive
        }

        if (userForm.value.password) {
          userData.password = userForm.value.password
        }

        if (editingUser.value) {
          await axios.put(`/api/admin/users/${editingUser.value.id}`, userData)
        } else {
          await axios.post('/api/admin/users', userData)
        }
        
        await loadUsers()
        closeUserFormModal()
      } catch (error) {
        console.error('Failed to save user:', error)
        alert('Failed to save user')
      } finally {
        saving.value = false
      }
    }

    const closeUserFormModal = () => {
      showAddUser.value = false
      editingUser.value = null
      userForm.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        isActive: true
      }
    }

    const bulkActivate = async () => {
      if (selectedUsers.value.length === 0) return
      
      try {
        await Promise.all(
          selectedUsers.value.map(id => 
            axios.put(`/api/admin/users/${id}`, { is_active: true })
          )
        )
        await loadUsers()
        selectedUsers.value = []
        showBulkActions.value = false
      } catch (error) {
        console.error('Failed to activate users:', error)
        alert('Failed to activate users')
      }
    }

    const bulkDeactivate = async () => {
      if (selectedUsers.value.length === 0) return
      
      try {
        await Promise.all(
          selectedUsers.value.map(id => 
            axios.put(`/api/admin/users/${id}`, { is_active: false })
          )
        )
        await loadUsers()
        selectedUsers.value = []
        showBulkActions.value = false
      } catch (error) {
        console.error('Failed to deactivate users:', error)
        alert('Failed to deactivate users')
      }
    }

    const bulkDelete = async () => {
      if (selectedUsers.value.length === 0) return
      
      if (confirm(`Are you sure you want to delete ${selectedUsers.value.length} users?`)) {
        try {
          await Promise.all(
            selectedUsers.value.map(id => 
              axios.delete(`/api/admin/users/${id}`)
            )
          )
          await loadUsers()
          selectedUsers.value = []
          showBulkActions.value = false
        } catch (error) {
          console.error('Failed to delete users:', error)
          alert('Failed to delete users')
        }
      }
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      users,
      selectedUser,
      searchQuery,
      pagination,
      showBulkActions,
      selectedUsers,
      showAddUser,
      editingUser,
      saving,
      roleFilter,
      statusFilter,
      userForm,
      allSelected,
      formatDate,
      loadUsers,
      searchUsers,
      goToPage,
      viewUser,
      closeUserModal,
      filterUsers,
      toggleAllSelection,
      editUser,
      toggleUserStatus,
      deleteUser,
      saveUser,
      closeUserFormModal,
      bulkActivate,
      bulkDeactivate,
      bulkDelete
    }
  }
}
</script>

<style scoped>
.admin-users {
  padding: 40px 0;
  min-height: 80vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.page-title {
  font-size: 3rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin-bottom: 0;
}

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
}

.search-group {
  flex: 1;
  max-width: 300px;
}

.filter-group {
  min-width: 150px;
}

.bulk-actions-panel {
  background: rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(0, 123, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.bulk-actions-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  color: #007bff;
  font-weight: 600;
}

.bulk-buttons {
  display: flex;
  gap: 10px;
}

.bulk-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #00ffff;
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
  grid-template-columns: 50px 200px 250px 150px 100px 150px 200px;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #00ffff;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 200px 250px 150px 100px 150px 200px;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
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
  gap: 5px;
  flex-wrap: wrap;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
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

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
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
  .admin-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .filters-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .bulk-actions-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .user-actions {
    justify-content: center;
  }
}
</style>