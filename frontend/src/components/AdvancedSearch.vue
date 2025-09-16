<template>
  <div class="advanced-search">
    <div class="search-header">
      <h3>Advanced Search</h3>
      <button @click="toggleAdvanced" class="btn btn-secondary btn-sm">
        {{ showAdvanced ? 'Hide' : 'Show' }} Advanced
      </button>
    </div>

    <!-- Quick Search -->
    <div class="quick-search">
      <div class="search-input-container">
        <input 
          v-model="searchQuery" 
          @input="handleSearch"
          type="text" 
          placeholder="Search products, categories, or specifications..."
          class="search-input"
        />
        <button @click="handleSearch" class="btn btn-primary">
          <span class="search-icon">🔍</span>
        </button>
      </div>
      
      <!-- Search Suggestions -->
      <div v-if="suggestions.length > 0 && showSuggestions" class="search-suggestions">
        <div 
          v-for="suggestion in suggestions" 
          :key="suggestion.id"
          @click="selectSuggestion(suggestion)"
          class="suggestion-item"
        >
          <span class="suggestion-text">{{ suggestion.text }}</span>
          <span class="suggestion-type">{{ suggestion.type }}</span>
        </div>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div v-if="showAdvanced" class="advanced-filters">
      <div class="filter-grid">
        <!-- Categories -->
        <div class="filter-group">
          <label class="filter-label">Categories</label>
          <div class="checkbox-group">
            <label 
              v-for="category in categories" 
              :key="category.id"
              class="checkbox-item"
            >
              <input 
                v-model="selectedCategories" 
                :value="category.id"
                type="checkbox" 
                class="checkbox-input"
              />
              <span class="checkbox-text">{{ category.name }}</span>
              <span class="product-count">({{ category.product_count || 0 }})</span>
            </label>
          </div>
        </div>

        <!-- Price Range -->
        <div class="filter-group">
          <label class="filter-label">Price Range</label>
          <div class="price-range">
            <input 
              v-model="priceRange.min" 
              @input="handlePriceChange"
              type="number" 
              placeholder="Min" 
              class="price-input"
              min="0"
            />
            <span class="price-separator">-</span>
            <input 
              v-model="priceRange.max" 
              @input="handlePriceChange"
              type="number" 
              placeholder="Max" 
              class="price-input"
              min="0"
            />
          </div>
          <div class="price-slider">
            <input 
              v-model="priceRange.min" 
              @input="handlePriceChange"
              type="range" 
              :min="priceBounds.min" 
              :max="priceBounds.max" 
              class="range-slider"
            />
            <input 
              v-model="priceRange.max" 
              @input="handlePriceChange"
              type="range" 
              :min="priceBounds.min" 
              :max="priceBounds.max" 
              class="range-slider"
            />
          </div>
        </div>

        <!-- Stock Status -->
        <div class="filter-group">
          <label class="filter-label">Availability</label>
          <div class="radio-group">
            <label class="radio-item">
              <input 
                v-model="stockFilter" 
                value="all" 
                type="radio" 
                class="radio-input"
              />
              <span class="radio-text">All Products</span>
            </label>
            <label class="radio-item">
              <input 
                v-model="stockFilter" 
                value="in-stock" 
                type="radio" 
                class="radio-input"
              />
              <span class="radio-text">In Stock Only</span>
            </label>
            <label class="radio-item">
              <input 
                v-model="stockFilter" 
                value="low-stock" 
                type="radio" 
                class="radio-input"
              />
              <span class="radio-text">Low Stock (< 10)</span>
            </label>
            <label class="radio-item">
              <input 
                v-model="stockFilter" 
                value="out-of-stock" 
                type="radio" 
                class="radio-input"
              />
              <span class="radio-text">Out of Stock</span>
            </label>
          </div>
        </div>

        <!-- Rating Filter -->
        <div class="filter-group">
          <label class="filter-label">Minimum Rating</label>
          <div class="rating-filter">
            <div class="stars">
              <span 
                v-for="star in 5" 
                :key="star"
                @click="setMinRating(star)"
                :class="['star', { active: star <= minRating }]"
              >
                ⭐
              </span>
            </div>
            <span class="rating-text">{{ minRating }}+ stars</span>
          </div>
        </div>

        <!-- Sort Options -->
        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select v-model="sortBy" class="select-input">
            <option value="relevance">Relevance</option>
            <option value="name">Name A-Z</option>
            <option value="price_asc">Price Low to High</option>
            <option value="price_desc">Price High to Low</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Highest Rated</option>
            <option value="stock">Stock Quantity</option>
          </select>
        </div>

        <!-- Specifications Filter -->
        <div class="filter-group">
          <label class="filter-label">Specifications</label>
          <div class="spec-filters">
            <div 
              v-for="spec in availableSpecs" 
              :key="spec.key"
              class="spec-filter"
            >
              <label class="spec-label">{{ spec.label }}</label>
              <select 
                v-model="specFilters[spec.key]" 
                class="spec-select"
              >
                <option value="">Any {{ spec.label }}</option>
                <option 
                  v-for="value in spec.values" 
                  :key="value"
                  :value="value"
                >
                  {{ value }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="filter-actions">
        <button @click="applyFilters" class="btn btn-primary">
          Apply Filters
        </button>
        <button @click="clearAllFilters" class="btn btn-secondary">
          Clear All
        </button>
        <button @click="saveSearch" class="btn btn-outline">
          Save Search
        </button>
      </div>
    </div>

    <!-- Active Filters -->
    <div v-if="activeFiltersCount > 0" class="active-filters">
      <h4>Active Filters ({{ activeFiltersCount }})</h4>
      <div class="filter-tags">
        <span 
          v-for="filter in activeFilters" 
          :key="filter.key"
          class="filter-tag"
        >
          {{ filter.label }}: {{ filter.value }}
          <button @click="removeFilter(filter.key)" class="remove-btn">×</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es'

export default {
  name: 'AdvancedSearch',
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    priceBounds: {
      type: Object,
      default: () => ({ min: 0, max: 1000 })
    }
  },
  emits: ['search', 'filter-change'],
  setup(props, { emit }) {
    // Search state
    const searchQuery = ref('')
    const showAdvanced = ref(false)
    const showSuggestions = ref(false)
    const suggestions = ref([])

    // Filter state
    const selectedCategories = ref([])
    const priceRange = ref({ min: '', max: '' })
    const stockFilter = ref('all')
    const minRating = ref(0)
    const sortBy = ref('relevance')
    const specFilters = ref({})

    // Available specifications
    const availableSpecs = ref([
      { key: 'voltage', label: 'Voltage', values: ['12V', '24V', '48V', '110V', '220V', '380V'] },
      { key: 'current', label: 'Current Rating', values: ['5A', '10A', '16A', '20A', '32A', '63A'] },
      { key: 'material', label: 'Material', values: ['Copper', 'Aluminum', 'Steel', 'Plastic', 'Ceramic'] },
      { key: 'connection_type', label: 'Connection Type', values: ['Screw', 'Push-in', 'Spring', 'Crimp', 'Soldered'] }
    ])

    // Computed properties
    const activeFilters = computed(() => {
      const filters = []
      
      if (selectedCategories.value.length > 0) {
        filters.push({
          key: 'categories',
          label: 'Categories',
          value: selectedCategories.value.length + ' selected'
        })
      }
      
      if (priceRange.value.min || priceRange.value.max) {
        const min = priceRange.value.min || '0'
        const max = priceRange.value.max || '∞'
        filters.push({
          key: 'price',
          label: 'Price',
          value: `€${min} - €${max}`
        })
      }
      
      if (stockFilter.value !== 'all') {
        filters.push({
          key: 'stock',
          label: 'Stock',
          value: stockFilter.value.replace('-', ' ')
        })
      }
      
      if (minRating.value > 0) {
        filters.push({
          key: 'rating',
          label: 'Rating',
          value: minRating.value + '+ stars'
        })
      }
      
      return filters
    })

    const activeFiltersCount = computed(() => activeFilters.value.length)

    // Methods
    const handleSearch = debounce(() => {
      emit('search', {
        query: searchQuery.value,
        categories: selectedCategories.value,
        priceRange: priceRange.value,
        stockFilter: stockFilter.value,
        minRating: minRating.value,
        sortBy: sortBy.value,
        specFilters: specFilters.value
      })
    }, 300)

    const handlePriceChange = () => {
      handleSearch()
    }

    const selectSuggestion = (suggestion) => {
      searchQuery.value = suggestion.text
      showSuggestions.value = false
      handleSearch()
    }

    const setMinRating = (rating) => {
      minRating.value = rating
      handleSearch()
    }

    const applyFilters = () => {
      handleSearch()
    }

    const clearAllFilters = () => {
      searchQuery.value = ''
      selectedCategories.value = []
      priceRange.value = { min: '', max: '' }
      stockFilter.value = 'all'
      minRating.value = 0
      sortBy.value = 'relevance'
      specFilters.value = {}
      showSuggestions.value = false
      handleSearch()
    }

    const removeFilter = (filterKey) => {
      switch (filterKey) {
        case 'categories':
          selectedCategories.value = []
          break
        case 'price':
          priceRange.value = { min: '', max: '' }
          break
        case 'stock':
          stockFilter.value = 'all'
          break
        case 'rating':
          minRating.value = 0
          break
      }
      handleSearch()
    }

    const saveSearch = () => {
      // Save current search to localStorage or send to backend
      const searchData = {
        query: searchQuery.value,
        filters: {
          categories: selectedCategories.value,
          priceRange: priceRange.value,
          stockFilter: stockFilter.value,
          minRating: minRating.value,
          sortBy: sortBy.value,
          specFilters: specFilters.value
        },
        timestamp: Date.now()
      }
      
      localStorage.setItem('savedSearch', JSON.stringify(searchData))
      // You could also emit an event to save to backend
      emit('search-saved', searchData)
    }

    const toggleAdvanced = () => {
      showAdvanced.value = !showAdvanced.value
    }

    // Watch for changes
    watch([selectedCategories, stockFilter, minRating, sortBy, specFilters], () => {
      handleSearch()
    }, { deep: true })

    // Load saved search on mount
    onMounted(() => {
      const savedSearch = localStorage.getItem('savedSearch')
      if (savedSearch) {
        try {
          const data = JSON.parse(savedSearch)
          searchQuery.value = data.query || ''
          if (data.filters) {
            selectedCategories.value = data.filters.categories || []
            priceRange.value = data.filters.priceRange || { min: '', max: '' }
            stockFilter.value = data.filters.stockFilter || 'all'
            minRating.value = data.filters.minRating || 0
            sortBy.value = data.filters.sortBy || 'relevance'
            specFilters.value = data.filters.specFilters || {}
          }
        } catch (error) {
          console.error('Failed to load saved search:', error)
        }
      }
    })

    return {
      searchQuery,
      showAdvanced,
      showSuggestions,
      suggestions,
      selectedCategories,
      priceRange,
      stockFilter,
      minRating,
      sortBy,
      specFilters,
      availableSpecs,
      activeFilters,
      activeFiltersCount,
      handleSearch,
      handlePriceChange,
      selectSuggestion,
      setMinRating,
      applyFilters,
      clearAllFilters,
      removeFilter,
      saveSearch,
      toggleAdvanced
    }
  }
}
</script>

