# Guide de débogage - Front-end ne démarre pas

## Problème

Le jeu se lance bien dans le bot Telegram mais pas sur le front-end. Le front-end enregistre le code du joueur et le joueur, mais quand l'admin lance le jeu, il se lance dans le bot mais pas dans le front-end du joueur.

## Points de vérification

### 1. Vérifier que le joueur est enregistré

**Dans la console du navigateur**, chercher :
```
📝 Registering player: [playerId]
✅ Player registered: [playerId]
```

**Dans les logs du serveur** :
```bash
docker-compose logs game | grep "Player registered"
```

### 2. Vérifier que le socket est connecté

**Dans la console du navigateur**, chercher :
```
✅ WebSocket connected in QuizPlay: [socketId]
✅ WebSocket connected: [socketId]
```

**Dans les logs du serveur** :
```bash
docker-compose logs game | grep "WebSocket client connected"
```

### 3. Vérifier que les événements sont émis

**Dans les logs du serveur**, quand l'admin lance le jeu :
```bash
docker-compose logs game | grep -E "(game:started|question:next|Emitted)"
```

Vous devriez voir :
```
🚀 Starting game with X connected clients
📢 Emitted 'game:started' event to all clients
📢 Emitted 'question:next' event to all clients
```

### 4. Vérifier que les événements sont reçus

**Dans la console du navigateur**, chercher :
```
🎮 Game started event received in QuizPlay: [data]
❓ Question next received in QuizPlay: [data]
📡 Socket event received in QuizPlay: game:started [args]
```

### 5. Vérifier l'état du jeu via polling

**Dans la console du navigateur**, chercher :
```
📊 loadGameState() - Current state: { isStarted: true, currentQuestionId: ... }
🔄 Loading current question in loadGameState()
✅ Found question: [question text]
```

## Solutions appliquées

### 1. Double écoute des événements

Le composant écoute maintenant les événements de deux façons :
- Via `socketService.on()` (gestion centralisée)
- Directement sur `this.socket.on()` (pour ne pas manquer l'événement)

### 2. Enregistrement garanti du joueur

La fonction `ensurePlayerRegistered()` :
- Attend que le socket soit connecté
- Enregistre le joueur
- Vérifie immédiatement l'état du jeu après l'enregistrement
- Charge la question si le jeu a déjà démarré

### 3. Polling de secours

Le composant continue de poller l'état du jeu toutes les 1 seconde pour :
- Détecter les changements d'état si les événements Socket.io sont manqués
- Charger les questions si elles ne sont pas reçues via Socket.io
- Gérer les cas où le joueur se connecte après le démarrage du jeu

### 4. Logs améliorés

Ajout de logs détaillés à chaque étape pour faciliter le débogage.

## Test du flux complet

1. **Ouvrir la console du navigateur** (F12)
2. **Un joueur s'enregistre** avec le code
   - Vérifier : `📝 Registering player: [playerId]`
   - Vérifier : `✅ Player registered: [playerId]` (dans les logs serveur)
3. **L'admin lance le jeu**
   - Vérifier dans les logs serveur : `📢 Emitted 'game:started' event to all clients`
   - Vérifier dans la console : `🎮 Game started event received in QuizPlay`
   - Vérifier dans la console : `✅ Question loaded after game:started event`
4. **Le joueur devrait voir la question** immédiatement

## Si le problème persiste

### Vérifier les logs du serveur

```bash
# Logs du game-service
docker-compose logs game --tail 100 | grep -E "(game:started|Player registered|WebSocket)"

# Compter les clients connectés
docker-compose logs game | grep "Starting game with" | tail -1
```

### Vérifier la connexion WebSocket

Dans la console du navigateur, vérifier :
```javascript
// Vérifier si le socket est connecté
socketService.getSocket().connected  // devrait être true

// Vérifier l'ID du socket
socketService.getSocket().id  // devrait avoir un ID

// Vérifier les listeners
socketService.getSocket().listeners('game:started')  // devrait avoir des listeners
```

### Vérifier l'état du jeu via API

```bash
# Vérifier l'état du jeu
curl http://localhost:3000/game/state

# Vérifier les joueurs connectés
curl http://localhost:3000/game/players
```

## Problèmes connus et solutions

### Problème : Le joueur n'est pas enregistré quand le jeu démarre

**Solution** : Le polling détectera le changement d'état et chargera la question automatiquement.

### Problème : Les événements Socket.io sont manqués

**Solution** : Le polling toutes les 1 seconde sert de filet de sécurité.

### Problème : Le socket n'est pas connecté

**Solution** : `ensurePlayerRegistered()` attend la connexion avant d'enregistrer le joueur.

## Fichiers modifiés

- `vue/front/src/components/player/QuizPlay.vue` - Double écoute, enregistrement garanti, logs améliorés
- `vue/front/src/services/socketService.js` - Gestion améliorée des erreurs






