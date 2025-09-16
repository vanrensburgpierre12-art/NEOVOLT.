<template>
  <div id="app">
    <!-- Tron Background -->
    <div class="tron-bg">
      <div class="tron-lines"></div>
      <div class="tron-glow"></div>
    </div>

    <!-- Navigation -->
    <Navbar />

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- WhatsApp Integration -->
    <WhatsAppIntegration />

    <!-- Notification Container -->
    <NotificationContainer />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import WhatsAppIntegration from './components/WhatsAppIntegration.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import { useMeta } from './composables/useMeta'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    WhatsAppIntegration,
    NotificationContainer
  },
  setup() {
    const { initializeMeta } = useMeta()

    onMounted(() => {
      initializeMeta()
    })
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}
</style>