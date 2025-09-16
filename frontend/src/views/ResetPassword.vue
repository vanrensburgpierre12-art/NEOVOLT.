<template>
  <div class="reset-password">
    <div class="container">
      <div class="reset-password-content">
        <div class="reset-password-card">
          <!-- Header -->
          <div class="header">
            <h1 class="title">Reset Password</h1>
            <p class="subtitle">Enter your new password below.</p>
          </div>

          <!-- Success Message -->
          <div v-if="passwordReset" class="success-message">
            <div class="success-icon">
              <div class="checkmark">
                <div class="checkmark-circle"></div>
                <div class="checkmark-stem"></div>
                <div class="checkmark-kick"></div>
              </div>
            </div>
            <h2>Password Reset!</h2>
            <p>Your password has been successfully reset.</p>
            <router-link to="/login" class="btn btn-primary">
              Sign In Now
            </router-link>
          </div>

          <!-- Error Message -->
          <div v-else-if="error" class="error-message">
            <div class="error-icon">⚠️</div>
            <h2>Invalid or Expired Link</h2>
            <p>{{ error }}</p>
            <div class="action-buttons">
              <router-link to="/forgot-password" class="btn btn-primary">
                Request New Link
              </router-link>
              <router-link to="/login" class="btn btn-secondary">
                Back to Login
              </router-link>
            </div>
          </div>

          <!-- Reset Form -->
          <form v-else @submit.prevent="resetPassword" class="reset-form">
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input 
                v-model="password" 
                type="password" 
                class="form-input" 
                placeholder="Enter your new password"
                required 
                :disabled="loading"
                minlength="6"
              />
              <div class="password-requirements">
                <p>Password must be at least 6 characters long</p>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <input 
                v-model="confirmPassword" 
                type="password" 
                class="form-input" 
                placeholder="Confirm your new password"
                required 
                :disabled="loading"
                minlength="6"
              />
              <div v-if="password && confirmPassword && password !== confirmPassword" class="error-text">
                Passwords do not match
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="loading || !password || !confirmPassword || password !== confirmPassword"
              class="btn btn-primary btn-lg w-100"
            >
              {{ loading ? 'Resetting...' : 'Reset Password' }}
            </button>

            <div class="form-footer">
              <p>Remember your password?</p>
              <router-link to="/login" class="link">Sign in instead</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useNotificationsStore } from '../stores/notifications'

export default {
  name: 'ResetPassword',
  setup() {
    const route = useRoute()
    const notificationsStore = useNotificationsStore()
    
    const password = ref('')
    const confirmPassword = ref('')
    const loading = ref(false)
    const passwordReset = ref(false)
    const error = ref('')
    const token = ref('')

    const resetPassword = async () => {
      if (!password.value || !confirmPassword.value) return
      if (password.value !== confirmPassword.value) return

      loading.value = true
      try {
        await axios.post('/api/auth/reset-password', {
          token: token.value,
          password: password.value
        })
        
        passwordReset.value = true
        notificationsStore.success('Password Reset', 'Your password has been successfully reset')
      } catch (error) {
        notificationsStore.error('Error', error.response?.data?.message || 'Failed to reset password')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      token.value = route.query.token || route.params.token
      if (!token.value) {
        error.value = 'Invalid reset link. Please request a new password reset.'
      }
    })

    return {
      password,
      confirmPassword,
      loading,
      passwordReset,
      error,
      resetPassword
    }
  }
}
</script>

<style scoped>
.reset-password {
  padding: 60px 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-password-content {
  max-width: 500px;
  width: 100%;
}

.reset-password-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 2.5rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin-bottom: 15px;
  font-family: 'Orbitron', monospace;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.5;
}

.reset-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #00ffff;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-requirements {
  margin-top: 8px;
}

.password-requirements p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.error-text {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: 8px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.form-footer p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.link {
  color: #00ffff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.link:hover {
  text-shadow: 0 0 5px #00ffff;
}

.success-message {
  text-align: center;
}

.success-icon {
  margin-bottom: 30px;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 3;
  stroke: #00ffff;
  stroke-miterlimit: 10;
  margin: 0 auto;
  position: relative;
  animation: checkmark-pulse 2s ease-in-out infinite;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #00ffff;
  fill: none;
  animation: checkmark-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-stem {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: #00ffff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-miterlimit: 10;
  animation: checkmark-stem 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

.checkmark-kick {
  transform-origin: 50% 50%;
  stroke-dasharray: 29;
  stroke-dashoffset: 29;
  stroke: #00ffff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-miterlimit: 10;
  animation: checkmark-kick 0.2s cubic-bezier(0.65, 0, 0.45, 1) 1.1s forwards;
}

@keyframes checkmark-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes checkmark-circle {
  0% { stroke-dashoffset: 166; }
  100% { stroke-dashoffset: 0; }
}

@keyframes checkmark-stem {
  0% { stroke-dashoffset: 48; }
  100% { stroke-dashoffset: 0; }
}

@keyframes checkmark-kick {
  0% { stroke-dashoffset: 29; }
  100% { stroke-dashoffset: 0; }
}

.success-message h2 {
  color: #00ffff;
  font-size: 2rem;
  margin-bottom: 15px;
  font-family: 'Orbitron', monospace;
}

.success-message p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  line-height: 1.5;
}

.error-message {
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-message h2 {
  color: #ff6b6b;
  font-size: 2rem;
  margin-bottom: 15px;
  font-family: 'Orbitron', monospace;
}

.error-message p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.w-100 {
  width: 100%;
}

@media (max-width: 768px) {
  .reset-password-card {
    padding: 20px;
    margin: 20px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
}
</style>