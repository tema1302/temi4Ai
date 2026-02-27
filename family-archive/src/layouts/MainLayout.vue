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
  CreditCard,
  PenLine,
  Info,
  Sparkles,
  DollarSign
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

// Close menus on outside click
const closeAllMenus = () => {
  isUserMenuOpen.value = false
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', closeAllMenus)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', closeAllMenus)
})

const scrollToSection = (id: string) => {
  isMobileMenuOpen.value = false
  isUserMenuOpen.value = false

  // If not on landing page, navigate there first
  if (route.path !== '/') {
    router.push('/#' + id)
    return
  }

  // On landing page - scroll to section
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleUserMenu = (e: Event) => {
  e.stopPropagation()
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

// Nav items for mobile menu
const navItems = [
  { id: 'about', label: 'О сервисе', icon: Info },
  { id: 'features', label: 'Возможности', icon: Sparkles },
  { id: 'pricing', label: 'Тарифы', icon: DollarSign }
]
</script>

<template>
  <div
    class="min-h-screen bg-obsidian text-silk font-sans selection:bg-gold/30 overflow-x-hidden relative flex flex-col"
    :class="{ 'h-screen overflow-hidden': props.fullHeight || isMobileMenuOpen }"
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

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-3">
          <!-- Landing Page Navigation -->
          <template v-if="!props.fullHeight">
            <!-- Guest User -->
            <template v-if="!authStore.isAuthenticated">
              <!-- Nav Links -->
              <nav class="flex items-center gap-6 text-sm font-medium mr-4">
                <button @click="scrollToSection('about')" class="text-gray-400 hover:text-gold transition-colors">О сервисе</button>
                <button @click="scrollToSection('features')" class="text-gray-400 hover:text-gold transition-colors">Возможности</button>
                <button @click="scrollToSection('pricing')" class="text-gray-400 hover:text-gold transition-colors">Тарифы</button>
              </nav>

              <!-- CTA Buttons -->
              <BaseButton size="sm" @click="router.push('/auth?mode=signup')">
                Создать архив
              </BaseButton>
              <BaseButton variant="outline" size="sm" @click="router.push('/auth?mode=login')">
                Войти
              </BaseButton>
            </template>

            <!-- Authenticated User on Landing -->
            <template v-else>
              <!-- Nav Links -->
              <nav class="flex items-center gap-6 text-sm font-medium mr-4">
                <button @click="scrollToSection('about')" class="text-gray-400 hover:text-gold transition-colors">О сервисе</button>
                <button @click="scrollToSection('features')" class="text-gray-400 hover:text-gold transition-colors">Возможности</button>
                <button @click="scrollToSection('pricing')" class="text-gray-400 hover:text-gold transition-colors">Тарифы</button>
              </nav>

              <!-- User Menu -->
              <div class="relative">
                <button
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-gold/50 transition-all group"
                  @click="toggleUserMenu"
                >
                  <div class="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
                    <User class="w-4 h-4" />
                  </div>
                  <span class="text-sm font-medium text-silk max-w-[120px] truncate">{{ authStore.userName }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': isUserMenuOpen }" />
                </button>

                <!-- User Dropdown Menu -->
                <transition name="dropdown">
                  <div
                    v-if="isUserMenuOpen"
                    class="absolute top-full right-0 mt-2 w-56 bg-charcoal border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div class="px-4 py-3 border-b border-white/5">
                      <p class="text-sm font-medium text-silk truncate">{{ authStore.userName }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ authStore.userEmail }}</p>
                    </div>
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
                      Выйти
                    </button>
                  </div>
                </transition>
              </div>
            </template>
          </template>

          <!-- Dashboard (ЛК) Navigation - Only User Menu -->
          <template v-else-if="authStore.isAuthenticated">
            <!-- User Menu -->
            <div class="relative">
              <button
                class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-gold/50 transition-all group"
                @click="toggleUserMenu"
              >
                <div class="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors">
                  <User class="w-4 h-4" />
                </div>
                <span class="text-sm font-medium text-silk max-w-[120px] truncate">{{ authStore.userName }}</span>
                <ChevronDown class="w-4 h-4 text-gray-500 transition-transform duration-300" :class="{ 'rotate-180': isUserMenuOpen }" />
              </button>

              <!-- User Dropdown Menu -->
              <transition name="dropdown">
                <div
                  v-if="isUserMenuOpen"
                  class="absolute top-full right-0 mt-2 w-56 bg-charcoal border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                >
                  <div class="px-4 py-3 border-b border-white/5">
                    <p class="text-sm font-medium text-silk truncate">{{ authStore.userName }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ authStore.userEmail }}</p>
                  </div>
                  <button @click="navigateTo('/editor')" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors">
                    <PenLine class="w-4 h-4" />
                    Мои архивы
                  </button>
                  <button @click="navigateTo('/settings')" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors">
                    <Settings class="w-4 h-4" />
                    Настройки
                  </button>
                  <button @click="navigateTo('/#pricing')" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:bg-white/5 hover:text-gold transition-colors">
                    <CreditCard class="w-4 h-4" />
                    Тарифы
                  </button>
                  <div class="h-px bg-white/5 my-1"></div>
                  <button @click="handleLogout" class="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                    <LogOut class="w-4 h-4" />
                    Выйти
                  </button>
                </div>
              </transition>
            </div>
          </template>
        </div>

        <!-- Mobile Header Actions -->
        <div class="flex items-center gap-2 md:hidden z-50 relative">
          <!-- In Dashboard (ЛК) - show user avatar button -->
          <template v-if="props.fullHeight && authStore.isAuthenticated">
            <button
              class="w-10 h-10 rounded-full bg-gold/10 border border-white/10 flex items-center justify-center text-gold"
              @click="toggleMobileMenu"
            >
              <User class="w-5 h-5" />
            </button>
          </template>
          <!-- On Landing page - show hamburger -->
          <template v-else>
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

    <!-- Mobile Fullscreen Menu (Bottom-aligned content) -->
    <Teleport to="body">
      <transition name="slide-up">
        <div
          v-if="isMobileMenuOpen"
          class="fixed inset-0 bg-obsidian z-[100] flex flex-col md:hidden"
        >
          <!-- Top bar with close -->
          <div class="flex items-center justify-between p-4 border-b border-white/10">
            <Logo />
            <button
              class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold transition-colors"
              @click="toggleMobileMenu"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Spacer -->
          <div class="flex-1"></div>

          <!-- Bottom Content -->
          <div class="p-6 pb-12 space-y-8">
            <!-- Landing Page Nav Links (only on landing) -->
            <template v-if="!props.fullHeight">
              <div class="flex flex-col gap-4">
                <button
                  v-for="item in navItems"
                  :key="item.id"
                  @click="scrollToSection(item.id)"
                  class="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 text-left hover:bg-white/10 hover:border-gold/20 transition-all"
                >
                  <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <component :is="item.icon" class="w-5 h-5 text-gold" />
                  </div>
                  <span class="text-lg font-serif text-silk">{{ item.label }}</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="h-px bg-white/10"></div>
            </template>

            <!-- Auth Buttons or User Menu -->
            <template v-if="!authStore.isAuthenticated">
              <div class="flex flex-col gap-3">
                <BaseButton :full="true" size="lg" @click="router.push('/auth?mode=signup'); isMobileMenuOpen = false">
                  Создать архив
                </BaseButton>
                <BaseButton variant="outline" :full="true" size="lg" @click="router.push('/auth?mode=login'); isMobileMenuOpen = false">
                  Войти
                </BaseButton>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <User class="w-6 h-6" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-silk font-medium truncate">{{ authStore.userName }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ authStore.userEmail }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <button @click="navigateTo('/editor')" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <PenLine class="w-5 h-5 text-gold" />
                  <span class="text-xs text-gray-300">Архивы</span>
                </button>
                <button @click="navigateTo('/settings')" class="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <Settings class="w-5 h-5 text-gold" />
                  <span class="text-xs text-gray-300">Настройки</span>
                </button>
              </div>
              <button @click="handleLogout" class="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium flex items-center justify-center gap-2">
                <LogOut class="w-5 h-5" />
                Выйти из аккаунта
              </button>
            </template>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Global Ambient Lights - optimized: reduced blur radius -->
    <div class="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-60"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gold/8 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-60"></div>

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

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Slide up animation for mobile menu */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Fade for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
