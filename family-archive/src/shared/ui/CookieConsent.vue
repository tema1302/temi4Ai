<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import { useGtag } from 'vue-gtag-next'

const isOpen = ref(false)
const gtag = useGtag()

onMounted(() => {
  const consent = localStorage.getItem('cookie-consent')
  if (!consent) {
    isOpen.value = true
  } else if (consent === 'accepted') {
    enableAnalytics()
  }
})

const accept = () => {
  localStorage.setItem('cookie-consent', 'accepted')
  isOpen.value = false
  enableAnalytics()
}

const enableAnalytics = () => {
  try {
    if (gtag && typeof gtag.optIn === 'function') {
      gtag.optIn()
      console.log('Analytics opt-in successful')
    } else {
      console.warn('Google Analytics not initialized correctly')
    }
  } catch (e) {
    console.error('Analytics opt-in failed', e)
  }
}
</script>

<template>
  <div v-if="isOpen" class="cookie-consent fixed bottom-0 left-0 right-0 bg-charcoal border-t border-white/10 p-4 z-50 animate-slide-up">
    <div class="cookie-consent__inner container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="cookie-consent__text text-sm text-gray-400 text-center md:text-left">
        Мы используем файлы <router-link to="/cookie-rules" class="cookie-consent__link text-gold hover:underline">Cookie</router-link> для анализа работы сервиса.
        Продолжая, вы соглашаетесь с нашей
        <router-link to="/privacy" class="cookie-consent__link text-gold hover:underline">политикой конфиденциальности</router-link>.
      </p>
      <BaseButton size="sm" @click="accept">
        Хорошо
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.cookie-consent {
  animation: slideUp 0.5s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
