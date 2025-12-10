/**
 * Génère un token d'authentification
 * @param {string} role - Le rôle de l'utilisateur (ex: 'admin')
 * @returns {string} Token encodé en base64
 */
module.exports.generateToken = (role) => {
  const timestamp = Date.now()
  const payload = `${role}-${timestamp}`
  return Buffer.from(payload).toString("base64")
}

/**
 * Vérifie et décode un token d'authentification
 * @param {string} token - Le token à vérifier
 * @returns {object|null} Objet avec role et timestamp, ou null si invalide
 */
module.exports.verifyToken = (token) => {
  try {
    if (!token) {
      return null
    }

    // Décoder le token
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    
    // Format attendu: "role-timestamp"
    const parts = decoded.split('-')
    if (parts.length !== 2) {
      return null
    }

    const role = parts[0]
    const timestamp = parseInt(parts[1], 10)

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
      role,
      timestamp
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}