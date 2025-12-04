const axios = require("axios");
const gameState = require("../gameState");
const services = require("../config/services");
const Score = require("../models/Score");

// Update player score + save playerName
async function updateScore(playerId, playerName, delta) {
  try {
    let score = await Score.findOne({ playerId });

    if (!score) {
      score = new Score({
        playerId,
        playerName,
        score: 0
      });
  }

  // Always keep name updated (in case player changed his name)
    score.playerName = playerName;
    score.score = (score.score || 0) + delta;

    await score.save();
    const scoreObj = score.toObject();
    console.log(`💾 Score saved: ${playerName} (${playerId}) = ${scoreObj.score} (delta: ${delta})`);
    return scoreObj;
  } catch (error) {
    console.error("Error updating score:", error);
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
        return res.status(404).json({ error: "Player not found" });
      }
    } catch (err) {
      console.error("Error fetching player:", err);
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

    const isCorrect = question.answer === answer;

    // Sauvegarder la réponse (mais ne pas mettre à jour le score maintenant)
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
    const score = await Score.findOne({ playerId: req.params.playerId });
    res.json(score ? score.toObject() : { playerId: req.params.playerId, playerName: null, score: 0 });
  } catch (error) {
    console.error("Error getting score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.leaderboard = async (req, res) => {
  try {
    const scores = await Score.find({}).lean();
    
    // Si aucun score n'existe, retourner un tableau vide
    if (!scores || scores.length === 0) {
      console.log("No scores found in database");
      return res.json([]);
    }
    
    // Trier par score décroissant
    const sortedScores = scores.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    console.log(`✅ Leaderboard: returning ${sortedScores.length} scores`);
    
    res.json(sortedScores);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ error: "Internal server error" });
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
    
    // Récupérer les noms des joueurs depuis auth-service
    const axios = require('axios');
    const services = require('../config/services');
    
    const players = [];
    for (const playerId of playerIds) {
      try {
        const playerRes = await axios.get(`${services.AUTH_SERVICE}/auth/players/${playerId}`);
        if (playerRes.data) {
          players.push({
            id: playerId,
            name: playerRes.data.name || 'Joueur anonyme'
          });
        }
      } catch (err) {
        // Si le joueur n'existe pas, l'ajouter quand même avec un nom par défaut
        players.push({
          id: playerId,
          name: 'Joueur anonyme'
        });
      }
    }
    
    res.json({ players, count: players.length });
  } catch (error) {
    console.error("Error getting connected players:", error);
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
      // Utiliser la logique de nextQuestion
      const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
      const questions = quiz.data;

      // Calculer les résultats de la question actuelle
      if (state.currentQuestionId) {
        await calculateQuestionResults(state.currentQuestionId, questions);
      }

      // Passer à la question suivante
      const nextIndex = state.currentQuestionIndex + 1;
      
      if (nextIndex >= questions.length) {
        // Fin du jeu
        await gameState.endGame();
        io.emit("game:ended", { message: "Le jeu est terminé" });
        return;
      }

      const nextQuestion = questions[nextIndex];
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
      await calculateQuestionResults(state.currentQuestionId, questions);
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
  const question = questions.find(q => q.id === questionId);
  if (!question) {
    console.log(`⚠️ Question ${questionId} not found in questions list`);
    return;
  }

  const state = await gameState.getState();
  const answers = state.answers || {};
  const playerResults = [];

  console.log(`📊 Calculating results for question ${questionId}, ${Object.keys(answers).length} players have answers`);

  // Calculer les résultats pour chaque joueur
  for (const playerId in answers) {
    if (answers[playerId] && answers[playerId][questionId]) {
      const answer = answers[playerId][questionId];
      const isCorrect = answer === question.answer;
      
      // Mettre à jour le score seulement maintenant
      try {
        const players = await axios.get(`${services.AUTH_SERVICE_URL}/auth/players`);
        const player = players.data.find(p => p.id === playerId);
        if (player) {
          const updatedScore = await updateScore(playerId, player.name, isCorrect ? 1 : 0);
          console.log(`✅ Updated score for ${player.name}: ${updatedScore.score} (${isCorrect ? '+' : ''}${isCorrect ? 1 : 0})`);
        } else {
          console.warn(`⚠️ Player ${playerId} not found in auth service`);
        }
      } catch (err) {
        console.error(`❌ Error updating score for player ${playerId}:`, err);
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
}

exports.endGame = async (req, res) => {
  try {
    const state = await gameState.getState();
    
    if (state.currentQuestionId) {
      // Calculer les résultats de la dernière question
      const quiz = await axios.get(`${services.QUIZ_SERVICE_URL}/quiz/full`);
      await calculateQuestionResults(state.currentQuestionId, quiz.data);
    }

    await gameState.endGame();

    if (req.io) {
      req.io.emit("game:ended", {
        message: "Le jeu est terminé"
      });
    }

    res.json({ message: "Jeu terminé" });
  } catch (err) {
    console.error("Error ending game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    // Réinitialiser les scores pour cette session
    await Score.deleteMany({});
    
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