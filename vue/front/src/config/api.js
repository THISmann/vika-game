// Configuration des URLs API
// Utilise les variables d'environnement VITE_* ou des valeurs par défaut

const getApiUrl = (service) => {
  // Vérifier si on est en production (build) ou développement
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
  
  // Si des variables d'environnement VITE_* sont définies, les utiliser (Docker Compose avec API Gateway)
  const authUrl = import.meta.env.VITE_AUTH_SERVICE_URL
  const quizUrl = import.meta.env.VITE_QUIZ_SERVICE_URL
  const gameUrl = import.meta.env.VITE_GAME_SERVICE_URL
  
  // Si toutes les URLs pointent vers le même port (API Gateway), utiliser l'API Gateway
  const useApiGateway = authUrl && quizUrl && gameUrl && 
    authUrl === quizUrl && quizUrl === gameUrl
  
  if (isProduction) {
    // En production/Kubernetes, utiliser les variables d'environnement ou des URLs relatives
    if (useApiGateway) {
      // Utiliser l'API Gateway
      const gatewayUrl = authUrl.replace(/\/$/, '')
      switch (service) {
        case 'auth':
          return gatewayUrl
        case 'quiz':
          return gatewayUrl
        case 'game':
          return gatewayUrl
        default:
          return ''
      }
    } else {
      // Utiliser les services directement (ancien comportement)
      switch (service) {
        case 'auth':
          return authUrl ? authUrl.replace(/\/$/, '') : '/api/auth'
        case 'quiz':
          return quizUrl ? quizUrl.replace(/\/$/, '') : '/api/quiz'
        case 'game':
          return gameUrl ? gameUrl.replace(/\/$/, '') : '/api/game'
        default:
          return ''
      }
    }
  } else {
    // En développement local
    if (useApiGateway) {
      // Utiliser l'API Gateway
      const gatewayUrl = authUrl.replace(/\/$/, '')
      switch (service) {
        case 'auth':
          return gatewayUrl
        case 'quiz':
          return gatewayUrl
        case 'game':
          return gatewayUrl
        default:
          return ''
      }
    } else {
      // Utiliser les services directement (développement local sans Docker)
      switch (service) {
        case 'auth':
          return authUrl ? authUrl.replace(/\/$/, '') : 'http://localhost:3001'
        case 'quiz':
          return quizUrl ? quizUrl.replace(/\/$/, '') : 'http://localhost:3002'
        case 'game':
          return gameUrl ? gameUrl.replace(/\/$/, '') : 'http://localhost:3003'
        default:
          return ''
      }
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

// Détecter si on utilise l'API Gateway (toutes les URLs sont identiques)
// Cela signifie que toutes les requêtes passent par le même port (3000 pour l'API Gateway)
const useApiGateway = API_CONFIG.AUTH_SERVICE === API_CONFIG.QUIZ_SERVICE && 
                      API_CONFIG.QUIZ_SERVICE === API_CONFIG.GAME_SERVICE &&
                      API_CONFIG.AUTH_SERVICE !== '' &&
                      (API_CONFIG.AUTH_SERVICE.includes(':3000') || 
                       API_CONFIG.AUTH_SERVICE.includes('localhost:3000') ||
                       API_CONFIG.AUTH_SERVICE.includes('127.0.0.1:3000'))

export const API_URLS = {
  auth: {
    register: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/players/register`
      : isProduction 
        ? `${API_CONFIG.AUTH_SERVICE}/players/register`
        : `${API_CONFIG.AUTH_SERVICE}/auth/players/register`,
    players: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/players`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/players`
        : `${API_CONFIG.AUTH_SERVICE}/auth/players`,
    login: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/login`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/login`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/login`,
  },
  quiz: {
    all: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/all`
      : `${API_CONFIG.QUIZ_SERVICE}/quiz/all`,
    questions: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/questions`
      : `${API_CONFIG.QUIZ_SERVICE}/quiz/questions`, // Alias pour /all
    full: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/full`
      : `${API_CONFIG.QUIZ_SERVICE}/quiz/full`,
    create: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/create`
      : `${API_CONFIG.QUIZ_SERVICE}/quiz/create`,
    update: (id) => useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`
      : `${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`,
    delete: (id) => useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`
      : `${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`,
  },
  game: {
    answer: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/answer`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/answer`
        : `${API_CONFIG.GAME_SERVICE}/game/answer`,
    score: (playerId) => useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/score/${playerId}`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/score/${playerId}`
        : `${API_CONFIG.GAME_SERVICE}/game/score/${playerId}`,
    leaderboard: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/leaderboard`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/leaderboard`
        : `${API_CONFIG.GAME_SERVICE}/game/leaderboard`,
    state: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/state`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/state`
        : `${API_CONFIG.GAME_SERVICE}/game/state`,
    code: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/code`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/code`
        : `${API_CONFIG.GAME_SERVICE}/game/code`,
    verifyCode: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/verify-code`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/verify-code`
        : `${API_CONFIG.GAME_SERVICE}/game/verify-code`,
    playersCount: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/players/count`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/players/count`
        : `${API_CONFIG.GAME_SERVICE}/game/players/count`,
    players: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/players`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/players`
        : `${API_CONFIG.GAME_SERVICE}/game/players`,
    start: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/start`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/start`
        : `${API_CONFIG.GAME_SERVICE}/game/start`,
    next: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/next`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/next`
        : `${API_CONFIG.GAME_SERVICE}/game/next`,
    end: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/end`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/end`
        : `${API_CONFIG.GAME_SERVICE}/game/end`,
    delete: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/delete`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/delete`
        : `${API_CONFIG.GAME_SERVICE}/game/delete`,
    results: useApiGateway
      ? `${API_CONFIG.GAME_SERVICE}/game/results`
      : isProduction
        ? `${API_CONFIG.GAME_SERVICE}/results`
        : `${API_CONFIG.GAME_SERVICE}/game/results`,
  },
  ws: {
    game: (() => {
      const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
      const gameUrl = import.meta.env.VITE_GAME_SERVICE_URL
      
      // Si on utilise l'API Gateway (toutes les URLs sont identiques)
      if (useApiGateway && gameUrl) {
        // Utiliser l'API Gateway pour WebSocket (si configuré)
        // Sinon, utiliser directement le game-service
        // Pour l'instant, on utilise directement le game-service pour WebSocket
        return 'http://localhost:3003'
      }
      
      if (isProduction) {
        // En production, utiliser le chemin /socket.io qui est configuré dans Nginx
        // Socket.io va automatiquement ajouter /socket.io/ à la fin
        if (typeof window !== 'undefined') {
          // Utiliser l'URL de base du navigateur avec le chemin socket.io
          return `${window.location.protocol}//${window.location.host}`
        }
        return ''
      } else {
        // En développement, utiliser localhost:3003 directement
        return 'http://localhost:3003'
      }
    })(),
  },
}

export default API_CONFIG

