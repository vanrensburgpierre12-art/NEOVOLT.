<template>
  <div class="forgot-password">
    <div class="container">
      <div class="forgot-password-content">
        <div class="forgot-password-card">
          <!-- Header -->
          <div class="header">
            <h1 class="title">Reset Password</h1>
            <p class="subtitle">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <!-- Success Message -->
          <div v-if="emailSent" class="success-message">
            <div class="success-icon">
              <div class="checkmark">
                <div class="checkmark-circle"></div>
                <div class="checkmark-stem"></div>
                <div class="checkmark-kick"></div>
              </div>
            </div>
            <h2>Email Sent!</h2>
            <p>We've sent a password reset link to <strong>{{ email }}</strong></p>
            <p class="note">Please check your email and follow the instructions to reset your password.</p>
            <div class="action-buttons">
              <button @click="resendEmail" :disabled="resending" class="btn btn-secondary">
                {{ resending ? 'Sending...' : 'Resend Email' }}
              </button>
              <router-link to="/login" class="btn btn-primary">
                Back to Login
              </router-link>
            </div>
          </div>

          <!-- Reset Form -->
          <form v-else @submit.prevent="sendResetEmail" class="reset-form">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input 
                v-model="email" 
                type="email" 
                class="form-input" 
                placeholder="Enter your email address"
                required 
                :disabled="loading"
              />
            </div>

            <button 
              type="submit" 
              :disabled="loading || !email"
              class="btn btn-primary btn-lg w-100"
            >
              {{ loading ? 'Sending...' : 'Send Reset Link' }}
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
import { ref } from 'vue'
import axios from 'axios'
import { useNotificationsStore } from '../stores/notifications'

export default {
  name: 'ForgotPassword',
  setup() {
    const notificationsStore = useNotificationsStore()
    
    const email = ref('')
    const loading = ref(false)
    const emailSent = ref(false)
    const resending = ref(false)

    const sendResetEmail = async () => {
      if (!email.value) return

      loading.value = true
      try {
        await axios.post('/api/auth/forgot-password', {
          email: email.value
        })
        
        emailSent.value = true
        notificationsStore.success('Email Sent', 'Password reset link has been sent to your email')
      } catch (error) {
        notificationsStore.error('Error', error.response?.data?.message || 'Failed to send reset email')
      } finally {
        loading.value = false
      }
    }

    const resendEmail = async () => {
      resending.value = true
      try {
        await axios.post('/api/auth/forgot-password', {
          email: email.value
        })
        
        notificationsStore.success('Email Sent', 'Password reset link has been resent to your email')
      } catch (error) {
        notificationsStore.error('Error', error.response?.data?.message || 'Failed to resend email')
      } finally {
        resending.value = false
      }
    }

    return {
      email,
      loading,
      emailSent,
      resending,
      sendResetEmail,
      resendEmail
    }
  }
}
</script>

<style scoped>
.forgot-password {
  padding: 60px 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot-password-content {
  max-width: 500px;
  width: 100%;
}

.forgot-password-card {
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
  margin-bottom: 15px;
  line-height: 1.5;
}

.note {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 30px;
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
  .forgot-password-card {
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