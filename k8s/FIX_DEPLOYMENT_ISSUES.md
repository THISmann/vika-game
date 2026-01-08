# Corrections des problèmes de déploiement Kubernetes

## Problèmes identifiés et corrections

### 1. ImagePullBackOff
**Problème** : Les pods ne pouvaient pas télécharger les images depuis DockerHub.

**Solution** :
- Changement de `imagePullPolicy: Always` à `imagePullPolicy: IfNotPresent`
- Cela évite de toujours essayer de télécharger les images à chaque redémarrage

### 2. CrashLoopBackOff
**Problème** : Les pods redémarrraient en boucle car les dépendances (MongoDB, Redis) n'étaient pas prêtes.

**Solution** :
- Ajout d'`initContainers` pour attendre que les dépendances soient prêtes
- Chaque service attend que ses dépendances soient disponibles avant de démarrer

### 3. Pending (Pods en attente)
**Problème** : Les pods restaient en état Pending car les PVC ne pouvaient pas être créées.

**Solution** :
- Changement de `storageClassName: standard` à `storageClassName: hostpath` pour Minikube
- Minikube utilise `hostpath` comme classe de stockage par défaut

### 4. Restarts multiples
**Problème** : Les pods redémarrraient plusieurs fois à cause de health checks trop stricts.

**Solution** :
- Ajustement des `livenessProbe` et `readinessProbe`
- Augmentation des `initialDelaySeconds` pour laisser le temps aux services de démarrer
- Augmentation des `timeoutSeconds` et `failureThreshold`

### 5. Ressources
**Solution** :
- Ajout de `resources.requests` et `resources.limits` pour tous les pods
- Cela permet à Kubernetes de planifier correctement les pods

## Services corrigés

1. **auth-service** : InitContainers pour MongoDB et Redis, health checks améliorés
2. **quiz-service** : InitContainers pour MongoDB, Redis et Auth-service, health checks améliorés
3. **game-service** : InitContainers pour toutes les dépendances (MongoDB, Redis, Auth, Quiz, MinIO)
4. **api-gateway** : InitContainers pour Auth, Quiz et Game services
5. **frontend** : InitContainer pour API Gateway, health checks améliorés
6. **telegram-bot** : InitContainers pour Auth, Quiz et Game services
7. **mongodb** : Health checks améliorés (timeouts plus longs)
8. **redis** : Health checks améliorés
9. **minio** : StorageClassName corrigé pour Minikube

## Déploiement

Pour appliquer les corrections :

```bash
# Supprimer les anciens pods qui échouent
kubectl delete pods --all -n intelectgame

# Appliquer les nouveaux déploiements
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/minio-deployment.yaml
kubectl apply -f k8s/auth-service-deployment.yaml
kubectl apply -f k8s/quiz-service-deployment.yaml
kubectl apply -f k8s/game-service-deployment.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/telegram-bot-deployment.yaml

# Ou utiliser le script
./k8s/scripts/deploy-minikube.sh
```

## Vérification

```bash
# Vérifier le statut des pods
kubectl get pods -n intelectgame

# Vérifier les logs d'un pod spécifique
kubectl logs <pod-name> -n intelectgame

# Décrire un pod pour voir les événements
kubectl describe pod <pod-name> -n intelectgame

# Vérifier les événements du namespace
kubectl get events -n intelectgame --sort-by='.lastTimestamp'
```

