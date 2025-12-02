# Correction des URLs API dans le Frontend

## Problème

Le frontend utilisait des URLs en dur (`http://localhost:3001`, etc.) qui ne fonctionnent pas dans Kubernetes car les services ne sont pas accessibles via localhost.

## Solution appliquée

### 1. Fichier de configuration API créé

Création de `vue/front/src/config/api.js` qui :
- Utilise les variables d'environnement `VITE_*` en production
- Utilise `localhost` en développement
- Fournit des helpers pour toutes les URLs API

### 2. Tous les composants mis à jour

Tous les composants utilisent maintenant la configuration centralisée :
- ✅ `PlayerRegister.vue`
- ✅ `QuizPlay.vue`
- ✅ `Leaderboard.vue`
- ✅ `AdminDashboard.vue`
- ✅ `ManageQuestions.vue`

### 3. Proxy Nginx ajouté

Un proxy Nginx a été ajouté pour router les requêtes :
- `/api/auth` → `auth-service:3001`
- `/api/quiz` → `quiz-service:3002`
- `/api/game` → `game-service:3003`
- `/` → `frontend:80`

### 4. Configuration Kubernetes mise à jour

Le frontend est configuré avec :
- `VITE_AUTH_SERVICE_URL=/api/auth`
- `VITE_QUIZ_SERVICE_URL=/api/quiz`
- `VITE_GAME_SERVICE_URL=/api/game`

## Déploiement

### Option 1 : Avec proxy Nginx (Recommandé)

```bash
# Déployer le proxy Nginx
kubectl apply -f k8s/nginx-proxy-config.yaml

# Déployer les services
kubectl apply -f k8s/all-services.yaml
```

L'application sera accessible via le proxy Nginx sur le port 30080.

### Option 2 : Sans proxy (URLs directes)

Si vous préférez exposer les services directement, modifiez les variables d'environnement dans `k8s/all-services.yaml` :

```yaml
env:
- name: VITE_AUTH_SERVICE_URL
  value: "http://auth-service:3001"
- name: VITE_QUIZ_SERVICE_URL
  value: "http://quiz-service:3002"
- name: VITE_GAME_SERVICE_URL
  value: "http://game-service:3003"
```

**Note** : Cette approche nécessite que le frontend puisse accéder directement aux services (CORS configuré).

## Reconstruction du frontend

Après avoir modifié le code, reconstruisez l'image frontend :

```bash
# Sur la VM
eval $(minikube docker-env)
docker build -t thismann17/gamev2-frontend:latest ./vue

# Redémarrer le service
kubectl rollout restart deployment/frontend -n intelectgame
```

## Vérification

1. Vérifier que le proxy Nginx est actif :
   ```bash
   kubectl get pods -n intelectgame | grep nginx-proxy
   ```

2. Vérifier les logs du frontend :
   ```bash
   kubectl logs -f deployment/frontend -n intelectgame
   ```

3. Tester l'accès :
   ```bash
   curl http://82.202.141.248:30080
   ```

## Architecture

```
Client (Browser)
    ↓
Nginx Proxy (Port 30080)
    ↓
    ├─→ / → Frontend
    ├─→ /api/auth → Auth Service
    ├─→ /api/quiz → Quiz Service
    └─→ /api/game → Game Service (HTTP + WebSocket)
```

## WebSocket

Le proxy Nginx est configuré pour supporter WebSocket sur `/socket.io` et `/api/game`.

