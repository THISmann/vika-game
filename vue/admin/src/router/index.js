import { createRouter, createWebHistory } from 'vue-router'
import { adminGuard, loginGuard } from './guards'

import AdminLogin from '../components/admin/AdminLogin.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'

const routes = [
  // Admin - Protégé par guard
  // Note: Les routes sont relatives au base path /vika-admin/
  { 
    path: '/',
    redirect: '/login'
  },
  { 
    path: '/login', 
    component: AdminLogin,
    beforeEnter: loginGuard
  },
  { 
    path: '/dashboard', 
    component: AdminDashboard,
    beforeEnter: adminGuard
  },
  { 
    path: '/users', 
    component: () => import('../components/admin/AdminUsers.vue'),
    beforeEnter: adminGuard
  },
  { 
    path: '/questions', 
    component: () => import('../components/admin/AdminQuestions.vue'),
    beforeEnter: adminGuard
  },
  { 
    path: '/settings', 
    component: () => import('../components/admin/AdminSettings.vue'),
    beforeEnter: adminGuard
  },
  { 
    path: '/analytics', 
    component: () => import('../components/admin/AdminAnalytics.vue'),
    beforeEnter: adminGuard
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
