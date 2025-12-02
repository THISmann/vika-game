require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const path = require('path');
const { io } = require('socket.io-client');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';
const GAME_WS_URL = process.env.GAME_WS_URL || 'http://localhost:3003';

// WebSocket connection for real-time game events
const gameSocket = io(GAME_WS_URL, {
  transports: ['polling', 'websocket'], // Try polling first, then websocket
  reconnection: true,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity,
  timeout: 30000,
  autoConnect: true,
  forceNew: false,
  allowEIO3: true
});

// WebSocket connection handlers - defined after bot setup

// Get token from environment variable (required for security)
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is required! Please set it as an environment variable.');
  console.error('For local development, create a .env file with: TELEGRAM_BOT_TOKEN=your_token_here');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Store user sessions
const userSessions = new Map(); // chatId -> { gameCode, playerId, playerName, currentQuestionIndex, questions, gameStarted, timer }

// Helper functions
async function getGame(gameCode) {
  try {
    const res = await axios.get(`${GAME_SERVICE_URL}/game/session/${gameCode}`);
    return res.data;
  } catch (err) {
    return null;
  }
}

async function joinGame(gameCode, playerName) {
  try {
    const res = await axios.post(`${GAME_SERVICE_URL}/game/join`, {
      code: gameCode,
      playerName,
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 409) {
      throw new Error(err.response.data.error || 'Ce nom est déjà pris dans cette partie. Choisissez un autre nom.');
    }
    if (err.response?.status === 400) {
      throw new Error(err.response.data.error || 'Impossible de rejoindre cette partie.');
    }
    throw new Error('Erreur lors de l\'inscription à la partie');
  }
}

async function answerQuestion(playerId, questionId, answer, gameCode) {
  try {
    const res = await axios.post(`${GAME_SERVICE_URL}/game/answer`, {
      playerId,
      questionId,
      answer,
      gameCode,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Erreur lors de l\'envoi de la réponse');
  }
}

async function getQuestionsForGame(gameCode) {
  try {
    const game = await getGame(gameCode);
    if (!game || !game.questionIds || game.questionIds.length === 0) {
      return [];
    }

    const allQuestionsRes = await axios.get(`${QUIZ_SERVICE_URL}/quiz/full`);
    const allQuestions = allQuestionsRes.data;
    
    // CRITICAL: Preserve the order of questionIds as defined in the game
    // Map questionIds to actual questions in the same order
    const orderedQuestions = game.questionIds
      .map(questionId => allQuestions.find(q => q.id === questionId))
      .filter(q => q !== undefined); // Remove any questions that weren't found
    
    console.log(`[getQuestionsForGame] Game ${gameCode}: Ordered ${orderedQuestions.length} questions in game order`);
    return orderedQuestions;
  } catch (err) {
    console.error(`[getQuestionsForGame] Error for game ${gameCode}:`, err.message);
    return [];
  }
}

async function getLeaderboard(gameCode) {
  try {
    const res = await axios.get(`${GAME_SERVICE_URL}/game/session/${gameCode}/leaderboard`);
    return res.data;
  } catch (err) {
    return [];
  }
}

async function ensureSessionQuestions(session) {
  if (!session || !session.gameCode) {
    return [];
  }
  if (session.questions && session.questions.length) {
    return session.questions;
  }
  const questions = await getQuestionsForGame(session.gameCode);
  session.questions = questions;
  return questions;
}

async function syncSessionWithGame(chatId, session, options = {}) {
  if (!session || !session.gameCode || !session.playerId) {
    return;
  }

  const game = await getGame(session.gameCode);
  if (!game) return;

  session.questionDuration = game.questionDuration || session.questionDuration || 60;

  if (game.status === 'finished') {
    if (!session.gameFinished) {
      session.gameFinished = true;
      await sendFinalSummary(chatId, session);
    }
    return;
  }

  if (game.status !== 'started') {
    session.gameStarted = false;
    return;
  }

  session.gameStarted = true;
  session.gameFinished = false;

  const questions = await ensureSessionQuestions(session);
  const serverIndex = typeof game.currentQuestionIndex === 'number' ? game.currentQuestionIndex : null;
  if (serverIndex === null || serverIndex < 0 || !questions[serverIndex]) {
    return;
  }

  // Use the question at the correct index (order is preserved in ensureSessionQuestions)
  const question = questions[serverIndex];
  if (!question) {
    console.error(`[syncSessionWithGame] Question at index ${serverIndex} not found for game ${game.code}`);
    return;
  }

  const hasNewQuestion = session.currentQuestionIndex !== serverIndex || options.force;
  session.currentQuestionIndex = serverIndex;
  session.currentQuestionEndsAt = game.currentQuestionEndsAt || null;

  if (hasNewQuestion) {
    console.log(`[syncSessionWithGame] Sending question ${serverIndex + 1} to chat ${chatId}`);
    await sendQuestion(chatId, question, serverIndex, session);
  }
}

function buildMediaFilename(mediaUrl, fallbackExt) {
  let extension = fallbackExt;
  try {
    const parsed = new URL(mediaUrl);
    const detectedExt = path.extname(parsed.pathname);
    if (detectedExt) {
      extension = detectedExt;
    }
  } catch (err) {
    const detectedExt = path.extname(mediaUrl);
    if (detectedExt) {
      extension = detectedExt;
    }
  }

  if (!extension || extension === ".") {
    extension = fallbackExt;
  }

  return `media-${Date.now()}${extension || ""}`;
}

async function downloadMedia(mediaUrl, fallbackExt) {
  if (!mediaUrl) {
    return null;
  }

  try {
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    return {
      buffer: Buffer.from(response.data),
      filename: buildMediaFilename(mediaUrl, fallbackExt)
    };
  } catch (err) {
    console.error(`Unable to download media from ${mediaUrl}:`, err.message);
    return null;
  }
}

// Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🎮 *Bienvenue sur IntelectGame Bot !*

Commandes disponibles :
/code <CODE> - Entrer le code de la partie
/register <NOM> - S'inscrire avec un nom
/status - Voir votre statut actuel
/help - Afficher l'aide

*Exemple :*
1. /code ABC123
2. /register MonNom
3. Attendez que l'admin démarre la partie
4. Répondez aux questions avec les boutons qui apparaîtront
  `;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '📖 Aide', callback_data: 'help' }],
      [{ text: '📊 Statut', callback_data: 'status' }]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📖 Aide IntelectGame Bot

1. Entrez le code de la partie :
   /code ABC123

2. Inscrivez-vous :
   /register VotreNom

3. Attendez que l'admin démarre la partie

4. Répondez aux questions en tapant le numéro de votre choix (1, 2, 3, ou 4)

5. Vérifiez votre statut :
   /status
  `;
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/code (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const gameCode = match[1].toUpperCase().trim();

  if (gameCode.length !== 6) {
    return bot.sendMessage(chatId, '❌ Le code doit contenir 6 caractères');
  }

  try {
    const game = await getGame(gameCode);
    if (!game) {
      return bot.sendMessage(chatId, '❌ Code invalide. Vérifiez le code et réessayez.');
    }

    if (game.status === 'finished') {
      return bot.sendMessage(chatId, '❌ Cette partie est terminée.');
    }

    // Initialize or update session
    const session = userSessions.get(chatId) || {};
    session.gameCode = gameCode;
    session.gameStarted = game.status === 'started';
    session.questionDuration = game.questionDuration || session.questionDuration || 60;
    session.currentQuestionIndex = null;
    userSessions.set(chatId, session);

    const keyboard = {
      inline_keyboard: [
        [{ text: '📝 S\'inscrire', callback_data: 'register_prompt' }],
        [{ text: '📊 Statut', callback_data: 'status' }]
      ]
    };

    if (game.status === 'waiting') {
      bot.sendMessage(chatId, `✅ *Code accepté !*\n\n🎮 Partie: *${gameCode}*\n\n⏳ La partie n'a pas encore démarré. Attendez que l'admin lance la partie.\n\nUtilisez /register <NOM> pour vous inscrire.`, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    } else if (game.status === 'started') {
      bot.sendMessage(chatId, `✅ *Code accepté !*\n\n🎮 Partie: *${gameCode}*\n\n🚀 La partie est en cours !\n\nUtilisez /register <NOM> pour vous inscrire et commencer.`, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
  } catch (err) {
    bot.sendMessage(chatId, '❌ Erreur lors de la vérification du code.');
  }
});

bot.onText(/\/register (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const playerName = match[1].trim();

  if (!playerName || playerName.length < 2) {
    return bot.sendMessage(chatId, '❌ Le nom doit contenir au moins 2 caractères');
  }

  const session = userSessions.get(chatId);
  if (!session || !session.gameCode) {
    return bot.sendMessage(chatId, '❌ Vous devez d\'abord entrer un code de partie avec /code <CODE>');
  }

  try {
    // Join game directly - registration happens here
    const gameData = await joinGame(session.gameCode, playerName);
    
    session.playerId = gameData.currentPlayerId;
    session.playerName = gameData.currentPlayerName;
    session.currentQuestionIndex = null;
    session.questions = [];
    session.gameFinished = false;
    
    // Join WebSocket room for real-time updates
    if (gameSocket && gameSocket.connected) {
      gameSocket.emit('join-game', session.gameCode);
      console.log(`Bot joined WebSocket room for game ${session.gameCode} (player: ${playerName})`);
    }
    userSessions.set(chatId, session);
    
    // Join WebSocket room
    gameSocket.emit('join-game', session.gameCode);

    const game = await getGame(session.gameCode);
    if (game?.status === 'started') {
      await bot.sendMessage(chatId, `✅ Inscription réussie !\n\n👤 Nom: ${gameData.currentPlayerName}\n🎮 Partie: ${session.gameCode}\n\n🚀 La partie est en cours, bonne chance !`);
      await syncSessionWithGame(chatId, session, { force: true });
    } else {
      bot.sendMessage(chatId, `✅ Inscription réussie !\n\n👤 Nom: ${gameData.currentPlayerName}\n🎮 Partie: ${session.gameCode}\n\n⏳ Attendez que l'admin démarre la partie.`);
    }
  } catch (err) {
    bot.sendMessage(chatId, `❌ ${err.message}`);
  }
});

bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions.get(chatId);

  if (!session || !session.gameCode) {
    return bot.sendMessage(chatId, '❌ Aucune partie active. Utilisez /code <CODE> pour commencer.');
  }

  let statusMessage = `📊 Votre statut :\n\n`;
  statusMessage += `🎮 Code partie: ${session.gameCode}\n`;
  
  if (session.playerName) {
    statusMessage += `👤 Nom: ${session.playerName}\n`;
  } else {
    statusMessage += `👤 Nom: Non enregistré\n`;
  }

  if (session.gameStarted) {
    statusMessage += `🟢 Statut: En cours\n`;
    if (session.questions) {
      statusMessage += `📝 Questions: ${session.currentQuestionIndex || 0}/${session.questions.length}\n`;
    }
  } else {
    statusMessage += `🟡 Statut: En attente\n`;
  }

  bot.sendMessage(chatId, statusMessage);
});

// Handle callback queries (button clicks)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const messageId = query.message.message_id;

  // Handle answered callbacks (already answered - do nothing)
  if (data && data.startsWith('answered_')) {
    return bot.answerCallbackQuery(query.id, {
      text: 'Vous avez déjà répondu à cette question',
      show_alert: false
    });
  }

  // Acknowledge the callback for other actions (will be re-acknowledged in specific handlers if needed)

  // Handle help button
  if (data === 'help') {
    const helpMessage = `
📖 *Aide IntelectGame Bot*

1. Entrez le code de la partie :
   /code ABC123

2. Inscrivez-vous :
   /register VotreNom

3. Attendez que l'admin démarre la partie

4. Répondez aux questions avec les boutons qui apparaîtront

5. Vérifiez votre statut :
   /status
    `;
    return bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }

  // Handle status button
  if (data === 'status') {
    const session = userSessions.get(chatId);
    if (!session || !session.gameCode) {
      return bot.sendMessage(chatId, '❌ Aucune partie active. Utilisez /code <CODE> pour commencer.');
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
      if (session.questions) {
        statusMessage += `📝 Questions: ${session.currentQuestionIndex || 0}/${session.questions.length}\n`;
      }
    } else {
      statusMessage += `🟡 Statut: *En attente*\n`;
    }
    return bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  }

  // Handle register prompt
  if (data === 'register_prompt') {
    return bot.sendMessage(chatId, '📝 Pour vous inscrire, utilisez la commande :\n\n/register VotreNom\n\nExemple: /register Jean');
  }

  const session = userSessions.get(chatId);
  if (!session || !session.gameCode || !session.playerId) {
    return bot.sendMessage(chatId, '❌ Session invalide. Utilisez /code pour commencer.');
  }

  if (!session.gameStarted) {
    return bot.sendMessage(chatId, '⏳ La partie n\'a pas encore démarré. Attendez que l\'admin lance la partie.');
  }

  if (!session.questions || session.questions.length === 0) {
    return bot.sendMessage(chatId, '❌ Aucune question disponible pour cette partie.');
  }

  // Parse answer data: "answer_<questionIndex>_<choiceIndex>"
  if (!data.startsWith('answer_')) {
    return;
  }

  const parts = data.split('_');
  const questionIndex = parseInt(parts[1]);
  const choiceIndex = parseInt(parts[2]);

  // Verify we're on the right question
  if (questionIndex !== session.currentQuestionIndex) {
    return bot.sendMessage(chatId, '❌ Cette question a déjà été répondue. Veuillez attendre la prochaine question.');
  }

  const currentQuestion = session.questions[questionIndex];
  if (!currentQuestion) {
    return bot.sendMessage(chatId, '✅ Vous avez répondu à toutes les questions !');
  }

  const selectedChoice = currentQuestion.choices[choiceIndex];
  if (!selectedChoice) {
    return bot.sendMessage(chatId, '❌ Choix invalide.');
  }

  try {
    // Check if already answered this question
    if (session.hasAnsweredCurrentQuestion) {
      return bot.answerCallbackQuery(query.id, {
        text: 'Vous avez déjà répondu à cette question',
        show_alert: false
      });
    }

    const result = await answerQuestion(
      session.playerId,
      currentQuestion.id,
      selectedChoice,
      session.gameCode
    );
    
    if (!result || !result.submitted) {
      throw new Error('Réponse non acceptée par le serveur');
    }
    
    session.lastScore = result.newScore;
    session.hasAnsweredCurrentQuestion = true;
    userSessions.set(chatId, session);

    // Acknowledge with a simple confirmation (if not already acknowledged)
    try {
      await bot.answerCallbackQuery(query.id, {
        text: '✅ Réponse enregistrée !',
        show_alert: false
      });
    } catch (ackErr) {
      // Ignore if already acknowledged
      console.log('Callback already acknowledged');
    }
    
    // Edit the message to show it's been answered (optional visual feedback)
    try {
      const editText = query.message.text || query.message.caption || '';
      const answeredText = editText.includes('✅ Répondu') 
        ? editText 
        : editText + '\n\n✅ Réponse enregistrée !';
      
      // Create disabled keyboard showing which answer was selected
      const disabledKeyboard = currentQuestion.choices.map((choice, i) => ([
        {
          text: `${String.fromCharCode(65 + i)}. ${choice}${i === choiceIndex ? ' ✅' : ''}`,
          callback_data: `answered_${questionIndex}_${i}`
        }
      ]));
      
      const editPayload = {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: disabledKeyboard }
      };
      
      if (query.message.photo) {
        await bot.editMessageCaption(answeredText, editPayload);
      } else {
        await bot.editMessageText(answeredText, editPayload);
      }
    } catch (editErr) {
      // Ignore edit errors, not critical
      console.log('Could not edit message:', editErr.message);
    }
  } catch (err) {
    console.error('Error answering question:', err);
    await bot.answerCallbackQuery(query.id, {
      text: `❌ Erreur: ${err.message || 'Impossible d\'enregistrer la réponse'}`,
      show_alert: true
    });
  }
});

