# Migration vers MongoDB - Résumé

## ✅ Migration complétée

Tous les micro-services ont été migrés de fichiers JSON vers MongoDB avec les mêmes schémas de données.

## 📊 Schémas créés

### 1. Auth Service
- **Modèle**: `User`
- **Collection**: `users`
- **Schéma**:
  ```javascript
  {
    id: String (unique, indexed),
    name: String (required),
    score: Number (default: 0)
  }
  ```

### 2. Quiz Service
- **Modèle**: `Question`
- **Collection**: `questions`
- **Schéma**:
  ```javascript
  {
    id: String (unique, indexed),
    question: String (required),
    choices: [String] (required),
    answer: String (required)
  }
  ```

### 3. Game Service
- **Modèle**: `GameState`
- **Collection**: `gamestate`
- **Schéma**:
  ```javascript
  {
    isStarted: Boolean,
    currentQuestionIndex: Number,
    currentQuestionId: String,
    questionStartTime: Number,
    questionDuration: Number,
    connectedPlayers: [String],
    gameSessionId: String,
    gameCode: String,
    answers: Map,
    results: Map
  }
  ```

- **Modèle**: `Score`
- **Collection**: `scores`
- **Schéma**:
  ```javascript
  {
    playerId: String (unique, indexed),
    playerName: String (required),
    score: Number (default: 0)
  }
  ```

## 🔧 Fichiers modifiés

### Auth Service
- ✅ `node/auth-service/config/database.js` - Configuration MongoDB
- ✅ `node/auth-service/models/User.js` - Modèle User
- ✅ `node/auth-service/server.js` - Connexion MongoDB
- ✅ `node/auth-service/controllers/auth.controller.js` - Migration vers MongoDB

### Quiz Service
- ✅ `node/quiz-service/config/database.js` - Configuration MongoDB
- ✅ `node/quiz-service/models/Question.js` - Modèle Question
- ✅ `node/quiz-service/server.js` - Connexion MongoDB
- ✅ `node/quiz-service/controllers/quiz.controller.js` - Migration vers MongoDB

### Game Service
- ✅ `node/game-service/config/database.js` - Configuration MongoDB
- ✅ `node/game-service/models/GameState.js` - Modèle GameState
- ✅ `node/game-service/models/Score.js` - Modèle Score
- ✅ `node/game-service/server.js` - Connexion MongoDB
- ✅ `node/game-service/gameState.js` - Migration vers MongoDB (toutes les fonctions sont maintenant async)
- ✅ `node/game-service/controllers/game.controller.js` - Migration vers MongoDB

## 🔄 Changements importants

### 1. Toutes les fonctions sont maintenant asynchrones
- `gameState.getState()` → `await gameState.getState()`
- `gameState.startGame()` → `await gameState.startGame()`
- Toutes les fonctions de `gameState` sont maintenant async

### 2. Remplacement des fonctions JSON
- `readUsers()` / `writeUsers()` → `User.find()`, `User.save()`
- `readQuestions()` / `writeQuestions()` → `Question.find()`, `Question.save()`
- `readScores()` / `writeScores()` → `Score.find()`, `Score.save()`
- `readGameState()` / `writeGameState()` → `GameState.getCurrent()`, `GameState.updateCurrent()`

### 3. Configuration MongoDB
- URI par défaut: `mongodb://localhost:27017/intelectgame`
- Peut être configuré via variable d'environnement: `MONGODB_URI`

## 🚀 Démarrage

### Prérequis
1. MongoDB doit être démarré et accessible
2. Variable d'environnement `MONGODB_URI` (optionnel, utilise `mongodb://localhost:27017/intelectgame` par défaut)

### Démarrage des services
```bash
# Auth Service
cd node/auth-service
npm start

# Quiz Service
cd node/quiz-service
npm start

# Game Service
cd node/game-service
npm start
```

## 📝 Notes

- Les fichiers JSON dans `data/` ne sont plus utilisés mais peuvent être conservés pour référence
- Toutes les données sont maintenant stockées dans MongoDB
- Les schémas MongoDB correspondent exactement aux structures JSON précédentes
- Les index sont créés sur les champs `id` et `playerId` pour de meilleures performances

## ⚠️ Migration des données existantes

Si vous avez des données dans les fichiers JSON et souhaitez les migrer vers MongoDB, vous pouvez créer un script de migration qui :
1. Lit les fichiers JSON
2. Insère les données dans MongoDB en utilisant les modèles créés