<style scoped>
.advanced-search {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-header h3 {
  color: #00ffff;
  margin: 0;
  font-size: 1.3rem;
}

.quick-search {
  position: relative;
  margin-bottom: 20px;
}

.search-input-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-icon {
  font-size: 1.2rem;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  margin-top: 5px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background: rgba(0, 255, 255, 0.1);
}

.suggestion-text {
  color: #ffffff;
  font-size: 14px;
}

.suggestion-type {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-transform: uppercase;
}

.advanced-filters {
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  padding-top: 20px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-label {
  color: #00ffff;
  font-weight: 600;
  font-size: 14px;
}

.checkbox-group, .radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item, .radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.checkbox-input, .radio-input {
  width: 16px;
  height: 16px;
  accent-color: #00ffff;
}

.checkbox-text, .radio-text {
  flex: 1;
}

.product-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
}

.price-separator {
  color: rgba(255, 255, 255, 0.6);
}

.price-slider {
  position: relative;
  height: 20px;
}

.range-slider {
  position: absolute;
  width: 100%;
  height: 4px;
  background: rgba(0, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #00ffff;
  border-radius: 50%;
  cursor: pointer;
}

.rating-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: color 0.2s ease;
}

.star.active {
  color: #ffc107;
}

.rating-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.select-input {
  padding: 8px 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
}

.spec-filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.spec-filter {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.spec-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.spec-select {
  padding: 6px 10px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 12px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-outline {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #00ffff;
  color: #0a0a0a;
}

.active-filters {
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  padding-top: 20px;
  margin-top: 20px;
}

.active-filters h4 {
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 14px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #00ffff;
  border-radius: 16px;
  padding: 4px 8px;
  font-size: 12px;
  color: #00ffff;
}

.remove-btn {
  background: none;
  border: none;
  color: #00ffff;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  margin-left: 4px;
}

.remove-btn:hover {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .search-input-container {
    flex-direction: column;
  }
  
  .filter-actions {
    flex-direction: column;
  }
}
</style>