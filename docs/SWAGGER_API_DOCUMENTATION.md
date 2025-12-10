# 📚 Documentation Swagger API - IntelectGame

## 🌐 Accès aux Documentations Swagger

### Services Individuels

#### Auth Service
- **URL Swagger UI :** http://localhost:3001/api-docs
- **URL API :** http://localhost:3001
- **Description :** Service d'authentification et de gestion des joueurs

#### Quiz Service
- **URL Swagger UI :** http://localhost:3002/api-docs
- **URL API :** http://localhost:3002
- **Description :** Service de gestion des questions

#### Game Service
- **URL Swagger UI :** http://localhost:3003/api-docs
- **URL API :** http://localhost:3003
- **Description :** Service de jeu avec WebSocket

#### API Gateway
- **URL Swagger UI :** http://localhost:3000/api-docs
- **URL API :** http://localhost:3000
- **Description :** Point d'entrée unique pour tous les services

## 📡 Endpoints API

### 🔐 Auth Service (http://localhost:3001)

#### Admin
- `POST /auth/admin/login` - Connexion admin
  - **Swagger :** http://localhost:3001/api-docs#/Admin/post_auth_admin_login
  - **Body :** `{ "username": "admin", "password": "admin" }`
  - **Response :** `{ "token": "..." }`

#### Players
- `POST /auth/players/register` - Inscription joueur
  - **Swagger :** http://localhost:3001/api-docs#/Players/post_auth_players_register
  - **Body :** `{ "name": "Alice" }`
  - **Response :** `{ "id": "p123...", "name": "Alice" }`

- `GET /auth/players` - Liste des joueurs
  - **Swagger :** http://localhost:3001/api-docs#/Players/get_auth_players
  - **Response :** `[{ "id": "p123...", "name": "Alice" }]`

- `GET /auth/players/:id` - Détails d'un joueur
  - **Swagger :** http://localhost:3001/api-docs#/Players/get_auth_players__id_
  - **Response :** `{ "id": "p123...", "name": "Alice" }`

### 📝 Quiz Service (http://localhost:3002)

#### Questions Publiques
- `GET /quiz/all` - Liste des questions (sans réponses)
  - **Swagger :** http://localhost:3002/api-docs#/Questions/get_quiz_all
  - **Response :** `[{ "id": "q123...", "question": "...", "choices": [...] }]`

- `GET /quiz/questions` - Alias pour /quiz/all
  - **Swagger :** http://localhost:3002/api-docs#/Questions/get_quiz_questions

- `GET /quiz/full` - Liste complète des questions (avec réponses)
  - **Swagger :** http://localhost:3002/api-docs#/Admin/get_quiz_full
  - **Response :** `[{ "id": "q123...", "question": "...", "choices": [...], "answer": "..." }]`

#### Admin (Création/Modification)
- `POST /quiz/create` - Créer une question
  - **Swagger :** http://localhost:3002/api-docs#/Admin/post_quiz_create
  - **Body :** `{ "question": "...", "choices": [...], "answer": "..." }`

- `PUT /quiz/:id` - Modifier une question
  - **Swagger :** http://localhost:3002/api-docs#/Admin/put_quiz__id_

- `DELETE /quiz/:id` - Supprimer une question
  - **Swagger :** http://localhost:3002/api-docs#/Admin/delete_quiz__id_

### 🎮 Game Service (http://localhost:3003)

#### Réponses
- `POST /game/answer` - Soumettre une réponse
  - **Swagger :** http://localhost:3003/api-docs#/Answers/post_game_answer
  - **Body :** `{ "playerId": "p123...", "questionId": "q123...", "answer": "Paris" }`
  - **Response :** `{ "correct": true, "correctAnswer": "Paris", "playerName": "Alice" }`

#### Scores
- `GET /game/score/:playerId` - Score d'un joueur
  - **Swagger :** http://localhost:3003/api-docs#/Scores/get_game_score__playerId_
  - **Response :** `{ "playerId": "p123...", "playerName": "Alice", "score": 5 }`

- `GET /game/leaderboard` - Classement
  - **Swagger :** http://localhost:3003/api-docs#/Scores/get_game_leaderboard
  - **Response :** `[{ "playerId": "p123...", "playerName": "Alice", "score": 5 }]`

#### État du Jeu
- `GET /game/state` - État actuel du jeu
  - **Swagger :** http://localhost:3003/api-docs#/State/get_game_state
  - **Response :** `{ "isStarted": true, "currentQuestionIndex": 0, ... }`

- `GET /game/code` - Code d'accès au jeu
  - **Swagger :** http://localhost:3003/api-docs#/State/get_game_code
  - **Response :** `{ "gameCode": "ABC123" }`

- `POST /game/verify-code` - Vérifier un code de jeu
  - **Swagger :** http://localhost:3003/api-docs#/State/post_game_verify-code
  - **Body :** `{ "code": "ABC123" }`
  - **Response :** `{ "valid": true, "isStarted": false }`

#### Joueurs Connectés
- `GET /game/players/count` - Nombre de joueurs connectés
  - **Swagger :** http://localhost:3003/api-docs#/Players/get_game_players_count
  - **Response :** `{ "count": 5 }`

