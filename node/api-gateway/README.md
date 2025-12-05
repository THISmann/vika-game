# API Gateway

API Gateway pour les microservices IntelectGame. Centralise le routage et la gestion des requêtes vers les différents services backend.

## 🎯 Fonctionnalités

- **Routage centralisé** : Toutes les requêtes API passent par l'API Gateway
- **Proxy vers microservices** : Route les requêtes vers auth-service, quiz-service, game-service, telegram-bot
- **Rate limiting** : Limite les requêtes à 100 par minute par IP
- **Logging** : Log toutes les requêtes pour le débogage
- **Health check** : Endpoint `/health` pour vérifier l'état du service
- **Gestion d'erreurs** : Gestion centralisée des erreurs

## 🚀 Démarrage

### Développement local

```bash
cd node/api-gateway
npm install
npm run dev
```

Le service sera accessible sur `http://localhost:3000`

### Docker Compose

L'API Gateway est inclus dans `docker-compose.yml` et démarre automatiquement avec les autres services.

### Kubernetes

```bash
kubectl apply -f k8s/api-gateway-deployment.yaml
```

Ou utilisez le script :

```bash
./k8s/scripts/deploy-api-gateway.sh
```

## 📡 Routes

### Health Check
- `GET /health` - Vérifier l'état du service

### Test
- `GET /test` - Endpoint de test

### Proxy vers services
- `* /auth/*` - Proxy vers auth-service (port 3001)
- `* /quiz/*` - Proxy vers quiz-service (port 3002)
- `* /game/*` - Proxy vers game-service (port 3003)
- `* /telegram/*` - Proxy vers telegram-bot (port 3004)

## ⚙️ Configuration

Les URLs des services backend sont configurées via les variables d'environnement :

- `AUTH_SERVICE_URL` - URL du service d'authentification (défaut: `http://localhost:3001`)
- `QUIZ_SERVICE_URL` - URL du service de quiz (défaut: `http://localhost:3002`)
- `GAME_SERVICE_URL` - URL du service de jeu (défaut: `http://localhost:3003`)
- `TELEGRAM_SERVICE_URL` - URL du bot Telegram (défaut: `http://localhost:3004`)
- `PORT` - Port d'écoute de l'API Gateway (défaut: `3000`)

## 🔧 Architecture

```
Client
  ↓
API Gateway (port 3000)
  ├──→ auth-service (port 3001)
  ├──→ quiz-service (port 3002)
  ├──→ game-service (port 3003)
  └──→ telegram-bot (port 3004)
```

## 📝 Notes

- Les WebSockets (Socket.io) ne passent pas encore par l'API Gateway et sont routés directement vers game-service
- Le rate limiting est basique (en mémoire) et ne fonctionne pas en cluster. Pour la production, utilisez Redis
- Les logs incluent toutes les requêtes pour faciliter le débogage

## 🐛 Dépannage

### Le service ne démarre pas
- Vérifiez que les ports ne sont pas déjà utilisés
- Vérifiez les variables d'environnement
- Consultez les logs : `kubectl logs -n intelectgame -l app=api-gateway`

### Les requêtes échouent
- Vérifiez que les services backend sont accessibles
- Vérifiez la configuration des URLs dans `config/services.js`
- Testez directement les services backend

### Rate limiting trop strict
- Modifiez la configuration dans `src/middleware/rateLimiter.js`
- Ajustez `windowMs` et `max` selon vos besoins
