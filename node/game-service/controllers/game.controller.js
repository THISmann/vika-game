const fs = require("fs");
const path = require("path");
const axios = require("axios");
const gameState = require("../gameState");

const scoresPath = path.join(__dirname, "../data/scores.json");

function readScores() {
  try {
  return JSON.parse(fs.readFileSync(scoresPath));
  } catch (err) {
    return [];
  }
}

function writeScores(data) {
  fs.writeFileSync(scoresPath, JSON.stringify(data, null, 2));
}

// Update player score + save playerName
async function updateScore(playerId, playerName, delta) {
  const scores = readScores();

  let entry = scores.find(s => s.playerId === playerId);

  if (!entry) {
    entry = { playerId, playerName, score: 0 };
    scores.push(entry);
  }

  // Always keep name updated (in case player changed his name)
  entry.playerName = playerName;

  entry.score += delta;
  writeScores(scores);

  return entry;
}

exports.answerQuestion = async (req, res) => {
  const { playerId, questionId, answer } = req.body;
  const state = gameState.getState();

  try {
    // Vérifier si le jeu a commencé
    if (!state.isStarted) {
      return res.status(400).json({ error: "Le jeu n'a pas encore commencé" });
    }

    // Vérifier si c'est la bonne question
    if (state.currentQuestionId !== questionId) {
      return res.status(400).json({ error: "Cette question n'est plus active" });
    }

    // Vérifier si le joueur a déjà répondu
    if (state.answers[playerId] && state.answers[playerId][questionId]) {
      return res.json({
        alreadyAnswered: true,
        message: "Vous avez déjà répondu à cette question"
      });
    }

    // 🔍 Fetch player
    const players = await axios.get(`http://localhost:3001/auth/players`);
    const player = players.data.find(p => p.id === playerId);

    if (!player) return res.status(404).json({ error: "Player not found" });

    // 🔍 Fetch quiz questions
    const quiz = await axios.get(`http://localhost:3002/quiz/full`);
    const question = quiz.data.find(q => q.id === questionId);

    if (!question) return res.status(404).json({ error: "Question not found" });

    const isCorrect = question.answer === answer;

    // Sauvegarder la réponse (mais ne pas mettre à jour le score maintenant)
    gameState.saveAnswer(playerId, questionId, answer);

    res.json({
      correct: isCorrect,
      correctAnswer: question.answer,
      playerName: player.name,
      answered: true,
      message: "Réponse enregistrée. Les résultats seront affichés à la fin."
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getScore = (req, res) => {
  const scores = readScores();
  const entry = scores.find(s => s.playerId === req.params.playerId);
  res.json(entry || { playerId: req.params.playerId, playerName: null, score: 0 });
};

exports.leaderboard = (req, res) => {
  const state = gameState.getState();
  const scores = readScores();
  
  // Filtrer par session de jeu en cours
  // Si le jeu est en cours, on retourne seulement les scores de la session actuelle
  // Sinon, on retourne tous les scores (pour l'historique)
  let sessionScores = scores;
  
  if (state.isStarted && state.gameSessionId) {
    // Pour cette version, on retourne tous les scores car ils sont réinitialisés à chaque nouvelle partie
    // Dans une version future, on pourrait filtrer par gameSessionId si on stocke cette info dans les scores
    sessionScores = scores;
  }
  
  // Trier par score décroissant
  sessionScores = sessionScores.sort((a, b) => b.score - a.score);
  
  res.json(sessionScores);
};

exports.getGameState = (req, res) => {
  const state = gameState.getState();
  res.json({
    isStarted: state.isStarted,
    currentQuestionIndex: state.currentQuestionIndex,
    currentQuestionId: state.currentQuestionId,
    questionStartTime: state.questionStartTime,
    questionDuration: state.questionDuration,
    connectedPlayersCount: gameState.getConnectedPlayersCount(),
    gameSessionId: state.gameSessionId
  });
};

exports.getConnectedPlayersCount = (req, res) => {
  res.json({ count: gameState.getConnectedPlayersCount() });
};

// Variable globale pour stocker le timer
let questionTimer = null;

// Fonction helper pour passer à la question suivante automatiquement
async function scheduleNextQuestion(io) {
  if (questionTimer) {
    clearTimeout(questionTimer);
  }

  const state = gameState.getState();
  if (!state.isStarted || !state.currentQuestionId) {
    return;
  }

  questionTimer = setTimeout(async () => {
    try {
      // Utiliser la logique de nextQuestion
      const quiz = await axios.get(`http://localhost:3002/quiz/full`);
      const questions = quiz.data;

      // Calculer les résultats de la question actuelle
      if (state.currentQuestionId) {
        await calculateQuestionResults(state.currentQuestionId, questions);
      }

      // Passer à la question suivante
      const nextIndex = state.currentQuestionIndex + 1;
      
      if (nextIndex >= questions.length) {
        // Fin du jeu
        gameState.endGame();
        io.emit("game:ended", { message: "Le jeu est terminé" });
        return;
      }

      const nextQuestion = questions[nextIndex];
      gameState.nextQuestion();
      gameState.setCurrentQuestion(nextQuestion.id, 30000);

      const newState = gameState.getState();

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
    // Récupérer les questions
    const quiz = await axios.get(`http://localhost:3002/quiz/full`);
    const questions = quiz.data;

    if (questions.length === 0) {
      return res.status(400).json({ error: "Aucune question disponible" });
    }

    gameState.startGame();
    const state = gameState.getState();

    // Démarrer avec la première question
    if (questions.length > 0 && req.io) {
      const firstQuestion = questions[0];
      gameState.setCurrentQuestion(firstQuestion.id, 30000);
      const newState = gameState.getState();

      // Émettre l'événement de début de jeu avec la première question
      req.io.emit("game:started", {
        questionIndex: newState.currentQuestionIndex,
        totalQuestions: questions.length
      });

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

      // Programmer le timer pour passer automatiquement à la question suivante
      scheduleNextQuestion(req.io);
    }

    res.json({
      message: "Jeu démarré",
      state: gameState.getState()
    });
  } catch (err) {
    console.error("Error starting game:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.nextQuestion = async (req, res) => {
  try {
    const state = gameState.getState();
    
    if (!state.isStarted) {
      return res.status(400).json({ error: "Le jeu n'a pas commencé" });
    }

    // Annuler le timer actuel
    if (questionTimer) {
      clearTimeout(questionTimer);
      questionTimer = null;
    }

    // Récupérer les questions
    const quiz = await axios.get(`http://localhost:3002/quiz/full`);
    const questions = quiz.data;

    // Calculer les scores de la question précédente si elle existe
    if (state.currentQuestionId) {
      await calculateQuestionResults(state.currentQuestionId, questions);
    }

    // Passer à la question suivante
    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      // Fin du jeu
      gameState.endGame();
      
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
    gameState.nextQuestion();
    gameState.setCurrentQuestion(nextQuestion.id, 30000); // 30 secondes par défaut

    const newState = gameState.getState();

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
      scheduleNextQuestion(req.io);
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
  if (!question) return;

  const state = gameState.getState();
  const answers = state.answers;
  const playerResults = [];

  // Calculer les résultats pour chaque joueur
  for (const playerId in answers) {
    if (answers[playerId][questionId]) {
      const answer = answers[playerId][questionId];
      const isCorrect = answer === question.answer;
      
      // Mettre à jour le score seulement maintenant
      try {
        const players = await axios.get(`http://localhost:3001/auth/players`);
        const player = players.data.find(p => p.id === playerId);
        if (player) {
          await updateScore(playerId, player.name, isCorrect ? 1 : 0);
        }
      } catch (err) {
        console.error("Error updating score:", err);
      }

      playerResults.push({
        playerId,
        answer,
        isCorrect
      });
    }
  }

  // Sauvegarder les résultats
  gameState.saveQuestionResult(questionId, question.answer, playerResults);
}

exports.endGame = async (req, res) => {
  try {
    const state = gameState.getState();
    
    if (state.currentQuestionId) {
      // Calculer les résultats de la dernière question
      const quiz = await axios.get(`http://localhost:3002/quiz/full`);
      await calculateQuestionResults(state.currentQuestionId, quiz.data);
    }

    gameState.endGame();

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
    const scores = readScores();
    const state = gameState.getState();
    
    // Optionnel: supprimer tous les scores ou seulement ceux de la session
    // Pour l'instant, on réinitialise tout
    writeScores([]);
    
    // Réinitialiser l'état du jeu
    gameState.resetGame();

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

exports.getQuestionResults = (req, res) => {
  const state = gameState.getState();
  res.json(state.results);
};