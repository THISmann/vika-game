/**
 * Génère un token d'authentification
 * @param {string} userId - L'ID de l'utilisateur
 * @param {string} role - Le rôle de l'utilisateur (ex: 'admin', 'user')
 * @returns {string} Token encodé en base64
 */
module.exports.generateToken = (userId, role) => {
  const timestamp = Date.now()
  const payload = `${userId}-${role}-${timestamp}`
  return Buffer.from(payload).toString("base64")
}

/**
 * Vérifie et décode un token d'authentification
 * @param {string} token - Le token à vérifier
 * @returns {object|null} Objet avec userId, role et timestamp, ou null si invalide
 */
module.exports.verifyToken = (token) => {
  try {
    if (!token) {
      return null
    }

    // Décoder le token
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    
    // Format attendu: "userId-role-timestamp" (nouveau) ou "role-timestamp" (ancien pour compatibilité)
    const parts = decoded.split('-')
    
    let userId, role, timestamp;
    
    if (parts.length === 3) {
      // Nouveau format: userId-role-timestamp
      userId = parts[0]
      role = parts[1]
      timestamp = parseInt(parts[2], 10)
    } else if (parts.length === 2) {
      // Ancien format pour compatibilité: role-timestamp
      role = parts[0]
      timestamp = parseInt(parts[1], 10)
      userId = null
    } else {
      return null
    }

    // Vérifier que le timestamp est valide
    if (isNaN(timestamp) || timestamp <= 0) {
      return null
    }

    // Optionnel: Vérifier l'expiration (24 heures par défaut)
    const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 heures en millisecondes
    const now = Date.now()
    if (now - timestamp > TOKEN_EXPIRY) {
      return null // Token expiré
    }

    return {
      userId,
      role,
      timestamp
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}