#!/usr/bin/env node
/**
 * Script de test pour les WebSockets Socket.io
 * 
 * Usage:
 *   node test-websocket.js [playerId]
 * 
 * Exemple:
 *   node test-websocket.js player-123
 *   GAME_SERVICE_URL=http://localhost:3003 node test-websocket.js player-123
 */

const io = require('socket.io-client');

// Configuration
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';
const playerId = process.argv[2] || `test-player-${Date.now()}`;

console.log('🧪 ========== TEST WEBSOCKET SOCKET.IO ==========');
console.log(`🔌 URL: ${GAME_SERVICE_URL}`);
console.log(`👤 Player ID: ${playerId}`);
console.log('================================================\n');

// Créer la connexion Socket.io
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

// ========== ÉVÉNEMENTS DE CONNEXION ==========

socket.on('connect', () => {
  console.log('✅ ========== CONNECTED ==========');
  console.log(`Socket ID: ${socket.id}`);
  console.log(`Transport: ${socket.io.engine.transport.name}`);
  console.log('==================================\n');
  
  // Enregistrer le joueur
  console.log(`📝 Registering player: ${playerId}`);
  socket.emit('register', playerId);
});

socket.on('connect_error', (error) => {
  console.error('❌ ========== CONNECTION ERROR ==========');
  console.error('Error:', error.message);
  console.error('Type:', error.type);
  console.error('========================================\n');
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ ========== DISCONNECTED ==========');
  console.warn('Reason:', reason);
  console.warn('====================================\n');
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
  // Réenregistrer le joueur après reconnexion
  socket.emit('register', playerId);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`🔄 Reconnection attempt #${attemptNumber}...`);
});

socket.on('reconnect_error', (error) => {
  console.error('❌ Reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed after all attempts');
});

// ========== ÉVÉNEMENTS DU JEU ==========

socket.on('game:code', (data) => {
  console.log('🎯 ========== GAME CODE ==========');
  console.log('Game Code:', data.gameCode);
  console.log('================================\n');
});

socket.on('game:started', (data) => {
  console.log('\n🎮 ========== GAME STARTED ==========');
  console.log('Question Index:', data.questionIndex);
  console.log('Total Questions:', data.totalQuestions);
  console.log('Game Code:', data.gameCode);
  console.log('====================================\n');
});

socket.on('question:next', (data) => {
  console.log('\n❓ ========== QUESTION NEXT ==========');
  console.log('Question ID:', data.question?.id);
  console.log('Question:', data.question?.question);
  console.log('Choices:', data.question?.choices);
  console.log('Question Index:', data.questionIndex);
  console.log('Total Questions:', data.totalQuestions);
  console.log('Start Time:', new Date(data.startTime).toISOString());
  console.log('Duration:', data.duration, 'ms');
  console.log('====================================\n');
});

socket.on('players:count', (data) => {
  console.log(`📊 Players count: ${data.count}`);
});

socket.on('game:ended', (data) => {
  console.log('\n🏁 ========== GAME ENDED ==========');
  console.log('Message:', data.message);
  if (data.leaderboard) {
    console.log('Leaderboard:', JSON.stringify(data.leaderboard, null, 2));
  }
  console.log('==================================\n');
});

socket.on('leaderboard:update', (data) => {
  console.log('\n📊 ========== LEADERBOARD UPDATE ==========');
  console.log('Players:', data.length);
  data.slice(0, 5).forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.playerName}: ${entry.score}`);
  });
  console.log('==========================================\n');
});

socket.on('error', (error) => {
  console.error('\n❌ ========== SOCKET ERROR ==========');
  console.error('Code:', error.code);
  console.error('Message:', error.message);
  console.error('Full error:', JSON.stringify(error, null, 2));
  console.error('====================================\n');
});

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

// ========== MESSAGE D'ATTENTE ==========

console.log('⏳ Waiting for events...');
console.log('Press Ctrl+C to exit\n');

// Garder le processus actif
setInterval(() => {
  if (socket.connected) {
    console.log(`💓 Heartbeat - Connected: ${socket.id}`);
  } else {
    console.log('💓 Heartbeat - Disconnected');
  }
}, 30000); // Toutes les 30 secondes

