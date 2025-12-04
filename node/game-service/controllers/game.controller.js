const axios = require("axios");
const gameState = require("../gameState");
const services = require("../config/services");
const Score = require("../models/Score");

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

// Update player score + save playerName
async function updateScore(playerId, playerName, delta) {
  try {
    console.log(`\n💾 ========== UPDATE SCORE ==========`);
    console.log(`💾 Player: ${playerName} (${playerId})`);
    console.log(`💾 Delta: ${delta}`);
    
    let score = await Score.findOne({ playerId });
    console.log(`💾 Score before query: ${score ? score.score : 'not found'}`);

    if (!score) {
      console.log(`💾 Creating new score document`);
      score = new Score({
        playerId,
        playerName,
        score: 0
      });
    } else {
      console.log(`💾 Found existing score: ${score.score}`);
    }

    // Always keep name updated (in case player changed his name)
    score.playerName = playerName;
    const oldScore = score.score || 0;
    const newScore = oldScore + delta;
    score.score = newScore;
    
    console.log(`💾 Score calculation: ${oldScore} + ${delta} = ${newScore}`);

    await score.save();
    console.log(`💾 Score saved to MongoDB`);
    
    // Vérifier que le score a bien été sauvegardé
    const verifiedScore = await Score.findOne({ playerId });
    const verifiedScoreValue = verifiedScore ? verifiedScore.score : null;
    console.log(`💾 Verified score in DB: ${verifiedScoreValue}`);
    
    if (verifiedScoreValue !== newScore) {
      console.error(`❌ ERROR: Score mismatch! Expected ${newScore}, got ${verifiedScoreValue}`);
    } else {
      console.log(`✅ Score verified successfully in MongoDB`);
    }
    
    const scoreObj = score.toObject();
    console.log(`💾 Score updated: ${playerName} (${playerId}) = ${oldScore} + ${delta} = ${scoreObj.score}`);
    console.log(`========================================\n`);
    return scoreObj;
  } catch (error) {
    console.error("❌ Error updating score:", error);
    console.error("❌ Error stack:", error.stack);
    throw error;
  }
}

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

    // 🔍 Fetch quiz questions
    let question;
    try {
      const quizRes = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
      question = quizRes.data.find(q => q.id === questionId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
    } catch (err) {
      console.error("Error fetching question:", err);
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
    console.log(`📋 Raw answer from player: "${answer}" (type: ${typeof answer}, length: ${String(answer).length})`);
    console.log(`📋 Raw correct answer: "${question.answer}" (type: ${typeof question.answer}, length: ${String(question.answer).length})`);
    console.log(`📋 Normalized answer: "${normalizedAnswer}" (length: ${normalizedAnswer.length})`);
    console.log(`📋 Normalized correct: "${normalizedCorrect}" (length: ${normalizedCorrect.length})`);
    console.log(`📋 Is correct: ${isCorrect}`, isCorrect ? '✅' : '❌');
    console.log(`========================================\n`);

    // Sauvegarder la réponse normalisée pour éviter les problèmes de comparaison plus tard
    // On sauvegarde la réponse originale mais on normalise aussi pour la comparaison
    await gameState.saveAnswer(playerId, questionId, answer);

    res.json({
      correct: isCorrect,
      correctAnswer: question.answer,
      playerName: player.name,
      answered: true,
      message: "Réponse enregistrée. Les résultats seront affichés à la fin."
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
    
    const score = await Score.findOne({ playerId });
    
    if (score) {
      const scoreObj = score.toObject();
      console.log(`✅ Score found: ${scoreObj.playerName} = ${scoreObj.score}`);
      res.json(scoreObj);
    } else {
      console.log(`ℹ️ No score found for player ${playerId}, returning default (0)`);
      res.json({ 
        playerId: playerId, 
        playerName: null, 
        score: 0 
      });
    }
  } catch (error) {
    console.error("❌ Error getting score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.leaderboard = async (req, res) => {
  try {
    console.log(`\n📊 ========== LEADERBOARD REQUEST ==========`);
    
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
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code requis" });
    }

    const state = await gameState.getState();
    const isValid = state.gameCode && state.gameCode.toUpperCase() === code.toUpperCase();
    
    // Si le code est valide mais le jeu a commencé, permettre quand même la vérification
    // Le joueur pourra se connecter s'il était déjà enregistré
    res.json({ 
      valid: isValid,
      gameCode: state.gameCode,
      isStarted: state.isStarted,
      message: isValid 
        ? (state.isStarted 
            ? "Le jeu a déjà commencé. Vous pouvez vous connecter si vous étiez déjà enregistré."
            : "Code valide. Vous pouvez continuer.")
        : "Code invalide"
    });
  } catch (error) {
    console.error("Error verifying game code:", error);
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
    const playerIds = await gameState.getConnectedPlayers();
    
    console.log(`📋 Getting connected players: ${playerIds.length} player IDs`);
    
    // Récupérer les noms des joueurs depuis auth-service
    const axios = require('axios');
    const services = require('../config/services');
    
    const players = [];
    
    // Récupérer tous les joueurs en une seule fois
    try {
      const playersRes = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
      console.log(`📋 Fetched ${playersRes.data.length} players from auth-service`);
      
      for (const playerId of playerIds) {
        const player = playersRes.data.find(p => p.id === playerId);
        if (player) {
          players.push({
            id: playerId,
            name: player.name || 'Joueur anonyme'
          });
          console.log(`✅ Found player: ${player.name} (${playerId})`);
        } else {
          // Si le joueur n'existe pas dans auth-service, essayer de le récupérer depuis les scores
          try {
            const score = await Score.findOne({ playerId });
            if (score && score.playerName) {
              players.push({
                id: playerId,
                name: score.playerName
              });
              console.log(`✅ Found player in scores: ${score.playerName} (${playerId})`);
            } else {
              players.push({
                id: playerId,
                name: 'Joueur anonyme'
              });
              console.warn(`⚠️ Player ${playerId} not found in auth-service or scores`);
            }
          } catch (scoreErr) {
            players.push({
              id: playerId,
              name: 'Joueur anonyme'
            });
            console.warn(`⚠️ Player ${playerId} not found, using default name`);
          }
        }
      }
    } catch (err) {
      console.error("❌ Error fetching players from auth-service:", err);
      // En cas d'erreur, essayer de récupérer depuis les scores
      for (const playerId of playerIds) {
        try {
          const score = await Score.findOne({ playerId });
          if (score && score.playerName) {
            players.push({
              id: playerId,
              name: score.playerName
            });
          } else {
            players.push({
              id: playerId,
              name: 'Joueur anonyme'
            });
          }
        } catch (scoreErr) {
          players.push({
            id: playerId,
            name: 'Joueur anonyme'
          });
        }
      }
    }
    
    console.log(`✅ Returning ${players.length} connected players:`, players.map(p => p.name).join(', '));
    res.json({ players, count: players.length });
  } catch (error) {
    console.error("❌ Error getting connected players:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Variable globale pour stocker le timer
let questionTimer = null;

// Fonction helper pour passer à la question suivante automatiquement
async function scheduleNextQuestion(io, defaultDuration = 30000) {
  if (questionTimer) {
    clearTimeout(questionTimer);
  }

  const state = await gameState.getState();
  if (!state.isStarted || !state.currentQuestionId) {
    return;
  }

  const duration = state.questionDuration || defaultDuration;

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
      
      // Utiliser la logique de nextQuestion
      const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
      const questions = quiz.data;

      // Calculer les résultats de la question actuelle AVANT de passer à la suivante
      console.log(`⏰ Calculating results for question ${freshState.currentQuestionId}...`);
      await calculateQuestionResults(freshState.currentQuestionId, questions);
        
        // Émettre les scores mis à jour via WebSocket
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

exports.startGame = async (req, res) => {
  try {
    // Récupérer le temps par question (en secondes) depuis le body, défaut 30 secondes
    const questionDurationSeconds = req.body.questionDuration || 30;
    const questionDurationMs = questionDurationSeconds * 1000; // Convertir en millisecondes

    // Récupérer les questions
    const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
    const questions = quiz.data;

    if (questions.length === 0) {
      return res.status(400).json({ error: "Aucune question disponible" });
    }

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
      console.log(`🚀 Starting game with ${connectedClients} connected clients`);

      // Émettre l'événement de début de jeu avec la première question
      req.io.emit("game:started", {
        questionIndex: newState.currentQuestionIndex,
        totalQuestions: questions.length,
        gameCode: newState.gameCode
      });
      console.log("📢 Emitted 'game:started' event to all clients");

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
      console.log("📢 Emitted 'question:next' event to all clients");

      // Programmer le timer pour passer automatiquement à la question suivante
      scheduleNextQuestion(req.io, questionDurationMs);
      
      console.log(`✅ Game started - all events emitted to ${connectedClients} clients`);
    } else {
      console.error("❌ Cannot start game: no questions or no io instance");
    }

    res.json({
      message: "Jeu démarré",
      state: await gameState.getState()
    });
  } catch (err) {
    console.error("Error starting game:", err);
    res.status(500).json({ error: "Internal server error" });
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

    // Récupérer les questions
    const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
    const questions = quiz.data;

    // Calculer les scores de la question précédente si elle existe
    if (state.currentQuestionId) {
      console.log(`📊 Calculating results for previous question ${state.currentQuestionId}...`);
      await calculateQuestionResults(state.currentQuestionId, questions);
      
      // Émettre les scores mis à jour via WebSocket
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

async function calculateQuestionResults(questionId, questions) {
  console.log(`\n🔍 ========== CALCULATING QUESTION RESULTS ==========`);
  console.log(`📋 Question ID: ${questionId}`);
  console.log(`📋 Total questions available: ${questions.length}`);
  
  const question = questions.find(q => q.id === questionId);
  if (!question) {
    console.log(`⚠️ Question ${questionId} not found in questions list`);
    console.log(`   Available question IDs:`, questions.map(q => q.id).join(', '));
    return;
  }
  
  console.log(`✅ Question found: "${question.question}"`);
  console.log(`✅ Correct answer: "${question.answer}"`);

  // Récupérer l'état frais depuis MongoDB
  const state = await gameState.getState();
  console.log(`📋 Game state retrieved. isStarted: ${state.isStarted}, currentQuestionId: ${state.currentQuestionId}`);
  
  const answers = state.answers || {};
  const playerResults = [];

  console.log(`📊 Calculating results for question ${questionId}`);
  console.log(`📋 State answers object type: ${typeof answers}`);
  console.log(`📋 State answers object:`, JSON.stringify(answers, null, 2));
  console.log(`📋 Number of players with answers: ${Object.keys(answers).length}`);
  
  // Vérifier si answers est bien un objet
  if (typeof answers !== 'object' || answers === null) {
    console.error(`❌ ERROR: answers is not an object! Type: ${typeof answers}, Value:`, answers);
    return;
  }
  
  if (Object.keys(answers).length === 0) {
    console.warn(`⚠️ WARNING: No answers found in gameState for any player!`);
    console.warn(`   This means either:`);
    console.warn(`   1. No players have answered yet`);
    console.warn(`   2. Answers were not saved correctly`);
    console.warn(`   3. Answers were cleared somehow`);
    return;
  }

  // Calculer les résultats pour chaque joueur
  for (const playerId in answers) {
    if (!answers[playerId]) {
      console.warn(`⚠️ Player ${playerId} has no answer object`);
      continue;
    }
    
    if (!answers[playerId][questionId]) {
      console.warn(`⚠️ Player ${playerId} has no answer for question ${questionId}`);
      console.log(`   Available question IDs for this player:`, Object.keys(answers[playerId]));
      continue;
    }
    
    const answer = answers[playerId][questionId];
    const correctAnswer = question.answer;
    
    // Normaliser les réponses pour la comparaison (fonction robuste)
    const normalizedAnswer = normalizeAnswer(answer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    const isCorrect = normalizedAnswer === normalizedCorrect;
    
    // Logs détaillés pour le débogage
    console.log(`\n   📝 Answer comparison details:`, {
      rawAnswer: answer,
      rawCorrect: correctAnswer,
      normalizedAnswer: normalizedAnswer,
      normalizedCorrect: normalizedCorrect,
      answerType: typeof answer,
      correctType: typeof correctAnswer,
      answerLength: normalizedAnswer.length,
      correctLength: normalizedCorrect.length,
      isEqual: isCorrect,
      answerCharCodes: normalizedAnswer.split('').map(c => c.charCodeAt(0)).join(','),
      correctCharCodes: normalizedCorrect.split('').map(c => c.charCodeAt(0)).join(',')
    });
    
    console.log(`\n🔍 Processing player ${playerId}:`);
    console.log(`   Answer given: "${answer}"`);
    console.log(`   Correct answer: "${correctAnswer}"`);
    console.log(`   Is correct: ${isCorrect}`);
      
    // Mettre à jour le score seulement maintenant
    try {
      console.log(`   Fetching player info from auth-service...`);
      const players = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
      const player = players.data.find(p => p.id === playerId);
      
      if (player) {
        console.log(`   ✅ Player found: ${player.name}`);
        const delta = isCorrect ? 1 : 0;
        console.log(`   📊 Updating score: delta = ${delta} (${isCorrect ? 'correct' : 'incorrect'})`);
        
        // Récupérer le score actuel avant mise à jour
        const scoreBefore = await Score.findOne({ playerId });
        const scoreBeforeValue = scoreBefore ? scoreBefore.score : 0;
        console.log(`   📊 Score before update: ${scoreBeforeValue}`);
        
        const updatedScore = await updateScore(playerId, player.name, delta);
        console.log(`   ✅ Score updated successfully!`);
        console.log(`   📊 Score after update: ${updatedScore.score}`);
        console.log(`   📊 Score change: ${scoreBeforeValue} → ${updatedScore.score} (${updatedScore.score - scoreBeforeValue > 0 ? '+' : ''}${updatedScore.score - scoreBeforeValue})`);
      } else {
        console.warn(`   ⚠️ Player ${playerId} not found in auth service`);
        // Essayer de mettre à jour quand même avec le nom depuis les scores
        try {
          const existingScore = await Score.findOne({ playerId });
          if (existingScore) {
            console.log(`   ✅ Found player in scores: ${existingScore.playerName}`);
            const delta = isCorrect ? 1 : 0;
            const scoreBefore = existingScore.score || 0;
            console.log(`   📊 Score before update: ${scoreBefore}`);
            const updatedScore = await updateScore(playerId, existingScore.playerName, delta);
            console.log(`   ✅ Score updated: ${updatedScore.score} (${scoreBefore} + ${delta})`);
          } else {
            console.error(`   ❌ Player ${playerId} not found in auth service or scores`);
          }
        } catch (scoreErr) {
          console.error(`   ❌ Error updating score for player ${playerId}:`, scoreErr);
        }
      }
    } catch (err) {
      console.error(`   ❌ Error updating score for player ${playerId}:`, err);
      console.error(`   Error details:`, err.message);
    }

      playerResults.push({
        playerId,
        answer,
        isCorrect
      });
    }
  }

  // Sauvegarder les résultats
  await gameState.saveQuestionResult(questionId, question.answer, playerResults);
  console.log(`✅ Saved results for question ${questionId}: ${playerResults.length} players`);
  
  // Vérifier les scores finaux dans MongoDB
  console.log(`\n📊 Final scores check:`);
  try {
    const finalScores = await Score.find({}).lean();
    for (const score of finalScores) {
      console.log(`   ${score.playerName} (${score.playerId}): ${score.score} points`);
    }
  } catch (err) {
    console.error(`   ❌ Error checking final scores:`, err);
  }
  
  console.log(`\n✅ ========== CALCULATION COMPLETE ==========\n`);
}

exports.endGame = async (req, res) => {
  try {
    const state = await gameState.getState();
    
    if (state.currentQuestionId) {
      // Calculer les résultats de la dernière question
      console.log(`🏁 Ending game, calculating results for last question ${state.currentQuestionId}...`);
      const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
      await calculateQuestionResults(state.currentQuestionId, quiz.data);
    }

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
      console.log(`📢 Emitted final leaderboard with ${mappedScores.length} players`);
    }

    res.json({ message: "Jeu terminé", leaderboard: mappedScores });
  } catch (err) {
    console.error("Error ending game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    // Réinitialiser les scores pour cette session
    const deleteResult = await Score.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} scores from database`);
    
    // Réinitialiser l'état du jeu
    await gameState.resetGame();

    if (req.io) {
      req.io.emit("game:deleted", {
        message: "Partie supprimée"
      });
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