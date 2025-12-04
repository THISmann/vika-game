require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { io } = require('socket.io-client');

// Configuration des URLs des services
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';
const GAME_WS_URL = process.env.GAME_WS_URL || process.env.GAME_SERVICE_URL || 'http://localhost:3003';

// Détecter si on est en production (Kubernetes)
const isProduction = process.env.NODE_ENV === 'production' || process.env.KUBERNETES_SERVICE_HOST;

// Configuration WebSocket selon l'environnement
let wsUrl = GAME_WS_URL;
if (isProduction) {
  // En production, utiliser le chemin /socket.io via le proxy
  wsUrl = GAME_WS_URL.replace(/\/$/, ''); // Enlever le slash final si présent
  console.log('🌐 Production mode - WebSocket URL:', wsUrl);
} else {
  console.log('🏠 Development mode - WebSocket URL:', wsUrl);
}

// WebSocket connection pour les événements temps réel
const gameSocket = io(wsUrl, {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
  timeout: 30000,
  autoConnect: true,
  forceNew: false
});

// Get token from environment variable (from GitHub Secrets in production)
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN is required!');
  console.error('   Set it as an environment variable or in .env file');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Store user sessions: chatId -> { gameCode, playerId, playerName, currentQuestionIndex, questions, gameStarted, hasAnsweredCurrentQuestion }
const userSessions = new Map();

// Helper: Construire l'URL complète pour les appels API
function getApiUrl(endpoint) {
  if (isProduction && endpoint.startsWith('/api/')) {
    // En production, utiliser les chemins relatifs (via Nginx proxy)
    return endpoint;
  }
  // En développement, utiliser les URLs complètes
  if (endpoint.startsWith('/auth/')) {
    return `${AUTH_SERVICE_URL}${endpoint}`;
  }
  if (endpoint.startsWith('/quiz/')) {
    return `${QUIZ_SERVICE_URL}${endpoint}`;
  }
  if (endpoint.startsWith('/game/')) {
    return `${GAME_SERVICE_URL}${endpoint}`;
  }
  return endpoint;
}

// Helper: Vérifier le code du jeu
async function verifyGameCode(gameCode) {
  try {
    const url = getApiUrl('/game/verify-code');
    const res = await axios.post(url, { gameCode });
    return res.data;
  } catch (err) {
    console.error('Error verifying game code:', err.message);
    return null;
  }
}

// Helper: S'inscrire comme joueur
async function registerPlayer(name) {
  try {
    const url = getApiUrl('/auth/players/register');
    const res = await axios.post(url, { name: name.trim() });
    return res.data;
  } catch (err) {
    if (err.response?.status === 409) {
      throw new Error('Ce nom est déjà pris. Choisissez un autre nom.');
    }
    throw new Error('Erreur lors de l\'inscription. Veuillez réessayer.');
  }
}

// Helper: Soumettre une réponse
async function submitAnswer(playerId, questionId, answer) {
  try {
    const url = getApiUrl('/game/answer');
    const res = await axios.post(url, {
      playerId,
      questionId,
      answer
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Erreur lors de l\'envoi de la réponse');
  }
}

// Helper: Obtenir le classement
async function getLeaderboard() {
  try {
    const url = getApiUrl('/game/leaderboard');
    const res = await axios.get(url);
    return res.data || [];
  } catch (err) {
    console.error('Error getting leaderboard:', err.message);
    return [];
  }
}

// Helper: Obtenir l'état du jeu
async function getGameState() {
  try {
    const url = getApiUrl('/game/state');
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    console.error('Error getting game state:', err.message);
    return null;
  }
}

// Helper: Obtenir toutes les questions
async function getAllQuestions() {
  try {
    const url = getApiUrl('/quiz/full');
    const res = await axios.get(url);
    return res.data || [];
  } catch (err) {
    console.error('Error getting questions:', err.message);
    return [];
  }
}

// Helper: Envoyer une question au joueur
async function sendQuestion(chatId, question, questionIndex, totalQuestions, duration) {
  if (!question) {
    return bot.sendMessage(chatId, '❌ Aucune question disponible.');
  }

  const header = `📝 *Question ${questionIndex + 1}/${totalQuestions}*\n\n${question.question}\n\n⏱ ${duration}s pour répondre\n\nChoisissez votre réponse :`;

  const keyboard = {
    inline_keyboard: question.choices.map((choice, i) => [
      {
        text: `${String.fromCharCode(65 + i)}. ${choice}`,
        callback_data: `answer_${question.id}_${i}`
      }
    ])
  };

  await bot.sendMessage(chatId, header, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

// Helper: Envoyer le classement final
async function sendFinalLeaderboard(chatId, session) {
  try {
    const leaderboard = await getLeaderboard();
    const playerEntry = leaderboard.find(entry => entry.playerId === session.playerId);
    const finalScore = playerEntry ? playerEntry.score : 0;
    const position = playerEntry ? leaderboard.findIndex(entry => entry.playerId === session.playerId) + 1 : null;

    let message = `🏁 *Fin de la partie !*\n\n`;
    message += `🎮 Code: *${session.gameCode}*\n`;
    message += `👤 Joueur: *${session.playerName}*\n`;
    message += `🎯 Score final: *${finalScore} points*\n`;
    if (position) {
      message += `🏅 Position: *#${position}*\n`;
    }

    if (leaderboard.length > 0) {
      message += `\n🔝 *Classement final :*\n\n`;
      leaderboard.slice(0, 10).forEach((entry, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
        const marker = entry.playerId === session.playerId ? '👉' : '';
        message += `${marker} ${medal} ${entry.playerName || 'Joueur anonyme'} - ${entry.score} pts\n`;
      });
    } else {
      message += `\nℹ️ Le classement n'est pas encore disponible.`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Error sending final leaderboard:', err.message);
    await bot.sendMessage(chatId, '🎉 Partie terminée ! Utilisez /status pour voir votre score.');
  }
}

// ==================== COMMANDES BOT ====================

// Commande /start - Demander le code du jeu
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Réinitialiser la session
  userSessions.delete(chatId);
  
  const welcomeMessage = `🎮 *Bienvenue sur IntelectGame Bot !*\n\nPour commencer, j'ai besoin du code de la partie.\n\n📝 *Envoyez-moi le code du jeu* (6 caractères)\n\nExemple: \`ABC123\``;
  
  await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📖 Aide', callback_data: 'help' }]
      ]
    }
  });
});

