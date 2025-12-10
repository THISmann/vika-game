# 📋 Mises à jour du déploiement Kubernetes

Ce document liste toutes les modifications apportées aux manifests Kubernetes pour refléter les changements récents de l'application.

## 🔄 Modifications récentes incluses

### 1. Sécurisation des routes admin

**Fichiers modifiés** :
- `k8s/auth-service-deployment.yaml`
- `k8s/quiz-service-deployment.yaml`
- `k8s/game-service-deployment.yaml`
- `k8s/all-services.yaml`

**Changements** :
- Ajout de `AUTH_SERVICE_URL` au `quiz-service` pour permettre la vérification des tokens admin
- Les services utilisent maintenant le middleware d'authentification pour protéger les routes admin

### 2. Configuration Redis

**Fichiers modifiés** :
- Tous les fichiers de déploiement des services backend
- `k8s/configmap.yaml`

**Changements** :
- Ajout de `REDIS_HOST` et `REDIS_PORT` à tous les services (auth, quiz, game)
- Configuration centralisée dans le ConfigMap

### 3. Endpoints publics

**Fichiers modifiés** :
- `k8s/game-service-deployment.yaml`
- `k8s/quiz-service-deployment.yaml`

**Changements** :
- `/game/results` est maintenant public (accessible sans authentification)
- `/quiz/all` est public (accessible sans authentification)
- Nouveau endpoint `/quiz/verify/:id` pour vérifier les réponses (public)

### 4. Configuration du frontend

**Fichiers modifiés** :
- `k8s/frontend-deployment.yaml`
- `k8s/all-services.yaml`

**Changements** :
- Le frontend utilise maintenant l'API Gateway via des chemins relatifs (`/api/auth`, `/api/quiz`, `/api/game`)
- Les WebSockets se connectent toujours directement au `game-service` (l'API Gateway ne gère pas les WebSockets)

### 5. Variables d'environnement

**Fichiers modifiés** :
- `k8s/configmap.yaml`
- Tous les fichiers de déploiement

**Changements** :
- Ajout de `AUTH_SERVICE_URL`, `QUIZ_SERVICE_URL`, `GAME_SERVICE_URL` dans le ConfigMap
- Ajout de `REDIS_HOST` et `REDIS_PORT` dans le ConfigMap
- Utilisation des variables du ConfigMap au lieu de valeurs codées en dur

## 📦 Services mis à jour

### Auth Service
- ✅ Redis configuré
- ✅ Variables d'environnement depuis ConfigMap

### Quiz Service
- ✅ Redis configuré
- ✅ `AUTH_SERVICE_URL` ajouté pour l'authentification
- ✅ Variables d'environnement depuis ConfigMap

### Game Service
- ✅ Redis configuré
- ✅ `AUTH_SERVICE_URL` et `QUIZ_SERVICE_URL` depuis ConfigMap
- ✅ Session Affinity pour WebSocket (déjà présent)

### Frontend
- ✅ Utilise l'API Gateway via chemins relatifs
- ✅ WebSockets configurés pour se connecter directement au game-service

## 🚀 Déploiement

### Option 1 : Script automatique (recommandé)

```bash
./k8s/scripts/deploy-vm-minikube-updated.sh
```

Ce script :
1. Vérifie que Minikube est démarré
2. Déploie Redis et MongoDB
3. Crée le ConfigMap
4. Configure le secret Telegram Bot (si nécessaire)
5. Déploie tous les services dans le bon ordre
6. Vérifie que tout fonctionne

### Option 2 : Déploiement manuel

```bash
# 1. Créer le namespace
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: intelectgame
EOF

# 2. Déployer Redis
kubectl apply -f k8s/redis-deployment.yaml

# 3. Déployer MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# 4. Créer le ConfigMap
kubectl apply -f k8s/configmap.yaml

# 5. Créer le secret Telegram Bot (si nécessaire)
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN="<TOKEN>" \
  -n intelectgame

# 6. Déployer tous les services
kubectl apply -f k8s/all-services.yaml
```

## 🔍 Vérification

### Vérifier les pods

```bash
kubectl get pods -n intelectgame
```

Tous les pods devraient être en état `Running`.

### Vérifier les services

```bash
kubectl get services -n intelectgame
```

### Vérifier les logs

```bash
# Logs d'un service spécifique
kubectl logs -f <pod-name> -n intelectgame

# Logs de tous les pods d'un service
kubectl logs -f -l app=auth-service -n intelectgame
```

### Tester l'API Gateway

```bash
# Depuis un pod
kubectl exec -n intelectgame <api-gateway-pod> -- curl http://localhost:3000/health

# Depuis l'extérieur (si NodePort configuré)
curl http://$(minikube ip):30000/health
```

## ⚠️ Notes importantes

1. **Ordre de déploiement** : Redis et MongoDB doivent être déployés avant les services backend
2. **API Gateway** : Le frontend utilise l'API Gateway pour les requêtes HTTP, mais les WebSockets se connectent directement au game-service
3. **Session Affinity** : Le service `game-service` a `sessionAffinity: ClientIP` pour les WebSockets
4. **Variables d'environnement** : Toutes les variables sont maintenant dans le ConfigMap pour faciliter la maintenance

## 🔧 Dépannage

### Problème : Les pods ne démarrent pas

```bash
# Vérifier les événements
kubectl describe pod <pod-name> -n intelectgame

# Vérifier les logs
kubectl logs <pod-name> -n intelectgame
```

### Problème : Erreur 401 Unauthorized

Vérifiez que :
- `AUTH_SERVICE_URL` est correctement configuré dans le `quiz-service`
- Le `auth-service` est accessible depuis le `quiz-service`

### Problème : WebSockets ne fonctionnent pas

Vérifiez que :
- Le `game-service` a `sessionAffinity: ClientIP`
- Le frontend se connecte directement au `game-service` (pas via l'API Gateway)

## 📚 Documentation

- `k8s/README.md` - Documentation générale
- `k8s/docs/VM_DEPLOYMENT.md` - Guide de déploiement sur VM
- `k8s/docs/MINIKUBE_QUICKSTART.md` - Guide rapide Minikube

