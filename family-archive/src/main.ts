import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import VueGtag, { trackRouter } from 'vue-gtag-next'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(MotionPlugin)

// Analytics
app.use(VueGtag, {
  property: { 
    id: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    params: {
      anonymize_ip: true
    }
  },
  enabled: false // Wait for consent
})

trackRouter(router)

// Initialize auth before mounting
const authStore = useAuthStore()
authStore.initialize().then(() => {
  app.mount('#app')
})
