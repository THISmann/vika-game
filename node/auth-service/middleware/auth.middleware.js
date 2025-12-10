const { verifyToken } = require('../utils/token')

/**
 * Middleware d'authentification pour les routes admin
 * Vérifie que le token est présent et valide
 */
const authenticateAdmin = (req, res, next) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No authorization header provided'
      })
    }

    // Format: "Bearer <token>"
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        error: 'Invalid authorization format',
        message: 'Authorization header must be in format: Bearer <token>'
      })
    }

    const token = parts[1]

    // Vérifier le token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      })
    }

    // Vérifier que c'est un admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required'
      })
    }

    // Ajouter les infos de l'utilisateur à la requête
    req.user = {
      role: decoded.role,
      timestamp: decoded.timestamp
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message || 'Invalid token'
    })
  }
}

module.exports = {
  authenticateAdmin
}

