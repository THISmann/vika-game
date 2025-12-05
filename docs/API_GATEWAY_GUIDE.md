# Guide API Gateway

## 🎯 Vue d'ensemble

L'API Gateway est un microservice qui coordonne et route toutes les requêtes vers les autres microservices d'IntelectGame. Il centralise la gestion des requêtes, le rate limiting, le logging et la gestion des erreurs.

## 🏗️ Architecture

```
Frontend (Port 5173)
    ↓
API Gateway (Port 3000)
    ├──→ Auth Service (Port 3001)
    ├──→ Quiz Service (Port 3002)
    ├──→ Game Service (Port 3003)
    └──→ Telegram Bot (Port 3004)
```

## 📡 Routes

### Endpoints du Gateway

- `GET /health` - Health check du Gateway
- `GET /test` - Test endpoint

### Proxy vers les services

- `* /auth/*` → Auth Service
- `* /quiz/*` → Quiz Service
- `* /game/*` → Game Service
- `* /telegram/*` → Telegram Bot

## 🚀 Démarrage

### Local (sans Docker)

```bash
cd node/api-gateway
npm install
npm start
```

Le Gateway sera accessible sur `http://localhost:3000`

### Avec Docker Compose

```bash
# Reconstruire le Gateway
docker-compose build api-gateway

# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f api-gateway
```

## 🧪 Tests

### Health Check

```bash
curl http://localhost:3000/health
```

Réponse :
```json
{
  "status": "ok",
  "service": "api-gateway",
  "timestamp": "2025-01-05T12:00:00.000Z",
  "services": {
    "auth": "http://auth:3001",
    "quiz": "http://quiz:3002",
    "game": "http://game:3003",
    "telegram": "http://telegram-bot:3004"
  }
}
```

### Test Endpoint

```bash
curl http://localhost:3000/test
```

### Via le Gateway

```bash
# Auth Service
curl http://localhost:3000/auth/test
curl http://localhost:3000/auth/players

# Quiz Service
curl http://localhost:3000/quiz/test
curl http://localhost:3000/quiz/all
curl http://localhost:3000/quiz/create -X POST -H "Content-Type: application/json" -d '{"question":"Test?","choices":["A","B"],"answer":"A"}'

# Game Service
curl http://localhost:3000/game/test
curl http://localhost:3000/game/state
curl http://localhost:3000/game/code
```

## 🔧 Configuration

### Variables d'environnement

Le Gateway peut être configuré via les variables d'environnement :

- `PORT` - Port du Gateway (défaut: 3000)
- `NODE_ENV` - Environnement (development/production)
- `DOCKER_ENV` - Mode Docker (true/false)
- `AUTH_SERVICE_URL` - URL du service Auth
- `QUIZ_SERVICE_URL` - URL du service Quiz
- `GAME_SERVICE_URL` - URL du service Game
- `TELEGRAM_SERVICE_URL` - URL du service Telegram

### Configuration automatique

En Docker Compose, les URLs sont automatiquement configurées :
- Mode Docker : utilise les noms de services (`http://auth:3001`)
- Mode Local : utilise `localhost` (`http://localhost:3001`)

## 🔒 Sécurité

### Rate Limiting

- **Limite** : 100 requêtes par minute par IP
- **Fenêtre** : 60 secondes
- **Réponse 429** : Si la limite est dépassée

### CORS

- **Origine** : `*` (configurable en production)
- **Méthodes** : GET, POST, PUT, DELETE, OPTIONS
- **Headers** : Content-Type, Authorization

## 📊 Logging

Toutes les requêtes sont loggées avec :
- Méthode HTTP
- Chemin
- IP source
- Code de statut
- Temps de réponse

Exemple :
```
📥 GET /quiz/all - ::1
✅ GET /quiz/all - 200 - 45ms
```

## 🐛 Dépannage

### Le Gateway ne démarre pas

```bash
# Vérifier les logs
docker-compose logs api-gateway

# Vérifier que le port 3000 n'est pas utilisé
lsof -i :3000
```

### Erreur "Service Unavailable"

```bash
# Vérifier que les services backend sont démarrés
docker-compose ps

# Vérifier la connectivité
docker-compose exec api-gateway wget -O- http://auth:3001/auth/test
docker-compose exec api-gateway wget -O- http://quiz:3002/quiz/test
docker-compose exec api-gateway wget -O- http://game:3003/game/test
```

### Rate Limit atteint

Si vous recevez une erreur 429 :
- Attendre 60 secondes
- Ou augmenter la limite dans `src/middleware/rateLimiter.js`

## 🚧 Améliorations futures

- [ ] Authentification JWT
- [ ] Cache Redis
- [ ] Load balancing avancé
- [ ] Circuit breaker pattern
- [ ] Monitoring et métriques (Prometheus)
- [ ] Support WebSocket complet
- [ ] API versioning
- [ ] Request/Response transformation

## 📝 Notes

- Le Gateway route les requêtes mais ne modifie pas les réponses
- Les WebSockets passent directement par le game-service (port 3003)
- Le rate limiting est basique (en mémoire), utiliser Redis en production
- Les logs sont envoyés à la console, utiliser un service de logging en production

