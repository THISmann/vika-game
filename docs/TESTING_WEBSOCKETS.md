# Guide de Test des WebSockets Socket.io

## ⚠️ Limitations de Postman/Apidog

**Postman et Apidog ne peuvent PAS tester Socket.io directement** car :
- Socket.io utilise un protocole propriétaire (polling HTTP + upgrade WebSocket)
- Les outils REST standard ne supportent que les WebSockets standards (RFC 6455)
- Socket.io nécessite une bibliothèque cliente spécifique

## ✅ Alternatives pour Tester les WebSockets

### Option 1 : Test via le Navigateur (Recommandé)

#### Étape 1 : Ouvrir la Console du Navigateur
1. Ouvrez votre application front-end dans le navigateur
2. Appuyez sur `F12` ou `Cmd+Option+I` (Mac) pour ouvrir les DevTools
3. Allez dans l'onglet **Console**

#### Étape 2 : Tester la Connexion WebSocket
```javascript
// Vérifier si socketService est disponible
import socketService from '@/services/socketService'

// Obtenir le socket
const socket = socketService.getSocket()

// Vérifier l'état de connexion
console.log('Socket connected:', socket.connected)
console.log('Socket ID:', socket.id)

// Écouter les événements
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id)
})

socket.on('game:started', (data) => {
  console.log('🎮 Game started:', data)
})

socket.on('question:next', (data) => {
  console.log('❓ Question next:', data)
})

socket.on('players:count', (data) => {
  console.log('📊 Players count:', data)
})

socket.on('error', (error) => {
  console.error('❌ Error:', error)
})

// Enregistrer un joueur
socket.emit('register', 'VOTRE_PLAYER_ID')
```

### Option 2 : Script Node.js de Test

Créez un fichier `test-websocket.js` :

```javascript
const io = require('socket.io-client');

// URL du game-service (ajustez selon votre environnement)
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';

console.log(`🔌 Connecting to ${GAME_SERVICE_URL}...`);

const socket = io(GAME_SERVICE_URL, {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  forceNew: false,
  autoConnect: true,
  timeout: 20000
});

// Événements de connexion
socket.on('connect', () => {
  console.log('✅ Connected! Socket ID:', socket.id);
  
  // Enregistrer un joueur (remplacez par un vrai playerId)
  const playerId = process.argv[2] || 'test-player-123';
  console.log(`📝 Registering player: ${playerId}`);
  socket.emit('register', playerId);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ Disconnected:', reason);
});

// Événements du jeu
socket.on('game:started', (data) => {
  console.log('\n🎮 ========== GAME STARTED ==========');
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('=====================================\n');
});

socket.on('question:next', (data) => {
  console.log('\n❓ ========== QUESTION NEXT ==========');
  console.log('Question:', data.question?.question);
  console.log('Choices:', data.question?.choices);
  console.log('Index:', data.questionIndex, '/', data.totalQuestions);
  console.log('Duration:', data.duration, 'ms');
  console.log('=====================================\n');
});

socket.on('players:count', (data) => {
  console.log(`📊 Players count: ${data.count}`);
});

socket.on('game:code', (data) => {
  console.log(`🎯 Game code: ${data.gameCode}`);
});

socket.on('game:ended', (data) => {
  console.log('\n🏁 ========== GAME ENDED ==========');
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('===================================\n');
});

socket.on('error', (error) => {
  console.error('\n❌ ========== SOCKET ERROR ==========');
  console.error('Error:', JSON.stringify(error, null, 2));
  console.error('=====================================\n');
});

// Gestion de la fermeture
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});

// Garder le script actif
console.log('⏳ Waiting for events... (Press Ctrl+C to exit)');
```

**Utilisation :**
```bash
# Installer les dépendances (à la racine du projet)
npm install

# Tester avec un playerId spécifique
node test-websocket.js player-123

# Ou utiliser la variable d'environnement
GAME_SERVICE_URL=http://localhost:3003 node test-websocket.js player-123
```

### Option 3 : Utiliser wscat (WebSocket Standard uniquement)

⚠️ **Note** : wscat ne fonctionne que pour les WebSockets standards, pas Socket.io. Mais vous pouvez tester la connexion de base.

```bash
# Installer wscat
npm install -g wscat

# Tester la connexion (ne fonctionnera pas complètement avec Socket.io)
wscat -c ws://localhost:3003/socket.io/?EIO=4&transport=websocket
```

### Option 4 : Créer un Script de Test Automatisé

Créez `test-socket-complete.js` pour tester tous les scénarios :

