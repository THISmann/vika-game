// Configuration des URLs API
// Utilise les variables d'environnement VITE_* ou des valeurs par défaut

const getApiUrl = (service) => {
  // Vérifier si on est en production (build) ou développement
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
  
  if (isProduction) {
    // En production/Kubernetes, utiliser les variables d'environnement ou des URLs relatives
    const authUrl = import.meta.env.VITE_AUTH_SERVICE_URL || '/api/auth'
    const quizUrl = import.meta.env.VITE_QUIZ_SERVICE_URL || '/api/quiz'
    const gameUrl = import.meta.env.VITE_GAME_SERVICE_URL || '/api/game'
    
    switch (service) {
      case 'auth':
        return authUrl.replace(/\/$/, '') // Remove trailing slash
      case 'quiz':
        return quizUrl.replace(/\/$/, '')
      case 'game':
        return gameUrl.replace(/\/$/, '')
      default:
        return ''
    }
  } else {
    // En développement, utiliser localhost
    switch (service) {
      case 'auth':
        return 'http://localhost:3001'
      case 'quiz':
        return 'http://localhost:3002'
      case 'game':
        return 'http://localhost:3003'
      default:
        return ''
    }
  }
}

export const API_CONFIG = {
  AUTH_SERVICE: getApiUrl('auth'),
  QUIZ_SERVICE: getApiUrl('quiz'),
  GAME_SERVICE: getApiUrl('game'),
}

// Helper pour construire les URLs complètes
// En production avec proxy, les chemins sont déjà préfixés par /api/*
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'

export const API_URLS = {
  auth: {
    register: isProduction 
      ? `${API_CONFIG.AUTH_SERVICE}/players/register`
      : `${API_CONFIG.AUTH_SERVICE}/auth/players/register`,
    players: isProduction
      ? `${API_CONFIG.AUTH_SERVICE}/players`
      : `${API_CONFIG.AUTH_SERVICE}/auth/players`,
  },
  quiz: {
    all: `${API_CONFIG.QUIZ_SERVICE}/all`,
    questions: `${API_CONFIG.QUIZ_SERVICE}/questions`, // Alias pour /all
    full: `${API_CONFIG.QUIZ_SERVICE}/full`,
    create: `${API_CONFIG.QUIZ_SERVICE}/create`,
    update: (id) => `${API_CONFIG.QUIZ_SERVICE}/${id}`,
    delete: (id) => `${API_CONFIG.QUIZ_SERVICE}/${id}`,
  },
  game: {
    answer: `${API_CONFIG.GAME_SERVICE}/answer`,
    score: (playerId) => `${API_CONFIG.GAME_SERVICE}/score/${playerId}`,
    leaderboard: `${API_CONFIG.GAME_SERVICE}/leaderboard`,
    state: `${API_CONFIG.GAME_SERVICE}/state`,
    code: `${API_CONFIG.GAME_SERVICE}/code`,
    verifyCode: `${API_CONFIG.GAME_SERVICE}/verify-code`,
    playersCount: `${API_CONFIG.GAME_SERVICE}/players/count`,
    start: `${API_CONFIG.GAME_SERVICE}/start`,
    next: `${API_CONFIG.GAME_SERVICE}/next`,
    end: `${API_CONFIG.GAME_SERVICE}/end`,
    delete: `${API_CONFIG.GAME_SERVICE}/delete`,
    results: `${API_CONFIG.GAME_SERVICE}/results`,
  },
  ws: {
    game: (() => {
      const gameUrl = API_CONFIG.GAME_SERVICE
      // Si c'est une URL relative (commence par /), construire l'URL complète
      if (gameUrl.startsWith('/')) {
        // En production, utiliser l'URL actuelle du navigateur
        if (typeof window !== 'undefined') {
          return `${window.location.protocol}//${window.location.host}${gameUrl}`
        }
        return gameUrl
      }
      return gameUrl
    })(),
  },
}

export default API_CONFIG

