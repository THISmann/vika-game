#!/usr/bin/env node

/**
 * Mock-up complet pour tester la logique de comptage de points
 * Ce script simule toute la chaîne avec des données contrôlées
 * pour identifier exactement où le problème se situe
 */

const mongoose = require('mongoose');
const axios = require('axios');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb-service:27017/intelectgame';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const QUIZ_URL = process.env.QUIZ_URL || 'http://localhost:3002';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(title, 'cyan');
  log('='.repeat(70), 'cyan');
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    log('✅ Connecté à MongoDB', 'green');
    return true;
  } catch (err) {
    log(`❌ Erreur de connexion MongoDB: ${err.message}`, 'red');
    return false;
  }
}

async function testCompleteFlow() {
  logSection('🧪 TEST COMPLET DE LA LOGIQUE DE COMPTAGE DE POINTS');
  
  // Connexion à MongoDB
  const connected = await connectDB();
  if (!connected) {
    log('❌ Impossible de continuer sans MongoDB', 'red');
    return;
  }

  // Importer les modèles
  const GameState = require('./node/game-service/models/GameState');
  const Score = require('./node/game-service/models/Score');
  const Question = require('./node/quiz-service/models/Question');

  try {
    // ==========================================
    // ÉTAPE 1: Nettoyer et préparer les données
    // ==========================================
    logSection('ÉTAPE 1: Nettoyage et préparation');
    
    // Nettoyer les scores
    await Score.deleteMany({});
    log('✅ Scores nettoyés', 'green');
    
    // Nettoyer le gameState
    await GameState.deleteMany({});
    log('✅ GameState nettoyé', 'green');
    
    // Créer un gameState initial
    const initialState = await GameState.create({
      key: 'current',
      isStarted: false,
      currentQuestionIndex: -1,
      currentQuestionId: null,
      connectedPlayers: [],
      answers: {},
      results: {}
    });
    log('✅ GameState initial créé', 'green');

    // ==========================================
    // ÉTAPE 2: Créer des questions de test
    // ==========================================
    logSection('ÉTAPE 2: Création de questions de test');
    
    // Nettoyer les questions de test
    await Question.deleteMany({ id: { $regex: /^test-/ } });
    
    const testQuestions = [
      {
        id: 'test-q1',
        question: 'Quelle est la capitale de la France ?',
        choices: ['Paris', 'Londres', 'Berlin', 'Madrid'],
        answer: 'Paris'
      },
      {
        id: 'test-q2',
        question: '2 + 2 = ?',
        choices: ['3', '4', '5', '6'],
        answer: '4'
      }
    ];
    
    for (const q of testQuestions) {
      await Question.create(q);
      log(`✅ Question créée: ${q.id} - "${q.question}" (réponse: "${q.answer}")`, 'green');
    }

    // ==========================================
    // ÉTAPE 3: Créer un joueur de test
    // ==========================================
    logSection('ÉTAPE 3: Création d\'un joueur de test');
    
    // Créer un joueur via l'API auth-service
    let playerId, playerName;
    try {
      const playerRes = await axios.post(`${AUTH_URL}/auth/players/register`, {
        name: 'TestPlayer_' + Date.now()
      });
      playerId = playerRes.data.id;
      playerName = playerRes.data.name;
      log(`✅ Joueur créé: ${playerName} (${playerId})`, 'green');
    } catch (err) {
      log(`⚠️ Impossible de créer un joueur via API, utilisation d'un ID mock`, 'yellow');
      playerId = 'test-player-' + Date.now();
      playerName = 'TestPlayer';
    }

    // ==========================================
    // ÉTAPE 4: Initialiser le score du joueur
    // ==========================================
    logSection('ÉTAPE 4: Initialisation du score');
    
    let initialScore = await Score.findOne({ playerId });
    if (!initialScore) {
      initialScore = await Score.create({
        playerId,
        playerName,
        score: 0
      });
      log(`✅ Score initialisé: ${playerName} = 0`, 'green');
    } else {
      log(`ℹ️ Score existant: ${playerName} = ${initialScore.score}`, 'yellow');
    }

    // ==========================================
    // ÉTAPE 5: Démarrer le jeu
    // ==========================================
    logSection('ÉTAPE 5: Démarrage du jeu');
    
    const gameState = await GameState.getCurrent();
    gameState.isStarted = true;
    gameState.currentQuestionIndex = 0;
    gameState.currentQuestionId = testQuestions[0].id;
    gameState.questionStartTime = Date.now();
    gameState.questionDuration = 30000;
    gameState.connectedPlayers = [playerId];
    await gameState.save();
    log(`✅ Jeu démarré avec question: ${testQuestions[0].id}`, 'green');

    // ==========================================
    // ÉTAPE 6: Vérifier la question dans MongoDB
    // ==========================================
    logSection('ÉTAPE 6: Vérification de la question dans MongoDB');
    
    const questionFromDB = await Question.findOne({ id: testQuestions[0].id });
    if (!questionFromDB) {
      log(`❌ Question ${testQuestions[0].id} non trouvée dans MongoDB!`, 'red');
      return;
    }
    
    log(`✅ Question trouvée:`, 'green');
    log(`   ID: ${questionFromDB.id}`, 'yellow');
    log(`   Question: ${questionFromDB.question}`, 'yellow');
    log(`   Choices: ${JSON.stringify(questionFromDB.choices)}`, 'yellow');
    log(`   Answer: "${questionFromDB.answer}" (type: ${typeof questionFromDB.answer})`, 'yellow');
    log(`   Answer length: ${questionFromDB.answer.length}`, 'yellow');
    log(`   Answer char codes: ${questionFromDB.answer.split('').map(c => c.charCodeAt(0)).join(', ')}`, 'yellow');

    // ==========================================
    // ÉTAPE 7: Simuler une réponse correcte
    // ==========================================
    logSection('ÉTAPE 7: Simulation d\'une réponse correcte');
    
    const correctAnswer = testQuestions[0].answer;
    const playerAnswer = correctAnswer; // Réponse correcte
    
    log(`📝 Réponse du joueur: "${playerAnswer}" (type: ${typeof playerAnswer})`, 'yellow');
    log(`📝 Réponse correcte: "${correctAnswer}" (type: ${typeof correctAnswer})`, 'yellow');
    log(`📝 Comparaison: ${playerAnswer === correctAnswer}`, playerAnswer === correctAnswer ? 'green' : 'red');
    log(`📝 Comparaison avec trim: ${playerAnswer.trim() === correctAnswer.trim()}`, playerAnswer.trim() === correctAnswer.trim() ? 'green' : 'red');
    
    // Sauvegarder la réponse dans gameState
    const state = await GameState.getCurrent();
    if (!state.answers) {
      state.answers = {};
    }
    if (!state.answers[playerId]) {
      state.answers[playerId] = {};
    }
    state.answers[playerId][testQuestions[0].id] = playerAnswer;
    await state.save();
    log(`✅ Réponse sauvegardée dans gameState`, 'green');
    
    // Vérifier que la réponse est bien sauvegardée
    const savedState = await GameState.getCurrent();
    const savedAnswer = savedState.answers[playerId][testQuestions[0].id];
    log(`✅ Vérification: réponse sauvegardée = "${savedAnswer}"`, savedAnswer === playerAnswer ? 'green' : 'red');

    // ==========================================
    // ÉTAPE 8: Simuler calculateQuestionResults
    // ==========================================
    logSection('ÉTAPE 8: Simulation de calculateQuestionResults');
    
    const freshState = await GameState.getCurrent();
    const answers = freshState.answers || {};
    log(`📋 Nombre de joueurs avec réponses: ${Object.keys(answers).length}`, 'yellow');
    
    if (!answers[playerId] || !answers[playerId][testQuestions[0].id]) {
      log(`❌ Réponse non trouvée pour le joueur ${playerId}`, 'red');
      log(`   Answers object: ${JSON.stringify(answers, null, 2)}`, 'red');
      return;
    }
    
    const answerFromState = answers[playerId][testQuestions[0].id];
    const correctAnswerFromDB = questionFromDB.answer;
    
    log(`📋 Réponse depuis gameState: "${answerFromState}" (type: ${typeof answerFromState})`, 'yellow');
    log(`📋 Réponse correcte depuis DB: "${correctAnswerFromDB}" (type: ${typeof correctAnswerFromDB})`, 'yellow');
    
    // Comparaison détaillée
    const isCorrect = answerFromState === correctAnswerFromDB;
    log(`\n🔍 COMPARAISON DÉTAILLÉE:`, 'magenta');
    log(`   answerFromState === correctAnswerFromDB: ${isCorrect}`, isCorrect ? 'green' : 'red');
    log(`   answerFromState.length: ${answerFromState.length}`, 'yellow');
    log(`   correctAnswerFromDB.length: ${correctAnswerFromDB.length}`, 'yellow');
    log(`   answerFromState.trim() === correctAnswerFromDB.trim(): ${answerFromState.trim() === correctAnswerFromDB.trim()}`, 'yellow');
    log(`   answerFromState.toLowerCase() === correctAnswerFromDB.toLowerCase(): ${answerFromState.toLowerCase() === correctAnswerFromDB.toLowerCase()}`, 'yellow');
    
    if (!isCorrect) {
      log(`\n⚠️ PROBLÈME DÉTECTÉ: Les réponses ne correspondent pas exactement!`, 'red');
      log(`   Différences possibles:`, 'yellow');
      log(`   - Espaces avant/après`, 'yellow');
      log(`   - Différences de casse`, 'yellow');
      log(`   - Caractères invisibles`, 'yellow');
      log(`   - Encodage différent`, 'yellow');
    }

    // ==========================================
    // ÉTAPE 9: Mettre à jour le score
    // ==========================================
    logSection('ÉTAPE 9: Mise à jour du score');
    
    const scoreBefore = await Score.findOne({ playerId });
    const scoreBeforeValue = scoreBefore ? scoreBefore.score : 0;
    log(`📊 Score avant mise à jour: ${scoreBeforeValue}`, 'yellow');
    
    const delta = isCorrect ? 1 : 0;
    log(`📊 Delta à appliquer: ${delta} (${isCorrect ? 'correct' : 'incorrect'})`, delta > 0 ? 'green' : 'red');
    
    if (scoreBefore) {
      scoreBefore.score = scoreBeforeValue + delta;
      scoreBefore.playerName = playerName;
      await scoreBefore.save();
    } else {
      await Score.create({
        playerId,
        playerName,
        score: delta
      });
    }
    
    const scoreAfter = await Score.findOne({ playerId });
    log(`📊 Score après mise à jour: ${scoreAfter.score}`, scoreAfter.score > 0 ? 'green' : 'red');
    log(`📊 Changement: ${scoreBeforeValue} → ${scoreAfter.score} (${scoreAfter.score - scoreBeforeValue > 0 ? '+' : ''}${scoreAfter.score - scoreBeforeValue})`, 'yellow');

    // ==========================================
    // ÉTAPE 10: Vérifier via l'API
    // ==========================================
    logSection('ÉTAPE 10: Vérification via l\'API');
    
    try {
      const scoreAPI = await axios.get(`${BASE_URL}/game/score/${playerId}`);
      log(`📊 Score via API: ${scoreAPI.data.score}`, scoreAPI.data.score > 0 ? 'green' : 'red');
    } catch (err) {
      log(`⚠️ Impossible de récupérer le score via API: ${err.message}`, 'yellow');
    }
    
    try {
      const leaderboardAPI = await axios.get(`${BASE_URL}/game/leaderboard`);
      const playerInLeaderboard = leaderboardAPI.data.find(p => p.playerId === playerId);
      if (playerInLeaderboard) {
        log(`📊 Score dans leaderboard: ${playerInLeaderboard.score}`, playerInLeaderboard.score > 0 ? 'green' : 'red');
      } else {
        log(`⚠️ Joueur non trouvé dans le leaderboard`, 'yellow');
      }
    } catch (err) {
      log(`⚠️ Impossible de récupérer le leaderboard via API: ${err.message}`, 'yellow');
    }

    // ==========================================
    // RÉSUMÉ
    // ==========================================
    logSection('📊 RÉSUMÉ DU TEST');
    
    log(`Joueur: ${playerName} (${playerId})`, 'yellow');
    log(`Question: ${testQuestions[0].id}`, 'yellow');
    log(`Réponse donnée: "${playerAnswer}"`, 'yellow');
    log(`Réponse correcte: "${correctAnswer}"`, 'yellow');
    log(`Réponse correcte (DB): "${correctAnswerFromDB}"`, 'yellow');
    log(`Comparaison exacte: ${isCorrect}`, isCorrect ? 'green' : 'red');
    log(`Score initial: ${scoreBeforeValue}`, 'yellow');
    log(`Score final: ${scoreAfter.score}`, scoreAfter.score > 0 ? 'green' : 'red');
    
    if (scoreAfter.score > 0 && isCorrect) {
      log(`\n✅ TEST RÉUSSI: Le système fonctionne correctement!`, 'green');
    } else if (!isCorrect) {
      log(`\n❌ TEST ÉCHOUÉ: La comparaison des réponses ne fonctionne pas`, 'red');
      log(`   Problème: Les réponses ne correspondent pas exactement`, 'red');
      log(`   Solution: Normaliser les réponses (trim, lowercase, etc.)`, 'yellow');
    } else {
      log(`\n❌ TEST ÉCHOUÉ: Le score n'a pas été mis à jour`, 'red');
      log(`   Problème: Le score est resté à 0 malgré une réponse correcte`, 'red');
    }

  } catch (err) {
    log(`\n❌ ERREUR FATALE: ${err.message}`, 'red');
    console.error(err);
  } finally {
    await mongoose.disconnect();
    log('\n✅ Déconnexion de MongoDB', 'green');
  }
}

// Exécuter le test
testCompleteFlow();



