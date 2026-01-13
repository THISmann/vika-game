// game-service/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const gameRoutes = require("./routes/game.routes");
const websocketRoutes = require("./routes/websocket.routes");
const uploadRoutes = require("./routes/upload.routes");
const filesRoutes = require("./routes/files.routes");
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
  },
  path: "/socket.io", // IMPORTANT: path doit être "/socket.io" (sans slash final)
  serveClient: false
});

// Import routes (but now we pass "io" to controllers)
app.use("/game", (req, res, next) => {
  req.io = io;           // 👉 Make io accessible inside controllers
  next();
}, gameRoutes);

app.use("/game/upload", uploadRoutes);

// Serve files from MinIO
app.use("/api/files", filesRoutes);

// Error logging middleware (must be after routes)
app.use(errorLogger(logger));

// Store player socket IDs
const playersSockets = new Map();

// WebSocket routes setup (Express routes for WebSocket info)
app.use("/game", websocketRoutes);

// Emit helper
function emitScoreUpdate(ioInstance, playerId, score, leaderboard) {
  const sid = playersSockets.get(playerId);
  if (sid) ioInstance.to(sid).emit("score:update", { playerId, score });
  ioInstance.emit("leaderboard:update", leaderboard); // broadcast
}

// Scheduled game checker - vérifie toutes les 10 secondes si un jeu doit être lancé
async function checkScheduledGames() {
  try {
    const GameSession = require('./models/GameSession');
    const now = new Date();
    
    // 1. Vérifier les GameSession programmées (parties créées via createParty)
    const scheduledParties = await GameSession.find({
      status: 'scheduled',
      scheduledStartTime: { 
        $exists: true,
        $ne: null,
        $lte: now 
      },
      isStarted: false // S'assurer que la partie n'a pas déjà été démarrée
    }).limit(1); // Ne traiter qu'une partie à la fois
    
    // 2. Vérifier aussi GameState pour les jeux programmés via startGame avec scheduledStartTime
    const currentState = await gameState.getState();
    const hasScheduledGameState = currentState && 
                                   currentState.scheduledStartTime && 
                                   !currentState.isStarted &&
                                   new Date(currentState.scheduledStartTime) <= now;
    
    if (scheduledParties.length === 0 && !hasScheduledGameState) {
      // Log seulement toutes les 60 secondes pour éviter le spam
      const lastLogTime = checkScheduledGames.lastLogTime || 0;
      const nowTime = now.getTime();
      if (nowTime - lastLogTime > 60000) {
        // Vérifier combien de parties sont programmées pour le debug
        const totalScheduled = await GameSession.countDocuments({ 
          status: 'scheduled',
          scheduledStartTime: { $exists: true, $ne: null }
        });
        logger.debug('No scheduled parties to launch', {
          currentTime: now.toISOString(),
          ioAvailable: !!io,
          totalScheduled: totalScheduled,
          gameStateScheduled: !!currentState?.scheduledStartTime
        });
        checkScheduledGames.lastLogTime = nowTime;
      }
      return;
    }
    
    // Traiter les GameSession programmées
    if (scheduledParties.length > 0) {
      logger.info(`Found ${scheduledParties.length} scheduled party(ies) to launch`);
      
      for (const party of scheduledParties) {
        logger.info('Launching scheduled party', {
          partyId: party.id,
          partyName: party.name,
          scheduledTime: party.scheduledStartTime?.toISOString(),
          currentTime: now.toISOString(),
          questionIds: party.questionIds?.length || 0,
          timeDiff: party.scheduledStartTime ? (now.getTime() - party.scheduledStartTime.getTime()) / 1000 : null
        });
        
        // Lancer la partie programmatiquement en utilisant la logique de startParty
        try {
          // Mettre à jour le statut de la partie
          party.status = 'active';
          party.isStarted = true;
          party.startedAt = new Date();
          await party.save();
          
          // Mettre à jour GameState pour utiliser cette partie
          await gameState.setState({
            gameSessionId: party.id,
            gameCode: party.gameCode,
            createdBy: party.createdBy,
            questionDuration: party.questionDuration,
            scheduledStartTime: null, // Clear scheduled time when starting
            isStarted: true,
            currentQuestionIndex: 0,
            questionIds: party.questionIds // Store questionIds in gameState
          });
          
          // Lancer le jeu avec les questions de la partie
          await launchScheduledGameFromParty(party, io);
          
          logger.info('Scheduled party started successfully', {
            partyId: party.id,
            gameCode: party.gameCode
          });
        } catch (partyError) {
          logger.error('Error starting scheduled party', partyError, {
            partyId: party.id,
            errorMessage: partyError.message,
            errorStack: partyError.stack
          });
          // Ne pas arrêter la boucle si une partie échoue
        }
      }
    }
    
    // Traiter les jeux programmés via GameState (startGame avec scheduledStartTime)
    if (hasScheduledGameState) {
      logger.info('Launching scheduled game from GameState', {
        scheduledTime: currentState.scheduledStartTime?.toISOString(),
        currentTime: now.toISOString(),
        gameCode: currentState.gameCode,
        timeDiff: currentState.scheduledStartTime ? (now.getTime() - new Date(currentState.scheduledStartTime).getTime()) / 1000 : null
      });
      
      try {
        // Récupérer les questions depuis quiz-service
        let questions = [];
        try {
          const questionsRes = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/all`);
          questions = questionsRes.data || [];
        } catch (err) {
          logger.error('Error fetching questions for scheduled game', err);
          return; // Ne pas démarrer si on ne peut pas récupérer les questions
        }

        if (questions.length === 0) {
          logger.warn('No questions found for scheduled game');
          return;
        }

        // Réinitialiser les scores
        const Score = require('./models/Score');
        await Score.deleteMany({});
        
        // Initialiser les scores pour les joueurs connectés
        if (currentState.connectedPlayers && currentState.connectedPlayers.length > 0) {
          try {
            const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
            for (const playerId of currentState.connectedPlayers) {
              const player = playersRes.data.find(p => p.id === playerId);
              if (player) {
                const score = new Score({
                  playerId,
                  playerName: player.name,
                  score: 0
                });
                await score.save();
              }
            }
            logger.info('Scores initialized for connected players', { count: currentState.connectedPlayers.length });
          } catch (err) {
            logger.error('Error initializing scores', err);
          }
        }

        // Démarrer le jeu avec la première question
        if (questions.length > 0 && io) {
          const firstQuestion = questions[0];
          const questionDuration = currentState.questionDuration || 30000;
          
          // Mettre à jour GameState pour démarrer le jeu
          await gameState.setState({
            scheduledStartTime: null, // Clear scheduled time when starting
            isStarted: true,
            currentQuestionIndex: 0,
            questionIds: questions.map(q => q.id)
          });
          
          await gameState.setCurrentQuestion(firstQuestion.id, questionDuration);
          
          io.emit("game:started", {
            questionIndex: 0,
            totalQuestions: questions.length,
            gameCode: currentState.gameCode
          });
          
          io.emit("question:next", {
            question: firstQuestion,
            questionIndex: 0,
            totalQuestions: questions.length,
            duration: questionDuration
          });

          // Programmer la question suivante
          const gameController = require('./controllers/game.controller');
          gameController.scheduleNextQuestion(io, questionDuration);
          
          logger.info('Scheduled game from GameState started successfully', {
            gameCode: currentState.gameCode,
            questionsCount: questions.length
          });
        }
      } catch (gameStateError) {
        logger.error('Error starting scheduled game from GameState', gameStateError, {
          errorMessage: gameStateError.message,
          errorStack: gameStateError.stack
        });
      }
    }
  } catch (error) {
    logger.error('Error checking scheduled games', error, {
      errorMessage: error.message,
      errorStack: error.stack
    });
  }
}

// Fonction pour lancer un jeu planifié programmatiquement depuis une GameSession
async function launchScheduledGameFromParty(party, ioInstance) {
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
    
    // Récupérer les questions depuis quiz-service en utilisant les questionIds de la partie
    let questions = [];
    try {
      if (party.questionIds && party.questionIds.length > 0) {
        // Récupérer toutes les questions et filtrer par questionIds
        const questionsRes = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/all`);
        const allQuestions = questionsRes.data || [];
        questions = allQuestions.filter(q => party.questionIds.includes(q.id));
      } else {
        logger.warn('Party has no questionIds', { partyId: party.id });
        return;
      }
    } catch (err) {
      logger.error('Error fetching questions for scheduled party', err, { partyId: party.id });
      return;
    }

    if (questions.length === 0) {
      logger.warn('No questions found for scheduled party', { partyId: party.id, questionIds: party.questionIds });
      return;
    }

    // Réinitialiser les scores
    await Score.deleteMany({});
    
    // Initialiser les scores pour les joueurs connectés
    const currentState = await gameState.getState();
    if (currentState.connectedPlayers && currentState.connectedPlayers.length > 0) {
    try {
      const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
        for (const playerId of currentState.connectedPlayers) {
        const player = playersRes.data.find(p => p.id === playerId);
        if (player) {
          await initializePlayerScore(playerId, player.name);
          }
        }
        logger.info('Scores initialized for connected players', { count: currentState.connectedPlayers.length });
    } catch (err) {
      logger.error('Error initializing scores', err);
      }
    }

    // Démarrer le jeu avec la première question
    if (questions.length > 0 && ioInstance) {
      const firstQuestion = questions[0];
      await gameState.setCurrentQuestion(firstQuestion.id, party.questionDuration);
      
      ioInstance.emit("game:started", {
        questionIndex: 0,
        totalQuestions: questions.length,
        gameCode: party.gameCode
      });
      
      ioInstance.emit("question:next", {
        question: firstQuestion,
        questionIndex: 0,
        totalQuestions: questions.length,
        duration: party.questionDuration
      });

      // Programmer la question suivante en utilisant la fonction exportée du controller
      const gameController = require('./controllers/game.controller');
      gameController.scheduleNextQuestion(ioInstance, party.questionDuration);
    }
    
    logger.info('Scheduled party launched successfully', {
      partyId: party.id,
      gameCode: party.gameCode,
      questionsCount: questions.length
    });
  } catch (error) {
    logger.error('Error launching scheduled party', error, {
      partyId: party?.id
    });
  }
}

