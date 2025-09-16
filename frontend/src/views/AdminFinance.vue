<template>
  <div class="admin-finance">
    <div class="container">
      <h1 class="page-title">Financial Dashboard</h1>

      <!-- Period Selector -->
      <div class="period-selector">
        <select v-model="selectedPeriod" @change="loadFinancialData">
          <option value="current_month">Current Month</option>
          <option value="last_month">Last Month</option>
          <option value="current_year">Current Year</option>
        </select>
      </div>

      <!-- Financial Summary Cards -->
      <div class="finance-cards">
        <div class="finance-card revenue">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(financialData.summary?.totalRevenue || 0) }}</div>
            <div class="card-label">Total Revenue</div>
          </div>
        </div>
        
        <div class="finance-card profit">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(financialData.summary?.grossProfit || 0) }}</div>
            <div class="card-label">Gross Profit</div>
          </div>
        </div>
        
        <div class="finance-card margin">
          <div class="card-icon">📊</div>
          <div class="card-content">
            <div class="card-value">{{ (financialData.summary?.profitMargin || 0).toFixed(1) }}%</div>
            <div class="card-label">Profit Margin</div>
          </div>
        </div>
        
        <div class="finance-card vat">
          <div class="card-icon">🧾</div>
          <div class="card-content">
            <div class="card-value">{{ formatCurrency(financialData.summary?.totalVAT || 0) }}</div>
            <div class="card-label">VAT (15%)</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <h3>Revenue Trend</h3>
          <div class="chart-placeholder">
            <p>Monthly revenue chart would go here</p>
            <div class="chart-data">
              <div v-for="month in financialData.monthlyTrend" :key="month.month" class="chart-bar">
                <div class="bar" :style="{ height: getBarHeight(month.revenue) + 'px' }"></div>
                <span class="bar-label">{{ formatMonth(month.month) }}</span>
                <span class="bar-value">{{ formatCurrency(month.revenue) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="top-products">
        <h3>Top Selling Products</h3>
        <div class="products-table">
          <div class="table-header">
            <div>Product</div>
            <div>Sold</div>
            <div>Revenue</div>
            <div>Profit</div>
            <div>Margin</div>
          </div>
          <div v-for="product in financialData.topProducts" :key="product.id" class="table-row">
            <div class="product-name">{{ product.name }}</div>
            <div>{{ product.totalSold }}</div>
            <div>{{ formatCurrency(product.totalRevenue) }}</div>
            <div>{{ formatCurrency(product.profit) }}</div>
            <div>{{ ((product.profit / product.totalRevenue) * 100).toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- Profit Analysis -->
      <div class="profit-analysis">
        <h3>Product Profit Analysis</h3>
        <div class="analysis-filters">
          <select v-model="selectedCategory" @change="loadProfitAnalysis">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        
        <div class="products-table">
          <div class="table-header">
            <div>Product</div>
            <div>Category</div>
            <div>Selling Price</div>
            <div>Cost Price</div>
            <div>Target Margin</div>
            <div>Actual Margin</div>
            <div>Actions</div>
          </div>
          <div v-for="product in profitAnalysis.products" :key="product.id" class="table-row">
            <div class="product-name">{{ product.name }}</div>
            <div>{{ product.category }}</div>
            <div>{{ formatCurrency(product.sellingPrice) }}</div>
            <div>{{ formatCurrency(product.costPrice) }}</div>
            <div>{{ product.targetMargin.toFixed(1) }}%</div>
            <div :class="{ 'margin-good': product.actualMargin >= product.targetMargin, 'margin-low': product.actualMargin < product.targetMargin }">
              {{ product.actualMargin.toFixed(1) }}%
            </div>
            <div>
              <button @click="editProductCost(product)" class="btn btn-sm btn-primary">
                Edit Cost
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tax Report -->
      <div class="tax-report">
        <h3>Tax Report</h3>
        <div class="report-controls">
          <input type="date" v-model="taxReportStart" />
          <input type="date" v-model="taxReportEnd" />
          <button @click="generateTaxReport" class="btn btn-primary">Generate Report</button>
        </div>
        
        <div v-if="taxReport" class="tax-summary">
          <div class="tax-card">
            <h4>VAT Summary</h4>
            <p>Total VAT Collected: {{ formatCurrency(taxReport.summary?.totalVAT || 0) }}</p>
            <p>VAT Rate: 15%</p>
            <p>Period: {{ taxReport.period?.start }} to {{ taxReport.period?.end }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Product Cost Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <h3>Edit Product Cost</h3>
        <form @submit.prevent="saveProductCost">
          <div class="form-group">
            <label>Product Name</label>
            <input v-model="editingProduct.name" readonly />
          </div>
          <div class="form-group">
            <label>Cost Price (ZAR)</label>
            <input v-model.number="editingProduct.costPrice" type="number" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Target Margin (%)</label>
            <input v-model.number="editingProduct.targetMargin" type="number" step="0.1" required />
          </div>
          <div class="form-group">
            <label>Supplier</label>
            <input v-model="editingProduct.supplier" />
          </div>
          <div class="form-group">
            <label>SKU</label>
            <input v-model="editingProduct.sku" />
          </div>
          <div class="form-actions">
            <button type="button" @click="closeEditModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'AdminFinance',
  setup() {
    const financialData = ref({})
    const profitAnalysis = ref({ products: [] })
    const categories = ref([])
    const taxReport = ref(null)
    const selectedPeriod = ref('current_month')
    const selectedCategory = ref('')
    const taxReportStart = ref('')
    const taxReportEnd = ref('')
    const showEditModal = ref(false)
    const editingProduct = ref({})

    const loadFinancialData = async () => {
      try {
        const response = await axios.get(`/api/finance/dashboard?period=${selectedPeriod.value}`)
        financialData.value = response.data
      } catch (error) {
        console.error('Failed to load financial data:', error)
      }
    }

    const loadProfitAnalysis = async () => {
      try {
        const params = selectedCategory.value ? { categoryId: selectedCategory.value } : {}
        const response = await axios.get('/api/finance/profit-analysis', { params })
        profitAnalysis.value = response.data
      } catch (error) {
        console.error('Failed to load profit analysis:', error)
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

    const generateTaxReport = async () => {
      try {
        const response = await axios.get('/api/finance/tax-report', {
          params: {
            startDate: taxReportStart.value,
            endDate: taxReportEnd.value
          }
        })
        taxReport.value = response.data
      } catch (error) {
        console.error('Failed to generate tax report:', error)
      }
    }

    const editProductCost = (product) => {
      editingProduct.value = { ...product }
      showEditModal.value = true
    }

    const saveProductCost = async () => {
      try {
        await axios.put(`/api/finance/product/${editingProduct.value.id}/cost`, {
          costPrice: editingProduct.value.costPrice,
          targetMargin: editingProduct.value.targetMargin,
          supplier: editingProduct.value.supplier,
          sku: editingProduct.value.sku
        })
        closeEditModal()
        loadProfitAnalysis()
      } catch (error) {
        console.error('Failed to save product cost:', error)
      }
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editingProduct.value = {}
    }

    const getBarHeight = (value) => {
      const maxValue = Math.max(...financialData.value.monthlyTrend?.map(m => m.revenue) || [0])
      return maxValue > 0 ? (value / maxValue) * 100 : 0
    }

    const formatMonth = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
    }

    onMounted(() => {
      loadFinancialData()
      loadProfitAnalysis()
      loadCategories()
      
      // Set default tax report dates
      const now = new Date()
      taxReportStart.value = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      taxReportEnd.value = now.toISOString().split('T')[0]
    })

    return {
      financialData,
      profitAnalysis,
      categories,
      taxReport,
      selectedPeriod,
      selectedCategory,
      taxReportStart,
      taxReportEnd,
      showEditModal,
      editingProduct,
      loadFinancialData,
      loadProfitAnalysis,
      generateTaxReport,
      editProductCost,
      saveProductCost,
      closeEditModal,
      getBarHeight,
      formatMonth,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.admin-finance {
  padding: 20px 0;
}

.period-selector {
  margin-bottom: 30px;
}

.period-selector select {
  padding: 10px 15px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(26, 26, 46, 0.8);
  color: white;
  border-radius: 8px;
}

.finance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.finance-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.finance-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.card-icon {
  font-size: 2rem;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 5px;
}

.card-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.charts-section, .top-products, .profit-analysis, .tax-report {
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.chart-placeholder {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-top: 15px;
}

.chart-data {
  display: flex;
  justify-content: space-around;
  align-items: end;
  height: 200px;
  margin-top: 20px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.bar {
  width: 30px;
  background: linear-gradient(to top, #00ffff, #0080ff);
  border-radius: 4px 4px 0 0;
  min-height: 10px;
}

.bar-label, .bar-value {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.products-table {
  margin-top: 15px;
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
}

.table-header {
  background: rgba(0, 255, 255, 0.1);
  font-weight: 600;
  color: #00ffff;
}

.table-row:hover {
  background: rgba(0, 255, 255, 0.05);
}

.product-name {
  font-weight: 500;
}

.margin-good {
  color: #00ff00;
}

.margin-low {
  color: #ff6b6b;
}

.analysis-filters, .report-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.analysis-filters select, .report-controls input {
  padding: 8px 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(26, 26, 46, 0.8);
  color: white;
  border-radius: 6px;
}

.tax-summary {
  margin-top: 20px;
}

.tax-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
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

.modal {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid #00ffff;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #00ffff;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border-radius: 6px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #00ffff;
  color: #000;
}

.btn-primary:hover {
  background: #00cccc;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}
</style>