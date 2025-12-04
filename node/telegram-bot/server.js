require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { io } = require('socket.io-client');
const { t, getAvailableLanguages } = require('./translations');

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
  wsUrl = GAME_WS_URL.replace(/\/$/, '');
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

// Store user sessions: chatId -> { language, gameCode, playerId, playerName, currentQuestionIndex, questions, gameStarted, hasAnsweredCurrentQuestion }
const userSessions = new Map();

// Get token from environment variable (from GitHub Secrets in production)
let token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN is required!');
  console.error('   Set it as an environment variable or in .env file');
  process.exit(1);
}

// Nettoyer le token (supprimer les espaces, retours à la ligne, etc.)
token = token.trim().replace(/[\r\n]/g, '');

// Vérifier que le token a le bon format (doit contenir un ':')
if (!token.includes(':')) {
  console.error('❌ TELEGRAM_BOT_TOKEN format invalide!');
  console.error('   Le token doit être au format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
  console.error(`   Token reçu (longueur: ${token.length}): ${token.substring(0, 20)}...`);
  process.exit(1);
}

// Vérifier le format exact (nombre:chaîne)
const tokenParts = token.split(':');
if (tokenParts.length !== 2 || !/^\d+$/.test(tokenParts[0]) || tokenParts[1].length < 10) {
  console.error('❌ TELEGRAM_BOT_TOKEN format invalide!');
  console.error('   Format attendu: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
  console.error(`   Token reçu: ${tokenParts[0]}:${tokenParts[1].substring(0, 10)}...`);
  process.exit(1);
}

// Logger le début du token pour debug (sans exposer le token complet)
const tokenPrefix = tokenParts[0];
const tokenLength = token.length;
console.log(`🔐 Telegram Bot Token configuré (ID: ${tokenPrefix}..., longueur: ${tokenLength})`);

// Tester le token avant de créer le bot
async function testToken() {
  try {
    const testUrl = `https://api.telegram.org/bot${token}/getMe`;
    console.log('🧪 Test du token avec l\'API Telegram...');
    const response = await axios.get(testUrl, { timeout: 10000 });
    
    if (response.data && response.data.ok) {
      const botInfo = response.data.result;
      console.log(`✅ Token valide! Bot: @${botInfo.username} (${botInfo.first_name})`);
      return true;
    } else {
      console.error('❌ Token invalide. Réponse API:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test du token:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data));
      if (error.response.status === 401) {
        console.error('   ⚠️  Le token est invalide ou a été révoqué');
      } else if (error.response.status === 404) {
        console.error('   ⚠️  Le bot n\'existe plus ou le token est incorrect');
      }
    }
    return false;
  }
}

// Helper: Construire l'URL complète pour les appels API
function getApiUrl(endpoint) {
  if (isProduction && endpoint.startsWith('/api/')) {
    return endpoint;
  }
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
    console.log(`🔍 Vérification du code "${gameCode}" via ${url}`);
    
    // Envoyer à la fois 'code' et 'gameCode' pour compatibilité
    const res = await axios.post(url, { 
      gameCode: gameCode.trim().toUpperCase(),
      code: gameCode.trim().toUpperCase()
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`🔍 Réponse de vérification:`, JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    console.error('❌ Error verifying game code:', err.message);
    if (err.response) {
      console.error('   Status:', err.response.status);
      console.error('   Data:', err.response.data);
    }
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
async function sendQuestion(bot, chatId, question, questionIndex, totalQuestions, duration, lang = 'en') {
  if (!question) {
    return bot.sendMessage(chatId, t(lang, 'noQuestions'), { parse_mode: 'Markdown' });
  }

  const header = t(lang, 'questionHeader', {
    current: questionIndex + 1,
    total: totalQuestions,
    question: question.question,
    duration: duration
  });

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
async function sendFinalLeaderboard(bot, chatId, session) {
  try {
    const lang = session.language || 'en';
    const leaderboard = await getLeaderboard();
    const playerEntry = leaderboard.find(entry => entry.playerId === session.playerId);
    const finalScore = playerEntry ? playerEntry.score : 0;
    const position = playerEntry ? leaderboard.findIndex(entry => entry.playerId === session.playerId) + 1 : null;

    let message = t(lang, 'gameEnded');
    message += t(lang, 'statusGameCode', { gameCode: session.gameCode });
    message += t(lang, 'statusName', { name: session.playerName });
    message += t(lang, 'finalScore', { score: finalScore });
    if (position) {
      message += t(lang, 'position', { position });
    }

    if (leaderboard.length > 0) {
      message += `\n${t(lang, 'leaderboardHeader')}`;
      leaderboard.slice(0, 10).forEach((entry, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
        const marker = entry.playerId === session.playerId ? '👉' : '';
        message += `${marker} ${t(lang, 'leaderboardEntry', {
          medal,
          name: entry.playerName || (lang === 'ru' ? 'Анонимный игрок' : 'Anonymous player'),
          score: entry.score
        })}`;
      });
    } else {
      message += `\n${t(lang, 'leaderboardUnavailable')}`;
    }

    // Ajouter le bouton pour une nouvelle partie
    const keyboard = {
      inline_keyboard: [
        [{ text: t(lang, 'newGameButton'), callback_data: 'new_game' }]
      ]
    };

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (err) {
    console.error('Error sending final leaderboard:', err.message);
    const lang = session.language || 'en';
    await bot.sendMessage(chatId, t(lang, 'leaderboardError'), { parse_mode: 'Markdown' });
  }
}

  // Fonction principale pour initialiser le bot
async function initializeBot() {
  // Créer le bot avec polling désactivé au démarrage
  // On l'activera manuellement après avoir enregistré tous les handlers
  const bot = new TelegramBot(token, { 
    polling: false  // Désactiver le polling automatique
  });
  
  console.log('🤖 Bot créé, enregistrement des handlers...');

  // Gestion des erreurs de polling
  bot.on('polling_error', (error) => {
    console.error('❌ Erreur de polling Telegram:', error.message);
    
    if (error.code === 'ETELEGRAM' && error.message.includes('404')) {
      console.error('⚠️  Le token Telegram semble invalide ou le bot a été supprimé.');
      console.error('   Vérifiez que:');
      console.error('   1. Le token est correct dans le secret Kubernetes');
      console.error('   2. Le bot existe toujours sur Telegram (@BotFather)');
      console.error('   3. Le token n\'a pas expiré');
    } else if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
      console.error('⚠️  Erreur 409: Une autre instance du bot tourne déjà.');
      console.error('   Solution: Vérifiez qu\'il n\'y a qu\'un seul pod telegram-bot en cours d\'exécution.');
      console.error('   Commande: kubectl get pods -n intelectgame | grep telegram-bot');
      // Ne pas arrêter le processus, juste logger l'erreur
      // Le bot continuera à essayer de se reconnecter
    }
  });

  bot.on('error', (error) => {
    console.error('❌ Erreur Telegram Bot:', error.message);
  });

  // ==================== COMMANDES BOT ====================

  // Commande /start - Demander la langue puis le code du jeu
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    // Réinitialiser la session
    userSessions.delete(chatId);
    
    // Demander la langue
    const welcomeMessage = t('en', 'welcome'); // Default to English for language selection
    
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🇬🇧 English', callback_data: 'lang_en' },
            { text: '🇷🇺 Русский', callback_data: 'lang_ru' }
          ]
        ]
      }
    });
  });

  // Commande /help
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions.get(chatId) || {};
    const lang = session.language || 'en';
    const helpMessage = t(lang, 'help');
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  });

  // Commande /status
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions.get(chatId);
    const lang = session?.language || 'en';

    if (!session || !session.gameCode) {
      return bot.sendMessage(chatId, t(lang, 'noActiveGame'), { parse_mode: 'Markdown' });
    }

    let statusMessage = t(lang, 'statusHeader');
    statusMessage += t(lang, 'statusGameCode', { gameCode: session.gameCode });
    
    if (session.playerName) {
      statusMessage += t(lang, 'statusName', { name: session.playerName });
    } else {
      statusMessage += t(lang, 'statusNameNotSet');
    }

    if (session.gameStarted) {
      statusMessage += t(lang, 'statusInProgress');
      if (session.questions && session.questions.length > 0) {
        statusMessage += t(lang, 'statusQuestion', {
          current: (session.currentQuestionIndex || 0) + 1,
          total: session.questions.length
        });
      }
    } else {
      statusMessage += t(lang, 'statusWaiting');
      statusMessage += t(lang, 'statusWaitingAdmin');
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
    const lang = session.language || 'en';

    // Si pas de langue sélectionnée, demander la langue
    if (!session.language) {
      const welcomeMessage = t('en', 'welcome');
      return bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🇬🇧 English', callback_data: 'lang_en' },
              { text: '🇷🇺 Русский', callback_data: 'lang_ru' }
            ]
          ]
        }
      });
    }

    // Si pas de code de jeu, traiter comme code
    if (!session.gameCode) {
      if (!text || text.length !== 6) {
        return bot.sendMessage(chatId, t(lang, 'codeLengthError'), {
          parse_mode: 'Markdown'
        });
      }

      const gameCode = text.toUpperCase();
      const verification = await verifyGameCode(gameCode);

      if (!verification || !verification.valid) {
        return bot.sendMessage(chatId, t(lang, 'codeInvalid'), { parse_mode: 'Markdown' });
      }

      if (verification.isStarted) {
        return bot.sendMessage(chatId, t(lang, 'gameAlreadyStarted'), { parse_mode: 'Markdown' });
      }

      // Code valide, sauvegarder dans la session
      session.gameCode = gameCode;
      session.gameStarted = false;
      userSessions.set(chatId, session);

      const keyboard = {
        inline_keyboard: [
          [{ text: lang === 'ru' ? '📝 Зарегистрироваться сейчас' : '📝 Register now', callback_data: 'register_prompt' }],
          [{ text: lang === 'ru' ? '📊 Статус' : '📊 Status', callback_data: 'status' }]
        ]
      };

      await bot.sendMessage(chatId, t(lang, 'codeAccepted', { gameCode }), {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
      return;
    }

    // Si code existe mais pas de joueur, traiter comme nom
    if (!session.playerId) {
      if (!text || text.length < 2) {
        return bot.sendMessage(chatId, t(lang, 'nameTooShort'), { parse_mode: 'Markdown' });
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
          
          // Vérifier si le jeu a déjà commencé et envoyer la question actuelle si nécessaire
          try {
            const gameState = await getGameState();
            if (gameState && gameState.isStarted) {
              session.gameStarted = true;
              userSessions.set(chatId, session);
              console.log(`⚠️  Game already started, player will receive next question`);
            }
          } catch (err) {
            console.error('Error checking game state:', err.message);
          }
        } else {
          console.error(`❌ WebSocket not connected, cannot register player ${session.playerId}`);
        }

        await bot.sendMessage(chatId, t(lang, 'registrationSuccess', {
          playerName: session.playerName,
          gameCode: session.gameCode
        }), {
          parse_mode: 'Markdown'
        });
      } catch (err) {
        let errorMessage = t(lang, 'registrationError');
        if (err.message.includes('déjà pris') || err.message.includes('already taken')) {
          errorMessage = t(lang, 'nameTaken');
        }
        await bot.sendMessage(chatId, errorMessage, { parse_mode: 'Markdown' });
      }
      return;
    }

    // Si tout est configuré, ignorer les messages texte
    await bot.sendMessage(chatId, t(lang, 'useButtons'), { parse_mode: 'Markdown' });
  });

  // Gestion des callback queries (boutons)
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const messageId = query.message.message_id;
    
    console.log(`📱 Callback reçu: ${data} de chatId: ${chatId}`);
    
    const session = userSessions.get(chatId) || {};
    const lang = session.language || 'en';

    // Acknowledge callback immédiatement
    try {
      await bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.error('Erreur lors de answerCallbackQuery:', err.message);
    }

    // Language selection
    if (data.startsWith('lang_')) {
      const selectedLang = data.replace('lang_', '');
      console.log(`🌐 Langue sélectionnée: ${selectedLang} pour chatId: ${chatId}`);
      
      session.language = selectedLang;
      userSessions.set(chatId, session);
      
      const langMessage = t(selectedLang, 'languageSelected');
      try {
        await bot.sendMessage(chatId, langMessage, {
          parse_mode: 'Markdown'
        });
        console.log(`✅ Message de langue envoyé pour chatId: ${chatId}`);
      } catch (err) {
        console.error(`❌ Erreur lors de l'envoi du message de langue:`, err.message);
      }
      return;
    }

    // New game button
    if (data === 'new_game') {
      // Réinitialiser la session
      userSessions.delete(chatId);
      const welcomeMessage = t(lang, 'welcome');
      await bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🇬🇧 English', callback_data: 'lang_en' },
              { text: '🇷🇺 Русский', callback_data: 'lang_ru' }
            ]
          ]
        }
      });
      return;
    }

    // Help button
    if (data === 'help') {
      return bot.sendMessage(chatId, t(lang, 'help'), {
        parse_mode: 'Markdown'
      });
    }

    // Status button
    if (data === 'status') {
      if (!session || !session.gameCode) {
        return bot.sendMessage(chatId, t(lang, 'noActiveGame'), { parse_mode: 'Markdown' });
      }
      let statusMessage = t(lang, 'statusHeader');
      statusMessage += t(lang, 'statusGameCode', { gameCode: session.gameCode });
      if (session.playerName) {
        statusMessage += t(lang, 'statusName', { name: session.playerName });
      }
      statusMessage += session.gameStarted ? t(lang, 'statusInProgress') : t(lang, 'statusWaiting');
      return bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    }

    // Register prompt
    if (data === 'register_prompt') {
      return bot.sendMessage(chatId, t(lang, 'namePrompt'), {
        parse_mode: 'Markdown'
      });
    }

    // Answer button: answer_<questionId>_<choiceIndex>
    if (data.startsWith('answer_')) {
      if (!session || !session.playerId || !session.gameStarted) {
        return bot.sendMessage(chatId, t(lang, 'mustBeRegistered'), { parse_mode: 'Markdown' });
      }

      if (session.hasAnsweredCurrentQuestion) {
        return bot.answerCallbackQuery(query.id, {
          text: t(lang, 'alreadyAnswered'),
          show_alert: false
        });
      }

      const parts = data.split('_');
      const questionId = parts[1];
      const choiceIndex = parseInt(parts[2]);

      const currentQuestion = session.questions?.find(q => q.id === questionId);
      if (!currentQuestion) {
        return bot.sendMessage(chatId, t(lang, 'questionNotFound'), { parse_mode: 'Markdown' });
      }

      const selectedChoice = currentQuestion.choices[choiceIndex];
      if (!selectedChoice) {
        return bot.sendMessage(chatId, t(lang, 'invalidChoice'), { parse_mode: 'Markdown' });
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
          const answerRecordedText = t(lang, 'answerRecorded');
          const editText = query.message.text + `\n\n${answerRecordedText}`;
          await bot.editMessageText(editText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: disabledKeyboard
          });
        } catch (editErr) {
          // Ignorer les erreurs d'édition
        }

        await bot.sendMessage(chatId, t(lang, 'answerRecorded'), {
          parse_mode: 'Markdown'
        });
      } catch (err) {
        await bot.sendMessage(chatId, `❌ ${err.message}`, { parse_mode: 'Markdown' });
      }
    }
  });

  // ==================== WEBSOCKET EVENTS ====================

  // Connexion WebSocket
  gameSocket.on('connect', () => {
    console.log('✅ Telegram bot connected to game WebSocket');
    console.log(`📡 Socket ID: ${gameSocket.id}`);
    console.log(`📡 Connected: ${gameSocket.connected}`);
    
    // Réenregistrer tous les joueurs actifs
    for (const [chatId, session] of userSessions.entries()) {
      if (session.playerId) {
        gameSocket.emit('register', session.playerId);
        console.log(`🔄 Re-registered player ${session.playerName} (${session.playerId})`);
      }
    }
    
    // Vérifier l'état du jeu au moment de la connexion
    checkGameStateAndSendQuestions();
  });
  
  // Écouter tous les événements pour debug
  gameSocket.onAny((event, ...args) => {
    console.log(`📡 WebSocket event received: ${event}`, args.length > 0 ? JSON.stringify(args[0]) : '');
  });
  
  // Fonction pour vérifier l'état du jeu et envoyer les questions si nécessaire
  async function checkGameStateAndSendQuestions() {
    try {
      const gameState = await getGameState();
      if (gameState && gameState.isStarted && gameState.currentQuestionId) {
        console.log(`⚠️  Game already started, fetching current question...`);
        
        // Récupérer la question actuelle
        const allQuestions = await getAllQuestions();
        const currentQuestion = allQuestions.find(q => q.id === gameState.currentQuestionId);
        
        if (currentQuestion) {
          console.log(`✅ Found current question: ${currentQuestion.id}`);
          
          // Envoyer la question à tous les joueurs enregistrés
          for (const [chatId, session] of userSessions.entries()) {
            if (session.playerId) {
              const lang = session.language || 'en';
              if (!session.gameStarted) {
                session.gameStarted = true;
              }
              if (!session.questions || session.questions.length === 0) {
                session.questions = allQuestions;
              }
              session.currentQuestionIndex = gameState.currentQuestionIndex || 0;
              session.hasAnsweredCurrentQuestion = false;
              userSessions.set(chatId, session);
              
              try {
                await sendQuestion(
                  bot, 
                  chatId, 
                  currentQuestion, 
                  gameState.currentQuestionIndex || 0, 
                  allQuestions.length, 
                  (gameState.questionDuration || 30000) / 1000, 
                  lang
                );
                console.log(`✅ Sent current question to ${session.playerName} (${session.playerId})`);
              } catch (err) {
                console.error(`❌ Error sending question to ${session.playerName}:`, err.message);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error checking game state:', err.message);
    }
  }

  gameSocket.on('disconnect', (reason) => {
    console.log('⚠️ Telegram bot disconnected from WebSocket. Reason:', reason);
  });

  gameSocket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection error:', error.message);
  });

  // Événement: Jeu démarré
  gameSocket.on('game:started', async (data) => {
    console.log('🚀 Game started event received:', JSON.stringify(data));
    
    for (const [chatId, session] of userSessions.entries()) {
      if (session.playerId && !session.gameStarted) {
        const lang = session.language || 'en';
        session.gameStarted = true;
        session.hasAnsweredCurrentQuestion = false;
        userSessions.set(chatId, session);
        
        console.log(`✅ Updated session for player ${session.playerName} (${session.playerId}): gameStarted = true`);
        
        await bot.sendMessage(chatId, t(lang, 'gameStarted'), {
          parse_mode: 'Markdown'
        });
      }
    }
  });

  // Événement: Nouvelle question
  gameSocket.on('question:next', async (data) => {
    console.log('📝 Question next event received:', JSON.stringify(data));
    
    const { question, questionIndex, totalQuestions, startTime, duration } = data;
    
    if (!question || !question.id) {
      console.error('❌ Invalid question data:', data);
      return;
    }

    console.log(`📝 Processing question ${question.id} for all registered players...`);

    const allQuestions = await getAllQuestions();
    const fullQuestion = allQuestions.find(q => q.id === question.id);
    if (!fullQuestion) {
      console.error(`❌ Question not found: ${question.id}`);
      console.error(`   Available questions: ${allQuestions.map(q => q.id).join(', ')}`);
      return;
    }

    console.log(`✅ Found question: ${fullQuestion.question}`);
    console.log(`📊 Total sessions: ${userSessions.size}`);

    let sentCount = 0;
    for (const [chatId, session] of userSessions.entries()) {
      console.log(`   Checking session for chatId ${chatId}: playerId=${session.playerId}, gameStarted=${session.gameStarted}`);
      
      // Envoyer la question à TOUS les joueurs enregistrés, même si gameStarted est false
      // car ils peuvent s'être inscrits après le démarrage du jeu
      if (session.playerId) {
        const lang = session.language || 'en';
        
        // Mettre à jour gameStarted si ce n'est pas déjà fait
        if (!session.gameStarted) {
          session.gameStarted = true;
          console.log(`   ⚠️  Setting gameStarted=true for player ${session.playerName} (${session.playerId})`);
        }
        
        if (!session.questions || session.questions.length === 0) {
          session.questions = allQuestions;
        }
        
        session.currentQuestionIndex = questionIndex;
        session.hasAnsweredCurrentQuestion = false;
        userSessions.set(chatId, session);
        
        try {
          await sendQuestion(bot, chatId, fullQuestion, questionIndex, totalQuestions, duration / 1000, lang);
          sentCount++;
          console.log(`   ✅ Question sent to ${session.playerName} (${session.playerId})`);
        } catch (err) {
          console.error(`   ❌ Error sending question to ${session.playerName}:`, err.message);
        }
      } else {
        console.log(`   ⏭️  Skipping session ${chatId}: no playerId`);
      }
    }
    
    console.log(`📝 Question sent to ${sentCount} player(s)`);
  });

  // Événement: Jeu terminé
  gameSocket.on('game:ended', async (data) => {
    console.log('🏁 Game ended event received:', data);
    
    for (const [chatId, session] of userSessions.entries()) {
      if (session.playerId && session.gameStarted) {
        session.gameStarted = false;
        userSessions.set(chatId, session);
        
        await sendFinalLeaderboard(bot, chatId, session);
      }
    }
  });

  // Événement: Mise à jour du classement
  gameSocket.on('leaderboard:update', async (leaderboard) => {
    console.log('📊 Leaderboard update received:', leaderboard.length, 'players');
  });

  // Polling pour vérifier l'état du jeu (fallback si WebSocket échoue)
  setInterval(async () => {
    try {
      const gameState = await getGameState();
      
      if (gameState && gameState.isStarted) {
        // Si le jeu a démarré, vérifier si on a une question active
        if (gameState.currentQuestionId) {
          // Vérifier si les joueurs ont déjà reçu cette question
          for (const [chatId, session] of userSessions.entries()) {
            if (session.playerId) {
              // Si le joueur n'a pas encore reçu la question actuelle
              if (!session.currentQuestionIndex || 
                  session.currentQuestionIndex !== gameState.currentQuestionIndex ||
                  !session.questions || 
                  !session.questions.find(q => q.id === gameState.currentQuestionId)) {
                
                console.log(`⚠️  Player ${session.playerName} missing current question, fetching...`);
                
                const lang = session.language || 'en';
                if (!session.gameStarted) {
                  session.gameStarted = true;
                }
                
                const allQuestions = await getAllQuestions();
                const currentQuestion = allQuestions.find(q => q.id === gameState.currentQuestionId);
                
                if (currentQuestion) {
                  if (!session.questions || session.questions.length === 0) {
                    session.questions = allQuestions;
                  }
                  session.currentQuestionIndex = gameState.currentQuestionIndex || 0;
                  session.hasAnsweredCurrentQuestion = false;
                  userSessions.set(chatId, session);
                  
                  try {
                    await sendQuestion(
                      bot, 
                      chatId, 
                      currentQuestion, 
                      gameState.currentQuestionIndex || 0, 
                      allQuestions.length, 
                      (gameState.questionDuration || 30000) / 1000, 
                      lang
                    );
                    console.log(`✅ Sent missing question to ${session.playerName} via polling`);
                  } catch (err) {
                    console.error(`❌ Error sending question via polling:`, err.message);
                  }
                }
              }
            }
          }
        }
        
        // Mettre à jour gameStarted pour les joueurs qui ne l'ont pas encore
        for (const [chatId, session] of userSessions.entries()) {
          if (session.playerId && !session.gameStarted) {
            const lang = session.language || 'en';
            session.gameStarted = true;
            userSessions.set(chatId, session);
            await bot.sendMessage(chatId, t(lang, 'gameStarted'), {
              parse_mode: 'Markdown'
            });
          }
        }
      }
    } catch (err) {
      // Ignorer les erreurs de polling silencieusement
    }
  }, 3000); // Vérifier toutes les 3 secondes

  console.log('🤖 Telegram bot is running...');
  console.log(`📡 WebSocket URL: ${wsUrl}`);
  console.log(`🔗 Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`🔗 Quiz Service: ${QUIZ_SERVICE_URL}`);
  console.log(`🔗 Game Service: ${GAME_SERVICE_URL}`);
  
  // Démarrer le polling APRÈS avoir enregistré tous les handlers
  console.log('🔄 Démarrage du polling...');
  
  // Attendre un peu avant de démarrer le polling pour éviter les conflits
  setTimeout(() => {
    bot.startPolling({
      interval: 1000,
      autoStart: true,
      params: {
        timeout: 10
      }
    }).then(() => {
      console.log('✅ Polling démarré avec succès');
    }).catch((err) => {
      console.error('❌ Erreur lors du démarrage du polling:', err.message);
      // Si erreur 409, c'est qu'une autre instance tourne déjà
      if (err.message && err.message.includes('409')) {
        console.error('⚠️  Une autre instance du bot tourne déjà.');
        console.error('   Solution: Vérifiez qu\'il n\'y a qu\'un seul pod telegram-bot.');
        console.error('   Commande: kubectl get pods -n intelectgame | grep telegram-bot');
        console.error('   Script: ./k8s/check-telegram-bot-pods.sh');
        // Ne pas arrêter le processus, laisser le bot essayer de se reconnecter
        // Le handler polling_error gérera les erreurs répétées
      }
    });
  }, 2000); // Attendre 2 secondes avant de démarrer
}

// Tester le token avant de continuer
testToken().then(isValid => {
  if (!isValid) {
    console.error('❌ Le token Telegram est invalide. Arrêt du bot.');
    process.exit(1);
  }
  
  // Initialiser le bot seulement si le token est valide
  initializeBot();
}).catch(err => {
  console.error('❌ Erreur lors de la vérification du token:', err);
  process.exit(1);
});
