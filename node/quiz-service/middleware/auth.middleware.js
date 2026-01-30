const axios = require('axios')

// URL du service d'authentification (peut être configuré via variable d'environnement)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001'

/**
 * Middleware d'authentification pour les routes admin
 * Vérifie le token via le service d'authentification
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    console.log(`\n🔐 ========== QUIZ-SERVICE AUTHENTICATION ==========`)
    console.log(`🔐 Method: ${req.method}`)
    console.log(`🔐 Path: ${req.path}`)
    console.log(`🔐 AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`)
    
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization || req.headers.Authorization

    console.log(`🔐 Authorization header: ${authHeader ? 'Present' : 'Missing'}`)
    if (authHeader) {
      // console.log(`🔐 Token preview: ${authHeader.substring(0, 50)}...`) // Commented for production security
    }

    if (!authHeader) {
      console.error('❌ No authorization header provided')
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No authorization header provided'
      })
    }

    // Format: "Bearer <token>"
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.error('❌ Invalid authorization format')
      return res.status(401).json({ 
        error: 'Invalid authorization format',
        message: 'Authorization header must be in format: Bearer <token>'
      })
    }

    const token = parts[1]
    // console.log(`🔐 Token extracted: ${token.substring(0, 30)}...`) // Commented for production security

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
          console.log(`🔐 Local token verification: ${decoded ? 'Success' : 'Failed'}`)
        }
      } catch (localErr) {
        // Ignorer l'erreur, on utilisera l'API
        console.log(`🔐 Local verification not available, using API`)
      }

      // Si vérification locale réussie
      if (decoded && (decoded.role === 'admin' || decoded.role === 'user')) {
        console.log(`✅ Local verification successful, role: ${decoded.role}`)
        req.user = {
          role: decoded.role,
          userId: decoded.userId || decoded.id,
          timestamp: decoded.timestamp
        }
        return next()
      }

      // Sinon, vérifier via le service d'authentification
      const verifyUrl = `${AUTH_SERVICE_URL}/auth/verify-token`
      console.log(`🔐 Calling auth service: ${verifyUrl}`)
      // console.log(`🔐 Request headers: Authorization: Bearer ${token.substring(0, 30)}...`) // Commented for production security
      
      const response = await axios.get(verifyUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // Augmenter le timeout à 10 secondes
      })

      console.log(`🔐 Auth service response status: ${response.status}`)
      console.log(`🔐 Auth service response data:`, JSON.stringify(response.data))

      if (response.data.valid && (response.data.role === 'admin' || response.data.role === 'user')) {
        console.log(`✅ Token verified successfully, role: ${response.data.role}`)
        // Ajouter les infos de l'utilisateur à la requête
        req.user = {
          role: response.data.role,
          userId: response.data.userId || response.data.id,
          timestamp: response.data.timestamp
        }
        next()
      } else {
        console.error(`❌ Token verification failed: valid=${response.data.valid}, role=${response.data.role}`)
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'User or Admin access required'
        })
      }
    } catch (authError) {
      // Si le service d'auth n'est pas disponible
      console.error('❌ ========== AUTH SERVICE ERROR ==========')
      console.error('❌ Error message:', authError.message)
      console.error('❌ Error code:', authError.code)
      console.error('❌ Auth service URL:', AUTH_SERVICE_URL)
      console.error('❌ Full URL:', `${AUTH_SERVICE_URL}/auth/verify-token`)
      console.error('❌ Error response status:', authError.response?.status)
      console.error('❌ Error response data:', authError.response?.data)
      console.error('❌ Error response headers:', authError.response?.headers)
      console.error('❌ Error stack:', authError.stack)
      
      // Si c'est une erreur de connexion, donner plus de détails
      if (authError.code === 'ECONNREFUSED' || authError.code === 'ENOTFOUND') {
        console.error('❌ Cannot connect to auth service at:', AUTH_SERVICE_URL)
        console.error('❌ This usually means:')
        console.error('   1. Auth service is not running')
        console.error('   2. AUTH_SERVICE_URL is incorrect')
        console.error('   3. Network issue in Kubernetes cluster')
      }
      
      if (authError.code === 'ETIMEDOUT') {
        console.error('❌ Connection timeout to auth service')
      }
      
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Could not verify token',
        details: process.env.NODE_ENV === 'development' ? {
          message: authError.message,
          code: authError.code,
          url: `${AUTH_SERVICE_URL}/auth/verify-token`,
          response: authError.response?.data
        } : undefined
      })
    }
  } catch (error) {
    console.error('❌ ========== AUTHENTICATION ERROR ==========')
    console.error('❌ Error:', error.message)
    console.error('❌ Stack:', error.stack)
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message || 'Invalid token'
    })
  }
}

module.exports = {
  authenticateAdmin
}

