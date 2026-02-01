<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import CookieConsent from '@/shared/ui/CookieConsent.vue'
import { useRouter } from 'vue-router'
import { Menu, X } from 'lucide-vue-next'

const router = useRouter()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const scrollToSection = (id: string) => {
  isMobileMenuOpen.value = false
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  } else if (window.location.pathname !== '/') {
    router.push('/#' + id)
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-obsidian text-silk font-sans selection:bg-gold/30 overflow-x-hidden relative flex flex-col">
    
    <!-- Navigation Header -->
    <header 
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent"
      :class="[
        isScrolled ? 'bg-obsidian/80 backdrop-blur-md border-white/10 py-3' : 'bg-transparent py-6',
        isMobileMenuOpen ? 'bg-obsidian border-white/10' : ''
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <!-- Logo -->
        <a href="/" class="text-xl font-serif font-bold text-silk flex items-center gap-2 z-50 relative">
          <span class="text-2xl">🏛️</span>
          <span>Family<span class="text-gold">Archive</span></span>
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
          <button @click="scrollToSection('about')" class="text-gray-400 hover:text-gold transition-colors">О сервисе</button>
          <button @click="scrollToSection('features')" class="text-gray-400 hover:text-gold transition-colors">Возможности</button>
          <button @click="scrollToSection('pricing')" class="text-gray-400 hover:text-gold transition-colors">Тарифы</button>
        </nav>

        <!-- CTA (Desktop) -->
        <div class="hidden md:flex items-center gap-4">
          <button 
            class="text-sm text-silk hover:text-gold transition-colors font-medium"
            @click="router.push('/auth')"
          >
            Войти
          </button>
          <BaseButton size="sm" @click="router.push('/auth')">
            Создать архив
          </BaseButton>
        </div>

        <!-- Mobile Menu Button -->
        <button 
          class="md:hidden z-50 relative text-silk p-2"
          @click="toggleMobileMenu"
        >
          <Menu />
        </button>
      </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <Teleport to="body">
      <transition name="fade">
        <div 
          v-if="isMobileMenuOpen"
          class="fixed inset-0 bg-obsidian z-[100] flex flex-col items-center justify-center space-y-8 md:hidden overflow-y-auto"
        >
          <!-- Close Button -->
          <button 
            class="absolute top-6 right-6 text-silk p-2 hover:text-gold transition-colors"
            @click="toggleMobileMenu"
          >
            <X class="w-8 h-8" />
          </button>

          <button @click="scrollToSection('about')" class="text-3xl font-serif text-silk hover:text-gold transition-colors">О сервисе</button>
          <button @click="scrollToSection('features')" class="text-3xl font-serif text-silk hover:text-gold transition-colors">Возможности</button>
          <button @click="scrollToSection('pricing')" class="text-3xl font-serif text-silk hover:text-gold transition-colors">Тарифы</button>
          
          <div class="flex flex-col gap-6 mt-12 w-full max-w-xs px-4">
            <BaseButton :full="true" size="lg" @click="router.push('/auth')">
              Создать архив
            </BaseButton>
            <button 
              class="text-silk hover:text-gold transition-colors text-xl font-medium"
              @click="router.push('/auth')"
            >
              Войти
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Global Ambient Lights -->
    <div class="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50 animate-pulse-slow"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gold/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50"></div>

    <!-- Content Slot -->
    <main class="flex-1 pt-20 md:pt-20">
      <slot />
    </main>

    <!-- Footer -->
    <TheFooter />

    <!-- Analytics Consent -->
    <CookieConsent />

  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
