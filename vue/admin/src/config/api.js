// Configuration des URLs API
// Utilise les variables d'environnement VITE_* ou des valeurs par défaut

const getApiUrl = (service) => {
  // Vérifier si on est en production (build) ou développement
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
  
  // Si des variables d'environnement VITE_* sont définies, les utiliser
  const authUrl = import.meta.env.VITE_AUTH_SERVICE_URL
  const quizUrl = import.meta.env.VITE_QUIZ_SERVICE_URL
  const gameUrl = import.meta.env.VITE_GAME_SERVICE_URL
  
// Détecter si on utilise l'API Gateway (toutes les URLs sont identiques)
// Si les URLs sont identiques et commencent par http/https, c'est qu'on utilise l'API Gateway
  const useApiGateway = authUrl && quizUrl && gameUrl && 
                        authUrl === quizUrl && quizUrl === gameUrl &&
                      (authUrl.startsWith('http://') || authUrl.startsWith('https://'))
  
  if (isProduction) {
    // En production : Traefik route /api/* vers l'API Gateway ; bases = /api/auth, /api/quiz, /api/game (jamais /api seul).
    const normalizeProd = (url, defaultPath) => {
      if (!url) return defaultPath
      const u = url.replace(/\/$/, '')
      if (u === '/api') return defaultPath
      return u
    }
    switch (service) {
      case 'auth':
        return normalizeProd(authUrl, '/api/auth')
      case 'quiz':
        return normalizeProd(quizUrl, '/api/quiz')
      case 'game':
        return normalizeProd(gameUrl, '/api/game')
      default:
        return ''
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

// Helper pour obtenir l'URL de base pour l'API Gateway si on est sur localhost
const getBaseApiUrl = (service) => {
  const baseUrl = getApiUrl(service)
  
  // En développement local avec Vite, utiliser les URLs relatives telles quelles
  // pour que le proxy Vite les prenne en charge
  const isDevelopment = !import.meta.env.PROD && import.meta.env.MODE !== 'production'
  
  if (isDevelopment) {
    // En développement, si l'URL est relative (/api/*), la laisser telle quelle
    // pour que le proxy Vite la prenne en charge
    if (baseUrl.startsWith('/api/')) {
      return baseUrl
    }
    // Si l'URL est déjà absolue (http://localhost:3001), l'utiliser telle quelle
    if (baseUrl.startsWith('http://')) {
      return baseUrl
    }
  }
  
  // Détecter si on est accédé via localhost/127.0.0.1 (port-forward depuis Kubernetes)
  // Dans ce cas, on doit utiliser des URLs absolues vers l'API Gateway
  const isLocalhostAccess = typeof window !== 'undefined' && 
                            (window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1')
  
  if (isLocalhostAccess && !isDevelopment) {
    // Si on est sur localhost avec des chemins relatifs (/api/auth), utiliser l'API Gateway via port-forward
    if (baseUrl.startsWith('/api/')) {
      // console.log('🌐 Admin: Détection localhost: Utilisation de l\'API Gateway via port-forward (http://127.0.0.1:3000)')
      return 'http://127.0.0.1:3000'
    }
    // Si l'URL est absolue mais pointe vers un autre hôte (192.168.x.x, etc.), utiliser localhost
    if (baseUrl.startsWith('http://') && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
      // console.log('🌐 Admin: Détection localhost: Redirection de', baseUrl, 'vers http://127.0.0.1:3000')
      return 'http://127.0.0.1:3000'
    }
  }
  
  return baseUrl
}

export const API_CONFIG = {
  get AUTH_SERVICE() { return getBaseApiUrl('auth') },
  get QUIZ_SERVICE() { return getBaseApiUrl('quiz') },
  get GAME_SERVICE() { return getBaseApiUrl('game') },
}

// Helper pour construire les URLs complètes
// En production avec proxy, les chemins sont déjà préfixés par /api/*
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'

// Détecter si on utilise l'API Gateway
// En production, si les URLs sont identiques et commencent par /api, on utilise l'API Gateway
const useApiGateway = API_CONFIG.AUTH_SERVICE === API_CONFIG.QUIZ_SERVICE && 
                      API_CONFIG.QUIZ_SERVICE === API_CONFIG.GAME_SERVICE &&
                      API_CONFIG.AUTH_SERVICE !== '' &&
                      (API_CONFIG.AUTH_SERVICE.startsWith('/api') || 
                       API_CONFIG.AUTH_SERVICE.startsWith('http://') || 
                       API_CONFIG.AUTH_SERVICE.startsWith('https://'))

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
      ? (API_CONFIG.AUTH_SERVICE.startsWith('/api')
          ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/login`
          : API_CONFIG.AUTH_SERVICE.includes('/auth') 
            ? `${API_CONFIG.AUTH_SERVICE}/admin/login`
            : `${API_CONFIG.AUTH_SERVICE}/auth/admin/login`)
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/login`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/login`,
    users: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users`,
    usersStats: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/stats`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users/stats`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/stats`,
    analytics: (period) => useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/analytics${period ? `?period=${period}` : ''}`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/analytics${period ? `?period=${period}` : ''}`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/analytics${period ? `?period=${period}` : ''}`,
    approveUser: (userId) => useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/approve`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users/${userId}/approve`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/approve`,
    rejectUser: (userId) => useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/reject`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users/${userId}/reject`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/reject`,
    blockUser: (userId) => useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/block`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users/${userId}/block`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/block`,
    unblockUser: (userId) => useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/unblock`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users/${userId}/unblock`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/unblock`,
    getUserActivities: (userId) => useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/activities`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users/${userId}/activities`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/activities`,
    updateUserRole: (userId) => useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/role`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/admin/users/${userId}/role`
        : `${API_CONFIG.AUTH_SERVICE}/auth/admin/users/${userId}/role`,
    /** GET/PUT auto-approve users setting (admin only). When ON, new users are auto-approved; when OFF, admin approves manually. */
    autoApproveSettings: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/settings/auto-approve-users`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/settings/auto-approve-users`
        : `${API_CONFIG.AUTH_SERVICE}/auth/settings/auto-approve-users`,
  },
  quiz: {
    all: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/all`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/all`
        : `${API_CONFIG.QUIZ_SERVICE}/quiz/all`,
    questions: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/questions`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/questions`
        : `${API_CONFIG.QUIZ_SERVICE}/quiz/questions`,
    full: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/full`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/full`
        : `${API_CONFIG.QUIZ_SERVICE}/quiz/full`,
    create: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/create`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/create`
        : `${API_CONFIG.QUIZ_SERVICE}/quiz/create`,
    update: (id) => useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/${id}`
        : `${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`,
    delete: (id) => useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/${id}`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/${id}`
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
  // URL WebSocket - TOUJOURS utiliser le game-service directement, jamais l'API Gateway
  ws: {
    game: (() => {
      const isProduction = typeof window !== 'undefined' && 
                          window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1' &&
                          !window.location.hostname.startsWith('192.168.') &&
                          !window.location.hostname.startsWith('10.') &&
                          (import.meta.env.PROD || import.meta.env.MODE === 'production')
      
      if (isProduction) {
        if (typeof window !== 'undefined') {
          const url = `${window.location.protocol}//${window.location.host}`
          // console.log('🌐 Production mode - Using WebSocket URL:', url)
          return url
        }
        return ''
      } else {
        if (typeof window !== 'undefined') {
          const url = `${window.location.protocol}//${window.location.host}`
          // console.log('🏠 Development mode (Kubernetes) - Using WebSocket URL via proxy:', url)
          return url
        }
        return 'http://localhost:5174'
      }
    })(),
  },
}

export default API_CONFIG

