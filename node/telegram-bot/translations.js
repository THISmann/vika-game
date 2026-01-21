// Translations for Telegram Bot
// Supports: English (en), Russian (ru)

const translations = {
  en: {
    welcome: `🎮 *Welcome to IntelectGame Bot!*\n\nTo get started, please choose your preferred language:`,
    languageSelected: `✅ Language set to English\n\nNow, I need the game code.\n\n📝 *Send me the game code* (6 characters)\n\nExample: \`ABC123\``,
    codePrompt: `📝 *Send me the game code* (6 characters)\n\nExample: \`ABC123\``,
    codeInvalid: `❌ Invalid code. Please check the code and try again.`,
    codeAccepted: `✅ *Code accepted!*\n\n🎮 Game: *{gameCode}*\n\n⏳ The game hasn't started yet.\n\n📝 *Send me your name* to register.\n\nExample: \`John\` or \`Mary\``,
    gameAlreadyStarted: `⚠️ The game has already started. You can no longer join.`,
    namePrompt: `📝 *To register, send me your name*\n\nExample: \`John\` or \`Mary\`\n\nThe name must be at least 2 characters.`,
    nameTooShort: `❌ The name must be at least 2 characters.`,
    nameTaken: `❌ This name is already taken. Please choose another name.`,
    registrationError: `❌ Registration error. Please try again.`,
    registrationSuccess: `✅ *Registration successful!*\n\n👤 Name: *{playerName}*\n🎮 Game: *{gameCode}*\n\n⏳ *Wait for the admin to start the game...*\n\nI will send you questions automatically as soon as the game starts! 🚀`,
    waitingForGame: `⏳ *Waiting for the game to start...*\n\nI will notify you as soon as the admin starts the game!`,
    gameStarted: `🚀 *The game has started!*\n\n⏳ The first question is coming soon...`,
    questionHeader: `📝 *Question {current}/{total}*\n\n{question}\n\n⏱ {duration}s to answer\n\nChoose your answer:`,
    answerRecorded: `✅ *Answer recorded!*\n\n⏳ Waiting for the next question...`,
    alreadyAnswered: `You have already answered this question`,
    mustBeRegistered: `❌ You must be registered and the game must be started.`,
    questionNotFound: `❌ Question not found.`,
    invalidChoice: `❌ Invalid choice.`,
    gameEnded: `🏁 *Game Over!*\n\n`,
    finalScore: `🎯 Final Score: *{score} points*\n`,
    position: `🏅 Position: *#{position}*\n`,
    leaderboardHeader: `🔝 *Final Leaderboard:*\n\n`,
    leaderboardEntry: `{medal} {name} - {score} pts\n`,
    leaderboardUnavailable: `\nℹ️ The leaderboard is not yet available.`,
    leaderboardError: `🎉 Game finished! Use /status to see your score.`,
    newGamePrompt: `🎮 *Would you like to play a new game?*\n\nClick the button below to start a new game:`,
    newGameButton: `🔄 Play New Game`,
    noActiveGame: `❌ No active game.\n\nUse /start to begin.`,
    statusHeader: `📊 *Your Status:*\n\n`,
    statusGameCode: `🎮 Game Code: *{gameCode}*\n`,
    statusName: `👤 Name: *{name}*\n`,
    statusNameNotSet: `👤 Name: Not registered\n`,
    statusInProgress: `🟢 Status: *In Progress*\n`,
    statusQuestion: `📝 Question: {current}/{total}\n`,
    statusWaiting: `🟡 Status: *Waiting*\n`,
    statusWaitingAdmin: `⏳ Wait for the admin to start the game...\n`,
    help: `📖 *IntelectGame Bot Help*\n\n1️⃣ Send the game code (6 characters)\n2️⃣ Register with your name\n3️⃣ Wait for the admin to start the game\n4️⃣ Answer questions using the buttons\n5️⃣ Check the leaderboard at the end\n\n*Available commands:*\n/start - Restart\n/status - View your status\n/help - Show this help`,
    useButtons: `ℹ️ Use the buttons to answer questions.\n\n/status - View your status`,
    codeLengthError: `❌ The code must contain exactly 6 characters.\n\nExample: \`ABC123\``,
    noQuestions: `❌ No questions available.`
  },
  ru: {
    welcome: `🎮 *Добро пожаловать в IntelectGame Bot!*\n\nДля начала, пожалуйста, выберите предпочитаемый язык:`,
    languageSelected: `✅ Язык установлен на русский\n\nТеперь мне нужен код игры.\n\n📝 *Отправьте мне код игры* (6 символов)\n\nПример: \`ABC123\``,
    codePrompt: `📝 *Отправьте мне код игры* (6 символов)\n\nПример: \`ABC123\``,
    codeInvalid: `❌ Неверный код. Пожалуйста, проверьте код и попробуйте снова.`,
    codeAccepted: `✅ *Код принят!*\n\n🎮 Игра: *{gameCode}*\n\n⏳ Игра еще не началась.\n\n📝 *Отправьте мне ваше имя* для регистрации.\n\nПример: \`Иван\` или \`Мария\``,
    gameAlreadyStarted: `⚠️ Игра уже началась. Вы больше не можете присоединиться.`,
    namePrompt: `📝 *Для регистрации отправьте мне ваше имя*\n\nПример: \`Иван\` или \`Мария\`\n\nИмя должно содержать не менее 2 символов.`,
    nameTooShort: `❌ Имя должно содержать не менее 2 символов.`,
    nameTaken: `❌ Это имя уже занято. Пожалуйста, выберите другое имя.`,
    registrationError: `❌ Ошибка регистрации. Пожалуйста, попробуйте снова.`,
    registrationSuccess: `✅ *Регистрация успешна!*\n\n👤 Имя: *{playerName}*\n🎮 Игра: *{gameCode}*\n\n⏳ *Дождитесь, пока администратор запустит игру...*\n\nЯ автоматически отправлю вам вопросы, как только игра начнется! 🚀`,
    waitingForGame: `⏳ *Ожидание начала игры...*\n\nЯ уведомлю вас, как только администратор запустит игру!`,
    gameStarted: `🚀 *Игра началась!*\n\n⏳ Первый вопрос скоро появится...`,
    questionHeader: `📝 *Вопрос {current}/{total}*\n\n{question}\n\n⏱ {duration}с для ответа\n\nВыберите ваш ответ:`,
    answerRecorded: `✅ *Ответ записан!*\n\n⏳ Ожидание следующего вопроса...`,
    alreadyAnswered: `Вы уже ответили на этот вопрос`,
    mustBeRegistered: `❌ Вы должны быть зарегистрированы, и игра должна быть запущена.`,
    questionNotFound: `❌ Вопрос не найден.`,
    invalidChoice: `❌ Неверный выбор.`,
    gameEnded: `🏁 *Игра окончена!*\n\n`,
    finalScore: `🎯 Финальный счет: *{score} очков*\n`,
    position: `🏅 Позиция: *#{position}*\n`,
    leaderboardHeader: `🔝 *Финальная таблица лидеров:*\n\n`,
    leaderboardEntry: `{medal} {name} - {score} очков\n`,
    leaderboardUnavailable: `\nℹ️ Таблица лидеров пока недоступна.`,
    leaderboardError: `🎉 Игра окончена! Используйте /status, чтобы увидеть ваш счет.`,
    newGamePrompt: `🎮 *Хотите сыграть в новую игру?*\n\nНажмите кнопку ниже, чтобы начать новую игру:`,
    newGameButton: `🔄 Играть снова`,
    noActiveGame: `❌ Нет активной игры.\n\nИспользуйте /start, чтобы начать.`,
    statusHeader: `📊 *Ваш статус:*\n\n`,
    statusGameCode: `🎮 Код игры: *{gameCode}*\n`,
    statusName: `👤 Имя: *{name}*\n`,
    statusNameNotSet: `👤 Имя: Не зарегистрировано\n`,
    statusInProgress: `🟢 Статус: *В процессе*\n`,
    statusQuestion: `📝 Вопрос: {current}/{total}\n`,
    statusWaiting: `🟡 Статус: *Ожидание*\n`,
    statusWaitingAdmin: `⏳ Дождитесь, пока администратор запустит игру...\n`,
    help: `📖 *Справка IntelectGame Bot*\n\n1️⃣ Отправьте код игры (6 символов)\n2️⃣ Зарегистрируйтесь с вашим именем\n3️⃣ Дождитесь, пока администратор запустит игру\n4️⃣ Отвечайте на вопросы, используя кнопки\n5️⃣ Проверьте таблицу лидеров в конце\n\n*Доступные команды:*\n/start - Перезапустить\n/status - Посмотреть ваш статус\n/help - Показать эту справку`,
    useButtons: `ℹ️ Используйте кнопки для ответа на вопросы.\n\n/status - Посмотреть ваш статус`,
    codeLengthError: `❌ Код должен содержать ровно 6 символов.\n\nПример: \`ABC123\``,
    noQuestions: `❌ Нет доступных вопросов.`
  }
};

// Helper function to translate text
function t(lang, key, params = {}) {
  const langTranslations = translations[lang] || translations.en;
  let text = langTranslations[key] || translations.en[key] || key;
  
  // Replace placeholders {key} with values
  Object.keys(params).forEach(paramKey => {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
  });
  
  return text;
}

// Get available languages
function getAvailableLanguages() {
  return Object.keys(translations);
}

module.exports = {
  translations,
  t,
  getAvailableLanguages
};










