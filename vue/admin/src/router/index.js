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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

