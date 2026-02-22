import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Lazy load components
const LandingPage = () => import('@/pages/LandingPage.vue')
const MemoryViewer = () => import('@/pages/MemoryViewer.vue')
const EditorDashboard = () => import('@/pages/EditorDashboard.vue')
const AuthPage = () => import('@/pages/AuthPage.vue')
const ArchiveOnboardingView = () => import('@/pages/ArchiveOnboardingView.vue')
const PrivacyPolicy = () => import('@/pages/legal/PrivacyPolicy.vue')
const TermsOfService = () => import('@/pages/legal/TermsOfService.vue')
const Offer = () => import('@/pages/legal/Offer.vue')
const PersonalDataPolicy = () => import('@/pages/legal/PersonalDataPolicy.vue')
const PersonalDataConsent = () => import('@/pages/legal/PersonalDataConsent.vue')
const NewsletterConsent = () => import('@/pages/legal/NewsletterConsent.vue')
const CookieRules = () => import('@/pages/legal/CookieRules.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
  },
  {
    path: '/archive/:id/onboarding',
    name: 'ArchiveOnboarding',
    component: ArchiveOnboardingView,
    meta: { requiresAuth: true },
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: PrivacyPolicy,
  },
  {
    path: '/terms',
    name: 'Terms',
    component: TermsOfService,
  },
  {
    path: '/offer',
    name: 'Offer',
    component: Offer,
  },
  {
    path: '/pd-policy',
    name: 'PersonalDataPolicy',
    component: PersonalDataPolicy,
  },
  {
    path: '/pd-consent',
    name: 'PersonalDataConsent',
    component: PersonalDataConsent,
  },
  {
    path: '/newsletter-consent',
    name: 'NewsletterConsent',
    component: NewsletterConsent,
  },
  {
    path: '/cookie-rules',
    name: 'CookieRules',
    component: CookieRules,
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage,
    meta: { guestOnly: true },
  },
  {
    path: '/editor',
    component: EditorDashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Editor',
        redirect: { name: 'ArchiveList' }
      },
      {
        path: 'list',
        name: 'ArchiveList',
        component: { template: '<div></div>' } // Dummy since everything is in EditorDashboard for now
      },
      {
        path: 'tree',
        name: 'ArchiveTree',
        component: { template: '<div></div>' } // Dummy
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/modules/admin/ui/AdminDashboard.vue'),
    meta: { requiresAuth: true }, // Add role check here in real app
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('@/modules/billing/BillingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/archive/:id',
    name: 'MemoryViewer',
    component: MemoryViewer,
  },
  // Fallback for direct root links (e.g. /semya-panasyuk)
  // Must be last to avoid catching /auth or /editor
  {
    path: '/:id',
    name: 'MemoryViewerRoot',
    component: MemoryViewer,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (savedPosition) {
          resolve(savedPosition)
        } else {
          resolve({ top: 0 })
        }
      }, 300) // Match transition duration (0.3s)
    })
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

  // Smart redirect: root to dashboard if authenticated
  if (to.path === '/' && isAuthenticated) {
    next({ name: 'Editor' })
    return
  }

  // Protected routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth', query: { redirect: to.fullPath } })
    return
  }

  // Guest-only routes (like login page)
  if (to.meta.guestOnly && isAuthenticated && to.query.type !== 'recovery') {
    next({ name: 'Editor' })
    return
  }

  next()
})

export default router
