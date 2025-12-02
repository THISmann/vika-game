# 🚀 Déploiement Immédiat - VM cloud.ru

## Problème résolu

✅ Tous les composants utilisent maintenant une configuration API centralisée
✅ Proxy Nginx configuré pour router les requêtes
✅ URLs relatives (`/api/auth`, `/api/quiz`, `/api/game`) en production

## Actions à faire sur votre VM

### 1. Reconstruire le frontend (OBLIGATOIRE)

```bash
# Activer le Docker daemon de Minikube
eval $(minikube docker-env)

# Reconstruire l'image frontend avec les nouvelles modifications
docker build -t thismann17/gamev2-frontend:latest ./vue

# Redémarrer le frontend
kubectl rollout restart deployment/frontend -n intelectgame
```

### 2. Déployer le proxy Nginx

```bash
kubectl apply -f k8s/nginx-proxy-config.yaml
```

### 3. Vérifier que le proxy est actif

```bash
kubectl get pods -n intelectgame | grep nginx-proxy
kubectl get service nginx-proxy -n intelectgame
```

### 4. Accéder à l'application

L'application sera accessible via :
- **http://82.202.141.248:30080** (via le proxy Nginx)

## Script tout-en-un

Si vous voulez tout faire d'un coup :

```bash
./k8s/deploy-with-proxy.sh
```

Ce script :
- Construit toutes les images
- Déploie le proxy Nginx
- Déploie tous les services
- Configure les secrets

## Vérification

```bash
# Vérifier que tous les pods sont Running
kubectl get pods -n intelectgame

# Vérifier les logs du frontend
kubectl logs -f deployment/frontend -n intelectgame

# Tester l'API depuis la VM
curl http://localhost:30080/api/auth/players
```

## Architecture

```
Browser → http://82.202.141.248:30080
    ↓
Nginx Proxy (Port 30080)
    ↓
    ├─→ / → Frontend
    ├─→ /api/auth/* → Auth Service
    ├─→ /api/quiz/* → Quiz Service
    └─→ /api/game/* → Game Service (+ WebSocket)
```

## Si ça ne fonctionne toujours pas

1. Vérifier que le frontend a été reconstruit :
   ```bash
   kubectl describe pod -n intelectgame | grep frontend
   ```

2. Vérifier les variables d'environnement du frontend :
   ```bash
   kubectl get deployment frontend -n intelectgame -o yaml | grep VITE
   ```

3. Vérifier les logs du proxy Nginx :
   ```bash
   kubectl logs -f deployment/nginx-proxy -n intelectgame
   ```

4. Tester directement les services backend :
   ```bash
   # Port forward vers auth-service
   kubectl port-forward service/auth-service 3001:3001 -n intelectgame
   # Dans un autre terminal
   curl http://localhost:3001/auth/players
   ```

