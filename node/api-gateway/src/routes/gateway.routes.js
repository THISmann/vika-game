const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const SERVICES = require('../../config/services');
const router = express.Router();

// Configuration du proxy pour chaque service
const createServiceProxy = (target, pathPrefix = '') => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    // Important pour les requêtes POST/PUT avec body
    secure: false,
    ws: false, // WebSocket est géré séparément
    timeout: 30000, // Timeout de 30 secondes
    proxyTimeout: 30000,
    pathRewrite: (path, req) => {
      // Express consomme le préfixe (ex: /auth), donc le path reçu est déjà sans préfixe
      // Exemple: req.originalUrl = '/auth/players/register', mais path = '/players/register'
      // On doit réajouter le préfixe pour que le service backend le reçoive correctement
      // Le service backend attend /auth/players/register
      const newPath = pathPrefix ? `${pathPrefix}${path}` : path;
      console.log(`🔄 pathRewrite: '${path}' → '${newPath}' (originalUrl: '${req.originalUrl}', prefix: '${pathPrefix}')`);
      return newPath;
    },
    onError: (err, req, res) => {
      console.error(`❌ Proxy error for ${req.originalUrl}:`, err.message);
      console.error(`   Target: ${target}`);
      console.error(`   Path: ${req.path}`);
      if (!res.headersSent) {
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'The requested service is temporarily unavailable',
          path: req.originalUrl,
          target: target
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      // Logger la requête proxy pour déboguer
      console.log(`🔄 Proxying ${req.method} ${req.originalUrl} → ${target}${proxyReq.path}`);
      
      // http-proxy-middleware gère automatiquement le body
      // On s'assure juste que les headers sont corrects
      if (req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }
      
      // Ajouter des headers personnalisés si nécessaire
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      proxyReq.setHeader('X-Forwarded-Host', req.get('host'));
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Logger les réponses si nécessaire
      if (proxyRes.statusCode >= 400) {
        console.warn(`⚠️ ${req.method} ${req.originalUrl} - ${proxyRes.statusCode}`);
      } else {
        console.log(`✅ ${req.method} ${req.originalUrl} - ${proxyRes.statusCode}`);
      }
    }
  });
};

// Route de santé pour l'API Gateway
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: {
      auth: SERVICES.auth,
      quiz: SERVICES.quiz,
      game: SERVICES.game,
      telegram: SERVICES.telegram
    }
  });
});

// Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'API Gateway is working!' });
});

// Proxy pour Auth Service
// Express consomme le préfixe /auth, donc on doit le réajouter dans le pathRewrite
router.use('/auth', createServiceProxy(SERVICES.auth, '/auth'));

// Proxy pour Quiz Service
// Express consomme le préfixe /quiz, donc on doit le réajouter dans le pathRewrite
router.use('/quiz', createServiceProxy(SERVICES.quiz, '/quiz'));

// Proxy pour Game Service (incluant WebSocket)
// Express consomme le préfixe /game, donc on doit le réajouter dans le pathRewrite
router.use('/game', createServiceProxy(SERVICES.game, '/game'));

// Proxy pour Telegram Bot (si nécessaire)
router.use('/telegram', createServiceProxy(SERVICES.telegram, '/telegram'));

// Route catch-all pour les routes non trouvées
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      '/health',
      '/test',
      '/auth/*',
      '/quiz/*',
      '/game/*',
      '/telegram/*'
    ]
  });
});

module.exports = router;
