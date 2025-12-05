# 🔧 Correction Rapide - URLs API

## Problème

Le frontend ne peut pas accéder aux services backend car il utilise `localhost:3001` qui n'existe pas dans Kubernetes.

## Solution appliquée

### 1. Configuration API centralisée

Tous les composants utilisent maintenant `vue/front/src/config/api.js` qui :
- Utilise `/api/auth`, `/api/quiz`, `/api/game` en production
- Utilise `localhost:3001`, etc. en développement

### 2. Proxy Nginx

Un proxy Nginx route les requêtes :
- `/api/auth/*` → `auth-service:3001/auth/*`
- `/api/quiz/*` → `quiz-service:3002/quiz/*`
- `/api/game/*` → `game-service:3003/game/*`
- `/` → `frontend:80`

## Actions sur votre VM

### 1. Reconstruire le frontend

```bash
# Activer le Docker daemon de Minikube
eval $(minikube docker-env)

# Reconstruire l'image
docker build -t thismann17/gamev2-frontend:latest ./vue

# Redémarrer le frontend
kubectl rollout restart deployment/frontend -n intelectgame
```

Ou utilisez le script :
```bash
./k8s/update-frontend.sh
```

### 2. Déployer le proxy Nginx

```bash
kubectl apply -f k8s/nginx-proxy-config.yaml
```

### 3. Mettre à jour le service frontend

Le service frontend doit utiliser le proxy Nginx au lieu d'être exposé directement :

```bash
# Supprimer l'ancien service frontend NodePort
kubectl delete service frontend -n intelectgame

# Le proxy Nginx expose déjà sur le port 30080
# Vérifier
kubectl get service nginx-proxy -n intelectgame
```

### 4. Accéder à l'application

L'application sera accessible via le proxy Nginx :
- `http://82.202.141.248:30080` (via le proxy)
- `http://192.168.49.2:30080` (via Minikube IP)

## Vérification

```bash
# Vérifier que le proxy Nginx est actif
kubectl get pods -n intelectgame | grep nginx-proxy

# Vérifier les logs du frontend
kubectl logs -f deployment/frontend -n intelectgame

# Tester l'API
curl http://82.202.141.248:30080/api/auth/players
```

## Architecture finale

```
Browser
  ↓
Nginx Proxy (Port 30080)
  ↓
  ├─→ / → Frontend (Port 80)
  ├─→ /api/auth/* → Auth Service (Port 3001)
  ├─→ /api/quiz/* → Quiz Service (Port 3002)
  └─→ /api/game/* → Game Service (Port 3003)
      └─→ /socket.io → Game Service WebSocket
```

## Si le problème persiste

1. Vérifier que le proxy Nginx est actif :
   ```bash
   kubectl get pods -n intelectgame | grep nginx
   ```

2. Vérifier les logs du proxy :
   ```bash
   kubectl logs -f deployment/nginx-proxy -n intelectgame
   ```

3. Vérifier que le frontend utilise les bonnes URLs :
   ```bash
   kubectl exec -it <frontend-pod> -n intelectgame -- env | grep VITE
   ```

