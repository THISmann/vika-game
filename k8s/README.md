# Déploiement Kubernetes pour IntelectGame

Ce dossier contient tous les fichiers de configuration Kubernetes pour déployer l'application IntelectGame sur minikube.

## Architecture

L'application est composée de :
- **MongoDB** : Base de données principale
- **auth-service** : Service d'authentification (port 3001)
- **quiz-service** : Service de gestion des questions (port 3002)
- **game-service** : Service de jeu avec WebSocket (port 3003)
- **frontend** : Interface Vue.js (port 5173, exposé sur NodePort 30080)

## Prérequis

- Minikube installé et démarré
- kubectl configuré
- Docker installé
- Les images Docker doivent être construites et chargées dans minikube

## Étapes de déploiement

### 1. Démarrer minikube

```bash
minikube start
```

### 2. Activer le Docker daemon de minikube

```bash
eval $(minikube docker-env)
```

### 3. Construire les images Docker

Depuis la racine du projet :

```bash
# Construire l'image auth-service
docker build -t auth-service:latest ./node/auth-service

# Construire l'image quiz-service
docker build -t quiz-service:latest ./node/quiz-service

# Construire l'image game-service
docker build -t game-service:latest ./node/game-service

# Construire l'image frontend
docker build -t frontend:latest ./vue
```

### 4. Déployer l'application

#### Option A : Déployer tous les services d'un coup

```bash
kubectl apply -f k8s/all-services.yaml
```

#### Option B : Déployer les services individuellement

```bash
# MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# ConfigMap
kubectl apply -f k8s/configmap.yaml

# Services backend
kubectl apply -f k8s/auth-service-deployment.yaml
kubectl apply -f k8s/quiz-service-deployment.yaml
kubectl apply -f k8s/game-service-deployment.yaml

# Frontend
kubectl apply -f k8s/frontend-deployment.yaml
```

### 5. Vérifier le déploiement

```bash
# Vérifier les pods
kubectl get pods -n intelectgame

# Vérifier les services
kubectl get services -n intelectgame

# Vérifier les logs d'un service
kubectl logs -f deployment/auth-service -n intelectgame
```

### 6. Accéder à l'application

#### Obtenir l'URL du frontend

```bash
minikube service frontend -n intelectgame --url
```

Ou accéder directement via :
```
http://$(minikube ip):30080
```

#### Port-forward pour accéder aux services individuellement

```bash
# Auth service
kubectl port-forward service/auth-service 3001:3001 -n intelectgame

# Quiz service
kubectl port-forward service/quiz-service 3002:3002 -n intelectgame

# Game service
kubectl port-forward service/game-service 3003:3003 -n intelectgame
```

## Commandes utiles

### Mettre à jour un déploiement

```bash
# Après avoir reconstruit une image
kubectl rollout restart deployment/auth-service -n intelectgame
```

### Supprimer l'application

```bash
kubectl delete -f k8s/all-services.yaml
```

### Voir les logs

```bash
# Logs d'un pod spécifique
kubectl logs <pod-name> -n intelectgame

# Logs d'un déploiement
kubectl logs -f deployment/auth-service -n intelectgame
```

### Scale les services

```bash
kubectl scale deployment auth-service --replicas=3 -n intelectgame
```

## Configuration

Les variables d'environnement sont définies dans `configmap.yaml`. Pour les modifier :

1. Éditer `k8s/configmap.yaml`
2. Appliquer les changements : `kubectl apply -f k8s/configmap.yaml`
3. Redémarrer les déploiements : `kubectl rollout restart deployment -n intelectgame`

## Notes importantes

- Les images utilisent `imagePullPolicy: Never` car elles sont construites localement
- MongoDB utilise un `emptyDir` pour la persistance (les données seront perdues si le pod est supprimé)
- Pour une persistance permanente, utilisez un PersistentVolume
- Le frontend est exposé via NodePort sur le port 30080
- Les services backend communiquent via leurs noms DNS Kubernetes (ex: `http://auth-service:3001`)

## Dépannage

### Les pods ne démarrent pas

```bash
# Vérifier les événements
kubectl get events -n intelectgame --sort-by='.lastTimestamp'

# Vérifier la description d'un pod
kubectl describe pod <pod-name> -n intelectgame
```

### Les services ne peuvent pas se connecter

- Vérifier que tous les services sont dans le même namespace
- Vérifier les variables d'environnement (MONGODB_URI, URLs des services)
- Vérifier les logs des services

### MongoDB ne démarre pas

```bash
# Vérifier les logs MongoDB
kubectl logs deployment/mongodb -n intelectgame

# Vérifier que le service MongoDB est accessible
kubectl exec -it deployment/mongodb -n intelectgame -- mongo --eval "db.version()"
```

