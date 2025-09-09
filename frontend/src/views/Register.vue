<template>
  <div class="register">
    <div class="container">
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Register</h1>
          <p class="auth-subtitle">Join Neovolt today</p>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input 
                  v-model="form.firstName" 
                  type="text" 
                  class="form-input" 
                  required 
                  placeholder="First name"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input 
                  v-model="form.lastName" 
                  type="text" 
                  class="form-input" 
                  required 
                  placeholder="Last name"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                class="form-input" 
                required 
                placeholder="Enter your email"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                class="form-input" 
                placeholder="Phone number (optional)"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input 
                v-model="form.password" 
                type="password" 
                class="form-input" 
                required 
                placeholder="Create a password"
                minlength="6"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input 
                v-model="form.confirmPassword" 
                type="password" 
                class="form-input" 
                required 
                placeholder="Confirm your password"
              />
            </div>

            <button 
              type="submit" 
              :disabled="loading || form.password !== form.confirmPassword"
              class="btn btn-primary btn-lg w-100"
            >
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <router-link to="/login" class="auth-link">Login here</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    })

    const loading = ref(false)

    const handleRegister = async () => {
      if (form.value.password !== form.value.confirmPassword) {
        alert('Passwords do not match')
        return
      }

      loading.value = true

      const result = await authStore.register({
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        phone: form.value.phone,
        password: form.value.password
      })

      if (result.success) {
        router.push('/')
      } else {
        alert(result.message)
      }

      loading.value = false
    }

    return {
      form,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register {
  padding: 60px 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.auth-container {
  max-width: 500px;
  margin: 0 auto;
}

.auth-card {
  background: rgba(26, 26, 46, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.auth-title {
  font-size: 2.5rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  text-align: center;
  margin-bottom: 10px;
}

.auth-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 30px;
}

.auth-form {
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.auth-footer {
  text-align: center;
}

.auth-footer p {
  color: rgba(255, 255, 255, 0.8);
}

.auth-link {
  color: #00ffff;
  text-decoration: none;
  transition: all 0.3s ease;
}

.auth-link:hover {
  text-shadow: 0 0 5px #00ffff;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>