- `GET /game/players` - Liste des joueurs connectés
  - **Swagger :** http://localhost:3003/api-docs#/Players/get_game_players
  - **Response :** `{ "players": [{ "id": "p123...", "name": "Alice" }], "count": 1 }`

#### Gestion du Jeu (Admin)
- `POST /game/start` - Démarrer le jeu
  - **Swagger :** http://localhost:3003/api-docs#/Game/post_game_start
  - **Body :** `{ "questionDuration": 30 }` (optionnel, défaut: 30 secondes)

- `POST /game/next` - Question suivante
  - **Swagger :** http://localhost:3003/api-docs#/Game/post_game_next

- `POST /game/end` - Terminer le jeu
  - **Swagger :** http://localhost:3003/api-docs#/Game/post_game_end

- `DELETE /game/delete` - Supprimer le jeu
  - **Swagger :** http://localhost:3003/api-docs#/Game/delete_game_delete

#### WebSocket
- `GET /game/websocket/info` - Informations sur les WebSockets
  - **Swagger :** http://localhost:3003/api-docs#/WebSocket/get_game_websocket_info
  - **Documentation complète :** Voir `node/game-service/WEBSOCKET_DOCUMENTATION.md`

## 🔌 WebSocket Events (game-service)

Les WebSockets utilisent Socket.io et se connectent sur `http://localhost:3003` avec le path `/socket.io`.

### Événements Client → Serveur

#### `register`
Enregistre un joueur pour recevoir les mises à jour en temps réel.

```javascript
socket.emit('register', 'p1234567890');
```

### Événements Serveur → Client

#### `game:code`
Code de jeu reçu après l'enregistrement.

```json
{
  "gameCode": "ABC123"
}
```

#### `game:started`
Jeu démarré par l'admin.

```json
{
  "questionIndex": 0,
  "totalQuestions": 10,
  "gameCode": "ABC123"
}
```

#### `question:next`
Nouvelle question affichée.

```json
{
  "question": {
    "id": "q1234567890",
    "question": "What is the capital of France?",
    "choices": ["Paris", "London", "Berlin", "Madrid"]
  },
  "questionIndex": 0,
  "totalQuestions": 10,
  "startTime": 1234567890000,
  "duration": 30000
}
```

#### `players:count`
Mise à jour du nombre de joueurs connectés.

```json
{
  "count": 5
}
```

#### `score:update`
Mise à jour du score d'un joueur.

```json
{
  "playerId": "p1234567890",
  "score": 5
}
```

#### `leaderboard:update`
Mise à jour du classement.

```json
[
  {
    "playerId": "p1234567890",
    "playerName": "Alice",
    "score": 5
  }
]
```

#### `game:ended`
Jeu terminé.

```json
{
  "message": "Le jeu est terminé",
  "leaderboard": [...]
}
```

#### `error`
Erreur survenue.

```json
{
  "code": "GAME_ALREADY_STARTED",
  "message": "Le jeu a déjà commencé. Vous ne pouvez plus vous connecter."
}
```

**Codes d'erreur possibles :**
- `GAME_ALREADY_STARTED` - Le jeu a déjà commencé
- `INVALID_PLAYER_ID` - ID de joueur invalide
- `REGISTRATION_ERROR` - Erreur lors de l'enregistrement

## 📖 Documentation Complète WebSocket

Pour la documentation complète des WebSockets, consultez :
- **Fichier :** `node/game-service/WEBSOCKET_DOCUMENTATION.md`
- **Endpoint :** `GET /game/websocket/info`

## 🧪 Tester les APIs

### Avec Swagger UI

1. Accédez à l'URL Swagger du service (ex: http://localhost:3001/api-docs)
2. Cliquez sur un endpoint pour voir les détails
3. Cliquez sur "Try it out"
4. Remplissez les paramètres
5. Cliquez sur "Execute"

### Avec cURL

```bash
# Exemple : Créer un joueur
curl -X POST http://localhost:3001/auth/players/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

# Exemple : Obtenir le classement
curl http://localhost:3003/game/leaderboard

# Exemple : Soumettre une réponse
curl -X POST http://localhost:3003/game/answer \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "p1234567890",
    "questionId": "q1234567890",
    "answer": "Paris"
  }'
```

### Avec Postman/Apidog

1. Importez la spécification OpenAPI depuis Swagger UI
2. Ou créez manuellement les requêtes en suivant la documentation Swagger

**Note :** Les WebSockets ne peuvent pas être testés avec Postman/Apidog. Utilisez les scripts de test fournis :
- `test-websocket.js` - Test simple
- `test-socket-complete.js` - Test complet

Voir `TEST_WEBSOCKET_QUICKSTART.md` pour plus de détails.

## 🔗 Liens Utiles

- [Documentation WebSocket complète](./WEBSOCKET_DOCUMENTATION.md)
- [Guide de test WebSocket](../TEST_WEBSOCKET_QUICKSTART.md)
- [Documentation complète des tests WebSocket](../docs/TESTING_WEBSOCKETS.md)
