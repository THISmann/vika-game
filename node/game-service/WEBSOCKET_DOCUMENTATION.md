# WebSocket API Documentation

## Connexion

Les WebSockets utilisent Socket.io et se connectent au game-service sur le port 3003.

**URL de connexion :**
- Développement : `http://localhost:3003`
- Production : Dépend de votre configuration (généralement via le proxy Nginx)

**Path :** `/socket.io`

**Transports :** `['polling', 'websocket']`

## Événements Émis par le Client (Client → Server)

### `register`

Enregistre un joueur pour recevoir les mises à jour en temps réel.

**Payload :**
```javascript
playerId  // string - ID du joueur à enregistrer
```

**Exemple :**
```javascript
socket.emit('register', 'p1234567890');
```

**Réponses possibles :**
- `game:code` - Code de jeu reçu
- `error` - Erreur d'enregistrement
- `players:count` - Mise à jour du nombre de joueurs connectés

## Événements Émis par le Serveur (Server → Client)

### `game:code`

Envoyé après l'enregistrement d'un joueur avec le code de jeu actuel.

**Payload :**
```json
{
  "gameCode": "ABC123"
}
```

### `game:started`

Émis quand l'admin démarre le jeu.

**Payload :**
```json
{
  "questionIndex": 0,
  "totalQuestions": 10,
  "gameCode": "ABC123"
}
```

### `question:next`

Émis quand une nouvelle question est affichée.

**Payload :**
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

### `players:count`

Émis quand le nombre de joueurs connectés change.

**Payload :**
```json
{
  "count": 5
}
```

### `score:update`

Émis quand le score d'un joueur est mis à jour.

**Payload :**
```json
{
  "playerId": "p1234567890",
  "score": 5
}
```

### `leaderboard:update`

Émis quand le classement est mis à jour.

**Payload :**
```json
[
  {
    "playerId": "p1234567890",
    "playerName": "Alice",
    "score": 5
  },
  {
    "playerId": "p0987654321",
    "playerName": "Bob",
    "score": 3
  }
]
```

### `game:ended`

Émis quand le jeu se termine.

**Payload :**
```json
{
  "message": "Le jeu est terminé",
  "leaderboard": [
    {
      "playerId": "p1234567890",
      "playerName": "Alice",
      "score": 10
    }
  ]
}
```

### `game:deleted`

Émis quand l'admin supprime le jeu.

**Payload :**
```json
{
  "message": "Partie supprimée"
}
```

### `error`

Émis en cas d'erreur.

**Payload :**
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

## Exemple d'utilisation complète

```javascript
const io = require('socket.io-client');

// Connexion
const socket = io('http://localhost:3003', {
  path: '/socket.io',
  transports: ['polling', 'websocket']
});

// Écouter la connexion
socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Enregistrer un joueur
  socket.emit('register', 'p1234567890');
});

// Écouter les événements
socket.on('game:code', (data) => {
  console.log('Game code:', data.gameCode);
});

socket.on('game:started', (data) => {
  console.log('Game started!', data);
});

socket.on('question:next', (data) => {
  console.log('Question:', data.question.question);
  console.log('Choices:', data.question.choices);
});

socket.on('players:count', (data) => {
  console.log('Players count:', data.count);
});

socket.on('score:update', (data) => {
  console.log('Score updated:', data);
});

socket.on('leaderboard:update', (data) => {
  console.log('Leaderboard:', data);
});

socket.on('game:ended', (data) => {
  console.log('Game ended:', data);
});

socket.on('error', (error) => {
  console.error('Error:', error);
});
```

## Notes importantes

1. **Reconnexion automatique** : Socket.io gère automatiquement la reconnexion en cas de déconnexion.

2. **Réenregistrement** : Après une reconnexion, vous devez réenregistrer le joueur :
   ```javascript
   socket.on('reconnect', () => {
     socket.emit('register', playerId);
   });
   ```

3. **Polling fallback** : Socket.io utilise d'abord le polling HTTP, puis upgrade vers WebSocket si disponible.

4. **CORS** : Le serveur accepte les connexions depuis n'importe quelle origine en développement.

