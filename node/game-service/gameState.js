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
  const obj = doc.toObject();
  // S'assurer que answers est bien un objet JavaScript (pas un objet Mongoose)
  if (obj.answers && typeof obj.answers === 'object') {
    // Convertir en objet JavaScript simple si nécessaire
    obj.answers = JSON.parse(JSON.stringify(obj.answers));
  }
  return obj;
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
        results: {},
        questionIds: []
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
        results: {},
        questionIds: []
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
  
  resetGame: async (userId = null) => {
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
        results: {},
        createdBy: userId || null,
        createdAt: new Date()
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
      console.log(`\n🟡 [gameState] ========== ADD CONNECTED PLAYER ==========`);
      console.log(`🟡 [gameState] Player ID: ${playerId}`);
      
      // Utiliser une requête atomique MongoDB pour éviter les problèmes de timeout
      // Utiliser $addToSet pour éviter les doublons
      const result = await GameState.findOneAndUpdate(
        { key: 'current' },
        { 
          $addToSet: { connectedPlayers: playerId },
          $setOnInsert: { key: 'current' } // Créer le document s'il n'existe pas
        },
        { 
          upsert: true, 
          new: true,
          maxTimeMS: 5000 // Timeout de 5 secondes
        }
      );
      
      if (result) {
        console.log(`🟡 [gameState] Player added successfully. Connected players:`, result.connectedPlayers || []);
        console.log(`🟡 [gameState] ========================================\n`);
        return result;
      } else {
        // Fallback: essayer avec getCurrent + save si findOneAndUpdate échoue
        console.log(`🟡 [gameState] findOneAndUpdate returned null, trying fallback...`);
        const state = await GameState.getCurrent();
        if (!state.connectedPlayers || !state.connectedPlayers.includes(playerId)) {
          if (!state.connectedPlayers) {
            state.connectedPlayers = [];
          }
          state.connectedPlayers.push(playerId);
          await state.save();
          console.log(`🟡 [gameState] Player added via fallback. Connected players:`, state.connectedPlayers);
        } else {
          console.log(`🟡 [gameState] Player already in list`);
        }
        console.log(`🟡 [gameState] ========================================\n`);
        return state;
      }
    } catch (error) {
      console.error("🟡 [gameState] ❌ Error adding connected player:", error);
      console.error("🟡 [gameState] ❌ Error stack:", error.stack);
      // Ne pas throw pour ne pas bloquer le flux, mais logger l'erreur
      throw error;
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
      // NE PAS réinitialiser answers ici, car les joueurs peuvent avoir répondu avant le démarrage
      // On réinitialise seulement results
      const updates = {
        isStarted: true,
        currentQuestionIndex: 0,
        results: {},
        scheduledStartTime: null // Clear scheduled time when game starts
        // answers: {} - REMOVED: ne pas effacer les réponses existantes
      };
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error starting game:", error);
      throw error;
    }
  },
  
  scheduleGame: async (scheduledStartTime, questionDuration = 30000) => {
    try {
      const updates = {
        scheduledStartTime: scheduledStartTime,
        questionDuration: questionDuration,
        isStarted: false // Game is not started yet
      };
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error scheduling game:", error);
      throw error;
    }
  },
  
  getScheduledGame: async () => {
    try {
      const state = await GameState.getCurrent();
      if (state && state.scheduledStartTime && !state.isStarted) {
        return {
          scheduledStartTime: state.scheduledStartTime,
          questionDuration: state.questionDuration || 30000
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting scheduled game:", error);
      return null;
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
      console.log(`\n💾 ========== SAVE ANSWER ==========`);
      console.log(`💾 Player: ${playerId}`);
      console.log(`💾 Question: ${questionId}`);
      console.log(`💾 Answer: "${answer}"`);
      
      const state = await GameState.getCurrent();
      console.log(`💾 Current state before save:`, {
        hasAnswers: !!state.answers,
        answersType: typeof state.answers,
        answersKeys: state.answers ? Object.keys(state.answers) : []
      });
      
      if (!state.answers) {
        console.log(`💾 Creating new answers object`);
        state.answers = {};
      }
      if (!state.answers[playerId]) {
        console.log(`💾 Creating new answers object for player ${playerId}`);
        state.answers[playerId] = {};
      }
      
      // Sauvegarder la réponse originale (on normalisera lors de la comparaison)
      state.answers[playerId][questionId] = answer;
      console.log(`💾 Answer set in state object`);
      
      await state.save();
      console.log(`💾 State saved to MongoDB`);
      
      // Vérifier que la réponse a bien été sauvegardée
      const savedState = await GameState.getCurrent();
      const savedAnswer = savedState.answers?.[playerId]?.[questionId];
      console.log(`💾 Verification after save:`);
      console.log(`   Original: "${answer}" (type: ${typeof answer}, length: ${String(answer).length})`);
      console.log(`   Saved: "${savedAnswer}" (type: ${typeof savedAnswer}, length: ${String(savedAnswer).length})`);
      console.log(`   Match: ${answer === savedAnswer ? '✅' : '❌'}`);
      console.log(`   All answers in state:`, JSON.stringify(savedState.answers, null, 2));
      console.log(`========================================\n`);
      
      return toPlainObject(state);
    } catch (error) {
      console.error("❌ Error saving answer:", error);
      console.error("❌ Error stack:", error.stack);
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
        questionStartTime: null,
        connectedPlayers: [] // Clear connected players when game ends
      };
      const state = await GameState.updateCurrent(updates);
      return toPlainObject(state);
    } catch (error) {
      console.error("Error ending game:", error);
      throw error;
    }
  }
};
