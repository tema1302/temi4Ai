<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import CookieConsent from '@/shared/ui/CookieConsent.vue'
import Logo from '@/shared/ui/Logo.vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  Settings, 
  LogOut, 
  Library, 
  CreditCard,
  PenLine
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { usePermissionsStore } from '@/modules/access/store/usePermissionsStore'

interface Props {
  fullHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fullHeight: false
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const memoryStore = useMemoryStore()
const permissions = usePermissionsStore()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

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

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleLogout = async () => {
  await authStore.signOut()
  memoryStore.logoutReset()
  permissions.resetPermissions()
  router.push('/')
  isMobileMenuOpen.value = false
  isUserMenuOpen.value = false
}

const navigateTo = (path: string) => {
  router.push(path)
  isUserMenuOpen.value = false
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div 
    class="min-h-screen bg-obsidian text-silk font-sans selection:bg-gold/30 overflow-x-hidden relative flex flex-col" 
    :class="{ 'h-screen overflow-hidden': props.fullHeight }"
  >
    
    <!-- Navigation Header -->
    <header 
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent"
      :class="[
        (isScrolled || props.fullHeight) ? 'bg-obsidian/80 backdrop-blur-md border-white/10 py-3' : 'bg-transparent py-6',
        isMobileMenuOpen ? 'bg-obsidian border-white/10' : ''
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <!-- Logo -->
        <a href="/" class="z-50 relative">
          <Logo />
        </a>

        <!-- Desktop Nav -->
        <nav v-if="!props.fullHeight" class="hidden md:flex items-center gap-8 text-sm font-medium">
          <button @click="scrollToSection('about')" class="text-gray-400 hover:text-gold transition-colors">О сервисе</button>
          <button @click="scrollToSection('features')" class="text-gray-400 hover:text-gold transition-colors">Возможности</button>
          <button @click="scrollToSection('pricing')" class="text-gray-400 hover:text-gold transition-colors">Тарифы</button>
        </nav>

        <!-- CTA / User Menu (Desktop) -->
        <div class="hidden md:flex items-center gap-4 relative">
          <template v-if="!authStore.isAuthenticated">
            <button 
              class="text-sm text-silk hover:text-gold transition-colors font-medium border border-white/10 px-4 py-2 rounded-full"
              @click="router.push('/auth')"
            >
              Войти
            </button>
            <BaseButton size="sm" @click="router.push('/auth')">
              Создать архив
            </BaseButton>
          </template>
          <template v-else>
            <!-- User Menu Trigger -->
            <button 
              class="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-gold/50 transition-all group"
              @click="toggleUserMenu"
            >
              <div class="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
                <User class="w-4 h-4" />
              </div>
              <span class="text-sm font-medium text-silk">{{ authStore.userName }}</span>
              <ChevronDown class="w-4 h-4 text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': isUserMenuOpen }" />
            </button>

            <!-- User Dropdown Menu (Desktop) -->
            <transition name="fade">
              <div v-if="isUserMenuOpen" class="absolute top-full right-0 mt-2 w-56 bg-charcoal border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                <button @click="navigateTo('/editor')" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors">
                  <PenLine class="w-4 h-4" />
                  Мои архивы
                </button>
                <button @click="navigateTo('/settings')" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors">
                  <Settings class="w-4 h-4" />
                  Настройки
                </button>
                <button @click="scrollToSection('pricing')" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors">
                  <CreditCard class="w-4 h-4" />
                  Тарифы
                </button>
                <div class="h-px bg-white/5 my-1"></div>
                <button @click="handleLogout" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                  <LogOut class="w-4 h-4" />
                  Выйти из аккаунта
                </button>
              </div>
            </transition>
          </template>
        </div>

        <!-- Mobile Header Actions -->
        <div class="flex items-center gap-2 md:hidden z-50 relative">
          <template v-if="authStore.isAuthenticated">
            <!-- Mobile Auth User: show name + icon + arrow -->
            <button 
              class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-all"
              @click="toggleUserMenu"
            >
              <div class="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <User class="w-3.5 h-3.5" />
              </div>
              <span class="text-xs font-medium text-silk max-w-[80px] truncate">{{ authStore.userName }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': isUserMenuOpen }" />
            </button>
          </template>
          <template v-else>
            <!-- Mobile Guest: show burger -->
            <button 
              class="text-silk p-2"
              @click="toggleMobileMenu"
            >
              <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
              <X v-else class="w-6 h-6" />
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Mobile Dropdown Menu (Overlay-like for authenticated) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="isUserMenuOpen" class="fixed inset-0 z-[100] md:hidden">
          <div class="absolute inset-0 bg-obsidian/60 backdrop-blur-sm" @click="isUserMenuOpen = false"></div>
          <div class="absolute top-[70px] right-4 left-4 bg-charcoal border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-slide-down">
            <button @click="navigateTo('/editor')" class="w-full px-6 py-4 flex items-center gap-4 text-silk hover:bg-white/5 active:bg-white/10 transition-colors">
              <PenLine class="w-5 h-5 text-gold" />
              <span class="font-serif">Мои архивы</span>
            </button>
            <button @click="navigateTo('/settings')" class="w-full px-6 py-4 flex items-center gap-4 text-silk hover:bg-white/5 active:bg-white/10 transition-colors">
              <Settings class="w-5 h-5 text-gold" />
              <span class="font-serif">Настройки</span>
            </button>
            <button @click="navigateTo('/'); scrollToSection('pricing')" class="w-full px-6 py-4 flex items-center gap-4 text-silk hover:bg-white/5 active:bg-white/10 transition-colors">
              <CreditCard class="w-5 h-5 text-gold" />
              <span class="font-serif">Тарифы</span>
            </button>
            <div class="h-px bg-white/5 mx-6 my-2"></div>
            <button @click="handleLogout" class="w-full px-6 py-4 flex items-center gap-4 text-red-400 hover:bg-red-400/10 active:bg-red-400/20 transition-colors">
              <LogOut class="w-5 h-5" />
              <span class="font-serif font-bold">Выйти из аккаунта</span>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Guest Mobile Menu Overlay (Burger) -->
    <Teleport to="body">
      <transition name="fade">
        <div 
          v-if="isMobileMenuOpen && !authStore.isAuthenticated"
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
            <BaseButton :full="true" size="lg" @click="router.push('/auth'); isMobileMenuOpen = false">
              Создать архив
            </BaseButton>
            <button 
              class="text-silk hover:text-gold transition-colors text-xl font-medium"
              @click="router.push('/auth'); isMobileMenuOpen = false"
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
    <main 
      class="flex-1"
      :class="[
        props.fullHeight ? 'pt-[64px] overflow-hidden' : 'pt-20 md:pt-20'
      ]"
    >
      <slot />
    </main>

    <!-- Footer -->
    <TheFooter v-if="!props.fullHeight" />

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

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out forwards;
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
