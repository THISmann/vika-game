// game-service/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const gameRoutes = require("./routes/game.routes");
const path = require("path"); 
const cors = require('cors');
const gameState = require("./gameState");

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Create server
const server = http.createServer(app);

// Create websocket server
const io = new Server(server, {
  cors: { origin: "*" }
});

// Import routes (but now we pass "io" to controllers)
app.use("/game", (req, res, next) => {
  req.io = io;           // 👉 Make io accessible inside controllers
  next();
}, gameRoutes);

// Player socket map
const playersSockets = new Map();

io.on("connection", (socket) => {
  console.log("ws connected", socket.id);

  socket.on("register", (playerId) => {
    const state = gameState.getState();
    
    // Vérifier si le jeu a déjà commencé
    if (state.isStarted) {
      socket.emit("error", { message: "Le jeu a déjà commencé. Vous ne pouvez plus vous connecter." });
      return;
    }
    
    playersSockets.set(playerId, socket.id);
    socket.playerId = playerId;
    gameState.addConnectedPlayer(playerId);
    
    // Envoyer le nombre de joueurs connectés à tous
    const connectedCount = gameState.getConnectedPlayersCount();
    io.emit("players:count", { count: connectedCount });
    
    console.log("player registered:", playerId, "Total:", connectedCount);
  });

  socket.on("disconnect", () => {
    if (socket.playerId) {
      playersSockets.delete(socket.playerId);
      gameState.removeConnectedPlayer(socket.playerId);
      
      // Envoyer le nombre de joueurs connectés à tous
      const connectedCount = gameState.getConnectedPlayersCount();
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