// Function to send question with optional media attachments
async function sendQuestion(chatId, question, index, session) {
  if (!question) {
    return bot.sendMessage(chatId, '❌ Aucune question disponible pour le moment.');
  }
  const duration = session?.questionDuration || 60;
  const header = `📝 *Question ${index + 1}:*\n\n${question.question}\n\n⏱ ${duration} sec\n\nChoisissez votre réponse :`;

  const keyboard = question.choices.map((choice, i) => ([
    {
      text: `${String.fromCharCode(65 + i)}. ${choice}`,
      callback_data: `answer_${index}_${i}`
    }
  ]));

  const baseOptions = {
    reply_markup: {
      inline_keyboard: keyboard
    },
    parse_mode: 'Markdown'
  };

  try {
    if (question.imageUrl) {
      const image = await downloadMedia(question.imageUrl, '.jpg');
      if (image) {
        await bot.sendPhoto(
          chatId,
          image.buffer,
          { ...baseOptions, caption: header },
          { filename: image.filename }
        );
      } else {
        await bot.sendMessage(chatId, header, baseOptions);
      }

      if (question.audioUrl) {
        const audio = await downloadMedia(question.audioUrl, '.mp3');
        if (audio) {
          await bot.sendAudio(
            chatId,
            audio.buffer,
            { caption: '🎧 Audio associée', parse_mode: 'Markdown' },
            { filename: audio.filename }
          );
        } else {
          await bot.sendMessage(chatId, '🎧 Impossible de charger l\'audio pour cette question.');
        }
      }
      return;
    }

    if (question.audioUrl) {
      const audio = await downloadMedia(question.audioUrl, '.mp3');
      if (audio) {
        await bot.sendAudio(
          chatId,
          audio.buffer,
          { ...baseOptions, caption: header },
          { filename: audio.filename }
        );
        return;
      }
    }

    await bot.sendMessage(chatId, header, baseOptions);
  } catch (err) {
    console.error('Unable to send question:', err.message);
    await bot.sendMessage(chatId, header, baseOptions);
  }
}

