import axios from 'axios'
import { API_URLS, API_CONFIG } from '@/config/api'

/**
 * Service API avec gestion de l'authentification
 */

// Créer une instance axios avec configuration par défaut
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage (authToken pour les users)
    const token = localStorage.getItem('authToken')
    
    // Si un token existe, l'ajouter au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Log pour débogage (toujours actif pour diagnostiquer les problèmes)
      // console.log('🔑 Adding auth token to request:', config.url, 'Token present:', !!token, 'Token length:', token.length) // Commented for production security
    } else {
      // Log si pas de token (toujours actif pour diagnostiquer)
      if (config.url && (config.url.includes('/quiz/') || config.url.includes('/game/'))) {
        console.warn('⚠️ No auth token found for user request:', config.url)
        console.warn('⚠️ localStorage.getItem("authToken"):', localStorage.getItem('authToken'))
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Si erreur 401 (non autorisé), rediriger vers la page de login
    if (error.response && error.response.status === 401) {
      console.warn('🔒 401 Unauthorized - clearing auth and redirecting to login')
      console.warn('🔒 Request URL:', error.config?.url)
      console.warn('🔒 Error details:', error.response?.data)
      
      // Vérifier si c'est une erreur de token invalide ou manquant
      const errorMessage = error.response?.data?.message || error.response?.data?.error || ''
      const isTokenError = errorMessage.includes('token') || 
                          errorMessage.includes('authentication') ||
                          errorMessage.includes('Unauthorized')
      
      if (isTokenError) {
        // Nettoyer le localStorage
        localStorage.removeItem('authToken')
        localStorage.removeItem('userInfo')
        
        // Rediriger vers la page de login en utilisant le router Vue
        // Éviter window.location.href pour ne pas forcer un rechargement complet
        const currentPath = window.location.pathname
        if (currentPath.startsWith('/user') && currentPath !== '/user/login') {
          // Utiliser le router si disponible, sinon fallback sur window.location
          try {
            // Importer le router dynamiquement pour éviter les dépendances circulaires
            const router = (await import('@/router')).default
            if (router) {
              router.push({
                path: '/user/login',
                query: { redirect: currentPath }
              })
            } else {
              window.location.href = '/user/login'
            }
          } catch (routerError) {
            console.error('Error importing router:', routerError)
            window.location.href = '/user/login'
          }
        }
      }
    }
    
    return Promise.reject(error)
  }
)

/**
 * Service d'authentification
 */
export const authService = {
  /**
   * Connexion utilisateur (user login)
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise} Token d'authentification et user info
   */
  async login(email, password) {
    // Utiliser l'URL complète depuis API_URLS qui gère correctement les chemins
    // API_URLS.auth.userLogin gère automatiquement les chemins pour production/dev
    const loginUrl = API_URLS.auth.userLogin
    
    console.log('🔑 Attempting user login to:', loginUrl)
    
    const response = await axios.post(loginUrl, {
      email,
      password
    })
    
    if (response.data.token && response.data.user) {
      // Stocker le token et les infos utilisateur
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userInfo', JSON.stringify(response.data.user))
      // console.log('✅ Login successful, token stored:', response.data.token.substring(0, 20) + '...') // Commented for production security
      // console.log('✅ localStorage.getItem("authToken"):', localStorage.getItem('authToken')) // Commented for production security
      return response.data
    }
    
    throw new Error('No token received')
  },

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userInfo')
  },

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken')
    const userInfo = localStorage.getItem('userInfo')
    if (!token || !userInfo) return false
    try {
      const user = JSON.parse(userInfo)
      return user.status === 'approved' && (user.role === 'user' || user.role === 'admin')
    } catch {
      return false
    }
  },

  /**
   * Récupère le token actuel
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('authToken')
  }
}

/**
 * Service pour les questions (admin)
 */
export const quizService = {
  /**
   * Récupère toutes les questions (avec réponses - admin seulement)
   */
  async getFullQuestions() {
    const response = await apiClient.get(API_URLS.quiz.full)
    return response.data
  },

  /**
   * Crée une nouvelle question
   */
  async createQuestion(questionData) {
    const response = await apiClient.post(API_URLS.quiz.create, questionData)
    return response.data
  },

  /**
   * Met à jour une question
   */
  async updateQuestion(id, questionData) {
    const response = await apiClient.put(API_URLS.quiz.update(id), questionData)
    return response.data
  },

  /**
   * Supprime une question
   */
  async deleteQuestion(id) {
    const response = await apiClient.delete(API_URLS.quiz.delete(id))
    return response.data
  }
}

/**
 * Service pour le jeu (admin)
 */
export const gameService = {
  /**
   * Démarre le jeu
   */
  async startGame(questionDuration = 30, scheduledStartTime = null) {
    const body = { questionDuration }
    if (scheduledStartTime) {
      body.scheduledStartTime = scheduledStartTime
    }
    const response = await apiClient.post(API_URLS.game.start, body)
    return response.data
  },

  /**
   * Passe à la question suivante
   */
  async nextQuestion() {
    const response = await apiClient.post(API_URLS.game.next)
    return response.data
  },

  /**
   * Termine le jeu
   */
  async endGame() {
    const response = await apiClient.post(API_URLS.game.end)
    return response.data
  },

  /**
   * Supprime/réinitialise le jeu
   */
  async deleteGame() {
    const response = await apiClient.delete(API_URLS.game.delete)
    return response.data
  },

  /**
   * Récupère les résultats des questions
   */
  async getResults() {
    const response = await apiClient.get(API_URLS.game.results)
    return response.data
  }
}

export default apiClient

