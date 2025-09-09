<template>
  <div class="admin-newsletters">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Newsletter Management</h1>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <i class="icon">📧</i>
          Create Newsletter
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ stats.total_newsletters || 0 }}</h3>
            <p>Total Newsletters</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📤</div>
          <div class="stat-content">
            <h3>{{ stats.sent_newsletters || 0 }}</h3>
            <p>Sent</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>{{ stats.draft_newsletters || 0 }}</h3>
            <p>Drafts</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>{{ stats.total_sent_count || 0 }}</h3>
            <p>Total Sent</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="filters.status" @change="loadNewsletters" class="filter-select">
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Type:</label>
          <select v-model="filters.type" @change="loadNewsletters" class="filter-select">
            <option value="">All</option>
            <option value="general">General</option>
            <option value="promotional">Promotional</option>
            <option value="announcement">Announcement</option>
            <option value="product_update">Product Update</option>
          </select>
        </div>
        <div class="filter-group">
          <button @click="clearFilters" class="btn btn-secondary">Clear Filters</button>
        </div>
      </div>

      <!-- Newsletters List -->
      <div class="newsletters-list">
        <div v-if="loading" class="loading-container">
          <div class="loading"></div>
          <p>Loading newsletters...</p>
        </div>

        <div v-else-if="newsletters.length === 0" class="empty-state">
          <h2>No newsletters found</h2>
          <p>Create your first newsletter to get started.</p>
        </div>

        <div v-else class="newsletter-cards">
          <div 
            v-for="newsletter in newsletters" 
            :key="newsletter.id" 
            class="newsletter-card"
          >
            <div class="newsletter-header">
              <h3 class="newsletter-title">{{ newsletter.subject }}</h3>
              <div class="newsletter-badges">
                <span class="badge" :class="newsletter.status">{{ newsletter.status }}</span>
                <span class="badge type">{{ newsletter.type }}</span>
              </div>
            </div>

            <div class="newsletter-content">
              <p class="newsletter-preview">{{ newsletter.content.substring(0, 150) }}...</p>
            </div>

            <div class="newsletter-meta">
              <div class="meta-item">
                <span class="meta-label">Created:</span>
                <span class="meta-value">{{ formatDate(newsletter.created_at) }}</span>
              </div>
              <div v-if="newsletter.sent_at" class="meta-item">
                <span class="meta-label">Sent:</span>
                <span class="meta-value">{{ formatDate(newsletter.sent_at) }}</span>
              </div>
              <div v-if="newsletter.sent_count" class="meta-item">
                <span class="meta-label">Recipients:</span>
                <span class="meta-value">{{ newsletter.sent_count }}</span>
              </div>
            </div>

            <div class="newsletter-actions">
              <button @click="viewNewsletter(newsletter)" class="btn btn-secondary">
                <i class="icon">👁️</i>
                View
              </button>
              <button @click="editNewsletter(newsletter)" class="btn btn-secondary">
                <i class="icon">✏️</i>
                Edit
              </button>
              <button 
                v-if="newsletter.status === 'draft' || newsletter.status === 'scheduled'"
                @click="sendNewsletter(newsletter.id)" 
                class="btn btn-primary"
              >
                <i class="icon">📤</i>
                Send
              </button>
              <button @click="deleteNewsletter(newsletter.id)" class="btn btn-danger">
                <i class="icon">🗑️</i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="pagination">
        <button 
          @click="goToPage(pagination.page - 1)" 
          :disabled="pagination.page <= 1"
          class="btn btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page }} of {{ pagination.pages }}
        </span>
        <button 
          @click="goToPage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.pages"
          class="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Create/Edit Newsletter Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showCreateModal ? 'Create Newsletter' : 'Edit Newsletter' }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="saveNewsletter" class="newsletter-form">
          <div class="form-group">
            <label class="form-label">Subject *</label>
            <input 
              v-model="newsletterForm.subject" 
              type="text" 
              class="form-input" 
              required 
              placeholder="Enter newsletter subject"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select v-model="newsletterForm.type" class="form-input">
                <option value="general">General</option>
                <option value="promotional">Promotional</option>
                <option value="announcement">Announcement</option>
                <option value="product_update">Product Update</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Schedule (Optional)</label>
              <input 
                v-model="newsletterForm.scheduled_at" 
                type="datetime-local" 
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Content *</label>
            <textarea 
              v-model="newsletterForm.content" 
              class="form-textarea" 
              rows="10" 
              required 
              placeholder="Enter newsletter content..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="saving" class="btn btn-primary">
              {{ saving ? 'Saving...' : (showCreateModal ? 'Create' : 'Update') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Newsletter Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedNewsletter?.subject }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="newsletter-view">
          <div class="newsletter-meta-view">
            <div class="meta-row">
              <span class="meta-label">Type:</span>
              <span class="meta-value">{{ selectedNewsletter?.type }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Status:</span>
              <span class="meta-value badge" :class="selectedNewsletter?.status">
                {{ selectedNewsletter?.status }}
              </span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Created:</span>
              <span class="meta-value">{{ formatDate(selectedNewsletter?.created_at) }}</span>
            </div>
            <div v-if="selectedNewsletter?.sent_at" class="meta-row">
              <span class="meta-label">Sent:</span>
              <span class="meta-value">{{ formatDate(selectedNewsletter?.sent_at) }}</span>
            </div>
            <div v-if="selectedNewsletter?.sent_count" class="meta-row">
              <span class="meta-label">Recipients:</span>
              <span class="meta-value">{{ selectedNewsletter?.sent_count }}</span>
            </div>
          </div>

          <div class="newsletter-content-view">
            <h3>Content Preview</h3>
            <div class="content-preview" v-html="formatContent(selectedNewsletter?.content)"></div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-secondary">Close</button>
          <button 
            v-if="selectedNewsletter?.status === 'draft' || selectedNewsletter?.status === 'scheduled'"
            @click="sendNewsletter(selectedNewsletter.id)" 
            class="btn btn-primary"
          >
            Send Newsletter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AdminNewsletters',
  setup() {
    const newsletters = ref([])
    const stats = ref({})
    const loading = ref(true)
    const saving = ref(false)
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    const selectedNewsletter = ref(null)
    const pagination = ref({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    })

    const filters = ref({
      status: '',
      type: ''
    })

    const newsletterForm = ref({
      subject: '',
      content: '',
      type: 'general',
      scheduled_at: ''
    })

    const loadNewsletters = async () => {
      try {
        loading.value = true
        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit,
          ...filters.value
        }

        const response = await axios.get('/api/newsletters', { params })
        newsletters.value = response.data.newsletters
        pagination.value = response.data.pagination
      } catch (error) {
        console.error('Failed to load newsletters:', error)
      } finally {
        loading.value = false
      }
    }

    const loadStats = async () => {
      try {
        const response = await axios.get('/api/newsletters/stats/overview')
        stats.value = response.data.stats
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    const saveNewsletter = async () => {
      try {
        saving.value = true
        
        if (showCreateModal.value) {
          await axios.post('/api/newsletters', newsletterForm.value)
        } else {
          await axios.put(`/api/newsletters/${selectedNewsletter.value.id}`, newsletterForm.value)
        }

        closeModal()
        loadNewsletters()
        loadStats()
      } catch (error) {
        console.error('Failed to save newsletter:', error)
        alert('Failed to save newsletter. Please try again.')
      } finally {
        saving.value = false
      }
    }

    const sendNewsletter = async (newsletterId) => {
      if (!confirm('Are you sure you want to send this newsletter?')) return

      try {
        await axios.post(`/api/newsletters/${newsletterId}/send`, {
          method: 'whatsapp'
        })
        
        alert('Newsletter sent successfully!')
        loadNewsletters()
        loadStats()
      } catch (error) {
        console.error('Failed to send newsletter:', error)
        alert('Failed to send newsletter. Please try again.')
      }
    }

    const deleteNewsletter = async (newsletterId) => {
      if (!confirm('Are you sure you want to delete this newsletter?')) return

      try {
        await axios.delete(`/api/newsletters/${newsletterId}`)
        loadNewsletters()
        loadStats()
      } catch (error) {
        console.error('Failed to delete newsletter:', error)
        alert('Failed to delete newsletter. Please try again.')
      }
    }

    const viewNewsletter = (newsletter) => {
      selectedNewsletter.value = newsletter
      showViewModal.value = true
    }

    const editNewsletter = (newsletter) => {
      selectedNewsletter.value = newsletter
      newsletterForm.value = {
        subject: newsletter.subject,
        content: newsletter.content,
        type: newsletter.type,
        scheduled_at: newsletter.scheduled_at ? new Date(newsletter.scheduled_at).toISOString().slice(0, 16) : ''
      }
      showEditModal.value = true
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      showViewModal.value = false
      selectedNewsletter.value = null
      newsletterForm.value = {
        subject: '',
        content: '',
        type: 'general',
        scheduled_at: ''
      }
    }

    const clearFilters = () => {
      filters.value = { status: '', type: '' }
      loadNewsletters()
    }

    const goToPage = (page) => {
      pagination.value.page = page
      loadNewsletters()
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatContent = (content) => {
      return content?.replace(/\n/g, '<br>') || ''
    }

    onMounted(() => {
      loadNewsletters()
      loadStats()
    })

    return {
      newsletters,
      stats,
      loading,
      saving,
      showCreateModal,
      showEditModal,
      showViewModal,
      selectedNewsletter,
      pagination,
      filters,
      newsletterForm,
      loadNewsletters,
      saveNewsletter,
      sendNewsletter,
      deleteNewsletter,
      viewNewsletter,
      editNewsletter,
      closeModal,
      clearFilters,
      goToPage,
      formatDate,
      formatContent
    }
  }
}
</script>

<style scoped>
.admin-newsletters {
  padding: 40px 0;
  min-height: 80vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 3rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  color: #00ffff;
  font-size: 2rem;
  margin: 0;
  text-shadow: 0 0 10px #00ffff;
}

.stat-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 5px 0 0 0;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  color: #00ffff;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
}

.newsletter-cards {
  display: grid;
  gap: 20px;
}

.newsletter-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
}

.newsletter-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
}

