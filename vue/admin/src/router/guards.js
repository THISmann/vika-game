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
    // console.log('🔒 Auth check failed: missing token or admin flag', {
    //   hasToken: !!token,
    //   hasAdminFlag: adminFlag === '1',
    //   adminFlagValue: adminFlag
    // })
    return false
  }

  // Vérifier que le token n'est pas expiré
  try {
    // Décoder le token base64 pour vérifier l'expiration
    const decoded = atob(token)
    
    let role, timestamp;
    
    // Le format est: userId-role-timestamp
    // Le userId peut être un UUID (contient des tirets), donc on doit extraire depuis la fin
    // On cherche le dernier tiret qui sépare role et timestamp, et celui avant qui sépare userId et role
    
    // Extraire le timestamp (dernière partie après le dernier tiret)
    const lastDashIndex = decoded.lastIndexOf('-')
    if (lastDashIndex === -1 || lastDashIndex === decoded.length - 1) {
      // console.log('🔒 Auth check failed: no dash found in token or invalid format') // Commented for production security
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      return false
    }
    
    const timestampStr = decoded.substring(lastDashIndex + 1)
    timestamp = parseInt(timestampStr, 10)
    
    // Extraire le role (partie avant le dernier tiret, mais on cherche l'avant-dernier tiret)
    const beforeLastPart = decoded.substring(0, lastDashIndex)
    const secondLastDashIndex = beforeLastPart.lastIndexOf('-')
    
    if (secondLastDashIndex === -1 || secondLastDashIndex === beforeLastPart.length - 1) {
      // Format ancien: role-timestamp (pas de userId)
      role = beforeLastPart
    } else {
      // Format nouveau: userId-role-timestamp
      role = decoded.substring(secondLastDashIndex + 1, lastDashIndex)
    }
    
    if (process.env.NODE_ENV === 'development') {
      // console.log('🔒 Token verification:', { role, timestamp, timestampStr, decoded: decoded.substring(0, 50) + '...' }) // Commented for production security
    }
    
    // Vérifier que le rôle est admin
    if (role !== 'admin') {
      // console.log('🔒 Auth check failed: invalid role', role)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      return false
    }
    
    // Vérifier que le timestamp est valide
    if (isNaN(timestamp) || timestamp <= 0) {
      // console.log('🔒 Auth check failed: invalid timestamp', timestamp)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      return false
    }
    
    // Vérifier l'expiration (24 heures)
    const now = Date.now()
    const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 heures
    
    if (now - timestamp > TOKEN_EXPIRY) {
      // console.log('🔒 Auth check failed: token expired') // Commented for production security
      // Token expiré, nettoyer le localStorage
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      return false
    }
    
    // Token valide
    return true
  } catch (error) {
    // console.error('🔒 Error verifying token:', error)
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

