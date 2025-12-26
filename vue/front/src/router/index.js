import { createRouter, createWebHistory } from 'vue-router'
import { userGuard, loginGuard } from './guards'

import Landing from '../components/Landing.vue'
import PlayerRegister from '../components/player/PlayerRegister.vue'
import QuizPlay from '../components/player/QuizPlay.vue'
import Leaderboard from '../components/player/Leaderboard.vue'

import Login from '../components/auth/Login.vue'
import Signup from '../components/auth/Signup.vue'
import ForgotPassword from '../components/auth/ForgotPassword.vue'
import ResetPassword from '../components/auth/ResetPassword.vue'
import WaitingValidation from '../components/auth/WaitingValidation.vue'

import UserLogin from '../components/user/AdminLogin.vue'
import UserUserManagement from '../components/user/AdminUserManagement.vue'
import ManageQuestions from '../components/user/ManageQuestions.vue'

const routes = [
  { path: '/', component: Landing },

  // Auth
  { path: '/auth/login', component: Login },
  { path: '/auth/signup', component: Signup },
  { path: '/auth/forgot-password', component: ForgotPassword },
  { path: '/auth/reset-password', component: ResetPassword },
  { path: '/auth/waiting-validation', component: WaitingValidation },

  // Joueur
  { path: '/player/register', component: PlayerRegister },
  { path: '/player/quiz', component: QuizPlay },
  { path: '/player/leaderboard', component: Leaderboard },

  // User - Protégé par guard (pour les utilisateurs qui créent des questions et gèrent les parties)
  { 
    path: '/user/login', 
    component: UserLogin,
    beforeEnter: loginGuard
  },
  { 
    path: '/user/dashboard', 
    component: () => import('../components/user/AdminDashboard.vue'),
    beforeEnter: userGuard
  },
  { 
    path: '/user/questions', 
    component: ManageQuestions,
    beforeEnter: userGuard
  },
  { 
    path: '/user/users', 
    component: UserUserManagement,
    beforeEnter: userGuard
  },
  { 
    path: '/user/leaderboard', 
    component: () => import('../components/user/UserLeaderboard.vue'),
    beforeEnter: userGuard
  },
  { 
    path: '/user/parties', 
    component: () => import('../components/user/GameParties.vue'),
    beforeEnter: userGuard
  },
  { 
    path: '/user/settings', 
    component: () => import('../components/user/UserSettings.vue'),
    beforeEnter: userGuard
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Note: Les guards sont gérés par beforeEnter sur chaque route
// Pas besoin de guard global pour éviter les doubles vérifications

export default router
