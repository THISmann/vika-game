# 🚀 Guide Rapide : Tester les WebSockets Socket.io

## ⚠️ Important : Postman/Apidog ne fonctionnent PAS

**Postman et Apidog ne peuvent PAS tester Socket.io** car Socket.io utilise un protocole propriétaire (polling HTTP + upgrade WebSocket).

## ✅ Solution : Utiliser les Scripts de Test

### Option 1 : Script Simple (Recommandé pour débuter)

```bash
# 1. Installer les dépendances (à la racine du projet)
npm install

# 2. Tester avec un playerId existant
node test-websocket.js player-123

# 3. Ou laisser le script générer un ID automatique
node test-websocket.js
```

**Ce que vous verrez :**
- ✅ Connexion au WebSocket
- 📝 Enregistrement du joueur
- 🎯 Réception du code de jeu
- 🎮 Événements `game:started` et `question:next` quand l'admin lance le jeu

### Option 2 : Script Complet (Teste tout le flux)

```bash
# 1. Installer les dépendances (à la racine du projet)
npm install

# 2. Lancer le test complet
node test-socket-complete.js
```

**Ce que fait ce script :**
1. ✅ Crée un joueur via l'API `/auth/players/register`
2. ✅ Se connecte au WebSocket
3. ✅ Enregistre le joueur
4. ✅ Vérifie que le joueur apparaît dans `/game/players`
5. ✅ Écoute tous les événements du jeu

### Option 3 : Test via le Navigateur (Le plus simple)

1. **Ouvrez votre application** dans le navigateur
2. **Ouvrez la Console** (F12 → Console)
3. **Collez ce code** :

```javascript
// Obtenir le socket
const socket = window.socketService?.getSocket() || 
  (() => {
    // Si socketService n'est pas disponible, créer une connexion manuelle
    const io = require('socket.io-client');
    return io('http://localhost:3003', { path: '/socket.io' });
  })();

// Vérifier la connexion
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);

// Écouter les événements
socket.on('connect', () => console.log('✅ Connected:', socket.id));
socket.on('game:started', (data) => console.log('🎮 Game started:', data));
socket.on('question:next', (data) => console.log('❓ Question:', data.question?.question));
socket.on('players:count', (data) => console.log('📊 Players:', data.count));

// Enregistrer un joueur (remplacez par votre playerId)
socket.emit('register', 'VOTRE_PLAYER_ID');
```

## 📋 Checklist de Test

### Test 1 : Connexion ✅
```bash
# Depuis la racine du projet
npm install  # Si pas encore fait
node test-websocket.js test-player-1
```
**Résultat attendu :**
```
✅ Connected! Socket ID: abc123
📝 Registering player: test-player-1
🎯 Game code received: ABC123
```

### Test 2 : Enregistrement ✅
1. Créez un joueur via l'API :
```bash
curl -X POST http://localhost:3001/auth/players/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Player"}'
```
2. Notez le `playerId` retourné
3. Testez l'enregistrement :
```bash
node test-websocket.js VOTRE_PLAYER_ID
```

### Test 3 : Vérifier les Joueurs Connectés ✅
```bash
curl http://localhost:3003/game/players
```
**Résultat attendu :**
```json
{
  "players": [
    {"id": "player-123", "name": "Test Player"},
    {"id": "player-456", "name": "Autre Joueur"}
  ],
  "count": 2
}
```

### Test 4 : Démarrage du Jeu ✅
1. **Dans un terminal**, lancez le script de test :
```bash
node test-websocket.js player-123
```

2. **Dans un autre terminal**, démarrez le jeu :
```bash
curl -X POST http://localhost:3003/game/start \
  -H "Content-Type: application/json" \
  -d '{"questionDuration": 30}'
```

3. **Dans le premier terminal**, vous devriez voir :
```
🎮 ========== GAME STARTED ==========
❓ ========== QUESTION NEXT ==========
```

## 🔍 Debugging

### Le socket ne se connecte pas
```bash
# Vérifier que le game-service tourne
curl http://localhost:3003/game/test

# Vérifier les logs
# Kubernetes:
kubectl logs -f deployment/game-service

# Docker Compose:
docker-compose logs -f game-service
```

### Le joueur ne reçoit pas les événements
1. Vérifiez que le joueur est enregistré :
```bash
curl http://localhost:3003/game/players
```

2. Vérifiez les logs serveur pour voir si les événements sont émis

3. Vérifiez que le socket est connecté dans le script de test

### Le nom du joueur n'apparaît pas
1. Vérifiez que le joueur existe dans auth-service :
```bash
curl http://localhost:3001/auth/players
```

2. Vérifiez que `getConnectedPlayers()` récupère bien les noms (voir les logs serveur)

## 📚 Fichiers Créés

- `test-websocket.js` - Script simple pour tester la connexion
- `test-socket-complete.js` - Script complet qui teste tout le flux
- `docs/TESTING_WEBSOCKETS.md` - Documentation complète

## 🎯 Prochaines Étapes

1. **Testez la connexion** avec `test-websocket.js`
2. **Testez le flux complet** avec `test-socket-complete.js`
3. **Vérifiez les logs** serveur et client pour diagnostiquer les problèmes
4. **Utilisez la console du navigateur** pour tester en temps réel

