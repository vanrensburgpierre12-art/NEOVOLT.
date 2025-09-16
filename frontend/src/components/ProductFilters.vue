<template>
  <div class="product-filters">
    <div class="filters-header">
      <h3>Filters</h3>
      <button @click="clearAllFilters" class="btn btn-secondary btn-sm">Clear All</button>
    </div>

    <div class="filter-section">
      <h4>Sort By</h4>
      <select v-model="localSortBy" @change="handleSortChange" class="form-input">
        <option value="created_at">Newest First</option>
        <option value="name">Name A-Z</option>
        <option value="price">Price Low to High</option>
        <option value="stock_quantity">Stock Quantity</option>
      </select>
      <select v-model="localSortOrder" @change="handleSortOrderChange" class="form-input">
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>

    <div class="filter-section">
      <h4>Price Range</h4>
      <div class="price-inputs">
        <input 
          v-model="localPriceMin" 
          @input="handlePriceChange"
          type="number" 
          placeholder="Min Price" 
          class="form-input"
          min="0"
        />
        <span class="price-separator">to</span>
        <input 
          v-model="localPriceMax" 
          @input="handlePriceChange"
          type="number" 
          placeholder="Max Price" 
          class="form-input"
          min="0"
        />
      </div>
    </div>

    <div class="filter-section">
      <h4>Availability</h4>
      <label class="checkbox-label">
        <input 
          v-model="localInStock" 
          @change="handleInStockChange"
          type="checkbox" 
          class="checkbox-input"
        />
        <span class="checkbox-text">In Stock Only</span>
      </label>
    </div>

    <div class="filter-section">
      <h4>Category</h4>
      <select v-model="localCategory" @change="handleCategoryChange" class="form-input">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category.id" :value="category.name">
          {{ category.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'ProductFilters',
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    sortBy: {
      type: String,
      default: 'created_at'
    },
    sortOrder: {
      type: String,
      default: 'desc'
    },
    priceMin: {
      type: String,
      default: ''
    },
    priceMax: {
      type: String,
      default: ''
    },
    inStock: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: ''
    }
  },
  emits: ['update:sortBy', 'update:sortOrder', 'update:priceMin', 'update:priceMax', 'update:inStock', 'update:category', 'clear-filters'],
  setup(props, { emit }) {
    const localSortBy = ref(props.sortBy)
    const localSortOrder = ref(props.sortOrder)
    const localPriceMin = ref(props.priceMin)
    const localPriceMax = ref(props.priceMax)
    const localInStock = ref(props.inStock)
    const localCategory = ref(props.category)

    const handleSortChange = () => {
      emit('update:sortBy', localSortBy.value)
    }

    const handleSortOrderChange = () => {
      emit('update:sortOrder', localSortOrder.value)
    }

    const handlePriceChange = () => {
      emit('update:priceMin', localPriceMin.value)
      emit('update:priceMax', localPriceMax.value)
    }

    const handleInStockChange = () => {
      emit('update:inStock', localInStock.value)
    }

    const handleCategoryChange = () => {
      emit('update:category', localCategory.value)
    }

    const clearAllFilters = () => {
      localSortBy.value = 'created_at'
      localSortOrder.value = 'desc'
      localPriceMin.value = ''
      localPriceMax.value = ''
      localInStock.value = false
      localCategory.value = ''
      emit('clear-filters')
    }

    // Watch for prop changes
    watch(() => props.sortBy, (newVal) => {
      localSortBy.value = newVal
    })

    watch(() => props.sortOrder, (newVal) => {
      localSortOrder.value = newVal
    })

    watch(() => props.priceMin, (newVal) => {
      localPriceMin.value = newVal
    })

    watch(() => props.priceMax, (newVal) => {
      localPriceMax.value = newVal
    })

    watch(() => props.inStock, (newVal) => {
      localInStock.value = newVal
    })

    watch(() => props.category, (newVal) => {
      localCategory.value = newVal
    })

    return {
      localSortBy,
      localSortOrder,
      localPriceMin,
      localPriceMax,
      localInStock,
      localCategory,
      handleSortChange,
      handleSortOrderChange,
      handlePriceChange,
      handleInStockChange,
      handleCategoryChange,
      clearAllFilters
    }
  }
}
</script>

<style scoped>
.product-filters {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.filters-header h3 {
  color: #00ffff;
  margin: 0;
  font-size: 1.2rem;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.filter-section {
  margin-bottom: 25px;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section h4 {
  color: #ffffff;
  margin-bottom: 10px;
  font-size: 1rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 10px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  margin-bottom: 10px;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-inputs .form-input {
  flex: 1;
  margin-bottom: 0;
}

.price-separator {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #00ffff;
}

.checkbox-text {
  font-size: 14px;
}

@media (max-width: 768px) {
  .product-filters {
    padding: 15px;
  }
  
  .filters-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .price-inputs {
    flex-direction: column;
    gap: 5px;
  }
  
  .price-separator {
    display: none;
  }
}
</style>