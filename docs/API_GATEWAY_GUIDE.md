# Guide de l'API Gateway

## 📋 Vue d'ensemble

L'API Gateway est maintenant complètement implémenté et fonctionne à la fois en local (Docker Compose) et en production (Kubernetes). Il centralise toutes les requêtes API vers les microservices backend.

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   API Gateway   │  Port 3000
│  (Centralisé)   │
└──────┬──────────┘
       │
       ├───► auth-service (3001)
       ├───► quiz-service (3002)
       ├───► game-service (3003)
       └───► telegram-bot (3004)
```

## 🚀 Utilisation

### En Local (Docker Compose)

L'API Gateway est automatiquement inclus dans `docker-compose.yml` :

```bash
docker-compose up --build
```

Le frontend est configuré pour utiliser l'API Gateway via les variables d'environnement :
- `VITE_AUTH_SERVICE_URL=http://localhost:3000`
- `VITE_QUIZ_SERVICE_URL=http://localhost:3000`
- `VITE_GAME_SERVICE_URL=http://localhost:3000`

**Note** : Les WebSockets (Socket.io) passent toujours directement vers `game-service` sur le port 3003, même en local.

### En Production (Kubernetes)

#### 1. Déployer l'API Gateway

```bash
kubectl apply -f k8s/api-gateway-deployment.yaml
```

Ou utilisez le script :

```bash
./k8s/scripts/deploy-api-gateway.sh
```

#### 2. Configuration Nginx (Optionnel)

En production, vous avez deux options :

**Option A : Utiliser Nginx directement vers les services** (actuel)
- Nginx route `/api/auth` → `auth-service`
- Nginx route `/api/quiz` → `quiz-service`
- Nginx route `/api/game` → `game-service`

**Option B : Utiliser l'API Gateway via Nginx** (recommandé pour l'avenir)
- Nginx route `/api/*` → `api-gateway`
- L'API Gateway route ensuite vers les services appropriés

Pour activer l'Option B, modifiez `k8s/nginx-proxy-config.yaml` :

```nginx
location /api/ {
    set $gateway "api-gateway.intelectgame.svc.cluster.local:3000";
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://$gateway;
    # ... autres headers
}
```

## 📡 Routes de l'API Gateway

### Health Check
```
GET /health
```

Réponse :
```json
{
  "status": "ok",
  "service": "api-gateway",
  "timestamp": "2025-12-05T...",
  "services": {
    "auth": "http://auth-service:3001",
    "quiz": "http://quiz-service:3002",
    "game": "http://game-service:3003",
    "telegram": "http://telegram-bot:3004"
  }
}
```

### Proxy Routes

L'API Gateway proxifie automatiquement :

- `/auth/*` → `auth-service:3001`
- `/quiz/*` → `quiz-service:3002`
- `/game/*` → `game-service:3003`
- `/telegram/*` → `telegram-bot:3004`

**Exemples** :
- `GET /auth/players` → `GET http://auth-service:3001/auth/players`
- `POST /quiz/create` → `POST http://quiz-service:3002/quiz/create`
- `GET /game/state` → `GET http://game-service:3003/game/state`

## ⚙️ Configuration

### Variables d'environnement

L'API Gateway utilise les variables d'environnement suivantes :

```bash
PORT=3000                                    # Port d'écoute
AUTH_SERVICE_URL=http://auth-service:3001   # URL du service auth
QUIZ_SERVICE_URL=http://quiz-service:3002   # URL du service quiz
GAME_SERVICE_URL=http://game-service:3003   # URL du service game
TELEGRAM_SERVICE_URL=http://telegram-bot:3004 # URL du bot Telegram
NODE_ENV=production                          # Environnement
```

### Rate Limiting

Par défaut, l'API Gateway limite les requêtes à **100 requêtes par minute par IP**.

Pour modifier cette limite, éditez `node/api-gateway/src/middleware/rateLimiter.js`.

## 🔍 Dépannage

### L'API Gateway ne démarre pas

1. Vérifiez les logs :
   ```bash
   kubectl logs -n intelectgame -l app=api-gateway
   ```

2. Vérifiez que les services backend sont accessibles :
   ```bash
   kubectl get pods -n intelectgame
   ```

3. Testez la santé :
   ```bash
   kubectl port-forward -n intelectgame service/api-gateway 3000:3000
   curl http://localhost:3000/health
   ```

### Les requêtes échouent avec 503

Cela signifie que l'API Gateway ne peut pas joindre le service backend :

1. Vérifiez que le service backend est en cours d'exécution
2. Vérifiez les variables d'environnement de l'API Gateway
3. Testez la connectivité depuis l'API Gateway :
   ```bash
   kubectl exec -n intelectgame <api-gateway-pod> -- wget -qO- http://auth-service:3001/auth/test
   ```

### Rate limiting trop strict

Modifiez la configuration dans `node/api-gateway/src/middleware/rateLimiter.js` :

```javascript
app.use(rateLimiter(60000, 200)); // 200 requêtes par minute
```

## 📝 Notes importantes

1. **WebSockets** : Les WebSockets (Socket.io) ne passent pas encore par l'API Gateway et sont routés directement vers `game-service`. C'est normal et fonctionne correctement.

2. **Frontend** : Le frontend détecte automatiquement si l'API Gateway est utilisé en vérifiant si toutes les URLs pointent vers le port 3000.

3. **Production** : En production, vous pouvez choisir d'utiliser Nginx directement vers les services ou via l'API Gateway. Les deux approches fonctionnent.

## 🧪 Tests

### Test en local

```bash
# Démarrer tous les services
docker-compose up

# Tester l'API Gateway
curl http://localhost:3000/health
curl http://localhost:3000/auth/players
curl http://localhost:3000/quiz/all
curl http://localhost:3000/game/state
```

### Test en production

```bash
# Port-forward vers l'API Gateway
kubectl port-forward -n intelectgame service/api-gateway 3000:3000

# Tester
curl http://localhost:3000/health
```

## 📚 Références

- [Documentation http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- [Documentation Express Rate Limit](https://github.com/nfriedly/express-rate-limit)
