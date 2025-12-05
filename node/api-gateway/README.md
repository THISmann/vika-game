# API Gateway

Microservice API Gateway pour coordonner les autres microservices d'IntelectGame.

## 🎯 Fonctionnalités

- **Routing** : Route les requêtes vers les bons microservices
- **Load Balancing** : Distribution des requêtes (basique)
- **Rate Limiting** : Limite le nombre de requêtes par IP (100/min)
- **Error Handling** : Gestion centralisée des erreurs
- **Logging** : Logs de toutes les requêtes
- **CORS** : Configuration CORS pour le frontend
- **WebSocket Support** : Support pour les connexions WebSocket

## 🚀 Démarrage

### Local (sans Docker)

```bash
cd node/api-gateway
npm install
npm start
```

Le service sera accessible sur `http://localhost:3000`

### Avec Docker Compose

Le service est automatiquement configuré dans `docker-compose.yml`

## 📡 Routes disponibles

- `GET /health` - Health check
- `GET /test` - Test endpoint
- `* /auth/*` - Proxy vers Auth Service
- `* /quiz/*` - Proxy vers Quiz Service
- `* /game/*` - Proxy vers Game Service
- `* /telegram/*` - Proxy vers Telegram Bot

## 🔧 Configuration

Les URLs des services sont configurées dans `config/services.js` et peuvent être surchargées via les variables d'environnement :

- `AUTH_SERVICE_URL`
- `QUIZ_SERVICE_URL`
- `GAME_SERVICE_URL`
- `TELEGRAM_SERVICE_URL`
- `DOCKER_ENV=true` - Active le mode Docker (utilise les noms de services)

## 📝 Exemples d'utilisation

### Via l'API Gateway

```bash
# Health check
curl http://localhost:3000/health

# Test
curl http://localhost:3000/test

# Auth Service
curl http://localhost:3000/auth/test
curl http://localhost:3000/auth/players

# Quiz Service
curl http://localhost:3000/quiz/test
curl http://localhost:3000/quiz/all

# Game Service
curl http://localhost:3000/game/test
curl http://localhost:3000/game/state
```

## 🔒 Sécurité

- Rate limiting : 100 requêtes/minute par IP
- CORS configuré
- Gestion des erreurs centralisée
- Logging de toutes les requêtes

## 🚧 Améliorations futures

- Authentification JWT
- Cache Redis
- Load balancing avancé
- Monitoring et métriques
- Circuit breaker pattern

