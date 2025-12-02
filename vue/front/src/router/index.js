import { createRouter, createWebHistory } from 'vue-router'

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

  // Admin
  { path: '/admin/login', component: AdminLogin },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/questions', component: ManageQuestions },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