// Commande /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `📖 *Aide IntelectGame Bot*\n\n1️⃣ Envoyez le code de la partie (6 caractères)\n2️⃣ Inscrivez-vous avec votre nom\n3️⃣ Attendez que l'admin démarre la partie\n4️⃣ Répondez aux questions avec les boutons\n5️⃣ Consultez le classement à la fin\n\n*Commandes disponibles:*\n/start - Recommencer\n/status - Voir votre statut\n/help - Afficher cette aide`;
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Commande /status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions.get(chatId);

  if (!session || !session.gameCode) {
    return bot.sendMessage(chatId, '❌ Aucune partie active.\n\nUtilisez /start pour commencer.');
  }

  let statusMessage = `📊 *Votre statut :*\n\n`;
  statusMessage += `🎮 Code partie: *${session.gameCode}*\n`;
  
  if (session.playerName) {
    statusMessage += `👤 Nom: *${session.playerName}*\n`;
  } else {
    statusMessage += `👤 Nom: Non enregistré\n`;
  }

  if (session.gameStarted) {
    statusMessage += `🟢 Statut: *En cours*\n`;
    if (session.questions && session.questions.length > 0) {
      statusMessage += `📝 Question: ${(session.currentQuestionIndex || 0) + 1}/${session.questions.length}\n`;
    }
  } else {
    statusMessage += `🟡 Statut: *En attente*\n`;
    statusMessage += `⏳ Attendez que l'admin démarre la partie...\n`;
  }

  bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
});

