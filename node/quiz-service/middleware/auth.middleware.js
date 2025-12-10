const axios = require('axios')

// URL du service d'authentification (peut être configuré via variable d'environnement)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001'

/**
 * Middleware d'authentification pour les routes admin
 * Vérifie le token via le service d'authentification
 */
const authenticateAdmin = async (req, res, next) => {
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

    try {
      // Essayer d'abord la vérification locale si disponible
      let decoded = null
      try {
        // Essayer d'importer la fonction verifyToken localement si disponible
        const path = require('path')
        const authServicePath = path.resolve(__dirname, '../../auth-service/utils/token')
        const tokenUtils = require(authServicePath)
        if (tokenUtils.verifyToken) {
          decoded = tokenUtils.verifyToken(token)
        }
      } catch (localErr) {
        // Ignorer l'erreur, on utilisera l'API
      }

      // Si vérification locale réussie
      if (decoded && decoded.role === 'admin') {
        req.user = {
          role: decoded.role,
          timestamp: decoded.timestamp
        }
        return next()
      }

      // Sinon, vérifier via le service d'authentification
      const response = await axios.get(`${AUTH_SERVICE_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      })

      if (response.data.valid && response.data.role === 'admin') {
        // Ajouter les infos de l'utilisateur à la requête
        req.user = {
          role: response.data.role,
          timestamp: response.data.timestamp
        }
        next()
      } else {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Admin access required'
        })
      }
    } catch (authError) {
      // Si le service d'auth n'est pas disponible
      console.error('❌ Auth service unavailable:', authError.message)
      console.error('❌ Auth service URL:', AUTH_SERVICE_URL)
      console.error('❌ Error details:', authError.response?.data || authError.code)
      
      // Si c'est une erreur de connexion, donner plus de détails
      if (authError.code === 'ECONNREFUSED' || authError.code === 'ENOTFOUND') {
        console.error('❌ Cannot connect to auth service at:', AUTH_SERVICE_URL)
      }
      
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Could not verify token',
        details: process.env.NODE_ENV === 'development' ? authError.message : undefined
      })
    }
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

