import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/pages/LandingPage.vue')
  },
  {
    path: '/auth',
    component: () => import('@/pages/AuthPage.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/editor',
    component: () => import('@/pages/EditorDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/privacy',
    component: () => import('@/pages/legal/PrivacyPolicy.vue')
  },
  {
    path: '/terms',
    component: () => import('@/pages/legal/TermsOfService.vue')
  },
  {
    path: '/offer',
    component: () => import('@/pages/legal/Offer.vue')
  },
  {
    path: '/pd-policy',
    component: () => import('@/pages/legal/PersonalDataPolicy.vue')
  },
  {
    path: '/pd-consent',
    component: () => import('@/pages/legal/PersonalDataConsent.vue')
  },
  {
    path: '/newsletter-consent',
    component: () => import('@/pages/legal/NewsletterConsent.vue')
  },
  {
    path: '/cookie-rules',
    component: () => import('@/pages/legal/CookieRules.vue')
  },
  {
    path: '/archive/:id',
    component: () => import('@/pages/MemoryViewer.vue')
  },
  {
    path: '/:id',
    component: () => import('@/pages/MemoryViewer.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth')
  } else if (to.meta.guestOnly && isAuthenticated) {
    next('/editor')
  } else {
    next()
  }
})

export default router;
