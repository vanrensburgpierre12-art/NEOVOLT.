<template>
  <div class="admin-categories">
    <div class="container">
      <div class="admin-header">
        <h1 class="page-title">Category Management</h1>
        <div class="header-actions">
          <button @click="showBulkActions = !showBulkActions" class="btn btn-secondary">
            Bulk Actions
          </button>
          <button @click="showAddCategory = true" class="btn btn-primary">
            Add New Category
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            @input="searchCategories"
            type="text" 
            placeholder="Search categories..."
            class="form-input"
          />
        </div>
      </div>

      <!-- Bulk Actions Panel -->
      <div v-if="showBulkActions" class="bulk-actions-panel">
        <div class="bulk-actions-content">
          <span class="selected-count">{{ selectedCategories.length }} categories selected</span>
          <div class="bulk-buttons">
            <button @click="bulkDelete" class="btn btn-danger btn-sm" :disabled="selectedCategories.length === 0">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Categories Table -->
      <div class="categories-table">
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
          <div>Description</div>
          <div>Products</div>
          <div>Created</div>
          <div>Actions</div>
        </div>
        <div 
          v-for="category in categories" 
          :key="category.id" 
          class="table-row"
        >
          <div>
            <input 
              type="checkbox" 
              :value="category.id"
              v-model="selectedCategories"
              class="bulk-checkbox"
            />
          </div>
          <div class="category-image">
            <img 
              :src="category.image_url || '/api/placeholder/50/50'" 
              :alt="category.name"
            />
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-description">{{ category.description || 'No description' }}</div>
          <div class="category-products">{{ category.product_count || 0 }} products</div>
          <div class="category-created">{{ formatDate(category.created_at) }}</div>
          <div class="category-actions">
            <button @click="editCategory(category)" class="btn btn-secondary btn-sm">
              Edit
            </button>
            <button @click="deleteCategory(category.id)" class="btn btn-danger btn-sm">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Category Modal -->
      <div v-if="showAddCategory || editingCategory" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>{{ editingCategory ? 'Edit Category' : 'Add New Category' }}</h2>
          <form @submit.prevent="saveCategory" class="category-form">
            <div class="form-group">
              <label class="form-label">Category Name *</label>
              <input 
                v-model="categoryForm.name" 
                type="text" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea 
                v-model="categoryForm.description" 
                class="form-input" 
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input 
                v-model="categoryForm.imageUrl" 
                type="url" 
                class="form-input"
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="saving" class="btn btn-primary">
                {{ saving ? 'Saving...' : 'Save Category' }}
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
  name: 'AdminCategories',
  setup() {
    const categories = ref([])
    const showAddCategory = ref(false)
    const editingCategory = ref(null)
    const saving = ref(false)
    const showBulkActions = ref(false)
    const selectedCategories = ref([])
    const searchQuery = ref('')
    const allCategories = ref([])

    const categoryForm = ref({
      name: '',
      description: '',
      imageUrl: ''
    })

    const allSelected = computed(() => {
      return categories.value.length > 0 && selectedCategories.value.length === categories.value.length
    })

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const loadCategories = async () => {
      try {
        const response = await axios.get('/api/admin/categories')
        allCategories.value = response.data
        categories.value = response.data
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    const searchCategories = () => {
      let filtered = [...allCategories.value]

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(category => 
          category.name.toLowerCase().includes(query) ||
          (category.description && category.description.toLowerCase().includes(query))
        )
      }

      categories.value = filtered
    }

    const toggleAllSelection = () => {
      if (allSelected.value) {
        selectedCategories.value = []
      } else {
        selectedCategories.value = categories.value.map(c => c.id)
      }
    }

    const editCategory = (category) => {
      editingCategory.value = category
      categoryForm.value = {
        name: category.name,
        description: category.description || '',
        imageUrl: category.image_url || ''
      }
    }

    const deleteCategory = async (categoryId) => {
      if (confirm('Are you sure you want to delete this category?')) {
        try {
          await axios.delete(`/api/admin/categories/${categoryId}`)
          await loadCategories()
        } catch (error) {
          console.error('Failed to delete category:', error)
          alert('Failed to delete category')
        }
      }
    }

    const saveCategory = async () => {
      saving.value = true

      try {
        if (editingCategory.value) {
          await axios.put(`/api/admin/categories/${editingCategory.value.id}`, categoryForm.value)
        } else {
          await axios.post('/api/admin/categories', categoryForm.value)
        }
        
        await loadCategories()
        closeModal()
      } catch (error) {
        console.error('Failed to save category:', error)
        alert('Failed to save category')
      } finally {
        saving.value = false
      }
    }

    const closeModal = () => {
      showAddCategory.value = false
      editingCategory.value = null
      categoryForm.value = {
        name: '',
        description: '',
        imageUrl: ''
      }
    }

    const bulkDelete = async () => {
      if (selectedCategories.value.length === 0) return
      
      if (confirm(`Are you sure you want to delete ${selectedCategories.value.length} categories?`)) {
        try {
          await Promise.all(
            selectedCategories.value.map(id => 
              axios.delete(`/api/admin/categories/${id}`)
            )
          )
          await loadCategories()
          selectedCategories.value = []
          showBulkActions.value = false
        } catch (error) {
          console.error('Failed to delete categories:', error)
          alert('Failed to delete categories')
        }
      }
    }

    onMounted(() => {
      loadCategories()
    })

    return {
      categories,
      showAddCategory,
      editingCategory,
      saving,
      showBulkActions,
      selectedCategories,
      searchQuery,
      categoryForm,
      allSelected,
      formatDate,
      loadCategories,
      searchCategories,
      toggleAllSelection,
      editCategory,
      deleteCategory,
      saveCategory,
      closeModal,
      bulkDelete
    }
  }
}
</script>

<style scoped>
.admin-categories {
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

.categories-table {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 80px 1fr 2fr 100px 150px 200px;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  font-weight: 700;
  color: #00ffff;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 80px 1fr 2fr 100px 150px 200px;
  gap: 20px;
  padding: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(0, 255, 255, 0.05);
}

.category-image img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.category-name {
  color: #ffffff;
  font-weight: 500;
}

.category-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.category-products {
  color: #00ffff;
  font-weight: 700;
  text-align: center;
}

.category-created {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.category-actions {
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
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #00ffff;
  margin-bottom: 30px;
  font-size: 2rem;
}

.category-form {
  display: flex;
  flex-direction: column;
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
  
  .form-actions {
    flex-direction: column;
  }
  
  .category-actions {
    justify-content: center;
  }
}
</style>