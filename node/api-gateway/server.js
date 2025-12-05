const express = require('express');
const cors = require('cors');
const http = require('http');
const gatewayRoutes = require('./src/routes/gateway.routes');
const logger = require('./src/middleware/logger');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimiter = require('./src/middleware/rateLimiter');
const SERVICES = require('./config/services');

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
// IMPORTANT: Ne pas utiliser express.json() globalement car il consomme le body
// et le proxy ne peut plus le lire. On l'utilisera seulement pour les routes non-proxy
app.use(express.urlencoded({ extended: true }));
app.use(logger);

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

// Rate limiting (100 requêtes par minute par IP)
// Exclure /health du rate limiting
const limiter = rateLimiter(60000, 100);
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next(); // Skip rate limiting for health checks
  }
  limiter(req, res, next);
});

// Routes
// Appliquer express.json() uniquement aux routes qui en ont besoin et qui ne sont pas proxifiées
app.use('/test', express.json(), gatewayRoutes);
app.use('/', gatewayRoutes); // Les routes proxifiées n'utilisent pas express.json() ici

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);

// Note: Les WebSockets (Socket.io) passent directement vers game-service
// L'API Gateway ne proxy pas les WebSockets pour simplifier l'architecture
// Les clients se connectent directement à game-service:3003 pour les WebSockets

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log('🚀 API Gateway running on port', PORT);
  console.log('📡 Services configured:');
  console.log('   - Auth Service:', SERVICES.auth);
  console.log('   - Quiz Service:', SERVICES.quiz);
  console.log('   - Game Service:', SERVICES.game);
  console.log('   - Telegram Bot:', SERVICES.telegram);
  console.log('');
  console.log('🌐 Available routes:');
  console.log('   - GET  /health - Health check');
  console.log('   - GET  /test - Test endpoint');
  console.log('   - *    /auth/* - Proxy to Auth Service');
  console.log('   - *    /quiz/* - Proxy to Quiz Service');
  console.log('   - *    /game/* - Proxy to Game Service');
  console.log('   - *    /telegram/* - Proxy to Telegram Bot');
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
