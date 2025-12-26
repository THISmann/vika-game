import { createRouter, createWebHistory } from 'vue-router'
import { adminGuard, loginGuard } from './guards'

import Landing from '../components/Landing.vue'
import PlayerRegister from '../components/player/PlayerRegister.vue'
import QuizPlay from '../components/player/QuizPlay.vue'
import Leaderboard from '../components/player/Leaderboard.vue'

import AdminLogin from '../components/admin/AdminLogin.vue'
import AdminUserManagement from '../components/admin/AdminUserManagement.vue'
import ManageQuestions from '../components/admin/ManageQuestions.vue'

const routes = [
  { path: '/', component: Landing },

  // Joueur
  { path: '/player/register', component: PlayerRegister },
  { path: '/player/quiz', component: QuizPlay },
  { path: '/player/leaderboard', component: Leaderboard },

  // Admin - Protégé par guard
  { 
    path: '/admin/login', 
    component: AdminLogin,
    beforeEnter: loginGuard
  },
  { 
    path: '/admin/dashboard', 
    component: () => import('../components/admin/AdminDashboard.vue'),
    beforeEnter: adminGuard
  },
  { 
    path: '/admin/questions', 
    component: ManageQuestions,
    beforeEnter: adminGuard
  },
  { 
    path: '/admin/users', 
    component: AdminUserManagement,
    beforeEnter: adminGuard
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Note: Les guards sont gérés par beforeEnter sur chaque route
// Pas besoin de guard global pour éviter les doubles vérifications

export default router
