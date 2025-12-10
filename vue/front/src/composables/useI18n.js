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
    'leaderboard.newPlayer': 'Nouveau joueur',
    
    // PlayerPanel
    'panel.title': 'Jouer',
    'panel.subtitle': 'Répondez aux questions',
    'panel.anonymous': 'Anonyme',
    'panel.score': 'Score',
    'panel.loading': 'Chargement...',
    'panel.loadQuestions': 'Charger les questions',
    'panel.noQuestions': 'Aucune question disponible. Cliquez sur "Charger les questions" pour commencer.',
    'panel.loadError': 'Erreur lors du chargement des questions',
    'panel.playerRequired': 'Joueur requis pour répondre',
    'panel.answerError': 'Erreur lors de l\'envoi de la réponse',
    
    // Admin Navbar
    'admin.nav.dashboard': 'Dashboard',
    'admin.nav.questions': 'Questions',
    'admin.nav.logout': 'Déconnexion',
    
    // Admin Dashboard
    'admin.dashboard.title': '🎯 Dashboard Administrateur',
    'admin.dashboard.subtitle': 'Gérez votre jeu de questions-réponses',
    'admin.dashboard.gameCode': 'Code de la partie',
    'admin.dashboard.shareCode': 'Partagez ce code avec les joueurs pour qu\'ils puissent se connecter',
    'admin.dashboard.copyCode': 'Copier le code',
    'admin.dashboard.codeCopied': 'Code copié !',
    'admin.dashboard.connectedPlayers': 'Joueurs connectés',
    'admin.dashboard.gameStatus': 'Statut du jeu',
    'admin.dashboard.statusInProgress': 'En cours',
    'admin.dashboard.statusWaiting': 'En attente',
    'admin.dashboard.currentQuestion': 'Question actuelle',
    'admin.dashboard.connectedPlayersList': 'Joueurs connectés :',
    'admin.dashboard.anonymousPlayer': 'Joueur anonyme',
    'admin.dashboard.timePerQuestion': '⏱️ Temps par question (en secondes)',
    'admin.dashboard.timeMinMax': '(Minimum: 5s, Maximum: 300s)',
    'admin.dashboard.startGame': '▶️ Démarrer le jeu',
    'admin.dashboard.nextQuestion': '➡️ Question suivante',
    'admin.dashboard.endGame': '⏹️ Terminer le jeu',
    'admin.dashboard.deleteGame': '🗑️ Supprimer la partie',
    'admin.dashboard.manageQuestions': 'Gérer les questions',
    'admin.dashboard.manageQuestionsDesc': 'Ajoutez, modifiez ou supprimez des questions',
    'admin.dashboard.viewLeaderboard': 'Voir le classement',
    'admin.dashboard.viewLeaderboardDesc': 'Consultez le classement des joueurs',
    'admin.dashboard.noQuestions': 'Aucune question disponible. Veuillez ajouter des questions avant de démarrer le jeu.',
    'admin.dashboard.nextQuestionShown': 'Question suivante affichée',
    'admin.dashboard.nextQuestionError': 'Erreur lors du passage à la question suivante',
    'admin.dashboard.confirmEndGame': 'Êtes-vous sûr de vouloir terminer le jeu ?',
    'admin.dashboard.gameEnded': 'Le jeu est terminé',
    'admin.dashboard.gameDeleted': 'Partie supprimée avec succès',
    
    // Admin Login
    'admin.login.title': 'Connexion Admin',
    'admin.login.subtitle': 'Accédez au panneau d\'administration',
    'admin.login.username': 'Nom d\'utilisateur',
    'admin.login.usernamePlaceholder': 'Entrez votre nom d\'utilisateur',
    'admin.login.password': 'Mot de passe',
    'admin.login.passwordPlaceholder': 'Entrez votre mot de passe',
    'admin.login.submit': 'Se connecter',
    'admin.login.invalidCredentials': 'Identifiants invalides',
    
    // Admin Questions
    'admin.questions.title': '📝 Gestion des Questions',
    'admin.questions.subtitle': 'Ajoutez, modifiez ou supprimez des questions pour votre quiz',
    'admin.questions.addTitle': 'Ajouter une nouvelle question',
    'admin.questions.question': 'Question',
    'admin.questions.questionPlaceholder': 'Entrez votre question ici...',
    'admin.questions.choices': 'Choix (séparés par des virgules)',
    'admin.questions.choicesPlaceholder': 'Ex: Option 1, Option 2, Option 3, Option 4',
    'admin.questions.correctAnswer': 'Réponse correcte',
    'admin.questions.correctAnswerPlaceholder': 'La réponse exacte (doit correspondre à un des choix)',
    'admin.questions.addButton': '➕ Ajouter la question',
    'admin.questions.listTitle': 'Liste des Questions',
    'admin.questions.loading': 'Chargement...',
    'admin.questions.empty': 'Aucune question pour le moment',
    'admin.questions.delete': 'Supprimer',
    'admin.questions.confirmDelete': 'Êtes-vous sûr de vouloir supprimer cette question ?',
    'admin.questions.allFieldsRequired': 'Tous les champs sont requis',
    'admin.questions.minChoices': 'Au moins 2 choix sont requis',
    'admin.questions.addSuccess': 'Question ajoutée avec succès !',
    'admin.questions.addError': 'Erreur lors de l\'ajout de la question',
    'admin.questions.loadError': 'Erreur lors du chargement des questions',
    'admin.questions.deleteError': 'Erreur lors de la suppression'
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
    'leaderboard.newPlayer': 'New player',
    
    // PlayerPanel
    'panel.title': 'Play',
    'panel.subtitle': 'Answer the questions',
    'panel.anonymous': 'Anonymous',
    'panel.score': 'Score',
    'panel.loading': 'Loading...',
    'panel.loadQuestions': 'Load questions',
    'panel.noQuestions': 'No questions available. Click "Load questions" to start.',
    'panel.loadError': 'Error loading questions',
    'panel.playerRequired': 'Player required to answer',
    'panel.answerError': 'Error submitting answer',
    
    // Admin Navbar
    'admin.nav.dashboard': 'Dashboard',
    'admin.nav.questions': 'Questions',
    'admin.nav.logout': 'Logout',
    
    // Admin Dashboard
    'admin.dashboard.title': '🎯 Administrator Dashboard',
    'admin.dashboard.subtitle': 'Manage your quiz game',
    'admin.dashboard.gameCode': 'Game code',
    'admin.dashboard.shareCode': 'Share this code with players so they can connect',
    'admin.dashboard.copyCode': 'Copy code',
    'admin.dashboard.codeCopied': 'Code copied!',
    'admin.dashboard.connectedPlayers': 'Connected players',
    'admin.dashboard.gameStatus': 'Game status',
    'admin.dashboard.statusInProgress': 'In progress',
    'admin.dashboard.statusWaiting': 'Waiting',
    'admin.dashboard.currentQuestion': 'Current question',
    'admin.dashboard.connectedPlayersList': 'Connected players:',
    'admin.dashboard.anonymousPlayer': 'Anonymous player',
    'admin.dashboard.timePerQuestion': '⏱️ Time per question (in seconds)',
    'admin.dashboard.timeMinMax': '(Minimum: 5s, Maximum: 300s)',
    'admin.dashboard.startGame': '▶️ Start game',
    'admin.dashboard.nextQuestion': '➡️ Next question',
    'admin.dashboard.endGame': '⏹️ End game',
    'admin.dashboard.deleteGame': '🗑️ Delete game',
    'admin.dashboard.manageQuestions': 'Manage questions',
    'admin.dashboard.manageQuestionsDesc': 'Add, modify or delete questions',
    'admin.dashboard.viewLeaderboard': 'View leaderboard',
    'admin.dashboard.viewLeaderboardDesc': 'Check player rankings',
    'admin.dashboard.noQuestions': 'No questions available. Please add questions before starting the game.',
    'admin.dashboard.nextQuestionShown': 'Next question displayed',
    'admin.dashboard.nextQuestionError': 'Error moving to next question',
    'admin.dashboard.confirmEndGame': 'Are you sure you want to end the game?',
    'admin.dashboard.gameEnded': 'Game ended',
    'admin.dashboard.gameDeleted': 'Game deleted successfully',
    
    // Admin Login
    'admin.login.title': 'Admin Login',
    'admin.login.subtitle': 'Access the administration panel',
    'admin.login.username': 'Username',
    'admin.login.usernamePlaceholder': 'Enter your username',
    'admin.login.password': 'Password',
    'admin.login.passwordPlaceholder': 'Enter your password',
    'admin.login.submit': 'Login',
    'admin.login.invalidCredentials': 'Invalid credentials',
    
    // Admin Questions
    'admin.questions.title': '📝 Question Management',
    'admin.questions.subtitle': 'Add, modify or delete questions for your quiz',
    'admin.questions.addTitle': 'Add a new question',
    'admin.questions.question': 'Question',
    'admin.questions.questionPlaceholder': 'Enter your question here...',
    'admin.questions.choices': 'Choices (comma-separated)',
    'admin.questions.choicesPlaceholder': 'Ex: Option 1, Option 2, Option 3, Option 4',
    'admin.questions.correctAnswer': 'Correct answer',
    'admin.questions.correctAnswerPlaceholder': 'The exact answer (must match one of the choices)',
    'admin.questions.addButton': '➕ Add question',
    'admin.questions.listTitle': 'Questions List',
    'admin.questions.loading': 'Loading...',
    'admin.questions.empty': 'No questions yet',
    'admin.questions.delete': 'Delete',
    'admin.questions.confirmDelete': 'Are you sure you want to delete this question?',
    'admin.questions.allFieldsRequired': 'All fields are required',
    'admin.questions.minChoices': 'At least 2 choices are required',
    'admin.questions.addSuccess': 'Question added successfully!',
    'admin.questions.addError': 'Error adding question',
    'admin.questions.loadError': 'Error loading questions',
    'admin.questions.deleteError': 'Error deleting question'
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
    'leaderboard.newPlayer': 'Новый игрок',
    
    // PlayerPanel
    'panel.title': 'Играть',
    'panel.subtitle': 'Ответьте на вопросы',
    'panel.anonymous': 'Анонимный',
    'panel.score': 'Счет',
    'panel.loading': 'Загрузка...',
    'panel.loadQuestions': 'Загрузить вопросы',
    'panel.noQuestions': 'Нет доступных вопросов. Нажмите "Загрузить вопросы", чтобы начать.',
    'panel.loadError': 'Ошибка при загрузке вопросов',
    'panel.playerRequired': 'Требуется игрок для ответа',
    'panel.answerError': 'Ошибка при отправке ответа',
    
    // Admin Navbar
    'admin.nav.dashboard': 'Панель управления',
    'admin.nav.questions': 'Вопросы',
    'admin.nav.logout': 'Выход',
    
    // Admin Dashboard
    'admin.dashboard.title': '🎯 Панель администратора',
    'admin.dashboard.subtitle': 'Управляйте своей викториной',
    'admin.dashboard.gameCode': 'Код игры',
    'admin.dashboard.shareCode': 'Поделитесь этим кодом с игроками, чтобы они могли подключиться',
    'admin.dashboard.copyCode': 'Копировать код',
    'admin.dashboard.codeCopied': 'Код скопирован!',
    'admin.dashboard.connectedPlayers': 'Подключенные игроки',
    'admin.dashboard.gameStatus': 'Статус игры',
    'admin.dashboard.statusInProgress': 'В процессе',
    'admin.dashboard.statusWaiting': 'Ожидание',
    'admin.dashboard.currentQuestion': 'Текущий вопрос',
    'admin.dashboard.connectedPlayersList': 'Подключенные игроки:',
    'admin.dashboard.anonymousPlayer': 'Анонимный игрок',
    'admin.dashboard.timePerQuestion': '⏱️ Время на вопрос (в секундах)',
    'admin.dashboard.timeMinMax': '(Минимум: 5с, Максимум: 300с)',
    'admin.dashboard.startGame': '▶️ Начать игру',
    'admin.dashboard.nextQuestion': '➡️ Следующий вопрос',
    'admin.dashboard.endGame': '⏹️ Завершить игру',
    'admin.dashboard.deleteGame': '🗑️ Удалить игру',
    'admin.dashboard.manageQuestions': 'Управление вопросами',
    'admin.dashboard.manageQuestionsDesc': 'Добавляйте, изменяйте или удаляйте вопросы',
    'admin.dashboard.viewLeaderboard': 'Посмотреть рейтинг',
    'admin.dashboard.viewLeaderboardDesc': 'Проверьте рейтинг игроков',
    'admin.dashboard.noQuestions': 'Нет доступных вопросов. Пожалуйста, добавьте вопросы перед запуском игры.',
    'admin.dashboard.nextQuestionShown': 'Следующий вопрос отображен',
    'admin.dashboard.nextQuestionError': 'Ошибка при переходе к следующему вопросу',
    'admin.dashboard.confirmEndGame': 'Вы уверены, что хотите завершить игру?',
    'admin.dashboard.gameEnded': 'Игра завершена',
    'admin.dashboard.gameDeleted': 'Игра успешно удалена',
    
    // Admin Login
    'admin.login.title': 'Вход администратора',
    'admin.login.subtitle': 'Доступ к панели администратора',
    'admin.login.username': 'Имя пользователя',
    'admin.login.usernamePlaceholder': 'Введите ваше имя пользователя',
    'admin.login.password': 'Пароль',
    'admin.login.passwordPlaceholder': 'Введите ваш пароль',
    'admin.login.submit': 'Войти',
    'admin.login.invalidCredentials': 'Неверные учетные данные',
    
    // Admin Questions
    'admin.questions.title': '📝 Управление вопросами',
    'admin.questions.subtitle': 'Добавляйте, изменяйте или удаляйте вопросы для вашей викторины',
    'admin.questions.addTitle': 'Добавить новый вопрос',
    'admin.questions.question': 'Вопрос',
    'admin.questions.questionPlaceholder': 'Введите ваш вопрос здесь...',
    'admin.questions.choices': 'Варианты (разделенные запятыми)',
    'admin.questions.choicesPlaceholder': 'Например: Вариант 1, Вариант 2, Вариант 3, Вариант 4',
    'admin.questions.correctAnswer': 'Правильный ответ',
    'admin.questions.correctAnswerPlaceholder': 'Точный ответ (должен соответствовать одному из вариантов)',
    'admin.questions.addButton': '➕ Добавить вопрос',
    'admin.questions.listTitle': 'Список вопросов',
    'admin.questions.loading': 'Загрузка...',
    'admin.questions.empty': 'Пока нет вопросов',
    'admin.questions.delete': 'Удалить',
    'admin.questions.confirmDelete': 'Вы уверены, что хотите удалить этот вопрос?',
    'admin.questions.allFieldsRequired': 'Все поля обязательны',
    'admin.questions.minChoices': 'Требуется минимум 2 варианта',
    'admin.questions.addSuccess': 'Вопрос успешно добавлен!',
    'admin.questions.addError': 'Ошибка при добавлении вопроса',
    'admin.questions.loadError': 'Ошибка при загрузке вопросов',
    'admin.questions.deleteError': 'Ошибка при удалении вопроса'
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

