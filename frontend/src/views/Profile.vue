<template>
  <div class="profile">
    <div class="container">
      <h1 class="page-title">Profile</h1>

      <div class="profile-content">
        <!-- Profile Information -->
        <div class="profile-section">
          <h2>Personal Information</h2>
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input 
                  v-model="profileForm.firstName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input 
                  v-model="profileForm.lastName" 
                  type="text" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                v-model="profileForm.email" 
                type="email" 
                class="form-input" 
                disabled 
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone</label>
              <input 
                v-model="profileForm.phone" 
                type="tel" 
                class="form-input" 
              />
            </div>

            <button 
              type="submit" 
              :disabled="updating"
              class="btn btn-primary"
            >
              {{ updating ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="profile-section">
          <h2>Change Password</h2>
          <form @submit.prevent="changePassword" class="profile-form">
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <input 
                v-model="passwordForm.currentPassword" 
                type="password" 
                class="form-input" 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label">New Password</label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password" 
                class="form-input" 
                required 
                minlength="6"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                class="form-input" 
                required 
              />
            </div>

            <button 
              type="submit" 
              :disabled="changingPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
              class="btn btn-primary"
            >
              {{ changingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </form>
        </div>

        <!-- Account Statistics -->
        <div class="profile-section">
          <h2>Account Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ userStats.orderCount }}</div>
              <div class="stat-label">Total Orders</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ formatCurrency(userStats.totalSpent) }}</div>
              <div class="stat-label">Total Spent</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ userStats.cartItemCount }}</div>
              <div class="stat-label">Items in Cart</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { formatCurrency } from '../utils/currency'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()

    const profileForm = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    })

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const userStats = ref({
      orderCount: 0,
      totalSpent: 0,
      cartItemCount: 0
    })

    const updating = ref(false)
    const changingPassword = ref(false)

    const updateProfile = async () => {
      updating.value = true

      const result = await authStore.updateProfile({
        firstName: profileForm.value.firstName,
        lastName: profileForm.value.lastName,
        phone: profileForm.value.phone
      })

      if (result.success) {
        alert('Profile updated successfully')
      } else {
        alert(result.message)
      }

      updating.value = false
    }

    const changePassword = async () => {
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert('New passwords do not match')
        return
      }

      changingPassword.value = true

      const result = await authStore.changePassword({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })

      if (result.success) {
        alert('Password changed successfully')
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      } else {
        alert(result.message)
      }

      changingPassword.value = false
    }

    const loadUserStats = async () => {
      try {
        const response = await axios.get('/api/users/stats')
        userStats.value = response.data
      } catch (error) {
        console.error('Failed to load user stats:', error)
      }
    }

    onMounted(() => {
      if (authStore.user) {
        profileForm.value = {
          firstName: authStore.user.firstName || '',
          lastName: authStore.user.lastName || '',
          email: authStore.user.email || '',
          phone: authStore.user.phone || ''
        }
      }
      loadUserStats()
    })

    return {
      profileForm,
      passwordForm,
      userStats,
      updating,
      changingPassword,
      updateProfile,
      changePassword,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.profile {
  padding: 40px 0;
  min-height: 80vh;
}

.page-title {
  font-size: 3rem;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
  margin-bottom: 40px;
  text-align: center;
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
}

.profile-section {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 30px;
}

.profile-section h2 {
  color: #00ffff;
  margin-bottom: 30px;
  font-size: 1.8rem;
}

.profile-form {
  margin-bottom: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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

.form-input:disabled {
  background: rgba(26, 26, 46, 0.5);
  color: rgba(255, 255, 255, 0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
  margin-bottom: 10px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .profile-section {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>