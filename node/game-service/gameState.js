// gameState.js - Gestion de l'état du jeu avec MongoDB
const GameState = require("./models/GameState");

// Fonction pour générer un code de jeu unique (6 caractères alphanumériques)
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Convertir le document MongoDB en objet simple
function toPlainObject(doc) {
  if (!doc) return null;
  return doc.toObject();
}

module.exports = {
  getState: async () => {
    try {
      const state = await GameState.getCurrent();
      return toPlainObject(state) || {
        isStarted: false,
        currentQuestionIndex: -1,
        currentQuestionId: null,
        questionStartTime: null,
        questionDuration: 30000,
        connectedPlayers: [],
        gameSessionId: null,
        gameCode: null,
        answers: {},
        results: {}
      };
    } catch (error) {
      console.error("Error getting game state:", error);
      return {
        isStarted: false,
        currentQuestionIndex: -1,
        currentQuestionId: null,
        questionStartTime: null,
        questionDuration: 30000,
        connectedPlayers: [],
        gameSessionId: null,
        gameCode: null,
        answers: {},
        results: {}
      };
    }
  },
  
  setState: async (updates) => {
    try {
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error setting game state:", error);
      throw error;
    }
  },
  
  resetGame: async () => {
    try {
      const newGameCode = generateGameCode();
      const updates = {
        isStarted: false,
        currentQuestionIndex: -1,
        currentQuestionId: null,
        questionStartTime: null,
        questionDuration: 30000,
        connectedPlayers: [],
        gameSessionId: `session_${Date.now()}`,
        gameCode: newGameCode,
        answers: {},
        results: {}
      };
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error resetting game:", error);
      throw error;
    }
  },
  
  generateNewGameCode: async () => {
    try {
      const newCode = generateGameCode();
      await GameState.updateCurrent({ gameCode: newCode });
      return newCode;
    } catch (error) {
      console.error("Error generating game code:", error);
      throw error;
    }
  },
  
  getGameCode: async () => {
    try {
      const state = await GameState.getCurrent();
      return state?.gameCode || null;
    } catch (error) {
      console.error("Error getting game code:", error);
      return null;
    }
  },
  
  addConnectedPlayer: async (playerId) => {
    try {
      const state = await GameState.getCurrent();
      if (!state.connectedPlayers.includes(playerId)) {
        state.connectedPlayers.push(playerId);
        await state.save();
      }
    } catch (error) {
      console.error("Error adding connected player:", error);
    }
  },
  
  removeConnectedPlayer: async (playerId) => {
    try {
      const state = await GameState.getCurrent();
      state.connectedPlayers = state.connectedPlayers.filter(p => p !== playerId);
      await state.save();
    } catch (error) {
      console.error("Error removing connected player:", error);
    }
  },
  
  getConnectedPlayersCount: async () => {
    try {
      const state = await GameState.getCurrent();
      return state?.connectedPlayers?.length || 0;
    } catch (error) {
      console.error("Error getting connected players count:", error);
      return 0;
    }
  },
  
  getConnectedPlayers: async () => {
    try {
      const state = await GameState.getCurrent();
      return state?.connectedPlayers || [];
    } catch (error) {
      console.error("Error getting connected players:", error);
      return [];
    }
  },
  
  startGame: async () => {
    try {
      const updates = {
        isStarted: true,
        currentQuestionIndex: 0,
        answers: {},
        results: {}
      };
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  },
  
  setCurrentQuestion: async (questionId, duration = 30000) => {
    try {
      const updates = {
        currentQuestionId: questionId,
        questionStartTime: Date.now(),
        questionDuration: duration
      };
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error setting current question:", error);
      throw error;
    }
  },
  
  nextQuestion: async () => {
    try {
      const state = await GameState.getCurrent();
      state.currentQuestionIndex += 1;
      state.currentQuestionId = null;
      state.questionStartTime = null;
      await state.save();
      return toPlainObject(state);
    } catch (error) {
      console.error("Error moving to next question:", error);
      throw error;
    }
  },
  
  saveAnswer: async (playerId, questionId, answer) => {
    try {
      const state = await GameState.getCurrent();
      if (!state.answers) {
        state.answers = {};
      }
      if (!state.answers[playerId]) {
        state.answers[playerId] = {};
      }
      state.answers[playerId][questionId] = answer;
      await state.save();
      return toPlainObject(state);
    } catch (error) {
      console.error("Error saving answer:", error);
      throw error;
    }
  },
  
  saveQuestionResult: async (questionId, correctAnswer, playerResults) => {
    try {
      const state = await GameState.getCurrent();
      if (!state.results) {
        state.results = {};
      }
      state.results[questionId] = {
        correctAnswer,
        playerResults
      };
      await state.save();
      return toPlainObject(state);
    } catch (error) {
      console.error("Error saving question result:", error);
      throw error;
    }
  },
  
  endGame: async () => {
    try {
      const updates = {
        isStarted: false,
        currentQuestionIndex: -1,
        currentQuestionId: null,
        questionStartTime: null
      };
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error ending game:", error);
      throw error;
    }
  }
};