// Gestion des messages texte (code du jeu ou nom du joueur)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Ignorer les commandes
  if (text?.startsWith('/')) {
    return;
  }

  const session = userSessions.get(chatId) || {};

  // Si pas de code de jeu, traiter comme code
  if (!session.gameCode) {
    if (!text || text.length !== 6) {
      return bot.sendMessage(chatId, '❌ Le code doit contenir exactement 6 caractères.\n\nExemple: \`ABC123\`', {
        parse_mode: 'Markdown'
      });
    }

    const gameCode = text.toUpperCase();
    const verification = await verifyGameCode(gameCode);

    if (!verification || !verification.valid) {
      return bot.sendMessage(chatId, '❌ Code invalide. Vérifiez le code et réessayez.');
    }

    if (verification.isStarted) {
      return bot.sendMessage(chatId, '⚠️ Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.');
    }

    // Code valide, sauvegarder dans la session
    session.gameCode = gameCode;
    session.gameStarted = false;
    userSessions.set(chatId, session);

    const keyboard = {
      inline_keyboard: [
        [{ text: '📝 S\'inscrire maintenant', callback_data: 'register_prompt' }],
        [{ text: '📊 Statut', callback_data: 'status' }]
      ]
    };

    await bot.sendMessage(chatId, `✅ *Code accepté !*\n\n🎮 Partie: *${gameCode}*\n\n⏳ La partie n'a pas encore démarré.\n\n📝 *Envoyez-moi votre nom* pour vous inscrire.\n\nExemple: \`Jean\` ou \`Marie\``, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    return;
  }

  // Si code existe mais pas de joueur, traiter comme nom
  if (!session.playerId) {
    if (!text || text.length < 2) {
      return bot.sendMessage(chatId, '❌ Le nom doit contenir au moins 2 caractères.');
    }

    try {
      const playerData = await registerPlayer(text);
      session.playerId = playerData.id;
      session.playerName = playerData.name;
      session.gameStarted = false;
      session.currentQuestionIndex = null;
      session.questions = [];
      session.hasAnsweredCurrentQuestion = false;
      userSessions.set(chatId, session);

      // Enregistrer le joueur via WebSocket
      if (gameSocket.connected) {
        gameSocket.emit('register', session.playerId);
        console.log(`✅ Player ${session.playerName} (${session.playerId}) registered via WebSocket`);
      }

      await bot.sendMessage(chatId, `✅ *Inscription réussie !*\n\n👤 Nom: *${session.playerName}*\n🎮 Partie: *${session.gameCode}*\n\n⏳ *Attendez que l'admin démarre la partie...*\n\nJe vous enverrai les questions automatiquement dès que la partie commencera ! 🚀`, {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      await bot.sendMessage(chatId, `❌ ${err.message}`);
    }
    return;
  }

  // Si tout est configuré, ignorer les messages texte
  await bot.sendMessage(chatId, 'ℹ️ Utilisez les boutons pour répondre aux questions.\n\n/status - Voir votre statut');
});

// Gestion des callback queries (boutons)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const messageId = query.message.message_id;

  // Acknowledge callback
  await bot.answerCallbackQuery(query.id);

  // Help button
  if (data === 'help') {
    return bot.sendMessage(chatId, `📖 *Aide IntelectGame Bot*\n\n1️⃣ Envoyez le code de la partie\n2️⃣ Inscrivez-vous avec votre nom\n3️⃣ Attendez que l'admin démarre la partie\n4️⃣ Répondez aux questions avec les boutons\n5️⃣ Consultez le classement à la fin`, {
      parse_mode: 'Markdown'
    });
  }

  // Status button
  if (data === 'status') {
    const session = userSessions.get(chatId);
    if (!session || !session.gameCode) {
      return bot.sendMessage(chatId, '❌ Aucune partie active. Utilisez /start pour commencer.');
    }
    let statusMessage = `📊 *Votre statut :*\n\n🎮 Code: *${session.gameCode}*\n`;
    if (session.playerName) {
      statusMessage += `👤 Nom: *${session.playerName}*\n`;
    }
    statusMessage += session.gameStarted ? '🟢 *En cours*' : '🟡 *En attente*';
    return bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  }

  // Register prompt
  if (data === 'register_prompt') {
    return bot.sendMessage(chatId, '📝 *Pour vous inscrire, envoyez-moi votre nom*\n\nExemple: \`Jean\` ou \`Marie\`\n\nLe nom doit contenir au moins 2 caractères.', {
      parse_mode: 'Markdown'
    });
  }

  // Answer button: answer_<questionId>_<choiceIndex>
  if (data.startsWith('answer_')) {
    const session = userSessions.get(chatId);
    if (!session || !session.playerId || !session.gameStarted) {
      return bot.sendMessage(chatId, '❌ Vous devez être inscrit et la partie doit être démarrée.');
    }

    if (session.hasAnsweredCurrentQuestion) {
      return bot.answerCallbackQuery(query.id, {
        text: 'Vous avez déjà répondu à cette question',
        show_alert: false
      });
    }

    const parts = data.split('_');
    const questionId = parts[1];
    const choiceIndex = parseInt(parts[2]);

    const currentQuestion = session.questions?.find(q => q.id === questionId);
    if (!currentQuestion) {
      return bot.sendMessage(chatId, '❌ Question introuvable.');
    }

    const selectedChoice = currentQuestion.choices[choiceIndex];
    if (!selectedChoice) {
      return bot.sendMessage(chatId, '❌ Choix invalide.');
    }

    try {
      const result = await submitAnswer(session.playerId, questionId, selectedChoice);
      
      session.hasAnsweredCurrentQuestion = true;
      userSessions.set(chatId, session);

      // Mettre à jour le message pour montrer la réponse sélectionnée
      const disabledKeyboard = {
        inline_keyboard: currentQuestion.choices.map((choice, i) => [
          {
            text: `${String.fromCharCode(65 + i)}. ${choice}${i === choiceIndex ? ' ✅' : ''}`,
            callback_data: `answered_${questionId}_${i}`
          }
        ])
      };

      try {
        const editText = query.message.text + '\n\n✅ Réponse enregistrée !';
        await bot.editMessageText(editText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: disabledKeyboard
        });
      } catch (editErr) {
        // Ignorer les erreurs d'édition
      }

      await bot.sendMessage(chatId, '✅ *Réponse enregistrée !*\n\n⏳ En attente de la question suivante...', {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      await bot.sendMessage(chatId, `❌ ${err.message}`);
    }
  }
});

