// game-service/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const gameRoutes = require("./routes/game.routes");
const websocketRoutes = require("./routes/websocket.routes");
const uploadRoutes = require("./routes/upload.routes");
const minioService = require("./services/minioService");
const path = require("path"); 
const cors = require('cors');
const gameState = require("./gameState");
const connectDB = require("./config/database");
const axios = require("axios");
const services = require("./config/services");
const Score = require("./models/Score");
const redisClient = require("./shared/redis-client");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { createLogger, requestLogger, errorLogger } = require("./shared/logger");

// Create logger instance
const logger = createLogger('game-service');

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Request logging middleware (must be before routes)
app.use(requestLogger(logger));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Game Service API Documentation',
  customJs: [
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js'
  ]
}));

// Endpoint pour la documentation WebSocket (retourne les infos en JSON)
app.get('/WEBSOCKET_DOCUMENTATION.md', (req, res) => {
  res.json({
    message: 'WebSocket documentation',
    url: '/game/websocket/info',
    file: 'node/game-service/WEBSOCKET_DOCUMENTATION.md'
  });
});

// Connect to MongoDB
connectDB();

// Connect to Redis (non-blocking)
redisClient.connect().catch(err => {
  logger.warn('Redis connection failed, continuing without cache', { error: err.message });
});

// Create server
const server = http.createServer(app);

// Create websocket server
// IMPORTANT: path doit être "/socket.io" (sans slash final) pour compatibilité avec le proxy
const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  path: "/socket.io",
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  // Désactiver la vérification stricte pour éviter les erreurs 400
  allowRequest: (req, callback) => {
    // Logger pour debug
    const sid = req.url?.split('sid=')[1]?.split('&')[0];
    if (sid) {
      logger.debug('Socket.io request', {
        sid: sid.substring(0, 10),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      });
    }
    // Accepter toutes les requêtes (la vérification sera faite dans les handlers)
    // Le sessionAffinity dans Kubernetes garantit que le même client va au même pod
    callback(null, true);
  },
  // Désactiver la vérification stricte des origins
  connectTimeout: 45000,
  // Permettre les requêtes cross-origin
  serveClient: false
});

// Import routes (but now we pass "io" to controllers)
app.use("/game", (req, res, next) => {
  req.io = io;           // 👉 Make io accessible inside controllers
  next();
}, gameRoutes);

// WebSocket documentation routes
app.use("/game", websocketRoutes);

// Upload routes
app.use("/game/upload", uploadRoutes);

/**
 * @swagger
 * /api/files/{filePath}:
 *   get:
 *     summary: Serve uploaded files (images and audio) from MinIO
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filePath
 *         required: true
 *         schema:
 *           type: string
 *         description: File path (e.g., image-1234567890.jpg or audio-1234567890.mp3)
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/gif:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *           audio/ogg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid file path
 *       404:
 *         description: File not found
 *       500:
 *         description: Error serving file
 */
