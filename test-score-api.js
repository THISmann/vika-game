#!/usr/bin/env node

/**
 * Script de test Node.js pour tester la logique de comptage de points
 * Ce script teste toute la chaîne : réponse -> sauvegarde -> calcul -> score
 */

const axios = require('axios');

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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`ÉTAPE ${step}: ${message}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

async function testAPI() {
  let playerId = null;
  let playerName = null;
  let questionId = null;
  let correctAnswer = null;
  let initialScore = 0;
  let scoreAfterAnswer = 0;
  let scoreAfterCalculation = 0;

  try {
    // Étape 1: Vérifier l'état du jeu
    logStep(1, 'Vérifier l\'état du jeu');
    const gameStateRes = await axios.get(`${BASE_URL}/game/state`);
    log(`État du jeu:`, 'yellow');
    console.log(JSON.stringify(gameStateRes.data, null, 2));
    const isStarted = gameStateRes.data.isStarted;
    log(`Jeu démarré: ${isStarted}`, isStarted ? 'green' : 'yellow');

    // Étape 2: Récupérer les joueurs
    logStep(2, 'Récupérer les joueurs disponibles');
    const playersRes = await axios.get(`${AUTH_URL}/auth/players`);
    const players = playersRes.data;
    log(`Nombre de joueurs: ${players.length}`, 'yellow');
    if (players.length > 0) {
      playerId = players[0].id;
      playerName = players[0].name;
      log(`Joueur sélectionné: ${playerName} (${playerId})`, 'green');
    } else {
      log('❌ Aucun joueur disponible', 'red');
      return;
    }

    // Étape 3: Récupérer les questions
    logStep(3, 'Récupérer les questions disponibles');
    const questionsRes = await axios.get(`${QUIZ_URL}/quiz/full`);
    const questions = questionsRes.data;
    log(`Nombre de questions: ${questions.length}`, 'yellow');
    if (questions.length > 0) {
      questionId = questions[0].id;
      correctAnswer = questions[0].answer;
      log(`Question sélectionnée:`, 'yellow');
      console.log(`  ID: ${questionId}`);
      console.log(`  Question: ${questions[0].question}`);
      console.log(`  Réponse correcte: ${correctAnswer}`);
    } else {
      log('❌ Aucune question disponible', 'red');
      return;
    }

    // Étape 4: Vérifier le score initial
    logStep(4, 'Vérifier le score initial du joueur');
    try {
      const scoreRes = await axios.get(`${BASE_URL}/game/score/${playerId}`);
      initialScore = scoreRes.data.score || 0;
      log(`Score initial: ${initialScore}`, 'yellow');
    } catch (err) {
      log(`Score initial: 0 (pas encore de score)`, 'yellow');
    }

    // Étape 5: Vérifier le leaderboard initial
    logStep(5, 'Vérifier le leaderboard initial');
    const leaderboardRes = await axios.get(`${BASE_URL}/game/leaderboard`);
    log(`Leaderboard:`, 'yellow');
    console.log(JSON.stringify(leaderboardRes.data, null, 2));

    // Étape 6: Envoyer une réponse (si le jeu est démarré)
    if (!isStarted) {
      log('⚠️ Le jeu n\'est pas démarré. Impossible de tester l\'envoi de réponse.', 'yellow');
      log('   Veuillez démarrer le jeu depuis le dashboard admin.', 'yellow');
      return;
    }

    logStep(6, 'Envoyer une réponse correcte');
    try {
      const answerRes = await axios.post(`${BASE_URL}/game/answer`, {
        playerId,
        questionId,
        answer: correctAnswer,
      });
      log('✅ Réponse envoyée avec succès', 'green');
      console.log(JSON.stringify(answerRes.data, null, 2));
    } catch (err) {
      if (err.response) {
        log(`❌ Erreur lors de l'envoi de la réponse: ${err.response.status}`, 'red');
        console.log(err.response.data);
      } else {
        log(`❌ Erreur: ${err.message}`, 'red');
      }
      return;
    }

    // Étape 7: Vérifier que la réponse a été sauvegardée
    logStep(7, 'Vérifier que la réponse a été sauvegardée dans gameState');
    const gameStateAfterRes = await axios.get(`${BASE_URL}/game/state`);
    const answers = gameStateAfterRes.data.answers || {};
    log(`Réponses dans gameState:`, 'yellow');
    console.log(JSON.stringify(answers, null, 2));
    
    if (answers[playerId] && answers[playerId][questionId]) {
      log(`✅ Réponse sauvegardée: "${answers[playerId][questionId]}"`, 'green');
    } else {
      log(`❌ Réponse non trouvée dans gameState!`, 'red');
      log(`   PlayerId: ${playerId}`, 'red');
      log(`   QuestionId: ${questionId}`, 'red');
      return;
    }

    // Étape 8: Vérifier le score après réponse (devrait toujours être 0)
    logStep(8, 'Vérifier le score après réponse (avant calcul)');
    try {
      const scoreAfterRes = await axios.get(`${BASE_URL}/game/score/${playerId}`);
      scoreAfterAnswer = scoreAfterRes.data.score || 0;
      log(`Score après réponse: ${scoreAfterAnswer}`, 'yellow');
      log(`Attendu: 0 (le score n'est pas encore calculé)`, 'yellow');
    } catch (err) {
      log(`Score après réponse: 0 (pas encore de score)`, 'yellow');
    }

    // Étape 9: Simuler le calcul des résultats
    logStep(9, 'Déclencher le calcul des résultats (nextQuestion)');
    log('⚠️ Note: Cette étape nécessite que le jeu soit démarré et qu\'une question soit active', 'yellow');
    try {
      const nextRes = await axios.post(`${BASE_URL}/game/next`, {});
      log('✅ nextQuestion appelé avec succès', 'green');
      console.log(JSON.stringify(nextRes.data, null, 2));
    } catch (err) {
      if (err.response) {
        log(`⚠️ Erreur lors de nextQuestion: ${err.response.status}`, 'yellow');
        console.log(err.response.data);
        log('   Cela peut être normal si c\'est la dernière question', 'yellow');
      } else {
        log(`❌ Erreur: ${err.message}`, 'red');
      }
    }

    // Attendre un peu pour que le calcul soit terminé
    log('\n⏳ Attente de 3 secondes pour que le calcul soit terminé...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Étape 10: Vérifier le score après calcul
    logStep(10, 'Vérifier le score après calcul');
    try {
      const scoreAfterCalcRes = await axios.get(`${BASE_URL}/game/score/${playerId}`);
      scoreAfterCalculation = scoreAfterCalcRes.data.score || 0;
      log(`Score après calcul: ${scoreAfterCalculation}`, scoreAfterCalculation > 0 ? 'green' : 'red');
      
      if (scoreAfterCalculation > 0) {
        log(`✅ Le score a été mis à jour correctement!`, 'green');
        log(`   ${initialScore} → ${scoreAfterCalculation} (+${scoreAfterCalculation - initialScore})`, 'green');
      } else {
        log(`❌ Le score est toujours à 0. Le calcul n'a pas fonctionné.`, 'red');
      }
    } catch (err) {
      log(`❌ Erreur lors de la récupération du score: ${err.message}`, 'red');
    }

    // Étape 11: Vérifier le leaderboard final
    logStep(11, 'Vérifier le leaderboard final');
    const finalLeaderboardRes = await axios.get(`${BASE_URL}/game/leaderboard`);
    log(`Leaderboard final:`, 'yellow');
    console.log(JSON.stringify(finalLeaderboardRes.data, null, 2));

    // Résumé
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 RÉSUMÉ', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Joueur: ${playerName} (${playerId})`, 'yellow');
    log(`Question: ${questionId}`, 'yellow');
    log(`Réponse correcte: ${correctAnswer}`, 'yellow');
    log(`Score initial: ${initialScore}`, 'yellow');
    log(`Score après réponse: ${scoreAfterAnswer}`, 'yellow');
    log(`Score après calcul: ${scoreAfterCalculation}`, scoreAfterCalculation > 0 ? 'green' : 'red');
    
    if (scoreAfterCalculation > 0) {
      log('\n✅ Le système de comptage de points fonctionne correctement!', 'green');
    } else {
      log('\n❌ Le système de comptage de points ne fonctionne pas correctement', 'red');
      log('\nPoints à vérifier:', 'yellow');
      log('1. Le jeu est-il démarré ? (isStarted: true)', 'yellow');
      log('2. La réponse a-t-elle été sauvegardée dans gameState.answers ?', 'yellow');
      log('3. calculateQuestionResults() est-elle appelée ?', 'yellow');
      log('4. updateScore() est-elle appelée avec le bon delta ?', 'yellow');
      log('5. Le score est-il bien sauvegardé dans MongoDB ?', 'yellow');
      log('6. Vérifier les logs du service game-service', 'yellow');
    }

  } catch (err) {
    log(`\n❌ Erreur fatale: ${err.message}`, 'red');
    if (err.response) {
      log(`Status: ${err.response.status}`, 'red');
      console.log(err.response.data);
    }
    console.error(err);
  }
}

// Exécuter le test
testAPI();





