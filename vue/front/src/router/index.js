import { createRouter, createWebHistory } from 'vue-router'
import { adminGuard, loginGuard } from './guards'

import AdminLogin from '../components/admin/AdminLogin.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import ManageQuestions from '../components/admin/ManageQuestions.vue'

import PlayerRegister from '../components/player/PlayerRegister.vue'
import QuizPlay from '../components/player/QuizPlay.vue'
import Leaderboard from '../components/player/Leaderboard.vue'

const routes = [
  { path: '/', redirect: '/player/register' },

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
    component: AdminDashboard,
    beforeEnter: adminGuard
  },
  { 
    path: '/admin/questions', 
    component: ManageQuestions,
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