// ==================== WEBSOCKET EVENTS ====================

// Connexion WebSocket
gameSocket.on('connect', () => {
  console.log('✅ Telegram bot connected to game WebSocket');
  
  // Réenregistrer tous les joueurs actifs
  for (const [chatId, session] of userSessions.entries()) {
    if (session.playerId) {
      gameSocket.emit('register', session.playerId);
      console.log(`🔄 Re-registered player ${session.playerName} (${session.playerId})`);
    }
  }
});

gameSocket.on('disconnect', (reason) => {
  console.log('⚠️ Telegram bot disconnected from WebSocket. Reason:', reason);
});

gameSocket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error.message);
});

// Événement: Jeu démarré
gameSocket.on('game:started', async (data) => {
  console.log('🚀 Game started event received:', data);
  
  // Mettre à jour toutes les sessions pour ce code
  for (const [chatId, session] of userSessions.entries()) {
    if (session.playerId && !session.gameStarted) {
      session.gameStarted = true;
      session.hasAnsweredCurrentQuestion = false;
      userSessions.set(chatId, session);
      
      await bot.sendMessage(chatId, `🚀 *La partie a commencé !*\n\n⏳ La première question arrive bientôt...`, {
        parse_mode: 'Markdown'
      });
    }
  }
});

// Événement: Nouvelle question
gameSocket.on('question:next', async (data) => {
  console.log('📝 Question next event received:', data);
  
  const { question, questionIndex, totalQuestions, startTime, duration } = data;
  
  if (!question || !question.id) {
    console.error('Invalid question data:', data);
    return;
  }

  // Charger toutes les questions si nécessaire
  const allQuestions = await getAllQuestions();
  
  // Trouver la question complète
  const fullQuestion = allQuestions.find(q => q.id === question.id);
  if (!fullQuestion) {
    console.error('Question not found:', question.id);
    return;
  }

  // Mettre à jour toutes les sessions actives
  for (const [chatId, session] of userSessions.entries()) {
    if (session.playerId && session.gameStarted) {
      // Charger les questions si pas encore chargées
      if (!session.questions || session.questions.length === 0) {
        session.questions = allQuestions;
      }
      
      session.currentQuestionIndex = questionIndex;
      session.hasAnsweredCurrentQuestion = false;
      userSessions.set(chatId, session);
      
      // Envoyer la question
      await sendQuestion(chatId, fullQuestion, questionIndex, totalQuestions, duration / 1000);
    }
  }
});

// Événement: Jeu terminé
gameSocket.on('game:ended', async (data) => {
  console.log('🏁 Game ended event received:', data);
  
  for (const [chatId, session] of userSessions.entries()) {
    if (session.playerId && session.gameStarted) {
      session.gameStarted = false;
      userSessions.set(chatId, session);
      
      // Envoyer le classement final
      await sendFinalLeaderboard(chatId, session);
    }
  }
});

// Événement: Mise à jour du classement
gameSocket.on('leaderboard:update', async (leaderboard) => {
  console.log('📊 Leaderboard update received:', leaderboard.length, 'players');
  
  // Optionnel: Envoyer des mises à jour périodiques du classement
  // Pour l'instant, on ne fait rien (le classement final sera envoyé à la fin)
});

// Polling pour vérifier l'état du jeu (fallback si WebSocket échoue)
setInterval(async () => {
  for (const [chatId, session] of userSessions.entries()) {
    if (!session.playerId || session.gameStarted) {
      continue; // Skip si pas de joueur ou jeu déjà démarré (WebSocket gère)
    }
    
    try {
      const gameState = await getGameState();
      if (gameState && gameState.isStarted && !session.gameStarted) {
        session.gameStarted = true;
        userSessions.set(chatId, session);
        await bot.sendMessage(chatId, `🚀 *La partie a commencé !*\n\n⏳ Les questions arrivent bientôt...`, {
          parse_mode: 'Markdown'
        });
      }
    } catch (err) {
      // Ignorer les erreurs de polling
    }
  }
}, 5000); // Vérifier toutes les 5 secondes

console.log('🤖 Telegram bot is running...');
console.log(`📡 WebSocket URL: ${wsUrl}`);
console.log(`🔗 Auth Service: ${AUTH_SERVICE_URL}`);
console.log(`🔗 Quiz Service: ${QUIZ_SERVICE_URL}`);
console.log(`🔗 Game Service: ${GAME_SERVICE_URL}`);
