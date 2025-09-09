<template>
  <div class="whatsapp-integration">
    <div class="whatsapp-widget">
      <div class="whatsapp-header">
        <h3>💬 WhatsApp Support</h3>
        <button @click="toggleWidget" class="toggle-btn">
          {{ isOpen ? '−' : '+' }}
        </button>
      </div>
      
      <div v-if="isOpen" class="whatsapp-content">
        <div class="whatsapp-info">
          <p>Get instant support via WhatsApp</p>
          <div class="whatsapp-options">
            <button @click="startChat" class="btn btn-whatsapp">
              <i class="icon">💬</i>
              Start Chat
            </button>
            <button @click="sendMessage" class="btn btn-secondary">
              <i class="icon">📱</i>
              Send Message
            </button>
          </div>
        </div>

        <div v-if="showMessageForm" class="message-form">
          <h4>Send us a message</h4>
          <form @submit.prevent="submitMessage">
            <div class="form-group">
              <label>Your Name</label>
              <input 
                v-model="messageForm.name" 
                type="text" 
                class="form-input" 
                required 
                placeholder="Enter your name"
              />
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input 
                v-model="messageForm.phone" 
                type="tel" 
                class="form-input" 
                required 
                placeholder="+27XXXXXXXXX"
              />
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea 
                v-model="messageForm.message" 
                class="form-textarea" 
                rows="4" 
                required 
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="cancelMessage" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" :disabled="sending" class="btn btn-primary">
                {{ sending ? 'Sending...' : 'Send Message' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- WhatsApp Opt-in Toggle -->
    <div v-if="authStore.isAuthenticated" class="whatsapp-opt-in">
      <label class="opt-in-toggle">
        <input 
          v-model="whatsappOptIn" 
          @change="updateOptIn" 
          type="checkbox" 
          class="opt-in-checkbox"
        />
        <span class="opt-in-text">
          📱 Receive order updates via WhatsApp
        </span>
      </label>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

export default {
  name: 'WhatsAppIntegration',
  setup() {
    const authStore = useAuthStore()
    const isOpen = ref(false)
    const showMessageForm = ref(false)
    const sending = ref(false)
    const whatsappOptIn = ref(false)

    const messageForm = ref({
      name: '',
      phone: '',
      message: ''
    })

    const toggleWidget = () => {
      isOpen.value = !isOpen.value
      if (!isOpen.value) {
        showMessageForm.value = false
      }
    }

    const startChat = () => {
      // Open WhatsApp with pre-filled message
      const message = encodeURIComponent('Hi! I need help with my order.')
      const phoneNumber = process.env.VUE_APP_WHATSAPP_PHONE || '+27123456789'
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
    }

    const sendMessage = () => {
      showMessageForm.value = true
      if (authStore.user) {
        messageForm.value.name = `${authStore.user.first_name || ''} ${authStore.user.last_name || ''}`.trim()
      }
    }

    const cancelMessage = () => {
      showMessageForm.value = false
      messageForm.value = {
        name: '',
        phone: '',
        message: ''
      }
    }

    const submitMessage = async () => {
      try {
        sending.value = true
        
        // Send message via API
        await axios.post('/api/whatsapp/send-message', {
          phoneNumber: messageForm.value.phone,
          message: `From: ${messageForm.value.name}\n\n${messageForm.value.message}`
        })

        alert('Message sent successfully! We\'ll get back to you soon.')
        cancelMessage()
      } catch (error) {
        console.error('Failed to send message:', error)
        alert('Failed to send message. Please try again.')
      } finally {
        sending.value = false
      }
    }

    const updateOptIn = async () => {
      try {
        await axios.put('/api/users/profile', {
          whatsapp_opt_in: whatsappOptIn.value
        })
        
        if (whatsappOptIn.value) {
          alert('You\'re now subscribed to WhatsApp notifications!')
        } else {
          alert('You\'ve unsubscribed from WhatsApp notifications.')
        }
      } catch (error) {
        console.error('Failed to update WhatsApp opt-in:', error)
        alert('Failed to update preferences. Please try again.')
      }
    }

    const loadUserPreferences = async () => {
      if (authStore.isAuthenticated && authStore.user) {
        whatsappOptIn.value = authStore.user.whatsapp_opt_in || false
      }
    }

    onMounted(() => {
      loadUserPreferences()
    })

    return {
      authStore,
      isOpen,
      showMessageForm,
      sending,
      whatsappOptIn,
      messageForm,
      toggleWidget,
      startChat,
      sendMessage,
      cancelMessage,
      submitMessage,
      updateOptIn
    }
  }
}
</script>

<style scoped>
.whatsapp-integration {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.whatsapp-widget {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  max-width: 350px;
  overflow: hidden;
}

.whatsapp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.whatsapp-header h3 {
  color: #00ffff;
  margin: 0;
  font-size: 1.1rem;
  text-shadow: 0 0 10px #00ffff;
}

.toggle-btn {
  background: none;
  border: none;
  color: #00ffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(0, 255, 255, 0.2);
}

.whatsapp-content {
  padding: 20px;
}

.whatsapp-info p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
  text-align: center;
}

.whatsapp-options {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.btn-whatsapp {
  background: #25D366;
  color: white;
  border: none;
  flex: 1;
}

.btn-whatsapp:hover {
  background: #1ea952;
  box-shadow: 0 0 15px rgba(37, 211, 102, 0.4);
}

.message-form {
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  padding-top: 20px;
  margin-top: 20px;
}

.message-form h4 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  color: #00ffff;
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
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
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.whatsapp-opt-in {
  margin-top: 15px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.opt-in-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.opt-in-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #00ffff;
}

.opt-in-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: #00ffff;
  color: #000;
}

.btn-primary:hover {
  background: #00e6e6;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #00ffff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .whatsapp-integration {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }
  
  .whatsapp-widget {
    max-width: none;
  }
  
  .whatsapp-options {
    flex-direction: column;
  }
}
</style>