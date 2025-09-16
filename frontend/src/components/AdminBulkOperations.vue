<template>
  <div class="admin-bulk-operations">
    <div class="bulk-header">
      <div class="selection-info">
        <span class="selected-count">{{ selectedItems.length }} selected</span>
        <button 
          v-if="selectedItems.length > 0"
          @click="clearSelection"
          class="btn btn-secondary btn-sm"
        >
          Clear Selection
        </button>
      </div>
      
      <div class="bulk-actions">
        <button 
          v-if="selectedItems.length > 0"
          @click="showBulkMenu = !showBulkMenu"
          class="btn btn-primary"
        >
          Bulk Actions ({{ selectedItems.length }})
        </button>
      </div>
    </div>

    <!-- Bulk Actions Menu -->
    <div v-if="showBulkMenu && selectedItems.length > 0" class="bulk-menu">
      <div class="menu-header">
        <h4>Bulk Actions</h4>
        <button @click="showBulkMenu = false" class="close-btn">×</button>
      </div>

      <div class="menu-content">
        <!-- Product Actions -->
        <div v-if="type === 'products'" class="action-group">
          <h5>Product Actions</h5>
          <div class="action-buttons">
            <button @click="bulkUpdateStatus('active')" class="action-btn">
              <span class="action-icon">✅</span>
              Activate Products
            </button>
            <button @click="bulkUpdateStatus('inactive')" class="action-btn">
              <span class="action-icon">❌</span>
              Deactivate Products
            </button>
            <button @click="bulkUpdateCategory" class="action-btn">
              <span class="action-icon">📁</span>
              Change Category
            </button>
            <button @click="bulkUpdatePrice" class="action-btn">
              <span class="action-icon">💰</span>
              Update Prices
            </button>
            <button @click="bulkUpdateStock" class="action-btn">
              <span class="action-icon">📦</span>
              Update Stock
            </button>
            <button @click="bulkDelete" class="action-btn danger">
              <span class="action-icon">🗑️</span>
              Delete Products
            </button>
          </div>
        </div>

        <!-- Order Actions -->
        <div v-if="type === 'orders'" class="action-group">
          <h5>Order Actions</h5>
          <div class="action-buttons">
            <button @click="bulkUpdateOrderStatus('processing')" class="action-btn">
              <span class="action-icon">⚙️</span>
              Mark as Processing
            </button>
            <button @click="bulkUpdateOrderStatus('shipped')" class="action-btn">
              <span class="action-icon">🚚</span>
              Mark as Shipped
            </button>
            <button @click="bulkUpdateOrderStatus('delivered')" class="action-btn">
              <span class="action-icon">✅</span>
              Mark as Delivered
            </button>
            <button @click="bulkUpdateOrderStatus('cancelled')" class="action-btn danger">
              <span class="action-icon">❌</span>
              Cancel Orders
            </button>
            <button @click="bulkExportOrders" class="action-btn">
              <span class="action-icon">📊</span>
              Export Orders
            </button>
          </div>
        </div>

        <!-- User Actions -->
        <div v-if="type === 'users'" class="action-group">
          <h5>User Actions</h5>
          <div class="action-buttons">
            <button @click="bulkUpdateUserRole('user')" class="action-btn">
              <span class="action-icon">👤</span>
              Set as Regular User
            </button>
            <button @click="bulkUpdateUserRole('admin')" class="action-btn">
              <span class="action-icon">👑</span>
              Set as Admin
            </button>
            <button @click="bulkActivateUsers" class="action-btn">
              <span class="action-icon">✅</span>
              Activate Users
            </button>
            <button @click="bulkDeactivateUsers" class="action-btn">
              <span class="action-icon">❌</span>
              Deactivate Users
            </button>
            <button @click="bulkExportUsers" class="action-btn">
              <span class="action-icon">📊</span>
              Export Users
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Update Modals -->
    <!-- Category Update Modal -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Update Category</h3>
          <button @click="closeModals" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Select New Category</label>
            <select v-model="bulkUpdateData.categoryId" class="form-input">
              <option value="">Select Category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="affected-items">
            <h4>Affected Items ({{ selectedItems.length }})</h4>
            <div class="items-list">
              <div v-for="item in selectedItems.slice(0, 5)" :key="item.id" class="item-preview">
                {{ item.name || item.email || `Order #${item.order_number}` }}
              </div>
              <div v-if="selectedItems.length > 5" class="more-items">
                ... and {{ selectedItems.length - 5 }} more
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn btn-secondary">Cancel</button>
          <button @click="confirmBulkUpdate('category')" class="btn btn-primary">
            Update {{ selectedItems.length }} Items
          </button>
        </div>
      </div>
    </div>

    <!-- Price Update Modal -->
    <div v-if="showPriceModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Update Prices</h3>
          <button @click="closeModals" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Price Update Type</label>
            <select v-model="bulkUpdateData.priceType" class="form-input">
              <option value="set">Set to specific amount</option>
              <option value="increase">Increase by amount/percentage</option>
              <option value="decrease">Decrease by amount/percentage</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Amount</label>
            <input 
              v-model="bulkUpdateData.priceValue" 
              type="number" 
              step="0.01"
              class="form-input" 
              placeholder="Enter amount"
            />
          </div>
          <div v-if="bulkUpdateData.priceType !== 'set'" class="form-group">
            <label class="form-label">Type</label>
            <select v-model="bulkUpdateData.priceUnit" class="form-input">
              <option value="amount">Fixed Amount (€)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn btn-secondary">Cancel</button>
          <button @click="confirmBulkUpdate('price')" class="btn btn-primary">
            Update {{ selectedItems.length }} Items
          </button>
        </div>
      </div>
    </div>

    <!-- Stock Update Modal -->
    <div v-if="showStockModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Update Stock</h3>
          <button @click="closeModals" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Stock Update Type</label>
            <select v-model="bulkUpdateData.stockType" class="form-input">
              <option value="set">Set to specific amount</option>
              <option value="add">Add amount</option>
              <option value="subtract">Subtract amount</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Amount</label>
            <input 
              v-model="bulkUpdateData.stockValue" 
              type="number" 
              class="form-input" 
              placeholder="Enter amount"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn btn-secondary">Cancel</button>
          <button @click="confirmBulkUpdate('stock')" class="btn btn-primary">
            Update {{ selectedItems.length }} Items
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirm Bulk Action</h3>
          <button @click="closeModals" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="confirmation-content">
            <div class="warning-icon">⚠️</div>
            <h4>{{ confirmationData.title }}</h4>
            <p>{{ confirmationData.message }}</p>
            <div class="affected-count">
              This will affect <strong>{{ selectedItems.length }}</strong> items.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModals" class="btn btn-secondary">Cancel</button>
          <button @click="executeBulkAction" class="btn btn-danger">
            {{ confirmationData.actionText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Progress Modal -->
    <div v-if="showProgressModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Processing Bulk Action</h3>
        </div>
        <div class="modal-body">
          <div class="progress-content">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${bulkProgress}%` }"
              ></div>
            </div>
            <div class="progress-text">
              {{ bulkProgress }}% complete ({{ processedItems }}/{{ selectedItems.length }})
            </div>
            <div class="current-action">{{ currentAction }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useNotificationsStore } from '../stores/notifications'

export default {
  name: 'AdminBulkOperations',
  props: {
    selectedItems: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      required: true,
      validator: (value) => ['products', 'orders', 'users'].includes(value)
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['bulk-action-complete', 'selection-cleared'],
  setup(props, { emit }) {
    const notificationsStore = useNotificationsStore()

    // UI State
    const showBulkMenu = ref(false)
    const showCategoryModal = ref(false)
    const showPriceModal = ref(false)
    const showStockModal = ref(false)
    const showConfirmModal = ref(false)
    const showProgressModal = ref(false)

    // Bulk Update Data
    const bulkUpdateData = ref({
      categoryId: '',
      priceType: 'set',
      priceValue: '',
      priceUnit: 'amount',
      stockType: 'set',
      stockValue: ''
    })

    // Confirmation Data
    const confirmationData = ref({
      title: '',
      message: '',
      actionText: '',
      action: null
    })

    // Progress Data
    const bulkProgress = ref(0)
    const processedItems = ref(0)
    const currentAction = ref('')

    // Methods
    const clearSelection = () => {
      emit('selection-cleared')
      showBulkMenu.value = false
    }

    const closeModals = () => {
      showCategoryModal.value = false
      showPriceModal.value = false
      showStockModal.value = false
      showConfirmModal.value = false
      showProgressModal.value = false
    }

    // Product Actions
    const bulkUpdateStatus = (status) => {
      confirmationData.value = {
        title: `${status === 'active' ? 'Activate' : 'Deactivate'} Products`,
        message: `Are you sure you want to ${status === 'active' ? 'activate' : 'deactivate'} the selected products?`,
        actionText: `${status === 'active' ? 'Activate' : 'Deactivate'} Products`,
        action: () => executeBulkUpdate('status', { status })
      }
      showConfirmModal.value = true
    }

    const bulkUpdateCategory = () => {
      showCategoryModal.value = true
    }

    const bulkUpdatePrice = () => {
      showPriceModal.value = true
    }

    const bulkUpdateStock = () => {
      showStockModal.value = true
    }

    const bulkDelete = () => {
      confirmationData.value = {
        title: 'Delete Products',
        message: 'Are you sure you want to permanently delete the selected products? This action cannot be undone.',
        actionText: 'Delete Products',
        action: () => executeBulkUpdate('delete', {})
      }
      showConfirmModal.value = true
    }

    // Order Actions
    const bulkUpdateOrderStatus = (status) => {
      confirmationData.value = {
        title: `Update Order Status`,
        message: `Are you sure you want to mark the selected orders as ${status}?`,
        actionText: `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        action: () => executeBulkUpdate('order_status', { status })
      }
      showConfirmModal.value = true
    }

    const bulkExportOrders = () => {
      executeBulkExport('orders')
    }

    // User Actions
    const bulkUpdateUserRole = (role) => {
      confirmationData.value = {
        title: `Update User Role`,
        message: `Are you sure you want to set the selected users as ${role}s?`,
        actionText: `Set as ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        action: () => executeBulkUpdate('user_role', { role })
      }
      showConfirmModal.value = true
    }

    const bulkActivateUsers = () => {
      confirmationData.value = {
        title: 'Activate Users',
        message: 'Are you sure you want to activate the selected users?',
        actionText: 'Activate Users',
        action: () => executeBulkUpdate('user_status', { status: 'active' })
      }
      showConfirmModal.value = true
    }

    const bulkDeactivateUsers = () => {
      confirmationData.value = {
        title: 'Deactivate Users',
        message: 'Are you sure you want to deactivate the selected users?',
        actionText: 'Deactivate Users',
        action: () => executeBulkUpdate('user_status', { status: 'inactive' })
      }
      showConfirmModal.value = true
    }

    const bulkExportUsers = () => {
      executeBulkExport('users')
    }

    // Confirmation Methods
    const confirmBulkUpdate = (type) => {
      closeModals()
      
      let actionData = {}
      switch (type) {
        case 'category':
          actionData = { category_id: bulkUpdateData.value.categoryId }
          break
        case 'price':
          actionData = {
            price_type: bulkUpdateData.value.priceType,
            price_value: bulkUpdateData.value.priceValue,
            price_unit: bulkUpdateData.value.priceUnit
          }
          break
        case 'stock':
          actionData = {
            stock_type: bulkUpdateData.value.stockType,
            stock_value: bulkUpdateData.value.stockValue
          }
          break
      }

      confirmationData.value = {
        title: `Update ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        message: `Are you sure you want to update the ${type} for the selected items?`,
        actionText: `Update ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        action: () => executeBulkUpdate(type, actionData)
      }
      showConfirmModal.value = true
    }

    const executeBulkAction = () => {
      closeModals()
      if (confirmationData.value.action) {
        confirmationData.value.action()
      }
    }

    // Execute Bulk Update
    const executeBulkUpdate = async (action, data) => {
      showProgressModal.value = true
      bulkProgress.value = 0
      processedItems.value = 0

      try {
        const itemIds = props.selectedItems.map(item => item.id)
        
        const response = await axios.post(`/api/admin/bulk-update/${props.type}`, {
          action,
          item_ids: itemIds,
          data
        })

        // Simulate progress for better UX
        const totalItems = itemIds.length
        for (let i = 0; i < totalItems; i++) {
          await new Promise(resolve => setTimeout(resolve, 100))
          processedItems.value = i + 1
          bulkProgress.value = Math.round(((i + 1) / totalItems) * 100)
          currentAction.value = `Processing item ${i + 1} of ${totalItems}`
        }

        notificationsStore.success('Bulk Update Complete', `Successfully updated ${totalItems} items`)
        emit('bulk-action-complete', { action, count: totalItems })
        
      } catch (error) {
        console.error('Bulk update error:', error)
        notificationsStore.error('Bulk Update Failed', error.response?.data?.message || 'Failed to update items')
      } finally {
        showProgressModal.value = false
        showBulkMenu.value = false
      }
    }

    // Execute Bulk Export
    const executeBulkExport = async (type) => {
      try {
        const itemIds = props.selectedItems.map(item => item.id)
        
        const response = await axios.post(`/api/admin/bulk-export/${type}`, {
          item_ids: itemIds
        }, {
          responseType: 'blob'
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        notificationsStore.success('Export Complete', `Successfully exported ${itemIds.length} items`)
        
      } catch (error) {
        console.error('Bulk export error:', error)
        notificationsStore.error('Export Failed', error.response?.data?.message || 'Failed to export items')
      }
    }

    return {
      showBulkMenu,
      showCategoryModal,
      showPriceModal,
      showStockModal,
      showConfirmModal,
      showProgressModal,
      bulkUpdateData,
      confirmationData,
      bulkProgress,
      processedItems,
      currentAction,
      clearSelection,
      closeModals,
      bulkUpdateStatus,
      bulkUpdateCategory,
      bulkUpdatePrice,
      bulkUpdateStock,
      bulkDelete,
      bulkUpdateOrderStatus,
      bulkExportOrders,
      bulkUpdateUserRole,
      bulkActivateUsers,
      bulkDeactivateUsers,
      bulkExportUsers,
      confirmBulkUpdate,
      executeBulkAction
    }
  }
}
</script>

<style scoped>
.admin-bulk-operations {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.bulk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-count {
  color: #00ffff;
  font-weight: 600;
  font-size: 14px;
}

.bulk-actions {
  display: flex;
  gap: 10px;
}

.bulk-menu {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.menu-header h4 {
  color: #00ffff;
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff6b6b;
}

.action-group {
  margin-bottom: 25px;
}

.action-group:last-child {
  margin-bottom: 0;
}

.action-group h5 {
  color: #ffffff;
  margin: 0 0 15px 0;
  font-size: 1rem;
  font-weight: 600;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  text-align: left;
}

.action-btn:hover {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
}

.action-btn.danger {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.action-btn.danger:hover {
  background: rgba(255, 107, 107, 0.1);
}

.action-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.modal-header h3 {
  color: #00ffff;
  margin: 0;
  font-size: 1.3rem;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  color: #00ffff;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.affected-items {
  margin-top: 20px;
}

.affected-items h4 {
  color: #ffffff;
  margin: 0 0 10px 0;
  font-size: 1rem;
}

.items-list {
  max-height: 150px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 10px;
}

.item-preview {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.item-preview:last-child {
  border-bottom: none;
}

.more-items {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-style: italic;
  padding: 5px 0;
}

.confirmation-content {
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.confirmation-content h4 {
  color: #ff6b6b;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.confirmation-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.affected-count {
  color: #00ffff;
  font-weight: 600;
}

.progress-content {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #00cccc);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #00ffff;
  font-weight: 600;
  margin-bottom: 10px;
}

.current-action {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.btn-danger {
  background: #ff6b6b;
  border: 1px solid #ff6b6b;
  color: #ffffff;
}

.btn-danger:hover {
  background: #ff5252;
  border-color: #ff5252;
}

@media (max-width: 768px) {
  .bulk-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 10px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>