```javascript
const io = require('socket.io-client');
const axios = require('axios');

const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3003';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

async function testCompleteFlow() {
  console.log('🧪 ========== TEST COMPLET ==========\n');

  // 1. Créer un joueur via l'API
  console.log('1️⃣ Creating player via API...');
  let playerId;
  try {
    const res = await axios.post(`${AUTH_SERVICE_URL}/auth/players/register`, {
      name: 'Test Player ' + Date.now()
    });
    playerId = res.data.id;
    console.log(`✅ Player created: ${playerId} (${res.data.name})`);
  } catch (err) {
    console.error('❌ Error creating player:', err.message);
    return;
  }

  // 2. Se connecter au WebSocket
  console.log('\n2️⃣ Connecting to WebSocket...');
  const socket = io(GAME_SERVICE_URL, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    reconnection: true
  });

  await new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log(`✅ Connected! Socket ID: ${socket.id}`);
      resolve();
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      reject(error);
    });

    setTimeout(() => reject(new Error('Connection timeout')), 10000);
  });

  // 3. Enregistrer le joueur
  console.log('\n3️⃣ Registering player on WebSocket...');
  socket.emit('register', playerId);

  await new Promise((resolve) => {
    socket.on('game:code', (data) => {
      console.log(`✅ Game code received: ${data.gameCode}`);
      resolve();
    });
    setTimeout(resolve, 2000);
  });

  // 4. Vérifier le nombre de joueurs connectés
  console.log('\n4️⃣ Checking connected players...');
  try {
    const res = await axios.get(`${GAME_SERVICE_URL}/game/players`);
    console.log(`✅ Connected players: ${res.data.count}`);
    console.log('Players:', res.data.players.map(p => p.name).join(', '));
  } catch (err) {
    console.error('❌ Error getting players:', err.message);
  }

  // 5. Écouter les événements du jeu
  console.log('\n5️⃣ Listening for game events...');
  socket.on('game:started', (data) => {
    console.log('🎮 Game started!', data);
  });

  socket.on('question:next', (data) => {
    console.log('❓ Question received!', data.question?.question);
  });

  socket.on('players:count', (data) => {
    console.log(`📊 Players count updated: ${data.count}`);
  });

  console.log('\n✅ Test setup complete! Waiting for game to start...');
  console.log('Press Ctrl+C to exit\n');

  // Garder le script actif
  process.on('SIGINT', () => {
    console.log('\n👋 Disconnecting...');
    socket.disconnect();
    process.exit(0);
  });
}

testCompleteFlow().catch(console.error);
```

**Utilisation :**
```bash
# Installer les dépendances (à la racine du projet)
npm install

# Lancer le test complet
node test-socket-complete.js
```

## 📋 Checklist de Test

### Test 1 : Connexion WebSocket
- [ ] Le socket se connecte avec succès
- [ ] Le socket ID est reçu
- [ ] Aucune erreur de connexion

### Test 2 : Enregistrement du Joueur
- [ ] Le joueur est créé via l'API `/auth/players/register`
- [ ] Le joueur s'enregistre via WebSocket avec `emit('register', playerId)`
- [ ] Le joueur reçoit l'événement `game:code`
- [ ] Le joueur apparaît dans `/game/players` avec son nom

### Test 3 : Démarrage du Jeu
- [ ] L'admin démarre le jeu via `/game/start`
- [ ] Tous les joueurs connectés reçoivent `game:started`
- [ ] Tous les joueurs reçoivent `question:next` avec la première question
- [ ] Le timer démarre correctement

### Test 4 : Questions Suivantes
- [ ] L'admin passe à la question suivante via `/game/next`
- [ ] Tous les joueurs reçoivent `question:next` avec la nouvelle question
- [ ] Le timer se réinitialise

## 🔍 Debugging

### Vérifier les Logs Serveur
```bash
# Si vous utilisez Kubernetes
kubectl logs -f deployment/game-service -n intelectgame

# Si vous utilisez Docker Compose
docker-compose logs -f game-service

# Si vous utilisez localement
# Les logs apparaissent dans la console où le serveur tourne
```

### Vérifier les Logs Front-end
1. Ouvrez les DevTools du navigateur (F12)
2. Allez dans l'onglet **Console**
3. Cherchez les logs commençant par :
   - `🔌` pour les connexions
   - `📝` pour les enregistrements
   - `🎮` pour les événements de jeu
   - `❌` pour les erreurs

### Problèmes Courants

#### Le joueur ne se connecte pas
- Vérifiez que l'URL WebSocket est correcte
- Vérifiez que le game-service est accessible
- Vérifiez les logs serveur pour les erreurs

#### Le joueur ne reçoit pas les événements
- Vérifiez que le joueur est bien enregistré (`emit('register', playerId)`)
- Vérifiez que le joueur est dans `connectedPlayers`
- Vérifiez que les événements sont bien émis (`req.io.emit(...)`)

#### Le nom du joueur n'apparaît pas
- Vérifiez que le joueur existe dans auth-service
- Vérifiez que `getConnectedPlayers()` récupère bien les noms
- Vérifiez les logs pour voir d'où vient le nom (auth-service ou scores)

## 📚 Ressources

- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
- [Socket.io Server Documentation](https://socket.io/docs/v4/server-api/)

