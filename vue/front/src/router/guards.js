/**
 * Guards de route pour protéger les pages utilisateur
 */

/**
 * Vérifie si l'utilisateur est authentifié et approuvé (rôle user ou admin)
 * @returns {boolean}
 */
export function isUserAuthenticated() {
  const token = localStorage.getItem('authToken')
  const userInfoStr = localStorage.getItem('userInfo')
  
  // Vérifier que le token existe
  if (!token || !userInfoStr) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Auth check failed: missing token or user info', {
        hasToken: !!token,
        hasUserInfo: !!userInfoStr
      })
    }
    return false
  }

  try {
    const userInfo = JSON.parse(userInfoStr)
    
    // Vérifier que l'utilisateur est approuvé
    if (userInfo.status !== 'approved') {
      console.log('🔒 Auth check failed: user not approved', userInfo.status)
      return false
    }

    // Vérifier que le rôle est user ou admin
    if (userInfo.role !== 'user' && userInfo.role !== 'admin') {
      console.log('🔒 Auth check failed: invalid role', userInfo.role)
      return false
    }

    // Vérifier que le token n'est pas expiré
    try {
      // Décoder le token base64 pour vérifier l'expiration
      const decoded = atob(token)
      // Format du token: "userId-role-timestamp" (séparé par des tirets)
      const parts = decoded.split('-')
      
      if (parts.length >= 3) {
        // Format: userId-role-timestamp
        const userId = parts[0]
        const role = parts[1]
        const timestamp = parseInt(parts[2], 10)
        
        // Vérifier que le rôle correspond
        if (role !== 'user' && role !== 'admin') {
          console.log('🔒 Auth check failed: invalid role in token', role)
          localStorage.removeItem('authToken')
          localStorage.removeItem('userInfo')
          return false
        }
        
        // Vérifier que le timestamp est valide
        if (isNaN(timestamp) || timestamp <= 0) {
          console.log('🔒 Auth check failed: invalid timestamp')
          localStorage.removeItem('authToken')
          localStorage.removeItem('userInfo')
          return false
        }
        
        // Vérifier l'expiration (24 heures)
        const now = Date.now()
        const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 heures
        
        if (now - timestamp > TOKEN_EXPIRY) {
          console.log('🔒 Auth check failed: token expired')
          // Token expiré, nettoyer le localStorage
          localStorage.removeItem('authToken')
          localStorage.removeItem('userInfo')
          return false
        }
        
        // Token valide
        return true
      } else {
        console.log('🔒 Auth check failed: invalid token format', 'parts:', parts.length)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userInfo')
        return false
      }
    } catch (error) {
      console.error('🔒 Error verifying token:', error)
      // En cas d'erreur de décodage, considérer comme non authentifié
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      return false
    }
  } catch (error) {
    console.error('🔒 Error parsing user info:', error)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userInfo')
    return false
  }
}

/**
 * Guard pour les routes utilisateur
 * Redirige vers la page de login si non authentifié
 */
export function userGuard(to, from, next) {
  if (isUserAuthenticated()) {
    next()
  } else {
    // Rediriger vers la page de login
    next({
      path: '/user/login',
      query: { redirect: to.fullPath } // Sauvegarder la route demandée
    })
  }
}

/**
 * Guard pour la page de login
 * Redirige vers le dashboard si déjà authentifié
 */
export function loginGuard(to, from, next) {
  if (isUserAuthenticated()) {
    // Déjà authentifié, rediriger vers le dashboard
    next('/user/dashboard')
  } else {
    next()
  }
}

