import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import pwaManager from './utils/pwa'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// Register PWA service worker
if (process.env.NODE_ENV === 'production') {
  pwaManager.register().then((registration) => {
    if (registration) {
      console.log('PWA Service Worker registered successfully')
    }
  })
}