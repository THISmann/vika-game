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
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('adminToken')
    
    // Si un token existe, l'ajouter au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Log pour débogage (toujours actif pour diagnostiquer les problèmes)
      console.log('🔑 Adding auth token to request:', config.url, 'Token present:', !!token, 'Token length:', token.length)
    } else {
      // Log si pas de token (toujours actif pour diagnostiquer)
      if (config.url && (config.url.includes('/quiz/') || config.url.includes('/game/'))) {
        console.warn('⚠️ No auth token found for admin request:', config.url)
        console.warn('⚠️ localStorage.getItem("adminToken"):', localStorage.getItem('adminToken'))
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
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        
        // Rediriger vers la page de login en utilisant le router Vue
        // Éviter window.location.href pour ne pas forcer un rechargement complet
        const currentPath = window.location.pathname
        if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
          // Utiliser le router si disponible, sinon fallback sur window.location
          try {
            // Importer le router dynamiquement pour éviter les dépendances circulaires
            const router = (await import('@/router')).default
            if (router) {
              router.push({
                path: '/admin/login',
                query: { redirect: currentPath }
              })
            } else {
              window.location.href = '/admin/login'
            }
          } catch (routerError) {
            console.error('Error importing router:', routerError)
            window.location.href = '/admin/login'
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
   * Connexion admin
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise} Token d'authentification
   */
  async login(username, password) {
    const response = await axios.post(`${API_CONFIG.AUTH_SERVICE}/auth/admin/login`, {
      username,
      password
    })
    
    if (response.data.token) {
      // Stocker le token et le flag admin
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('admin', '1')
      console.log('✅ Login successful, token stored:', response.data.token.substring(0, 20) + '...')
      return response.data.token
    }
    
    throw new Error('No token received')
  },

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
  },

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('adminToken') && localStorage.getItem('admin') === '1'
  },

  /**
   * Récupère le token actuel
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('adminToken')
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
    const response = await apiClient.get(`${API_CONFIG.QUIZ_SERVICE}/quiz/full`)
    return response.data
  },

  /**
   * Crée une nouvelle question
   */
  async createQuestion(questionData) {
    const response = await apiClient.post(`${API_CONFIG.QUIZ_SERVICE}/quiz/create`, questionData)
    return response.data
  },

  /**
   * Met à jour une question
   */
  async updateQuestion(id, questionData) {
    const response = await apiClient.put(`${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`, questionData)
    return response.data
  },

  /**
   * Supprime une question
   */
  async deleteQuestion(id) {
    const response = await apiClient.delete(`${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`)
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
  async startGame(questionDuration = 30) {
    const response = await apiClient.post(`${API_CONFIG.GAME_SERVICE}/game/start`, {
      questionDuration
    })
    return response.data
  },

  /**
   * Passe à la question suivante
   */
  async nextQuestion() {
    const response = await apiClient.post(`${API_CONFIG.GAME_SERVICE}/game/next`)
    return response.data
  },

  /**
   * Termine le jeu
   */
  async endGame() {
    const response = await apiClient.post(`${API_CONFIG.GAME_SERVICE}/game/end`)
    return response.data
  },

  /**
   * Supprime/réinitialise le jeu
   */
  async deleteGame() {
    const response = await apiClient.delete(`${API_CONFIG.GAME_SERVICE}/game/delete`)
    return response.data
  },

  /**
   * Récupère les résultats des questions
   */
  async getResults() {
    const response = await apiClient.get(`${API_CONFIG.GAME_SERVICE}/game/results`)
    return response.data
  }
}

export default apiClient

