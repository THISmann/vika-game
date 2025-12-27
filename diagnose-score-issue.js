#!/usr/bin/env node

/**
 * Script de diagnostic complet pour le problème de comptage de points
 * Vérifie chaque étape de la chaîne pour identifier où le problème se situe
 */

const mongoose = require('mongoose');
const axios = require('axios');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb-service:27017/intelectgame';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:3001';
const QUIZ_URL = process.env.QUIZ_URL || 'http://localhost:3002';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
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

async function diagnose() {
  logSection('🔍 DIAGNOSTIC COMPLET DU PROBLÈME DE SCORE');
  
  // Connexion à MongoDB
  log('\n📡 Connexion à MongoDB...', 'yellow');
  try {
    await mongoose.connect(MONGODB_URI);
    log('✅ Connecté à MongoDB', 'green');
  } catch (err) {
    log(`❌ Erreur de connexion MongoDB: ${err.message}`, 'red');
    return;
  }

  const GameState = require('./node/game-service/models/GameState');
  const Score = require('./node/game-service/models/Score');
  const Question = require('./node/quiz-service/models/Question');

  try {
    // ==========================================
    // ÉTAPE 1: Vérifier l'état du jeu
    // ==========================================
    logSection('ÉTAPE 1: Vérification de l\'état du jeu');
    
    const gameState = await GameState.getCurrent();
    log(`État du jeu:`, 'yellow');
    console.log(JSON.stringify({
      isStarted: gameState.isStarted,
      currentQuestionId: gameState.currentQuestionId,
      currentQuestionIndex: gameState.currentQuestionIndex,
      connectedPlayers: gameState.connectedPlayers,
      answersCount: Object.keys(gameState.answers || {}).length
    }, null, 2));
    
    if (!gameState.isStarted) {
      log('⚠️ Le jeu n\'est pas démarré', 'yellow');
    }
    
    // ==========================================
    // ÉTAPE 2: Vérifier les réponses dans gameState
    // ==========================================
    logSection('ÉTAPE 2: Vérification des réponses dans gameState');
    
    const answers = gameState.answers || {};
    log(`Nombre de joueurs avec réponses: ${Object.keys(answers).length}`, 'yellow');
    
    if (Object.keys(answers).length === 0) {
      log('❌ Aucune réponse trouvée dans gameState!', 'red');
      log('   Cela signifie que soit:', 'yellow');
      log('   1. Aucun joueur n\'a répondu', 'yellow');
      log('   2. Les réponses n\'ont pas été sauvegardées', 'yellow');
      log('   3. Les réponses ont été effacées', 'yellow');
    } else {
      log('✅ Réponses trouvées:', 'green');
      for (const playerId in answers) {
        log(`   Joueur ${playerId}:`, 'yellow');
        console.log(JSON.stringify(answers[playerId], null, 2));
      }
    }
    
    // ==========================================
    // ÉTAPE 3: Vérifier les questions
    // ==========================================
    logSection('ÉTAPE 3: Vérification des questions');
    
    const questions = await Question.find({});
    log(`Nombre de questions: ${questions.length}`, 'yellow');
    
    if (questions.length === 0) {
      log('❌ Aucune question trouvée!', 'red');
    } else {
      log('✅ Questions trouvées:', 'green');
      questions.forEach(q => {
        log(`   ${q.id}: "${q.question}" → "${q.answer}"`, 'yellow');
      });
      
      if (gameState.currentQuestionId) {
        const currentQuestion = questions.find(q => q.id === gameState.currentQuestionId);
        if (currentQuestion) {
          log(`✅ Question actuelle trouvée: "${currentQuestion.question}"`, 'green');
          log(`   Réponse correcte: "${currentQuestion.answer}"`, 'green');
        } else {
          log(`❌ Question actuelle ${gameState.currentQuestionId} non trouvée dans MongoDB!`, 'red');
        }
      }
    }
    
    // ==========================================
    // ÉTAPE 4: Vérifier les scores dans MongoDB
    // ==========================================
    logSection('ÉTAPE 4: Vérification des scores dans MongoDB');
    
    const scores = await Score.find({});
    log(`Nombre de scores: ${scores.length}`, 'yellow');
    
    if (scores.length === 0) {
      log('❌ Aucun score trouvé dans MongoDB!', 'red');
    } else {
      log('✅ Scores trouvés:', 'green');
      scores.forEach(s => {
        log(`   ${s.playerName} (${s.playerId}): ${s.score} points`, s.score > 0 ? 'green' : 'yellow');
      });
    }
    
    // ==========================================
    // ÉTAPE 5: Vérifier la correspondance réponses/scores
    // ==========================================
    logSection('ÉTAPE 5: Vérification de la correspondance réponses/scores');
    
    if (gameState.currentQuestionId && Object.keys(answers).length > 0) {
      const currentQuestion = questions.find(q => q.id === gameState.currentQuestionId);
      
      if (currentQuestion) {
        log(`Question actuelle: ${currentQuestion.id}`, 'yellow');
        log(`Réponse correcte: "${currentQuestion.answer}"`, 'yellow');
        
        for (const playerId in answers) {
          if (answers[playerId] && answers[playerId][gameState.currentQuestionId]) {
            const playerAnswer = answers[playerId][gameState.currentQuestionId];
            const correctAnswer = currentQuestion.answer;
            
            log(`\nJoueur ${playerId}:`, 'cyan');
            log(`   Réponse donnée: "${playerAnswer}"`, 'yellow');
            log(`   Réponse correcte: "${correctAnswer}"`, 'yellow');
            
            // Normalisation
            function normalizeAnswer(answer) {
              if (answer === null || answer === undefined) return '';
              let normalized = String(answer).trim();
              normalized = normalized.replace(/\s+/g, ' ');
              normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');
              normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return normalized;
            }
            
            const normalizedAnswer = normalizeAnswer(playerAnswer);
            const normalizedCorrect = normalizeAnswer(correctAnswer);
            const isCorrect = normalizedAnswer === normalizedCorrect;
            
            log(`   Normalisé: "${normalizedAnswer}"`, 'yellow');
            log(`   Correct normalisé: "${normalizedCorrect}"`, 'yellow');
            log(`   Est correct: ${isCorrect}`, isCorrect ? 'green' : 'red');
            
            // Vérifier le score
            const playerScore = scores.find(s => s.playerId === playerId);
            if (playerScore) {
              log(`   Score actuel: ${playerScore.score}`, playerScore.score > 0 ? 'green' : 'red');
              if (isCorrect && playerScore.score === 0) {
                log(`   ❌ PROBLÈME: Réponse correcte mais score = 0!`, 'red');
                log(`      Le calcul des scores n'a pas fonctionné.`, 'red');
              }
            } else {
              log(`   ⚠️ Aucun score trouvé pour ce joueur`, 'yellow');
            }
          }
        }
      }
    }
    
    // ==========================================
    // ÉTAPE 6: Vérifier via l'API
    // ==========================================
    logSection('ÉTAPE 6: Vérification via l\'API');
    
    try {
      const leaderboardRes = await axios.get(`${BASE_URL}/game/leaderboard`);
      log(`Leaderboard via API:`, 'yellow');
      console.log(JSON.stringify(leaderboardRes.data, null, 2));
    } catch (err) {
      log(`⚠️ Erreur API leaderboard: ${err.message}`, 'yellow');
    }
    
    // ==========================================
    // RÉSUMÉ ET RECOMMANDATIONS
    // ==========================================
    logSection('📊 RÉSUMÉ ET DIAGNOSTIC');
    
    const issues = [];
    
    if (!gameState.isStarted) {
      issues.push('Le jeu n\'est pas démarré');
    }
    
    if (Object.keys(answers).length === 0) {
      issues.push('Aucune réponse trouvée dans gameState');
    }
    
    if (questions.length === 0) {
      issues.push('Aucune question trouvée');
    }
    
    if (scores.length === 0) {
      issues.push('Aucun score trouvé dans MongoDB');
    }
    
    // Vérifier si les réponses correctes ont des scores à 0
    if (gameState.currentQuestionId) {
      const currentQuestion = questions.find(q => q.id === gameState.currentQuestionId);
      if (currentQuestion) {
        for (const playerId in answers) {
          if (answers[playerId] && answers[playerId][gameState.currentQuestionId]) {
            const playerAnswer = answers[playerId][gameState.currentQuestionId];
            function normalizeAnswer(answer) {
              if (answer === null || answer === undefined) return '';
              let normalized = String(answer).trim();
              normalized = normalized.replace(/\s+/g, ' ');
              normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');
              normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return normalized;
            }
            const isCorrect = normalizeAnswer(playerAnswer) === normalizeAnswer(currentQuestion.answer);
            const playerScore = scores.find(s => s.playerId === playerId);
            if (isCorrect && (!playerScore || playerScore.score === 0)) {
              issues.push(`Joueur ${playerId}: Réponse correcte mais score = 0`);
            }
          }
        }
      }
    }
    
    if (issues.length === 0) {
      log('\n✅ Aucun problème détecté dans les données', 'green');
    } else {
      log('\n❌ PROBLÈMES DÉTECTÉS:', 'red');
      issues.forEach((issue, i) => {
        log(`   ${i + 1}. ${issue}`, 'red');
      });
      
      log('\n🔧 RECOMMANDATIONS:', 'yellow');
      if (issues.includes('Aucune réponse trouvée dans gameState')) {
        log('   1. Vérifier que les joueurs envoient bien leurs réponses', 'yellow');
        log('   2. Vérifier que saveAnswer() fonctionne correctement', 'yellow');
      }
      if (issues.some(i => i.includes('Réponse correcte mais score = 0'))) {
        log('   1. Vérifier que calculateQuestionResults() est appelée', 'yellow');
        log('   2. Vérifier que updateScore() est appelée avec delta > 0', 'yellow');
        log('   3. Vérifier les logs du service pour voir les erreurs', 'yellow');
      }
    }
    
  } catch (err) {
    log(`\n❌ ERREUR FATALE: ${err.message}`, 'red');
    console.error(err);
  } finally {
    await mongoose.disconnect();
    log('\n✅ Déconnexion de MongoDB', 'green');
  }
}

diagnose();





