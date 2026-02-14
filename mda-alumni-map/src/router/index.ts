import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/r/:region',
      name: 'region-filter',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/rank/:rank',
      name: 'rank-filter',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminModerationView.vue'),
    },
    {
      path: '/p/:slug',
      name: 'person-detail',
      component: () => import('../views/PersonDetailView.vue'),
    },
    {
      path: '/anniversaries',
      name: 'anniversaries',
      component: () => import('../views/AnniversariesView.vue'),
    },
    {
      path: '/add',
      name: 'add-person',
      component: () => import('../views/AddPersonView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/legal/PrivacyPolicy.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/legal/TermsOfService.vue'),
    },
  ],
});

export default router;