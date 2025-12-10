# 🔍 Guide de Debug WebSocket dans le Navigateur

## Problème : Les WebSockets fonctionnent avec le script Node.js mais pas dans le navigateur

### Outils de Debug Disponibles

#### 1. Console du Navigateur

Ouvrez la console (F12 → Console) et utilisez :

```javascript
// Vérifier l'état du socket
debugSocket()

// Ou directement
window.socketService.getSocket()

// Vérifier l'URL de connexion
import { API_URLS } from '@/config/api'
console.log('WebSocket URL:', API_URLS.ws.game)
```

#### 2. Logs Automatiques

Le code affiche maintenant des logs détaillés :
- `🔌` - Connexion WebSocket
- `📝` - Enregistrement de joueur
- `✅` - Succès
- `❌` - Erreurs
- `⏳` - En attente
- `🔄` - Reconnexion

### Checklist de Debug

#### ✅ Vérifier la Connexion

1. **Ouvrir la console du navigateur** (F12)
2. **Vérifier les logs de connexion** :
   ```
   🔌 Creating WebSocket connection: http://localhost:3003
   ✅ WebSocket connected: [socket-id]
   ```

3. **Si pas de connexion**, vérifier :
   - L'URL WebSocket dans les logs
   - Les erreurs CORS
   - Le game-service est-il démarré ?

#### ✅ Vérifier l'Enregistrement

1. **Après l'inscription**, vérifier les logs :
   ```
   📝 Player registered via API, playerId: [id]
   📝 Registering player: [id]
   ```

2. **Vérifier la réception du code de jeu** :
   ```
   🎯 Game code received: [code]
   ```

3. **Si pas d'enregistrement**, utiliser :
   ```javascript
   // Dans la console
   const playerId = localStorage.getItem('playerId')
   window.socketService.registerPlayer(playerId)
   ```

#### ✅ Vérifier les Événements

1. **Écouter tous les événements** :
   ```javascript
   const socket = window.socketService.getSocket()
   
   socket.on('game:started', (data) => {
     console.log('🎮 Game started:', data)
   })
   
   socket.on('question:next', (data) => {
     console.log('❓ Question:', data)
   })
   
   socket.on('players:count', (data) => {
     console.log('📊 Players:', data)
   })
   ```

2. **Vérifier si les événements sont reçus** dans les logs

### Problèmes Courants

#### 1. Le socket ne se connecte pas

**Symptômes :**
- Pas de log `✅ WebSocket connected`
- Erreurs dans la console

**Solutions :**
```javascript
// Vérifier l'URL
console.log('WebSocket URL:', window.socketService.getSocket().io.uri)

// Forcer la connexion
window.socketService.getSocket().connect()

// Vérifier les erreurs
window.socketService.getSocket().on('connect_error', (err) => {
  console.error('Connection error:', err)
})
```

#### 2. Le joueur ne s'enregistre pas

**Symptômes :**
- Pas de log `📝 Registering player`
- Pas de réception de `game:code`

**Solutions :**
```javascript
// Vérifier le playerId
const playerId = localStorage.getItem('playerId')
console.log('Player ID:', playerId)

// Enregistrer manuellement
window.socketService.registerPlayer(playerId)

// Vérifier l'état du socket
const socket = window.socketService.getSocket()
console.log('Socket connected:', socket.connected)
```

#### 3. Les événements ne sont pas reçus

**Symptômes :**
- Le jeu démarre mais le joueur ne reçoit pas `game:started`
- Pas de redirection vers `/player/quiz`

**Solutions :**
```javascript
// Vérifier les listeners
const socket = window.socketService.getSocket()

// Écouter manuellement
socket.on('game:started', (data) => {
  console.log('🎮 Game started received!', data)
  // Rediriger manuellement si nécessaire
  window.location.href = '/player/quiz'
})
```

### Commandes de Debug Rapides

Copiez-collez dans la console du navigateur :

```javascript
// 1. Info complète du socket
debugSocket()

// 2. Vérifier l'état
const s = window.socketService.getSocket()
console.log({
  connected: s.connected,
  id: s.id,
  url: s.io.uri,
  transport: s.io.engine?.transport?.name
})

// 3. Réenregistrer le joueur
const pid = localStorage.getItem('playerId')
if (pid) {
  window.socketService.registerPlayer(pid)
} else {
  console.error('No playerId in localStorage')
}

// 4. Écouter tous les événements
const socket = window.socketService.getSocket()
['connect', 'disconnect', 'game:code', 'game:started', 'question:next', 'players:count', 'error'].forEach(event => {
  socket.on(event, (data) => console.log(`📡 ${event}:`, data))
})
```

### Comparaison avec le Script de Test

Le script Node.js fonctionne car :
1. Il se connecte directement à `http://localhost:3003`
2. Il attend explicitement la connexion
3. Il enregistre immédiatement après la connexion

Dans le navigateur, vérifiez que :
1. L'URL WebSocket est correcte (`http://localhost:3003` en dev)
2. La connexion est établie avant l'enregistrement
3. Les listeners sont bien attachés

### Logs à Surveiller

**Connexion réussie :**
```
🔌 Creating WebSocket connection: http://localhost:3003
✅ WebSocket connected: [id] Transport: polling
```

**Enregistrement réussi :**
```
📝 Registering player: [id]
🎯 Game code received: [code]
📊 Players count: [count]
```

**Problème de connexion :**
```
❌ WebSocket connection error: [message]
⏳ Socket not connected, waiting for connection...
```

### Test Manuel

1. **Ouvrir la console** (F12)
2. **Exécuter** :
   ```javascript
   debugSocket()
   ```
3. **Vérifier** l'état du socket
4. **Enregistrer manuellement** :
   ```javascript
   const playerId = localStorage.getItem('playerId')
   window.socketService.registerPlayer(playerId)
   ```
5. **Vérifier** les événements reçus dans les logs

