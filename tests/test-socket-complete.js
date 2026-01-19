#!/usr/bin/env node
/**
 * Script de test complet pour les WebSockets Socket.io
 * Teste tout le flux : création de joueur, connexion, enregistrement, etc.
 * 
 * Usage:
 *   node test-socket-complete.js
 * 
 * Variables d'environnement:
 *   GAME_SERVICE_URL - URL du game-service (défaut: http://localhost:3003)
 *   AUTH_SERVICE_URL - URL du auth-service (défaut: http://localhost:3001)
 */

const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

// Fonction pour attendre un événement avec timeout
function waitForEvent(socket, eventName, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, handler);
      reject(new Error(`Timeout waiting for ${eventName}`));
    }, timeout);

    const handler = (data) => {
      clearTimeout(timer);
      socket.off(eventName, handler);
      resolve(data);
    };

    socket.once(eventName, handler);
  });
}

async function testCompleteFlow() {
  console.log('🧪 ========== TEST COMPLET WEBSOCKET ==========');
  console.log(`🔌 Game Service: ${GAME_SERVICE_URL}`);
  console.log(`🔐 Auth Service: ${AUTH_SERVICE_URL}`);
  console.log('==============================================\n');

  let playerId;
  let playerName;

  try {
    // ========== ÉTAPE 1 : Créer un joueur ==========
    console.log('1️⃣ Creating player via API...');
    try {
      const res = await axios.post(`${AUTH_SERVICE_URL}/auth/players/register`, {
        name: `Test Player ${Date.now()}`
      });
      playerId = res.data.id;
      playerName = res.data.name;
      console.log(`✅ Player created: ${playerId} (${playerName})`);
    } catch (err) {
      if (err.response) {
        console.error('❌ Error creating player:', err.response.status, err.response.data);
      } else {
        console.error('❌ Error creating player:', err.message);
      }
      throw err;
    }

    // ========== ÉTAPE 2 : Se connecter au WebSocket ==========
    console.log('\n2️⃣ Connecting to WebSocket...');
    const socket = io(GAME_SERVICE_URL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      forceNew: false,
      autoConnect: true,
      timeout: 20000
    });

    // Attendre la connexion
    try {
      await waitForEvent(socket, 'connect', 10000);
      console.log(`✅ Connected! Socket ID: ${socket.id}`);
    } catch (err) {
      console.error('❌ Connection timeout:', err.message);
      throw err;
    }

    // Écouter les erreurs de connexion
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });

    // ========== ÉTAPE 3 : Enregistrer le joueur ==========
    console.log('\n3️⃣ Registering player on WebSocket...');
    socket.emit('register', playerId);

    // Attendre la confirmation (game:code ou error)
    try {
      const gameCodeData = await waitForEvent(socket, 'game:code', 5000);
      console.log(`✅ Game code received: ${gameCodeData.gameCode}`);
    } catch (err) {
      console.warn('⚠️ No game:code event received (might be normal)');
    }

    // Attendre un peu pour que l'enregistrement soit traité
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ========== ÉTAPE 4 : Vérifier les joueurs connectés ==========
    console.log('\n4️⃣ Checking connected players...');
    try {
      const res = await axios.get(`${GAME_SERVICE_URL}/game/players`);
      console.log(`✅ Connected players: ${res.data.count}`);
      if (res.data.players && res.data.players.length > 0) {
        console.log('Players:');
        res.data.players.forEach((p, index) => {
          const marker = p.id === playerId ? '👉' : '  ';
          console.log(`${marker} ${index + 1}. ${p.name} (${p.id})`);
        });
      } else {
        console.log('No players found');
      }
    } catch (err) {
      if (err.response) {
        console.error('❌ Error getting players:', err.response.status, err.response.data);
      } else {
        console.error('❌ Error getting players:', err.message);
      }
    }

    // ========== ÉTAPE 5 : Écouter les événements du jeu ==========
    console.log('\n5️⃣ Setting up event listeners...');
    
    socket.on('game:started', (data) => {
      console.log('\n🎮 ========== GAME STARTED ==========');
      console.log('Question Index:', data.questionIndex);
      console.log('Total Questions:', data.totalQuestions);
      console.log('Game Code:', data.gameCode);
      console.log('====================================\n');
    });

    socket.on('question:next', (data) => {
      console.log('\n❓ ========== QUESTION NEXT ==========');
      console.log('Question:', data.question?.question);
      console.log('Choices:', data.question?.choices);
      console.log('Index:', data.questionIndex, '/', data.totalQuestions);
      console.log('Duration:', data.duration, 'ms');
      console.log('====================================\n');
    });

    socket.on('players:count', (data) => {
      console.log(`📊 Players count updated: ${data.count}`);
    });

    socket.on('game:ended', (data) => {
      console.log('\n🏁 ========== GAME ENDED ==========');
      console.log('Message:', data.message);
      console.log('==================================\n');
    });

    socket.on('leaderboard:update', (data) => {
      console.log(`📊 Leaderboard updated: ${data.length} players`);
    });

    socket.on('error', (error) => {
      console.error('\n❌ ========== SOCKET ERROR ==========');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('====================================\n');
    });

    console.log('✅ Event listeners set up');
    console.log('\n✅ ========== TEST SETUP COMPLETE ==========');
    console.log('Waiting for game events...');
    console.log('Press Ctrl+C to exit\n');

    // ========== GESTION DE LA FERMETURE ==========
    process.on('SIGINT', () => {
      console.log('\n👋 Disconnecting...');
      socket.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n👋 Disconnecting...');
      socket.disconnect();
      process.exit(0);
    });

    // Garder le processus actif
    setInterval(() => {
      if (socket.connected) {
        console.log(`💓 Heartbeat - Connected: ${socket.id}`);
      } else {
        console.log('💓 Heartbeat - Disconnected');
      }
    }, 30000);

  } catch (error) {
    console.error('\n❌ ========== TEST FAILED ==========');
    console.error('Error:', error.message);
    console.error('==================================\n');
    process.exit(1);
  }
}

// Exécuter le test
testCompleteFlow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

