<template>
  <div class="admin-products">
    <div class="container">
      <div class="admin-header">
        <h1 class="page-title">Product Management</h1>
        <div class="header-actions">
          <button @click="showAddProduct = true" class="btn btn-primary">
            Add New Product
          </button>
          <button @click="showBulkActions = !showBulkActions" class="btn btn-secondary">
            Bulk Actions
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            @input="searchProducts"
            type="text" 
            placeholder="Search products..."
            class="form-input"
          />
        </div>
        <div class="filter-group">
          <select v-model="categoryFilter" @change="filterProducts" class="form-input">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <select v-model="statusFilter" @change="filterProducts" class="form-input">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Bulk Actions Panel -->
      <div v-if="showBulkActions" class="bulk-actions-panel">
        <div class="bulk-actions-content">
          <span class="selected-count">{{ selectedProducts.length }} products selected</span>
          <div class="bulk-buttons">
            <button @click="bulkActivate" class="btn btn-success btn-sm" :disabled="selectedProducts.length === 0">
              Activate
            </button>
            <button @click="bulkDeactivate" class="btn btn-warning btn-sm" :disabled="selectedProducts.length === 0">
              Deactivate
            </button>
            <button @click="bulkDelete" class="btn btn-danger btn-sm" :disabled="selectedProducts.length === 0">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="products-table">
        <div class="table-header">
          <div>
            <input 
              type="checkbox" 
              @change="toggleAllSelection" 
              :checked="allSelected"
              class="bulk-checkbox"
            />
          </div>
          <div>Image</div>
          <div>Name</div>
          <div>Category</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="table-row"
        >
          <div>
            <input 
              type="checkbox" 
              :value="product.id"
              v-model="selectedProducts"
              class="bulk-checkbox"
            />
          </div>
          <div class="product-image">
            <img 
              :src="product.image_url || '/api/placeholder/50/50'" 
              :alt="product.name"
            />
          </div>
          <div class="product-name">{{ product.name }}</div>
          <div class="product-category">{{ product.category_name }}</div>
          <div class="product-price">{{ formatCurrency(product.price) }}</div>
          <div class="product-stock" :class="{ 'low-stock': product.stock_quantity < 10 }">
            {{ product.stock_quantity }}
          </div>
          <div class="product-status" :class="{ 'active': product.is_active }">
            {{ product.is_active ? 'Active' : 'Inactive' }}
          </div>
          <div class="product-actions">
            <button @click="editProduct(product)" class="btn btn-secondary btn-sm">
              Edit
            </button>
            <button @click="toggleProductStatus(product)" class="btn btn-warning btn-sm">
              {{ product.is_active ? 'Deactivate' : 'Activate' }}
            </button>
            <button @click="deleteProduct(product.id)" class="btn btn-danger btn-sm">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Product Modal -->
      <div v-if="showAddProduct || editingProduct" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
          <form @submit.prevent="saveProduct" class="product-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Product Name *</label>
                <input 
                  v-model="productForm.name" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">Price *</label>
                <input 
                  v-model.number="productForm.price" 
                  type="number" 
                  step="0.01" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea 
                v-model="productForm.description" 
                class="form-input" 
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select v-model="productForm.category_id" class="form-input" required>
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Stock Quantity *</label>
                <input 
                  v-model.number="productForm.stock_quantity" 
                  type="number" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input 
                v-model="productForm.image_url" 
                type="url" 
                class="form-input" 
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="saving" class="btn btn-primary">
                {{ saving ? 'Saving...' : 'Save Product' }}
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
import { formatCurrency } from '../utils/currency'

