<template>
  <div class="review-form">
    <h3>Write a Review</h3>
    
    <form @submit.prevent="submitReview" class="form">
      <div class="form-group">
        <label class="form-label">Rating *</label>
        <div class="rating-input">
          <span 
            v-for="star in 5" 
            :key="star" 
            class="star"
            :class="{ 'filled': star <= rating }"
            @click="setRating(star)"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
          >
            ★
          </span>
        </div>
        <span class="rating-text">{{ getRatingText(rating) }}</span>
      </div>

      <div class="form-group">
        <label class="form-label">Review Title *</label>
        <input 
          v-model="form.title"
          type="text" 
          class="form-input" 
          placeholder="Summarize your review in a few words"
          required
          maxlength="255"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Your Review</label>
        <textarea 
          v-model="form.comment"
          class="form-input" 
          rows="4"
          placeholder="Tell others about your experience with this product"
          maxlength="1000"
        ></textarea>
        <div class="character-count">{{ form.comment.length }}/1000</div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          @click="cancelReview" 
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          :disabled="submitting || !rating || !form.title.trim()"
          class="btn btn-primary"
        >
          {{ submitting ? 'Submitting...' : 'Submit Review' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useReviewsStore } from '../stores/reviews'

export default {
  name: 'ReviewForm',
  props: {
    productId: {
      type: [String, Number],
      required: true
    },
    onReviewSubmitted: {
      type: Function,
      default: () => {}
    },
    onCancel: {
      type: Function,
      default: () => {}
    }
  },
  setup(props) {
    const reviewsStore = useReviewsStore()
    const rating = ref(0)
    const hoverRating = ref(0)
    const submitting = ref(false)

    const form = reactive({
      title: '',
      comment: ''
    })

    const setRating = (star) => {
      rating.value = star
    }

    const getRatingText = (rating) => {
      const texts = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
      }
      return texts[rating] || ''
    }

    const submitReview = async () => {
      if (!rating.value || !form.title.trim()) return

      submitting.value = true
      try {
        await reviewsStore.createReview({
          productId: props.productId,
          rating: rating.value,
          title: form.title.trim(),
          comment: form.comment.trim()
        })

        // Reset form
        rating.value = 0
        form.title = ''
        form.comment = ''

        // Notify parent component
        props.onReviewSubmitted()
      } catch (error) {
        console.error('Failed to submit review:', error)
        alert('Failed to submit review. Please try again.')
      } finally {
        submitting.value = false
      }
    }

    const cancelReview = () => {
      rating.value = 0
      form.title = ''
      form.comment = ''
      props.onCancel()
    }

    return {
      rating,
      hoverRating,
      form,
      submitting,
      setRating,
      getRatingText,
      submitReview,
      cancelReview
    }
  }
}
</script>

<style scoped>
.review-form {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  margin-top: 30px;
}

.review-form h3 {
  color: #00ffff;
  font-size: 1.5rem;
  margin-bottom: 25px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  color: #00ffff;
  font-weight: 600;
  font-size: 1rem;
}

.rating-input {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

.star {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.star:hover {
  transform: scale(1.1);
}

.star.filled {
  color: #ffc107;
  text-shadow: 0 0 10px #ffc107;
}

.rating-text {
  color: #ffc107;
  font-weight: 600;
  font-size: 1.1rem;
}

.form-input {
  padding: 12px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.character-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.btn-primary {
  background: linear-gradient(45deg, #00ffff, #0080ff);
  color: #000000;
  font-weight: 700;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, #00e6e6, #0066cc);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .rating-input {
    justify-content: center;
  }
  
  .star {
    font-size: 1.8rem;
  }
}
</style>