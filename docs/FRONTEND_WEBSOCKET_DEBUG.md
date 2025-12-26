# Debug: Frontend WebSocket Events Not Received

## Problème

Le front-end Vue ne reçoit pas les événements WebSocket :
1. Quand un joueur s'enregistre depuis le front-end, il n'apparaît pas dans le dashboard admin
2. Quand l'admin lance le jeu depuis le dashboard, ça ne se lance pas dans l'interface front-end Vue
3. Mais Telegram fonctionne à 100%

## Analyse

### 1. Enregistrement du joueur

**Flux attendu** :
1. Joueur s'enregistre via `PlayerRegister.vue` → `socketService.registerPlayer(playerId)`
2. `socketService` émet `socket.emit('register', playerId)`
3. Serveur `game-service/server.js` écoute `socket.on('register', ...)`
4. Serveur ajoute le joueur à la liste des connectés
5. Serveur émet `io.emit('players:count', { count: connectedCount })`
6. Dashboard admin écoute `socket.on('players:count', ...)` et met à jour l'affichage

**Problème potentiel** :
- Le joueur s'enregistre mais l'événement `players:count` n'est pas émis ou reçu
- Le dashboard n'écoute pas correctement l'événement

### 2. Démarrage du jeu

**Flux attendu** :
1. Admin clique sur "Démarrer le jeu" → `AdminDashboard.vue` → `startGame()`
2. Requête HTTP POST `/game/start` → `game.controller.js` → `startGame()`
3. Controller émet `req.io.emit('game:started', ...)` et `req.io.emit('question:next', ...)`
4. Front-end `QuizPlay.vue` écoute `socket.on('game:started', ...)` et `socket.on('question:next', ...)`
5. Front-end charge la question et démarre le timer

**Problème potentiel** :
- L'événement `game:started` est émis mais pas reçu par le front-end
- Le front-end n'écoute pas correctement l'événement
- Le socket n'est pas connecté au moment de l'émission

## Solutions appliquées

### 1. Logs améliorés

**Serveur (`game-service/server.js`)** :
- Ajout de logs pour l'émission de `players:count`
- Log du nombre de clients connectés avant l'émission

**Serveur (`game-service/controllers/game.controller.js`)** :
- Ajout de logs pour l'émission de `game:started` et `question:next`
- Log du nombre de clients connectés avant l'émission

**Front-end (`AdminDashboard.vue`)** :
- Ajout de logs pour la réception de `players:count` et `game:started`
- Rechargement automatique de la liste des joueurs après réception de `players:count`

**Front-end (`QuizPlay.vue`)** :
- Ajout de logs pour vérifier l'état de la connexion WebSocket lors de la réception de `game:started`

### 2. Vérifications à faire

1. **Vérifier que le socket est connecté** :
   - Dans la console du navigateur, vérifier `socket.connected === true`
   - Vérifier que `socket.id` est défini

2. **Vérifier que les événements sont émis** :
   - Dans les logs Docker du `game-service`, chercher :
     - `📢 Emitting 'players:count' event`
     - `📢 Emitting 'game:started' event`
     - `✅ 'players:count' event emitted successfully`
     - `✅ 'game:started' event emitted successfully`

3. **Vérifier que les événements sont reçus** :
   - Dans la console du navigateur, chercher :
     - `📊 AdminDashboard received players:count event`
     - `🎮 AdminDashboard received game:started event`
     - `🎮 Game started event received in QuizPlay`

## Debugging Steps

### Étape 1 : Vérifier l'enregistrement du joueur

1. Ouvrir la console du navigateur (F12)
2. S'enregistrer comme joueur depuis le front-end
3. Vérifier les logs :
   - `📝 Registering player: <playerId>`
   - `✅ WebSocket connected: <socketId>`
   - `✅ Player registered: <playerId>`

4. Vérifier les logs Docker du `game-service` :
   ```bash
   docker-compose logs game --tail 50 | grep -E "(Player registered|players:count)"
   ```

5. Vérifier dans le dashboard admin :
   - Le compteur de joueurs connectés devrait s'incrémenter
   - La liste des joueurs devrait se mettre à jour

### Étape 2 : Vérifier le démarrage du jeu

1. Ouvrir la console du navigateur (F12) sur la page du joueur (`/player/quiz`)
2. Lancer le jeu depuis le dashboard admin
3. Vérifier les logs dans la console :
   - `🎮 Game started event received in QuizPlay`
   - `🎮 Socket connected: true`
   - `✅ Question loaded after game:started event`

4. Vérifier les logs Docker du `game-service` :
   ```bash
   docker-compose logs game --tail 50 | grep -E "(game:started|question:next)"
   ```

### Étape 3 : Vérifier la connexion WebSocket

1. Dans la console du navigateur, exécuter :
   ```javascript
   // Vérifier l'état de la connexion
   console.log('Socket connected:', socket.connected)
   console.log('Socket ID:', socket.id)
   ```

2. Vérifier que le socket est bien connecté au bon serveur :
   - Dev : `http://localhost:3003`
   - Prod : URL du game-service

## Problèmes connus et solutions

### Problème 1 : Le joueur s'enregistre mais n'apparaît pas dans le dashboard

**Cause** : L'événement `players:count` n'est pas reçu par le dashboard

**Solution** :
- Vérifier que le dashboard est connecté au même serveur WebSocket
- Vérifier que l'événement est bien émis (logs Docker)
- Vérifier que le dashboard écoute l'événement (logs console)

### Problème 2 : Le jeu démarre mais le front-end ne le voit pas

**Cause** : L'événement `game:started` n'est pas reçu par le front-end

**Solution** :
- Vérifier que le socket est connecté au moment de l'émission
- Vérifier que l'événement est bien émis (logs Docker)
- Vérifier que le front-end écoute l'événement (logs console)
- Utiliser le double écoute (via `socketService` et directement sur `socket`)

### Problème 3 : Les événements sont émis mais pas reçus

**Cause** : Problème de connexion WebSocket ou de timing

**Solution** :
- Vérifier que le socket est connecté avant d'émettre
- Attendre que la connexion soit établie avant d'enregistrer le joueur
- Utiliser le polling comme filet de sécurité (déjà en place)

## Commandes utiles

```bash
# Voir les logs du game-service
docker-compose logs game --tail 100 -f

# Voir les logs du frontend
docker-compose logs frontend --tail 100 -f

# Redémarrer les services
docker-compose restart game frontend

# Reconstruire les images
docker-compose build game frontend
docker-compose up -d game frontend
```



