const axios = require("axios");
const gameState = require("../gameState");
const services = require("../config/services");
const Score = require("../models/Score");
const cache = require("../shared/cache-utils");

// Clés de cache
const CACHE_KEYS = {
  LEADERBOARD: cache.PREFIXES.LEADERBOARD + 'current',
  GAME_STATE: cache.PREFIXES.GAME + 'state',
  SCORE: (playerId) => cache.PREFIXES.SCORE + `player:${playerId}`,
  CONNECTED_PLAYERS: cache.PREFIXES.GAME + 'connected-players'
};

// Initialize score for a player (create if doesn't exist, keep if exists)
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
      console.log(`🆕 Initialized score for ${playerName} (${playerId}) = 0`);
    } else {
      // Update name if it changed
      if (score.playerName !== playerName) {
        score.playerName = playerName;
        await score.save();
        console.log(`🔄 Updated name for ${playerId}: ${playerName}`);
      }
    }

    return score.toObject();
  } catch (error) {
    console.error("Error initializing player score:", error);
    throw error;
  }
}

// Fonction de normalisation robuste des réponses
function normalizeAnswer(answer) {
  if (answer === null || answer === undefined) {
    return '';
  }
  
  // Convertir en string
  let normalized = String(answer);
  
  // Supprimer les espaces avant/après
  normalized = normalized.trim();
  
  // Supprimer les espaces multiples
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Supprimer les caractères invisibles (zero-width space, etc.)
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Normaliser les caractères Unicode (é → e, etc.)
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return normalized;
}