export default {
  name: 'AdminProducts',
  setup() {
    const products = ref([])
    const categories = ref([])
    const showAddProduct = ref(false)
    const editingProduct = ref(null)
    const saving = ref(false)
    const showBulkActions = ref(false)
    const selectedProducts = ref([])
    const searchQuery = ref('')
    const categoryFilter = ref('')
    const statusFilter = ref('')
    const allProducts = ref([])

    const productForm = ref({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
      category_id: '',
      image_url: ''
    })

    const allSelected = computed(() => {
      return products.value.length > 0 && selectedProducts.value.length === products.value.length
    })

    const loadProducts = async () => {
      try {
        const response = await axios.get('/api/products')
        allProducts.value = response.data.products
        products.value = response.data.products
      } catch (error) {
        console.error('Failed to load products:', error)
      }
    }

    const loadCategories = async () => {
      try {
        const response = await axios.get('/api/products/categories/all')
        categories.value = response.data
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    const editProduct = (product) => {
      editingProduct.value = product
      productForm.value = {
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock_quantity: product.stock_quantity,
        category_id: product.category_id,
        image_url: product.image_url || ''
      }
    }

    const deleteProduct = async (productId) => {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await axios.delete(`/api/products/${productId}`)
          await loadProducts()
        } catch (error) {
          console.error('Failed to delete product:', error)
          alert('Failed to delete product')
        }
      }
    }

    const saveProduct = async () => {
      saving.value = true

      try {
        if (editingProduct.value) {
          await axios.put(`/api/products/${editingProduct.value.id}`, productForm.value)
        } else {
          await axios.post('/api/products', productForm.value)
        }
        
        await loadProducts()
        closeModal()
      } catch (error) {
        console.error('Failed to save product:', error)
        alert('Failed to save product')
      } finally {
        saving.value = false
      }
    }

    const closeModal = () => {
      showAddProduct.value = false
      editingProduct.value = null
      productForm.value = {
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category_id: '',
        image_url: ''
      }
    }

    const searchProducts = () => {
      filterProducts()
    }

    const filterProducts = () => {
      let filtered = [...allProducts.value]

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      if (categoryFilter.value) {
        filtered = filtered.filter(product => product.category_id == categoryFilter.value)
      }

      if (statusFilter.value) {
        const isActive = statusFilter.value === 'active'
        filtered = filtered.filter(product => product.is_active === isActive)
      }

      products.value = filtered
    }

    const toggleAllSelection = () => {
      if (allSelected.value) {
        selectedProducts.value = []
      } else {
        selectedProducts.value = products.value.map(p => p.id)
      }
    }

    const toggleProductStatus = async (product) => {
      try {
        await axios.put(`/api/products/${product.id}`, {
          is_active: !product.is_active
        })
        await loadProducts()
      } catch (error) {
        console.error('Failed to toggle product status:', error)
        alert('Failed to update product status')
      }
    }

    const bulkActivate = async () => {
      if (selectedProducts.value.length === 0) return
      
      try {
        await Promise.all(
          selectedProducts.value.map(id => 
            axios.put(`/api/products/${id}`, { is_active: true })
          )
        )
        await loadProducts()
        selectedProducts.value = []
        showBulkActions.value = false
      } catch (error) {
        console.error('Failed to activate products:', error)
        alert('Failed to activate products')
      }
    }

    const bulkDeactivate = async () => {
      if (selectedProducts.value.length === 0) return
      
      try {
        await Promise.all(
          selectedProducts.value.map(id => 
            axios.put(`/api/products/${id}`, { is_active: false })
          )
        )
        await loadProducts()
        selectedProducts.value = []
        showBulkActions.value = false
      } catch (error) {
        console.error('Failed to deactivate products:', error)
        alert('Failed to deactivate products')
      }
    }

    const bulkDelete = async () => {
      if (selectedProducts.value.length === 0) return
      
      if (confirm(`Are you sure you want to delete ${selectedProducts.value.length} products?`)) {
        try {
          await Promise.all(
            selectedProducts.value.map(id => 
              axios.delete(`/api/products/${id}`)
            )
          )
          await loadProducts()
          selectedProducts.value = []
          showBulkActions.value = false
        } catch (error) {
          console.error('Failed to delete products:', error)
          alert('Failed to delete products')
        }
      }
    }

    onMounted(() => {
      loadProducts()
      loadCategories()
    })

    return {
      products,
      categories,
      showAddProduct,
      editingProduct,
      saving,
      productForm,
      showBulkActions,
      selectedProducts,
      searchQuery,
      categoryFilter,
      statusFilter,
      allSelected,
      editProduct,
      deleteProduct,
      saveProduct,
      closeModal,
      searchProducts,
      filterProducts,
      toggleAllSelection,
      toggleProductStatus,
      bulkActivate,
      bulkDeactivate,
      bulkDelete,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.admin-products {
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

.page-title {
  font-size: 3rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
}

.products-table {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 80px 1fr 150px 100px 80px 100px 150px;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #00ffff;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 80px 1fr 150px 100px 80px 100px 150px;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(0, 255, 255, 0.05);
}

.product-image img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.product-name {
  color: #ffffff;
  font-weight: 500;
}

.product-category {
  color: rgba(255, 255, 255, 0.8);
}

.product-price {
  color: #00ffff;
  font-weight: 700;
}

.product-stock {
  color: #ffffff;
}

.product-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.product-status.active {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.product-stock.low-stock {
  color: #ffc107;
  font-weight: 700;
}

.product-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.9rem;
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
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #00ffff;
  margin-bottom: 30px;
  font-size: 2rem;
}

.product-form {
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .product-actions {
    justify-content: center;
  }
}
</style>