.newsletter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.newsletter-title {
  color: #ffffff;
  font-size: 1.3rem;
  margin: 0;
  flex: 1;
}

.newsletter-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge.draft {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.badge.scheduled {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border: 1px solid #007bff;
}

.badge.sent {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  border: 1px solid #28a745;
}

.badge.cancelled {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid #dc3545;
}

.badge.type {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
  border: 1px solid #00ffff;
}

.newsletter-content {
  margin-bottom: 15px;
}

.newsletter-preview {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.newsletter-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  gap: 5px;
}

.meta-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.meta-value {
  color: #ffffff;
  font-size: 0.9rem;
}

.newsletter-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.view-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.modal-header h2 {
  color: #00ffff;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.newsletter-form {
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
  gap: 8px;
}

.form-label {
  color: #00ffff;
  font-weight: 500;
}

.form-input,
.form-textarea {
  padding: 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
}

.newsletter-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.newsletter-meta-view {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.meta-row {
  display: flex;
  gap: 10px;
}

.newsletter-content-view h3 {
  color: #00ffff;
  margin-bottom: 15px;
}

.content-preview {
  background: rgba(0, 0, 0, 0.3);
  padding: 20px;
  border-radius: 8px;
  color: #ffffff;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}

.page-info {
  color: #ffffff;
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .newsletter-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .newsletter-actions {
    justify-content: stretch;
  }
  
  .newsletter-actions .btn {
    flex: 1;
  }
}
</style>