// Update player score + save playerName - VERSION SIMPLIFIÉE ET ROBUSTE
async function updateScore(playerId, playerName, delta) {
  try {
    console.log(`\n💾 ========== UPDATE SCORE ==========`);
    console.log(`💾 Player: ${playerName} (${playerId})`);
    console.log(`💾 Delta: ${delta}`);
    
    // Utiliser findOneAndUpdate pour une opération atomique
    const score = await Score.findOneAndUpdate(
      { playerId },
      { 
        $set: { playerName },
        $inc: { score: delta }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    if (!score) {
      // Si le document n'existe toujours pas, le créer
      const newScore = new Score({
        playerId,
        playerName,
        score: delta
      });
      await newScore.save();
      console.log(`💾 Created new score: ${playerName} (${playerId}) = ${delta}`);
      return newScore.toObject();
    }

    console.log(`💾 Score updated: ${playerName} (${playerId}) = ${score.score}`);
    
    // Invalider le cache du score et du leaderboard
    await cache.del(CACHE_KEYS.SCORE(playerId));
    await cache.del(CACHE_KEYS.LEADERBOARD);
    
    console.log(`💾 Cache invalidated for player ${playerId} and leaderboard`);
    console.log(`========================================\n`);
    return score.toObject();
  } catch (error) {
    console.error("❌ Error updating score:", error);
    console.error("❌ Error stack:", error.stack);
    throw error;
  }
}

// SOLUTION SIMPLE : Calculer et mettre à jour le score IMMÉDIATEMENT quand une réponse est donnée
exports.answerQuestion = async (req, res) => {
  const { playerId, questionId, answer } = req.body;

  try {
    if (!playerId || !questionId || !answer) {
      return res.status(400).json({ error: "playerId, questionId et answer sont requis" });
    }

    const state = await gameState.getState();

    // Vérifier si le jeu a commencé
    if (!state || !state.isStarted) {
      return res.status(400).json({ error: "Le jeu n'a pas encore commencé" });
    }

    // Vérifier si c'est la bonne question
    if (state.currentQuestionId !== questionId) {
      return res.status(400).json({ error: "Cette question n'est plus active" });
    }

    // Vérifier si le joueur a déjà répondu
    const answers = state.answers || {};
    if (answers[playerId] && answers[playerId][questionId]) {
      return res.json({
        alreadyAnswered: true,
        message: "Vous avez déjà répondu à cette question"
      });
    }

    // 🔍 Fetch player
    let player;
    try {
      const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
      player = playersRes.data.find(p => p.id === playerId);
      if (!player) {
        console.error(`❌ Player ${playerId} not found in auth service`);
        return res.status(404).json({ error: "Player not found" });
      }
      console.log(`✅ Player found: ${player.name} (${playerId})`);
    } catch (err) {
      console.error("❌ Error fetching player:", err);
      return res.status(500).json({ error: "Erreur lors de la récupération du joueur" });
    }

    // 🔍 Fetch quiz question answer
    // Utiliser l'endpoint public /quiz/verify/:id pour obtenir la réponse correcte
    let question;
    try {
      // Utiliser l'endpoint public /quiz/verify/:id qui ne nécessite pas d'authentification
      const verifyRes = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/verify/${questionId}`);
      question = {
        id: verifyRes.data.id,
        answer: verifyRes.data.answer
      };
      
      if (!question || !question.answer) {
        console.error(`❌ Question ${questionId} has no answer`);
        return res.status(404).json({ error: "Question answer not found" });
      }
      
      console.log(`✅ Question ${questionId} answer fetched successfully`);
    } catch (err) {
      console.error("❌ Error fetching question answer:", err.message);
      if (err.response?.status === 404) {
        return res.status(404).json({ error: "Question not found" });
      }
      // En cas d'erreur, essayer avec /quiz/all pour obtenir au moins la question (sans réponse)
      try {
        const allRes = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/all`);
        const questionFromAll = allRes.data.find(q => q.id === questionId);
        if (questionFromAll) {
          // Si on trouve la question mais pas la réponse, retourner une erreur
          console.error(`❌ Question ${questionId} found but answer not available`);
          return res.status(500).json({ error: "Erreur lors de la récupération de la réponse" });
        }
      } catch (allErr) {
        console.error("❌ Error fetching question from /quiz/all:", allErr.message);
      }
      return res.status(500).json({ error: "Erreur lors de la récupération de la question" });
    }

    // Normaliser les réponses pour la comparaison
    const normalizedAnswer = normalizeAnswer(answer);
    const normalizedCorrect = normalizeAnswer(question.answer);
    const isCorrect = normalizedAnswer === normalizedCorrect;
    
    // Log détaillé pour le débogage
    console.log(`\n🔍 ========== ANSWER QUESTION ==========`);
    console.log(`📋 Player: ${player.name} (${playerId})`);
    console.log(`📋 Question ID: ${questionId}`);
    console.log(`📋 Raw answer from player: "${answer}"`);
    console.log(`📋 Raw correct answer: "${question.answer}"`);
    console.log(`📋 Normalized answer: "${normalizedAnswer}"`);
    console.log(`📋 Normalized correct: "${normalizedCorrect}"`);
    console.log(`📋 Is correct: ${isCorrect}`, isCorrect ? '✅' : '❌');
    console.log(`========================================\n`);

    // SOLUTION SIMPLE : Sauvegarder la réponse ET calculer le score IMMÉDIATEMENT
    await gameState.saveAnswer(playerId, questionId, answer);
    
    // Calculer et mettre à jour le score IMMÉDIATEMENT si la réponse est correcte
    if (isCorrect) {
      console.log(`✅ Correct answer! Updating score immediately...`);
      await updateScore(playerId, player.name, 1);
    } else {
      console.log(`❌ Incorrect answer. Score remains unchanged.`);
      // S'assurer que le score existe (initialiser à 0 si nécessaire)
      await initializePlayerScore(playerId, player.name);
    }

    res.json({
      correct: isCorrect,
      correctAnswer: question.answer,
      playerName: player.name,
      answered: true,
      message: isCorrect 
        ? "Bonne réponse ! Votre score a été mis à jour."
        : "Réponse incorrecte. Les résultats seront affichés à la fin."
    });

  } catch (err) {
    console.error("Error in answerQuestion:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getScore = async (req, res) => {
  try {
    const { playerId } = req.params;
    console.log(`📊 Getting score for player: ${playerId}`);
    
    // Essayer de récupérer depuis le cache
    const cached = await cache.get(CACHE_KEYS.SCORE(playerId));
    if (cached) {
      console.log(`✅ Score served from cache: ${cached.playerName} = ${cached.score}`);
      return res.json(cached);
    }
    
    const score = await Score.findOne({ playerId });
    
    if (score) {
      const scoreObj = score.toObject();
      console.log(`✅ Score found: ${scoreObj.playerName} = ${scoreObj.score}`);
      
      // Mettre en cache
      await cache.set(CACHE_KEYS.SCORE(playerId), scoreObj, cache.TTL.SCORE);
      
      res.json(scoreObj);
    } else {
      console.log(`ℹ️ No score found for player ${playerId}, returning default (0)`);
      const defaultScore = { 
        playerId: playerId, 
        playerName: null, 
        score: 0 
      };
      
      // Mettre en cache même le score par défaut
      await cache.set(CACHE_KEYS.SCORE(playerId), defaultScore, cache.TTL.SCORE);
      
      res.json(defaultScore);
    }
  } catch (error) {
    console.error("❌ Error getting score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.leaderboard = async (req, res) => {
  try {
    console.log(`\n📊 ========== LEADERBOARD REQUEST ==========`);
    
    // Essayer de récupérer depuis le cache
    const cached = await cache.get(CACHE_KEYS.LEADERBOARD);
    if (cached) {
      console.log('✅ Leaderboard served from cache');
      console.log(`========================================\n`);
      return res.json(cached);
    }
    
    const scores = await Score.find({}).lean();
    
    console.log(`📊 Leaderboard query: found ${scores ? scores.length : 0} scores in database`);
    
    // Si aucun score n'existe, essayer d'inclure les joueurs connectés avec score 0
    if (!scores || scores.length === 0) {
      console.log("ℹ️ No scores found in database - checking connected players...");
      try {
        const state = await gameState.getState();
        if (state.connectedPlayers && state.connectedPlayers.length > 0) {
          // Récupérer les noms des joueurs connectés
          const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
          const mappedScores = state.connectedPlayers.map(playerId => {
            const player = playersRes.data.find(p => p.id === playerId);
            return {
              playerId: playerId,
              playerName: player ? player.name : 'Joueur anonyme',
              score: 0
            };
          });
          console.log(`✅ Leaderboard: returning ${mappedScores.length} connected players with score 0`);
          console.log(`========================================\n`);
          
          // Mettre en cache
          await cache.set(CACHE_KEYS.LEADERBOARD, mappedScores, cache.TTL.LEADERBOARD);
          
          return res.json(mappedScores);
        }
      } catch (err) {
        console.error("❌ Error fetching connected players for leaderboard:", err);
      }
      console.log("ℹ️ No scores and no connected players - returning empty array");
      console.log(`========================================\n`);
      return res.json([]);
    }
    
    // Trier par score décroissant
    const sortedScores = scores.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Mapper les scores pour s'assurer que les champs sont corrects
    const mappedScores = sortedScores.map(score => {
      const mapped = {
        playerId: score.playerId || score._id?.toString() || 'unknown',
        playerName: score.playerName || score.name || 'Joueur anonyme',
        score: score.score || 0
      };
      console.log(`   📋 Score entry: ${mapped.playerName} (${mapped.playerId}) = ${mapped.score}`);
      return mapped;
    });
    
    console.log(`✅ Leaderboard: returning ${mappedScores.length} scores`);
    console.log(`   Top 3: ${mappedScores.slice(0, 3).map(s => `${s.playerName}: ${s.score}`).join(', ')}`);
    console.log(`========================================\n`);
    
    // Mettre en cache
    await cache.set(CACHE_KEYS.LEADERBOARD, mappedScores, cache.TTL.LEADERBOARD);
    
    res.json(mappedScores);
  } catch (error) {
    console.error("❌ Error getting leaderboard:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

exports.getGameState = async (req, res) => {
  try {
    const state = await gameState.getState();
    const connectedCount = await gameState.getConnectedPlayersCount();
    res.json({
      isStarted: state.isStarted,
      currentQuestionIndex: state.currentQuestionIndex,
      currentQuestionId: state.currentQuestionId,
      questionStartTime: state.questionStartTime,
      questionDuration: state.questionDuration,
      connectedPlayersCount: connectedCount,
      scheduledStartTime: state.scheduledStartTime || null,
      gameSessionId: state.gameSessionId,
      gameCode: state.gameCode
    });
  } catch (error) {
    console.error("Error getting game state:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getGameCode = async (req, res) => {
  try {
    const state = await gameState.getState();
    // Générer un nouveau code si aucun n'existe
    const code = state.gameCode || await gameState.generateNewGameCode();
    res.json({ gameCode: code });
  } catch (error) {
    console.error("Error getting game code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.verifyGameCode = async (req, res) => {
  try {
    // Accepter soit 'code' soit 'gameCode' pour compatibilité
    const code = req.body.code || req.body.gameCode;
    
    if (!code) {
      return res.status(400).json({ error: "Code requis" });
    }

    const state = await gameState.getState();
    const GameSession = require("../models/GameSession");
    
    console.log(`🔍 Vérification du code: "${code}"`);
    console.log(`🔍 Code du jeu actuel: "${state.gameCode}"`);
    
    // Vérifier d'abord dans GameState (ancien système)
    const isValidState = state.gameCode && state.gameCode.toUpperCase() === code.toUpperCase().trim();
    
    // Vérifier aussi dans GameSession (nouveau système de parties)
    const party = await GameSession.findOne({ gameCode: code.toUpperCase().trim() });
    const isValidParty = !!party;
    
    const isValid = isValidState || isValidParty;
    
    console.log(`🔍 Code valide: ${isValid} (state: ${isValidState}, party: ${isValidParty})`);
    
    // Si c'est une partie, retourner les informations de la partie
    if (isValidParty && party) {
      // Vérifier si le jeu est vraiment démarré
      // Pour une partie, on vérifie uniquement si la partie elle-même est active et démarrée
      // On ne prend pas en compte le GameState global car il peut être d'une autre partie
      const isGameStarted = party.status === 'active' && party.isStarted;
      
      res.json({ 
        valid: true,
        gameCode: party.gameCode,
        isStarted: isGameStarted,
        isParty: true,
        party: {
          name: party.name,
          description: party.description,
          imageUrl: party.imageUrl,
          audioUrl: party.audioUrl,
          scheduledStartTime: party.scheduledStartTime,
          status: party.status
        },
        message: isGameStarted
          ? "Le jeu a déjà commencé. Vous pouvez vous connecter si vous étiez déjà enregistré."
          : party.status === 'scheduled' && party.scheduledStartTime
            ? `Code valide. La partie commencera le ${new Date(party.scheduledStartTime).toLocaleString('fr-FR')}.`
            : "Code valide. Vous pouvez continuer."
      });
    } else {
      // Ancien système (GameState)
      res.json({ 
        valid: isValid,
        gameCode: state.gameCode,
        isStarted: state.isStarted || false,
        isParty: false,
        message: isValid 
          ? (state.isStarted 
              ? "Le jeu a déjà commencé. Vous pouvez vous connecter si vous étiez déjà enregistré."
              : "Code valide. Vous pouvez continuer.")
          : "Code invalide"
      });
    }
  } catch (error) {
    console.error("Error verifying game code:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getConnectedPlayersCount = async (req, res) => {
  try {
    const count = await gameState.getConnectedPlayersCount();
    res.json({ count });
  } catch (error) {
    console.error("Error getting connected players count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getConnectedPlayers = async (req, res) => {
  try {
    console.log(`\n🔴 [game.controller] ========== GET CONNECTED PLAYERS ==========`);
    
    const playerIds = await gameState.getConnectedPlayers();
    console.log(`🔴 [game.controller] Found ${playerIds.length} player IDs in gameState:`, playerIds);
    
    // Récupérer les noms des joueurs depuis auth-service
    const axios = require('axios');
    const services = require('../config/services');
    
    const players = [];
    const playersMap = new Map(); // Map pour stocker les joueurs trouvés
    
    // Récupérer tous les joueurs depuis auth-service
    try {
      const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
      console.log(`📋 Fetched ${playersRes.data.length} players from auth-service`);
      
      // Créer une map des joueurs depuis auth-service
      for (const player of playersRes.data) {
        if (player && player.id) {
          playersMap.set(player.id, {
            id: player.id,
            name: player.name && player.name.trim() !== '' ? player.name.trim() : null
          });
        }
      }
    } catch (err) {
      console.error("❌ Error fetching players from auth-service:", err);
    }
    
    // Pour chaque joueur connecté, essayer de trouver son nom
    for (const playerId of playerIds) {
      let playerName = null;
      
      // 1. Essayer depuis auth-service
      const authPlayer = playersMap.get(playerId);
      if (authPlayer && authPlayer.name) {
        playerName = authPlayer.name;
        console.log(`🔴 [game.controller] ✅ Found player name in auth-service: ${playerName} (${playerId})`);
      } else {
        // 2. Essayer depuis les scores (fallback)
        try {
          const score = await Score.findOne({ playerId });
          if (score && score.playerName && score.playerName.trim() !== '') {
            playerName = score.playerName.trim();
            console.log(`🔴 [game.controller] ✅ Found player name in scores (fallback): ${playerName} (${playerId})`);
          }
        } catch (scoreErr) {
          console.warn(`🔴 [game.controller] ⚠️ Error fetching score for ${playerId}:`, scoreErr.message);
        }
      }
      
      // Ajouter le joueur même s'il n'a pas de nom (on utilisera un nom par défaut)
      // Cela garantit que tous les joueurs connectés apparaissent dans le dashboard
      players.push({
        id: playerId,
        name: playerName || `Joueur ${playerId.substring(0, 6)}` // Nom par défaut si pas de nom trouvé
      });
    }
    
    console.log(`🔴 [game.controller] ✅ Returning ${players.length} connected players:`, players.map(p => `${p.name} (${p.id})`).join(', '));
    console.log(`🔴 [game.controller] Full response:`, JSON.stringify({ players, count: players.length }, null, 2));
    console.log(`🔴 [game.controller] ========================================\n`);
    res.json({ players, count: players.length });
  } catch (error) {
    console.error("❌ Error getting connected players:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Variable globale pour stocker le timer
let questionTimer = null;

// Fonction helper pour passer à la question suivante automatiquement
async function scheduleNextQuestion(io, defaultDuration = 30000) {
  console.log(`\n⏰ ========== SCHEDULING NEXT QUESTION ==========`);
  
  if (questionTimer) {
    console.log(`⏰ Clearing existing timer`);
    clearTimeout(questionTimer);
  }

  const state = await gameState.getState();
  console.log(`⏰ Current state:`, {
    isStarted: state.isStarted,
    currentQuestionId: state.currentQuestionId,
    questionDuration: state.questionDuration,
    defaultDuration: defaultDuration
  });
  
  if (!state.isStarted || !state.currentQuestionId) {
    console.log(`⏰ ❌ Cannot schedule: game not started or no current question`);
    return;
  }

  const duration = state.questionDuration || defaultDuration;
  console.log(`⏰ Scheduling timer for ${duration}ms (${duration / 1000} seconds)`);
  console.log(`⏰ Timer will expire at: ${new Date(Date.now() + duration).toISOString()}`);

  questionTimer = setTimeout(async () => {
    try {
      console.log(`\n⏰ ========== TIMER EXPIRED ==========`);
      console.log(`⏰ Timer expired at: ${new Date().toISOString()}`);
      
      // Récupérer l'état FRAIS depuis MongoDB (important !)
      const freshState = await gameState.getState();
      console.log(`⏰ Fresh state retrieved:`, {
        isStarted: freshState.isStarted,
        currentQuestionId: freshState.currentQuestionId,
        currentQuestionIndex: freshState.currentQuestionIndex,
        answersCount: Object.keys(freshState.answers || {}).length
      });
      
      if (!freshState.isStarted || !freshState.currentQuestionId) {
        console.log(`⏰ Game not started or no current question, aborting timer`);
        return;
      }
      
      // Récupérer les questionIds depuis le gameState (si disponibles)
      const stateQuestionIds = freshState.questionIds;
      
      // Utiliser /quiz/all qui est public pour récupérer les questions
      let quiz;
      try {
        quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/all`);
      } catch (err) {
        console.error("⏰ Error fetching questions from /quiz/all:", err.message);
          // Continuer sans questions - on ne peut pas passer à la question suivante
          return;
        }
      
      let questions = quiz.data || [];
      
      // Si questionIds sont stockés dans le gameState, filtrer les questions
      if (stateQuestionIds && Array.isArray(stateQuestionIds) && stateQuestionIds.length > 0) {
        questions = questions.filter(q => stateQuestionIds.includes(q.id));
        console.log(`⏰ Filtered to ${questions.length} questions from ${stateQuestionIds.length} questionIds`);
      } else {
        console.log(`⏰ Using all ${questions.length} questions (no questionIds in gameState)`);
      }

      // NOTE: Les scores sont maintenant calculés immédiatement dans answerQuestion
      // On n'a plus besoin de recalculer ici, mais on peut émettre les scores mis à jour
      const updatedScores = await Score.find({}).lean();
      const sortedScores = updatedScores.sort((a, b) => (b.score || 0) - (a.score || 0));
      const mappedScores = sortedScores.map(score => ({
        playerId: score.playerId || score._id?.toString() || 'unknown',
        playerName: score.playerName || score.name || 'Joueur anonyme',
        score: score.score || 0
      }));
      
      if (io) {
        io.emit('leaderboard:update', mappedScores);
        console.log(`📢 Emitted leaderboard update with ${mappedScores.length} players`);
      }

      // Récupérer l'état FRAIS après le calcul des résultats
      const stateAfterCalc = await gameState.getState();
      
      // Passer à la question suivante
      const nextIndex = stateAfterCalc.currentQuestionIndex + 1;
      
      if (nextIndex >= questions.length) {
        // Fin du jeu
        console.log(`⏰ Last question reached, ending game`);
        await gameState.endGame();
        io.emit("game:ended", { message: "Le jeu est terminé" });
        return;
      }

      const nextQuestion = questions[nextIndex];
      console.log(`⏰ Moving to next question: ${nextQuestion.id} (index ${nextIndex})`);
      await gameState.nextQuestion();
      await gameState.setCurrentQuestion(nextQuestion.id, duration);

      const newState = await gameState.getState();

      // Émettre la nouvelle question
      io.emit("question:next", {
        question: {
          id: nextQuestion.id,
          question: nextQuestion.question,
          choices: nextQuestion.choices
        },
        questionIndex: newState.currentQuestionIndex,
        totalQuestions: questions.length,
        startTime: newState.questionStartTime,
        duration: newState.questionDuration
      });

      // Programmer le timer pour la question suivante
      scheduleNextQuestion(io);
    } catch (err) {
      console.error("Error in scheduleNextQuestion:", err);
    }
  }, state.questionDuration);
}

// Exporter scheduleNextQuestion pour utilisation dans server.js
exports.scheduleNextQuestion = scheduleNextQuestion;

exports.startGame = async (req, res) => {
  try {
    console.log(`\n🚀 ========== START GAME REQUEST ==========`);
    console.log(`🚀 Method: ${req.method}`);
    console.log(`🚀 Path: ${req.path}`);
    console.log(`🚀 All headers:`, JSON.stringify(req.headers, null, 2));
    console.log(`🚀 Authorization header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
    console.log(`🚀 authorization header (lowercase): ${req.headers.authorization ? 'Present' : 'Missing'}`);
    
    // Récupérer le header Authorization (peut être en minuscules ou majuscules)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (authHeader) {
      console.log(`🚀 Token preview: ${authHeader.substring(0, 50)}...`);
      console.log(`🚀 Token length: ${authHeader.length}`);
    } else {
      console.error("❌ No authorization header found in request");
      console.error("❌ Available headers:", Object.keys(req.headers));
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "No authentication token provided"
      });
    }
    
    // Récupérer le temps par question (en secondes) depuis le body, défaut 30 secondes
    const questionDurationSeconds = req.body.questionDuration || 30;
    const questionDurationMs = questionDurationSeconds * 1000; // Convertir en millisecondes
    
    // Récupérer la date/heure planifiée (optionnelle)
    const scheduledStartTime = req.body.scheduledStartTime ? new Date(req.body.scheduledStartTime) : null;
    
    // Si une date est fournie, vérifier qu'elle est dans le futur
    if (scheduledStartTime && scheduledStartTime <= new Date()) {
      return res.status(400).json({ 
        error: "La date de lancement planifiée doit être dans le futur" 
      });
    }

    // Récupérer les questions (nécessite l'authentification admin)
    // Transmettre le token d'authentification depuis la requête originale
    let questions = [];
    try {
      console.log(`📋 Fetching questions from ${services.QUIZ_SERVICE_URL}/quiz/full`);
      console.log(`📋 Auth header present: ${!!authHeader}`);
      console.log(`📋 Auth header value: ${authHeader.substring(0, 50)}...`);
      
      // S'assurer que le header est au format "Bearer <token>"
      const authHeaderFormatted = authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader.replace(/^Bearer\s+/i, '')}`;
      
      console.log(`📋 Formatted auth header: ${authHeaderFormatted.substring(0, 50)}...`);
      
      const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`, {
        headers: { 
          'Authorization': authHeaderFormatted,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 secondes de timeout
      });
      questions = quiz.data || [];
      console.log(`✅ Fetched ${questions.length} questions`);
    } catch (quizError) {
      console.error("❌ Error fetching questions:", quizError.message);
      console.error("❌ Error response:", quizError.response?.data);
      console.error("❌ Error status:", quizError.response?.status);
      console.error("❌ Error headers:", quizError.response?.headers);
      console.error("❌ Request config:", {
        url: quizError.config?.url,
        headers: quizError.config?.headers
      });
      
      // Si c'est une erreur 401, le token n'est pas valide
      if (quizError.response?.status === 401) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "Invalid or missing authentication token for quiz service",
          details: process.env.NODE_ENV === 'development' ? quizError.response?.data : undefined
        });
      }
      
      // Si c'est une erreur 403, l'utilisateur n'est pas admin
      if (quizError.response?.status === 403) {
        return res.status(403).json({ 
          error: "Forbidden",
          message: "Admin access required to fetch questions"
        });
      }
      
      // Autre erreur
      return res.status(500).json({ 
        error: "Failed to fetch questions",
        message: quizError.message || "Quiz service unavailable"
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({ error: "Aucune question disponible" });
    }

    // Si une date est planifiée, sauvegarder la date et retourner sans lancer le jeu
    if (scheduledStartTime) {
      await gameState.scheduleGame(scheduledStartTime, questionDurationMs);
      return res.json({
        message: "Jeu planifié avec succès",
        scheduledStartTime: scheduledStartTime.toISOString(),
        state: await gameState.getState()
      });
    }

    // Sinon, lancer le jeu immédiatement
    await gameState.startGame();
    const state = await gameState.getState();
    
    // Initialiser les scores pour tous les joueurs connectés
    console.log(`🎮 Initializing scores for ${state.connectedPlayers.length} connected players...`);
    try {
      const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
      for (const playerId of state.connectedPlayers) {
        const player = playersRes.data.find(p => p.id === playerId);
        if (player) {
          await initializePlayerScore(playerId, player.name);
        } else {
          console.warn(`⚠️ Player ${playerId} not found in auth service, initializing with default name`);
          await initializePlayerScore(playerId, 'Joueur anonyme');
        }
      }
      console.log(`✅ Scores initialized for all connected players`);
    } catch (err) {
      console.error("❌ Error initializing scores:", err);
      // Continue même si l'initialisation échoue
    }

    // Démarrer avec la première question
    if (questions.length > 0 && req.io) {
      const firstQuestion = questions[0];
      await gameState.setCurrentQuestion(firstQuestion.id, questionDurationMs);
      const newState = await gameState.getState();

      // Compter les clients connectés avant d'émettre
      const connectedClients = req.io.sockets.sockets.size;
      const connectedPlayersCount = await gameState.getConnectedPlayersCount();
      console.log(`\n🚀 ========== STARTING GAME ==========`);
      console.log(`🚀 Connected WebSocket clients: ${connectedClients}`);
      console.log(`🚀 Connected players in gameState: ${connectedPlayersCount}`);
      console.log(`🚀 Player IDs:`, newState.connectedPlayers || []);

      // Émettre l'événement de début de jeu avec la première question
      console.log(`📢 Emitting 'game:started' event: questionIndex=${newState.currentQuestionIndex}, totalQuestions=${questions.length}, clients=${connectedClients}`);
      req.io.emit("game:started", {
        questionIndex: newState.currentQuestionIndex,
        totalQuestions: questions.length,
        gameCode: newState.gameCode
      });
      console.log("✅ 'game:started' event emitted successfully to all clients");

      console.log(`📢 Emitting 'question:next' event: questionId=${firstQuestion.id}, clients=${connectedClients}`);
      req.io.emit("question:next", {
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
      console.log("✅ 'question:next' event emitted successfully to all clients");

      // Programmer le timer pour passer automatiquement à la question suivante
      console.log(`⏰ Scheduling timer for first question (${questionDurationMs}ms)...`);
      scheduleNextQuestion(req.io, questionDurationMs);
      console.log(`✅ Timer scheduled successfully`);
      
      console.log(`✅ Game started - all events emitted to ${connectedClients} clients`);
      console.log(`========================================\n`);
    } else {
      console.error("❌ Cannot start game: no questions or no io instance");
      if (!questions.length) {
        console.error("❌ No questions available");
      }
      if (!req.io) {
        console.error("❌ No io instance in request");
      }
    }

    res.json({
      message: "Jeu démarré",
      state: await gameState.getState()
    });
  } catch (err) {
    console.error("❌ Error starting game:", err);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    
    // Si c'est une erreur axios, afficher plus de détails
    if (err.response) {
      console.error("❌ Error response status:", err.response.status);
      console.error("❌ Error response data:", err.response.data);
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      details: process.env.NODE_ENV === 'development' && err.response?.data ? err.response.data : undefined
    });
  }
};

exports.nextQuestion = async (req, res) => {
  try {
    const state = await gameState.getState();
    
    if (!state.isStarted) {
      return res.status(400).json({ error: "Le jeu n'a pas commencé" });
    }

    // Annuler le timer actuel
    if (questionTimer) {
      clearTimeout(questionTimer);
      questionTimer = null;
    }

    // Récupérer les questionIds depuis le gameState (si disponibles)
    const stateQuestionIds = state.questionIds;

    // Récupérer les questions (nécessite l'authentification admin)
    // Transmettre le token d'authentification depuis la requête originale
    let questions = [];
    try {
      // Récupérer le header Authorization (peut être en minuscules ou majuscules)
      const authHeader = req.headers.authorization || req.headers.Authorization;
      
      console.log(`📋 Fetching questions from ${services.QUIZ_SERVICE_URL}/quiz/full`);
      console.log(`📋 Auth header present: ${!!authHeader}`);
      console.log(`📋 QuestionIds in gameState: ${stateQuestionIds ? stateQuestionIds.length + ' questions' : 'none (using all)'}`);
      
      if (!authHeader) {
        console.error("❌ No authorization header in request");
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "No authentication token provided"
        });
      }
      
      // S'assurer que le header est au format "Bearer <token>"
      const authHeaderFormatted = authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader.replace(/^Bearer\s+/i, '')}`;
      
      console.log(`📋 Formatted auth header: ${authHeaderFormatted.substring(0, 50)}...`);
      
      const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`, {
        headers: { 
          'Authorization': authHeaderFormatted,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 secondes de timeout
      });
      const allQuestions = quiz.data || [];
      
      // Si questionIds sont stockés dans le gameState, filtrer les questions
      if (stateQuestionIds && Array.isArray(stateQuestionIds) && stateQuestionIds.length > 0) {
        questions = allQuestions.filter(q => stateQuestionIds.includes(q.id));
        console.log(`✅ Filtered to ${questions.length} questions from ${stateQuestionIds.length} questionIds`);
      } else {
        questions = allQuestions;
        console.log(`✅ Using all ${questions.length} questions (no questionIds in gameState)`);
      }
    } catch (quizError) {
      console.error("❌ Error fetching questions:", quizError.message);
      console.error("❌ Error response:", quizError.response?.data);
      console.error("❌ Error status:", quizError.response?.status);
      console.error("❌ Request config:", {
        url: quizError.config?.url,
        headers: quizError.config?.headers
      });
      
      // Si c'est une erreur 401, le token n'est pas valide
      if (quizError.response?.status === 401) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "Invalid or missing authentication token for quiz service",
          details: process.env.NODE_ENV === 'development' ? quizError.response?.data : undefined
        });
      }
      
      // Si c'est une erreur 403, l'utilisateur n'est pas admin
      if (quizError.response?.status === 403) {
        return res.status(403).json({ 
          error: "Forbidden",
          message: "Admin access required to fetch questions"
        });
      }
      
      // Autre erreur
      return res.status(500).json({ 
        error: "Failed to fetch questions",
        message: quizError.message || "Quiz service unavailable"
      });
    }

    // NOTE: Les scores sont maintenant calculés immédiatement dans answerQuestion
    // On n'a plus besoin de recalculer ici, mais on peut émettre les scores mis à jour
    const updatedScores = await Score.find({}).lean();
    const sortedScores = updatedScores.sort((a, b) => (b.score || 0) - (a.score || 0));
    const mappedScores = sortedScores.map(score => ({
      playerId: score.playerId || score._id?.toString() || 'unknown',
      playerName: score.playerName || score.name || 'Joueur anonyme',
      score: score.score || 0
    }));
    
    if (req.io) {
      req.io.emit('leaderboard:update', mappedScores);
      console.log(`📢 Emitted leaderboard update with ${mappedScores.length} players`);
    }

    // Passer à la question suivante
    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      // Fin du jeu
      await gameState.endGame();
      
      if (req.io) {
        req.io.emit("game:ended", {
          message: "Le jeu est terminé"
        });
        // Émettre le leaderboard final
        const finalScores = await Score.find({}).lean();
        const sortedFinalScores = finalScores.sort((a, b) => (b.score || 0) - (a.score || 0));
        const mappedFinalScores = sortedFinalScores.map(score => ({
          playerId: score.playerId || score._id?.toString() || 'unknown',
          playerName: score.playerName || score.name || 'Joueur anonyme',
          score: score.score || 0
        }));
        req.io.emit('leaderboard:update', mappedFinalScores);
        console.log(`📢 Emitted final leaderboard update with ${mappedFinalScores.length} players`);
      }

      return res.json({
        message: "Jeu terminé",
        finished: true
      });
    }

    const nextQuestion = questions[nextIndex];
    await gameState.nextQuestion();
    // Utiliser la durée de la question précédente ou 30 secondes par défaut
    const currentState = await gameState.getState();
    const duration = currentState.questionDuration || 30000; 
    await gameState.setCurrentQuestion(nextQuestion.id, duration);

    const newState = await gameState.getState();

    // Émettre la nouvelle question à tous les clients
    if (req.io) {
      req.io.emit("question:next", {
        question: {
          id: nextQuestion.id,
          question: nextQuestion.question,
          choices: nextQuestion.choices
        },
        questionIndex: newState.currentQuestionIndex,
        totalQuestions: questions.length,
        startTime: newState.questionStartTime,
        duration: newState.questionDuration
      });

      // Programmer le timer pour passer automatiquement à la question suivante
      scheduleNextQuestion(req.io, duration);
    }

    res.json({
      question: {
        id: nextQuestion.id,
        question: nextQuestion.question,
        choices: nextQuestion.choices
      },
      questionIndex: newState.currentQuestionIndex,
      totalQuestions: questions.length,
      startTime: newState.questionStartTime,
      duration: newState.questionDuration
    });
  } catch (err) {
    console.error("Error getting next question:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.endGame = async (req, res) => {
  try {
    const state = await gameState.getState();
    
    // NOTE: Les scores sont maintenant calculés immédiatement dans answerQuestion
    // On n'a plus besoin de recalculer ici

    // Récupérer les IDs des joueurs avant de terminer le jeu
    const playerIds = state.connectedPlayers || [];

    await gameState.endGame();

    // Récupérer les scores finaux et les émettre
    const finalScores = await Score.find({}).lean();
    const sortedScores = finalScores.sort((a, b) => (b.score || 0) - (a.score || 0));
    const mappedScores = sortedScores.map(score => ({
      playerId: score.playerId || score._id?.toString() || 'unknown',
      playerName: score.playerName || score.name || 'Joueur anonyme',
      score: score.score || 0
    }));

    if (req.io) {
      req.io.emit("game:ended", {
        message: "Le jeu est terminé",
        leaderboard: mappedScores
      });
      req.io.emit('leaderboard:update', mappedScores);
      // Émettre players:count avec 0 pour mettre à jour les dashboards
      req.io.emit("players:count", { count: 0 });
      console.log(`📢 Emitted final leaderboard update with ${mappedScores.length} players`);
    }

    // Supprimer les joueurs de la base de données auth-service
    if (playerIds.length > 0) {
      try {
        const axios = require('axios');
        const services = require('../config/services');
        for (const playerId of playerIds) {
          try {
            await axios.delete(`${services.AUTH_SERVICE_URL}/auth/players/${playerId}`);
            console.log(`🗑️ Deleted player ${playerId} from auth-service`);
          } catch (deleteErr) {
            console.warn(`⚠️ Could not delete player ${playerId} from auth-service:`, deleteErr.message);
          }
        }
      } catch (err) {
        console.error("❌ Error deleting players from auth-service:", err);
        // Continue even if deletion fails
      }
    }

    res.json({ message: "Jeu terminé" });
  } catch (err) {
    console.error("Error ending game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    // Récupérer les IDs des joueurs avant de supprimer le jeu
    const state = await gameState.getState();
    const playerIds = state.connectedPlayers || [];

    // Réinitialiser les scores pour cette session
    await Score.deleteMany({});
    
    // Réinitialiser l'état du jeu (cela vide aussi connectedPlayers)
    await gameState.resetGame();

    // Supprimer les joueurs de la base de données auth-service
    if (playerIds.length > 0) {
      try {
        const axios = require('axios');
        const services = require('../config/services');
        for (const playerId of playerIds) {
          try {
            await axios.delete(`${services.AUTH_SERVICE_URL}/auth/players/${playerId}`);
            console.log(`🗑️ Deleted player ${playerId} from auth-service`);
          } catch (deleteErr) {
            console.warn(`⚠️ Could not delete player ${playerId} from auth-service:`, deleteErr.message);
          }
        }
      } catch (err) {
        console.error("❌ Error deleting players from auth-service:", err);
        // Continue even if deletion fails
      }
    }

    if (req.io) {
      req.io.emit("game:deleted", {
        message: "Partie supprimée"
      });
      // Émettre players:count avec 0 pour mettre à jour les dashboards
      req.io.emit("players:count", { count: 0 });
    }

    res.json({ message: "Partie supprimée avec succès" });
  } catch (err) {
    console.error("Error deleting game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getQuestionResults = async (req, res) => {
  try {
    const state = await gameState.getState();
    res.json(state.results || {});
  } catch (error) {
    console.error("Error getting question results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Game Sessions (Parties) Controllers
const GameSession = require("../models/GameSession");

// Helper function to generate unique party ID
function generatePartyId() {
  return `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to generate game code
function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get current user ID from token
function getCurrentUserId(req) {
  // The authenticateAdmin middleware should set req.user
  return req.user?.userId || null;
}

exports.createParty = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { name, description, questionIds, scheduledStartTime, questionDuration, imageUrl, audioUrl } = req.body;

    if (!name || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ error: "Name and at least one question are required" });
    }

    // Validate scheduled time if provided
    if (scheduledStartTime) {
      const scheduledDate = new Date(scheduledStartTime);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: "Scheduled time must be in the future" });
      }
    }

    const party = new GameSession({
      id: generatePartyId(),
      name,
      description: description || '',
      createdBy: userId,
      questionIds,
      questionDuration: questionDuration || 30000,
      scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime) : null,
      status: scheduledStartTime ? 'scheduled' : 'draft',
      gameCode: generateGameCode(),
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null
    });

    await party.save();

    res.status(201).json(party.toObject());
  } catch (error) {
    console.error("Error creating party:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserParties = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const parties = await GameSession.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(parties);
  } catch (error) {
    console.error("Error getting user parties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getParty = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { partyId } = req.params;
    const party = await GameSession.findOne({ id: partyId, createdBy: userId });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    res.json(party.toObject());
  } catch (error) {
    console.error("Error getting party:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateParty = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { partyId } = req.params;
    const { name, description, questionIds, scheduledStartTime, questionDuration, imageUrl, audioUrl, status } = req.body;

    const party = await GameSession.findOne({ id: partyId, createdBy: userId });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    // Store original status before any updates
    const originalStatus = party.status;

    // Allow status update (for deactivation/reactivation)
    if (status !== undefined) {
      if (status === 'cancelled' && (party.status === 'active' || party.status === 'scheduled')) {
        party.status = 'cancelled';
        party.isStarted = false; // Also stop the game if it was started
        party.updatedAt = new Date();
        await party.save();
        console.log(`✅ Party ${partyId} deactivated (status changed to cancelled)`);
        // Re-fetch to ensure we have the latest data
        const updatedParty = await GameSession.findOne({ id: partyId }).lean();
        console.log(`✅ Updated party status: ${updatedParty?.status}`);
        return res.json(updatedParty);
      } else if (status === 'draft' && party.status === 'cancelled') {
        party.status = 'draft';
        party.updatedAt = new Date();
        await party.save();
        console.log(`✅ Party ${partyId} reactivated (status changed to draft)`);
        // Re-fetch to ensure we have the latest data
        const updatedParty = await GameSession.findOne({ id: partyId }).lean();
        console.log(`✅ Updated party status: ${updatedParty?.status}`);
        return res.json(updatedParty);
      }
    }

    // Don't allow updating certain fields if party is active
    // But allow updating description, imageUrl, audioUrl even if active
    // Skip this check if we're only updating status (already handled above)
    if (originalStatus === 'active' && (status === undefined || status === originalStatus)) {
      // Only allow updating non-critical fields when party is active
      const allowedFieldsForActive = ['description', 'imageUrl', 'audioUrl'];
      const requestedFields = Object.keys(req.body).filter(key => {
        // Only check fields that are actually being updated (not undefined)
        return req.body[key] !== undefined;
      });
      const hasRestrictedFields = requestedFields.some(field => !allowedFieldsForActive.includes(field));
      
      if (hasRestrictedFields) {
        console.log(`❌ Attempted to update restricted fields for active party: ${requestedFields.join(', ')}`);
        return res.status(400).json({ 
          error: "Cannot update name, questions, duration, or schedule for an active party. Only description, image, and audio can be updated." 
        });
      }
    }

    // Update fields
    if (name) party.name = name;
    if (description !== undefined) party.description = description;
    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      party.questionIds = questionIds;
    }
    if (questionDuration) party.questionDuration = questionDuration;
    if (imageUrl !== undefined) party.imageUrl = imageUrl;
    if (audioUrl !== undefined) party.audioUrl = audioUrl;
    if (scheduledStartTime !== undefined) {
      if (scheduledStartTime === null) {
        // Supprimer la date programmée
        party.scheduledStartTime = null;
        if (party.status === 'scheduled') {
          party.status = 'draft';
        }
      } else {
        // Nouvelle date programmée - doit être dans le futur
      const scheduledDate = new Date(scheduledStartTime);
        if (isNaN(scheduledDate.getTime())) {
          return res.status(400).json({ error: "Invalid scheduled time format" });
        }
        // Vérifier seulement si c'est une nouvelle date (différente de l'actuelle)
        const currentScheduledTime = party.scheduledStartTime ? new Date(party.scheduledStartTime).getTime() : null;
        const newScheduledTime = scheduledDate.getTime();
        if (currentScheduledTime !== newScheduledTime && scheduledDate <= new Date()) {
        return res.status(400).json({ error: "Scheduled time must be in the future" });
      }
      party.scheduledStartTime = scheduledDate;
      party.status = 'scheduled';
      }
    }

    party.updatedAt = new Date();
    await party.save();

    res.json(party.toObject());
  } catch (error) {
    console.error("Error updating party:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteParty = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { partyId } = req.params;
    const party = await GameSession.findOne({ id: partyId, createdBy: userId });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    // Don't allow deleting if party is active
    if (party.status === 'active') {
      return res.status(400).json({ error: "Cannot delete an active party" });
    }

    await GameSession.deleteOne({ id: partyId, createdBy: userId });

    res.json({ message: "Party deleted successfully" });
  } catch (error) {
    console.error("Error deleting party:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.startParty = async (req, res) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { partyId } = req.params;
    const party = await GameSession.findOne({ id: partyId, createdBy: userId });

    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }

    if (party.status === 'active') {
      return res.status(400).json({ error: "Party is already active" });
    }

    if (party.questionIds.length === 0) {
      return res.status(400).json({ error: "Party has no questions" });
    }

    // Update party status
    party.status = 'active';
    party.isStarted = true;
    party.startedAt = new Date();
    await party.save();

    // Update GameState to use this party
    await gameState.setState({
      gameSessionId: party.id,
      gameCode: party.gameCode,
      createdBy: userId,
      questionDuration: party.questionDuration,
      scheduledStartTime: null, // Clear scheduled time when starting
      questionIds: party.questionIds // Store questionIds in gameState
    });

    // Launch the game with party's questions
    await launchGameWithQuestions(party.questionIds, party.questionDuration, party.gameCode, req.io);

    res.json({
      message: "Party started successfully",
      party: party.toObject(),
      gameCode: party.gameCode
    });
  } catch (error) {
    console.error("Error starting party:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to launch game with specific questions
async function launchGameWithQuestions(questionIds, questionDuration, gameCode, ioInstance) {
  try {
    const Score = require('./models/Score');
    
    // Helper function to initialize player score
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
        }
        return score.toObject();
      } catch (error) {
        console.error('Error initializing player score', error, { playerId });
        throw error;
      }
    }
    
    // Fetch questions from quiz-service using questionIds
    let questions = [];
    try {
      if (questionIds && questionIds.length > 0) {
        const questionsRes = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/all`);
        const allQuestions = questionsRes.data || [];
        questions = allQuestions.filter(q => questionIds.includes(q.id));
        console.log(`✅ Fetched ${questions.length} questions from ${questionIds.length} questionIds`);
      } else {
        console.warn('No questionIds provided');
        return;
      }
    } catch (err) {
      console.error('Error fetching questions for party', err);
      return;
    }
    
    if (questions.length === 0) {
      console.warn('No questions found for party', { questionIds });
      return;
    }
    
    // Reset scores
    await Score.deleteMany({});
    
    // Initialize scores for connected players
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
        console.log('Scores initialized for connected players', { count: currentState.connectedPlayers.length });
      } catch (err) {
        console.error('Error initializing scores', err);
      }
    }
    
    // Store questionIds in gameState
    await gameState.setState({ questionIds });
    
    // Start the game with the first question
    if (questions.length > 0 && ioInstance) {
      const firstQuestion = questions[0];
      await gameState.setCurrentQuestion(firstQuestion.id, questionDuration);
      
      ioInstance.emit("game:started", {
        questionIndex: 0,
        totalQuestions: questions.length,
        gameCode: gameCode
      });
      
      ioInstance.emit("question:next", {
        question: firstQuestion,
        questionIndex: 0,
        totalQuestions: questions.length,
        duration: questionDuration
      });
      
      // Schedule next question using exported function
      exports.scheduleNextQuestion(ioInstance, questionDuration);
    }
    
    console.log('Game launched successfully with party questions', {
      gameCode: gameCode,
      questionsCount: questions.length
    });
  } catch (error) {
    console.error('Error launching game with questions', error);
    throw error;
  }
}
