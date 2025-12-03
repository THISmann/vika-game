// gameState.js - Gestion de l'état du jeu
const fs = require("fs");
const path = require("path");

const gameStatePath = path.join(__dirname, "../data/gameState.json");

// Fonction pour générer un code de jeu unique (6 caractères alphanumériques)
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// État initial du jeu
const initialState = {
  isStarted: false,
  currentQuestionIndex: -1,
  currentQuestionId: null,
  questionStartTime: null,
  questionDuration: 30000, // 30 secondes par défaut
  connectedPlayers: [],
  gameSessionId: null,
  gameCode: null, // Code de jeu pour les joueurs
  answers: {}, // { playerId: { questionId: answer, ... } }
  results: {} // { questionId: { correctAnswer, playerResults: [] } }
};

function readGameState() {
  try {
    if (fs.existsSync(gameStatePath)) {
      return JSON.parse(fs.readFileSync(gameStatePath));
    }
  } catch (err) {
    console.error("Error reading game state:", err);
  }
  return { ...initialState };
}

function writeGameState(state) {
  try {
    // Ensure directory exists
    const dir = path.dirname(gameStatePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(gameStatePath, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Error writing game state:", err);
  }
}

let gameState = readGameState();

// Réinitialiser l'état si nécessaire
if (!gameState.gameSessionId) {
  gameState.gameSessionId = `session_${Date.now()}`;
  if (!gameState.gameCode) {
    gameState.gameCode = generateGameCode();
  }
  writeGameState(gameState);
}

module.exports = {
  getState: () => ({ ...gameState }),
  
  setState: (updates) => {
    gameState = { ...gameState, ...updates };
    writeGameState(gameState);
    return gameState;
  },
  
  resetGame: () => {
    gameState = {
      ...initialState,
      gameSessionId: `session_${Date.now()}`,
      gameCode: generateGameCode(),
      connectedPlayers: [],
      answers: {},
      results: {}
    };
    writeGameState(gameState);
    return gameState;
  },
  
  generateNewGameCode: () => {
    gameState.gameCode = generateGameCode();
    writeGameState(gameState);
    return gameState.gameCode;
  },
  
  getGameCode: () => gameState.gameCode,
  
  addConnectedPlayer: (playerId) => {
    if (!gameState.connectedPlayers.includes(playerId)) {
      gameState.connectedPlayers.push(playerId);
      writeGameState(gameState);
    }
  },
  
  removeConnectedPlayer: (playerId) => {
    gameState.connectedPlayers = gameState.connectedPlayers.filter(p => p !== playerId);
    writeGameState(gameState);
  },
  
  getConnectedPlayersCount: () => gameState.connectedPlayers.length,
  
  startGame: () => {
    gameState.isStarted = true;
    gameState.currentQuestionIndex = 0;
    gameState.answers = {};
    gameState.results = {};
    writeGameState(gameState);
    return gameState;
  },
  
  setCurrentQuestion: (questionId, duration = 30000) => {
    gameState.currentQuestionId = questionId;
    gameState.questionStartTime = Date.now();
    gameState.questionDuration = duration;
    writeGameState(gameState);
    return gameState;
  },
  
  nextQuestion: () => {
    gameState.currentQuestionIndex++;
    gameState.currentQuestionId = null;
    gameState.questionStartTime = null;
    writeGameState(gameState);
    return gameState;
  },
  
  saveAnswer: (playerId, questionId, answer) => {
    if (!gameState.answers[playerId]) {
      gameState.answers[playerId] = {};
    }
    gameState.answers[playerId][questionId] = answer;
    writeGameState(gameState);
    return gameState;
  },
  
  saveQuestionResult: (questionId, correctAnswer, playerResults) => {
    gameState.results[questionId] = {
      correctAnswer,
      playerResults
    };
    writeGameState(gameState);
    return gameState;
  },
  
  endGame: () => {
    gameState.isStarted = false;
    gameState.currentQuestionIndex = -1;
    gameState.currentQuestionId = null;
    gameState.questionStartTime = null;
    writeGameState(gameState);
    return gameState;
  }
};



