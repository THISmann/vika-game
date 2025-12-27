# Correction du problème WebSocket avec l'API Gateway

## 🔍 Problème identifié

Les connexions WebSocket (Socket.io) retournaient des erreurs 404 lors de la connexion via l'API Gateway.

### Symptômes
- `GET http://localhost:3000/socket.io/?EIO=4&transport=polling&t=...` → 404 (Not Found)
- Erreur: `xhr poll error`
- Les WebSockets ne se connectaient pas
- Le problème revenait après chaque redémarrage

### Cause racine

**Le problème :** L'API Gateway ne gère pas les WebSockets. Le frontend essayait de se connecter à `http://localhost:3000/socket.io/` (API Gateway) au lieu de `http://localhost:3003/socket.io/` (game-service).

**Pourquoi ça arrivait :**
1. En développement avec Docker Compose, `VITE_GAME_SERVICE_URL` est configuré pour pointer vers l'API Gateway (`http://localhost:3000`)
2. Le code utilisait `API_CONFIG.GAME_SERVICE` pour déterminer l'URL WebSocket
3. `API_CONFIG.GAME_SERVICE` pointait vers l'API Gateway (`http://localhost:3000`)
4. L'API Gateway ne gère pas les WebSockets → 404

**Fichiers affectés :**
- `vue/front/src/services/socketService.js`
- `vue/front/src/components/admin/AdminDashboard.vue`
- `vue/front/src/components/player/Leaderboard.vue`

## ✅ Solution appliquée

Création d'une configuration séparée pour les WebSockets qui **toujours** pointe vers le game-service directement, même quand on utilise l'API Gateway pour les requêtes HTTP.

### 1. Configuration WebSocket dans `api.js`

```javascript
// URL WebSocket - TOUJOURS utiliser le game-service directement, jamais l'API Gateway
// L'API Gateway ne gère pas les WebSockets
ws: {
  game: (() => {
    const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production'
    
    if (isProduction) {
      // En production, utiliser le chemin /socket.io qui est configuré dans Nginx
      // Le proxy Nginx route /socket.io vers game-service
      if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}`
      }
      return ''
    } else {
      // En développement, TOUJOURS utiliser localhost:3003 directement (game-service)
      // Même si on utilise l'API Gateway pour les requêtes HTTP
      return 'http://localhost:3003'
    }
  })(),
}
```

### 2. Utilisation dans les composants

**Avant :**
```javascript
// ❌ Utilisait API_CONFIG.GAME_SERVICE qui pointait vers l'API Gateway
const wsUrl = API_CONFIG.GAME_SERVICE
```

**Après :**
```javascript
// ✅ Utilise API_URLS.ws.game qui pointe toujours vers le game-service
const wsUrl = API_URLS.ws.game
```

### 3. Fichiers modifiés

- ✅ `vue/front/src/config/api.js` - Ajout de `API_URLS.ws.game`
- ✅ `vue/front/src/services/socketService.js` - Utilise `API_URLS.ws.game`
- ✅ `vue/front/src/components/admin/AdminDashboard.vue` - Utilise `API_URLS.ws.game`
- ✅ `vue/front/src/components/player/Leaderboard.vue` - Utilise `API_URLS.ws.game`

## 🛡️ Prévention

### 1. Règle d'or

**⚠️ IMPORTANT : Les WebSockets doivent TOUJOURS se connecter directement au game-service, jamais à l'API Gateway.**

### 2. Configuration recommandée

Toujours utiliser `API_URLS.ws.game` pour les connexions WebSocket, jamais `API_CONFIG.GAME_SERVICE`.

```javascript
// ✅ CORRECT
import { API_URLS } from '@/config/api'
const socket = io(API_URLS.ws.game, { path: '/socket.io' })

// ❌ INCORRECT
import { API_CONFIG } from '@/config/api'
const socket = io(API_CONFIG.GAME_SERVICE, { path: '/socket.io' })
```

### 3. Tests

Ajouter des tests pour vérifier que les WebSockets se connectent au bon service :

```javascript
// tests/websocket.test.js
describe('WebSocket Configuration', () => {
  it('should connect to game-service directly, not API Gateway', () => {
    const wsUrl = API_URLS.ws.game
    expect(wsUrl).not.toContain(':3000') // Pas l'API Gateway
    expect(wsUrl).toContain(':3003') // Game-service en développement
  })
})
```

### 4. Documentation

Documenter clairement dans le code que l'API Gateway ne gère pas les WebSockets :

```javascript
// IMPORTANT: Les WebSockets doivent TOUJOURS se connecter directement au game-service
// L'API Gateway ne gère pas les WebSockets
const wsUrl = API_URLS.ws.game
```

## 📋 Architecture

### Requêtes HTTP
```
Frontend → API Gateway (port 3000) → Game Service (port 3003)
```

### WebSockets
```
Frontend → Game Service (port 3003) directement
```

**Pourquoi cette architecture ?**
- L'API Gateway utilise `http-proxy-middleware` qui ne gère pas bien les WebSockets
- Les WebSockets nécessitent une connexion persistante que l'API Gateway ne peut pas maintenir
- En production avec Nginx, le proxy route `/socket.io` directement vers le game-service

## 🔄 Procédure de dépannage

Si les WebSockets ne se connectent pas :

1. **Vérifier l'URL WebSocket utilisée :**
   ```javascript
   console.log('WebSocket URL:', API_URLS.ws.game)
   ```

2. **Vérifier que le game-service est accessible :**
   ```bash
   curl http://localhost:3003/socket.io/
   ```

3. **Vérifier les logs du game-service :**
   ```bash
   docker-compose logs game | grep socket
   ```

4. **Vérifier que le frontend utilise `API_URLS.ws.game` :**
   ```bash
   grep -r "API_CONFIG.GAME_SERVICE.*socket\|io\(.*API_CONFIG" vue/front/src
   ```

5. **Tester la connexion WebSocket directement :**
   ```javascript
   const socket = io('http://localhost:3003', { path: '/socket.io' })
   socket.on('connect', () => console.log('Connected!'))
   ```

## 📚 Références

- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
- [http-proxy-middleware WebSocket Support](https://github.com/chimurai/http-proxy-middleware#websocket)

## ✅ Checklist

Avant d'ajouter une nouvelle connexion WebSocket :

- [ ] Utiliser `API_URLS.ws.game` au lieu de `API_CONFIG.GAME_SERVICE`
- [ ] Ajouter un commentaire expliquant pourquoi on utilise le game-service directement
- [ ] Tester la connexion en développement
- [ ] Vérifier que ça fonctionne en production (si applicable)
- [ ] Documenter dans le code que l'API Gateway ne gère pas les WebSockets




