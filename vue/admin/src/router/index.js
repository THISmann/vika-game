import { createRouter, createWebHistory } from 'vue-router'
import { adminGuard, loginGuard } from './guards'

import AdminLogin from '../components/admin/AdminLogin.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'

const routes = [
  // Admin - Protégé par guard
  { 
    path: '/',
    redirect: '/admin/login'
  },
  { 
    path: '/admin/login', 
    component: AdminLogin,
    beforeEnter: loginGuard
  },
  { 
    path: '/admin/dashboard', 
    component: AdminDashboard,
    beforeEnter: adminGuard
  },
  { 
    path: '/admin/users', 
    component: () => import('../components/admin/AdminUsers.vue'),
    beforeEnter: adminGuard
  },
  { 
    path: '/admin/questions', 
    component: () => import('../components/admin/AdminQuestions.vue'),
    beforeEnter: adminGuard
  },
  { 
    path: '/admin/settings', 
    component: () => import('../components/admin/AdminSettings.vue'),
    beforeEnter: adminGuard
  },
  { 
    path: '/admin/analytics', 
    component: () => import('../components/admin/AdminAnalytics.vue'),
    beforeEnter: adminGuard
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
