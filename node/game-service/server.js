// game-service/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const gameRoutes = require("./routes/game.routes");
const path = require("path"); 
const cors = require('cors');
const gameState = require("./gameState");
const connectDB = require("./config/database");
const axios = require("axios");
const services = require("./config/services");
const Score = require("./models/Score");
const redisClient = require("../shared/redis-client");

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Connect to MongoDB
connectDB();

// Connect to Redis (non-blocking)
redisClient.connect().catch(err => {
  console.warn('⚠️ Redis connection failed, continuing without cache:', err.message);
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
      console.log(`🔍 Socket.io request with sid: ${sid.substring(0, 10)}... from ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
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

// Player socket map
const playersSockets = new Map();

io.on("connection", (socket) => {
  const clientIP = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log("✅ WebSocket client connected:", socket.id, "IP:", clientIP, "Total clients on this pod:", io.sockets.sockets.size);
  
  // Logger les erreurs de connexion
  socket.on("error", (error) => {
    console.error("❌ Socket error:", socket.id, error);
  });
  
  // Logger les tentatives de reconnexion
  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log("🔄 Reconnection attempt:", socket.id, "Attempt:", attemptNumber);
  });

  socket.on("register", async (playerId) => {
    try {
      const state = await gameState.getState();
      
      // Vérifier si le joueur est déjà dans la liste des joueurs connectés
      const isAlreadyConnected = state.connectedPlayers && state.connectedPlayers.includes(playerId);
      
      // Si le jeu a déjà commencé, vérifier si le joueur était déjà enregistré
      // Si le joueur était déjà enregistré, permettre la reconnexion (par exemple après une déconnexion temporaire)
      if (state.isStarted && !isAlreadyConnected) {
        // Vérifier si le joueur avait déjà été enregistré dans une session précédente
        // En regardant les scores ou autres données persistantes
        // Pour l'instant, on rejette seulement les nouveaux joueurs
        console.log(`⚠️ Game already started, rejecting new player: ${playerId}`);
        socket.emit("error", { 
          message: "Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.",
          code: "GAME_ALREADY_STARTED"
        });
        return;
      }
      
      // Si le joueur était déjà connecté et que le jeu a commencé, c'est une reconnexion
      if (state.isStarted && isAlreadyConnected) {
        console.log(`🔄 Player reconnecting during active game: ${playerId}`);
      }
      
      // Enregistrer le socket du joueur
    playersSockets.set(playerId, socket.id);
    socket.playerId = playerId;
      
      // Ajouter le joueur à la liste des connectés seulement s'il n'y est pas déjà
      if (!isAlreadyConnected) {
        await gameState.addConnectedPlayer(playerId);
        
        // Initialiser le score du joueur s'il n'existe pas encore
        try {
          const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
          const player = playersRes.data.find(p => p.id === playerId);
          const playerName = player ? player.name : 'Joueur anonyme';
          
          let score = await Score.findOne({ playerId });
          if (!score) {
            score = new Score({
              playerId,
              playerName,
              score: 0
            });
            await score.save();
            console.log(`🆕 Initialized score for new player: ${playerName} (${playerId}) = 0`);
          } else {
            // Mettre à jour le nom si nécessaire
            if (score.playerName !== playerName) {
              score.playerName = playerName;
              await score.save();
              console.log(`🔄 Updated name for ${playerId}: ${playerName}`);
            }
          }
        } catch (err) {
          console.error(`❌ Error initializing score for player ${playerId}:`, err);
          // Continue même si l'initialisation échoue
        }
      }
      
      // Envoyer le nombre de joueurs connectés à tous
      const connectedCount = await gameState.getConnectedPlayersCount();
      const currentState = await gameState.getState();
      
      io.emit("players:count", { count: connectedCount });
      
      // Envoyer le code de jeu au joueur qui vient de se connecter
      socket.emit("game:code", { gameCode: currentState.gameCode });
      
      // Si le jeu a déjà commencé, envoyer l'état actuel au joueur qui se reconnecte
      if (currentState.isStarted) {
        console.log("🔄 Player reconnecting during active game:", playerId);
        
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
            console.error("Error fetching current question for reconnecting player:", err);
          }
        }
      }
      
      console.log("✅ Player registered:", playerId, "Total:", connectedCount, "Game started:", currentState.isStarted);
    } catch (error) {
      console.error("Error registering player:", error);
      socket.emit("error", { message: "Erreur lors de l'enregistrement" });
    }
  });

  // Handler de déconnexion
  socket.on("disconnect", async (reason) => {
    if (socket.playerId) {
      console.log("🔌 Player disconnecting:", socket.playerId, "Socket ID:", socket.id, "Reason:", reason);
      playersSockets.delete(socket.playerId);
      await gameState.removeConnectedPlayer(socket.playerId);
      
      // Envoyer le nombre de joueurs connectés à tous
      const connectedCount = await gameState.getConnectedPlayersCount();
      io.emit("players:count", { count: connectedCount });
    }
    console.log("⚠️ Socket disconnected:", socket.id, "Reason:", reason);
  });
});

// Emit helper
function emitScoreUpdate(ioInstance, playerId, score, leaderboard) {
  const sid = playersSockets.get(playerId);
  if (sid) ioInstance.to(sid).emit("score:update", { playerId, score });
  ioInstance.emit("leaderboard:update", leaderboard); // broadcast
}

const PORT = 3003;
server.listen(PORT, () => {
  console.log("Game service (ws) running on port " + PORT);
  console.log("📦 Redis cache: " + (process.env.REDIS_HOST ? "Enabled" : "Disabled"));
});

module.exports = { io, emitScoreUpdate, playersSockets };