import { ref, computed } from 'vue'

// Traductions disponibles
const translations = {
  fr: {
    // Navbar
    'nav.register': 'S\'inscrire',
    'nav.play': '🎯 Jouer',
    'nav.leaderboard': '🏆 Classement',
    'nav.language': 'Langue',
    
    // PlayerRegister
    'register.enterCode': 'Entrer le code de la partie',
    'register.askCode': 'Demandez le code à l\'administrateur',
    'register.gameCode': 'Code de la partie',
    'register.verifyCode': 'Vérifier le code',
    'register.enterName': 'Entrer votre nom',
    'register.name': 'Votre nom',
    'register.join': 'Rejoindre la partie',
    'register.waiting': '⏳ En attente du début du jeu',
    'register.waitingDesc': 'L\'administrateur va bientôt démarrer le jeu...',
    'register.error': 'Erreur',
    'register.invalidCode': 'Code invalide',
    'register.gameStarted': 'Le jeu a déjà commencé. Vous ne pouvez plus vous connecter.',
    
    // QuizPlay
    'quiz.waiting': '⏳ En attente du début du jeu',
    'quiz.waitingDesc': 'L\'administrateur va bientôt démarrer le jeu...',
    'quiz.loading': 'Chargement...',
    'quiz.question': 'Question',
    'quiz.submit': 'Envoyer la réponse',
    'quiz.correct': 'Bonne réponse !',
    'quiz.incorrect': 'Réponse incorrecte',
    'quiz.correctAnswer': 'La bonne réponse était',
    'quiz.alreadyAnswered': 'Vous avez déjà répondu à cette question',
    'quiz.gameEnded': '🎉 Quiz terminé !',
    'quiz.gameEndedDesc': 'Félicitations ! Le jeu est terminé. Consultez vos résultats ci-dessous.',
    'quiz.finalScore': 'Votre score final',
    'quiz.viewLeaderboard': 'Voir le classement',
    'quiz.answerRecorded': '✓ Réponse enregistrée. En attente de la question suivante...',
    'quiz.player': 'Joueur',
    'quiz.anonymous': 'Anonyme',
    'quiz.playerNotIdentified': 'Joueur non identifié. Veuillez vous réinscrire.',
    'quiz.resultsTitle': 'Résultats des questions',
    'quiz.yourAnswer': 'Votre réponse',
    'quiz.correctAnswerLabel': 'Bonne réponse',
    'quiz.correctLabel': '✓ Correct',
    'quiz.incorrectLabel': '✗ Incorrect',
    
    // Leaderboard
    'leaderboard.title': '🏆 Classement',
    'leaderboard.subtitle': 'Les meilleurs joueurs en temps réel',
    'leaderboard.loading': 'Chargement du classement...',
    'leaderboard.empty': 'Aucun joueur pour le moment',
    'leaderboard.rank': 'Rang',
    'leaderboard.player': 'Joueur',
    'leaderboard.score': 'Score',
    'leaderboard.points': 'points',
    'leaderboard.point': 'point',
    'leaderboard.anonymous': 'Joueur anonyme',
    'leaderboard.pts': 'pts',
    'leaderboard.replay': 'Rejouer',
    'leaderboard.newPlayer': 'Nouveau joueur'
  },
  en: {
    // Navbar
    'nav.register': 'Register',
    'nav.play': '🎯 Play',
    'nav.leaderboard': '🏆 Leaderboard',
    'nav.language': 'Language',
    
    // PlayerRegister
    'register.enterCode': 'Enter game code',
    'register.askCode': 'Ask the administrator for the code',
    'register.gameCode': 'Game code',
    'register.verifyCode': 'Verify code',
    'register.enterName': 'Enter your name',
    'register.name': 'Your name',
    'register.nameHint': 'What would you like to be called?',
    'register.join': 'Join game',
    'register.waiting': '⏳ Waiting for game to start',
    'register.waitingDesc': 'The administrator will start the game soon...',
    'register.welcome': 'Welcome',
    'register.verifying': 'Verifying...',
    'register.registering': 'Registering...',
    'register.error': 'Error',
    'register.invalidCode': 'Invalid code',
    'register.gameStarted': 'The game has already started. You can no longer connect.',
    'register.codeVerified': 'Code verified',
    'register.nameRequired': 'Please enter a valid name (minimum 2 characters)',
    'register.verifyFirst': 'Please verify the game code first',
    'register.nameTaken': 'This name is already taken, choose another name',
    'register.serverError': 'Server error. Please try again.',
    'register.connectionError': 'Connection error',
    'common.back': 'Back',
    
    // QuizPlay
    'quiz.waiting': '⏳ Waiting for game to start',
    'quiz.waitingDesc': 'The administrator will start the game soon...',
    'quiz.loading': 'Loading...',
    'quiz.question': 'Question',
    'quiz.submit': 'Submit answer',
    'quiz.correct': 'Correct answer!',
    'quiz.incorrect': 'Incorrect answer',
    'quiz.correctAnswer': 'The correct answer was',
    'quiz.alreadyAnswered': 'You have already answered this question',
    'quiz.gameEnded': '🎉 Quiz completed!',
    'quiz.gameEndedDesc': 'Congratulations! The game is over. Check your results below.',
    'quiz.finalScore': 'Your final score',
    'quiz.viewLeaderboard': 'View leaderboard',
    'quiz.answerRecorded': '✓ Answer recorded. Waiting for next question...',
    'quiz.player': 'Player',
    'quiz.anonymous': 'Anonymous',
    'quiz.playerNotIdentified': 'Player not identified. Please register again.',
    'quiz.resultsTitle': 'Question results',
    'quiz.yourAnswer': 'Your answer',
    'quiz.correctAnswerLabel': 'Correct answer',
    'quiz.correctLabel': '✓ Correct',
    'quiz.incorrectLabel': '✗ Incorrect',
    
    // Leaderboard
    'leaderboard.title': '🏆 Leaderboard',
    'leaderboard.subtitle': 'Top players in real-time',
    'leaderboard.loading': 'Loading leaderboard...',
    'leaderboard.empty': 'No players yet',
    'leaderboard.rank': 'Rank',
    'leaderboard.player': 'Player',
    'leaderboard.score': 'Score',
    'leaderboard.points': 'points',
    'leaderboard.point': 'point',
    'leaderboard.anonymous': 'Anonymous player',
    'leaderboard.pts': 'pts',
    'leaderboard.replay': 'Play again',
    'leaderboard.newPlayer': 'New player'
  },
  ru: {
    // Navbar
    'nav.register': 'Регистрация',
    'nav.play': '🎯 Играть',
    'nav.leaderboard': '🏆 Рейтинг',
    'nav.language': 'Язык',
    
    // PlayerRegister
    'register.enterCode': 'Введите код игры',
    'register.askCode': 'Попросите код у администратора',
    'register.gameCode': 'Код игры',
    'register.verifyCode': 'Проверить код',
    'register.enterName': 'Введите ваше имя',
    'register.name': 'Ваше имя',
    'register.nameHint': 'Как вас называть?',
    'register.join': 'Присоединиться к игре',
    'register.waiting': '⏳ Ожидание начала игры',
    'register.waitingDesc': 'Администратор скоро начнет игру...',
    'register.welcome': 'Добро пожаловать',
    'register.verifying': 'Проверка...',
    'register.registering': 'Регистрация...',
    'register.error': 'Ошибка',
    'register.invalidCode': 'Неверный код',
    'register.gameStarted': 'Игра уже началась. Вы больше не можете подключиться.',
    'register.codeVerified': 'Код проверен',
    'register.nameRequired': 'Пожалуйста, введите действительное имя (минимум 2 символа)',
    'register.verifyFirst': 'Сначала проверьте код игры',
    'register.nameTaken': 'Это имя уже занято, выберите другое имя',
    'register.serverError': 'Ошибка сервера. Пожалуйста, попробуйте снова.',
    'register.connectionError': 'Ошибка подключения',
    'common.back': 'Назад',
    
    // QuizPlay
    'quiz.waiting': '⏳ Ожидание начала игры',
    'quiz.waitingDesc': 'Администратор скоро начнет игру...',
    'quiz.loading': 'Загрузка...',
    'quiz.question': 'Вопрос',
    'quiz.submit': 'Отправить ответ',
    'quiz.correct': 'Правильный ответ!',
    'quiz.incorrect': 'Неправильный ответ',
    'quiz.correctAnswer': 'Правильный ответ был',
    'quiz.alreadyAnswered': 'Вы уже ответили на этот вопрос',
    'quiz.gameEnded': '🎉 Викторина завершена!',
    'quiz.gameEndedDesc': 'Поздравляем! Игра окончена. Посмотрите свои результаты ниже.',
    'quiz.finalScore': 'Ваш итоговый счет',
    'quiz.viewLeaderboard': 'Посмотреть рейтинг',
    'quiz.answerRecorded': '✓ Ответ записан. Ожидание следующего вопроса...',
    'quiz.player': 'Игрок',
    'quiz.anonymous': 'Анонимный',
    'quiz.playerNotIdentified': 'Игрок не идентифицирован. Пожалуйста, зарегистрируйтесь снова.',
    'quiz.resultsTitle': 'Результаты вопросов',
    'quiz.yourAnswer': 'Ваш ответ',
    'quiz.correctAnswerLabel': 'Правильный ответ',
    'quiz.correctLabel': '✓ Правильно',
    'quiz.incorrectLabel': '✗ Неправильно',
    
    // Leaderboard
    'leaderboard.title': '🏆 Рейтинг',
    'leaderboard.subtitle': 'Лучшие игроки в реальном времени',
    'leaderboard.loading': 'Загрузка рейтинга...',
    'leaderboard.empty': 'Пока нет игроков',
    'leaderboard.rank': 'Место',
    'leaderboard.player': 'Игрок',
    'leaderboard.score': 'Счет',
    'leaderboard.points': 'очков',
    'leaderboard.point': 'очко',
    'leaderboard.anonymous': 'Анонимный игрок',
    'leaderboard.pts': 'очков',
    'leaderboard.replay': 'Играть снова',
    'leaderboard.newPlayer': 'Новый игрок'
  }
}

// Langue actuelle (stockée dans localStorage)
const currentLanguage = ref(localStorage.getItem('gameLanguage') || 'fr')

// Fonction pour changer la langue
export function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage.value = lang
    localStorage.setItem('gameLanguage', lang)
  }
}

// Fonction pour obtenir la traduction
export function t(key) {
  const lang = currentLanguage.value
  return translations[lang]?.[key] || translations.fr[key] || key
}

// Composable Vue
export function useI18n() {
  const language = computed(() => currentLanguage.value)
  
  const changeLanguage = (lang) => {
    setLanguage(lang)
  }
  
  const translate = (key) => {
    return t(key)
  }
  
  return {
    language,
    changeLanguage,
    t: translate,
    availableLanguages: ['fr', 'en', 'ru']
  }
}

