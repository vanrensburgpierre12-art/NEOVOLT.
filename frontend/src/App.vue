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

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import WhatsAppIntegration from './components/WhatsAppIntegration.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    WhatsAppIntegration
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}
</style>