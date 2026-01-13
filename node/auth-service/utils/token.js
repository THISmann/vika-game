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
    // Le userId peut être un UUID (contient des tirets), donc on doit extraire depuis la fin
    
    let userId, role, timestamp;
    
    // Extraire le timestamp (dernière partie après le dernier tiret)
    const lastDashIndex = decoded.lastIndexOf('-')
    if (lastDashIndex === -1 || lastDashIndex === decoded.length - 1) {
      return null
    }
    
    const timestampStr = decoded.substring(lastDashIndex + 1)
    timestamp = parseInt(timestampStr, 10)
    
    // Vérifier que le timestamp est valide
    if (isNaN(timestamp) || timestamp <= 0) {
      return null
    }
    
    // Extraire le role (partie avant le dernier tiret, mais on cherche l'avant-dernier tiret)
    const beforeLastPart = decoded.substring(0, lastDashIndex)
    const secondLastDashIndex = beforeLastPart.lastIndexOf('-')
    
    if (secondLastDashIndex === -1 || secondLastDashIndex === beforeLastPart.length - 1) {
      // Format ancien: role-timestamp (pas de userId)
      role = beforeLastPart
      userId = null
    } else {
      // Format nouveau: userId-role-timestamp
      role = decoded.substring(secondLastDashIndex + 1, lastDashIndex)
      userId = decoded.substring(0, secondLastDashIndex)
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