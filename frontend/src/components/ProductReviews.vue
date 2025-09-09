<template>
  <div class="product-reviews">
    <div class="reviews-header">
      <h3>Customer Reviews</h3>
      <div class="reviews-summary">
        <div class="rating-overview">
          <div class="average-rating">
            <span class="rating-number">{{ averageRating }}</span>
            <div class="stars">
              <span 
                v-for="star in 5" 
                :key="star" 
                class="star"
                :class="{ 'filled': star <= Math.round(averageRating) }"
              >
                ★
              </span>
            </div>
            <span class="review-count">({{ totalReviews }} reviews)</span>
          </div>
        </div>
        
        <div class="rating-breakdown">
          <div 
            v-for="rating in 5" 
            :key="rating" 
            class="rating-bar"
            @click="filterByRating(rating)"
          >
            <span class="rating-label">{{ rating }}★</span>
            <div class="bar-container">
              <div 
                class="bar-fill" 
                :style="{ width: getRatingPercentage(rating) + '%' }"
              ></div>
            </div>
            <span class="rating-count">{{ ratingDistribution[rating] || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Buttons -->
    <div class="review-filters">
      <button 
        @click="clearFilter"
        class="filter-btn"
        :class="{ active: !selectedRating }"
      >
        All Reviews
      </button>
      <button 
        v-for="rating in 5" 
        :key="rating"
        @click="filterByRating(rating)"
        class="filter-btn"
        :class="{ active: selectedRating === rating }"
      >
        {{ rating }}★ ({{ ratingDistribution[rating] || 0 }})
      </button>
    </div>

    <!-- Reviews List -->
    <div class="reviews-list">
      <div v-if="loading" class="loading">
        <p>Loading reviews...</p>
      </div>
      
      <div v-else-if="reviews.length === 0" class="no-reviews">
        <p>No reviews found for this product.</p>
      </div>
      
      <div v-else>
        <div 
          v-for="review in reviews" 
          :key="review.id" 
          class="review-item"
        >
          <div class="review-header">
            <div class="reviewer-info">
              <h4 class="reviewer-name">{{ review.first_name }} {{ review.last_name }}</h4>
              <div class="review-meta">
                <div class="stars">
                  <span 
                    v-for="star in 5" 
                    :key="star" 
                    class="star"
                    :class="{ 'filled': star <= review.rating }"
                  >
                    ★
                  </span>
                </div>
                <span class="review-date">{{ formatDate(review.created_at) }}</span>
                <span v-if="review.is_verified" class="verified-badge">Verified Purchase</span>
              </div>
            </div>
          </div>
          
          <div class="review-content">
            <h5 class="review-title">{{ review.title }}</h5>
            <p class="review-comment">{{ review.comment }}</p>
          </div>
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
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useReviewsStore } from '../stores/reviews'

export default {
  name: 'ProductReviews',
  props: {
    productId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const reviewsStore = useReviewsStore()
    const selectedRating = ref(null)

    const reviews = computed(() => reviewsStore.reviews)
    const ratingDistribution = computed(() => reviewsStore.ratingDistribution)
    const pagination = computed(() => reviewsStore.pagination)
    const loading = computed(() => reviewsStore.loading)
    const averageRating = computed(() => {
      if (reviews.value.length === 0) return 0
      const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
      return (sum / reviews.value.length).toFixed(1)
    })
    const totalReviews = computed(() => reviews.value.length)

    const loadReviews = async (page = 1, rating = null) => {
      try {
        await reviewsStore.fetchProductReviews(props.productId, page, rating)
      } catch (error) {
        console.error('Failed to load reviews:', error)
      }
    }

    const filterByRating = (rating) => {
      selectedRating.value = selectedRating.value === rating ? null : rating
      loadReviews(1, selectedRating.value)
    }

    const clearFilter = () => {
      selectedRating.value = null
      loadReviews(1)
    }

    const goToPage = (page) => {
      loadReviews(page, selectedRating.value)
    }

    const getRatingPercentage = (rating) => {
      const count = ratingDistribution.value[rating] || 0
      const total = totalReviews.value
      return total > 0 ? (count / total) * 100 : 0
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      loadReviews()
    })

    watch(() => props.productId, () => {
      selectedRating.value = null
      loadReviews()
    })

    return {
      reviews,
      ratingDistribution,
      pagination,
      loading,
      averageRating,
      totalReviews,
      selectedRating,
      filterByRating,
      clearFilter,
      goToPage,
      getRatingPercentage,
      formatDate
    }
  }
}
</script>

<style scoped>
.product-reviews {
  margin-top: 40px;
  padding: 30px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
}

.reviews-header {
  margin-bottom: 30px;
}

.reviews-header h3 {
  color: #00ffff;
  font-size: 1.8rem;
  margin-bottom: 20px;
}

.reviews-summary {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  align-items: start;
}

.rating-overview {
  text-align: center;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.rating-number {
  font-size: 3rem;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.star.filled {
  color: #ffc107;
  text-shadow: 0 0 10px #ffc107;
}

.review-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.rating-breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rating-bar {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  gap: 15px;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.rating-bar:hover {
  background: rgba(0, 255, 255, 0.1);
}

.rating-label {
  color: #00ffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.bar-container {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #0080ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.rating-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-align: right;
}

.review-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  border-color: #00ffff;
  color: #00ffff;
}

.filter-btn.active {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  color: #00ffff;
}

.reviews-list {
  margin-bottom: 30px;
}

.loading, .no-reviews {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.8);
}

.review-item {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.review-item:hover {
  background: rgba(0, 255, 255, 0.05);
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  margin-bottom: 15px;
}

.reviewer-name {
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.review-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.verified-badge {
  background: rgba(40, 167, 69, 0.2);
  color: #28a745;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #28a745;
}

.review-content {
  margin-top: 10px;
}

.review-title {
  color: #00ffff;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.review-comment {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
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

@media (max-width: 768px) {
  .reviews-summary {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .review-filters {
    justify-content: center;
  }
  
  .review-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
}
</style>