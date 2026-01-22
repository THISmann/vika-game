const express = require('express');
const cors = require('cors');
const http = require('http');
const gatewayRoutes = require('./src/routes/gateway.routes');
const loggerMiddleware = require('./src/middleware/logger');
const logger = loggerMiddleware.logger;
const errorLogger = loggerMiddleware.errorLogger;
const errorHandler = require('./src/middleware/errorHandler');
const { metricsMiddleware, trackError, getMetrics } = require('./src/middleware/metrics');
const rateLimiter = require('./src/middleware/rateLimiter');
const SERVICES = require('./config/services');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();
const server = http.createServer(app);

// Configuration CORS
app.use(cors({
  origin: '*', // En production, spécifier les origines autorisées
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
// IMPORTANT: Pour les requêtes proxifiées, http-proxy-middleware gère automatiquement le body
// On parse le JSON seulement pour les routes non-proxy (comme /test, /health, etc.)
// Pour les routes proxifiées, le body est transmis directement au service backend
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Parse JSON body pour les routes non-proxy (http-proxy-middleware gère le body pour les routes proxifiées)
app.use((req, res, next) => {
  // Si c'est une route non-proxy (health, metrics, test, api-docs), parser le JSON
  if (req.path === '/health' || 
      req.path === '/metrics' || 
      req.path.startsWith('/test') ||
      req.path.startsWith('/api-docs')) {
    return express.json({ limit: '10mb' })(req, res, next);
  }
  // Pour les routes proxifiées, http-proxy-middleware gère le body automatiquement
  // On doit juste s'assurer que le Content-Type est correct
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      // Le body sera lu par http-proxy-middleware directement depuis le stream
      // Pas besoin de le parser ici
    }
  }
  next();
});
app.use(metricsMiddleware); // Prometheus metrics collection
app.use(loggerMiddleware); // Request logging

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'IntelectGame API Gateway Documentation'
}));

// Health check endpoint (avant rate limiting pour éviter les blocages)
app.get('/health', (req, res) => {
  res.status(200).json({
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

// Prometheus metrics endpoint
app.get('/metrics', getMetrics);

// Rate limiting (augmenté à 300 requêtes par minute par IP pour éviter les erreurs 429)
// Exclure /health, /metrics et certaines routes de jeu du rate limiting
const limiter = rateLimiter(60000, 300); // Augmenté de 100 à 300
app.use((req, res, next) => {
  // Skip rate limiting for health checks, metrics et routes de jeu fréquemment pollées
  if (req.path === '/health' || 
      req.path === '/metrics' ||
      req.path === '/game/state' || 
      req.path === '/game/players/count' || 
      req.path === '/game/players') {
    return next(); // Skip rate limiting for these routes
  }
  limiter(req, res, next);
});

// Routes
// Appliquer express.json() uniquement aux routes qui en ont besoin et qui ne sont pas proxifiées
app.use('/test', express.json(), gatewayRoutes);
app.use('/', gatewayRoutes); // Les routes proxifiées n'utilisent pas express.json() ici

// Error logging middleware (before error handler)
app.use((err, req, res, next) => {
  trackError(err, req);
  errorLogger(err, req, res, next);
});

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);

// Note: Les WebSockets (Socket.io) passent directement vers game-service
// L'API Gateway ne proxy pas les WebSockets pour simplifier l'architecture
// Les clients se connectent directement à game-service:3003 pour les WebSockets

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`API Gateway started on port ${PORT}`);
  logger.info('📡 Services configured:', {
    auth: SERVICES.auth,
    quiz: SERVICES.quiz,
    game: SERVICES.game,
    telegram: SERVICES.telegram
  });
  logger.info('📚 Swagger UI available at http://localhost:' + PORT + '/api-docs');
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