// Vérifier les jeux planifiés toutes les 10 secondes
// IMPORTANT: S'assurer que io est défini avant de démarrer le checker
let scheduledGamesInterval = null;

// Démarrer le checker après que le serveur soit prêt
function startScheduledGamesChecker() {
  if (scheduledGamesInterval) {
    clearInterval(scheduledGamesInterval);
  }
  
  logger.info('Starting scheduled games checker (every 10 seconds)');
  
  // Exécuter immédiatement une première vérification
  checkScheduledGames().catch(err => {
    logger.error('Error in initial scheduled games check', err);
  });
  
  // Puis vérifier toutes les 10 secondes
  scheduledGamesInterval = setInterval(() => {
    checkScheduledGames().catch(err => {
      logger.error('Error in scheduled games check', err);
    });
  }, 10000);
  
  logger.info('Scheduled games checker started successfully');
}

// Démarrer le checker après que le serveur soit prêt
startScheduledGamesChecker();

// WebSocket connection logging
io.on("connection", (socket) => {
  const clientIP = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  logger.info('WebSocket client connected', {
    socketId: socket.id,
    ip: clientIP,
    userAgent: socket.handshake.headers['user-agent']?.substring(0, 50),
    totalClients: io.sockets.sockets.size
  });
  
  // Handler pour l'enregistrement des joueurs
  socket.on('register', async (playerId) => {
    try {
      logger.info('Player registration request', {
        socketId: socket.id,
        playerId: playerId
      });
      
      if (!playerId) {
        socket.emit('error', {
          code: 'INVALID_PLAYER_ID',
          message: 'Player ID is required'
        });
        return;
      }
      
      // Vérifier l'état du jeu avec timeout
      let state;
      try {
        state = await Promise.race([
          gameState.getState(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (stateError) {
        logger.warn('Error getting game state, continuing anyway', {
          error: stateError.message,
          playerId: playerId
        });
        // Créer un état par défaut si on ne peut pas le récupérer
        state = { isStarted: false };
      }
      
      // Si le jeu a déjà commencé, ne pas permettre l'enregistrement
      if (state.isStarted) {
        logger.warn('Registration rejected: game already started', {
          playerId: playerId,
          socketId: socket.id
        });
        socket.emit('error', {
          code: 'GAME_ALREADY_STARTED',
          message: 'Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.'
        });
        return;
      }
      
      // Ajouter le joueur à la liste des joueurs connectés avec retry
      try {
        await Promise.race([
          gameState.addConnectedPlayer(playerId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        logger.info('Player added to connectedPlayers', { playerId });
      } catch (addError) {
        logger.error('Error adding player to connectedPlayers, but continuing', {
          error: addError.message,
          playerId: playerId
        });
        // Continuer même si l'ajout échoue pour ne pas bloquer le joueur
      }
      
      // Stocker le socket ID pour ce joueur
      playersSockets.set(playerId, socket.id);
      
      // Récupérer le gameCode actuel
      let currentState;
      let gameCode = null;
      let connectedCount = 0;
      try {
        currentState = await Promise.race([
          gameState.getState(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        gameCode = currentState.gameCode;
        connectedCount = await Promise.race([
          gameState.getConnectedPlayersCount(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } catch (stateError) {
        logger.warn('Error getting game state for response', { error: stateError.message });
      }
      
      // Envoyer le gameCode au joueur
      if (gameCode) {
        socket.emit('game:code', { gameCode });
      }
      
      // Émettre le comptage des joueurs à tous les clients
      io.emit('players:count', { count: connectedCount });
      
      logger.info('Player registered successfully', {
        playerId: playerId,
        socketId: socket.id,
        gameCode: gameCode,
        connectedCount: connectedCount
      });
    } catch (error) {
      logger.error('Error registering player', error, {
        playerId: playerId,
        socketId: socket.id
      });
      socket.emit('error', {
        code: 'REGISTRATION_ERROR',
        message: 'Erreur lors de l\'enregistrement du joueur'
      });
    }
  });
  
  socket.on('disconnect', async (reason) => {
    logger.info('WebSocket client disconnected', {
      socketId: socket.id,
      reason: reason
    });
    
    // Trouver le playerId associé à ce socket et le retirer
    for (const [playerId, socketId] of playersSockets.entries()) {
      if (socketId === socket.id) {
        try {
          await gameState.removeConnectedPlayer(playerId);
          playersSockets.delete(playerId);
          
          // Émettre le nouveau comptage à tous les clients
          const connectedCount = await gameState.getConnectedPlayersCount();
          io.emit('players:count', { count: connectedCount });
          
          logger.info('Player removed from connected players', {
            playerId: playerId,
            connectedCount: connectedCount
          });
        } catch (error) {
          logger.error('Error removing player on disconnect', error, {
            playerId: playerId
          });
        }
        break;
      }
    }
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
