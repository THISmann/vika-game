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

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Connect to MongoDB
connectDB();

// Create server
const server = http.createServer(app);

// Create websocket server
// IMPORTANT: path doit être "/socket.io" (sans slash final) pour compatibilité avec le proxy
const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io",
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Import routes (but now we pass "io" to controllers)
app.use("/game", (req, res, next) => {
  req.io = io;           // 👉 Make io accessible inside controllers
  next();
}, gameRoutes);

// Player socket map
const playersSockets = new Map();

io.on("connection", (socket) => {
  console.log("✅ WebSocket client connected:", socket.id, "Total clients:", io.sockets.sockets.size);

  socket.on("register", async (playerId) => {
    try {
      const state = await gameState.getState();
      
      // Vérifier si le jeu a déjà commencé
      if (state.isStarted) {
        socket.emit("error", { message: "Le jeu a déjà commencé. Vous ne pouvez plus vous connecter." });
        return;
      }
      
      playersSockets.set(playerId, socket.id);
      socket.playerId = playerId;
      await gameState.addConnectedPlayer(playerId);
      
      // Envoyer le nombre de joueurs connectés à tous
      const connectedCount = await gameState.getConnectedPlayersCount();
      const currentState = await gameState.getState();
      
      io.emit("players:count", { count: connectedCount });
      
      // Envoyer le code de jeu au joueur qui vient de se connecter
      socket.emit("game:code", { gameCode: currentState.gameCode });
      
      console.log("player registered:", playerId, "Total:", connectedCount);
    } catch (error) {
      console.error("Error registering player:", error);
      socket.emit("error", { message: "Erreur lors de l'enregistrement" });
    }
  });

  socket.on("disconnect", async () => {
    if (socket.playerId) {
      playersSockets.delete(socket.playerId);
      await gameState.removeConnectedPlayer(socket.playerId);
      
      // Envoyer le nombre de joueurs connectés à tous
      const connectedCount = await gameState.getConnectedPlayersCount();
      io.emit("players:count", { count: connectedCount });
    }
    console.log("ws disconnected", socket.id);
  });
});

// Emit helper
function emitScoreUpdate(ioInstance, playerId, score, leaderboard) {
  const sid = playersSockets.get(playerId);
  if (sid) ioInstance.to(sid).emit("score:update", { playerId, score });
  ioInstance.emit("leaderboard:update", leaderboard); // broadcast
}

const PORT = 3003;
server.listen(PORT, () =>
  console.log("Game service (ws) running on port " + PORT)
);

module.exports = { io, emitScoreUpdate, playersSockets };