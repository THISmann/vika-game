// Configuration des URLs API
// Utilise les variables d'environnement VITE_* ou des valeurs par défaut

const getApiUrl = (service) => {
  // Vérifier si on est en production (build) ou développement
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
  
  // Si des variables d'environnement VITE_* sont définies, les utiliser
  const authUrl = import.meta.env.VITE_AUTH_SERVICE_URL
  const quizUrl = import.meta.env.VITE_QUIZ_SERVICE_URL
  const gameUrl = import.meta.env.VITE_GAME_SERVICE_URL
  
  // Détecter si on utilise l'API Gateway (toutes les URLs sont identiques et pointent vers le port 3000)
  // IMPORTANT: En production Kubernetes, les URLs sont relatives (/api/auth), donc useApiGateway sera false
  const useApiGateway = authUrl && quizUrl && gameUrl && 
                        authUrl === quizUrl && quizUrl === gameUrl &&
                        (authUrl.startsWith('http://') || authUrl.startsWith('https://')) &&
                        (authUrl.includes(':3000') || authUrl.includes('localhost:3000') || authUrl.includes('127.0.0.1:3000'))
  
  if (isProduction) {
    // En production/Kubernetes, utiliser les variables d'environnement ou des URLs relatives
    // Si les URLs sont relatives (commencent par /), les utiliser telles quelles
    switch (service) {
      case 'auth':
        // Si authUrl est défini, l'utiliser (peut être relatif /api/auth ou absolu)
        if (authUrl) {
          return authUrl.replace(/\/$/, '')
        }
        // Fallback par défaut pour production
        return '/api/auth'
      case 'quiz':
        if (quizUrl) {
          return quizUrl.replace(/\/$/, '')
        }
        return '/api/quiz'
      case 'game':
        if (gameUrl) {
          return gameUrl.replace(/\/$/, '')
        }
        return '/api/game'
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
      // console.log('🌐 Frontend: Détection localhost: Utilisation de l\'API Gateway via port-forward (http://127.0.0.1:3000)')
      return 'http://127.0.0.1:3000'
    }
    // Si l'URL est absolue mais pointe vers un autre hôte (192.168.x.x, etc.), utiliser localhost
    if (baseUrl.startsWith('http://') && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
      // console.log('🌐 Frontend: Détection localhost: Redirection de', baseUrl, 'vers http://127.0.0.1:3000')
      return 'http://127.0.0.1:3000'
    }
    // Si l'URL est vide ou invalide, utiliser localhost
    if (!baseUrl || baseUrl === '' || baseUrl === '/') {
      // console.log('🌐 Frontend: Détection localhost: URL vide, utilisation de http://127.0.0.1:3000')
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

// Détecter si on utilise l'API Gateway (toutes les URLs sont identiques et pointent vers le port 3000)
const useApiGateway = API_CONFIG.AUTH_SERVICE === API_CONFIG.QUIZ_SERVICE && 
                      API_CONFIG.QUIZ_SERVICE === API_CONFIG.GAME_SERVICE &&
                      API_CONFIG.AUTH_SERVICE !== '' &&
                      (API_CONFIG.AUTH_SERVICE.startsWith('http://') || API_CONFIG.AUTH_SERVICE.startsWith('https://')) &&
                      (API_CONFIG.AUTH_SERVICE.includes(':3000') || 
                       API_CONFIG.AUTH_SERVICE.includes('localhost:3000') ||
                       API_CONFIG.AUTH_SERVICE.includes('127.0.0.1:3000'))

export const API_URLS = {
  auth: {
    register: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/users/register`
      : isProduction 
        ? `${API_CONFIG.AUTH_SERVICE}/users/register`
        : `${API_CONFIG.AUTH_SERVICE}/auth/users/register`,
    registerPlayer: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/players/register`
      : isProduction 
        ? `${API_CONFIG.AUTH_SERVICE}/players/register`
        : `${API_CONFIG.AUTH_SERVICE}/auth/players/register`,
    userLogin: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/users/login`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/users/login`
        : `${API_CONFIG.AUTH_SERVICE}/auth/users/login`,
    forgotPassword: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/users/forgot-password`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/users/forgot-password`
        : `${API_CONFIG.AUTH_SERVICE}/auth/users/forgot-password`,
    resetPassword: useApiGateway
      ? `${API_CONFIG.AUTH_SERVICE}/auth/users/reset-password`
      : isProduction
        ? `${API_CONFIG.AUTH_SERVICE}/users/reset-password`
        : `${API_CONFIG.AUTH_SERVICE}/auth/users/reset-password`,
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
  },
  quiz: {
    // En production, API_CONFIG.QUIZ_SERVICE est déjà /api/quiz
    // Nginx route /api/quiz/* vers quiz-service/quiz/*
    // Donc on doit ajouter /quiz/all pour obtenir /api/quiz/quiz/all → quiz-service/quiz/all
    // MAIS en production, on veut /api/quiz/all → quiz-service/quiz/all
    // Solution: En production, API_CONFIG.QUIZ_SERVICE est /api/quiz, donc on ajoute juste /all
    all: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/all`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/all`
        : `${API_CONFIG.QUIZ_SERVICE}/quiz/all`,
    questions: useApiGateway
      ? `${API_CONFIG.QUIZ_SERVICE}/quiz/questions`
      : isProduction
        ? `${API_CONFIG.QUIZ_SERVICE}/questions`
        : `${API_CONFIG.QUIZ_SERVICE}/quiz/questions`, // Alias pour /all
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
        createParty: useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/parties`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/parties`
            : `${API_CONFIG.GAME_SERVICE}/game/parties`,
        userParties: useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/parties`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/parties`
            : `${API_CONFIG.GAME_SERVICE}/game/parties`,
        getParty: (partyId) => useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/parties/${partyId}`
            : `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}`,
        updateParty: (partyId) => useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/parties/${partyId}`
            : `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}`,
        deleteParty: (partyId) => useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/parties/${partyId}`
            : `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}`,
        startParty: (partyId) => useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}/start`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/parties/${partyId}/start`
            : `${API_CONFIG.GAME_SERVICE}/game/parties/${partyId}/start`,
        uploadImage: useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/upload/image`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/upload/image`
            : `${API_CONFIG.GAME_SERVICE}/game/upload/image`,
        uploadAudio: useApiGateway
          ? `${API_CONFIG.GAME_SERVICE}/game/upload/audio`
          : isProduction
            ? `${API_CONFIG.GAME_SERVICE}/upload/audio`
            : `${API_CONFIG.GAME_SERVICE}/game/upload/audio`,
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
  // L'API Gateway ne gère pas les WebSockets
  ws: {
    game: (() => {
      // Détecter si on est vraiment en production
      // En développement, window.location.hostname sera 'localhost' ou '127.0.0.1'
      // et le port sera généralement 5173 (Vite) ou autre port de dev
      const isProduction = typeof window !== 'undefined' && 
                          window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1' &&
                          !window.location.hostname.startsWith('192.168.') &&
                          !window.location.hostname.startsWith('10.') &&
                          (import.meta.env.PROD || import.meta.env.MODE === 'production')
      
      // IMPORTANT: Les WebSockets doivent TOUJOURS se connecter directement au game-service
      // L'API Gateway ne gère pas les WebSockets, donc on ignore useApiGateway pour les WS
      // En développement, on force TOUJOURS localhost:3003, même si VITE_GAME_SERVICE_URL pointe vers l'API Gateway
      
      if (isProduction) {
        // En production, utiliser le chemin /socket.io qui est configuré dans Nginx
        // Socket.io va automatiquement ajouter /socket.io/ à la fin
        if (typeof window !== 'undefined') {
          // En production avec Kubernetes/Nginx, le proxy route /socket.io vers game-service
          // Utiliser l'URL de base du navigateur avec le chemin socket.io
          const url = `${window.location.protocol}//${window.location.host}`
          // console.log('🌐 Production mode - Using WebSocket URL:', url)
          return url
        }
        return ''
      } else {
        // En développement local avec Minikube/Kubernetes, utiliser le proxy Nginx
        // Le proxy Nginx route /api/game vers game-service et supporte les WebSockets
        if (typeof window !== 'undefined') {
          // Utiliser l'URL de base du navigateur (via proxy Nginx)
          const url = `${window.location.protocol}//${window.location.host}`
          // console.log('🏠 Development mode (Kubernetes) - Using WebSocket URL via proxy:', url)
          return url
        }
        // Fallback si window n'est pas disponible
        return 'http://localhost:5173'
      }
    })(),
  },
}

export default API_CONFIG

