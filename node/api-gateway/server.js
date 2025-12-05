const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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

// Rate limiting (100 requêtes par minute par IP)
app.use(rateLimiter(60000, 100));

// Routes
app.use('/', gatewayRoutes);

// Middleware JSON pour les routes non-proxy (comme /health, /test)
// Ces routes sont définies dans gatewayRoutes et n'ont pas besoin de body parsing
// car elles ne reçoivent pas de body

// Middleware de gestion des erreurs (doit être en dernier)
app.use(errorHandler);

// Configuration WebSocket pour le game-service
// L'API Gateway peut aussi proxy les WebSockets
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  path: '/socket.io'
});

// Proxy WebSocket vers game-service (optionnel)
// Pour une implémentation complète, utiliser socket.io-redis ou un service dédié
io.on('connection', (socket) => {
  console.log('🔌 WebSocket client connected via API Gateway:', socket.id);
  
  // Ici, vous pouvez ajouter une logique de proxy WebSocket
  // Pour l'instant, on laisse le client se connecter directement au game-service
  socket.on('disconnect', () => {
    console.log('🔌 WebSocket client disconnected:', socket.id);
  });
});

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