async function sendFinalSummary(chatId, session) {
  try {
    const leaderboard = await getLeaderboard(session.gameCode);
    const playerEntry = leaderboard.find(entry => entry.playerId === session.playerId);
    const finalScore = playerEntry ? playerEntry.score : session.lastScore || 0;
    const position = playerEntry ? leaderboard.indexOf(playerEntry) + 1 : null;

    let message = `🏁 *Fin de la partie*\n\n`;
    message += `🎮 Code: *${session.gameCode}*\n`;
    if (session.playerName) {
      message += `👤 Joueur: *${session.playerName}*\n`;
    }
    message += `🎯 Score final: *${finalScore}*\n`;
    if (position) {
      message += `🏅 Position: *#${position}*\n`;
    }

    if (leaderboard.length) {
      message += `\n🔝 *Top 5*\n`;
      leaderboard.slice(0, 5).forEach((entry, idx) => {
        const marker = entry.playerId === session.playerId ? '👉' : `${idx + 1}.`;
        message += `${marker} ${entry.playerName || 'Joueur'} - ${entry.score} pts\n`;
      });
    } else {
      message += `\nℹ️ Le classement final n'est pas encore disponible.`;
    }

    // Fetch detailed results
    try {
      const resultsRes = await axios.get(`${GAME_SERVICE_URL}/game/session/${session.gameCode}/results?playerId=${session.playerId}`);
      if (resultsRes.data && resultsRes.data.results && resultsRes.data.results.length > 0) {
        message += `\n\n📝 *Résultats des questions:*\n`;
        resultsRes.data.results.forEach((result, idx) => {
          const icon = result.isCorrect ? '✅' : (result.playerAnswer ? '❌' : '⏱');
          message += `\n${icon} *Q${result.questionIndex}:* ${result.question}\n`;
          if (result.playerAnswer) {
            message += `   Votre réponse: ${result.playerAnswer}\n`;
          }
          message += `   ✅ Bonne réponse: ${result.correctAnswer}\n`;
        });
      }
    } catch (err) {
      console.error('Error fetching detailed results:', err.message);
    }

    message += `\n\n📊 Utilisez /status pour voir votre progression.`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Unable to send final summary:', err.message);
    await bot.sendMessage(chatId, '🎉 Partie terminée ! Utilisez /status pour consulter votre score.');
  }
}

