import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Lazy load components
const LandingPage = () => import('@/pages/LandingPage.vue')
const MemoryViewer = () => import('@/pages/MemoryViewer.vue')
const EditorDashboard = () => import('@/pages/EditorDashboard.vue')
const AuthPage = () => import('@/pages/AuthPage.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage,
    meta: { guestOnly: true },
  },
  {
    path: '/editor',
    name: 'Editor',
    component: EditorDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/archive/:id',    name: 'MemoryViewer',
    component: MemoryViewer,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize on first load
  if (authStore.isLoading) {
    await new Promise<void>(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.isLoading) {
          unwatch()
          resolve()
        }
      })
      // Fallback timeout
      setTimeout(() => {
        unwatch()
        resolve()
      }, 2000)
    })
  }

  const isAuthenticated = authStore.isAuthenticated

  // Protected routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth', query: { redirect: to.fullPath } })
    return
  }

  // Guest-only routes (like login page)
  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Editor' })
    return
  }

  next()
})

export default router