// Serve files from MinIO
app.get("/api/files/*", async (req, res) => {
  try {
    // Extract the object name from the path (everything after /api/files/)
    const pathMatch = req.path.match(/\/api\/files\/(.+)/);
    if (!pathMatch) {
      return res.status(400).json({ error: 'Invalid file path' });
    }
    const objectName = pathMatch[1];
    
    const stream = await minioService.minioClient.getObject(minioService.BUCKET_NAME, objectName);
    const stat = await minioService.minioClient.statObject(minioService.BUCKET_NAME, objectName);
    
    res.setHeader('Content-Type', stat.metaData['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    stream.pipe(res);
  } catch (error) {
    logger.error('Error serving file', error, {
      path: req.path
    });
    res.status(404).json({ error: 'File not found' });
  }
});

// Player socket map
const playersSockets = new Map();

// Gérer les erreurs de connexion avant le handshake
io.engine.on("connection_error", (err) => {
  logger.warn('Socket.io connection error', {
    remoteAddress: err.req?.socket?.remoteAddress,
    message: err.message,
    context: err.context,
    description: err.description,
    type: err.type
  });
  // Ne pas rejeter la connexion pour les erreurs mineures
  // Le client va réessayer automatiquement
});

io.on("connection", (socket) => {
  const clientIP = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'] || 'unknown';
  logger.info('WebSocket client connected', {
    socketId: socket.id,
    ip: clientIP,
    userAgent: userAgent.substring(0, 50),
    totalClients: io.sockets.sockets.size
  });
  
  // Logger les erreurs de connexion
  socket.on("error", (error) => {
    logger.error('Socket error', error, {
      socketId: socket.id
    });
    // Ne pas envoyer d'erreur au client pour éviter les boucles d'erreur
  });
  
  // Logger les tentatives de reconnexion
  socket.on("reconnect_attempt", (attemptNumber) => {
    logger.debug('Reconnection attempt', {
      socketId: socket.id,
      attemptNumber
    });
  });
  
  // Gérer les erreurs non capturées pour éviter les "server error" génériques
  socket.on("disconnect", (reason) => {
    if (reason === "transport close" || reason === "transport error") {
      logger.debug('Socket disconnected due to transport issue', {
        socketId: socket.id,
        reason
      });
    } else {
      logger.info('Socket disconnected', {
        socketId: socket.id,
        reason
      });
    }
  });

  socket.on("register", async (playerId) => {
    try {
      if (!playerId) {
        logger.error('Register called without playerId', null, { socketId: socket.id });
        socket.emit("error", { 
          message: "Player ID is required",
          code: "INVALID_PLAYER_ID"
        });
        return;
      }

      logger.debug('Register player request', {
        playerId,
        socketId: socket.id
      });
      
      const state = await gameState.getState();
      logger.debug('Current game state', {
        isStarted: state.isStarted,
        connectedPlayersCount: state.connectedPlayers?.length || 0
      });
      
      // Vérifier si le joueur est déjà dans la liste des joueurs connectés
      const isAlreadyConnected = state.connectedPlayers && state.connectedPlayers.includes(playerId);
      
      // Si le jeu a déjà commencé, vérifier si le joueur était déjà enregistré
      // Si le joueur était déjà enregistré, permettre la reconnexion (par exemple après une déconnexion temporaire)
      if (state.isStarted && !isAlreadyConnected) {
        // Vérifier si le joueur avait déjà été enregistré dans une session précédente
        // En regardant les scores ou autres données persistantes
        // Pour l'instant, on rejette seulement les nouveaux joueurs
        logger.warn('Game already started, rejecting new player', { playerId });
        socket.emit("error", { 
          message: "Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.",
          code: "GAME_ALREADY_STARTED"
        });
        return;
      }
      
      // Si le joueur était déjà connecté et que le jeu a commencé, c'est une reconnexion
      if (state.isStarted && isAlreadyConnected) {
        logger.info('Player reconnecting during active game', { playerId });
      }
      
      // Enregistrer le socket du joueur
      playersSockets.set(playerId, socket.id);
      socket.playerId = playerId;
      logger.info('Socket registered for player', { playerId, socketId: socket.id });
      
      // Ajouter le joueur à la liste des connectés seulement s'il n'y est pas déjà
      if (!isAlreadyConnected) {
        await gameState.addConnectedPlayer(playerId);
        
        // Vérifier que le joueur a bien été ajouté
        const updatedState = await gameState.getState();
        const isNowConnected = updatedState.connectedPlayers && updatedState.connectedPlayers.includes(playerId);
        if (!isNowConnected) {
          logger.error('Failed to add player to connectedPlayers', null, { playerId });
        } else {
          logger.debug('Player added to connectedPlayers', { playerId });
        }
        
        // Initialiser le score du joueur s'il n'existe pas encore
        // Et mettre à jour lastLoginAt dans auth-service
        try {
          const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
          const player = playersRes.data.find(p => p.id === playerId);
          const playerName = player ? player.name : 'Joueur anonyme';
          logger.debug('Player name from auth-service', { playerId, playerName });
          
          // Update lastLoginAt in auth-service
          try {
            await axios.put(`${services.AUTH_SERVICE_URL}/auth/players/${playerId}/update-last-login`);
            logger.debug('Updated lastLoginAt for player', { playerId });
          } catch (loginUpdateErr) {
            logger.warn('Could not update lastLoginAt for player', { playerId, error: loginUpdateErr.message });
            // Continue even if update fails
          }
          
          let score = await Score.findOne({ playerId });
          if (!score) {
            score = new Score({
              playerId,
              playerName,
              score: 0
            });
            await score.save();
            logger.info('Initialized score for new player', { playerId, playerName, score: 0 });
          } else {
            // Mettre à jour le nom si nécessaire
            if (score.playerName !== playerName) {
              score.playerName = playerName;
              await score.save();
              logger.debug('Updated player name', { playerId, playerName });
            }
          }
        } catch (err) {
          logger.error('Error initializing score for player', err, { playerId });
          // Continue même si l'initialisation échoue
        }
      }
      
      // Envoyer le nombre de joueurs connectés à tous
      const connectedCount = await gameState.getConnectedPlayersCount();
      const currentState = await gameState.getState();
      
      logger.debug('Emitting players:count event', { count: connectedCount, totalClients: io.sockets.sockets.size });
      io.emit("players:count", { count: connectedCount });
      
      // Envoyer le code de jeu au joueur qui vient de se connecter
      socket.emit("game:code", { gameCode: currentState.gameCode });
      
      // Si le jeu a déjà commencé, envoyer l'état actuel au joueur qui se reconnecte
      if (currentState.isStarted) {
        logger.info('Player reconnecting during active game', { playerId });
        
        // Envoyer l'événement de jeu démarré
        socket.emit("game:started", {
          questionIndex: currentState.currentQuestionIndex,
          totalQuestions: 0, // Sera mis à jour si nécessaire
          gameCode: currentState.gameCode
        });
        
        // Si une question est active, envoyer la question actuelle
        if (currentState.currentQuestionId) {
          try {
            const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
            const questions = quiz.data;
            const currentQuestion = questions.find(q => q.id === currentState.currentQuestionId);
            
            if (currentQuestion) {
              socket.emit("question:next", {
                question: {
                  id: currentQuestion.id,
                  question: currentQuestion.question,
                  choices: currentQuestion.choices
                },
                questionIndex: currentState.currentQuestionIndex,
                totalQuestions: questions.length,
                startTime: currentState.questionStartTime,
                duration: currentState.questionDuration
              });
            }
          } catch (err) {
            logger.error('Error fetching current question for reconnecting player', err, { playerId });
          }
        }
      }
      
      logger.info('Player registered successfully', {
        playerId,
        totalConnected: connectedCount,
        gameStarted: currentState.isStarted
      });
    } catch (error) {
      logger.error('Error registering player', error, {
        playerId,
        socketId: socket.id
      });
      // Envoyer une erreur plus détaillée en développement
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `Erreur lors de l'enregistrement: ${error.message}`
        : "Erreur lors de l'enregistrement";
      socket.emit("error", { 
        message: errorMessage,
        code: "REGISTRATION_ERROR"
      });
    }
  });

  // Handler de déconnexion
  socket.on("disconnect", async (reason) => {
    if (socket.playerId) {
      logger.info('Player disconnecting', {
        playerId: socket.playerId,
        socketId: socket.id,
        reason
      });
      playersSockets.delete(socket.playerId);
      await gameState.removeConnectedPlayer(socket.playerId);
      
      // Envoyer le nombre de joueurs connectés à tous
      const connectedCount = await gameState.getConnectedPlayersCount();
      io.emit("players:count", { count: connectedCount });
    }
    logger.info('Socket disconnected', {
      socketId: socket.id,
      reason
    });
  });
});

// Emit helper
function emitScoreUpdate(ioInstance, playerId, score, leaderboard) {
  const sid = playersSockets.get(playerId);
  if (sid) ioInstance.to(sid).emit("score:update", { playerId, score });
  ioInstance.emit("leaderboard:update", leaderboard); // broadcast
}

// Scheduled game checker - vérifie toutes les 10 secondes si un jeu doit être lancé
async function checkScheduledGames() {
  try {
    const scheduled = await gameState.getScheduledGame();
    if (scheduled && scheduled.scheduledStartTime) {
      const now = new Date();
      const scheduledTime = new Date(scheduled.scheduledStartTime);
      
      // Si la date planifiée est passée ou égale à maintenant, lancer le jeu
      if (scheduledTime <= now) {
        logger.info('Launching scheduled game', {
          scheduledTime: scheduledTime.toISOString(),
          currentTime: now.toISOString(),
          gameSessionId: party.id
        });
        
        // Lancer le jeu programmatiquement
        await launchScheduledGame(scheduled.questionDuration);
      }
    }
  } catch (error) {
    logger.error('Error checking scheduled games', error);
  }
}

// Fonction pour lancer un jeu planifié programmatiquement
async function launchScheduledGame(questionDurationMs) {
  try {
    const Score = require('./models/Score');
    
    // Fonction helper pour initialiser un score
    async function initializePlayerScore(playerId, playerName) {
      try {
        let score = await Score.findOne({ playerId });
        if (!score) {
          score = new Score({
            playerId,
            playerName,
            score: 0
          });
          await score.save();
          logger.debug('Initialized score for player', { playerId, playerName, score: 0 });
        }
        return score.toObject();
      } catch (error) {
        logger.error('Error initializing player score', error, { playerId });
        throw error;
      }
    }
    
    // Récupérer les questions (sans auth pour le lancement automatique - utiliser /quiz/all qui est public)
    let questions = [];
    try {
      const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/all`);
      questions = quiz.data || [];
      logger.info('Fetched questions for scheduled game', { count: questions.length, gameSessionId: party.id });
    } catch (quizError) {
      logger.error('Error fetching questions for scheduled game', quizError, { gameSessionId: party.id });
      return;
    }

    if (questions.length === 0) {
      logger.error('No questions available for scheduled game', null, { gameSessionId: party.id });
      return;
    }

    // Démarrer le jeu
    await gameState.startGame();
    const state = await gameState.getState();
    
    // Initialiser les scores pour tous les joueurs connectés
      logger.info('Initializing scores for connected players', { count: state.connectedPlayers.length });
    try {
      const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
      for (const playerId of state.connectedPlayers) {
        const player = playersRes.data.find(p => p.id === playerId);
        if (player) {
          await initializePlayerScore(playerId, player.name);
        } else {
          await initializePlayerScore(playerId, 'Joueur anonyme');
        }
      }
      logger.info('Scores initialized for all connected players', { count: state.connectedPlayers.length });
    } catch (err) {
      logger.error('Error initializing scores', err);
    }

    // Démarrer avec la première question
    if (questions.length > 0 && io) {
      const firstQuestion = questions[0];
      await gameState.setCurrentQuestion(firstQuestion.id, questionDurationMs);
      const newState = await gameState.getState();

      const connectedClients = io.sockets.sockets.size;
      const connectedPlayersCount = await gameState.getConnectedPlayersCount();
      console.log(`🚀 Connected WebSocket clients: ${connectedClients}`);
      console.log(`🚀 Connected players in gameState: ${connectedPlayersCount}`);

      // Émettre l'événement de début de jeu
      io.emit("game:started", {
        questionIndex: newState.currentQuestionIndex,
        totalQuestions: questions.length,
        gameCode: newState.gameCode
      });

      io.emit("question:next", {
        question: {
          id: firstQuestion.id,
          question: firstQuestion.question,
          choices: firstQuestion.choices
        },
        questionIndex: newState.currentQuestionIndex,
        totalQuestions: questions.length,
        startTime: newState.questionStartTime,
        duration: newState.questionDuration
      });

      // Programmer le timer pour passer automatiquement à la question suivante
      const gameController = require('./controllers/game.controller');
      gameController.scheduleNextQuestion(io, questionDurationMs);
      
      logger.info('Scheduled game started successfully', {
        gameSessionId: party.id,
        gameCode: party.gameCode
      });
    }
  } catch (error) {
    logger.error('Error launching scheduled game', error);
  }
}

// Vérifier les jeux planifiés toutes les 10 secondes
setInterval(checkScheduledGames, 10000);

// WebSocket connection logging
io.on("connection", (socket) => {
  const clientIP = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  logger.info('WebSocket client connected', {
    socketId: socket.id,
    ip: clientIP,
    userAgent: socket.handshake.headers['user-agent']?.substring(0, 50),
    totalClients: io.sockets.sockets.size
  });
  
  socket.on('disconnect', (reason) => {
    logger.info('WebSocket client disconnected', {
      socketId: socket.id,
      reason: reason
    });
  });
  
  socket.on('error', (error) => {
    logger.error('WebSocket error', error, {
      socketId: socket.id
    });
  });
});

const PORT = 3003;
server.listen(PORT, () => {
  logger.info(`Game service started on port ${PORT}`);
  logger.info(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
  console.log("📦 Redis cache: " + (process.env.REDIS_HOST ? "Enabled" : "Disabled"));
  console.log("⏰ Scheduled game checker: Enabled (checking every 10 seconds)");
});

module.exports = { io, emitScoreUpdate, playersSockets };