// WebSocket event handlers for real-time game updates
gameSocket.on('connect', () => {
  console.log('✅ Telegram bot connected to game WebSocket');
  // Rejoin all active game rooms on reconnect
  for (const [chatId, session] of userSessions.entries()) {
    if (session.gameCode) {
      gameSocket.emit('join-game', session.gameCode);
      console.log(`Rejoined game room: ${session.gameCode}`);
    }
  }
});

gameSocket.on('disconnect', (reason) => {
  console.log('⚠️ Telegram bot disconnected from game WebSocket. Reason:', reason);
  // Will automatically reconnect via socket.io-client
});

gameSocket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Telegram bot reconnected after ${attemptNumber} attempt(s)`);
  // Rejoin all active game rooms
  for (const [chatId, session] of userSessions.entries()) {
    if (session.gameCode) {
      gameSocket.emit('join-game', session.gameCode);
    }
  }
});

let lastErrorTime = 0;
const ERROR_LOG_INTERVAL = 10000; // Log errors at most once every 10 seconds

gameSocket.on('connect_error', (error) => {
  const now = Date.now();
  if (now - lastErrorTime > ERROR_LOG_INTERVAL) {
    console.error('❌ Telegram bot WebSocket connection error:', error.message);
    console.error('   Attempting to connect to:', GAME_WS_URL);
    lastErrorTime = now;
  }
  // Will automatically reconnect via socket.io-client configuration
});

// Listen for game:start events
gameSocket.on('game:start', async (data) => {
  console.log('Game started:', data.code);
  // Notify all users in that game
  for (const [chatId, session] of userSessions.entries()) {
    if (session.gameCode === data.code && session.playerId) {
      await syncSessionWithGame(chatId, session, { force: true });
    }
  }
});

// Listen for new questions - this is triggered automatically by the server when timer expires
gameSocket.on('game:question', async (payload) => {
  console.log(`📨 [Bot] New question event received for game: ${payload.code}, question index: ${payload.questionIndex}`);
  
  // Ensure we're in the game room
  if (payload.code) {
    gameSocket.emit('join-game', payload.code);
  }
  
  for (const [chatId, session] of userSessions.entries()) {
    if (session.gameCode === payload.code && session.playerId) {
      console.log(`📨 [Bot] Processing question for player ${session.playerName} (chatId: ${chatId})`);
      const questions = await ensureSessionQuestions(session);
      
      // CRITICAL: Use the index to get the question from the ordered array, not by ID
      // The questions array is now ordered to match game.questionIds, so questions[index] is correct
      const question = questions[payload.questionIndex];
      
      if (!question) {
        console.error(`❌ [Bot] Question at index ${payload.questionIndex} not found for player ${session.playerName} (expected ID: ${payload.questionId})`);
        // Fallback: try to find by ID if index fails
        const fallbackQuestion = questions.find(q => q.id === payload.questionId);
        if (fallbackQuestion) {
          console.warn(`⚠️ [Bot] Found question by ID but index mismatch - this indicates an ordering problem`);
        }
        return;
      }
      
      // Verify the question ID matches (double-check)
      if (question.id !== payload.questionId) {
        console.error(`❌ [Bot] Question ID mismatch! Expected ${payload.questionId} but got ${question.id} at index ${payload.questionIndex}`);
        return;
      }
      
      const isNewQuestion = session.currentQuestionIndex !== payload.questionIndex;
      
      // Only send if it's actually a new question (prevent duplicates)
      if (!isNewQuestion) {
        console.log(`📨 [Bot] Question ${payload.questionIndex + 1} already displayed for ${session.playerName}, skipping duplicate send`);
        // Still update the session state even if not sending
        session.currentQuestionIndex = payload.questionIndex;
        session.hasAnsweredCurrentQuestion = false;
        session.currentQuestionEndsAt = payload.endsAt;
        userSessions.set(chatId, session);
        return; // Don't send duplicate
      }
      
      session.currentQuestionIndex = payload.questionIndex;
      session.hasAnsweredCurrentQuestion = false; // Reset answered flag for new question
      session.currentQuestionEndsAt = payload.endsAt;
      userSessions.set(chatId, session);
      
      console.log(`📨 [Bot] Question ${payload.questionIndex + 1} ready for ${session.playerName}, sending new question (ID: ${question.id})`);
      await sendQuestion(chatId, question, payload.questionIndex, session);
    }
  }
});

// Listen for game finished
gameSocket.on('game:finished', async (data) => {
  console.log('Game finished:', data.code);
  for (const [chatId, session] of userSessions.entries()) {
    if (session.gameCode === data.code && session.playerId && !session.gameFinished) {
      session.gameFinished = true;
      userSessions.set(chatId, session);
      await sendFinalSummary(chatId, session);
    }
  }
});


// Poll game status only for waiting users (not for started games - WebSocket handles that)
setInterval(async () => {
  for (const [chatId, session] of userSessions.entries()) {
    if (!session.gameCode || !session.playerId || session.gameStarted) {
      continue; // Skip if game already started (WebSocket handles it)
    }
    try {
      await syncSessionWithGame(chatId, session);
    } catch (err) {
      // Ignore polling errors
    }
  }
}, 3000); // Check every 3 seconds

console.log('🤖 Telegram bot is running...');

