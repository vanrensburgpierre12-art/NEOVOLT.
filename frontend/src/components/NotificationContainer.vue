<template>
  <div class="notification-container">
    <NotificationToast
      v-for="toast in notificationsStore.toasts"
      :key="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :auto-close="toast.autoClose"
      @close="notificationsStore.removeToast(toast.id)"
    />
  </div>
</template>

<script>
import { useNotificationsStore } from '../stores/notifications'
import NotificationToast from './NotificationToast.vue'

export default {
  name: 'NotificationContainer',
  components: {
    NotificationToast
  },
  setup() {
    const notificationsStore = useNotificationsStore()
    
    return {
      notificationsStore
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
}
</style>