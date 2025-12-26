/**
 * Guards de route pour protéger les pages admin
 */

/**
 * Vérifie si l'utilisateur est authentifié en tant qu'admin
 * @returns {boolean}
 */
export function isAdminAuthenticated() {
  const token = localStorage.getItem('adminToken')
  const adminFlag = localStorage.getItem('admin')
  
  // Vérifier que le token existe et que le flag admin est présent
  if (!token || adminFlag !== '1') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Auth check failed: missing token or admin flag', {
        hasToken: !!token,
        hasAdminFlag: adminFlag === '1',
        adminFlagValue: adminFlag
      })
    }
    return false
  }

  // Vérifier que le token n'est pas expiré
  try {
    // Décoder le token base64 pour vérifier l'expiration
    const decoded = atob(token)
    const parts = decoded.split('-')
    
    if (parts.length === 2) {
      const role = parts[0]
      const timestamp = parseInt(parts[1], 10)
      
      // Vérifier que le rôle est admin
      if (role !== 'admin') {
        console.log('🔒 Auth check failed: invalid role', role)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        return false
      }
      
      // Vérifier que le timestamp est valide
      if (isNaN(timestamp) || timestamp <= 0) {
        console.log('🔒 Auth check failed: invalid timestamp')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        return false
      }
      
      // Vérifier l'expiration (24 heures)
      const now = Date.now()
      const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 heures
      
      if (now - timestamp > TOKEN_EXPIRY) {
        console.log('🔒 Auth check failed: token expired')
        // Token expiré, nettoyer le localStorage
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
        return false
      }
      
      // Token valide
      return true
    } else {
      console.log('🔒 Auth check failed: invalid token format')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      return false
    }
  } catch (error) {
    console.error('🔒 Error verifying token:', error)
    // En cas d'erreur de décodage, considérer comme non authentifié
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    return false
  }
}

/**
 * Guard pour les routes admin
 * Redirige vers la page de login si non authentifié
 */
export function adminGuard(to, from, next) {
  if (isAdminAuthenticated()) {
    next()
  } else {
    // Rediriger vers la page de login
    next({
      path: '/admin/login',
      query: { redirect: to.fullPath } // Sauvegarder la route demandée
    })
  }
}

/**
 * Guard pour la page de login
 * Redirige vers le dashboard si déjà authentifié
 */
export function loginGuard(to, from, next) {
  if (isAdminAuthenticated()) {
    // Déjà authentifié, rediriger vers le dashboard
    next('/admin/dashboard')
  } else {
    next()
  }
}

